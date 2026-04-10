// Stock Update Script — Updates product stock status from scraped data
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Stock Update Script ===\n');

  // 1. Load babussalam.pk stock data
  const babussalamData = JSON.parse(fs.readFileSync('/tmp/babussalam_clean.json', 'utf-8'));
  console.log(`Babussalam.pk Goodword products loaded: ${babussalamData.length}`);

  // 2. Load darussalam.pk stock data
  const darussalamData = JSON.parse(fs.readFileSync('/tmp/darussalam_products_final.json', 'utf-8'));
  console.log(`Darussalam.pk products loaded: ${darussalamData.length}`);

  // 3. Get all our products
  const ourProducts = await prisma.product.findMany({
    include: { images: { take: 1, orderBy: { id: 'asc' } } },
  });
  console.log(`Our products: ${ourProducts.length}\n`);

  let updated = 0;
  let notFound = 0;
  let babussalamMatched = 0;
  let darussalamMatched = 0;
  let babussalamOOS = 0;
  let darussalamOOS = 0;

  // Helper: normalize title for matching
  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 4. Update babussalam.pk products (match by slug)
  for (const product of ourProducts) {
    const imgUrl = product.images[0]?.url || '';
    if (!imgUrl.includes('babussalam')) continue;

    // Try to match by slug
    const bsMatch = babussalamData.find(bs => {
      return product.slug.includes(bs.slug) || bs.slug.includes(product.slug.replace(/^goodword-/, ''));
    });

    if (bsMatch) {
      babussalamMatched++;
      const newStock = bsMatch.inStock ? 15 : 0;
      if (product.stock !== newStock) {
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });
        if (newStock === 0) babussalamOOS++;
        updated++;
      }
    } else {
      // Try fuzzy title match with babussalam slugs
      const normTitle = normalize(product.title);
      const bsSlugMatch = babussalamData.find(bs => {
        const normSlug = normalize(bs.slug.replace(/-/g, ' '));
        return normTitle.includes(normSlug) || normSlug.includes(normTitle.split(' ').slice(0, 3).join(' '));
      });
      if (bsSlugMatch) {
        babussalamMatched++;
        const newStock = bsSlugMatch.inStock ? 15 : 0;
        if (product.stock !== newStock) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: newStock },
          });
          if (newStock === 0) babussalamOOS++;
          updated++;
        }
      }
    }
  }

  // 5. Update darussalam.pk products (match by title)
  for (const product of ourProducts) {
    const imgUrl = product.images[0]?.url || '';
    // Only process darussalam products (both cdn.shopify.com with darussalam origin and direct darussalam URLs)
    if (!imgUrl.includes('darussalam') && !imgUrl.includes('cdn.shopify.com/s/files/1/0620')) continue;
    // Skip babussalam products
    if (imgUrl.includes('babussalam')) continue;

    const normTitle = normalize(product.title);

    // Find matching darussalam product by title similarity
    const dsMatch = darussalamData.find(ds => {
      const dsNorm = normalize(ds.title);
      // Exact match
      if (dsNorm === normTitle) return true;
      // Check if one contains the other (handles subtitle differences)
      if (dsNorm.length > 15 && normTitle.length > 15) {
        const shorter = dsNorm.length < normTitle.length ? dsNorm : normTitle;
        const longer = dsNorm.length < normTitle.length ? normTitle : dsNorm;
        // If the shorter string is mostly contained in the longer one
        if (longer.includes(shorter.substring(0, Math.floor(shorter.length * 0.7)))) return true;
      }
      return false;
    });

    if (dsMatch) {
      darussalamMatched++;
      const newStock = dsMatch.inStock ? 15 : 0;
      if (product.stock !== newStock) {
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });
        if (newStock === 0) darussalamOOS++;
        updated++;
      }
    } else {
      notFound++;
    }
  }

  // 6. Summary
  console.log('\n=== UPDATE SUMMARY ===');
  console.log(`Babussalam.pk matched: ${babussalamMatched}/57`);
  console.log(`Babussalam.pk marked out-of-stock: ${babussalamOOS}`);
  console.log(`Darussalam.pk matched: ${darussalamMatched}`);
  console.log(`Darussalam.pk marked out-of-stock: ${darussalamOOS}`);
  console.log(`Total products updated: ${updated}`);
  console.log(`Products not matched: ${notFound}`);

  // 7. Final counts
  const finalInStock = await prisma.product.count({ where: { stock: { gt: 0 } } });
  const finalOutOfStock = await prisma.product.count({ where: { stock: { lte: 0 } } });
  console.log(`\n=== FINAL STOCK STATUS ===`);
  console.log(`In Stock: ${finalInStock}`);
  console.log(`Out of Stock: ${finalOutOfStock}`);
  console.log(`Total: ${finalInStock + finalOutOfStock}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
