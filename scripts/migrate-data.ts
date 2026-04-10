/**
 * migrate-data.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Migrates ALL data from the local SQLite database (db/custom.db)
 * into the live Neon PostgreSQL database via Prisma Client.
 *
 * Execution order respects foreign-key dependencies:
 *   Phase 1 — Authors, Root Categories, Child Categories, User
 *   Phase 2 — Products
 *   Phase 3 — Images
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/migrate-data.ts
 * ──────────────────────────────────────────────────────────────────────────
 */

import Database from 'better-sqlite3';
import { PrismaClient, Language } from '@prisma/client';

// ── Config ─────────────────────────────────────────────────────────────────
const SQLITE_PATH = './db/custom.db';
const BATCH_SIZE = 500; // chunk size for createMany (avoids payload limits)

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * SQLite stores timestamps as Unix milliseconds (e.g. 1775244608071).
 * PostgreSQL/Prisma expects ISO-8601 strings or Date objects.
 * This function detects the format and converts accordingly.
 */
function normalizeDate(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;

  // Already an ISO string — return as-is
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value;
  }

  // Unix millisecond timestamp (number or numeric string)
  const num = typeof value === 'number' ? value : Number(value);
  if (!isNaN(num) && num > 1e12) {
    return new Date(num).toISOString();
  }

  // Unix second timestamp
  if (!isNaN(num) && num > 1e9 && num < 1e12) {
    return new Date(num * 1000).toISOString();
  }

  // Fallback: try native Date parse
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * SQLite booleans are 0/1 integers. Convert to true/false.
 */
function normalizeBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  return value === 1 || value === '1';
}

/**
 * Splits an array into chunks of `size`.
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Formats a timestamp for console logging.
 */
