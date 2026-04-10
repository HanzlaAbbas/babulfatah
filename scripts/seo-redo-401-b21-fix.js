const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixes = [
  {
    slug: "khandan-e-nabuwat-ka-taaruf",
    metaDescription: "Khandan e Nabuwat ka Taaruf is an insightful Urdu book introducing the families of the Prophets, focusing on the household of Prophet Muhammad."
  },
  {
    slug: "mingling-between-men-and-women-is-prohibited",
    metaDescription: "Mingling Between Men and Women is Prohibited is an evidence-based English book on the Islamic ruling against free mixing with Quranic proof."
  },
  {
    slug: "misali-khatoon",
    metaDescription: "Misali Khatoon is an inspiring Urdu book presenting biographies of exemplary Muslim women as role models of faith, knowledge, and character."
  },
  {
    slug: "mukhtasar-sahih-al-bukhari-2-vols-imported",
    metaDescription: "Mukhtasar Sahih Al-Bukhari 2-vol imported Urdu edition presents selected authentic hadith from Islam's most reliable collection in premium quality."
  },
  {
    slug: "mera-jeena-mera-marna",
    metaDescription: "Mera Jeena Mera Marna is a reflective Urdu book exploring life and death through Islamic theology, offering spiritual guidance for every stage."
  },
  {
    slug: "masnoon-namaz-aur-roz-marra-ki-duain-8x12",
    metaDescription: "Masnoon Namaz aur Roz Marra ki Duain is a practical 8x12 Urdu book of Prophetic prayers and daily supplications with Arabic and Urdu text."
  },
  {
    slug: "muntakhab-seerat-e-mustafa",
    metaDescription: "Muntakhab Seerat e Mustafa is a focused Urdu biography of Prophet Muhammad highlighting key life events and practical lessons for Muslims."
  },
  {
    slug: "pyary-rasool-ki-sunehri-seerat-local",
    metaDescription: "Pyary Rasool ki Sunehri Seerat local edition is an affordable Urdu biography of Prophet Muhammad covering his complete life with scholarly depth."
  },
  {
    slug: "qasas-al-anbiya-ibn-e-kathir",
    metaDescription: "Qasas al Anbiya by Ibn Kathir is the authoritative Urdu edition of prophetic stories based on authentic Quranic and hadith sources."
  }
];

async function main() {
  console.log(`Fixing ${fixes.length} meta descriptions...\n`);
  for (const fix of fixes) {
    const len = fix.metaDescription.length;
    console.log(`${fix.slug}: meta ${len} chars`);
    if (len > 155) {
      console.error(`  ⚠️ STILL OVER 155!`);
    } else if (len < 130) {
      console.error(`  ⚠️ UNDER 130!`);
    }
    try {
      await prisma.product.update({
        where: { slug: fix.slug },
        data: { metaDescription: fix.metaDescription },
      });
      console.log(`  ✅ Updated`);
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
    }
  }
  console.log("\nDone");
}

main()
  .catch(e => { console.error("Fatal:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
