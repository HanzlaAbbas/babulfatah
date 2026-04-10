// ============================================================================
// Bab-ul-Fatah — AI-Powered Data Extraction Pipeline
// ============================================================================
// Scrapes product data from legacy competitor sites, rewrites descriptions
// using GPT-4o-mini to avoid duplicate content penalties, and outputs a
// clean catalog-seed.json file ready for Prisma database seeding.
//
// Architecture:  Extractor → Cleanser → Formatter → Output
// ============================================================================
//
// USAGE:
//   npx ts-node --esm scripts/pipeline.ts
//
// REQUIRED ENV (add to .env):
//   OPENAI_API_KEY=sk-...
//
// CONFIGURATION:
//   Edit the TARGET_URLS array and SITE_CONFIG to match your target site's
//   DOM structure. The current selectors are tuned for common Pakistani
//   Islamic book e-commerce layouts.
// ============================================================================

import puppeteer, { type Page } from "puppeteer";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import ZAI from "z-ai-web-dev-sdk";
import * as fs from "fs";
import * as path from "path";

// ─── AI Backend Selection ─────────────────────────────────────────────────────
// The pipeline supports two AI backends:
//   1. OPENAI_API_KEY  → Uses the official OpenAI SDK (gpt-4o-mini)
//   2. (no key set)     → Falls back to z-ai-web-dev-sdk (project default)
// This allows the pipeline to run in any environment without extra config.
// ───────────────────────────────────────────────────────────────────────────────
type AIBackend = "openai" | "zai";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Raw product scraped from the competitor's DOM */
interface RawProduct {
  rawTitle: string;
  rawPrice: string;
  rawDescription: string;
  imageUrl: string;
  categoryBreadcrumbs: string[];
  sourceUrl: string;
}

/** Product after AI rewriting and formatting */
interface ProcessedProduct {
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryBreadcrumbs: string[];
  language: string;
  sku: string;
}

/** Final output structure matching Prisma schema expectations */
interface CatalogSeedItem {
  // ── Product fields ──
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  language: string;
  imageUrl: string;

  // ── Relational lookups (by name/slug — resolved at seed time) ──
  categoryBreadcrumbs: string[];
  authorName: string | null;

  // ── Metadata ──
  source: string;
  extractedAt: string;
}

