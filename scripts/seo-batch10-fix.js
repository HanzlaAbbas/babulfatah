#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 10 FIX Description Writer
// Re-writes descriptions for products 1001–1100 with 220+ word descriptions
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// ─── Utility ─────────────────────────────────────────────────────────────────
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function formatPrice(p) { return 'Rs. ' + Number(p).toLocaleString('en-PK'); }

// ─── Product metadata for detail injection ────────────────────────────────────
const PRODUCT_DATA = [
  { title: 'Sunehray Naqoosh', cat: 'History', idx: 0 },
  { title: 'Sunehray Naqoosh 1', cat: 'History', idx: 1 },
  { title: 'Sunehre Awraq', cat: 'History', idx: 2 },
  { title: 'Sunehre Faisley', cat: 'Fiqh', idx: 3 },
  { title: 'Sunehri Duain (Local)', cat: 'Prayer Supplication', idx: 4 },
  { title: 'Sunehri Kahaniyan', cat: 'Companions', idx: 5 },
  { title: 'Sunehri Kirnain', cat: 'Women', idx: 6 },
  { title: 'Sunehri Seerat 14x21 Imported', cat: 'Seerah', idx: 7 },
  { title: 'Sunehri Yaadein', cat: 'Imams Scholars', idx: 8 },
  { title: 'Sunnat-e-Mutahirah aur Adab-e-Mubashrat', cat: 'Women', idx: 9 },
  { title: 'Supplication and Treatment with Ruqya', cat: 'Prayer Supplication', idx: 10 },
  { title: 'Surah Yaseen', cat: 'Mushaf', idx: 11 },
  { title: 'Surah Yaseen (Urdu & English)', cat: 'Translation', idx: 12 },
  { title: 'Surahs to Seek Refuge', cat: 'Children', idx: 13 },
  { title: 'Suraj Kahaani', cat: 'Children', idx: 14 },
  { title: 'Surat Al-Arz', cat: 'Education', idx: 15 },
  { title: 'Syedina Abdullah Bin Abbas (R.A)', cat: 'Biography', idx: 16 },
  { title: 'Syedina Usman Bin Affan ki Zindagi k Sunehray Waqiyat', cat: 'Companions', idx: 17 },
  { title: 'Syedna Sohail Bin Amar R.A', cat: 'Biography', idx: 18 },
  { title: 'Tafheem ul Quran Urdu Vol.6 Set', cat: 'Tafseer', idx: 19, author: 'Maulana Syed Abul Ala Maududi', lang: 'Urdu', vols: 6 },
  { title: 'Tafheem Ul Quran Urdu 6 Vols Set', cat: 'Tafseer', idx: 20, author: 'Maulana Syed Abul Ala Maududi', lang: 'Urdu', vols: 6 },
  { title: 'Tafseer Ahsan al Kalam (Pocket-size 10x15 cm)', cat: 'Tafseer', idx: 21, format: 'pocket-size 10x15 cm' },
  { title: 'Tafseer Ahsan al Kalam Pocket-size With Zip Cover', cat: 'Tafseer', idx: 22, format: 'pocket-size with zip cover' },
  { title: 'Tafseer Ahsan ul Bayan (Jumbo Size)', cat: 'Tafseer', idx: 23, format: 'jumbo size' },
  { title: 'Tafseer Ahsan ul Bayan 14x21 Local', cat: 'Tafseer', idx: 24, format: '14x21 cm local print' },
  { title: 'Tafseer Ahsan ul Kalam 17x24', cat: 'Tafseer', idx: 25, format: '17x24 cm' },
  { title: 'Tafseer Ahsanulkalam Pashto Imported', cat: 'General', idx: 26, format: 'Pashto imported' },
  { title: 'Tafseer Al Quran Biklaam Ar Rehman', cat: 'General', idx: 27 },
  { title: 'Tafseer Bayan Ul Quran By Dr Israr Ahmed 7 Vol Set', cat: 'Tafseer', idx: 28, author: 'Dr Israr Ahmed', lang: 'Urdu', vols: 7 },
  { title: 'Tafseer Ibn Kathir 4 Vols Set Arabic', cat: 'Darussalam', idx: 29, author: 'Hafiz Imaduddin Ibn Kathir', lang: 'Arabic', vols: 4 },
  { title: 'Tafseer Ibn Kathir Arabic 4 Volumes', cat: 'Darussalam', idx: 30, author: 'Hafiz Imaduddin Ibn Kathir', lang: 'Arabic', vols: 4 },
  { title: 'Tafseer Jalalain Arabic 12x17', cat: 'Darussalam', idx: 31, author: 'Imam Jalaluddin Al-Mahalli & Imam Suyuti', lang: 'Arabic', format: '12x17 cm' },
  { title: 'Tafseer Jalalain Arabic 17x24', cat: 'Education', idx: 32, author: 'Imam Jalaluddin Al-Mahalli & Imam Suyuti', lang: 'Arabic', format: '17x24 cm' },
  { title: 'Tafseer Noor ul Quran 8 Vol Complete Set', cat: 'Darussalam', idx: 33, vols: 8 },
  { title: 'Tafseer Surah Fatiha', cat: 'Tafseer', idx: 34 },
  { title: 'Tafseer ul Quran Al Kareem Hafiz Abdus Salam bin Muhammad', cat: 'Tafseer', idx: 35, author: 'Hafiz Abdus Salam bin Muhammad' },
  { title: 'Tafsir Ahsan al Bayan (Art Paper)', cat: 'Tafseer', idx: 36, format: 'art paper' },
  { title: 'Tafsir Ahsan ul Bayan 17x24', cat: 'Tafseer', idx: 37, format: '17x24 cm' },
  { title: 'Tafsir Ahsan ul Kalaam Pocket Size 10x15 S/C', cat: 'Translation', idx: 38, format: 'pocket-size 10x15 cm soft cover' },
  { title: 'Tafsir Ahsanul Bayan 5 Vols Set English', cat: 'Education', idx: 39, lang: 'English', vols: 5 },
  { title: 'Tafsir Ahsanul Bayan VOL 2 English', cat: 'Education', idx: 40, lang: 'English', vol: 2 },
  { title: 'Tafsir Ahsanul Bayan VOL 3 English', cat: 'Education', idx: 41, lang: 'English', vol: 3 },
  { title: 'Tafsir Ahsanul Bayan VOL 4 English', cat: 'Education', idx: 42, lang: 'English', vol: 4 },
  { title: 'Tafsir Ahsanul Bayan VOL 5 English', cat: 'Education', idx: 43, lang: 'English', vol: 5 },
  { title: 'Tafsir Al Quran 30th Parah New Edition', cat: 'Darussalam', idx: 44, parts: '30th Parah' },
  { title: 'Tafsir As Sadi Parts 1-2-3', cat: 'Darussalam', idx: 45, author: 'Shaykh Abdur Rahman As-Sadi', parts: 'Parts 1-2-3' },
  { title: 'Tafsir As Sadi Parts 28-29-30', cat: 'Tafseer', idx: 46, author: 'Shaykh Abdur Rahman As-Sadi', parts: 'Parts 28-29-30' },
  { title: 'Tafsir As-Sadi 3 Vol', cat: 'Darussalam', idx: 47, author: 'Shaykh Abdur Rahman As-Sadi', vols: 3 },
  { title: 'Tafsir Ibn e Kathir 6 Vol Set Urdu', cat: 'Tafseer', idx: 48, author: 'Hafiz Imaduddin Ibn Kathir', lang: 'Urdu', vols: 6 },
  { title: 'Tafsir Ibn Kathir Abridged 30th Part', cat: 'Darussalam', idx: 49, author: 'Hafiz Imaduddin Ibn Kathir', parts: '30th Part' },
  { title: 'Tafsir Ibn Kathir English 10 Vols Set', cat: 'Tafseer', idx: 50, author: 'Hafiz Imaduddin Ibn Kathir', lang: 'English', vols: 10 },
  { title: 'Tafsir Kalimaat Al Quran 14x21', cat: 'Darussalam', idx: 51, format: '14x21 cm' },
  { title: 'Taharat Kay Masail', cat: 'Hadith', idx: 52 },
  { title: 'Taharat Ke Masail (Kitab-ut-Tahara)', cat: 'Fiqh', idx: 53 },
  { title: 'Tahzib Al Bidayah wal Nihaya 5 Vol Arabic', cat: 'History', idx: 54, author: 'Ibn Kathir', lang: 'Arabic', vols: 5 },
  { title: 'Taiseer al Quran 4 Volume Set Computerized Darussalam', cat: 'Tafseer', idx: 55, vols: 4 },
  { title: 'Taiseerul Allaam Shrah Umdatul Ahkaam 2 Vols Set', cat: 'Biography', idx: 56, vols: 2 },
  { title: 'Tajalliyat-e-Nabuwwat (New Edition) 17x24', cat: 'Seerah', idx: 57, format: '17x24 cm' },
  { title: 'Tajweed Juz Ammah 30th Part', cat: 'Mushaf', idx: 58 },
  { title: 'Tajweed ul Quran', cat: 'Mushaf', idx: 59 },
  { title: 'Tajwidi Para #2 (Qudrat Ullah Co)', cat: 'General', idx: 60 },
  { title: 'Tajwidi Para Set (Qudrat Ullah) S/C', cat: 'General', idx: 61 },
  { title: 'Talaq Kay Masail', cat: 'Fiqh', idx: 62 },
  { title: 'Talbeena Ajwa', cat: 'Healthy Food Items', idx: 63, flavor: 'Ajwa dates' },
  { title: 'Talbeena Chocolate', cat: 'Healthy Food Items', idx: 64, flavor: 'chocolate' },
  { title: 'Talbeena Kulfa', cat: 'Healthy Food Items', idx: 65, flavor: 'kulfa (traditional Indian ice cream flavor)' },
  { title: 'Talbeena Mango', cat: 'Healthy Food Items', idx: 66, flavor: 'mango' },
  { title: 'Talbeena Special', cat: 'Healthy Food Items', idx: 67, flavor: 'special premium blend' },
  { title: 'Talbeena Strawberry', cat: 'Healthy Food Items', idx: 68, flavor: 'strawberry' },
  { title: 'Talbeena Without Sugar', cat: 'Healthy Food Items', idx: 69, flavor: 'without added sugar, ideal for diabetics' },
  { title: 'Talbees-e-Iblees', cat: 'Lifestyle', idx: 70, author: 'Imam Ibn Al-Jawzi' },
  { title: 'Taleemat Quran Majeed', cat: 'Hadith', idx: 71 },
  { title: 'Talha in the Mosque', cat: 'Children', idx: 72 },
  { title: 'Talhah Bin Ubaidullah (R.A) The Living Martyr', cat: 'Companions', idx: 73 },
  { title: 'Talimat e Quran', cat: 'General', idx: 74 },
  { title: 'Tamheedi Qaidah (Art card)', cat: 'Children', idx: 75 },
  { title: 'Taqarab Ilallah', cat: 'Biography', idx: 76 },
  { title: 'Taqdeer Kay Masail', cat: 'Hadith', idx: 77 },
  { title: 'Taqwiyat al Imaan (17x24) Darsi', cat: 'Education', idx: 78, author: 'Shah Ismail Shaheed', format: '17x24 cm darsi' },
  { title: 'Taqwiyat-ul-Imaan (14x21)', cat: 'Fiqh', idx: 79, author: 'Shah Ismail Shaheed', format: '14x21 cm' },
  { title: 'Taqwiyat-ul-Iman English', cat: 'Education', idx: 80, author: 'Shah Ismail Shaheed', lang: 'English' },
  { title: 'Tarbiat-e-Aulaad', cat: 'Darussalam', idx: 81 },
  { title: 'Tarbiyati Nisaab 3 Vol Set', cat: 'Children', idx: 82, vols: 3 },
  { title: 'Tareekh e Islam 1/2 Volset', cat: 'History', idx: 83 },
  { title: 'Tareekh e Madinah Munawarah (Art Paper)', cat: 'History', idx: 84 },
  { title: 'Tareekh e Makkah Mukarramah', cat: 'History', idx: 85 },
  { title: 'Tareekh e Makkah Mukarramah (Art Paper)', cat: 'History', idx: 86 },
  { title: 'Tareekh-e-Wahabiyat Haqaiq k Ayinay Main', cat: 'History', idx: 87 },
  { title: 'Tarjuma Aur Tafseer 30 Parah', cat: 'Translation', idx: 88 },
  { title: 'Tauheed Aur Hum (Latest Edition)', cat: 'Darussalam', idx: 89 },
  { title: 'Tauheed Kay Masail', cat: 'Hadith', idx: 90 },
  { title: 'Tawheed Ki Awaaz', cat: 'Education', idx: 91 },
  { title: 'Tazkaray Meray Hazoor (SAW) kay', cat: 'Biography', idx: 92 },
  { title: 'Tazkia Nafs Kay Masail', cat: 'Hadith', idx: 93 },
  { title: 'Teen Sawal (Qissa Syedna Musa) Qasas 19/30', cat: 'Children', idx: 94, episode: 'Qasas episode 19 of 30' },
  { title: 'Tera Naqsh-e-Qadam Dekhtay Hain (Ehsan Elahi Zaheer)', cat: 'Biography', idx: 95, author: 'Ehsan Elahi Zaheer' },
  { title: 'Thaali ka Baingan', cat: 'Darussalam', idx: 96 },
  { title: 'Thali Ka Bangan', cat: 'Education', idx: 97 },
  { title: 'The Authentic Creed', cat: 'Darussalam', idx: 98, lang: 'English' },
  { title: 'The Battle Of Qadisiyyah', cat: 'History', idx: 99, lang: 'English' },
];

