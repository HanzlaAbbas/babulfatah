#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 8 Description Writer
// Writes unique, SEO-optimized product descriptions for products 801-900
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

// ─── Category detection function ─────────────────────────────────────────────
function detectCat(product) {
  const t = (product.title || '').toLowerCase();
  const s = (product.slug || '').toLowerCase();
  const c = (product.categoryName || '').toLowerCase();
  const ts = t + ' ' + s;

  // Janamaz / Prayer Mats — check BEFORE prayer since titles contain "prayer"
  if (/janamaz|prayer.mat|prayer\.mat/i.test(ts)) return 'janamaz';

  // Products — Pak Matti, Pen Quran, etc.
  if (/pak.?matti|pen.?quran|dq2plus/i.test(ts)) return 'products';

  // Sahah Sitta — Musnad Imam Ahmad (English 3-vol set)
  if (/sahah.*sitta|musnad.*imam.*ahmad.*english|musnad.*3.*vol.*english/i.test(ts)) return 'sahah_sitta';

  // Home Decor — Bismillah calligraphy
  if (/bismillah.*calligraphy|calligraphy.*golden|home.?decor/i.test(ts)) return 'home_decor';

  // Arabic grammar — Qawaid al Nahv
  if (/qawaid.*nahv|naqashi.*pattern/i.test(ts)) return 'education';

  // English learning — Passport to English
  if (/passport.*english/i.test(ts)) return 'education';

  // Musnad, Muwatta — major hadith collections
  if (/musnad|muwatta|qabar.*ka.*bayan/i.test(ts)) return 'hadith';

  // Seerah / Prophet biography
  if (/seerah|seerat|our.prophet|payaam|payam|pyary.*rasool.*seerat/i.test(ts)) return 'seerah';

  // Biography (prophet stories, illustrated guides) — check AFTER seerah
  if (/biography|qissa.*syedna|pathar.*ki.*gawahi|purani.*kitab|qassasul.*ambiya|qasas.*al.*anbiya|illustrated.*guide|nabi.*akram|sipah.*salar/i.test(ts)) return 'biography';

  // Prayer Supplication — Namaz e Muhammadi, Namaz e Nabvi, azkaar, duain
  if (/namaz.*nabvi|namaz.*muhammadi|namaz.*mustafa|anwaar|hisn|masnoon.*azkaar|masnoon.*duain|prayer.*(according|for.beginners|and.purification)|pyary.*rasool.*duain/i.test(ts)) return 'prayer';

  // Mushaf — Quran Hakeem, Noble Quran
  if (/quran.*hakeem|mushaf|premium.*quran/i.test(ts)) return 'mushaf';

  // Translation — Punj Surah, Noble Quran English
  if (/punj.*surah|translation|tarjuma/i.test(ts)) return 'translation';

  // Children — kids books, Qasas stories
  if (/child|children|kid|bachon|bachey|nunehalon|memorization|pathron.*ki.*barish|purani.*laash|my.*(dua|prayer|wudu|first)/i.test(ts)) return 'children';

  // Companions
  if (/companion|sahaba|muti.*e.*azam/i.test(ts)) return 'companions';

  // Fiqh — Namaz rulings, lending rulings
  if (/fiqh|ba.jamaat|modern.medical|qarz.*ky.*fazail|namaz.*aur.*modern/i.test(ts)) return 'fiqh';

  // Family
  if (/family|nau.*molood|pur.*sukoon.*ghar|qalam.*kay.*ansoo/i.test(ts)) return 'family';

  // Women
  if (/women|mother/i.test(ts)) return 'women';

  // History
  if (/history|naiki.*kai.*safeer/i.test(ts)) return 'history';

  // Lifestyle
  if (/lifestyle|pareshani|nejat/i.test(ts)) return 'lifestyle';

  // Hadith — general hadith category
  if (/hadith|ahadith|masail|nikkah.*kay.*masail|namaz.*kay.*masail|nifah.*tul/i.test(ts)) return 'hadith';

  // Darussalam publishers — use category name
  if (/darussalam|darul/i.test(c)) return 'darussalam';

  // Research Center / Devotions
  if (/research.center|private.devotions|morning.*evening/i.test(ts + ' ' + c)) return 'prayer';

  // Reference
  if (/reference|neekio|mata.*deny/i.test(ts)) return 'reference';

  // Education
  if (/education|moral|manners|pocket.size|my.*creator|nukhbat|naashty|naat.*goi|need.*creed|on.the.mountain|noor.*ul.*quran|pachtawa|pardah|parent.*love|nijat/i.test(ts)) return 'education';

  // General
  if (/akhlaaq|my.*first|my.*a.to.z|niat|namaz.*ki.*masnoon|purisrar/i.test(ts)) return 'general';

  // General / Lifestyle catch-all
  if (/lifestyle|lajawab/i.test(ts)) return 'lifestyle';

  return 'general';
}