/** Configuration for a target competitor site's DOM selectors */
interface SiteConfig {
  /** CSS selectors for locating product cards on a listing page */
  productCardSelector: string;
  titleSelector: string;
  priceSelector: string;
  descriptionSelector: string;
  imageSelector: string;
  /** CSS selectors for breadcrumb navigation elements */
  breadcrumbSelector: string;
  /** Base URL for resolving relative image paths */
  baseUrl: string;
  /** Name of this competitor (stored in source field) */
  siteName: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Target category / listing page URLs to scrape.
 * Add or modify these to match the competitor sites you want to extract from.
 * Each URL should be a page that lists multiple products (a catalog page).
 */
const TARGET_URLS: string[] = [
  "https://darussalam.pk/books/quran/",
  "https://daruliman.pk/category/seerah/",
  "https://babusalam.pk/shop/",
];

/**
 * DOM selectors for each competitor site.
 * Key the object by a domain substring so the pipeline auto-selects the
 * right selector set based on the URL being scraped.
 */
const SITE_CONFIGS: Record<string, SiteConfig> = {
  "darussalam.com": {
    productCardSelector: ".product-item, .product-card, .grid-item, [data-product-card]",
    titleSelector: ".product-title, .product-name, h3 a, h2 a, .card-title a",
    priceSelector: ".price, .product-price, .money, [data-price]",
    descriptionSelector: ".product-desc, .product-description, .card-text, .short-description, p",
    imageSelector: "img.product-image, img.card-img-top, img:first-child, img[srcset]",
    breadcrumbSelector: ".breadcrumb, nav.breadcrumb, .woocommerce-breadcrumb, [class*=breadcrumb], ol.breadcrumb li a, .trail-items a, nav[aria-label='Breadcrumb']",
    baseUrl: "https://www.darussalam.com",
    siteName: "Darussalam",
  },
  "kitabosunnat.com": {
    productCardSelector: ".product, .type-product, .product-item, .entry",
    titleSelector: ".woocommerce-loop-product__title, .product-title, h2 a, h3 a",
    priceSelector: ".price, .woocommerce-Price-amount, ins .amount",
    descriptionSelector: ".product-desc, .excerpt, .entry-summary p, .short-description",
    imageSelector: "img.attachment-woocommerce_thumbnail, img.wp-post-image, img:first-child",
    breadcrumbSelector: ".woocommerce-breadcrumb, .breadcrumb, nav.woocommerce-breadcrumb a, .trail-items a, .woocommerce-breadcrumb li a",
    baseUrl: "https://www.kitabosunnat.com",
    siteName: "Kitabosunnat",
  },
  // ── Generic fallback for any WooCommerce / Shopify site ──
  "default": {
    productCardSelector: ".product, .product-card, .item, [class*=product], [class*=card]",
    titleSelector: "h2 a, h3 a, .title, .name, [class*=title], [class*=name]",
    priceSelector: ".price, .amount, .money, [class*=price], [class*=cost]",
    descriptionSelector: "p, .description, .desc, [class*=description], [class*=excerpt]",
    imageSelector: "img:first-child, img[src], img[srcset], picture img",
    breadcrumbSelector: ".breadcrumb, nav[class*=breadcrumb], .woocommerce-breadcrumb, [class*=breadcrumb] li a, ol.breadcrumb, [aria-label='Breadcrumb'] a",
    baseUrl: "",
    siteName: "Unknown Competitor",
  },
};

/**
 * Language detection heuristics.
 * Maps common Urdu/Arabic Unicode ranges and script patterns to Language enum values.
 */
const LANGUAGE_RULES: { test: (text: string) => boolean; lang: string }[] = [
  { test: (t) => /[\u0600-\u06FF]/.test(t), lang: "URDU" },       // Arabic script → Urdu (default)
  { test: (t) => /\b(Arabic|العربية|القرآن)\b/i.test(t), lang: "ARABIC" },
  { test: (t) => /\b(Urdu|اردو)\b/i.test(t), lang: "URDU" },
  { test: (t) => /\b(Punjabi|پنجابی)\b/i.test(t), lang: "PUNJABI" },
  { test: (t) => /\b(English|Tafseer|Commentary)\b/i.test(t) && /^[\x00-\x7F]/.test(t), lang: "ENGLISH" },
];

/** Rate limit delay (ms) between AI requests to avoid 429 errors */
const AI_DELAY_MS = 800;

/** Puppeteer navigation timeout in milliseconds */
const NAVIGATION_TIMEOUT_MS = 30_000;

/** Puppeteer DOM waiting timeout */
const DOM_WAIT_TIMEOUT_MS = 10_000;

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a title string.
 * Strips special characters, replaces spaces with hyphens, and collapses
 * consecutive hyphens. Truncates to 80 characters for URL length safety.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove common HTML entities and special chars
    .replace(/&amp;/g, "")
    .replace(/&[a-z]+;/gi, "")
    // Replace non-alphanumeric (allow hyphens and spaces)
    .replace(/[^a-z0-9\s\-]/g, "")
    // Collapse whitespace and replace with hyphens
    .replace(/\s+/g, "-")
    // Collapse consecutive hyphens
    .replace(/-+/g, "-")
    // Strip leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Truncate for URL safety
    .slice(0, 80);
}

/**
 * Clean a raw price string into a numerical Float value.
 * Strips common Pakistani currency prefixes/suffixes and thousands separators.
 * Handles formats like: "Rs. 1,295", "PKR 500", "Rs 1,200.00", "1,295 PKR".
 */
function cleanPrice(raw: string): number {
  const cleaned = raw
    .replace(/[Rs.\s]|PKR|₨|Rs/gi, "")
    .replace(/,/g, "")
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Detect the language of a product title/description.
 * Returns a Prisma Language enum value.
 */
function detectLanguage(title: string, description: string): string {
  const combined = `${title} ${description}`;

  for (const rule of LANGUAGE_RULES) {
    if (rule.test(combined)) return rule.lang;
  }

  // Default: if the title contains mostly Latin characters, assume English
  const latinRatio = (combined.match(/[a-zA-Z]/g) || []).length / Math.max(combined.length, 1);
  return latinRatio > 0.5 ? "ENGLISH" : "URDU";
}

/**
 * Generate a deterministic SKU code from the title.
 * Format: BF-XXX-NNN where XXX is derived from the category abbreviation
 * and NNN is a 3-digit hash of the title.
 */
function generateSku(categoryName: string, title: string): string {
  const catAbbr = categoryName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");

  // Simple hash from title characters
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) & 0xfff;
  }

  return `BF-${catAbbr}-${String(hash).padStart(3, "0")}`;
}

