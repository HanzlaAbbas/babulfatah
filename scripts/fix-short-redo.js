const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: "a-concise-childrens-encyclopedia-of-islam",
    description: `Nothing equips a Muslim child for a lifetime of informed faith quite like a comprehensive reference work they can return to year after year as their understanding deepens. "A Concise Children's Encyclopedia of Islam," published by Darussalam, organises the entire breadth of Islamic knowledge into an alphabetical format that children aged ten and above can navigate independently, building research habits alongside religious literacy. The alphabetical structure covers each prophet from Adam to Muhammad (peace be upon them all), the four rightly-guided caliphs, major Islamic occasions and festivals, foundational practices such as salah, zakat, and hajj, and theological concepts like tawheed, shirk, and the pillars of iman. Cross-references direct young readers from one entry to related topics — discovering the entry on Ramadan leads naturally to entries on fasting, Laylat al-Qadr, and Eid al-Fitr — encouraging exploration rather than passive reading. What distinguishes this encyclopedia from simpler Islamic children's books is its willingness to present concepts that many introductory works avoid. Entries on lesser-known prophets, forgotten episodes from early Islamic history, and nuanced discussions of Islamic etiquette give this book substance that keeps older children and teenagers engaged. The biographical sketches of the rightly-guided caliphs go beyond names and dates, explaining how each companion's leadership reflected different aspects of the Prophet's example. Every entry draws upon authentic Quranic verses and hadith narrations, giving parents confidence in the reference their children consult most frequently. The hardcover binding and quality paper construction ensure this volume holds up to repeated use in a busy household, while the clear typography and well-spaced layout make extended reading sessions comfortable for young eyes. A dedicated section on Islamic supplications and daily adhkar rounds out the reference, giving children a practical tool they can incorporate into their morning and evening routines immediately.`,
    metaDescription: "A Concise Children's Encyclopedia of Islam — alphabetical Islamic reference for ages 10+, covering prophets, caliphs, beliefs, and daily practices."
  },
  {
    slug: "al-quran-al-kareem-207-15-lines",
    description: `This edition of the Holy Quran presents the complete text in the classic 15-line format widely used across South Asian madrasas and Islamic institutions for both memorisation and daily recitation. The 15-line layout follows the standard arrangement that hafiz students rely on during their memorisation journey, making page references instantly recognisable regardless of which teacher or institution a student studies with. The Arabic script is printed in a clear, well-proportioned Uthmani font that balances readability with the traditional aesthetic expected in a personal Quran. Each page is spacious enough to allow comfortable reading during lengthy recitation sessions, while the line spacing helps readers maintain their place without losing concentration. Bound in a durable cover designed to withstand frequent handling, this Mushaf is suitable for students carrying it daily to classes, teachers using it during instruction, and families keeping it on the shelf for regular reading. The 15-line format has been the preferred layout for generations of Quran students because it divides each juz into manageable portions that align with traditional hafiz schedules, allowing a student to complete one page per day and finish the entire Quran in approximately thirty days of consistent practice. The paper quality supports annotation with a dry pencil for those who wish to mark tajweed rules or memorisation checkpoints without bleeding through to the reverse side. For households where multiple family members share a single copy, the sturdy binding ensures the Quran remains intact through years of daily use. Whether used formally in a hifz programme or informally at home for personal reflection and worship, this 15-line Quran edition serves as a dependable companion for anyone seeking to deepen their connection with the words of Allah.`,
    metaDescription: "Al Quran Al Kareem 15-line edition — clear Uthmani script in classic madrasa format, ideal for hifz memorisation, recitation, and daily study."
  }
];

async function main() {
  for (const item of updates) {
    const words = item.description.trim().split(/\s+/).length;
    const metaLen = item.metaDescription.length;
    console.log(`Updating ${item.slug}: ${words} words, meta ${metaLen} chars`);

    if (words < 250) {
      console.error(`  WARNING: Description is only ${words} words (need 250+)`);
    }
    if (metaLen < 130 || metaLen > 155) {
      console.error(`  WARNING: Meta description is ${metaLen} chars (need 130-155)`);
    }

    await prisma.product.update({
      where: { slug: item.slug },
      data: {
        description: item.description,
        metaDescription: item.metaDescription
      }
    });
    console.log(`  Updated successfully.`);
  }
  console.log("\nDone updating both products.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
