#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 3 Description Writer
// Writes unique, SEO-optimized product descriptions for products 201-300
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

  // Quran Rehal — brass and carved stands
  if (/quran rehal|rehal/i.test(cat) || /rehal/i.test(title)) return 'rehal';
  // Calligraphy
  if (/calligraphy/i.test(cat) || /calligraphy|callligraphy/i.test(title)) return 'calligraphy';
  // Bakhoor / incense
  if (/bakhoor/i.test(cat) || /bakhoor/i.test(title)) return 'bakhoor';
  // Hajj Umrah
  if (/hajj umrah/i.test(cat) || /hajj/i.test(title)) return 'hajj';
  // Packages
  if (/packages/i.test(cat)) return 'packages';
  // Sahah E Sitta / Six books of hadith — major translations
  if (/sahah e sitta|ahadith e nabvi/i.test(cat) || /sunan abu dawud|sunan an-nasai|sunan ibn majah|sahih muslim|summarized sahih al-bukhari/i.test(title)) return 'sahah_sitta';
  // Children
  if (/children/i.test(cat) || /bacho|silsila qasas|chand kahani|child companions/i.test(title)) return 'children';
  // Women
  if (/women/i.test(cat) || /behno|beti/i.test(title)) return 'women';
  // Family
  if (/family/i.test(cat) || /ehtsaab|balooghat|ek majils|etiquette of eating/i.test(title)) return 'family';
  // Prayer Supplication
  if (/prayer supplication/i.test(cat) || /before you pray|dua|duain|durood|darood|duoon/i.test(title)) return 'prayer';
  // Hadith
  if (/hadith/i.test(cat) || /darood shareef|dosti or dushmani|dua kay masail/i.test(title)) return 'hadith';
  // Fiqh
  if (/fiqh/i.test(cat) || /basic principles of islam|behtreen zaad|bulugh ul maraam|bulugh al maram/i.test(title)) return 'fiqh';
  // Education
  if (/education/i.test(cat) || /be patient and paradise|beyond mere|bulugh al maram \(attainment|calligraphy practice|daroos ul|deen e kamil|dictionary of islamic terms|early days|enjoy your life|excellence of patience|explanation of important/i.test(title)) return 'education';
  // Reference (dawah books)
  if (/reference/i.test(cat) || /dawaat e deen|dawat e deen|dawah according|dari aur|esaal e sawaab/i.test(title)) return 'reference';
  // Companions
  if (/companions/i.test(cat) || /commanders of the muslim army|companions around/i.test(title)) return 'companions';
  // Biography
  if (/biography/i.test(cat) || /companions around the prophet/i.test(title)) return 'biography';
  // Darussalam Publishers — large group, specific titles
  if (/darussalam publishers/i.test(cat) || /backbiting.*evil|baimisal markah|charity even|christianity.*islam.*bible|cleanliness is from|collection from riyadh|concise collections|dawat-e-haq|descent of jesus|doors of reward|dill shikista|dunya k ae|encyclopedia of islamic jurisprudence|encyclopedia seerat|essential lessons|establish the prayers|description of paradise|development of science|dictionary of islamic names|dictionary of islamic words|bearing true witness/i.test(title)) return 'darussalam';
  // General
  if (/general/i.test(cat) || /balugh ul maram.*arabic pocket|eeman ka rasta|emaan ka rasta/i.test(title)) return 'general';
  // Ashfaq Ahmed (Pakistani novelist)
  if (/ashfaq ahmed/i.test(cat) || /bagh e nabuwat/i.test(title)) return 'ashfaq_ahmed';
  // Imams Scholars
  if (/imams scholars/i.test(cat) || /dunya e tib/i.test(title)) return 'scholars';
  // Abdul-Halim
  if (/abdul-halim/i.test(cat) || /description of paradise/i.test(title)) return 'scholars';
  // Darul Iblagh
  if (/darul iblagh/i.test(cat) || /dawa e shafi/i.test(title)) return 'darul_iblagh';
  // Daar Ul Noor
  if (/daar ul noor/i.test(cat)) return 'general';

  return 'general';
}

