const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const metaFixes = [
  { id: "acd3930c-7147-4b34-bbd0-effaaa1d7f89", slug: "inkaar-e-hadith-se-inkaar-e-quran-tk", m: `A scholarly Urdu book demonstrating how rejecting Hadith logically leads to rejecting the Quran, with Quranic evidence and case studies.` },
  { id: "ee17c6fb-54a7-48d9-87de-13714e35af4e", slug: "insaan-apni-sifaat-k-ayinay-main", m: `An Urdu self-reflection guide rooted in Islamic teachings, helping readers evaluate and improve their character through Quranic wisdom.` },
  { id: "4dbb26e8-04ee-4e4e-8eb5-961ec7402864", slug: "insaniyat-mout-kay-darwazay-par", m: `A powerful Urdu book on death awareness from an Islamic perspective, covering the soul's journey, grave realities, and hereafter preparation.` },
  { id: "450c788a-9f0e-4c62-9507-3f7b71925574", slug: "intense-burner-bakhoor-bronze", m: `A handcrafted bronze bakhoor burner with perforated dome design for even smoke diffusion, ideal for traditional incense and oud burning.` },
  { id: "f550f33e-3805-4f7f-a895-58a07a84b46d", slug: "intense-burner-bakhoor-golden", m: `A luxurious golden bakhoor burner featuring Islamic geometric patterns, ideal for oud and incense burning during special gatherings.` },
  { id: "8b27d4c0-f7b9-48db-93cb-9cb528bfcab4", slug: "intense-electric-burner-bakhoor-bronze", m: `A safe, smoke-free electric bakhoor burner in elegant bronze finish for pure fragrance release without charcoal hazards.` },
  { id: "9897f4c4-6fcb-4b14-8a62-4f9ac7862648", slug: "intense-electric-burner-bakhoor-golden", m: `A luxurious golden electric bakhoor burner with rapid heating, temperature control, and smoke-free operation for premium fragrance.` },
  { id: "e372b96e-f4bb-4ea6-8360-d245cfe34159", slug: "intense-electric-burner-bakhoor-silver", m: `A modern silver electric bakhoor burner with smoke-free, controlled heating technology for pure oud and bakhoor fragrance release.` },
  { id: "241c91a6-8df2-491e-8863-c2da25960a83", slug: "interpretation-of-dreams", m: `A comprehensive English guide to Islamic dream interpretation based on Ibn Sirin's methodology, featuring an extensive symbol dictionary.` },
  { id: "1a7b7ecd-f506-4da9-b6af-4b2e226fa258", slug: "interpretation-of-kitab-at-tauhid-the-destination-of-the-seeker-of-truth", m: `An in-depth English commentary on Kitab at-Tawheed covering the three categories of Islamic monotheism and common forms of Shirk.` },
  { id: "cf045073-4e09-4db5-b076-8ab1c335500d", slug: "introducing-arabic", m: `A beginner-friendly Arabic textbook covering the alphabet, pronunciation, essential vocabulary, and basic grammar for English-speaking learners.` },
  { id: "127a0ad6-ae90-40e7-b5a9-caed97554550", slug: "isaayiat-tajziyah-aur-mutaliyah", m: `A scholarly Urdu analysis of Prophet Isa (Jesus) from an Islamic perspective covering his birth, miracles, and the crucifixion debate.` },
  { id: "d521a678-b2e9-4443-94af-fd6d7430ada6", slug: "isharon-ki-zuban-mai-namaz", m: `A pioneering Urdu guide teaching Salah through sign language for hearing-impaired Muslims with visual instructions and Fiqhi rulings.` },
  { id: "72337e05-23e1-4e6b-a551-48d12e2bb9d0", slug: "islam-a-total-beginners-guide-1", m: `Volume one of a beginner-friendly English series introducing Islam's core beliefs, Six Articles of Faith, and the Five Pillars.` },
  { id: "b1099728-78b2-40fc-b05e-dc0c35b9dcfb", slug: "islam-a-total-beginners-guide-3-vols", m: `A complete three-volume English set covering Islam from basics through prayer, fasting, Hajj, family life, and Islamic history.` },
  { id: "76bb83cd-5874-4af4-9b98-fd69a8f92bea", slug: "islam-a-total-beginners-guide-3", m: `The final volume covering Islamic character, family life, financial ethics, contemporary issues, and Islamic history and civilization.` },
  { id: "08a04db1-ece1-480e-8bfe-d8754e4b459d", slug: "islam-atotal-beginners-guide-2", m: `Volume two provides detailed practical guidance on performing Salah, fasting, Zakat calculation, and Hajj rituals step by step.` },
  { id: "ffd6648c-f4ce-41af-ba43-871eef954608", slug: "islam-aur-khanqahi-nizaam", m: `A critical Urdu analysis of the Sufi Khanqah system examining its history, practices, and alignment with Quranic orthodoxy.` },
  { id: "fb3e2519-2840-496a-b714-f3bcf7ea6e42", slug: "islam-hi-hamara-intikhaab-kyu", m: `A thought-provoking Urdu book presenting rational, spiritual, and practical reasons for choosing Islam with Quranic arguments.` },
  { id: "7264c9a2-824a-4423-bdb4-c2192d0e84f8", slug: "islam-is-your-birth-right", m: `An English book presenting Islam as humanity's natural Fitrah with theological, scientific, and sociological evidence and arguments.` },
  { id: "b88f6353-95ce-49a5-9093-b87fdf5073c0", slug: "islam-its-foundation-and-concepts", m: `A systematic English reference covering Islamic foundations, Tawheed, Articles of Faith, Shariah sources, and key concepts.` },
  { id: "b60d1ca7-5dff-4f05-87da-d09f16d79b02", slug: "islam-k-3-bunyaadi-asool", m: `A clear Urdu explanation of the Three Fundamental Principles of Islam based on Sheikh ibn Abdul Wahhab's famous treatise.` },
  { id: "46abe88c-a47b-4ea6-a988-fe6169a36a80", slug: "islam-k-bunyaadi-aqaaid", m: `A thorough Urdu reference on Islamic Aqeedah covering Tawheed, angels, revealed books, prophets, Judgment Day, and divine decree.` },
  { id: "dc353d09-86a5-4459-b087-c9b364a54b0a", slug: "islam-ke-ahkam-o-aadab-new-edition", m: `An expanded Urdu reference on Islamic rulings and daily etiquettes covering prayer, fasting, purification, and contemporary topics.` },
  { id: "5618397a-6a1a-43e4-9b3d-be0fd171f7b3", slug: "islami-ki-imtiyaazi-khoobiyaan", m: `An inspiring Urdu book highlighting Islam's unique qualities in theology, social justice, science, and civilization with analysis.` },
  { id: "457a8fb6-6b0d-4da3-8736-ab59c08fc009", slug: "islam-ki-sachayi-aur-science-k-aitrafaat", m: `A detailed Urdu exploration of how modern scientific discoveries in embryology and cosmology confirm Quranic descriptions.` },
  { id: "2871d974-b8a8-4e70-b7ab-5884704e59bc", slug: "islam-kia-hai", m: `A clear, jargon-free Urdu introduction to Islam answering fundamental questions about beliefs, pillars, and daily life.` },
  { id: "cac60c00-2a5f-404a-8cfa-6546e51c5244", slug: "islam-made-simple", m: `An accessible English introduction to Islam covering beliefs, the Five Pillars, and moral conduct in clear, simple language.` },
  { id: "83916797-cca6-4a67-86be-e61b772bc4cb", slug: "islam-main-borhon-ki-azmat", m: `A specialized Urdu book on rational proofs for Islamic beliefs covering arguments for God's existence and the Quran's miracle.` },
  { id: "62681035-02e6-4ec1-ad56-f3ed516b8701", slug: "islam-main-halal-o-haram", m: `A detailed Urdu guide to Halal and Haram in Islam covering dietary laws, finance, entertainment, dress code, and modern issues.` },
  { id: "c4049a4e-1b7d-41ef-a29e-fc30b0cb24a6", slug: "islam-me-dolat-kay-masarif", m: `A practical Urdu guide on earning Halal income, managing wealth through Zakat and charity, and Islamic spending priorities.` },
  { id: "021ba68a-f148-42b6-bc47-e35344e1a2aa", slug: "islam-mein-bunyaadi-haqooq", m: `A systematic Urdu outline of fundamental rights in Islam covering rights of Allah, the Prophet, parents, spouses, and community.` },
  { id: "348dc288-c655-4f54-8bb5-96528cd099a7", slug: "islam-mein-ikhtilaf-ke-usool-o-adab", m: `A vital Urdu guide to the principles and etiquette of handling disagreements in Islam with historical scholarly examples.` },
  { id: "5b1ea8c8-4740-4de8-bf9e-009e4b7a802b", slug: "islam-pr-40-aitrazaat-k-mudalal-jawab", m: `A thorough Urdu apologetics book answering 40 common objections against Islam with evidence-based, well-sourced responses.` },
  { id: "515ee5d5-7f0a-4f20-a4ca-604b5e292f24", slug: "islam-the-religion-of-peace", m: `An evidence-based English book defending Islam as a religion of peace by examining controversial verses in proper historical context.` },
  { id: "eca980e6-3bf1-4386-9e74-f1fe66c9a7e1", slug: "islam-salvation-for-mankind", m: `An English book presenting Islam as humanity's universal path of salvation through Tawheed, prophetic guidance, and worship.` },
  { id: "3f69f7e1-f5f2-4c41-b5b8-f22d03db61c5", slug: "islami-adaab-e-muashrat", m: `A detailed Urdu guide to Islamic social etiquette covering greetings, conversation, dining, dress, and community interactions.` },
  { id: "af1cee71-9c1e-4fde-b1ab-4499fd8abcc0", slug: "islami-aqeeda-8x12", m: `A compact 8x12 Urdu booklet covering the Six Articles of Faith with clear explanations of Tawheed, angels, and divine decree.` },
  { id: "78940556-55cd-4d93-8f3d-9be7aa119699", slug: "islami-fatoohat-ka-tabnaak-daur", m: `A vivid Urdu history of Islam's golden era of conquests under the Rightly Guided Caliphs with key battle and strategy details.` },
  { id: "fb50f847-61ec-44b0-932f-bf19889f3954", slug: "islami-qanoon-e-wirasat", m: `A comprehensive Urdu guide to Islamic inheritance law covering fixed shares, agnatic heirs, and practical calculation examples.` },
  { id: "1d5fed48-ae5b-48c7-a862-545cc1006f6d", slug: "islami-taaleemi-series-1", m: `The first book in a graded Urdu Islamic education series for young learners covering beliefs, pillars, Duas, and Islamic manners.` },
  { id: "8c4ebb2a-5aca-45a4-939d-7f356db1e2a7", slug: "islami-taaleemi-series-2", m: `The second Urdu Islamic education book expanding on prayer details, Sahabah stories, Islamic history, and moral values.` },
  { id: "0797d41d-0f42-4e6b-8a1d-3af51583c037", slug: "islami-taleem-o-tarbiat", m: `A comprehensive Urdu guide on Islamic parenting and child education covering developmental stages from infancy through adolescence.` },
  { id: "d71780e7-5e4a-401e-9c56-fec30b88dcf3", slug: "islamic-album-galleries-of-the-two-holy-mosques", m: `A luxurious photographic album of Masjid al-Haram and Masjid an-Nabawi with detailed captions on history and architecture.` },
  { id: "2e0ba2d2-8053-4a73-9ba9-a723fadf1b1f", slug: "islamic-creed", m: `A scholarly English exposition of Sunni Islamic creed covering Tawheed, angels, revealed books, prophets, and Judgment Day.` },
  { id: "00c9cc1a-8509-4a30-a951-0ad2a3598235", slug: "islamic-dress-code-for-women", m: `A comprehensive English guide to the Islamic women's dress code with Quranic evidence, Hijab wisdom, and practical tips.` },
  { id: "5e9d6fb4-4702-4ae6-a118-3cc2d3a84cc9", slug: "islamic-education-series-part-1", m: `Part one of an English Islamic education series covering Tawheed, Prophethood, the Five Pillars, and basic Islamic morality.` },
  { id: "a68d3ff1-4031-4f10-a257-0d1cd37cb7c4", slug: "islamic-education-series-part-2", m: `Part two of the English Islamic education series with detailed Salah guidance, expanded Seerah, and basic Fiqh topics.` },
  { id: "c94f6942-dd91-4738-bd4e-4e02913c6310", slug: "islamic-etiquettes-for-newborn-child", m: `A practical English guide to Islamic newborn rituals including Adhan, naming, Aqiqah, Tahneek, and circumcision with Hadith.` },
  { id: "0d78294a-227e-455f-840f-f222583dff33", slug: "islamic-fatawa-regarding-women", m: `A scholarly English compilation of Islamic legal verdicts on women's worship, marriage, family law, and contemporary issues.` }
];

async function main() {
  let updated = 0, errors = 0, tooShort = 0, tooLong = 0, ok = 0;
  let totalLen = 0, minLen = 999, maxLen = 0;

  for (const item of metaFixes) {
    try {
      await prisma.product.update({
        where: { id: item.id },
        data: { metaDescription: item.m }
      });
      const len = item.m.length;
      totalLen += len;
      if (len < minLen) minLen = len;
      if (len > maxLen) maxLen = len;
      if (len < 120) tooShort++;
      else if (len > 160) tooLong++;
      else ok++;
      const status = (len >= 120 && len <= 160) ? '✅' : '⚠️';
      console.log(`${status} [${len} chars] ${item.slug}`);
      updated++;
    } catch (err) {
      console.error(`❌ ${item.slug}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nFixed: ${updated} | Errors: ${errors} | OK: ${ok} | Too Short: ${tooShort} | Too Long: ${tooLong}`);
  console.log(`Avg: ${(totalLen/updated).toFixed(1)} | Min: ${minLen} | Max: ${maxLen}`);
}

main().then(() => prisma.$disconnect());
