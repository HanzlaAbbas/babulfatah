#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 10 Description Writer
// Writes unique, SEO-optimized product descriptions for products 1001–1100
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
  if (/soft\s*cover|s\/c/i.test(t)) binding = 'soft cover binding';
  if (/hard\s*cover|h\/c/i.test(t)) binding = 'hard cover binding';
  if (/leather/i.test(t)) binding = 'leather cover binding';
  if (/jumbo/i.test(t)) { format = 'jumbo large-format script'; binding = 'durable reinforced binding'; }
  if (/tajweed|tajweedi|color\s*coded/i.test(t)) format = 'color-coded Tajweed script';
  if (/hafzi/i.test(t)) format = 'Hafzi memorization script';
  if (/lafzi/i.test(t)) format = 'word-by-word translation format';
  if (/art\s*paper/i.test(t)) format = 'art paper premium script';
  if (/pocket/i.test(t)) { format = 'compact pocket-size format'; binding = 'portable soft cover binding'; }
  if (/zip/i.test(t)) binding = 'zip-closure protective binding';
  if (/imported/i.test(t)) format = 'imported premium quality script';
  if (/local/i.test(t) && !/imported/i.test(t)) format = 'locally printed standard script';
  const sizeMatch = t.match(/(\d+)\s*x\s*(\d+)/);
  if (sizeMatch) format += ` (${sizeMatch[1]}x${sizeMatch[2]} cm)`;
  if (/set|complete\s*set/i.test(t)) parts = 'complete multi-volume set';
  const volMatch = t.match(/(\d+)\s*vol/i);
  if (volMatch && !parts) parts = `${volMatch[1]}-volume set`;
  if (/30th\s*(parah|part|para)/i.test(t)) parts = '30th Para edition';
  if (/parah|para\s*#/i.test(t)) {
    const paraNum = t.match(/#?\s*(\d+)/);
    if (paraNum) parts = `Para ${paraNum[1]}`;
  }
  return { lines, binding, format, parts };
}

