/**
 * Fix Image Ordering Script v3 - Final
 *
 * Fixes edge cases:
 * - "title" in filename = cover (highest priority)
 * - "back" in filename = NOT cover (push to end)
 * - "inner" in filename = interior page (push to end)
 * - "back-cover" should NOT match "cover" pattern
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split('/').pop() || '');
  } catch {
    return url.split('/').pop()?.split('?')[0] || '';
  }
}

function analyzeImageOrder(url: string): { score: number; seqNum: number | null } {
  const filename = extractFilename(url).toLowerCase();
  const originalFilename = extractFilename(url);

  // NEGATIVE patterns: definitely NOT the cover
  if (/\b(back)\b/.test(filename) && !/\b(back-cover|backcover)\b/i.test(filename) || /\bback[-_]?cover\b/i.test(filename)) {
    return { score: 800, seqNum: null }; // back cover - push near end
  }
  if (/\b(inner|interior|page|sample|content)\b/.test(filename)) {
    return { score: 700, seqNum: null }; // interior pages - push to end
  }
  if (/\b(spine|side)\b/.test(filename)) {
    return { score: 600, seqNum: null }; // spine/side images
  }

  // POSITIVE patterns: definitely the cover
  if (/\b(title)\b/.test(filename)) {
    return { score: -2, seqNum: 0 }; // title image = cover (very high priority)
  }
  if (/\b(main|cover|front)\b/.test(filename) && !/\bback\b/.test(filename)) {
    return { score: -1, seqNum: 0 }; // main/cover/front (but NOT back-cover)
  }

  // Pattern 1: darussalam-DATE_PRODUCT_NAME_N.ext
  if (filename.startsWith('darussalam')) {
    const match = originalFilename.match(/[_-](\d+)(?:-min)?\.\w+$/);
    if (match) {
      const num = parseInt(match[1]);
      return { score: num, seqNum: num };
    }
    // darussalam images without a number at end - likely the main product shot
    return { score: 0, seqNum: 1 };
  }

  // Pattern 2: NN_NAME.ext at start (e.g., 01_e9491967...jpg, 1_sywi-7f.png)
  const startNumMatch = originalFilename.match(/^(\d{1,2})_(.+)\.\w+$/);
  if (startNumMatch) {
    const num = parseInt(startNumMatch[1]);
    return { score: num, seqNum: num };
  }

  // Pattern 2b: NN-NAME.ext at start (e.g., 01-60-Sunahri-Ahadith-front.png)
  const startDashNumMatch = originalFilename.match(/^(\d{1,2})-(.+)\.\w+$/);
  if (startDashNumMatch) {
    const num = parseInt(startDashNumMatch[1]);
    return { score: num, seqNum: num };
  }

  // Pattern 3: NAME-scaled.ext (cover/main size)
  const scaledMatch = filename.match(/^(.+?)-scaled\.\w+$/);
  if (scaledMatch) {
    return { score: 0, seqNum: 1 };
  }

  // Pattern 3b: NAME-scaled-N.ext
  const scaledNumMatch = filename.match(/^(.+?)-scaled-(\d+)\.\w+$/);
  if (scaledNumMatch) {
    const num = parseInt(scaledNumMatch[2]);
    return { score: num + 1, seqNum: num + 1 };
  }

  // Pattern 4: Letter-suffix variants: 869a.jpg, 869b.jpg etc.
  const letterVariantMatch = filename.match(/^(.+?)([a-z])-(\d+x\d+)?\.\w+$/);
  if (letterVariantMatch) {
    const letter = letterVariantMatch[2];
    return { score: 10 + letter.charCodeAt(0) - 97, seqNum: null };
  }

  // Pattern 5: NAME_N.ext at end (handles -min variants)
  const endNumMatch = originalFilename.match(/[_-](\d+)(?:-min)?\.\w+$/);
  if (endNumMatch) {
    const num = parseInt(endNumMatch[1]);
    if (num >= 1 && num <= 50) {
      return { score: num, seqNum: num };
    }
  }

  // Pattern 6: N.ext at very end
  const tailNumMatch = originalFilename.match(/(\d+)\.\w+$/);
  if (tailNumMatch) {
    const num = parseInt(tailNumMatch[1]);
    const beforeNum = originalFilename.substring(0, originalFilename.lastIndexOf(num.toString()));
    if (num >= 1 && num <= 20 && /[a-zA-Z]/.test(beforeNum)) {
      return { score: num, seqNum: num };
    }
  }

  // Pattern 7: Shopify UUID-based filenames -> interior images
  const hashMatch = filename.match(/[0-9a-f]{8}-[0-9a-f]{4}-/);
  if (hashMatch) {
    return { score: 500, seqNum: null };
  }

  // Pattern 8: thumbnail variants
  if (/-min\.|_min\.|-thumb\.|_thumb\./.test(filename)) {
    return { score: 50, seqNum: null };
  }

  // Fallback
  return { score: 999, seqNum: null };
}

function computeImageOrder(images: { id: string; url: string }[]): Map<string, number> {
  const result = new Map<string, number>();
  if (images.length === 0) return result;
  if (images.length === 1) {
    result.set(images[0].id, 0);
    return result;
  }

  const analyzed = images.map(img => {
    const { score, seqNum } = analyzeImageOrder(img.url);
    return { ...img, score, seqNum };
  });

  const withSeqNum = analyzed.filter(a => a.seqNum !== null && a.seqNum > 0);

  if (withSeqNum.length >= 1) {
    const sorted = [...analyzed].sort((a, b) => {
      if (a.score === -2 && b.score !== -2) return -1; // "title" always first
      if (b.score === -2 && a.score !== -2) return 1;
      if (a.score === -1 && b.score !== -1 && b.score !== -2) return -1; // "main/cover/front"
      if (b.score === -1 && a.score !== -1 && a.score !== -2) return 1;
      if (a.seqNum !== null && b.seqNum !== null) return a.seqNum - b.seqNum;
      if (a.seqNum !== null) return -1;
      if (b.seqNum !== null) return 1;
      return a.score - b.score;
    });
    sorted.forEach((img, index) => result.set(img.id, index));
  } else {
    const sorted = [...analyzed].sort((a, b) => a.score - b.score);
    sorted.forEach((img, index) => result.set(img.id, index));
  }

  return result;
}

async function main() {
  console.log('[INFO] v3 - Fixing image ordering with improved heuristics...');

  const products = await prisma.product.findMany({
    where: { images: { some: {} } },
    select: {
      id: true,
      title: true,
      slug: true,
      images: { select: { id: true, url: true } },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`[INFO] Found ${products.length} products with images\n`);

  let totalProducts = 0;
  let totalImages = 0;
  let coverChanges = 0;
  let errors = 0;
  const changes: string[] = [];

  for (const product of products) {
    try {
      const orderMap = computeImageOrder(product.images);

      // What's currently first (by order field)?
      const sortedByCurrentOrder = [...product.images].sort((a, b) => {
        const aOrder = orderMap.get(a.id) ?? 999;
        const bOrder = orderMap.get(b.id) ?? 999;
        return aOrder - bOrder;
      });

      // Get the ID of what SHOULD be first
      const newFirstId = sortedByCurrentOrder[0]?.id;

      // Check what WAS first (order = 0 or first in array)
      const oldFirst = product.images.find(img => {
        // Find the image that currently has order 0 or appears first
        return true; // We'll compare by checking if new first differs from DB first
      });
      
      // Actually, let's check the DB for current order
      const currentOrders = await prisma.image.findMany({
        where: { productId: product.id },
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      });
      
      const currentFirstId = currentOrders[0]?.id;
      const isNewFirstDifferent = currentFirstId !== newFirstId;

      if (isNewFirstDifferent) {
        coverChanges++;
        if (coverChanges <= 30) {
          const oldFilename = extractFilename(product.images.find(i => i.id === currentFirstId)?.url || '');
          const newFilename = extractFilename(product.images.find(i => i.id === newFirstId)?.url || '');
          const change = `[${coverChanges}] ${product.title}\n  Was: ${oldFilename.substring(0, 80)}\n  Now: ${newFilename.substring(0, 80)}`;
          changes.push(change);
        }
      }

      // Update all images
      for (const [imageId, order] of orderMap) {
        await prisma.image.update({
          where: { id: imageId },
          data: { order },
        });
      }

      totalProducts++;
      totalImages += product.images.length;
    } catch (err: any) {
      errors++;
      console.log(`[ERROR] ${product.title}: ${err.message}`);
    }
  }

  console.log('=== COVER CHANGES ===');
  for (const c of changes) {
    console.log(c);
    console.log('');
  }

  console.log('\n========================================');
  console.log('[RESULTS]');
  console.log('========================================');
  console.log(`Total products: ${totalProducts}`);
  console.log(`Total images updated: ${totalImages}`);
  console.log(`Cover changes from v2: ${coverChanges}`);
  console.log(`Errors: ${errors}`);

  // Final verification
  console.log('\n=== VERIFICATION ===');
  const verifyProducts = await prisma.product.findMany({
    where: { images: { some: {} } },
    include: { images: { orderBy: { order: 'asc' } } },
    orderBy: { id: 'asc' },
  });

  // Spot check known problematic products
  const problemSlugs = [
    'zalim-bhai-qissa-syedna-yusuf-silsila-qasas-ul-anbiya-11-30',
    'holnak-toofan-qissa-syedna-nooh-silsila-qasas-ul-anbiya-3-30',
    'the-little-learner-my-first-book-of-islamic-knowledge',
    'sunehri-duain-local',
    'islam-ki-sachayi-aur-science-k-aitrafaat',
  ];

  for (const slug of problemSlugs) {
    const p = verifyProducts.find(v => v.slug === slug);
    if (!p || p.images.length < 2) continue;
    console.log(`\n[CHECK] ${p.title}`);
    for (const img of p.images) {
      const fn = extractFilename(img.url);
      console.log(`  [${img.order}] ${fn.substring(0, 90)}`);
    }
  }

  // Also show some general products
  let shown = 0;
  for (const p of verifyProducts) {
    if (p.images.length < 2 || shown >= 5) continue;
    if (!problemSlugs.includes(p.slug)) {
      console.log(`\n[OK] ${p.title}`);
      for (const img of p.images.slice(0, 3)) {
        const fn = extractFilename(img.url);
        console.log(`  [${img.order}] ${fn.substring(0, 90)}`);
      }
      if (p.images.length > 3) console.log(`  ... +${p.images.length - 3} more`);
      shown++;
    }
  }

  // Sanity checks
  const wrongFirst = verifyProducts.filter(p => p.images.length > 0 && p.images[0].order !== 0);
  console.log(`\n[CHECK] Products where first image order != 0: ${wrongFirst.length}`);

  let dupOrders = 0;
  for (const p of verifyProducts) {
    if (p.images.length < 2) continue;
    const orders = p.images.map(i => i.order);
    if (new Set(orders).size < orders.length) dupOrders++;
  }
  console.log(`[CHECK] Products with duplicate orders: ${dupOrders}`);

  // Check for "inner" or "back" images appearing as first
  const badFirst = verifyProducts.filter(p => {
    if (p.images.length < 2) return false;
    const fn = extractFilename(p.images[0].url).toLowerCase();
    return /\b(inner|back|interior|sample|page)\b/.test(fn);
  });
  console.log(`[CHECK] Products with inner/back as first image: ${badFirst.length}`);
  if (badFirst.length > 0 && badFirst.length <= 20) {
    for (const p of badFirst) {
      const fn = extractFilename(p.images[0].url);
      console.log(`  WARN: ${p.title} -> ${fn.substring(0, 80)}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
