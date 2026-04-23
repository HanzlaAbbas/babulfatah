// ============================================================================
// Bab-ul-Fatah — Fix Empty Categories Script v1.0
// ============================================================================
// Problem: Many root categories (like Dawah, Darussalam Publishers) have
// 0 products because products were only assigned to leaf-level subcategories
// and some categories have no matching products at all.
//
// What this does:
//   1. Finds all categories with 0 products in their ENTIRE subtree
//   2. Uses keyword matching to find relevant products from OTHER categories
//   3. Reassigns those products to the empty categories
//   4. Verifies no product is left without a category
//
// Usage:
//   $env:NODE_OPTIONS="--dns-result-order=ipv4first"
//   npx tsx prisma/fix-empty-categories.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load .env manually (npx tsx doesn't auto-load it like prisma commands do) ──
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
  console.log(`  Loaded env from ${envPath}`);
} else {
  console.error(`  ERROR: .env not found at ${envPath}`);
  process.exit(1);
}

// ─── Keyword mappings for category matching ─────────────────────────────────
// Each entry maps a category name (or partial name) to keywords that should
// match product titles/descriptions. The script searches for these keywords
// in products from OTHER categories and reassigns the best matches.

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // ── Dawah & Propagation ──
  "dawah": ["dawah", "da'wah", "da wah", "calling", "invitation", "preaching", "non-muslim", "non muslim", "comparative religion", "interfaith"],
  "dawah to non-muslims": ["non-muslim", "non muslim", "comparative", "interfaith", "christian", "hindu", "jew", "atheist", "invitation to", "message to", "towards understanding"],

  // ── Quran ──
  "quran": ["qur'an", "quran", "quraan", "koran", "tajweed", "tilawah", "hifz", "memorization", "qari"],
  "quran translation": ["quran translation", "translation of quran", "meaning of quran", "english quran", "urdu quran", "transliteration"],

  // ── Hadith ──
  "hadith": ["hadith", "hadeeth", "hadees", "sunnah", "prophetic tradition", "narration", "riwayat"],
  "sahih bukhari": ["sahih bukhari", "bukhari sharif", "bukhari shareef"],
  "sahih muslim": ["sahih muslim", "muslim sharif", "muslim shareef"],
  "rimah al-muwatta": ["muwatta", "malik"],
  "sunan": ["sunan", "tirmidhi", "nasai", "nasa'i", "abu dawud", "ibn majah", "darimi"],

  // ── Seerah & Biography ──
  "seerah": ["seerah", "seerah", "biography", "life of prophet", "prophet life", "prophet's life", "nabi", "rasul", "messenger"],
  "prophet's biography": ["prophet", "muhammad", "rasulullah", "life of the prophet", "prophet muhammad ﷺ", "ar-raheeq", "sealed nectar"],
  "sahabah": ["sahabah", "sahaba", "sahabi", "companions", "abu bakr", "umar", "uthman", "ali", "khalid", "salman", "bilal", "aisha", "fatima"],

  // ── Fiqh ──
  "fiqh": ["fiqh", "jurisprudence", "ruling", "islamic law", "shariah", "sharia", "hukm", "masla", "fatwa"],
  "salah": ["salah", "namaz", "prayer", "dua", "supplication", "wudu", "ablution", "tayammum", "mosque", "masjid"],
  "hajj & umrah": ["hajj", "umrah", "pilgrimage", "makkah", "mecca", "madinah", "medina", "tawaf", "sa'i", "mina", "arafat", "ihram"],

  // ── Aqeedah (Beliefs) ──
  "aqeedah": ["aqeedah", "aqidah", "aqeeda", "creed", "belief", "tawheed", "tawhid", "monotheism", "shirk", "iman", "faith"],
  "tawheed": ["tawheed", "tawhid", "monotheism", "oneness of allah", "allah's names", "asma ul husna", "sifat"],

  // ── Tazkiyah & Spirituality ──
  "tazkiyah": ["tazkiyah", "purification", "spiritual", "sufism", "tassawuf", "sufi", "dhikr", "zikr", "meditation", "inner", "heart", "qalb", "nafs", "soul"],
  "ramadan": ["ramadan", "ramadhan", "fasting", "sawm", "iftar", "suhoor", "sehri", "taraweeh", "tarawih", "laylatul qadr", "night of power"],

  // ── Children ──
  "children": ["children", "kids", "child", "kids", "junior", "young", "school", "coloring", "activity", "story book", "bedtime", "nursery", "toddler", "age 5", "age 6", "age 7", "age 8"],

  // ── Women ──
  "women": ["women", "woman", "sister", "wives", "mother", "motherhood", "hijab", "niqab", "purdah", "modesty", "women in islam", "muslim women", "female"],
  "marriage & family": ["marriage", "nikah", "wedding", "divorce", "talaaq", "husband", "wife", "family", "parenting", "spouse", "nikkah", "waleemah"],

  // ── History & Civilization ──
  "history": ["history", "civilization", "empire", "caliphate", "khilafah", "ottoman", "mughal", "andalusia", "spain", "conquest", "golden age"],

  // ── Economics & Finance ──
  "economics": ["economics", "finance", "banking", "interest", "riba", "zakat", "sadaqah", "charity", "trade", "business", "islamic banking", "insurance", "murabaha"],

  // ── Politics & Society ──
  "politics": ["politics", "governance", "caliphate", "leadership", "khilafah", "ruler", "state", "constitution", "democracy", "shura"],

  // ── Science & Medicine ──
  "science": ["science", "medicine", "medical", "astronomy", "mathematics", "chemistry", "physics", "botany", "zoology", "islamic science"],

  // ── Arabic Language ──
  "arabic language": ["arabic", "grammar", "nahw", "sarf", "balaghah", "al-arabiyyah", "arabic course", "learn arabic", "spoken arabic", "quranic arabic"],

  // ── Urdu Language ──
  "urdu": ["urdu", "urdu book"],

  // ── English Language ──
  "english": ["english"],

  // ── Publisher categories ──
  "darussalam publishers": ["darussalam", "dar-us-salam", "darusalam"],
  "goodword books": ["goodword", "good word"],
  "iiph": ["iiph", "international islamic publishing", "king Fahd"],
  "kazi publications": ["kazi"],
  "maktaba darussalam": ["maktaba", "darussalam"],

  // ── Duas & Supplications ──
  "dua": ["dua", "du'a", "supplication", "duas", "prayers", "invocation", "hisnul muslim", "fortress of muslim", "morning evening"],

  // ── Manners & Ethics ──
  "manners": ["manners", "etiquette", "adab", "akhlaq", "ethics", "character", "morals", "behavior", "conduct"],

  // ── Funeral & Death ──
  "janazah": ["janazah", "janaza", "funeral", "death", "grave", "barzakh", "hereafter", "afterlife", "graveyard"],

  // ── Paradise & Hell ──
  "paradise & hell": ["paradise", "jannah", "heaven", "hell", "jahannam", "hellfire", "punishment", "reward", "akhirah", "hereafter", "day of judgment", "qiyamah", "doomsday"],

  // ── Islamic Parenting ──
  "parenting": ["parenting", " upbringing", "raising children", "child upbringing", "family life", "home"],

  // ── Dawah Material ──
  "pamphlets": ["pamphlet", "leaflet", "booklet", "tract", "brochure", "handout"],

  // ── General Islamic Knowledge ──
  "islamic studies": ["islamic studies", "islamic knowledge", "deeni", "deeniyaat", "madrasa", "curriculum", "syllabus", "textbook"],
};