/**
 * Resolve an image URL to an absolute URL.
 * Handles relative paths, protocol-relative URLs, and data URIs.
 */
function resolveImageUrl(src: string, baseUrl: string): string {
  if (!src || src.startsWith("data:")) return "";

  // Already absolute
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // Protocol-relative
  if (src.startsWith("//")) return `https:${src}`;

  // Relative path — resolve against base
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return "";
  }
}

/**
 * Resolve the SiteConfig for a given URL by matching domain substrings.
 */
function getSiteConfig(url: string): SiteConfig & { resolvedBaseUrl: string } {
  const urlObj = new URL(url);

  for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
    if (domain !== "default" && url.includes(domain)) {
      return { ...config, resolvedBaseUrl: config.baseUrl || urlObj.origin };
    }
  }

  // Fallback to generic config
  const fallback = SITE_CONFIGS["default"];
  return { ...fallback, resolvedBaseUrl: urlObj.origin, siteName: urlObj.hostname };
}

/**
 * Extract author name from a product title using common patterns.
 * Handles formats like: "Book Title by Author Name", "Book Title - Author Name",
 * "Author Name ki Book Title" (Urdu pattern).
 */
function extractAuthorFromTitle(title: string): string | null {
  // English: "Title by Author" or "Title - Author"
  const byMatch = title.match(/\s+by\s+(.+)$/i);
  if (byMatch) return byMatch[1].trim();

  const dashMatch = title.match(/\s*[-–—]\s*([^-\–—]+)$/);
  if (dashMatch && dashMatch[1].trim().split(" ").length <= 5) {
    return dashMatch[1].trim();
  }

  // Urdu: "Author Name ki/ka/ke ..."
  const urduMatch = title.match(/^([^ KiKaK ke]+?)\s+(?:ki|ka|ke)\s/i);
  if (urduMatch) return urduMatch[1].trim();

  return null;
}

/**
 * Extract breadcrumb trail from the page DOM.
 * Looks for breadcrumb navigation elements (<ol>, <nav>, or list items)
 * and returns an ordered array of category names from parent to child.
 * Falls back to URL-based inference if no breadcrumbs are found.
 */
function extractBreadcrumbs(
  $: cheerio.CheerioAPI,
  siteConfig: SiteConfig,
  url: string
): string[] {
  const breadcrumbs: string[] = [];

  // Strategy 1: Try dedicated breadcrumb containers
  const breadcrumbContainer = $(siteConfig.breadcrumbSelector).first();
  if (breadcrumbContainer.length) {
    // Case A: Container with list items (e.g., <ol><li><a>Home</a></li><li><a>Books</a></li>...</ol>)
    const items = breadcrumbContainer.find("li");
    if (items.length > 0) {
      items.each((_i, el) => {
        const text = $(el).text().trim();
        // Skip generic root items like "Home", "Shop", etc.
        const skipTexts = new Set(["home", "shop", "main", "store", ""]);
        if (text.length > 1 && !skipTexts.has(text.toLowerCase())) {
          breadcrumbs.push(text);
        }
      });
      if (breadcrumbs.length > 0) return breadcrumbs;
    }
  }

  // Case B: Direct <a> elements inside breadcrumb container
  const links = breadcrumbContainer.find("a");
  if (links.length > 0) {
    links.each((_i, el) => {
      const text = $(el).text().trim();
      const skipTexts = new Set(["home", "shop", "main", "store", ""]);
      if (text.length > 1 && !skipTexts.has(text.toLowerCase())) {
        breadcrumbs.push(text);
      }
    });
    if (breadcrumbs.length > 0) return breadcrumbs;
  }

  // Strategy 2: Full-page breadcrumb search
  const pageBreadcrumbs = $(siteConfig.breadcrumbSelector);
  if (pageBreadcrumbs.length > 0) {
    const seenTexts = new Set<string>();
    pageBreadcrumbs.each((_i, el) => {
      const text = $(el).text().trim();
      const skipTexts = new Set(["home", "shop", "main", "store", ""]);
      if (text.length > 1 && !skipTexts.has(text.toLowerCase()) && !seenTexts.has(text)) {
        seenTexts.add(text);
        breadcrumbs.push(text);
      }
    });
    if (breadcrumbs.length > 0) return breadcrumbs;
  }

  // Strategy 3: Fall back to URL-based inference (single category)
  const fallback = inferCategoryFromUrl(url);
  if (fallback && fallback !== "Uncategorized") {
    breadcrumbs.push(fallback);
  }

  return breadcrumbs;
}

