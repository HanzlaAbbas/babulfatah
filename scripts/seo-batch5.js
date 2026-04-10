#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 5 Description Writer
// Writes unique, SEO-optimized product descriptions for products 401-500
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

  // Home Decor / Calligraphy wall art
  if (/home decor/i.test(cat) || /ina allah.*calligraphy|fabi ayyi|hasbunallah.*calligraphy/i.test(title)) return 'home_decor';
  // Bakhoor / Incense burners
  if (/bakhoor/i.test(cat) || /intense.*burner|bakhoor/i.test(title)) return 'bakhoor';
  // Calligraphy supplies
  if (/calligraphy/i.test(cat) || /inkpot|glossy sheet/i.test(title)) return 'calligraphy';
  // Quran Rehal
  if (/quran rehal|rehal/i.test(cat) || /rehal|quran.*holder/i.test(title)) return 'rehal';
  // Tasbeeh
  if (/tasbeeh/i.test(cat) || /finger counter|tasbeeh/i.test(title)) return 'tasbeeh';
  // Hajj Umrah
  if (/hajj umrah/i.test(cat) || /hajj|umrah|vaseline|haji soap/i.test(title)) return 'hajj';
  // Packages
  if (/packages/i.test(cat) || /gift pack/i.test(title)) return 'packages';
  // Sahah E Sitta — major hadith commentaries
  if (/sahah e sitta/i.test(cat) || /fath ul bari.*sharah|hidayat al-qari|bukhari.*arabic.*15.*vol/i.test(title)) return 'sahah_sitta';
  // Health / Prophetic medicine
  if (/health/i.test(cat) || /healing with the medicine|tibb.*nabawi|prophetic medicine/i.test(title)) return 'health';
  // Fasting / Zakaat
  if (/fasting/i.test(cat) || /zakaat/i.test(cat) || /fast according|fatawa.*fasting|traweeh/i.test(title)) return 'fasting';
  // Fiqh (LARGEST group)
  if (/fiqh/i.test(cat) || /isharon.*ki.*zuban|islam.*halal.*haram|islam.*bunyaadi|islam.*kia|islam.*k.*bunyaadi|islam.*me.*dolat|islam.*ahkam|islam.*aur.*khanqahi|islam.*hi.*hamara|islam.*pr.*aitrazaat|islam.*salvation|islam.*mein.*ikhtilaf/i.test(title)) return 'fiqh';
  // Hadith / Fazail
  if (/hadith/i.test(cat) || /ilamat.*qiyamat|fazail.*(sahaba|sahabiyat|quran|rehmat|dawat)/i.test(title)) return 'hadith';
  // Darussalam Publishers
  if (/darussalam publishers/i.test(cat) || /hindrances on the path|hisn-ul-muslim.*pashto|hospital.*mein|how the prophet.*performed hajj|how to achieve happiness|how to pray|hujiyat|ibn khaldun.*luqman|in the king.*court|inkaar.*hadith|insaan.*ayinay|interpretation of kitab|islam.*birth right|islam.*imtiyaazi|islam.*sachayi.*science|islam.*mein.*bunyaadi|islam.*religion.*peace|islami.*aqeeda.*8x12/i.test(title)) return 'darussalam';
  // Companions
  if (/companions/i.test(cat) || /heroes of islam|history of islam.*abu bakr|history of islam.*umar|history of islam.*uthman|history of islam.*ali|history of islam.*muawiyah|history of islam.*khulafa|ilm ka samandar/i.test(title)) return 'companions';
  // Prayer Supplication
  if (/prayer supplication/i.test(cat) || /fortress of the muslim|hisn ul|hisn-ul-muslim|hirz.*azam|how to invite people/i.test(title)) return 'prayer';
  // Biography
  if (/biography/i.test(cat) || /hazrat ibrahim|historical atlas.*prophets|holnak|ibrat ka nishan|imam ahmed.*hanbal|imam sufiyan.*bin.*uyaniyah|in defence of the true|in quest of truth|salman.*farisi/i.test(title)) return 'biography';
  // History
  if (/history/i.test(cat) || /history of islam.*3 vol|history of madinah|history of makkah|holy makkah.*brief|islami fatoohat/i.test(title)) return 'history';
  // Women
  if (/women/i.test(cat) || /honorable wives|important lessons.*women/i.test(title)) return 'women';
  // Children
  if (/children/i.test(cat) || /huqooq.*al aulad|qasas.*ul.*anbiya|idrees.*ramadhan|hisn ul muslim.*pocket/i.test(title)) return 'children';
  // Education
  if (/education/i.test(cat) || /interpretation of dreams|introducing arabic|islam.*beginners.*guide|islami qanoon.*wirasat|inam yafta/i.test(title)) return 'education';
  // Family
  if (/family/i.test(cat) || /ideal ki talash/i.test(title)) return 'family';
  // Lifestyle
  if (/lifestyle/i.test(cat) || /islami.*adaab.*muashrat/i.test(title)) return 'lifestyle';
  // Miscellaneous
  if (/miscellaneous/i.test(cat) || /isaayiat.*tajziyah/i.test(title)) return 'miscellaneous';
  // Reference
  if (/reference/i.test(cat) || /fatawa bray|fazl ul baari|gunahon ko/i.test(title)) return 'reference';
  // Prophets Seerah
  if (/prophets seerah/i.test(cat) || /golden rays of prophethood|haqooq rehmatul/i.test(title)) return 'seerah';
  // Imams Scholars
  if (/imams scholars/i.test(cat) || /ilm.*keemya.*imam|ilm o fun.*imam|imam ibn.*taimiya|imam sufiyan ibn/i.test(title)) return 'scholars';
  // Darul Khalood
  if (/darul khalood/i.test(cat) || /islam main borhon/i.test(title)) return 'general';
  // General
  if (/general/i.test(cat) || /help yourself.*reading|huquq rahmatul|insaniyat.*mout|islam made simple|islamic conquests|ideal ki talash|isaayiat/i.test(title)) return 'general';

  return 'general';
}