// ─── Product-specific detail extractor ───────────────────────────────────────
function productDetail(title, index) {
  const t = title.toLowerCase();

  // Musnad Imam Ahmad
  if (/musnad.*imam.*ahmad$/i.test(t) || /musnad.*imam.*ahmad.*\|.*ahadith/i.test(t)) return 'monumental Urdu-language Musnad of Imam Ahmad bin Hanbal, one of the six principal Hadith collections containing over 30,000 narrations';
  if (/musnad.*imam.*ahmad.*3.*vol.*english/i.test(t) || /musnad.*imam.*ahmad.*english/i.test(t)) return 'comprehensive 3-volume English translation of the Musnad of Imam Ahmad bin Hanbal spanning over 30,000 authenticated Prophetic narrations';

  // Muwatta Imam Malik
  if (/muwatta.*imam.*malik.*imported/i.test(t)) return 'premium imported edition of Muwatta Imam Malik — the earliest written collection of Hadith — via the transmission of Ibn al-Qasim';
  if (/muwatta.*imam.*malik/i.test(t)) return 'authoritative edition of Muwatta Imam Malik through the narration chain of Ibn al-Qasim, one of the oldest Hadith compilations in Islamic history';

  // Namaz e Muhammadi
  if (/namaz.*muhammadi.*12x17/i.test(t)) return 'detailed prayer guidebook in 12x17 inch format explaining the method of performing Salah according to the Prophetic tradition';
  if (/namaz.*muhammadi.*8x12/i.test(t)) return 'compact 8x12 inch prayer guide explaining the Sunnah method of performing Namaz step by step';

  // Namaz e Nabvi
  if (/namaz.*nabvi.*17x24/i.test(t)) return 'large 17x24 inch edition of Namaz e Nabvi bundled with Hisn al Muslim — the comprehensive collection of daily prayers and supplications';
  if (/namaz.*nabvi.*14x21.*h.c/i.test(t)) return 'hard cover 14x21 inch edition of Namaz e Nabvi providing the authentic Prophetic method of performing Salah';
  if (/namaz.*nabvi.*hard.*cover.*imp/i.test(t)) return 'imported hard cover premium edition of Namaz e Nabvi with enhanced paper quality and binding';
  if (/namaz.*nabvi.*14x21$/i.test(t)) return 'standard 14x21 inch edition combining Namaz e Nabvi with Hisn-ul-Muslim daily supplications collection';
  if (/namaz.*nabvi.*12x17/i.test(t)) return 'soft cover 12x17 inch concise edition of Namaz e Nabvi for convenient portability';

  // Azkaar and Duain
  if (/namaz.*ke.*baad.*azkaar.*flax/i.test(t)) return 'flex-bound collection of Masnoon Azkaar to be recited after every Salah, printed on durable flex material';
  if (/namaz.*ki.*masnoon.*duain.*flex/i.test(t)) return 'flex-printed collection of Masnoon Duain for Namaz in a wipe-clean, long-lasting format';

  // Prayer books
  if (/prayer.*according.*sunnah/i.test(t)) return 'comprehensive guide to performing prayer exactly as prescribed by the Sunnah of Prophet Muhammad (PBUH)';
  if (/prayer.*for.*beginners/i.test(t)) return 'beginner-friendly introduction to the daily prayer, covering Wudu, positions, recitations, and common mistakes';

  // Pen Quran
  if (/pen.*quran.*dq2plus/i.test(t)) return 'advanced DQ2Plus digital pen Quran — a smart electronic device that reads Quran pages aloud when touched, ideal for learning and revision';

  // Pak Matti
  if (/pak.*matti.*large/i.test(t)) return 'large-size pack of dry ablution earth (Tayammum) for situations where water is unavailable for Wudu';
  if (/pak.*matti.*medium/i.test(t)) return 'medium-size pack of clean, purified dry ablution earth for performing Tayammum as prescribed in Islamic jurisprudence';

  // Prayer Mats — Fancy
  if (/prayer.*mat.*fancy.*dup3$/i.test(t)) return 'premium Fancy prayer mat with elegant design and soft cushioning — design and color selection varies per piece';
  if (/prayer.*mat.*fancy.*dup2$/i.test(t)) return 'beautifully designed Fancy prayer mat with comfortable padding and attractive Islamic motifs — available in assorted patterns';
  if (/prayer.*mat.*fancy.*dup$/i.test(t)) return 'decorative Fancy prayer mat featuring quality fabric and traditional Islamic designs — actual design and color may vary';
  if (/prayer.*mat.*fancy$/i.test(t)) return 'Fancy prayer mat crafted with quality materials and attractive design patterns — design and color vary per unit';

  // Prayer Mats — Ultra Soft
  if (/prayer.*mat.*ultra.*soft.*dup4$/i.test(t)) return 'luxuriously thick Ultra Soft prayer mat with extra plush cushioning for maximum knee and joint comfort during extended prayers';
  if (/prayer.*mat.*ultra.*soft.*dup3$/i.test(t)) return 'Ultra Soft prayer mat with premium velvet-like texture and superior padding for comfortable daily Salah';
  if (/prayer.*mat.*ultra.*soft.*dup2$/i.test(t)) return 'deep-pile Ultra Soft prayer mat offering cloud-like comfort with an elegant pattern — design and color selection varies';
  if (/prayer.*mat.*ultra.*soft.*dup$/i.test(t)) return 'Ultra Soft prayer mat with exceptionally thick padding and smooth fabric surface for delightful prayer experience';
  if (/prayer.*mat.*ultra.*soft$/i.test(t)) return 'Ultra Soft premium prayer mat with luxurious thickness and velvety texture — available in multiple design and color variations';

  // Bismillah Calligraphy
  if (/bismillah.*calligraphy.*golden/i.test(t)) return 'stunning golden-finish Bismillah calligraphy piece crafted as an elegant Islamic home decoration';
  if (/bismillah.*calligraphy$/i.test(t)) return 'beautifully designed Bismillah calligraphy artwork suitable for wall display or table placement in homes and offices';

  // Passport to English
  if (/passport.*english.*vol.*5/i.test(t)) return 'Volume 5 of the Passport to English series — the advanced-level book completing the five-part English language curriculum';
  if (/passport.*english.*vol.*4/i.test(t)) return 'Volume 4 of the Passport to English series — upper-intermediate English instruction on art paper';
  if (/passport.*english.*vol.*3/i.test(t)) return 'Volume 3 of the Passport to English series — intermediate-level English language instruction on premium art paper';
  if (/passport.*english.*vol.*2/i.test(t)) return 'Volume 2 of the Passport to English series — elementary-to-intermediate English learning on quality art paper';
  if (/passport.*english.*vol.*1/i.test(t)) return 'Volume 1 of the Passport to English series — foundational English language instruction printed on premium art paper';

  // Qawaid al Nahv
  if (/qawaid.*nahv.*complete.*3.*vol/i.test(t)) return 'complete 3-volume set of Qawaid al Nahv covering the full Arabic grammar curriculum from introductory to advanced level';
  if (/qawaid.*nahv.*part.*2/i.test(t)) return 'Part 2 of the Qawaid al Nahv Arabic grammar series covering intermediate syntax and sentence construction rules';
  if (/qawaid.*nahv.*ibtidai/i.test(t)) return 'introductory volume of Qawaid al Nahv designed for absolute beginners starting their Arabic grammar studies';
  if (/qawaid.*nahv.*part.*1/i.test(t)) return 'Part 1 of the Qawaid al Nahv series presenting foundational Arabic grammar rules for new learners';

  // Qasas al Anbiya
  if (/qasas.*al.*anbiya.*ibn.*kathir/i.test(t)) return 'the renowned Qasas al Anbiya by Imam Ibn Kathir — a classical compilation of prophets\' stories drawn from authentic Islamic sources';
  if (/qissasul.*ambiya.*arabic/i.test(t)) return 'Arabic-language edition of Qissasul Ambiya presenting the stories of the Prophets in their original linguistic form';

  // Prophet stories (Qasas series)
  if (/pathar.*ki.*gawahi|qissa.*syedna.*isa/i.test(t)) return 'part 29 of the 30-part Qasas ul Anbiya series recounting the story of Prophet Isa (Jesus) — peace be upon him — known as "Pathar Ki Gawahi" (Stone\'s Testimony)';
  if (/pathron.*ki.*barish|qissa.*syedna.*lut/i.test(t)) return 'part 9 of the 30-part Qasas ul Anbiya series telling the story of Prophet Lut (Lot) — peace be upon him — titled "Pathron Ki Barish" (Rain of Stones)';
  if (/purani.*kitab|qissa.*syedna.*idrees/i.test(t)) return 'part 2 of the 30-part Qasas ul Anbiya series narrating the story of Prophet Idrees (Enoch) — peace be upon him — titled "Purani Kitab" (The Ancient Book)';
  if (/purani.*laash|qissa.*syedna.*musa/i.test(t)) return 'part 15 of the 30-part Qasas ul Anbiya series depicting the story of Prophet Musa (Moses) — peace be upon him — titled "Purani Laash" (The Old Corpse)';

  // Pyary Rasool ki Payari Duain
  if (/pyary.*rasool.*duain.*allaa/i.test(t)) return 'pocket-sized premium edition of the Prophet\'s selected supplications with enhanced print quality';
  if (/pyary.*rasool.*duain.*aam/i.test(t)) return 'pocket-sized standard edition of the Prophet\'s beloved prayers and supplications for daily recitation';

  // Noble Quran English
  if (/noble.*quran.*eng.*17x24/i.test(t)) return '17x24 inch black-and-white local edition of the Noble Quran with English translation, a Darussalam publication of enduring scholarly value';

  // Provisions for the Hereafter
  if (/provisions.*hereafter/i.test(t)) return 'scholarly work on preparing for the afterlife — covering the realities of death, the grave, the Day of Judgment, and the eternal abode';

  // Namaz-e-Mustafa
  if (/namaz.*mustafa|anwaar/i.test(t)) return 'detailed Fiqh-based guide to the prayer of Prophet Muhammad (PBUH) titled Anwaar-us-Salah, covering the rulings and method of Salah';

  // Nabi Akram
  if (/nabi.*akram.*sipah.*salar/i.test(t)) return 'account of Prophet Muhammad (PBUH) as the supreme military commander, examining his strategic brilliance and leadership in battle by Abdul Rehman Kilani';

  // Paighambar e Islam
  if (/paighambar.*e.*islam.*illustrated/i.test(t)) return 'illustrated biographical guide to Prophet Muhammad (SAW) combining visual storytelling with authentic historical narrative';

  // Qalam kay Ansoo
  if (/qalam.*kay.*ansoo/i.test(t)) return 'heart-touching 2-volume collection titled "Tears of the Pen" — emotional and spiritual writings for family reading and reflection';

  // Muslim Morals and Manners
  if (/muslim.*morals.*manners.*pocket/i.test(t)) return 'pocket-sized guide to Islamic morals and manners (Akhlaq) covering the etiquettes of daily life according to Quran and Sunnah';

  // My Creator
  if (/my.creator/i.test(t)) return 'Darussalam children\'s book introducing young readers to the concept of Allah as the Creator of all things';

  // Naashty Se School Tak
  if (/naashty/i.test(t)) return 'Darussalam publication guiding readers on establishing a morning routine rooted in Islamic teachings from dawn until school time';

  // Naat Goi
  if (/naat.*goi/i.test(t)) return 'Darussalam book on the art and etiquette of Naat recitation in praise of Prophet Muhammad (PBUH)';

  // Namaz aur Modern Medical Science
  if (/namaz.*modern.*medical/i.test(t)) return 'exploration of the scientifically documented health benefits of Salah and its various physical postures from a modern medical perspective';

  // Namaz Ba Jamaat
  if (/namaz.*ba.*jamaat/i.test(t)) return 'concise booklet addressing the ruling on praying behind the congregation, explaining the importance and rewards of Jamaat prayer';

  // Nau molood kay Ahkam
  if (/nau.*molood/i.test(t)) return 'comprehensive guide covering the Islamic rulings and etiquette for newborns including the Aqeeqah ceremony and the selection of meaningful Islamic names';

  // Nijat Yafta Kon
  if (/nijat.*yafta/i.test(t)) return 'thought-provoking book exploring who truly attains salvation in the Hereafter based on Quranic and Prophetic evidence';

  // Now you are a Mother
  if (/now.*you.*are.*a.*mother/i.test(t)) return 'practical and spiritual guide for new mothers navigating the challenges and blessings of motherhood from an Islamic perspective';

  // Paighambar E Rehmat
  if (/paighambar.*e.*rehmat/i.test(t)) return 'Darussalam publication portraying Prophet Muhammad (SAW) as the Messenger of Mercy for all creation, highlighting his compassionate character';

  // Pardah
  if (/pardah$/i.test(t)) return 'Darussalam book discussing the Islamic ruling and wisdom behind Hijab and Pardah for Muslim women with Quranic and Hadith evidence';

  // Parent's Love
  if (/parent.*love/i.test(t)) return 'touching book on the profound bond between parents and children in Islam, emphasizing the duty of honoring and serving one\'s parents';

  // Pareshani say Nejaat
  if (/pareshani/i.test(t)) return 'Islamic guide to finding relief from worries and anxieties through Quranic supplications, Prophetic remedies, and trust in Allah\'s plan';

  // Pur Sukoon Ghar
  if (/pur.*sukoon.*ghar/i.test(t)) return 'practical family guide to building a tranquil, conflict-free home based on Islamic principles of mutual respect and compassion';

  // Punj Surah
  if (/punj.*surah/i.test(t)) return 'four-color printed collection of five selected Surahs with Urdu translation — perfect for daily recitation and memorization';

  // Purisrar Haqaiq
  if (/purisrar.*haqaiq/i.test(t)) return 'Darussalam publication revealing hidden truths and lesser-known facts about Islamic beliefs, practices, and historical events';

  // Qabar Ka Bayan
  if (/qabar.*ka.*bayan/i.test(t)) return 'comprehensive Hadith-based discourse on the realities of the grave, covering the questioning by Munkar and Nakir and the conditions of the deceased';

  // Qarz ky Fazail o Masail
  if (/qarz.*ky.*fazail/i.test(t)) return 'Fiqh guide covering the virtues and rulings of lending and borrowing in Islam, clarifying the Islamic perspective on debt and financial obligations';

  return null;
}