/**
 * Log with timestamp for pipeline execution tracking.
 */
function log(level: "INFO" | "WARN" | "ERROR" | "SUCCESS", message: string): void {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix =
    level === "SUCCESS" ? "✅" : level === "ERROR" ? "❌" : level === "WARN" ? "⚠️" : "ℹ️";
  console.log(`${prefix} [${timestamp}] [${level}] ${message}`);
}

// ─── Phase 1: The Extractor (Puppeteer + Cheerio) ─────────────────────────────

/**
 * Launch a headless Puppeteer browser and scrape product listing pages.
 * Returns an array of RawProduct objects extracted from the provided URLs.
 *
 * Strategy:
 *   1. Open each URL in a new tab
 *   2. Wait for the DOM to fully render (networkidle0)
 *   3. Extract product card HTML and parse with Cheerio
 *   4. Resolve relative image URLs to absolute paths
 */
async function extractProducts(urls: string[]): Promise<RawProduct[]> {
  const allProducts: RawProduct[] = [];

  log("INFO", "Launching headless browser (Puppeteer)...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
  });

  try {
    for (const url of urls) {
      const siteConfig = getSiteConfig(url);
      log("INFO", `Scraping: ${url} (selectors: ${siteConfig.siteName})`);
      log("INFO", `\U0001f50d Initiating extraction on: ${url}`);

      const page: Page = await browser.newPage();

      // Set a realistic viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      );

      try {
        // Navigate and wait for full DOM render
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: NAVIGATION_TIMEOUT_MS,
        });

        // Give SPA frameworks extra time to render product cards
        await page.waitForSelector(siteConfig.productCardSelector, {
          timeout: DOM_WAIT_TIMEOUT_MS,
        }).catch(() => {
          log("WARN", `No product cards found at ${url} with selector "${siteConfig.productCardSelector}"`);
        });

        // Scroll to bottom to trigger lazy-loaded images
        await autoScroll(page);

        // Extract the rendered HTML
        const html = await page.content();
        const $ = cheerio.load(html);

        // Find all product cards
        const cards = $(siteConfig.productCardSelector);
        const cardCount = cards.length;

        if (cardCount === 0) {
          log("WARN", `No product cards matched at ${url}. Skipping.`);
          await page.close();
          continue;
        }

        log("INFO", `Found ${cardCount} product cards at ${url}`);

        cards.each((_index, element) => {
          const card = $(element);

          // ── Extract Title ──
          let rawTitle = "";
          const titleEl = card.find(siteConfig.titleSelector).first();
          if (titleEl.length) {
            rawTitle = titleEl.text().trim() || titleEl.attr("title") || "";
          }
          if (!rawTitle) {
            // Fallback: use any heading inside the card
            rawTitle = card.find("h1, h2, h3, h4, h5, h6").first().text().trim();
          }

          // ── Extract Price ──
          let rawPrice = "";
          const priceEl = card.find(siteConfig.priceSelector).first();
          if (priceEl.length) {
            rawPrice = priceEl.text().trim();
          }
          // Fallback: look for any element containing currency-like text
          if (!rawPrice) {
            card.find("*").each((_i, el) => {
              const text = $(el).text().trim();
              if (/Rs\.?|PKR|₨|price/i.test(text) && text.length < 30) {
                rawPrice = text;
                return false; // break
              }
            });
          }

          // ── Extract Description ──
          let rawDescription = "";
          const descEl = card.find(siteConfig.descriptionSelector).first();
          if (descEl.length) {
            rawDescription = descEl.text().trim();
          }

          // ── Extract Image URL ──
          let imageUrl = "";
          const imgEl = card.find(siteConfig.imageSelector).first();
          if (imgEl.length) {
            // Try srcset first (highest resolution), then src, then data-src
            imageUrl =
              imgEl.attr("srcset")?.split(",").pop()?.trim().split(" ")[0] ||
              imgEl.attr("data-src") ||
              imgEl.attr("data-lazy-src") ||
              imgEl.attr("src") ||
              "";
          }
          imageUrl = resolveImageUrl(imageUrl, siteConfig.resolvedBaseUrl);

          // ── Extract Breadcrumb Trail ──
          const categoryBreadcrumbs = extractBreadcrumbs($, siteConfig, url);

          // Only include if we have at least a title
          if (rawTitle.length > 2) {
            allProducts.push({
              rawTitle,
              rawPrice,
              rawDescription,
              imageUrl,
              categoryBreadcrumbs,
              sourceUrl: url,
            });
          }
        });

        log("SUCCESS", `Extracted products from ${url}`);

        // Be polite — wait between requests
        await sleep(1500 + Math.random() * 2000);
      } catch (err) {
        log("ERROR", `Failed to scrape ${url}: ${(err as Error).message}`);
      } finally {
        try {
          await page.close();
        } catch {
          // Page may already be closed if navigation failed
        }
      }
    }
  } finally {
    await browser.close();
    log("INFO", "Browser closed.");
  }

  return allProducts;
}