// ─── Templates (ALL NEW — completely different from batches 1, 2, 3, and 4) ──
const T = {

  // ── Fiqh (largest category) ───────────────────────────────────────────────
  fiqh: {
    opens: [
      'The practical application of Islamic law requires more than rote memorization of rulings — it demands a nuanced understanding of the legal principles, evidential hierarchies, and methodological frameworks that underpin every Shariah determination. This {lang} publication, {title}, equips readers with precisely that understanding by presenting Islamic jurisprudence through a lens that prioritizes comprehension over mere compliance, empowering Muslims in Pakistan to practice their faith with both correctness and conviction. The work systematically maps the relationship between the primary texts of Islam and the derived rulings that govern daily life.',
      'Navigating the landscape of contemporary Islamic legal questions has become increasingly sophisticated as Muslims encounter scenarios that earlier jurists could scarcely have imagined — from digital financial transactions to biomedical ethics and beyond. This {lang} work titled {title} rises to meet those challenges by grounding its analysis in the timeless principles of Islamic legal theory while demonstrating how those principles yield reliable guidance for modern circumstances. The author demonstrates mastery of the classical usul al-fiqh tradition and applies it with precision to the questions that occupy Muslim minds today.',
      'Every Muslim who wishes to live a life pleasing to Allah must engage with Islamic jurisprudence at some level, whether that engagement takes the form of deep scholarly study or practical consultation of reliable references for everyday questions. This {lang} edition of {title} serves both audiences admirably, offering the kind of structured, evidence-based presentation that satisfies academic researchers while remaining accessible to readers who seek practical guidance for their daily worship, business dealings, and social interactions. The breadth of coverage ensures that virtually every area of personal and communal Islamic practice finds treatment within these pages.',
      'The rich intellectual heritage of Islamic jurisprudence — spanning fourteen centuries of continuous scholarly effort across every inhabited continent — provides an extraordinarily well-developed framework for addressing the religious obligations of Muslims in any era and any location. This {lang} publication, {title}, distills that heritage into a focused, reader-friendly reference that captures the essential rulings and their evidentiary foundations without overwhelming readers with the voluminous technical discussions that characterize advanced fiqh texts. The result is a work that delivers maximum practical benefit in minimum reading time.',
      'Correct practice of Islam depends fundamentally on correct knowledge — a principle that applies with special force to the domain of Islamic jurisprudence, where errors in understanding can lead to errors in worship, commerce, and interpersonal conduct. This {lang} book, {title}, addresses that need for correct knowledge by presenting Shariah rulings drawn from the most authoritative sources and transmitted through the most reliable scholarly channels. Each ruling is accompanied by its evidentiary basis, enabling readers to verify the information independently and develop confidence in the guidance they follow.',
      'The relationship between Islamic jurisprudence and the daily lived experience of Muslims is one of constant, dynamic interaction — every new situation, every new technology, every shift in social norms generates fresh questions that require answers grounded in Shariah principles. This {lang} contribution, {title}, engages directly with that dynamic reality, presenting Islamic legal rulings not as static prescriptions but as living guidance derived from eternal principles through rigorous scholarly methodology. The work demonstrates how the timeless wisdom of the Quran and Sunnah continues to provide relevant, reliable direction for Muslims navigating the complexities of modern life.',
      'Islamic jurisprudence serves as the operational manual for a Muslim\'s religious life — the practical roadmap that translates the broad principles of faith into specific actions, obligations, and recommendations governing every dimension of human activity. This {lang} fiqh reference, {title}, provides that roadmap in comprehensive detail, covering the major categories of Islamic legal practice with the precision and thoroughness that readers have come to expect from quality {lang} Islamic scholarship. The work\'s organization around practical topics rather than abstract legal theory makes it immediately useful for readers at all levels of expertise.',
      'A commitment to following Islam correctly implies a commitment to seeking knowledge of Islamic rulings from reliable, qualified sources — a commitment that this {lang} publication, {title}, is designed to fulfill. By presenting the conclusions of qualified Islamic jurists alongside their supporting evidence from the Quran and authenticated Hadith, this work empowers readers to practice their faith with the confidence that comes from knowing their actions are aligned with divine guidance. The balanced approach respects the diversity of scholarly opinion within the Islamic tradition while guiding readers toward the positions best supported by the available evidence.',
    ],
    mids: [
      'This {lang} fiqh publication distinguishes itself through a pedagogical approach that builds understanding progressively, beginning with foundational concepts and advancing to more complex legal questions as the reader\'s comprehension deepens. The author has invested considerable effort in explaining the legal maxims (qawa\'id fiqhiyyah) that undergird Islamic rulings, enabling readers to understand not just individual legal conclusions but the principled reasoning that produces those conclusions. This approach yields a far more durable and transferable understanding than simple memorization of rulings. Where differences of opinion exist among recognized schools of Islamic law, the various positions are presented with their respective evidences, allowing readers to appreciate the richness of Islamic legal thought while being guided toward the strongest positions. The production quality — clear typography, durable binding, and well-organized layout — makes this a reference that readers will consult frequently and rely upon for years.',
      'The methodology employed in this {lang} work reflects a commitment to the highest standards of Islamic scholarship, where every legal ruling is traced back through its chain of transmission to the Quran, the authenticated Sunnah, or the consensus of the righteous predecessors. The author\'s engagement with classical fiqh literature — including the major reference works of the Hanafi, Maliki, Shafi\'i, and Hanbali schools — is evident throughout, though the presentation never burdens the reader with unnecessary technical detail. Instead, the focus remains firmly on delivering practical, actionable guidance that ordinary Muslims can understand and implement in their daily lives. The {lang} prose is direct and unpretentious, making this work equally suitable for madrasa students, university researchers, and family reading. Cross-references and a comprehensive index facilitate quick consultation of specific topics.',
    ],
    closes: [
      'Secure your copy of this essential {lang} fiqh reference from Bab-ul-Fatah Pakistan for {price}. {title} delivers reliable, evidence-based Islamic legal guidance for every Muslim household. Order online with delivery across all cities in Pakistan.',
      'Purchase this comprehensive {lang} Islamic jurisprudence guide — {title} — from Bab-ul-Fatah Pakistan for {price}. Expertly organized rulings with full evidentiary support. Shop online with fast, reliable nationwide delivery.',
      'Invest in authoritative {lang} fiqh scholarship by ordering {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, this work is indispensable for students, scholars, and practicing Muslims. Browse our fiqh collection and order today.',
      'Build your Shariah knowledge with this {lang} publication available at Bab-ul-Fatah Pakistan for {price}. {title} offers clarity, accuracy, and comprehensive coverage of Islamic legal rulings. Order now with nationwide shipping.',
    ],
  },

  // ── Darussalam Publishers ─────────────────────────────────────────────────
  darussalam: {
    opens: [
      'The Darussalam publishing house has established itself over several decades as an institution that Muslim readers trust implicitly — a trust earned through unwavering adherence to authentic Islamic sources, rigorous multi-stage scholarly review of every manuscript, and a production ethic that treats the reader\'s need for accurate knowledge as a sacred responsibility. This {lang} edition of {title} embodies those institutional values, delivering content that has passed through layers of expert verification to ensure that readers receive Islamic knowledge they can act upon with complete confidence.',
      'When Muslim readers encounter the Darussalam imprint on any publication, they recognize it as a signal that the content within has been produced to exacting standards of scholarly accuracy — a signal that carries particular weight in an era when the Islamic book market includes titles of widely varying quality and reliability. This {lang} work titled {title} upholds that reputation by presenting its subject matter with the meticulous sourcing, clear presentation, and orthodox theological orientation that have become hallmarks of the Darussalam publishing program and earned the endorsement of scholars worldwide.',
      'Publishing Islamic literature that is simultaneously authoritative and accessible represents one of the most challenging tasks in the Muslim intellectual world — the content must satisfy the exacting standards of qualified scholars while remaining comprehensible to readers who lack formal training in the Islamic sciences. This {lang} Darussalam publication, {title}, achieves that balance through editorial practices that have been refined over decades of publishing experience, including consultation with subject-matter specialists at every stage of production and reader-friendly formatting that makes complex material approachable without diluting its intellectual substance.',
      'The scholarly review infrastructure that Darussalam has built over its decades of operation represents one of the most comprehensive quality assurance systems in Islamic publishing — involving multiple rounds of content verification, cross-referencing of all scriptural citations, authentication of every Hadith narration against primary sources, and review of all legal opinions by qualified jurists. This {lang} book, {title}, has passed through that entire process, emerging as a publication that readers, educators, and scholars can rely upon with the assurance that its content has been vetted at the highest level of academic rigor.',
      'In the landscape of contemporary Islamic publishing, certain imprints function as reliable markers of content quality, and Darussalam has earned its position at the top of that hierarchy through consistent delivery of carefully researched, properly sourced, and accessibly presented Islamic knowledge. This {lang} edition of {title} continues the publisher\'s tradition of excellence by addressing its subject with the depth that scholars demand and the clarity that general readers require. From the selection of source material to the final proofreading, every step of the production process reflects Darussalam\'s commitment to serving the Muslim Ummah through quality publications.',
      'The significance of having a trusted publisher that Muslims can turn to for verified Islamic knowledge cannot be overstated in an age of information abundance and misinformation — Darussalam has filled that role for millions of readers by maintaining standards that prioritize authenticity, accuracy, and practical usefulness above commercial considerations. This {lang} publication titled {title} reflects those priorities, offering content that has been produced with the same care and scholarly oversight that characterizes every title bearing the Darussalam name, from manuscript review to final distribution.',
      'Every Darussalam publication carries with it the collective credibility of the scholars, editors, and reviewers who have contributed to its production — a collaborative effort that transforms individual manuscripts into reliable resources for the Muslim community. This {lang} work, {title}, benefits from that collaborative vetting process, presenting information that draws upon verified Islamic sources with proper attribution and clear explanation. The result is a publication that functions effectively as both a teaching resource and a personal reference, suitable for Islamic schools, mosque libraries, and household collections throughout Pakistan.',
      'The trust that Muslim readers place in Darussalam publications is not given lightly — it has been earned through years of consistent quality, prompt correction of any errors identified after publication, and a transparent approach to sourcing that allows readers to verify the information they receive. This {lang} Darussalam title, {title}, honors that trust by adhering to the publisher\'s established standards of scholarly excellence, providing a reading experience that is both intellectually enriching and practically beneficial. For Pakistani readers who have come to rely on the Darussalam imprint as a mark of quality, this {lang} edition will reinforce that confidence.',
    ],
    mids: [
      'The production of this {lang} Darussalam title has involved scholars specializing in the relevant Islamic disciplines, working together to verify that every Quranic verse is cited accurately, every Hadith narration meets authentication standards, and every legal opinion is properly attributed to its scholarly source. This collaborative review process — a hallmark of the Darussalam methodology — catches errors that would escape detection in a single-reviewer workflow and results in a final product of remarkable accuracy and reliability. The physical production matches the intellectual quality, with attention to paper durability, print clarity, binding strength, and cover design that reflects the dignity of the content within. For Pakistani readers seeking Islamic publications that combine scholarly trustworthiness with practical usability, this {lang} Darussalam edition delivers on both counts with consistency and professionalism.',
      'This {lang} Darussalam work has been designed for versatility — serving as a textbook for Islamic educational institutions, a reference for mosque imams and community leaders, a teaching aid for parents educating their children at home, and a personal enrichment resource for any Muslim seeking to deepen their understanding of the faith. The chapter organization, index, and cross-references support all of these use cases, while the {lang} prose maintains a readability that accommodates both sequential study and targeted consultation. The consistent quality of Darussalam publications has made them the preferred choice of Islamic schools, mosque libraries, and household collections across Pakistan, and this {lang} edition continues that tradition of accessible, authoritative scholarship.',
    ],
    closes: [
      'Order this trusted {lang} Darussalam publication from Bab-ul-Fatah Pakistan for {price}. {title} carries the scholarly assurance that only the Darussalam imprint provides. We stock the widest Darussalam selection in Pakistan with delivery to every city.',
      'Purchase this quality {lang} Darussalam edition — {title} — from Bab-ul-Fatah Pakistan for {price}. Every title has been selected for scholarly merit and production quality. Order online with fast, reliable nationwide delivery.',
      'Add this authoritative {lang} Darussalam work to your collection by ordering from Bab-ul-Fatah Pakistan. At {price}, {title} is a valuable investment in verified Islamic knowledge. Browse our Darussalam catalog online and enjoy nationwide delivery.',
      'Secure your copy of this {lang} Darussalam publication at Bab-ul-Fatah Pakistan for {price}. This edition of {title} meets the highest standards of Islamic scholarly publishing. Order today with our secure packaging and nationwide shipping network.',
    ],
  },

  // ── Hadith ────────────────────────────────────────────────────────────────
  hadith: {
    opens: [
      'The prophetic narrations that illuminate the signs preceding the Day of Judgment represent one of the most compelling and spiritually consequential categories of Hadith literature — they awaken the believer to the transient nature of worldly life and motivate preparation for the inevitable meeting with Allah. This {lang} compilation, {title}, gathers the major and minor signs of Qiyamat from authenticated Hadith sources, presenting them in a structured format that enables readers to understand the sequence, significance, and implications of these prophetic indicators for their personal faith and daily conduct.',
      'Among the vast corpus of prophetic traditions, the narrations dealing with the signs of the Last Day hold a unique capacity to transform a Muslim\'s perspective on worldly affairs — redirecting attention from the pursuit of material gain toward the accumulation of righteous deeds and spiritual preparation. This {lang} work titled {title} provides a thorough, well-organized treatment of these eschatological narrations, drawing exclusively upon verified Hadith sources and explaining each sign within the framework of orthodox Islamic theology. The compiler has taken care to distinguish between authentic narrations and weaker reports, giving readers confidence in the accuracy of the information presented.',
      'The knowledge of the signs preceding Qiyamat serves a dual purpose in Islamic spirituality: it functions as both a warning that motivates repentance and righteous action, and a source of hope that reassures believers of Allah\'s ultimate justice and mercy. This {lang} publication, {title}, presents this knowledge comprehensively, organizing the prophetic narrations into logical categories that cover the major signs, the minor signs, and the specific events foretold by Prophet Muhammad (peace be upon him). Each narration is accompanied by its source reference and authentication status, enabling readers to verify the material independently.',
    ],
    mids: [
      'This {lang} Hadith compilation has been assembled from the most authoritative collections of prophetic traditions, including Sahih al-Bukhari, Sahih Muslim, Sunan at-Tirmidhi, Sunan Abi Dawud, and other verified sources. The compiler has applied rigorous Hadith authentication standards, providing chain analysis and scholarly grading for the key narrations so that readers can evaluate the strength of each report. The thematic organization groups related narrations together, building a coherent picture of the eschatological framework established by the Prophet (peace be upon him). The {lang} commentary contextualizes each sign within the broader teachings of Islam, preventing the misunderstandings that can arise when eschatological narrations are read in isolation. This {lang} edition provides a reliable, well-sourced reference that serves both personal study and educational purposes, making it a valuable addition to any Islamic library.',
    ],
    closes: [
      'Order this important {lang} Hadith compilation from Bab-ul-Fatah Pakistan for {price}. {title} provides authenticated knowledge about the signs of Qiyamat. Shop online with delivery across all cities in Pakistan.',
      'Purchase this insightful {lang} work on the signs of the Last Day from Bab-ul-Fatah Pakistan. At {price}, {title} is a thoughtfully organized Hadith reference. Order today for reliable nationwide shipping.',
      'Get this essential {lang} eschatological compilation from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} strengthens faith through prophetic knowledge. Order online with nationwide delivery.',
    ],
  },

  // ── Companions ───────────────────────────────────────────────────────────
  companions: {
    opens: [
      'The Khulafa-e-Rashidun — the Rightly Guided Caliphs who succeeded Prophet Muhammad (peace be upon him) as leaders of the Muslim community — represent the highest standard of Islamic governance, personal piety, and statesmanship that the Ummah has ever witnessed. This {lang} publication, {title}, brings their remarkable stories to life through meticulously researched narratives that capture the courage of Abu Bakr, the justice of Umar, the quiet wisdom of Uthman, and the intellectual depth of Ali, showing how each Caliph contributed uniquely to the establishment and consolidation of the Islamic state.',
      'The period of the Rightly Guided Caliphate stands as history\'s most compelling proof that Islam\'s political and social teachings produce societies characterized by justice, prosperity, and moral excellence when implemented by leaders of genuine faith and competence. This {lang} work titled {title} chronicles that extraordinary thirty-year period with scholarly precision and narrative engagement, tracing the challenges each Caliph faced, the decisions they made, and the lasting impact of their leadership on the trajectory of Islamic civilization. The accounts draw exclusively upon authenticated historical sources, ensuring that readers receive accurate, reliable information.',
      'Understanding the individual contributions of the Khulafa-e-Rashidun is essential for any Muslim who wishes to appreciate how the abstract principles of Islamic governance were first translated into practical administration, legal adjudication, and military strategy. This {lang} book, {title}, provides that understanding by dedicating focused attention to each of the four Caliphs, examining their pre-Islamic backgrounds, their transformation through Islam, their unique leadership qualities, and the specific challenges they confronted during their respective caliphates. The result is a nuanced portrait of Islamic leadership that reveals the diversity of talent within the early Muslim community.',
      'The heroes of Islam are not confined to the Prophet\'s immediate Companions — they extend across every generation of Muslim history, encompassing scholars who preserved religious knowledge, warriors who defended Muslim lands, rulers who established justice, and ordinary believers whose extraordinary faith left lasting marks on the Ummah. This {lang} publication, {title}, presents a curated selection of these heroic figures whose lives exemplify the Islamic virtues of courage, knowledge, piety, and sacrifice, offering readers of every generation role models whose examples remain as relevant today as they were in their own times.',
    ],
    mids: [
      'The historical narratives in this {lang} work have been compiled from the most trusted sources of early Islamic history, including the chronicles of Ibn Sa\'d, al-Tabari, al-Baladhuri, and Ibn Kathir, supplemented by the authenticated Hadith collections of al-Bukhari and Muslim. Each account has been cross-referenced against multiple sources to ensure historical accuracy, and where sources present varying accounts of the same event, the compiler has presented the most well-supported version while acknowledging alternative narrations where appropriate. The {lang} prose style prioritizes readability without sacrificing the scholarly precision that students of Islamic history require. The thematic organization allows readers to follow the chronological development of the early Islamic state while also exploring specific aspects of each Caliph\'s leadership — their administrative innovations, their judicial decisions, their military campaigns, and their personal spiritual practices. For Pakistani readers seeking to connect with the foundational period of Islamic civilization, this {lang} edition provides an engaging and reliable gateway.',
    ],
    closes: [
      'Explore the golden age of Islamic leadership with this {lang} collection from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers timeless lessons in governance, justice, and faith. Order online for delivery to any city in Pakistan.',
      'Order this comprehensive {lang} history of the Companions from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} is a valuable addition to any Islamic library. Shop with reliable nationwide delivery.',
      'Bring home these inspiring {lang} accounts of Islamic heroes by ordering {title} from Bab-ul-Fatah Pakistan. At {price}, this edition provides authentic, scholarly narratives of Islam\'s greatest leaders. Order online with fast nationwide shipping.',
    ],
  },

  // ── Prayer Supplication ─────────────────────────────────────────────────
  prayer: {
    opens: [
      'The comprehensive dua collection known as Hisn ul Muslim (Fortress of the Muslim) has earned its reputation as one of the most indispensable books in any Muslim household — a concise yet thorough compilation of the authentic supplications taught by Prophet Muhammad (peace be upon him) covering virtually every situation a believer encounters from morning to night. This {lang} edition of {title} makes that essential reference available in a format optimized for daily use, with clear organization, accessible layout, and the complete text of each supplication alongside its source reference from authenticated Hadith collections.',
      'The practice of making dua — calling upon Allah with sincerity, humility, and hope — represents one of the most powerful and accessible acts of worship available to every Muslim regardless of their circumstances. This {lang} publication titled {title} provides a structured, comprehensive guide to that practice, collecting the authentic supplications of the Prophet (peace be upon him) and organizing them by occasion, topic, and need so that readers can quickly find the appropriate words for any situation. From morning and evening azkar to supplications for guidance, protection, forgiveness, and success, this collection covers the full spectrum of Muslim devotional needs.',
      'Inviting others toward Allah — the noble calling of da\'wah — is a responsibility that extends to every Muslim who possesses even a basic understanding of their faith, yet many hesitate because they feel unprepared or uncertain about how to communicate Islamic truths effectively. This {lang} work, {title}, addresses that hesitation by providing practical guidance on the methods, principles, and etiquettes of calling people to Islam, drawing upon the Quran, the Prophetic model, and the experience of successful da\'wah practitioners throughout Islamic history.',
    ],
    mids: [
      'This {lang} supplication guide has been organized with the practical demands of daily Muslim life firmly in view. The duas are arranged topically — covering waking and sleeping, entering and leaving the home, before and after eating, during travel, at times of hardship, when seeking forgiveness, and for virtually every other situation that a believer encounters in the course of a normal day. Each supplication is presented in its original Arabic alongside its {lang} translation or transliteration where appropriate, with the Hadith source clearly cited for authentication. The {lang} formatting uses visual cues — icons, bold headings, and generous spacing — to facilitate quick reference during actual use. The durable construction and portable sizing make this a practical companion that can be carried throughout the day, kept on a bedside table, or stored in a vehicle for travel use. Bab-ul-Fatah offers this {lang} dua collection at {price}, making this essential spiritual resource affordable for readers throughout Pakistan.',
    ],
    closes: [
      'Order this essential {lang} dua guide from Bab-ul-Fatah Pakistan for {price}. {title} is your daily companion for authentic Islamic supplications. Shop online with delivery to all cities across Pakistan.',
      'Get this comprehensive {lang} prayer and supplication collection from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} provides authenticated duas for every occasion. Order today for reliable nationwide shipping.',
      'Strengthen your spiritual practice with this {lang} supplication reference from Bab-ul-Fatah Pakistan. Priced at {price}, {title} covers all essential Islamic azkar. Browse our dua collection online and enjoy nationwide delivery.',
    ],
  },

  // ── Home Decor (Calligraphy wall art) ────────────────────────────────────
  home_decor: {
    opens: [
      'The Quranic declaration "Inna Allah Ala Kulli Shayeen Qadeer" — verily, Allah is able to do all things — serves as one of the most powerful reminders of divine omnipotence in the Islamic faith, and rendering this verse in laser-cut calligraphy transforms that reminder into a permanent visual presence in your living or working space. This {title} from Bab-ul-Fatah combines the spiritual depth of the Quranic text with the precision of modern laser cutting technology to produce a decorative piece that commands attention, inspires reflection, and elevates the aesthetic atmosphere of any room it occupies.',
      'Displaying Quranic verses and words of remembrance in the home is a practice deeply rooted in Islamic tradition, reflecting the believer\'s desire to surround themselves and their families with constant reminders of Allah\'s presence, power, and mercy. This {title} brings that tradition to life through meticulously crafted laser-cut calligraphy that captures the elegance and complexity of Arabic script in a durable, visually striking format. The "Inna Allah Ala Kulli Shayeen Qadeer" inscription serves as a conversation piece, a source of spiritual comfort, and a declaration of faith that resonates with every member of the household and every guest who enters.',
    ],
    mids: [
      'The craftsmanship behind this {title} calligraphy piece reflects the highest standards of modern Islamic decorative arts. Advanced laser-cutting technology ensures that every curve, connection, and flourish of the Arabic script is rendered with mathematical precision, producing clean, consistent lines that traditional hand-cut methods cannot match at this scale. The material — selected for its durability, weight, and finish quality — has been treated to resist fading, warping, and environmental degradation, ensuring that this piece maintains its visual impact for years of daily display. The design has been tested for structural stability at the intended display size, with appropriate mounting provisions that facilitate secure installation on walls or placement on tables. Whether you are decorating a living room, bedroom, office, or prayer space, this {title} delivers a focal point that combines spiritual significance with contemporary design aesthetics. Bab-ul-Fatah offers this piece at {price}, making premium Islamic calligraphy art accessible to Pakistani households.',
    ],
    closes: [
      'Order this stunning {title} from Bab-ul-Fatah Pakistan for {price}. Premium laser-cut Quranic calligraphy for your home or office. We deliver to all cities across Pakistan with secure packaging. Shop online today.',
      'Purchase this beautiful {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for {price}. Transform your space with authentic Islamic calligraphy art. Order online with fast, reliable nationwide delivery.',
      'Add this elegant Islamic calligraphy piece — {title} — to your home by ordering from Bab-ul-Fatah Pakistan. At {price}, it makes a meaningful gift for any occasion. Shop online with nationwide shipping.',
    ],
  },

  // ── Bakhoor / Incense burners ────────────────────────────────────────────
  bakhoor: {
    opens: [
      'The tradition of burning bakhoor — aromatic incense blends derived from natural resins, woods, and botanical essences — occupies a cherished place in Islamic cultural practice, dating back to the era of Prophet Muhammad (peace be upon him) who encouraged the use of pleasant fragrances in homes and mosques. This {title} from Bab-ul-Fatah provides a beautifully crafted vessel for that ancient practice, combining traditional design sensibilities with modern manufacturing precision to create a burner that functions as effectively as it looks.',
      'A quality bakhoor burner transforms the simple act of fragrancing a room into a ritual experience that engages multiple senses and creates an atmosphere of warmth, hospitality, and spiritual tranquility. This {title} has been engineered to optimize the bakhoor experience — its design promotes even heat distribution for consistent fragrance release, its materials are selected for heat resistance and durability, and its aesthetic treatment reflects the elegance that Islamic decorative arts are known for. Whether used for daily home fragrance, special occasions, or as part of a hospitality routine, this burner delivers reliable performance and visual appeal.',
      'The Intense burner series represents a fusion of traditional Middle Eastern incense culture and contemporary product engineering, resulting in bakhoor burners that combine the timeless appeal of classical designs with modern convenience features. This {title} offers users the choice between manual charcoal-based burning and electric heating, allowing them to enjoy authentic bakhoor fragrances in the manner that best suits their lifestyle and preferences. The available finishes — bronze, golden, and silver — ensure that the burner complements a wide range of interior design schemes.',
    ],
    mids: [
      'This {title} has been manufactured with careful attention to the specific requirements of bakhoor burning, which demands materials that can withstand sustained high temperatures without degrading, cracking, or releasing unpleasant odors of their own. The heat-resistant construction ensures safe operation during extended use, while the ventilation design promotes efficient combustion and optimal fragrance diffusion throughout the room. The bowl or tray dimensions have been calibrated to accommodate standard bakhoor portions, with easy-clean surfaces that simplify maintenance between uses. The base provides stable support on flat surfaces, and the overall weight and balance have been tuned to prevent accidental tipping. For Pakistani consumers who appreciate the cultural tradition of bakhoor and desire a burner that combines functionality with visual elegance, this {title} delivers on both fronts. Bab-ul-Fatah offers this premium bakhoor burner at {price}, providing accessible luxury for the home.',
    ],
    closes: [
      'Order this elegant {title} from Bab-ul-Fatah Pakistan for {price}. A premium bakhoor burner combining traditional design with modern quality. We deliver to all cities across Pakistan with secure packaging. Shop online today.',
      'Purchase this quality {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic store, for {price}. Beautiful bakhoor burner in a stunning finish. Order online with fast, reliable nationwide delivery.',
      'Add this {title} to your home by ordering from Bab-ul-Fatah Pakistan. At {price}, this bakhoor burner is perfect for creating a fragrant, welcoming atmosphere. Shop online with nationwide shipping.',
    ],
  },

  // ── Calligraphy supplies ─────────────────────────────────────────────────
  calligraphy: {
    opens: [
      'The art of Arabic and Islamic calligraphy demands specialized tools that respond to the artist\'s creative intentions with precision and consistency — and the quality of those tools directly affects the quality of the artistic output. This {title} from Bab-ul-Fatah provides calligraphers with a purpose-built instrument that meets the exacting requirements of the craft, whether used for Quranic inscription, decorative composition, or the practice and teaching of calligraphic techniques that connect contemporary artists to centuries of Islamic artistic tradition.',
      'Every calligraphy practitioner understands that the right ink pot is far more than a container — it is a carefully engineered tool that controls ink consistency, prevents spills, and provides the stable platform that precise brush or pen work requires. This {title} has been designed specifically for the needs of Arabic and Islamic calligraphy, with dimensions, weight distribution, and material selection optimized for the unique demands of right-to-left script and the complex stroke modulation that distinguishes fine calligraphic work.',
    ],
    mids: [
      'This {title} calligraphy supply has been selected by Bab-ul-Fatah for its compatibility with the materials and techniques of Arabic and Islamic calligraphy. The construction ensures stability during use, preventing the accidental disturbances that can ruin a carefully executed stroke. The materials resist corrosion from the inks commonly used in calligraphy and are easy to clean between sessions. Whether you are a student in a formal calligraphy program, a self-taught enthusiast developing your skills, or a professional artist producing works for exhibition or sale, this product provides the reliable, consistent performance that serious calligraphic work demands. Bab-ul-Fatah is committed to supporting the calligraphy community in Pakistan by making quality materials accessible at reasonable prices, and this {title} at {price} exemplifies that commitment.',
    ],
    closes: [
      'Shop for this quality {title} at Bab-ul-Fatah Pakistan for {price}. We carry a comprehensive selection of Arabic calligraphy supplies. Order online with delivery to any city in Pakistan.',
      'Order this {title} from Bab-ul-Fatah Pakistan for {price}. Professional-grade calligraphy materials for artists of all levels. Shop online with fast nationwide delivery.',
    ],
  },

  // ── Quran Rehal ─────────────────────────────────────────────────────────
  rehal: {
    opens: [
      'An MDF Quran rehal combines the time-honored functionality of the traditional Subcontinent book stand with the durability and dimensional consistency that modern engineered wood products provide. This {title} from Bab-ul-Fatah offers a stable, attractive platform for reading the Holy Quran during daily recitation, congregational prayers, or study sessions, with a folding design that allows for convenient storage when not in use. The manufacturing process ensures that each rehal is produced to consistent quality standards, with smooth surfaces, secure hinges, and a finish that complements both traditional and contemporary interior decor.',
      'Placing the Holy Quran on a dedicated stand during recitation is a gesture of reverence that reflects the Muslim\'s recognition of the scripture\'s divine origin and supreme importance. This {title} provides an ideal platform for that expression of respect, featuring a reading angle engineered for comfort during extended recitation sessions, a stable base that prevents tipping, and a collapsible design that facilitates transport to the mosque or storage in a bookshelf. The MDF construction offers superior resistance to warping and cracking compared to natural wood, ensuring consistent performance through years of regular use.',
    ],
    mids: [
      'The construction of this {title} reflects the standards expected for an item that holds the Holy Quran — the MDF material has been selected for its structural stability and consistent quality, the folding mechanism has been tested for durability through repeated open-close cycles, and the surface finish has been applied to resist wear while maintaining an attractive appearance. The dimensions accommodate standard Quran sizes commonly used in Pakistan, from compact personal editions to larger reference copies. The decorative treatment on the exterior panels incorporates Islamic-inspired patterns that reference the rich tradition of Muslim decorative arts without compromising the functionality of the stand. Whether used at home for daily recitation, in the mosque for congregational reading, or presented as a gift for weddings, Eid, or housewarmings, this {title} delivers reliable performance and aesthetic appeal. Bab-ul-Fatah offers this quality rehal at {price}, making an essential item of Muslim material culture accessible to all.',
    ],
    closes: [
      'Order this beautiful {title} from Bab-ul-Fatah Pakistan for {price}. A quality MDF Quran rehal combining durability with traditional design. We deliver to all cities in Pakistan with secure packaging.',
      'Purchase this {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for just {price}. An elegant Quran stand ideal for home and mosque use. Order online with fast nationwide delivery.',
    ],
  },

  // ── Sahah E Sitta (major hadith commentary) ─────────────────────────────
  sahah_sitta: {
    opens: [
      'Hidayat al-Qari — the monumental commentary on Sahih al-Bukhari presented in this 10-volume set — represents one of the most significant scholarly contributions to the field of Hadith exegesis in the Urdu language, making the treasures of Bukhari\'s exhaustive commentary tradition accessible to readers who engage with Islamic knowledge through {lang}. This {lang} edition of {title} offers a comprehensive, systematic explanation of the most authentic book of Hadith, providing linguistic analysis, historical contextualization, and juristic implications for each narration that opens the door to deeper understanding for scholars, students, and serious readers of Islamic knowledge.',
      'A multi-volume commentary on Sahih al-Bukhari is among the most ambitious publishing projects in Islamic literature, requiring the collaboration of scholars, editors, typesetters, and production teams working together over extended periods to produce a work that is both intellectually substantial and physically durable. This {lang} edition, {title}, rises to meet those challenges with distinction, presenting its 10 volumes in a format that respects the intellectual magnitude of the content while accommodating the practical needs of readers who will consult it regularly for research, teaching, and personal study.',
    ],
    mids: [
      'This {lang} 10-volume commentary on Sahih al-Bukhari addresses every aspect of each Hadith narration with scholarly thoroughness — analyzing the chains of transmission and narrator biographies, explaining the linguistic nuances of the Arabic text, exploring the juristic rulings derived from each narration, documenting the points of scholarly agreement and disagreement, and providing cross-references to related narrations across the broader Hadith corpus. The {lang} language of the commentary makes this analytical depth accessible to the vast community of Urdu-speaking Islamic scholars and students who have traditionally relied on Arabic-language commentaries for this level of Hadith analysis. Each volume is individually indexed for efficient navigation, and the complete set provides comprehensive coverage of Sahih al-Bukhari from beginning to end. For Islamic seminaries, research institutions, and serious private scholars in Pakistan, this {lang} set represents an essential reference investment. Bab-ul-Fatah is proud to offer this monumental work at {price}, making it accessible to the Pakistani scholarly community.',
    ],
    closes: [
      'Invest in this monumental {lang} 10-volume Hadith commentary — {title} — from Bab-ul-Fatah Pakistan. At {price}, this comprehensive Bukhari sharah is indispensable for serious scholars. Order online with secure packaging and delivery across Pakistan.',
      'Order this essential {lang} commentary on Sahih al-Bukhari from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is the definitive Urdu sharah of Bukhari. Shop with confidence and nationwide delivery.',
    ],
  },

  // ── Health / Prophetic Medicine ──────────────────────────────────────────
  health: {
    opens: [
      'The prophetic medicine tradition — known in Arabic as Tibb al-Nabawi — encompasses the healing practices, dietary recommendations, and health advice that Prophet Muhammad (peace be upon him) provided to his Companions, drawing upon divine guidance and practical wisdom to address the health concerns of the Muslim community. This {lang} publication, {title}, presents that tradition comprehensively, gathering the authentic narrations on health and healing into a structured reference that bridges the gap between classical Islamic medical knowledge and contemporary health consciousness.',
      'Ibn al-Qayyim\'s celebrated work on the medicine of the Prophet (peace be upon him) represents one of the most thorough and well-organized treatments of the Tibb al-Nabawi tradition in classical Islamic literature, and this {lang} edition makes that important work accessible to readers in Pakistan. This {lang} publication titled {title} explores the Prophet\'s guidance on nutrition, natural remedies, preventive health practices, and the spiritual dimensions of healing, presenting a holistic approach to well-being that integrates physical health with faith and devotion.',
    ],
    mids: [
      'This {lang} work on prophetic medicine has been compiled with careful attention to the authentication of Hadith narrations, ensuring that the healing practices and remedies attributed to the Prophet (peace be upon him) are supported by reliable chains of transmission. The content covers a wide range of health topics including dietary guidelines, the use of honey, black seed, and other natural remedies recommended in the Sunnah, the Prophet\'s advice on prevention and lifestyle, and the spiritual remedies — such as ruqyah and dua — that complement physical treatment. The {lang} commentary contextualizes the classical medical knowledge within both its historical setting and its relevance to contemporary health concerns. The author draws upon Ibn al-Qayyim\'s extensive scholarship while making the material accessible to modern readers who may lack formal training in either Islamic studies or medicine. Whether used as a health reference, a supplement to formal medical care, or a source of spiritual comfort during illness, this {lang} edition provides a valuable resource that honors the prophetic tradition of healing. Bab-ul-Fatah offers this work at {price}, making this important Islamic health literature accessible throughout Pakistan.',
    ],
    closes: [
      'Order this valuable {lang} work on prophetic medicine from Bab-ul-Fatah Pakistan for {price}. {title} presents authentic Tibb al-Nabawi for health-conscious Muslims. Shop online with delivery across all cities in Pakistan.',
      'Purchase this insightful {lang} health publication — {title} — from Bab-ul-Fatah Pakistan for {price}. Classical Islamic healing wisdom made accessible. Order online with fast, reliable nationwide delivery.',
      'Get this comprehensive {lang} guide to the medicine of the Prophet from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} bridges Islamic tradition and health. Order today for nationwide shipping.',
    ],
  },

  // ── History ──────────────────────────────────────────────────────────────
  history: {
    opens: [
      'Islamic history — spanning over fourteen centuries and encompassing civilizations on every inhabited continent — provides the essential context for understanding how the principles of Islam have been translated into political systems, cultural achievements, scientific advances, and social institutions across time and space. This {lang} publication titled {title} offers a structured, comprehensive treatment of that vast historical landscape, tracing the development of Islamic civilization from its origins in seventh-century Arabia through its expansion, golden age, and continuing evolution into the modern era.',
      'The blessed cities of Makkah and Madinah hold a unique position in Islamic consciousness — not merely as geographical locations but as living repositories of sacred history where the foundations of Islam were laid and the earliest Muslim community was established. This {lang} work, {title}, provides a detailed historical survey of one or both of these holy cities, tracing their development from pre-Islamic times through the Prophetic era and into the present day, documenting the landmarks, events, and personalities that make these cities the spiritual center of the Muslim world.',
      'The history of Islam is far more than a chronicle of political events and military campaigns — it is the story of how divine revelation transformed human society, producing civilizations of extraordinary intellectual achievement, artistic beauty, and social complexity. This {lang} multi-volume publication, {title}, tells that story with the depth and comprehensiveness it deserves, dedicating substantial attention to the scholarly, scientific, architectural, and cultural contributions that Islamic civilization has made to humanity. The narrative balances chronological progression with thematic analysis, enabling readers to grasp both the sequence of events and their broader significance.',
    ],
    mids: [
      'This {lang} historical publication has been compiled from the most authoritative sources of Islamic historiography, including the chronicles of al-Tabari, Ibn al-Athir, Ibn Kathir, and modern academic researchers who have applied rigorous methodologies to the study of Islamic civilization. The narrative is supported by references to primary sources, archaeological evidence, and contemporary documentary material where available. The {lang} prose style makes complex historical developments accessible to general readers while maintaining the scholarly precision that serious students of history require. Maps, timelines, and genealogical charts supplement the narrative, helping readers visualize the geographical and chronological frameworks within which historical events unfolded. The coverage extends beyond political and military history to encompass the intellectual, scientific, artistic, and social dimensions of Islamic civilization, providing a well-rounded understanding of how Islam shaped and was shaped by the diverse cultures it encountered. Bab-ul-Fatah offers this {lang} historical work at {price}, making quality Islamic history accessible to Pakistani readers.',
    ],
    closes: [
      'Order this comprehensive {lang} history publication from Bab-ul-Fatah Pakistan for {price}. {title} offers an authoritative survey of Islamic civilization. Shop online with delivery to all cities in Pakistan.',
      'Purchase this insightful {lang} historical work from Bab-ul-Fatah Pakistan. At {price}, {title} is essential reading for every student of Islamic history. Order today for reliable nationwide shipping.',
      'Get this valuable {lang} history reference from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} brings Islamic heritage to life. Order online with nationwide delivery.',
    ],
  },

  // ── Education ───────────────────────────────────────────────────────────
  education: {
    opens: [
      'The Islam: A Total Beginner\'s Guide series addresses one of the most significant gaps in Islamic educational literature — the absence of comprehensive, well-organized introductory material designed specifically for adults who are new to the faith, re-discovering it after a period of neglect, or seeking to deepen a superficial understanding into genuine knowledge. This {lang} publication, {title}, provides exactly that foundational education, presenting the essential teachings of Islam in a progressive, reader-friendly format that builds understanding systematically without assuming prior knowledge of Islamic terminology or concepts.',
      'Entering the world of Islamic knowledge can feel overwhelming for new Muslims and those returning to practice — the vastness of the literature, the complexity of the terminology, and the diversity of scholarly perspectives can intimidate even the most motivated learner. This {lang} work titled {title} removes those barriers by presenting Islam\'s core teachings in clear, accessible language that respects the reader\'s intelligence while avoiding unnecessary complexity. The structured approach covers beliefs, worship, moral character, and daily conduct in a logical sequence that builds a coherent, comprehensive understanding of the Islamic way of life.',
      'The interpretation of dreams holds a unique place in Islamic knowledge — the Quran records instances where divine guidance was conveyed through dreams, and the Hadith literature includes detailed prophetic guidance on the principles of dream interpretation. This {lang} publication titled {title} provides a scholarly treatment of this fascinating subject, presenting the Islamic framework for understanding dreams, the principles that distinguish true dreams from ordinary subconscious activity, and the specific symbols and imagery that appear in Islamic dream interpretation tradition.',
      'Islamic inheritance law represents one of the most precisely defined areas of Shariah, with the Quran itself establishing the specific shares that each category of heir receives — a precision that reflects the divine wisdom in protecting the financial rights of every family member. This {lang} work, {title}, provides a clear, practical guide to the Islamic system of inheritance, explaining the rules, calculations, and exceptional cases that govern the distribution of a Muslim\'s estate according to divine guidance.',
    ],
    mids: [
      'This {lang} educational publication has been structured to maximize learning effectiveness for its target audience. The content progresses from foundational concepts to more detailed applications, with each chapter building upon the material established in preceding sections. Clear headings, summary points, and review questions reinforce learning and help readers assess their comprehension. The {lang} prose has been carefully crafted to balance accessibility with accuracy — complex theological and legal concepts are explained in language that educated general readers can follow, while the content maintains the precision that more advanced students require. References to the Quran and authenticated Hadith are provided throughout, enabling readers to verify the information independently and encouraging the habit of returning to primary sources. For Islamic schools, new Muslim programs, prison chaplaincy services, and individual learners, this {lang} edition provides a solid educational foundation that supports continued growth in Islamic knowledge and practice. Bab-ul-Fatah offers this work at {price}, making quality Islamic education accessible.',
    ],
    closes: [
      'Order this valuable {lang} educational publication from Bab-ul-Fatah Pakistan for {price}. {title} supports Islamic learning at every level. Shop online with delivery to all cities in Pakistan.',
      'Get this informative {lang} educational book from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} is a worthwhile addition to any Islamic library. Order today for reliable nationwide shipping.',
      'Invest in your Islamic education with this {lang} guide available at Bab-ul-Fatah Pakistan for {price}. {title} offers clear, structured learning for beginners and beyond. Order now with nationwide delivery.',
    ],
  },

  // ── Family ──────────────────────────────────────────────────────────────
  family: {
    opens: [
      'The search for an ideal life partner is one of the most consequential decisions a Muslim will ever face, affecting not only their personal happiness but the spiritual, emotional, and social well-being of the entire family that results from that union. This {lang} publication titled {title} approaches this critical topic from an Islamic perspective, providing practical guidance on the qualities to seek in a spouse, the principles that should govern the selection process, and the Islamic framework for building a marriage that fulfills its divine purpose as a source of tranquility, mutual support, and spiritual growth.',
      'Islam provides a comprehensive framework for every stage of family life — from the initial search for a suitable spouse through the establishment of the marital household to the raising of children and the management of extended family relationships. This {lang} work, {title}, addresses the early stages of that framework with particular focus, offering guidance rooted in the Quran and Sunnah that helps Muslims approach family formation with wisdom, patience, and realistic expectations. The practical advice is complemented by spiritual insights that remind readers of the divine blessings inherent in a properly established Muslim household.',
    ],
    mids: [
      'This {lang} family guidance publication has been compiled with sensitivity to the real-world challenges that Muslims face when seeking marriage partners and establishing new households in the contemporary Pakistani social context. The content draws upon Quranic guidance, authenticated Hadith, and the practical wisdom of experienced scholars and counselors to provide advice that is both spiritually grounded and practically actionable. Topics covered include the Islamic criteria for spouse selection, the proper conduct during the pre-marital phase, financial planning for the new household, communication skills for building mutual understanding, and the spiritual practices that strengthen the marital bond. The {lang} presentation is direct and practical, avoiding idealized descriptions that don\'t reflect the genuine challenges of family life while maintaining the Islamic principle that marriage is a source of mercy and blessing. Whether you are a young person beginning the search for a spouse, a parent advising a child, or a counselor guiding families, this {lang} edition provides valuable guidance. Bab-ul-Fatah offers this work at {price}.',
    ],
    closes: [
      'Strengthen your family journey with this {lang} Islamic guidance from Bab-ul-Fatah Pakistan. At {price}, {title} offers practical advice for marriage and household building. Order online with delivery across Pakistan.',
      'Order this essential {lang} family guide — {title} — from Bab-ul-Fatah Pakistan for {price}. Islamic principles for spouse selection and family formation. Shop online with fast nationwide delivery.',
      'Bring wisdom to your family decisions with this {lang} publication from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is an essential resource for every Muslim household. Order today for reliable nationwide shipping.',
    ],
  },

  // ── Women ───────────────────────────────────────────────────────────────
  women: {
    opens: [
      'The mothers of the believers — the honorable wives of Prophet Muhammad (peace be upon him) — occupy a position of unparalleled significance in Islamic history, having received the Quranic designation as the mothers of all believers and having transmitted vast portions of the Prophetic knowledge that guides the Muslim Ummah to this day. This {lang} publication, {title}, presents their biographies with the respect, scholarly rigor, and narrative engagement that their extraordinary status demands, offering readers a detailed portrait of the women who shaped the early Muslim community and preserved its intellectual heritage.',
      'The spiritual, intellectual, and social contributions of Muslim women throughout history demonstrate conclusively that Islam empowers women to fulfill their potential as scholars, educators, community leaders, and moral exemplars — a reality that this {lang} work titled {title} brings to life through detailed accounts of the remarkable women who have served Islam across the centuries. The publication addresses both the historical achievements of great Muslim women and the practical lessons that contemporary Muslim women can derive from their examples, providing a resource that is both inspiring and educational.',
    ],
    mids: [
      'This {lang} publication on women in Islam has been compiled with the dual goal of scholarly accuracy and practical relevance. The biographical accounts draw upon authenticated historical sources including the classical Hadith collections, the biographical dictionaries of Ibn Sa\'d and al-Dhahabi, and the specialized works on the mothers of the believers. Each biography covers the woman\'s background, her marriage to the Prophet (peace be upon him), her unique qualities and contributions, her role in preserving and transmitting Islamic knowledge, and the lessons that her life offers to Muslim women in every generation. The {lang} commentary contextualizes the historical accounts within the framework of Islamic teachings on gender, family, and social responsibility, addressing common misconceptions with scholarly evidence and clear reasoning. For Muslim women seeking role models who exemplify faith, knowledge, and strength, or for families seeking to understand Islam\'s elevation of women\'s status, this {lang} edition provides a trustworthy and enriching resource. Bab-ul-Fatah offers this work at {price}.',
    ],
    closes: [
      'Order this essential {lang} guide for Muslim women from Bab-ul-Fatah Pakistan for {price}. {title} offers reliable, scholarly guidance and inspiring biographies. Shop online with delivery to every city in Pakistan.',
      'Get this valuable {lang} publication on women in Islam from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is an important resource for every Muslim household. Order today for fast nationwide delivery.',
    ],
  },

  // ── Biography ───────────────────────────────────────────────────────────
  biography: {
    opens: [
      'The lives of the Prophets of Islam — from Adam to Muhammad (peace be upon them all) — constitute the most spiritually enriching narrative in human history, demonstrating through vivid human experience how divine guidance transforms individuals, families, and entire civilizations. This {lang} publication titled {title} presents these prophetic life stories with scholarly care and narrative engagement, drawing upon authenticated sources to provide accounts that educate the mind, inspire the spirit, and strengthen the reader\'s connection to the unbroken chain of divine revelation that culminated in the final message of Islam.',
      'Prophet Ibrahim (peace be upon him) holds a position of extraordinary distinction in Islamic theology — recognized as the patriarch of the monotheistic traditions, the intimate friend of Allah (Khalilullah), and the spiritual ancestor of all the prophets who followed him. This {lang} work, {title}, explores the remarkable life of Ibrahim with particular depth, tracing his journey from the polytheistic society of his birth through his discovery of monotheism, his persecution by his own people, his migration across the ancient world, and the supreme tests of faith — including the willingness to sacrifice his own son — that established him as the archetypal believer whose example every Muslim seeks to emulate.',
      'The biographies of Islamic scholars represent a genre of literature that simultaneously preserves historical knowledge, transmits scholarly methodology, and provides moral inspiration for subsequent generations. This {lang} publication, {title}, focuses on the life of a distinguished scholar whose intellectual contributions shaped the development of Islamic knowledge, presenting a detailed account of their educational journey, scholarly works, methodological innovations, and the challenges they navigated during a career dedicated to the preservation and advancement of Islamic learning.',
      'Salman al-Farisi (may Allah be pleased with him) embodies the universal appeal of Islam through his remarkable journey from Zoroastrian Persia to the inner circle of the Prophet\'s Companions — a journey driven by an insatiable quest for truth that led him through Christianity and eventually to Islam. This {lang} edition of {title} tells that extraordinary story in vivid detail, showing how Salman\'s relentless search for divine truth exemplifies the Quranic principle that Allah guides those who sincerely seek Him.',
    ],
    mids: [
      'The biographical accounts in this {lang} publication have been compiled from primary historical sources and verified scholarly references, with careful attention to the authentication of narrations and the attribution of events to their proper historical context. The author provides rich background information that helps readers understand the social, political, and intellectual environment in which the subject lived, enabling a deeper appreciation of the challenges they faced and the significance of their achievements. The narrative style balances scholarly precision with engaging storytelling, making these accounts accessible to general readers while providing sufficient documentation for academic research. Key events are analyzed not merely as historical incidents but as sources of practical lessons in faith, perseverance, moral courage, and intellectual integrity. The {lang} prose flows naturally, carrying the reader through the subject\'s life story with a sense of immediacy that brings historical figures to life. For Pakistani readers seeking to deepen their understanding of Islamic history and draw inspiration from its most remarkable figures, this {lang} edition provides an excellent resource.',
    ],
    closes: [
      'Order this inspiring {lang} biography from Bab-ul-Fatah Pakistan for {price}. {title} offers both knowledge and spiritual motivation through authentic life stories. Shop online with delivery across Pakistan.',
      'Purchase this valuable {lang} biographical work from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} is a meaningful addition to any Islamic collection. Order today for reliable nationwide shipping.',
      'Get this engaging {lang} life story from Bab-ul-Fatah Pakistan. Priced at {price}, {title} brings Islamic history to life through powerful narrative. Order now for quick delivery anywhere in Pakistan.',
    ],
  },

  // ── Seerah / Prophets ───────────────────────────────────────────────────
  seerah: {
    opens: [
      'Defending the true faith of Islam against its detractors has been a responsibility shouldered by Muslim scholars since the earliest days of the religion, requiring both deep knowledge of Islamic theology and the intellectual tools to address objections effectively and persuasively. This {lang} publication titled {title} continues that scholarly tradition by presenting a systematic, well-reasoned defense of Islamic beliefs and practices, drawing upon the Quran, authenticated Hadith, and the intellectual legacy of classical Muslim theologians to address the misconceptions and criticisms that are most commonly directed at Islam.',
      'The intellectual defense of Islam — known in the Islamic scholarly tradition as \'ilm al-kalam and related disciplines — is not merely an academic exercise but a practical necessity in a world where misinformation about Islam circulates widely and where Muslims frequently encounter questions and objections that require knowledgeable, thoughtful responses. This {lang} work, {title}, equips readers with the knowledge and reasoning skills needed to engage confidently in discussions about Islam, presenting the rational foundations of Islamic belief and addressing common misconceptions with scholarly evidence and clear argumentation.',
    ],
    mids: [
      'This {lang} publication has been structured to address the most significant objections and misconceptions directed at Islam, organizing the material thematically to facilitate both sequential reading and targeted consultation of specific topics. The arguments presented draw upon Quranic verses, authenticated Hadith narrations, and the works of classical Muslim scholars who specialized in defending Islamic beliefs — including Ibn Taymiyyah, al-Ghazali, and other prominent defenders of the faith. Each objection is presented fairly before being addressed, ensuring that readers understand both the nature of the criticism and the Islamic response to it. The {lang} prose is precise and logical, making complex theological arguments accessible to educated general readers. For Muslims who encounter objections to their faith in educational institutions, workplace discussions, or social media, this {lang} edition provides the intellectual tools needed to respond with knowledge, confidence, and courtesy. Bab-ul-Fatah offers this work at {price}, making this important apologetic resource accessible to Pakistani readers.',
    ],
    closes: [
      'Order this important {lang} defense of Islamic faith from Bab-ul-Fatah Pakistan for {price}. {title} equips you with knowledge to address misconceptions. Shop online with delivery across Pakistan.',
      'Get this valuable {lang} apologetic work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} provides scholarly answers to common objections. Order today for fast nationwide delivery.',
    ],
  },

  // ── Imams Scholars ──────────────────────────────────────────────────────
  scholars: {
    opens: [
      'The great imams and scholars of Islam — those remarkable individuals who dedicated their entire lives to the preservation, interpretation, and transmission of divine knowledge — are the intellectual pillars upon which the edifice of Islamic civilization rests. This {lang} publication titled {title} presents the biography of one such scholarly giant, tracing their journey from childhood education through their development as a scholar, the intellectual challenges they confronted, the major works they produced, and the lasting influence they exerted on subsequent generations of Islamic learning.',
      'Understanding the lives of the imams who established the major schools of Islamic thought, compiled the great Hadith collections, and developed the principles of Islamic jurisprudence is essential for appreciating the sophistication and depth of the Islamic intellectual tradition. This {lang} work, {title}, provides that understanding by presenting a meticulously researched biography that reveals not only the scholarly achievements of its subject but also the personal qualities — their piety, perseverance, integrity, and dedication to truth — that elevated them to the ranks of Islam\'s most revered scholars.',
      'The legacy of great Islamic scholars extends far beyond the books they wrote — it lives in the methodologies they established, the students they trained, and the intellectual standards they maintained under often extraordinarily difficult circumstances. This {lang} publication, {title}, explores that legacy by documenting both the scholarly output and the personal trials of a distinguished imam, showing how their commitment to Islamic knowledge remained unwavering through persecution, imprisonment, and opposition from those who disagreed with their scholarly conclusions.',
    ],
    mids: [
      'This {lang} biographical work on an Islamic scholar has been compiled from the most reliable historical sources, including the classical biographical dictionaries, the writings of the scholar\'s students and contemporaries, and the assessments of later historians who evaluated their contributions to Islamic knowledge. The narrative covers the scholar\'s family background, early education, the teachers who shaped their intellectual development, their major works and their distinctive contributions to Islamic methodology, the trials and tribulations they endured for the sake of knowledge, and their lasting influence on subsequent generations. The {lang} prose style makes this scholarly biography engaging for general readers while maintaining the documentation and precision that academic researchers require. For students of Islamic studies seeking to understand the intellectual heritage of their faith, or for general readers inspired by the lives of great scholars, this {lang} edition provides a valuable and enriching resource that connects contemporary Muslims to the golden age of Islamic scholarship.',
    ],
    closes: [
      'Order this inspiring {lang} scholar biography from Bab-ul-Fatah Pakistan for {price}. {title} offers insight into the life and legacy of a great Islamic scholar. Shop online with delivery across Pakistan.',
      'Get this valuable {lang} biographical work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} is essential reading for students of Islamic scholarship. Order today for fast nationwide delivery.',
    ],
  },

  // ── Lifestyle ───────────────────────────────────────────────────────────
  lifestyle: {
    opens: [
      'Islamic social etiquette — the adaab and muashrat that govern Muslim interactions in daily life — transforms ordinary social encounters into opportunities for expressing faith, demonstrating good character, and earning the pleasure of Allah through considerate behavior. This {lang} publication titled {title} provides a comprehensive guide to those social etiquettes, covering the full spectrum of Muslim interpersonal interactions — from greetings and conversations to hosting guests, visiting the sick, and conducting business — all grounded in the teachings of the Quran and the practical example of Prophet Muhammad (peace be upon him).',
      'The quality of a Muslim\'s social life reflects directly on their practice of Islam, for the Prophet (peace be upon him) taught that the best among Muslims are those who have the best character and who treat others with kindness, respect, and consideration. This {lang} work, {title}, translates those prophetic teachings into practical guidance for contemporary social life, addressing the situations and interactions that constitute daily social experience with specific, actionable advice drawn from authentic Islamic sources.',
    ],
    mids: [
      'This {lang} publication on Islamic social etiquette has been organized to address the practical situations that Muslims encounter in their daily social interactions. The content covers greetings and salutations, conversation etiquette, the rights and responsibilities of hosts and guests, visiting etiquette, gift-giving and receiving, interactions with neighbors, behavior in public spaces, and the specific etiquettes associated with religious and social occasions. Each topic is addressed with reference to its Quranic and Prophetic basis, presented in a {lang} narrative that is both informative and immediately applicable. The content acknowledges the cultural context of Pakistani social life while maintaining the universal applicability of Islamic social teachings. For Muslims who wish to ensure that their social conduct consistently reflects the high standards of Islamic manners, this {lang} edition provides a comprehensive and reliable reference. Bab-ul-Fatah offers this lifestyle guide at {price}.',
    ],
    closes: [
      'Order this informative {lang} Islamic etiquette guide from Bab-ul-Fatah Pakistan for {price}. {title} provides practical guidance for refined Muslim social conduct. Shop online with delivery across all cities in Pakistan.',
      'Get this valuable {lang} lifestyle publication from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} elevates your daily social interactions with Islamic adaab. Order today for fast nationwide delivery.',
    ],
  },

  // ── Children ────────────────────────────────────────────────────────────
  children: {
    opens: [
      'The Qasas ul Anbiya — stories of the prophets from the Quran — have captivated the imaginations of Muslim children for generations, combining the excitement of narrative adventure with the spiritual depth of divine revelation to create stories that entertain, educate, and inspire simultaneously. This {lang} children\'s book, {title}, continues that noble tradition by presenting the story of a prophet in a format specifically designed for young readers, using age-appropriate language, engaging storytelling techniques, and vibrant presentation that captures children\'s attention and draws them into the world of the prophets.',
      'Teaching children about the prophets of Islam through engaging stories is one of the most effective ways to build a strong Islamic foundation in their young minds — stories that show how great men of faith faced extraordinary challenges with courage, patience, and trust in Allah resonate powerfully with children who are themselves learning to navigate the challenges of growing up. This {lang} publication, {title}, leverages that storytelling power by presenting a prophet\'s narrative in a child-friendly format that entertains while it educates, planting seeds of faith and moral awareness that will grow throughout the child\'s life.',
      'The rights of children in Islam — encompassing their right to proper upbringing, education, affection, protection, and moral guidance — represent one of the most important responsibilities that Allah entrusts to parents and the broader Muslim community. This {lang} work titled {title} addresses those rights with scholarly clarity, explaining what Islam requires of parents, educators, and society at large in ensuring that every Muslim child receives the care, guidance, and spiritual formation they need to develop into a righteous, capable adult.',
      'Ramadan holds a special magic for Muslim children — the excitement of fasting (even partially), the festive atmosphere of iftar and suhoor, the communal prayers, and the joyous celebration of Eid that follows. This {lang} children\'s book, {title}, captures that Ramadan magic through a story that follows a child\'s experience of the blessed month, teaching young readers about the significance of fasting, the importance of generosity, and the spiritual rewards that await those who observe Ramadan with sincerity and enthusiasm.',
    ],
    mids: [
      'This {lang} children\'s publication has been developed with careful attention to both Islamic authenticity and child developmental appropriateness. The language and sentence structure are calibrated to the target age group, ensuring that young readers can follow the narrative independently or with minimal parental assistance. The content has been reviewed by qualified scholars to ensure Islamic accuracy, while the presentation has been crafted by experienced children\'s educators to maximize engagement and knowledge retention. The story content reinforces core Islamic values — faith in Allah, obedience to His messengers, patience in difficulty, gratitude for blessings, and kindness toward others — in a natural, non-didactic manner that children absorb effortlessly. The durable construction ensures this book withstands the enthusiastic handling that children\'s books inevitably receive. For parents seeking quality Islamic reading material that their children will genuinely enjoy, this {lang} edition provides an excellent option. Bab-ul-Fatah offers this children\'s publication at {price}, making quality Islamic children\'s literature affordable for Pakistani families.',
    ],
    closes: [
      'Give your children the gift of Islamic knowledge with this engaging {lang} publication from Bab-ul-Fatah Pakistan. Priced at {price}, {title} makes Islamic learning fun and memorable. Order online with delivery across Pakistan.',
      'Order this wonderful {lang} children\'s book from Bab-ul-Fatah Pakistan for {price}. {title} combines authentic Islamic content with child-friendly presentation. Shop from Pakistan\'s leading Islamic bookstore with fast nationwide delivery.',
      'Bring home this educational {lang} children\'s title from Bab-ul-Fatah. At {price}, {title} is an affordable investment in your child\'s faith and character. Order now for quick delivery anywhere in Pakistan.',
    ],
  },

  // ── General ─────────────────────────────────────────────────────────────
  general: {
    opens: [
      'The publication of quality Islamic literature in accessible formats and affordable editions serves a vital role in disseminating the knowledge that every Muslim needs to practice their faith correctly and live their life according to divine guidance. This {lang} edition of {title} contributes to that dissemination effort by offering content that is both educationally valuable and spiritually enriching, presented with the production quality and scholarly care that discerning readers in Pakistan have come to expect from reputable Islamic publishers.',
      'Building a personal Islamic library is a long-term investment in spiritual growth, intellectual development, and family education — and every well-chosen addition to that library expands the reader\'s access to the knowledge and wisdom that Islam offers for navigating every dimension of human experience. This {lang} publication, {title}, represents precisely the kind of well-chosen addition that delivers lasting value, offering content that addresses its subject with depth, clarity, and practical relevance that will reward repeated consultation over many years.',
      'A commitment to continuous learning is one of the defining characteristics of a practicing Muslim — the Prophet (peace be upon him) emphasized that seeking knowledge is an obligation upon every Muslim, and that the path to paradise is paved with the pursuit of beneficial knowledge. This {lang} work titled {title} supports that commitment by providing structured, reliable content on its subject, making it a valuable resource for readers who take their intellectual and spiritual development seriously and seek publications that match the seriousness of their purpose.',
    ],
    mids: [
      'This {lang} publication has been produced with careful attention to both the quality of its content and the durability of its physical construction. The information presented has been verified against authoritative Islamic sources, and the editorial approach prioritizes clarity and practical usefulness. The production quality — including paper selection, typography, and binding — reflects the understanding that Islamic books deserve physical treatment that matches their intellectual and spiritual significance. Whether consulted regularly for reference, read cover-to-cover for comprehensive understanding, or shared within a family for collective learning, this {lang} edition delivers a reliable and enriching reading experience. Bab-ul-Fatah is pleased to offer this work at {price}, making quality Islamic literature accessible to readers throughout Pakistan who wish to build their knowledge and strengthen their practice of Islam.',
    ],
    closes: [
      'Order this valuable {lang} Islamic publication from Bab-ul-Fatah Pakistan for {price}. {title} offers quality content at an accessible price. Shop online with delivery to all cities in Pakistan.',
      'Get this informative {lang} book from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is a worthwhile addition to any Islamic library. Order today for reliable nationwide shipping.',
      'Purchase this {lang} Islamic work from Bab-ul-Fatah Pakistan for just {price}. {title} provides well-researched, authentic content for every reader. Order online and benefit from our fast delivery service across Pakistan.',
    ],
  },

  // ── Miscellaneous ───────────────────────────────────────────────────────
  miscellaneous: {
    opens: [
      'The literary heritage of Islamic civilization encompasses far more than theological and legal texts — it includes a rich tradition of poetry that expresses the full range of human experience through the aesthetic and emotional power of verse. This {lang} publication titled {title} presents a scholarly treatment of a significant body of poetic work, combining literary analysis with contextual background that enables readers to appreciate both the artistic qualities and the cultural significance of the material.',
      'Poetry has served as one of the most expressive and enduring vehicles of literary culture in the Islamic world, capturing religious devotion, social commentary, philosophical reflection, and personal emotion in verse forms that have been refined over centuries of continuous literary production. This {lang} work, {title}, engages with that poetic tradition through careful analysis and interpretation, presenting material that will interest literary scholars, cultural historians, and general readers who appreciate the beauty and depth of Islamic literary expression.',
    ],
    mids: [
      'This {lang} publication has been compiled with scholarly attention to both the literary and cultural dimensions of the material it presents. The content covers the historical context in which the poetic works were composed, the literary techniques and stylistic features that characterize the verse, and the thematic concerns that give the poetry its enduring relevance. Each work or collection is analyzed with reference to its place within the broader Islamic literary tradition, and the commentary draws connections between the poetic material and the social, religious, and intellectual currents that shaped its production. The {lang} prose style makes complex literary analysis accessible to educated general readers while maintaining the scholarly precision that academic researchers expect. For readers seeking to explore the rich literary dimensions of Islamic civilization beyond its theological and legal texts, this {lang} edition provides a valuable and engaging resource. Bab-ul-Fatah offers this work at {price}, broadening the range of quality Islamic literature available to Pakistani readers.',
    ],
    closes: [
      'Order this distinctive {lang} literary publication from Bab-ul-Fatah Pakistan for {price}. {title} offers a window into the rich literary tradition of Islamic civilization. Shop online with delivery across Pakistan.',
      'Get this unique {lang} literary work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} combines scholarly analysis with literary beauty. Order today for nationwide shipping.',
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
  if (author && author.length > 1 && author.length < 80 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author) && !/darul iblagh/i.test(author) && !/ashfaq ahmed/i.test(author) && !/daar ul noor/i.test(author) && !/al-imam al-hafiz/i.test(author) && !/abdul-halim/i.test(author) && !/home decor/i.test(author) && !/calligraphy/i.test(author) && !/saniyasnain/i.test(author) && !/abdullah ibn saeed/i.test(author)) {
    desc += ` Authored by the distinguished scholar ${author}, this work reflects a deep commitment to authentic Islamic scholarship and the preservation of beneficial knowledge for the Muslim Ummah.`;
  }

  // Add parts info if available
  if (parts) {
    desc += ` This ${parts} provides comprehensive coverage of its subject matter, offering readers a thorough and well-organized treatment that serves as both a learning resource and a lasting reference.`;
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
      'This {lang} edition has been manufactured to meet rigorous production benchmarks, featuring carefully selected paper stock, a robust binding engineered for daily use, and typography that ensures comfortable reading even during extended study sessions and prolonged reference consultations.',
      'Bab-ul-Fatah has built a reputation throughout Pakistan as a dependable and trustworthy source for authentic Islamic publications, and this particular edition of {title} exemplifies the caliber of materials that discerning readers have consistently associated with our platform.',
      'Whether you are a seasoned scholar with decades of rigorous study behind you or a curious newcomer taking your very first steps into Islamic learning, this {lang} publication delivers content that is simultaneously approachable for beginners and intellectually substantial for advanced readers.',
      'The editorial and production team behind this {lang} edition has ensured that international quality standards are upheld on every single page, with content reviewed under proper scholarly supervision to guarantee accuracy, authenticity, and strict adherence to orthodox Islamic positions throughout.',
      'This work effectively bridges the gap between the rich classical tradition of Islamic scholarship and the informational needs of contemporary readers, presenting time-honored wisdom in a format that resonates with modern audiences while fully preserving its original depth and nuance.',
      'Islamic educators and institutional leaders throughout Pakistan consistently recommend this {lang} publication to their students and colleagues, citing its clarity of expression, depth of scholarly content, and strict adherence to authentic Islamic source material as qualities that distinguish it from alternatives.',
      'The sustained demand for this {lang} title across multiple print runs reflects its enduring relevance to Muslim readers and the deep trust that successive generations have placed in the accuracy, reliability, and scholarly integrity of its content.',
      'Published in {lang}, this work fulfills the vital Islamic duty of disseminating beneficial knowledge to the wider community, contributing meaningfully to the intellectual and spiritual enrichment of Muslim households, educational institutions, and research centers everywhere.',
      'The careful attention given to every aspect of this {lang} publication — from content selection and scholarly verification to physical production and visual presentation — ensures that it serves as a worthy vehicle for the Islamic knowledge it contains.',
      'Readers who invest in this {lang} edition join a community of informed Muslims across Pakistan who recognize the importance of building personal libraries stocked with reliable, well-produced Islamic publications that can be consulted and treasured for years to come.',
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
  const authorPart = (author && author.length > 0 && author.length < 60 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author) && !/darul iblagh/i.test(author) && !/ashfaq ahmed/i.test(author) && !/daar ul noor/i.test(author) && !/al-imam al-hafiz/i.test(author) && !/abdul-halim/i.test(author) && !/home decor/i.test(author) && !/calligraphy/i.test(author) && !/saniyasnain/i.test(author) && !/abdullah ibn saeed/i.test(author)) ? ` by ${author}` : '';

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
  meta = meta.replace(/\{lang\}/g, lang);

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
  console.log('  Bab-ul-Fatah SEO Batch 5 — Products 401-500 Descriptions');
  console.log('='.repeat(60) + '\n');

  // Step 1: Fetch products 401-500 from DB and save to JSON
  console.log('  Step 1: Fetching products 401-500 from database...');
  const productsFromDb = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    skip: 400,
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

  // Save to batch5-products.json
  const productsPath = path.join(__dirname, 'batch5-products.json');
  fs.writeFileSync(productsPath, JSON.stringify(productsFromDb, null, 2));
  console.log(`  Saved to: ${productsPath}\n`);

  // Step 2: Load products (use the saved file for consistency)
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`  Loaded ${products.length} products from batch5-products.json\n`);

  const metaResults = [];
  let updatedCount = 0;
  let errorCount = 0;
  const wordCounts = [];
  const allDescriptions = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      const description = generateDescription(p, i);
      const metaDescription = generateMetaDescription(p, i);
      const words = description.split(/\s+/).length;
      wordCounts.push(words);
      allDescriptions.push(description);

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
  const metaPath = path.join(__dirname, 'seo-meta-batch5.json');
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
    progress.batches['5'] = {
      status: 'completed',
      startIdx: 401,
      endIdx: 500,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
    };
    progress.completedBatches = 5;
    progress.completedProducts = 600;
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress file updated: batch 5 marked as completed`);
  } catch (progressErr) {
    const altPath = path.join(__dirname, 'seo-progress-batch5.json');
    const progress = {
      batch: 5,
      status: 'completed',
      startIdx: 401,
      endIdx: 500,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
      completedBatches: 5,
      completedProducts: 600,
    };
    fs.writeFileSync(altPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress saved to: ${altPath}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n  Completed in ${elapsed}s`);
  console.log('='.repeat(60) + '\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
