const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixes = [
  {
    id: "1a7b7ecd-f506-4da9-b6af-4b2e226fa258",
    slug: "interpretation-of-kitab-at-tauhid-the-destination-of-the-seeker-of-truth",
    fix: (desc) => desc.replace(
      "Interpretation of Kitab At-Tauhid — The Destination of the Seeker of Truth",
      "Interpretation of Kitab At-Tauhid The Destination of the Seeker of Truth"
    )
  },
  {
    id: "127a0ad6-ae90-40e7-b5a9-caed97554550",
    slug: "isaayiat-tajziyah-aur-mutaliyah",
    fix: (desc) => desc.replace(
      "Isaayiat — Tajziyah aur Mutaliyah",
      "Isaayiat - Tajziyah aur Mutaliyah"
    )
  },
  {
    id: "dc353d09-86a5-4459-b087-c9b364a54b0a",
    slug: "islam-ke-ahkam-o-aadab-new-edition",
    fix: (desc) => desc.replace(
      "Islam Ke Ahkam-o-Aadab New Edition",
      "Islam Ke Ahkam-o-Aadab (New Edition)"
    )
  },
  {
    id: "fb50f847-61ec-44b0-932f-bf19889f3954",
    slug: "islami-qanoon-e-wirasat",
    fix: (desc) => desc.replace(
      "Islami Qanoon-e-Wirasat",
      "Islami Qanoon -e- Wirasat"
    )
  },
  {
    id: "d71780e7-5e4a-401e-9c56-fec30b88dcf3",
    slug: "islamic-album-galleries-of-the-two-holy-mosques",
    fix: (desc) => desc.replace(
      "Islamic Album — Galleries of the Two Holy Mosques",
      "Islamic Album - Galleries of the Two Holy Mosques"
    )
  },
  {
    id: "c94f6942-dd91-4738-bd4e-4e02913c6310",
    slug: "islamic-etiquettes-for-newborn-child",
    fix: (desc) => desc.replace(
      "dealing with healthcare professionals during delivery",
      "dealing with healthcare professionals during childbirth"
    )
  }
];

async function main() {
  for (const item of fixes) {
    try {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      const newDesc = item.fix(product.description);
      await prisma.product.update({
        where: { id: item.id },
        data: { description: newDesc }
      });
      console.log(`✅ Fixed: ${item.slug}`);
    } catch (err) {
      console.error(`❌ ${item.slug}: ${err.message}`);
    }
  }
}

main().then(() => prisma.$disconnect());
