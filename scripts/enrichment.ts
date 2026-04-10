// ============================================================
// Bab-ul-Fatah — Product Enrichment Script v3
// ------------------------------------------------------------
// Enriches existing products with real-world data sourced from
// Darussalam.pk (Shopify) via Puppeteer + Cheerio extraction.
//
// Multi-tiered fallback engine:
//   1. PRIMARY:   Darussalam.pk Shopify API + product detail page
//   2. FALLBACK:  GPT-4o-mini weight estimation (when weight is null)
//   3. FALLBACK:  darussalamstore.com cover image (when image is null)
//
// Extracts per product:
//   1. Primary cover image URL (high-res from data_max_resolution)
//   2. Weight in kg (scraped → or AI-estimated as fallback)
//   3. Tags (derived from Shopify tag system + title analysis)
//   4. Live inventory status (in stock / sold out / hot stock count)
//
// Usage:
//   npx ts-node --project tsconfig.scripts.json scripts/enrichment.ts
//
// Flags (via environment variables):
//   START_FROM=50     — skip first N products (for resuming)
//   MAX_PRODUCTS=100  — only process N products (for testing)
//   DELAY=2500        — ms delay between page loads (default 2500)
//   SEARCH_ONLY=true  — just log matches, don't update DB
//   NO_AI_WEIGHT=false — disable AI weight estimation fallback
//   NO_SECONDARY_IMG=false — disable secondary image fallback
// ============================================================

import puppeteer, { type Browser, type Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

// ── Config ────────────────────────────────────────────────────────

const BASE_URL = 'https://darussalam.pk';
const SEARCH_API = `${BASE_URL}/search/suggest.json?resources[type]=product&resources[limit]=5&q=`;

// Secondary image fallback: darussalamstore.com (Shopify, same publisher network)
const SECONDARY_BASE = 'https://darussalamstore.com';
const SECONDARY_SEARCH_API = `${SECONDARY_BASE}/search/suggest.json?resources[type]=product&resources[limit]=5&q=`;

const DELAY_MS = parseInt(process.env.DELAY || '2500', 10);
const START_FROM = parseInt(process.env.START_FROM || '0', 10);
const MAX_PRODUCTS = process.env.MAX_PRODUCTS ? parseInt(process.env.MAX_PRODUCTS, 10) : Infinity;
const SEARCH_ONLY = process.env.SEARCH_ONLY === 'true';
const NO_AI_WEIGHT = process.env.NO_AI_WEIGHT === 'true';
const NO_SECONDARY_IMG = process.env.NO_SECONDARY_IMG === 'false'; // Double-negative: default ON

const prisma = new PrismaClient();

// ── OpenAI Client (lazy-initialized) ──────────────────────────────

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI();
  }
  return openaiClient;
}

// ── Types ─────────────────────────────────────────────────────────

interface EnrichedData {
  weight: number | null;
  tags: string | null;
  stock: number;
  coverImageUrl: string | null;
  weightSource: 'darussalam' | 'ai-estimated' | null;
  imageSource: 'darussalam' | 'secondary' | null;
}

interface ExtractionResult {
  slug: string;
  title: string;
  success: boolean;
  data?: EnrichedData;
  error?: string;
  searchUrl?: string;
  productUrl?: string;
}

// ── Helpers ───────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a clean search query from the product title.
 * Removes common noise words, sizes, edition markers for better matching.
 */
function buildSearchQuery(title: string): string {
  return title
    .toLowerCase()
    // Remove em-dash and other dashes used as separators
    .replace(/[—–-]+/g, ' ')
    // Remove noise words and edition markers
    .replace(/\s*(vol\.?|volume|volumes|part|set|urdu|english|arabic|imported|local|hard\s*cover|soft\s*cover|sc|hc|imp|art\s*paper|pocket\s*size|large|jumbo|medium|small|fine|edition|new|old|latest|copy|complete|premium|economy)\b/gi, '')
    // Remove parenthetical info
    .replace(/\s*\([^)]*\)/g, '')
    // Remove bracket info
    .replace(/\s*\[[^\]]*\]/g, '')
    // Remove numeric-only tokens like "9", "10", "6"
    .replace(/\b\d+\b/g, '')
    // Remove Urdu suffixes/qualifiers
    .replace(/\s*(ki|ka|ke|kay|k)\b/gi, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 1)
    .slice(0, 6)
    .join(' ');
}

// ── Shopify Search API Helper ─────────────────────────────────────