// ─── Sleep helper ─────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Keyword matching scorer ──────────────────────────────────────────────────
// Returns a score (0-100) based on how well a product matches keywords.
// Higher score = better match.

function scoreProduct(
  title: string,
  description: string,
  keywords: string[]
): number {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    // Title match (strong signal) — 10 points per match
    if (titleLower.includes(kw)) {
      score += 10;
    }
    // Description match — 3 points per match
    if (descLower.includes(kw)) {
      score += 3;
    }
    // Exact word boundary match in title — bonus 5
    const wordRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordRegex.test(title)) {
      score += 5;
    }
  }

  return score;
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, label: string, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable =
        err?.message?.includes("timed out") ||
        err?.message?.includes("connection pool") ||
        err?.message?.includes("ECONNREFUSED") ||
        err?.message?.includes("ECONNRESET") ||
        err?.code === "P2024" ||
        err?.code === "P1001" ||
        err?.code === "P1008";
      if (!isRetryable || attempt === maxRetries) throw err;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`    Retry ${attempt}/${maxRetries} for ${label} in ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw new Error(`${label}: max retries`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  console.log("");
  console.log("=".repeat(65));
  console.log("  Bab-ul-Fatah — Empty Category Fix v1.0");
  console.log("=".repeat(65));
  console.log("");

  const prisma = new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") +
          "connection_limit=3&pool_timeout=30&connect_timeout=15",
      },
    },
  });

  try {
    await withRetry(() => prisma.$connect(), "Connect");
    console.log("  Connected to database.\n");

    // ════════════════════════════════════════════════════════
    //  STEP 1: Find all root categories and their recursive product counts
    // ════════════════════════════════════════════════════════

    interface CategoryInfo {
      id: string;
      name: string;
      slug: string;
      product_count: number;
    }

    console.log("-- Step 1: Scanning categories... --");

    const allCategories = await withRetry(
      () => prisma.$queryRaw<CategoryInfo[]>`
        WITH RECURSIVE cat_tree AS (
          SELECT id, id as root_id FROM "Category" WHERE "parentId" IS NULL
          UNION ALL
          SELECT c.id, ct.root_id FROM "Category" c JOIN cat_tree ct ON c."parentId" = ct.id
        )
        SELECT
          cr.id, cr.name, cr.slug,
          COUNT(p.id)::int as product_count
        FROM "Category" cr
        LEFT JOIN cat_tree ct ON ct.root_id = cr.id
        LEFT JOIN "Product" p ON p."categoryId" = ct.id
        GROUP BY cr.id, cr.name, cr.slug
        ORDER BY cr.name ASC
      `,
      "Scan categories"
    );

    const emptyCategories = allCategories.filter((c) => c.product_count === 0);
    const nonEmptyCategories = allCategories.filter((c) => c.product_count > 0);

    console.log(`  Total categories: ${allCategories.length}`);
    console.log(`  With products:    ${nonEmptyCategories.length}`);
    console.log(`  Empty (0 products): ${emptyCategories.length}`);
    console.log("");

    if (emptyCategories.length === 0) {
      console.log("  ✅ All categories have products. Nothing to fix!");
      return;
    }

    // Print empty categories
    console.log("  Empty categories:");
    emptyCategories.forEach((c) => console.log(`    - ${c.name} (${c.slug})`));
    console.log("");

    // ════════════════════════════════════════════════════════
    //  STEP 2: Fetch ALL products for matching
    // ════════════════════════════════════════════════════════

    console.log("-- Step 2: Loading all products for keyword matching... --");

    const allProducts = await withRetry(
      () => prisma.product.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          categoryId: true,
        },
      }),
      "Fetch products"
    );

    console.log(`  Loaded ${allProducts.length} products.\n`);

    // ════════════════════════════════════════════════════════
    //  STEP 3: Match and reassign products
    // ════════════════════════════════════════════════════════

    console.log("-- Step 3: Matching products to empty categories... --");
    console.log("");

    let totalReassigned = 0;
    const processedProductIds = new Set<string>();

    for (const emptyCat of emptyCategories) {
      // Find best matching keywords
      let bestKeywords: string[] = [];

      // Try exact name match first
      const exactMatch = CATEGORY_KEYWORDS[emptyCat.name.toLowerCase()];
      if (exactMatch) {
        bestKeywords = exactMatch;
      } else {
        // Try partial name match (check if any key is a substring of the category name)
        for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
          if (emptyCat.name.toLowerCase().includes(key) || key.includes(emptyCat.name.toLowerCase())) {
            bestKeywords = keywords;
            break;
          }
        }
      }

      // If no predefined keywords, generate from category name itself
      if (bestKeywords.length === 0) {
        const words = emptyCat.name
          .toLowerCase()
          .split(/[\s&\-,_]+/)
          .filter((w) => w.length > 2);
        bestKeywords = words.length > 0 ? words : [emptyCat.name.toLowerCase()];
      }

      // Score each product and find the best matches
      const scored = allProducts
        .filter((p) => !processedProductIds.has(p.id)) // Don't steal already-reassigned products
        .map((p) => ({
          product: p,
          score: scoreProduct(p.title, p.description, bestKeywords),
        }))
        .filter((p) => p.score > 5) // Minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 8); // Take up to 8 best matches per category

      if (scored.length === 0) {
        console.log(`  ⏭  "${emptyCat.name}" — no matching products found`);
        continue;
      }

      // Reassign products
      const reassignedTitles: string[] = [];
      for (const { product, score } of scored) {
        try {
          await withRetry(
            () => prisma.product.update({
              where: { id: product.id },
              data: { categoryId: emptyCat.id },
            }),
            `Move product to ${emptyCat.name}`
          );
          processedProductIds.add(product.id);
          reassignedTitles.push(`    + "${product.title.slice(0, 55)}" (score: ${score})`);
          totalReassigned++;
          await sleep(200); // Throttle for Neon
        } catch (err: any) {
          console.log(`    ❌ Error moving "${product.title.slice(0, 40)}": ${err.message}`);
        }
      }

      console.log(`  ✅ "${emptyCat.name}" — ${reassignedTitles.length} products reassigned:`);
      reassignedTitles.forEach((t) => console.log(t));
      console.log("");

      await sleep(500); // Pause between categories
    }

    // ════════════════════════════════════════════════════════
    //  SUMMARY
    // ════════════════════════════════════════════════════════

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Verify: re-count empty categories
    const afterCategories = await withRetry(
      () => prisma.$queryRaw<CategoryInfo[]>`
        WITH RECURSIVE cat_tree AS (
          SELECT id, id as root_id FROM "Category" WHERE "parentId" IS NULL
          UNION ALL
          SELECT c.id, ct.root_id FROM "Category" c JOIN cat_tree ct ON c."parentId" = ct.id
        )
        SELECT
          cr.id, cr.name, cr.slug,
          COUNT(p.id)::int as product_count
        FROM "Category" cr
        LEFT JOIN cat_tree ct ON ct.root_id = cr.id
        LEFT JOIN "Product" p ON p."categoryId" = ct.id
        GROUP BY cr.id, cr.name, cr.slug
        HAVING COUNT(p.id) = 0
        ORDER BY cr.name ASC
      `,
      "Verify categories"
    );

    console.log("=".repeat(65));
    console.log("  FIX COMPLETE");
    console.log("=".repeat(65));
    console.log(`  Products reassigned: ${totalReassigned}`);
    console.log(`  Still empty:         ${afterCategories.length}`);
    if (afterCategories.length > 0) {
      console.log("  Remaining empty categories:");
      afterCategories.forEach((c) => console.log(`    - ${c.name}`));
    }
    console.log(`  Elapsed:             ${elapsed}s`);
    console.log("=".repeat(65));
    console.log("");

  } finally {
    await prisma.$disconnect();
    console.log("  Disconnected from database.");
  }
}

main().catch((e) => {
  console.error("SCRIPT FAILED:", e);
  process.exit(1);
});