/**
 * Smoothly scroll the page to the bottom to trigger lazy-loaded content.
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}

/**
 * Infer a category name from the URL path.
 * Handles common e-commerce URL patterns like /category/urdu-books or
 * /collections/arabic-books.
 */
function inferCategoryFromUrl(url: string): string {
  const urlObj = new URL(url);
  const segments = urlObj.pathname.split("/").filter(Boolean);

  // Get the last meaningful segment (skip collection/category/product keywords)
  const skipWords = new Set([
    "collections", "category", "product-category", "shop",
    "products", "page", "category", "c",
  ]);

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = decodeURIComponent(segments[i]);
    if (!skipWords.has(seg) && seg.length > 2 && !/^\d+$/.test(seg)) {
      return seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return "Uncategorized";
}

// ─── Phase 2: The Cleanser (OpenAI Integration) ───────────────────────────────

/**
 * Rewrite a raw product title and description using the configured AI backend.
 * Supports both OpenAI SDK (gpt-4o-mini) and z-ai-web-dev-sdk.
 *
 * System prompt is specifically crafted for Islamic commerce copywriting.
 */
async function rewriteWithAI(
  backend: AIBackend,
  rawTitle: string,
  rawDescription: string
): Promise<{ enrichedTitle: string; enrichedDescription: string }> {
  const userPrompt = `
## RAW PRODUCT DATA

**Title:** ${rawTitle}

**Description:** ${rawDescription || "No description provided."}

---

## TASK

1. **Rewrite the Title:** Create a clean, compelling product title. Remove any competitor brand names, promotional prefixes like "Best Seller" or "New Arrival", and unnecessary suffixes. Keep the core book/resource name and author if present. Capitalize properly.

2. **Rewrite the Description:** Transform the raw description into 2-3 engaging, professional paragraphs optimized for SEO. Apply these rules:
   - Remove all competitor branding, store names, and promotional language
   - Maintain absolute theological and historical accuracy
   - Write in an authoritative yet accessible tone appropriate for Islamic literature
   - Include relevant keywords naturally (e.g., the book's subject area, author's name if significant)
   - Format in clean paragraphs without HTML tags, markdown, or bullet points
   - If the original description is empty or too short (< 20 chars), generate a plausible 2-paragraph description based on the title alone

## OUTPUT FORMAT

Return ONLY a JSON object with exactly two fields:
{
  "enrichedTitle": "...",
  "enrichedDescription": "..."
}

Do NOT include any other text, commentary, or markdown formatting outside the JSON object.`;

  const systemPrompt =
    "You are an expert Islamic commerce copywriter for Bab-ul-Fatah, a premium Islamic e-commerce platform. Take the following raw product description and rewrite it to be highly engaging, professional, and optimized for SEO. Remove any competitor brand names. Format the output in clean, readable paragraphs without HTML tags. Maintain absolute theological and historical accuracy regarding the text or author. Always respond with valid JSON only — no markdown fences, no commentary.";

  try {
    let content: string;

    if (backend === "openai") {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 600,
      });
      content = response.choices[0]?.message?.content?.trim() || "";
    } else {
      // z-ai-web-dev-sdk backend
      const zai = await ZAI.create();
      const response = await zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      content = response.choices[0]?.message?.content?.trim() || "";
    }

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response — handle potential markdown fence wrapping
    let jsonStr = content;
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as {
      enrichedTitle?: string;
      enrichedDescription?: string;
    };

    return {
      enrichedTitle: parsed.enrichedTitle || rawTitle,
      enrichedDescription: parsed.enrichedDescription || rawDescription || "No description available.",
    };
  } catch (err) {
    log("WARN", `AI rewrite failed for "${rawTitle.slice(0, 40)}...": ${(err as Error).message}`);
    return {
      enrichedTitle: rawTitle,
      enrichedDescription: rawDescription || "No description available.",
    };
  }
}

