const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixes = [
  { id: "2871d974-b8a8-4e70-b7ab-5884704e59bc", slug: "islam-kia-hai", m: `A clear, jargon-free Urdu introduction to Islam answering fundamental questions about beliefs, pillars, values, and daily life.` },
  { id: "8c4ebb2a-5aca-45a4-939d-7f356db1e2a7", slug: "islami-taaleemi-series-2", m: `The second Urdu Islamic education book expanding on prayer details, Sahabah stories, Islamic history, and moral character values.` },
  { id: "a68d3ff1-4031-4f10-a257-0d1cd37cb7c4", slug: "islamic-education-series-part-2", m: `Part two of the English Islamic education series with detailed Salah guidance, expanded Seerah, and basic Fiqh rulings.` }
];

async function main() {
  for (const item of fixes) {
    try {
      await prisma.product.update({
        where: { id: item.id },
        data: { metaDescription: item.m }
      });
      console.log(`✅ [${item.m.length} chars] ${item.slug}`);
    } catch (err) {
      console.error(`❌ ${item.slug}: ${err.message}`);
    }
  }
}

main().then(() => prisma.$disconnect());
