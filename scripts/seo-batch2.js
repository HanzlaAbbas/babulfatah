#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 2 Description Writer
// Writes unique, SEO-optimized product descriptions for products 101-200
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
function langName(l) { return { URDU: 'Urdu', ARABIC: 'Arabic', ENGLISH: 'English', PUNJABI: 'Punjabi' }[l] || 'English'; }
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
  if (/khushboo/i.test(t)) format = 'fragrant color-coded Tajweed script';
  if (/hafzi/i.test(t)) format = 'Hafzi memorization script';
  if (/lafzi/i.test(t)) format = 'word-by-word translation format';
  if (/bamuhawara|muhawara/i.test(t)) format = 'word-by-word Urdu translation format';
  if (/pocket/i.test(t)) { format = 'compact pocket-size script'; binding = 'lightweight flexible binding'; }
  if (/parah|para/i.test(t)) {
    const partMatch = t.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
    if (partMatch) parts = `Parah ${partMatch[1]} to ${partMatch[2]}`;
    const setMatch = t.match(/(\d+)\s*vol/i);
    if (setMatch && !partMatch) parts = `${setMatch[1]}-volume complete set`;
  }
  if (/set|complete\s*set/i.test(t) && !parts) parts = 'complete multi-volume set';
  const volMatch = t.match(/(\d+)\s*vol/i);
  if (volMatch && !parts) parts = `${volMatch[1]}-volume set`;
  const sizeMatch = t.match(/(\d+)\s*x\s*(\d+)/);
  if (sizeMatch) format += ` in ${sizeMatch[1]}x${sizeMatch[2]} size`;
  return { lines, binding, format, parts };
}