// ─── Templates (ALL NEW for batch 8) ────────────────────────────────────────
const T = {

  // ── Prayer Supplication (Namaz e Muhammadi, Namaz e Nabvi, Azkaar, Duain) ─
  prayer: {
    opens: [
      'The daily prayer — Salah — stands as the very backbone of a Muslim\'s connection to Allah, the first matter judged on the Day of Resurrection, and the single act of worship that distinguishes a believer from a non-believer in the clearest possible terms. Understanding how the Prophet Muhammad (peace be upon him) actually performed his prayers is therefore not a matter of mere academic interest but a practical religious obligation of the highest order. {title} provides that essential understanding by documenting the Prophetic method of prayer with meticulous attention to every position, recitation, and gesture, enabling readers to bring their Salah into closer alignment with the Sunnah.',
      'Learning to pray correctly is among the first obligations that every Muslim must fulfill, yet many believers go through their entire lives performing Salah in ways that deviate — sometimes significantly — from the manner in which it was originally taught by Allah\'s Messenger. This gap between intended practice and actual practice arises not from willful neglect but from the absence of accessible, clearly written instruction that walks the reader through each stage of the prayer with sufficient detail and clarity. {title} addresses that gap comprehensively, serving as both a learning resource for new Muslims and a corrective reference for those who wish to verify and refine their existing prayer technique.',
      'The supplications that accompany the obligatory prayers — the Azkaar recited after each Salah, the Masnoon Duain for specific occasions, and the comprehensive collection preserved in works like Hisn al Muslim — represent an invaluable treasury of spiritual nourishment that the Prophet (peace be upon him) personally taught to his companions and urged them to observe regularly. These brief but profoundly meaningful invocations transform the routine of daily prayer into a sustained conversation with the Creator, addressing needs ranging from forgiveness and protection to success in this world and salvation in the next. {title} gathers these essential supplications into a convenient, well-organized reference that makes it easy for any Muslim to incorporate them into their daily worship.',
      'The science of prophetic supplication is a domain of Islamic knowledge that touches every dimension of a believer\'s life — from the moment of waking to the time of sleeping, from the mosque to the marketplace, from moments of joy to occasions of difficulty. The Prophet Muhammad (peace be upon him) left behind a remarkably comprehensive vocabulary of prayer that covers virtually every human experience, and preserving access to that vocabulary is essential for maintaining the spiritual vitality of the Muslim community. {title} serves that preservation purpose by collecting, authenticating, and presenting these Prophetic prayers in a format designed for regular consultation and practical application.',
      'Correcting one\'s prayer is a matter that scholars have consistently described as more important than correcting one\'s worldly affairs, because the prayer is the believer\'s direct audience with Allah and the quality of that audience depends upon the precision with which it is conducted. The various editions of Namaz e Nabvi and Namaz e Muhammadi that have been published over the years testify to the enduring demand for reliable, accessible prayer instruction in Urdu-speaking Muslim communities. This {detail} — {title} — continues that tradition of service by providing clearly illustrated, step-by-step guidance that leaves no ambiguity about the correct method of performing the daily prayers.',
    ],
    mids: [
      'This {detail} — {title} — has been prepared with reference to the most authoritative sources of prayer methodology in the Hanafi school of Islamic jurisprudence, supplemented where necessary with narrations from other schools to provide the most complete and well-documented presentation possible. Each stage of the prayer — from the opening Takbeer to the final Salaam — is described with precise physical instructions, the required recitations in Arabic with Urdu translation, and the relevant evidences from the Quran and authentic Hadith. Common mistakes are identified and corrected, and the rulings regarding what invalidates the prayer and what does not are explained in plain language that avoids unnecessary technical jargon. The physical construction — whether in the compact pocket format, the standard soft cover, or the durable hard cover imported edition — has been designed to support the specific usage patterns of each format. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality prayer instruction accessible to Muslims throughout the country.',
      'The practical value of this {detail} — {title} — extends far beyond the prayer rug — it cultivates in the reader an awareness that Salah is not merely a mechanical sequence of movements and recitations but a deeply spiritual encounter with the Divine that demands both physical precision and heartfelt presence. The supplications included in this work have been selected for their authenticity, their comprehensiveness, and their immediate relevance to the daily concerns of Muslim life. Where multiple authentic wordings exist for a single supplication, the compiler has included the variants, allowing readers to choose the version that resonates most strongly with their personal spiritual practice. The clear typography, durable binding, and quality paper ensure that this reference will withstand frequent use during daily prayer sessions. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Perfect your daily Salah with this authentic, Sunnah-based prayer guide. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. A must-have reference for every Muslim household. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Learn to pray exactly as the Prophet (PBUH) taught. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential prayer and supplication guide for every believer. Order with reliable nationwide delivery.',
    ],
  },

  // ── Education (Morals, Calligraphy, Nahv, Passport to English, Darsi) ─────
  education: {
    opens: [
      'Building a solid foundation in Islamic knowledge requires educational resources that are simultaneously accurate in their content, engaging in their presentation, and progressive in their difficulty — qualities that distinguish truly effective teaching materials from those that merely occupy shelf space. {title} has been designed with these three qualities firmly in mind, offering structured instruction that guides learners through their subject with the confidence that every fact presented has been verified and every exercise has been crafted to reinforce genuine understanding rather than rote memorization.',
      'The landscape of Islamic education in Pakistan is enriched by publications that bridge the gap between traditional scholarship and contemporary pedagogical needs — books that respect the depth of classical Islamic learning while presenting it in formats that engage modern readers and accommodate current educational standards. {title} exemplifies this bridge-building approach, drawing upon established Islamic sources while employing instructional methods that have proven effective in contemporary classroom and self-study settings.',
      'Knowledge acquisition in Islam is not merely an intellectual exercise but an act of worship — the Prophet (peace be upon him) described the pursuit of knowledge as an obligation upon every Muslim, and the Quran repeatedly urges reflection, study, and the development of understanding. {title} facilitates that obligatory pursuit by providing well-structured educational content on its subject, organized in a manner that supports both systematic study and convenient reference, and presented in language that communicates clearly to readers at every level of prior knowledge.',
      'Effective educational publishing requires more than subject-matter expertise — it demands an understanding of how learners actually learn: how they progress from confusion to clarity, how they consolidate new information through practice, and how they connect abstract concepts to concrete applications. {title} reflects that understanding through its carefully sequenced content, its strategic use of examples and exercises, and its attention to the common difficulties that learners encounter when engaging with this material for the first time.',
      'The calligraphic arts, Arabic grammar, and the structured memorization of religious texts represent a constellation of educational disciplines that have sustained Islamic civilization for over fourteen centuries — disciplines that require specialized instructional resources tailored to the unique challenges each one presents. {title} addresses the specific educational needs of its discipline with focused, well-organized content that respects the learner\'s time while delivering the depth of instruction that genuine competence demands.',
    ],
    mids: [
      'This {detail} — {title} — has been structured to maximize learning efficiency through a combination of clear explanatory text, illustrative examples, and graduated practice exercises that challenge the learner without overwhelming them. The content progression follows a logical sequence that builds each new concept upon the foundations established by earlier material, ensuring that readers develop genuine mastery rather than superficial familiarity. Supplementary materials including summaries, key terminology lists, and review exercises provide the consolidation tools that effective learning requires. The production quality — durable binding, clear typography on quality paper — ensures that this educational resource will endure through repeated use across multiple study sessions. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic education affordable and accessible to students, teachers, and families throughout Pakistan.',
      'The instructional design of this {detail} — {title} — reflects input from experienced educators who understand the practical challenges of teaching this subject in Pakistani educational settings. The language has been calibrated for clarity and accessibility, avoiding the dense, unapproachable prose that characterizes some academic publications while maintaining the precision and accuracy that the subject demands. Where the subject matter involves Arabic terminology, transliteration conventions and Urdu explanations are provided to support learners who may not have advanced Arabic proficiency. Whether used as a primary textbook, a supplementary reference, or a self-study guide, this {detail} delivers reliable educational content in a format that supports effective learning. Available at {price} from Bab-ul-Fatah Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. A well-structured Islamic education resource for learners of all levels. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Quality educational content for students and teachers. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Invest in your learning with this proven educational material. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Effective, engaging Islamic education for classroom and self-study. Order with reliable nationwide delivery.',
    ],
  },

  // ── Janamaz / Prayer Mats ─────────────────────────────────────────────────
  janamaz: {
    opens: [
      'A prayer mat is far more than a functional accessory — it is the personal sanctuary where a Muslim stands before Allah five times each day, the clean surface upon which foreheads touch the ground in humble submission, and the portable piece of the mosque that transforms any space into a place of worship. Selecting the right Janamaz is therefore a decision that affects one\'s daily worship experience in tangible ways: the comfort of the surface during prolonged prostration, the visual beauty that lifts the heart toward the Divine, and the durability that ensures this sacred companion will endure through years of faithful service.',
      'The tradition of using a prayer mat during Salah traces its origins to the practice of the Prophet Muhammad (peace be upon him) himself, who would designate a specific area — often marked by a small mat or cloth — for his daily prayers. That Prophetic precedent has evolved over fourteen centuries into the rich and diverse tradition of Janamaz craftsmanship that we see today, with each region and culture contributing its own aesthetic sensibilities to the art of creating beautiful, functional prayer surfaces. This {detail} — {title} — carries forward that artistic heritage with manufacturing quality that meets the expectations of today\'s Pakistani consumers.',
      'The comfort of one\'s prayer mat directly influences the quality of one\'s prayer experience — a thin, hard surface can distract the worshipper with physical discomfort, while a thick, cushioned surface allows the body to relax into each position and the mind to focus entirely on the spiritual dimension of the prayer. This {detail} — {title} — has been designed with that understanding of comfort\'s importance, using materials and construction techniques that provide a consistently pleasant prayer surface whether used on a carpeted floor, a marble surface, or bare ground.',
      'Every Muslim household needs at least one prayer mat — ideally several, to accommodate family members, guests, and the different spaces where prayers may be offered throughout the home. The practical considerations of prayer mat selection include not only comfort and durability but also aesthetics, ease of maintenance, and portability for those who carry their Janamaz to the mosque or workplace. This {detail} — {title} — addresses all of these considerations through a design that balances physical comfort with visual appeal and practical convenience.',
    ],
    mids: [
      'This {detail} — {title} — is manufactured from carefully selected materials that have been chosen for their combination of softness, durability, and ease of cleaning. The surface fabric provides a pleasant tactile experience during prayer while being resistant to wear, pilling, and color fading through extended use. The padding layer — particularly notable in the Ultra Soft variant — delivers exceptional cushioning that reduces knee strain during prolonged periods of prayer and prostration. The non-slip backing prevents the mat from shifting during use, ensuring stability and safety on a variety of floor surfaces. Available in multiple design and color variations, each mat features attractive Islamic patterns that enhance the prayer environment. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing premium prayer mats that combine comfort, beauty, and value for Muslim households across the country.',
      'The manufacturing quality of this {detail} — {title} — reflects a commitment to delivering prayer mats that meet the standards expected by discerning Pakistani Muslim consumers. The stitching is reinforced at stress points to prevent seam failure, the edges are cleanly finished to prevent fraying, and the print quality ensures that the decorative patterns remain vivid and attractive through regular use and cleaning. The mat rolls compactly for storage and transport, making it convenient for use at home, in the office, or when traveling. At {price}, this prayer mat represents an excellent investment in daily worship comfort. Available from Bab-ul-Fatah Pakistan with delivery to all major cities nationwide.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. A comfortable, beautiful prayer mat for your daily Salah. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. Quality Janamaz with soft cushioning and attractive design. Order today with fast shipping across Pakistan.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Premium prayer mat for comfortable daily worship. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Durable, comfortable prayer mat in assorted designs and colors. Order with reliable nationwide delivery.',
    ],
  },

  // ── Darussalam Publishers ─────────────────────────────────────────────────
  darussalam: {
    opens: [
      'The Darussalam name has become virtually synonymous with reliable Islamic publishing in Pakistan and across the Muslim world — a reputation built over decades of consistent commitment to scholarly accuracy, production quality, and the presentation of Islamic knowledge in formats that serve both specialists and general readers. Every title bearing the Darussalam imprint has undergone a review process that verifies scriptural references, authenticates Hadith citations, and ensures that theological positions reflect the orthodox consensus of mainstream Islamic scholarship. {title} carries that reputation as both a guarantee of quality and an invitation to read with confidence.',
      'When Pakistani Muslim readers encounter the Darussalam label on a book cover, they recognize it as a signal that the contents have been prepared to standards that few other Islamic publishers can match — standards that encompass not only the accuracy of the religious content but also the quality of the translation, the clarity of the explanatory notes, and the physical durability of the production itself. This {detail} — {title} — exemplifies those standards, delivering content that readers can trust in a format that respects both the subject matter and the reader\'s intelligence.',
      'Darussalam\'s publishing philosophy rests on a principle that distinguishes it from many competitors: the belief that Islamic knowledge should be made accessible to the widest possible audience without any compromise on the accuracy or orthodoxy of the content presented. This means investing in skilled translators, qualified reviewers, and production facilities that can deliver books worthy of the sacred knowledge they contain. {title} is a product of that philosophy — a work that makes its subject accessible to Urdu-speaking readers while maintaining the scholarly rigor that serious Islamic publishing demands.',
      'The Darussalam catalog spans the full breadth of Islamic knowledge — from Quran translation and exegesis to Hadith compilation and commentary, from Seerah literature to works on Islamic creed and jurisprudence — and every title in that catalog shares a common commitment to presenting authenticated, well-sourced content in reader-friendly formats. {title} continues that tradition by addressing its subject with the thoroughness and attention to detail that has made Darussalam one of the most respected names in contemporary Islamic publishing.',
    ],
    mids: [
      'This {detail} — {title} — has been produced through Darussalam\'s established editorial workflow: initial manuscript preparation by qualified authors or translators, scholarly review by specialists in the relevant field, verification of all Quranic and Hadith references against primary sources, and final production using materials and printing techniques that ensure both visual appeal and long-term durability. The result is a publication that serves reliably as a personal reference, a teaching resource, and a gift item — roles that require different but complementary qualities in terms of content accessibility, physical robustness, and visual presentation. The typography has been selected for readability during extended study sessions, and the binding has been engineered to withstand the frequent handling that reference works typically receive. Bab-ul-Fatah Pakistan offers this Darussalam publication at {price}, providing Pakistani readers with convenient access to some of the finest Islamic books available in the market today.',
      'The value proposition of this {detail} — {title} — extends well beyond its purchase price — it represents an investment in authenticated Islamic knowledge that will continue to yield spiritual and intellectual returns for years to come. Whether used for personal study, family reading circles, formal educational settings, or as a meaningful gift for Eid, weddings, or other special occasions, this Darussalam publication delivers the combination of reliability, accessibility, and physical quality that has made the imprint a trusted choice for millions of Muslim readers worldwide. Available at {price} from Bab-ul-Fatah Pakistan with delivery across all major cities.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. A trusted Darussalam publication with verified, authentic content. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Scholarly accuracy meets reader-friendly presentation. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for {price}. Darussalam quality you can rely on. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Authentic Islamic knowledge from a globally respected publisher. Order with reliable nationwide delivery.',
    ],
  },

  // ── Hadith (Musnad Imam Ahmad, Muwatta Imam Malik, Qabar Ka Bayan, etc.) ─
  hadith: {
    opens: [
      'The Musnad of Imam Ahmad bin Hanbal represents one of the most monumental achievements in the entire history of Hadith compilation — a work of staggering scope that its compiler spent over four decades assembling, traveling across the Muslim world to collect more than thirty thousand narrations attributed directly to the Prophet Muhammad (peace be upon him). The sheer scale and ambition of this collection places it among the essential references of Islamic scholarship, and its availability in both Urdu and English makes this treasure of Prophetic guidance accessible to an enormously wider audience than would otherwise be possible.',
      'The preservation of Prophetic Hadith is an undertaking that has no parallel in any other religious tradition — a collaborative, multi-generational effort involving thousands of dedicated scholars who dedicated their lives to memorizing, documenting, verifying, and transmitting the words and actions of Allah\'s Messenger with a degree of precision that modern historians regard as one of the most remarkable achievements in the pre-modern documentation of any historical tradition. This {detail} — {title} — contributes to that ongoing tradition of preservation by making a significant body of authenticated Hadith literature available to readers in an accessible format.',
      'Hadith collections serve a dual function in Islamic life that makes them indispensable for both scholars and ordinary Muslims: they provide the evidentiary basis for Islamic law and theology, and they offer practical guidance on virtually every aspect of human behavior — from the most intimate details of personal hygiene and worship to the broadest questions of governance, social relations, and ethical conduct. This {detail} — {title} — delivers that dual function by presenting narrations that are simultaneously legally significant and practically applicable, supported by the scholarly apparatus that enables readers to verify and contextualize each narration.',
      'The discipline of Hadith verification — the science of assessing the reliability of narrators, the integrity of transmission chains, and the authenticity of content — represents one of humanity\'s most sophisticated pre-modern systems of quality assurance, a methodology so rigorous that it continues to impress scholars of every religious and secular discipline who study it. This {detail} — {title} — presents Hadith that have been evaluated according to those rigorous standards, giving readers confidence that the guidance they receive through these narrations reflects the authentic teaching of the Prophet Muhammad (peace be upon him).',
    ],
    mids: [
      'This {detail} — {title} — has been prepared by scholars who specialize in the discipline of Hadith studies, ensuring that every narration presented meets the authentication criteria established by the classical Hadith masters. The narrations are organized under thematic headings that facilitate both systematic study and topic-based reference, and each narration is accompanied by its chain of transmission and an assessment of its authenticity grade. The Urdu translation captures the meaning of the Arabic original with precision and clarity, while explanatory notes where provided address historical context, clarify technical terminology, and highlight the practical implications of each narration for contemporary Muslim life. The physical production — durable binding, clear typography, quality paper — supports the intensive use patterns typical of Hadith reference works. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing access to the authentic Prophetic traditions for readers across Pakistan.',
      'The editorial approach behind this {detail} — {title} — prioritizes comprehensiveness without sacrificing accessibility, presenting a substantial body of Hadith material in a format that serves the needs of both specialist scholars and general readers. The index and organizational structure enable quick location of specific narrations or subject areas, while the logical chapter progression supports readers who prefer to work through the material systematically. Cross-references between related narrations help readers appreciate the comprehensive guidance that the Sunnah provides on each topic. Whether used for academic research, sermon preparation, personal study, or verification of specific religious practices, this {detail} delivers the reliable Hadith access that every serious Muslim requires. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Authentic Prophetic traditions for every Muslim home and library. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Verified Hadith literature with scholarly apparatus. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Essential Hadith reference for scholars and students. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Access the authentic sayings of the Prophet (PBUH) with this reliable Hadith collection. Order with nationwide delivery.',
    ],
  },

  // ── Children (My Dua Book, Prayer Book, Wudu Book, Azkar, Qasas stories) ─
  children: {
    opens: [
      'Instilling Islamic values and practices in children during their formative years is among the most consequential responsibilities that Muslim parents face — a task that requires educational resources specifically designed for young minds, resources that combine engaging presentation with accurate content and that make the learning experience enjoyable rather than burdensome. {title} has been created to fulfill that need, addressing its young audience with language, illustrations, and activities that capture their attention while conveying the Islamic knowledge and values that will shape their character for a lifetime.',
      'The books that children encounter in their early years have a disproportionate influence on their intellectual and spiritual development — establishing patterns of thought, frameworks of understanding, and emotional associations that persist well into adulthood. Islamic children\'s literature that succeeds in making Quranic stories, Prophetic teachings, and religious practices feel natural, appealing, and relevant to young readers performs a service of incalculable value to both the individual child and the Muslim community. {title} is designed to provide exactly that kind of positive, formative reading experience.',
      'Children learn best when they are engaged, entertained, and emotionally invested in the material they are studying — principles that apply as strongly to Islamic education as they do to any other subject. {title} applies these pedagogical principles to its presentation of Islamic content, using age-appropriate language, relatable examples, and an inviting visual style that encourages children to explore, ask questions, and develop a genuine enthusiasm for learning about their faith.',
      'The stories of the Prophets hold a special power over young imaginations — narratives of faith, courage, miracles, and divine guidance that captivate children while simultaneously conveying the fundamental messages of Islamic belief and moral conduct. {title} brings these timeless stories to life for young readers, presenting them in a style that is both accessible to children and faithful to the authentic Islamic sources from which they are drawn, creating a reading experience that is as educational as it is enjoyable.',
    ],
    mids: [
      'This {detail} — {title} — has been carefully designed to match the developmental capabilities and attention spans of its target age group, with content that challenges without overwhelming and engages without trivializing. The language is simple enough for young readers to understand independently while rich enough to convey the full meaning of the concepts being taught. Key Islamic terms are defined in child-friendly language, important practices are explained step by step with clear illustrations, and the overall tone communicates warmth, encouragement, and respect for the child\'s intelligence. The physical production — sturdy binding, child-safe materials, and attractive color printing — has been specified to withstand the enthusiastic handling that children\'s books typically receive. Bab-ul-Fatah Pakistan offers this children\'s title at {price}, making quality Islamic education affordable for families throughout Pakistan.',
      'This {detail} — {title} — serves multiple roles in a child\'s Islamic education: as a book that children can enjoy reading on their own, as a resource that parents and teachers can use for guided instruction, and as a starting point for family conversations about faith, values, and the stories of the Prophets. The content has been reviewed for accuracy by scholars specializing in Islamic education for children, and the presentation has been tested for effectiveness with young readers. Whether given as a birthday gift, used as part of a home-schooling curriculum, or simply placed on a child\'s bookshelf to be discovered and explored, this {detail} delivers meaningful Islamic content in a format that children genuinely enjoy. Available at {price} from Bab-ul-Fatah Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Engaging Islamic content for young Muslim readers. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Beautifully designed Islamic books for children. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Nurture your child\'s faith with quality Islamic literature. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. A wonderful Islamic gift for the young learners in your family. Order with reliable nationwide delivery.',
    ],
  },

  // ── Biography (Qasas al Anbiya, Prophet stories, Illustrated Guides) ──────
  biography: {
    opens: [
      'The lives of the Prophets of Islam — from Adam to Muhammad (peace be upon them all) — constitute a narrative arc of extraordinary spiritual power, documenting how Allah\'s chosen messengers guided humanity through every stage of its development with unwavering faith, patient perseverance, and unwavering commitment to divine truth. {title} brings those prophetic biographies to life with a narrative vividness that enables readers to experience the challenges, triumphs, and spiritual journeys of these extraordinary individuals as if they were witnessing events firsthand.',
      'Biographical literature occupies a uniquely important position in Islamic scholarship because it transforms abstract theological principles into concrete, observable human experiences — showing not merely what the Prophets taught but how they lived, how they responded to adversity, how they guided their communities, and how they maintained their connection to Allah through every trial and tribulation. This {detail} — {title} — provides that biographical perspective on its subject, offering readers the kind of nuanced, human-scale understanding that complements and enriches the doctrinal knowledge they may already possess.',
      'The stories of the Prophets have been told and retold across generations of Muslim civilization, not merely as historical accounts but as sources of spiritual inspiration, moral guidance, and practical wisdom for navigating the challenges of human existence. Each prophetic life contains lessons that remain acutely relevant to contemporary readers — lessons about faith under pressure, patience through hardship, justice in governance, and compassion in leadership. {title} extracts and highlights those timeless lessons while maintaining fidelity to the authentic sources from which the stories are drawn.',
      'Understanding the lives of the Prophets of Allah is essential for every Muslim who wishes to appreciate the full scope of divine guidance in human history — for it is through the biographies of these remarkable individuals that one sees most clearly how abstract religious principles are translated into lived reality under conditions of extraordinary difficulty and complexity. This {detail} — {title} — makes those biographies accessible through a writing style that balances scholarly accuracy with narrative engagement, producing a work that serves simultaneously as a reference text and a compelling read.',
    ],
    mids: [
      'This {detail} — {title} — draws upon the most authoritative biographical sources in the Islamic tradition, including the Quranic narratives, the authenticated Hadith literature, and the classical works of Seerah and Qasas compiled by scholars whose methodologies have been validated through centuries of scholarly scrutiny. The narrative is enriched with contextual information that helps readers understand the historical, geographical, and cultural settings in which prophetic events unfolded, making the stories more accessible and meaningful to contemporary readers. Where multiple narrations exist for a single event, the significant variants are noted, allowing readers to appreciate the richness and depth of the Islamic biographical tradition. The production quality — clear typography, durable binding, and quality paper — ensures that this biography will serve as a lasting reference in any Islamic library. Bab-ul-Fatah Pakistan offers this {detail} at {price}.',
      'The value of this {detail} — {title} — extends beyond historical interest into the domain of personal spiritual development — each prophetic life presents a model of faith, character, and conduct that readers can aspire to emulate in their own lives. The author\'s commentary draws out these practical lessons explicitly, connecting the experiences of the Prophets to the challenges that contemporary Muslims face in their daily lives. Whether read sequentially as a complete narrative or consulted for specific prophetic biographies, this {detail} delivers content that educates, inspires, and strengthens the reader\'s faith. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price). Inspiring prophetic biographies for every Muslim reader. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Authenticated stories of the Prophets of Islam. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Learn from the lives of Allah\'s greatest servants. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential biographical literature for understanding Islamic history and faith. Order with reliable nationwide delivery.',
    ],
  },

  // ── Seerah (Our Prophet Muhammad, Payaam-e-Seerat, Pyary Rasool ki Seerat) ─
  seerah: {
    opens: [
      'The Seerah of Prophet Muhammad (peace be upon him) is not merely a biography in the conventional sense — it is a comprehensive blueprint for human excellence that addresses every dimension of individual and collective life, from the most intimate aspects of personal worship and family management to the most complex challenges of community leadership and international relations. {title} invites readers into a sustained engagement with that blueprint, presenting the Prophetic example in a manner that highlights its continuing relevance to the circumstances of contemporary Muslim life.',
      'Every generation of Muslims discovers new layers of meaning and practical guidance in the life of Prophet Muhammad (peace be upon him) — a testament to the extraordinary depth and comprehensiveness of his example as a leader, statesman, judge, husband, father, friend, merchant, military commander, and above all, as the final Messenger of Allah to humanity. {title} explores the multiple dimensions of that Prophetic personality with the reverence and analytical rigor that this subject demands, offering insights that enrich the reader\'s understanding regardless of their prior familiarity with Seerah literature.',
      'The word "Seerah" literally means "path" or "way" — an apt designation for the life history of Prophet Muhammad (peace be upon him), because his life represents the path that every Muslim is called to follow in seeking closeness to Allah and excellence in human conduct. Studying the Seerah is therefore not an academic luxury but a practical necessity for anyone who wishes to understand how Islamic principles translate into real-world behavior under the full range of human circumstances. This {detail} — {title} makes that study accessible and rewarding for readers at every level of prior knowledge.',
      'The historical record of Prophet Muhammad\'s (peace be upon him) life is distinguished from the biographies of all other historical figures by the extraordinary rigor with which it has been preserved — verified through chains of transmission that rival the most sophisticated modern systems of documentation, corroborated by multiple independent sources, and protected from alteration by the collective memory of an entire civilization. {title} draws upon that meticulously preserved record to present a Seerah narrative that readers can trust, supported by the scholarly apparatus that enables independent verification.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from the most authoritative Seerah sources available, including the classical works of Ibn Ishaq, Ibn Hisham, Imam Al-Waqidi, and Saifur Rahman Al-Mubarakpuri, supplemented by relevant narrations from the authenticated Hadith collections. The narrative structure provides both chronological coherence and thematic depth, enabling readers to follow the Prophet\'s life from birth to passing while also exploring specific aspects of his character and conduct — such as his mercy, his justice, his patience, his courage, and his wisdom — as discrete subjects of study. The writing style engages the reader\'s imagination while maintaining the factual accuracy that Seerah scholarship demands. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Seerah literature accessible to readers nationwide.',
      'The enduring appeal of this {detail} — {title} — lies in its ability to connect the reader emotionally and spiritually with the person of Prophet Muhammad (peace be upon him) — not merely as a historical figure to be studied but as a beloved role model whose example continues to illuminate the path of every Muslim who seeks to live a life pleasing to Allah. The author\'s approach balances scholarly objectivity with genuine reverence, producing a Seerah work that satisfies both the intellectual and the spiritual needs of the reader. The production quality — including clear typography, durable binding, and quality paper — ensures that this {detail} will serve as a lasting resource in any Islamic library. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Deepen your connection to the Prophet (PBUH) with this authoritative Seerah work. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). Inspiring and meticulously researched Prophetic biography. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. The life of Prophet Muhammad (PBUH) — beautifully presented and thoroughly sourced. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential Seerah literature for every Muslim home and library. Order with reliable nationwide delivery.',
    ],
  },

  // ── Home Decor (Bismillah Calligraphy) ────────────────────────────────────
  home_decor: {
    opens: [
      'Displaying the name of Allah or sacred Islamic phrases in one\'s home transforms ordinary living spaces into environments of spiritual awareness, where every glance at the wall serves as a gentle reminder of the Divine presence and the blessings of faith. The Bismillah — "In the name of Allah, the Most Gracious, the Most Merciful" — is the phrase with which Muslims begin every significant action, and rendering it in beautiful calligraphy elevates it from a spoken invocation to a permanent visual testament of faith. This {detail} — {title} — brings that spiritual and aesthetic dimension into the home with craftsmanship worthy of its sacred content.',
      'Islamic calligraphy represents one of the most sophisticated and revered art forms in human civilization — a tradition that has elevated the written word of Allah and the names of His Prophets to the highest levels of artistic expression across fourteen centuries of continuous creative development. This {detail} — {title} — carries forward that artistic tradition with contemporary manufacturing precision, producing a calligraphic piece that honors both the visual heritage of Islamic art and the aesthetic expectations of modern Pakistani interiors.',
      'The choice to adorn one\'s home with Islamic calligraphy reflects a desire to surround oneself and one\'s family with visible reminders of faith — a desire that Islamic civilization has honored and cultivated through an unbroken tradition of calligraphic art that stretches from the earliest Kufic inscriptions to the sophisticated designs produced by today\'s artists and craftspeople. This {detail} — {title} — represents the contemporary expression of that ancient tradition, combining traditional calligraphic forms with modern manufacturing techniques to produce a decorative piece that enhances any living space.',
    ],
    mids: [
      'This {detail} — {title} — has been manufactured using precision techniques that ensure every curve, dot, and flourish of the calligraphic script is reproduced with exceptional accuracy and consistency. The materials have been selected for their visual appeal, their durability, and their resistance to environmental factors that could compromise the piece\'s appearance over time. The {detail} is designed for versatile placement — suitable for display in living rooms, bedrooms, studies, and prayer areas alike — and arrives ready to hang or stand with appropriate mounting hardware or base included. The finish — whether standard or golden — has been formulated to maintain its visual impact through years of display. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing beautiful Islamic decor at accessible price points for Pakistani households.',
      'This {detail} from Bab-ul-Fatah serves as both a personal source of spiritual inspiration and an attractive decorative element that enhances the visual quality of any room. The gift potential of Islamic calligraphy is significant — these pieces are treasured presents for weddings, housewarmings, Eid celebrations, and graduations, combining aesthetic beauty with spiritual meaning in a way that few other gift items can match. The packaging has been designed to protect the piece during shipping while presenting it attractively for gift-giving occasions. At {price}, this {detail} offers exceptional value in the Islamic home decor category. Available from Bab-ul-Fatah Pakistan with delivery across all major cities.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Elegant Islamic calligraphy art for your home. Shop online with nationwide delivery.',
      'Purchase {title} from Bab-ul-Fatah Pakistan for {price}. Beautifully crafted Bismillah calligraphy decor. Order today with fast shipping across Pakistan.',
      'Buy this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. A meaningful Islamic art piece for any space. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Premium calligraphy decor — perfect for gifts and home beautification. Order with reliable nationwide delivery.',
    ],
  },

  // ── Products (Pak Matti, Pen Quran DQ2Plus) ──────────────────────────────
  products: {
    opens: [
      'Islamic products that facilitate worship and religious practice occupy a special place in the Muslim marketplace — they are not ordinary consumer goods but instruments of devotion that directly support the believer\'s ability to fulfill their religious obligations. The quality, reliability, and thoughtfulness of these products therefore carry a significance that transcends their material attributes, as they serve as enablers of worship that can enhance or impede the user\'s religious experience. This {detail} — {title} — has been designed and manufactured with that enhanced significance firmly in mind.',
      'Technology and tradition converge in the most innovative Islamic products of the modern era — devices and tools that leverage contemporary engineering to make the practice of Islam more accessible, more convenient, and more effective for Muslims navigating the complexities of twenty-first-century life. This {detail} — {title} — represents that convergence, combining modern manufacturing or electronic capabilities with the timeless needs of Muslim worship and religious practice.',
      'The practical essentials of Islamic worship extend beyond books and prayer garments to include specialized products that address specific religious needs — from the clean earth required for Tayammum ablution to the digital tools that support Quran learning and recitation practice. These products may lack the scholarly prestige of classical Islamic texts, but their practical contribution to the daily religious life of Muslims is substantial and undeniable. This {detail} — {title} — addresses one of those practical needs with a product designed for effectiveness, reliability, and ease of use.',
    ],
    mids: [
      'This {detail} — {title} — has been manufactured to meet the quality standards that Bab-ul-Fatah customers expect from every product they purchase. The materials are selected for their durability and suitability for their intended religious purpose, and the manufacturing process includes quality control checks that verify both functionality and compliance with relevant Islamic requirements. Whether the product is a traditional item like Tayammum earth or an advanced electronic device like a digital Quran pen, the same commitment to quality and reliability applies. The packaging is designed to protect the product during shipping while presenting it attractively upon arrival. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing essential Islamic products to Muslims throughout the country with delivery to all major cities.',
      'This {detail} — {title} — comes from Bab-ul-Fatah\'s curated selection of practical Islamic products, chosen for their quality, reliability, and genuine usefulness in supporting the daily worship practices of Muslims. The product has been tested for performance and durability, and the pricing has been set to make it accessible to a broad range of customers. Customer satisfaction is backed by Bab-ul-Fatah\'s established reputation as Pakistan\'s trusted source for Islamic goods. Whether purchased for personal use or as a gift for a family member or friend, this {detail} delivers practical value that will be appreciated with every use. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. A practical Islamic product for your daily worship needs. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. Quality Islamic products you can rely on. Order today with fast shipping across Pakistan.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Essential worship accessories for every Muslim. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Innovative Islamic products for contemporary Muslim life. Order with reliable nationwide delivery.',
    ],
  },

  // ── Women ─────────────────────────────────────────────────────────────────
  women: {
    opens: [
      'Motherhood is a journey that simultaneously represents one of the most challenging and one of the most blessed experiences in a Muslim woman\'s life — a profound transformation that reshapes her identity, priorities, and daily routines while opening a new chapter of spiritual growth, personal sacrifice, and immeasurable reward in the sight of Allah. {title} addresses the practical, emotional, and spiritual dimensions of that journey with sensitivity, wisdom, and a deep appreciation for the unique challenges that Muslim mothers face in balancing their religious obligations with the demands of childcare and family management.',
      'Islamic literature specifically written for women addresses a significant gap in the Islamic book market — a gap that has persisted despite the fact that women constitute half of the Muslim Ummah and exercise enormous influence over the spiritual and moral development of the next generation through their roles as mothers, educators, and household managers. {title} contributes to filling that gap by providing content that speaks directly to the experiences, concerns, and aspirations of Muslim women, offering guidance that is both religiously authentic and practically relevant to the realities of contemporary life.',
    ],
    mids: [
      'This {detail} — {title} — has been written by an author who understands the unique challenges and blessings of motherhood from both personal experience and Islamic scholarship. The content covers the practical aspects of caring for a newborn while also addressing the emotional and spiritual adjustments that new mothers must navigate, drawing upon Quranic guidance, Prophetic traditions, and the wisdom of experienced scholars and counselors. The writing style is warm, encouraging, and non-judgmental — creating a safe space for women to explore their questions and concerns without feeling overwhelmed or inadequate. The physical production — portable format, durable binding, clear typography — has been designed for convenient reading during the brief moments of quiet that new mothers can carve from their demanding schedules. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing essential reading for Muslim women during one of life\'s most transformative passages.',
      'This {detail} — {title} — serves as both a practical guide and a source of emotional support for women embarking on the journey of motherhood. The content draws upon Islamic teachings to provide a framework for understanding the spiritual significance of motherhood while offering concrete, actionable advice on the practical challenges of caring for an infant. Whether read during pregnancy, in the early weeks of motherhood, or as a reference during the toddler years, this {detail} provides the wisdom, encouragement, and reassurance that new mothers need. Available at {price} from Bab-ul-Fatah Pakistan with delivery to all major cities.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. An essential guide for Muslim mothers. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Support and guidance for the beautiful journey of motherhood. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. A thoughtful gift for new and expectant mothers. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Islamic wisdom and practical advice for Muslim women. Order with reliable nationwide delivery.',
    ],
  },

  // ── Family ────────────────────────────────────────────────────────────────
  family: {
    opens: [
      'The Muslim family is the fundamental building block of the Islamic social order — the primary institution through which religious values are transmitted, moral character is formed, and the next generation of believers is prepared to carry forward the trust of faith. Publications that strengthen family life by providing practical guidance on communication, conflict resolution, child-rearing, and mutual respect perform a service that benefits not only individual households but the entire Muslim community. {title} contributes to that vital service by addressing a specific dimension of family life with Islamic wisdom and practical insight.',
      'Building a harmonious Muslim household requires more than good intentions — it demands knowledge of the Islamic principles that govern family relationships, the practical skills needed to navigate the inevitable challenges of shared living, and the emotional maturity to apply both with patience and compassion. {title} provides that knowledge and those skills, drawing upon the Quran, the Prophetic example, and the accumulated wisdom of Islamic scholarship to offer guidance that is both spiritually grounded and practically applicable.',
      'The arrival of a new baby into a Muslim family initiates a series of religious and practical obligations that many parents — especially first-time parents — may not be fully prepared to fulfill. From the Islamic naming ceremony to the Aqeeqah, from the newborn\'s first sounds to their first words, the early days of a child\'s life are governed by Prophetic guidelines that express both the welcome of the community and the gratitude of the parents for Allah\'s blessing. {title} provides comprehensive guidance on these early-life obligations, helping parents fulfill their religious duties with knowledge and confidence.',
    ],
    mids: [
      'This {detail} — {title} — has been written with the practical needs of Pakistani Muslim families firmly in view, addressing the specific cultural, social, and economic circumstances that shape family life in contemporary Pakistan while grounding its guidance in the universal principles of Islamic family law and ethics. The content covers the relevant Quranic verses and authentic Hadith narrations that establish the rights and responsibilities of family members, supplemented with practical advice from experienced counselors and scholars who understand the real-world challenges that families face. The writing style is accessible and engaging, avoiding both the excessive formality of academic texts and the overly casual tone that can diminish the seriousness of the subject. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic family guidance available to households throughout the country.',
      'This {detail} — {title} — serves multiple roles within the family context: as a personal reference for parents navigating specific challenges, as a discussion starter for couples seeking to strengthen their relationship through shared reading, and as a teaching resource for family study circles that address family-related topics. The practical advice is presented alongside the evidentiary basis for each recommendation, empowering readers to make informed decisions rather than simply following prescriptions. Available at {price} from Bab-ul-Fatah Pakistan with delivery to all major cities.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Strengthen your family with Islamic wisdom and practical guidance. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Essential reading for every Muslim household. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Build a happier, more harmonious Muslim family. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Islamic family guidance rooted in Quran and Sunnah. Order with reliable nationwide delivery.',
    ],
  },

  // ── Fiqh ──────────────────────────────────────────────────────────────────
  fiqh: {
    opens: [
      'Islamic jurisprudence — Fiqh — provides the practical framework through which Muslims translate their faith into observable behavior, governing everything from the precise method of performing daily prayers to the complex rules governing financial transactions, family law, and social relations. {title} addresses a specific area of Fiqh with the scholarly precision and practical clarity that this demanding discipline requires, offering rulings that are grounded in the established methodology of Islamic legal reasoning while remaining accessible to readers who may not have advanced training in the Islamic sciences.',
      'The question of how to perform one\'s religious obligations correctly is among the most frequently asked — and most consequential — questions in a Muslim\'s life, because errors in worship may render those acts of devotion unacceptable to Allah while errors in financial dealings may involve the serious sin of dealing in Riba or other prohibited transactions. {title} provides authoritative answers to these practically important questions, drawing upon the Quran, the authenticated Sunnah, and the established scholarly consensus to deliver rulings that readers can follow with confidence.',
      'The intersection of Islamic jurisprudence with modern circumstances creates a complex landscape of questions that require both deep classical scholarship and an understanding of contemporary realities — questions about the permissibility of new technologies, the application of traditional rulings to novel situations, and the reconciliation of seemingly conflicting legal opinions from different schools of thought. {title} navigates that complex landscape with scholarly rigor and practical sensitivity, offering guidance that respects the classical tradition while addressing the realities of modern Muslim life.',
    ],
    mids: [
      'This {detail} — {title} — presents its Fiqh rulings with the full evidentiary basis that enables readers to understand not only what the ruling is but why it has been established — identifying the relevant Quranic verses, Hadith narrations, and scholarly opinions that support each position. Where multiple valid opinions exist within the Islamic legal tradition, the work presents the predominant view while acknowledging alternative positions, allowing readers to make informed choices in consultation with their own scholars and teachers. The language avoids unnecessary technical jargon while maintaining the precision that legal discussions require, and the organizational structure facilitates both systematic study and quick topic-based reference. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Fiqh literature accessible to readers across Pakistan.',
      'The practical orientation of this {detail} — {title} — distinguishes it from purely theoretical Fiqh texts by focusing on the questions and situations that readers actually encounter in their daily lives. Common mistakes are identified and corrected, frequently asked questions are addressed directly, and the rulings are presented in a format that supports immediate practical application. The production quality — clear typography, durable binding, and quality paper — ensures that this reference will serve its owner reliably through repeated consultation. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Authoritative Fiqh guidance for practicing Muslims. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Clear, evidence-based Islamic rulings for daily life. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price). Essential Fiqh reference for every Muslim household. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price). Practical Islamic jurisprudence rooted in authentic sources. Order with reliable nationwide delivery.',
    ],
  },

  // ── Sahah Sitta (Musnad Imam Ahmad 3-vol English) ───────────────────────
  sahah_sitta: {
    opens: [
      'The six canonical Hadith collections — known collectively as the Sahah Sitta — constitute the primary evidentiary foundation upon which the entire edifice of Islamic law and theology has been constructed over fourteen centuries of continuous scholarly effort. Among these six, the Musnad of Imam Ahmad bin Hanbal holds a position of particular distinction as the largest collection of Prophetic narrations ever compiled by a single scholar — a monumental work that reflects a lifetime of travel, research, and devotion to the preservation of the Prophet\'s legacy. This {detail} — {title} — makes this extraordinary collection accessible to English-speaking readers in a comprehensive three-volume translation.',
    ],
    mids: [
      'This {detail} — {title} — presents the complete Musnad of Imam Ahmad bin Hanbal in a carefully prepared English translation that renders the Arabic original with scholarly accuracy while maintaining readability for contemporary English-speaking audiences. Each volume has been organized according to the traditional arrangement established by Imam Ahmad, with narrations grouped by the companion who reported them — a structure that both preserves the scholarly integrity of the original work and facilitates reference use. The translation has been reviewed by scholars specializing in Hadith literature to ensure that it conveys the meaning of the Arabic text with the precision that this critically important work demands. The three-volume format makes the collection more manageable for study and reference than a single massive volume would allow. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making one of Islam\'s greatest Hadith collections accessible to English-speaking readers throughout Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. The Musnad of Imam Ahmad in English — a masterpiece of Hadith scholarship. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Over 30,000 Prophetic narrations in accessible English translation. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. An essential addition to any English-language Islamic library. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. One of the largest Hadith collections available in English. Order with reliable nationwide delivery.',
    ],
  },

  // ── Mushaf ────────────────────────────────────────────────────────────────
  mushaf: {
    opens: [
      'The Premium Quran Hakeem represents the pinnacle of Quranic publication — a Mushaf produced to the highest standards of calligraphic artistry, typographic precision, and physical craftsmanship, honoring the sacred text with the dignity and beauty that it deserves. A premium Mushaf is not merely a book to be read and shelved; it is a treasure to be cherished, a family heirloom to be passed from generation to generation, and a daily companion whose physical presence in the home brings blessings and tranquility to all who dwell within it.',
      'The choice of a Mushaf for daily recitation and worship is a decision that affects one\'s religious experience in subtle but significant ways — the clarity of the script influences the ease and accuracy of recitation, the quality of the paper affects the comfort of handling, and the durability of the binding determines whether this sacred companion will endure through years of faithful service. This {detail} — {title} — has been designed to excel in every one of these practical dimensions while also delivering the visual beauty and premium feel that elevate the experience of interacting with the Word of Allah.',
    ],
    mids: [
      'This {detail} — {title} — features a script that has been selected for its exceptional clarity and readability, conforming to the recitation standard of Hafs from Asim that is universally used across the Muslim world. The calligraphic quality ensures that every letter, vowel mark, and diacritical point is rendered with the precision required for accurate recitation, while the page layout balances line spacing, margins, and text positioning to minimize visual fatigue during extended reading sessions. The binding system — typically a premium hard cover — provides robust protection against damage while allowing the pages to open flat for comfortable reading on a desk or prayer stand. The paper quality supports smooth page-turning and resists the wear and tear of frequent handling. Bab-ul-Fatah Pakistan offers this premium Mushaf at {price}, making exceptional Quranic publication quality accessible to households across Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price). A premium Quran Hakeem crafted for daily recitation and lasting beauty. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Honor the Word of Allah with a beautifully produced Mushaf. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Premium quality Quran for your home and family. Order online now.',
    ],
  },

  // ── Translation (Punj Surah, Noble Quran English) ────────────────────────
  translation: {
    opens: [
      'Access to a reliable translation of the Quranic text is a necessity that every Muslim household shares — regardless of the linguistic background or educational level of its members — because understanding the meaning of Allah\'s message is essential for the faith to function as a living, practical guide rather than a ritual recitation devoid of comprehension. {title} provides that essential access by offering a translation that balances accuracy with readability, enabling readers to engage meaningfully with the Quranic text in a language they understand.',
      'The translation of sacred scripture is an undertaking of extraordinary responsibility — every word choice carries the potential to illuminate or obscure the divine meaning, and every interpretive decision implicitly shapes the reader\'s understanding of Allah\'s message. {title} approaches that responsibility with the seriousness it demands, employing translation methods that prioritize fidelity to the Arabic original while producing text that flows naturally in the target language.',
    ],
    mids: [
      'This {detail} — {title} — presents its translation with careful attention to the established principles of Quranic interpretation, ensuring that the rendered meaning aligns with the understanding of the classical mufassirun while remaining accessible to contemporary readers. The layout facilitates comparison between the original Arabic text and its translation, and the typographic quality ensures comfortable reading during extended study sessions. The production standards — durable binding, quality paper, clear printing — reflect the reverence appropriate to a work that carries the meaning of Allah\'s final revelation. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Quranic translation accessible to readers across Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Reliable Quran translation for understanding Allah\'s message. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). Authentic Quranic translation with clear presentation. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Essential Quran translation for every Muslim home. Order online now.',
    ],
  },

  // ── Companions ────────────────────────────────────────────────────────────
  companions: {
    opens: [
      'The Companions of Prophet Muhammad (peace be upon him) — the Sahaba — represent the first and finest generation of Muslims, the men and women who received Islam directly from the Prophet, who sacrificed their lives, their wealth, and their comfort for the sake of this faith, and who established the foundations upon which the entire edifice of Islamic civilization was subsequently built. Studying the lives and virtues of these extraordinary individuals strengthens a Muslim\'s faith, refines their character, and provides role models of excellence that transcend the boundaries of time and culture.',
      'The Quran itself bears witness to the unique status of the Companions, describing them as "the foremost among the Muhajireen and the Ansar and those who followed them with excellence" — a divine endorsement that has cemented their position as the gold standard of Islamic character and conduct for every subsequent generation of believers. {title} celebrates the legacy of these remarkable individuals, drawing upon authenticated historical sources to present their virtues, sacrifices, and contributions in a manner that inspires contemporary readers to emulate their example.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from the most reliable historical sources available, including the classical works of Seerah, the authenticated Hadith collections, and the biographical dictionaries compiled by early Islamic scholars who had access to direct testimony from the successors of the Companions themselves. The narratives are presented with proper source attribution and appropriate qualification where the historical record contains variant accounts. The writing style brings the Companions\' experiences to life with vivid description while maintaining the factual accuracy that scholarly integrity requires. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making the inspiring stories of the Sahaba accessible to readers across Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Inspiring stories of the Prophet\'s Companions (RA). Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). Learn from the greatest generation of Muslims. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. The lives and virtues of the noble Sahaba. Order online now.',
    ],
  },

  // ── History ───────────────────────────────────────────────────────────────
  history: {
    opens: [
      'Islamic history is a tapestry of extraordinary breadth and richness — a fourteen-century narrative that encompasses the rise of empires, the flowering of arts and sciences, the achievements of remarkable individuals, and the transmission of a divine message across continents and cultures. Understanding that history is essential for Muslims who wish to appreciate the heritage of their civilization and draw practical lessons from the experiences of previous generations. {title} opens a window into that historical heritage, documenting events and personalities that shaped the course of Muslim civilization.',
      'The study of history in Islam serves purposes that go far beyond the mere accumulation of dates and facts — it provides context for contemporary challenges, inspiration from past achievements, cautionary lessons from previous failures, and a sense of civilizational identity that connects modern Muslims to the great tradition of scholarship, governance, and cultural achievement that their forebears established. {title} makes that historical study accessible through a presentation that engages the reader\'s interest while maintaining scholarly accuracy.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from reliable historical sources with careful attention to the verification of dates, the authentication of quoted material, and the balanced presentation of events that may be described differently across various historical accounts. The narrative style brings historical figures and events to life while the scholarly apparatus supports readers who wish to pursue specific topics in greater depth. The production quality ensures durability through repeated consultation and reference. Bab-ul-Fatah Pakistan offers this {detail} at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Engaging Islamic history for readers of all backgrounds. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). Discover the rich heritage of Muslim civilization. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price). Well-researched Islamic history with reliable sources. Order online now.',
    ],
  },

  // ── Lifestyle ─────────────────────────────────────────────────────────────
  lifestyle: {
    opens: [
      'The challenges of modern life — anxiety, stress, uncertainty about the future, and the relentless pressure of competing demands — are not new phenomena; they are the universal human experiences that the Quran and the Prophetic Sunnah address with remarkable comprehensiveness and practical wisdom. What distinguishes the Islamic approach to these challenges is its integration of spiritual remedies — prayer, supplication, trust in Allah\'s plan, and gratitude for His blessings — with practical strategies for managing the circumstances that generate worry and distress. {title} presents that integrated Islamic approach in a format designed to provide immediate, actionable relief.',
      'Finding inner peace in a world characterized by noise, distraction, and relentless activity is a challenge that many contemporary Muslims face — a challenge that Islamic teachings are uniquely equipped to address through their emphasis on the remembrance of Allah (Dhikr), the recitation of the Quran, and the cultivation of trust (Tawakkul) in Allah\'s wisdom and mercy. {title} provides a practical guide to accessing that inner peace through Islamic spiritual practices and Prophetic remedies that have brought comfort and solace to Muslims across fourteen centuries.',
    ],
    mids: [
      'This {detail} — {title} — draws upon the Quran, the authenticated Hadith, and the practical advice of experienced Islamic counselors and scholars to provide a comprehensive approach to managing worry and anxiety from an Islamic perspective. The content covers specific supplications recommended by the Prophet (peace be upon him) for times of distress, practical advice on cultivating a positive mindset through gratitude and trust in Allah, and guidance on seeking appropriate help when needed. The writing style is warm, empathetic, and encouraging — avoiding both the clinical detachment of self-help manuals and the excessive severity of some religious texts. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing accessible Islamic guidance for life\'s challenges to readers across the country.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Find peace and relief through Islamic wisdom. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). Overcome worry and anxiety with Quranic guidance and Prophetic remedies. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price). A practical Islamic guide to inner peace and tranquility. Order online now.',
    ],
  },

  // ── Reference ─────────────────────────────────────────────────────────────
  reference: {
    opens: [
      'Islamic reference works serve an indispensable function in the intellectual infrastructure of Muslim communities — they are the authoritative sources to which scholars, students, educators, and curious readers turn when they need verified information on specific questions of faith, practice, or history. In an era of widespread misinformation and unverified online content, the importance of reliable reference works prepared by qualified scholars has only increased. {title} fulfills that reference function by providing carefully researched, well-sourced content that readers can consult with confidence.',
      'The ability to access accurate religious information quickly and conveniently is a practical necessity for Muslims who face daily questions about the permissibility, recommended procedure, or spiritual significance of various actions and situations. {title} addresses that practical need by organizing its content for rapid consultation while maintaining the scholarly standards that give reference works their authority and reliability.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled with meticulous attention to accuracy, drawing upon the most authoritative available sources and presenting information with proper attribution and appropriate contextual explanation. The organizational structure supports both systematic reading and quick reference, with clear headings, a logical chapter arrangement, and cross-references that connect related topics. The writing style prioritizes clarity and concision, conveying essential information without unnecessary elaboration. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic reference material accessible to readers across Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Reliable Islamic reference for every Muslim household. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). Verified Islamic content you can trust. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price). An essential Islamic reference for your library. Order online now.',
    ],
  },

  // ── General (fallback) ────────────────────────────────────────────────────
  general: {
    opens: [
      'Islamic literature in Urdu serves as the primary intellectual and spiritual nourishment for millions of Pakistani Muslims, connecting them to the foundational texts, scholarly discussions, and practical guidance that shape their understanding and practice of Islam in the context of their daily lives. {title} contributes to that rich literary tradition by providing content that addresses its subject with the depth, accuracy, and accessibility that readers of Islamic literature in Pakistan have come to expect from quality publications.',
      'The demand for well-written, authentically sourced Islamic books in Pakistan continues to grow as Muslims of every generation seek resources that help them understand their faith more deeply, practice it more correctly, and share it more effectively within their families and communities. {title} has been prepared to meet that demand with a publication that balances scholarly authority with reader-friendly presentation, offering content that can be trusted for its accuracy and appreciated for its clarity.',
      'Every worthwhile Islamic book carries within its pages the potential to transform a reader\'s understanding, refine their practice, and strengthen their connection to their faith — a potential that is realized when the author combines genuine expertise with effective communication and when the publisher invests in the production quality that supports repeated reading and long-term reference. {title} embodies that combination of scholarly substance and production quality, making it a valuable addition to any Islamic library.',
    ],
    mids: [
      'This {detail} — {title} — has been produced to meet the standards that Pakistani readers of Islamic literature expect: well-organized content, clear and accurate writing, reliable sourcing from primary Islamic texts, and physical construction that supports the kind of regular use that these books typically receive. The topic has been addressed comprehensively, with attention to both the theoretical foundations and the practical applications that make Islamic knowledge immediately relevant to the reader\'s daily life. The production quality — durable binding, clear typography, and quality paper — ensures that this title will serve as a lasting addition to any Islamic library. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic literature affordable for readers throughout Pakistan.',
      'The practical value of this {detail} — {title} — lies in its ability to make its subject accessible to readers across a range of backgrounds and knowledge levels while maintaining the depth and accuracy that more advanced students require. The organizational structure facilitates both sequential reading and quick reference, and the overall presentation reflects a genuine respect for both the subject matter and the reader\'s intelligence. Whether used for personal study, family reading, or as a teaching resource in community settings, this {detail} delivers reliable content in an appealing format. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Quality Islamic content for every reader. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price). A valuable addition to your Islamic library. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price). Reliable, well-presented Islamic literature. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price). Trusted Islamic content at an accessible price. Order with reliable nationwide delivery.',
    ],
  },
};