interface ShopifySearchResult {
  id: string;
  handle: string;
  title: string;
  url: string;
  price: string;
  image?: string;
  featured_image?: string | { url: string; alt?: string; width?: number; height?: number };
  vendor?: string;
  type?: string;
  tags?: string[];
  available?: boolean;
}

async function shopifySearch(
  page: Page,
  baseUrl: string,
  query: string
): Promise<ShopifySearchResult[]> {
  const searchApi = `${baseUrl}/search/suggest.json?resources[type]=product&resources[limit]=5&q=`;
  const url = `${searchApi}${encodeURIComponent(query)}`;
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (!response || !response.ok()) return [];

    const body = await page.evaluate(() => document.body.innerText);
    const data = JSON.parse(body);
    // Shopify Predictive Search API nests products under resources.results.products
    return data?.resources?.results?.products || [];
  } catch {
    return [];
  }
}

// ── Primary Extraction: Darussalam.pk ────────────────────────────

function parseShopifyWeight(weightGrams?: number, weightUnit?: string): number | null {
  if (!weightGrams || weightGrams <= 0) return null;
  if (weightUnit === 'kg') return Math.round(weightGrams * 1000) / 1000;
  const kg = weightGrams / 1000;
  return Math.round(kg * 1000) / 1000;
}

function extractWeightFromEmbeddedJson($: cheerio.CheerioAPI): number | null {
  const jsonAttr = $('template div[data-json-product]').attr('data-json-product');
  if (!jsonAttr) return null;
  try {
    const data = JSON.parse(jsonAttr);
    return parseShopifyWeight(data.weight, data.weight_unit);
  } catch {
    return null;
  }
}

function extractWeightFromJsonLd($: cheerio.CheerioAPI): number | null {
  let weight: number | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (weight !== null) return;
    try {
      const json = JSON.parse($(el).html() || '');
      if (json['@type'] === 'Product' && json.weight) {
        weight = parseShopifyWeight(json.weight, json.weight_unit || 'g');
      }
    } catch {
      // Skip malformed blocks
    }
  });
  return weight;
}

function extractCoverImage($: cheerio.CheerioAPI): string | null {
  // Strategy 1: data_max_resolution from the main product image
  let imgUrl = $('img.product-media__image[data_max_resolution]').first().attr('data_max_resolution');
  if (imgUrl) {
    if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
    return imgUrl;
  }

  // Strategy 2: src from the main product image (fetchpriority="high")
  imgUrl = $('img.product-media__image[fetchpriority="high"]').first().attr('src');
  if (imgUrl) {
    imgUrl = imgUrl.replace(/width=\d+/g, 'width=3840');
    if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
    return imgUrl;
  }

  // Strategy 3: Open Graph image
  imgUrl = $('meta[property="og:image"]').attr('content');
  if (imgUrl) {
    imgUrl = imgUrl.replace(/width=\d+/g, 'width=3840');
    if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
    return imgUrl;
  }

  return null;
}

function detectInventoryStatus($: cheerio.CheerioAPI): number {
  const isSoldOut = $('button.product-form__submit[disabled]').length > 0;
  if (isSoldOut) return -1;

  const isPickupOnly = $('.pickup-only-box').length > 0;
  if (isPickupOnly) return -1;

  const hotStockText = $('.productView-hotStock').attr('data-current-inventory');
  if (hotStockText) {
    const count = parseInt(hotStockText, 10);
    if (!isNaN(count) && count > 0) return count;
  }

  const availText = $('.product-info-item[data-inventory] .product-info-value').text().toLowerCase().trim();
  if (availText.includes('out of stock') || availText.includes('sold out') || availText.includes('unavailable')) {
    return -1;
  }

  return 10;
}