function elapsedMs(start: number): string {
  return (Date.now() - start).toLocaleString();
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const totalStart = Date.now();

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Bab-ul-Fatah — SQLite → Neon PostgreSQL Migration    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── Connect to SQLite (read-only) ────────────────────────────────────────
  console.log('[1/6] Opening SQLite database:', SQLITE_PATH);
  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  console.log('       ✓ SQLite connected (read-only)\n');

  // ── Connect to Neon via Prisma ───────────────────────────────────────────
  console.log('[2/6] Connecting to Neon PostgreSQL via Prisma...');
  const prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
  await prisma.$connect();
  console.log('       ✓ Neon connected\n');

  // Quick pre-flight check — verify Neon DB is reachable and empty-ish
  const preCheck = await prisma.product.count();
  console.log(`       Neon currently has ${preCheck} products`);
  if (preCheck > 0) {
    console.log('       ⚠  WARNING: Neon DB is not empty. Using skipDuplicates to avoid conflicts.\n');
  } else {
    console.log('       ✓ Neon DB is empty — clean migration\n');
  }

  const stats: Record<string, number> = {};

  // ══════════════════════════════════════════════════════════════════════════
  //  PHASE 1 — AUTHORS (no dependencies)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PHASE 1: Authors, Categories, User (no FK dependencies)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── Authors ──────────────────────────────────────────────────────────────
  const authorStart = Date.now();
  console.log('  [1a] Migrating Authors...');
  const authors = sqlite.prepare('SELECT id, name FROM Author').all() as { id: string; name: string }[];
  console.log(`       Fetched ${authors.length} authors from SQLite`);

  if (authors.length > 0) {
    const authorChunks = chunk(authors, BATCH_SIZE);
    for (let i = 0; i < authorChunks.length; i++) {
      await prisma.author.createMany({
        data: authorChunks[i],
        skipDuplicates: true,
      });
      console.log(`       Batch ${i + 1}/${authorChunks.length}: ${authorChunks[i].length} authors → Neon`);
    }
  }
  stats.authors = authors.length;
  console.log(`       ✓ Authors: ${authors.length} transferred in ${elapsedMs(authorStart)}ms\n`);

  // ── Categories (must insert roots first, then children) ──────────────────
  const catStart = Date.now();
  console.log('  [1b] Migrating Categories (root → child order)...');
  const allCategories = sqlite.prepare('SELECT id, name, slug, parentId FROM Category').all() as {
    id: string; name: string; slug: string; parentId: string | null;
  }[];
  console.log(`       Fetched ${allCategories.length} categories from SQLite`);

  if (allCategories.length > 0) {
    // Insert root categories (parentId = null) first
    const rootCategories = allCategories.filter(c => c.parentId === null);
    const childCategories = allCategories.filter(c => c.parentId !== null);

    if (rootCategories.length > 0) {
      await prisma.category.createMany({
        data: rootCategories,
        skipDuplicates: true,
      });
      console.log(`       Roots: ${rootCategories.length} categories → Neon`);
    }

    // Insert child categories (now their parents exist)
    if (childCategories.length > 0) {
      const childChunks = chunk(childCategories, BATCH_SIZE);
      for (let i = 0; i < childChunks.length; i++) {
        await prisma.category.createMany({
          data: childChunks[i],
          skipDuplicates: true,
        });
        console.log(`       Children batch ${i + 1}/${childChunks.length}: ${childChunks[i].length} → Neon`);
      }
    }
  }
  stats.categories = allCategories.length;
  console.log(`       ✓ Categories: ${allCategories.length} transferred in ${elapsedMs(catStart)}ms\n`);

  // ── User ─────────────────────────────────────────────────────────────────
  const userStart = Date.now();
  console.log('  [1c] Migrating Users...');
  const users = sqlite.prepare('SELECT id, email, password, role, createdAt, updatedAt FROM User').all() as {
    id: string; email: string; password: string; role: string;
    createdAt: unknown; updatedAt: unknown;
  }[];
  console.log(`       Fetched ${users.length} users from SQLite`);

  if (users.length > 0) {
    for (const u of users) {
      await prisma.user.create({
        data: {
          id: u.id,
          email: u.email,
          password: u.password,
          role: u.role as 'ADMIN' | 'CUSTOMER',
          createdAt: normalizeDate(u.createdAt)!,
          updatedAt: normalizeDate(u.updatedAt)!,
        },
      });
    }
    console.log(`       ✓ ${users.length} user(s) transferred`);
  }
  stats.users = users.length;
  console.log(`       ✓ Users: ${users.length} transferred in ${elapsedMs(userStart)}ms\n`);

  // ══════════════════════════════════════════════════════════════════════════
  //  PHASE 2 — PRODUCTS (depends on Author + Category)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PHASE 2: Products (FK: authorId, categoryId)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const productStart = Date.now();
  console.log('  [2]  Migrating Products...');
  const products = sqlite.prepare('SELECT * FROM Product').all() as Record<string, unknown>[];
  console.log(`       Fetched ${products.length} products from SQLite`);

  if (products.length > 0) {
    // Validate enum distribution
    const langCount: Record<string, number> = {};
    for (const p of products) {
      const lang = (p.language as string) || 'URDU';
      langCount[lang] = (langCount[lang] || 0) + 1;
    }
    console.log('       Language distribution:', JSON.stringify(langCount));

    // Transform and insert in batches
    const transformedProducts = products.map(p => ({
      id: p.id as string,
      title: p.title as string,
      slug: p.slug as string,
      description: p.description as string,
      metaDescription: (p.metaDescription as string) || null,
      price: Number(p.price),
      stock: Number(p.stock) || 0,
      weight: p.weight !== null ? Number(p.weight) : null,
      tags: (p.tags as string) || null,
      sku: (p.sku as string) || null,
      authorId: (p.authorId as string) || null,
      language: ((p.language as string) || 'URDU') as Language,
      categoryId: p.categoryId as string,
      createdAt: normalizeDate(p.createdAt)!,
      updatedAt: normalizeDate(p.updatedAt)!,
    }));

    const productChunks = chunk(transformedProducts, BATCH_SIZE);
    for (let i = 0; i < productChunks.length; i++) {
      await prisma.product.createMany({
        data: productChunks[i],
        skipDuplicates: true,
      });
      const cumulative = Math.min((i + 1) * BATCH_SIZE, products.length);
      console.log(`       Batch ${i + 1}/${productChunks.length}: ${productChunks[i].length} products → Neon (total: ${cumulative})`);
    }
  }
  stats.products = products.length;
  console.log(`       ✓ Products: ${products.length} transferred in ${elapsedMs(productStart)}ms\n`);

  // ══════════════════════════════════════════════════════════════════════════
  //  PHASE 3 — IMAGES (depends on Product)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PHASE 3: Images (FK: productId)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━══━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const imageStart = Date.now();
  console.log('  [3]  Migrating Images...');
  const images = sqlite.prepare('SELECT id, url, altText, "order", productId FROM Image').all() as {
    id: string; url: string; altText: string | null; order: number; productId: string;
  }[];
  console.log(`       Fetched ${images.length} images from SQLite`);

  if (images.length > 0) {
    const transformedImages = images.map(img => ({
      id: img.id,
      url: img.url,
      altText: img.altText || null,
      order: Number(img.order) || 0,
      productId: img.productId,
    }));

    // Use larger batch for images (they're simpler rows)
    const imageChunks = chunk(transformedImages, 1000);
    for (let i = 0; i < imageChunks.length; i++) {
      await prisma.image.createMany({
        data: imageChunks[i],
        skipDuplicates: true,
      });
      const cumulative = Math.min((i + 1) * 1000, images.length);
      console.log(`       Batch ${i + 1}/${imageChunks.length}: ${imageChunks[i].length} images → Neon (total: ${cumulative})`);
    }
  }
  stats.images = images.length;
  console.log(`       ✓ Images: ${images.length} transferred in ${elapsedMs(imageStart)}ms\n`);

  // ══════════════════════════════════════════════════════════════════════════
  //  CLEANUP
  // ══════════════════════════════════════════════════════════════════════════
  sqlite.close();
  await prisma.$disconnect();

  // ── Final Summary ────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                  MIGRATION COMPLETE                      ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Authors:    ${String(stats.authors).padStart(5)} records transferred               ║`);
  console.log(`║  Categories: ${String(stats.categories).padStart(5)} records transferred               ║`);
  console.log(`║  Users:      ${String(stats.users).padStart(5)} records transferred               ║`);
  console.log(`║  Products:   ${String(stats.products).padStart(5)} records transferred               ║`);
  console.log(`║  Images:     ${String(stats.images).padStart(5)} records transferred               ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Total time: ${elapsedMs(totalStart).padStart(6)} ms                              ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

main().catch((err) => {
  console.error('\n✖ MIGRATION FAILED:', err);
  process.exit(1);
});
