#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 1 Description Writer v2
// Writes unique, SEO-optimized product descriptions for 100 Islamic products
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
function langName(l) { return { URDU: 'Urdu', ARABIC: 'English', ARABIC: 'Arabic', ENGLISH: 'English', PUNJABI: 'Punjabi' }[l] || 'English'; }
function formatPrice(p) { return 'Rs. ' + Number(p).toLocaleString('en-PK'); }

function extractDetails(title, cat) {
  const t = title.toLowerCase();
  let lines = null, binding = 'standard binding', format = 'standard script', parts = null;
  const lineMatch = t.match(/(\d+)\s*line/);
  if (lineMatch) lines = parseInt(lineMatch[1]);
  if (/soft\s*cover/i.test(t)) binding = 'soft cover binding';
  if (/hard\s*cover/i.test(t)) binding = 'hard cover binding';
  if (/leather/i.test(t)) binding = 'leather cover binding';
  if (/jumbo/i.test(t)) { format = 'jumbo large-format script'; binding = 'durable reinforced binding'; }
  if (/tajweed|tajweedi|color\s*coded/i.test(t)) format = 'color-coded Tajweed script';
  if (/hafzi/i.test(t)) format = 'Hafzi memorization script';
  if (/lafzi/i.test(t)) format = 'word-by-word translation format';
  if (/bamuhawara|muhawara/i.test(t)) format = 'word-by-word Urdu translation format';
  if (/parah|para/i.test(t)) {
    const partMatch = t.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
    if (partMatch) parts = `Parah ${partMatch[1]} to ${partMatch[2]}`;
    const setMatch = t.match(/(\d+)\s*vol/i);
    if (setMatch && !partMatch) parts = `${setMatch[1]}-volume complete set`;
  }
  if (/set|complete\s*set/i.test(t) && !parts) parts = 'complete multi-volume set';
  const volMatch = t.match(/(\d+)\s*vol/i);
  if (volMatch && !parts) parts = `${volMatch[1]}-volume set`;
  return { lines, binding, format, parts };
}

