const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = `Part two of the English Islamic education series with detailed Salah guidance, expanded Seerah, and essential basic Fiqh rulings.`;
  console.log("Length:", m.length);
  await prisma.product.update({
    where: { id: "a68d3ff1-4031-4f10-a257-0d1cd37cb7c4" },
    data: { metaDescription: m }
  });
  console.log("Done");
}

main().then(() => prisma.$disconnect());