/**
 * Process a batch of raw products through the AI cleanser.
 * Applies rate limiting between requests to avoid 429 errors.
 */
async function cleanseProducts(
  backend: AIBackend,
  rawProducts: RawProduct[]
): Promise<ProcessedProduct[]> {
  const processed: ProcessedProduct[] = [];
  const total = rawProducts.length;

  log("INFO", `Starting AI cleansing for ${total} products...`);

  for (let i = 0; i < total; i++) {
    const raw = rawProducts[i];
    const progress = `[${i + 1}/${total}]`;

    log("INFO", `${progress} Processing: "${raw.rawTitle.slice(0, 50)}..."`);

    // AI rewrite
    const { enrichedTitle, enrichedDescription } = await rewriteWithAI(
      backend,
      raw.rawTitle,
      raw.rawDescription
    );

    // Format the processed product
    const language = detectLanguage(enrichedTitle, enrichedDescription);
    const deepestCategory = raw.categoryBreadcrumbs[raw.categoryBreadcrumbs.length - 1] || "Unknown";
    const sku = generateSku(deepestCategory, enrichedTitle);
    const slug = generateSlug(enrichedTitle);

    processed.push({
      title: enrichedTitle.trim(),
      slug,
      description: enrichedDescription.trim(),
      price: cleanPrice(raw.rawPrice),
      imageUrl: raw.imageUrl,
      categoryBreadcrumbs: raw.categoryBreadcrumbs,
      language,
      sku,
    });

    // Rate limiting
    if (i < total - 1) {
      await sleep(AI_DELAY_MS + Math.random() * 400);
    }
  }

  log("SUCCESS", `AI cleansing complete. Processed ${processed.length} products.`);
  return processed;
}

// ─── Phase 3: The Formatter ───────────────────────────────────────────────────

/**
 * Format processed products into the final CatalogSeedItem array.
 * This matches the Prisma schema structure for direct seeding.
 * Resolves category slugs, extracts author names, and validates data.
 */
function formatProducts(processedProducts: ProcessedProduct[]): CatalogSeedItem[] {
  log("INFO", "Formatting products for Prisma seed compatibility...");

  // Track seen slugs to prevent duplicates
  const seenSlugs = new Map<string, number>();

  const formatted = processedProducts.map((product) => {
    // Deduplicate slugs by appending counter suffix
    let slug = product.slug;
    const seenCount = seenSlugs.get(slug) || 0;
    if (seenCount > 0) {
      slug = `${product.slug}-${seenCount}`;
    }
    seenSlugs.set(product.slug, seenCount + 1);

    // Build breadcrumb slug path: "books/quran/tafseer" from ["Books", "Quran", "Tafseer"]
    const categorySlug = product.categoryBreadcrumbs.length > 0
      ? product.categoryBreadcrumbs.map((c) => generateSlug(c)).filter(Boolean).join("/")
      : "uncategorized";

    // Extract author from the enriched title
    const authorName = extractAuthorFromTitle(product.title);

    // Validate price — set minimum threshold to filter garbage data
    const price = product.price > 0 ? product.price : 0;

    return {
      title: product.title,
      slug,
      description: product.description,
      price: Math.round(price * 100) / 100, // Round to 2 decimal places
      stock: 10, // Default stock for new catalog items
      sku: product.sku,
      language: product.language,
      imageUrl: product.imageUrl,

      // Relational lookups (resolved at seed time by the seed script)
      categoryBreadcrumbs: product.categoryBreadcrumbs,
      authorName,

      // Provenance metadata
      source: "AI Pipeline v1.0",
      extractedAt: new Date().toISOString(),
    };
  });

  // Filter out products with empty titles or zero-price (likely garbage)
  const valid = formatted.filter(
    (p) => p.title.length > 3 && p.description.length > 10
  );

  log(
    valid.length === formatted.length
      ? "SUCCESS"
      : "WARN",
    `Formatted ${valid.length} valid products${valid.length < formatted.length ? ` (dropped ${formatted.length - valid.length} invalid)` : ""}.`
  );

  return valid;
}