function extractTags(
  $: cheerio.CheerioAPI,
  title: string,
  productData?: ShopifySearchResult
): string | null {
  const tags: string[] = [];

  if (productData?.tags && productData.tags.length > 0) {
    tags.push(...productData.tags.filter((t) => t.length > 1 && t.length < 50));
  }

  const jsonAttr = $('template div[data-json-product]').attr('data-json-product');
  if (jsonAttr) {
    try {
      const data = JSON.parse(jsonAttr);
      if (data.tags && Array.isArray(data.tags)) {
        tags.push(...data.tags.filter((t: string) => t.length > 1 && t.length < 50));
      }
    } catch { /* skip */ }
  }

  const vendor = $('.product-info-item:first-child .product-info-value a').text().trim();
  if (vendor && vendor.length > 1) tags.push(vendor.toLowerCase());

  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('urdu') || productData?.vendor?.toLowerCase().includes('urdu')) tags.push('urdu');
  if (lowerTitle.includes('arabic') || lowerTitle.includes('عربی')) tags.push('arabic');
  if (lowerTitle.includes('english') && !lowerTitle.includes('urdu')) tags.push('english');
  if (lowerTitle.includes('pashto')) tags.push('pashto');
  if (lowerTitle.includes('punjabi')) tags.push('punjabi');

  if (lowerTitle.includes('hard cover') || lowerTitle.includes('hardcover') || lowerTitle.includes('hc')) tags.push('hardcover');
  if (lowerTitle.includes('soft cover') || lowerTitle.includes('paperback') || lowerTitle.includes('sc')) tags.push('paperback');
  if (lowerTitle.includes('pocket') || lowerTitle.includes('8x12') || lowerTitle.includes('10x15')) tags.push('pocket-size');

  const unique = [...new Set(tags.map((t) => t.toLowerCase().trim()).filter((t) => t.length > 1))];
  return unique.length > 0 ? unique.join(', ') : null;
}

function matchScore(ourTitle: string, searchResult: ShopifySearchResult): number {
  const a = ourTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const b = searchResult.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  if (b.length === 0) return 0;
  const matchedWords = a.filter((word) => word.length > 2 && b.some((bw) => bw.includes(word) || word.includes(bw)));
  return matchedWords.length / Math.max(a.filter((w) => w.length > 2).length, 1);
}

// ── Fallback 1: AI Weight Estimation ──────────────────────────

/**
 * Uses GPT-4o-mini to estimate the shipping weight of a book/product
 * when Darussalam.pk doesn't provide weight data.
 *
 * The prompt is designed for an Islamic bookstore context and asks for
 * a pure numerical output to minimize token waste.
 *
 * Returns null if estimation fails (API error, parse error, etc.).
 */
async function estimateWeightWithAI(title: string): Promise<number | null> {
  const systemPrompt = [
    'You are a logistics weight estimator for an Islamic bookstore that sells books,',
    'prayer mats, attar/perfume, calligraphy items, and related products.',
    '',
    'Guidelines for weight estimation:',
    '- Standard paperback book (200-300 pages): 0.25-0.40 kg',
    '- Hardcover book (300-500 pages): 0.50-0.80 kg',
    '- Large reference book (500+ pages): 0.80-2.00 kg',
    '- Multi-volume set (6-9 volumes): 4.00-8.00 kg',
    '- Small prayer mat: 0.40-0.60 kg',
    '- Large premium prayer mat: 0.80-1.50 kg',
    '- Bottled attar/perfume (25ml): 0.10-0.15 kg',
    '- Bottled attar/perfume (50ml): 0.20-0.25 kg',
    '- Calligraphy wall art / frame: 0.30-1.00 kg',
    '- Quran (standard 16-line): 0.60-0.90 kg',
    '- Pocket Quran: 0.15-0.30 kg',
    '',
    'IMPORTANT: Return ONLY a single floating-point number representing the weight',
    'in kilograms. Do NOT include any text, units, or explanation.',
    'Example outputs: 0.35, 1.2, 5.5',
  ].join('\n');

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: title },
      ],
      max_tokens: 10,
      temperature: 0.1, // Low temperature for consistent numerical output
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return null;

    // Parse the numerical float from the response
    const numStr = content.replace(/[^\d.]/g, '');
    const weight = parseFloat(numStr);

    // Validate: must be a reasonable product weight (0.01 kg to 50 kg)
    if (!isNaN(weight) && weight >= 0.01 && weight <= 50) {
      return Math.round(weight * 1000) / 1000; // 3 decimal places
    }

    return null;
  } catch (err: any) {
    // Silently fail — weight estimation is a best-effort fallback
    return null;
  }
}

// ── Fallback 2: Secondary Bookstore Image ──────────────────────

/**
 * Searches darussalamstore.com (sibling Shopify store) for a matching
 * product image when the primary Darussalam extraction returns null.
 *
 * Uses the same Shopify Predictive Search API for speed, then falls back
 * to the search result's image/featured_image URL directly.
 */
