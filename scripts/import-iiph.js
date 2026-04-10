/**
 * Import IIPH products from scraped JSON into the database
 * Creates IIPH category under "Imported Books" or as a top-level category
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

function slugify(text) {
  return 'iiph-' + text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

async function main() {
  // Load scraped data
  const dataPath = path.join(__dirname, '..', 'download', 'iiph_products.json');
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📦 Loaded ${products.length} IIPH products from JSON`);

  // Find or create "Imported Books" parent category
  let importedBooks = await prisma.category.findFirst({
    where: { name: 'Imported Books' },
  });

  if (!importedBooks) {
    importedBooks = await prisma.category.create({
      data: {
        name: 'Imported Books',
        slug: 'imported-books',
      },
    });
    console.log(`✅ Created "Imported Books" category: ${importedBooks.id}`);
  } else {
    console.log(`📍 Found "Imported Books" category: ${importedBooks.id}`);
  }

  // Find or create "IIPH" category under Imported Books
  let iiphCategory = await prisma.category.findFirst({
    where: {
      name: 'IIPH',
      parentId: importedBooks.id,
    },
  });

  if (!iiphCategory) {
    iiphCategory = await prisma.category.create({
      data: {
        name: 'IIPH',
        slug: 'iiph',
        parentId: importedBooks.id,
      },
    });
    console.log(`✅ Created "IIPH" category: ${iiphCategory.id}`);
  } else {
    console.log(`📍 Found "IIPH" category: ${iiphCategory.id}`);
  }

  // Import products
  let created = 0;
  let skipped = 0;
  let errors = [];

  for (const product of products) {
    try {
      const slug = slugify(product.title);

      // Check if product already exists by slug
      const existing = await prisma.product.findUnique({
        where: { slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create the product
      await prisma.product.create({
        data: {
          title: product.title,
          slug: slug,
          description: `Imported Islamic book by IIPH (International Islamic Publishing House). ${product.title} is a high-quality publication covering authentic Islamic knowledge. Originally sourced from zamzampublishers.com.pk.`,
          price: product.price || 0,
          stock: product.inStock ? 15 : 0,
          language: 'ENGLISH',
          categoryId: iiphCategory.id,
          sku: `BF-IIPH-${String(created + 1).padStart(4, '0')}`,
          images: product.image ? {
            create: {
              url: product.image,
              altText: product.title,
            },
          } : undefined,
        },
      });

      created++;
    } catch (err) {
      errors.push({ title: product.title, error: err.message });
    }
  }

  console.log(`\n📊 Import Results:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️ Errors:');
    errors.slice(0, 5).forEach(e => console.log(`  - ${e.title}: ${e.error}`));
  }

  // Final stats
  const totalIIPH = await prisma.product.count({
    where: { categoryId: iiphCategory.id },
  });
  const iiphInStock = await prisma.product.count({
    where: { categoryId: iiphCategory.id, stock: { gt: 0 } },
  });

  console.log(`\n📋 IIPH Category Stats:`);
  console.log(`  Total IIPH products: ${totalIIPH}`);
  console.log(`  In Stock: ${iiphInStock}`);
  console.log(`  Out of Stock: ${totalIIPH - iiphInStock}`);

  // Verify slug for navbar link
  console.log(`\n🔗 Category slug for navbar: "iiph" (under "imported-books")`);
  console.log(`   Shop URL: /shop?category=iiph`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