// ─── Description generator ──────────────────────────────────────────────────
function generateDescription(product, index) {
  const catKey = detectCat(product);
  const templates = T[catKey] || T.general;
  const title = product.title;
  const price = formatPrice(product.price);
  const detail = productDetail(title, index) || 'well-regarded Islamic publication';

  const hash = hashStr(product.title || '') + index;
  const openIdx = hash % templates.opens.length;
  const midIdx = (hash >> 4) % templates.mids.length;
  const closeIdx = (hash >> 8) % templates.closes.length;

  let desc = templates.opens[openIdx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{detail\}/g, detail);

  desc += '\n\n' + templates.mids[midIdx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{detail\}/g, detail);

  desc += '\n\n' + templates.closes[closeIdx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{detail\}/g, detail);

  return desc.trim();
}

// ─── Meta description generator ─────────────────────────────────────────────
function generateMetaDescription(product, index) {
  const title = product.title;
  const price = formatPrice(product.price);
  const cat = ((product.category && product.category.name) || '').toLowerCase();

  const metaTemplates = [
    `Buy ${title} at Bab-ul-Fatah Pakistan for ${price}. Authentic Islamic ${cat} content. Order online with fast delivery across all cities in Pakistan.`,
    `Order ${title} from Bab-ul-Fatah Pakistan — ${price}. Trusted Islamic ${cat} publication with verified content. Shop now with nationwide shipping.`,
    `${title} — available at Bab-ul-Fatah Pakistan for ${price}. Browse our complete Islamic bookstore collection and order with secure delivery.`,
    `Shop ${title} online at Bab-ul-Fatah Pakistan for just ${price}. Quality Islamic ${cat} resource. Reliable nationwide delivery to your doorstep.`,
    `Get ${title} from Bab-ul-Fatah — Pakistan's trusted Islamic store — for ${price}. Order today with fast shipping and careful packaging.`,
    `Purchase ${title} for ${price} at Bab-ul-Fatah Pakistan. Dependable Islamic ${cat} content. Order online for fast, secure delivery anywhere in Pakistan.`,
  ];

  const idx = (hashStr(product.title || '') + index) % metaTemplates.length;
  let meta = metaTemplates[idx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{cat\}/g, cat);

  if (meta.length > 155) meta = meta.substring(0, 152) + '...';
  if (meta.length < 120) {
    const pad = ' Bab-ul-Fatah Pakistan.';
    if (meta.length + pad.length <= 155) meta += pad;
  }

  return meta;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Bab-ul-Fatah — SEO Batch 8 Description Writer             ║');
  console.log('║   Products 801–900 (skip 700, take 100, orderBy createdAt)  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ── Step 1: Fetch products ──────────────────────────────────────────────
    console.log('[1/5] Fetching products (skip 700, take 100) …');
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      skip: 700,
      take: 100,
      select: { id: true, title: true, slug: true, price: true, category: { select: { name: true } } },
    });

    // Enrich with categoryName for detectCat
    const enriched = products.map(p => ({
      ...p,
      categoryName: (p.category && p.category.name) || '',
    }));

    // Save to batch8-products.json
    const productsPath = path.join(__dirname, 'batch8-products.json');
    fs.writeFileSync(productsPath, JSON.stringify(enriched, null, 2));
    console.log(`  Saved ${enriched.length} products → ${productsPath}\n`);

    // ── Step 2: Generate descriptions ──────────────────────────────────────
    console.log('[2/5] Generating descriptions …');
    const metaRecords = [];

    for (let i = 0; i < enriched.length; i++) {
      const p = enriched[i];
      const desc = generateDescription(p, i);
      const meta = generateMetaDescription(p, i);
      metaRecords.push({
        id: p.id,
        slug: p.slug,
        title: p.title,
        metaDescription: meta,
        wordCount: desc.split(/\s+/).length,
        metaCharCount: meta.length,
      });

      if ((i + 1) % 25 === 0 || i === enriched.length - 1) {
        console.log(`  Processed ${i + 1}/${enriched.length}`);
      }
    }
    console.log();

    // ── Step 3: Update database ────────────────────────────────────────────
    console.log('[3/5] Updating database …');
    let updated = 0;
    for (let i = 0; i < enriched.length; i++) {
      const p = enriched[i];
      const desc = generateDescription(p, i);
      await prisma.product.update({
        where: { id: p.id },
        data: { description: desc },
      });
      updated++;
      if (updated % 25 === 0 || updated === enriched.length) {
        console.log(`  Updated ${updated}/${enriched.length} products`);
      }
    }
    console.log();

    // ── Step 4: Save meta JSON ─────────────────────────────────────────────
    console.log('[4/5] Saving meta descriptions …');
    const metaPath = path.join(__dirname, 'seo-meta-batch8.json');
    fs.writeFileSync(metaPath, JSON.stringify(metaRecords, null, 2));
    console.log(`  Saved ${metaRecords.length} meta records → ${metaPath}\n`);

    // ── Step 5: Update progress ────────────────────────────────────────────
    console.log('[5/5] Updating seo-progress.json …');
    const progressPath = path.join(__dirname, 'seo-progress.json');
    let progress = {};
    try {
      progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    } catch (e) {
      progress = { batches: {}, totalProducts: 1285, totalBatches: 13, completedBatches: 0, completedProducts: 0 };
    }

    progress.batches['8'] = {
      status: 'completed',
      startIdx: 801,
      endIdx: 900,
      updatedAt: new Date().toISOString(),
      productsUpdated: enriched.length,
      metaFile: 'scripts/seo-meta-batch8.json',
    };
    progress.completedBatches = 8;
    progress.completedProducts = 900;

    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  completedBatches: ${progress.completedBatches}`);
    console.log(`  completedProducts: ${progress.completedProducts}\n`);

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Batch 8 complete!');
    console.log(`  Products processed: ${enriched.length}`);
    console.log(`  DB records updated: ${updated}`);
    console.log(`  Meta file: ${metaPath}`);
    console.log(`  Progress: ${progress.completedBatches}/${progress.totalBatches} batches (${progress.completedProducts}/${progress.totalProducts} products)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Batch 8 failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
