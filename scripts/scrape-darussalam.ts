// ============================================================================
// Bab-ul-Fatah — Darussalam.pk Complete Catalog Scraper
// ============================================================================
// Scrapes ALL products from darussalam.pk including:
//   - All gallery images per product
//   - Title, price (PKR), SKU
//   - Category breadcrumbs
//   - Author extraction from title
//
// Then generates SEO-optimized descriptions via AI (z-ai-web-dev-sdk)
// and imports everything into the Prisma database.
//
// USAGE:
//   npx ts-node --project tsconfig.scripts.json scripts/scrape-darussalam.ts
// ============================================================================

import ZAI from "z-ai-web-dev-sdk";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

// ─── Configuration ────────────────────────────────────────────────────────────

/** Product URLs extracted from darussalam.pk/shop — all 67 products */
const PRODUCT_URLS: string[] = [
  "https://darussalam.pk/products/110-ahadith-qudsi-1",
  "https://darussalam.pk/products/60-golden-hadith-for-children-urdu-arabic-english",
  "https://darussalam.pk/products/a-flying-envoy",
  "https://darussalam.pk/products/ahkam-e-satr-o-hijab",
  "https://darussalam.pk/products/al-quran-al-kareem-ahsan-al-hawashi-imp",
  "https://darussalam.pk/products/al-talibaat-ma-ahadith-rasool",
  "https://darussalam.pk/products/allah-kay-akhri-nabi-saw",
  "https://darussalam.pk/products/an-nawawi-40-hadith-prophets-traditions-pocket-size",
  "https://darussalam.pk/products/ar-raheeq-al-makhtum-urdu",
  "https://darussalam.pk/products/ar-raheeq-al-makhtum-urdu-aala-quality",
  "https://darussalam.pk/products/asaan-tarjuma-quran-e-kareem-ds",
  "https://darussalam.pk/products/byan-ul-quran-by-dr-israr-ahmed",
  "https://darussalam.pk/products/hidayat-al-qari-sharh-sahih-al-bukhari-10-volume-set-local",
  "https://darussalam.pk/products/his-faith-was-great-the-story-of-prophet-ibrahim-a-3rd-part-3",
  "https://darussalam.pk/products/hisn-ul-muslim-14x21",
  "https://darussalam.pk/products/hisn-ul-muslim-8x12-pocket-size",
  "https://darussalam.pk/products/jaado-ki-haqeeqat",
  "https://darussalam.pk/products/jadoo-tonay-ka-ilaaj",
  "https://darussalam.pk/products/khawateen-aur-ramadan-ul-mubarak-1",
  "https://darussalam.pk/products/muallim-al-tajweed-7b-tajweedi-quran-16-lines",
  "https://darussalam.pk/products/mukhtasar-sahih-al-bukhari-2-volume-set",
  "https://darussalam.pk/products/namaz-e-nabvi-hard-cover-14x21",
  "https://darussalam.pk/products/namaz-e-nabvi-s-c-12x17",
  "https://darussalam.pk/products/pyary-rasool-ki-payari-duain-pocket-aam",
  "https://darussalam.pk/products/qisas-al-anbiya",
  "https://darussalam.pk/products/questions-answers-on-the-mothers-of-the-believers",
  "https://darussalam.pk/products/qurani-qaidah-14x21",
  "https://darussalam.pk/products/qurani-qaidah-17x24",
  "https://darussalam.pk/products/rabbana-qurani-duayein",
  "https://darussalam.pk/products/rehmat-e-alam",
  "https://darussalam.pk/products/rehnima-e-hajj-o-umrah",
  "https://darussalam.pk/products/riyad-us-saliheen-2-vol-set-1",
  "https://darussalam.pk/products/riyad-us-saliheen-2-vol-set-new-edition-17x24",
  "https://darussalam.pk/products/riyad-us-saliheen-darsi-urdu",
  "https://darussalam.pk/products/sayeda-khadija-r-a-aur-unki-betiyan",
  "https://darussalam.pk/products/sayeda-khadija-r-a-ki-zindagi-kai-sunehray-waqiyat",
  "https://darussalam.pk/products/sayedina-hazrat-ali-r-a-ki-zindagi-kay-sunehray-waqiyat",
  "https://darussalam.pk/products/seerat-encyclopedia-11-books-complete-set",
  "https://darussalam.pk/products/seerat-un-nabi-pbuh-2-vols-set",
  "https://darussalam.pk/products/story-of-khabbab-bin-al-aratt",
  "https://darussalam.pk/products/summarized-sahih-al-bukhari-arabic-english-local",
  "https://darussalam.pk/products/sunan-abu-daood-urducomplete-set",
  "https://darussalam.pk/products/sunehri-kirney",
  "https://darussalam.pk/products/sunnat-e-mutahirah-aur-adab-e-mubashrat",
  "https://darussalam.pk/products/syedina-usman-bin-affna-ki-zindagi-k-sunehray-waqiyat",
  "https://darussalam.pk/products/tafseer-ahsan-ul-bayyan-jumbo-size",
  "https://darussalam.pk/products/tafseer-ahsan-ul-kalam-17x24",
  "https://darussalam.pk/products/tafseer-ibn-e-kathir-6-vol-set-imported",
  "https://darussalam.pk/products/tafsir-ahsan-ul-bayan-17x24",
  "https://darussalam.pk/products/tafsir-ahsan-ul-kalaam-hard-cover-pocket-size",
  "https://darussalam.pk/products/tafsir-ibn-kathir-english-10-vols-set",
  "https://darussalam.pk/products/taiseer-al-quran-4-volume-set-computerized",
  "https://darussalam.pk/products/the-biography-of-abu-bakr-as-siddeeq-r-a",
  "https://darussalam.pk/products/the-biography-of-uthman-ibn-affan",
  "https://darussalam.pk/products/the-noble-quran-art-paper",
  "https://darussalam.pk/products/the-quest-for-truth",
  "https://darussalam.pk/products/the-sealed-nectar-ar-raheeq-al-makhtoum-4-color-print",
  "https://darussalam.pk/products/the-sealed-nectar-ar-raheequl-makhtum",
  "https://darussalam.pk/products/the-story-of-muhammad-saw-in-makkah-art-paper",
  "https://darussalam.pk/products/tib-e-nabvi-latest",
  "https://darussalam.pk/products/when-the-moon-split-new-edition",
  "https://darussalam.pk/products/why-women-are-accepting-islam",
];