async function scrapeSecondaryImage(
  page: Page,
  title: string
): Promise<string | null> {
  const query = buildSearchQuery(title);

  try {
    // Search via Shopify API on the secondary store
    const results = await shopifySearch(page, SECONDARY_BASE, query);

    if (results.length === 0) return null;

    // Find best match using same fuzzy logic
    let bestMatch: ShopifySearchResult | null = null;
    let bestScore = 0;

    for (const sr of results) {
      const score = matchScore(title, sr);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sr;
      }
    }

    if (!bestMatch || bestScore < 0.25) return null;

    // Return the highest quality image available
    // featured_image usually has width/height metadata for better quality
    const featuredUrl = typeof bestMatch.featured_image === 'string'
      ? bestMatch.featured_image
      : bestMatch.featured_image?.url;
    if (featuredUrl && featuredUrl.startsWith('http')) {
      return featuredUrl;
    }

    // Fall back to the search result image
    const imgUrl = bestMatch.image;
    if (imgUrl && imgUrl.startsWith('http')) {
      return imgUrl;
    }

    return null;
  } catch {
    return null;
  }
}

// ── Core Extraction Pipeline ────────────────────────────────────────

/**
 * Full extraction pipeline with multi-tiered fallbacks.
 *
 * Flow per product:
 *   1. Search Darussalam.pk → extract weight, image, tags, stock
 *   2. If weight is null → estimateWeightWithAI() fallback
 *   3. If image is null → scrapeSecondaryImage() fallback
 */
async function extractProductData(
  page: Page,
  title: string,
  slug: string
): Promise<ExtractionResult> {
  const query = buildSearchQuery(title);
  const searchUrl = `${SEARCH_API}${encodeURIComponent(query)}`;
  const result: ExtractionResult = { slug, title, success: false, searchUrl };

  try {
    // ── Step 1: Primary search via Darussalam.pk Shopify API ──
    const searchResults = await shopifySearch(page, BASE_URL, query);

    if (searchResults.length === 0) {
      result.error = `No search results for: "${query}"`;
      return result;
    }

    // ── Step 2: Find best match ──
    let bestMatch: ShopifySearchResult | null = null;
    let bestScore = 0;

    for (const sr of searchResults) {
      const score = matchScore(title, sr);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sr;
      }
    }

    if (!bestMatch || bestScore < 0.3) {
      result.error = `No good match (best score: ${bestScore.toFixed(2)})`;
      return result;
    }

    // Build product page URL
    let productUrl = bestMatch.url;
    if (productUrl.startsWith('/')) productUrl = `${BASE_URL}${productUrl}`;
    productUrl = productUrl.split('?')[0];
    result.productUrl = productUrl;

    // ── Step 3: Navigate to Darussalam product detail page ──
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(800);

    const html = await page.content();
    const $ = cheerio.load(html);

    // ── Step 4: Extract primary data ──
    let coverImageUrl = extractCoverImage($);
    let weight = extractWeightFromEmbeddedJson($) || extractWeightFromJsonLd($);
    const tags = extractTags($, title, bestMatch);
    const inventoryStatus = detectInventoryStatus($);

    // ── Step 5a: AI Weight Fallback ──
    let weightSource: EnrichedData['weightSource'] = null;

    if (weight === null && !NO_AI_WEIGHT) {
      weight = await estimateWeightWithAI(title);
      if (weight !== null) {
        weightSource = 'ai-estimated';
      }
    }

    // ── Step 5b: Secondary Image Fallback ──
    let imageSource: EnrichedData['imageSource'] = null;

    if (coverImageUrl === null && !NO_SECONDARY_IMG) {
      coverImageUrl = await scrapeSecondaryImage(page, title);
      if (coverImageUrl !== null) {
        imageSource = 'secondary';
      }
    }

    result.success = true;
    result.data = {
      weight,
      tags,
      stock: inventoryStatus === -1 ? 0 : inventoryStatus,
      coverImageUrl,
      weightSource,
      imageSource,
    };

  } catch (err: any) {
    result.error = err.message?.substring(0, 200) || 'Unknown error';
  }

  return result;
}

// ── Database Update ──────────────────────────────────────────────