// ─── Detect category key ─────────────────────────────────────────────────────
function detectCatKey(product, idx) {
  const pd = PRODUCT_DATA[idx];
  if (!pd) return 'general';
  const cat = (pd.cat || '').toLowerCase();
  if (/healthy\s*food|talbeena/i.test(cat)) return 'healthy_food';
  if (/lifestyle/i.test(cat)) return 'lifestyle';
  if (/prayer\s*supplication/i.test(cat)) return 'prayer_supplication';
  if (/mushaf/i.test(cat)) return 'mushaf';
  if (/tafseer|tafsir|tafheem/i.test(cat)) return 'tafseer';
  if (/translation/i.test(cat)) return 'translation';
  if (/seerah/i.test(cat)) return 'seerah';
  if (/biography/i.test(cat)) return 'biography';
  if (/imams?\s*scholars/i.test(cat)) return 'imams_scholars';
  if (/companions/i.test(cat)) return 'companions';
  if (/women/i.test(cat)) return 'women';
  if (/hadith/i.test(cat)) return 'hadith';
  if (/fiqh/i.test(cat)) return 'fiqh';
  if (/children/i.test(cat)) return 'children';
  if (/darussalam/i.test(cat)) return 'darussalam';
  if (/history/i.test(cat)) return 'history';
  if (/education/i.test(cat)) return 'education';
  return 'general';
}

// ─── Extract product-specific detail string ──────────────────────────────────
function getProductDetail(idx, title, catKey) {
  const pd = PRODUCT_DATA[idx];
  if (!pd) return '';

  if (catKey === 'tafseer') {
    const parts = [];
    if (pd.author) parts.push(`authored by the eminent scholar ${pd.author}`);
    if (pd.lang) parts.push(`presented in ${pd.lang}`);
    if (pd.vols) parts.push(`spanning ${pd.vols} comprehensive volumes`);
    if (pd.vol) parts.push(`covering Volume ${pd.vol} of the complete series`);
    if (pd.format) parts.push(`in ${pd.format} format`);
    if (pd.parts) parts.push(`covering ${pd.parts}`);
    if (parts.length === 0) parts.push('a distinguished Quranic commentary');
    return parts.join(', ');
  }

  if (catKey === 'healthy_food') {
    const parts = [];
    parts.push(`a premium Talbeena product`);
    if (pd.flavor) parts.push(`in the delicious ${pd.flavor} flavor variety`);
    parts.push('crafted from wholesome barley and natural Sunnah ingredients');
    return parts.join(', ');
  }

  if (catKey === 'darussalam') {
    const parts = [];
    parts.push('published by the internationally respected Darussalam Publishers');
    if (pd.author) parts.push(`authored by ${pd.author}`);
    if (pd.lang) parts.push(`in ${pd.lang}`);
    if (pd.vols) parts.push(`across ${pd.vols} volumes`);
    return parts.join(', ');
  }

  const parts = [];
  if (pd.author) parts.push(`authored by ${pd.author}`);
  if (pd.lang) parts.push(`in ${pd.lang}`);
  if (pd.vols) parts.push(`in a ${pd.vols}-volume set`);
  if (pd.format) parts.push(`in ${pd.format} format`);
  if (pd.episode) parts.push(`(${pd.episode})`);
  return parts.length > 0 ? parts.join(', ') : '';
}

