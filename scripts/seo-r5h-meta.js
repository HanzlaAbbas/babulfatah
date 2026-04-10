const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: "hospital-mein-mareez-aur-tabeeb-kai-sath",
    metaDescription: `Urdu Islamic guide on the etiquette of visiting the sick in hospitals. Covers Prophetic Duas for patients, doctor-patient conduct, and Sunnah healing practices for illness.`
  },
  {
    slug: "how-the-prophet-muhammad-peace-be-upon-him-performed-hajj",
    metaDescription: `Detailed step-by-step account of how Prophet Muhammad (PBUH) performed Hajj. Authentic Hadith-based guide covering every ritual from Ihram to Tawaf al-Wada.`
  },
  {
    slug: "how-to-achieve-happiness",
    metaDescription: `Islamic guide to achieving true happiness through Quranic wisdom and Prophetic teachings. Covers faith, gratitude, patience, and balancing worldly life with spiritual goals.`
  },
  {
    slug: "how-to-invite-people-to-allah",
    metaDescription: `Comprehensive guide to Da'wah (inviting to Islam) based on Quran and Sunnah. Learn Prophetic methods, communication skills, and strategies for effective Islamic outreach.`
  },
  {
    slug: "how-to-pray",
    metaDescription: `Complete illustrated guide to performing Salah (Islamic prayer) correctly. Covers Wudu, positions, recitations, and common mistakes with authentic Hadith references.`
  },
  {
    slug: "hujiyat-e-hadith",
    metaDescription: `Urdu scholarly work establishing the authority and proof of Hadith in Islamic law. Addresses objections, explains preservation methodology, and defends Hadith authenticity.`
  },
  {
    slug: "huqooq-al-aulad-haqooq-series",
    metaDescription: `Urdu guide on children's rights in Islam from the Haqooq Series. Covers parental responsibilities, child education, fair treatment, and Quranic guidance for raising righteous offspring.`
  },
  {
    slug: "huquq-rahmatul-lily-aalameen",
    metaDescription: `Comprehensive Urdu book on rights and obligations related to Prophet Muhammad (PBUH) as Rahmatul Lil Aalameen. Covers following his Sunnah, sending Durood, and loving the Prophet.`
  },
  {
    slug: "ibn-khaldun-the-maghribi-master-of-the-muqaddimah-luqman-nagy",
    metaDescription: `Engaging biography of Ibn Khaldun, the father of sociology and historiography. Explore his Muqaddimah, theories of civilization, and lasting impact on social science and philosophy.`
  },
  {
    slug: "ibrat-ka-nishan-qissa-syedna-musa-silsila-qasas-ul-anbiya-1730",
    metaDescription: `Urdu story of Prophet Musa (AS) from the Qasas ul Anbiya series (17/30). Engaging narrative of Musa's trials, Pharaoh's defiance, and Allah's deliverance for children and families.`
  },
  {
    slug: "ideal-ki-talash",
    metaDescription: `Inspiring Urdu book on the search for an ideal role model in life. Explores why Prophet Muhammad (PBUH) is the perfect human example through Quranic evidence and practical life lessons.`
  },
  {
    slug: "idrees-in-ramadhan",
    metaDescription: `Engaging children's story about Idrees and his Ramadhan experiences. teaches fasting, Taraweeh, charity, and the spiritual blessings of the holy month for young Muslim readers.`
  },
  {
    slug: "ilamat-e-qiyamat-ka-bayan",
    metaDescription: `Comprehensive Urdu book on the signs of the Day of Judgment. Covers major and minor signs, Quranic prophecies, and Hadith-based warnings to prepare for the Hereafter.`
  },
  {
    slug: "ilm-ka-samandar",
    metaDescription: `Inspiring Urdu book presenting the vast ocean of Islamic knowledge. Explores the importance of seeking Ilm, the hierarchy of Islamic sciences, and scholarly traditions through history.`
  },
  {
    slug: "ilm-o-fun-ka-imam",
    metaDescription: `Biography of a great Islamic scholar renowned as master of both knowledge and art. Explores how Islamic scholarship and creative expression beautifully complement each other.`
  },
  {
    slug: "imam-ibn-e-taimiya-ki-zindgi-kay-sunehray-waqiat",
    metaDescription: `Golden events from the life of Imam Ibn Taymiyyah in Urdu. Covers his scholarship, imprisonment for defending orthodox beliefs, debates, and unwavering commitment to truth.`
  },
  {
    slug: "imam-sufiyan-bin-uyaniyah-may-allah-have-mercy-upon-him",
    metaDescription: `Biography of Imam Sufyan bin Uyaniyah, the renowned Hadith scholar and jurist. Covers his life, teachers, students, and immense contributions to Islamic Hadith literature.`
  },
  {
    slug: "important-lessons-for-muslim-women",
    metaDescription: `Essential Islamic lessons for Muslim women covering faith, prayer, Hijab, family life, and social conduct. Authored with Quranic and Hadith evidence for practical daily guidance.`
  },
  {
    slug: "in-defence-of-the-true-faith",
    metaDescription: `Scholarly Islamic work defending the core tenets of true faith. Addresses theological challenges, refutes misconceptions, and establishes Islamic beliefs through Quranic and rational proofs.`
  },
  {
    slug: "in-the-kings-court",
    metaDescription: `Captivating story set in a royal court exploring themes of justice, wisdom, and Islamic values. A narrative that teaches moral lessons through engaging palace intrigue and righteous characters.`
  },
  {
    slug: "ina-allah-ala-kulli-shayen-qadeer-calligraphy-laser-cut-table-decor-black",
    metaDescription: `Elegant laser-cut black calligraphy table decor featuring 'Inna Allah Ala Kulli Shayeen Qadeer'. Premium MDF craftsmanship for elegant Islamic home and office decoration.`
  },
  {
    slug: "ina-allah-ala-kulli-shayen-qadeer-calligraphy-laser-cut-wall-art-black",
    metaDescription: `Stunning laser-cut black wall art with 'Inna Allah Ala Kulli Shayeen Qadeer' calligraphy. Premium Islamic wall decor crafted from quality materials for homes and offices.`
  },
  {
    slug: "ina-allah-ala-kulli-shayen-qadeer-calligraphy-laser-cut-wall-art-golden",
    metaDescription: `Beautiful golden laser-cut wall art featuring 'Inna Allah Ala Kulli Shayeen Qadeer'. Elegant Islamic calligraphy decor for homes, mosques, and gift-giving occasions.`
  },
  {
    slug: "ink-pot",
    metaDescription: `Traditional Islamic-style ink pot (Dawat) for Arabic calligraphy writing. Authentic design suitable for calligraphy practice, art, and decorative display in homes and offices.`
  }
];

async function main() {
  let done = 0, fail = 0;
  for (const item of updates) {
    try {
      const result = await prisma.product.update({
        where: { slug: item.slug },
        data: { metaDescription: item.metaDescription }
      });
      console.log(`✅ Updated meta: ${item.slug}`);
      done++;
    } catch (error) {
      console.error(`❌ Error: ${item.slug}: ${error.message}`);
      fail++;
    }
  }
  console.log(`\n✅ Done: ${done} updated, ${fail} failed`);
}

main().then(() => prisma.$disconnect());