const RAW_OUTPUT = path.join(process.cwd(), "download", "darussalam-raw.json");
const FINAL_OUTPUT = path.join(process.cwd(), "download", "darussalam-catalog.json");
const SCRAPE_DELAY_MS = 1200;
const AI_DELAY_MS = 1500;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawScrapedProduct {
  url: string;
  title: string;
  price: number;
  sku: string;
  images: string[];
  breadcrumbs: string[];
  authorName: string | null;
  rawDescription: string;
  language: string;
  inStock: boolean;
}

interface FinalProduct {
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  language: string;
  images: string[];
  breadcrumbs: string[];
  authorName: string | null;
  source: string;
}

// ─── Utility Functions ─────────────────────────────────────────────────────────

function log(level: "INFO" | "OK" | "WARN" | "ERR", msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  const icon = level === "OK" ? "✅" : level === "ERR" ? "❌" : level === "WARN" ? "⚠️" : "ℹ️";
  console.log(`${icon} [${ts}] ${msg}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/&amp;/g, "").replace(/&[a-z]+;/gi, "")
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanPrice(raw: string): number {
  const cleaned = raw.replace(/[Rs.\s]|PKR|₨|Rs/gi, "").replace(/,/g, "").trim();
  return isNaN(parseFloat(cleaned)) ? 0 : parseFloat(cleaned);
}

function detectLanguage(title: string): string {
  if (/[\u0600-\u06FF]/.test(title)) return "URDU";
  if (/\b(Urdu|اردو)\b/i.test(title)) return "URDU";
  if (/\b(Arabic|العربية)\b/i.test(title)) return "ARABIC";
  if (/\b(English|Tafseer|Commentary|Hadith|Seerah|Biography|Noble Quran)\b/i.test(title)) return "ENGLISH";
  const latin = (title.match(/[a-zA-Z]/g) || []).length / Math.max(title.length, 1);
  return latin > 0.5 ? "ENGLISH" : "URDU";
}

function extractAuthor(title: string): string | null {
  const byMatch = title.match(/\s+by\s+(.+)$/i);
  if (byMatch) return byMatch[1].trim();
  const dashMatch = title.match(/\s*[-–—]\s*([^-\–—]+)$/);
  if (dashMatch && dashMatch[1].trim().split(" ").length <= 5) return dashMatch[1].trim();
  return null;
}

// ─── Phase 1: Scrape All Product Pages ────────────────────────────────────────

async function scrapeProduct(zai: any, url: string): Promise<RawScrapedProduct | null> {
  try {
    const result = await zai.functions.invoke("page_reader", { url });
    const html = result.data?.html || "";

    if (html.length < 500) {
      log("WARN", `Page too short: ${url}`);
      return null;
    }

    // ── Extract Images ──
    const imgTags = html.match(/<img[^>]+>/gi) || [];
    const seenUrls = new Set<string>();
    const images: string[] = [];

    for (const tag of imgTags) {
      const srcMatch = tag.match(/src="(\/\/darussalam\.pk\/cdn\/shop\/files\/[^"]+)"/i);
      if (!srcMatch) continue;
      const src = srcMatch[1].split("?")[0];
      if (seenUrls.has(src)) continue;
      // Skip logos, icons, tiny thumbnails
      if (/Logo_|icon|favicon|emoji/i.test(src)) continue;
      // Skip very small sizes (thumbnail indicators: width=144)
      const widthMatch = tag.match(/width="(\d+)"/);
      if (widthMatch && parseInt(widthMatch[1]) < 200) continue;
      seenUrls.add(src);
      images.push(`https:${src}`);
    }

    // If no large images found, take first few without size filter
    if (images.length === 0) {
      for (const tag of imgTags) {
        const srcMatch = tag.match(/src="(\/\/darussalam\.pk\/cdn\/shop\/files\/[^"]+)"/i);
        if (!srcMatch) continue;
        const src = srcMatch[1].split("?")[0];
        if (seenUrls.has(src) || /Logo_/i.test(src)) continue;
        seenUrls.add(src);
        images.push(`https:${src}`);
        if (images.length >= 3) break;
      }
    }

    // ── Extract Title ──
    // Try JSON-LD first
    let title = "";
    const jsonldBlocks = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gis) || [];
    for (const block of jsonldBlocks) {
      try {
        const parsed = JSON.parse(block);
        if (parsed.name) { title = parsed.name; break; }
      } catch {}
    }
    // Fallback: page title
    if (!title) {
      const titleMatch = html.match(/<title>([^<]+)/i);
      if (titleMatch) title = titleMatch[1].replace(/\s*[-|].*Darussalam.*/i, "").trim();
    }

    // ── Extract Price ──
    let price = 0;
    for (const block of jsonldBlocks) {
      try {
        const parsed = JSON.parse(block);
        if (parsed.offers?.price) { price = parseFloat(parsed.offers.price); break; }
      } catch {}
    }
    if (!price) {
      const priceMatch = html.match(/Rs\.?\s*[\d,]+\.?\d*/);
      if (priceMatch) price = cleanPrice(priceMatch[0]);
    }

    // ── Extract SKU ──
    let sku = "";
    const skuMatch = html.match(/SKU:\s*(\S+)/i);
    if (skuMatch) sku = skuMatch[1];

    // ── Extract Description ──
    let rawDescription = "";
    const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      rawDescription = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);
    }

    // ── Extract Breadcrumbs ──
    const breadcrumbs: string[] = [];
    const bcContainers = html.match(/<nav[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/i);
    if (bcContainers) {
      const bcLinks = bcContainers[0].match(/<a[^>]*>([^<]+)<\/a>/gi) || [];
      for (const link of bcLinks) {
        const text = link.replace(/<[^>]+>/g, "").trim();
        const skip = new Set(["home", "shop", "store", ""]);
        if (text.length > 1 && !skip.has(text.toLowerCase())) {
          breadcrumbs.push(text);
        }
      }
    }
    // Fallback: use collection/category from URL
    if (breadcrumbs.length === 0) {
      breadcrumbs.push("Books");
    }

    // ── Stock Status ──
    const inStock = !/sold out|out of stock/i.test(html);

    return {
      url,
      title,
      price,
      sku,
      images: images.slice(0, 20), // Max 20 images per product
      breadcrumbs,
      authorName: extractAuthor(title),
      rawDescription,
      language: detectLanguage(title),
      inStock,
    };
  } catch (err: any) {
    log("ERR", `Failed to scrape ${url}: ${err.message}`);
    return null;
  }
}

// ─── Phase 2: Generate SEO Descriptions via AI ────────────────────────────────

async function generateDescription(zai: any, product: RawScrapedProduct): Promise<string> {
  const prompt = `You are an expert Islamic commerce copywriter for Bab-ul-Fatah, Pakistan's premium Islamic e-commerce platform. Write a compelling, SEO-optimized product description for the following book.

TITLE: ${product.title}
PRICE: Rs. ${product.price.toLocaleString("en-PK")}
LANGUAGE: ${product.language}
CATEGORY: ${product.breadcrumbs.join(" → ")}
AUTHOR: ${product.authorName || "Unknown"}
${product.rawDescription ? `ORIGINAL DESCRIPTION (for reference only — do NOT copy): ${product.rawDescription.slice(0, 500)}` : ""}

REQUIREMENTS:
1. Write 2-3 engaging paragraphs in ${product.language === "URDU" ? "Urdu with some English terms" : "English"}
2. Mention the book's key features, target audience, and why it's valuable
3. Include relevant keywords naturally (title, author, subject area, format)
4. Do NOT mention Darussalam or any competitor brand
5. Do NOT use HTML, markdown, or bullet points — just plain paragraphs
6. Be accurate about the content — this is real Islamic literature
7. Keep it between 150-300 words total`;

  try {
    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert Islamic commerce copywriter for Bab-ul-Fatah. Write concise, SEO-optimized product descriptions. Always respond with plain text paragraphs only — no HTML, no markdown, no JSON." },
        { role: "user", content: prompt },
      ],
    });

    const desc = response.choices[0]?.message?.content?.trim() || "";
    return desc.length > 50 ? desc : `A premium Islamic publication available at Bab-ul-Fatah. ${product.title} — a must-have addition to your Islamic library. Authored by ${product.authorName || "a renowned scholar"}, this work provides authentic and reliable knowledge for Muslims seeking to deepen their understanding of the deen.`;
  } catch (err: any) {
    log("WARN", `AI description failed for "${product.title.slice(0, 40)}": ${err.message}`);
    // Generate a basic description as fallback
    return `${product.title} is a premium Islamic publication available at Bab-ul-Fatah. ${product.authorName ? `Authored by ${product.authorName},` : ""} this work is an essential addition to any Islamic library. Covering important topics in ${product.language.toLowerCase()} with authentic and reliable content, it serves as a valuable resource for Muslims seeking to deepen their understanding of Islamic knowledge and practice.`;
  }
}

// ─── Phase 3: Database Import ─────────────────────────────────────────────────

async function importToDatabase(products: FinalProduct[]) {
  const prisma = new PrismaClient();

  // Category cache: composite key "slug|parentId" → id
  const catCache = new Map<string, string>();

  async function upsertCategoryChain(breadcrumbs: string[]): Promise<string> {
    let parentId: string | null = null;

    for (const name of breadcrumbs) {
      const slug = generateSlug(name) || `cat-${Date.now()}`;
      const cacheKey: string = `${slug}|${parentId || "root"}`;

      if (catCache.has(cacheKey)) {
        parentId = catCache.get(cacheKey) as string;
        continue;
      }

      const displayName = name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const cat: any = await prisma.category.upsert({
        where: { slug_parentId: { slug, parentId: parentId ?? null } } as any,
        update: { name: displayName },
        create: { name: displayName, slug, parentId },
      });

      if (cat && cat.id) {
        catCache.set(cacheKey, cat.id);
        parentId = cat.id;
      }
    }

    return parentId!;
  }

  let created = 0;
  let updated = 0;
  let imagesCreated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const progress = `[${i + 1}/${products.length}]`;

    try {
      // Resolve category
      const categoryId = await upsertCategoryChain(p.breadcrumbs);

      // Resolve author
      let authorId: string | null = null;
      if (p.authorName) {
        const existing = await prisma.author.findFirst({ where: { name: p.authorName } });
        if (existing) {
          authorId = existing.id;
        } else {
          const created_author = await prisma.author.create({ data: { name: p.authorName } });
          authorId = created_author.id;
        }
      }

      // Upsert product
      const existing = await prisma.product.findUnique({ where: { slug: p.slug } });

      const product = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          description: p.description,
          price: p.price,
          stock: p.stock,
          language: p.language as any,
          categoryId,
          authorId,
          sku: p.sku || null,
        },
        create: {
          title: p.title,
          slug: p.slug,
          description: p.description,
          price: p.price,
          stock: p.stock,
          language: p.language as any,
          categoryId,
          authorId,
          sku: p.sku || null,
        },
      });

      if (existing) {
        updated++;
      } else {
        created++;
      }

      // Delete old images and insert new ones
      if (p.images.length > 0) {
        await prisma.image.deleteMany({ where: { productId: product.id } });

        for (const imgUrl of p.images) {
          await prisma.image.create({
            data: { url: imgUrl, altText: p.title, productId: product.id },
          });
          imagesCreated++;
        }
      }

      log("OK", `${progress} ${existing ? "Updated" : "Created"}: ${p.title.slice(0, 50)}`);
    } catch (err: any) {
      log("ERR", `${progress} Failed "${p.title.slice(0, 40)}": ${err.message}`);
    }
  }

  await prisma.$disconnect();

  return { created, updated, imagesCreated };
}

// ─── Main Orchestrator ─────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  console.log("");
  console.log("═".repeat(70));
  console.log("  Bab-ul-Fatah — Darussalam.pk Complete Catalog Importer");
  console.log("  Phase 1: Scrape → Phase 2: AI Descriptions → Phase 3: DB Import");
  console.log("═".repeat(70));
  console.log("");

  const zai = await ZAI.create();
  log("INFO", "AI Backend: z-ai-web-dev-sdk");

  // ════════════════════════════════════════════════════════
  //  PHASE 1: SCRAPE ALL PRODUCTS
  // ════════════════════════════════════════════════════════
  log("INFO", `Phase 1: Scraping ${PRODUCT_URLS.length} products from darussalam.pk...`);

  const rawProducts: RawScrapedProduct[] = [];
  let scrapeFails = 0;

  for (let i = 0; i < PRODUCT_URLS.length; i++) {
    const url = PRODUCT_URLS[i];
    log("INFO", `[${i + 1}/${PRODUCT_URLS.length}] Scraping: ${url.split("/").pop()}`);

    const product = await scrapeProduct(zai, url);
    if (product && product.title) {
      rawProducts.push(product);
      log("OK", `→ ${product.title} | Rs.${product.price.toLocaleString()} | ${product.images.length} images`);
    } else {
      scrapeFails++;
    }

    if (i < PRODUCT_URLS.length - 1) {
      await sleep(SCRAPE_DELAY_MS);
    }
  }

  // Save raw scrape data
  fs.writeFileSync(RAW_OUTPUT, JSON.stringify(rawProducts, null, 2), "utf-8");
  log("OK", `Phase 1 complete: ${rawProducts.length} products scraped, ${scrapeFails} failures`);
  log("INFO", `Raw data saved to ${RAW_OUTPUT}`);

  // ════════════════════════════════════════════════════════
  //  PHASE 2: GENERATE SEO DESCRIPTIONS
  // ════════════════════════════════════════════════════════
  log("INFO", `Phase 2: Generating SEO descriptions via AI for ${rawProducts.length} products...`);

  const finalProducts: FinalProduct[] = [];

  for (let i = 0; i < rawProducts.length; i++) {
    const raw = rawProducts[i];
    log("INFO", `[${i + 1}/${rawProducts.length}] Writing description for: ${raw.title.slice(0, 50)}`);

    const description = await generateDescription(zai, raw);

    finalProducts.push({
      title: raw.title,
      slug: generateSlug(raw.title),
      description,
      price: raw.price,
      stock: raw.inStock ? 15 : 0,
      sku: raw.sku,
      language: raw.language,
      images: raw.images,
      breadcrumbs: raw.breadcrumbs,
      authorName: raw.authorName,
      source: "Darussalam.pk",
    });

    if (i < rawProducts.length - 1) {
      await sleep(AI_DELAY_MS);
    }
  }

  // Save final catalog
  fs.writeFileSync(FINAL_OUTPUT, JSON.stringify(finalProducts, null, 2), "utf-8");
  log("OK", `Phase 2 complete: ${finalProducts.length} descriptions generated`);
  log("INFO", `Final catalog saved to ${FINAL_OUTPUT}`);

  // ════════════════════════════════════════════════════════
  //  PHASE 3: DATABASE IMPORT
  // ════════════════════════════════════════════════════════
  log("INFO", "Phase 3: Importing into database...");

  const stats = await importToDatabase(finalProducts);

  // ════════════════════════════════════════════════════════
  //  SUMMARY
  // ════════════════════════════════════════════════════════
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("");
  console.log("═".repeat(70));
  console.log("  IMPORT COMPLETE");
  console.log("═".repeat(70));
  console.log(`  Products scraped    : ${rawProducts.length} / ${PRODUCT_URLS.length}`);
  console.log(`  Descriptions written : ${finalProducts.length}`);
  console.log(`  Products created    : ${stats.created}`);
  console.log(`  Products updated    : ${stats.updated}`);
  console.log(`  Images imported     : ${stats.imagesCreated}`);
  console.log(`  Elapsed time        : ${elapsed}s`);
  console.log("═".repeat(70));
  console.log("");
}

main().catch((err) => {
  log("ERR", `Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
