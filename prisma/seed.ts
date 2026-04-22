// ============================================================================
// Bab-ul-Fatah — Prisma Database Seeder v3.0 (Connection-Safe)
// ============================================================================
// Optimized for Neon free-tier (max ~20 concurrent connections).
// Key changes from v2:
//   - Connection pool limited to 3
//   - Retry logic with exponential backoff on every DB call
//   - Products processed in batches of 10 with 1.5s delay between batches
//   - Images batched with createMany (skipDuplicates)
//   - Explicit $connect / $disconnect lifecycle
//   - Graceful error handling — never crashes, always resumes
// ============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── ESM-compatible __dirname ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogProduct {
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  language: string;
  imageUrl: string;
  images?: string[];
  categoryBreadcrumbs: string[];
  authorName: string | null;
  source?: string;
  extractedAt?: string;
}

interface CatalogSeed {
  _meta: {
    generatedAt: string;
    pipelineVersion: string;
    totalProducts: number;
    categories: string[];
    categoryHierarchies: string[][];
    languages: string[];
    source?: string;
  };
  products: CatalogProduct[];
}

// ─── Valid Language enum values ──────────────────────────────────────────────

const VALID_LANGUAGES = new Set(["URDU", "ARABIC", "ENGLISH", "PUNJABI", "SPANISH"]);

