const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const metaFixes = [
  { slug: "hazrat-ibrahim-as-bahasit-walid", metaDescription: "Hazrat Ibrahim AS Bahasit Walid is an Urdu biography of Prophet Ibrahim AS covering his life, trials, and legacy from Quranic and Islamic sources." },
  { slug: "hazrat-ibrahim-as-ki-qurbani-ka-qissa", metaDescription: "Hazrat Ibrahim AS ki Qurbani ka Qissa retells Prophet Ibrahim's sacrifice in Urdu with Quranic references, theological insights, and lessons of faith." },
  { slug: "healing-with-the-medicine-of-the-prophet-pbuh", metaDescription: "Healing with the Medicine of the Prophet PBUH is Ibn al-Qayyim's English work on Prophetic medicine covering natural remedies and spiritual healing." },
  { slug: "healing-with-the-medicine-of-the-prophet-pbuh-4-colour-local", metaDescription: "Healing with Medicine of the Prophet PBUH 4-colour local edition presents Ibn al-Qayyim's Prophetic medicine with enhanced color printing." },
  { slug: "help-yourself-in-reading-quran", metaDescription: "Help Yourself in Reading Quran is a step-by-step English workbook for learning Arabic Quranic text from scratch for beginners of all ages." },
  { slug: "heroes-of-islam", metaDescription: "Heroes of Islam is an English biographical collection profiling extraordinary men and women of Islamic history with authentic sources." },
  { slug: "hidayat-al-qari-sharh-sahih-al-bukhari-10-volume-set-local", metaDescription: "Hidayat al-Qari is a 10-volume Urdu commentary on Sahih al-Bukhari with hadith explanations and chain analysis for advanced Islamic study." },
  { slug: "hindrances-on-the-path", metaDescription: "Hindrances on the Path by Abdul Malik Al-Qasim identifies spiritual obstacles Muslims face and offers Quran-based strategies to overcome them." },
  { slug: "hirz-e-azam-card-cover", metaDescription: "Hirz e Azam card cover is a compact Urdu supplication booklet with authentic daily du'as, morning-evening adhkar, and Quranic invocations." },
  { slug: "hisn-ul-muslim-12x17", metaDescription: "Hisn ul Muslim 12x17 edition offers 267 authenticated daily supplications in Urdu with Arabic text and hadith references in a portable format." },
  { slug: "hisn-ul-muslim-14x21", metaDescription: "Hisn ul Muslim 14x21 large-format edition presents 267 authenticated Prophetic supplications in Urdu with Arabic text for comfortable reading." },
  { slug: "hisn-ul-muslim-8x12-pocket-size", metaDescription: "Hisn ul Muslim 8x12 pocket edition contains 267 authenticated Prophetic du'as in Urdu, designed for maximum portability in a compact format." },
  { slug: "hisn-ul-muslim-pashto", metaDescription: "Hisn-ul-Muslim Pashto edition offers 267 authenticated Prophetic supplications in Pashto with Arabic text and hadith source references." },
  { slug: "historical-atlas-of-the-prophets-messengers", metaDescription: "Historical Atlas of the Prophets and Messengers maps journeys of Quranic prophets with color maps, archaeological photos, and historical narrative." },
  { slug: "history-of-islam-3-vol", metaDescription: "History of Islam 3-volume set by Akber Shah Najeebabadi surveys Islamic civilization from pre-Islamic Arabia through the modern era in English." },
  { slug: "history-of-islam-al-khulafa-ar-rashidun-muawiyah-bin-abi-sufyan", metaDescription: "Maulvi Abdul Aziz's History of Islam covers the Rightly Guided Caliphs and Muawiyah RA with analysis from classical Islamic sources." },
  { slug: "history-of-islam-abu-bakr-as-siddiq-ra", metaDescription: "History of Islam: Abu Bakr as-Siddiq RA by Maulvi Abdul Aziz is a detailed English biography of his life and transformative caliphate." },
  { slug: "history-of-islam-grade-4", metaDescription: "History of Islam Grade 4 is an English Islamic history textbook for ages 9-10 with engaging stories, maps, timelines, and review questions." },
  { slug: "history-of-islam-ali-ibn-abi-taalib-ra", metaDescription: "History of Islam: Ali Ibn Abi Taalib RA by Abdul Basit Ahmad is a comprehensive English biography covering his life, scholarship, and legacy." },
  { slug: "history-of-islam-muawiyah-bin-abi-sufyan-ra", metaDescription: "History of Islam: Muawiyah Bin Abi Sufyan RA by Maulvi Abdul Aziz presents a balanced English study of his caliphate from classical sources." }
];

async function main() {
  let count = 0;
  for (const item of metaFixes) {
    const len = item.metaDescription.length;
    if (len < 130 || len > 155) {
      console.log('BAD LENGTH:', len, item.slug);
      continue;
    }
    try {
      await prisma.product.update({
        where: { slug: item.slug },
        data: { metaDescription: item.metaDescription }
      });
      count++;
    } catch(e) {
      console.log('SKIP:', item.slug, e.message.substring(0, 80));
    }
  }
  console.log("Meta Updated:", count);
}

main().then(() => prisma.$disconnect());
