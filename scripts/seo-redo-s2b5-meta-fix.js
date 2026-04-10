const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const metaFixes = {
  "islam-ki-imtiyaazi-khoobiyaan": "Islam Ki Imtiyaazi Khoobiyaan explores Islam's unique excellences covering theology, Quran, social systems, economics, and human rights in Urdu.",
  "islam-ki-sachayi-aur-science-k-aitrafaat": "Islam ki Sachayi aur Science k Aitrafaat shows how modern science affirms Quranic teachings on cosmology, embryology, geology, and hydrology.",
  "islam-kia-hai": "Islam Kia Hai is a comprehensive Urdu guide to Islamic beliefs and practices, covering the six articles of faith, five pillars, and core morality.",
  "islam-made-simple": "Islam Made Simple is an English introductory guide covering Islamic beliefs, five pillars, morality, and daily life for new Muslims and general readers.",
  "islam-main-borhon-ki-azmat": "Islam main Borhon ki Azmat presents rational proofs for Islam including cosmological, Quranic, and prophetic arguments in scholarly Urdu prose.",
  "islam-main-halal-o-haram": "Islam Main Halal-o-Haram is a comprehensive Urdu guide to halal and haram rulings covering food, business, dress, social conduct, and entertainment.",
  "islam-me-dolat-kay-masarif": "Islam Me Dolat kay Masarif is an Urdu guide to Islamic wealth management covering earning, zakat, charity, family duties, and financial ethics.",
  "islam-mein-bunyaadi-haqooq": "Islam mein Bunyaadi Haqooq is an Urdu book on fundamental rights in Islam covering individual, family, social, and minority rights.",
  "islam-mein-ikhtilaf-ke-usool-o-adab": "Islam Mein Ikhtilaf Ke Usool o Adab is an Urdu guide to managing scholarly disagreement through Islamic principles, etiquettes, and historical examples.",
  "islam-the-religion-of-peace": "Islam the Religion of Peace refutes misconceptions of Islam as violent, covering Quranic peace teachings and the true meaning of jihad in English.",
  "islam-salvation-for-mankind": "Islam: Salvation for Mankind presents Islam as complete divine guidance covering salvation, mercy, repentance, and social justice for all humanity.",
  "islami-adaab-e-muashrat": "Islami Adaab e Muashrat is an Urdu guide to Islamic social etiquette covering family manners, community relations, and modern technology use.",
  "islami-fatoohat-ka-tabnaak-daur": "Islami Fatoohat ka Tabnaak Daur is an Urdu history of the early Islamic conquests under the Rashidun and early Umayyad caliphates.",
  "islami-qanoon-e-wirasat": "Islami Qanoon-e-Wirasat is a comprehensive Urdu guide to Islamic inheritance law covering heir shares, calculations, and estate distribution.",
  "islami-taaleemi-series-1": "Islami Taaleemi Series 1 is a foundational Urdu Islamic textbook for young students covering basic beliefs, prayer, morals, and prophet stories.",
  "islami-taaleemi-series-2": "Islami Taaleemi Series 2 is the second Urdu Islamic textbook advancing students with detailed aqeedah, fiqh, Quranic surahs, and hadith.",
  "islami-taleem-o-tarbiat": "Islami Taleem-o-Tarbiat is an Urdu guide to Islamic child-rearing covering prenatal to adolescent education, curriculum, and character building.",
  "islamic-album-galleries-of-the-two-holy-mosques": "Islamic Album Galleries of the Two Holy Mosques is a photographic tour of Masjid al-Haram and Masjid an-Nabawi with historical captions.",
  "islamic-creed": "Islamic Creed is a comprehensive English book on Islamic theology covering Tawhid, angels, scriptures, prophets, and the Day of Judgment."
};

async function main() {
  const slugs = Object.keys(metaFixes);
  console.log(`Fixing meta descriptions for ${slugs.length} products...\n`);

  for (const slug of slugs) {
    const meta = metaFixes[slug];
    const len = meta.length;
    const ok = len >= 130 && len <= 155;
    console.log(`[${slug}] meta: ${len} chars ${ok ? 'OK' : 'FAIL'}`);

    if (!ok) {
      console.log(`  SKIP - still out of range`);
      continue;
    }

    try {
      await prisma.product.update({
        where: { slug },
        data: { metaDescription: meta },
      });
      console.log(`  Updated`);
    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
    }
  }
  console.log('\nDone');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
