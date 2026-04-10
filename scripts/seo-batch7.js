#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 7 Description Writer
// Writes unique, SEO-optimized product descriptions for products 601-700
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
  if (/madinah.arabic.reader|mukhtar.al.nahv|modern.arabic|introducing.arabic|learning.arabic|lets.speak|arabic.course|arbi.grammar|daroos.ul.lughatul|fun.with.arabic|jadeed.arbi/i.test(t+' '+s)) return 'arabic';
  if (/mashaallah|mohr.e.nabowat|kalima|ayat.ul.kursi|hasbunallah|fabi.ayyi|ina.allah|la.hola|calligraphy|home.decor/i.test(t+' '+s)) return 'home_decor';
  if (/sahih.al.bukhari|sahih.muslim|sunan.abu.dawud|sunan.nasai|sunan.ibn.majah|jami.at.tirmidhi|mukhtasar.sahih|fath.ul.bari|hidayat.al.qari/i.test(t+' '+s)) return 'sahah_sitta';
  if (/riyad.us.saliheen|mishkat.al.masabih|hadith|ahadith|fazail|sunehri|darood|jihad|jahanum|janazay|libaas|kabeera|itybah|khareed/i.test(t+' '+s)) return 'hadith';
  if (/tafseer|tafseer|tafsir|bayan.ul.quran|fath.ul.qadeer/i.test(t+' '+s)) return 'tafseer';
  if (/seerah|prophet|nabuwat|miracles|muhammad.*(pbuh|saw|peace|leader|beloved|global)|khatam|muntakhab/i.test(t+' '+s)) return 'seerah';
  if (/maani.ul.quran|translation|tarjuma|mutaradam/i.test(t+' '+s)) return 'translation';
  if (/fiqh|ahkam|masla|fatawa|hukm|halal|haram|islam.*(kia|ke|main|ki)|bunyaadi|arkan|rooyat|moon/i.test(t+' '+s)) return 'fiqh';
  if (/namaz|salat|prayer|dua|azkar|fortress|hisn|kitab.al.azkaar|taubah|tawbah|masnoon.namaz|masnoon.janaza|sunnah.*day|masnoon.amaal/i.test(t+' '+s)) return 'prayer';
  if (/hajj|umrah|ziyarah/i.test(t+' '+s)) return 'hajj';
  if (/child|kid|bachon|bachey|qasas|anbiya|silsila|migo|musalman.bachey|missing.out|magroor|maqamat|kindness/i.test(t+' '+s)) return 'children';
  if (/women|khawateen|aurat|pardah|hijab|nikkah|nikah|biwi|khatoon|mislam/i.test(t+' '+s)) return 'women';
  if (/family|parents|talaq|shadi|biyaah|mareez|muhafiz|qalb|healthy/i.test(t+' '+s)) return 'family';
  if (/companion|sahaba|sahabiyat|khalid|jabir|khateeb|qadsiyah|jalola|heroes|ashab|ilm.ka.samandar/i.test(t+' '+s)) return 'companions';
  if (/biography|life|memoir|zindgi|waqiat|meray.aslaaf|maalim|imam.*(ahmad|hanbal|ibn|sufiyan)|albaani|scholar|kirdar/i.test(t+' '+s)) return 'biography';
  if (/scholars|imams|ilim.e|ilam/i.test(t+' '+s)) return 'scholars';
  if (/aqeedah|aqeeda|aqida|faith|predestination|imaan|eeman|jeena.*marna/i.test(t+' '+s)) return 'aqeedah';
  if (/history|tarikh|makka|maddinah|fatuh|atlas|conquest/i.test(t+' '+s)) return 'history';
  if (/education|grade|islamic.studies|beginner|men.in.captivity|mingling|character|guidelines|imtiyaaz|deen.e.kamil/i.test(t+' '+s)) return 'education';
  if (/medicine|health|tib/i.test(t+' '+s)) return 'health';
  if (/darussalam|darul/i.test(c)) return 'darussalam';
  if (/bakhoor|burner|incense|surma|almond|food/i.test(t+' '+s)) return 'products';
  if (/ramadan|fasting|roza/i.test(t+' '+s)) return 'ramadan';
  if (/cap|shamagh|prayer.cap/i.test(t+' '+s)) return 'products';
  if (/car.tag|hangings/i.test(t+' '+s)) return 'products';
  if (/mushaf|quran.*(kareem|lines|pocket|jumbo|al.kareem)|matrajam/i.test(t+' '+s)) return 'mushaf';
  if (/reference|masajid|mashoor|waseela|esaal|gunahon|dawat|dawaat|dhari|khizab|dictionary/i.test(t+' '+s)) return 'reference';
  return 'general';
}

// ─── Product-specific detail extractor ───────────────────────────────────────
function productDetail(title, index) {
  const t = title.toLowerCase();
  // MashaAllah variants
  if (/table.decor/i.test(t) && /black/i.test(t)) return 'elegant black-finish table decor piece';
  if (/table.decor/i.test(t) && /golden/i.test(t)) return 'luxurious golden-finish table decor accent';
  if (/wall.art/i.test(t) && /black/i.test(t)) return 'sophisticated black laser-cut wall art panel';
  if (/wall.art/i.test(t) && /golden/i.test(t)) return 'stunning golden-finish laser-cut wall art';
  if (/large.wall.art/i.test(t) && /black/i.test(t)) return 'bold oversized black wall art statement piece';
  if (/large.wall.art/i.test(t) && /golden/i.test(t)) return 'grand golden-finish large wall art centerpiece';
  if (/long.calligraphy/i.test(t)) return 'extended-length calligraphy panel in horizontal format';
  if (/new.calligraphy/i.test(t)) return 'fresh contemporary calligraphy design in modern style';
  if (/calligraphy$/i.test(t)) return 'classic calligraphy art in traditional script';
  if (/calligraphy.*golden/i.test(t)) return 'premium golden-finish calligraphy artwork';
  if (/mohr.e.nabowat/i.test(t)) return 'Mohr-e-Nabowat S.A.W.W themed calligraphy tribute piece';
  if (/car.tag/i.test(t)) return 'laser-cut car tag for vehicle dashboard or rearview display';
  // Madinah Arabic Reader
  const readerMatch = t.match(/madinah.arabic.reader\s*(\d+)/);
  if (readerMatch) {
    const num = parseInt(readerMatch[1]);
    const ordinals = ['','first','second','third','fourth','fifth','sixth','seventh','eighth'];
    const level = num <= 3 ? 'beginner' : num <= 6 ? 'intermediate' : 'advanced';
    return `Book ${num} of the series — the ${ordinals[num] || num+'th'} volume designed for ${level}-level Arabic language students`;
  }
  // Mukhtasar Sahih Bukhari
  if (/mukhtasar.sahih.bukhari.*imported/i.test(t)) return 'premium imported 2-volume abridged edition of Sahih Al-Bukhari';
  if (/mukhtasar.sahih.*(bukhari).*large/i.test(t)) return 'large-format Urdu abridged edition of Sahih Al-Bukhari';
  if (/mukhtasar.sahih.muslim.*arabic/i.test(t)) return 'Arabic-language abridged edition of Sahih Muslim';
  if (/mukhtasar.sahih/i.test(t)) return 'abridged 2-volume set of Sahih Al-Bukhari in Urdu';
  // Prophet Muhammad books
  if (/global.village/i.test(t)) return 'exploring Prophet Muhammad (PBUH) as a universal guide for all humanity';
  if (/greatest/i.test(t)) return 'presenting the unparalleled greatness of Prophet Muhammad (PBUH)';
  if (/beloved.of.allah/i.test(t)) return 'celebrating Prophet Muhammad (PBUH) as the beloved of Allah';
  if (/leader.*messenger/i.test(t)) return 'examining Prophet Muhammad (PBUH) as both a leader and a messenger';
  if (/sabar.*shukar/i.test(t)) return 'exploring the patience and gratitude of Prophet Muhammad (PBUH)';
  if (/miracles/i.test(t) && /merits/i.test(t)) return 'documenting the miraculous signs and noble merits of Allah\'s Messenger';
  // Mishkat
  if (/mishkat/i.test(t) && /3.vols/i.test(t) && /amm/i.test(t)) return 'comprehensive 3-volume hadith compilation in accessible edition';
  if (/mishkat/i.test(t)) return 'authoritative 3-volume set of Mishkat Al-Masabih hadith collection';
  // Qasas
  if (/qissa.*hood/i.test(t)) return 'part 4 of the 30-part Qasas ul Anbiya series focusing on Prophet Hood (AS)';
  // Hajj variants
  if (/masnoon.hajj.*latest/i.test(t)) return 'updated latest edition covering the complete Masnoon Hajj and Umrah procedures';
  if (/masnoon.hajj.*small/i.test(t)) return 'compact pocket-sized Hajj and Umrah guide for pilgrims';
  if (/hajj.*guide/i.test(t)) return 'practical step-by-step Hajj and Umrah guidebook for travellers';
  // Maani ul Quran variants
  if (/maani.*quran.*beyaz/i.test(t)) return 'white-cover Parah 1-10 edition of the renowned Maani ul Quran translation';
  if (/maani.*quran.*imported/i.test(t)) return 'premium imported edition of Maani ul Quran with superior print quality';
  return null;
}