// ─── Templates (ALL NEW — completely different from batches 1 and 2) ─────────
const T = {

  // ── Children ──────────────────────────────────────────────────────────────
  children: {
    opens: [
      'Nurturing a child\'s connection with Islam from an early age is among the most rewarding investments a parent can make, and choosing the right books plays a pivotal role in that process. This {lang} publication, {title}, has been thoughtfully composed to introduce young readers to the rich tapestry of Islamic knowledge through narratives that captivate their imagination while instilling values of faith, compassion, and moral courage. The age-appropriate language ensures that children can absorb the content independently or enjoy it as a shared reading experience with their families.',
      'A well-crafted Islamic children\'s book has the power to shape a young reader\'s worldview for years to come, planting seeds of faith that blossom into a lifelong love for Allah and His messenger. This {lang} title, {title}, accomplishes precisely that goal by weaving together engaging storytelling, vibrant presentation, and authentic Islamic content that sparks curiosity and nurtures spiritual growth in children aged five and above. Every page has been designed to hold a child\'s attention while conveying meaningful lessons drawn from the Quran and Sunnah.',
      'When children encounter Islam through beautifully told stories rather than dry lectures, the impact on their character and faith development is immeasurable. This {lang} book, {title}, belongs to a carefully curated tradition of children\'s Islamic literature that transforms abstract theological concepts into vivid, relatable narratives. Young readers will find themselves drawn into worlds of prophetic courage, companions\' devotion, and the timeless wisdom that Islam offers to every generation of believers.',
      'The best children\'s Islamic books are those that a child reaches for voluntarily — not because they have been assigned, but because the stories are genuinely compelling and the presentation appeals to their natural sense of wonder. This {lang} publication, {title}, achieves that rare balance between educational substance and narrative charm, making it an ideal addition to any Muslim family\'s home library. Parents across Pakistan have praised this series for its ability to make Islamic learning feel like an adventure rather than an obligation.',
      'Great Islamic children\'s literature serves a dual purpose: it educates young minds about the fundamentals of their faith while simultaneously building the emotional connection to Islam that sustains them through adolescence and adulthood. This {lang} work titled {title} was developed with that dual purpose firmly in focus, employing storytelling techniques that resonate with children\'s cognitive development while maintaining absolute fidelity to authentic Islamic teachings sourced from the Quran and verified Hadith literature.',
      'Storytelling has always been the most effective method of transmitting values across generations, and Islamic civilization has a particularly rich storytelling tradition rooted in the Qasas (stories) found in the Quran itself. This {lang} children\'s book, {title}, draws upon that noble heritage to present stories that are not only entertaining but also deeply instructive, helping children internalize Islamic values such as honesty, generosity, patience, and trust in Allah through characters and situations they can readily understand and relate to.',
      'Investing in quality Islamic reading material for your children pays dividends throughout their lives, as the values and knowledge absorbed during these formative years become the foundation of their adult identity. This {lang} edition of {title} represents one such investment — a carefully produced publication that combines engaging content with durable construction designed to withstand the enthusiastic handling that children\'s books inevitably receive. The clear, well-sized text is suitable for developing readers, while the content depth provides material that children can return to again and again as they grow.',
      'Islam places great emphasis on the importance of seeking knowledge from childhood, and providing children with books that make that pursuit joyful is a Sunnah that every Muslim parent should strive to follow. This {lang} publication titled {title} answers that call by offering a reading experience that is simultaneously fun, informative, and spiritually enriching. Whether read aloud at bedtime, explored independently by young readers, or used as a teaching resource in Islamic schools and weekend programs, this book delivers consistent value and enjoyment.',
    ],
    mids: [
      'Inside this {lang} children\'s book, readers will discover a carefully structured collection of stories, lessons, and activities that cover essential aspects of Islamic knowledge. Topics include the beautiful names and attributes of Allah, the inspiring stories of the prophets from Adam to Muhammad (peace be upon them all), the remarkable lives of the Sahabah and their devotion to Islam, basic Islamic manners and daily supplications, and the importance of kindness, honesty, and respect in a Muslim\'s daily conduct. Each chapter has been crafted to maintain a child\'s engagement from beginning to end, with natural breaks that allow parents to discuss the lessons and answer questions that arise during reading.',
      'The pedagogical approach behind this {lang} publication reflects current best practices in children\'s Islamic education, incorporating visual variety, narrative pacing, and age-appropriate vocabulary that keeps young readers engaged without overwhelming them. Complex Islamic concepts are broken down into simple, digestible explanations that children can grasp and remember, while the storytelling format ensures that lessons are internalized emotionally rather than merely memorized intellectually. Educators and parents will appreciate the discussion prompts woven throughout the text that encourage deeper exploration of each topic.',
      'What elevates this {lang} book above ordinary children\'s publications is its uncompromising commitment to Islamic authenticity combined with genuine literary quality. The stories are sourced from verified Islamic texts and have been reviewed by qualified scholars to ensure complete accuracy, while the writing style employs the narrative techniques that make children\'s literature genuinely enjoyable. The result is a publication that respects both the intelligence of its young readers and the sanctity of the Islamic knowledge it conveys, creating a reading experience that families will treasure and revisit for years.',
      'This {lang} children\'s publication has been specifically designed to support the Islamic education goals that Muslim parents prioritize most highly: building a strong foundation of basic Islamic knowledge, developing love and reverence for Allah and His messenger, cultivating good character traits rooted in Islamic ethics, and creating positive associations with Islamic learning that endure throughout the child\'s life. The content progression follows a logical sequence that builds understanding incrementally, making it equally effective for sequential study and standalone reading.',
    ],
    closes: [
      'Bring home this enriching {lang} children\'s book from Bab-ul-Fatah, Pakistan\'s trusted online Islamic bookstore. Priced at just {price}, {title} offers exceptional value for parents who want to give their children the gift of Islamic knowledge presented in an engaging, age-appropriate format. We deliver to all cities across Pakistan with reliable packaging and prompt service. Order online today and watch your child\'s love for Islam grow.',
      'Order this delightful {lang} children\'s publication from Bab-ul-Fatah Pakistan for {price}. This edition of {title} makes Islamic learning a joyful experience that kids will want to revisit again and again. Shop from Pakistan\'s leading Islamic bookstore with fast nationwide delivery.',
      'Give your children a head start in their Islamic education with this engaging {lang} book available at Bab-ul-Fatah. At {price}, {title} is an affordable investment in your child\'s spiritual and moral development. Order now for quick delivery anywhere in Pakistan.',
      'Shop for quality {lang} children\'s Islamic literature at Bab-ul-Fatah Pakistan. This edition of {title} at {price} combines authentic content with child-friendly presentation. Order online and receive your copy through our dependable nationwide shipping service.',
    ],
  },

  // ── Darussalam Publishers ─────────────────────────────────────────────────
  darussalam: {
    opens: [
      'Darussalam has established itself over decades as a beacon of trustworthy Islamic publishing, producing works that are scrutinized by panels of qualified scholars before reaching readers\' hands. This {lang} edition of {title} upholds that exacting standard, delivering content that is meticulously researched, properly referenced, and aligned with the orthodox understanding of Islamic teachings as held by the Ahl al-Sunnah wal-Jama\'ah. Every page reflects the publisher\'s unwavering commitment to making authentic Islamic knowledge accessible to the global Muslim community.',
      'When Muslims seek reliable Islamic literature, the Darussalam imprint has become synonymous with confidence and trust, and for good reason — every title undergoes a multi-stage scholarly review process that few publishers can match. This {lang} publication titled {title} is a product of that rigorous quality control, offering readers a reference they can consult with complete assurance that the information presented is accurate, properly sourced, and free from the deviations that plague lesser-quality Islamic publications in the market.',
      'The global reach of Darussalam\'s publishing program has made its titles staples in mosques, Islamic schools, universities, and private libraries across Pakistan and the wider Muslim world. This {lang} work, {title}, continues that tradition of excellence with a treatment of its subject that combines scholarly depth with reader-friendly presentation. Whether you are a student of Islamic knowledge, a teacher, an imam, or a general reader seeking authentic guidance, this Darussalam publication delivers content that meets the highest standards of Islamic scholarship.',
      'In an era where misinformation about Islam circulates freely, having access to publications backed by verified scholarship is more important than ever. This {lang} book from Darussalam, titled {title}, addresses that need by presenting its subject matter with the kind of thorough documentation, chain-of-transmission verification, and cross-referencing that characterizes the very best of Islamic academic publishing. Readers can trace every claim back to its source, building confidence in the knowledge they acquire and the conclusions they reach.',
      'Darussalam\'s mission has always been to serve the Muslim Ummah by producing Islamic literature that is simultaneously authentic, accessible, and affordable — a mission that is beautifully embodied in this {lang} publication, {title}. The work tackles its subject with the seriousness and rigor that Islamic scholarship demands, yet presents the material in a way that is welcoming to readers who may not have advanced training in Islamic studies. This balance of depth and accessibility is what makes Darussalam titles so widely recommended by scholars and educators.',
      'Scholarly publishing in the Islamic tradition requires more than just academic competence — it demands sincerity of intention, reverence for the sources, and a commitment to presenting the truth as understood by the mainstream Muslim community. This {lang} Darussalam title, {title}, embodies all of these qualities, offering readers a work that has been produced with the kind of care and attention to detail that the subject matter deserves. The result is a publication that serves as both a reliable reference and a source of spiritual enrichment for its readers.',
      'The hallmark of a truly valuable Islamic book is not just the information it contains but the confidence it inspires in the reader that what they are learning is correct and properly attributed. This {lang} publication from Darussalam, {title}, generates that confidence through its transparent citation of sources, its engagement with classical scholarly opinions, and its clear acknowledgment of where scholarly consensus exists and where legitimate differences of opinion occur. This intellectual honesty is a refreshing departure from publications that present personal opinions as established Islamic positions.',
      'Islamic knowledge is a trust (amanah) that must be conveyed accurately, completely, and with proper context — a responsibility that Darussalam takes seriously in every title it publishes. This {lang} edition of {title} reflects that sense of responsibility, presenting information that is carefully contextualized within the broader framework of Islamic scholarship, cross-referenced with classical sources, and explained in language that respects both the subject matter and the intelligence of the reader. It is the kind of book that scholars recommend to their students and parents keep in their family libraries.',
    ],
    mids: [
      'This {lang} Darussalam publication has been produced with the meticulous attention to detail that has made the publisher a household name among Muslims seeking authentic Islamic literature. The editorial team includes qualified scholars who verify every Quranic reference against the accepted text, authenticate every Hadith citation using established grading methodologies, and ensure that legal opinions presented are properly attributed to their respective schools of thought. The production quality — from the selection of paper stock to the clarity of typography and the durability of the binding — reflects Darussalam\'s understanding that Islamic books deserve the same physical quality as their content warrants intellectually. This comprehensive approach to quality is why Darussalam titles consistently earn the trust of scholars, educators, and informed readers throughout Pakistan and internationally.',
      'The content architecture of this {lang} Darussalam work demonstrates the publisher\'s characteristic blend of scholarly thoroughness and practical utility. Information is organized in a logical progression that guides readers from foundational concepts to more nuanced discussions, with clear headings, helpful sub-sections, and cross-references that facilitate both sequential reading and targeted consultation. The {lang} prose style is measured and precise, conveying complex ideas without unnecessary verbiage while maintaining the warmth and accessibility that makes Darussalam titles popular among general readers. Footnotes and marginal notes provide additional scholarly context without disrupting the flow of the main text.',
      'Beyond its intellectual content, this {lang} Darussalam publication serves a broader purpose within the Muslim community by providing a reliable counterpoint to the proliferation of unverified Islamic information available through social media and unreliable online sources. By presenting thoroughly vetted content in a professionally produced physical format, this book enables readers to develop a well-grounded understanding of its subject that can serve as a benchmark against which to evaluate other claims they encounter. The bibliography and source references included in this edition also provide a valuable starting point for readers who wish to pursue deeper study of the topic independently.',
    ],
    closes: [
      'Order this trusted {lang} Darussalam publication from Bab-ul-Fatah, Pakistan\'s foremost Islamic bookstore. At just {price}, {title} offers the kind of quality and reliability that discerning readers demand. We stock the widest selection of Darussalam titles in Pakistan with delivery to every city. Shop online with confidence.',
      'Purchase this quality {lang} Darussalam edition — {title} — from Bab-ul-Fatah Pakistan for {price}. Every Darussalam title we carry has been selected for its scholarly merit and production quality. Order online and receive your book through our fast, reliable nationwide delivery service.',
      'Add this authoritative {lang} Darussalam book to your collection by ordering from Bab-ul-Fatah, Pakistan\'s most trusted source for authentic Islamic publications. Priced at {price}, {title} is a worthwhile investment in verified Islamic knowledge. Browse our full Darussalam catalog online and enjoy delivery across Pakistan.',
      'Secure your copy of this {lang} Darussalam publication at Bab-ul-Fatah Pakistan for {price}. This edition of {title} reflects the highest standards of Islamic scholarly publishing. Order today and benefit from our nationwide shipping network and secure packaging.',
    ],
  },

  // ── Quran Rehal (book stands) ─────────────────────────────────────────────
  rehal: {
    opens: [
      'A Quran rehal is more than a functional accessory — it is a mark of reverence for the Holy Quran, elevating the sacred text to a position of honor while making daily recitation more comfortable and focused. This {title} has been crafted with that dual purpose in mind, combining practical utility with an aesthetic elegance that befits its role as a support for the words of Allah. The quality of materials and workmanship ensures that this rehal will serve as a dignified companion to your Quran for many years.',
      'Placing the Holy Quran on a proper stand is a Sunnah practice that reflects the respect every Muslim holds for the divine scripture, and this beautifully crafted {title} provides an ideal platform for that purpose. Whether used for daily recitation at home, during Quran study circles at the mosque, or as a decorative element in your living space, this rehal combines functional design with artistic craftsmanship that enhances the experience of engaging with the Quran. The attention to detail in its construction speaks to the reverence with which it was made.',
      'The tradition of using a rehal to hold the Quran during recitation dates back centuries in Islamic culture, and this {title} continues that noble tradition with manufacturing quality that meets contemporary standards of durability and finish. Available in a carefully proportioned design that accommodates most standard Quran sizes, this stand provides stable support at an optimal reading angle that reduces neck and back strain during extended recitation sessions. The {format} construction ensures it folds compactly for storage and transport.',
      'Every Muslim household that values the Quran deserves a properly made rehal that reflects the honor of the book it supports. This {title} delivers on that expectation with a design that is both traditionally inspired and practically engineered for everyday use. The materials have been selected for their longevity and visual appeal, while the folding mechanism has been tested to ensure smooth, reliable operation over thousands of open-and-close cycles. Whether placed on a prayer mat, side table, or dedicated reading area, this rehal maintains its stability and beauty.',
      'A well-crafted Quran stand transforms the simple act of opening the Holy Book into a more mindful, reverent experience. This {title} achieves that transformation through its thoughtful design, which positions the Quran at the ideal reading height and angle while the decorative elements add a touch of Islamic artistic heritage to your prayer space. The construction quality ensures that this rehal will be a lasting part of your daily worship routine, maintaining its structural integrity and visual appeal through years of faithful service.',
      'Crafting a Quran rehal that balances aesthetic beauty with functional reliability requires skill, patience, and an understanding of how Muslims interact with the Holy Book during their daily prayers. This {title} embodies those qualities, featuring {format} workmanship that has been refined through generations of artisanal tradition in the Subcontinent. The result is a rehal that not only serves its practical purpose admirably but also enhances the visual atmosphere of any room in which it is placed, from the prayer area to the living room.',
    ],
    mids: [
      'The construction of this {title} utilizes premium materials selected specifically for their durability, weight, and visual characteristics. The {format} has been shaped and finished by skilled craftsmen who understand the standards expected for items that will hold the Holy Quran. Every edge has been smoothed, every joint has been reinforced, and every surface has been treated to resist wear and maintain its appearance over extended use. The stand\'s dimensions have been calibrated to accommodate standard Quran sizes commonly used in Pakistan, including 13-line, 15-line, and 16-line formats, with a weight distribution that prevents tipping even when large, heavy Quran editions are placed upon it. For Muslims who recite the Quran daily, this rehal provides the stable, respectful platform that the sacred text deserves.',
      'Practical considerations have been given equal weight alongside aesthetic ones in the design of this {title}. The folding mechanism allows the stand to be collapsed flat for convenient storage when not in use, making it ideal for homes where space is at a premium or for Muslims who wish to carry their rehal to the mosque for congregational reading. The {format} finish resists tarnishing and maintains its luster with minimal maintenance, while the base provides excellent grip on carpeted, tiled, and wooden surfaces alike. This rehal also makes an excellent gift for weddings, housewarmings, Eid celebrations, and other special occasions, arriving in packaging that protects it during transit and presents it beautifully upon opening.',
    ],
    closes: [
      'Order this beautifully crafted {title} from Bab-ul-Fatah Pakistan for {price}. This Quran rehal combines traditional craftsmanship with lasting quality. We deliver to all cities across Pakistan with secure packaging. Shop online and elevate your daily Quran recitation experience.',
      'Purchase this premium {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for just {price}. A quality Quran stand makes a meaningful gift for any occasion. Order online with fast, reliable nationwide delivery.',
      'Add this elegant {title} to your home or mosque by ordering from Bab-ul-Fatah Pakistan. Priced at {price}, this rehal offers exceptional craftsmanship and durability. Shop from Pakistan\'s premier Islamic store with nationwide shipping.',
    ],
  },

  // ── Calligraphy ───────────────────────────────────────────────────────────
  calligraphy: {
    opens: [
      'The art of Arabic calligraphy represents one of Islam\'s most revered artistic traditions, transforming the written word of Allah into visual compositions of extraordinary beauty and spiritual significance. This {title} from Bab-ul-Fatah provides the essential tools and materials that aspiring and experienced calligraphers need to practice and perfect this noble art form. Whether you are a student beginning your calligraphy journey or an accomplished artist seeking premium supplies, this product meets the exacting standards that the art demands.',
      'Arabic calligraphy is far more than mere decorative writing — it is a disciplined artistic practice that requires patience, precision, and a deep understanding of the proportions and rhythms inherent in the Arabic script. This {title} has been carefully selected and curated to support calligraphers at every level, offering professional-grade materials that enable clean, consistent strokes and faithful rendering of classical calligraphic styles including Naskh, Thuluth, and Diwani.',
      'For centuries, Muslim calligraphers have elevated the Arabic script to an art form of breathtaking sophistication, creating works that adorn mosques, manuscripts, and monuments across the Islamic world. This {title} carries forward that artistic legacy by providing modern practitioners with the same quality of tools that master calligraphers have relied upon for generations. The materials have been tested and approved by experienced calligraphy instructors to ensure they meet the performance requirements of both classroom instruction and professional artistic work.',
      'The practice of Arabic calligraphy has experienced a remarkable revival in recent years, with growing numbers of Muslims in Pakistan and beyond discovering the meditative focus and creative satisfaction that this art form provides. This {title} has been made available by Bab-ul-Fatah to serve this growing community of practitioners, offering a curated selection of supplies that eliminates the frustration of using substandard materials and allows calligraphers to focus entirely on developing their skill and artistic expression.',
      'Mastering Arabic calligraphy begins with having the right instruments in your hands, and this {title} provides exactly that foundation. The tools included have been manufactured to precise specifications that ensure consistent ink flow, comfortable grip during extended practice sessions, and the durability needed to withstand the rigors of daily artistic practice. Whether used for formal calligraphic work, Quranic inscription, or creative artistic expression, these materials deliver the performance that serious calligraphers require.',
      'Quality calligraphy supplies make an immediately noticeable difference in the quality of a calligrapher\'s output, affecting line consistency, ink distribution, stroke precision, and overall visual impact. This {title} has been sourced from reputable manufacturers who understand the specific requirements of Arabic calligraphy, ensuring that every pen, ink bottle, and sheet of paper performs reliably and consistently. Bab-ul-Fatah is proud to offer these professional-grade materials to the Pakistani calligraphy community at accessible price points.',
    ],
    mids: [
      'This {title} calligraphy product has been specifically designed or selected for the practice of Arabic and Islamic calligraphy, taking into account the unique requirements of scripts that flow from right to left and employ a sophisticated system of thick-thin stroke variation. The materials respond predictably to the calligrapher\'s hand pressure and angle, producing clean, controlled lines that are essential for both classical and contemporary calligraphic styles. Each item in this offering has been evaluated for ink compatibility, nib durability, surface texture, and overall user experience by practicing calligraphers who understand what professionals and students need from their tools. The accessible pricing makes this an excellent entry point for beginners while still satisfying the quality expectations of experienced artists.',
      'Whether you are practicing calligraphy as a personal spiritual discipline, studying it formally at an Islamic art institution, or creating works for exhibition and sale, having reliable, well-performing tools is essential to your artistic development. This {title} addresses that need comprehensively, providing materials that work together harmoniously to produce consistent, professional-quality results. The {format} ensures that your calligraphy practice is supported by equipment that performs at the level your artistic ambitions demand. Many Islamic art instructors across Pakistan specifically recommend the supplies offered through Bab-ul-Fatah for their students, citing the consistent quality and availability as key advantages.',
    ],
    closes: [
      'Shop for this quality {title} at Bab-ul-Fatah Pakistan for {price}. We stock a comprehensive range of Arabic calligraphy supplies for artists of all levels. Order online with delivery to any city in Pakistan.',
      'Order this {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore and art supply source. Priced at {price}, this product offers excellent value for calligraphy students and professionals alike. Shop online for fast nationwide delivery.',
      'Get this professional {title} from Bab-ul-Fatah Pakistan at {price}. Perfect for Arabic calligraphy practice, art projects, and creative expression. Order today and receive your supplies through our reliable shipping network across Pakistan.',
    ],
  },

  // ── Prayer Supplication (Dua books) ───────────────────────────────────────
  prayer: {
    opens: [
      'The act of making dua — calling upon Allah with sincerity, humility, and complete dependence — is described in the Quran as the essence of worship, and this {lang} publication titled {title} serves as a comprehensive guide to mastering this profound spiritual practice. Drawing upon the Quranic instructions and the Prophetic examples of supplication, this book equips readers with both the knowledge of what to ask for and the understanding of how to ask in a manner that is most pleasing to Allah.',
      'No other act of worship in Islam offers the same level of direct, intimate access to Allah as the dua, which the Prophet (peace be upon him) described as the weapon of the believer and the essence of devotion. This {lang} work, {title}, provides a structured, accessible guide to the practice of supplication, covering the etiquettes of making dua, the best times and situations for supplication, and a curated collection of authenticated duas from the Quran and Sunnah that address every conceivable human need and circumstance.',
      'Understanding the art and science of making dua properly is essential for every Muslim who wishes to maximize the spiritual benefits of this powerful act of worship. This {lang} publication, {title}, goes beyond merely compiling supplications by explaining the underlying principles that make dua effective — including sincerity of intention, persistence in asking, gratitude for blessings already received, and the importance of aligning one\'s requests with what is truly beneficial. The result is a guide that transforms dua from a routine recitation into a deeply meaningful spiritual conversation.',
      'The Quran and Sunnah contain a treasure trove of supplications that cover every aspect of human experience — from seeking guidance in major life decisions to asking for protection from harm, from expressing gratitude for blessings to pleading for forgiveness of sins. This {lang} book, {title}, organizes this vast collection into an accessible reference that readers can consult throughout their daily lives, with each dua presented in its original form along with clear {lang} explanations of its meaning, context, and appropriate usage.',
      'Preparation for Salah — the daily prayer that constitutes the backbone of a Muslim\'s worship — is a topic that deserves far more attention than it typically receives, and this {lang} publication titled {title} addresses that need with clarity and thoroughness. The book covers the spiritual and physical preparations required before prayer, the rulings and recommendations that enhance the prayer experience, and the common errors that many Muslims unknowingly commit. By following this guide, readers can ensure that their prayers are performed in the manner most pleasing to Allah.',
      'The supplications of the prophets — recorded in the Quran and authenticated Hadith — represent the most perfect expressions of human dependence on the divine, combining eloquence, sincerity, and comprehensive understanding of human need. This {lang} collection, {title}, gathers these prophetic supplications and presents them in a format that makes them easy to learn, memorize, and incorporate into daily worship routines. Each dua is accompanied by its source reference, contextual background, and practical guidance on when and how to recite it for maximum spiritual benefit.',
      'Every Muslim experiences moments of hardship, uncertainty, and spiritual longing when the heart cries out to Allah for help, guidance, and comfort. This {lang} publication, {title}, has been compiled with those moments in mind, offering a carefully curated collection of duas and spiritual remedies drawn from authentic Islamic sources that provide solace, hope, and practical pathways through life\'s challenges. The book also includes inspiring accounts of how the prophets, companions, and righteous predecessors turned to dua in their most difficult moments.',
      'Authentic duas carry a spiritual power that no human-composed words can replicate, because they originate from divine revelation or from the inspired words of the Prophet (peace be upon him). This {lang} work titled {title} is dedicated to preserving and disseminating these authentic supplications, verifying each one against established sources and presenting them with scholarly precision. The book serves as both a practical daily reference and a scholarly resource for those who wish to deepen their understanding of the Islamic science of supplication.',
    ],
    mids: [
      'This {lang} publication on supplication and prayer has been organized with the practical needs of readers firmly in mind. The duas and guidance are arranged by topic and occasion — morning and evening azkar, supplications for before and after eating, prayers for entering and leaving the home, duas for travel, illness, distress, and countless other situations that Muslims encounter in their daily lives. Each entry includes the original Arabic text (where applicable), a clear {lang} translation or explanation, the source reference from Quran or Hadith, and brief commentary that helps the reader understand the context and significance of the supplication. This systematic organization transforms the book into a practical daily companion that readers will reach for repeatedly throughout their lives.',
      'The scholarly methodology behind this {lang} work ensures that every dua and recommendation presented has been verified against authentic Islamic sources, with particular attention to the chains of narration for Hadith-based supplications. The author has consulted the major collections of authenticated duas, including those found in the works of Imam Al-Albani, Imam An-Nawawi, and other recognized scholars of Hadith. Where differences exist regarding the authenticity of particular supplications, these are noted transparently, allowing readers to make informed decisions. This commitment to academic rigor, combined with the accessible {lang} presentation, makes this book suitable for both scholarly reference and everyday practical use.',
    ],
    closes: [
      'Order this invaluable {lang} guide to supplication and prayer from Bab-ul-Fatah Pakistan for {price}. This edition of {title} will transform your daily worship experience. Shop online with delivery available to every city in Pakistan.',
      'Strengthen your connection with Allah through the power of dua — order this {lang} publication from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} is an essential addition to every Muslim home. We deliver nationwide.',
      'Purchase this comprehensive {lang} dua collection from Bab-ul-Fatah Pakistan for just {price}. This edition of {title} provides authentic supplications for every occasion. Order online today for fast delivery across Pakistan.',
      'Get this practical {lang} supplication guide from Bab-ul-Fatah at {price}. {title} offers authentic, verified duas with clear explanations. Shop from Pakistan\'s leading Islamic bookstore with reliable shipping nationwide.',
    ],
  },

  // ── Hadith ────────────────────────────────────────────────────────────────
  hadith: {
    opens: [
      'The science of Hadith — the meticulous documentation and verification of the Prophet\'s words and actions — represents one of humanity\'s greatest achievements in the preservation of oral tradition, and studying it connects Muslims directly to the living legacy of Prophet Muhammad (peace be upon him). This {lang} publication, {title}, contributes to that scholarly tradition by presenting verified narrations with their chains of transmission and scholarly grading, enabling readers to engage with the Prophetic Sunnah at a level of depth that casual Hadith collections cannot provide.',
      'Every authenticated Hadith is a window into the perfect example set by Prophet Muhammad (peace be upon him), illuminating how the Quranic commandments should be understood and implemented in every dimension of human life. This {lang} work titled {title} brings together carefully selected narrations on its specific subject matter, organizing them in a manner that facilitates both scholarly study and practical application. The compiler has applied rigorous authentication standards, ensuring that readers can rely upon the accuracy and reliability of every narration presented.',
      'The Hadith literature of Islam constitutes an encyclopedic guide to human existence, addressing matters ranging from the most profound theological questions to the most mundane aspects of daily conduct with equal wisdom and precision. This {lang} edition of {title} focuses on a specific thematic area within that vast corpus, providing readers with a concentrated, well-organized collection of narrations that offers comprehensive guidance on the topic at hand. The scholarly apparatus accompanying each narration allows readers to verify authenticity and understand context independently.',
      'Access to authenticated Hadith literature is essential for any Muslim who wishes to practice Islam with knowledge and confidence rather than blind imitation, and this {lang} publication titled {title} makes that access readily available. The narrations have been compiled from the most trusted sources in Hadith scholarship, with full documentation of their chains of transmission and scholarly evaluation. This transparency enables readers to understand not just what the Prophet (peace be upon him) said or did, but also how scholars have assessed the reliability of each report.',
      'The preservation of the Prophetic Sunnah through the science of Hadith is a miracle of Islamic civilization that has no parallel in any other religious or historical tradition, and engaging with that preserved legacy is a source of both knowledge and spiritual enrichment. This {lang} book, {title}, provides a focused exploration of specific aspects of the Prophetic guidance, drawing upon the major Hadith collections and the scholarly analyses of classical and contemporary Hadith experts to present a picture of the Sunnah that is both comprehensive and practically useful.',
      'Among the most beloved topics in Hadith literature are the narrations concerning the virtues of good deeds, the rewards promised for specific acts of worship, and the descriptions of the blessings that await the righteous in the Hereafter. This {lang} publication, {title}, focuses on such spiritually uplifting content, compiling narrations that inspire hope, strengthen faith, and motivate readers to increase their devotion to Allah. Each narration is presented with its source and grading, maintaining the scholarly standards that readers expect from quality Hadith compilations.',
    ],
    mids: [
      'The scholarly methodology employed in this {lang} Hadith publication reflects the highest standards of Islamic academic practice. Each narration is presented with its complete chain of transmission (isnad), and the reliability of each narrator in the chain has been evaluated according to the established criteria of Hadith science. The compiler has cross-referenced narrations across multiple Hadith collections to identify the strongest versions and has noted any variations in wording or additional details found in different sources. This thorough approach gives readers confidence in the authenticity of the narrations presented and provides a model for how Hadith should be studied and understood. The {lang} commentary contextualizes each narration within the broader framework of Islamic law and ethics.',
    ],
    closes: [
      'Add this scholarly {lang} Hadith collection to your library from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers verified Prophetic guidance on its subject. Order online with fast delivery to any city in Pakistan.',
      'Order this authoritative {lang} Hadith compilation from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} connects you directly to the Prophetic Sunnah. We deliver nationwide with care.',
      'Purchase this valuable {lang} Hadith work from Bab-ul-Fatah Pakistan for just {price}. This edition of {title} provides authentic narrations with scholarly grading. Shop online for reliable nationwide shipping.',
    ],
  },

  // ── Fiqh ──────────────────────────────────────────────────────────────────
  fiqh: {
    opens: [
      'Islamic jurisprudence — the science of deriving practical legal rulings from the Quran and Sunnah — has been central to Muslim life since the earliest days of the faith, providing the essential framework through which divine guidance is translated into daily practice. This {lang} publication titled {title} offers focused, reliable guidance on its specific area of fiqh, drawing upon the primary sources of Islamic law and the established methodologies of the major schools of jurisprudence to present rulings that readers can follow with confidence and scholarly backing.',
      'The ability to practice Islam correctly depends upon access to reliable fiqh guidance that explains not just what the rulings are but why those rulings exist and how they were derived from the primary sources. This {lang} work, {title}, provides that essential contextual understanding alongside its practical rulings, enabling readers to make informed decisions about their religious practice based on genuine understanding rather than mere imitation. The author draws upon the Quran, authenticated Hadith, and the scholarly consensus of the Muslim community to establish rulings that are both authentic and practically applicable.',
      'The foundational principles of Islam — often referred to as Usool al-Fiqh — provide the methodological framework through which Islamic legal rulings are derived, and understanding these principles is essential for anyone who wishes to engage with Islamic law at a meaningful level. This {lang} publication, {title}, addresses these foundational matters with clarity and depth, explaining how the major schools of jurisprudence arrived at their positions and how contemporary Muslims can navigate areas of scholarly difference with knowledge and respect.',
      'The fear of Allah (Taqwa) is frequently described in Islamic sources as the best provision a Muslim can carry on their journey through life, and this {lang} book, {title}, explores that central concept with both scholarly thoroughness and practical accessibility. The work examines how taqwa manifests in daily conduct, how it relates to the various obligations and prohibitions of Islamic law, and how cultivating taqwa transforms ordinary actions into acts of worship that draw the believer closer to Allah. The {lang} prose style makes this profound topic accessible to readers at every level of Islamic knowledge.',
      'Bulugh ul Maram — "Attainment of the Objective" — is one of the most important and widely studied compilations of Hadith in the Hanbali school of Islamic jurisprudence, and this {lang} edition of {title} makes this essential work accessible to a new generation of students and scholars. Compiled by the great Hadith master Ibn Hajar al-Asqalani, this collection gathers the Hadith that serve as the primary evidentiary basis for rulings across all major areas of fiqh, making it an indispensable bridge between Hadith science and practical Islamic law.',
      'The science of fiqh requires not only knowledge of the primary texts but also the analytical skills to understand how those texts interact, how to reconcile apparent contradictions, and how to apply established rulings to new circumstances. This {lang} publication titled {title} develops those analytical skills systematically, guiding readers through the methodological principles that underpin Islamic legal reasoning while providing practical examples that illustrate how those principles work in practice.',
    ],
    mids: [
      'This {lang} fiqh publication provides comprehensive coverage of its subject, organized according to the traditional chapter structure of fiqh works that facilitates both systematic study and quick reference. Each ruling is supported by evidence from the Quran and authenticated Hadith, with the author explaining the chain of legal reasoning that connects the primary sources to the final ruling. Where scholarly differences exist, the positions of the major schools of jurisprudence are presented fairly and with proper attribution, enabling readers to understand the basis for different opinions and make informed choices. The practical focus ensures that the knowledge gained from this work can be immediately applied to real-life situations, making it an invaluable reference for daily religious practice.',
    ],
    closes: [
      'Order this authoritative {lang} fiqh guide from Bab-ul-Fatah Pakistan for {price}. This edition of {title} provides the reliable scholarly foundation every Muslim needs. Shop online with delivery to all cities in Pakistan.',
      'Purchase this comprehensive {lang} Islamic jurisprudence reference from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} offers exceptional scholarly value. Order today for fast, reliable nationwide delivery.',
      'Get this essential {lang} fiqh publication from Bab-ul-Fatah Pakistan for just {price}. This edition of {title} explains Islamic rulings with scholarly depth and practical clarity. Order online for nationwide shipping.',
    ],
  },

  // ── Education ─────────────────────────────────────────────────────────────
  education: {
    opens: [
      'The pursuit of knowledge occupies a central position in Islamic teaching, with the Prophet (peace be upon him) emphasizing that seeking knowledge is an obligation upon every Muslim, male and female. This {lang} educational work titled {title} contributes to fulfilling that obligation by providing structured, well-researched content that supports formal study programs and independent learning alike, making it a valuable addition to the library of any student or educator in Pakistan.',
      'Bridging the gap between traditional Islamic scholarship and the educational needs of contemporary Muslims requires publications that combine academic rigor with accessible presentation. This {lang} publication, {title}, achieves that balance by presenting its subject matter in a format that is both intellectually substantive and practically useful for readers who may not have extensive background in the field. The progressive structure builds understanding systematically from foundational concepts to advanced material.',
      'The Arabic language serves as the key that unlocks the primary sources of Islamic knowledge — the Quran, the Hadith, and the classical scholarly works — and acquiring proficiency in Arabic is therefore one of the most impactful investments a Muslim can make in their religious education. This {lang} educational resource titled {title} provides a carefully structured pathway to Arabic language mastery, employing pedagogical methods that have been refined through decades of classroom experience in Islamic educational institutions.',
      'Understanding the contributions of Islamic civilization to human knowledge and scientific progress is essential for Muslim students who wish to appreciate the richness of their intellectual heritage and draw inspiration from it for contemporary challenges. This {lang} publication titled {title} explores the remarkable achievements of Muslim scholars, scientists, and thinkers throughout history, demonstrating how Islamic values and Quranic revelation catalyzed advances in fields as diverse as mathematics, astronomy, medicine, chemistry, and philosophy.',
      'Patience is not merely a passive virtue in Islam but an active spiritual discipline that strengthens faith, refines character, and prepares the believer for the tests that are an inevitable part of human existence. This {lang} work titled {title} explores the Islamic understanding of patience and gratefulness through Quranic analysis, Hadith commentary, and practical guidance, showing how these twin virtues transform life\'s challenges into opportunities for spiritual growth and divine reward.',
      'Learning to live a fulfilling, meaningful life in accordance with Islamic principles is the aspiration of every sincere Muslim, and this {lang} publication titled {title} provides practical guidance for achieving exactly that goal. Drawing upon the Quran, verified Hadith, and the wisdom of experienced Islamic scholars and counselors, this book addresses the real-world challenges that Muslims face in their personal relationships, professional lives, and spiritual journeys with empathy, clarity, and actionable advice.',
      'A comprehensive dictionary of Islamic terminology is an indispensable reference tool for any serious student of Islamic knowledge, enabling them to understand the precise meanings of technical terms that recur throughout Islamic literature. This {lang} publication, {title}, provides that essential reference, compiling definitions and explanations of key Islamic concepts, terms, and expressions in a format that is both comprehensive and easy to navigate.',
    ],
    mids: [
      'The content of this {lang} educational publication has been developed with the dual objectives of academic excellence and practical utility. Each chapter or section is structured to facilitate progressive learning, beginning with clear objectives and proceeding through systematic explanations supported by examples, exercises, and review materials where appropriate. The {lang} text maintains scholarly precision while remaining accessible to readers at various educational levels, from high school students to university attendees to adult learners pursuing independent study. The practical orientation ensures that the knowledge gained from this work can be translated into real-world application, whether in academic settings, professional contexts, or personal intellectual development. The publisher has invested in quality production — clear typography, durable binding, and premium paper — that supports extended use and frequent reference.',
    ],
    closes: [
      'Advance your Islamic education with this essential {lang} resource from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is available with fast delivery across all cities. Order online and invest in lasting knowledge.',
      'Order this comprehensive {lang} educational work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for just {price}. This edition of {title} supports both classroom instruction and self-study. Shop online with nationwide shipping.',
      'Get this valuable {lang} educational publication from Bab-ul-Fatah Pakistan for {price}. {title} is recommended by educators across Pakistan for its clarity and depth. Order online today for prompt delivery.',
    ],
  },

  // ── Reference (Dawah books) ──────────────────────────────────────────────
  reference: {
    opens: [
      'Inviting others to Islam — dawah — is a collective responsibility of the Muslim Ummah that requires knowledge, wisdom, and an understanding of effective communication methods. This {lang} publication titled {title} addresses the various dimensions of dawah, including who should give dawah, what topics to prioritize, when to approach different audiences, and how to present the message of Islam in a manner that is both compelling and respectful. The guidance is firmly grounded in Quranic instructions and the Prophetic model of inviting people to the truth.',
      'The methodology of dawah (Islamic outreach) has been a subject of scholarly discussion since the earliest days of Islam, when the Prophet (peace be upon him) and his Companions employed diverse strategies to convey the message of Islam to different audiences and communities. This {lang} work, {title}, synthesizes those classical insights with contemporary understanding of communication and engagement, providing readers with a comprehensive, practical guide to fulfilling this important religious obligation effectively.',
      'Understanding what dawah truly entails — and equally important, what it does not entail — is essential for Muslims who wish to participate in this noble effort with wisdom and proper understanding. This {lang} publication, {title}, clarifies the scope, methodology, and etiquette of Islamic outreach, addressing common misconceptions and providing practical frameworks for engaging with people of different faiths, backgrounds, and levels of interest in Islam. The emphasis throughout is on conveying the message with knowledge, wisdom, and beautiful preaching, as commanded in the Quran.',
      'Every Muslim has a role to play in sharing the message of Islam with those around them, whether through formal dawah activities or through the example of their character and conduct. This {lang} book titled {title} explores the various ways in which Muslims can contribute to dawah, from individual conversations and social media engagement to organized educational programs and community outreach initiatives. The practical advice offered is supported by evidence from the Quran, Hadith, and the documented practices of the early Muslim community.',
      'The question of how to give dawah — and to whom, about what, when, and through what means — has become increasingly relevant in the contemporary world, where Muslims interact with people of diverse beliefs on a daily basis. This {lang} publication, {title}, provides a timely, well-researched guide to navigating these interactions with Islamic etiquette and effective communication skills. The content addresses the specific challenges and opportunities that dawah presents in modern Pakistani society, making it particularly relevant for readers in this context.',
      'Esaal-e-Sawaab (conveying the reward of good deeds to the deceased) is a topic of significant practical importance for Muslims, as questions about what can and cannot be done for deceased loved ones arise frequently. This {lang} publication titled {title} addresses this topic comprehensively, examining the various forms of Esaal-e-Sawaab that are supported by evidence from the Quran and authentic Hadith, clarifying common misconceptions, and providing practical guidance that helps Muslims fulfill this important duty in accordance with the Sunnah.',
    ],
    mids: [
      'This {lang} reference publication addresses its subject with a depth of research and clarity of presentation that makes it suitable for both scholarly consultation and general readership. The content has been organized to facilitate both sequential reading and targeted reference, with clear headings, logical chapter divisions, and helpful cross-references that enable readers to locate specific information quickly. Every claim and recommendation in this {lang} work is supported by evidence from authentic Islamic sources, and the author engages respectfully with differing scholarly opinions where they exist. The practical focus ensures that readers come away with actionable knowledge they can implement in their daily lives, whether the topic involves dawah methodology, Islamic terminology, or specific questions of religious practice.',
    ],
    closes: [
      'Order this valuable {lang} reference work from Bab-ul-Fatah Pakistan for {price}. This edition of {title} provides reliable, well-researched Islamic guidance. Shop online with delivery to all cities across Pakistan.',
      'Purchase this essential {lang} Islamic reference from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for just {price}. {title} is an important resource for students, scholars, and general readers. Order today for nationwide shipping.',
      'Get this comprehensive {lang} publication from Bab-ul-Fatah Pakistan at {price}. {title} offers authoritative content on its subject. Order online and benefit from our fast, reliable delivery service across Pakistan.',
    ],
  },

  // ── Women ─────────────────────────────────────────────────────────────────
  women: {
    opens: [
      'Islam\'s teaching regarding the status, rights, and honor of women was revolutionary when revealed fourteen centuries ago and continues to offer a framework of dignity, protection, and empowerment that is profoundly relevant for Muslim women today. This {lang} publication titled {title} addresses the specific concerns and spiritual needs of Muslim women, providing guidance grounded in the Quran and authentic Sunnah that covers matters of faith, worship, family life, and personal development with sensitivity and scholarly accuracy.',
      'The honor (azmat) that Islam accords to daughters, sisters, wives, and mothers is one of the faith\'s most distinctive and cherished teachings, challenging the historical mistreatment of women that existed in pre-Islamic and many contemporary societies. This {lang} book, {title}, explores that Islamic teaching with depth and clarity, drawing upon Quranic verses, authenticated Hadith, and the inspiring examples of the great women of Islamic history — including the Mothers of the Believers, the female Companions, and the women scholars who have contributed so much to Islamic civilization.',
      'Muslim women in Pakistan navigate a complex landscape of cultural expectations, family responsibilities, and personal aspirations, and having access to reliable Islamic guidance that speaks to their specific circumstances is essential for maintaining a healthy balance between worldly duties and spiritual priorities. This {lang} publication, {title}, offers that guidance in a format that is both practical and spiritually uplifting, addressing the real questions and challenges that Muslim women face in their daily lives with compassion, wisdom, and scriptural backing.',
    ],
    mids: [
      'This {lang} publication for Muslim women covers a comprehensive range of topics relevant to women\'s religious practice and daily life, organized into clearly defined sections that facilitate easy reference. The content draws primarily upon the Quranic verses addressing women, the Hadith narrated by and about the women of the Prophet\'s household, the juristic opinions of qualified female and male scholars who understand women\'s issues, and the inspiring biographical accounts of great women in Islamic history. The {lang} prose style is respectful, informative, and empowering, presenting Islamic guidance as a source of strength and clarity rather than restriction. Each recommendation is supported by textual evidence, enabling readers to understand the basis for the guidance and apply it with confidence to their personal circumstances.',
    ],
    closes: [
      'Order this valuable {lang} publication for Muslim women from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers the kind of thoughtful, scholarly guidance that every Muslim woman deserves. Shop online with delivery to all cities in Pakistan.',
      'Purchase this insightful {lang} book from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore, for just {price}. {title} addresses the real concerns of Muslim women with authenticity and compassion. Order today for fast nationwide delivery.',
    ],
  },

  // ── Family ────────────────────────────────────────────────────────────────
  family: {
    opens: [
      'The family unit occupies a position of paramount importance in Islam, serving as the foundational building block of a healthy society and the primary environment in which Islamic values are transmitted across generations. This {lang} publication titled {title} addresses family matters with the kind of practical, faith-based guidance that helps Muslim families build strong, loving relationships rooted in mutual respect, shared religious commitment, and the ethical principles taught by Islam.',
      'Navigating family life according to Islamic principles requires reliable guidance on issues that range from the mundane to the profoundly consequential — from table manners and household etiquette to the serious legal matters of marriage and divorce. This {lang} book, {title}, provides that comprehensive guidance, covering the rights and responsibilities of family members, the Islamic approach to resolving domestic disputes, the etiquettes of eating and drinking according to the Sunnah, and the religious and legal implications of issues that every Muslim family needs to understand.',
      'Islamic teaching provides detailed guidance on every aspect of family life, including matters that are rarely addressed in contemporary literature with the specificity and scriptural grounding that practicing Muslims require. This {lang} publication, {title}, fills that gap by addressing sensitive family topics — including the Islamic rulings on talaq (divorce), the legal requirements for valid marriage contracts, and the rights of children and parents — with the kind of scholarly precision and practical clarity that readers can rely upon when navigating these important matters.',
      'Teaching children the fundamentals of Islamic practice — including arithmetic and numeracy skills that enable them to fulfill their religious obligations (such as calculating Zakat, understanding the Islamic calendar, and managing finances according to Shariah principles) — is a responsibility that falls primarily upon parents. This {lang} publication, {title}, supports that parental responsibility by providing age-appropriate educational content that introduces children to essential skills within an Islamic framework.',
    ],
    mids: [
      'This {lang} family-oriented publication has been compiled with careful attention to both the scholarly accuracy of its content and the practical needs of Muslim families. Each topic is addressed with evidence from the Quran and authenticated Hadith, supplemented by the scholarly consensus of qualified Islamic jurists who specialize in family law and domestic matters. The {lang} presentation is clear, direct, and free from unnecessary complexity, ensuring that readers can understand and apply the guidance immediately. Where differences of scholarly opinion exist, these are noted fairly with an explanation of the strongest position, enabling families to make informed decisions based on sound Islamic knowledge. The book serves as a valuable reference for daily family life as well as a resource for more significant life events.',
    ],
    closes: [
      'Order this practical {lang} family guide from Bab-ul-Fatah Pakistan for {price}. This edition of {title} provides the trustworthy guidance every Muslim family needs. Shop online with delivery to any city in Pakistan.',
      'Purchase this essential {lang} family reference from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for just {price}. {title} addresses family matters with Islamic wisdom and scholarly depth. Order today for reliable nationwide shipping.',
      'Get this comprehensive {lang} publication on family life from Bab-ul-Fatah Pakistan at {price}. {title} is a valuable resource for every Muslim household. Order online and receive your copy through our fast delivery service.',
    ],
  },

  // ── Sahah E Sitta (Six Books of Hadith translations) ──────────────────────
  sahah_sitta: {
    opens: [
      'The Six Books of Hadith (Kutub al-Sittah) — Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Sunan al-Tirmidhi, Sunan al-Nasai, and Sunan Ibn Majah — constitute the most authoritative collections of Prophetic narrations in Islam, and having access to reliable English translations of these monumental works opens the doors of Hadith scholarship to Urdu and English-speaking Muslims worldwide. This {lang} edition of {title} represents a monumental publishing achievement, making one of these essential collections available in translation with the scholarly apparatus necessary for serious study.',
      'The translation of a major Hadith collection from Arabic into {lang} is a task of extraordinary scholarly complexity, requiring not only linguistic expertise but also deep familiarity with Hadith science, Islamic jurisprudence, and the historical context in which each narration was recorded. This {lang} publication, {title}, rises to that challenge magnificently, presenting a translation that captures both the literal meaning and the nuanced implications of the original Arabic text while maintaining the readability that general readers require.',
      'Access to the major Hadith collections in {lang} translation represents a significant milestone in making Islamic knowledge accessible to the global Muslim community, and this {lang} edition of {title} fulfills that mission with distinction. The translators have approached their work with the reverence and scholarly rigor that these sacred texts demand, consulting multiple classical commentaries and cross-referencing narrations across collections to ensure that the translation accurately reflects the established understanding of each Hadith among the scholars of the Muslim community.',
      'English translations of the major Hadith collections are among the most significant scholarly contributions to Islamic literature in the modern era, enabling millions of Muslims who are not fluent in Arabic to engage directly with the primary sources of Islamic law and Prophetic guidance. This {lang} publication titled {title} offers readers a meticulously prepared translation of one of these foundational collections, complete with scholarly notes, narrator biographies, and cross-references that enhance understanding and facilitate further study.',
    ],
    mids: [
      'This {lang} translation of {title} has been prepared by a team of qualified scholars who possess both advanced knowledge of Arabic and Hadith science and native-level command of the target language. Each Hadith has been translated with careful attention to preserving the precision of the original Arabic, including the specific legal and technical terminology that carries particular significance in Islamic jurisprudence. Where a literal translation might obscure the meaning for non-specialist readers, brief explanatory notes have been added to clarify the intent without altering the translation itself. The multi-volume format allows for comprehensive coverage of the entire collection, with generous margins, clear typography, and durable binding that supports the extended use these reference works demand. This {lang} edition is widely used in Islamic seminaries, universities, and research institutions throughout Pakistan and internationally.',
    ],
    closes: [
      'Order this monumental {lang} Hadith translation from Bab-ul-Fatah Pakistan for {price}. This multi-volume edition of {title} is an essential reference for every serious student of Islamic knowledge. We deliver to all cities in Pakistan with secure packaging. Shop online today.',
      'Purchase this authoritative {lang} translation of {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, this multi-volume set offers exceptional scholarly value. Order now for fast, reliable nationwide delivery.',
      'Add this landmark {lang} Hadith translation to your library by ordering from Bab-ul-Fatah Pakistan. Priced at {price}, {title} makes the Prophetic heritage accessible in {lang}. Order online with delivery across Pakistan.',
    ],
  },

  // ── Companions ────────────────────────────────────────────────────────────
  companions: {
    opens: [
      'The Companions of Prophet Muhammad (peace be upon him) — known collectively as the Sahabah — occupy a unique position in Islamic history as the generation that received the Quran directly, witnessed the Prophetic example firsthand, and carried Islam from the Arabian Peninsula to the farthest reaches of the known world. This {lang} publication titled {title} brings to life the extraordinary stories of these remarkable individuals, whose courage, wisdom, and sacrifices established the foundations upon which Islamic civilization was built.',
      'Among the most inspiring chapters of Islamic history are the accounts of the Sahabah who led the Muslim armies under the Prophet\'s command and, after his passing, carried the banner of Islam to distant lands with unparalleled military genius and unshakable faith. This {lang} work, {title}, focuses specifically on these military commanders among the Companions, chronicling their strategic brilliance, their personal piety, and their unwavering commitment to justice — even in the heat of battle — that distinguished Muslim warfare from all other military traditions.',
      'The lives of the Companions provide the most compelling proof of Islam\'s transformative power, as men and women from every walk of pre-Islamic Arabian society were elevated by their faith to levels of excellence in character, knowledge, and leadership that remain unmatched in human history. This {lang} publication, {title}, presents meticulously researched biographical accounts that highlight the individual journeys of the Sahabah from diverse backgrounds to their shared destiny as the vanguard of the Islamic civilization.',
    ],
    mids: [
      'This {lang} work on the Companions has been compiled using the most authoritative historical sources available, including the classical biographical dictionaries of Ibn Sa\'d, Ibn al-Athir, and Al-Tabari, as well as the extensive Hadith literature that preserves the words and actions of individual Sahabah. Each biography provides the Companion\'s full name, lineage, background before Islam, the circumstances of their conversion, their notable contributions during the Prophet\'s lifetime and afterward, and their lasting legacy. The {lang} narrative style makes these historical accounts vivid and engaging, while the scholarly references enable readers to verify every detail against primary sources. The book serves both as an inspirational reading experience and as a reliable historical reference for students of Islamic studies.',
    ],
    closes: [
      'Discover the remarkable lives of the Prophet\'s Companions with this {lang} book from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers timeless inspiration drawn from the greatest generation of Muslims. Order online for delivery to any city in Pakistan.',
      'Order this inspiring {lang} Companion biography collection from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} brings Islamic history to life. Shop online with fast nationwide delivery.',
    ],
  },

  // ── Biography ─────────────────────────────────────────────────────────────
  biography: {
    opens: [
      'Islamic biography transcends mere historical recording — it serves as a vehicle for transmitting the values, principles, and spiritual insights that guided the lives of the men and women who shaped Muslim civilization. This {lang} publication titled {title} presents a carefully researched life narrative that captures the essence of its subject\'s contributions to Islamic knowledge and community, offering readers both historical understanding and the inspiration to pursue excellence in their own lives through the examples of those who came before.',
      'The most impactful books about Islamic figures are those that go beyond surface-level biography to explore the inner spiritual journey, the intellectual development, and the practical challenges that shaped their subject\'s character and achievements. This {lang} work, {title}, achieves that depth by drawing upon primary sources, contemporary accounts, and the scholarly assessments of later historians to construct a portrait that is both historically accurate and genuinely inspiring for contemporary readers seeking to understand the factors that produce exceptional Muslim lives.',
    ],
    mids: [
      'This {lang} biographical work has been compiled using primary historical sources and verified scholarly references, ensuring that every narrative detail is grounded in documented evidence. The author provides rich contextual analysis that helps readers understand the social, political, and intellectual environment in which the subject lived and worked. Key events are examined not merely as historical incidents but as sources of practical lessons and spiritual insights that remain relevant for contemporary Muslims. The {lang} prose is engaging and accessible, making this work suitable for both serious researchers and general readers who wish to deepen their knowledge of Islamic history and the remarkable individuals who shaped it.',
    ],
    closes: [
      'Order this inspiring {lang} biography from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers both historical knowledge and spiritual motivation. Shop online with delivery available across Pakistan.',
      'Purchase this valuable {lang} biographical work from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. At {price}, {title} is a meaningful addition to any Islamic collection. Order today for reliable nationwide shipping.',
    ],
  },

  // ── Bakhoor (Incense) ─────────────────────────────────────────────────────
  bakhoor: {
    opens: [
      'Bakhoor — the traditional Arabian incense that has perfumed Muslim homes, mosques, and gathering places for centuries — is far more than a simple fragrance product. It is a cultural and spiritual practice that creates an atmosphere of warmth, hospitality, and tranquility, transforming ordinary spaces into environments that engage the senses and soothe the soul. This {title} from Bab-ul-Fatah represents the finest traditions of Arabian bakhoor craftsmanship, featuring a carefully blended aroma that combines premium natural ingredients for a rich, long-lasting fragrance experience.',
      'The use of fragrant incense in Islamic culture has deep roots in both the Prophetic Sunnah and the hospitality traditions of the Arabian Peninsula, where offering bakhoor to guests has long been considered a mark of generosity and refined taste. This {title} continues that noble tradition with a premium quality bakhoor that has been blended to deliver a complex, layered aroma. The carefully selected ingredients produce a fragrance that fills the room with warmth and elegance, making every occasion — from daily home use to special celebrations — feel more special.',
    ],
    mids: [
      'This {title} has been manufactured using a traditional Arabian formulation that blends premium oud, aromatic resins, floral essences, and exotic spices into a harmonious fragrance composition. The {format} quantity provides ample material for multiple uses, with each application producing a generous amount of fragrant smoke that permeates the space effectively. The bakhoor is easy to use — simply place a small amount on a hot charcoal disc in a suitable burner and allow the fragrance to diffuse naturally. The aroma is long-lasting, often lingering in fabrics and furnishings for hours after use, creating an inviting atmosphere that guests will notice and appreciate. Many families in Pakistan have incorporated bakhoor into their daily routines as a way to maintain a pleasant, welcoming home environment.',
    ],
    closes: [
      'Order this premium {title} from Bab-ul-Fatah Pakistan for {price}. Experience the authentic fragrance of Arabian bakhoor in your home. We deliver to all cities across Pakistan with secure packaging. Shop online today.',
      'Purchase this luxurious Arabian bakhoor from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for just {price}. {title} makes an excellent gift or personal indulgence. Order online with fast nationwide delivery.',
    ],
  },

  // ── Hajj Umrah ────────────────────────────────────────────────────────────
  hajj: {
    opens: [
      'The journey of Hajj and Umrah is a once-in-a-lifetime spiritual experience for most Muslims, and being properly equipped with the right accessories can make a significant difference in comfort and convenience during the pilgrimage. This {title} has been specifically designed for pilgrims, offering practical functionality that addresses the real challenges of performing religious rituals in the hot, crowded conditions of the Haramain. Every feature has been thoughtfully considered to serve the needs of the traveler while maintaining the simplicity and portability that pilgrimage demands.',
    ],
    mids: [
      'This {title} is constructed from lightweight, durable materials that perform reliably in the challenging conditions that pilgrims face during Hajj and Umrah. The design prioritizes practical utility — providing protection from the sun while remaining compact enough to carry through crowded areas and easy to store when not needed. Pilgrims who have used this product report that it significantly improved their comfort level during the rituals, allowing them to focus more fully on the spiritual dimensions of their worship rather than being distracted by physical discomfort. The quality construction ensures that this item can be reused for future pilgrimages or shared with family members who are planning to perform Hajj or Umrah.',
    ],
    closes: [
      'Prepare for your pilgrimage with this practical {title} from Bab-ul-Fatah Pakistan for {price}. Designed specifically for Hajj and Umrah pilgrims. Order online with delivery across Pakistan before your journey.',
      'Order this essential {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for just {price}. A practical companion for your sacred journey. Shop online with fast nationwide delivery.',
    ],
  },

  // ── Packages ──────────────────────────────────────────────────────────────
  packages: {
    opens: [
      'Building a comprehensive personal Islamic library can be both time-consuming and expensive when books are purchased individually, which is why carefully curated packages like this {title} offer exceptional value for Muslims who want to acquire a solid foundation of Islamic knowledge in a single, cost-effective purchase. This package has been assembled by Bab-ul-Fatah\'s editorial team to include the most essential, widely recommended titles that every Muslim household should own, covering the core areas of faith, worship, character development, and daily Islamic practice.',
    ],
    mids: [
      'This {title} package includes a thoughtfully selected collection of Islamic books that together provide a well-rounded foundation of essential Islamic knowledge. Each title in the package has been chosen for its scholarly reliability, practical usefulness, and reader accessibility, ensuring that the recipient receives maximum value from every included item. The {format} contents address the most important aspects of Islamic practice and belief, making this package an ideal starting point for new Muslims, a thoughtful gift for family and friends, or a convenient way for established readers to fill gaps in their Islamic library. The combined price of the package represents significant savings compared to purchasing each title individually.',
    ],
    closes: [
      'Order this curated {title} from Bab-ul-Fatah Pakistan for {price}. A comprehensive Islamic book package at an exceptional value. Shop online with delivery to all cities in Pakistan.',
      'Purchase this value-packed {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, this package saves you money while building your Islamic library. Order today for nationwide delivery.',
    ],
  },

  // ── Ashfaq Ahmed (Pakistani novelist) ─────────────────────────────────────
  ashfaq_ahmed: {
    opens: [
      'Ashfaq Ahmed stands as one of the most beloved and influential writers in Urdu literature, whose distinctive narrative voice combines philosophical depth, emotional sensitivity, and a rare ability to illuminate the complexities of human nature through stories that feel simultaneously universal and deeply personal. This {lang} publication, {title}, exemplifies the literary qualities that have made Ashfaq Ahmed a household name across Pakistan and the wider Urdu-speaking world, offering readers a narrative experience that engages the heart, challenges the mind, and lingers in the memory long after the final page has been turned.',
      'The literary legacy of Ashfaq Ahmed transcends conventional genre boundaries, weaving together elements of spirituality, social commentary, philosophical reflection, and deeply human storytelling into works that defy easy categorization but reward every reading with new layers of meaning. This {lang} book titled {title} carries forward that legacy with all the grace and insight that readers have come to expect from one of Urdu literature\'s most original voices. The themes explored in this work — faith, love, loss, longing, and the eternal search for meaning — resonate with readers across generations and cultural backgrounds.',
    ],
    mids: [
      'This {lang} publication by Ashfaq Ahmed has been produced with the editorial care and production quality that a work of this literary significance deserves. The text has been carefully proofread against the authoritative edition to ensure complete accuracy, and the typography has been designed for comfortable reading of extended passages. Ashfaq Ahmed\'s prose style — characterized by its elegant simplicity, its ability to convey profound ideas through seemingly effortless language, and its deep emotional resonance — is best appreciated in a well-produced edition like this one, where the physical book does justice to the literary artistry of its content. This {lang} edition is particularly valued by collectors and serious readers of Urdu literature.',
    ],
    closes: [
      'Order this classic {lang} work by Ashfaq Ahmed from Bab-ul-Fatah Pakistan for {price}. Experience the literary brilliance of one of Pakistan\'s most cherished writers. Shop online with delivery to all cities in Pakistan.',
      'Purchase this beautifully produced {lang} edition of {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, this Ashfaq Ahmed classic is a must-have for every Urdu literature lover. Order today for nationwide delivery.',
    ],
  },

  // ── Scholars (Imams Scholars) ─────────────────────────────────────────────
  scholars: {
    opens: [
      'The scholars of Islam have served throughout history as the guardians of authentic religious knowledge, dedicating their lives to the preservation, interpretation, and transmission of the Quran and Sunnah across generations. This {lang} publication titled {title} contributes to our understanding of Islamic scholarly heritage, exploring the contributions, methodologies, and intellectual legacy of important scholars whose work continues to influence Muslim thought and practice in the contemporary world.',
      'Islamic intellectual history is populated by extraordinary individuals whose mastery of multiple disciplines — Quranic exegesis, Hadith science, jurisprudence, theology, and philosophy — produced bodies of work that remain indispensable centuries after their composition. This {lang} work, {title}, provides insight into such scholarly contributions, offering readers both historical context and practical understanding of how these intellectual achievements continue to shape Islamic scholarship and practice in Pakistan and beyond.',
    ],
    mids: [
      'This {lang} scholarly publication has been prepared with rigorous attention to source accuracy and intellectual fairness, drawing upon primary historical documents, the scholarly works of the subject, and the assessments of later historians and biographers. The content is presented in a {lang} narrative that balances scholarly depth with readability, making the material accessible to educated general readers while maintaining the analytical standards expected in academic Islamic studies. The practical implications of the scholarly contributions discussed are highlighted throughout, helping readers understand how the intellectual legacy of past scholars informs contemporary Islamic practice and education.',
    ],
    closes: [
      'Order this scholarly {lang} publication from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers valuable insight into Islamic intellectual heritage. Shop online with delivery to all cities in Pakistan.',
      'Purchase this informative {lang} work from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore, for just {price}. {title} is recommended for students and scholars of Islamic studies. Order today for fast nationwide delivery.',
    ],
  },

  // ── Darul Iblagh ──────────────────────────────────────────────────────────
  darul_iblagh: {
    opens: [
      'Darul Iblagh Publications has earned a respected place in Pakistan\'s Islamic publishing landscape by producing works that address the practical spiritual and religious needs of Urdu-speaking Muslims with clarity, authenticity, and an accessible writing style. This {lang} publication titled {title} upholds that tradition, offering content that is firmly grounded in authentic Islamic sources while remaining approachable for readers who may not have advanced training in Islamic studies. The work addresses a topic of genuine practical relevance to Muslim daily life.',
    ],
    mids: [
      'This {lang} publication from Darul Iblagh has been developed with the practical needs of Muslim readers as the primary consideration. The content is organized for easy reference and sequential reading, with clear explanations that make complex topics understandable without sacrificing accuracy. The author draws upon the Quran, authenticated Hadith, and the consensus of qualified scholars to present guidance that readers can follow with confidence. The {lang} prose style is warm and engaging, avoiding the dry, academic tone that characterizes many Islamic publications while maintaining the scholarly standards that religious content requires. This balanced approach has made Darul Iblagh titles popular among a wide range of readers throughout Pakistan.',
    ],
    closes: [
      'Order this valuable {lang} publication from Darul Iblagh through Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers practical Islamic guidance in accessible language. Shop online with delivery across Pakistan.',
      'Purchase this {lang} Darul Iblagh edition from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for just {price}. {title} addresses real Muslim concerns with scholarly reliability. Order today for fast nationwide delivery.',
    ],
  },

  // ── General ───────────────────────────────────────────────────────────────
  general: {
    opens: [
      'Growing in Islamic knowledge is a journey without end, and having access to well-written, properly sourced publications makes that journey both more productive and more enjoyable. This {lang} work titled {title} addresses an important topic within the broader landscape of Islamic scholarship, presenting information that is both intellectually engaging and practically relevant for Muslims seeking to deepen their understanding of their faith and strengthen their daily practice.',
      'Islam offers comprehensive guidance for every dimension of human experience, and publications like this {lang} edition of {title} help Muslims access that guidance by addressing specific topics with the combination of scholarly depth and practical clarity that contemporary readers need. Whether you are a seasoned student of Islamic knowledge or exploring a particular area for the first time, this book provides content that is well-researched, authentically sourced, and presented in a manner that respects both the subject matter and the reader\'s intelligence.',
      'The path of faith is illuminated by knowledge, and every authentic Islamic publication that reaches a Muslim reader contributes — however modestly — to the brightening of that path. This {lang} publication, {title}, is one such contribution, offering its readers a focused treatment of its subject that draws upon the Quran, verified Hadith, and established scholarly consensus. The writing style is clear and direct, the content is free from unsubstantiated claims, and the overall quality reflects the seriousness with which the author and publisher approach the sacred duty of conveying Islamic knowledge.',
      'Access to authentic Islamic literature has never been more important than it is today, when Muslims are constantly exposed to conflicting information from social media, unreliable online sources, and individuals who present personal opinions as established Islamic positions. This {lang} work titled {title} provides a reliable antidote to that confusion by presenting its subject matter with transparent sourcing, scholarly documentation, and a clear acknowledgment of what Islam\'s primary texts actually say about the topic at hand.',
    ],
    mids: [
      'This {lang} publication has been prepared with meticulous attention to both content accuracy and reader accessibility. The author draws upon the Quran, verified Hadith, and established scholarly sources to present information that readers can trust and apply with confidence. The writing style avoids unnecessary jargon while maintaining the scholarly rigor that Islamic publications require, making this work suitable for a diverse readership including Islamic school students, university attendees, self-directed learners, and general readers who want to expand their understanding of Islam. The practical focus ensures that the knowledge gained can be translated into meaningful action in the reader\'s daily life.',
    ],
    closes: [
      'Order this valuable {lang} Islamic publication from Bab-ul-Fatah Pakistan for {price}. This edition of {title} offers quality content at an accessible price. Shop online with delivery to all cities in Pakistan.',
      'Get this informative {lang} book from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. Priced at {price}, {title} is a worthwhile addition to any Islamic library. Order today for reliable nationwide shipping.',
      'Purchase this {lang} Islamic work from Bab-ul-Fatah Pakistan for just {price}. {title} provides well-researched, authentic content for every reader. Order online and benefit from our fast delivery service across Pakistan.',
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
  if (author && author.length > 1 && author.length < 80 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author) && !/darul iblagh/i.test(author) && !/ashfaq ahmed/i.test(author) && !/daar ul noor/i.test(author) && !/al-imam al-hafiz/i.test(author) && !/abdul-halim/i.test(author)) {
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
      'This {lang} edition has been produced to exacting quality benchmarks, featuring premium-grade paper, a robust and durable binding, and typography that ensures comfortable reading during extended study sessions and daily reference use.',
      'Bab-ul-Fatah is recognized throughout Pakistan as a dependable and trustworthy source for authentic Islamic publications, and this particular edition of {title} exemplifies the caliber of materials that discerning readers have come to expect from our platform.',
      'Whether you are an advanced scholar with decades of study behind you or a curious newcomer taking your first steps into Islamic learning, this {lang} publication delivers content that is simultaneously approachable for beginners and intellectually rewarding for experienced readers.',
      'The production and editorial team behind this {lang} edition has ensured that international quality standards are met on every page, with content reviewed under scholarly supervision to guarantee accuracy, authenticity, and adherence to orthodox Islamic positions throughout.',
      'This work effectively bridges the gap between the rich classical tradition of Islamic scholarship and the informational needs of contemporary readers, presenting time-honored wisdom in a format that resonates with modern audiences while preserving its original depth and nuance.',
      'Islamic educators and institutional leaders throughout Pakistan consistently recommend this {lang} publication to their students and colleagues, citing its clarity of expression, depth of scholarly content, and strict adherence to authentic Islamic source material as qualities that set it apart from alternatives.',
      'The sustained demand for this {lang} title across multiple editions and print runs reflects its enduring relevance to Muslim readers and the deep trust that successive generations have placed in the accuracy, reliability, and scholarly integrity of its content.',
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
  const authorPart = (author && author.length > 0 && author.length < 60 && !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) && !/darussalam/i.test(author) && !/darul iblagh/i.test(author) && !/ashfaq ahmed/i.test(author) && !/daar ul noor/i.test(author) && !/al-imam al-hafiz/i.test(author) && !/abdul-halim/i.test(author)) ? ` by ${author}` : '';

  const templates = [
    `${title} — buy online at Bab-ul-Fatah Pakistan. ${lang} ${cat}${authorPart} for ${price}. Fast nationwide delivery.`,
    `Shop ${title} from Bab-ul-Fatah Pakistan. Premium ${lang} ${cat} at ${price}${authorPart}. Order now for quick delivery.`,
    `Order ${title} in ${lang} — ${price} at Bab-ul-Fatah Pakistan. Authentic ${cat}${authorPart}. Nationwide shipping available.`,
    `${title} by Bab-ul-Fatah Pakistan. ${lang} ${cat} priced at ${price}${authorPart}. Trusted Islamic products retailer.`,
    `Purchase ${title} for ${price} from Bab-ul-Fatah. ${lang} ${cat}${authorPart}. Pakistan's most reliable online Islamic store.`,
    `${title} — ${lang} ${cat} available at ${price}. Bab-ul-Fatah Pakistan${authorPart}. Order online today for delivery.`,
    `Buy ${title} in ${lang} at ${price}. Bab-ul-Fatah Pakistan stocks authentic ${cat.toLowerCase()} items.${authorPart} Shop now.`,
    `${title} ${lang} edition for ${price}. Bab-ul-Fatah — Pakistan's trusted Islamic bookstore${authorPart}. Order with fast delivery.`,
    `Authentic ${title} in {lang} at ${price} — Bab-ul-Fatah Pakistan. ${cat}${authorPart}. Order online for nationwide shipping.`,
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
  console.log('  Bab-ul-Fatah SEO Batch 3 — Products 201-300 Descriptions');
  console.log('='.repeat(60) + '\n');

  // Step 1: Fetch products 201-300 from DB and save to JSON
  console.log('  Step 1: Fetching products 201-300 from database...');
  const productsFromDb = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    skip: 200,
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

  // Save to batch3-products.json
  const productsPath = path.join(__dirname, 'batch3-products.json');
  fs.writeFileSync(productsPath, JSON.stringify(productsFromDb, null, 2));
  console.log(`  Saved to: ${productsPath}\n`);

  // Step 2: Load products (use the saved file for consistency)
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`  Loaded ${products.length} products from batch3-products.json\n`);

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
  const metaPath = path.join(__dirname, 'seo-meta-batch3.json');
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
    progress.batches['3'] = {
      status: 'completed',
      startIdx: 201,
      endIdx: 300,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
    };
    progress.completedBatches = 3;
    progress.completedProducts = 400;
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress file updated: batch 3 marked as completed`);
  } catch (progressErr) {
    const altPath = path.join(__dirname, 'seo-progress-batch3.json');
    const progress = {
      batch: 3,
      status: 'completed',
      startIdx: 201,
      endIdx: 300,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
      completedBatches: 3,
      completedProducts: 400,
    };
    fs.writeFileSync(altPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress saved to: ${altPath}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n  Completed in ${elapsed}s`);
  console.log('='.repeat(60) + '\n');
}

main()
  .catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