function safeLanguage(raw: string): "URDU" | "ARABIC" | "ENGLISH" | "PUNJABI" | "SPANISH" {
  const upper = raw.toUpperCase().trim();
  return VALID_LANGUAGES.has(upper) ? (upper as any) : "URDU";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveCatalogPath(): string {
  const projectRoot = path.resolve(__dirname, "..");
  const rawPath = path.join(projectRoot, "catalog-raw.json");
  const seedPath = path.join(projectRoot, "catalog-seed.json");
  if (fs.existsSync(rawPath)) {
    console.log(`  Using catalog: catalog-raw.json (fresh scrape)`);
    return rawPath;
  }
  console.log(`  Using catalog: catalog-seed.json (legacy)`);
  return seedPath;
}

// ─── Retry Helper (exponential backoff) ───────────────────────────────────────

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
        err?.message?.includes("fetching a new connection") ||
        err?.code === "P2024" ||
        err?.code === "P1001" ||
        err?.code === "P1008";

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`    ⏳ ${label} — retry ${attempt}/${maxRetries} in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`${label}: max retries exceeded`);
}

// ─── Sleep helper ─────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Slug helper ─────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `cat-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Seed Metrics ─────────────────────────────────────────────────────────────

interface SeedMetrics {
  categoriesCreated: number;
  categoriesSkipped: number;
  authorsCreated: number;
  authorsSkipped: number;
  productsCreated: number;
  productsUpdated: number;
  imagesCreated: number;
  imagesSkipped: number;
  errors: number;
}

const m: SeedMetrics = {
  categoriesCreated: 0,
  categoriesSkipped: 0,
  authorsCreated: 0,
  authorsSkipped: 0,
  productsCreated: 0,
  productsUpdated: 0,
  imagesCreated: 0,
  imagesSkipped: 0,
  errors: 0,
};

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  console.log("");
  console.log("=".repeat(60));
  console.log("  Bab-ul-Fatah — Database Seeder v3.0 (Connection-Safe)");
  console.log("=".repeat(60));
  console.log("");

  // ════════════════════════════════════════════════════════════════
  //  PRISMA CLIENT — Connection Pool: 3 connections, 30s timeout
  // ════════════════════════════════════════════════════════════════

  // NOTE: If you get pool timeout errors, add this to your .env DATABASE_URL:
  //   ?connection_limit=3&pool_timeout=30&connect_timeout=15
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
    // Explicit connect
    console.log("  Connecting to database...");
    await withRetry(() => prisma.$connect(), "Connect");
    console.log("  Connected!\n");

    // ════════════════════════════════════════════════════════════════
    //  PHASE 0: ADMIN USER
    // ════════════════════════════════════════════════════════════════
    console.log("-- Phase 0: Admin User --");

    const adminEmail = "admin@babulfatah.com";
    const admin = await withRetry(() =>
      prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
          email: adminEmail,
          password: bcrypt.hashSync("admin123", 10),
          role: "ADMIN",
        },
      }),
      "Admin upsert"
    );

    console.log(admin.createdAt === admin.updatedAt ? "  Created admin user" : "  Admin user exists");
    console.log("");

    // ════════════════════════════════════════════════════════════════
    //  PHASE 1: LOAD CATALOG
    // ════════════════════════════════════════════════════════════════
    console.log("-- Phase 1: Loading Catalog --");

    const catalogPath = resolveCatalogPath();
    if (!fs.existsSync(catalogPath)) {
      console.error(`  ERROR: Catalog not found at ${catalogPath}`);
      console.error("  Run: node scripts/scrape-darussalam.js");
      process.exit(1);
    }

    const catalog: CatalogSeed = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
    const { products } = catalog;
    const totalProducts = products.length;

    console.log(`  Products: ${totalProducts}`);
    console.log(`  Version: ${catalog._meta.pipelineVersion}`);
    console.log(`  Categories: ${catalog._meta.categories.length}`);
    console.log(`  Languages: ${catalog._meta.languages.join(", ")}`);
    console.log("");

    // ════════════════════════════════════════════════════════════════
    //  PHASE 2: CATEGORIES & AUTHORS
    // ════════════════════════════════════════════════════════════════
    console.log("-- Phase 2: Upserting Categories & Authors --");

    const categoryIdCache: Map<string, string> = new Map();
    const authorIdCache: Map<string, string> = new Map();
    const uniqueAuthors = new Set<string>();
    const allBreadcrumbs: string[][] = [];

    for (const p of products) {
      if (p.categoryBreadcrumbs?.length) allBreadcrumbs.push(p.categoryBreadcrumbs);
      if (p.authorName) uniqueAuthors.add(p.authorName);
    }

    const uniqueHierarchies = [...new Set(allBreadcrumbs.map((h) => JSON.stringify(h)))].map((h) =>
      JSON.parse(h)
    );

    console.log(`  Unique hierarchies: ${uniqueHierarchies.length}`);
    console.log(`  Unique authors: ${uniqueAuthors.size}`);
    console.log("");

    // ── Upsert category hierarchy ──
    async function upsertCategoryChain(
      breadcrumbs: string[],
      parentId: string | null,
      depth: number
    ): Promise<string> {
      if (depth >= breadcrumbs.length) return parentId!;

      const categoryName = breadcrumbs[depth];
      const categorySlug = slugify(categoryName);
      const cacheKey = `${categorySlug}|${parentId || "root"}`;

      if (categoryIdCache.has(cacheKey)) {
        return upsertCategoryChain(breadcrumbs, categoryIdCache.get(cacheKey)!, depth + 1);
      }

      const displayName = categoryName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      let category;

      if (parentId === null) {
        category = await withRetry(async () => {
          const existing = await prisma.category.findFirst({
            where: { slug: categorySlug, parentId: null },
          });
          if (existing) {
            m.categoriesSkipped++;
            return await prisma.category.update({ where: { id: existing.id }, data: { name: displayName } });
          }
          m.categoriesCreated++;
          return await prisma.category.create({
            data: { name: displayName, slug: categorySlug, parentId: null },
          });
        }, `Category ${displayName}`);
      } else {
        category = await withRetry(async () => {
          const existing = await prisma.category.findUnique({
            where: { slug_parentId: { slug: categorySlug, parentId } },
          });
          if (existing) {
            m.categoriesSkipped++;
            return await prisma.category.update({ where: { id: existing.id }, data: { name: displayName } });
          }
          m.categoriesCreated++;
          return await prisma.category.create({
            data: { name: displayName, slug: categorySlug, parentId },
          });
        }, `Category ${displayName}`);
      }

      categoryIdCache.set(cacheKey, category.id);
      return upsertCategoryChain(breadcrumbs, category.id, depth + 1);
    }

    for (const breadcrumbs of uniqueHierarchies) {
      const deepestId = await upsertCategoryChain(breadcrumbs, null, 0);
      const pathKey = breadcrumbs.map((b) => slugify(b)).join("/");
      categoryIdCache.set(pathKey, deepestId);
      // Small delay between hierarchy chains
      await sleep(200);
    }

    console.log(`  Categories: ${m.categoriesCreated} created, ${m.categoriesSkipped} existing`);
    console.log("");

    // ── Upsert Authors (batch of 10 at a time) ──
    const authorList = [...uniqueAuthors];
    for (let i = 0; i < authorList.length; i += 10) {
      const batch = authorList.slice(i, i + 10);
      for (const name of batch) {
        await withRetry(async () => {
          const existing = await prisma.author.findFirst({ where: { name } });
          if (existing) {
            m.authorsSkipped++;
            authorIdCache.set(name, existing.id);
          } else {
            const created = await prisma.author.create({ data: { name } });
            m.authorsCreated++;
            authorIdCache.set(name, created.id);
          }
        }, `Author ${name.slice(0, 30)}`);
      }
      console.log(`  Authors: batch ${Math.floor(i / 10) + 1}/${Math.ceil(authorList.length / 10)}`);
      await sleep(500);
    }

    console.log(`  Authors: ${m.authorsCreated} created, ${m.authorsSkipped} existing`);
    console.log("");

    // ════════════════════════════════════════════════════════════════
    //  PHASE 3: PRODUCTS & IMAGES (connection-safe batches)
    // ════════════════════════════════════════════════════════════════
    console.log("-- Phase 3: Injecting Products & Images --");
    console.log("");

    // Pre-fetch existing slugs (in one query)
    const existingSlugs = new Set(
      (await withRetry(
        () => prisma.product.findMany({ select: { slug: true, id: true } }),
        "Fetch existing slugs"
      )).map((p) => p.slug)
    );

    // Also pre-fetch existing image URLs per product to avoid individual checks
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches

    for (let i = 0; i < totalProducts; i += BATCH_SIZE) {
      const batchProducts = products.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(totalProducts / BATCH_SIZE);

      console.log(
        `  Batch ${batchNum}/${totalBatches} [${i + 1}-${Math.min(i + BATCH_SIZE, totalProducts)}/${totalProducts}]`
      );

      for (const product of batchProducts) {
        const progress = `[${String(i + batchProducts.indexOf(product) + 1).padStart(4, "0")}/${totalProducts}]`;

        try {
          // Resolve foreign keys
          const breadcrumbSlugPath = product.categoryBreadcrumbs.map(slugify).join("/");
          const categoryId = categoryIdCache.get(breadcrumbSlugPath);
          if (!categoryId) {
            console.log(`    SKIP "${product.title.slice(0, 40)}" — category not resolved`);
            m.errors++;
            continue;
          }

          const authorId = product.authorName ? authorIdCache.get(product.authorName) ?? null : null;
          const language = safeLanguage(product.language);
          const productExists = existingSlugs.has(product.slug);

          // Upsert product
          const upserted = await withRetry(() =>
            prisma.product.upsert({
              where: { slug: product.slug },
              update: {
                title: product.title,
                description: product.description,
                price: product.price,
                stock: product.stock,
                language,
                categoryId,
                authorId,
              },
              create: {
                title: product.title,
                slug: product.slug,
                description: product.description,
                price: product.price,
                stock: product.stock,
                language,
                categoryId,
                authorId,
              },
            }),
            `Product ${product.title.slice(0, 30)}`
          );

          if (!productExists) {
            existingSlugs.add(product.slug);
            m.productsCreated++;
          } else {
            m.productsUpdated++;
          }

          // ── Multi-Image Injection ──
          const allImageUrls: string[] = [];
          if (product.images?.length) {
            for (const imgUrl of product.images) {
              if (imgUrl?.startsWith("http")) allImageUrls.push(imgUrl);
            }
          } else if (product.imageUrl?.startsWith("http")) {
            allImageUrls.push(product.imageUrl);
          }

          const uniqueUrls = [...new Set(allImageUrls)];

          if (uniqueUrls.length > 0) {
            // Get existing image URLs for this product
            const existingImages = await withRetry(
              () => prisma.image.findMany({ where: { productId: upserted.id }, select: { url: true } }),
              `Fetch images for ${product.slug.slice(0, 20)}`
            );

            const existingUrls = new Set(existingImages.map((img) => img.url));
            const newUrls = uniqueUrls.filter((url) => !existingUrls.has(url));

            if (newUrls.length > 0) {
              await withRetry(
                () =>
                  prisma.image.createMany({
                    data: newUrls.map((url, idx) => ({
                      url,
                      altText: product.title,
                      productId: upserted.id,
                      order: existingUrls.size + idx,
                    })),
                  }),
                `Images for ${product.slug.slice(0, 20)}`
              );
              m.imagesCreated += newUrls.length;
            }
            m.imagesSkipped += uniqueUrls.length - newUrls.length;
          }

          const action = productExists ? "Updated" : "Created";
          console.log(`    ${action} "${product.title.slice(0, 50)}" +${uniqueUrls.length} imgs`);
        } catch (err: any) {
          m.errors++;
          if (m.errors <= 20) {
            console.log(
              `    ERROR on "${product.title.slice(0, 40)}": ${err?.message?.slice(0, 80)}`
            );
          }
        }

        // Small delay between each product to release connections
        await sleep(300);
      }

      // Longer delay between batches
      if (i + BATCH_SIZE < totalProducts) {
        console.log(`    Waiting ${DELAY_BETWEEN_BATCHES / 1000}s for connection pool recovery...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  SUMMARY
    // ════════════════════════════════════════════════════════════════
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("");
    console.log("=".repeat(60));
    console.log("  SEED COMPLETE");
    console.log("=".repeat(60));
    console.log(`  Categories created  : ${m.categoriesCreated}`);
    console.log(`  Categories skipped  : ${m.categoriesSkipped}`);
    console.log(`  Authors created     : ${m.authorsCreated}`);
    console.log(`  Authors skipped     : ${m.authorsSkipped}`);
    console.log(`  Products created    : ${m.productsCreated}`);
    console.log(`  Products updated    : ${m.productsUpdated}`);
    console.log(`  Images linked       : ${m.imagesCreated}`);
    console.log(`  Images skipped      : ${m.imagesSkipped}`);
    if (m.errors > 0) console.log(`  Errors              : ${m.errors}`);
    console.log(`  Total products      : ${m.productsCreated + m.productsUpdated}`);
    console.log(`  Elapsed             : ${elapsed}s`);
    console.log("=".repeat(60));
    console.log("");

    if (m.errors > 0) {
      console.log(`  Completed with ${m.errors} error(s). Re-run seed to fill gaps.`);
    } else {
      console.log("  All data injected successfully!");
    }
  } finally {
    await prisma.$disconnect();
    console.log("  Disconnected from database.");
  }
}

// ─── Execute ──────────────────────────────────────────────────────────────────

main().catch((e) => {
  console.error("");
  console.error("=".repeat(60));
  console.error("  SEED FAILED — Unhandled Exception");
  console.error("=".repeat(60));
  console.error(e);
  process.exit(1);
});