// ─── Category routing ────────────────────────────────────────────────────────
function detectCatKey(product) {
  const cat = (product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  if (/hadith|sahih|bukhari|muslim|riyad/i.test(cat) || /sahih al-bukhari|sahih muslim|riyad/i.test(title)) return 'hadith';
  if (/tafseer|tafheem|tafsir/i.test(cat) || /tafseer|tafheem|tafsir|ahsan-al-hawashi/i.test(title)) return 'tafseer';
  if (/spirituality/i.test(cat) || /ihya|hisnul|fortress of the muslim/i.test(title)) return 'spirituality';
  if (/parah parts/i.test(cat) || /parah|para|quran pak/i.test(title)) return 'quran_parah';
  if (/mushaf/i.test(cat)) return 'quran_parah';
  if (/quran/i.test(cat) && !/parah/i.test(cat)) return 'quran_parah';
  if (/translation/i.test(cat)) return 'translation';
  if (/seerah/i.test(cat) || /sealed nectar/i.test(title)) return 'seerah';
  if (/biography/i.test(cat)) return 'biography';
  if (/prophets seerah/i.test(cat) || /akhlaaq e nabvi/i.test(title)) return 'seerah';
  if (/companions/i.test(cat) || /abdullah bin umar|abu dhar|abu ubaidah|abu lahab|advisors of the prophet/i.test(title)) return 'companions';
  if (/fiqh/i.test(cat) || /fiqh|ahkam.*wuzu|usool/i.test(title)) return 'fiqh';
  if (/children/i.test(cat) || /kids|child way|cruel joke|teeny|day in the life|day out|zoo|man and a horse|book of number|ahmad has|ahmet|concise children|abdul haq|abdul hay|diploma|nojwaan/i.test(title)) return 'children';
  if (/women/i.test(cat) || /treatise on hijab|well guarded|ae meri|agar aap|ahkam e satr/i.test(title)) return 'women';
  if (/family/i.test(cat) || /aab-e-hayat|1000 se zyada|10 azkaar/i.test(title)) return 'family';
  if (/hajj umrah/i.test(cat) || /hajj/i.test(title)) return 'hajj';
  if (/ahadith qudsi/i.test(cat) || /ahadith qudsi/i.test(title)) return 'qudsi';
  if (/arabic learning/i.test(cat) || /arabic for|noorani qaida|abwab us sarf|thesaurus/i.test(title)) return 'arabic';
  if (/pillars/i.test(cat) || /guide to salat/i.test(title)) return 'pillars';
  if (/islamic products/i.test(cat) || /ajwah/i.test(title)) return 'products';
  if (/imams scholars/i.test(cat) || /creed of as-salaf/i.test(title)) return 'scholars';
  if (/faith aqeedah/i.test(cat) || /aalam|aqeedah/i.test(title)) return 'aqeedah';
  if (/marital/i.test(cat) || /aap ke masail/i.test(title)) return 'marital';
  if (/reference/i.test(cat) || /glimpse at the beauty/i.test(title)) return 'reference';
  if (/darussalam publishers/i.test(cat) || /akhri azaab|7a-2/i.test(title)) return 'darussalam';
  if (/ahadith e nabvi/i.test(cat) || /20 hadith for kids|200 ahadees|200 golden|60 sunehri|60 golden/i.test(title)) return 'nabvi';
  if (/islamic history/i.test(cat) || /stories of the prophets|qasas/i.test(title)) return 'history';
  if (/education/i.test(cat)) return 'education';
  return 'general';
}

// ─── Templates: Using arrays where each element is DISTINCT enough to guarantee uniqueness ───
// Each template array has enough items. For products in the same category, we use index % length to pick.
// Plus product-specific detail injection makes each fully unique.

const T = {
  hadith: {
    opens: [
      'The authentic Hadith collections of Islam represent the second most vital source of divine guidance after the Holy Quran, preserving the blessed words and actions of Prophet Muhammad (peace be upon him) for all generations to come. This esteemed {title} published in {lang} stands as an indispensable reference for every Muslim household seeking to follow the Prophetic example in daily life.',
      'Immerse yourself in the luminous traditions of the Prophet (peace be upon him) with this meticulously compiled {lang} work, {title}. Scholars throughout Islamic history have regarded access to authentic Hadith literature as essential for understanding and practicing Islam properly, and this collection delivers that scholarly rigor alongside practical accessibility for contemporary readers in Pakistan.',
      'For over fourteen centuries, the authentic sayings of Prophet Muhammad (peace be upon him) have served as a comprehensive guide for Muslims navigating every dimension of life, from personal worship to community relations. This distinguished {lang} edition titled {title} brings those sacred narrations to readers with meticulous attention to chain authentication and contextual clarity.',
      'The preservation of Prophetic traditions represents one of Islam\'s greatest scholarly achievements, and this {lang} publication of {title} continues that noble tradition faithfully. Each narration has been carefully verified through rigorous isnad analysis, ensuring readers receive only the most authentic guidance from the blessed life of the Messenger of Allah (peace be upon him).',
      'Studying the Hadith of Prophet Muhammad (peace be upon him) is a lifelong spiritual journey that transforms both understanding and practice. This remarkable {lang} collection, {title}, offers a structured pathway into that journey, with narrations organized thematically so readers can easily locate guidance on matters of faith, worship, character development, and community responsibility.',
      'The chain of narration (isnad) system unique to Islamic scholarship has preserved the words of the Prophet (peace be upon him) with unparalleled accuracy across generations. This {lang} edition of {title} honors that tradition by presenting narrations with their full chains and scholarly grading, making it an essential resource for serious students of Islamic knowledge in Pakistan.',
      'Authentic Hadith literature forms the living bridge between the Quranic revelation and the daily practice of Islam, connecting divine guidance to human experience. Through this comprehensive {lang} compilation, {title}, readers gain direct access to the Prophetic guidance that has illuminated the path of righteousness for Muslims across every era, geography, and cultural background.',
      'No Muslim library is truly complete without a reliable Hadith collection that covers the breadth of Prophetic guidance, and this {lang} edition of {title} fulfills that essential need with distinction. The compiler\'s exacting standards for narration authenticity ensure that every Hadith presented carries the weight of verified scholarly transmission and reliable chain analysis.',
    ],
    mids: [
      'Covering topics that range from the foundations of faith (Iman) and the pillars of worship to matters of social ethics, business transactions, and family life, this collection provides comprehensive practical guidance for Muslims everywhere. The narrations are presented with explanatory notes that illuminate the historical context and scholarly significance of each tradition, helping readers apply Prophetic wisdom to contemporary situations. Scholars of Islamic studies will particularly value the detailed chain analysis, while general readers will appreciate the clear, accessible presentation of these timeless teachings.',
      'What sets this Hadith collection apart is its meticulous organizational structure, which groups related narrations together to provide a comprehensive picture of the Prophet\'s guidance on each topic. The compiler has included biographical notes on the narrators, assessments of Hadith authenticity, and cross-references to related narrations in other major collections. This scholarly apparatus makes the work invaluable for academic research while remaining approachable for readers at every level of Islamic knowledge.',
      'Each chapter of this compilation addresses a specific theme relevant to Muslim life, allowing readers to quickly find Prophetic guidance on matters of personal conduct, communal responsibility, and spiritual development. The {lang} translation preserves the nuance and depth of the original Arabic text, while the explanatory commentary bridges the gap between classical context and modern application. The careful scholarship behind this edition has earned it the respect of Islamic educators and students worldwide.',
      'This work demonstrates the remarkable breadth of Prophetic guidance, encompassing matters as diverse as purification and prayer, fasting and charity, marriage and divorce, trade and inheritance, patience and gratitude, and the rights of neighbors and travelers. By presenting these narrations with their complete chains of transmission, the compiler enables readers to appreciate the extraordinary care with which Islamic scholars preserved the Sunnah across many generations.',
    ],
    closes: [
      'Available now at Bab-ul-Fatah, Pakistan\'s most trusted destination for authentic Islamic literature. This {title} is priced at {price}, offering exceptional scholarly value for your investment in Islamic knowledge. Order online today and have this essential Hadith collection delivered to your doorstep anywhere in Pakistan, with the reliable service and careful packaging that Bab-ul-Fatah is renowned for.',
      'Enhance your Islamic library with this authoritative Hadith collection from Bab-ul-Fatah, the leading Islamic bookstore in Pakistan. At just {price}, this {lang} edition of {title} represents an outstanding investment in your knowledge of the Prophetic tradition. Shop with confidence knowing that every publication from Bab-ul-Fatah is selected for its authenticity and scholarly merit.',
      'Bring the wisdom of the Prophet (peace be upon him) into your home with this essential {lang} Hadith collection available at Bab-ul-Fatah. Priced affordably at {price}, {title} ships with fast and reliable delivery across all cities in Pakistan. Join thousands of satisfied customers who trust Bab-ul-Fatah for their Islamic book needs.',
      'Order this comprehensive Hadith compilation from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, this {lang} edition of {title} offers an unparalleled opportunity to deepen your connection with the Prophetic Sunnah. We deliver to all cities in Pakistan with the care and efficiency you expect from a trusted Islamic retailer.',
    ],
  },
  tafseer: {
    opens: [
      'Understanding the Holy Quran requires more than translation alone; it demands the insights of accomplished scholars who have dedicated their lives to unraveling the depths of divine revelation. This {lang} tafseer, {title}, represents the pinnacle of Quranic exegesis, guiding readers through every verse with scholarly precision, historical context, and practical wisdom that illuminates the relevance of Quranic teachings for contemporary life.',
      'The science of tafseer (Quranic interpretation) stands as one of the most revered disciplines in Islamic scholarship, and this magnificent {lang} work, {title}, embodies the highest standards of that scholarly tradition. Drawing upon authenticated Hadith, opinions of the Sahabah, and established principles of Arabic linguistics, this tafseer provides readers with a comprehensive understanding of the Quranic message.',
      'Unlock the profound meanings concealed within the Holy Quran with this authoritative {lang} tafseer titled {title}. This monumental work of Islamic scholarship traverses every surah and verse, explaining the circumstances of revelation, linguistic nuances, legal rulings, and spiritual lessons that make the Quran a living guide for all humanity.',
      'For centuries, Muslim scholars have produced tafseer works that illuminate the divine message of the Quran for each new generation, and this {lang} edition of {title} continues that distinguished scholarly tradition. The commentator\'s method combines intellectual depth with practical accessibility, making complex theological concepts understandable while preserving the scholarly rigor that Islamic exegesis demands.',
    ],
    mids: [
      'This tafseer employs a classical methodology that prioritizes explaining the Quran through the Quran itself, then through authenticated Hadith, then through the interpretations of the noble Companions, and finally through the reasoned opinions of early scholars. This layered approach ensures that the interpretation remains firmly rooted in authentic Islamic sources throughout. The {lang} prose is clear and flowing, making even the most complex discussions accessible to educated readers. Students of Islamic studies, imams, and educators will find this work to be an indispensable companion in their study and teaching of the Holy Quran.',
      'Each section of this tafseer begins with the context of revelation (asbab al-nuzul), followed by a verse-by-verse explanation that draws upon classical commentaries and linguistic analysis. The commentary addresses theological questions, legal implications, moral lessons, and spiritual reflections, providing a holistic understanding of each passage. The multi-volume format allows for thorough treatment of every surah, making this tafseer suitable for both systematic study and quick reference.',
      'The beauty of this tafseer lies in its ability to connect Quranic verses to the broader narrative of Islamic theology and practice. Where verses contain legal rulings, the commentator explains the scholarly consensus and differing opinions with fairness. Where verses offer spiritual comfort, the commentary draws out the deeper emotional and psychological dimensions of the divine message. This comprehensive approach ensures that readers gain both intellectual understanding and spiritual enrichment.',
    ],
    closes: [
      'Order this essential tafseer from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at {price}, this {lang} edition of {title} offers extraordinary scholarly value for students, teachers, and every Muslim seeking deeper Quranic understanding. We deliver across Pakistan with care, reliability, and respect for Islamic scholarship.',
      'Add this comprehensive Quranic commentary to your Islamic library through Bab-ul-Fatah. At {price}, this {lang} tafseer titled {title} is an investment in lasting Islamic knowledge that will benefit you and your family for generations. Shop from Pakistan\'s premier online Islamic bookstore with complete confidence.',
      'Bring home this authoritative tafseer and transform your Quranic study experience starting today. Available at Bab-ul-Fatah for {price}, this {lang} edition of {title} is shipped with careful packaging to all locations in Pakistan. Order now and begin your journey into the depths of Quranic wisdom and divine guidance.',
    ],
  },
  quran_parah: {
    opens: [
      'The Holy Quran holds a position of unparalleled reverence in the life of every Muslim, and having access to a beautifully produced, accurately printed edition is essential for daily recitation, study, and memorization. This {lang} edition featuring {lines}-line script offers an ideal reading experience, with text formatted to the classical South Asian standard that millions of hafiz and reciters have relied upon for generations across Pakistan and the wider Muslim world.',
      'Reciting the Holy Quran is one of the most meritorious acts in Islam, and having a well-formatted, easy-to-read copy enhances that blessed experience significantly. This premium {lang} {title} in {lines}-line format has been printed with meticulous attention to the placement of every letter, dot, and diacritical mark, ensuring accuracy that meets the exacting standards required for memorization and formal recitation.',
      'For students of the Quran, whether they are beginning their memorization journey or are seasoned huffaz with years of experience, the quality of the printed text makes a profound difference in the recitation experience. This {lang} edition with its {lines}-line classical script presents the words of Allah in a clear, spacious layout that reduces eye strain and supports extended reading sessions. The {binding} ensures this sacred text remains protected through years of daily use.',
      'The tradition of dividing the Holy Quran into thirty parts (ajza) for convenient recitation dates back to the earliest days of Islam, making it possible for every Muslim to complete a full reading each month. This {lang} {title} honors that tradition with a carefully produced {lines}-line format that makes it easy to track progress through daily reading plans. Printed on quality paper with durable {binding}, this edition is designed to be a lifelong companion in your Quranic journey.',
      'Every Muslim home deserves a beautifully produced copy of the Holy Quran, and this {lang} {title} in {lines}-line script fulfills that need with distinction. The {format} used in this edition follows the renowned Pakistani printing tradition, recognized worldwide for its clarity and precision. Whether used for personal recitation, teaching children the Quran, or formal study, this edition meets the highest standards of Islamic publishing.',
      'This exceptional {lang} {title} represents the finest traditions of Quranic printing in Pakistan, featuring {lines}-line script in a {binding} format that balances elegance with practical durability. The text has been carefully proofread by qualified Quranic scholars to ensure complete accuracy in every word and diacritical mark. The generous page size provides a comfortable reading experience for readers of all ages, from young students to elderly scholars.',
      'The careful selection of script size and page layout in this {lang} edition reflects decades of expertise in Islamic publishing and Quranic printing. This {title} in {lines}-line format provides ample spacing between lines, making it easier for teachers to point to specific words and for students to follow along during group recitation sessions. The {binding} format makes it practical for daily transport to mosques and Islamic centers throughout Pakistan.',
      'Produced by master calligraphers and printed using advanced technology, this {lang} edition of {title} maintains the beauty and accuracy of traditional Quranic manuscripts while benefiting from modern printing precision. The {lines}-line format divides the text into easily manageable sections for daily reading, and the {binding} provides the durability needed for regular use in homes, mosques, and Islamic schools across Pakistan.',
    ],
    mids: [
      'The {format} used in this edition ensures that every verse is clearly delineated and easy to follow during recitation. The printing quality meets the rigorous standards demanded by Islamic scholars, with proper spacing between words and precise placement of vowel marks and tajweed indicators. This attention to typographic detail makes the text particularly suitable for students who are learning to recite with proper pronunciation and those who are committed to memorizing the complete Quran. The {binding} construction ensures the pages lay flat during use and the covers protect the sacred text from damage during transport and daily handling.',
      'This edition is particularly well-suited for Quranic study circles and hifz programs, where clear text formatting directly impacts learning efficiency and memorization speed. The {lines}-line script provides ample spacing between lines, making it easier for teachers to point to specific words and for students to follow along during group recitation. The {binding} format makes it practical for daily transport to mosques and Islamic centers. Schools and madrasas throughout Pakistan have adopted this format as a standard for Quranic education due to its proven effectiveness.',
      'The text has been meticulously checked by qualified Huffaz and Quranic scholars to ensure absolute accuracy, a process that reflects the deep reverence Muslims hold for the words of Allah. Each page of this {lang} edition features clear surah headings, verse numbers, juz markers, and sajda indicators that help readers navigate the Quran with confidence and ease. The {binding} construction provides the structural integrity needed to withstand daily use while maintaining the dignity and respect that the Holy Quran deserves.',
      'The quality of paper selected for this {lang} {title} has been specifically chosen for its durability and readability. The opaque, off-white pages minimize eye strain during extended recitation sessions and prevent text from showing through from the opposite side. Combined with the {lines}-line script format and {binding}, this edition represents an excellent balance of traditional Islamic craftsmanship and modern printing technology, making it suitable for both personal use and as a meaningful gift on special occasions.',
    ],
    closes: [
      'Order this premium {lang} Quran edition from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at just {price}, this {title} with {lines}-line script and {binding} is available for delivery across all cities in Pakistan. Experience the convenience of online ordering with Bab-ul-Fatah\'s reliable shipping and careful packaging for every order.',
      'Bring home this beautifully produced {lang} {title} from Bab-ul-Fatah, the leading Islamic bookstore in Pakistan. At {price}, this {lines}-line {binding} edition offers outstanding quality and value for discerning buyers. Shop with confidence from Pakistan\'s premier Islamic bookstore, where every Quran is handled with the utmost respect and delivered safely.',
      'Add this exceptional {lang} Quran to your collection through Bab-ul-Fatah, your reliable source for authentic Islamic publications in Pakistan. Priced at {price}, this {lines}-line {binding} edition is perfect for daily recitation, hifz memorization, and gifting. Order online today for fast, secure delivery across Pakistan.',
      'Invest in a high-quality {lang} {title} from Bab-ul-Fatah, Pakistan\'s trusted online Islamic bookstore. This {lines}-line {binding} edition at {price} represents the best in Pakistani Quranic printing. We deliver to all cities and towns across Pakistan with the care, speed, and efficiency that our customers deserve.',
    ],
  },
  seerah: {
    opens: [
      'The life of Prophet Muhammad (peace be upon him) represents the most perfect model of human conduct ever witnessed in history, and studying his biography (seerah) is essential for every Muslim who seeks to understand and implement Islam fully in their life. This {lang} work titled {title} provides a comprehensive, well-researched account of the Prophet\'s life, from the blessed circumstances of his birth in Makkah to his role as the leader of a thriving civilization in Madinah.',
      'Understanding the seerah of Prophet Muhammad (peace be upon him) illuminates every aspect of Islamic faith and practice, providing the living historical context in which the Quran was revealed and the early Muslim community was established. This {lang} publication, {title}, draws upon the most authentic historical sources to present a vivid, engaging narrative that brings the Prophetic era to life for contemporary readers in Pakistan.',
      'The biography of Prophet Muhammad (peace be upon him) is not merely a historical account but a source of eternal guidance and inspiration for Muslims in every age and place. This {lang} work, {title}, captures the extraordinary journey of the Final Messenger with scholarly precision and narrative elegance, revealing the profound wisdom, unwavering courage, and boundless compassion that defined his noble character throughout his blessed life.',
      'From the first revelation in the Cave of Hira to the establishment of the first Islamic state, the life of Prophet Muhammad (peace be upon him) demonstrates how divine guidance can transform individuals and entire societies. This {lang} edition of {title} chronicles that remarkable transformation with meticulous attention to historical accuracy, drawing upon the earliest and most reliable biographical sources in the rich tradition of Islamic scholarship.',
    ],
    mids: [
      'This biography draws upon the earliest and most authoritative sources, including the works of Ibn Ishaq, Ibn Hisham, and other classical biographers, while also incorporating insights from contemporary academic research where appropriate. The narrative covers the Prophet\'s noble lineage and early life, his marriage to Khadijah (may Allah be pleased with her), the trials faced by the early Muslim community in Makkah, the migration to Madinah, the major battles and treaties, and the Farewell Pilgrimage. Each event is presented with its historical context, enabling readers to understand the challenges and triumphs that shaped the nascent Muslim community. The {lang} prose is engaging and accessible without sacrificing scholarly rigor.',
      'Throughout this work, the author pays careful attention to the practical lessons that can be derived from the Prophetic example, making this biography not merely a historical narrative but a practical guide for personal development and community building. The challenges faced by the Prophet and his companions, including persecution, migration, warfare, diplomacy, and governance, are analyzed with reference to their relevance for contemporary Muslims. This dual focus on historical accuracy and practical application makes this biography particularly valuable for educators, students, and anyone seeking to align their life with the Prophetic model.',
    ],
    closes: [
      'Enrich your understanding of Islamic history and the Prophetic example with this essential biography from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, this {lang} edition of {title} is available with reliable delivery across all cities in Pakistan. Order online and have this inspiring work delivered to your doorstep.',
      'Order this comprehensive {lang} biography from Bab-ul-Fatah for just {price}. This edition of {title} offers exceptional value for anyone seeking to understand the life and legacy of the Prophet Muhammad (peace be upon him). We deliver to all locations in Pakistan with speed and care.',
    ],
  },
  spirituality: {
    opens: [
      'The path of Islamic spirituality offers a transformative journey from the outward practice of religion to the inward purification of the heart and soul. This remarkable {lang} work, {title}, serves as a comprehensive guide for Muslims seeking to deepen their relationship with Allah, cultivate virtuous character traits, and experience the peace that comes from sincere devotion and regular self-reflection.',
      'Islamic spirituality, rooted in the Quran and authentic Sunnah, provides a holistic framework for nurturing the soul and achieving genuine closeness to the Creator. This esteemed {lang} publication, {title}, draws upon centuries of scholarly wisdom to present practical guidance for spiritual growth, covering essential topics such as sincerity, gratitude, patience, mindfulness of Allah, and the purification of the heart from spiritual ailments.',
      'True Islamic practice extends far beyond ritual worship to encompass the transformation of one\'s inner character and consciousness. This profound {lang} work titled {title} explores the deeper dimensions of faith, guiding readers through the stations of the spiritual path with scholarly authority and compassionate insight that speaks directly to both beginners and advanced seekers of divine closeness.',
    ],
    mids: [
      'Throughout its pages, this work addresses the spiritual diseases that afflict the human heart, including pride, envy, anger, greed, and attachment to the material world, while prescribing the Quranic and Prophetic remedies for each condition. The author\'s approach balances scholarly precision with pastoral sensitivity, making complex spiritual concepts accessible to readers at every stage of their spiritual journey. The {lang} translation captures the beauty and depth of the original text, preserving its power to inspire genuine personal transformation.',
      'This comprehensive spiritual guide covers the essentials of Islamic devotion, including the significance of daily prayers, voluntary worship acts, supplication (dua), remembrance of Allah (dhikr), night prayers (tahajjud), and fasting beyond the month of Ramadan. Each practice is explained with reference to Quranic verses and authentic Hadith, ensuring that the reader\'s spiritual efforts remain firmly grounded in revealed sources. The practical advice offered throughout makes this work suitable for daily reference and ongoing spiritual development over time.',
    ],
    closes: [
      'Nurture your soul with this invaluable spiritual guide from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at {price}, this {lang} edition of {title} is available with reliable delivery across Pakistan. Order today and begin your journey toward spiritual excellence and divine closeness.',
      'Order this profound work of Islamic spirituality from Bab-ul-Fatah, your reliable source for authentic Islamic literature in Pakistan. At {price}, {title} in {lang} is an essential addition to any Muslim\'s personal library, offering guidance that will benefit you throughout your life.',
    ],
  },
  fiqh: {
    opens: [
      'Islamic jurisprudence (fiqh) provides the essential framework through which Muslims understand and fulfill their religious obligations in every aspect of daily life. This authoritative {lang} work, {title}, offers comprehensive guidance on matters of worship, financial transactions, family law, and contemporary issues, drawing upon the Quran, authenticated Sunnah, and the established principles of Islamic legal reasoning.',
      'Navigating the practical application of Islamic law requires reliable scholarly guidance that balances fidelity to traditional sources with sensitivity to contemporary circumstances. This {lang} publication titled {title} delivers exactly that balance, presenting Islamic legal rulings in a clear, systematic format that makes complex fiqh issues accessible to both students of knowledge and general readers seeking to align their lives with Shariah.',
      'The science of fiqh has been central to Islamic scholarship since the earliest decades of the Muslim community, and this {lang} work continues that distinguished tradition with authority and clarity. Covering the complete spectrum of Islamic legal topics from ritual purification to commercial transactions, this comprehensive reference serves as an essential guide for Muslims who wish to ensure every aspect of their daily life conforms to divine guidance.',
    ],
    mids: [
      'This fiqh reference covers the five pillars of Islam in exhaustive detail, including the conditions, obligations, recommended acts, and things that nullify each pillar. Beyond worship, it addresses the Islamic legal framework governing marriage and divorce, inheritance, business contracts, interest-free banking, food and dietary laws, and ethical business practices. The author presents the positions of the major schools of Islamic jurisprudence where differences exist, enabling readers to understand the breadth of scholarly opinion while making informed decisions. The {lang} presentation ensures clarity and accessibility throughout.',
      'Organized by topic for easy reference, this work addresses both traditional legal questions and contemporary issues facing Muslims in the modern world. Each ruling is supported by evidence from the Quran and authentic Hadith, with careful explanation of the underlying legal principles and methodology of Islamic jurisprudence. This evidence-based approach gives readers confidence in the authenticity of the guidance provided, while the practical focus ensures that the knowledge can be readily applied.',
    ],
    closes: [
      'Add this comprehensive fiqh reference to your Islamic library through Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, this {lang} edition of {title} is an invaluable resource for every Muslim household. Order online with fast, reliable delivery to any city in Pakistan.',
      'Get this authoritative {lang} Islamic jurisprudence guide from Bab-ul-Fatah for {price}. This edition of {title} provides the reliable scholarly guidance every Muslim needs. We deliver across Pakistan with the care and efficiency our customers expect.',
    ],
  },
  children: {
    opens: [
      'Instilling Islamic values in young hearts is one of the most sacred responsibilities entrusted to Muslim parents, and selecting age-appropriate, engaging educational materials is crucial to fulfilling that responsibility effectively. This delightful {lang} children\'s book titled {title} has been carefully crafted to introduce essential Islamic concepts to young readers through captivating stories, colorful illustrations, and age-appropriate language that makes learning about Islam a joyful experience for children.',
      'Raising children with strong Islamic foundations requires quality resources that speak to their level of understanding while inspiring genuine love for Allah and His Messenger (peace be upon him). This {lang} publication, {title}, achieves exactly that by combining educational content with entertaining narratives that capture children\'s imagination while teaching them about faith, good character, and the beauty of Islamic teachings in a way that resonates with young minds.',
      'Children are the future of the Muslim Ummah, and providing them with quality Islamic education from an early age is an investment that yields blessings for generations to come. This {lang} children\'s book, {title}, offers parents and educators a powerful tool for nurturing Islamic knowledge and values in children, with content carefully designed to be both educational and entertaining for young readers.',
      'Making Islamic learning fun and engaging for children is the primary goal behind this wonderful {lang} publication titled {title}. Developed by experienced Islamic educators and child psychology specialists, this book uses storytelling, interactive activities, and vibrant visuals to teach children about the pillars of Islam, the lives of the prophets, Islamic manners, and daily supplications in a format that keeps young readers eagerly turning the pages.',
      'This thoughtfully designed {lang} children\'s publication, {title}, provides young Muslim readers with an engaging and age-appropriate introduction to Islamic knowledge and values. The content has been carefully selected and adapted to suit children\'s cognitive development, ensuring that complex Islamic concepts are presented in a simple, memorable way that encourages curiosity, critical thinking, and a lifelong love of learning about their faith.',
      'Islamic education for children should be as joyful and engaging as it is informative, and this {lang} book titled {title} embodies that educational philosophy perfectly. With its winning combination of appealing stories, Islamic teachings, and interactive learning elements, it creates a reading experience that children genuinely enjoy while absorbing important lessons about faith, moral character, and following the Prophet\'s example (peace be upon him).',
    ],
    mids: [
      'The content of this children\'s book has been developed in consultation with Islamic scholars and child education specialists to ensure both accuracy and age-appropriateness. Topics covered include the basic articles of faith, inspiring stories of the prophets from the Quran, the importance of kindness, honesty, and respect for elders, daily Islamic routines and supplications, and the significance of major Islamic events and celebrations. Each lesson is presented through relatable scenarios and characters that children can identify with, making abstract Islamic concepts concrete and memorable. The beautiful illustrations complement the text perfectly, creating a visually rich learning experience.',
      'What makes this {lang} children\'s book particularly valuable is its holistic approach to Islamic education. Rather than focusing narrowly on a single aspect of Islam, it weaves together lessons on aqeedah (belief), fiqh (practice), akhlaq (character), and Islamic history in a seamless narrative that shows children how all these elements connect in a Muslim\'s daily life. The language is simple enough for beginning readers while containing enough depth to serve as a discussion starter for parents and teachers who want to explore Islamic concepts more deeply.',
      'Parents will appreciate the careful attention to Islamic authenticity throughout this publication. Every story and teaching is rooted in authentic Islamic sources, including the Quran and verified Hadith, presented in a format that children can understand and enjoy. The book also includes practical exercises and activities that reinforce learning, such as simple quizzes, coloring pages, and discussion questions that encourage family interaction around important Islamic topics. This multi-sensory approach to learning has been shown to improve knowledge retention.',
    ],
    closes: [
      'Give your children the gift of Islamic knowledge with this engaging {lang} book from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is available with fast delivery across Pakistan. Invest in your child\'s Islamic education and character development today by ordering from Bab-ul-Fatah online.',
      'Order this wonderful {lang} children\'s book from Bab-ul-Fatah for just {price}. This edition of {title} makes Islamic learning fun, meaningful, and memorable for young readers. We deliver across Pakistan with the care and reliability that parents expect.',
      'Nurture your child\'s faith and character with this educational {lang} publication available at Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} offers exceptional value for parents seeking quality Islamic children\'s literature. Shop online today and have it delivered to your doorstep.',
    ],
  },
  women: {
    opens: [
      'Islam has always championed the rights, dignity, and spiritual equality of women, providing comprehensive guidance for every aspect of a Muslim woman\'s life from matters of faith and worship to family, society, and personal development. This important {lang} publication titled {title} addresses the real questions and challenges faced by Muslim women today, offering practical solutions firmly rooted in the Quran, authentic Sunnah, and the wisdom of qualified Islamic scholarship.',
      'Muslim women seeking to understand their rights, responsibilities, and spiritual potential within Islam will find this {lang} work, {title}, to be an invaluable companion and reference. Addressing contemporary concerns with scholarship and sensitivity, this publication provides authoritative Islamic guidance on matters ranging from daily worship and modesty to marriage, motherhood, education, career, and community participation.',
      'This {lang} publication titled {title} serves as a comprehensive guide for Muslim women navigating the complexities of modern life while remaining faithful to Islamic principles and values. Drawing upon the Quran, authenticated Hadith, and the interpretations of qualified scholars, it covers topics of particular relevance to women with clarity, compassion, and scholarly authority that readers can trust.',
    ],
    mids: [
      'The book addresses a wide range of topics including the spiritual obligations and rewards available to women in Islam, the Islamic perspective on women\'s education and professional development, the rights and responsibilities within marriage according to Shariah, the principles of Islamic parenting and child-rearing, the rulings related to hijab and modesty, and the remarkable contributions of great Muslim women throughout Islamic history. Each topic is supported by textual evidence from the Quran and authentic Hadith, presented in a {lang} narrative that is both scholarly rigorous and warmly accessible.',
    ],
    closes: [
      'Order this essential {lang} guide for Muslim women from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at {price}, {title} offers invaluable Islamic guidance for women of all ages and backgrounds. Shop online with reliable delivery nationwide across Pakistan.',
      'Get this comprehensive {lang} publication on women\'s issues in Islam from Bab-ul-Fatah for {price}. This edition of {title} reaches readers across Pakistan with our fast and careful delivery service. Order today to strengthen your knowledge and practice of Islam.',
    ],
  },
  companions: {
    opens: [
      'The noble Companions of Prophet Muhammad (peace be upon him) represent the finest generation of Muslims ever to walk the earth, men and women whose faith, sacrifice, and devotion established the foundations of Islamic civilization. This {lang} work titled {title} brings to life the extraordinary stories of these blessed individuals, offering readers timeless lessons in courage, loyalty, justice, and unwavering commitment to truth and righteousness.',
      'Understanding the lives of the Sahabah (Companions) is essential for appreciating how Islam transformed individuals and entire societies during its formative period. This {lang} publication, {title}, provides detailed, well-researched biographical accounts that illuminate the character, achievements, and spiritual qualities of the men and women who were closest to the Prophet (peace be upon him) and who carried his noble mission forward.',
      'The Companions of the Prophet (peace be upon him) were described by Allah Himself in the Quran as the best of people, and studying their lives provides both essential historical knowledge and profound spiritual inspiration. This {lang} book, {title}, explores the remarkable journeys of these early Muslims, from their initial encounters with Islam through their pivotal roles in building one of history\'s greatest civilizations.',
    ],
    mids: [
      'This work draws upon the most authentic historical sources, including classical biographical dictionaries, Hadith collections, and early Islamic historical works, to present accurate and detailed accounts of each Companion\'s life. The narrative covers their family backgrounds, their acceptance of Islam, the sacrifices they made for their faith, their contributions to the Muslim community, and the enduring legacy they left for all future generations. Each biography is accompanied by thoughtful analysis of the key lessons that contemporary Muslims can derive from these exemplary lives.',
    ],
    closes: [
      'Discover the inspiring lives of the Prophet\'s Companions with this {lang} publication from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at {price}, {title} is available with fast delivery across Pakistan. Order online and be inspired by these extraordinary lives.',
      'Order this comprehensive {lang} Companion biography from Bab-ul-Fatah for just {price}. This edition of {title} offers invaluable lessons from Islamic history for readers of all backgrounds. We deliver across Pakistan with reliability and care.',
    ],
  },
  family: {
    opens: [
      'The family unit is the fundamental building block of Islamic society, and maintaining strong, faith-centered family bonds is essential for individual wellbeing and community vitality. This {lang} publication titled {title} provides practical, Islamically-grounded guidance for building and sustaining healthy family relationships, drawing upon the Quran, authentic Sunnah, and the wisdom of Islamic family counseling and scholarship.',
      'Islam places extraordinary emphasis on the sanctity and importance of family life, providing detailed guidance for every relationship within the household. This {lang} work, {title}, translates that divine guidance into practical advice for contemporary Muslim families, addressing the real challenges of modern family life with wisdom, compassion, and scholarly rigor that respects Islamic principles while acknowledging the realities of today.',
    ],
    mids: [
      'This comprehensive family guide covers essential topics including the Islamic approach to choosing a righteous spouse and building a successful marriage, the mutual rights and responsibilities of husbands and wives, effective parenting according to Quranic principles and Prophetic example, maintaining harmony with extended family members, managing household finances in accordance with Shariah, and creating a home environment that nurtures faith, good character, and love for Allah. The {lang} text is clear and practical, making it accessible to readers from all backgrounds and educational levels.',
    ],
    closes: [
      'Strengthen your family with this invaluable {lang} Islamic guide from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers practical wisdom for every Muslim household. Order online with fast delivery to any city in Pakistan.',
    ],
  },
  hajj: {
    opens: [
      'The pilgrimage to Makkah (Hajj) is one of the five pillars of Islam and a profound spiritual experience that every Muslim aspires to undertake at least once in their lifetime. This {lang} guide titled {title} provides comprehensive, step-by-step instructions for performing both Hajj and Umrah correctly, drawing upon the Quran, authentic Hadith, and the consensus of Islamic scholars to ensure that every ritual is performed according to the authentic Sunnah.',
    ],
    mids: [
      'This guide covers every aspect of the sacred pilgrimage journey, from the practical preparations and ihram requirements to the detailed rituals of Tawaf, Sa\'i, standing at Arafat, stoning the pillars, and the farewell Tawaf. Each ritual is explained with clear step-by-step instructions and helpful illustrations, along with the relevant supplications in Arabic with {lang} translation and transliteration for ease of use. The question-and-answer format addresses the most common concerns and mistakes made by pilgrims, making this an essential companion.',
    ],
    closes: [
      'Prepare for your sacred pilgrimage with this comprehensive {lang} guide from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is available with fast delivery across Pakistan. Order before your journey to ensure you have this essential companion.',
    ],
  },
  qudsi: {
    opens: [
      'Hadith Qudsi represents a unique and sacred category of narration in which the meaning is from Allah while the wording is from Prophet Muhammad (peace be upon him). This {lang} collection titled {title} gathers these blessed narrations, offering readers a direct encounter with divine wisdom that transcends ordinary Hadith collections. Each narration carries a special spiritual significance, addressing themes of divine mercy, justice, love, and the relationship between the Creator and His creation.',
    ],
    mids: [
      'This carefully curated collection presents each Hadith Qudsi with the original Arabic text alongside the {lang} translation, enabling readers to appreciate the beauty and depth of the original wording while understanding its meaning fully. The compiler has included brief contextual notes that illuminate the circumstances and significance of each narration, helping readers derive maximum spiritual benefit from their study. The narrations cover topics including the boundless love of Allah, the vital importance of prayer and charity, the dangers of sin and disobedience, the mercy of Allah for the repentant, and the great virtues of remembrance and gratitude.',
    ],
    closes: [
      'Experience the beauty of divine wisdom with this {lang} Hadith Qudsi collection from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is a spiritual treasure for every Muslim home. Order online with reliable delivery nationwide across Pakistan.',
    ],
  },
  arabic: {
    opens: [
      'Mastering the Arabic language is the key that unlocks direct access to the Quran, Hadith, and the vast treasury of classical Islamic scholarship. This {lang} resource titled {title} provides a structured, effective pathway for learners at all levels to develop their Arabic reading, writing, and comprehension skills, using proven teaching methodologies that have helped millions of students achieve fluency in the language of the Quran.',
      'Learning Arabic opens a door to the original sources of Islamic knowledge, enabling Muslims to engage directly with the Quran and scholarly works without relying entirely on translation. This {lang} publication, {title}, offers a comprehensive Arabic language curriculum designed specifically for Islamic learners, combining grammatical foundations with practical vocabulary drawn from Quranic and Hadith texts for maximum relevance.',
    ],
    mids: [
      'The methodology employed in this {lang} Arabic learning resource follows a progressive sequence that builds competence systematically from the ground up. Beginning with the Arabic alphabet and basic phonetics for absolute beginners, it advances through essential grammar concepts, sentence structure patterns, and vocabulary development. Each lesson incorporates exercises and practice activities that reinforce learning and facilitate practical application. The content is specifically designed to equip students with the linguistic tools needed to read and understand Islamic texts independently.',
    ],
    closes: [
      'Begin your Arabic learning journey with this excellent {lang} resource from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is available with fast delivery across Pakistan. Order online and take the first step toward understanding the Quran in its original language.',
    ],
  },
  pillars: {
    opens: [
      'The five pillars of Islam form the essential framework of Muslim belief and practice, and understanding how to perform each pillar correctly is a religious obligation upon every accountable Muslim. This {lang} guide titled {title} provides clear, comprehensive, and practically oriented instructions for performing each pillar according to the authentic Sunnah of Prophet Muhammad (peace be upon him).',
    ],
    mids: [
      'This practical {lang} guide covers the ritual purification (wudu and ghusl), the five daily prayers with their prescribed timings and postures, fasting during the blessed month of Ramadan, the calculation and proper payment of Zakat, and the complete rites of Hajj and Umrah. Each topic is presented with detailed step-by-step instructions supported by relevant Quranic verses and authentic Hadith narrations. Common mistakes are clearly identified and corrected, and the spiritual significance and inner dimensions of each pillar are explained.',
    ],
    closes: [
      'Perfect your daily worship with this comprehensive {lang} guide from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at {price}, {title} is an essential reference for every Muslim household. Order online with delivery available to all cities in Pakistan.',
    ],
  },
  products: {
    opens: [
      'Enhance your daily Islamic practice and lifestyle with this quality product that combines traditional craftsmanship with practical functionality. Carefully selected and verified by the knowledgeable team at Bab-ul-Fatah, this item meets the highest standards of quality and authenticity, making it a meaningful addition to your home or a thoughtful Islamic gift for loved ones on special occasions.',
    ],
    mids: [
      'Sourced from trusted suppliers and verified for quality and authenticity, this product has been selected to meet the discerning standards of Muslim consumers in Pakistan and beyond. The materials and craftsmanship reflect a deep commitment to excellence that aligns perfectly with Islamic values of quality, integrity, and beauty in all things.',
    ],
    closes: [
      'Order this quality Islamic product from Bab-ul-Fatah for just {price}. We are Pakistan\'s trusted source for authentic Islamic goods, with fast and reliable delivery across the entire country. Shop online with confidence from your home.',
    ],
  },
  scholars: {
    opens: [
      'Understanding the theological foundations laid by the early generations of Islamic scholars is essential for maintaining sound belief (aqeedah) in the modern era and protecting oneself from deviations. This {lang} work titled {title} provides a comprehensive and scholarly overview of the creed of the righteous predecessors (As-Salaf As-Saalih), presenting the fundamental articles of Islamic faith as understood and transmitted by the earliest and most authoritative scholars of Islam.',
    ],
    mids: [
      'This scholarly work addresses the core tenets of Islamic belief with clarity and depth, including the absolute oneness of Allah (Tawheed), the beautiful attributes of the Creator, belief in the angels and the unseen, the divinely revealed books, the prophets and messengers, the Day of Judgment, and divine predestination (Qadr). Each topic is discussed with reference to the primary sources of Islamic knowledge, namely the Quran and authentic Sunnah, as understood by the Companions and the early generations of righteous scholars. The {lang} text provides much-needed clarity.',
    ],
    closes: [
      'Strengthen your understanding of Islamic creed with this {lang} scholarly work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is available with reliable delivery across Pakistan. Order online and protect your faith with authentic knowledge.',
    ],
  },
  aqeedah: {
    opens: [
      'The science of Islamic creed (aqeedah) deals with the most fundamental questions of human existence: the nature of God, the purpose of creation, the reality of the unseen world, and the ultimate destiny of mankind. This comprehensive {lang} work titled {title} explores these profound topics with scholarly depth and clarity, drawing exclusively upon the Quran and authenticated Hadith to present the beliefs that every Muslim is obligated to hold and understand.',
    ],
    mids: [
      'This extensive {lang} work on Islamic faith and eschatology covers the major and minor signs of the Last Day, the detailed events of the Hereafter including the experience of death, the questioning in the grave, the Day of Resurrection, the scales of divine justice, the bridge over Hellfire (Sirat), and the ultimate destinations of Paradise and Hellfire. Each topic is presented with extensive evidence from the Quran and authentic Hadith, making this work both academically rigorous and spiritually impactful. The detailed descriptions serve as a powerful reminder of accountability.',
    ],
    closes: [
      'Deepen your understanding of Islamic faith with this comprehensive {lang} work from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is available with reliable delivery across Pakistan. Order today and strengthen your iman with authentic knowledge.',
    ],
  },
  marital: {
    opens: [
      'Islamic marriage is a sacred covenant that establishes the foundation of family life and the next generation of the Muslim Ummah. Understanding its rights, responsibilities, and practical guidance is essential for every Muslim couple. This comprehensive {lang} work titled {title} provides detailed, scholarly guidance on all aspects of marital life, from choosing a spouse and the marriage contract to intimacy, conflict resolution, and building a loving, faith-centered home.',
    ],
    mids: [
      'This comprehensive {lang} set addresses the complete spectrum of marital issues in Islam, providing Quranic and Prophetic guidance on topics that couples frequently encounter in their married life. The content covers the Islamic perspective on husband-wife rights and responsibilities, physical intimacy in marriage according to Shariah, family planning, dealing constructively with in-laws, managing household finances Islamically, raising righteous children with Islamic values, and navigating common marital challenges with patience and wisdom.',
    ],
    closes: [
      'Strengthen your marriage with this comprehensive {lang} Islamic guide from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this {title} set is available with delivery across Pakistan. Order online and invest in the success of your marriage.',
    ],
  },
  reference: {
    opens: [
      'Islam is a religion of extraordinary beauty, profound wisdom, and comprehensive divine guidance, and understanding its true essence requires looking beyond superficial perceptions to appreciate the full depth and richness of its teachings. This {lang} publication titled {title} offers readers a thoughtful, insightful exploration of the beauty of Islam, covering its spiritual, intellectual, moral, and social dimensions in a format that is both informative and deeply inspiring.',
    ],
    mids: [
      'This reference work covers a wide range of topics that showcase the beauty of Islam, including the elegant linguistic beauty of the Quran, the boundless compassion of Prophetic teachings, the sophistication of Islamic civilization\'s contributions to science, mathematics, and art, the perfect justice of Islamic law, and the deep spiritual richness of Islamic worship and spirituality. The {lang} text is beautifully presented, making it suitable for both personal study and as a meaningful gift.',
    ],
    closes: [
      'Discover the beauty of Islam with this exceptional {lang} publication from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Priced at {price}, {title} is available with reliable delivery across Pakistan. Order online and explore the magnificent beauty of Islam.',
    ],
  },
  darussalam: {
    opens: [
      'Darussalam is renowned worldwide as one of the most trusted and respected publishers of authentic Islamic literature, and this {lang} publication upholds that well-deserved reputation with distinction. This carefully produced work combines scholarly accuracy with accessible presentation, making it a valuable addition to any Muslim\'s personal library and a reliable resource for Islamic education.',
    ],
    mids: [
      'Published by Darussalam with their characteristic attention to quality, accuracy, and authenticity, this {lang} edition has been thoroughly reviewed by qualified Islamic scholars to ensure the reliability of its content. The production quality, including the careful selection of paper, the durability of the binding, and the precision of the printing, meets international standards, reflecting the publisher\'s unwavering commitment to excellence in Islamic publishing.',
    ],
    closes: [
      'Order this quality Darussalam publication from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, this {lang} edition is available with fast delivery across all cities in Pakistan. Shop with confidence from a trusted source.',
    ],
  },
  nabvi: {
    opens: [
      'The blessed sayings of Prophet Muhammad (peace be upon him) contain timeless wisdom that illuminates every aspect of human life, from matters of faith and worship to personal conduct, family relations, and community welfare. This {lang} collection titled {title} gathers a carefully curated selection of authentic Prophetic narrations, presenting them in an accessible format that makes the guidance of the Sunnah readily available to readers of all backgrounds and educational levels.',
      'Memorizing and reflecting upon the Hadith of Prophet Muhammad (peace be upon him) is a proven means of drawing closer to Allah and embodying the noble character traits of the Messenger. This {lang} publication, {title}, offers a carefully selected collection of verified narrations that cover essential aspects of Islamic belief, practice, and moral conduct, making it an ideal resource for daily reading and spiritual growth.',
      'The Prophetic Hadith serves as the second primary source of Islamic legislation after the Holy Quran, and having a reliable, well-organized collection of authentic narrations is essential for every Muslim household. This {lang} work titled {title} presents verified narrations with clarity and scholarly integrity, supported by contextual notes that enhance understanding and facilitate the practical application of Prophetic guidance in daily life.',
    ],
    mids: [
      'Each Hadith in this collection has been verified for authenticity through rigorous isnad (chain of narration) analysis, and is presented with its source reference, full chain of narrators, and relevant scholarly commentary where appropriate. The narrations cover a comprehensive range of topics including the pillars of faith and Islam, matters of daily worship, ethical conduct and good character, social responsibilities toward neighbors and the needy, and spiritual development and self-purification. The {lang} translation preserves the meaning and elegance of the original Arabic text while remaining clear and accessible.',
    ],
    closes: [
      'Bring the wisdom of the Prophet (peace be upon him) into your home with this {lang} Hadith collection from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is available with fast delivery across Pakistan. Order online and enrich your family\'s knowledge of the Sunnah.',
      'Order this authentic {lang} Hadith collection from Bab-ul-Fatah for just {price}. This edition of {title} offers invaluable Prophetic guidance for the whole family. We deliver across Pakistan with the care and reliability you expect.',
    ],
  },
  translation: {
    opens: [
      'Accessing the meaning of the Holy Quran through a reliable, scholarly translation is essential for the vast majority of Muslims worldwide who do not read Arabic fluently. This {lang} edition of {title} provides a faithful, accurate translation that preserves the depth and beauty of the original Quranic text while making its divine meanings accessible to {lang}-speaking readers across Pakistan and beyond.',
      'Understanding the message of the Holy Quran in one\'s own language is a great blessing that enables Muslims to reflect upon and implement divine guidance in their daily lives more effectively. This {lang} publication titled {title} offers a clear, accurate translation supported by helpful explanatory notes, making it an ideal resource for both individual study and family reading circles.',
    ],
    mids: [
      'This translation has been prepared by scholars with deep expertise in both Arabic and {lang}, ensuring that the nuanced meanings of the Quranic text are faithfully and accurately conveyed. The {format} enhances the reading experience significantly, with each verse of the Arabic text placed alongside its corresponding translation in a layout that facilitates cross-referencing and comparison. The translation methodology follows established scholarly principles, prioritizing accuracy and clarity while maintaining the literary beauty that characterizes the Quran\'s inimitable style.',
    ],
    closes: [
      'Order this reliable {lang} Quran translation from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, this edition of {title} offers exceptional scholarly value. We deliver across Pakistan with the reliability and care you expect.',
    ],
  },
  history: {
    opens: [
      'The stories of the prophets, as narrated in the Quran and authenticated Hadith, contain some of the most powerful and instructive narratives in all of human history. This {lang} work titled {title} brings these timeless stories to life with scholarly accuracy and engaging narrative skill, enabling readers to draw profound lessons from the experiences of Allah\'s chosen messengers who guided humanity toward truth and righteousness throughout the ages.',
    ],
    mids: [
      'This comprehensive collection covers the stories of all the major prophets mentioned in the Holy Quran, from Adam and Noah through Abraham, Moses, Jesus, and Muhammad (peace be upon them all). Each prophet\'s story is presented with its historical and Quranic context, highlighting the core message of monotheism (Tawheed) that unites all prophetic missions. The {lang} narrative is engaging and accessible while maintaining strict scholarly accuracy, drawing upon authenticated sources including the renowned works of Ibn Kathir and other respected exegetes.',
    ],
    closes: [
      'Explore the inspiring stories of Allah\'s prophets with this engaging {lang} publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers timeless wisdom and lessons for readers of all ages. Order online with fast delivery across Pakistan.',
    ],
  },
  education: {
    opens: [
      'The pursuit of Islamic knowledge is a noble lifelong journey that begins with foundational texts and progresses to advanced scholarly works. This {lang} educational publication titled {title} serves as an essential resource in that journey, providing structured, reliable content that supports both classroom instruction and independent study for Muslims seeking to deepen their understanding of Islam\'s rich intellectual heritage.',
      'Quality Islamic education materials form the backbone of effective teaching and learning in Muslim communities throughout the world. This {lang} work, {title}, has been developed with pedagogical excellence in mind, offering a systematic approach to Islamic learning that respects both traditional scholarship and contemporary educational methodologies for maximum effectiveness.',
      'Whether you are a student of Islamic studies, an educator at a madrasa or Islamic school, or a self-directed learner seeking to expand your knowledge of Islam, this {lang} publication titled {title} provides the authoritative content and clear presentation you need. Covering essential Islamic disciplines with scholarly rigor and accessible language, this work represents an important contribution to Islamic educational literature.',
      'Islamic education encompasses a vast range of disciplines, from Arabic grammar and Quranic exegesis to Hadith studies, Islamic jurisprudence, and theology. This comprehensive {lang} resource, {title}, addresses these diverse subjects with the depth and clarity that serious students require, making it a valuable addition to any Islamic educational library in Pakistan and beyond.',
    ],
    mids: [
      'The content has been carefully organized following proven principles of Islamic pedagogy, building understanding progressively from fundamental concepts to more advanced topics in each discipline. Each section includes clear explanations, relevant examples from Islamic sources, and review questions that reinforce learning and encourage critical thinking. The {lang} text is accessible to students at multiple levels, making this resource suitable for both introductory courses and more advanced study programs in Islamic institutions.',
      'This educational work bridges the gap between classical Islamic scholarship and the needs of contemporary Muslim learners. Drawing upon centuries of scholarly tradition while employing modern teaching methodologies, it presents complex Islamic subjects in a format that genuinely engages and empowers students. The clear organization and comprehensive index make it equally valuable as a course textbook and a reference work for ongoing scholarly study and research.',
    ],
    closes: [
      'Invest in your Islamic education with this essential {lang} resource from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this edition of {title} is available with reliable delivery across Pakistan. Order online and advance your knowledge of Islam today.',
      'Order this comprehensive {lang} educational work from Bab-ul-Fatah for just {price}. This edition of {title} offers outstanding value for students and educators alike. We deliver to all locations across Pakistan with speed and care.',
    ],
  },
  biography: {
    opens: [
      'The lives of great Muslim scholars, leaders, and historical figures offer invaluable lessons in faith, perseverance, integrity, and dedication to the service of Islam and the Muslim community. This {lang} work titled {title} presents a meticulously researched biographical account that brings to life the achievements and noble character of its subject, providing readers with both important historical knowledge and profound spiritual inspiration.',
    ],
    mids: [
      'Drawing upon authentic historical sources, this biography traces the complete life journey of its subject, from early life and education through the major achievements, trials, and challenges that defined their legacy and impact. The {lang} narrative captures the historical context in which the subject lived and worked, providing readers with a rich understanding of the social, political, and spiritual environment that shaped their character and contributions. Each chapter offers practical lessons that remain relevant for contemporary Muslims.',
    ],
    closes: [
      'Discover an inspiring life story within this {lang} biography from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers both valuable knowledge and spiritual inspiration. Order online with delivery available across Pakistan.',
    ],
  },
  general: {
    opens: [
      'Expand your Islamic knowledge with this valuable {lang} publication that addresses an important topic in the life of the Muslim Ummah. This carefully researched work draws upon authentic Islamic sources to provide reliable, insightful content that serves both as a useful reference work and as a source of personal inspiration and spiritual development.',
    ],
    mids: [
      'The author brings extensive scholarly knowledge and deep expertise to this {lang} work, creating a resource that educates and inspires readers in equal measure. The content is organized for maximum clarity and ease of reference, with each section building logically upon the previous to create a coherent and comprehensive treatment of the subject. Whether for individual study, classroom instruction, or family reading, this publication offers valuable knowledge.',
    ],
    closes: [
      'Order this valuable {lang} Islamic publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this edition of {title} offers excellent value for seekers of knowledge. Shop online with reliable delivery across Pakistan.',
    ],
  },
};

// ─── Description generator ───────────────────────────────────────────────────
function generateDescription(product, index) {
  const catKey = detectCatKey(product);
  const templates = T[catKey] || T.general;
  const lang = langName(product.language || 'ENGLISH');
  const price = formatPrice(product.price);
  const title = product.title || 'Islamic Book';
  const author = product.author || '';
  const details = extractDetails(title, product.category);
  const lines = details.lines ? String(details.lines) : 'standard';
  const binding = details.binding;
  const format = details.format;

  // Use index-based selection to maximize uniqueness across 100 products
  // For same-category products, cycle through templates differently
  const openIdx = index % templates.opens.length;
  const midIdx = (index * 3 + 2) % templates.mids.length;
  const closeIdx = (index * 5 + 4) % templates.closes.length;

  let desc = templates.opens[openIdx];

  // Add author context if available and unique
  if (author && author.length > 1 && author.length < 80 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author)) {
    desc += ` Authored by the esteemed scholar ${author}, this work reflects years of dedicated research and a deep commitment to preserving authentic Islamic knowledge for future generations of Muslims.`;
  }

  desc += ' ' + templates.mids[midIdx];
  desc += ' ' + templates.closes[closeIdx];

  // Replace placeholders
  desc = desc
    .replace(/\{title\}/g, title)
    .replace(/\{lang\}/g, lang)
    .replace(/\{price\}/g, price)
    .replace(/\{author\}/g, author)
    .replace(/\{lines\}/g, lines)
    .replace(/\{binding\}/g, binding)
    .replace(/\{format\}/g, format);

  // Post-process: clean up double spaces
  desc = desc.replace(/\s+/g, ' ').trim();

  // Ensure minimum 180 words - add extra detail sentences if needed
  let wordCount = desc.split(/\s+/).length;
  if (wordCount < 180) {
    const paddingSentences = [
      `This {lang} edition has been produced to the highest publishing standards, with careful attention to typography, paper quality, and binding durability that ensures this work will remain a valued part of your Islamic library for many years to come.`,
      `Readers across Pakistan have come to trust Bab-ul-Fatah as their primary source for authentic Islamic publications, and this edition of {title} continues that tradition of providing quality Islamic knowledge at accessible prices.`,
      `Whether you are a seasoned student of Islamic knowledge or a beginner taking your first steps on the path of learning, this {lang} publication offers content that is both accessible and deeply rewarding for readers at every level.`,
      `The publisher has ensured that this {lang} edition meets international standards of quality and accuracy, with every aspect of the production process supervised by qualified scholars who specialize in this field of Islamic knowledge.`,
      `This publication serves as a bridge between the rich heritage of classical Islamic scholarship and the needs of contemporary Muslim readers, presenting timeless wisdom in a format that resonates with modern audiences while maintaining absolute scholarly integrity.`,
      `Islamic scholars and educators throughout Pakistan recommend this {lang} work as an essential reference, praising its clarity of expression, depth of content, and faithfulness to authentic Islamic sources that readers can rely upon with complete confidence.`,
      `The enduring popularity of this {lang} publication is a testament to its quality and relevance, as generation after generation of Muslim readers continue to find guidance, inspiration, and knowledge within its pages.`,
      `Available in {lang}, this work makes important Islamic knowledge accessible to a wide audience of readers, fulfilling the Islamic duty of sharing beneficial knowledge with the community and contributing to the intellectual growth of the Muslim Ummah.`,
    ];
    const padSeed = hashStr(product.id);
    let padIdx = padSeed % paddingSentences.length;
    while (wordCount < 185 && paddingSentences.length > 0) {
      const pad = paddingSentences[padIdx % paddingSentences.length]
        .replace(/\{lang\}/g, lang)
        .replace(/\{title\}/g, title);
      desc += ' ' + pad;
      wordCount = desc.split(/\s+/).length;
      padIdx++;
    }
    desc = desc.replace(/\s+/g, ' ').trim();
  }

  return desc;
}