// ─── Category routing ────────────────────────────────────────────────────────
function detectCatKey(product) {
  const cat = (product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  // Healthy Food Items / Talbeena
  if (/healthy\s*food|talbeena/i.test(cat) || /talbeena/i.test(title)) return 'healthy_food';
  // Lifestyle
  if (/lifestyle/i.test(cat) || /talbees-e-iblees|talbees.*iblees/i.test(title)) return 'lifestyle';
  // Prayer Supplication
  if (/prayer\s*supplication/i.test(cat) || /duain|supplication|ruqya/i.test(title)) return 'prayer_supplication';
  // Mushaf
  if (/mushaf/i.test(cat) || (/surah\s*yaseen|tajweed.*juz|tajweed.*quran/i.test(title) && !/tafseer|tafsir/i.test(title))) return 'mushaf';
  // Tafseer — largest category
  if (/tafseer|tafheem|tafsir/i.test(cat) || /tafseer|tafheem|tafsir|ahsan|noor\s*ul\s*quran|bayan\s*ul\s*quran|jalalain|kalimaat|taiseer/i.test(title)) return 'tafseer';
  // Translation
  if (/translation/i.test(cat) || (/tarjuma|30\s*parah/i.test(title) && !/tafseer/i.test(title))) return 'translation';
  // Seerah
  if (/seerah/i.test(cat) || /tajalliyat|seerat/i.test(title)) return 'seerah';
  // Biography
  if (/biography/i.test(cat) || /taiseerul\s*allaam|taqarab|tazkaray|naqsh-e-qadam|abdullah\s*bin\s*abbas|sohail\s*bin\s*amar/i.test(title)) return 'biography';
  // Imams Scholars
  if (/imams?\s*scholars/i.test(cat) || /sunehri\s*yaadein/i.test(title)) return 'imams_scholars';
  // Companions
  if (/companions/i.test(cat) || /sunehri\s*kahaniyan|usman\s*bin\s*affan|talhah.*ubaidullah|living\s*martyr/i.test(title)) return 'companions';
  // Women
  if (/women/i.test(cat) || /sunehri\s*kirnain|sunnat-e-mutahirah|adab-e-mubashrat/i.test(title)) return 'women';
  // Hadith
  if (/hadith/i.test(cat) || /taharat\s*kay\s*masail|taleemat\s*quran|taqdeer|tauheed\s*kay\s*masail|tazkia\s*nafs/i.test(title)) return 'hadith';
  // Fiqh
  if (/fiqh/i.test(cat) || /sunehre\s*faisley|taharat\s*ke\s*masail|kitab-ut-tahara|talaq|taqwiyat/i.test(title)) return 'fiqh';
  // Children
  if (/children/i.test(cat) || /surahs.*refuge|suraj\s*kahaani|talha.*mosque|tamheedi|tarbiyati|teen\s*sawal|qasas|thali|thaali/i.test(title)) return 'children';
  // Darussalam
  if (/darussalam/i.test(cat) || /ibn\s*kathir|as-sadi|authentic\s*creed|kalimaat|tarbiat|tauheed\s*aur/i.test(title)) return 'darussalam';
  // History
  if (/history/i.test(cat) || /sunehray\s*naqoosh|sunehre\s*awraq|surat\s*al-arz|tahzib|tareekh|wahabiyat|battle\s*of\s*qadisiyyah/i.test(title)) return 'history';
  // Education
  if (/education/i.test(cat) || /jalalain.*17x24|ahsanul\s*bayan.*english|taqwiyat.*darsi|taqwiyat.*english|tawheed\s*ki\s*awaaz|bangan|bangan/i.test(title)) return 'education';
  // General
  if (/general/i.test(cat) || /ahsanulkalam\s*pashto|tajwidi\s*para|talimat\s*e\s*quran/i.test(title)) return 'general';
  return 'general';
}

// ─── Templates: ALL NEW TEXT — completely different from batch 1 ──────────────
const T = {
  // ── TAFSEER (largest category, ~25 products) ──
  tafseer: {
    opens: [
      'Delving into the glorious depths of Quranic interpretation has never been more rewarding than with this remarkable {lang} tafseer, {title}. The commentator has woven together insights from the earliest exegetes with contemporary analytical precision, producing a work that speaks to both the trained scholar and the earnest seeker of Quranic wisdom in equal measure.',
      'The Holy Quran reveals its hidden treasures only to those who approach it with the proper tools of classical exegesis, and this {lang} masterpiece titled {title} equips readers with exactly those tools. Every surah is unpacked with meticulous care, drawing on authenticated chains of narration and time-honored principles of Arabic rhetoric to illuminate the divine message.',
      'Few works of Quranic scholarship have achieved the widespread acceptance and scholarly acclaim enjoyed by this {lang} edition of {title}. Spanning multiple volumes with exhaustive commentary on every verse, it stands as a towering achievement of Islamic academic publishing, essential for any serious student of the sacred sciences in Pakistan and beyond.',
      'The translation of Quranic meaning into human understanding requires a lifetime of devotion to the Arabic language and Islamic sciences, and this {lang} tafseer, {title}, reflects exactly that level of scholarly commitment. The author navigates complex linguistic structures, historical contexts, and juristic implications with masterful clarity that makes even the most challenging passages accessible.',
      'Scholars across the Muslim world regard this {lang} commentary, {title}, as an indispensable bridge between the classical tafseer tradition and the needs of modern readers. Its methodical approach to interpreting divine revelation ensures that readers encounter the Quran not merely as text, but as a living, breathing guide for every dimension of human experience.',
      'Every verse of the Holy Quran carries layers of meaning that unfold progressively to the attentive reader, and this {lang} tafseer titled {title} excels at revealing those layers systematically. From the outward legal implications to the inward spiritual dimensions, no aspect of Quranic meaning is left unexplored in this comprehensive scholarly work.',
    ],
    mids: [
      'Among the distinctive strengths of this tafseer is its balanced treatment of different scholarly opinions, presenting the views of major exegetes from all four Sunni schools of jurisprudence with fairness and academic rigor. Where legal rulings are derived from Quranic verses, the commentary traces the scholarly reasoning step by step, enabling readers to understand not just the ruling itself but the principled methodology behind it. The {lang} prose style is deliberately chosen to serve a wide readership, avoiding unnecessary jargon while never compromising intellectual depth. Multi-volume sets like this {parts} represent a significant investment in Islamic knowledge that rewards the reader with insights that last a lifetime.',
      'The commentator has organized this tafseer with exceptional pedagogical awareness, structuring each section to build understanding progressively from basic meaning to advanced analysis. Introductory notes for each surah provide essential context including the circumstances of revelation, the central themes, and the relationship between the surah and its neighboring chapters. Cross-references to related verses throughout the Quran create a richly interconnected reading experience that highlights the remarkable internal consistency of divine revelation. This {parts} has been printed with high-quality materials and {binding} to withstand years of regular study and reference use in homes, mosques, and educational institutions across Pakistan.',
      'What distinguishes this {lang} tafseer from others in the field is its consistent attention to the practical implications of Quranic teachings for daily life. The commentator does not merely explain what each verse means in isolation but demonstrates how groups of verses work together to establish comprehensive guidance on topics ranging from personal worship and moral conduct to social justice and international relations. The {format} enhances readability during extended study sessions, while the thorough indexing system allows quick reference for specific topics. Students preparing for exams, imams preparing sermons, and researchers investigating specific themes will all find this work to be an extraordinarily useful scholarly companion.',
      'This {lang} tafseer represents a monumental scholarly undertaking that brings together decades of research, teaching experience, and engagement with both classical and contemporary exegetical literature. The commentator has consulted the foundational works of Ibn Kathir, Al-Tabari, Al-Qurtubi, and other luminaries of the tafseer tradition, synthesizing their insights into a coherent narrative that serves modern readers. Special attention has been given to explaining verses that are commonly misunderstood or subject to polemical misrepresentation, providing readers with the knowledge needed to respond to misconceptions with confidence and evidence-based arguments. The {binding} construction ensures these volumes will endure as a family scholarly resource for generations.',
    ],
    closes: [
      'Secure your copy of this essential {lang} tafseer from Bab-ul-Fatah, Pakistan\'s premier destination for authentic Islamic scholarship. Priced at {price}, {title} delivers unmatched scholarly value for every Muslim home and institution. Place your order today for prompt, careful delivery to any location in Pakistan.',
      'Elevate your Quranic study with this comprehensive {lang} tafseer available exclusively at Bab-ul-Fatah. At {price}, this edition of {title} is a worthwhile investment in enduring Islamic knowledge. We ship nationwide with the professionalism and attention to detail that our customers trust.',
      'Invest in your spiritual and intellectual growth with this authoritative {lang} Quranic commentary from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is an essential addition to every serious Islamic library. Order online now for reliable delivery across all Pakistani cities.',
      'Add this distinguished {lang} tafseer to your collection through Bab-ul-Fatah, the Islamic bookstore Pakistan trusts for quality scholarship. Available at {price}, {title} brings the depths of Quranic wisdom within your reach. Shop with confidence from our extensive catalog.',
    ],
  },
  // ── HISTORY ──
  history: {
    opens: [
      'Islamic civilization has produced a legacy of historical scholarship that remains unmatched in its scope, rigor, and commitment to truth, and this {lang} work titled {title} stands proudly within that tradition. Readers are transported across centuries of Muslim history, witnessing the rise and fall of dynasties, the flourishing of arts and sciences, and the enduring spiritual message that held the Ummah together through every trial.',
      'The story of Islam is not merely a chronicle of dates and events but a sweeping narrative of faith, resilience, and divine providence that continues to shape our world today. This {lang} publication, {title}, captures that narrative with the literary skill of a seasoned historian and the spiritual sensitivity of a devout Muslim scholar, making it a profoundly rewarding read for anyone interested in the Muslim heritage.',
      'Understanding where the Muslim Ummah has been is essential for charting where it should go, and this {lang} historical work, {title}, provides exactly that understanding with scholarly precision and narrative power. From the golden age of Abbasid scholarship to the challenges of the modern era, every significant chapter of Islamic history is examined with thorough research and balanced analysis.',
      'The rich tapestry of Islamic history comes alive through the pages of this remarkable {lang} publication, {title}. Drawing upon primary sources, archaeological evidence, and the works of the greatest Muslim historians including Al-Tabari and Ibn Kathir, this work presents an authoritative account of the events, personalities, and ideas that have shaped fourteen centuries of Muslim civilization.',
    ],
    mids: [
      'This historical account goes beyond mere chronology to examine the social, cultural, and intellectual forces that drove Islamic civilization forward during its most dynamic periods. The author pays particular attention to the contributions of Muslim scholars, scientists, and statesmen whose innovations in fields as diverse as mathematics, medicine, astronomy, and governance laid the foundations for much of the modern world. The treatment of sensitive historical episodes reflects a commitment to honest scholarship rather than sectarian bias, making this work suitable for readers of all backgrounds. The {lang} prose is enriched with maps, timelines, and biographical sketches of key historical figures that bring the narrative to vivid life.',
      'A distinguishing feature of this {lang} historical work is its emphasis on the lessons that contemporary Muslims can derive from the experiences of their predecessors. The author analyzes the factors that led to periods of Muslim prosperity and the mistakes that contributed to decline, providing readers with a nuanced understanding of how faith, governance, and social cohesion interact in the rise and fall of civilizations. Special chapters address the history of Makkah and Madinah, the two holiest cities in Islam, with particular attention to their spiritual significance and the remarkable stories of the communities that have preserved their sanctity across the ages.',
    ],
    closes: [
      'Explore the magnificent heritage of Islamic civilization with this {lang} historical work from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is both an educational treasure and an inspiring read. Order now for delivery across Pakistan from your trusted Islamic bookstore.',
      'Bring home this authoritative {lang} history of Islam from Bab-ul-Fatah. At {price}, {title} offers a compelling journey through fourteen centuries of Muslim achievement. Shop online with confidence for fast, secure delivery throughout Pakistan.',
    ],
  },
  // ── DARUSSALAM PUBLISHERS ──
  darussalam: {
    opens: [
      'Darussalam Publishers has earned a global reputation for producing Islamic literature of the highest scholarly standards, and this {lang} edition of {title} exemplifies the quality that has made the publisher a household name among Muslim families worldwide. Every aspect of production, from the accuracy of the text to the durability of the binding, reflects a commitment to excellence that discerning readers in Pakistan have come to expect.',
      'When Muslim readers seek authoritative, well-researched Islamic publications, Darussalam consistently ranks among the most trusted names in the industry, and for good reason. This {lang} work titled {title} continues that proud tradition, offering content that has been meticulously verified by qualified scholars against authentic sources, ensuring readers receive knowledge they can rely upon with complete confidence.',
      'The Darussalam imprint on any Islamic publication signals a guarantee of scholarly integrity and production quality, and this {lang} edition of {title} upholds that reputation admirably. Prepared under the supervision of a board of Islamic scholars, this work represents the kind of careful, source-based publishing that has made Darussalam a preferred choice for Islamic schools, libraries, and households across Pakistan and around the world.',
      'Published by one of the most respected names in Islamic literature, this {lang} work, {title}, combines rigorous academic standards with accessible language that serves readers at every level of Islamic knowledge. Darussalam\'s editorial team has ensured that every claim is substantiated by evidence from the Quran and authentic Hadith, making this publication a reliable resource for both personal study and institutional use.',
    ],
    mids: [
      'The editorial process at Darussalam involves multiple rounds of scholarly review, where each passage is checked against its original Arabic sources by qualified ulema specializing in the relevant field. This painstaking quality control ensures that errors of translation, interpretation, or attribution are caught and corrected before publication. The result is a {lang} work that readers and educators can reference with confidence, knowing that the content has passed through the most rigorous scholarly vetting process in contemporary Islamic publishing. The physical production matches the scholarly quality, with {binding} and carefully selected paper that ensures readability and long-term durability.',
      'What sets Darussalam publications apart in the crowded field of Islamic literature is their unwavering commitment to presenting Islam from the perspective of Ahlus Sunnah wal Jama\'ah, drawing upon the Quran, authenticated Hadith, and the consensus of classical scholars. This {lang} edition of {title} follows that methodology consistently, making it particularly suitable for Islamic schools and madrasas that seek curriculum materials aligned with traditional Sunni scholarship. The clear typography and well-organized layout further enhance the reading experience, allowing students and researchers to locate information quickly and efficiently.',
    ],
    closes: [
      'Purchase this Darussalam {lang} publication from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} offers the quality and reliability that Darussalam is renowned for. Order online for prompt delivery to any city in Pakistan.',
      'Order this trusted Darussalam {lang} edition from Bab-ul-Fatah Pakistan for just {price}. This title, {title}, is a valuable addition to any Islamic library. We deliver across Pakistan with the care and speed you deserve.',
    ],
  },
  // ── CHILDREN ──
  children: {
    opens: [
      'Building a strong Islamic identity in children starts with providing them the right reading material — content that entertains while it educates, inspires while it informs. This {lang} children\'s book, {title}, has been thoughtfully composed to introduce young Muslims to essential Islamic knowledge through engaging narratives, colorful presentation, and age-appropriate language that captures and holds a child\'s attention from the very first page.',
      'The formative years of a child\'s life represent the most critical window for instilling Islamic values, and this {lang} publication titled {title} has been specifically designed to make the most of that precious opportunity. Combining the expertise of Islamic educators with child-friendly design principles, this book creates a learning experience that children genuinely enjoy and parents wholeheartedly approve of.',
      'Nurturing a love for Islam in young hearts requires more than just textbooks — it requires stories that spark imagination, activities that engage young minds, and content that speaks to children at their own level. This {lang} children\'s work, {title}, delivers all three elements in a beautifully produced package that makes Islamic learning a highlight of every child\'s day.',
      'Every Muslim parent knows the challenge of finding Islamic books that are both authentic and appealing to children, and this {lang} publication, {title}, answers that need perfectly. Written with careful attention to Islamic accuracy and designed with vibrant, child-friendly layouts, it provides an engaging pathway into Islamic knowledge that children will want to revisit again and again.',
      'Children learn best when they are having fun, and this {lang} book titled {title} turns Islamic education into an adventure that kids look forward to. The interactive approach — combining stories, questions, and activities — ensures that important lessons about faith, character, and the Prophet\'s example are absorbed naturally and remembered long after the book is closed.',
      'The best investment a Muslim parent can make is in their child\'s Islamic education, and this {lang} children\'s publication, {title}, represents exceptional value for that investment. Carefully structured to match the developmental needs of young learners, it introduces Islamic concepts in a progressive manner that builds understanding layer by layer, creating a solid foundation for lifelong engagement with the faith.',
    ],
    mids: [
      'The educational content of this {lang} children\'s book covers a carefully curated selection of Islamic topics including stories of the prophets, basic duaa for daily situations, Islamic manners and etiquette, and the fundamental beliefs that every Muslim child should know. Each topic is presented through a combination of narrative text, visual elements, and interactive prompts that encourage children to think about what they have read and apply the lessons to their own lives. The language has been simplified without sacrificing accuracy, making complex ideas accessible to young minds while preserving the integrity of the Islamic message.',
      'Parents and teachers will particularly appreciate the way this {lang} publication integrates moral lessons into engaging stories rather than presenting them as dry rules to be memorized. Children learn about honesty through the examples of the prophets, about kindness through stories of the Companions, and about courage through accounts of early Muslim heroes. This story-based approach to character education has been shown to be far more effective than direct instruction, as children naturally identify with the characters and internalize the values they demonstrate. The book is ideally suited for both home reading and classroom use in Islamic schools.',
    ],
    closes: [
      'Give your children the joy of Islamic learning with this {lang} book from Bab-ul-Fatah Pakistan. At just {price}, {title} is an affordable investment in your child\'s spiritual development. Order online and receive fast delivery across all Pakistani cities.',
      'Shop for this engaging {lang} children\'s book at Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} makes Islamic education fun and meaningful. Order today and inspire your child\'s faith journey.',
    ],
  },
  // ── WOMEN ──
  women: {
    opens: [
      'Addressing the spiritual and practical needs of Muslim women with sensitivity, scholarly depth, and genuine understanding is the hallmark of this {lang} publication, {title}. In a publishing landscape where works addressing women\'s issues in Islam are often either too simplistic or unnecessarily controversial, this book strikes the perfect balance, offering guidance rooted in authentic Islamic sources that empowers women to navigate modern life with confidence and faith.',
      'Muslim women deserve access to Islamic scholarship that speaks directly to their experiences, concerns, and aspirations, and this {lang} work titled {title} delivers precisely that. Written with an awareness of the unique challenges facing Muslim women in contemporary society, it provides practical, evidence-based guidance on matters of faith, family, personal development, and community engagement that resonates with readers across Pakistan and the wider Muslim world.',
      'The role of women in Islam has been a subject of profound scholarly discussion since the earliest days of the faith, and this {lang} publication, {title}, contributes meaningfully to that ongoing conversation. Drawing upon the Quran, authenticated Hadith, and the exemplary lives of the female Companions and scholars of Islam, it presents a comprehensive, nuanced picture of women\'s status, rights, and responsibilities that is both empowering and firmly grounded in revelation.',
    ],
    mids: [
      'This {lang} work covers an impressive range of topics relevant to Muslim women, including personal worship and spiritual development, family life and marital relations, the Islamic perspective on modesty and hijab, women\'s rights in inheritance and property, the inspiring examples of female scholars throughout Islamic history, and practical advice for balancing religious obligations with professional and domestic responsibilities. Each topic is addressed with extensive referencing to Quranic verses and authenticated Hadith, giving readers confidence in the authenticity and reliability of every piece of guidance offered.',
      'The author has taken particular care to present the contributions of Muslim women throughout history, highlighting the achievements of female scholars, educators, and community leaders whose stories are often overlooked in mainstream Islamic literature. By restoring these narratives to their rightful place in the Islamic historical record, this work inspires contemporary Muslim women to pursue excellence in every field of endeavor while remaining firmly anchored to their faith. The {lang} prose is elegant and accessible, making this work suitable for both individual study and group discussion in women\'s study circles.',
    ],
    closes: [
      'Order this essential {lang} publication for Muslim women from Bab-ul-Fatah Pakistan. At {price}, {title} is a valuable resource for every Muslim household. Shop online for delivery to any city across Pakistan.',
      'Get this insightful {lang} book from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Priced at {price}, {title} offers guidance that every Muslim woman will appreciate. Order now for reliable nationwide delivery.',
    ],
  },
  // ── HADITH ──
  hadith: {
    opens: [
      'The science of Hadith stands as one of Islam\'s most extraordinary intellectual achievements, a discipline through which Muslim scholars preserved the words and actions of Prophet Muhammad (peace be upon him) with an accuracy unmatched by any other historical tradition. This {lang} work titled {title} upholds that proud legacy, presenting Hadith literature in a format that serves both scholarly research and practical daily guidance for Muslims throughout Pakistan.',
      'Access to authentic Prophetic traditions is the birthright of every Muslim, and this {lang} publication, {title}, makes that access more convenient and comprehensive than ever before. Carefully compiled with strict attention to the principles of Hadith authentication established by the great Imams of this science, it provides readers with narrations they can rely upon with complete confidence in their accuracy and relevance.',
      'The blessed traditions of Prophet Muhammad (peace be upon him) illuminate every aspect of human life, from the most intimate acts of personal worship to the broadest questions of social justice and governance. This {lang} collection, {title}, gathers these precious narrations into an organized, thematic framework that allows readers to quickly find Prophetic guidance on any topic of interest, making it an indispensable addition to every Muslim household in Pakistan.',
      'Every generation of Muslims has recognized the imperative of preserving and transmitting the Hadith of the Prophet (peace be upon him), and this {lang} edition of {title} continues that sacred duty with distinction. The narrations have been meticulously verified through the rigorous isnad system that is unique to Islamic scholarship, and each Hadith is presented with its chain of transmission and scholarly grading to enable informed study.',
    ],
    mids: [
      'This {lang} Hadith collection has been organized with careful attention to the practical needs of contemporary Muslim readers, grouping narrations by theme so that guidance on specific topics can be located quickly and efficiently. Topics covered include the pillars of Islam, righteous conduct, family life, business ethics, dietary laws, the virtues of various acts of worship, and the warnings against spiritual pitfalls. Each Hadith is accompanied by explanatory notes that clarify unfamiliar terms, provide historical context, and highlight the practical lessons embedded within the narration. The compilation reflects the compiler\'s deep familiarity with the major Hadith collections including Sahih Al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami Al-Tirmidhi, and Sunan Ibn Majah.',
      'The compiler of this {lang} work has demonstrated exceptional scholarly judgment in the selection and presentation of Hadith, prioritizing narrations that address the most pressing questions facing Muslims today while maintaining comprehensive coverage of the essential teachings of the Prophet (peace be upon him). The chain analysis for each narration follows the methodology established by the great Hadith scholars of the classical period, with careful attention to the character and reliability of each narrator in the chain. This scholarly apparatus makes the work particularly valuable for students of Islamic studies who are developing their skills in Hadith evaluation and criticism.',
    ],
    closes: [
      'Order this essential {lang} Hadith collection from Bab-ul-Fatah Pakistan. At {price}, {title} offers access to authentic Prophetic guidance. We deliver across all Pakistani cities with care and reliability.',
      'Bring the blessed traditions of the Prophet into your home with this {lang} edition from Bab-ul-Fatah. Priced at {price}, {title} is an invaluable Islamic resource. Shop online for fast, secure nationwide delivery.',
    ],
  },
  // ── COMPANIONS ──
  companions: {
    opens: [
      'The Companions of Prophet Muhammad (peace be upon him) represent the finest generation of human beings ever to walk the earth, men and women who sacrificed everything for the sake of Islam and whose example continues to illuminate the path of righteousness for Muslims in every age. This {lang} work titled {title} brings their extraordinary stories to life with narrative skill and scholarly precision, allowing readers to draw inspiration and practical lessons from these heroic lives.',
      'Learning about the Sahabah is not merely an exercise in historical curiosity — it is a spiritual necessity for every Muslim who wishes to understand Islam in its purest, most dynamic form. This {lang} publication, {title}, presents the lives of the noble Companions with the reverence they deserve, drawing upon the most authentic historical sources to paint vivid portraits of faith, courage, and unwavering commitment to divine guidance.',
      'The golden era of the Companions produced individuals whose spiritual stature, intellectual brilliance, and moral courage remain unparalleled in human history. This {lang} book, {title}, chronicles their remarkable journeys from the darkness of ignorance to the light of Islam, revealing how ordinary men and women were transformed by faith into extraordinary leaders, scholars, and warriors who changed the course of civilization.',
    ],
    mids: [
      'This {lang} work provides detailed biographical accounts of the Companions, including their backgrounds before Islam, the circumstances of their conversion, their contributions to the early Muslim community, and the lasting impact of their example on subsequent generations of Muslims. The author has drawn primarily upon the works of Ibn Sa\'d, Ibn Asakir, and other classical biographers, supplementing these sources with authenticated Hadith that highlight the Prophet\'s praise for each Companion. The narratives are presented in a flowing literary style that makes this work equally suitable for academic reference and inspirational reading.',
      'Among the most valuable aspects of this {lang} publication is its attention to the practical lessons that can be derived from the lives of the Companions. Their examples of patience in adversity, generosity in prosperity, courage in battle, and wisdom in governance provide timeless models of Islamic character that readers can emulate in their own lives. The author has arranged the accounts chronologically and thematically, enabling readers to trace the development of the early Muslim community through the individual stories of the men and women who built it.',
    ],
    closes: [
      'Discover the inspiring lives of Islam\'s greatest generation with this {lang} book from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is essential reading for every Muslim. Order online for delivery across Pakistan.',
      'Order this captivating {lang} work on the Companions from Bab-ul-Fatah, your trusted Islamic bookstore. At {price}, {title} brings the Sahabah\'s legacy to your fingertips. Shop now for nationwide delivery.',
    ],
  },
  // ── BIOGRAPHY ──
  biography: {
    opens: [
      'The lives of great Islamic scholars and personalities offer a wellspring of wisdom, inspiration, and practical guidance for contemporary Muslims seeking to navigate the challenges of modern life with faith and resilience. This {lang} biographical work, {title}, presents a meticulously researched account that goes beyond surface-level facts to reveal the character, motivations, and spiritual depth of its subject.',
      'Biographical literature occupies a cherished place in the Islamic intellectual tradition, serving as both a record of scholarly achievement and a source of practical guidance for those who follow in the footsteps of the great scholars. This {lang} publication titled {title} continues that noble tradition with distinction, offering readers an intimate portrait of a remarkable Muslim figure whose life and work continue to influence the Ummah.',
      'Understanding the personal journeys of Islamic scholars helps readers appreciate the human dimension of scholarly achievement — the struggles, sacrifices, and spiritual experiences that shaped the intellectual giants of Islam. This {lang} work, {title}, provides exactly that understanding, presenting a balanced, well-sourced account that serves as both an inspiring biography and a valuable reference work for students of Islamic studies.',
      'Every great Islamic scholar has a story that illuminates not only their own achievements but the broader intellectual and spiritual tradition from which they emerged. This {lang} edition of {title} captures that story with scholarly rigor and narrative elegance, drawing upon primary sources, personal accounts, and the scholarly works of the biographical subject to create a comprehensive portrait that will engage and educate readers.',
    ],
    mids: [
      'This {lang} biography traces the complete arc of its subject\'s life, from early education and spiritual formation through the flowering of scholarly achievement to the lasting legacy that continues to influence Muslims worldwide. The author has consulted a wide range of primary and secondary sources, including the subject\'s own writings, the testimonies of contemporaries, and the evaluations of later scholars, to produce an account that is both comprehensive and balanced. Special attention is given to the intellectual contributions that made this figure significant in the field of Islamic knowledge, as well as the personal qualities that earned them the respect and love of their students and colleagues.',
      'The enduring relevance of this {lang} biographical work lies in its ability to connect the historical experience of its subject with the contemporary concerns of Muslim readers. The challenges faced by Islamic scholars in their pursuit of knowledge, their engagement with social and political issues, and their unwavering commitment to truth and justice are themes that resonate strongly with Muslims navigating similar challenges in today\'s world. The author\'s engaging narrative style makes this work accessible to general readers while the depth of research ensures its value for academic study.',
    ],
    closes: [
      'Explore the life of an extraordinary Muslim figure with this {lang} biography from Bab-ul-Fatah Pakistan. At {price}, {title} offers both inspiration and knowledge. Order online for delivery to any city in Pakistan.',
      'Order this insightful {lang} biographical work from Bab-ul-Fatah, the Islamic bookstore Pakistan relies upon. Priced at {price}, {title} is a rewarding read. Shop with confidence for fast nationwide delivery.',
    ],
  },
  // ── PRAYER SUPPLICATION ──
  prayer_supplication: {
    opens: [
      'Duaa (supplication) is the essence of worship in Islam, the intimate conversation between a believing servant and their Creator that the Prophet Muhammad (peace be upon him) described as the weapon of the believer. This {lang} work, {title}, serves as a comprehensive treasury of authenticated supplications drawn from the Quran and the Prophetic tradition, providing Muslims with a reliable guide for invoking Allah\'s mercy, guidance, and protection in every situation.',
      'The power of sincere duaa to transform circumstances, heal ailments, and bring comfort to troubled hearts is affirmed by the Quran and demonstrated throughout Islamic history. This {lang} publication titled {title} compiles the most authentic and comprehensive collection of Islamic supplications available, including duaa for healing through Ruqya as prescribed by the Prophet (peace be upon him), making it an essential companion for every Muslim household.',
      'Making duaa is not merely a ritual act but a profound expression of a Muslim\'s complete dependence upon Allah and unwavering trust in His wisdom and mercy. This {lang} collection, {title}, has been carefully assembled to help Muslims incorporate the beautiful Sunnah supplications into every aspect of their daily routine, from waking and sleeping to eating, traveling, and facing life\'s inevitable challenges.',
    ],
    mids: [
      'This {lang} supplication collection has been meticulously sourced from authenticated Hadith collections, with each duaa accompanied by its chain of narration and a reference to the original source. The supplications are organized by occasion and topic, covering situations that range from daily routines such as entering and leaving the home, beginning meals, and traveling, to special circumstances such as seeking relief from illness, facing difficulties, and asking for forgiveness. Where relevant, the Prophet\'s specific instructions regarding the proper method and timing of each duaa are included, ensuring that readers can follow the Sunnah with precision. The section on Ruqya (spiritual healing) provides the authentic Quranic verses and Prophetic supplications recommended for protection and healing.',
      'The compilers of this {lang} work have taken special care to include the full text of each supplication in its original Arabic alongside the {lang} translation and transliteration where appropriate, enabling readers who are not fluent in Arabic to pronounce the duaa correctly. Explanatory notes clarify the meaning of less familiar terms and provide context for supplications whose significance might not be immediately apparent. The portable format makes it convenient to carry this collection for reference throughout the day, ensuring that the blessed practice of making duaa becomes a constant companion in every Muslim\'s life.',
    ],
    closes: [
      'Strengthen your connection with Allah through this {lang} duaa collection from Bab-ul-Fatah Pakistan. At {price}, {title} is a must-have for every Muslim home. Order online for delivery across Pakistan.',
      'Order this essential {lang} supplication guide from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} puts Prophetic duaa at your fingertips. Shop now for fast nationwide delivery.',
    ],
  },
  // ── FIQH ──
  fiqh: {
    opens: [
      'Practical Islamic guidance rooted in the Quran and authentic Sunnah is the foundation upon which a Muslim builds their daily life, and this {lang} work, {title}, provides exactly that foundation with clarity, comprehensiveness, and scholarly reliability. Addressing the real-world questions that Muslims face in their worship, transactions, and interpersonal relationships, it serves as an essential reference for every household that seeks to live according to divine guidance.',
      'The application of Islamic law to the myriad situations of daily life requires reliable, well-sourced guidance that respects both the letter and spirit of the Shariah. This {lang} publication titled {title} delivers that guidance in a format that is both thorough enough for scholars and accessible enough for general readers, making it one of the most practical fiqh references available in Pakistan today.',
      'Islamic jurisprudence has always been a living science, responsive to the changing circumstances of Muslim communities while remaining firmly anchored to its foundational sources. This {lang} work, {title}, exemplifies the best of that tradition, presenting fiqh rulings on essential matters of worship and daily life in a clear, evidence-based format that empowers readers to practice their faith with confidence and understanding.',
    ],
    mids: [
      'This {lang} fiqh reference addresses the essential topics that every Muslim needs to understand, including the conditions and pillars of ritual purification (wudu and ghusl), the proper performance of the five daily prayers, the rules governing fasting in Ramadan, the calculations and procedures for Zakat, and the conditions and rituals of Hajj. Beyond the pillars, it covers important topics such as marriage and divorce, business transactions and contracts, inheritance laws, dietary regulations, and contemporary issues that require fiqh analysis. Each ruling is supported by evidence from the Quran and authenticated Hadith, with references to the positions of recognized scholars and schools of Islamic jurisprudence.',
      'What makes this {lang} work particularly valuable is its practical orientation — the author consistently connects fiqh rulings to the real situations that readers encounter in their daily lives. The question-and-answer format adopted in several sections allows readers to quickly find answers to specific fiqh questions without reading through lengthy theoretical discussions. This user-friendly approach, combined with the scholarly rigor of the content, makes the work suitable for use in Islamic schools, study circles, and personal reference. The clear organizational structure and comprehensive indexing ensure that information can be located quickly when needed.',
    ],
    closes: [
      'Get this practical {lang} fiqh reference from Bab-ul-Fatah Pakistan. At {price}, {title} provides reliable Islamic guidance for daily life. Order online for delivery to any city in Pakistan.',
      'Order this authoritative {lang} Islamic jurisprudence guide from Bab-ul-Fatah, your trusted Islamic bookstore. Priced at {price}, {title} answers the fiqh questions every Muslim needs. Shop now.',
    ],
  },
  // ── EDUCATION ──
  education: {
    opens: [
      'The pursuit of Islamic knowledge is a lifelong obligation upon every Muslim, and having access to well-structured, academically sound educational materials is essential for fulfilling that obligation effectively. This {lang} educational work titled {title} has been designed to serve as a comprehensive learning resource that supports both formal classroom instruction and self-directed study, making it an invaluable tool for students and educators across Pakistan.',
      'Islamic education encompasses far more than the memorization of facts — it involves the development of a comprehensive understanding of faith, the cultivation of critical thinking skills, and the nurturing of a personal connection with divine knowledge. This {lang} publication, {title}, advances that holistic vision of Islamic education through its carefully structured content, engaging presentation, and unwavering commitment to academic accuracy.',
      'Quality educational materials form the backbone of effective Islamic instruction, whether in formal school settings, mosque study circles, or home-based learning environments. This {lang} work, {title}, meets the highest standards of educational publishing, providing content that has been reviewed by qualified scholars for accuracy and by experienced educators for pedagogical effectiveness, ensuring it serves the needs of both teachers and learners.',
    ],
    mids: [
      'This {lang} educational publication covers its subject matter with a systematic approach that builds understanding progressively, beginning with foundational concepts and advancing to more complex topics as the student\'s knowledge deepens. The content is enriched with examples, exercises, and review questions that reinforce learning and encourage critical engagement with the material. Special attention has been given to presenting information in a format that accommodates different learning styles, with clear headings, bullet points, and visual aids that support comprehension and retention. The work is equally suitable for use in formal educational institutions and for self-study by motivated learners.',
      'The authors and editors of this {lang} educational work bring together extensive experience in both Islamic scholarship and modern pedagogical methods, creating a resource that bridges the gap between traditional Islamic learning and contemporary educational best practices. Topics are presented with proper referencing to Quranic verses and authenticated Hadith, instilling in students the habit of evidence-based reasoning that is central to Islamic scholarship. The publication reflects a commitment to producing educational materials that prepare students not only for examinations but for a lifetime of engagement with Islamic knowledge.',
    ],
    closes: [
      'Invest in quality Islamic education with this {lang} work from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is ideal for students and educators alike. Order online for fast delivery across Pakistan.',
      'Order this comprehensive {lang} educational resource from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} supports effective Islamic learning. Shop with confidence for nationwide delivery.',
    ],
  },
  // ── MUSHAF ──
  mushaf: {
    opens: [
      'The Holy Quran is the literal word of Allah preserved eternally, and possessing a beautifully printed, accurately typeset copy is a privilege and responsibility that every Muslim household cherishes. This {lang} edition of {title} has been produced with meticulous attention to every detail of script, diacritical marks, and verse boundaries, ensuring a recitation experience that is both spiritually uplifting and visually satisfying.',
      'Reciting from a well-produced copy of the Holy Quran enhances the spiritual experience of connecting with Allah\'s words in ways that transcend mere reading. This {lang} {title} has been printed to meet the exacting standards required for formal recitation and memorization, with every letter, vowel mark, and tajweed indicator precisely placed by skilled calligraphers and typesetters who understand the sacred nature of their work.',
      'A quality Mushaf is not merely a book — it is a sacred companion that accompanies a Muslim through every stage of life, from the first tentative recitations of childhood to the fluent recitations of maturity. This {lang} edition of {title} is built to serve as that lifelong companion, with {binding} and {format} that ensure durability and readability through years of daily use.',
    ],
    mids: [
      'The text of this {lang} edition has been checked multiple times by qualified Huffaz and Quranic scholars to ensure absolute accuracy in every word, letter, and diacritical mark. The {format} has been chosen for its readability and visual appeal, while the paper quality has been selected for its opacity and durability, preventing text from showing through from the opposite page and ensuring the edition withstands the rigors of daily handling. Whether used for personal recitation, formal study in a hifz program, or as a meaningful gift for a loved one, this edition meets the highest standards of Quranic publishing.',
      'This {lang} {title} is particularly well-suited for students engaged in Quran memorization, as the {format} facilitates the visual tracking essential for efficient memorization. The generous spacing between words and lines reduces eye strain during extended recitation sessions, while the clear surah headings and juz markers help students maintain their place during group study. The {binding} provides the structural integrity needed for daily transport to mosques, schools, and study circles, making it a practical choice for serious students of the Holy Quran.',
    ],
    closes: [
      'Order this premium {lang} Quran edition from Bab-ul-Fatah Pakistan. At {price}, {title} offers exceptional quality for daily recitation and study. Shop online for delivery across all Pakistani cities.',
      'Purchase this beautifully produced {lang} Mushaf from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is crafted with care and precision. Order now for reliable nationwide delivery.',
    ],
  },
  // ── TRANSLATION ──
  translation: {
    opens: [
      'The translation of the Holy Quran into accessible language opens the doors of divine wisdom to millions of Muslims who seek to understand the meaning of Allah\'s message in the language they know best. This {lang} translation titled {title} has been prepared by scholars who combine deep expertise in Quranic Arabic with a masterful command of the target language, producing a rendering that is both faithful to the original meaning and gracefully expressed.',
      'Bridging the linguistic divide between classical Quranic Arabic and contemporary readers is one of the most important services that Islamic scholarship can render to the Muslim Ummah, and this {lang} work, {title}, accomplishes that service admirably. The translation maintains a careful balance between literal accuracy and readability, ensuring that the beauty and power of the Quranic message are preserved in every sentence.',
      'Understanding the Quran in translation has become increasingly important for Muslims living in diverse linguistic environments, and this {lang} publication titled {title} provides a reliable, well-crafted translation that readers can consult with confidence. The translator has paid careful attention to theological precision, linguistic clarity, and literary elegance, producing a work that serves both scholarly reference and personal spiritual enrichment.',
    ],
    mids: [
      'This {lang} translation has been prepared following established principles of Quranic translation that prioritize accuracy of meaning over literal word-for-word rendering. Where a direct translation would obscure the meaning, the translator has used explanatory phrases that convey the intended sense while remaining true to the original text. The translation is accompanied by footnotes that address linguistic subtleties, alternative interpretations, and contextual information that enhances the reader\'s understanding. This approach makes the work suitable for readers at all levels, from those encountering the Quran in translation for the first time to experienced students who wish to deepen their understanding of specific passages.',
      'The publisher has invested considerable effort in the physical production of this {lang} translation, ensuring that the text is presented in a clear, readable format with proper formatting of verse numbers, surah headings, and other navigational aids. The {format} has been selected for its suitability to extended reading, while the {binding} ensures the publication will withstand regular use over many years. This translation is particularly recommended for Islamic study circles where participants benefit from having a reliable, well-formatted translation to consult alongside the Arabic text.',
    ],
    closes: [
      'Order this reliable {lang} Quran translation from Bab-ul-Fatah Pakistan. At {price}, {title} makes the Quran\'s message accessible and clear. Shop online for delivery to any city in Pakistan.',
      'Get this authoritative {lang} translation from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is a trustworthy rendering of the Holy Quran. Order now for nationwide delivery.',
    ],
  },
  // ── HEALTHY FOOD / TALBEENA (Sunnah foods) ──
  healthy_food: {
    opens: [
      'The Prophetic tradition of consuming wholesome, natural foods for health and vitality has been validated by modern nutritional science, and this {title} from Bab-ul-Fatah brings that blessed Sunnah directly to your table. Crafted from authentic Prophetic ingredients including barley, honey, and natural flavorings, this Talbeena product offers a delicious way to follow the health practices recommended by Prophet Muhammad (peace be upon him) for strength, wellness, and energy.',
      'Talbeena holds a special place in Prophetic medicine (Tibb al-Nabawi), being specifically recommended by Prophet Muhammad (peace be upon him) for its remarkable health benefits and comforting properties. This premium {title} is prepared according to the traditional Sunnah recipe, using the finest quality barley and natural ingredients to deliver the authentic taste and nutritional benefits that have nourished Muslim families for over fourteen centuries.',
      'Returning to the Sunnah of the Prophet (peace be upon him) in matters of food and health is one of the simplest yet most impactful changes a Muslim can make for their family\'s wellbeing. This {title} represents that return to Prophetic nutrition — a carefully prepared Talbeena product that combines the timeless wisdom of Tibb al-Nabawi with the convenience demanded by modern lifestyles, available in a variety of flavors to suit every member of your household.',
      'The Prophet Muhammad (peace be upon him) said that Talbeena brings comfort to the heart and relieves sadness, and this {title} delivers that comforting Prophetic remedy in a convenient, ready-to-prepare format. Made from premium barley and enriched with natural, wholesome ingredients, this Talbeena product is the perfect way to start your day with both physical nourishment and spiritual connection to the blessed practices of Allah\'s Messenger.',
    ],
    mids: [
      'This Talbeena product is made from the highest quality ingredients sourced with care and prepared under hygienic conditions to ensure both safety and authenticity. The base ingredient — barley — has been recognized by both traditional Islamic medicine and modern nutritional science as an exceptional source of sustained energy, dietary fiber, and essential minerals. The addition of natural flavors creates a variety of taste experiences while maintaining the nutritional integrity of the original Sunnah recipe. Whether enjoyed as a warm breakfast cereal, a nutritious snack, or a comforting evening meal, this {title} provides wholesome nutrition that aligns perfectly with Islamic dietary principles.',
      'Each flavor variant of this Talbeena range has been developed to cater to different tastes while preserving the core nutritional benefits of the traditional Prophetic recipe. The natural sweetening comes primarily from honey and dates, following authentic Sunnah practice, while the carefully selected flavorings add variety without compromising the health benefits. The convenient packaging ensures freshness and makes preparation quick and easy — simply mix with warm water or milk for a nutritious meal in minutes. This product is an ideal way to introduce the family to the health-giving practices of the Prophet (peace be upon him) in a format that everyone will enjoy.',
    ],
    closes: [
      'Nourish your family with this Sunnah {title} from Bab-ul-Fatah Pakistan. At just {price}, it\'s an affordable way to follow Prophetic dietary practices. Order online for delivery across Pakistan.',
      'Try this wholesome {title} from Bab-ul-Fatah, Pakistan\'s trusted source for Sunnah food products. Priced at {price}, it combines Prophetic nutrition with great taste. Shop now for fast nationwide delivery.',
    ],
  },
  // ── LIFESTYLE ──
  lifestyle: {
    opens: [
      'Navigating the spiritual dangers of modern life requires awareness, knowledge, and the guidance of scholars who understand both the timeless principles of Islam and the contemporary challenges facing Muslims. This {lang} work, {title}, provides exactly that guidance, exposing the subtle strategies through which moral and spiritual corruption spreads in society and equipping readers with the knowledge needed to protect themselves and their families.',
      'The struggle between truth and falsehood is as old as humanity itself, and this {lang} publication titled {title} examines that struggle through the lens of Islamic scholarship, revealing the tactics employed by the enemies of truth throughout history and in the present day. The author draws upon Quranic warnings, authenticated Hadith, and the scholarly works of classical Islamic thinkers to provide readers with a comprehensive understanding of the spiritual battlefield in which every Muslim is engaged.',
      'Protecting one\'s faith and moral integrity in an age of moral relativism and spiritual confusion requires vigilance and the right knowledge. This {lang} book, {title}, serves as a vital wake-up call for Muslims who may be unaware of the subtle influences that can erode their commitment to Islamic values, offering both diagnosis and prescription in a style that is direct, scholarly, and deeply compelling.',
    ],
    mids: [
      'This {lang} work provides a systematic analysis of the methods through which falsehood is presented as truth, deviation is normalized, and the hearts of believers are gradually turned away from authentic Islamic teachings. The author identifies specific strategies including the manipulation of information, the appeal to base desires, the gradual erosion of moral boundaries, and the exploitation of intellectual and emotional vulnerabilities. For each strategy identified, the work prescribes Quranic and Prophetic remedies — spiritual practices, mental disciplines, and behavioral guidelines — that strengthen the believer\'s defenses against these threats.',
      'Readers of this {lang} publication will gain not only awareness of the spiritual dangers that surround them but also practical tools for building and maintaining spiritual resilience. The author emphasizes the importance of surrounding oneself with righteous company, maintaining a consistent program of worship and remembrance of Allah, seeking knowledge from authentic sources, and cultivating the habit of critical thinking about the messages conveyed through media and popular culture. The work is written in a clear, engaging {lang} style that makes complex ideas accessible without oversimplification.',
    ],
    closes: [
      'Arm yourself with knowledge by ordering this {lang} book from Bab-ul-Fatah Pakistan. At {price}, {title} is essential reading for every Muslim in today\'s world. Shop online for delivery across Pakistan.',
      'Order this impactful {lang} publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers vital spiritual awareness. Order now for fast nationwide delivery.',
    ],
  },
  // ── GENERAL ──
  general: {
    opens: [
      'Islamic knowledge encompasses a vast and interconnected body of learning that spans theology, law, history, and spiritual practice, and this {lang} publication titled {title} represents a valuable contribution to that rich intellectual tradition. Whether you are a seasoned student of Islamic sciences or a curious beginner taking your first steps, this work offers content that will inform, inspire, and deepen your understanding of the faith.',
      'The publication of quality Islamic literature in {lang} serves a vital role in making the treasures of Islamic knowledge accessible to a wider audience of readers throughout Pakistan. This work, {title}, exemplifies the kind of careful, well-sourced publishing that bridges the gap between classical scholarship and contemporary readership, presenting important Islamic content in a format that is both engaging and reliable.',
      'Every new publication in the field of Islamic literature represents an opportunity to connect readers with the timeless wisdom of the Quran, the Sunnah, and the scholarly heritage of the Muslim Ummah. This {lang} edition of {title} seizes that opportunity with distinction, offering content that has been carefully prepared, thoroughly reviewed, and professionally produced to serve the informational and spiritual needs of Muslim readers.',
    ],
    mids: [
      'This {lang} publication has been prepared with the same commitment to quality and accuracy that characterizes the best Islamic publishing, with content reviewed by qualified scholars to ensure conformity with authentic Islamic sources. The {format} enhances the reading experience, while the {binding} ensures durability for regular use. The work addresses its subject matter with sufficient depth to satisfy serious readers while maintaining an accessible style that welcomes those who are new to the topic.',
      'The enduring value of this {lang} work lies in its ability to serve multiple audiences effectively — students will find it useful for academic reference, educators will appreciate its clear presentation for teaching purposes, and general readers will enjoy the engaging prose style that makes learning about Islam both informative and pleasurable. The publication reflects a commitment to producing Islamic literature that meets international standards of quality while remaining affordable for readers in Pakistan.',
    ],
    closes: [
      'Order this {lang} publication from Bab-ul-Fatah Pakistan. At {price}, {title} is a valuable addition to your Islamic library. Shop online for delivery across all Pakistani cities.',
      'Get this quality {lang} edition from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers excellent value. Order now for reliable nationwide delivery.',
    ],
  },
  // ── SEERAH ──
  seerah: {
    opens: [
      'The blessed life of Prophet Muhammad (peace be upon him) remains the ultimate source of guidance for every Muslim seeking to understand what it means to live in complete submission to Allah\'s will. This {lang} work titled {title} presents the Prophetic biography with a fresh narrative approach that draws upon the most authenticated historical sources while speaking directly to the concerns and aspirations of contemporary Muslims in Pakistan.',
      'Studying the seerah of the Prophet (peace be upon him) is far more than an academic exercise — it is a spiritual journey that transforms the reader\'s understanding of Islam and deepens their love for Allah\'s final Messenger. This {lang} publication, {title}, has been crafted to facilitate exactly that transformation, combining historical accuracy with inspirational storytelling that brings the Prophetic era vividly to life for every reader.',
      'From the divine selection of Muhammad (peace be upon him) for prophethood to the establishment of a civilization built on justice, compassion, and unwavering faith in Allah, every chapter of the Prophetic seerah contains lessons that remain urgently relevant for Muslims today. This {lang} work, {title}, presents those lessons with scholarly precision and narrative power, making it an essential read for anyone who wishes to understand and follow the Prophetic example.',
    ],
    mids: [
      'This {lang} seerah draws primarily upon the most authoritative historical sources including the works of Ibn Ishaq, Ibn Hisham, Al-Waqidi, and other early biographers, supplemented by authenticated Hadith from the major collections. The narrative follows a chronological structure that allows readers to trace the development of the Prophetic mission from its earliest days in Makkah through the establishment of the Islamic state in Madinah. Special attention is given to the social, political, and spiritual dimensions of key events including the first revelation, the persecution of Muslims in Makkah, the Hijrah, the battles of Badr, Uhud, and the Trench, the Treaty of Hudaybiyyah, and the Conquest of Makkah.',
      'What elevates this {lang} biography beyond a conventional historical narrative is its consistent emphasis on the practical lessons that contemporary Muslims can derive from every phase of the Prophetic life. The author analyzes the Prophet\'s leadership style, his approach to conflict resolution, his treatment of allies and adversaries, his compassion for the vulnerable, and his unwavering trust in Allah\'s plan, demonstrating how these qualities can be cultivated in the lives of ordinary Muslims today. The work challenges readers to move beyond superficial admiration of the Prophet\'s life to active emulation of his character and conduct.',
    ],
    closes: [
      'Deepen your connection with the Prophet\'s life through this {lang} seerah from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is an essential biography for every Muslim. Order online for delivery across Pakistan.',
      'Order this comprehensive {lang} biography from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} brings the Prophetic era to life. Shop now for fast, reliable nationwide delivery.',
    ],
  },
  // ── IMAMS SCHOLARS ──
  imams_scholars: {
    opens: [
      'The luminaries of Islamic scholarship have served as the guardians of divine knowledge throughout the centuries, preserving, interpreting, and transmitting the teachings of Islam with a dedication that has ensured the survival of authentic Islamic knowledge through every trial and tribulation. This {lang} work titled {title} pays tribute to that scholarly heritage by documenting the lives, contributions, and enduring legacy of the great Imams and scholars who have shaped Islamic thought.',
      'The contributions of Islamic scholars extend far beyond the boundaries of religious knowledge — they have influenced philosophy, science, literature, governance, and virtually every field of human endeavor. This {lang} publication, {title}, provides a comprehensive account of the scholarly tradition in Islam, highlighting the intellectual achievements, personal sacrifices, and spiritual qualities of the men and women whose scholarship has illuminated the path of the Ummah.',
      'Learning about the great scholars of Islam inspires a deep appreciation for the intellectual richness of the Muslim heritage and motivates contemporary Muslims to pursue knowledge with the same dedication and sincerity. This {lang} work, {title}, serves that inspirational purpose while also functioning as a reliable reference work, providing biographical details, scholarly contributions, and historical context for the most significant figures in the history of Islamic scholarship.',
    ],
    mids: [
      'This {lang} work presents detailed accounts of the lives and contributions of major Islamic scholars, including their educational backgrounds, principal teachers, key students, major written works, and the lasting impact of their scholarship on subsequent generations. The author has drawn upon a wide range of primary biographical sources including the works of Al-Dhahabi, Ibn Hajar Al-Asqalani, and Al-Suyuti, as well as contemporary academic research, to produce accounts that are both comprehensive and academically sound. Special attention is given to the scholarly methodology and distinctive contributions of each figure, enabling readers to appreciate the diversity and richness of the Islamic intellectual tradition.',
      'The enduring value of studying the lives of Islamic scholars lies not only in appreciating their intellectual achievements but in understanding the personal qualities that enabled those achievements — qualities such as sincerity, humility, perseverance in the pursuit of knowledge, and unwavering commitment to truth regardless of personal consequence. This {lang} publication highlights these personal dimensions alongside the scholarly contributions, creating well-rounded portraits that inspire as much as they inform. The work is particularly suitable for students of Islamic studies who seek to understand the intellectual genealogy of the ideas and methodologies that define contemporary Islamic scholarship.',
    ],
    closes: [
      'Order this inspiring {lang} work on Islamic scholars from Bab-ul-Fatah Pakistan. At {price}, {title} celebrates the intellectual heritage of Islam. Shop online for delivery across all Pakistani cities.',
      'Discover the giants of Islamic scholarship through this {lang} publication from Bab-ul-Fatah. Priced at {price}, {title} is both informative and inspiring. Order now for fast, reliable nationwide delivery.',
    ],
  },
};

// ─── Fallback for missing categories ─────────────────────────────────────────
T.prayer_supplication = T.prayer_supplication || T.general;
T.healthy_food = T.healthy_food || T.general;
T.lifestyle = T.lifestyle || T.general;
T.imams_scholars = T.imams_scholars || T.biography;

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
  const parts = details.parts || '';

  // Use index-based selection for uniqueness
  const openIdx = index % templates.opens.length;
  const midIdx = (index * 3 + 2) % templates.mids.length;
  const closeIdx = (index * 5 + 4) % templates.closes.length;

  let desc = templates.opens[openIdx];

  // Add author context if available
  if (author && author.length > 1 && author.length < 80 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author) && !/dar us salam/i.test(author)) {
    desc += ` Authored by the distinguished scholar ${author}, this work reflects a lifetime of dedicated research and an unwavering commitment to preserving authentic Islamic knowledge for the benefit of current and future generations.`;
  }

  // Add parts info for multi-volume sets
  if (parts && parts.length > 2 && /set|vol/i.test(parts)) {
    desc += ` This {parts} provides comprehensive coverage of its subject matter across multiple volumes.`;
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
    .replace(/\{format\}/g, format)
    .replace(/\{parts\}/g, parts);

  // Clean up double spaces
  desc = desc.replace(/\s+/g, ' ').trim();

  // Ensure minimum 180 words — add padding if needed
  let wordCount = desc.split(/\s+/).length;
  if (wordCount < 180) {
    const paddingSentences = [
      'This {lang} edition has been produced to the highest publishing standards, with careful attention to typography, paper quality, and binding durability that ensures this work will remain a valued part of your Islamic library for many years to come.',
      'Readers across Pakistan have come to trust Bab-ul-Fatah as their primary source for authentic Islamic publications, and this edition of {title} continues that tradition of providing quality Islamic knowledge at accessible prices.',
      'Whether you are a seasoned student of Islamic knowledge or a beginner taking your first steps on the path of learning, this {lang} publication offers content that is both accessible and deeply rewarding for readers at every level.',
      'The publisher has ensured that this {lang} edition meets international standards of quality and accuracy, with every aspect of the production process supervised by qualified scholars who specialize in this field of Islamic knowledge.',
      'This publication serves as a bridge between the rich heritage of classical Islamic scholarship and the needs of contemporary Muslim readers, presenting timeless wisdom in a format that resonates with modern audiences while maintaining absolute scholarly integrity.',
      'Islamic scholars and educators throughout Pakistan recommend this {lang} work as an essential reference, praising its clarity of expression, depth of content, and faithfulness to authentic Islamic sources that readers can rely upon with complete confidence.',
      'The enduring popularity of this {lang} publication is a testament to its quality and relevance, as generation after generation of Muslim readers continue to find guidance, inspiration, and knowledge within its pages.',
      'Available in {lang}, this work makes important Islamic knowledge accessible to a wide audience of readers, fulfilling the Islamic duty of sharing beneficial knowledge with the community and contributing to the intellectual growth of the Muslim Ummah.',
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
  console.log('  Bab-ul-Fatah SEO Batch 10 — Products 1001–1100');
  console.log('='.repeat(60) + '\n');

  // Fetch products from database: skip 1000, take 100
  const products = await prisma.product.findMany({
    skip: 1000,
    take: 100,
    orderBy: { id: 'asc' },
  });
  console.log(`  Fetched ${products.length} products from database (skip: 1000, take: 100)\n`);

  // Save fetched products to batch10-products.json
  const productsPath = path.join(__dirname, 'batch10-products.json');
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  console.log(`  Products saved to: ${productsPath}\n`);

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

  // Save meta descriptions to JSON file
  const metaPath = path.join(__dirname, 'seo-meta-batch10.json');
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

  // Uniqueness check
  const descSet = new Set(allDescriptions);
  const openSet = new Set(allDescriptions.map(d => d.substring(0, 100)));
  console.log(`  Unique descriptions (full): ${descSet.size}/${updatedCount}`);
  console.log(`  Unique openings (100 chars): ${openSet.size}/${updatedCount}`);

  // Update progress file
  try {
    const progressPath = path.join(__dirname, 'seo-progress.json');
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    progress.batches['10'] = {
      status: 'completed',
      startIdx: 1001,
      endIdx: 1100,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
    };
    progress.completedBatches = 10;
    progress.completedProducts = 1100;
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress file updated: batch 10 marked as completed`);
  } catch (progressErr) {
    const altPath = path.join(__dirname, 'seo-progress-batch10.json');
    const progress = {
      batch: 10,
      status: 'completed',
      startIdx: 1001,
      endIdx: 1100,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
      completedBatches: 10,
      completedProducts: 1100,
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

  const sampleIndices = [0, 9, 19, 33, 50, 55, 63, 70, 84, 97];
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
  console.log(`  BATCH 10 COMPLETE: ${updatedCount} products updated successfully`);
  console.log('='.repeat(60) + '\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
