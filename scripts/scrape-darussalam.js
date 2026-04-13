#!/usr/bin/env node
// ============================================================================
// Phase 1: Fetch ALL products from Darussalam.pk (no AI — fast scrape)
// ============================================================================
const fs = require("fs");
const path = require("path");

const SHOPIFY_API_BASE = "https://darussalam.pk/collections/all/products.json";
const PRODUCTS_PER_PAGE = 250;
const OUTPUT_PATH = path.join(__dirname, "..", "catalog-raw.json");

// Category taxonomy mapping — Darussalam tags → our category hierarchy
const CATEGORY_RULES = [
  // === Quran ===
  { tags: ["Translation"], category: ["Books", "Quran", "Translation"] },
  { tags: ["Tafseer", "Tafseer Quran Hadith"], category: ["Books", "Quran", "Tafseer"] },
  { tags: ["Tajweed"], category: ["Books", "Quran", "Tajweed"] },
  { tags: ["Parah/Parts"], category: ["Books", "Quran", "Parah Parts"] },
  { tags: ["Mushaf", "Quran (Mushaf)"], category: ["Books", "Quran", "Mushaf"] },
  // === Hadith ===
  { tags: ["Sahah e Sitta", "Sahahe Sitta"], category: ["Books", "Hadith", "Sahah e Sitta"] },
  { tags: ["Ahadith e Nabvi"], category: ["Books", "Hadith", "Ahadith e Nabvi"] },
  { tags: ["Ahadith Qudsi"], category: ["Books", "Hadith", "Ahadith Qudsi"] },
  { tags: ["Hadith Quran Hadith", "Hadith Publications", "Hadith Quran & Hadith"], category: ["Books", "Hadith"] },
  // === Biography ===
  { tags: ["Prophet's Seerah", "Seerah Books of Prophet ﷺ", "Seerah"], category: ["Books", "Biography", "Prophets Seerah"] },
  { tags: ["Companions of Prophet (SAW)", "Seerat e Shabah"], category: ["Books", "Biography", "Companions"] },
  { tags: ["Imams & Scholars"], category: ["Books", "Biography", "Imams Scholars"] },
  { tags: ["Biography"], category: ["Books", "Biography"] },
  // === Family ===
  { tags: ["Women"], category: ["Books", "Family", "Women"] },
  { tags: ["Children", "Kids/Children", "Muslim Children's Books"], category: ["Books", "Family", "Children"] },
  { tags: ["Marital Relations"], category: ["Books", "Family", "Marital Relations"] },
  { tags: ["Family"], category: ["Books", "Family"] },
  // === Pillars of Islam ===
  { tags: ["Prayer/Supplication"], category: ["Books", "Pillars of Islam", "Prayer Supplication"] },
  { tags: ["Fasting"], category: ["Books", "Pillars of Islam", "Fasting"] },
  { tags: ["Hajj/Umrah", "Hajj and Umrah", "Hajj Umrah Essentials"], category: ["Books", "Pillars of Islam", "Hajj Umrah"] },
  { tags: ["Faith/Aqeedah"], category: ["Books", "Pillars of Islam", "Faith Aqeedah"] },
  { tags: ["Zakaat"], category: ["Books", "Pillars of Islam", "Zakaat"] },
  { tags: ["Pillars of Islam"], category: ["Books", "Pillars of Islam"] },
  // === Other Book Categories ===
  { tags: ["Education", "Dars e Nizami (Educational Curriculum)"], category: ["Books", "Education"] },
  { tags: ["Fiqh", "Islamic Law"], category: ["Books", "Fiqh"] },
  { tags: ["History"], category: ["Books", "History"] },
  { tags: ["Dawah"], category: ["Books", "Dawah"] },
  { tags: ["Science"], category: ["Books", "Science"] },
  { tags: ["Health"], category: ["Books", "Health"] },
  { tags: ["Reference"], category: ["Books", "Reference"] },
  { tags: ["Lifestyle"], category: ["Books", "Lifestyle"] },
  { tags: ["Miscellaneous Books"], category: ["Books", "Miscellaneous"] },
  { tags: ["Spirituality"], category: ["Books", "Spirituality"] },
  // === Islamic Products (non-book items) ===
  { tags: ["Islamic Products"], category: ["Islamic Products"] },
  { tags: ["Tasbeeh"], category: ["Islamic Products", "Tasbeeh"] },
  { tags: ["Quran Rehal"], category: ["Islamic Products", "Quran Rehal"] },
  { tags: ["Bakhoor Intense Burner"], category: ["Islamic Products", "Bakhoor"] },
  { tags: ["Dates"], category: ["Islamic Products", "Dates"] },
  { tags: ["Food Items", "Healthy Food Items", "Talbeena/Shilajeet/All Others"], category: ["Islamic Products", "Healthy Food Items"] },
  { tags: ["Arabic Table Decor", "Arabic Wall Art", "Wall Art"], category: ["Islamic Products", "Home Decor"] },
  { tags: ["Calligraphy", "Calligraphy Inks"], category: ["Islamic Products", "Calligraphy"] },
  { tags: ["Ramadan"], category: ["Islamic Products", "Ramadan"] },
  { tags: ["Packages"], category: ["Islamic Products", "Packages"] },
  { tags: ["Janamaz", "Prayer Mat/Cap/Tasbeeh", "Prayer Mat"], category: ["Islamic Products", "Janamaz"] },
  { tags: ["Arabic Car Hangings"], category: ["Islamic Products", "Arabic Car Hangings"] },
  { tags: ["Islamic Caps/Shumagh Romal", "Prayer Cap"], category: ["Islamic Products", "Islamic Caps"] },
  { tags: ["Hajj Umrah Essentials"], category: ["Islamic Products", "Hajj Umrah Essentials"] },
  // === Publisher Collections (must be BEFORE generic catch-all) ===
  { tags: ["Goodword"], category: ["Books", "Goodword Books"] },
  { tags: ["IIPH"], category: ["Books", "IIPH"] },
  // === Generic catch-all (MUST be last) ===
  { tags: ["Books", "All Books"], category: ["Books"] },
  { tags: ["Products", "Other Products", "All Others", "Others"], category: ["Books", "General"] },
];