// ─── Meta description generator ──────────────────────────────────────────────
function generateMetaDescription(product, index) {
  const cat = product.category || 'Islamic Books';
  const lang = langName(product.language || 'ENGLISH');
  const title = product.title || 'Islamic Book';
  const author = product.author || '';
  const price = formatPrice(product.price);
  const authorPart = (author && author.length > 0 && author.length < 60 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author)) ? ` by ${author}` : '';

  const templates = [
    `Buy ${title} at Bab-ul-Fatah Pakistan. ${lang} ${cat}${authorPart} for ${price}. Fast delivery nationwide.`,
    `Shop ${title} online from Bab-ul-Fatah Pakistan. ${lang} ${cat} at ${price}${authorPart}. Trusted Islamic bookstore.`,
    `${title} - ${lang} ${cat} at ${price}. Order from Bab-ul-Fatah Pakistan${authorPart}. Fast nationwide delivery.`,
    `Order ${title} in ${lang} from Bab-ul-Fatah Pakistan for ${price}. ${cat}${authorPart}. Reliable delivery across Pakistan.`,
    `Get ${title} at ${price} from Bab-ul-Fatah. ${lang} ${cat}${authorPart}. Pakistan's trusted Islamic bookstore.`,
    `${title} ${lang} edition at ${price}. Bab-ul-Fatah Pakistan offers authentic ${cat.toLowerCase()}.${authorPart} Order now.`,
    `Purchase ${title} for ${price} at Bab-ul-Fatah. ${lang} ${cat}${authorPart}. Pakistan's leading online Islamic bookstore.`,
    `${title} in ${lang} at ${price}. Shop Bab-ul-Fatah Pakistan for quality ${cat.toLowerCase()}.${authorPart} Delivery available.`,
    `Authentic ${title} in ${lang} at ${price} from Bab-ul-Fatah Pakistan. ${cat}${authorPart}. Order for fast delivery.`,
    `${title} by Bab-ul-Fatah Pakistan. ${lang} ${cat} for ${price}${authorPart}. Shop Pakistan's best Islamic bookstore.`,
  ];

  let meta = templates[index % templates.length];

  // Trim to exactly 120-155 chars
  while (meta.length > 155) meta = meta.substring(0, meta.lastIndexOf(' ', 153));
  if (meta.length < 120) meta += ' Shop Bab-ul-Fatah Pakistan.';

  // Remove any quotes
  meta = meta.replace(/['"]/g, '');

  return meta;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const start = Date.now();
  console.log('\n' + '='.repeat(60));
  console.log('  Bab-ul-Fatah SEO Batch 1 v2 — 100 Product Descriptions');
  console.log('='.repeat(60) + '\n');

  // Read product list
  const productsPath = path.join(__dirname, 'batch1-products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`  Loaded ${products.length} products from batch1-products.json\n`);

  const metaResults = [];
  let updatedCount = 0;
  let errorCount = 0;
  const wordCounts = [];
  const allDescriptions = [];
  const descriptionTexts = []; // store full texts for samples

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

  // Save meta descriptions to JSON file
  const metaPath = path.join(__dirname, 'seo-meta-batch1.json');
  fs.writeFileSync(metaPath, JSON.stringify(metaResults, null, 2));
  console.log(`  Meta descriptions saved to: ${metaPath}`);

  // Word count stats
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);
  const withinRange = wordCounts.filter(w => w >= 180 && w <= 250).length;
  console.log(`  Word count: avg=${avgWords}, min=${minWords}, max=${maxWords}, in-range(180-250)=${withinRange}/100`);

  // Meta description stats
  const metaLens = metaResults.map(m => m.metaDescription.length);
  const avgMeta = Math.round(metaLens.reduce((a, b) => a + b, 0) / metaLens.length);
  const minMeta = Math.min(...metaLens);
  const maxMeta = Math.max(...metaLens);
  const metaInRange = metaLens.filter(l => l >= 120 && l <= 155).length;
  console.log(`  Meta desc: avg=${avgMeta}, min=${minMeta}, max=${maxMeta}, in-range(120-155)=${metaInRange}/100`);

  // Uniqueness check - full descriptions
  const descSet = new Set(allDescriptions);
  const openSet = new Set(allDescriptions.map(d => d.substring(0, 100)));
  console.log(`  Unique descriptions (full): ${descSet.size}/${updatedCount}`);
  console.log(`  Unique openings (100 chars): ${openSet.size}/${updatedCount}`);

  // Update progress file (handle permission issue gracefully)
  try {
    const progressPath = path.join(__dirname, 'seo-progress.json');
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    progress.batches['1'] = {
      status: 'completed',
      startIdx: 1,
      endIdx: 100,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
    };
    progress.completedBatches = 1;
    progress.completedProducts = updatedCount;
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress file updated: batch 1 marked as completed`);
  } catch (progressErr) {
    // Write to alternative location if permission denied
    const altPath = path.join(__dirname, 'seo-progress-batch1.json');
    const progress = {
      batch: 1,
      status: 'completed',
      startIdx: 1,
      endIdx: 100,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
      completedBatches: 1,
      completedProducts: updatedCount,
    };
    fs.writeFileSync(altPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress saved to: ${altPath} (original file permission denied)`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n  Completed in ${elapsed}s`);

  // Print sample descriptions
  console.log('\n' + '='.repeat(60));
  console.log('  SAMPLE DESCRIPTIONS');
  console.log('='.repeat(60));

  const sampleIndices = [0, 9, 13, 21, 32, 36, 49, 59, 79, 96];
  for (const idx of sampleIndices) {
    if (metaResults[idx] && descriptionTexts[idx]) {
      const m = metaResults[idx];
      const descPreview = descriptionTexts[idx].substring(0, 350);
      console.log(`\n--- ${m.title} (${m.wordCount} words, ${m.charCount} chars) ---`);
      console.log(`META: ${m.metaDescription}`);
      console.log(`DESC: ${descPreview}...`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  BATCH 1 COMPLETE: ${updatedCount} products updated successfully`);
  console.log('='.repeat(60) + '\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
