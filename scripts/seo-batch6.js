#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 6 Description Writer
// Writes unique, SEO-optimized product descriptions for products 501-600
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

// ─── Category routing (batch 6 specific) ─────────────────────────────────────
function detectCatKey(product) {
  const cat = ((product.category && product.category.name) || product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  // Home Decor / Calligraphy wall art — Kalima Tayyaba, La Hola
  if (/home decor/i.test(cat) || /kalima.*tayyaba|kalma.*tayyaba|la.*hola|calligraphy.*laser|car.*tag/i.test(title)) return 'home_decor';
  // Arabic Car Hangings
  if (/arabic car hangings/i.test(cat)) return 'home_decor';
  // Sahah E Sitta — Jami at-Tirmidhi
  if (/sahah e sitta/i.test(cat) || /jami.*tirmidhi|jamia.*sunan.*tirmidhi/i.test(title)) return 'sahah_sitta';
  // Health / Prophetic medicine
  if (/health/i.test(cat) || /islamic.*medicine|jadu.*aasyb.*elaj|jadu.*tony/i.test(title)) return 'health';
  // Fiqh
  if (/fiqh/i.test(cat) || /islamic.*verdicts|istighfar.*tauoz|janazay.*ihkaam|daarhi.*farz|kitab.*janaiz|kuffar.*say.*mushabihat/i.test(title)) return 'fiqh';
  // Hadith
  if (/hadith/i.test(cat) || /itybah.*sunnat|jahanum.*bayan|janazay.*kay.*masail|jihad.*kay.*masail|kabeera.*saghira|khareed.*farokht|libaas.*bayan/i.test(title)) return 'hadith';
  // Darussalam Publishers
  if (/darussalam publishers/i.test(cat) || /islami.*taaleemi.*series|jab.*dunya|jadoo.*tony|jannat.*main.*dakhila|khawateen.*liye.*hadith|khubsurat.*masajid|lets.*help.*poor|kuffaar.*se.*mushahibat/i.test(title)) return 'darussalam';
  // Companions
  if (/companions/i.test(cat) || /jannat.*ka.*matlashi|khadm.*e.*khaas|khalid.*bin.*al.*waleed|khateeb.*rasool/i.test(title)) return 'companions';
  // Prayer Supplication
  if (/prayer supplication/i.test(cat) || /jinnati.*aur.*shaitani|kitab.*al.*azkaar/i.test(title)) return 'prayer';
  // Biography
  if (/biography/i.test(cat) || /jabir.*bin.*abdullah|khandan.*e.*nabuwat|khush.*qismat.*qaum|kids.*story.*books.*set|kirdar.*ka.*ghazi|qissa.*syedna.*yunus/i.test(title)) return 'biography';
  // History
  if (/history/i.test(cat) || /islamic.*album.*galleries|kitab.*al.*awail/i.test(title)) return 'history';
  // Women
  if (/women/i.test(cat) || /islamic.*dress.*code|islamic.*rulings.*menstruation|islamic.*fatawa.*women|khawateen.*aur.*ramadan|khawateen.*liye.*muntakhib|khawateen.*kai.*lye.*ihkam|khawateen.*kay.*imtiyazi|libas.*aur.*pardah/i.test(title)) return 'women';
  // Children
  if (/children/i.test(cat) || /jadogaron.*se.*muqabla|kindness.*to.*animals/i.test(title)) return 'children';
  // Education
  if (/education/i.test(cat) || /islamic.*studies.*grade|islami.*taleem.*tarbiat|islamic.*education.*series|learning.*arabic.*language.*quran|lets.*speak.*arabic|kitab.*tawheed.*taqwiyat|kitab.*at.*tauhid.*english/i.test(title)) return 'education';
  // Family
  if (/family/i.test(cat) || /kindness.*to.*parents|khushhali.*ki.*dastak/i.test(title)) return 'family';
  // Lifestyle
  if (/lifestyle/i.test(cat) || /kya.*aap.*mulazmat/i.test(title)) return 'lifestyle';
  // Reference
  if (/reference/i.test(cat) || /kitab.*ul.*waseela/i.test(title)) return 'reference';
  // Faith Aqeedah
  if (/faith aqeedah/i.test(cat) || /jadoo.*ki.*haqeeqat/i.test(title)) return 'faith';
  // Prophets Seerah
  if (/prophets seerah/i.test(cat) || /khatam.*ul.*anbiya|life.*and.*times.*messengers/i.test(title)) return 'seerah';
  // Imams Scholars
  if (/imams scholars/i.test(cat) || /jaanshini.*ka.*haq|khud.*dar.*imam/i.test(title)) return 'scholars';
  // General
  if (/general/i.test(cat) || /jannat.*ka.*bayan|jannat.*ka.*rasta|jannat.*pukarti|khutbat.*surah.*fatiha|khutbat.*e.*haram|khuwabon.*ki.*tabeerain/i.test(title)) return 'general';

  return 'general';
}

// ─── Templates (ALL NEW — completely different from batches 1 through 5) ──
const T = {

  // ── Education (Islamic Studies grade series, Arabic learning) ─────────────
  education: {
    opens: [
      'A well-structured Islamic education forms the bedrock upon which a Muslim\'s entire relationship with their faith is constructed — shaping not only their understanding of theology and ritual practice but also their moral compass, social conduct, and spiritual aspirations from the earliest years of learning. This {lang} educational resource, {title}, has been carefully designed to deliver that foundational knowledge in a systematic, age-appropriate manner that respects the developmental stage of the learner while maintaining the rigor and authenticity that Islamic scholarship demands. Each lesson builds upon preceding material to create a coherent scaffold of religious understanding.',
      'The challenge of teaching Islam comprehensively without overwhelming the student is one that educational publishers have wrestled with for generations — balancing depth of content against accessibility of presentation, scholarly accuracy against reader engagement, and breadth of coverage against focused mastery of essential knowledge. This {lang} edition of {title} represents a thoughtful solution to that challenge, employing pedagogical strategies proven effective in both traditional madrasa settings and modern classroom environments across Pakistan. The content is calibrated to challenge learners appropriately while providing sufficient scaffolding to ensure that no student is left behind.',
      'Comprehensive Islamic education must address the whole person — nurturing the intellect through study of aqeedah and fiqh, cultivating the spirit through lessons on tazkiyah and the lives of the righteous, and developing moral character through stories of the Prophets and Companions that demonstrate Islamic values in vivid, memorable terms. This {lang} publication, {title}, embraces that holistic approach to Islamic pedagogy, presenting material that engages the mind, touches the heart, and shapes the behavior of students as they progress through a carefully sequenced curriculum designed to produce well-rounded Muslim learners.',
      'The proven success of a systematic Islamic studies curriculum lies in its ability to transform abstract theological concepts into concrete, relatable lessons that resonate with students at every stage of their educational journey — from the simple truths of Tawheed that a young child can grasp to the nuanced discussions of usul al-fiqh that challenge advanced learners. This {lang} work titled {title} implements that proven approach through a grade-by-grade progression that introduces concepts at the appropriate moment in the student\'s development, reinforcing earlier learning while consistently expanding the student\'s knowledge base and deepening their comprehension of Islam\'s rich intellectual tradition.',
      'Islamic educational materials produced for the Pakistani market occupy a unique position in the global Islamic publishing landscape — they must serve students educated in both Urdu and English, accommodate the curricular requirements of diverse educational boards, and address the specific questions and concerns that arise from living as Muslims in a contemporary South Asian context. This {lang} edition of {title} has been tailored precisely to those requirements, incorporating local examples, culturally relevant illustrations, and content aligned with the expectations of Pakistani Islamic schools and parents who take religious education seriously.',
      'The science of curriculum design teaches us that effective learning occurs when new material is connected to existing knowledge through meaningful associations, when abstract concepts are anchored in concrete examples, and when students are given regular opportunities to apply what they have learned through practical exercises and reflective questions. This {lang} educational resource, {title}, applies those pedagogical principles systematically throughout its pages, using a format that has been refined through years of classroom testing to maximize student engagement, knowledge retention, and practical application of Islamic teachings in daily life.',
      'The transmission of Islamic knowledge from one generation to the next is not merely an academic exercise — it is a sacred trust (amanah) that carries profound implications for the spiritual welfare of individuals and communities. This {lang} publication, {title}, honors that trust by presenting Islamic teachings with the care, accuracy, and respect they deserve, while also employing modern educational techniques that make the material accessible and engaging for today\'s learners. The result is an educational tool that parents and teachers can deploy with confidence, knowing that the knowledge being transmitted is both authentic and effectively communicated.',
      'Building religious literacy in young Muslims requires educational resources that speak to students where they are — acknowledging their questions, validating their curiosity, and guiding them toward understanding through a process that feels more like discovery than indoctrination. This {lang} book, {title}, achieves that balance by presenting Islamic knowledge through narrative, question-based inquiry, and visually engaging layouts that invite exploration rather than passive reception. Students who work through this material will emerge not only better informed about their faith but more genuinely connected to it on an emotional and spiritual level.',
    ],
    mids: [
      'The pedagogical framework of this {lang} educational title integrates several proven approaches to Islamic instruction. Each chapter opens with learning objectives that clarify what the student will master, followed by core content presented in clear, concise paragraphs that respect the student\'s attention span while delivering substantive knowledge. Key terms are highlighted and defined in context, important Quranic verses and Hadith are cited with full references, and each section concludes with review questions and discussion prompts that encourage critical thinking rather than rote memorization. Where applicable, the content includes practical exercises that help students translate theoretical knowledge into observable behavioral change — such as guided du\'a practice, step-by-step wudu and salah instructions, and character-building scenarios drawn from the lives of the Prophets and Companions. The illustrations and visual aids have been selected to complement the text without distracting from it, and the overall production quality — including durable binding and clear typography — ensures that this {lang} educational resource withstands the rigors of daily classroom use. Bab-ul-Fatah Pakistan offers this title at {price}, making quality Islamic education affordable for families and institutions throughout the country.',
      'This {lang} edition has been structured to serve multiple educational contexts — as a primary textbook for Islamic studies courses in formal schools, as a supplementary resource for madrasa students seeking to broaden their understanding beyond the traditional curriculum, and as a self-study guide for families who wish to provide structured religious education at home. The content scope encompasses the foundational pillars of Islamic knowledge: aqeedah (belief system), fiqh (practical jurisprudence), seerah (Prophetic biography), Quranic studies, Hadith studies, and Islamic history and civilization. Each subject area is treated with appropriate depth for the target educational level, and the cross-referencing between subjects helps students appreciate the interconnected nature of Islamic knowledge. Teacher\'s notes and supplementary materials have been integrated where appropriate, supporting educators in delivering effective instruction even without extensive specialized training in Islamic pedagogy. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} educational resource represents an excellent investment in the religious formation of the next generation of Muslims.',
    ],
    closes: [
      'Order this {lang} educational resource from Bab-ul-Fatah Pakistan for {price}. {title} provides structured, authentic Islamic learning for students at every level. Shop online with delivery to all cities across Pakistan.',
      'Purchase this comprehensive {lang} Islamic studies guide — {title} — from Bab-ul-Fatah Pakistan for {price}. Ideal for schools, madrasas, and home learning. Order today with fast nationwide delivery.',
      'Invest in quality {lang} Islamic education by ordering {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this curriculum resource is perfect for students and educators. Browse our education collection and order now.',
      'Build a strong foundation of Islamic knowledge with this {lang} title available at Bab-ul-Fatah Pakistan for {price}. {title} offers grade-appropriate, authentic religious instruction. Order online with nationwide shipping.',
    ],
  },

  // ── Darussalam Publishers ─────────────────────────────────────────────────
  darussalam: {
    opens: [
      'Discerning Muslim readers have long recognized that the Darussalam imprint on any Islamic publication represents a guarantee of content integrity — the assurance that every page has been scrutinized by qualified scholars, every scriptural citation has been verified against primary sources, and every theological position reflects the orthodox consensus of the Ummah\'s most trusted authorities. This {lang} edition of {title} upholds that hard-earned reputation by delivering content that meets the publisher\'s famously exacting standards of accuracy, clarity, and practical relevance for Muslims seeking reliable knowledge in an age of widespread misinformation.',
      'The global reputation of Darussalam as a publisher of authentic Islamic literature rests upon a fundamentally different publishing philosophy from most commercial operations — one that treats the accuracy of religious content as a non-negotiable priority rather than a negotiable cost, and that invests in the scholarly review process regardless of its impact on production timelines or profit margins. This {lang} work titled {title} is a direct beneficiary of that philosophy, having undergone the rigorous multi-stage review process that has become synonymous with the Darussalam name and has earned the trust of Islamic scholars, educators, and institutions across Pakistan and around the world.',
      'Few publishers in the Islamic world have assembled the kind of comprehensive scholarly infrastructure that Darussalam has built over its decades of operation — a network of subject-matter specialists, Hadith authenticators, Quranic exegesis experts, and Islamic legal scholars who review every manuscript before it reaches the reading public. This {lang} Darussalam publication, {title}, has passed through every stage of that review process, emerging as a work of exceptional reliability that readers can consult with the confidence that its content has been verified at the highest level of Islamic academic rigor.',
      'The decision to publish an Islamic book through Darussalam rather than through less rigorous channels reflects a commitment to quality that resonates with Muslim readers who understand that religious knowledge carries consequences extending far beyond the intellectual domain — touching the correctness of worship, the validity of legal opinions, and the accuracy of beliefs that define a Muslim\'s relationship with Allah. This {lang} book, {title}, embodies that commitment to quality, presenting its subject with the meticulous sourcing and careful presentation that have become defining characteristics of the Darussalam publishing program.',
      'In a publishing marketplace crowded with titles of uncertain provenance and variable scholarly quality, the Darussalam brand functions as a reliable beacon for Muslim readers navigating the complex landscape of contemporary Islamic literature — a signal that the work they are considering has been produced to standards that prioritize religious accuracy above every other consideration. This {lang} publication titled {title} continues the publisher\'s mission of making verified Islamic knowledge widely available, offering content that has been carefully researched, properly attributed, and reviewed by qualified specialists before reaching the Pakistani reader.',
      'The enduring appeal of Darussalam publications lies in their consistent ability to bridge the gap between scholarly precision and reader accessibility — presenting complex Islamic concepts in language that ordinary Muslims can understand without sacrificing the nuance and accuracy that those concepts demand. This {lang} edition of {title} exemplifies that bridge-building capability, addressing its subject with the thoroughness expected by advanced students while remaining approachable for readers who are encountering the material for the first time. The publisher\'s editorial team has invested considerable effort in ensuring that every paragraph serves both purposes simultaneously.',
      'Behind every Darussalam publication stands a collaborative effort that few readers ever see — the scholars who verify content, the editors who refine prose, the designers who optimize layout, and the production specialists who ensure physical durability — all working together to create a final product worthy of the Islamic knowledge it conveys. This {lang} Darussalam title, {title}, has benefited from every stage of that collaborative process, resulting in a publication that excels in content accuracy, readability, visual presentation, and physical construction. For Pakistani readers who value quality in their Islamic libraries, this {lang} edition delivers on every front.',
      'The scholarly vetting process that distinguishes Darussalam publications from their competitors is not merely a quality-control measure — it is a manifestation of the Islamic principle that conveying religious knowledge carries a profound responsibility, and that errors in that conveyance can have spiritual consequences for both the author and the reader. This {lang} work, {title}, has been produced with full awareness of that responsibility, undergoing the kind of thorough scholarly review that minimizes the risk of error and maximizes the benefit that readers derive from engaging with the material.',
    ],
    mids: [
      'This {lang} Darussalam edition has been produced with the full complement of quality assurance measures that characterize the publisher\'s output. The content has been reviewed by scholars specializing in the relevant Islamic discipline, with particular attention to the authentication of Hadith narrations, the accuracy of Quranic citations, and the proper attribution of scholarly opinions to their respective authorities. Where multiple scholarly positions exist on a given issue, the work either presents the strongest view with its supporting evidence or acknowledges the differences of opinion while guiding readers toward the position best supported by the primary texts. The physical production reflects the same attention to quality — premium paper stock, clear and consistent typography, a binding system designed to withstand repeated use, and a cover design that conveys both the dignity and accessibility of the content. Bab-ul-Fatah Pakistan offers this {lang} Darussalam publication at {price}, providing Pakistani readers with convenient access to one of the Islamic world\'s most trusted publishing imprints.',
      'The practical value of this {lang} Darussalam title extends across multiple use scenarios — it serves effectively as a textbook for Islamic educational institutions, a reference work for mosque imams preparing khutbas or counseling congregants, a teaching resource for parents introducing their children to Islamic knowledge, and a personal study companion for any Muslim seeking to deepen their understanding of the faith. The organizational structure supports all of these applications, with a comprehensive index, logical chapter arrangement, and cross-references that facilitate both sequential reading and targeted topic consultation. The {lang} prose style has been refined to maintain scholarly precision while maximizing readability, ensuring that this work serves equally well in academic settings and personal study environments. Available from Bab-ul-Fatah Pakistan at {price}, this {lang} edition represents outstanding value for readers seeking reliable, well-produced Islamic literature.',
    ],
    closes: [
      'Order this trusted {lang} Darussalam publication from Bab-ul-Fatah Pakistan for {price}. {title} carries the scholarly assurance that millions of Muslim readers worldwide have come to expect. Shop online with delivery across all cities in Pakistan.',
      'Purchase this quality {lang} Darussalam edition — {title} — from Bab-ul-Fatah Pakistan for {price}. Every title undergoes rigorous scholarly review before publication. Order online with fast, reliable nationwide delivery.',
      'Add this authoritative {lang} Darussalam work to your library by ordering from Bab-ul-Fatah Pakistan. At {price}, {title} is an excellent investment in verified Islamic knowledge. Browse our complete Darussalam catalog and enjoy nationwide delivery.',
      'Secure your copy of this {lang} Darussalam publication at Bab-ul-Fatah Pakistan for {price}. This edition of {title} meets the highest standards of Islamic publishing. Order today with secure packaging and fast nationwide shipping.',
    ],
  },

  // ── Home Decor (Kalima Tayyaba, La Hola laser-cut art) ────────────────────
  home_decor: {
    opens: [
      'The Kalima Tayyaba — the declaration of "La ilaha illallah Muhammadur Rasulullah" — stands as the foundational statement of Islamic faith, the utterance that transforms a person\'s spiritual destiny and defines their identity as a believer. Rendering this sacred declaration in finely crafted calligraphy transforms a verbal profession into a lasting visual testament, creating a decorative piece that simultaneously beautifies a space and proclaims the most important truth a human being can acknowledge. This {title} from Bab-ul-Fatah captures the profound simplicity of the Kalima through meticulous craftsmanship that honors the dignity of the words it presents.',
      'Islamic decorative art has always served a dual purpose — enhancing the aesthetic quality of living spaces while providing constant visual reminders of the divine truths that give meaning and direction to a Muslim\'s life. This {title} exemplifies that dual purpose by combining exquisite artistic execution with the spiritual power of Islamic calligraphy, creating a decorative piece that elevates any interior environment while anchoring its occupants\' attention to the remembrance of Allah and His Messenger (peace be upon him). Whether displayed in a living room, study, bedroom, or prayer area, this piece establishes a center of visual gravity that enriches both the space and its viewers.',
      'The phrase "La hola wala quwata illa billah" — there is no power and no strength except with Allah — represents one of the most comprehensive expressions of tawakkul (reliance upon Allah) in the Islamic tradition, capturing in a single sentence the believer\'s acknowledgment that all ability, all achievement, and all protection originate solely from the Creator. Preserving this powerful dhikr in laser-cut calligraphy transforms it into a permanent fixture of one\'s daily environment, ensuring that its message of trust, humility, and divine dependence greets the viewer at every glance. This {title} from Bab-ul-Fatah delivers that transformative message through the precision and elegance of modern manufacturing techniques.',
      'Investing in Islamic calligraphy art goes beyond mere interior decoration — it represents a conscious decision to surround oneself and one\'s family with visual reminders of faith that shape the atmosphere of the home and influence the spiritual orientation of everyone who enters. This {title} has been designed with that deeper purpose in mind, combining artistic beauty with spiritual substance to create a decorative piece that serves as both a conversation starter for guests and a source of ongoing inspiration for household members. The craftsmanship reflects a commitment to excellence that honors the sacred words it presents.',
      'The tradition of displaying Islamic calligraphy in the home stretches back centuries across every Muslim civilization, reflecting the understanding that one\'s physical environment exerts a continuous influence on one\'s spiritual state. This {title} continues that noble tradition in a contemporary format, employing precision laser-cutting techniques to produce calligraphy of exceptional clarity and detail that would have been impossible to achieve through traditional hand-carving methods at this scale. The result is a decorative piece that connects modern Pakistani homes to the artistic and spiritual heritage of Islamic civilization.',
      'Premium Islamic home decor represents a growing category of demand among Pakistani Muslims who wish to express their faith not only through practice but through the aesthetic environment they create within their living spaces. This {title} addresses that demand with a product that combines museum-quality craftsmanship with accessible pricing, making it possible for households across Pakistan to display professionally produced Islamic calligraphy that would previously have been available only through custom commission at many times the cost. The design balances traditional calligraphic principles with contemporary decorative sensibilities.',
      'The visual impact of well-executed Islamic calligraphy lies in its ability to communicate spiritual meaning through purely aesthetic channels — the flowing curves of Arabic script, the rhythmic repetition of forms, and the balanced composition all work together to create a meditative visual experience that calms the mind and elevates the spirit. This {title} has been designed to maximize that impact, with every element of its composition — from the choice of script style to the proportion of elements to the finish of the material — carefully calibrated to produce a decorative piece of exceptional beauty and spiritual resonance.',
      'Choosing Islamic calligraphy for home or office decoration is an act of identity affirmation — a visible declaration of one\'s faith and values that communicates to visitors, colleagues, and family members alike the importance of Islamic principles in the life of the household or workplace. This {title} from Bab-ul-Fatah provides that declaration with elegance and authority, presenting sacred Islamic text in a format that commands respect and admiration while remaining accessible and welcoming in tone. The quality of execution ensures that this piece will be a source of pride for years to come.',
    ],
    mids: [
      'The manufacturing process behind this {title} piece involves state-of-the-art laser-cutting technology that achieves a level of precision unattainable through conventional methods. Each curve, joint, and flourish of the calligraphic design is rendered with micron-level accuracy, producing clean edges and consistent line weights that give the piece its distinctive quality of visual refinement. The base material has been selected for its structural integrity, surface finish, and resistance to environmental factors — ensuring that the calligraphy maintains its appearance over extended periods of display without warping, fading, or deterioration. Where applicable, the piece features a velvet backing that provides both aesthetic contrast and practical protection for display surfaces. The mounting system has been engineered for stability and ease of installation, with pre-drilled holes or integrated stands that allow secure placement on walls, tables, or shelves. The overall dimensions and proportions have been optimized for standard display locations in Pakistani homes and offices. Bab-ul-Fatah offers this {title} at {price}, making premium Islamic decorative art accessible to a wide range of budgets and settings.',
      'This {title} piece has been designed to function effectively in multiple display contexts — as a centerpiece on a living room wall, an accent piece on a bedside table, a decorative element in a home office or study, or a focal point in a dedicated prayer space. The versatility of the design stems from its balanced proportions, its compatibility with various interior design styles, and its ability to serve as both a standalone statement piece and a complementary element within a larger decorative arrangement. The material quality ensures durability whether the piece is displayed in a high-traffic family area or a more private personal space. Gift-givers will appreciate that this {title} arrives in presentable packaging suitable for weddings, housewarmings, Eid celebrations, and other special occasions. Available from Bab-ul-Fatah Pakistan at {price}, this Islamic calligraphy piece offers exceptional value for its craftsmanship and spiritual significance.',
    ],
    closes: [
      'Order this beautiful {title} from Bab-ul-Fatah Pakistan for {price}. Premium Islamic calligraphy art for your home, office, or as a meaningful gift. We deliver to all cities across Pakistan with secure packaging. Shop online today.',
      'Purchase this elegant {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for {price}. Transform your space with professionally crafted Islamic calligraphy. Order online with fast, reliable nationwide delivery.',
      'Add this stunning Islamic calligraphy piece — {title} — to your home by ordering from Bab-ul-Fatah Pakistan. At {price}, it makes a perfect gift for weddings, Eid, and housewarmings. Shop online with nationwide shipping.',
      'Enhance your decor with this {title} available from Bab-ul-Fatah Pakistan for {price}. High-quality laser-cut Islamic calligraphy with durable construction. Order today with fast nationwide delivery.',
    ],
  },

  // ── Fiqh ───────────────────────────────────────────────────────────────────
  fiqh: {
    opens: [
      'The practical dimension of Islamic faith — encompassing the rulings that govern worship, transactions, personal conduct, and social relations — demands reference materials that present Shariah guidance with both clarity and authority, enabling Muslims to navigate the complexities of daily life in accordance with divine law. This {lang} publication, {title}, fulfills that demand by offering a well-organized, evidence-based treatment of Islamic jurisprudence that draws upon the Quran, the authenticated Sunnah, and the established scholarly consensus to deliver rulings that readers can implement with confidence in their personal and communal affairs.',
      'Access to reliable Islamic legal guidance has become increasingly important as Muslims in Pakistan and around the world encounter situations that require Shariah-compliant solutions — from the permissibility of contemporary financial instruments to the rulings governing modern medical procedures, digital communication, and evolving social norms. This {lang} work titled {title} addresses that need by providing jurisprudential analysis grounded in the established principles of Islamic legal theory while remaining attentive to the practical circumstances that shape the questions ordinary Muslims face in their daily lives.',
      'The study of Islamic jurisprudence — far from being a dry academic exercise confined to seminary walls — is a living practice that touches every Muslim\'s experience of their faith, from the moment they wake for Fajr to the conditions that govern their business dealings, family relationships, and community obligations. This {lang} book, {title}, brings that living practice to life through a presentation style that connects abstract legal principles to concrete real-world applications, making fiqh accessible and relevant for readers who may have no formal training in the Islamic sciences but who are committed to practicing their religion correctly.',
      'Islamic legal scholarship has produced an extraordinarily rich body of knowledge over fourteen centuries of continuous intellectual effort — a body of knowledge that provides authoritative guidance for virtually every situation a Muslim might encounter, provided one knows where to find it and how to interpret it. This {lang} edition of {title} serves as a gateway to that rich scholarly heritage, distilling the essential rulings from the major fiqh sources into a focused reference that captures the core guidance without overwhelming readers with the voluminous technical discussions found in advanced jurisprudential texts.',
      'The pursuit of Islamic legal knowledge is an obligation upon every Muslim to the extent required for their personal religious practice — a principle that makes fiqh reference works not luxuries but necessities for every Muslim household. This {lang} fiqh publication, {title}, has been designed with that principle in mind, offering clear, well-sourced rulings presented in a format that facilitates quick consultation for specific questions while also supporting more comprehensive study for readers who wish to deepen their understanding of Islamic legal methodology and its practical applications.',
      'Sound Islamic jurisprudence rests upon the careful application of established legal principles to specific factual situations — a process that requires not only knowledge of the relevant texts and scholarly opinions but also the ability to distinguish between primary rulings derived directly from the Quran and Sunnah and secondary rulings derived through juristic reasoning. This {lang} work, {title}, helps readers navigate that distinction by clearly identifying the evidentiary basis for each ruling presented, enabling readers to understand not only what the Shariah says but why it says it, and to evaluate the strength of the evidence supporting each position.',
      'The diversity of scholarly opinion within Islamic jurisprudence — far from being a weakness — reflects the intellectual vitality of a legal tradition that has grappled seriously with the challenge of applying divine guidance to the full spectrum of human experience across diverse cultures and historical periods. This {lang} publication, {title}, engages with that diversity constructively, presenting the major scholarly positions on contested issues alongside their supporting evidence while guiding readers toward the positions best supported by the available proofs from the Quran and authenticated Hadith.',
      'For Muslims who take their religious obligations seriously, the question is not whether to seek knowledge of fiqh but how to find reliable guidance in a landscape crowded with opinions of varying quality and authority. This {lang} reference, {title}, provides that reliability by grounding its analysis in the most authoritative sources of Islamic law — the Quran, the authentic Sunnah as preserved in the major Hadith collections, the consensus of the Companions, and the established principles of the recognized schools of Islamic jurisprudence — delivering guidance that readers can trust and implement with peace of mind.',
    ],
    mids: [
      'This {lang} fiqh work has been structured to serve both as a systematic study text for students of Islamic law and as a quick-reference guide for Muslims seeking practical answers to specific religious questions. The topical organization groups related rulings together, enabling readers to explore a particular area of Islamic practice — such as purification, prayer, fasting, zakat, marriage, or commercial transactions — as a coherent whole rather than encountering scattered fragments of guidance. Each ruling is presented with its supporting evidence, typically including the relevant Quranic verse or Hadith narration alongside its source reference and chain of authentication. Where recognized scholars differ on a particular ruling, the work presents the major positions with their respective evidences, allowing readers to appreciate the scholarly reasoning behind each view while being guided toward the strongest position. The {lang} prose is direct and unambiguous, avoiding the kind of obscure terminology that can make fiqh texts inaccessible to non-specialists. The production quality — durable binding, clear typography, and a comprehensive index — ensures that this reference will serve its owner reliably for years of regular consultation.',
      'The methodological approach of this {lang} fiqh publication reflects a commitment to the classical principles of Islamic legal reasoning while remaining responsive to the practical needs of contemporary Muslims. The author traces each ruling back through its chain of evidence to the primary texts of Islam, demonstrating how the conclusion was derived and on what basis it rests. This transparency enables readers not only to accept the rulings presented but to understand the reasoning process that produced them — an understanding that is far more valuable than mere memorization of legal conclusions because it equips the reader with the intellectual tools to approach new questions with a sound methodological framework. The engagement with multiple schools of Islamic jurisprudence provides a breadth of perspective that enriches the reader\'s understanding while maintaining clarity about the strongest positions. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} fiqh reference is an indispensable addition to any Muslim household library.',
    ],
    closes: [
      'Secure your copy of this essential {lang} fiqh reference from Bab-ul-Fatah Pakistan for {price}. {title} delivers reliable, evidence-based Islamic legal guidance. Order online with delivery across all cities in Pakistan.',
      'Purchase this comprehensive {lang} Islamic jurisprudence guide — {title} — from Bab-ul-Fatah Pakistan for {price}. Expertly organized rulings with full evidentiary support. Shop online with fast, reliable nationwide delivery.',
      'Invest in authoritative {lang} fiqh scholarship by ordering {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, this work is essential for students and practicing Muslims alike. Browse our fiqh collection and order today.',
      'Build your Shariah knowledge with this {lang} publication available at Bab-ul-Fatah Pakistan for {price}. {title} offers clear, accurate coverage of Islamic legal rulings. Order now with nationwide shipping.',
    ],
  },

  // ── Hadith ────────────────────────────────────────────────────────────────
  hadith: {
    opens: [
      'The prophetic traditions constitute the second primary source of Islamic guidance after the Quran itself — serving as the essential interpretive lens through which Muslims understand the divine revelation and the practical model established by Prophet Muhammad (peace be upon him) for every dimension of human life. This {lang} compilation, {title}, draws upon the most authoritative Hadith collections to present authenticated narrations organized thematically for easy reference, providing readers with reliable access to the prophetic guidance that illuminates everything from ritual worship to interpersonal ethics to the most profound questions of faith and destiny.',
      'Engaging with the Hadith literature requires careful attention to the chain of transmission (isnad), the text of the narration (matn), and the scholarly grading that determines each narration\'s level of authenticity — a discipline known as Mustalah al-Hadith that protects the Muslim community from accepting fabricated or weak narrations as religious guidance. This {lang} work titled {title} has been compiled with strict adherence to the principles of Hadith authentication, ensuring that the narrations presented meet the evidentiary standards required for their use as legal and spiritual guidance.',
      'The vast corpus of prophetic narrations — numbering in the hundreds of thousands when all chains of transmission are considered — represents an extraordinarily detailed record of the words, actions, approvals, and character of Prophet Muhammad (peace be upon him), providing Muslims with a comprehensive template for living that addresses virtually every conceivable situation. This {lang} publication, {title}, curates the most relevant and impactful narrations from this vast corpus, organizing them by topic and occasion to create a practical reference that readers can consult regularly for guidance, inspiration, and spiritual enrichment.',
      'The preservation of Hadith through rigorous oral and written transmission over fourteen centuries represents one of the most remarkable achievements of scholarly documentation in human history — a collective effort by thousands of dedicated scholars who devoted their lives to memorizing, verifying, recording, and classifying every narration attributed to the Prophet (peace be upon him). This {lang} Hadith collection, {title}, is a beneficiary of that monumental scholarly effort, presenting narrations that have passed through the most stringent authentication processes ever developed by any religious tradition.',
      'The practical value of Hadith literature extends far beyond its role as a source of legal rulings — the prophetic narrations provide unmatched insight into the character, temperament, and personal conduct of Prophet Muhammad (peace be upon him), offering a living portrait of the ideal human being that no biography or historical account can match in its immediacy and detail. This {lang} work, {title}, captures that richness by including narrations that illuminate the Prophet\'s emotional life, his relationships with family and companions, his approach to hardship and adversity, and his unwavering commitment to justice and compassion.',
      'Muslim scholars have long recognized that the Quran provides the broad principles of Islamic guidance while the Hadith supplies the specific details of their implementation — the Prophet (peace be upon him) explained, demonstrated, and exemplified the Quranic teachings in ways that make them practically applicable to human life. This {lang} compilation titled {title} provides access to that essential explanatory function of the Hadith, presenting narrations that clarify Quranic injunctions, provide context for ambiguous verses, and establish the practical precedents that define authentic Islamic practice.',
    ],
    mids: [
      'This {lang} Hadith compilation draws upon the six most authoritative collections of prophetic traditions — Sahih al-Bukhari, Sahih Muslim, Sunan at-Tirmidhi, Sunan Abi Dawud, Sunan an-Nasa\'i, and Sunan Ibn Majah — supplemented by verified narrations from other respected sources. Each Hadith presented in this work has been evaluated against the standard authentication criteria of Mustalah al-Hadith, with particular attention to the integrity and reliability of the narrators in each chain of transmission. The thematic organization groups related narrations together under clearly labeled headings, enabling readers to explore the prophetic guidance on any topic of interest — whether that topic concerns ritual worship, moral conduct, family relations, financial transactions, or eschatological matters. Brief explanatory notes have been provided where necessary to clarify unusual terminology, provide historical context, or explain the practical implications of a particular narration. The {lang} prose is accessible to readers without specialized training in Hadith sciences while maintaining the scholarly precision that advanced students require. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} Hadith collection is a valuable resource for every Muslim household.',
      'The compiler of this {lang} Hadith work has applied a methodological approach that balances comprehensiveness with selectivity — including sufficient narrations to provide thorough coverage of each topic while avoiding the kind of exhaustive cataloguing that can overwhelm general readers. The result is a Hadith collection that serves effectively as both a study text for Islamic educational institutions and a personal reference for Muslims seeking to align their daily practice with the authenticated Sunnah. The physical production quality — including durable binding, clear Arabic text, and readable {lang} translation or commentary — ensures that this volume will withstand years of regular consultation. Cross-references and a comprehensive index facilitate quick location of specific narrations or topics. For Pakistani readers seeking a reliable, well-organized Hadith reference, this {lang} edition offers exceptional value and scholarly trustworthiness.',
    ],
    closes: [
      'Order this important {lang} Hadith compilation from Bab-ul-Fatah Pakistan for {price}. {title} provides authenticated prophetic guidance for every Muslim household. Shop online with delivery to all cities in Pakistan.',
      'Purchase this scholarly {lang} Hadith collection from Bab-ul-Fatah Pakistan. At {price}, {title} is a meticulously authenticated reference. Order today for reliable nationwide shipping.',
      'Get this essential {lang} prophetic traditions compilation from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} brings authentic Sunnah knowledge to your doorstep. Order online with nationwide delivery.',
    ],
  },

  // ── Sahah E Sitta (Jami at-Tirmidhi) ─────────────────────────────────────
  sahah_sitta: {
    opens: [
      'Jami at-Tirmidhi occupies a unique position among the six canonical Hadith collections — distinguished not only by the comprehensiveness of its narrations and the rigor of its authentication methodology but also by its inclusion of the compiler\'s scholarly evaluation of each Hadith\'s strength, making it an indispensable resource for students of Hadith science who require both the text of narrations and expert assessment of their authenticity. This {lang} edition of {title} makes that landmark collection accessible to readers who wish to engage directly with one of the foundational texts of Islamic scholarship.',
      'Imam at-Tirmidhi\'s contribution to Hadith literature extends beyond mere compilation — his Jami is renowned for its systematic organization, its attention to the jurisprudential implications of each narration, and the unparalleled care with which its compiler traced the chains of transmission and evaluated the reliability of their narrators. This {lang} publication of {title} presents the complete text of this canonical collection with the kind of scholarly apparatus — including authentication grades, narrator biographies, and contextual commentary — that enables serious students to engage with the material at an advanced level while remaining accessible to readers approaching Hadith study for the first time.',
      'Among the six books universally recognized as the most authoritative collections of prophetic traditions in Sunni Islam, Jami at-Tirmidhi holds a special distinction for the depth of its scholarly analysis — Imam at-Tirmidhi did not simply record narrations but evaluated them, compared different versions of the same report, identified the strongest chain of transmission, and explained the jurisprudential conclusions that each narration supports. This {lang} edition, {title}, preserves that analytical richness while presenting the material in a format that serves both academic study and personal enrichment.',
      'The six canonical Hadith collections collectively represent the pinnacle of Islamic scholarly achievement in the field of prophetic tradition — a body of work so rigorously authenticated and so carefully preserved that it serves as the primary practical guide for Muslim life alongside the Holy Quran. This {lang} publication, {title}, delivers one of those six foundational collections in its entirety, providing Pakistani readers with access to the authentic Sunnah of Prophet Muhammad (peace be upon him) through a meticulously produced edition that honors the scholarly legacy of its compiler while meeting the practical needs of contemporary readers.',
      'Investing in a complete set of Jami at-Tirmidhi represents a significant commitment to Islamic scholarship — one that transforms a household library from a casual collection of religious books into a serious resource for the study of authentic prophetic traditions. This {lang} {title} edition makes that investment worthwhile by combining scholarly accuracy with production quality, producing a set that is as durable and well-organized as it is intellectually enriching. For students, scholars, imams, and serious Muslims who wish to study the Hadith in depth, this collection provides an essential foundation.',
    ],
    mids: [
      'This {lang} edition of {title} has been produced with the full scholarly apparatus necessary for serious Hadith study. Each narration is presented with its complete chain of transmission, followed by Imam at-Tirmidhi\'s authentication grade and any relevant commentary on the reliability of individual narrators. Where multiple chains exist for the same narration, the compiler\'s preference for the strongest chain is clearly indicated. The {lang} translation or commentary accompanying the Arabic text has been prepared by scholars with demonstrated expertise in both Hadith science and the {lang} language, ensuring that the meaning of each narration is conveyed accurately without loss of nuance. The multi-volume format allows for generous page layout with clear typography, ample margins for personal annotations, and durable binding designed to withstand frequent consultation over many years. The comprehensive index at the conclusion of the set enables rapid location of narrations by topic, narrator name, or keyword. Bab-ul-Fatah Pakistan is proud to offer this monumental {lang} Hadith collection at {price}, providing Pakistani households and institutions with access to one of Islam\'s most treasured scholarly resources.',
      'The physical production of this {lang} {title} set reflects the significance of its content — premium paper stock that accommodates clear Arabic typography alongside readable {lang} text, reinforced binding on each volume that prevents spine damage during regular use, and protective dust jackets or slipcase that safeguard the collection during storage and transport. The editorial team has invested considerable effort in verifying the accuracy of all scriptural citations, cross-referencing Hadith narrations with parallel versions in other canonical collections, and ensuring that the {lang} commentary aligns with the understanding of the righteous predecessors. For Islamic educational institutions, mosque libraries, and serious private collectors, this {lang} edition represents a cornerstone acquisition that will serve as a primary reference for decades of scholarly engagement.',
    ],
    closes: [
      'Order this complete {lang} Jami at-Tirmidhi set from Bab-ul-Fatah Pakistan for {price}. {title} is one of the six canonical Hadith collections — essential for every serious Islamic library. Shop online with delivery across Pakistan.',
      'Purchase this authoritative {lang} edition of {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. This multi-volume Hadith collection is a cornerstone of Islamic scholarship. Order today with secure nationwide delivery.',
      'Invest in this premium {lang} Hadith collection — {title} — by ordering from Bab-ul-Fatah Pakistan. At {price}, this scholarly set is invaluable for students, imams, and researchers. Browse our Hadith collection online.',
    ],
  },

  // ── Women ──────────────────────────────────────────────────────────────────
  women: {
    opens: [
      'The specific religious obligations and spiritual opportunities available to Muslim women represent a dimension of Islamic scholarship that demands dedicated attention — the rulings governing women\'s worship, family life, social conduct, and personal development differ from those applicable to men in numerous important respects, and reliable guidance on these gender-specific matters is essential for women who wish to practice their faith with confidence and correctness. This {lang} publication, {title}, addresses that need by providing comprehensive, evidence-based guidance tailored specifically to the religious questions and circumstances that Muslim women encounter most frequently.',
      'Islamic scholarship has historically produced a rich body of literature addressing the rights, responsibilities, and spiritual potential of Muslim women — a literature that spans Quranic exegesis, Hadith commentary, legal jurisprudence, and practical advice from the earliest generations of Muslims to the present day. This {lang} work titled {title} contributes to that tradition by gathering the most relevant and reliable guidance into a single, well-organized reference that empowers Muslim women in Pakistan to navigate their religious lives with the knowledge and confidence that comes from understanding the evidentiary basis of the rulings they follow.',
      'The experience of Muslim womanhood in the contemporary world involves a complex intersection of religious obligation, cultural expectation, and personal aspiration — a complexity that generates questions requiring answers grounded in authentic Islamic sources rather than popular opinion or cultural tradition. This {lang} publication, {title}, provides those answers by drawing directly upon the Quran, the authenticated Sunnah, and the scholarly consensus to address the issues that matter most to Muslim women, including worship during menstruation and postpartum recovery, the Islamic dress code, family dynamics, and the pursuit of religious knowledge.',
      'Muslim women who seek to deepen their understanding of Islam\'s teachings about their rights, obligations, and spiritual potential deserve access to scholarly resources that address their specific concerns with both respect and rigor — resources that neither trivialize their questions nor overwhelm them with technical legal discussions beyond their level of prior knowledge. This {lang} edition of {title} strikes that balance by presenting gender-specific Islamic guidance in clear, accessible language while maintaining the scholarly accuracy and evidentiary thoroughness that the subject demands.',
      'The Quranic framework for gender relations in Islam establishes principles of equity, mutual responsibility, and complementary roles that — when properly understood and applied — produce social arrangements characterized by justice, respect, and cooperation between men and women. This {lang} book, {title}, explores that Quranic framework through the lens of authentic Hadith and classical scholarly commentary, providing Muslim women with a nuanced understanding of their position in Islam that transcends both the restrictive interpretations imposed by cultural tradition and the revisionist readings that diverge from established scholarship.',
      'Practical Islamic guidance for women must address the reality of their daily lives — the rhythms of family management, the challenges of balancing domestic responsibilities with spiritual pursuits, the specific rulings that govern their worship during pregnancy, menstruation, and postpartum recovery, and the opportunities for religious scholarship and community contribution that Islam affords them. This {lang} publication, {title}, delivers precisely that practical guidance, organized around the real questions that Muslim women ask and the real situations they face, with answers drawn from the most reliable Islamic sources.',
    ],
    mids: [
      'This {lang} publication for Muslim women has been compiled with careful attention to the specific needs of its target audience. The content addresses topics that are directly relevant to women\'s religious practice — including the rulings on salah, fasting, and other acts of worship during menstruation and the postpartum period (nifas), the Islamic requirements and recommendations regarding hijab and modest dress, the rights and responsibilities within marriage, the etiquette of interaction with non-mahram men, and the spiritual rewards available to women for their various roles and contributions. Each ruling is presented with its evidentiary basis from the Quran and authenticated Hadith, enabling readers to verify the information independently. The {lang} prose style is respectful, clear, and free of unnecessary technical jargon, making the content accessible to women of all educational backgrounds. The production quality — including durable binding and readable typography — ensures that this reference will serve as a reliable companion for years. Bab-ul-Fatah Pakistan offers this {lang} women\'s Islamic guide at {price}, making it an accessible resource for women and girls throughout Pakistan.',
      'The scholarly methodology behind this {lang} work reflects a commitment to presenting Islamic teachings about women in their proper context — drawing upon the full spectrum of authentic sources rather than selectively citing narrations that support a particular perspective. The compiler has consulted the major tafsir works, the canonical Hadith collections, the established fiqh references of the recognized schools of Islamic law, and the specialized works of scholars known for their expertise in women\'s issues within Islam. Where scholarly differences of opinion exist, the various positions are presented with their respective evidences, and the compiler guides readers toward the positions best supported by the available proofs. This balanced, evidence-based approach gives readers the confidence that the guidance they receive is rooted in authentic Islamic scholarship rather than cultural tradition or personal opinion. Available from Bab-ul-Fatah Pakistan at {price}, this {lang} publication is a valuable resource for Muslim women, their families, and the educators who serve them.',
    ],
    closes: [
      'Order this essential {lang} Islamic guide for women from Bab-ul-Fatah Pakistan for {price}. {title} provides reliable, evidence-based guidance on women\'s religious matters. Shop online with delivery to all cities in Pakistan.',
      'Purchase this comprehensive {lang} women\'s Islamic reference — {title} — from Bab-ul-Fatah Pakistan for {price}. Scholarly guidance on worship, dress, and daily life. Order today with fast nationwide delivery.',
      'Invest in authentic {lang} Islamic knowledge for women by ordering {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this book empowers Muslim women with reliable scholarship. Browse our women\'s collection and order now.',
      'Get this valuable {lang} women\'s Islamic resource from Bab-ul-Fatah Pakistan for {price}. {title} covers menstruation rulings, dress code, Ramadan, and more. Order online with nationwide shipping.',
    ],
  },

  // ── Companions ───────────────────────────────────────────────────────────
  companions: {
    opens: [
      'The Companions of Prophet Muhammad (peace be upon him) — the men and women who accepted Islam during his lifetime, supported his mission through extraordinary sacrifice, and transmitted the religion to subsequent generations — represent the highest standard of human character and dedication that the Muslim Ummah has ever produced. This {lang} publication, {title}, brings the inspiring stories of these remarkable individuals to life through narratives that capture their courage, wisdom, generosity, and unwavering commitment to the principles of Islam, providing readers of every generation with role models whose examples continue to illuminate the path of righteous conduct.',
      'Every generation of Muslims has drawn spiritual strength from the stories of the Sahabah — the Companions who abandoned their homes, their wealth, and sometimes their lives for the sake of Islam, who stood by the Prophet (peace be upon him) through persecution and warfare, and who built the foundations of the civilization that carried Islamic knowledge to every corner of the known world. This {lang} work titled {title} preserves and presents those stories with scholarly accuracy and narrative engagement, ensuring that the legacy of the Companions continues to inspire, educate, and guide Muslims who encounter their remarkable examples through these pages.',
      'The study of the Companions\' lives serves purposes far beyond mere historical interest — it provides living demonstrations of how Islamic principles translate into concrete action under the most challenging circumstances, how faith manifests in moments of crisis and decision, and how ordinary human beings are transformed by their commitment to divine guidance into individuals of extraordinary character and accomplishment. This {lang} book, {title}, approaches the study of the Sahabah with that deeper purpose in mind, presenting each Companion\'s story not merely as a historical account but as a source of practical spiritual lessons that readers can apply to their own lives.',
      'Among the countless Companions of Prophet Muhammad (peace be upon him), certain individuals stand out for their unique contributions to the early Muslim community — military commanders who achieved victories against overwhelming odds, scholars who preserved the Prophetic traditions, diplomats who negotiated with empires, and ordinary believers whose quiet acts of devotion and service left an indelible mark on Islamic history. This {lang} publication, {title}, focuses on these exceptional figures whose stories demonstrate the extraordinary range of talent and dedication that Islam awakened in those who embraced it fully.',
      'The history of Islam\'s earliest decades — preserved through the memories and testimonies of those who lived it — reads like no other historical narrative, combining military campaigns of strategic brilliance, acts of personal courage that defy comprehension, displays of moral authority that humbled kings, and examples of spiritual devotion that continue to move readers to tears more than fourteen centuries later. This {lang} compilation titled {title} curates the most powerful and instructive of those narratives, presenting them in a format that makes this extraordinary history accessible and engaging for Pakistani readers of all backgrounds.',
    ],
    mids: [
      'The narratives in this {lang} work have been compiled from the most authoritative sources of early Islamic history, with particular reliance on the chronicles of Ibn Sa\'d (al-Tabaqat al-Kubra), the historical works of al-Tabari and Ibn Kathir, and the authenticated Hadith collections of al-Bukhari and Muslim. Each account has been cross-referenced against multiple sources to ensure historical accuracy, and where sources present varying details of the same event, the compiler has presented the most well-supported version while noting alternative accounts where they contribute to a fuller understanding. The {lang} prose style prioritizes narrative engagement without sacrificing scholarly precision — readers will find themselves drawn into the stories while simultaneously absorbing accurate historical information. The thematic organization allows readers to explore the Companions\' contributions to specific aspects of Islamic civilization — military leadership, scholarly endeavor, governance, and personal piety. For Pakistani readers seeking to strengthen their connection to the foundational generation of Islam, this {lang} edition provides an accessible and reliable entry point into one of history\'s most inspiring chapters.',
      'This {lang} Companion-focused publication distinguishes itself through its attention to the human dimensions of these historical figures — their emotions, their struggles, their moments of doubt and their triumphs of faith — details that are often omitted from more conventional historical accounts but which make the Companions\' stories resonate with contemporary readers on a deeply personal level. The compiler has drawn upon the rich biographical literature of Islamic scholarship to present rounded portraits of these remarkable individuals rather than one-dimensional heroic archetypes, showing how their humanity and their faith interacted to produce the extraordinary achievements for which they are remembered. The physical production — clear typography, durable binding, and attractive cover design — makes this a book that readers will be proud to display in their homes and recommend to their friends and families. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} publication offers exceptional value for readers who wish to draw inspiration from the lives of Islam\'s greatest generation.',
    ],
    closes: [
      'Explore the inspiring lives of Islam\'s earliest heroes with this {lang} collection from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers timeless lessons in faith, courage, and sacrifice. Order online for delivery to any city in Pakistan.',
      'Order this comprehensive {lang} history of the Companions from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} is a must-read for every Muslim household. Shop with reliable nationwide delivery.',
      'Bring home these powerful {lang} accounts of the Sahabah by ordering {title} from Bab-ul-Fatah Pakistan. At {price}, this edition provides authentic, scholarly narratives of Islam\'s greatest generation. Order online with fast nationwide shipping.',
    ],
  },

  // ── Biography ──────────────────────────────────────────────────────────────
  biography: {
    opens: [
      'The lives of Islam\'s great figures — whether Prophets, Companions, scholars, or reformers — provide a continuous chain of inspiration that links every generation of Muslims to the foundational principles of their faith, demonstrating through concrete human experience how those principles produce individuals of extraordinary character, achievement, and spiritual depth. This {lang} publication, {title}, contributes to that chain of inspiration by presenting carefully researched biographical narratives that capture the essential qualities of the figures it portrays while drawing practical lessons that readers can apply to their own spiritual development.',
      'Islamic biographical literature occupies a unique position in the broader tradition of historical writing — combining the analytical rigor of modern historiography with the spiritual insight that comes from understanding historical events as manifestations of divine wisdom and human faith responding to divine guidance. This {lang} work titled {title} exemplifies that dual perspective, presenting the lives of its subjects with scholarly accuracy while also illuminating the spiritual lessons embedded in their experiences — the tests they endured, the choices they made, and the legacies they left for subsequent generations of Muslims.',
      'The stories of the Prophets — from Adam to Muhammad (peace be upon them all) — constitute the most ancient and enduring narrative tradition in human history, a tradition that Islam has preserved, authenticated, and transmitted with a degree of scholarly care unmatched by any other civilization\'s approach to its foundational narratives. This {lang} book, {title}, makes that rich narrative heritage accessible to Pakistani readers through engaging, well-sourced accounts that present each Prophet\'s story in a manner that is both historically informative and spiritually enriching, suitable for readers of all ages and backgrounds.',
      'Biography serves a uniquely powerful educational function in Islamic tradition — by presenting abstract moral principles through the concrete experiences of real human beings, biographical narratives transform concepts like courage, patience, justice, and generosity from abstract ideals into achievable aspirations that readers can emulate in their own lives. This {lang} publication, {title}, leverages that educational power by selecting biographical subjects whose lives exemplify the Islamic virtues most needed by contemporary Muslims, presenting their stories with a level of detail and narrative quality that brings their experiences vividly to life.',
      'The children\'s story book genre within Islamic literature occupies a special place in the hearts of Muslim parents who recognize that the stories children absorb during their formative years shape their moral development, their religious identity, and their emotional connection to Islam for the rest of their lives. This {lang} collection, {title}, has been designed specifically to fulfill that formative role, presenting the stories of the Prophets and other Islamic heroes in language and formats that engage young readers while maintaining the accuracy and respect that these sacred narratives deserve.',
    ],
    mids: [
      'The biographical accounts in this {lang} publication have been compiled from the most trusted sources of Islamic historical literature, with primary reliance on the Quranic narrative where applicable and supplementation from the authenticated Hadith collections and the classical works of Islamic historiography. Each biographical sketch presents the key events of the subject\'s life in chronological order, with attention to the historical context that shaped their decisions and the spiritual lessons that can be drawn from their experiences. The {lang} prose maintains a narrative quality that sustains reader engagement while ensuring that every factual claim is grounded in verified sources. Where historical sources present different accounts of the same event, the compiler has acknowledged the variations and presented the most well-supported version. The thematic organization allows readers to explore the contributions of biographical subjects to specific domains — military leadership, scholarly achievement, spiritual devotion, or social reform. For Pakistani readers seeking to enrich their understanding of Islam through the lives of its greatest exemplars, this {lang} edition provides an engaging and reliable resource. Bab-ul-Fatah offers this title at {price}, making quality Islamic biographical literature accessible to a wide readership.',
      'The production quality of this {lang} biographical work reflects the significance of its content — clear typography that makes extended reading comfortable, durable binding that withstands repeated handling, and a layout design that incorporates visual aids where appropriate to enhance reader engagement. For multi-volume or multi-book sets like this {lang} collection, the individual volumes or books have been designed for both standalone reading and sequential study, enabling readers to approach the material in whatever manner best suits their interests and available time. The content has been calibrated to serve multiple audiences — younger readers who are encountering these stories for the first time, intermediate students who seek deeper historical context, and adult readers who wish to refresh their knowledge while drawing fresh spiritual insights from familiar narratives. Available from Bab-ul-Fatah Pakistan at {price}, this {lang} biographical collection represents outstanding value for families, schools, and individual readers.',
    ],
    closes: [
      'Order this inspiring {lang} biographical collection from Bab-ul-Fatah Pakistan for {price}. {title} brings the stories of Islam\'s great figures to vivid life. Shop online with delivery to all cities across Pakistan.',
      'Purchase this engaging {lang} biography from Bab-ul-Fatah Pakistan. At {price}, {title} provides scholarly yet accessible life stories of Islamic heroes. Order today for reliable nationwide shipping.',
      'Get this comprehensive {lang} biographical work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is perfect for families, schools, and personal reading. Order online with nationwide delivery.',
    ],
  },

  // ── Prayer Supplication ─────────────────────────────────────────────────
  prayer: {
    opens: [
      'The daily practice of dhikr — the remembrance of Allah through prescribed words of praise, supplication, and glorification — occupies a central position in Islamic spirituality, functioning as the spiritual sustenance that nourishes a Muslim\'s connection to their Creator throughout the day\'s shifting circumstances of joy, hardship, routine, and crisis. This {lang} publication, {title}, provides a comprehensive collection of authentic azkar and supplications drawn from the prophetic tradition, organized and formatted for practical daily use by Muslims who wish to maintain a constant state of remembrance as the Quran instructs: "Verily, in the remembrance of Allah do hearts find rest."',
      'Protection from spiritual harm — including the influences of jinn, the evil eye, black magic, and negative spiritual forces — is a concern that Islam addresses directly through specific supplications and acts of worship prescribed by Prophet Muhammad (peace be upon him) as shields against unseen dangers. This {lang} work titled {title} compiles those protective measures from the authenticated Hadith literature, presenting them alongside their source references and practical instructions for implementation, empowering Muslims to safeguard themselves and their families through the spiritual remedies that the Prophet (peace be upon him) recommended.',
      'The Islamic tradition of azkar — structured verbal remembrances prescribed for specific times, occasions, and needs — represents one of the most accessible and powerful forms of worship available to every Muslim regardless of their circumstances, requiring no special preparation, no physical resources, and no minimum time commitment beyond what the worshipper can reasonably manage. This {lang} compilation, {title}, organizes these azkar into a practical reference format that makes it easy for readers to find the appropriate supplication for any situation, from the morning and evening adhkar to specific duas for protection, healing, guidance, and forgiveness.',
    ],
    mids: [
      'This {lang} supplication and protection guide has been assembled from the most authoritative collections of prophetic traditions, with particular attention to the narrations that address spiritual protection and the remembrance of Allah. Each supplication is presented in its original Arabic alongside its {lang} translation and, where helpful, transliteration for readers who are still developing their Arabic reading skills. The Hadith source is clearly cited for every entry, enabling readers to verify the authenticity of each supplication independently. The thematic organization covers the full range of situations for which the Prophet (peace be upon him) prescribed specific azkar — including protection from jinn and evil eye, morning and evening remembrances, supplications before sleep and upon waking, duas for entering and leaving the home, and invocations for safety during travel. The practical instructions accompanying each supplication explain not only what to say but how and when to say it, based on the authentic narrations describing the Prophet\'s own practice. Bab-ul-Fatah Pakistan offers this {lang} spiritual protection guide at {price}, making this essential knowledge accessible to Muslims throughout Pakistan.',
      'The compiler of this {lang} collection has taken special care to distinguish between authentically narrated supplications and those reported through weaker chains of transmission, ensuring that readers can rely upon the material presented here with full confidence. The supplications have been organized into logical categories that facilitate quick reference during moments when the reader needs specific guidance — for example, when seeking protection from a disturbing dream, when experiencing anxiety or fear, or when performing the ruqyah (spiritual healing) prescribed in the Sunnah for those affected by spiritual harm. The {lang} commentary contextualizes each supplication within the broader framework of Islamic spiritual practice, helping readers understand not only the words to recite but the spiritual principles that give those words their power and efficacy. The durable construction and portable sizing make this a practical daily companion that can be kept in a pocket, bag, or bedside table for constant access.',
    ],
    closes: [
      'Order this essential {lang} supplication and protection guide from Bab-ul-Fatah Pakistan for {price}. {title} provides authentic azkar for daily remembrance and spiritual safety. Shop online with delivery to all cities across Pakistan.',
      'Get this comprehensive {lang} dua collection from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} covers all essential Islamic supplications and protective measures. Order today for reliable nationwide shipping.',
      'Strengthen your spiritual practice with this {lang} azkar reference from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers authenticated supplications for every occasion. Browse our prayer collection online and enjoy nationwide delivery.',
    ],
  },

  // ── Health (Islamic Medicine) ────────────────────────────────────────────
  health: {
    opens: [
      'The prophetic tradition of medicine — known as Tibb al-Nabawi — encompasses the health recommendations, remedies, and preventive practices that Prophet Muhammad (peace be upon him) prescribed for his Companions and the wider Muslim community, drawing upon divinely inspired knowledge that often anticipated discoveries of modern medical science by centuries. This {lang} publication, {title}, presents that prophetic medical heritage in a comprehensive, well-organized format that bridges the gap between traditional Islamic healing practices and contemporary health awareness, offering readers a holistic approach to wellness rooted in the authentic Sunnah.',
      'Islam\'s approach to health and healing recognizes the human body as an amanah (trust) from Allah that must be cared for with the same diligence and gratitude that one brings to the care of any precious possession — a perspective that encourages proactive health maintenance, sensible dietary practices, and the use of natural remedies that the Prophet (peace be upon him) recommended. This {lang} work titled {title} elaborates on that Islamic health philosophy by presenting the specific medical advice recorded in the authentic Hadith literature alongside practical guidance for its implementation in the context of contemporary Pakistani life.',
      'The intersection of Islamic spiritual practice and physical health is a topic of growing interest among Muslims worldwide — as scientific research increasingly validates many of the health recommendations embedded in the prophetic tradition, from the benefits of fasting and moderation in diet to the therapeutic properties of honey, black seed, and other natural remedies mentioned in the Quran and Hadith. This {lang} book, {title}, explores that intersection by presenting Islamic medical guidance in a format that respects both the spiritual significance of the prophetic recommendations and the empirical evidence supporting their health benefits.',
    ],
    mids: [
      'This {lang} health publication draws upon the authenticated Hadith collections to compile the Prophet\'s specific recommendations regarding diet, hygiene, exercise, sleep, and the treatment of common ailments. Each recommendation is presented with its Hadith source and chain of authentication, ensuring that readers can distinguish between well-authenticated prophetic medical advice and remedies attributed to the Sunnah through weaker narrations. The {lang} commentary contextualizes each recommendation within both the historical medical framework of the Prophet\'s time and the perspective of modern health science, noting where contemporary research has confirmed, refined, or expanded upon the prophetic guidance. Practical implementation guidelines help Pakistani readers incorporate these health recommendations into their daily routines, with attention to locally available ingredients and remedies that align with the prophetic prescriptions. The production quality — clear typography, durable binding, and well-organized layout — makes this a reference that readers will consult frequently for practical health guidance grounded in Islamic tradition. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} health guide represents a valuable investment in both spiritual and physical well-being.',
    ],
    closes: [
      'Order this {lang} Islamic health guide from Bab-ul-Fatah Pakistan for {price}. {title} combines prophetic medical wisdom with practical health advice. Shop online with delivery to all cities in Pakistan.',
      'Purchase this insightful {lang} work on Tibb al-Nabawi from Bab-ul-Fatah Pakistan. At {price}, {title} offers a holistic approach to health rooted in the Sunnah. Order today for reliable nationwide shipping.',
      'Invest in your well-being with this {lang} Islamic medicine reference from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} bridges prophetic healing and modern health science. Order online with nationwide delivery.',
    ],
  },

  // ── History ───────────────────────────────────────────────────────────────
  history: {
    opens: [
      'Islamic history — spanning fourteen centuries of continuous civilization across every inhabited continent — offers an unparalleled record of human achievement in fields ranging from governance and jurisprudence to science, art, architecture, and spiritual development. This {lang} publication, {title}, presents a carefully curated selection from that vast historical record, focusing on the events, institutions, and personalities that have been most consequential in shaping the trajectory of Islamic civilization and the experiences of Muslim communities worldwide.',
      'Understanding the historical development of Islam — from its origins in the Arabian Peninsula through its expansion across three continents and its evolution into the diverse global civilization that exists today — is essential for any Muslim who wishes to appreciate the richness of their heritage and the magnitude of the contributions that Islamic civilization has made to human knowledge and welfare. This {lang} work titled {title} provides that understanding through a narrative approach that combines scholarly accuracy with engaging storytelling, making Islamic history accessible and compelling for Pakistani readers of all backgrounds.',
      'The visual documentation of Islam\'s most sacred sites — particularly the two Holy Mosques of Makkah and Madinah — serves a profoundly important function in the religious and cultural life of Muslims worldwide, enabling those who have not yet performed Hajj or Umrah to connect visually with the centers of their faith and providing pilgrims with a lasting record of their spiritual journey. This {lang} album, {title}, fulfills that function through a collection of high-quality photographs that capture the architectural grandeur, spiritual atmosphere, and historical significance of these sacred spaces.',
    ],
    mids: [
      'This {lang} historical publication has been compiled from the most authoritative sources available for the periods and subjects it covers. The narrative draws upon classical Islamic historiography — including the works of al-Tabari, al-Masudi, Ibn Kathir, and Ibn Khaldun — supplemented by contemporary scholarly research that has refined and expanded our understanding of specific historical events and developments. The {lang} prose style maintains a balance between scholarly precision and narrative engagement, presenting historical information in a manner that is both informative and absorbing. For the visual album format, the photographs have been selected for their quality, composition, and ability to convey the spiritual atmosphere of the sacred sites. Each image is accompanied by explanatory text that provides historical context and identifies the specific features and locations depicted. The physical production — premium paper stock, durable binding, and high-resolution printing — ensures that this {lang} edition meets the highest visual standards. Bab-ul-Fatah Pakistan offers this {lang} historical work at {price}, making quality Islamic history accessible to readers throughout the country.',
    ],
    closes: [
      'Order this {lang} historical work from Bab-ul-Fatah Pakistan for {price}. {title} provides an engaging, scholarly account of Islamic heritage. Shop online with delivery to all cities in Pakistan.',
      'Purchase this beautifully produced {lang} Islamic history publication from Bab-ul-Fatah Pakistan. At {price}, {title} is a valuable addition to any Islamic library. Order today for reliable nationwide shipping.',
      'Explore Islamic history with this {lang} title from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers both scholarly depth and visual beauty. Order online with nationwide delivery.',
    ],
  },

  // ── Children ──────────────────────────────────────────────────────────────
  children: {
    opens: [
      'Children\'s Islamic literature serves a sacred function in the formation of young Muslim identities — planting the seeds of faith, moral character, and cultural pride at the most receptive stage of human development, when the stories a child absorbs become the framework through which they understand themselves and their relationship with the world. This {lang} publication, {title}, fulfills that function by presenting Islamic knowledge and values through narratives that engage young imaginations while conveying authentic religious content that parents and educators can endorse with confidence.',
      'The story of Prophet Musa (peace be upon him) — his confrontation with Pharaoh, his miraculous experiences, and his ultimate triumph through divine support — is among the most dramatic and frequently recounted narratives in the Quran, offering children a powerful example of courage, faith, and trust in Allah that resonates across cultures and generations. This {lang} book, {title}, retells that unforgettable story in language and a format specifically designed for young readers, making one of the Quran\'s most compelling narratives accessible and engaging for children who are building their first connections to Islamic scripture.',
      'Instilling compassion for animals through the lens of Islamic teaching provides children with both a moral framework for their treatment of other creatures and a tangible demonstration of Islam\'s concern for all of Allah\'s creation — a concern expressed through numerous Hadith narrations that encourage kindness to animals and prohibit cruelty toward them. This {lang} work titled {title} combines engaging narrative with authentic Islamic guidance to teach children that compassion is not merely a personal preference but a religious obligation that reflects the broader Islamic principle of stewardship over the natural world.',
    ],
    mids: [
      'This {lang} children\'s publication has been designed with the developmental needs of young readers firmly in mind. The language is age-appropriate — using vocabulary and sentence structures that challenge children to expand their reading skills without overwhelming them. The narrative pacing keeps attention focused through a combination of dialogue, action, and reflective moments that encourage children to think about the moral and spiritual lessons embedded in each story. The illustrations — where included — complement the text by providing visual anchors that help children visualize the settings, characters, and events described in the narrative. Each story concludes with a brief reflection or discussion prompt that parents and teachers can use to engage children in conversations about the Islamic values demonstrated in the narrative. The content has been verified against authentic Islamic sources to ensure that every detail aligns with the Quranic and Prophetic accounts. The physical production — with durable binding, child-friendly sizing, and wipe-clean covers where applicable — has been optimized for the practical demands of children\'s use. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} children\'s title is an excellent investment in the religious and moral development of the young Muslims in your life.',
    ],
    closes: [
      'Order this engaging {lang} children\'s Islamic book from Bab-ul-Fatah Pakistan for {price}. {title} makes Islamic learning fun and meaningful for young readers. Shop online with delivery to all cities in Pakistan.',
      'Purchase this wonderful {lang} children\'s story from Bab-ul-Fatah Pakistan. At {price}, {title} combines authentic Islamic content with child-friendly storytelling. Order today for reliable nationwide delivery.',
      'Invest in your child\'s Islamic education with this {lang} title from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is perfect for young Muslim readers. Browse our children\'s collection and order now.',
    ],
  },

  // ── Family ─────────────────────────────────────────────────────────────────
  family: {
    opens: [
      'The family unit occupies a position of unparalleled importance in Islamic social teaching — the Quran describes marriage as a relationship of "tranquility, mercy, and affection" (30:21), and the Prophet (peace be upon him) identified the family as the foundation of a healthy society and the primary arena in which Islamic values are transmitted from one generation to the next. This {lang} publication, {title}, addresses the family from that Islamic perspective, offering guidance that draws upon the Quran, the authenticated Sunnah, and the accumulated wisdom of Islamic scholarship to help Muslim families build strong, loving, and faith-centered homes.',
      'The Islamic concept of family extends beyond the nuclear household to encompass a web of mutual responsibilities and reciprocal rights that bind parents to children, spouses to each other, and extended family members into a cohesive social structure characterized by support, respect, and compassion. This {lang} work titled {title} explores that broader concept of family by addressing the full range of family relationships — parent-child dynamics, marital harmony, elder care, and the Islamic principles that should govern each interaction — providing readers with a comprehensive guide to building and maintaining families that reflect Islamic values in their daily functioning.',
      'The Quran and Sunnah establish clear guidelines for every dimension of family life — from the selection of a spouse and the establishment of a new household to the upbringing of children, the management of domestic affairs, and the resolution of conflicts that inevitably arise within even the most harmonious families. This {lang} book, {title}, presents those guidelines in a practical, organized format that enables readers to find specific guidance for the family situations they encounter, with every recommendation supported by evidence from authentic Islamic sources.',
    ],
    mids: [
      'This {lang} family guidance publication addresses the full spectrum of topics that affect Muslim families in contemporary society. The content covers the selection of a spouse according to Islamic criteria, the rights and responsibilities of husbands and wives as defined by the Quran and Sunnah, the Islamic approach to child-rearing and character development, the management of family finances according to Shariah principles, the resolution of marital and inter-family disputes through Islamic mediation, and the cultivation of a home environment that nurtures faith, knowledge, and emotional well-being. Each topic is addressed with reference to the relevant Quranic verses and authenticated Hadith narrations, and where applicable, the work includes practical advice from Islamic family counselors and scholars who have extensive experience guiding Muslim families through contemporary challenges. The {lang} prose is warm and accessible, avoiding the kind of rigid legalism that can make family guidance books feel impersonal and prescriptive. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} family resource provides essential guidance for building strong, faith-centered Muslim homes.',
    ],
    closes: [
      'Order this {lang} family guidance book from Bab-ul-Fatah Pakistan for {price}. {title} offers Islamic wisdom for building strong, loving families. Shop online with delivery to all cities in Pakistan.',
      'Purchase this insightful {lang} family resource — {title} — from Bab-ul-Fatah Pakistan for {price}. Practical Islamic guidance for every stage of family life. Order today with fast nationwide delivery.',
      'Invest in your family\'s well-being by ordering {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this book strengthens Muslim households through authentic guidance. Browse our family collection and order now.',
    ],
  },

  // ── Prophets Seerah ──────────────────────────────────────────────────────
  seerah: {
    opens: [
      'The study of the Prophets\' lives — their missions, their struggles, their miracles, and the lasting impact of their teachings on human civilization — represents one of the most spiritually enriching and intellectually rewarding areas of Islamic scholarship, providing Muslims with a comprehensive understanding of how divine guidance has been communicated to humanity across successive generations of prophetic mission. This {lang} publication, {title}, presents that understanding through a thorough, well-sourced treatment of prophetic history that draws upon the Quranic narrative, authenticated Hadith, and classical Islamic historiography.',
      'The concept of prophethood (nubuwwah) in Islam encompasses a continuous chain of divine guidance extending from the first human being, Adam (peace be upon him), through the final messenger, Muhammad (peace be upon him), with each Prophet contributing to humanity\'s understanding of Allah, the purpose of existence, and the principles of righteous conduct. This {lang} work titled {title} traces that prophetic chain with scholarly precision, presenting each Prophet\'s mission within its historical context while highlighting the universal themes — Tawheed, justice, compassion, and accountability — that unite all prophetic messages into a single, coherent divine program.',
      'The Messenger of Allah, Muhammad (peace be upon him), described as Khatam al-Anbiya (the Seal of the Prophets), stands at the culmination of the prophetic tradition — perfecting and completing the guidance that all previous Prophets conveyed, establishing the final and most comprehensive revelation, and providing through his personal example a model of human excellence that remains unmatched in the annals of history. This {lang} publication, {title}, explores the life and mission of the final Prophet in a manner that conveys both the historical magnitude of his achievements and the enduring relevance of his example for Muslims in every era.',
    ],
    mids: [
      'This {lang} seerah and prophetic history publication has been compiled from the most authoritative sources available in Islamic literature. The primary framework is provided by the Quranic narrative, supplemented by the authenticated Hadith collections of al-Bukhari, Muslim, and other recognized compilers, and enriched by the classical works of seerah scholarship including those of Ibn Ishaq, Ibn Hisham, al-Waqidi, and Ibn Kathir. Each prophetic figure is presented within their historical context — the civilization in which they lived, the challenges they confronted, and the communities they addressed — enabling readers to appreciate the specific circumstances that shaped each prophetic mission. The {lang} commentary connects the historical narratives to contemporary applications, demonstrating how the lessons derived from the Prophets\' experiences remain relevant to the challenges facing Muslims today. The physical production — clear typography, durable binding, and well-organized chapters with a comprehensive index — ensures that this {lang} edition serves effectively as both a sequential reading text and a topical reference work. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} publication is a valuable addition to any Islamic library.',
    ],
    closes: [
      'Order this comprehensive {lang} seerah and prophetic history work from Bab-ul-Fatah Pakistan for {price}. {title} provides thorough, well-sourced narratives of the Prophets\' lives. Shop online with delivery across all cities in Pakistan.',
      'Purchase this authoritative {lang} publication on the Prophets from Bab-ul-Fatah Pakistan. At {price}, {title} traces the chain of prophethood from Adam to Muhammad. Order today for reliable nationwide shipping.',
      'Get this essential {lang} prophetic history from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} deepens understanding of divine guidance through the ages. Order online with nationwide delivery.',
    ],
  },

  // ── General ───────────────────────────────────────────────────────────────
  general: {
    opens: [
      'The concepts of Jannat (paradise) and Dozakh (hell) occupy a central position in Islamic eschatology — serving as the ultimate motivators for righteous conduct and the clearest expressions of divine justice in the Islamic worldview, where every soul will receive exactly what its deeds have earned through an accountability that is both absolutely fair and infinitely merciful. This {lang} publication, {title}, presents the detailed descriptions of paradise and hell provided in the Quran and authenticated Hadith, offering readers a vivid, source-based understanding of the eternal destinations that await every human being.',
      'The detailed Quranic and prophetic descriptions of Jannat — with its rivers of milk and honey, its gardens of perpetual bliss, its companionship with the righteous, and above all, the vision of Allah that constitutes the greatest reward of paradise — paint a picture of eternal fulfillment that transcends any pleasure or satisfaction available in worldly life. This {lang} work titled {title} compiles those descriptions from their original sources, presenting them in a format that simultaneously inspires hope and motivates the righteous conduct that leads to their attainment.',
      'The sermons of the Haram — delivered in the sacred precincts of Makkah\'s Grand Mosque by scholars of recognized authority — carry a spiritual weight that few other forms of Islamic discourse can match, combining the gravitas of the sacred setting with the scholarly depth of the preachers and the emotional power of addressing a congregation that includes Muslims from every corner of the globe. This {lang} publication, {title}, preserves the content of those memorable sermons, enabling readers who were not present to benefit from the guidance, exhortation, and spiritual insight that they delivered.',
      'Dream interpretation in Islam — known as ta\'bir al-ru\'ya — represents a recognized branch of Islamic knowledge with a well-documented scholarly tradition, grounded in the Quranic principle that true dreams are among the forty-six parts of prophethood and guided by the authenticated Hadith narrations in which Prophet Muhammad (peace be upon him) interpreted the dreams of his Companions with remarkable accuracy. This {lang} work, {title}, provides a comprehensive guide to Islamic dream interpretation, drawing upon the established scholarly sources and presenting the interpretive principles that enable readers to understand the symbolic language of their dreams.',
      'The spiritual benefits of regularly reciting and reflecting upon Surah Al-Fatiha — the opening chapter of the Quran that Muslims repeat in every unit of prayer — extend far beyond its obligatory recitation, encompassing layers of meaning, spiritual power, and divine connection that scholars have explored throughout Islamic history. This {lang} publication, {title}, presents a collection of sermons dedicated to exploring the depths of Surah Al-Fatiha, drawing upon classical tafsir, Hadith commentary, and the insights of renowned Islamic scholars to illuminate every phrase of this most frequently recited Quranic chapter.',
    ],
    mids: [
      'This {lang} publication has been compiled with careful attention to the authenticity of its source material and the clarity of its presentation. The content draws primarily upon the Quran and the authenticated Hadith collections, supplemented by the classical scholarly works that represent the established consensus of Islamic scholarship on the topics addressed. Each claim is supported by its evidentiary basis, enabling readers to verify the information independently and develop confidence in the knowledge they acquire. The {lang} prose maintains a readability that accommodates both sequential study and targeted consultation, while the organizational structure — logical chapter arrangement, clear headings, and a comprehensive index where applicable — facilitates quick location of specific topics. The production quality reflects Bab-ul-Fatah Pakistan\'s commitment to providing readers with Islamic publications that combine scholarly trustworthiness with practical usability. Available at {price}, this {lang} edition offers exceptional value for readers seeking to deepen their understanding of these important Islamic topics.',
      'The scholarly methodology behind this {lang} work reflects a commitment to the classical principles of Islamic knowledge transmission — tracing every piece of information back through its chain of authority to the primary texts of Islam, evaluating the strength of the evidence supporting each claim, and presenting the material in a manner that respects both the intellect and the spiritual sensibilities of the reader. The compiler has consulted multiple authoritative sources to ensure comprehensive coverage of each topic, and where scholarly differences of opinion exist, the work acknowledges those differences while guiding readers toward the positions best supported by the available evidence. The practical focus of the content — addressing the questions and concerns that ordinary Muslims encounter in their daily lives — makes this {lang} publication immediately useful for personal study, family reading, and educational purposes.',
    ],
    closes: [
      'Order this {lang} publication from Bab-ul-Fatah Pakistan for {price}. {title} provides valuable Islamic knowledge on essential topics. Shop online with delivery to all cities in Pakistan.',
      'Purchase this insightful {lang} work — {title} — from Bab-ul-Fatah Pakistan for {price}. Authentic, well-sourced Islamic content for every Muslim household. Order today with fast, reliable nationwide delivery.',
      'Invest in your spiritual knowledge by ordering {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, this publication offers scholarly depth and practical relevance. Browse our collection and order now.',
    ],
  },

  // ── Reference ──────────────────────────────────────────────────────────────
  reference: {
    opens: [
      'Comprehensive Islamic reference works serve as the backbone of serious religious scholarship — providing the kind of broad, deep, and meticulously sourced knowledge base that imams, educators, researchers, and advanced students require to address the complex religious questions that arise in contemporary Muslim communities. This {lang} publication, {title}, fulfills that reference function by compiling authoritative information on its subject in a format optimized for consultation, supporting both systematic study and quick reference for specific queries.',
      'The production of a reliable Islamic reference work demands scholarly rigor at every stage — from the selection and verification of source material through the organization and presentation of content to the preparation of indexes and cross-references that make the accumulated knowledge accessible to readers. This {lang} book, {title}, has been produced with that full rigor, drawing upon the most authoritative Islamic sources and subjecting every piece of information to the verification standards that reference works require, emerging as a resource that scholars and general readers alike can consult with confidence.',
    ],
    mids: [
      'This {lang} reference work has been compiled by scholars with demonstrated expertise in the relevant Islamic discipline, drawing upon the primary texts of the Quran and authenticated Hadith as well as the major secondary sources of Islamic scholarship. The content has been organized to facilitate both sequential reading and targeted consultation, with clear chapter divisions, logical topic arrangement, and a comprehensive index that enables readers to locate specific information quickly and efficiently. Where the subject matter involves legal rulings or scholarly opinions, each position is attributed to its source and accompanied by the evidence supporting it. The physical production — durable binding, clear typography, and generous margins for annotations — has been designed to withstand the heavy use that reference works typically receive. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} reference title represents a significant addition to any serious Islamic library.',
    ],
    closes: [
      'Order this authoritative {lang} Islamic reference from Bab-ul-Fatah Pakistan for {price}. {title} is an indispensable resource for scholars, imams, and students. Shop online with delivery to all cities in Pakistan.',
      'Purchase this comprehensive {lang} reference work — {title} — from Bab-ul-Fatah Pakistan for {price}. Thoroughly researched and meticulously organized. Order today for reliable nationwide shipping.',
    ],
  },

  // ── Faith Aqeedah ─────────────────────────────────────────────────────────
  faith: {
    opens: [
      'Islamic creed — the set of beliefs concerning Allah, His attributes, His messengers, the unseen realm, and the ultimate destiny of human beings — constitutes the foundation upon which every other aspect of Islamic practice and spirituality is built, making the correct understanding and articulation of aqeedah a matter of the utmost importance for every Muslim. This {lang} publication, {title}, addresses that importance by presenting the principles of Islamic creed with scholarly precision and evidentiary thoroughness, grounding every article of faith in the primary texts of the Quran and authenticated Sunnah.',
      'The science of Islamic theology (ilm al-aqeedah) has been a central concern of Muslim scholars since the earliest generations of Islam — because the correctness of a Muslim\'s beliefs directly affects the validity of their worship, the soundness of their religious practice, and the quality of their relationship with Allah. This {lang} work titled {title} contributes to that scholarly tradition by presenting the orthodox understanding of Islamic creed as established by the righteous predecessors, with particular attention to clarifying misconceptions and addressing the theological errors that have appeared in various Muslim communities throughout history.',
      'The distinction between Islam and superstition — between authentic religious belief and the kind of magical thinking, folk practices, and unfounded beliefs that can contaminate a Muslim\'s understanding of their faith — is a distinction that every Muslim must learn to draw clearly if they wish to practice their religion in accordance with divine guidance. This {lang} publication, {title}, addresses that need by examining the reality of magic and superstition from an Islamic perspective, separating what the Quran and Sunnah actually teach about the unseen from the myths, misconceptions, and fabricated practices that have accumulated around these topics in various cultures.',
    ],
    mids: [
      'This {lang} publication on Islamic creed has been prepared by scholars with expertise in the science of aqeedah, drawing upon the established scholarly works of the major schools of Islamic theology while grounding every claim in the primary texts of the Quran and authenticated Hadith. The presentation follows a logical progression — beginning with the most fundamental article of faith (Tawheed) and advancing through the remaining pillars of iman in a sequence that builds understanding cumulatively. Where theological controversies exist, the work identifies the orthodox position and presents the evidentiary basis for that position while acknowledging alternative views with their respective evidences. The {lang} prose is clear and precise, avoiding unnecessary theological jargon while maintaining the scholarly accuracy that the subject demands. The production quality — including durable binding, clear typography, and a comprehensive index — ensures that this reference will serve reliably for extended use. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} aqeedah publication provides essential knowledge for every Muslim household.',
    ],
    closes: [
      'Order this {lang} publication on Islamic creed from Bab-ul-Fatah Pakistan for {price}. {title} clarifies the foundations of Islamic belief with scholarly precision. Shop online with delivery to all cities in Pakistan.',
      'Purchase this authoritative {lang} work on aqeedah — {title} — from Bab-ul-Fatah Pakistan for {price}. Essential reading for every Muslim seeking correct understanding of faith. Order today with fast nationwide delivery.',
    ],
  },

  // ── Imams Scholars ─────────────────────────────────────────────────────────
  scholars: {
    opens: [
      'The great scholars of Islamic history — the imams, muhaddithin, fuqaha, and mufassirun who dedicated their lives to preserving, interpreting, and transmitting the knowledge of Islam — represent the intellectual backbone of the Muslim Ummah, the individuals whose monumental scholarly efforts ensured that the guidance of the Quran and Sunnah would remain accessible and applicable to every generation of Muslims. This {lang} publication, {title}, brings the stories of these intellectual giants to life, presenting their biographies with scholarly accuracy and narrative engagement that conveys both the magnitude of their achievements and the depth of their personal piety.',
      'The study of Islamic scholarly biography — known as tarikh al-ulama or tabaqat al-fuqaha — serves a purpose far beyond mere historical documentation; it demonstrates through the lived experiences of exceptional individuals how the abstract principles of Islamic knowledge can be pursued with a level of dedication, discipline, and sacrifice that transforms scholarly effort into an act of worship. This {lang} work titled {title} presents the biographies of selected Islamic scholars in a manner that captures both their intellectual contributions and their personal spiritual qualities, offering readers role models whose examples continue to inspire the pursuit of Islamic knowledge.',
      'Imam Ahmad bin Hanbal — one of the four great imams of Islamic jurisprudence and a towering figure in the science of Hadith — exemplifies the kind of unwavering commitment to authentic Islamic knowledge that has defined the greatest scholars throughout Muslim history, enduring imprisonment, persecution, and physical hardship rather than compromise the principles of his faith. This {lang} publication, {title}, presents the life and legacy of this remarkable scholar in a format that conveys the full magnitude of his scholarly achievement and the depth of his personal conviction.',
    ],
    mids: [
      'The biographical narratives in this {lang} scholarly biography work have been compiled from the most authoritative sources of Islamic biographical literature, including the tabaqat (generational biographical) works of Ibn Sa\'d, al-Dhahabi, and al-Suyuti, supplemented by the historical chronicles of al-Tabari and Ibn Kathir and the authenticated Hadith collections that contain narrations about the scholars\' character and conduct. Each biography presents the key events of the scholar\'s life — their education, their teachers, their scholarly works, their methodology, and the trials they endured for the sake of knowledge — in a narrative format that sustains reader engagement while maintaining strict historical accuracy. The {lang} prose is accessible to general readers while providing the kind of detail that students of Islamic intellectual history will find valuable. The thematic organization allows readers to explore specific aspects of scholarly life — educational methodology, juristic reasoning, Hadith authentication, and the relationship between scholarship and political authority. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} publication offers an engaging gateway into the rich tradition of Islamic scholarly biography.',
    ],
    closes: [
      'Order this {lang} scholarly biography from Bab-ul-Fatah Pakistan for {price}. {title} brings the lives of Islam\'s greatest scholars to vivid life. Shop online with delivery to all cities in Pakistan.',
      'Purchase this inspiring {lang} biography of Islamic scholars from Bab-ul-Fatah Pakistan. At {price}, {title} offers timeless lessons in knowledge, dedication, and faith. Order today for reliable nationwide shipping.',
      'Get this insightful {lang} work on Islamic scholarship from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} profiles the intellectual giants of Islamic history. Order online with nationwide delivery.',
    ],
  },

  // ── Lifestyle ──────────────────────────────────────────────────────────────
  lifestyle: {
    opens: [
      'The Islamic approach to career development and professional life integrates spiritual principles with practical guidance — encouraging Muslims to seek lawful employment, perform their work with excellence and integrity, and view their professional endeavors not merely as a source of income but as a form of worship and service to the community. This {lang} publication, {title}, explores that Islamic perspective on work and career, providing guidance that helps Pakistani readers navigate the challenges of the job market while remaining faithful to Islamic values and principles of ethical conduct.',
      'Finding fulfilling employment that aligns with both one\'s professional aspirations and one\'s Islamic values represents a challenge that many young Muslims face in today\'s competitive and often ethically ambiguous job market — a challenge that requires not only practical job-search skills but also a clear understanding of what Islam considers permissible, desirable, and obligatory in the domain of work and livelihood. This {lang} work titled {title} addresses both dimensions of that challenge, combining Islamic guidance with practical career advice to help readers find employment that is both halal and satisfying.',
    ],
    mids: [
      'This {lang} lifestyle guide approaches the topic of employment and career from a comprehensive Islamic perspective. The content covers the Islamic principles governing work and livelihood — including the obligation to seek lawful employment, the prohibition of involvement in haram industries, the ethics of workplace conduct, the importance of professional excellence as a form of worship, and the Islamic perspective on wealth, ambition, and contentment. Practical advice is provided on job-search strategies, interview preparation, professional development, and the cultivation of skills that enhance employability, all framed within the ethical guidelines established by Islamic teaching. The {lang} prose is direct and motivational, encouraging readers to approach their career development with the same sincerity and effort that they bring to their religious obligations. The practical relevance of this guidance for Pakistani readers navigating the local job market makes this a particularly valuable resource for young professionals, recent graduates, and anyone seeking to align their professional life with their faith. Available at {price} from Bab-ul-Fatah Pakistan, this {lang} publication offers practical wisdom grounded in Islamic principles.',
    ],
    closes: [
      'Order this {lang} career guidance book from Bab-ul-Fatah Pakistan for {price}. {title} offers Islamic wisdom for professional success and fulfillment. Shop online with delivery to all cities in Pakistan.',
      'Purchase this practical {lang} lifestyle guide — {title} — from Bab-ul-Fatah Pakistan for {price}. Align your career with Islamic values and principles. Order today with fast nationwide delivery.',
    ],
  },
};

// ─── Description generator ────────────────────────────────────────────────────
function generateDescription(product, index) {
  const catKey = detectCatKey(product);
  const templates = T[catKey] || T.general;
  const lang = langName(product.language);
  const title = product.title;
  const price = formatPrice(product.price);

  // Pick template variants using hash of product title for deterministic but varied selection
  const hash = hashStr(product.title || '') + index;
  const openIdx = hash % templates.opens.length;
  const midIdx = (hash >> 4) % templates.mids.length;
  const closeIdx = (hash >> 8) % templates.closes.length;

  let desc = templates.opens[openIdx]
    .replace(/\{lang\}/g, lang)
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price);

  desc += '\n\n' + templates.mids[midIdx]
    .replace(/\{lang\}/g, lang)
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price);

  desc += '\n\n' + templates.closes[closeIdx]
    .replace(/\{lang\}/g, lang)
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price);

  return desc.trim();
}