const SKIP_TAGS = new Set([
  // Marketing / sales tags
  "Best Selling Products", "Mega Year End Sale", "New Arrivals", "Top Rated Books",
  "pickup-only", "All Books", "All Others", "Products", "Other Products", "Others",
  // Publisher / imprint tags (not categories)
  "Darussalam Publishers", "Darussalam Research Center", "Darul Iblagh",
  "Daar ul Noor Islamabad", "Darul Khalood", "Ammanulla Vadakkangra",
  // Collection utility tags
  "Darussalam", "Arabic Books",
]);

// Publisher names that should NEVER become categories
const PUBLISHER_TAGS = new Set([
  "Darussalam Publishers", "Darussalam Research Center", "Darul Iblagh",
  "Daar ul Noor Islamabad", "Darul Khalood", "Ammanulla Vadakkangra",
  "Darussalam",
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(level, msg) {
  const t = new Date().toISOString().slice(11, 23);
  const p = level === "SUCCESS" ? "✅" : level === "ERROR" ? "❌" : level === "WARN" ? "⚠️" : "ℹ️";
  console.log(`${p} [${t}] ${msg}`);
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n").trim();
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `item-${Date.now()}`;
}

function detectLanguage(title, description) {
  const c = `${title} ${description}`;
  if (/[\u0600-\u06FF]/.test(c)) return "URDU";
  if (/\bArabic|العربية|القرآن\b/i.test(c)) return "ARABIC";
  if (/\bUrdu|اردو\b/i.test(c)) return "URDU";
  return (c.match(/[a-zA-Z]/g) || []).length / Math.max(c.length, 1) > 0.5 ? "ENGLISH" : "URDU";
}

function generateSku(cat, title) {
  const a = cat.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, "X");
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) & 0xfff;
  return `BF-${a}-${String(h).padStart(3, "0")}`;
}

function resolveCategory(tags) {
  // Remove author tags, publisher tags, and marketing tags
  const clean = tags.filter(t =>
    !t.endsWith("Authors") && !SKIP_TAGS.has(t) && !PUBLISHER_TAGS.has(t)
  );
  for (const rule of CATEGORY_RULES) {
    if (rule.tags.some(rt => clean.includes(rt))) return rule.category;
  }
  // Fallback: if remaining tags look like author/publisher names, use General
  const first = clean[0];
  if (!first) return ["Books", "General"];
  // Heuristic: if tag contains common author-name patterns, dump to General
  if (/^(Abdul|Al-|Ibn|Abu|Dr\.|Ed\.|Imam|Maulvi|Muhammad|Mahmood|Farooq|Fawzia|Luqman|Abdur|Farida|Ashfaq|Iqbal|Saniyasnain|Ahmed|Abdullah)/.test(first)) {
    return ["Books", "General"];
  }
  return ["Books", first];
}

function resolveAuthor(tags, vendor) {
  for (const tag of tags) {
    if (tag.endsWith("Authors")) {
      let name = tag.replace(/ Authors$/i, "").trim();
      return name;
    }
  }
  const nonAuthor = new Set(["Darussalam", "Darussalam Publishers", "Goodword", "", "Products"]);
  if (vendor && !nonAuthor.has(vendor.trim())) return vendor.trim();
  return null;
}