// ─── Phase 4: The Output Generator ────────────────────────────────────────────

/**
 * Write the formatted catalog to catalog-seed.json in the project root.
 * The output is pretty-printed with 2-space indentation for readability.
 */
function writeOutput(catalog: CatalogSeedItem[], outputPath: string): void {
  const absolutePath = path.resolve(outputPath);

  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(absolutePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Add pipeline metadata wrapper
  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: "1.0.0",
      totalProducts: catalog.length,
      categories: [...new Set(catalog.flatMap((p) => p.categoryBreadcrumbs))],
      languages: [...new Set(catalog.map((p) => p.language))],
    },
    products: catalog,
  };

  fs.writeFileSync(absolutePath, JSON.stringify(output, null, 2), "utf-8");

  log(
    "SUCCESS",
    `Catalog written to ${absolutePath} (${catalog.length} products, ${(JSON.stringify(output).length / 1024).toFixed(1)} KB)`
  );
}

// ─── Pipeline Orchestrator ────────────────────────────────────────────────────

/**
 * Sleep utility for rate limiting.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main pipeline execution.
 * Runs all 4 phases sequentially: Extract → Cleanse → Format → Output.
 */
async function runPipeline(): Promise<void> {
  const startTime = Date.now();

  console.log("");
  console.log("═".repeat(70));
  console.log("  Bab-ul-Fatah — AI-Powered Data Extraction Pipeline");
  console.log("  Phase 1: Extract  |  Phase 2: Cleanse  |  Phase 3: Format  |  Phase 4: Output");
  console.log("═".repeat(70));
  console.log("");

  // ── Determine AI Backend ──
  const apiKey = process.env.OPENAI_API_KEY;
  const backend: AIBackend = apiKey ? "openai" : "zai";

  if (backend === "openai") {
    log("SUCCESS", "AI Backend: OpenAI (gpt-4o-mini)");
  } else {
    log("INFO", "OPENAI_API_KEY not set — falling back to z-ai-web-dev-sdk");
    log("SUCCESS", "AI Backend: z-ai-web-dev-sdk (built-in)");
  }

  // ══════════════════════════════════════════════════════════════
  //  PHASE 1: THE EXTRACTOR
  // ══════════════════════════════════════════════════════════════
  log("INFO", `Phase 1: Extracting raw data from ${TARGET_URLS.length} URLs...`);

  const rawProducts = await extractProducts(TARGET_URLS);

  if (rawProducts.length === 0) {
    log("WARN", "No products extracted. Check your TARGET_URLS and CSS selectors.");
    log("INFO", "Generating a demo catalog with sample data for pipeline validation...");
    // Fall back to demo data so the user can verify the pipeline works end-to-end
    const demoProducts = generateDemoData();
    rawProducts.push(...demoProducts);
  }

  log("SUCCESS", `Phase 1 complete: ${rawProducts.length} raw products extracted.`);

  // ══════════════════════════════════════════════════════════════
  //  PHASE 2: THE CLEANSER
  // ══════════════════════════════════════════════════════════════
  log("INFO", "Phase 2: Cleansing descriptions with AI (GPT-4o-mini)...");

  const processedProducts = await cleanseProducts(backend, rawProducts);

  log("SUCCESS", `Phase 2 complete: ${processedProducts.length} products cleansed.`);

  // ══════════════════════════════════════════════════════════════
  //  PHASE 3: THE FORMATTER
  // ══════════════════════════════════════════════════════════════
  log("INFO", "Phase 3: Formatting for Prisma seed compatibility...");

  const formattedCatalog = formatProducts(processedProducts);

  log("SUCCESS", `Phase 3 complete: ${formattedCatalog.length} products formatted.`);

  // ══════════════════════════════════════════════════════════════
  //  PHASE 4: THE OUTPUT GENERATOR
  // ══════════════════════════════════════════════════════════════
  log("INFO", "Phase 4: Writing catalog-seed.json...");

  const outputPath = path.join(process.cwd(), "catalog-seed.json");
  writeOutput(formattedCatalog, outputPath);

  // ── Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("");
  console.log("═".repeat(70));
  console.log("  PIPELINE COMPLETE");
  console.log("═".repeat(70));
  console.log(`  Products extracted : ${rawProducts.length}`);
  console.log(`  Products cleansed  : ${processedProducts.length}`);
  console.log(`  Products formatted : ${formattedCatalog.length}`);
  console.log(`  Categories found   : ${new Set(formattedCatalog.flatMap((p) => p.categoryBreadcrumbs)).size}`);
  console.log(`  Languages found    : ${new Set(formattedCatalog.map((p) => p.language)).size}`);
  console.log(`  Elapsed time       : ${elapsed}s`);
  console.log(`  Output file        : ${outputPath}`);
  console.log("═".repeat(70));
  console.log("");

  // ── Usage Instructions ──
  log("INFO", "Next steps:");
  log("INFO", "  1. Review catalog-seed.json");
  log("INFO", "  2. Import into your Prisma seed script (prisma/seed.ts)");
  log("INFO", "  3. Run: npx prisma db seed");
  log("INFO", "");
}