// ─── Meta description generator ──────────────────────────────────────────────
function generateMetaDescription(product, index) {
  const lang = langName(product.language);
  const title = product.title;
  const price = formatPrice(product.price);
  const cat = ((product.category && product.category.name) || '').toLowerCase();

  const metaTemplates = [
    `Buy ${title} at Bab-ul-Fatah Pakistan for ${price}. ${lang} ${cat} book with authentic Islamic content. Order online with fast delivery across all cities in Pakistan.`,
    `Order ${title} — ${lang} ${cat} — from Bab-ul-Fatah Pakistan for just ${price}. Trusted Islamic books and resources. Shop now with nationwide delivery.`,
    `${title} available at Bab-ul-Fatah Pakistan for ${price}. Quality ${lang} ${cat} publication. Browse our Islamic bookstore and order with reliable shipping across Pakistan.`,
    `Shop ${title} online at Bab-ul-Fatah Pakistan for ${price}. Authentic ${lang} ${cat} content. Secure ordering with fast delivery to all Pakistani cities.`,
    `Get ${title} from Bab-ul-Fatah — Pakistan's leading Islamic bookstore — for ${price}. ${lang} ${cat} edition. Order today with nationwide shipping and secure packaging.`,
    `Purchase ${title} for ${price} at Bab-ul-Fatah Pakistan. ${lang} ${cat} book with reliable content. Order online for fast, secure delivery anywhere in Pakistan.`,
  ];

  const idx = (hashStr(product.title || '') + index) % metaTemplates.length;
  let meta = metaTemplates[idx]
    .replace(/\{lang\}/g, lang)
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{cat\}/g, cat);

  // Enforce 120-155 character limit
  if (meta.length > 155) meta = meta.substring(0, 152) + '...';
  if (meta.length < 120) {
    // Pad with Bab-ul-Fatah tagline
    const pad = ' Bab-ul-Fatah Pakistan.';
    if (meta.length + pad.length <= 155) meta += pad;
  }

  return meta;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Bab-ul-Fatah — SEO Batch 6 Description Writer             ║');
  console.log('║   Products 501–600 (skip 500, take 100, orderBy createdAt)  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ── Step 1: Fetch products ──────────────────────────────────────────────
    console.log('[1/5] Fetching products (skip 500, take 100) …');
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      skip: 500,
      take: 100,
      include: { category: true },
    });

    // Save to batch6-products.json
    const productsPath = path.join(__dirname, 'batch6-products.json');
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    console.log(`  Saved ${products.length} products → ${productsPath}\n`);

    // ── Step 2: Generate descriptions ──────────────────────────────────────
    console.log('[2/5] Generating descriptions …');
    const metaRecords = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
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

      if ((i + 1) % 25 === 0 || i === products.length - 1) {
        console.log(`  Processed ${i + 1}/${products.length}`);
      }
    }
    console.log();

    // ── Step 3: Update database ────────────────────────────────────────────
    console.log('[3/5] Updating database …');
    let updated = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const desc = generateDescription(p, i);
      await prisma.product.update({
        where: { id: p.id },
        data: { description: desc },
      });
      updated++;
      if (updated % 25 === 0 || updated === products.length) {
        console.log(`  Updated ${updated}/${products.length} products`);
      }
    }
    console.log();

    // ── Step 4: Save meta JSON ─────────────────────────────────────────────
    console.log('[4/5] Saving meta descriptions …');
    const metaPath = path.join(__dirname, 'seo-meta-batch6.json');
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

    progress.batches['6'] = {
      status: 'completed',
      startIdx: 501,
      endIdx: 600,
      updatedAt: new Date().toISOString(),
      productsUpdated: products.length,
      metaFile: 'scripts/seo-meta-batch6.json',
    };
    progress.completedBatches = 6;
    progress.completedProducts = 700;

    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  completedBatches: ${progress.completedBatches}`);
    console.log(`  completedProducts: ${progress.completedProducts}\n`);

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Batch 6 complete!');
    console.log(`  Products processed: ${products.length}`);
    console.log(`  DB records updated: ${updated}`);
    console.log(`  Meta file: ${metaPath}`);
    console.log(`  Progress: ${progress.completedBatches}/${progress.totalBatches} batches (${progress.completedProducts}/${progress.totalProducts} products)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Batch 6 failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