// ─── Templates: ALL NEW TEXT — opens 110-120 words, mids 60-70 words, closes 60-70 words ──
const T = {

  // ── TAFSEER ──
  tafseer: {
    opens: [
      'The science of Quranic exegesis represents one of the most profound and consequential intellectual traditions within Islamic civilization, serving as the essential bridge between the divine revelation contained in the Holy Quran and the understanding of human beings across every generation. This remarkable work of tafseer, titled {title}, stands as a distinguished contribution to that noble tradition, offering readers a comprehensive, meticulously researched, and spiritually enriching commentary that illuminates the meaning and significance of every passage it addresses. The commentator has drawn upon the foundational sources of classical exegetical scholarship, including the earliest tafsir works of Ibn Abbas, the monumental compilations of Al-Tabari and Ibn Kathir, and the linguistic insights of the great Arabic grammarians, synthesizing these diverse streams of knowledge into a unified, coherent commentary that serves both the specialized scholar and the general reader. Every verse is examined within its proper historical context, with careful attention to the circumstances of revelation, the relationship between successive passages, and the connections that link themes across different chapters of the Holy Quran. {product_detail}',
      'Few achievements in the field of Islamic scholarship carry the same weight and significance as a comprehensive Quranic commentary that successfully balances intellectual rigor with spiritual insight and practical relevance for contemporary readers. This esteemed tafseer, {title}, accomplishes precisely that balance, presenting the eternal message of the Holy Quran through a lens that respects the classical exegetical tradition while addressing the questions and concerns that modern Muslim readers bring to their engagement with the sacred text. The methodology employed by the commentator reflects a deep commitment to authentic Islamic scholarship, grounding every interpretation in evidence from the Quran itself, the authenticated sayings of Prophet Muhammad (peace be upon him), and the established consensus of the early Muslim community. Where multiple scholarly opinions exist on a particular verse, the commentary presents them with fairness and academic transparency, enabling readers to appreciate the richness and depth of the Islamic exegetical heritage. {product_detail}',
      'The Holy Quran, as the final and complete revelation from Allah to humanity, demands an approach to interpretation that honors its divine origin while making its guidance accessible to readers at every level of scholarly proficiency. This distinguished tafseer, {title}, answers that demand with exceptional competence, providing a commentary that is simultaneously comprehensive in its coverage, meticulous in its adherence to authentic sources, and remarkably clear in its prose style. The commentator has organized the material in a manner that facilitates both sequential study and topical reference, making this work equally valuable for the student progressing through the Quran from Al-Fatiha to An-Nas and for the researcher seeking guidance on a specific theme or legal question. The cross-referencing system connecting related verses throughout the Quran creates an interconnected reading experience that reveals the remarkable internal coherence and consistency of the divine message. {product_detail}',
      'A truly outstanding Quranic commentary must accomplish several things simultaneously: it must accurately convey the linguistic meaning of the Arabic text, situate each passage within its proper historical and revelatory context, explain the legal and ethical implications of the verses, and inspire the reader to translate that understanding into righteous action and sincere worship. This tafseer, {title}, excels on all four counts, earning its place among the most respected and widely consulted works of Quranic interpretation available to Urdu-speaking Muslims today. The commentator demonstrates a commanding mastery of the Arabic language, the principles of Islamic jurisprudence, and the vast corpus of authenticated Hadith literature, deploying each of these disciplines as needed to unlock the layers of meaning contained within the divine speech. The result is a work that enriches the mind, nourishes the soul, and equips the reader with knowledge that transforms both understanding and practice. {product_detail}',
      'The interpretation of the Holy Quran has occupied the finest minds of the Muslim Ummah for over fourteen centuries, producing a body of exegetical literature that is unparalleled in its depth, diversity, and scholarly sophistication. This tafseer, {title}, represents a worthy addition to that illustrious heritage, offering a fresh yet faithfully traditional approach to Quranic interpretation that speaks powerfully to the needs and aspirations of contemporary Muslim readers in Pakistan and beyond. What distinguishes this commentary is the commentator\'s ability to maintain rigorous scholarly standards while producing prose that is genuinely engaging and accessible, avoiding the dry academic tone that renders many tafseer works intimidating for non-specialist readers. Each section opens with the Arabic text followed by a fluent translation and then a detailed explanatory commentary that unpacks the linguistic, historical, legal, and spiritual dimensions of the passage under discussion. {product_detail}',
      'Every serious student of Islamic knowledge eventually arrives at the recognition that direct engagement with Quranic exegesis is not optional but essential — that understanding the Quran through the lens of qualified scholarly interpretation is fundamentally different from, and vastly superior to, relying on personal opinion or unguided reading. This tafseer, {title}, provides exactly the kind of qualified, well-sourced, and comprehensive interpretation that the serious student requires, covering the entire Quran with a consistency of quality and depth that reflects decades of scholarly devotion. The commentator has navigated the complex terrain of Quranic interpretation with remarkable skill, addressing linguistic subtleties, historical contexts, juristic implications, theological nuances, and spiritual insights with equal authority and clarity. The work reflects the commentator\'s deep familiarity with the entire spectrum of classical and contemporary exegetical literature, from the earliest tafsir traditions to the most recent scholarly contributions. {product_detail}',
    ],
    mids: [
      'Among the most valuable features of this commentary is its systematic treatment of the scientific and logical miracles found within the Quranic text, which the commentator explores with reference to both classical scholarly works and contemporary research. The discussion of legal rulings derived from Quranic verses follows the established methodology of the major schools of Islamic jurisprudence, presenting the reasoning behind each ruling with transparency and scholarly fairness. The comprehensive indexing system allows readers to locate discussions of specific topics, legal questions, or prophetic narratives with ease and efficiency.',
      'The physical production of this edition matches the scholarly excellence of its content, with high-quality printing on durable paper, clear typography that reduces eye strain during extended study sessions, and a sturdy binding construction designed to withstand years of regular use in homes, mosques, and Islamic educational institutions. The footnotes and marginal references provide additional layers of context and supplementary information that enrich the reader\'s understanding without disrupting the flow of the main commentary. This combination of scholarly depth and production quality makes it an ideal choice for both personal libraries and institutional collections.',
      'This tafseer pays special attention to the practical lessons and moral guidance embedded within the Quranic text, ensuring that the commentary serves not merely as an academic exercise but as a genuine guide for daily life. The commentator consistently highlights the connections between Quranic teachings and contemporary challenges, demonstrating the timeless relevance of divine guidance for Muslims navigating the complexities of modern society. Students preparing for Islamic studies examinations, imams preparing Friday sermons, and researchers investigating specific themes will all find this work to be an extraordinarily useful and reliable scholarly companion.',
      'The pedagogical structure of this commentary deserves special mention, as the commentator has organized each section to build understanding progressively from the basic literal meaning through linguistic analysis, contextual explanation, and finally the broader legal and spiritual implications of each passage. This layered approach allows readers at different levels of expertise to engage with the material at their own pace, extracting value whether they are encountering the tafseer for the first time or returning to it for the tenth time. The introduction to each surah provides essential background information including the circumstances of revelation and the central themes that unify the chapter.',
    ],
    closes: [
      'Secure your copy of this essential tafseer from Bab-ul-Fatah, Pakistan\'s premier destination for authentic Islamic scholarship. Priced at {price}, {title} delivers unmatched scholarly value for every Muslim home and institution. Place your order today for prompt, careful delivery to any location in Pakistan and experience the transformative power of genuine Quranic understanding.',
      'Elevate your Quranic study with this comprehensive tafseer available exclusively at Bab-ul-Fatah. At {price}, this edition of {title} is a worthwhile investment in enduring Islamic knowledge that will benefit your family for generations. We ship nationwide with the professionalism and attention to detail that our customers across Pakistan trust.',
      'Invest in your spiritual and intellectual growth with this authoritative Quranic commentary from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is an essential addition to every serious Islamic library. Order online now for reliable delivery across all Pakistani cities and join thousands of satisfied readers.',
      'Add this distinguished tafseer to your collection through Bab-ul-Fatah, the Islamic bookstore Pakistan trusts for quality scholarship. Available at {price}, {title} brings the depths of Quranic wisdom within your reach. Shop with confidence from our extensive catalog and enjoy fast, secure delivery.',
    ],
  },

  // ── HISTORY ──
  history: {
    opens: [
      'Islamic civilization has produced a legacy of historical scholarship that remains unmatched in its scope, rigor, and commitment to preserving the truth of human experience as shaped by divine guidance. This remarkable work of Islamic history, {title}, stands proudly within that noble tradition, offering readers a sweeping narrative that spans centuries of Muslim achievement, challenge, and resilience. From the golden age of Abbasid scholarship and the architectural marvels of Ottoman civilization to the intellectual contributions of Al-Andalus and the spiritual dynamism of the Subcontinent, every significant chapter of the Muslim historical experience is examined with thorough research, balanced analysis, and a narrative power that brings the past vividly to life for contemporary readers. The author has drawn upon primary sources including the works of Al-Tabari, Ibn Kathir, and Ibn Al-Athir, supplementing these classical accounts with modern academic research to produce a historical work that is both authoritative and engaging. {product_detail}',
      'The story of Islam is not merely a chronicle of dates, battles, and dynastic successions but a profoundly meaningful narrative of faith, perseverance, divine providence, and the ongoing struggle between truth and falsehood that continues to shape our world today. This comprehensive historical publication, {title}, captures that narrative with the literary skill of a seasoned historian and the spiritual sensitivity of a devout Muslim scholar, making it a profoundly rewarding read for anyone interested in understanding the forces that have shaped Muslim civilization and, by extension, the entire course of human history. The treatment of sensitive historical episodes reflects a commitment to honest scholarship rather than sectarian bias, presenting multiple perspectives where the historical record allows and acknowledging uncertainties where the evidence is insufficient to support definitive conclusions. This balanced, evidence-based approach makes the work suitable for readers of all backgrounds and persuasions. {product_detail}',
      'Understanding where the Muslim Ummah has been is absolutely essential for charting where it should go, and this authoritative historical work, {title}, provides exactly that understanding with scholarly precision, narrative elegance, and a depth of research that reflects decades of engagement with both primary sources and the broader academic literature on Islamic history. The author examines the rise and fall of Muslim dynasties not as isolated political events but as manifestations of deeper spiritual, intellectual, and social forces — the strength of faith that propelled early Muslim conquests, the intellectual curiosity that drove the golden age of scientific discovery, the internal divisions that weakened political unity, and the external pressures that tested the resilience of Muslim communities across every continent. Special attention is given to the history of the sacred cities of Makkah and Madinah, whose spiritual significance transcends their political importance. {product_detail}',
      'The rich tapestry of Islamic history comes alive through the pages of this exceptional publication, {title}, which presents the grand sweep of Muslim civilization with an attention to detail and a commitment to accuracy that sets it apart from the superficial surveys that dominate the popular market. Drawing upon primary sources, archaeological evidence, and the works of the greatest Muslim historians including Al-Tabari, Al-Masudi, and Ibn Khaldun, this work presents an authoritative account of the events, personalities, institutions, and ideas that have shaped fourteen centuries of Muslim civilization. The author pays particular attention to the intellectual and cultural achievements of Muslim societies — the development of Islamic law, the flourishing of philosophy and science, the masterpieces of Islamic art and architecture, and the evolution of political institutions that governed diverse populations across vast territories. {product_detail}',
    ],
    mids: [
      'This historical account goes beyond mere chronology to examine the social, cultural, and intellectual forces that drove Islamic civilization forward during its most dynamic periods and contributed to its challenges during periods of decline. The author analyzes the factors that led to periods of Muslim prosperity and the mistakes that contributed to decline, providing readers with a nuanced understanding of how faith, governance, and social cohesion interact in the rise and fall of civilizations. The prose is enriched with maps, timelines, and biographical sketches of key historical figures that bring the narrative to vivid life for every reader.',
      'A distinguishing feature of this historical work is its emphasis on the practical lessons that contemporary Muslims can derive from the experiences of their predecessors. The narrative demonstrates how the principles of Islamic governance, when faithfully applied, produced societies characterized by justice, prosperity, and intellectual vitality, while their neglect inevitably led to decline and vulnerability. The author connects these historical patterns to the contemporary situation of the Muslim Ummah, encouraging readers to learn from the past and apply its lessons to the challenges of the present. Special chapters address the contributions of Muslim women throughout history.',
    ],
    closes: [
      'Explore the magnificent heritage of Islamic civilization with this historical work from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is both an educational treasure and an inspiring read. Order now for delivery across Pakistan from your trusted Islamic bookstore.',
      'Bring home this authoritative history of Islam from Bab-ul-Fatah. At {price}, {title} offers a compelling journey through fourteen centuries of Muslim achievement. Shop online with confidence for fast, secure delivery throughout Pakistan.',
      'Order this comprehensive Islamic history from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} provides essential knowledge about the Muslim heritage. Shop now for reliable nationwide delivery.',
    ],
  },

  // ── DARUSSALAM ──
  darussalam: {
    opens: [
      'Darussalam Publishers has earned a global reputation for producing Islamic literature of the highest scholarly standards, and this edition of {title} exemplifies the quality that has made the publisher a household name among Muslim families, educational institutions, and scholarly researchers worldwide. Every aspect of production, from the accuracy of the text and the rigor of the scholarly review process to the durability of the binding and the clarity of the typography, reflects a commitment to excellence that discerning readers in Pakistan and across the Muslim world have come to expect and rely upon. The editorial team at Darussalam subjects every publication to multiple rounds of review by qualified Islamic scholars, ensuring that errors of translation, interpretation, or attribution are identified and corrected before the work reaches the reading public. This painstaking quality control process has made Darussalam one of the most trusted names in contemporary Islamic publishing. {product_detail}',
      'When Muslim readers seek authoritative, well-researched, and properly sourced Islamic publications, Darussalam consistently ranks among the most trusted names in the industry, and for excellent reasons that are reflected on every page of this remarkable work. This publication, {title}, continues that proud tradition of scholarly excellence, offering content that has been meticulously verified by qualified scholars against authentic primary sources, ensuring that readers receive knowledge they can rely upon with complete confidence in its accuracy and conformity with the teachings of Ahlus Sunnah wal Jama\'ah. The Darussalam editorial methodology draws exclusively upon the Quran, authenticated Hadith, and the consensus of classical scholars, avoiding the speculative interpretation and weak narrations that compromise the reliability of lesser publications. {product_detail}',
      'The Darussalam imprint on any Islamic publication signals a guarantee of scholarly integrity, production quality, and conformity with authentic Islamic teachings that few other publishers can match, and this edition of {title} upholds that hard-earned reputation admirably in every respect. Prepared under the supervision of a board of qualified Islamic scholars with expertise in the relevant fields of Islamic knowledge, this work represents the kind of careful, source-based publishing that has made Darussalam a preferred choice for Islamic schools, madrasas, libraries, and households across Pakistan and around the world. The physical production quality matches the scholarly excellence of the content, with clear typography, durable binding, and carefully selected paper that ensures comfortable reading and long-term preservation. {product_detail}',
    ],
    mids: [
      'What sets Darussalam publications apart in the crowded field of Islamic literature is their unwavering commitment to presenting Islam from the perspective of Ahlus Sunnah wal Jama\'ah, drawing upon the Quran, authenticated Hadith, and the established scholarly consensus of the classical period. This methodology ensures that every publication is suitable for use in Islamic schools and madrasas that seek curriculum materials aligned with traditional Sunni scholarship. The clear typography, well-organized layout, and comprehensive indexing further enhance the reading experience, allowing students, researchers, and general readers to locate information quickly and efficiently.',
      'The editorial standards maintained by Darussalam are among the most rigorous in the Islamic publishing industry, with every passage checked against its original Arabic sources by qualified ulema specializing in the relevant field of knowledge. This meticulous scholarly vetting process ensures that the final publication is free from errors of translation, misattribution, or weak sourcing that can undermine the reliability of Islamic literature. The result is a work that educators can recommend with confidence and that general readers can trust as an accurate representation of Islamic teachings.',
    ],
    closes: [
      'Purchase this Darussalam publication from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} offers the quality and reliability that Darussalam is renowned for. Order online for prompt delivery to any city in Pakistan.',
      'Order this trusted Darussalam edition from Bab-ul-Fatah Pakistan for just {price}. This title, {title}, is a valuable addition to any Islamic library. We deliver across Pakistan with the care and speed you deserve.',
    ],
  },

  // ── CHILDREN ──
  children: {
    opens: [
      'Building a strong Islamic identity in children is one of the most sacred responsibilities that Allah has entrusted to Muslim parents, and it begins with providing them the right reading material — content that entertains while it educates, inspires while it informs, and nurtures while it challenges young minds to grow in faith and understanding. This children\'s publication, {title}, has been thoughtfully composed by experienced Islamic educators to introduce young Muslims to essential Islamic knowledge through engaging narratives, colorful presentation, and age-appropriate language that captures and holds a child\'s attention from the very first page to the satisfying conclusion. The content has been carefully reviewed by qualified scholars to ensure complete conformity with authentic Islamic teachings, giving parents the confidence that their children are absorbing knowledge that is both accurate and spiritually beneficial. Every story, activity, and lesson has been designed to serve a specific educational purpose within a broader curriculum of Islamic learning that progresses naturally as the child develops. {product_detail}',
      'The formative years of a child\'s life represent the most critical window for instilling Islamic values, building moral character, and developing a personal connection with Allah and His Messenger that will sustain the child throughout the challenges of adolescence and adulthood. This publication titled {title} has been specifically designed to make the most of that precious developmental opportunity, combining the expertise of seasoned Islamic educators with child-friendly design principles and pedagogical methods that are supported by contemporary educational research. The result is a learning resource that children genuinely enjoy engaging with and that parents and teachers wholeheartedly approve of, knowing that every page contributes to the child\'s spiritual, intellectual, and moral development in a manner consistent with the teachings of Islam. The content covers the fundamental beliefs, essential worship practices, moral values, and inspirational stories that every Muslim child should know and love. {product_detail}',
      'Nurturing a love for Islam in young hearts requires far more than just textbooks and rote memorization — it requires stories that spark imagination, activities that engage young minds actively, and content that speaks to children at their own level of understanding while gradually raising that level with each successive reading. This children\'s work, {title}, delivers all three essential elements in a beautifully produced package that makes Islamic learning a highlight of every child\'s day rather than a chore to be endured. The authors understand that children learn best when they are having fun and when they can see the practical relevance of what they are learning to their own lives and experiences, and they have designed every section with these pedagogical principles firmly in mind. {product_detail}',
    ],
    mids: [
      'The educational content of this children\'s publication covers a carefully curated selection of Islamic topics including stories of the prophets and their remarkable encounters with faith and trial, basic duaa for daily situations that children encounter regularly, Islamic manners and etiquette that promote good character, and the fundamental articles of faith that every Muslim child should understand and embrace. Each topic is presented through a winning combination of narrative text, visual elements, interactive prompts, and review questions that encourage children to think deeply about what they have read and apply the lessons to their own lives.',
      'Parents and teachers will particularly appreciate the way this publication integrates moral lessons into engaging stories rather than presenting them as dry rules to be memorized without understanding. Children learn about honesty through the inspiring examples of the prophets, about kindness and generosity through stories of the Companions, and about courage and steadfastness through accounts of early Muslim heroes who sacrificed everything for the sake of Islam. This story-based approach to character education has been shown by educational researchers to be far more effective than direct instruction, as children naturally identify with the characters and internalize the values they demonstrate.',
    ],
    closes: [
      'Give your children the joy of Islamic learning with this book from Bab-ul-Fatah Pakistan. At just {price}, {title} is an affordable investment in your child\'s spiritual development. Order online and receive fast delivery across all Pakistani cities.',
      'Shop for this engaging children\'s book at Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} makes Islamic education fun and meaningful. Order today and inspire your child\'s faith journey.',
    ],
  },

  // ── WOMEN ──
  women: {
    opens: [
      'Addressing the spiritual, practical, and emotional needs of Muslim women with sensitivity, scholarly depth, and genuine understanding is the hallmark of this remarkable publication, {title}. In a publishing landscape where works addressing women\'s issues in Islam are often either too simplistic to be genuinely useful or unnecessarily controversial to be reliably authentic, this book strikes the perfect balance, offering guidance rooted firmly in authentic Islamic sources — the Quran, the authenticated Hadith, and the established scholarly consensus — that empowers women to navigate modern life with confidence, dignity, and unwavering faith in Allah\'s wisdom. The author demonstrates a profound understanding of the unique challenges facing Muslim women in contemporary Pakistani society, including the tension between traditional expectations and modern opportunities, the challenges of maintaining spiritual focus amid domestic and professional responsibilities, and the need for authentic Islamic guidance on matters that are seldom addressed openly or adequately in existing literature. {product_detail}',
      'Muslim women deserve access to Islamic scholarship that speaks directly to their experiences, addresses their specific concerns, and honors their aspirations for spiritual growth, personal development, and meaningful contribution to their families and communities. This work titled {title} delivers precisely that kind of targeted, relevant, and empowering scholarship, providing practical, evidence-based guidance on matters of faith, family life, personal development, and community engagement that resonates deeply with readers across Pakistan and the wider Muslim world. Drawing upon the Quran, the authenticated sayings of Prophet Muhammad (peace be upon him), and the exemplary lives of the female Companions and scholars of Islam, it presents a comprehensive picture of women\'s status, rights, and responsibilities that is both spiritually uplifting and firmly grounded in divine revelation. {product_detail}',
    ],
    mids: [
      'This publication covers an impressive and well-organized range of topics relevant to Muslim women, including personal worship and spiritual development strategies, family life and marital relations, the Islamic perspective on modesty and hijab, women\'s rights in inheritance and property ownership, the inspiring examples of female scholars throughout Islamic history, and practical advice for balancing religious obligations with professional and domestic responsibilities. Each topic is addressed with extensive referencing to Quranic verses and authenticated Hadith, giving readers complete confidence in the authenticity and reliability of every piece of guidance offered throughout the work.',
      'The author has taken particular care to present the rich and often overlooked contributions of Muslim women throughout history, highlighting the achievements of female scholars, educators, and community leaders whose stories deserve to be known and celebrated by contemporary Muslims. By restoring these narratives to their rightful place in the Islamic historical record, this work inspires modern Muslim women to pursue excellence in every field of endeavor while remaining firmly anchored to their faith and values. The prose style is elegant and accessible throughout.',
    ],
    closes: [
      'Order this essential publication for Muslim women from Bab-ul-Fatah Pakistan. At {price}, {title} is a valuable resource for every Muslim household. Shop online for delivery to any city across Pakistan.',
      'Get this insightful book from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Priced at {price}, {title} offers guidance that every Muslim woman will appreciate. Order now for reliable nationwide delivery.',
    ],
  },

  // ── HADITH ──
  hadith: {
    opens: [
      'The science of Hadith stands as one of Islam\'s most extraordinary intellectual achievements, a discipline through which Muslim scholars preserved the words and actions of Prophet Muhammad (peace be upon him) with an accuracy that is genuinely unmatched by any other historical tradition in human civilization. This important work titled {title} upholds that proud legacy of Hadith scholarship, presenting authenticated Prophetic traditions in a format that serves both scholarly research and practical daily guidance for Muslims throughout Pakistan who seek to align their lives with the Sunnah of Allah\'s Messenger. The narrations have been carefully selected from the most reliable Hadith collections and organized thematically to facilitate quick reference and systematic study. The compiler has applied the rigorous principles of Hadith authentication established by the great Imams of this science, evaluating each narration\'s chain of transmission with the meticulous care that this sacred trust demands. {product_detail}',
      'Access to authentic Prophetic traditions is the birthright of every Muslim and an essential prerequisite for practicing Islam in the manner that Allah and His Messenger have prescribed. This publication, {title}, makes that access more convenient, comprehensive, and user-friendly than ever before, carefully compiling authenticated narrations with strict attention to the principles of Hadith verification established by the great scholars of this noble science. Every Hadith included in this collection has been checked against its original Arabic source, its chain of transmission has been examined for completeness and reliability, and its text has been verified for accuracy. The result is a collection that readers can consult with complete confidence, knowing that every narration meets the highest standards of authenticity that Islamic scholarship demands. {product_detail}',
    ],
    mids: [
      'This Hadith collection has been organized with careful attention to the practical needs of contemporary Muslim readers, grouping narrations by theme so that guidance on specific topics can be located quickly and efficiently during daily life. Topics covered include the pillars of Islam, righteous conduct, family life, business ethics, dietary laws, the virtues of various acts of worship, and the warnings against spiritual pitfalls and moral corruption. Each Hadith is accompanied by explanatory notes that clarify unfamiliar terms, provide historical context, and highlight the practical lessons embedded within the narration.',
      'The compiler has demonstrated exceptional scholarly judgment in the selection and presentation of Hadith, prioritizing narrations that address the most pressing questions facing Muslims today while maintaining comprehensive coverage of the essential teachings of the Prophet (peace be upon him). The chain analysis for each narration follows the methodology established by the great Hadith scholars of the classical period, with careful attention to the character, reliability, and scholarly standing of each narrator. This makes the work valuable for students of Islamic studies.',
    ],
    closes: [
      'Order this essential Hadith collection from Bab-ul-Fatah Pakistan. At {price}, {title} offers access to authentic Prophetic guidance. We deliver across all Pakistani cities with care and reliability.',
      'Bring the blessed traditions of the Prophet into your home with this edition from Bab-ul-Fatah. Priced at {price}, {title} is an invaluable Islamic resource. Shop online for fast, secure nationwide delivery.',
    ],
  },

  // ── COMPANIONS ──
  companions: {
    opens: [
      'The Companions of Prophet Muhammad (peace be upon him) represent the finest generation of human beings ever to walk the earth, men and women who sacrificed their wealth, their families, and ultimately their lives for the sake of Islam and whose luminous example continues to illuminate the path of righteousness for Muslims in every age and every corner of the world. This work titled {title} brings their extraordinary stories to life with narrative skill and scholarly precision, allowing readers to draw deep inspiration and practical lessons from these heroic lives that transformed human history forever. The author has drawn primarily upon the most authentic historical sources, including the works of Ibn Sa\'d, Ibn Asakir, Al-Bukhari, and Muslim, supplementing these with authenticated Hadith that highlight the Prophet\'s personal praise for each Companion, ensuring that the portraits presented here are both historically accurate and spiritually uplifting. {product_detail}',
      'Learning about the Sahabah is not merely an exercise in historical curiosity but a spiritual necessity for every Muslim who wishes to understand Islam in its purest, most dynamic, and most transformative form — the form in which it was practiced by those who learned it directly from the Prophet (peace be upon him) and who sacrificed everything to preserve and transmit it to subsequent generations. This publication, {title}, presents the lives of the noble Companions with the reverence they deserve, drawing upon the most authentic historical sources to paint vivid portraits of faith, courage, generosity, wisdom, and unwavering commitment to divine guidance that set the standard for every generation of Muslims that has followed. Their examples of patience in adversity, courage in battle, generosity in prosperity, and wisdom in governance provide timeless models of Islamic character. {product_detail}',
    ],
    mids: [
      'This work provides detailed biographical accounts of the Companions, including their family backgrounds before Islam, the powerful circumstances of their conversion, their varied and remarkable contributions to the early Muslim community, and the lasting impact of their example on subsequent generations of Muslims throughout history. The author has arranged the accounts chronologically and thematically, enabling readers to trace the development of the early Muslim community through the individual stories of the extraordinary men and women who built it from nothing into the greatest civilization the world had ever seen.',
      'Among the most valuable aspects of this publication is its consistent attention to the practical lessons that can be derived from the lives of the Companions and applied to the challenges facing contemporary Muslims. Their example of complete trust in Allah during times of extreme hardship, their willingness to forgive personal grievances for the sake of Muslim unity, and their relentless pursuit of knowledge even while managing the affairs of a rapidly expanding empire are lessons that speak directly to the condition of the modern Muslim Ummah.',
    ],
    closes: [
      'Discover the inspiring lives of Islam\'s greatest generation with this book from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is essential reading for every Muslim. Order online for delivery across Pakistan.',
      'Order this captivating work on the Companions from Bab-ul-Fatah, your trusted Islamic bookstore. At {price}, {title} brings the Sahabah\'s legacy to your fingertips. Shop now for nationwide delivery.',
    ],
  },

  // ── BIOGRAPHY ──
  biography: {
    opens: [
      'The lives of great Islamic scholars and personalities offer a wellspring of wisdom, inspiration, and practical guidance for contemporary Muslims seeking to navigate the complex challenges of modern life with unwavering faith, intellectual integrity, and moral resilience. This biographical work, {title}, presents a meticulously researched account that goes far beyond surface-level facts to reveal the character, motivations, spiritual depth, and lasting intellectual contributions of its distinguished subject. The author has consulted a wide range of primary and secondary sources, including the subject\'s own writings, the testimonies of contemporaries and students, and the scholarly evaluations of later researchers, to produce an account that is simultaneously comprehensive, balanced, and engaging for readers at every level of familiarity with the subject. Special attention is given to the intellectual and spiritual journey that shaped the subject\'s scholarly output, revealing the personal struggles, epiphanies, and formative experiences that transformed a student of knowledge into a recognized authority. {product_detail}',
      'Biographical literature occupies a cherished and central place in the Islamic intellectual tradition, serving as both a record of scholarly achievement and a source of practical guidance for those who aspire to follow in the footsteps of the great scholars who have illuminated the path of the Ummah throughout its history. This publication titled {title} continues that noble tradition with distinction, offering readers an intimate and revealing portrait of a remarkable Muslim figure whose life and work continue to exert a profound influence on Islamic thought and practice. The narrative traces the complete arc of the subject\'s life, from early education and spiritual formation through the flowering of scholarly achievement to the lasting legacy that continues to inspire and guide Muslims worldwide. {product_detail}',
    ],
    mids: [
      'The enduring relevance of this biographical work lies in its ability to connect the historical experience of its subject with the contemporary concerns of Muslim readers who face their own challenges in pursuing knowledge, maintaining faith, and contributing meaningfully to their communities. The challenges faced by Islamic scholars in their pursuit of knowledge, their courageous engagement with social and political issues, and their unwavering commitment to truth and justice regardless of personal consequence are themes that resonate powerfully with Muslims today.',
      'This biography traces the complete arc of its subject\'s life, from early education and spiritual formation through the flowering of scholarly achievement to the lasting legacy that continues to influence Muslims worldwide. The author has consulted a wide range of primary and secondary sources to produce an account that is both comprehensive and balanced. Special attention is given to the intellectual contributions that made this figure significant, as well as the personal qualities that earned them the respect and love of their students and colleagues.',
    ],
    closes: [
      'Explore the life of an extraordinary Muslim figure with this biography from Bab-ul-Fatah Pakistan. At {price}, {title} offers both inspiration and knowledge. Order online for delivery to any city in Pakistan.',
      'Order this insightful biographical work from Bab-ul-Fatah, the Islamic bookstore Pakistan relies upon. Priced at {price}, {title} is a rewarding read. Shop with confidence for fast nationwide delivery.',
    ],
  },

  // ── PRAYER SUPPLICATION ──
  prayer_supplication: {
    opens: [
      'Duaa (supplication) is the essence of worship in Islam — the intimate, personal conversation between a believing servant and their All-Merciful Creator that Prophet Muhammad (peace be upon him) described as the weapon of the believer and the essence of devotion. This comprehensive work, {title}, serves as an indispensable treasury of authenticated supplications drawn directly from the Quran and the Prophetic tradition, providing Muslims throughout Pakistan with a reliable, well-organized, and thoroughly referenced guide for invoking Allah\'s mercy, seeking His guidance, and requesting His protection in every situation that human life presents. The compilers have taken extraordinary care to ensure that every duaa included in this collection is sourced from authenticated Hadith collections, with full references provided for each narration so that readers can verify its authenticity for themselves and consult the original source for additional context and related supplications. The supplications are organized by occasion and topic to facilitate quick reference during daily life. {product_detail}',
      'The power of sincere duaa to transform circumstances, heal physical and spiritual ailments, and bring profound comfort to troubled hearts is affirmed repeatedly throughout the Quran and demonstrated vividly throughout Islamic history by the experiences of the prophets, the Companions, and countless generations of faithful believers. This publication titled {title} compiles one of the most authentic and comprehensive collections of Islamic supplications available in print today, including duaa for healing through Ruqya as specifically prescribed by Prophet Muhammad (peace be upon him), making it an essential companion for every Muslim household that seeks the protection and blessings of Allah through the proven spiritual remedies of the Prophetic tradition. The section on Ruqya provides the authentic Quranic verses and Prophetic supplications recommended for spiritual healing and protection from harm. {product_detail}',
    ],
    mids: [
      'This supplication collection has been meticulously sourced from the major authenticated Hadith collections, with each duaa accompanied by its reference to the original source and, where relevant, an explanation of the proper method and timing prescribed by the Prophet (peace be upon him). The supplications cover every aspect of daily life including waking and sleeping, entering and leaving the home, beginning and ending meals, traveling, seeking relief from illness, asking for forgiveness, and preparing for prayer. The Arabic text is presented alongside clear translations and transliterations.',
      'The compilers have taken special care to include the full text of each supplication in its original Arabic alongside clear translations, enabling readers who are not fluent in Arabic to understand the meaning and pronounce the duaa correctly. Explanatory notes clarify the significance of less familiar supplications and provide context for their use in specific situations. The portable and practical format makes it convenient to carry this collection for reference throughout the day.',
    ],
    closes: [
      'Strengthen your connection with Allah through this duaa collection from Bab-ul-Fatah Pakistan. At {price}, {title} is a must-have for every Muslim home. Order online for delivery across Pakistan.',
      'Order this essential supplication guide from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} puts Prophetic duaa at your fingertips. Shop now for fast nationwide delivery.',
    ],
  },

  // ── FIQH ──
  fiqh: {
    opens: [
      'Practical Islamic guidance rooted firmly in the Quran and authentic Sunnah is the indispensable foundation upon which every Muslim builds their daily life of worship, conduct, and interaction with society, and this comprehensive work, {title}, provides exactly that foundation with clarity, comprehensiveness, and scholarly reliability that makes it one of the most trusted fiqh references available to readers in Pakistan today. Addressing the real-world questions that Muslims encounter in their daily worship, financial transactions, family relationships, and social interactions, it serves as an essential reference for every household that seeks to live according to divine guidance in a manner that is both practically informed and spiritually sincere. The author has drawn upon the established methodologies of Islamic jurisprudence while maintaining a practical orientation that connects legal rulings to the actual situations that readers face in their daily lives. {product_detail}',
      'The application of Islamic law to the myriad situations of daily life requires reliable, well-sourced, and practically oriented guidance that respects both the letter and the spirit of the Shariah as revealed by Allah and exemplified by His Messenger (peace be upon him). This publication titled {title} delivers that essential guidance in a format that is both thorough enough for qualified scholars and accessible enough for general readers, making it an invaluable resource for Islamic schools, study circles, and personal reference libraries throughout Pakistan. Each ruling is supported by evidence from the Quran and authenticated Hadith, with references to the positions of the recognized schools of Islamic jurisprudence presented with fairness and scholarly transparency. {product_detail}',
    ],
    mids: [
      'This fiqh reference addresses the essential topics that every Muslim needs to understand and practice correctly, including the conditions and pillars of ritual purification, the proper performance of the five daily prayers, the rules governing fasting in Ramadan, the calculations and procedures for Zakat, and the conditions and rituals of Hajj and Umrah. Beyond the pillars of Islam, it covers important topics such as marriage and family law, business transactions and contracts, inheritance regulations, dietary laws, and contemporary issues that require fiqh analysis.',
      'What makes this work particularly valuable for everyday use is its practical orientation and user-friendly format. The question-and-answer structure adopted in several sections allows readers to quickly find clear answers to specific fiqh questions without reading through lengthy theoretical discussions. This approach, combined with the scholarly rigor of the content, makes the work suitable for use in Islamic schools, study circles, and personal reference. The clear organizational structure and comprehensive indexing ensure efficient navigation.',
    ],
    closes: [
      'Get this practical fiqh reference from Bab-ul-Fatah Pakistan. At {price}, {title} provides reliable Islamic guidance for daily life. Order online for delivery to any city in Pakistan.',
      'Order this authoritative Islamic jurisprudence guide from Bab-ul-Fatah, your trusted Islamic bookstore. Priced at {price}, {title} answers the fiqh questions every Muslim needs. Shop now.',
    ],
  },

  // ── EDUCATION ──
  education: {
    opens: [
      'The pursuit of Islamic knowledge is a lifelong obligation upon every Muslim, male and female, and having access to well-structured, academically sound, and pedagogically effective educational materials is essential for fulfilling that obligation in a manner that is both personally enriching and socially beneficial. This educational work titled {title} has been carefully designed to serve as a comprehensive learning resource that supports both formal classroom instruction and self-directed study, making it an invaluable tool for students, educators, and institutions across Pakistan. The content has been prepared by qualified scholars and reviewed by experienced educators to ensure both accuracy of information and effectiveness of presentation, reflecting a commitment to producing educational materials of the highest quality that meet international standards of Islamic publishing. The systematic approach builds understanding progressively. {product_detail}',
      'Islamic education encompasses far more than the memorization of facts and the recitation of texts — it involves the development of a comprehensive and nuanced understanding of faith, the cultivation of critical thinking skills grounded in Islamic methodology, and the nurturing of a personal, heartfelt connection with divine knowledge that transforms both intellect and character. This publication, {title}, advances that holistic vision of Islamic education through its carefully structured content, engaging and accessible presentation, and unwavering commitment to academic accuracy and conformity with authentic Islamic teachings. The authors bring together extensive experience in both Islamic scholarship and modern pedagogical methods, creating a resource that bridges the gap between traditional Islamic learning and contemporary educational best practices. {product_detail}',
    ],
    mids: [
      'This educational publication covers its subject matter with a systematic approach that builds understanding progressively, beginning with foundational concepts and advancing to more complex topics as the student\'s knowledge deepens. The content is enriched with examples, exercises, and review questions that reinforce learning and encourage critical engagement with the material. Topics are presented with proper referencing to Quranic verses and authenticated Hadith, instilling in students the habit of evidence-based reasoning that is central to Islamic scholarship.',
      'The authors and editors bring together extensive experience in both Islamic scholarship and modern pedagogical methods, creating a resource that bridges the gap between traditional Islamic learning and contemporary educational best practices. Special attention has been given to presenting information in a format that accommodates different learning styles, with clear headings, bullet points, and visual aids that support comprehension and retention for students at every level.',
    ],
    closes: [
      'Invest in quality Islamic education with this work from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is ideal for students and educators alike. Order online for fast delivery across Pakistan.',
      'Order this comprehensive educational resource from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} supports effective Islamic learning. Shop with confidence for nationwide delivery.',
    ],
  },

  // ── MUSHAF ──
  mushaf: {
    opens: [
      'The Holy Quran is the literal, uncreated word of Allah preserved eternally and protected from any alteration or corruption by divine promise, and possessing a beautifully printed, accurately typeset copy is both a cherished privilege and a solemn responsibility that every Muslim household recognizes and honors. This edition of {title} has been produced with meticulous attention to every detail of script, diacritical marks, verse boundaries, and page layout, ensuring a recitation experience that is both spiritually uplifting and visually satisfying for readers of all ages and proficiency levels. The text has been checked multiple times by qualified Huffaz and Quranic scholars to guarantee absolute accuracy in every word, letter, vowel mark, and stop sign, meeting the exacting standards required for a Mushaf that can be relied upon for both personal recitation and formal worship. The premium paper quality ensures opacity and durability, while the clear typography reduces eye strain during extended recitation sessions. {product_detail}',
      'A quality Mushaf is not merely a book on a shelf — it is a sacred companion that accompanies a Muslim through every stage of life, from the first hesitant recitations of childhood and the earnest memorization efforts of youth to the fluent, contemplative recitations of maturity and the quiet devotional reading of old age. This edition of {title} has been specifically designed and carefully produced to serve as that lifelong companion, with durable binding and clear formatting that ensure readability and structural integrity through years of daily use in homes, mosques, Islamic schools, and study circles. Whether used for personal recitation and reflection, formal hifz memorization programs, or as a meaningful gift for a loved one embarking on their Quranic journey, this edition meets the highest standards of Quranic publishing and represents a worthy vessel for the sacred words of Allah. {product_detail}',
    ],
    mids: [
      'The text of this edition has been verified multiple times by qualified Huffaz who have memorized the entire Quran, ensuring that every letter, vowel mark, and tajweed indicator is precisely placed according to the accepted recitation standards. The generous spacing between words and lines facilitates smooth recitation and reduces eye fatigue during extended reading or memorization sessions. The clear surah headings, juz markers, and sajda indicators help readers maintain their place during both individual and group study, making this edition particularly well-suited for students engaged in hifz programs.',
      'This edition is particularly well-suited for students engaged in Quran memorization and for anyone who recites the Quran regularly as part of their daily worship. The format has been chosen for its readability and visual appeal, while the paper quality has been selected for its opacity and durability. The durable binding provides the structural integrity needed for daily transport to mosques, schools, and study circles, making it a practical and beautiful choice for serious students of the Holy Quran.',
    ],
    closes: [
      'Order this premium Quran edition from Bab-ul-Fatah Pakistan. At {price}, {title} offers exceptional quality for daily recitation and study. Shop online for delivery across all Pakistani cities.',
      'Purchase this beautifully produced Mushaf from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is crafted with care and precision. Order now for reliable nationwide delivery.',
    ],
  },

  // ── TRANSLATION ──
  translation: {
    opens: [
      'The translation of the Holy Quran into accessible language opens the doors of divine wisdom to millions of Muslims who seek to understand the meaning and message of Allah\'s final revelation in the language they know best, and this translation titled {title} has been prepared by scholars who combine deep expertise in Quranic Arabic with a masterful command of the target language, producing a rendering that is both faithful to the original meaning and gracefully expressed in prose that does justice to the beauty and power of the divine speech. The translators have followed established principles of Quranic translation that prioritize accuracy of meaning over literal word-for-word rendering, ensuring that the theological precision, legal implications, and spiritual depth of the original text are preserved and communicated effectively to readers who rely on translation for their understanding of the Quran. Footnotes address linguistic subtleties, alternative interpretations, and essential contextual information. {product_detail}',
      'Bridging the linguistic divide between classical Quranic Arabic and contemporary readers is one of the most important and consequential services that Islamic scholarship can render to the Muslim Ummah, and this work, {title}, accomplishes that vital service with distinction and reliability. The translation maintains a careful balance between literal accuracy and literary readability, ensuring that the beauty and power of the Quranic message are preserved in every sentence while remaining accessible to readers who may not have advanced training in Arabic language or Islamic studies. This makes the work particularly valuable for new Muslims, young readers, and anyone who wishes to engage more deeply with the meaning of the Quran in a language they understand thoroughly. {product_detail}',
    ],
    mids: [
      'This translation has been prepared following established principles of Quranic translation that prioritize accuracy of meaning over literal word-for-word rendering. Where a direct translation would obscure the meaning, the translator has used explanatory phrases that convey the intended sense while remaining true to the original text. The translation is accompanied by footnotes that address linguistic subtleties, alternative interpretations, and contextual information that enhances the reader\'s understanding of complex or commonly misunderstood passages.',
      'The publisher has invested considerable effort in the physical production of this translation, ensuring that the text is presented in a clear, readable format with proper formatting of verse numbers, surah headings, and other navigational aids. The durable binding ensures the publication will withstand regular use over many years. This translation is particularly recommended for Islamic study circles where participants benefit from having a reliable, well-formatted translation alongside the Arabic text.',
    ],
    closes: [
      'Order this reliable Quran translation from Bab-ul-Fatah Pakistan. At {price}, {title} makes the Quran\'s message accessible and clear. Shop online for delivery to any city in Pakistan.',
      'Get this authoritative translation from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is a trustworthy rendering of the Holy Quran. Order now for nationwide delivery.',
    ],
  },

  // ── HEALTHY FOOD / TALBEENA ──
  healthy_food: {
    opens: [
      'The Prophetic tradition of consuming wholesome, natural foods for health, vitality, and spiritual well-being has been validated by both centuries of Muslim experience and modern nutritional science, and this premium Talbeena product from Bab-ul-Fatah brings that blessed Sunnah directly to your family\'s table in a convenient and delicious format. Crafted from authentic Prophetic ingredients including premium quality barley, pure honey, and carefully selected natural flavorings, this Talbeena product offers a genuinely enjoyable way to follow the health practices recommended by Prophet Muhammad (peace be upon him) for physical strength, mental clarity, digestive wellness, and sustained energy throughout the day. Talbeena holds a special place in Prophetic medicine (Tibb al-Nabawi), being specifically recommended by the Prophet (peace be upon him) for its remarkable health benefits and its comforting, soothing properties that bring relief to both body and soul. {product_detail}',
      'Returning to the Sunnah of the Prophet (peace be upon him) in matters of food and health is one of the simplest yet most profoundly impactful changes a Muslim family can make for their collective physical and spiritual wellbeing, and this premium Talbeena product represents exactly that return to authentic Prophetic nutrition. Prepared according to the traditional Sunnah recipe using the finest quality barley and enriched with wholesome natural ingredients, this Talbeena provides the authentic taste and complete nutritional benefits that have nourished Muslim families for over fourteen centuries since the time of the Prophet (peace be upon him). The Prophet specifically recommended Talbeena for its ability to bring comfort to the grieving heart, strengthen the body, and provide sustained energy that lasts throughout the day, making it an ideal breakfast or nutritious snack. {product_detail}',
      'The blessed Prophet Muhammad (peace be upon him) said that Talbeena brings comfort to the heart and relieves sadness, and this premium product delivers that comforting Prophetic remedy in a convenient, ready-to-prepare format that fits seamlessly into the busy routines of modern Muslim families. Made from the highest quality barley and enriched with natural, wholesome ingredients, this Talbeena product is the perfect way to start your day with both physical nourishment and a meaningful spiritual connection to the blessed dietary practices of Allah\'s Messenger (peace be upon him). Barley — the core ingredient of Talbeena — has been recognized by both traditional Islamic medicine and modern nutritional science as an exceptional source of sustained energy, dietary fiber, essential minerals, and beneficial compounds that support overall health and vitality. {product_detail}',
    ],
    mids: [
      'This Talbeena product is made from the highest quality ingredients sourced with great care and prepared under strict hygienic conditions to ensure both safety and authenticity of the traditional recipe. The base ingredient — premium barley — provides sustained energy, dietary fiber, and essential minerals that support digestive health and overall vitality. The addition of natural flavors and wholesome sweeteners from honey and dates creates a delicious variety of taste experiences while maintaining the nutritional integrity of the original Sunnah recipe. Preparation is quick and convenient — simply mix with warm water or milk for a nutritious meal in minutes.',
      'Each flavor variant of this Talbeena range has been carefully developed to cater to different tastes while preserving the core nutritional benefits of the traditional Prophetic recipe. The natural sweetening comes primarily from honey and dates, following authentic Sunnah practice, while the carefully selected flavorings add variety without compromising the health benefits that make Talbeena such a valued part of Prophetic nutrition. The convenient packaging ensures freshness and easy storage, making it simple to keep this wholesome Sunnah food stocked in your kitchen for the whole family to enjoy regularly.',
    ],
    closes: [
      'Nourish your family with this Sunnah Talbeena from Bab-ul-Fatah Pakistan. At just {price}, it\'s an affordable way to follow Prophetic dietary practices. Order online for delivery across Pakistan.',
      'Try this wholesome Talbeena from Bab-ul-Fatah, Pakistan\'s trusted source for Sunnah food products. Priced at {price}, it combines Prophetic nutrition with great taste. Shop now for fast nationwide delivery.',
    ],
  },

  // ── LIFESTYLE ──
  lifestyle: {
    opens: [
      'Navigating the spiritual dangers of modern life requires awareness, knowledge, and the guidance of scholars who understand both the timeless principles of Islam and the contemporary challenges facing Muslims in an era of unprecedented moral and spiritual confusion. This powerful work, {title}, provides exactly that guidance, exposing the subtle and often insidious strategies through which moral and spiritual corruption spreads in society and equipping readers with the knowledge and spiritual tools needed to protect themselves, their families, and their communities from these pervasive threats to faith and moral integrity. The author draws upon Quranic warnings, authenticated Hadith, and the scholarly works of classical Islamic thinkers to provide readers with a comprehensive understanding of the spiritual battlefield in which every Muslim is engaged, whether they realize it or not. {product_detail}',
      'The struggle between truth and falsehood is as old as humanity itself, and this publication titled {title} examines that eternal struggle through the lens of Islamic scholarship, revealing the tactics employed by the enemies of truth throughout history and in the present day with a clarity and analytical precision that is both enlightening and deeply sobering. The author demonstrates how falsehood is presented as truth, how deviation from Islamic principles is gradually normalized in society, and how the hearts and minds of believers can be slowly turned away from authentic Islamic teachings through seemingly innocent cultural influences, media messaging, and intellectual trends that appear harmless on the surface but carry profound spiritual consequences. {product_detail}',
    ],
    mids: [
      'This work provides a systematic analysis of the methods through which falsehood is presented as truth and deviation from Islamic teachings is gradually normalized in contemporary society. The author identifies specific strategies including the manipulation of information, the appeal to base desires, the gradual erosion of moral boundaries, and the exploitation of intellectual and emotional vulnerabilities. For each strategy, the work prescribes Quranic and Prophetic remedies — spiritual practices, mental disciplines, and behavioral guidelines — that strengthen the believer\'s defenses.',
      'Readers will gain not only awareness of the spiritual dangers that surround them but also practical tools for building and maintaining spiritual resilience in the face of these challenges. The author emphasizes the importance of surrounding oneself with righteous company, maintaining a consistent program of worship, seeking knowledge from authentic sources, and cultivating critical thinking about media messages. The work is written in a clear, engaging style that makes complex ideas accessible.',
    ],
    closes: [
      'Arm yourself with knowledge by ordering this book from Bab-ul-Fatah Pakistan. At {price}, {title} is essential reading for every Muslim in today\'s world. Shop online for delivery across Pakistan.',
      'Order this impactful publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers vital spiritual awareness. Order now for fast nationwide delivery.',
    ],
  },

  // ── SEERAH ──
  seerah: {
    opens: [
      'The blessed life of Prophet Muhammad (peace be upon him) remains the ultimate source of guidance, inspiration, and moral direction for every Muslim seeking to understand what it truly means to live in complete submission to Allah\'s will and to embody the noble qualities that defined the best of creation. This work titled {title} presents the Prophetic biography with a fresh narrative approach that draws upon the most authenticated historical sources while speaking directly to the concerns, challenges, and aspirations of contemporary Muslims in Pakistan and throughout the Muslim world. The author has crafted a seerah that transcends the conventional boundaries of biographical writing, offering readers not merely a chronicle of events but a transformative spiritual journey through the life of Allah\'s final Messenger that deepens faith, strengthens moral character, and renews the reader\'s commitment to following the Prophetic example in every dimension of daily life. {product_detail}',
      'From the divine selection of Muhammad (peace be upon him) for prophethood through the extraordinary trials of the Makkan period, the establishment of the Islamic state in Madinah, the series of battles that tested the faith and resolve of the early Muslim community, and the triumphant conquest of Makkah to the Prophet\'s final farewell sermon — every chapter of the Prophetic seerah contains lessons of profound relevance for Muslims navigating the challenges of contemporary life. This work, {title}, presents those lessons with scholarly precision and narrative power, drawing upon the most authoritative historical sources including the works of Ibn Ishaq, Ibn Hisham, and authenticated Hadith from the major collections to create a seerah that is both academically rigorous and deeply moving. {product_detail}',
    ],
    mids: [
      'This seerah draws primarily upon the most authoritative historical sources including the works of Ibn Ishaq, Ibn Hisham, Al-Waqidi, and other early biographers, supplemented by authenticated Hadith from the major collections of Bukhari, Muslim, Abu Dawud, and Tirmidhi. The narrative follows a chronological structure that allows readers to trace the development of the Prophetic mission from its earliest days through the establishment of the Islamic state. Special attention is given to the social, political, and spiritual dimensions of key events.',
      'What elevates this biography beyond a conventional historical narrative is its consistent emphasis on the practical lessons that contemporary Muslims can derive from every phase of the Prophetic life. The author analyzes the Prophet\'s leadership style, his approach to conflict resolution, his treatment of allies and adversaries, his compassion for the vulnerable, and his unwavering trust in Allah\'s plan, demonstrating how these qualities can be cultivated in the lives of ordinary Muslims today.',
    ],
    closes: [
      'Deepen your connection with the Prophet\'s life through this seerah from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is an essential biography for every Muslim. Order online for delivery across Pakistan.',
      'Order this comprehensive biography from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} brings the Prophetic era to life. Shop now for fast, reliable nationwide delivery.',
    ],
  },

  // ── IMAMS SCHOLARS ──
  imams_scholars: {
    opens: [
      'The luminaries of Islamic scholarship have served as the faithful guardians of divine knowledge throughout the centuries, preserving, interpreting, and transmitting the teachings of Islam with a dedication and sincerity that has ensured the survival of authentic Islamic knowledge through every trial, tribulation, and challenge that history has presented. This important work titled {title} pays tribute to that extraordinary scholarly heritage by documenting the lives, intellectual contributions, and enduring legacy of the great Imams and scholars who have shaped Islamic thought and guided the Muslim Ummah through every era of its history. The author has drawn upon a wide range of primary biographical sources including the works of Al-Dhahabi, Ibn Hajar Al-Asqalani, and Al-Suyuti to produce accounts that are both comprehensive and academically sound, highlighting the scholarly methodology and distinctive contributions of each figure. {product_detail}',
      'The contributions of Islamic scholars extend far beyond the boundaries of religious knowledge into virtually every field of human endeavor including philosophy, science, mathematics, medicine, literature, governance, and social organization. This comprehensive publication, {title}, provides a detailed account of the scholarly tradition in Islam, highlighting the intellectual achievements, personal sacrifices, spiritual qualities, and lasting institutional legacies of the men and women whose scholarship has illuminated the path of the Ummah for over fourteen centuries. Learning about these great scholars inspires a deep appreciation for the intellectual richness of the Muslim heritage and motivates contemporary Muslims to pursue knowledge with the same dedication, sincerity, and reverence for truth that characterized these extraordinary individuals. {product_detail}',
    ],
    mids: [
      'This work presents detailed accounts of the lives and contributions of major Islamic scholars, including their educational backgrounds, principal teachers, key students, major written works, and the lasting impact of their scholarship on subsequent generations of Muslim thinkers and practitioners. Special attention is given to the scholarly methodology and distinctive contributions of each figure, enabling readers to appreciate the diversity and richness of the Islamic intellectual tradition. The author highlights the personal qualities of sincerity, humility, and perseverance that enabled scholarly achievement.',
      'The enduring value of studying the lives of Islamic scholars lies not only in appreciating their intellectual achievements but in understanding the personal qualities that enabled those achievements — qualities such as sincerity of intention, humility before knowledge, perseverance in the pursuit of learning, and unwavering commitment to truth regardless of personal consequence or popular opposition. This publication highlights these personal dimensions alongside the scholarly contributions, creating well-rounded portraits that inspire readers.',
    ],
    closes: [
      'Order this inspiring work on Islamic scholars from Bab-ul-Fatah Pakistan. At {price}, {title} celebrates the intellectual heritage of Islam. Shop online for delivery across all Pakistani cities.',
      'Discover the giants of Islamic scholarship through this publication from Bab-ul-Fatah. Priced at {price}, {title} is both informative and inspiring. Order now for fast, reliable nationwide delivery.',
    ],
  },

  // ── GENERAL ──
  general: {
    opens: [
      'Islamic knowledge encompasses a vast and beautifully interconnected body of learning that spans theology, law, history, spiritual practice, moral philosophy, and social ethics, and this publication titled {title} represents a valuable and carefully prepared contribution to that rich intellectual tradition that has enlightened Muslim minds for over fourteen centuries. Whether you are a seasoned student of Islamic sciences with years of formal training or a curious and sincere beginner taking your first steps on the path of Islamic learning, this work offers content that will inform your understanding, inspire your faith, and deepen your appreciation for the comprehensive guidance that Islam provides for every aspect of human existence. The content has been reviewed by qualified scholars to ensure accuracy and conformity with authentic Islamic sources, while the accessible presentation style makes the material approachable for readers at every level of prior knowledge and experience. {product_detail}',
      'Every new publication in the field of Islamic literature represents an opportunity to connect readers with the timeless wisdom of the Quran, the Sunnah, and the scholarly heritage of the Muslim Ummah that has been preserved and transmitted with extraordinary care across the centuries. This edition of {title} seizes that opportunity with distinction, offering content that has been carefully prepared, thoroughly reviewed by qualified scholars, and professionally produced to serve the informational, educational, and spiritual needs of Muslim readers throughout Pakistan. The publication reflects a commitment to producing Islamic literature that meets international standards of quality, accuracy, and presentation while remaining affordable and accessible for the broadest possible audience of readers. {product_detail}',
    ],
    mids: [
      'This publication has been prepared with the same commitment to quality and accuracy that characterizes the best Islamic publishing, with content reviewed by qualified scholars to ensure conformity with authentic Islamic sources. The work addresses its subject matter with sufficient depth to satisfy serious readers while maintaining an accessible style that welcomes those who are new to the topic. The physical production quality ensures durability and readability for regular use over many years.',
      'The enduring value of this work lies in its ability to serve multiple audiences effectively — students will find it useful for academic reference, educators will appreciate its clear presentation for teaching purposes, and general readers will enjoy the engaging prose style that makes learning about Islam both informative and genuinely pleasurable. The publication reflects a commitment to producing Islamic literature that meets international standards while remaining affordable for readers in Pakistan.',
    ],
    closes: [
      'Order this publication from Bab-ul-Fatah Pakistan. At {price}, {title} is a valuable addition to your Islamic library. Shop online for delivery across all Pakistani cities.',
      'Get this quality edition from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers excellent value. Order now for reliable nationwide delivery.',
    ],
  },
};

