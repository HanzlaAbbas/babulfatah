const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fixes = [
    {
      slug: 'al-quran-al-kareem-208-b',
      promoPhrase: 'competitive pricing',
      // "...consistent quality and competitive pricing." → "...consistent quality."
      replace: (desc) => desc.replace(' and competitive pricing', ''),
    },
    {
      slug: 'better-muslim-pack',
      promoPhrase: 'bab-ul-fatah',
      // "...editorial team at Bab-ul-Fatah based on..." → "...editorial team based on..."
      replace: (desc) => desc.replace(/at Bab-ul-Fatah /g, ''),
    },
    {
      slug: 'fatawa-islamiya-3-vols',
      promoPhrase: 'priced at',
      // "Priced at Rs.6,600 for the complete three-volume set, this collection is..."
      // → "This collection is..."
      replace: (desc) => desc.replace('Priced at Rs.6,600 for the complete three-volume set, ', 'This '),
    },
    {
      slug: 'fatawa-islamiyah-islamic-verdicts-8-volumes',
      promoPhrase: 'priced at',
      // "Priced at Rs.25,500, this eight-volume set is..."
      // → "This eight-volume set is..."
      replace: (desc) => desc.replace('Priced at Rs.25,500, ', 'This '),
    },
  ];

  for (const fix of fixes) {
    const product = await prisma.product.findUnique({
      where: { slug: fix.slug },
      select: { id: true, slug: true, description: true },
    });

    if (!product) {
      console.error(`❌ Product not found: ${fix.slug}`);
      continue;
    }

    const originalDesc = product.description;

    // Check promo phrase exists (case-insensitive)
    if (!originalDesc.toLowerCase().includes(fix.promoPhrase.toLowerCase())) {
      console.error(`❌ Promo phrase "${fix.promoPhrase}" NOT found in: ${fix.slug}`);
      continue;
    }

    // Apply the fix
    const newDesc = fix.replace(originalDesc);

    // Verify the promo phrase is gone
    if (newDesc.toLowerCase().includes(fix.promoPhrase.toLowerCase())) {
      console.error(`❌ Promo phrase "${fix.promoPhrase}" still present after fix in: ${fix.slug}`);
      continue;
    }

    // Verify word count is still 250+
    const wordCount = newDesc.trim().split(/\s+/).length;
    if (wordCount < 250) {
      console.error(`❌ Description too short after fix (${wordCount} words) for: ${fix.slug}`);
      continue;
    }

    // Update the database
    await prisma.product.update({
      where: { slug: fix.slug },
      data: { description: newDesc },
    });

    console.log(`✅ Fixed: ${fix.slug}`);
    console.log(`   Removed promo phrase: "${fix.promoPhrase}"`);
    console.log(`   Word count: ${originalDesc.trim().split(/\s+/).length} → ${wordCount}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