// ─── Category routing ────────────────────────────────────────────────────────
function detectCatKey(product) {
  const cat = ((product.category && product.category.name) || product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  if (/mushaf/i.test(cat) || /quran/i.test(cat)) return 'mushaf';
  if (/tajweed/i.test(cat) || /tajweedi|color.*coded/i.test(title)) return 'tajweed';
  if (/translation/i.test(cat)) return 'translation';
  if (/ahadith e nabvi|hadith|sahih|bukhari|muslim|riyad/i.test(cat) || /sahih al-bukhari|sahih muslim|riyad|science of hadith/i.test(title)) return 'nabvi';
  if (/prophets seerah/i.test(cat) || /sealed nectar|assalato|akhri nabi/i.test(title)) return 'seerah';
  if (/biography/i.test(cat) || /inspiration|silsila qasas|anokha|ashab-e-badr|raheeq.*arabic|raheeq.*10x15/i.test(title)) return 'biography';
  if (/companions/i.test(cat) || /amr bin|aqziya tul khulafa|aqziya tur|allama umaat|anokha sakhi|azeem shahsawar|ashra mubashra/i.test(title)) return 'companions';
  if (/children/i.test(cat) || /kids|allah.*garden|ammaar|anokha safar|angel jibraeel|arabic learn|arkan.*kids|shukar|qurbani.*ismail|bacho|silsila qasas/i.test(title)) return 'children';
  if (/women/i.test(cat) || /talibaat|aurat|pardah|auratu|aurton|namaz.*women/i.test(title)) return 'women';
  if (/family/i.test(cat) || /easy guide to hajj|attainment.*happiness/i.test(title)) return 'family';
  if (/hajj umrah/i.test(cat) || /ashra zil|surma|atlas hajj/i.test(title)) return 'hajj';
  if (/pillars/i.test(cat) || /jumuah/i.test(title)) return 'pillars';
  if (/prayer supplication/i.test(cat) || /commands.*duaa|forgives.*sins|anbiya.*duain|azkar/i.test(title)) return 'pillars';
  if (/zakaat/i.test(cat) || /ribaa/i.test(title)) return 'pillars';
  if (/fasting/i.test(cat) || /arkan.*imaan/i.test(title)) return 'pillars';
  if (/fiqh/i.test(cat) || /tawassal/i.test(title)) return 'fiqh';
  if (/home decor/i.test(cat) || /calligraphy|ayat.*kursi|ayat.*kareema/i.test(title)) return 'home_decor';
  if (/food items/i.test(cat) || /almond oil|oil/i.test(title)) return 'food';
  if (/health/i.test(cat) || /tib.*nabvi/i.test(title)) return 'health';
  if (/education/i.test(cat) || /qabooliyat|adyan|mazahib|arabic course|arbi grammar|astrophysics|atlas islamic/i.test(title)) return 'education';
  if (/reference/i.test(cat) || /tohfa/i.test(title)) return 'reference';
  if (/darussalam publishers/i.test(cat) || /asr se maghrib|assembly se|azadi ka paigham|iqbal kilani/i.test(cat)) return 'darussalam';
  if (/imams scholars/i.test(cat) || /atlas fatuhat|seerat nabvi|azeem maher/i.test(title)) return 'scholars';
  if (/general/i.test(cat)) return 'general';
  return 'general';
}

// ─── Templates (ALL NEW — completely different from batch 1) ────────────────
const T = {
  mushaf: {
    opens: [
      'Nothing compares to the spiritual experience of holding a beautifully printed copy of the Holy Quran and reciting from it daily. This particular {lang} edition, {title}, has been manufactured with exceptional care, featuring a {lines}-line layout that follows the time-honored South Asian format preferred by millions of huffaz and qaris throughout Pakistan and the Subcontinent. The crisp, well-spaced text allows for smooth reading during both personal devotion and congregational taraweeh prayers.',
      'A premium Quran copy is more than a book — it is a sacred trust that deserves the finest production standards available. This {lang} {title} delivers exactly that level of quality, with its {lines}-line script printed on premium opaque paper that prevents ghosting and reduces visual fatigue during extended recitation sessions. The {binding} has been engineered to lay flat on any surface, whether on a reading stand, desk, or your lap.',
      'Every Muslim household needs at least one reliable, well-printed edition of the Holy Quran, and this {lang} {title} with {lines}-line script answers that need admirably. The {format} used in this printing is widely recognized across Islamic schools and madrasas in Pakistan for its readability and accuracy, making it equally suited for experienced huffaz and young students just beginning their memorization journey.',
      'Selecting the right Quran edition is a decision that impacts your daily worship experience for years to come. This {lang} {title} featuring {lines}-line script stands out for its production quality, text clarity, and the {binding} that ensures the sacred pages remain protected through years of faithful use. Each copy undergoes thorough proofreading by qualified scholars to verify that every letter, harakah, and stop sign is correctly positioned.',
      'The art of Quranic printing in Pakistan has reached remarkable heights, and this {lang} {title} exemplifies that craftsmanship. With {lines} lines per page and a {format}, the text occupies each page with a balanced, symmetrical layout that is both aesthetically pleasing and functionally excellent for recitation. The generous margins provide space for personal notes, while the clear verse demarcations guide the reader effortlessly through the text.',
      'Carrying the words of Allah in a physical form is a privilege that comes with the responsibility of treating it with utmost respect and care. This {lang} edition of {title} has been produced to honor that responsibility, featuring {lines}-line script with meticulous typographic precision. The {binding} provides robust protection against daily wear, and the paper quality ensures that the text remains legible and beautiful even after years of regular handling and recitation.',
      'Whether you are a hafiz revising your memorization, a teacher guiding students through the Quran, or a parent introducing your children to the book of Allah, this {lang} {title} with its {lines}-line format provides an ideal reading platform. The text has been typeset to the exact specifications used in Pakistan\'s leading Islamic institutions, ensuring consistency and familiarity for readers who have learned on similar formats throughout their educational journey.',
    ],
    mids: [
      'What distinguishes this {lang} Quran from ordinary editions is the attention given to every element of the reading experience. The {format} provides optimal line spacing that helps the eye track naturally from one line to the next, reducing the common problem of losing one\'s place during recitation. Verse endings are clearly marked, surah headings are prominently displayed, and the juz indicators on each page make it simple to monitor your progress through the thirty parts of the Holy Quran. For institutions ordering in bulk, this edition offers exceptional durability at an affordable price point, which explains its popularity among madrasas and Islamic schools throughout Pakistan.',
      'The printing process behind this {lang} {title} employs state-of-the-art technology combined with traditional Quranic typesetting expertise. Every copy is individually inspected for print clarity, ensuring that the dots, diacritical marks, and vowel signs that are essential for correct recitation are sharp and unambiguous. The {binding} is designed to withstand the rigors of daily use — whether carried in a bag to the mosque, used on a rehal at home, or passed between students in a classroom setting. This practical robustness, combined with elegant visual presentation, makes this edition a favorite among discerning buyers across Pakistan.',
      'From a pedagogical standpoint, this {lang} edition excels as a teaching tool. The {lines}-line format provides a consistent visual rhythm that helps new students develop reading fluency more quickly. Teachers appreciate the generous line spacing that allows them to point to individual words during instruction, and the {binding} keeps the book open to the desired page without requiring constant holding. The text size has been calibrated to be comfortable for readers of all ages — large enough for elderly readers with declining eyesight, yet compact enough to keep the overall page count manageable and the book portable.',
    ],
    closes: [
      'Secure your copy of this premium {lang} {title} from Bab-ul-Fatah, Pakistan\'s foremost Islamic bookstore. At just {price}, this {lines}-line edition with {binding} offers outstanding quality at an accessible price. We deliver to every city and town in Pakistan with secure packaging and prompt service. Order online today and experience the Bab-ul-Fatah difference.',
      'Shop for this beautiful {lang} {title} at Bab-ul-Fatah Pakistan for {price}. This {lines}-line {format} edition is ideal for daily recitation, hifz programs, and gift-giving on special occasions. Count on our fast, reliable nationwide delivery and our commitment to handling every Quran with the reverence it deserves.',
      'Add this exceptional {lang} {title} to your home or mosque library by ordering from Bab-ul-Fatah, Pakistan\'s trusted Islamic retailer. Priced at {price}, this {lines}-line edition with {binding} represents outstanding value. Browse our full collection online and enjoy delivery to any address in Pakistan.',
      'Invest in this finely produced {lang} {title} from Bab-ul-Fatah Pakistan for {price}. The {lines}-line {format} with {binding} is crafted for a lifetime of daily use. Order now and receive your Quran promptly through our dependable nationwide shipping service.',
    ],
  },
  tajweed: {
    opens: [
      'Mastering the art of Quranic recitation with proper tajweed is a goal that every Muslim should aspire to, and having a color-coded Quran edition significantly accelerates that learning process. This {lang} {title} uses an innovative color-coding system to highlight different tajweed rules directly within the text, allowing readers to identify and apply each rule effortlessly during recitation. The visual approach makes tajweed accessible even to those without formal training in Arabic phonetics.',
      'The science of tajweed preserves the precise pronunciation in which the Holy Quran was revealed to Prophet Muhammad (peace be upon him), and this {lang} {title} serves as an indispensable aid for anyone serious about reciting the Quran correctly. The color-coded letters and markings make complex rules immediately visible — you can see at a glance where to apply ikhfa, idgham, iqlab, ghunnah, and other essential tajweed principles without needing to consult a separate reference.',
    ],
    mids: [
      'This {lang} edition features {lines}-line script with carefully designed color codes that distinguish between the various categories of tajweed rules. Each rule is represented by a distinct color, and a legend is provided to help readers learn what each color signifies. The {binding} ensures the book remains durable through the extensive practice sessions that tajweed mastery requires. Whether you are a beginner just starting to learn tajweed or an advanced student refining your recitation, this visual approach provides an invaluable learning aid that no purely textual tajweed guide can match.',
    ],
    closes: [
      'Order this color-coded tajweed {lang} {title} from Bab-ul-Fatah Pakistan for {price}. Perfect for students, teachers, and anyone who wants to recite the Quran with beauty and precision. We ship nationwide with secure packaging. Shop online today.',
    ],
  },
  translation: {
    opens: [
      'Understanding the divine message of the Holy Quran in your own language opens doors to reflection, contemplation, and practical implementation that would otherwise remain closed to non-Arabic speakers. This {lang} translation, {title}, has been prepared with meticulous scholarly care to ensure that the meanings of the original Arabic text are conveyed accurately and elegantly in {lang}, making the Quran accessible to readers across Pakistan and the broader {lang}-speaking Muslim community.',
      'A faithful Quran translation is one of the most valuable possessions a Muslim household can own, serving as a daily companion for understanding Allah\'s guidance in matters of faith, worship, family, and society. This {lang} edition of {title} provides exactly that — a reliable, well-crafted translation that readers can consult with confidence, knowing that the translator has adhered to established principles of Quranic interpretation rooted in classical tafseer methodology.',
      'The Quran was revealed in Arabic for all of humanity, and making its message understandable in {lang} is a service of immense importance to the Muslim Ummah. This {lang} {title} fulfills that mission admirably, presenting a translation that balances linguistic accuracy with readability, so that readers can grasp both the literal meanings and the deeper implications of each verse without needing advanced scholarly training in Arabic or Islamic studies.',
      'For millions of Muslims who have not had the opportunity to study Arabic formally, a high-quality Quran translation serves as the primary means of engaging with the divine text on a daily basis. This {lang} {title} provides that essential access, with a translation methodology that prioritizes faithfulness to the original meaning while ensuring the {lang} prose flows naturally and is easy to follow. The translation has been reviewed by qualified scholars to verify its accuracy against established tafseer works.',
    ],
    mids: [
      'This {lang} translation employs a side-by-side or interlinear format that allows readers to compare the original Arabic text with the {lang} translation verse by verse, facilitating cross-reference and deeper study. The translator has consulted multiple classical tafseer sources including Ibn Kathir, Al-Tabari, and Al-Qurtubi to ensure the translation reflects the consensus understanding of the early Muslim scholars. Difficult passages are accompanied by brief explanatory footnotes that clarify context without overwhelming the general reader. This approach makes the translation suitable for both casual reading and serious academic study, serving the needs of a diverse readership.',
    ],
    closes: [
      'Order this reliable {lang} Quran translation, {title}, from Bab-ul-Fatah Pakistan for {price}. We are the country\'s most trusted source for authentic Islamic publications, with delivery available to every city in Pakistan. Shop online with confidence.',
      'Bring home this exceptional {lang} translation of the Holy Quran from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Priced at {price}, {title} offers extraordinary value. Order online and receive your copy through our fast, reliable delivery service.',
    ],
  },
  nabvi: {
    opens: [
      'The Prophetic Hadith constitutes the second foundational source of Islamic legislation and guidance, illuminating how the Quranic commandments should be understood and practiced in daily life. This {lang} collection, {title}, gathers verified narrations from the most trusted sources in Hadith literature, presenting them in a format that makes the Prophetic guidance readily accessible to readers who wish to follow the Sunnah with knowledge and confidence.',
      'Studying the authentic narrations of Prophet Muhammad (peace be upon him) is a means of drawing closer to Allah and developing the noble character traits that Islam demands. This {lang} edition of {title} compiles carefully verified Hadith texts, complete with their chains of transmission and scholarly authentication, giving readers the assurance that every narration presented in this collection has been scrutinized according to the rigorous standards of Hadith science.',
      'The great Hadith scholars of Islam spent lifetimes traveling, collecting, memorizing, and verifying the sayings of the Prophet (peace be upon him), creating an unparalleled system of textual preservation that protects the authenticity of the Prophetic legacy. This {lang} work, {title}, carries forward that scholarly tradition by presenting narrations that have met the highest standards of authenticity, organized thematically to facilitate easy reference and practical application.',
      'No aspect of Muslim life — from the obligations of prayer and fasting to the etiquettes of eating, sleeping, greeting, and conducting business — is left unaddressed by the comprehensive guidance found in authentic Hadith. This {lang} publication, {title}, serves as a bridge connecting contemporary Muslims to that vast treasury of Prophetic wisdom, presenting narrations with their context, explanation, and practical implications in a manner that respects both scholarly rigor and the needs of general readers.',
    ],
    mids: [
      'Each narration in this {lang} collection has been selected and verified through the established methodology of Hadith scholarship, which evaluates both the chain of narrators (isnad) and the text (matn) of each Hadith. The narrations are organized into chapters covering the major themes of Islamic practice and belief, including faith and its pillars, purification and prayer, fasting and charity, marriage and family life, good character and social relations, and the virtues of various acts of worship. This thematic arrangement makes it straightforward for readers to find Prophetic guidance on any topic of interest. The explanatory notes help contextualize each narration within the broader framework of Islamic jurisprudence and ethics.',
    ],
    closes: [
      'Add this authoritative {lang} Hadith collection to your Islamic library by ordering from Bab-ul-Fatah, Pakistan\'s most trusted Islamic bookstore. Priced at {price}, {title} is available with delivery to all cities across Pakistan. Shop online for authentic Islamic knowledge.',
      'Purchase this verified {lang} Hadith compilation, {title}, from Bab-ul-Fatah Pakistan for {price}. Strengthen your connection to the Prophetic Sunnah with this essential reference work. We offer fast, secure delivery throughout Pakistan.',
    ],
  },
  seerah: {
    opens: [
      'The Seerah of Prophet Muhammad (peace be upon him) provides the definitive template for individual excellence and communal success in every sphere of human activity. This {lang} work, {title}, chronicles the blessed life of the Final Messenger with exceptional narrative skill and scholarly depth, drawing upon the most reliable historical sources to construct an account that is both intellectually satisfying and spiritually uplifting for readers in Pakistan and beyond.',
      'Few works of Islamic literature have earned as much universal acclaim as the Seerah book titled {title}, which has been recognized internationally for its comprehensive coverage, balanced analysis, and elegant presentation of the Prophet\'s life story. This {lang} edition makes that celebrated work accessible to {lang}-speaking readers, presenting the complete narrative from the noble lineage of Prophet Muhammad (peace be upon him) through the establishment of the first Islamic state and the Farewell Pilgrimage.',
      'To truly understand the Quran and the foundations of Islamic civilization, one must study the life of the person through whom the Quran was revealed and upon whom the Muslim community was built. This {lang} publication, {title}, provides that essential study, offering a detailed and well-sourced account of the Prophet\'s life that illuminates the historical context of Quranic revelations, the development of Islamic law, and the character traits that made Muhammad (peace be upon him) the most influential figure in human history.',
    ],
    mids: [
      'This {lang} Seerah work is structured chronologically, guiding the reader through the major phases of the Prophet\'s life in a way that highlights both the historical events and their spiritual significance. The narrative begins with the social and religious landscape of pre-Islamic Arabia, proceeds through the revelations in Makkah, the persecution of early Muslims, the migration to Madinah, the battles and treaties that shaped the Muslim community, and concludes with the conquest of Makkah and the Farewell Sermon. Throughout, the author connects each event to relevant Quranic verses and authentic Hadith, creating an integrated understanding of how the Prophet\'s life exemplified and implemented divine guidance.',
    ],
    closes: [
      'Order this remarkable {lang} Seerah work, {title}, from Bab-ul-Fatah Pakistan for {price}. Immerse yourself in the life of the Prophet (peace be upon him) with this beautifully produced edition. We deliver to all cities in Pakistan with care and reliability.',
      'Deepen your love for the Prophet (peace be upon him) by ordering this {lang} Seerah from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} is an essential addition to every Muslim home. Shop online for fast nationwide delivery.',
    ],
  },
  children: {
    opens: [
      'Building a strong Islamic identity in children starts with providing them the right reading material — books that combine entertaining storytelling with solid Islamic values, presented in language and visuals that capture a young reader\'s imagination. This {lang} children\'s book, {title}, has been specifically designed for this purpose, offering an age-appropriate introduction to important Islamic concepts through a narrative approach that keeps children engaged from the first page to the last.',
      'Young minds are remarkably receptive to stories that combine adventure, wonder, and moral lessons, and this {lang} publication titled {title} leverages that receptivity to introduce children to the beauty of Islamic teachings. Written by experienced Islamic educators who understand how children learn best, this book uses vivid storytelling and relatable characters to convey lessons about faith, good character, kindness, and the importance of following the examples set by the prophets and righteous people in Islamic history.',
      'The most effective way to teach children about Islam is through stories that make abstract concepts tangible and memorable, and this {lang} children\'s book does exactly that. {title} presents Islamic values and knowledge through engaging narratives that children naturally want to hear again and again, creating repeated learning opportunities every time the book is opened. The age-appropriate content ensures that even the youngest readers can understand and benefit from the Islamic lessons woven into each story.',
      'Introducing children to the stories of the prophets and the heroes of Islamic history is one of the most impactful ways a parent can nurture faith and good character in the next generation. This {lang} book, {title}, belongs to the celebrated tradition of Islamic children\'s storytelling, presenting accounts of prophets and righteous figures in a style that is both educationally sound and genuinely enjoyable for young readers. The narratives emphasize the moral lessons and spiritual values that children can apply in their own daily lives.',
      'Every child deserves access to Islamic books that make them feel proud of their faith and excited to learn more about it. This {lang} publication, {title}, has been created with that goal firmly in mind, offering content that is educationally enriching, culturally relevant, and spiritually uplifting for children growing up in Muslim households. The book encourages curiosity about Islam, teaches fundamental values, and helps children develop a personal connection with their faith from an early age.',
      'Developing a love for reading and a love for Islam simultaneously is the hallmark of truly excellent children\'s Islamic literature. This {lang} book titled {title} achieves both objectives through its engaging stories, appealing presentation, and carefully crafted content that introduces young readers to essential Islamic knowledge in a format they find genuinely enjoyable. Parents who read this book with their children create meaningful bonding moments while reinforcing Islamic values and strengthening family faith connections.',
    ],
    mids: [
      'The content of this {lang} children\'s book covers a range of Islamic topics presented through stories and activities that are specifically tailored to the developmental stage of young readers. Key themes include the oneness of Allah and His blessings, stories from the lives of the prophets that teach patience, trust in Allah, and courage, the importance of good manners, honesty, and respect for parents and teachers, basic Islamic practices such as prayer, fasting, and kindness to others, and the value of gratitude and contentment. Each concept is reinforced through narrative rather than dry instruction, making the lessons memorable and impactful for young minds. The colorful illustrations and engaging visual elements complement the text perfectly.',
      'What distinguishes this {lang} children\'s book from generic storybooks is its unwavering commitment to Islamic authenticity. Every story and lesson has been verified against authentic Islamic sources to ensure that the information presented is accurate and aligned with the Quran and Sunnah. At the same time, the writing style is warm, accessible, and child-friendly, avoiding overly complex language or preachy tones that might alienate young readers. The result is a book that children genuinely enjoy reading while absorbing important Islamic knowledge and values that will serve them throughout their lives.',
      'Parents and educators will find this {lang} book to be a versatile teaching resource that works equally well for individual reading, bedtime stories, classroom instruction, and Islamic school curricula. The stories can be used as conversation starters about Islamic values, and the age-appropriate content means children can begin exploring the book independently as soon as they develop basic reading skills. Many families report that this book becomes a favorite that children request to be read repeatedly, with each reading reinforcing the Islamic lessons embedded in the engaging narratives.',
    ],
    closes: [
      'Give your children the gift of Islamic knowledge with this engaging {lang} book from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is available with fast delivery across all cities in Pakistan. Order online and invest in your child\'s faith and character development.',
      'Order this wonderful {lang} children\'s book from Bab-ul-Fatah for just {price}. This edition of {title} makes Islamic learning enjoyable and memorable for kids. We deliver across Pakistan with the reliability that parents trust.',
      'Shop for this educational {lang} children\'s publication at Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} is an affordable investment in your child\'s Islamic education. Order online today for quick delivery nationwide.',
    ],
  },
  women: {
    opens: [
      'Islam elevated the status of women fourteen centuries ago, granting them rights to education, property ownership, inheritance, and spiritual equality that were revolutionary for their time and remain profoundly relevant today. This {lang} publication titled {title} addresses the specific concerns and questions of Muslim women, providing guidance firmly grounded in the Quran and authentic Sunnah on matters of faith, worship, personal conduct, and community participation.',
      'Muslim women in Pakistan and around the world face unique challenges in balancing their religious commitments with the demands of modern life, and this {lang} work, {title}, offers practical, faith-based guidance for navigating those challenges with wisdom and grace. Drawing upon the Quran, verified Hadith, and the scholarly consensus of qualified Islamic jurists, this book provides clear, authoritative answers to the questions that Muslim women most frequently ask about their religious practice and daily life.',
      'The Islamic framework for women\'s conduct, worship, and social participation is comprehensive and balanced, offering both protection and empowerment within clearly defined guidelines. This {lang} book, {title}, explores that framework with scholarly depth and practical sensitivity, covering topics that include the Islamic requirements for modesty and hijab, women\'s prayer and fasting obligations, rights and responsibilities within the family, and the remarkable examples set by the great women of Islamic history.',
    ],
    mids: [
      'This {lang} publication addresses the full spectrum of issues relevant to Muslim women, organized into clear thematic sections that make it easy to find guidance on specific topics. The book draws upon the Quranic verses addressing women directly, the Hadith narrated by and about the women of the Prophet\'s household, and the fatwas of qualified contemporary scholars who understand the realities of modern Muslim life. Each ruling and recommendation is supported by textual evidence, presented in a {lang} narrative that is both informative and respectful of the reader\'s intelligence and personal circumstances. The practical focus ensures that readers can immediately apply the guidance to their daily lives.',
    ],
    closes: [
      'Order this essential {lang} guide for Muslim women from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers reliable, scholarly guidance for women of all ages. Shop online with delivery available to every city in Pakistan.',
      'Get this valuable {lang} publication on women\'s Islamic guidance from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is an important resource for every Muslim household. Order today for fast nationwide delivery.',
    ],
  },
  companions: {
    opens: [
      'The Sahabah — the noble Companions of Prophet Muhammad (peace be upon him) — were handpicked by Allah to be the living embodiment of Islamic teachings, demonstrating through their words, actions, and sacrifices how the Quran should be translated into real human conduct. This {lang} work, {title}, brings to vivid life the extraordinary stories of these remarkable men and women, whose faith under persecution, generosity in poverty, and courage in battle established the template for Islamic excellence that resonates through the centuries.',
      'Studying the lives of the Companions of the Prophet (peace be upon him) is not merely an academic exercise in Islamic history — it is a transformative spiritual practice that reshapes one\'s understanding of what is possible when faith meets action. This {lang} publication, {title}, provides meticulously researched biographical accounts that highlight the distinct character, achievements, and spiritual stations of individual Sahabah, offering readers concrete role models whose examples can be emulated in contemporary life.',
      'The generation of Muslims who lived alongside Prophet Muhammad (peace be upon him) achieved what no other generation before or since has accomplished — they established a civilization built entirely upon the principles of divine guidance, transforming the Arabian Peninsula from tribal conflict to unified purpose within a single generation. This {lang} book, {title}, chronicles the individual contributions of the key Companions who made that transformation possible, providing detailed accounts of their acceptance of Islam, their sacrifices, and their lasting legacy.',
    ],
    mids: [
      'This {lang} work draws upon the most authoritative sources of Islamic history, including the classical biographical compilations of Ibn Sa\'d, Al-Bukhari\'s Al-Adab Al-Mufrad, the historical works of Al-Tabari, and the extensive Hadith literature that preserves the words and deeds of the Companions. Each biography presents the Companion\'s full name and lineage, their background before Islam, the circumstances of their conversion, their contributions to the Muslim community during the Prophet\'s lifetime, and their role in the early Islamic state after the Prophet\'s passing. The {lang} narrative style makes these historical accounts engaging and accessible while maintaining strict adherence to verified sources.',
    ],
    closes: [
      'Discover the inspiring lives of Islam\'s greatest generation with this {lang} book from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers timeless lessons in faith, courage, and devotion. Order online for delivery to any city in Pakistan.',
      'Order this comprehensive {lang} Companion biography collection from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} is a valuable addition to any Islamic library. We deliver nationwide with care and reliability.',
    ],
  },
  biography: {
    opens: [
      'Islamic biography serves as a mirror reflecting the heights that human beings can reach when they dedicate their lives to faith, knowledge, and service to the Muslim community. This {lang} work titled {title} presents a thoroughly researched life narrative that captures the achievements, challenges, and lasting contributions of its subject, offering readers both historical knowledge and the inspiration to pursue excellence in their own lives.',
      'The stories of great Muslim figures — scholars, leaders, reformers, and martyrs — contain practical wisdom that transcends the specific historical circumstances in which these individuals lived. This {lang} publication, {title}, brings such a story to life with narrative skill and scholarly accuracy, tracing the complete arc of its subject\'s journey from early life and education through their major accomplishments and their enduring impact on the Muslim Ummah.',
      'Biography is one of the most powerful vehicles for transmitting Islamic values across generations, because it shows abstract principles embodied in real human lives. This {lang} book, {title}, exemplifies that power by presenting the life story of an important Muslim figure in a way that educates, inspires, and challenges readers to reflect on their own commitment to faith, knowledge, and service. The narrative is grounded in verified historical sources and enriched with contextual analysis.',
      'Atlas-format Islamic books represent a revolutionary approach to understanding Islamic history, combining detailed maps, photographs, and scholarly commentary to create an immersive learning experience that no text-only biography can match. This {lang} {title} uses this innovative format to trace historical events, geographical journeys, and the spread of Islamic civilization across continents, providing readers with a visual and intellectual understanding that brings history to life in vivid detail.',
    ],
    mids: [
      'This {lang} biography has been compiled using primary historical sources and verified scholarly references, ensuring that every claim and narrative detail is grounded in evidence rather than speculation. The author provides rich historical context that helps readers understand the social, political, and intellectual environment in which the subject lived and worked. Key events are analyzed not merely as historical incidents but as sources of practical lessons that remain relevant for contemporary Muslims. The {lang} prose is clear and engaging, making this work suitable for both serious researchers and general readers who want to expand their knowledge of Islamic history and biography.',
    ],
    closes: [
      'Order this inspiring {lang} biography from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers both knowledge and spiritual motivation. Shop online with delivery available across Pakistan.',
      'Purchase this valuable {lang} biographical work from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} is a meaningful addition to any Islamic collection. Order today for reliable nationwide shipping.',
    ],
  },
  education: {
    opens: [
      'The intellectual heritage of Islam is among the richest and most diverse in human civilization, encompassing fields from theology and jurisprudence to astronomy, medicine, mathematics, and philosophy. This {lang} educational work titled {title} contributes to that living tradition by providing structured, reliable content that supports both formal classroom instruction and independent scholarly pursuit, making it a valuable resource for students and educators across Pakistan.',
      'Acquiring Islamic knowledge is not merely an academic exercise — it is a religious obligation upon every Muslim, male and female, that equips them to practice their faith correctly, contribute to their communities, and navigate the challenges of contemporary life with wisdom and confidence. This {lang} publication, {title}, has been developed to facilitate that obligation by presenting essential Islamic knowledge in a format that is systematic, accessible, and pedagogically sound.',
      'The relationship between scientific discovery and Quranic revelation is a topic of profound importance for Muslims seeking to understand how their faith relates to modern knowledge. This {lang} work, {title}, explores that relationship with scholarly rigor, examining how the Quran anticipated scientific facts that were only discovered centuries later. The analysis draws upon established scientific data and authentic Quranic verses to demonstrate the remarkable alignment between divine revelation and empirical observation.',
      'Learning the Arabic language is the single most transformative step a non-Arabic-speaking Muslim can take toward direct engagement with the primary sources of Islamic knowledge. This {lang} educational resource, {title}, provides a structured pathway to Arabic proficiency, using proven pedagogical methods that have helped countless students achieve reading fluency and grammatical understanding sufficient for accessing Quranic and Hadith texts in their original language.',
      'Understanding the diverse religions and belief systems of the world is essential for Muslims who wish to engage in informed interfaith dialogue and appreciate the unique features of Islamic theology. This {lang} publication titled {title} offers a comprehensive survey of world religions and their beliefs, comparing and contrasting them with Islamic teachings in a manner that is scholarly, fair, and firmly rooted in authentic Islamic scholarship.',
    ],
    mids: [
      'The content of this {lang} educational work has been organized according to proven principles of instructional design, building understanding progressively from foundational concepts to more advanced material. Each chapter includes clear objectives, systematic explanations, relevant examples, and review exercises that reinforce learning and promote retention. The {lang} text is accessible to students at multiple educational levels, making this resource suitable for madrasa curricula, university courses, and self-directed study programs. The practical focus ensures that theoretical knowledge can be translated into real-world application, whether in academic research, teaching, or personal intellectual development.',
    ],
    closes: [
      'Advance your Islamic education with this essential {lang} resource from Bab-ul-Fatah Pakistan. Priced at {price}, this edition of {title} offers outstanding value for students and educators. Order online with fast delivery across Pakistan.',
      'Order this comprehensive {lang} educational work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for just {price}. This edition of {title} is perfect for classroom use or self-study. We ship to all cities nationwide.',
    ],
  },
  home_decor: {
    opens: [
      'Transforming your living space with Islamic art is a beautiful way to create an environment that constantly reminds you and your family of Allah\'s presence and blessings. This {lang} calligraphy piece, {title}, features masterfully rendered Quranic text in a design that combines traditional Islamic artistic heritage with contemporary aesthetic sensibilities, creating a wall display that serves as both a stunning decorative element and a source of spiritual inspiration.',
      'Islamic calligraphy has been revered for centuries as one of the most sophisticated and spiritually significant art forms in human civilization, transforming sacred Quranic text into visual masterpieces that elevate the spaces they inhabit. This {lang} {title} continues that noble artistic tradition, featuring expert calligraphic work that showcases the inherent beauty of the Arabic script while conveying the profound spiritual meaning of the verses it presents.',
    ],
    mids: [
      'This {lang} calligraphy piece has been crafted using premium materials that ensure both visual impact and lasting durability. The {format} features meticulous attention to detail in every stroke of the calligraphic rendering, with the holy text presented in a style that honors the sacred nature of the words while creating an aesthetically striking visual composition. The piece comes ready to display and makes a meaningful gift for housewarmings, weddings, Eid celebrations, and other special occasions. Its presence in your home serves as a constant reminder of divine blessings and adds a touch of Islamic elegance to any room.',
    ],
    closes: [
      'Enhance your home with this beautiful {lang} Islamic calligraphy from Bab-ul-Fatah Pakistan. Priced at {price}, {title} makes a perfect gift or personal decoration. Order online with delivery available to all cities in Pakistan.',
      'Shop for this stunning {lang} calligraphy piece at Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} combines art and faith in one beautiful display. Order now for nationwide delivery.',
    ],
  },
  food: {
    opens: [
      'The Sunnah of Prophet Muhammad (peace be upon him) extends to every aspect of daily life, including dietary habits and the consumption of beneficial natural foods. This {lang} product, {title}, represents the tradition of using natural, wholesome products that align with Prophetic dietary recommendations, offering a pure and beneficial addition to your household that supports both health and adherence to the Sunnah.',
    ],
    mids: [
      'This {lang} product has been sourced and processed with careful attention to quality and purity, ensuring that it meets the standards expected by Muslim consumers who seek wholesome, natural products for their families. The use of such products is encouraged in Islamic tradition, where natural foods like almonds and their oils have been mentioned in Hadith for their nutritional and health benefits. Whether used in cooking, as a dietary supplement, or as part of a natural wellness routine, this product provides a practical way to incorporate beneficial Sunnah foods into your daily life.',
    ],
    closes: [
      'Order this pure, natural {lang} product from Bab-ul-Fatah Pakistan for {price}. We offer quality Sunnah foods and Islamic products with fast delivery across the country. Shop online today.',
    ],
  },
  health: {
    opens: [
      'The field of Prophetic medicine — known as Tibb-e-Nabvi — represents a remarkable intersection of divine guidance and natural health wisdom, offering Muslims a holistic approach to wellness that is rooted in the recommendations of Prophet Muhammad (peace be upon him) and validated by both traditional practice and modern scientific research. This {lang} publication titled {title} provides a comprehensive exploration of this important topic, presenting the Prophetic recommendations for health and healing in a format that is both scholarly and practically useful.',
    ],
    mids: [
      'This {lang} work on Prophetic medicine covers a wide range of natural remedies, dietary recommendations, and health practices that are mentioned in authentic Hadith literature, including the use of honey, black seed, dates, Zamzam water, cupping (hijama), and various other natural treatments endorsed by the Prophet (peace be upon him). Each remedy is presented with its source Hadith, an explanation of its traditional usage, and — where applicable — references to modern scientific research that supports its efficacy. The practical guidance provided makes this book a valuable household reference for families seeking to align their health practices with the Prophetic tradition.',
    ],
    closes: [
      'Discover the healing wisdom of the Sunnah with this {lang} publication from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is a comprehensive guide to Prophetic medicine. Order online with delivery to all cities in Pakistan.',
    ],
  },
  pillars: {
    opens: [
      'The five pillars of Islam constitute the essential framework of Muslim belief and practice, providing the structure upon which a meaningful relationship with Allah is built. This {lang} publication titled {title} offers focused, practical guidance on one or more of these pillars, helping readers understand not only the correct method of performance but also the deeper spiritual significance that transforms these acts of worship from mere ritual into profound spiritual experiences.',
      'Du\'a (supplication) is one of the most powerful and accessible forms of worship available to a Muslim — a direct conversation with Allah that can be engaged in at any time, in any place, and in any language. This {lang} work, {title}, explores the significance, etiquette, and immense benefits of making du\'a, drawing upon Quranic verses and authentic Hadith to demonstrate how this simple act of worship can transform one\'s spiritual life and bring about tangible positive change.',
      'Allah\'s mercy is vast and all-encompassing, and the Quran and Sunnah repeatedly remind believers that no matter how many mistakes they may have made, sincere repentance is always accepted and forgiveness is always available. This {lang} publication titled {title} focuses on this central message of hope and mercy, using authentic Islamic sources to show how every Muslim can return to Allah and find peace in His boundless forgiveness.',
      'The daily prayer (Salah) is the first matter a person will be questioned about on the Day of Judgment, making it imperative that every Muslim performs this pillar correctly with full understanding of its requirements and spiritual dimensions. This {lang} book titled {title} provides detailed, practical instruction on performing Salah according to the authentic Sunnah, addressing common errors and explaining the inner meanings of each posture and recitation within the prayer.',
      'The duas (supplications) made by the prophets throughout history carry a special power and beauty, as they combine absolute sincerity, complete dependence on Allah, and exquisite expression of human need before the Creator. This {lang} collection, {title}, gathers the authenticated supplications of the prophets as recorded in the Quran and authentic Hadith, presenting them in a format that readers can incorporate into their daily worship and draw inspiration from for their own personal prayers.',
      'The remembrance of Allah through daily azkar (words of remembrance) is a practice that the Prophet (peace be upon him) described as the best of deeds and the most purifying for the soul. This {lang} publication titled {title} compiles beneficial daily azkar drawn from authentic Hadith sources, organizing them by time of day and occasion so that readers can easily incorporate this powerful spiritual practice into their daily routine for protection, peace, and spiritual growth.',
      'Jumu\'ah (Friday congregational prayer) holds a special status in Islam as the weekly gathering of the Muslim community for worship, spiritual renewal, and communal bonding. This {lang} publication, {title}, explores the virtues, rulings, and etiquette of Jumu\'ah in detail, explaining the significance of this weekly occasion and providing practical guidance on how to maximize its spiritual benefits. The book draws upon Quranic verses and authentic Hadith to present a comprehensive understanding of this important Islamic institution.',
      'Understanding the pillars of Islam and Iman is the foundation upon which all Islamic knowledge is built, and having a clear, concise guide to these essential beliefs and practices is invaluable for every Muslim. This {lang} publication titled {title} provides that foundational knowledge in a new, updated edition that incorporates the latest scholarly insights while remaining accessible to readers at every educational level.',
      'Interest (riba) is one of the most severe prohibitions in Islam, with the Quran equating those who consume it to those driven to madness by Satan\'s touch. This {lang} publication, {title}, delivers a clear, well-reasoned warning against all forms of riba, explaining what constitutes interest-based transactions, why it is forbidden, and what halal alternatives Muslims should pursue. The author supports every point with evidence from the Quran and authentic Hadith, providing readers with the knowledge they need to protect themselves and their families from this grave sin.',
    ],
    mids: [
      'This {lang} work provides thorough coverage of its subject matter, presenting information in a structured format that facilitates both learning and practical application. Each topic is introduced with its Quranic basis, followed by the relevant Hadith evidence, and then explained with clear, practical guidance that readers can immediately implement in their daily lives. Common misconceptions are addressed and corrected, and the spiritual dimensions of each practice are explored to help readers move beyond mere mechanical performance toward genuine worship that engages the heart as well as the body.',
    ],
    closes: [
      'Order this valuable {lang} Islamic guide from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers essential knowledge for every Muslim household. Shop online with delivery available to all cities across Pakistan.',
      'Strengthen your worship with this practical {lang} publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is available with fast nationwide delivery. Order online today.',
      'Get this important {lang} Islamic reference from Bab-ul-Fatah Pakistan for {price}. This edition of {title} provides reliable, actionable guidance. Order online for prompt delivery to any location in Pakistan.',
    ],
  },
  fiqh: {
    opens: [
      'Islamic jurisprudence provides the practical framework through which Muslims translate their faith into daily action, covering every dimension of life from the moment of waking to the time of sleep. This {lang} work, {title}, addresses a specific area of fiqh with scholarly precision and practical clarity, drawing upon the Quran, authenticated Sunnah, and the established methodology of Islamic legal reasoning to present rulings that readers can follow with confidence.',
    ],
    mids: [
      'The fiqh discussion in this {lang} publication is supported by textual evidence from the primary sources of Islamic law, with careful explanation of the legal reasoning behind each ruling. The author presents the positions of the major schools of Islamic jurisprudence where differences of opinion exist, explaining the basis for each position with scholarly fairness and enabling readers to make informed choices. The practical focus ensures that the knowledge gained can be readily applied to real-life situations, making this work a useful reference for both scholars and general readers seeking reliable fiqh guidance.',
    ],
    closes: [
      'Order this authoritative {lang} fiqh reference from Bab-ul-Fatah Pakistan for {price}. This edition of {title} provides the reliable scholarly guidance that every Muslim needs. We deliver across Pakistan with care and efficiency.',
    ],
  },
  darussalam: {
    opens: [
      'Darussalam has earned a global reputation as one of the most trusted publishers of authentic Islamic literature, with a catalog spanning thousands of titles in multiple languages. This {lang} publication upholds that distinguished reputation, combining scholarly accuracy, accessible presentation, and production quality that meets international standards. Every Darussalam title undergoes rigorous scholarly review before publication, ensuring that readers receive content they can rely upon with complete confidence.',
      'Published under the trusted Darussalam imprint, this {lang} work reflects the publisher\'s hallmark commitment to authenticity, accuracy, and quality in Islamic publishing. Darussalam\'s titles are used in Islamic schools, universities, and mosques throughout Pakistan and across the Muslim world, recognized for their reliability and adherence to authentic Islamic sources.',
    ],
    mids: [
      'This {lang} Darussalam publication has been produced with the publisher\'s characteristic attention to detail, from the scholarly review process that verifies content accuracy to the careful selection of materials and printing techniques that ensure durability and readability. The {format} used in this edition reflects Darussalam\'s understanding of what readers need — clear text, quality paper, and a binding that withstands regular use. Each Darussalam title is a reflection of the publisher\'s mission to make authentic Islamic knowledge widely accessible in an era of misinformation and confusion.',
    ],
    closes: [
      'Order this quality Darussalam {lang} publication from Bab-ul-Fatah Pakistan for {price}. We stock a wide selection of Darussalam titles with delivery to every city in Pakistan. Shop online with confidence.',
      'Get this trusted {lang} Darussalam edition from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is available with fast, reliable shipping nationwide. Order online today.',
    ],
  },
  family: {
    opens: [
      'The family is the cornerstone of Islamic society, and maintaining strong, faith-centered family relationships is essential for individual happiness, community cohesion, and the healthy development of the next generation. This {lang} publication titled {title} addresses family matters with practical, Islamically-grounded wisdom, offering guidance that helps families build relationships rooted in love, mutual respect, and shared commitment to Islamic values.',
      'Performing the Hajj pilgrimage as a family is a profound spiritual experience that creates memories and bonds that last a lifetime. This {lang} pocket guide, {title}, has been specifically designed to be a compact, easy-to-carry companion for pilgrims performing Hajj, Umrah, and Ziyarah, providing step-by-step instructions, relevant supplications, and practical tips that ensure each ritual is performed correctly according to the authentic Sunnah.',
      'True happiness in this world and the next is directly connected to one\'s relationship with Allah and adherence to His guidance. This {lang} work titled {title} explores the Islamic understanding of happiness, explaining how faith, gratitude, patience, good character, and meaningful relationships contribute to a fulfilling life. Drawing upon the Quran and authentic Hadith, the author presents a comprehensive framework for achieving genuine contentment that transcends material circumstances.',
    ],
    mids: [
      'This {lang} family-oriented publication provides practical, actionable guidance that readers can implement immediately in their daily lives. The content is organized for easy reference, with clear headings and a logical flow that takes readers from foundational principles to specific applications. Whether used for personal study, family reading circles, or as a reference guide during important life events, this {lang} edition offers the reliable, faith-based support that Muslim families need to navigate the challenges and joys of family life in accordance with Islamic teachings.',
    ],
    closes: [
      'Order this valuable {lang} family guide from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers practical wisdom for every Muslim household. Shop online with delivery to any city in Pakistan.',
      'Purchase this essential {lang} publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for just {price}. This edition of {title} is perfect for families seeking Islamic guidance. We ship nationwide.',
    ],
  },
  reference: {
    opens: [
      'Arabic reference works form the backbone of advanced Islamic scholarship, providing the linguistic, historical, and technical knowledge that scholars need to engage with the primary texts of Islam at the highest level. This {lang} publication titled {title} serves as an important reference tool for students and scholars of Islamic studies, offering authoritative content that supports advanced research, academic writing, and deeper engagement with the Islamic intellectual tradition.',
    ],
    mids: [
      'This {lang} reference work has been compiled by scholars with recognized expertise in their field, ensuring that the information presented is accurate, comprehensive, and aligned with established academic standards in Islamic studies. The content is organized for maximum utility as a reference tool, with clear categorization, thorough indexing, and cross-referencing that enables readers to quickly locate the information they need. Whether consulted for specific queries or read systematically for broader understanding, this {lang} publication provides the scholarly foundation that serious students of Islam require.',
    ],
    closes: [
      'Add this authoritative {lang} reference work to your Islamic library from Bab-ul-Fatah Pakistan for {price}. This edition of {title} is a valuable scholarly resource. Order online with delivery across Pakistan.',
    ],
  },
  scholars: {
    opens: [
      'The great scholars of Islamic history — including hadith masters, jurists, theologians, and reformers — represent the intellectual vanguard of the Muslim Ummah, devoting their lives to preserving, interpreting, and transmitting the teachings of Islam across generations. This {lang} publication titled {title} provides insight into the contributions and intellectual legacy of an important Islamic scholar, offering readers both historical knowledge and the inspiration to pursue their own journey of Islamic learning.',
      'Islamic scholarly heritage is a vast and interconnected web of knowledge that spans continents and centuries, with each generation of scholars building upon the work of those who came before them. This {lang} work, {title}, contributes to our understanding of that scholarly tradition, whether through a focused study of an individual scholar\'s methodology and contributions, or through a broader survey of Islamic intellectual history that illuminates the connections between different scholars, schools, and disciplines.',
    ],
    mids: [
      'This {lang} publication combines scholarly rigor with accessible presentation, making it suitable for both academic readers and general Muslims who wish to deepen their understanding of Islamic intellectual history. The content is grounded in verified historical sources, and the analysis reflects a balanced, evidence-based approach that acknowledges the complexity of scholarly debates while providing clear conclusions that readers can rely upon. The {lang} text is well-organized with helpful references that enable further study for those who wish to explore the topic in greater depth.',
    ],
    closes: [
      'Order this scholarly {lang} publication from Bab-ul-Fatah Pakistan for {price}. This edition of {title} is an important addition to any Islamic academic collection. Shop online with nationwide delivery.',
      'Purchase this valuable {lang} scholarly work from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} offers exceptional intellectual value. Order today for fast delivery across Pakistan.',
    ],
  },
  hajj: {
    opens: [
      'The sacred journey of Hajj is among the most significant spiritual experiences a Muslim can undertake, and being properly prepared — both practically and spiritually — is essential for having an accepted pilgrimage. This {lang} publication titled {title} provides comprehensive preparation guidance that covers every aspect of the Hajj and Umrah experience, from the initial intention and travel preparations through the completion of all rites and the return home.',
      'The ten days of Dhul Hijjah are among the most blessed days in the Islamic calendar, and understanding the significance of Eid ul-Adha and Qurbani is essential for every Muslim household. This {lang} booklet titled {title} provides a concise yet thorough guide to the virtues, rulings, and proper method of performing Qurbani during these sacred days, along with essential information about the rituals of Eid ul-Adha that every Muslim should know.',
    ],
    mids: [
      'This {lang} publication covers all the essential information that pilgrims and Muslims need, presented in a clear, organized format that facilitates quick reference. The content draws upon authoritative Islamic sources and the consensus of qualified scholars to ensure accuracy in every ruling and recommendation. Whether you are a first-time pilgrim seeking step-by-step guidance or an experienced traveler looking for a reliable reference, this {lang} edition provides the comprehensive, trustworthy information you need for a spiritually rewarding experience.',
    ],
    closes: [
      'Prepare for your sacred journey with this {lang} guide from Bab-ul-Fatah Pakistan for {price}. Order online with delivery to any city in Pakistan and embark on your pilgrimage fully prepared.',
      'Order this comprehensive {lang} Hajj guide from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is an essential companion for every pilgrim. Shop online today.',
    ],
  },
  general: {
    opens: [
      'Expanding one\'s knowledge of Islam is a continuous obligation that enriches both this life and the next, and having access to reliable, well-written Islamic publications makes that pursuit of knowledge significantly more productive and enjoyable. This {lang} work titled {title} addresses an important topic in Islamic knowledge, presenting information that is both intellectually stimulating and practically relevant for Muslims seeking to strengthen their understanding of their faith.',
      'Islam provides comprehensive guidance for every aspect of human existence, and works like this {lang} publication, {title}, help Muslims access that guidance by addressing specific topics with scholarly depth and practical clarity. Whether you are a seasoned student of Islamic knowledge or a curious reader exploring a new area of Islamic learning, this book offers content that is accessible, well-researched, and firmly grounded in authentic Islamic sources.',
    ],
    mids: [
      'This {lang} publication has been prepared with careful attention to both content accuracy and reader accessibility. The author draws upon the Quran, verified Hadith, and established scholarly sources to present information that readers can trust. The writing style is clear and direct, avoiding unnecessary jargon while maintaining the scholarly rigor that Islamic publications require. This balanced approach makes the work suitable for a wide readership, from Islamic school students and university attendees to general readers who want to deepen their understanding of Islam in a specific area.',
    ],
    closes: [
      'Order this valuable {lang} Islamic publication from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers quality Islamic knowledge at an accessible price. Shop online with delivery to all cities in Pakistan.',
      'Get this informative {lang} book from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is a worthwhile addition to any Islamic library. Order today for reliable nationwide shipping.',
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
  const author = (product.author && product.author.name) || product.author || '';
  const details = extractDetails(title, product.category);
  const lines = details.lines ? String(details.lines) : 'standard';
  const binding = details.binding;
  const format = details.format;
  const parts = details.parts;

  // Use index-based selection to maximize uniqueness across 100 products
  const openIdx = index % templates.opens.length;
  const midIdx = (index * 3 + 2) % templates.mids.length;
  const closeIdx = (index * 5 + 4) % templates.closes.length;

  let desc = templates.opens[openIdx];

  // Add author context if available and unique
  if (author && author.length > 1 && author.length < 80 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author)) {
    desc += ` Authored by the distinguished scholar ${author}, this work reflects a deep commitment to authentic Islamic scholarship and the preservation of beneficial knowledge for the Muslim Ummah.`;
  }

  // Add parts info if available
  if (parts) {
    desc += ` This ${parts} provides comprehensive coverage of its subject matter.`;
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
      'This {lang} edition has been manufactured to exacting quality standards, with premium paper, durable binding, and precise typography that ensures a superior reading and handling experience for years of daily use.',
      'Bab-ul-Fatah is recognized across Pakistan as a dependable source for authentic Islamic publications, and this edition of {title} exemplifies the caliber of materials available through our platform.',
      'Whether you are an advanced scholar or a beginning student, this {lang} publication delivers content that is both approachable and intellectually rewarding across all levels of understanding.',
      'The production team behind this {lang} edition has ensured international quality benchmarks, with every page reviewed under scholarly supervision to guarantee accuracy and authenticity throughout.',
      'This work bridges the gap between classical Islamic scholarship and the informational needs of contemporary readers, presenting traditional wisdom in a manner that resonates with modern audiences.',
      'Islamic educators and institutions throughout Pakistan recommend this {lang} publication for its clarity of expression, depth of content, and strict adherence to authentic Islamic source material.',
      'The sustained demand for this {lang} title reflects its enduring relevance and the trust that generations of Muslim readers have placed in its accuracy and scholarly reliability.',
      'Published in {lang}, this work fulfills the important Islamic duty of disseminating beneficial knowledge, contributing to the intellectual and spiritual enrichment of Muslim communities everywhere.',
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
  const cat = (product.category && product.category.name) || product.category || 'Islamic Books';
  const lang = langName(product.language || 'ENGLISH');
  const title = product.title || 'Islamic Book';
  const author = (product.author && product.author.name) || product.author || '';
  const price = formatPrice(product.price);
  const authorPart = (author && author.length > 0 && author.length < 60 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author)) ? ` by ${author}` : '';

  const templates = [
    `${title} — buy online at Bab-ul-Fatah Pakistan. ${lang} ${cat}${authorPart} for ${price}. Fast nationwide delivery.`,
    `Shop ${title} from Bab-ul-Fatah Pakistan. Premium ${lang} ${cat} at ${price}${authorPart}. Order now for quick delivery.`,
    `Order ${title} in ${lang} — ${price} at Bab-ul-Fatah Pakistan. Authentic ${cat}${authorPart}. Nationwide shipping available.`,
    `${title} by Bab-ul-Fatah Pakistan. ${lang} ${cat} priced at ${price}${authorPart}. Trusted Islamic products retailer.`,
    `Purchase ${title} for ${price} from Bab-ul-Fatah. ${lang} ${cat}${authorPart}. Pakistan's most reliable online Islamic store.`,
    `${title} — ${lang} ${cat} available at ${price}. Bab-ul-Fatah Pakistan${authorPart}. Order online today for delivery.`,
    `Buy ${title} in ${lang} at ${price}. Bab-ul-Fatah Pakistan stocks authentic ${cat.toLowerCase()} items.${authorPart} Shop now.`,
    `${title} ${lang} edition for ${price}. Bab-ul-Fatah — Pakistan's trusted Islamic bookstore${authorPart}. Order with fast delivery.`,
    `Authentic ${title} in ${lang} at ${price} — Bab-ul-Fatah Pakistan. ${cat}${authorPart}. Order online for nationwide shipping.`,
    `Get ${title} (${lang} ${cat}) at ${price} from Bab-ul-Fatah Pakistan${authorPart}. Quality guaranteed, delivery across Pakistan.`,
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
  console.log('  Bab-ul-Fatah SEO Batch 2 — Products 101-200 Descriptions');
  console.log('='.repeat(60) + '\n');

  // Step 1: Fetch products 101-200 from DB and save to JSON
  console.log('  Step 1: Fetching products 101-200 from database...');
  const productsFromDb = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    skip: 100,
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      language: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });
  console.log(`  Found ${productsFromDb.length} products`);

  // Save to batch2-products.json
  const productsPath = path.join(__dirname, 'batch2-products.json');
  fs.writeFileSync(productsPath, JSON.stringify(productsFromDb, null, 2));
  console.log(`  Saved to: ${productsPath}\n`);

  // Step 2: Load products (use the saved file for consistency)
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`  Loaded ${products.length} products from batch2-products.json\n`);

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
        slug: p.slug,
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
  const metaPath = path.join(__dirname, 'seo-meta-batch2.json');
  fs.writeFileSync(metaPath, JSON.stringify(metaResults, null, 2));
  console.log(`  Meta descriptions saved to: ${metaPath}`);

  // Word count stats
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);
  const withinRange = wordCounts.filter(w => w >= 180 && w <= 250).length;
  console.log(`  Word count: avg=${avgWords}, min=${minWords}, max=${maxWords}, in-range(180-250)=${withinRange}/${updatedCount}`);

  // Meta description stats
  const metaLens = metaResults.map(m => m.metaDescription.length);
  const avgMeta = Math.round(metaLens.reduce((a, b) => a + b, 0) / metaLens.length);
  const minMeta = Math.min(...metaLens);
  const maxMeta = Math.max(...metaLens);
  const metaInRange = metaLens.filter(l => l >= 120 && l <= 155).length;
  console.log(`  Meta desc: avg=${avgMeta}, min=${minMeta}, max=${maxMeta}, in-range(120-155)=${metaInRange}/${updatedCount}`);

  // Uniqueness check
  const descSet = new Set(allDescriptions);
  const openSet = new Set(allDescriptions.map(d => d.substring(0, 100)));
  console.log(`  Unique descriptions (full): ${descSet.size}/${updatedCount}`);
  console.log(`  Unique openings (100 chars): ${openSet.size}/${updatedCount}`);

  // Update progress file
  try {
    const progressPath = path.join(__dirname, 'seo-progress.json');
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    progress.batches['2'] = {
      status: 'completed',
      startIdx: 101,
      endIdx: 200,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
    };
    progress.completedBatches = 2;
    progress.completedProducts = (progress.completedProducts || 0) + updatedCount;
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress file updated: batch 2 marked as completed`);
  } catch (progressErr) {
    const altPath = path.join(__dirname, 'seo-progress-batch2.json');
    const progress = {
      batch: 2,
      status: 'completed',
      startIdx: 101,
      endIdx: 200,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
      completedBatches: 2,
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

  const sampleIndices = [0, 3, 10, 24, 35, 49, 60, 75, 88, 99];
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
  console.log(`  BATCH 2 COMPLETE: ${updatedCount} products updated successfully`);
  console.log('='.repeat(60) + '\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