// Fallbacks
T.prayer_supplication = T.prayer_supplication || T.general;
T.healthy_food = T.healthy_food || T.general;
T.lifestyle = T.lifestyle || T.general;
T.imams_scholars = T.imams_scholars || T.biography;

// ─── Description generator ───────────────────────────────────────────────────
function generateDescription(product, index) {
  const catKey = detectCatKey(product, index);
  const templates = T[catKey] || T.general;
  const price = formatPrice(product.price);
  const title = product.title || 'Islamic Book';
  const productDetail = getProductDetail(index, title, catKey);

  // Use index-based selection for uniqueness
  const openIdx = index % templates.opens.length;
  const midIdx = (index * 3 + 2) % templates.mids.length;
  const closeIdx = (index * 5 + 4) % templates.closes.length;

  let desc = templates.opens[openIdx];
  desc += ' ' + templates.mids[midIdx];
  desc += ' ' + templates.closes[closeIdx];

  // Replace placeholders
  desc = desc
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{product_detail\}/g, productDetail ? ` — ${productDetail}` : '');

  // Clean up double spaces
  desc = desc.replace(/\s+/g, ' ').trim();

  return desc;
}

// ─── Meta description generator ──────────────────────────────────────────────
function generateMetaDescription(product, index) {
  const pd = PRODUCT_DATA[index];
  const cat = pd ? pd.cat : 'Islamic Books';
  const title = product.title || 'Islamic Book';
  const author = pd && pd.author ? pd.author : '';
  const price = formatPrice(product.price);
  const authorPart = author ? ` by ${author}` : '';

  const templates = [
    `Buy ${title} at Bab-ul-Fatah Pakistan. ${cat}${authorPart} for ${price}. Fast delivery nationwide.`,
    `Shop ${title} online from Bab-ul-Fatah Pakistan. ${cat} at ${price}${authorPart}. Trusted Islamic bookstore.`,
    `${title} - ${cat} at ${price}. Order from Bab-ul-Fatah Pakistan${authorPart}. Fast nationwide delivery.`,
    `Order ${title} from Bab-ul-Fatah Pakistan for ${price}. ${cat}${authorPart}. Reliable delivery across Pakistan.`,
    `Get ${title} at ${price} from Bab-ul-Fatah. ${cat}${authorPart}. Pakistan's trusted Islamic bookstore.`,
    `${title} at ${price}. Bab-ul-Fatah Pakistan offers authentic ${cat.toLowerCase()}.${authorPart} Order now.`,
    `Purchase ${title} for ${price} at Bab-ul-Fatah. ${cat}${authorPart}. Pakistan's leading online Islamic bookstore.`,
    `${title} at ${price}. Shop Bab-ul-Fatah Pakistan for quality ${cat.toLowerCase()}.${authorPart} Delivery available.`,
    `Authentic ${title} at ${price} from Bab-ul-Fatah Pakistan. ${cat}${authorPart}. Order for fast delivery.`,
    `${title} by Bab-ul-Fatah Pakistan. ${cat} for ${price}${authorPart}. Shop Pakistan's best Islamic bookstore.`,
  ];

  let meta = templates[index % templates.length];
  while (meta.length > 155) meta = meta.substring(0, meta.lastIndexOf(' ', 153));
  if (meta.length < 120) meta += ' Shop Bab-ul-Fatah Pakistan.';
  meta = meta.replace(/['"]/g, '');
  return meta;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const start = Date.now();
  console.log('\n' + '='.repeat(60));
  console.log('  Bab-ul-Fatah SEO Batch 10 FIX — Products 1001–1100');
  console.log('  Target: 220+ word descriptions');
  console.log('='.repeat(60) + '\n');

  // Fetch products from database: skip 1000, take 100
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    skip: 1000,
    take: 100,
    select: { id: true, title: true, slug: true, price: true },
  });
  console.log(`  Fetched ${products.length} products from database\n`);

  const metaResults = [];
  let updatedCount = 0;
  let errorCount = 0;
  const wordCounts = [];
  const allDescriptions = [];
  const descriptionTexts = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      const description = generateDescription(p, i);
      const metaDescription = generateMetaDescription(p, i);
      const words = description.split(/\s+/).length;
      wordCounts.push(words);
      allDescriptions.push(description);
      descriptionTexts.push(description);

      // Update database
      await prisma.product.update({
        where: { id: p.id },
        data: { description },
      });

      metaResults.push({
        id: p.id,
        title: p.title,
        metaDescription,
        wordCount: words,
        charCount: description.length,
      });

      updatedCount++;
      if (updatedCount % 10 === 0) process.stdout.write(`\r  Updated: ${updatedCount}/${products.length}`);
    } catch (err) {
      console.error(`\n  ERROR updating product ${p.id} (${p.title}): ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\r  Updated: ${updatedCount}/${products.length} (${errorCount} errors)  `);

  // Save meta descriptions to JSON file (overwrite)
  const metaPath = path.join(__dirname, 'seo-meta-batch10.json');
  fs.writeFileSync(metaPath, JSON.stringify(metaResults, null, 2));
  console.log(`  Meta descriptions saved to: ${metaPath}`);

  // Word count stats
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);
  const above200 = wordCounts.filter(w => w >= 200).length;
  const above220 = wordCounts.filter(w => w >= 220).length;
  console.log(`  Word count: avg=${avgWords}, min=${minWords}, max=${maxWords}, 200+=${above200}/100, 220+=${above220}/100`);

  // Meta description stats
  const metaLens = metaResults.map(m => m.metaDescription.length);
  const avgMeta = Math.round(metaLens.reduce((a, b) => a + b, 0) / metaLens.length);
  const minMeta = Math.min(...metaLens);
  const maxMeta = Math.max(...metaLens);
  const metaInRange = metaLens.filter(l => l >= 120 && l <= 155).length;
  console.log(`  Meta desc: avg=${avgMeta}, min=${minMeta}, max=${maxMeta}, in-range(120-155)=${metaInRange}/100`);

  // Uniqueness check
  const descSet = new Set(allDescriptions);
  const openSet = new Set(allDescriptions.map(d => d.substring(0, 100)));
  console.log(`  Unique descriptions (full): ${descSet.size}/${updatedCount}`);
  console.log(`  Unique openings (100 chars): ${openSet.size}/${updatedCount}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n  Completed in ${elapsed}s`);

  // Print sample descriptions
  console.log('\n' + '='.repeat(60));
  console.log('  SAMPLE DESCRIPTIONS');
  console.log('='.repeat(60));

  const sampleIndices = [0, 9, 19, 33, 50, 55, 63, 70, 84, 97];
  for (const idx of sampleIndices) {
    if (metaResults[idx] && descriptionTexts[idx]) {
      console.log(`\n--- #${idx}: ${metaResults[idx].title} (${metaResults[idx].wordCount} words) ---`);
      console.log(descriptionTexts[idx].substring(0, 200) + '...');
    }
  }
  console.log('\n');

  // Warn about any below 200
  const below200 = wordCounts.map((w, i) => ({ i, w })).filter(x => x.w < 200);
  if (below200.length > 0) {
    console.log('  ⚠️  Products below 200 words:');
    for (const { i, w } of below200) {
      console.log(`     #${i}: ${products[i].title} — ${w} words`);
    }
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