// ─── Templates (ALL NEW for batch 7) ────────────────────────────────────────
const T = {

  // ── Arabic Learning ──────────────────────────────────────────────────────
  arabic: {
    opens: [
      'Mastering the Arabic language is the key that unlocks direct access to the Quran, the Hadith, and centuries of Islamic scholarship — transforming a Muslim\'s relationship with their primary religious texts from one of mediated dependence to confident, independent comprehension. {title} has been structured as a progressive learning tool that guides students from basic letter recognition through sentence construction to the reading and understanding of classical Arabic texts, building competence layer by layer in a manner that respects the natural sequence of language acquisition.',
      'The Arabic language occupies a uniquely privileged position in Islamic civilization as the vehicle of divine revelation and the medium through which the greatest scholars of the Ummah expressed their most profound insights. {title} approaches the teaching of this sacred language with the seriousness that its subject demands, combining rigorous grammatical instruction with practical reading exercises that develop genuine fluency rather than mere theoretical knowledge of linguistic rules.',
      'Effective Arabic language instruction for non-native speakers requires a pedagogical approach that acknowledges the fundamental differences between Arabic and Urdu or English while leveraging the connections that exist between these languages. {title} implements that approach through a carefully designed curriculum that introduces Arabic grammar, vocabulary, and syntax in a logical sequence supported by abundant practice exercises, enabling students to achieve measurable progress with each chapter they complete.',
      'The proven methodology behind the Madinah Arabic curriculum has produced generations of Arabic-fluent Muslims across the world, establishing it as one of the most respected and widely adopted Arabic teaching systems in contemporary Islamic education. {title} carries forward that legacy with a structured presentation that has been refined through decades of classroom application, giving students the benefit of an instructional approach whose effectiveness has been validated by thousands of successful graduates.',
    ],
    mids: [
      'Each lesson in {title} introduces new grammatical concepts through clear explanations supported by illustrative examples drawn from the Quran and classical Arabic literature. Vocabulary is presented in thematic groups that facilitate memorization, and grammar drills are designed to reinforce understanding through active application rather than passive recognition. The exercises progress from controlled practice with model answers to more open-ended composition tasks that challenge students to apply what they have learned in creative ways. Translation exercises between Arabic and Urdu develop bidirectional competence, while reading passages drawn from authentic Islamic texts build the student\'s confidence in engaging with real-world Arabic material. This progressive approach ensures that students develop not just theoretical knowledge of Arabic grammar but the practical ability to read, understand, and appreciate classical Islamic texts in their original language. Bab-ul-Fatah Pakistan offers this essential Arabic learning resource at {price}.',
      'The curriculum design of {title} reflects decades of pedagogical refinement in teaching Arabic to speakers of Urdu and other South Asian languages. The authors have identified the specific challenges that these students face — such as the transition from right-to-left reading direction, the mastery of Arabic verb forms, and the understanding of complex sentence structures — and have addressed each one through targeted instruction and graduated practice. Supplementary materials including vocabulary lists, conjugation tables, and summary charts provide convenient reference tools that students can use both during formal study and for independent review. The production quality ensures durability through repeated use, making this title a lasting addition to any student\'s educational library. Available at {price} from Bab-ul-Fatah Pakistan with delivery to all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Build your Arabic language skills with this proven, structured curriculum. Order online with fast delivery across Pakistan.',
      'Buy {title} — a trusted Arabic learning resource — from Bab-ul-Fatah Pakistan for {price}. Perfect for students and self-learners. Shop online with nationwide shipping.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Master classical Arabic with this progressive, exercise-rich curriculum. Order today with reliable delivery across all cities in Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Essential Arabic language instruction for every Muslim learner. Order online now.',
    ],
  },

  // ── Home Decor (MashaAllah, Mohr-e-Nabowat calligraphy) ──────────────────
  home_decor: {
    opens: [
      'The phrase "MashaAllah" — meaning "whatever Allah wills" — is one of the most frequently spoken expressions in a Muslim\'s daily life, a constant acknowledgment that every blessing, achievement, and moment of beauty originates from the Creator alone. Rendering this beloved phrase in finely crafted calligraphy and displaying it in one\'s home transforms a spoken dhikr into a permanent visual reminder, creating an atmosphere where gratitude and divine consciousness permeate every glance. This {detail} — {title} — from Bab-ul-Fatah captures both the aesthetic beauty and the spiritual depth of this treasured Islamic expression.',
      'Islamic home decor has evolved far beyond its traditional boundaries to embrace contemporary design sensibilities while preserving the sacred essence of the calligraphic content it presents. This {detail} exemplifies that evolution, combining precision laser-cut craftsmanship with the timeless power of Arabic calligraphy to produce a decorative piece that enhances any interior space — from minimalist modern apartments to traditionally furnished family homes. The quality of execution reflects the respect that its sacred content deserves.',
      'The tradition of adorning Muslim homes with calligraphic expressions of faith stretches across centuries and continents, reflecting a universal understanding that one\'s physical environment shapes one\'s spiritual state in ways both subtle and profound. This {detail} — {title} — continues that tradition with manufacturing precision that would have been unimaginable to earlier generations, achieving levels of detail and consistency in the calligraphic rendering that honor both the artistic heritage of Islamic civilization and the expectations of today\'s discerning Pakistani consumers.',
      'Choosing Islamic calligraphy for one\'s living space represents far more than a decorative decision — it is a statement of identity, a source of daily spiritual nourishment, and a tangible expression of the values that define a Muslim household. This {detail} delivers all three benefits through its combination of artistic excellence and meaningful content. Whether displayed in a drawing room, bedroom, study, or prayer area, it establishes a visual focal point that enriches the space and inspires everyone who encounters it.',
    ],
    mids: [
      'The craftsmanship behind this {detail} involves advanced laser-cutting technology that reproduces every curve, serif, and flourish of the Arabic calligraphy with exceptional precision. The {title} is manufactured from carefully selected materials chosen for their durability, finish quality, and resistance to environmental factors that could compromise appearance over time. The design has been optimized for standard display locations in Pakistani homes — wall-mounted pieces include pre-drilled mounting points, while table decor variants feature stable bases that prevent tipping. The finish options — whether classic black, elegant golden, or other available variants — have been formulated to resist fading and maintain their visual appeal through years of display. Each piece undergoes quality inspection before packaging to ensure it meets the standards that Bab-ul-Fatah customers expect. Available at {price}, this calligraphy piece represents outstanding value in the Islamic home decor category.',
      'This {detail} from Bab-ul-Fatah has been designed to serve multiple purposes simultaneously — as a personal source of spiritual inspiration, as a decorative element that elevates the aesthetic quality of any room, and as a meaningful gift for weddings, housewarmings, Eid celebrations, and other special occasions. The packaging has been designed to protect the piece during transit while presenting it attractively for gift-giving. The versatility of the design allows it to complement a wide range of interior styles, from contemporary to traditional, ensuring that regardless of the recipient\'s personal taste, this calligraphy piece will be cherished and displayed with pride. At {price}, it offers a premium decorative experience at a price point that makes it accessible to a broad range of customers across Pakistan.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Premium Islamic calligraphy for your home or as a meaningful gift. Shop online with nationwide delivery.',
      'Purchase {title} from Bab-ul-Fatah Pakistan for {price}. High-quality laser-cut Islamic calligraphy decor with durable finish. Order online with fast shipping across Pakistan.',
      'Enhance your home with {title} available at Bab-ul-Fatah Pakistan for {price}. This {detail} makes a perfect gift for weddings, Eid, and housewarmings. Shop now with reliable delivery.',
      'Buy {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Beautifully crafted Islamic calligraphy art for every space. Order online with secure nationwide delivery.',
    ],
  },

  // ── Sahah Sitta (Mukhtasar Sahih Al-Bukhari, Sahih Muslim) ──────────────
  sahah_sitta: {
    opens: [
      'Sahih Al-Bukhari stands as the most authoritative collection of Hadith in the entire Islamic tradition — a monumental work compiled by Imam Muhammad ibn Ismail Al-Bukhari over sixteen years of meticulous research during which he examined approximately six hundred thousand narrations and accepted only those that met his extraordinarily rigorous standards of authentication. This {detail} — {title} — makes this indispensable treasure of Prophetic guidance accessible to Urdu-speaking readers in a condensed format that preserves the essential content while reducing the overall volume to a more manageable size for study and reference.',
      'The six canonical Hadith collections (Sahah Sitta) form the backbone of Islamic legal and theological scholarship, providing the evidentiary basis upon which rulings of Shariah are established and the details of Prophetic practice are understood. Among these, Sahih Al-Bukhari and Sahih Muslim hold positions of particular eminence as the two most authenticated collections, universally accepted by scholars of every school of Islamic thought. This {detail} delivers that authenticated content in a format designed for serious students who require reliable access to the primary texts of their faith.',
      'Access to the authentic sayings and actions of Prophet Muhammad (peace be upon him) is not a scholarly luxury but a practical necessity for every Muslim who wishes to practice their religion with knowledge and precision. This {detail} — {title} — serves that essential need by presenting carefully selected and verified narrations from the most trusted Hadith collections, accompanied by scholarly notes that clarify context, explain terminology, and connect each narration to its broader legal and theological implications within the Islamic tradition.',
    ],
    mids: [
      'This {detail} has been prepared by qualified scholars who have applied rigorous standards of selection, ensuring that every narration included meets the authentication requirements established by the great Hadith masters of Islamic history. The Urdu translation renders the Arabic original with precision and clarity, maintaining the scholarly accuracy of the source material while using language that is accessible to contemporary readers. Each narration is presented with its complete chain of transmission (isnad) and reference to its location in the parent collection, enabling readers to verify the source independently. The physical production — whether in the imported, standard, or large-format edition — features clear typography, durable binding, and high-quality paper that withstands the demands of regular reference use. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making these essential Hadith resources available to students and scholars throughout the country.',
      'The organizational structure of this {detail} follows the traditional chapter arrangement established by Imam Al-Bukhari, grouping narrations by subject matter in a sequence that reflects both the practical priorities of Islamic practice and the scholarly methodology of Hadith classification. Cross-references between related narrations help readers appreciate the comprehensive guidance that the Sunnah provides on each topic. The introductory materials explain the principles of Hadith authentication and the specific criteria used in the selection process, equipping readers with the contextual knowledge they need to engage with the content critically and intelligently. Available from Bab-ul-Fatah Pakistan at {price}, this edition represents an essential addition to any serious Islamic library.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. An essential Hadith reference for every Muslim home and library. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Authenticated Prophetic traditions in accessible Urdu. Order online with fast, reliable nationwide shipping.',
      'Purchase {title} — {detail} — from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Invest in authoritative Hadith scholarship. Order today with nationwide delivery.',
    ],
  },

  // ── Hadith (Riyad Us Saliheen, Mishkat Al-Masabih, Sunnah compilations) ──
  hadith: {
    opens: [
      'The science of Hadith represents Islam\'s most distinctive contribution to the preservation of religious knowledge — a system of authentication and documentation so rigorous that it has no parallel in any other religious or historical tradition. This {detail} — {title} — contributes to that noble tradition of preservation by presenting authenticated narrations from the Prophet Muhammad (peace be upon him) in a format that serves both scholarly reference and practical guidance for Muslims seeking to align their daily lives with the Prophetic example.',
      'The sayings and actions of Prophet Muhammad (peace be upon him) — collectively known as the Sunnah — constitute the second source of Islamic legislation after the Quran, providing the practical interpretation and application of divine guidance that transforms abstract principles into observable behavior. This {detail} — {title} — makes a significant body of that Prophetic guidance available to readers, carefully selected and authenticated by scholars who have dedicated their lives to the preservation and verification of the Hadith tradition.',
      'Hadith literature encompasses an extraordinarily vast body of material that documents virtually every aspect of the Prophet\'s life — his words, his actions, his approvals, and his personal conduct — providing Muslims with a comprehensive model for living that addresses the spiritual, social, ethical, and practical dimensions of human existence. This {detail} — {title} — serves as a curated gateway into that vast literature, presenting narrations of particular relevance and practical value in a manner that facilitates both study and immediate application.',
    ],
    mids: [
      'The narrations in this {detail} have been selected and verified according to the strict methodological standards established by the classical Hadith scholars, with particular attention to the integrity of transmission chains and the reliability of individual narrators. Each Hadith is presented in its original Arabic alongside a clear Urdu translation that captures both the literal meaning and the broader contextual significance of the narration. Where applicable, brief explanatory notes clarify historical context, define technical terminology, and highlight the practical implications of each narration for contemporary Muslim life. The physical production quality — durable binding, clear typography on quality paper — ensures that this reference work will serve its owner through years of regular consultation and study. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing affordable access to the authentic Prophetic traditions for readers across the country.',
      'This {detail} — {title} — has been organized with practical usability in mind, grouping related narrations under thematic headings that facilitate both sequential study and targeted topic-based consultation. The comprehensive index enables readers to locate specific narrations or subject areas quickly, while the logical chapter progression supports readers who prefer to work through the material systematically. The translation style balances scholarly precision with readability, ensuring that the content is accessible to readers without advanced training in Islamic sciences while maintaining the accuracy that more specialized readers require. Available from Bab-ul-Fatah Pakistan at {price}, this {detail} represents an excellent investment in Prophetic knowledge.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Authentic Hadith literature for study and daily guidance. Shop online with delivery to all cities across Pakistan.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Verified Prophetic traditions in Urdu. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for {price}. Essential Hadith reference for scholars and students alike. Order online now.',
    ],
  },

  // ── Translation (Maani ul Quran) ─────────────────────────────────────────
  translation: {
    opens: [
      'Understanding the Quran in one\'s own language is among the most fundamental needs of every Muslim — the bridge between the ability to recite the sacred text and the ability to comprehend its divine message, internalize its guidance, and apply its teachings to the circumstances of one\'s life. {title} serves that essential function by providing an Urdu translation that balances fidelity to the Arabic original with clarity of expression, enabling readers to engage with the Quranic text meaningfully and systematically.',
      'The translation of the Holy Quran into Urdu carries a special significance for Pakistani Muslims, as it connects them to the final revelation of Allah in the language they understand best while preserving the layered meanings and rhetorical power that make the Quran a literary miracle as well as a spiritual guide. This {detail} — {title} — has been prepared by translators who combine deep scholarship in Arabic linguistics with mastery of Urdu prose, producing a translation that honors both the source text and the target language.',
      'A reliable Quran translation is one of the most frequently consulted books in any Muslim household — referenced during daily recitation, turned to for guidance in moments of decision, studied in congregational settings, and used as a teaching resource for children and new Muslims alike. This {detail} — {title} — has been designed to serve all of these roles effectively, with a presentation style that facilitates both deep study and quick reference, supported by production quality that ensures durability through years of regular use.',
    ],
    mids: [
      'This {detail} presents the complete Quranic text with its Urdu translation in a clear, parallel format that allows readers to move easily between the Arabic original and its meaning. The translation methodology prioritizes accuracy while maintaining readability, avoiding both the over-literalism that can obscure meaning and the excessive paraphrasing that can introduce interpretation. Where multiple valid understandings of a verse exist in the classical tafsir tradition, the translation accommodates those alternative readings through careful word choice and, where necessary, brief explanatory annotations. The physical construction — paper quality, binding durability, and typographic clarity — has been specified to support the intensive use patterns typical of Quranic reference works. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making authentic Quranic understanding accessible to readers throughout Pakistan.',
      'The editorial approach behind this {detail} reflects a commitment to making the Quran accessible to the widest possible audience without compromising the precision and reverence that the sacred text demands. The translation has been reviewed by scholars specializing in Quranic exegesis to ensure that it accurately conveys the meanings established by the classical mufassirun. The layout facilitates comparison between the Arabic text and its Urdu rendering, while the page design minimizes visual distraction and maximizes reading comfort during extended study sessions. Whether used for personal reflection, family study circles, or formal educational settings, this {detail} — {title} — delivers the reliable Quranic understanding that every Muslim household needs. Available at {price} from Bab-ul-Fatah Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Reliable Urdu Quran translation for every Muslim home. Shop online with delivery across all cities in Pakistan.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Authentic Quranic understanding in accessible Urdu prose. Order online with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. A Quran translation you can rely on for study and daily reference. Order today.',
    ],
  },

  // ── Seerah (Prophet Muhammad books) ──────────────────────────────────────
  seerah: {
    opens: [
      'The life of Prophet Muhammad (peace be upon him) represents the most perfect embodiment of divine guidance in human history — a life so comprehensively documented, so richly instructive, and so profoundly transformative that studying it is considered both a religious obligation and an inexhaustible source of personal spiritual development. This {detail} — {title} — invites readers into that study with a presentation that captures both the historical detail and the spiritual depth of the Prophetic experience, offering insights that resonate with Muslims regardless of their existing level of knowledge.',
      'Understanding the Seerah — the life history of Prophet Muhammad (peace be upon him) — is essential for every Muslim who wishes to appreciate the practical application of Islamic teachings in the full complexity of human experience. The Prophet\'s life demonstrates how divine principles are implemented in contexts ranging from personal family relationships to international diplomacy, from economic transactions to military strategy, from private worship to public governance. This {detail} — {title} — explores those multiple dimensions of Prophetic life with scholarly rigor and narrative engagement.',
      'The miracles and merits of Allah\'s Messenger (peace be upon him) constitute a category of evidence that has strengthened the faith of believers across fourteen centuries — supernatural events authenticated by rigorous chains of transmission that demonstrate the truth of his Prophethood and the divine origin of his message. This {detail} — {title} — presents those miracles within their proper historical and theological context, supported by the same standards of Hadith authentication that characterize the most trusted works of Islamic scholarship.',
    ],
    mids: [
      'This {detail} — {title} — draws upon the most authoritative sources of Seerah literature, including the classical works of Ibn Ishaq, Ibn Hisham, Imam Al-Waqidi, and the many Hadith collections that document specific events and sayings from the Prophetic period. The narrative is structured to provide both chronological coherence and thematic depth, allowing readers to follow the Prophet\'s life story from birth to passing while also exploring specific topics — such as his character, his methodology of Da\'wah, his treatment of companions, and his approach to governance — as integrated subjects. The prose style engages the reader\'s imagination while maintaining the factual rigor that Seerah scholarship demands. Where multiple narrations exist for a single event, the work presents the relevant variants with their respective chains of transmission. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Seerah literature accessible to readers nationwide.',
      'The value of this {detail} extends beyond mere historical interest — each chapter contains practical lessons that readers can apply to their own lives, whether in matters of personal conduct, family management, community leadership, or spiritual development. The author\'s commentary contextualizes historical events within the broader framework of Islamic teachings, demonstrating how the Prophet\'s example provides guidance for situations that contemporary Muslims encounter in their daily lives. The production quality — including clear typography, durable binding, and quality paper — ensures that this {detail} — {title} — will serve as a lasting resource in any Islamic library. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Deepen your understanding of Prophet Muhammad (PBUH) with this authoritative Seerah work. Shop online with nationwide delivery.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Inspiring and scholarly Seerah literature for every Muslim reader. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. The life of the Prophet (PBUH) — thoroughly researched and beautifully presented. Order online now.',
    ],
  },

  // ── Education ────────────────────────────────────────────────────────────
  education: {
    opens: [
      'The pursuit of Islamic knowledge is a journey that begins with the simplest questions — Who is my Creator? What does He require of me? How did the Prophet (peace be upon him) practice this religion? — and extends toward understandings of extraordinary depth and subtlety. {title} has been designed as a companion along that journey, providing clear, well-organized, and reliably sourced answers to the questions that Muslims encounter at every stage of their intellectual and spiritual development, from the initial awakening of religious curiosity to the most advanced theological inquiry.',
      'Quality Islamic education must accomplish two simultaneous objectives: it must transmit authentic knowledge from the established sources of Islamic scholarship, and it must do so in a manner that engages the learner\'s intellect, addresses their contemporary questions, and connects abstract principles to lived experience. {title} succeeds in meeting both objectives by combining scholarly accuracy with accessible presentation, offering content that readers can trust presented in a format that contemporary readers can appreciate and apply.',
      'The proliferation of information in the digital age has made it simultaneously easier and harder for Muslims to find reliable Islamic knowledge — easier because texts are more accessible than ever before, harder because the sheer volume of available material makes it difficult to distinguish authenticated scholarship from personal opinion. {title} addresses that challenge by providing carefully vetted, properly sourced content that readers can reference with confidence, knowing that the knowledge it conveys has been verified against the primary texts and authoritative scholarly consensus of the Islamic tradition.',
    ],
    mids: [
      'The content of {title} has been organized to facilitate both structured study and convenient reference, with a logical progression that builds understanding cumulatively while enabling readers to locate specific topics quickly through the index and chapter headings. The writing style balances scholarly precision with reader accessibility, avoiding unnecessary jargon while maintaining the terminological accuracy that Islamic subjects require. Key concepts are defined clearly on first use, important distinctions are highlighted, and the evidentiary basis for each position is identified so that readers can verify the information independently. The physical production — durable binding, clear typography, and quality paper — supports the kind of intensive use that educational texts typically receive. Bab-ul-Fatah Pakistan offers this educational resource at {price}, making quality Islamic education affordable for students, teachers, and families throughout Pakistan.',
      'This {detail} — {title} — has been structured for versatility, serving effectively as a textbook for formal Islamic educational settings, a supplementary resource for madrasa curricula, and a self-study guide for individuals and families pursuing religious education independently. The content scope encompasses the essential subjects of Islamic learning, presented at a level that challenges readers to deepen their understanding while providing sufficient scaffolding to ensure that no reader is left behind. Cross-references between related topics help students appreciate the interconnected nature of Islamic knowledge, while review questions and discussion prompts encourage active engagement with the material. Available at {price} from Bab-ul-Fatah Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Reliable Islamic education for students, teachers, and families. Shop online with delivery across all Pakistani cities.',
      'Buy this educational resource — {title} — from Bab-ul-Fatah Pakistan for {price}. Authentic, well-structured Islamic learning material. Order today with fast nationwide shipping.',
      'Invest in Islamic knowledge by ordering {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}. Browse our education collection and order now.',
    ],
  },

  // ── Darussalam Publishers ────────────────────────────────────────────────
  darussalam: {
    opens: [
      'The Darussalam publishing imprint carries a significance in the Islamic book market that few other brands can match — it signals to knowledgeable readers that the content of every page has been scrutinized by qualified scholars, every scriptural citation has been verified against primary sources, and every theological position reflects the orthodox consensus of the Ummah\'s most trusted authorities. {title} upholds that reputation by delivering content that meets the publisher\'s famously exacting standards of accuracy, clarity, and practical relevance for Muslims seeking reliable knowledge.',
      'In an era when Islamic literature of widely varying quality floods the market through both physical and digital channels, the Darussalam name functions as a reliable indicator of content that readers can trust — a publishing philosophy that treats the accuracy of religious knowledge as a non-negotiable priority rather than a negotiable cost. This Darussalam edition of {title} has undergone the rigorous multi-stage scholarly review process that has earned the publisher the confidence of Islamic institutions, scholars, and educated readers across Pakistan and around the world.',
      'Behind every Darussalam publication stands a collaborative process that few readers ever observe — scholars who authenticate content, editors who refine language, designers who optimize layout, and production specialists who ensure physical durability — all working in concert to produce a final product worthy of the sacred knowledge it conveys. {title} has benefited from every stage of that meticulous process, resulting in a publication that delivers on the Darussalam promise of authenticated, accessible, and beautifully produced Islamic literature.',
    ],
    mids: [
      'This Darussalam edition of {title} reflects the publisher\'s characteristic attention to quality at every level — from the scholarly accuracy of the content to the physical construction of the book itself. The text has been reviewed by specialists in the relevant Islamic discipline, with particular attention to the authentication of Hadith narrations, the accuracy of Quranic citations, and the proper attribution of scholarly opinions. The translation and editing process has refined the prose for maximum clarity while preserving the precision that religious content demands. The physical production features premium paper, clear and consistent typography, a durable binding system, and a cover design that conveys both dignity and accessibility. Bab-ul-Fatah Pakistan offers this Darussalam publication at {price}, providing Pakistani readers with convenient access to one of the Islamic world\'s most trusted publishing imprints.',
      'The practical value of this Darussalam edition of {title} extends across multiple contexts — as a reference for mosque imams preparing sermons, a teaching resource for Islamic school educators, a counseling tool for community leaders, and a personal study companion for any Muslim committed to deepening their understanding of the faith. The organizational structure supports all of these applications, with a clear table of contents, logical chapter arrangement, and helpful cross-references that facilitate both sequential reading and targeted consultation. Available at {price} from Bab-ul-Fatah Pakistan, this {detail} represents outstanding value in authenticated Islamic publishing.',
    ],
    closes: [
      'Order this Darussalam edition of {title} from Bab-ul-Fatah Pakistan for {price}. Scholarly verified Islamic content you can trust. Shop online with delivery across all Pakistani cities.',
      'Buy {title} — a trusted Darussalam publication — from Bab-ul-Fatah Pakistan for {price}. Every title undergoes rigorous scholarly review. Order online with fast nationwide shipping.',
      'Purchase this authoritative Darussalam work from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Browse our complete Darussalam catalog and order now with nationwide delivery.',
    ],
  },

  // ── Prayer / Dua / Azkar ────────────────────────────────────────────────
  prayer: {
    opens: [
      'The daily prayers (Salah) constitute the central pillar of Islamic practice — the act of worship that most directly connects the believer to their Creator and structures the rhythm of each day around five moments of divine communion. {title} supports that essential practice by providing clear, detailed, and comprehensively sourced guidance on every aspect of prayer, from the proper performance of obligatory prayers to the recommended supplications and acts of devotion that surround them, enabling Muslims to fulfill this fundamental obligation with knowledge, confidence, and spiritual presence.',
      'The Sunnah of Prophet Muhammad (peace be upon him) encompasses every dimension of a Muslim\'s daily existence — from the moment of waking to the moment of sleeping, and every activity in between — providing a comprehensive framework for living that transforms ordinary moments into opportunities for worship and spiritual growth. {title} documents more than a thousand of these daily Sunnah practices, making it possible for readers to systematically incorporate Prophetic guidance into their daily routines and thereby draw closer to Allah through consistent, conscious emulation of the Messenger\'s example.',
      'The act of making du\'a — calling upon Allah with sincerity, humility, and hope — represents one of the most intimate and spiritually potent forms of worship available to the believer, a direct channel of communication with the Creator that remains open at all times and in all circumstances. {title} preserves the authentic Prophetic supplications that the Messenger of Allah (peace be upon him) taught his Companions, providing readers with a treasury of prayers that address every conceivable human situation — from moments of joy to times of difficulty, from the most public occasions to the most private struggles.',
    ],
    mids: [
      'The content of {title} has been organized with practical usability as the primary consideration, arranging the material in a manner that allows readers to find specific guidance quickly and easily. Each du\'a or Sunnah practice is presented with its full Arabic text, Urdu translation, and complete source reference, enabling readers to verify authenticity and understand meaning simultaneously. The pronunciation guide ensures that readers can recite the Arabic text correctly, while the explanatory notes provide context for supplications whose significance might not be immediately apparent from a literal reading alone. Where relevant, the work identifies the specific occasions on which each du\'a is recommended and the proper etiquette of its recitation. The physical production quality — compact format where applicable, durable binding, and clear typography — makes this a practical companion for daily use. Bab-ul-Fatah Pakistan offers this {detail} at {price}.',
      'This {detail} — {title} — fills an important gap in the personal libraries of many Muslims who wish to practice their daily worship with greater knowledge and precision but who may not have access to the comprehensive scholarly sources from which these supplications and practices are derived. By collecting and organizing this material in a single, well-indexed volume, the work saves readers the effort of consulting multiple reference texts and enables them to quickly locate the specific du\'a, dhikr, or Sunnah practice relevant to their current situation. Whether kept on the bedside table for morning and evening adhkar, carried during travel for prayer-time reference, or studied systematically for comprehensive knowledge, this {detail} serves as an indispensable spiritual companion. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Comprehensive prayer and dua guidance for daily worship. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Authentic Sunnah practices and Prophetic supplications in Urdu. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Enrich your daily worship with this essential du\'a and azkar guide. Order online now.',
    ],
  },

  // ── Fiqh ─────────────────────────────────────────────────────────────────
  fiqh: {
    opens: [
      'Islamic jurisprudence (fiqh) provides the practical framework through which Muslims translate their faith into observable action — the detailed rulings that govern worship, financial transactions, family relationships, dietary regulations, and every other dimension of life that falls within the scope of religious obligation. {title} addresses this critical area of Islamic knowledge by presenting well-organized, evidence-based rulings that draw upon the Quran, the authenticated Sunnah, and the established scholarly methodology of Islamic legal reasoning.',
      'The need for accessible, reliable fiqh guidance has never been greater than it is today, as Muslims navigate an increasingly complex world of financial instruments, technological innovations, and evolving social structures that raise questions unanticipated by the classical jurists. {title} bridges the gap between classical fiqh scholarship and contemporary practical needs, presenting rulings grounded in established legal principles while addressing the specific questions that arise from living as Muslims in the modern era, with particular attention to the economic dimensions of Islamic practice.',
      'The Shariah — Islam\'s comprehensive legal and ethical system — addresses every aspect of human activity through a sophisticated framework of obligations, prohibitions, and recommendations that together constitute divine guidance for individual and communal life. {title} serves as a practical guide to navigating that framework, presenting rulings with their supporting evidence in a format that enables readers to understand not only what the Shariah requires but the reasoning that underlies each ruling.',
    ],
    mids: [
      'This {detail} — {title} — has been structured as both a systematic study text and a practical reference guide, organized topically so that readers can explore a specific area of Islamic practice — such as commercial transactions, family law, or the Islamic calendar — as a coherent whole. Each ruling is presented with its evidentiary basis, typically including the relevant Quranic verse or Hadith narration alongside its source reference. Where recognized scholars differ on a particular ruling, the work presents the major positions with their supporting evidence, allowing readers to appreciate the scholarly reasoning while being guided toward the strongest position. The prose style is direct and unambiguous, avoiding the obscure terminology that can make fiqh texts inaccessible to non-specialists. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making reliable Shariah guidance accessible to Muslims throughout the country.',
      'The methodological approach of this {detail} reflects a commitment to the classical principles of Islamic legal reasoning — the primacy of the Quran and authentic Sunnah, the respect for scholarly consensus, and the careful application of juristic analogy — while remaining responsive to the practical circumstances that shape the questions ordinary Muslims face. The author traces each ruling through its chain of evidence to the primary texts, demonstrating how the conclusion was derived and on what basis it rests. This transparency enables readers to evaluate the strength of each ruling independently and to develop the analytical skills needed to approach new questions with confidence. Available from Bab-ul-Fatah Pakistan at {price}, this {detail} represents an essential fiqh reference.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Clear, evidence-based Islamic legal guidance for daily life. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Reliable fiqh reference with sourced rulings. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Practical Shariah guidance backed by Quran and Sunnah. Order online now.',
    ],
  },

  // ── Children ─────────────────────────────────────────────────────────────
  children: {
    opens: [
      'Instilling Islamic values in children during their formative years is one of the most consequential responsibilities that Muslim parents carry — a responsibility that shapes not only the child\'s personal development but the moral and spiritual trajectory of the entire community for generations to come. {title} has been crafted with that responsibility in mind, presenting Islamic knowledge and values through engaging narratives, attractive illustrations, and age-appropriate language that capture children\'s imagination while conveying essential lessons about faith, character, and the prophetic example.',
      'The stories of the Prophets and the righteous predecessors represent a treasure trove of moral and spiritual instruction that speaks directly to children\'s innate love of narrative — transforming abstract religious concepts into vivid, memorable tales that children absorb naturally and recall effortlessly throughout their lives. This {detail} — {title} — draws upon that treasure trove to create reading experiences that entertain, educate, and inspire young Muslim readers, building their knowledge of Islamic history while cultivating the character traits — honesty, courage, patience, kindness, and gratitude — that define a exemplary Muslim life.',
      'Islamic children\'s literature occupies a vital position in the intellectual and spiritual formation of the next generation — supplementing the religious instruction that children receive at home and in the mosque with reading material that reinforces Islamic values through the powerful medium of story. {title} contributes to that vital project by offering content that parents can confidently place in their children\'s hands, knowing that every page has been prepared with the care, accuracy, and sensitivity that material intended for young readers demands.',
    ],
    mids: [
      'The content of {title} has been carefully calibrated to the developmental stage of its target audience, using vocabulary and sentence structures that challenge young readers appropriately without overwhelming them. The narratives feature relatable characters, engaging plotlines, and clear moral lessons that emerge naturally from the story rather than being imposed upon it. Where the content relates to Islamic history or the lives of the Prophets, the facts have been verified against authentic sources to ensure historical accuracy alongside narrative appeal. The illustrations complement the text by providing visual context that aids comprehension and maintains interest. The physical production — durable binding, child-friendly page size, and quality paper — ensures that this {detail} withstands the enthusiastic use typical of children\'s books. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic children\'s literature affordable for families throughout Pakistan.',
      'This {detail} — {title} — serves multiple educational purposes simultaneously: it builds reading fluency in Urdu, introduces children to essential Islamic knowledge, develops moral reasoning through story-based examples, and creates positive associations with Islamic learning that encourage children to explore their faith further as they grow. Parents will appreciate the discussion prompts and key takeaways that accompany each section, providing natural conversation starters for family discussions about Islamic values and practice. The series format — where applicable — encourages children to build a complete Islamic library over time, developing both their knowledge and their love of reading. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Engaging Islamic stories and values for young Muslim readers. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Beautifully crafted Islamic children\'s literature. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Nurture faith and character in your children through inspiring stories. Order online now.',
    ],
  },

  // ── Women ────────────────────────────────────────────────────────────────
  women: {
    opens: [
      'Islamic teachings regarding women\'s rights, responsibilities, and spiritual status have been the subject of considerable discussion and, at times, misunderstanding — making reliable, scholarly resources on this topic essential for Muslim women who wish to understand their faith\'s authentic position on matters that directly affect their daily lives. {title} addresses that need by presenting well-sourced, balanced guidance on the issues that matter most to Muslim women, grounded in the primary texts of Islam and the established scholarly tradition.',
      'The pursuit of Islamic knowledge is an obligation upon every Muslim — male and female alike — and the history of Islam is replete with examples of learned women who made extraordinary contributions to the religious, intellectual, and social life of the Muslim community. {title} honors that tradition by providing content specifically tailored to the questions, concerns, and circumstances of Muslim women, enabling them to practice their faith with confidence, knowledge, and a deep understanding of their rights and responsibilities within the Islamic framework.',
      'A strong, healthy marital relationship built upon Islamic principles is one of the greatest blessings that Allah can bestow upon a couple — a source of emotional support, spiritual growth, and social stability that enriches every dimension of both partners\' lives. {title} offers practical, Islamically-grounded guidance for building and maintaining that kind of relationship, drawing upon the Quran, the authenticated Sunnah, and the accumulated wisdom of Islamic scholarship to address the real-world challenges that couples face in contemporary Pakistani society.',
    ],
    mids: [
      'The content of {title} has been prepared by scholars who understand both the Islamic legal framework and the practical realities of women\'s lives in Pakistani society. Each topic is addressed with the thoroughness and sensitivity it deserves, presenting the relevant textual evidence from the Quran and authentic Hadith alongside the scholarly interpretations that have shaped Islamic practice across centuries. Where contemporary questions arise that were not explicitly addressed by the classical texts, the work applies established principles of Islamic legal reasoning to derive guidance that is both faithful to the tradition and responsive to present circumstances. The {detail} includes practical advice, real-life examples, and actionable recommendations that readers can implement immediately in their personal and family lives. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing Muslim women with accessible, reliable guidance on the issues that matter most to them.',
      'This {detail} — {title} — has been designed to serve as both a personal reference and a teaching resource, suitable for individual study, group discussion in women\'s circles, and family counseling contexts. The language is accessible without sacrificing precision, ensuring that readers without formal training in Islamic sciences can understand and apply the guidance it provides. The organizational structure allows readers to locate specific topics of interest quickly, while the overall narrative flow encourages sequential reading for those who prefer a comprehensive overview. Available from Bab-ul-Fatah Pakistan at {price}, this {detail} represents an essential addition to every Muslim household\'s library.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Trusted Islamic guidance for women and family life. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Reliable, scholarly content for Muslim women. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Essential reading for every Muslim woman seeking authentic knowledge. Order online now.',
    ],
  },

  // ── Family / Parents ─────────────────────────────────────────────────────
  family: {
    opens: [
      'The family unit occupies the central position in Islam\'s social architecture — the primary institution through which values are transmitted, character is formed, and the next generation of Muslims is prepared to carry forward the trust of faith. {title} addresses the family dimension of Islamic life with practical guidance grounded in the Quran, the authenticated Sunnah, and the established scholarly consensus, helping Muslim families build relationships that are both pleasing to Allah and conducive to the emotional and spiritual well-being of every family member.',
      'The honor and rights of parents in Islam are among the most emphatically stressed obligations in the entire Shariah — ranking immediately after the worship of Allah in the Quranic enumeration of duties, and accompanied by stern warnings against even the slightest expression of disrespect or impatience toward those who gave us life and nurtured us through our most vulnerable years. {title} explores this profound obligation with both depth and practical relevance, helping readers understand not only what Islam requires in the parent-child relationship but why those requirements exist and how to fulfill them in the context of contemporary family dynamics.',
    ],
    mids: [
      'This {detail} — {title} — provides comprehensive guidance on the family-related matters that affect Muslim households daily, from the rights and responsibilities of husbands and wives to the proper upbringing of children and the care of elderly parents. Each topic is addressed with reference to the relevant Quranic verses and authenticated Hadith narrations, supplemented by the scholarly commentary that clarifies the practical application of these textual directives in real-world situations. The work acknowledges the challenges that modern families face — economic pressures, generational gaps, cultural conflicts, and the influence of social media — and offers Islamically-grounded strategies for overcoming them. The writing style is warm and accessible while maintaining the scholarly rigor that the subject demands. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making essential family guidance available to every Muslim household.',
      'The practical value of this {detail} extends beyond individual reading to encompass family discussion, marital counseling, and community education contexts. The clear organization enables readers to locate specific topics quickly, while the comprehensive index facilitates reference during moments when particular guidance is needed. Whether addressing the foundational principles of a successful Islamic marriage or the specific challenges of managing intergenerational relationships, this {detail} — {title} — delivers actionable guidance that readers can implement immediately to strengthen their family bonds and draw closer to Allah through fulfilling their family obligations. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Essential Islamic guidance for building strong, faithful families. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Practical family wisdom grounded in Quran and Sunnah. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Strengthen your family bonds with authentic Islamic guidance. Order online now.',
    ],
  },

  // ── Companions ───────────────────────────────────────────────────────────
  companions: {
    opens: [
      'The Companions of Prophet Muhammad (peace be upon him) — the Sahaba — represent the finest generation of Muslims in the entire history of the Ummah, men and women whose faith was forged in the crucible of revelation, whose character was shaped by the direct companionship of the Prophet, and whose sacrifices established the foundations upon which Islamic civilization was built. {title} brings the inspiring stories of these remarkable individuals to life, documenting the battles, the sacrifices, and the spiritual achievements that defined the early Muslim community.',
      'The military campaigns of the early Islamic period — from the Battle of Badr to the conquests that followed — were not merely historical events but divinely guided turning points that established the conditions under which Islam could flourish and spread as a complete way of life. This {detail} — {title} — chronicles these pivotal moments with scholarly accuracy and narrative vividness, drawing upon the authenticated historical sources to present the strategies, the challenges, and the extraordinary courage that characterized the Sahaba\'s military endeavors.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from the most reliable historical sources, including the classical works of Seerah, Maghazi, and Islamic history that document the events of the early Muslim period with the highest standards of scholarly verification. Each narrative has been checked against multiple source accounts, with variant details noted where they occur and the most authenticated version presented as the primary account. The storytelling approach balances historical rigor with narrative engagement, making these accounts accessible to general readers while maintaining the factual integrity that serious students of Islamic history require. The lessons embedded in these stories — about courage, faith, strategic thinking, brotherhood, and complete reliance upon Allah — are explicitly highlighted, connecting historical events to contemporary applications. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making the inspiring history of the Sahaba accessible to readers across Pakistan.',
      'The value of studying the lives and campaigns of the Companions extends far beyond historical curiosity — it provides Muslims with tangible models of how faith translates into action under the most challenging circumstances imaginable. This {detail} — {title} — enables readers to draw those practical lessons by presenting each historical event with its relevant context, the decisions that were made, the reasoning behind those decisions, and the outcomes that Allah granted as a result. The language is clear and engaging, making complex military and political situations understandable to readers without specialized background knowledge. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Inspiring stories from Islamic history and the lives of the Companions. Shop online with nationwide delivery.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Authenticated accounts of the Sahaba\'s courage and faith. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Draw inspiration from the golden generation of Islam. Order online now.',
    ],
  },

  // ── Biography ────────────────────────────────────────────────────────────
  biography: {
    opens: [
      'The biographies of Islamic scholars and historical figures offer readers a unique window into the practical application of Islamic teachings across diverse circumstances, cultures, and historical periods — demonstrating how faith shapes character, how knowledge transforms communities, and how individual lives can become instruments of collective benefit when guided by sincerity and divine purpose. {title} presents such a biography with the scholarly precision and narrative engagement that its subject deserves, documenting a life that offers lessons and inspiration for contemporary Muslims.',
      'Personal memoirs and biographical accounts from the Islamic tradition serve a purpose that transcends mere historical documentation — they provide living proof that the principles of Islam can be fully realized in human experience, that the spiritual ideals taught by the Quran and the Prophet are not aspirational abstractions but achievable realities for those who commit themselves to the path with sincerity and perseverance. This {detail} — {title} — offers readers precisely that kind of proof, chronicling a life whose trajectory demonstrates the transformative power of authentic Islamic faith.',
      'The lives of great Muslim men and women throughout history provide a continuous chain of inspiration that connects each generation of believers to the Prophetic example through the intermediate link of those who lived Islam fully in their own time and context. {title} adds a valuable link to that chain by documenting the life, contributions, and character of a significant figure in Islamic history, preserving their legacy for the benefit of current and future generations of Muslim readers.',
    ],
    mids: [
      'This {detail} — {title} — has been researched using the most reliable available sources, with careful attention to historical accuracy, proper attribution of quotations and anecdotes, and balanced presentation that acknowledges the human complexity of its subject while celebrating their achievements and contributions to Islamic civilization. The narrative structure follows a broadly chronological approach while organizing key themes — intellectual development, major contributions, personal character, and lasting impact — into clearly delineated sections that facilitate both sequential reading and targeted reference. The writing style engages the reader\'s interest through vivid description and meaningful anecdote while maintaining the scholarly standards that biographical works require. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic biographical literature accessible to readers nationwide.',
      'The practical lessons embedded in this {detail} — {title} — extend across multiple dimensions of human experience: the pursuit of knowledge, the management of adversity, the balance between worldly responsibilities and spiritual aspirations, the relationship between individual effort and divine blessing, and the various ways in which a single life can contribute to the collective welfare of the Muslim community. Each chapter concludes with reflections that help readers connect the biographical material to their own circumstances and challenges, transforming historical narrative into personal inspiration. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Inspiring Islamic biography for every reader\'s library. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Well-researched life stories of Islamic scholars and heroes. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Draw inspiration from the lives of Islam\'s great figures. Order online now.',
    ],
  },

  // ── Scholars ─────────────────────────────────────────────────────────────
  scholars: {
    opens: [
      'The scholars of Islam — the Ulama — have served as the guardians of religious knowledge throughout Islamic history, devoting their lives to the preservation, interpretation, and transmission of the faith\'s intellectual heritage across generations and civilizations. {title} pays tribute to that scholarly tradition by documenting the life and contributions of a scholar whose work has left a lasting impact on Muslim understanding, providing readers with both an inspiring personal narrative and an appreciation for the intellectual rigor that characterizes authentic Islamic scholarship.',
      'The legacy of great Islamic scholars extends far beyond the books they wrote or the institutions they founded — it lives in the minds and hearts of every Muslim who benefits from their intellectual labor, whether directly through reading their works or indirectly through the educational methodologies and legal rulings that they established. This {detail} — {title} — ensures that legacy is properly understood and appreciated by contemporary readers, documenting both the scholarly achievements and the personal qualities that made its subject a model of Islamic intellectual excellence.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from reliable biographical and academic sources, presenting a comprehensive portrait of its subject that covers their educational journey, scholarly methodology, major works and contributions, interactions with contemporaries, and lasting influence on the Islamic intellectual tradition. The narrative is enriched with specific anecdotes and quotations that bring the scholar\'s personality and teaching style to life, making this biography not merely informative but genuinely engaging. The author has taken care to contextualize the scholar\'s work within the broader currents of Islamic intellectual history, helping readers understand how their contributions relate to the larger tradition of Islamic scholarship. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making important scholarly biographies accessible to readers across Pakistan.',
      'The significance of this {detail} lies in its ability to connect contemporary readers with the intellectual heritage of Islamic scholarship, demonstrating that the rigorous, evidence-based approach to religious knowledge that characterized the great scholars of the past remains relevant and necessary in the present age. By studying the lives and methods of scholars like the one profiled in {title}, readers gain not only factual knowledge about Islamic history but also practical models for their own pursuit of religious learning — models of intellectual honesty, methodological rigor, and sincere dedication to the truth. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Essential scholarly biography for students of Islamic knowledge. Shop online with delivery across Pakistan.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Learn from the lives of Islam\'s great scholars. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. An inspiring account of Islamic scholarly excellence. Order online now.',
    ],
  },

  // ── Aqeedah / Faith ──────────────────────────────────────────────────────
  aqeedah: {
    opens: [
      'Correct belief (aqeedah) forms the foundation upon which every other aspect of Islamic practice rests — the conceptual framework that defines a Muslim\'s relationship with Allah, determines the validity of their worship, and shapes their understanding of existence itself. Errors or uncertainties in aqeedah can undermine the spiritual value of even the most diligent practice, making the study of correct belief not merely an academic exercise but a matter of the utmost personal religious importance. {title} addresses this critical area of Islamic knowledge with the thoroughness and precision that its subject demands.',
      'The questions that aqeedah addresses — Who is Allah? What are His attributes? What is the nature of prophethood? What happens after death? What is the meaning of divine predestination? — represent the most fundamental inquiries that any human being can pose, inquiries whose answers define one\'s entire worldview and spiritual orientation. {title} provides those answers as they have been understood and articulated by the mainstream Sunni scholarly tradition, drawing upon the Quran, the authenticated Hadith, and the consensus of the early generations of Muslims to present a coherent, evidence-based framework of Islamic belief.',
    ],
    mids: [
      'This {detail} — {title} — presents the articles of Islamic faith in a systematic, well-organized manner that builds understanding progressively from the most fundamental concepts to more nuanced theological discussions. Each point of belief is supported with evidence from the primary texts — the Quran and the authenticated Sunnah — and is contextualized within the broader framework of Islamic theology as understood by the Ahl al-Sunnah wal-Jama\'ah. The writing style is clear and accessible, avoiding unnecessary theological jargon while maintaining the conceptual precision that aqeedah requires. Where contemporary misconceptions or deviant beliefs need to be addressed, the work does so with scholarly firmness and intellectual respect, presenting the correct position alongside clear refutation of errors. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making essential aqeedah education accessible to readers across Pakistan.',
      'The practical importance of this {detail} — {title} — cannot be overstated in the contemporary context, where Muslims are exposed to a bewildering variety of theological claims through social media, informal study circles, and unscholarly publications. By grounding readers in the authenticated beliefs of the mainstream Islamic tradition, this {detail} provides an intellectual anchor that protects against confusion and deviation, while also cultivating the kind of deep, reflective faith that sustains a Muslim through life\'s challenges and trials. The comprehensive index and clear chapter organization facilitate both systematic study and quick topic reference. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Essential reading on Islamic creed and correct belief. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Clear, evidence-based aqeedah education for every Muslim. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Strengthen your faith with authentic Islamic theology. Order online now.',
    ],
  },

  // ── Hajj / Umrah ─────────────────────────────────────────────────────────
  hajj: {
    opens: [
      'The pilgrimage to Makkah — Hajj — represents the culmination of a Muslim\'s spiritual journey, the fifth pillar of Islam that brings together believers from every nation, language, and social background in a shared act of worship that transcends all human boundaries and divisions. {title} provides the comprehensive, practical guidance that pilgrims need to perform this sacred obligation correctly, covering every step of the Hajj and Umrah rituals with detailed instructions, relevant supplications, and helpful illustrations that clarify each stage of the pilgrimage process.',
      'Performing Hajj and Umrah correctly requires more than physical presence at the sacred sites — it demands knowledge of the specific rituals, their proper sequence, the conditions that validate or invalidate each act, and the supplications recommended by the Prophet (peace be upon him) at each stage of the journey. This {detail} — {title} — provides that essential knowledge in a concise, well-organized format designed to serve as a practical companion throughout the pilgrimage experience, from the moment of intention to the completion of the rites.',
    ],
    mids: [
      'This {detail} — {title} — has been organized to serve as a step-by-step guide through the complete Hajj and Umrah experience. Each ritual is explained with its legal basis, the proper method of performance, common mistakes to avoid, and the relevant du\'as to recite. The content includes guidance on pre-departure preparations, Ihram regulations, Tawaf procedures, Sa\'i between Safa and Marwah, the standing at Arafat, the stoning of the Jamaraat, and the farewell Tawaf. Maps and diagrams clarify the spatial layout of the holy sites, while the supplementary materials address frequently asked questions and special circumstances that pilgrims may encounter. The compact format makes this {detail} easy to carry during the actual pilgrimage. Bab-ul-Fatah Pakistan offers this {detail} at {price}, ensuring that every pilgrim can depart for the holy sites equipped with the knowledge they need.',
      'The masnoon (Sunnah-based) approach taken in this {detail} — {title} — gives pilgrims confidence that every ritual they perform aligns with the authentic practice of Prophet Muhammad (peace be upon him) as documented in the reliable Hadith sources. The instructions are precise enough for scholars and accessible enough for ordinary pilgrims performing Hajj for the first time. Whether used for advance study at home, during travel to the holy sites, or as a quick reference during the actual performance of the rites, this {detail} — {title} — provides the reliable guidance that every pilgrim needs. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Complete Hajj and Umrah guide for pilgrims. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Step-by-step Masnoon Hajj and Umrah instructions. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Your essential pilgrimage companion. Order online now.',
    ],
  },

  // ── Products (non-book items) ────────────────────────────────────────────
  products: {
    opens: [
      'Islamic lifestyle products serve a practical purpose while simultaneously expressing the user\'s identity as a Muslim — transforming everyday items into opportunities for remembrance, worship, and the visible affirmation of faith in daily life. {title} exemplifies this dual functionality by combining practical utility with Islamic significance, offering a product that enhances its owner\'s daily routine while connecting them to the broader Muslim community through shared symbols and practices.',
      'Quality Islamic products represent an important category of demand among Pakistani Muslims who wish to integrate their faith more fully into every aspect of their daily lives — from the items they carry and display to the products they use in worship and remembrance of Allah. {title} addresses that demand with a product that meets high standards of both functionality and aesthetic quality, providing excellent value for customers who seek to express their Muslim identity through thoughtfully designed, well-manufactured merchandise.',
    ],
    mids: [
      'This {detail} — {title} — has been manufactured to meet the quality expectations of discerning customers, using materials and production processes that ensure durability, visual appeal, and consistent performance through regular use. The design reflects an understanding of both the practical requirements of the product category and the aesthetic preferences of Pakistani Muslim consumers. Whether used personally or given as a gift on occasions such as Eid, Ramadan, weddings, or housewarmings, this {detail} delivers a satisfying combination of Islamic significance and everyday practicality. The packaging has been designed to protect the product during shipping while presenting it attractively upon arrival. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic products accessible to customers throughout the country.',
      'The attention to detail in this {detail} — {title} — reflects Bab-ul-Fatah\'s commitment to providing products that meet the expectations of quality-conscious Muslim consumers. Every aspect of the product — from material selection to finish quality to packaging — has been specified to deliver a positive ownership experience. Customer satisfaction is supported by the reliability of the product itself and the convenience of ordering through Bab-ul-Fatah\'s online platform with delivery to all major Pakistani cities. Available at {price}, this {detail} offers exceptional value within its product category.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Quality Islamic products for daily life and gifting. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Practical, well-made Islamic merchandise. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Express your Muslim identity with quality products. Order online now.',
    ],
  },

  // ── Mushaf / Quran ───────────────────────────────────────────────────────
  mushaf: {
    opens: [
      'The Mushaf — the written compilation of the Holy Quran — represents the most sacred physical object in the Islamic tradition, the tangible medium through which Allah\'s final revelation has been preserved with absolute accuracy from the time of its revelation to the present day. {title} continues that tradition of preservation with a production quality that honors the dignity of the sacred text, combining premium materials with meticulous craftsmanship to create a Mushaf that serves as both a devotional object and a lasting family heirloom.',
      'A high-quality Mushaf is one of the most cherished possessions in any Muslim household — the primary vehicle for daily recitation, the focus of congregational prayer, the reference for Quranic study, and the connection to divine guidance that sustains a believer through every circumstance of life. This {detail} — {title} — has been designed to fulfill all of these roles with excellence, featuring a script, layout, and physical construction that support the intensive use patterns typical of a well-loved Mushaf.',
    ],
    mids: [
      'This {detail} — {title} — features a hard cover binding that provides exceptional protection and durability, ensuring that the sacred text remains safe through years of regular use. The script has been chosen for its clarity and readability, with proper observance of the rules of Quranic orthography that distinguish one edition from another in terms of scholarly reliability. The page layout balances line spacing, margin width, and text positioning to minimize eye strain during extended recitation sessions, while the paper quality supports comfortable page-turning without excessive weight. The overall dimensions have been optimized for handling comfort during both seated reading and standing prayer. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making premium Mushaf editions accessible to households across Pakistan.',
      'The production standards applied to this {detail} reflect a deep respect for the sacred nature of the Quranic text. Every page has been checked for accuracy against authoritative references, ensuring that the text conforms to the recitation standard of Hafs from Asim that is most widely used across the Muslim world. The printing quality delivers crisp, consistent characters that are easy to read under various lighting conditions, while the binding system prevents pages from loosening even after extensive use. Whether used for personal daily recitation, Hifz memorization practice, or as a gift for a special occasion, this {detail} — {title} — represents an outstanding choice. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Premium quality Mushaf with durable hard cover binding. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. A Quran edition built to last for generations. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Honor the Quran with a beautifully crafted Mushaf. Order online now.',
    ],
  },

  // ── Reference ────────────────────────────────────────────────────────────
  reference: {
    opens: [
      'Islamic reference works occupy a vital position in the intellectual infrastructure of Muslim communities, providing the authoritative information that scholars, students, educators, and curious readers need to verify facts, explore topics systematically, and deepen their understanding of the faith\'s rich intellectual tradition. {title} serves that reference function by presenting carefully researched, well-organized content on its subject that readers can consult with confidence, knowing that the information has been verified against reliable primary and secondary sources.',
      'The ability to distinguish between authentic religious knowledge and unfounded claims is a skill that every Muslim needs in today\'s information-rich environment — a skill that requires access to reliable reference works prepared by qualified scholars who apply rigorous standards of verification to every claim they present. {title} contributes to that need by providing accurate, well-sourced information that readers can trust, helping to counter the misinformation that circulates through informal channels and unverified social media content.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled with scholarly meticulousness, drawing upon the most authoritative available sources and presenting information with proper attribution, contextual explanation, and appropriate qualification where certainty is not achievable. The organizational structure supports both systematic study and quick reference, with clear chapter headings, a comprehensive index, and cross-references that connect related topics across different sections of the work. The prose style prioritizes clarity and accuracy, avoiding the kind of sensationalism or speculation that can compromise the reliability of reference material. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic reference material accessible to readers across Pakistan.',
      'The practical utility of this {detail} — {title} — extends across multiple contexts — as a personal reference for curious readers, a teaching resource for Islamic educators, a fact-checking tool for content creators, and a starting point for more detailed scholarly investigation. The content has been selected and organized to address the questions that arise most frequently among Pakistani Muslim readers, while the scholarly apparatus — source citations, bibliographic references, and explanatory notes — supports those who wish to pursue any topic in greater depth. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Reliable Islamic reference for scholars and curious readers alike. Shop online with nationwide delivery.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Well-researched, verified Islamic content. Order today with fast shipping across Pakistan.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. An essential addition to your Islamic reference library. Order online now.',
    ],
  },

  // ── Tafseer ──────────────────────────────────────────────────────────────
  tafseer: {
    opens: [
      'Tafseer — the science of Quranic interpretation — represents one of Islam\'s most sophisticated intellectual traditions, a discipline that combines linguistic analysis, historical contextualization, legal reasoning, and spiritual insight to unlock the meanings of the divine text for each generation of Muslims. {title} contributes to that noble tradition by providing a clear, well-organized, and authoritatively sourced commentary that helps readers move beyond surface-level understanding to engage with the Quran\'s profound and layered meanings.',
      'Understanding the Quran at a deeper level than mere recitation requires access to the interpretive tradition that has accumulated over fourteen centuries of continuous scholarly effort — a tradition that explains the circumstances of revelation, clarifies ambiguous passages, connects related verses across different Surahs, and applies the Quranic message to the practical questions that Muslims face in every era. {title} makes that interpretive tradition accessible to readers who seek to deepen their engagement with the Book of Allah.',
    ],
    mids: [
      'This {detail} — {title} — employs a methodical approach to Quranic interpretation that respects the established principles of tafseer methodology: interpreting the Quran through the Quran itself, through the authenticated Hadith, through the understanding of the Companions, and through the reasoned analysis of qualified scholars. Each passage is explained with attention to its linguistic features, historical context, legal implications, and spiritual lessons, providing readers with a multi-dimensional understanding that enriches both their intellectual knowledge and their personal relationship with the divine text. The Urdu translation of the commentary makes this {detail} accessible to the broad Pakistani readership. Bab-ul-Fatah Pakistan offers this {detail} at {price}.',
      'The organizational structure of this {detail} — {title} — follows the traditional Surah-by-Surah arrangement, with introductory notes for each Surah that provide essential context including the period of revelation, central themes, and key lessons. The commentary addresses each passage or verse group with an explanation that is thorough without being excessive, scholarly without being inaccessible, and spiritually enriching without sacrificing analytical precision. Whether used for systematic study or consulted for specific passages, this {detail} provides the reliable guidance that serious Quranic engagement requires. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Authoritative Quranic commentary for deeper understanding. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Methodical tafseer with authentic scholarly sources. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Essential tafseer for every serious student of the Quran. Order online now.',
    ],
  },

  // ── History ──────────────────────────────────────────────────────────────
  history: {
    opens: [
      'Islamic history encompasses a civilization of extraordinary breadth, diversity, and achievement — spanning fourteen centuries, three continents, and virtually every field of human endeavor from theology and law to science, medicine, architecture, and literature. {title} opens a window into that rich historical tapestry, documenting the events, personalities, and movements that shaped the Muslim world and, through its intellectual and cultural contributions, the entire course of human civilization.',
      'The study of Islamic history serves purposes far beyond the accumulation of interesting facts — it provides Muslims with a sense of identity rooted in a civilizational narrative, offers practical lessons from the successes and failures of previous generations, and demonstrates the remarkable adaptability of Islamic teachings to diverse cultural and historical contexts. {title} makes that history accessible through a presentation that is both scholarly and engaging.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from the most reliable historical sources available, with careful attention to the verification of dates, the authentication of quoted material, and the balanced presentation of events that may be described differently in various historical accounts. The narrative style brings historical figures and events to life through vivid description and meaningful anecdote, while the scholarly apparatus — source citations, chronological tables, and a comprehensive index — supports readers who wish to pursue specific topics in greater depth. The physical production quality ensures that this reference will serve its owner reliably through years of consultation. Bab-ul-Fatah Pakistan offers this {detail} at {price}.',
      'The chronological organization of this {detail} — {title} — enables readers to follow the flow of Islamic history as a continuous narrative while the thematic sub-sections allow focused exploration of specific topics such as political developments, scientific achievements, cultural exchanges, and the contributions of individual Muslim civilizations. Maps, where applicable, provide geographical context that enhances understanding of historical events. Available from Bab-ul-Fatah Pakistan at {price}, this {detail} represents an excellent investment in historical knowledge.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Engaging Islamic history for readers of all backgrounds. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} from Bab-ul-Fatah Pakistan for {price}. Well-researched Islamic history with reliable sources. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Discover the rich heritage of Islamic civilization. Order online now.',
    ],
  },

  // ── General (fallback) ───────────────────────────────────────────────────
  general: {
    opens: [
      'Islamic literature in Urdu occupies a position of extraordinary importance in the religious and intellectual life of Pakistani Muslims, serving as the primary medium through which the majority of the population accesses the foundational texts, scholarly discussions, and practical guidance that shape their understanding and practice of Islam. {title} contributes to that rich literary tradition by providing content that is both intellectually substantive and accessible to the general reader, addressing its subject with the care and thoroughness that Islamic knowledge deserves.',
      'The market for Islamic books in Pakistan continues to grow as Muslims of every age and educational background seek reliable resources that help them understand their faith more deeply, practice it more correctly, and share it more effectively with their families and communities. {title} has been prepared to meet that growing demand with a publication that balances scholarly authority with reader accessibility, offering content that can be trusted and a presentation style that can be appreciated by readers across a broad spectrum of knowledge and experience.',
    ],
    mids: [
      'This {detail} — {title} — has been produced to the standards that readers of Islamic literature have come to expect from quality Pakistani publications: well-organized content, clear and accurate writing, reliable sourcing, and physical construction that supports the kind of regular use that reference works typically receive. The topic has been addressed comprehensively, with attention to both the theoretical foundations and the practical applications that make Islamic knowledge immediately relevant to the reader\'s daily life. The production quality — durable binding, clear typography, and quality paper — ensures that this title will serve as a lasting addition to any Islamic library. Bab-ul-Fatah Pakistan offers this {detail} at {price}.',
      'The value of this {detail} — {title} — lies in its ability to make its subject accessible to readers who may have limited background knowledge while still providing the depth and accuracy that more advanced students require. The writing style is direct and engaging, the organizational structure facilitates both sequential reading and quick reference, and the overall presentation reflects a genuine respect for both the subject matter and the reader\'s intelligence. Whether used for personal study, family reading, or as a teaching resource in community settings, this {detail} delivers reliable content in an appealing format. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Quality Islamic literature for every reader. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} from Bab-ul-Fatah Pakistan for {price}. Reliable, well-presented Islamic content. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. A valuable addition to your Islamic library. Order online now.',
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
    `Buy ${title} at Bab-ul-Fatah Pakistan for ${price}. Quality Islamic ${cat} content. Order online with fast delivery across all cities in Pakistan.`,
    `Order ${title} from Bab-ul-Fatah Pakistan for ${price}. Trusted Islamic ${cat} book with authentic content. Shop now with nationwide delivery.`,
    `${title} available at Bab-ul-Fatah Pakistan for ${price}. Browse our Islamic bookstore and order with reliable shipping across Pakistan.`,
    `Shop ${title} online at Bab-ul-Fatah Pakistan for ${price}. Authentic ${cat} publication. Secure ordering with fast delivery to all Pakistani cities.`,
    `Get ${title} from Bab-ul-Fatah — Pakistan's leading Islamic bookstore — for ${price}. Order today with nationwide shipping and secure packaging.`,
    `Purchase ${title} for ${price} at Bab-ul-Fatah Pakistan. Reliable Islamic ${cat} content. Order online for fast, secure delivery anywhere in Pakistan.`,
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
  console.log('║   Bab-ul-Fatah — SEO Batch 7 Description Writer             ║');
  console.log('║   Products 601–700 (skip 600, take 100, orderBy createdAt)  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ── Step 1: Fetch products ──────────────────────────────────────────────
    console.log('[1/5] Fetching products (skip 600, take 100) …');
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      skip: 600,
      take: 100,
      select: { id: true, title: true, slug: true, price: true, category: { select: { name: true } } },
    });

    // Enrich with categoryName for detectCat
    const enriched = products.map(p => ({
      ...p,
      categoryName: (p.category && p.category.name) || '',
    }));

    // Save to batch7-products.json
    const productsPath = path.join(__dirname, 'batch7-products.json');
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
    const metaPath = path.join(__dirname, 'seo-meta-batch7.json');
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

    progress.batches['7'] = {
      status: 'completed',
      startIdx: 601,
      endIdx: 700,
      updatedAt: new Date().toISOString(),
      productsUpdated: enriched.length,
      metaFile: 'scripts/seo-meta-batch7.json',
    };
    progress.completedBatches = 7;
    progress.completedProducts = 800;

    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  completedBatches: ${progress.completedBatches}`);
    console.log(`  completedProducts: ${progress.completedProducts}\n`);

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Batch 7 complete!');
    console.log(`  Products processed: ${enriched.length}`);
    console.log(`  DB records updated: ${updated}`);
    console.log(`  Meta file: ${metaPath}`);
    console.log(`  Progress: ${progress.completedBatches}/${progress.totalBatches} batches (${progress.completedProducts}/${progress.totalProducts} products)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Batch 7 failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