async function updateProduct(
  productId: string,
  slug: string,
  data: EnrichedData
): Promise<void> {
  if (SEARCH_ONLY) {
    console.log(
      `  [SEARCH-ONLY] Would update: weight=${data.weight}${data.weightSource === 'ai-estimated' ? ' (AI)' : ''}, ` +
      `tags=${data.tags ? data.tags.substring(0, 55) + '...' : 'none'}, ` +
      `stock=${data.stock}, image=${data.coverImageUrl ? 'yes' : 'no'}${data.imageSource === 'secondary' ? ' (secondary)' : ''}`
    );
    return;
  }

  const updateData: Record<string, any> = {};
  if (data.weight !== null) updateData.weight = data.weight;
  if (data.tags !== null) updateData.tags = data.tags;
  updateData.stock = data.stock;

  await prisma.product.update({
    where: { slug },
    data: updateData,
  });

  if (data.coverImageUrl && data.coverImageUrl.startsWith('https://')) {
    const existingImages = await prisma.image.findMany({ where: { productId } });

    if (existingImages.length > 0) {
      await prisma.image.update({
        where: { id: existingImages[0].id },
        data: { url: data.coverImageUrl },
      });
    } else {
      await prisma.image.create({
        data: {
          url: data.coverImageUrl,
          altText: `Cover image for ${slug}`,
          productId,
        },
      });
    }
  }
}

// ── Progress Helpers ─────────────────────────────────────────────

function formatETA(processed: number, total: number, elapsedMs: number): string {
  if (processed === 0) return '~calculating...';
  const avgPerProduct = elapsedMs / processed;
  const remaining = (total - processed) * avgPerProduct;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `~${minutes}m ${seconds}s remaining`;
}