async function fetchAllProducts() {
  log("INFO", "Fetching all products from Darussalam.pk...");
  const all = [];
  let page = 1;
  while (true) {
    const url = `${SHOPIFY_API_BASE}?limit=${PRODUCTS_PER_PAGE}&page=${page}&sort_by=created_at`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)", Accept: "application/json" }
      });
      if (!res.ok) { log("WARN", `HTTP ${res.status} page ${page}. Retry...`); await sleep(3000); continue; }
      const data = await res.json();
      const products = data.products || [];
      if (products.length === 0) { log("INFO", `Page ${page} empty. Done.`); break; }
      all.push(...products);
      log("INFO", `Page ${page}: ${products.length} products (total: ${all.length})`);
      page++;
      await sleep(400);
    } catch (e) {
      log("WARN", `Error page ${page}: ${e.message}. Retry...`);
      await sleep(3000);
    }
  }
  return all;
}

async function main() {
  const start = Date.now();
  console.log("\n" + "═".repeat(70));
  console.log("  Bab-ul-Fatah — Darussalam.pk Product Fetcher (Phase 1: Scrape Only)");
  console.log("═".repeat(70) + "\n");

  const shopifyProducts = await fetchAllProducts();
  log("SUCCESS", `Total: ${shopifyProducts.length} products fetched`);

  // Build catalog
  const catalog = [];
  const seenSlugs = new Map();

  for (const sp of shopifyProducts) {
    if (!sp.title?.trim()) continue;
    const title = sp.title.trim();
    const vendor = sp.vendor?.trim() || "";
    const tags = sp.tags || [];
    const price = parseFloat(sp.variants?.[0]?.price) || 0;
    const rawDesc = stripHtml(sp.body_html || "");
    const breadcrumbs = resolveCategory(tags);
    const author = resolveAuthor(tags, vendor);
    const lang = detectLanguage(title, rawDesc);
    const deepest = breadcrumbs[breadcrumbs.length - 1] || "Books";
    const sku = generateSku(deepest, title);

    // Collect ALL images (skip Logo/badge)
    let images = (sp.images || []).map(img => {
      let url = img.src || "";
      if (url.startsWith("//")) url = "https:" + url;
      return url;
    }).filter(url => url && !url.includes("Logo"));

    let slug = slugify(title);
    const seen = seenSlugs.get(slug) || 0;
    if (seen > 0) slug = `${slug}-${seen}`;
    seenSlugs.set(slugify(title), seen + 1);

    catalog.push({
      title, slug, description: rawDesc || `Discover ${title} at Bab-ul-Fatah — your trusted source for authentic Islamic books and products in Pakistan.`,
      price: Math.max(0, price), stock: 15, sku, language: lang,
      imageUrl: images[0] || "", images,
      categoryBreadcrumbs: breadcrumbs, authorName: author,
      source: "Darussalam.pk", extractedAt: new Date().toISOString(),
    });
  }

  // Write output
  const cats = [...new Set(catalog.flatMap(p => p.categoryBreadcrumbs))];
  const hierarchies = [...new Set(catalog.map(p => p.categoryBreadcrumbs.join(" → ")))];
  const langs = [...new Set(catalog.map(p => p.language))];

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: "2.0.0-darussalam",
      totalProducts: catalog.length,
      categories: cats,
      categoryHierarchies: hierarchies.map(h => h.split(" → ")),
      languages: langs,
      source: "darussalam.pk",
    },
    products: catalog,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  const sizeKB = (JSON.stringify(output).length / 1024).toFixed(1);
  const totalImgs = catalog.reduce((s, p) => s + (p.images?.length || 0), 0);
  const authors = [...new Set(catalog.filter(p => p.authorName).map(p => p.authorName))];

  console.log("\n" + "═".repeat(70));
  console.log("  SCRAPE COMPLETE");
  console.log("═".repeat(70));
  console.log(`  Products     : ${catalog.length}`);
  console.log(`  Images       : ${totalImgs}`);
  console.log(`  Avg img/prod : ${(totalImgs / Math.max(catalog.length, 1)).toFixed(1)}`);
  console.log(`  Categories   : ${cats.length}`);
  console.log(`  Authors      : ${authors.length}`);
  console.log(`  Languages    : ${langs.join(", ")}`);
  console.log(`  Size         : ${sizeKB} KB`);
  console.log(`  Time         : ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`  Output       : ${OUTPUT_PATH}`);
  console.log("═".repeat(70) + "\n");
}

main().catch(e => { log("ERROR", e.message); console.error(e); process.exit(1); });