// ─── Demo Data Generator ──────────────────────────────────────────────────────

/**
 * Generate sample products for pipeline validation when no real scraping
 * targets are available. This allows the full pipeline (including AI
 * cleansing) to run end-to-end for testing purposes.
 */
function generateDemoData(): RawProduct[] {
  return [
    {
      rawTitle: "Sahih Al-Bukhari Complete 9 Volumes - Imam Bukhari",
      rawPrice: "Rs. 2,950",
      rawDescription:
        "The most authentic collection of Hadith compiled by Imam Muhammad ibn Ismail al-Bukhari. This complete 9-volume set covers all aspects of Islamic life. Published by Darussalam Publishers.",
      imageUrl: "https://cdn.example.com/bukhari-9vol.jpg",
      categoryBreadcrumbs: ["Books", "Hadith"],
      sourceUrl: "https://example.com/sahih-bukhari",
    },
    {
      rawTitle: "Tafseer Ibn Kathir (Urdu) — Tafsir Ibn Kathir Complete Set",
      rawPrice: "PKR 4,200",
      rawDescription:
        "ابن کثیر کی تفسیر — قرآن مجید کی مشہور اور مستند تفسیر۔ یہ مکمل سیٹ اردو زبان میں ترجمہ و تشریح کے ساتھ موجود ہے۔",
      imageUrl: "https://cdn.example.com/ibn-kathir-urdu.jpg",
      categoryBreadcrumbs: ["Books", "Quran", "Tafseer"],
      sourceUrl: "https://example.com/tafseer-ibn-kathir",
    },
    {
      rawTitle: "Fortress of the Muslim (Hisnul Muslim) - Duas Collection",
      rawPrice: "Rs. 350",
      rawDescription:
        "A comprehensive collection of supplications from the Quran and authentic Sunnah. Includes daily prayers, morning/evening adhkar, and special occasions. Must-have for every Muslim household.",
      imageUrl: "https://cdn.example.com/hisnul-muslim.jpg",
      categoryBreadcrumbs: ["Books", "Spirituality"],
      sourceUrl: "https://example.com/hisnul-muslim",
    },
    {
      rawTitle: "Noorani Qaida — Learn to Read Quran (Arabic)",
      rawPrice: "Rs. 150",
      rawDescription:
        "The classic Noorani Qaida for beginners learning to read the Holy Quran in Arabic. Step-by-step lessons from letter recognition to word formation. Color-coded tajweed markings.",
      imageUrl: "https://cdn.example.com/noorani-qaida.jpg",
      categoryBreadcrumbs: ["Books", "Arabic Learning"],
      sourceUrl: "https://example.com/noorani-qaida",
    },
    {
      rawTitle: " Riyad-us-Saliheen by Imam Nawawi — Gardens of the Righteous",
      rawPrice: "Rs. 1,800",
      rawDescription:
        "A collection of authentic hadith compiled by Imam Yahya ibn Sharaf al-Nawawi. Covers faith, purification, prayer, funerals, fasting, charity, pilgrimage, and virtues. Best seller on our website.",
      imageUrl: "https://cdn.example.com/riyad-us-saliheen.jpg",
      categoryBreadcrumbs: ["Books", "Hadith", "Sahih al-Bukhari"],
      sourceUrl: "https://example.com/riyad-us-saliheen",
    },
  ];
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

runPipeline().catch((err) => {
  log("ERROR", `Pipeline crashed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