// ── Main Runner ──────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Bab-ul-Fatah — Product Enrichment Script v3 (Fallbacks)      ║');
  console.log('║     Primary:   Darussalam.pk (Shopify)                         ║');
  console.log('║     Fallback: GPT-4o-mini weight estimation                 ║');
  console.log('║     Fallback: darussalamstore.com cover images               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Delay between requests: ${DELAY_MS}ms`);
  console.log(`  Starting from product:   #${START_FROM + 1}`);
  if (MAX_PRODUCTS !== Infinity) console.log(`  Max products:           ${MAX_PRODUCTS}`);
  if (SEARCH_ONLY) console.log(`  Mode:                   SEARCH ONLY (no DB updates)`);
  if (NO_AI_WEIGHT) console.log(`  AI weight estimation:    DISABLED`);
  if (NO_SECONDARY_IMG) console.log(`  Secondary image:         DISABLED`);
  console.log('');

  // ── Step 1: Fetch all products ──
  console.log('  Fetching products from database...');
  const allProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, slug: true },
  });
  console.log(`  Total products in DB:   ${allProducts.length}`);

  const products = allProducts.slice(START_FROM, START_FROM + MAX_PRODUCTS);
  console.log(`  Processing:             ${products.length} products (from #${START_FROM + 1} to #${START_FROM + products.length})`);
  console.log('');

  if (products.length === 0) {
    console.log('  No products to process. Exiting.');
    await prisma.$disconnect();
    return;
  }

  // ── Step 2: Launch Puppeteer ──
  console.log('  Launching browser...');
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);

  console.log('  Browser ready. Starting enrichment...\n');
  console.log('  ' + '─'.repeat(95));
  console.log('');

  // ── Step 3: Process each product ──
  const stats = {
    total: products.length,
    success: 0,
    notFound: 0,
    errors: 0,
    updatedWeight: 0,
    updatedWeightAI: 0,
    updatedTags: 0,
    updatedImage: 0,
    updatedImageSecondary: 0,
    updatedStock: 0,
    soldOut: 0,
    aiWeightFailed: 0,
    secondaryImageFailed: 0,
  };

  const errors: { slug: string; title: string; error: string }[] = [];
  const startTime = Date.now();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const num = i + 1;
    const pct = ((num / products.length) * 100).toFixed(0);
    const elapsed = Date.now() - startTime;

    const slugDisplay = product.slug.length > 42 ? product.slug.substring(0, 42) + '...' : product.slug;
    process.stdout.write(`  [${String(num).padStart(3)}/${products.length}] (${pct.padStart(3)}%) ${slugDisplay.padEnd(46)}`);

    const result = await extractProductData(page, product.title, product.slug);

    if (result.success && result.data) {
      try {
        await updateProduct(product.id, product.slug, result.data);
        stats.success++;

        if (result.data.weight !== null) {
          stats.updatedWeight++;
          if (result.data.weightSource === 'ai-estimated') stats.updatedWeightAI++;
        }
        if (result.data.tags !== null) stats.updatedTags++;
        if (result.data.coverImageUrl) {
          stats.updatedImage++;
          if (result.data.imageSource === 'secondary') stats.updatedImageSecondary++;
        }
        if (result.data.stock >= 0) stats.updatedStock++;
        if (result.data.stock === 0) stats.soldOut++;

        // Build status parts
        const parts: string[] = [];
        if (result.data.weight !== null) {
          const label = result.data.weightSource === 'ai-estimated' ? `wt=${result.data.weight}kg (AI)` : `wt=${result.data.weight}kg`;
          parts.push(label);
        }
        if (result.data.tags !== null) parts.push(`tags=${result.data.tags.split(',').length}`);
        if (result.data.coverImageUrl) {
          const label = result.data.imageSource === 'secondary' ? 'img=✓ (secondary)' : 'img=✓';
          parts.push(label);
        }
        if (result.data.stock === 0) parts.push('SOLD OUT');
        else if (result.data.stock > 10) parts.push(`stock=${result.data.stock}`);
        else parts.push('stock=IN');

        const eta = formatETA(num, products.length, elapsed);
        console.log(`✓ ${parts.join(', ').padEnd(48)} ${eta}`);

      } catch (dbErr: any) {
        stats.errors++;
        console.log(`✗ DB error: ${dbErr.message?.substring(0, 80)}`);
        errors.push({ slug: product.slug, title: product.title, error: `DB: ${dbErr.message}` });
      }
    } else {
      stats.notFound++;
      console.log(`✗ ${result.error?.substring(0, 55) || 'Not found'}`);
      errors.push({ slug: product.slug, title: product.title, error: result.error || 'Not found' });
    }

    // Rate limiting (skip on last item)
    if (i < products.length - 1) {
      await delay(DELAY_MS);
    }

    // Progress checkpoint every 50 products
    if (num % 50 === 0) {
      console.log('');
      console.log(`  ─── Checkpoint at ${num}/${products.length} ───`);
      console.log(`      Success: ${stats.success} | Not found: ${stats.notFound} | Errors: ${stats.errors}`);
      console.log(`      Weights: ${stats.updatedWeight} (AI: ${stats.updatedWeightAI})`);
      console.log(`      Tags: ${stats.updatedTags} | Images: ${stats.updatedImage} (Secondary: ${stats.updatedImageSecondary})`);
      console.log(`      Stock: ${stats.updatedStock} (${stats.soldOut} sold out)`);
      console.log(`      ${formatETA(num, products.length, Date.now() - startTime)}`);
      console.log('');
    }
  }

  // ── Step 4: Cleanup ──
  await browser.close();
  await prisma.$disconnect();

  // ── Step 5: Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgTime = (parseFloat(elapsed) / stats.total).toFixed(1);

  console.log('');
  console.log('  ' + '═'.repeat(65));
  console.log('                 ENRICHMENT COMPLETE (v3 — Fallbacks)        ');
  console.log('  ' + '═'.repeat(65));
  console.log(`  Total processed:       ${stats.total}`);
  console.log(`  Successful:            ${stats.success} (${((stats.success / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Not found / no match:  ${stats.notFound}`);
  console.log(`  DB errors:             ${stats.errors}`);
  console.log(`  ──────────────────────────────────────────`);
  console.log(`  Weights (Darussalam):   ${stats.updatedWeight - stats.updatedWeightAI}`);
  console.log(`  Weights (AI estimated):  ${stats.updatedWeightAI} ⚠️`);
  console.log(`  Tags extracted:        ${stats.updatedTags}`);
  console.log(`  Images (Darussalam):    ${stats.updatedImage - stats.updatedImageSecondary}`);
  console.log(`  Images (Secondary):    ${stats.updatedImageSecondary} 🔍`);
  console.log(`  Stock status updated:  ${stats.updatedStock} (${stats.soldOut} sold out)`);
  console.log(`  ──────────────────────────────────────────`);
  console.log(`  Total time:            ${elapsed}s`);
  console.log(`  Avg per product:       ${avgTime}s`);
  console.log('  ' + '═'.repeat(65));

  if (errors.length > 0) {
    const fs = await import('fs');
    const errorPath = '/home/z/my-project/scripts/enrichment-errors.json';
    fs.writeFileSync(errorPath, JSON.stringify(errors, null, 2));
    console.log(`\n  Error list saved to: scripts/enrichment-errors.json (${errors.length} products)`);
    console.log(`  To retry: START_FROM=${START_FROM} DELAY=${DELAY_MS}`);
  }

  console.log('');
}

// ── Run ───────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
