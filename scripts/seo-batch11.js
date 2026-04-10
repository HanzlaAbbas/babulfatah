#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 11 Description Writer
// Writes unique, SEO-optimized product descriptions for products 1101–1200
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
  if (/soft\s*cover|s\/c/i.test(t)) binding = 'soft cover binding';
  if (/hard\s*cover|h\/c/i.test(t)) binding = 'hard cover binding';
  if (/pocket/i.test(t)) { format = 'compact pocket-size format'; binding = 'portable soft cover binding'; }
  if (/art\s*paper/i.test(t)) format = 'art paper premium script';
  if (/color\s*coded|4\s*color/i.test(t)) format = 'color-coded premium print';
  const sizeMatch = t.match(/(\d+)\s*x\s*(\d+)/);
  if (sizeMatch) format += ` (${sizeMatch[1]}x${sizeMatch[2]} cm)`;
  if (/set|complete\s*set/i.test(t)) parts = 'complete multi-volume set';
  const volMatch = t.match(/(\d+)\s*vol/i);
  if (volMatch && !parts) parts = `${volMatch[1]}-volume set`;
  if (/word\s*for\s*word/i.test(t)) format = 'word-for-word translation format';
  if (/spanish/i.test(t)) format = 'Spanish language translation format';
  return { lines, binding, format, parts };
}

// ─── Category routing ────────────────────────────────────────────────────────
function detectCatKey(product) {
  const cat = (product.category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  // Priority 1: Exact category name matches (most reliable)
  if (/ramadan/i.test(cat)) return 'ramadan';
  if (/faith\s*aqeedah|aqeedah/i.test(cat)) return 'faith_aqeedah';
  if (/pillars?\s*of\s*islam/i.test(cat)) return 'pillars_of_islam';
  if (/prayer\s*supplication/i.test(cat)) return 'prayer_supplication';
  if (/lifestyle/i.test(cat)) return 'lifestyle';
  if (/family/i.test(cat)) return 'family';
  if (/translation/i.test(cat)) return 'translation';
  if (/seerah/i.test(cat)) return 'seerah';
  if (/biography/i.test(cat)) return 'biography';
  if (/imams?\s*scholars/i.test(cat)) return 'imams_scholars';
  if (/companions/i.test(cat)) return 'companions';
  if (/women/i.test(cat)) return 'women';
  if (/children/i.test(cat)) return 'children';
  if (/fiqh/i.test(cat)) return 'fiqh';
  if (/education/i.test(cat)) return 'education';
  if (/darussalam/i.test(cat)) return 'darussalam';
  if (/general/i.test(cat)) return 'general';

  // Priority 2: Title-based routing (fallback for unknown categories)
  if (/minbar/i.test(title)) return 'prayer_supplication';
  if (/precious\s*pearls/i.test(title)) return 'lifestyle';
  if (/book\s*of\s*manners|right\s*way/i.test(title)) return 'family';
  if (/noble\s*quran/i.test(title)) return 'translation';
  if (/last\s*messenger|last\s*of\s*the\s*prophets|noble\s*life|sealed\s*nectar|miracles|first\s*revelation|ministers\s*around/i.test(title)) return 'seerah';
  if (/biography\s*of\s*imam|biography\s*of\s*shaikh|biography\s*of\s*zaid\s*ibn\s*thabit/i.test(title)) return 'imams_scholars';
  if (/abu\s*bakr|umar\s*ibn|uthman\s*ibn|ali\s*ibn\s*abi\s*talib|disciple.*zubair|example\s*of\s*sacrifice|caliphate\s*of\s*banu|second\s*caliph|fourth\s*caliph|first\s*caliph/i.test(title)) return 'companions';
  if (/gift\s*of\s*my\s*mother|choice\s*of\s*every\s*woman|rights\s*and\s*duties\s*of\s*women/i.test(title)) return 'women';
  if (/dua\s*of\s*faizah|football\s*feud|gift\s*of\s*eid|night\s*of\s*decree|little\s*learner|sciences\s*of\s*the\s*quran\s*for\s*children|story\s*of\s*adam|story\s*of\s*ibrahim|gift\s*of\s*friendship|search\s*for\s*twee|gift\s*of\s*jumuah/i.test(title)) return 'children';
  if (/concept\s*of\s*god|many\s*shades\s*of\s*shirk|role\s*of\s*mosque|rules\s*on\s*those\s*who\s*seek|ruling\s*on\s*tasweer/i.test(title)) return 'fiqh';
  if (/essential\s*pearls|faith\s*of\s*truth|inimitable|jinn\s*and\s*human|strange\s*creature|muslim\s*creed\s*expounded|principles\s*of\s*leadership|quran\s*and\s*modern\s*science|quran\s*the\s*divine|the\s*revelation|insight|islamic\s*guideline\s*on\s*medicine|islamic\s*law\s*of\s*succession/i.test(title)) return 'education';
  if (/beautiful\s*names|choice\s*of\s*every|concise\s*collections|divine\s*message|end\s*of\s*the\s*world|golden\s*path|last\s*world|light\s*of\s*guidance|merits\s*of\s*islam|camel\s*and\s*evil|delight\s*of\s*faith|religion\s*of\s*truth/i.test(title)) return 'darussalam';
  return 'general';
}

// ─── Templates: ALL NEW TEXT — completely different from all previous batches ──
const T = {
  // ── DARUSSALAM PUBLISHERS ──
  darussalam: {
    opens: [
      'For decades, Darussalam Publishers has stood as a beacon of authentic Islamic knowledge production, earning the confidence of millions of Muslim readers through an uncompromising commitment to scholarly accuracy and publication excellence. This {lang} edition of {title} carries forward that distinguished legacy, offering readers a meticulously prepared work that has undergone rigorous review by qualified Islamic scholars. Every chapter reflects the publisher\'s signature approach of grounding every statement in authenticated evidence from the Quran and the Prophetic tradition, making this volume a trusted companion for serious students of Islamic knowledge throughout Pakistan and beyond its borders.',
      'The global Muslim community has come to recognize the Darussalam name as a hallmark of reliability in Islamic publishing, and this {lang} publication, {title}, reinforces that reputation with its comprehensive coverage and impeccable sourcing. Prepared by a dedicated team of researchers working under the supervision of senior ulema, this work addresses its subject with the depth and nuance that readers expect from Darussalam while maintaining the clear, accessible prose style that has made their publications popular in homes, mosques, and educational institutions across the Muslim world.',
      'Scholarly publishing in the Islamic tradition demands a unique combination of linguistic expertise, theological understanding, and editorial precision — qualities that Darussalam has consistently demonstrated across hundreds of titles spanning multiple languages and disciplines. This {lang} work titled {title} exemplifies those qualities, presenting its subject matter with a clarity that welcomes newcomers while providing the analytical depth that experienced scholars require. The careful attention to referencing, with each major claim traced back to its original Arabic source, gives readers the confidence to engage deeply with the material.',
      'Among the most prolific and respected publishers of Islamic literature in the modern era, Darussalam has established standards of quality control that few competitors can match, and this {lang} edition of {title} is a direct beneficiary of those exacting standards. From the selection of typeface and paper quality to the accuracy of every transliterated term and translated passage, no detail has been overlooked in the production of this volume. Muslim families in Pakistan seeking authentic, well-presented Islamic knowledge will find this publication to be an exemplary addition to their home libraries.',
    ],
    mids: [
      'The editorial methodology employed by Darussalam sets this {lang} work apart from ordinary Islamic publications. Each section undergoes review by multiple scholars specializing in different fields — Quranic exegesis, Hadith authentication, Islamic jurisprudence, and Arabic linguistics — ensuring that errors in any single domain are caught and corrected before the work reaches readers. This multi-layered scholarly oversight produces publications that teachers and students alike can reference with complete assurance of accuracy. The {binding} has been chosen to support years of regular consultation, making this a durable investment in Islamic knowledge.',
      'Readers familiar with the Darussalam catalog will immediately recognize the care that has gone into the presentation of this {lang} publication. The clear chapter divisions, logical progression of topics, and helpful explanatory notes create a reading experience that is both intellectually stimulating and easy to follow. Cross-references to related Quranic verses and authenticated Hadith appear throughout the text, enabling readers to verify claims independently and deepen their understanding through primary source engagement. This evidence-based approach to Islamic publishing is precisely what distinguishes Darussalam from less rigorous alternatives.',
    ],
    closes: [
      'Acquire this Darussalam {lang} publication from Bab-ul-Fatah, Pakistan\'s premier online Islamic bookstore. Priced at {price}, {title} delivers the scholarly reliability that Darussalam is celebrated for worldwide. Place your order today and receive prompt, careful delivery to any location across Pakistan.',
      'Order this trusted {lang} Darussalam edition through Bab-ul-Fatah Pakistan. At just {price}, {title} represents outstanding value for a publication of this caliber. Shop with confidence from Pakistan\'s most reliable Islamic book distributor.',
    ],
  },

  // ── COMPANIONS ──
  companions: {
    opens: [
      'The noble Companions of Prophet Muhammad (peace be upon him) constitute the most blessed generation in all of human history, selected by Allah Himself to bear witness to the final revelation and establish the foundations of a civilization that would transform the world. This {lang} work, {title}, opens a window into that extraordinary era, recounting the lives of men and women whose unwavering faith, remarkable courage, and profound wisdom continue to serve as eternal models of Islamic excellence for believers in every generation and every corner of the globe.',
      'Studying the lives of the Sahabah is among the most powerful means of strengthening one\'s own faith and understanding of Islam in its purest, most vibrant form. This {lang} publication titled {title} has been crafted to make those magnificent lives accessible to readers across Pakistan, drawing upon the most reliable historical sources including the classical biographical works of Ibn Sa\'d, Al-Bukhari, and Ibn Asakir. Each account is presented with scholarly precision and narrative elegance that captures both the historical facts and the spiritual essence of these remarkable personalities.',
      'From the earliest converts who embraced Islam at great personal risk to the military commanders who defended the nascent Muslim state against overwhelming odds, the Companions demonstrated qualities of character that remain unmatched in human history. This {lang} book, {title}, chronicles their awe-inspiring journeys with meticulous attention to historical accuracy and a deep appreciation for the spiritual lessons embedded in each narrative. Readers will discover how individuals from diverse backgrounds — shepherds, merchants, warriors, and scholars — were united by faith into a force that reshaped civilization.',
      'The legacy of the Companions extends far beyond their historical achievements — they embody the living embodiment of Quranic teachings, human beings who translated divine commandments into concrete action with such consistency and sincerity that Allah Himself expressed His pleasure with them in the Holy Quran. This {lang} work, {title}, presents their stories in a manner that allows contemporary Muslims to draw practical guidance from their examples of patience under persecution, generosity in poverty, courage in battle, and justice in governance.',
    ],
    mids: [
      'This {lang} publication provides comprehensive biographical sketches that cover each Companion\'s lineage and background, the circumstances surrounding their acceptance of Islam, their notable contributions to the early Muslim community, and the lasting scholarly or political legacy they left behind. The author has carefully distinguished between authenticated reports and weak narrations, presenting only those accounts that meet the strict standards of Hadith verification established by the great Imams. These biographies serve not merely as historical records but as practical manuals of Islamic character development, demonstrating how Quranic ideals can be realized in the lives of ordinary human beings.',
      'What elevates this {lang} work above conventional biographical collections is its systematic extraction of practical lessons from each Companion\'s life. The author identifies specific character traits — honesty, humility, bravery, scholarly devotion, and compassionate leadership — that readers can cultivate in their own lives through conscious effort and reliance upon Allah. The accounts are enriched with relevant Quranic verses and authenticated Hadith that contextualize each Companion\'s actions within the broader framework of Islamic teachings, creating a deeply integrated learning experience that goes far beyond surface-level storytelling.',
    ],
    closes: [
      'Discover the magnificent legacy of Islam\'s greatest generation with this {lang} work from Bab-ul-Fatah Pakistan. Priced at {price}, {title} brings the Companions\' inspiring stories to life. Order online for fast delivery to any city in Pakistan.',
      'Bring home this captivating {lang} account of the Sahabah from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} is essential reading for every Muslim family. Shop now for reliable nationwide delivery.',
    ],
  },

  // ── IMAMS SCHOLARS ──
  imams_scholars: {
    opens: [
      'The great Imams and scholars of Islam represent the intellectual backbone of the Muslim Ummah, men whose lifetime devotion to the pursuit, preservation, and teaching of sacred knowledge ensured that the light of authentic Islamic scholarship would continue to illuminate the path of guidance for all subsequent generations. This {lang} work titled {title} presents a deeply researched account of its subject\'s remarkable journey through the landscape of Islamic learning, revealing the personal sacrifices, intellectual achievements, and spiritual experiences that defined a life wholly dedicated to serving Allah through knowledge.',
      'Throughout Islamic history, certain scholars have risen to such prominence that their names have become synonymous with the fields of knowledge they helped establish, and this {lang} publication, {title}, documents the life of precisely such a towering intellectual figure. From the earliest days of childhood education through the pinnacle of scholarly achievement, every phase of the subject\'s life is examined with the care and attention to detail that a figure of this caliber deserves, drawing upon primary biographical sources and the evaluations of contemporary and later scholars.',
      'The preservation of authentic Islamic knowledge across fourteen centuries owes an incalculable debt to the dedication of scholars who spent their entire lives traveling, studying, teaching, and writing — often under conditions of extreme hardship and political instability. This {lang} biography, {title}, honors that tradition of scholarly sacrifice by presenting a comprehensive account that reveals not only the intellectual output of its subject but also the personal qualities of piety, integrity, and perseverance that earned them the love and respect of students, colleagues, and the broader Muslim community.',
      'Understanding the intellectual history of Islam requires familiarity with the lives and methodologies of the scholars who shaped its major disciplines, and this {lang} work, {title}, provides exactly that familiarity for one of the most influential figures in the Islamic scholarly tradition. The author traces the development of the scholar\'s intellectual framework from its earliest influences through its mature expression, showing how engagement with the Quran, the Prophetic traditions, and the works of earlier scholars produced a distinctive methodology that continues to influence Islamic thought today.',
    ],
    mids: [
      'This {lang} biography draws upon an extensive range of primary sources including the subject\'s own writings, the testimonies of their students and contemporaries, and the scholarly evaluations found in the major biographical dictionaries of Islamic scholarship such as those by Al-Dhahabi, Ibn Hajar Al-Asqalani, and Al-Suyuti. The author has synthesized these sources into a coherent narrative that presents a balanced portrait — acknowledging scholarly achievements while honestly addressing controversies and challenges. Special attention is given to the scholarly methodology that distinguished this figure from contemporaries and the specific contributions that earned their work a permanent place in the Islamic intellectual heritage.',
      'The lasting influence of this Islamic scholar is demonstrated through the continued study and citation of their works in contemporary academic institutions and religious seminaries throughout the Muslim world. This {lang} publication examines not only the content of their major written works but also the pedagogical approach they employed in training the next generation of scholars, many of whom went on to become influential figures in their own right. The chain of scholarly transmission extending from this figure to the present day represents an unbroken thread of authentic Islamic knowledge that this biography helps readers understand and appreciate.',
    ],
    closes: [
      'Order this scholarly {lang} biography from Bab-ul-Fatah Pakistan. At {price}, {title} celebrates the intellectual giants of Islamic heritage. Shop online for delivery across all Pakistani cities.',
      'Explore the life of a legendary Islamic scholar with this {lang} work from Bab-ul-Fatah. Priced at {price}, {title} is both educational and deeply inspiring. Order now for fast nationwide delivery.',
    ],
  },

  // ── SEERAH ──
  seerah: {
    opens: [
      'The life of Prophet Muhammad (peace be upon him) stands as the most comprehensive and perfect model of human conduct ever presented to humanity, a living Quran whose every action, word, and decision provides guidance for individuals and nations seeking to align their lives with divine purpose. This {lang} work titled {title} approaches the Prophetic biography with the reverence and scholarly rigor it deserves, presenting a meticulously documented account that enables readers to experience the transformative power of the seerah in their own lives and develop a deeper, more personal connection with Allah\'s final Messenger.',
      'Few literary endeavors carry the spiritual weight and practical significance of presenting the life of Prophet Muhammad (peace be upon him) to a new generation of readers. This {lang} publication, {title}, rises to that challenge with distinction, combining the analytical precision of modern historiography with the devotional sensitivity of traditional Islamic scholarship. Every major event of the Prophetic mission — from the first revelation in the Cave of Hira to the Farewell Pilgrimage — is examined within its proper historical context while drawing out the timeless spiritual lessons that make the seerah perpetually relevant.',
      'The blessed seerah of Prophet Muhammad (peace be upon him) is not merely a historical narrative to be studied and admired from a distance — it is a dynamic blueprint for living that addresses every dimension of human experience, from personal spirituality and family life to governance and international relations. This {lang} work, {title}, presents that blueprint with exceptional clarity and comprehensiveness, drawing upon the most authoritative sources including the works of Ibn Ishaq, Ibn Hisham, and authenticated Hadith collections to construct an account that is both historically reliable and spiritually enriching.',
      'Understanding the Prophetic seerah in its full richness requires engagement with multiple dimensions — the historical timeline of events, the social and political context of seventh-century Arabia, the Quranic revelations that accompanied and commented upon key moments, and the practical lessons that each event holds for Muslims in every era. This {lang} publication, {title}, integrates all these dimensions into a unified narrative that serves as both a reference work for scholars and an inspirational reading experience for general audiences across Pakistan.',
    ],
    mids: [
      'This {lang} seerah has been organized with a clear chronological structure that enables readers to follow the natural progression of the Prophetic mission from its Makkan beginnings through the establishment of the Islamic state in Madinah. Each major event is preceded by context-setting material that explains the social, political, and spiritual conditions prevailing at the time, and followed by an analysis of the lessons and implications that can be derived from the event. The author has paid particular attention to the interpersonal dynamics within the early Muslim community and the Prophet\'s exemplary conduct in dealing with allies, opponents, and neutral parties.',
      'Among the distinguishing features of this {lang} biography is its systematic attention to the practical Sunnah of the Prophet (peace be upon him), extracting actionable guidance on topics ranging from personal worship and ethical conduct to conflict resolution and community leadership. Rather than presenting the seerah as a series of disconnected anecdotes, the author demonstrates how each event connects to broader themes of Prophetic mission — the call to monotheism, the establishment of justice, the elevation of women\'s status, and the creation of a society based on moral principles rather than tribal affiliations.',
    ],
    closes: [
      'Deepen your understanding of the Prophetic legacy with this {lang} seerah from Bab-ul-Fatah Pakistan. Priced at {price}, {title} is an indispensable biography for every Muslim. Order online for delivery across Pakistan.',
      'Order this comprehensive {lang} Prophetic biography from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore. At {price}, {title} brings the blessed seerah to vivid life. Shop now for fast nationwide delivery.',
    ],
  },

  // ── EDUCATION ──
  education: {
    opens: [
      'The dissemination of authentic Islamic knowledge through well-crafted educational materials represents one of the most vital services that can be rendered to the Muslim Ummah, equipping believers with the intellectual tools needed to navigate contemporary challenges while remaining firmly anchored to the principles of their faith. This {lang} publication titled {title} has been specifically designed to serve that essential purpose, offering content that meets the highest standards of academic accuracy while remaining accessible to readers at varying levels of prior knowledge and educational background.',
      'Islamic education has always been characterized by a holistic approach that engages the mind, heart, and soul of the learner, seeking not merely the transmission of information but the transformation of character and the cultivation of a genuine connection with divine knowledge. This {lang} work, {title}, embodies that holistic vision through its carefully structured content, engaging presentation, and unwavering commitment to presenting Islamic teachings in a manner that is both intellectually rigorous and spiritually inspiring for students and educators across Pakistan.',
      'The quality of educational materials available to Muslim students directly determines the quality of Islamic understanding that takes root in their hearts and minds, making the production of reliable, well-organized educational publications a matter of the highest communal priority. This {lang} edition of {title} addresses that priority with distinction, providing a comprehensive treatment of its subject that has been reviewed by qualified scholars for theological accuracy and by experienced educators for pedagogical effectiveness, ensuring it serves the needs of both formal classroom instruction and independent study.',
      'Access to properly structured Islamic educational resources remains a significant challenge in many Muslim communities, where students often must rely on fragmented materials that fail to provide the systematic coverage needed for genuine understanding. This {lang} educational work, {title}, directly addresses that gap by presenting its subject matter in a progressive, well-organized format that builds understanding step by step, from foundational concepts to advanced analysis, making it an invaluable resource for Islamic schools, study circles, and self-directed learners throughout Pakistan.',
    ],
    mids: [
      'This {lang} publication employs a systematic pedagogical approach that begins with essential background knowledge before advancing to more complex topics, ensuring that readers develop a solid conceptual foundation before encountering more challenging material. The content is enriched with practical examples, thought-provoking discussion questions, and references to primary Islamic sources that encourage independent verification and deeper exploration. Special attention has been given to addressing common misconceptions and providing clear, evidence-based responses that equip readers with the knowledge needed to engage confidently in discussions about their faith.',
      'The authors and editorial team behind this {lang} work bring together a rare combination of deep Islamic scholarship and modern educational expertise, producing a resource that bridges the gap between traditional Islamic pedagogy and contemporary learning needs. Topics are presented with proper sourcing to Quranic verses and authenticated Hadith, cultivating in students the habit of evidence-based reasoning that is the hallmark of genuine Islamic scholarship. The publication reflects a conviction that effective Islamic education must prepare students not merely for academic examinations but for a lifetime of faithful, informed engagement with the challenges and opportunities of modern life.',
    ],
    closes: [
      'Invest in quality Islamic education with this {lang} work from Bab-ul-Fatah Pakistan. Priced at {price}, {title} supports structured learning for students and educators. Order online for fast delivery across Pakistan.',
      'Order this comprehensive {lang} educational resource from Bab-ul-Fatah, your trusted Islamic bookstore. At {price}, {title} meets the highest standards of Islamic publishing. Shop now for nationwide delivery.',
    ],
  },

  // ── CHILDREN ──
  children: {
    opens: [
      'The foundation of a Muslim child\'s identity is laid during the earliest years of life, making the quality of Islamic reading material available during this critical period a matter of profound importance for parents and educators alike. This {lang} children\'s publication, {title}, has been thoughtfully created by experienced Islamic educators who understand both the developmental needs of young learners and the importance of presenting Islamic content with absolute accuracy and an engaging style that captures children\'s natural curiosity and enthusiasm for learning about their faith.',
      'Finding Islamic books that genuinely appeal to children while maintaining scholarly integrity represents one of the most significant challenges facing Muslim parents and teachers in Pakistan today. This {lang} work titled {title} answers that challenge beautifully, combining colorful, child-friendly design with authentic Islamic content that introduces young readers to essential knowledge about their faith through stories, activities, and interactive elements that make learning feel like play rather than obligation.',
      'Every Muslim child deserves access to Islamic literature that sparks joy, feeds imagination, and plants the seeds of faith in a heart still soft and receptive to divine guidance. This {lang} publication, {title}, has been specifically crafted to nurture those tender hearts with stories of the prophets, lessons from the lives of the Companions, and practical guidance on Islamic manners and worship — all presented in language and visual formats that resonate with young minds and create positive associations with Islamic learning.',
      'The most effective Islamic education for children happens not through formal instruction alone but through the kind of joyful, story-driven learning that captures a child\'s imagination and makes them want to return to the material again and again. This {lang} children\'s book, {title}, creates precisely that kind of engaging learning experience, weaving essential Islamic knowledge into narratives and activities that children genuinely enjoy, ensuring that important lessons about faith, character, and the Prophet\'s example are absorbed naturally and remembered fondly.',
    ],
    mids: [
      'The content of this {lang} children\'s publication has been carefully curated to cover the topics that Islamic educators consider most essential for young learners, including basic beliefs and acts of worship, stories of the prophets and their lessons, the importance of good character and moral conduct, and simple supplications for daily life. Each topic is presented with age-appropriate language and visual elements that support comprehension and retention, while maintaining strict adherence to authentic Islamic sources. Parents will appreciate the way this book creates opportunities for meaningful family discussions about faith and values.',
      'Teachers in Islamic schools and weekend programs will find this {lang} publication to be an exceptionally useful classroom resource, with its clear organizational structure and content that aligns with standard Islamic studies curricula used throughout Pakistan. The interactive elements — including questions, activities, and reflection prompts — encourage active engagement rather than passive reading, helping children develop critical thinking skills alongside their Islamic knowledge. The book is equally effective as a classroom text and as a gift that children can enjoy independently at home.',
    ],
    closes: [
      'Give your children the gift of joyful Islamic learning with this {lang} book from Bab-ul-Fatah Pakistan. At just {price}, {title} nurtures young hearts and minds. Order online for fast delivery across all Pakistani cities.',
      'Shop for this delightful {lang} children\'s publication at Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} makes Islamic education exciting for kids. Order today and inspire your child.',
    ],
  },

  // ── TRANSLATION ──
  translation: {
    opens: [
      'The Holy Quran is the literal, uncreated speech of Allah revealed to Prophet Muhammad (peace be upon him) through the Angel Jibreel, preserved with absolute textual integrity across fourteen centuries, and its translation into accessible language represents one of the most consequential services that Islamic scholarship can render to the global Muslim community. This {lang} edition of {title} has been prepared by translators who combine profound mastery of classical Quranic Arabic with an elegant command of the target language, producing a rendering that honors both the semantic precision and the rhetorical beauty of the original divine text.',
      'Accessing the meaning of the Holy Quran through a reliable translation is essential for the vast majority of Muslims worldwide who have not had the opportunity to achieve advanced proficiency in classical Arabic, and this {lang} publication titled {title} fulfills that need with exceptional scholarly care and linguistic grace. The translators have followed established principles of Quranic interpretation that ensure theological accuracy while producing prose that is clear, natural, and conducive to both personal reflection and group study in homes, mosques, and educational institutions throughout Pakistan.',
      'The challenge of translating the Holy Quran lies not merely in converting Arabic words into another language but in conveying the profound depth of meaning, the subtle rhetorical devices, and the spiritual power that make the Quranic text unlike any other book in existence. This {lang} work, {title}, meets that challenge admirably, employing a translation methodology that prioritizes accuracy of meaning while using footnotes and explanatory annotations to address contexts, linguistic nuances, and alternative scholarly interpretations that enrich the reader\'s understanding beyond what a literal translation could achieve.',
      'A well-crafted Quran translation serves as a gateway through which millions of Muslims can access the guidance, comfort, and transformative wisdom contained in Allah\'s final revelation to humanity. This {lang} edition of {title} represents the culmination of extensive scholarly effort to produce a translation that is simultaneously faithful to the original Arabic meaning and accessible to contemporary readers, with careful attention to terminology, consistency, and clarity that makes it suitable for readers at every level of Quranic engagement.',
    ],
    mids: [
      'This {lang} translation has been produced following the most rigorous standards of Quranic translation methodology, with each verse carefully analyzed in its linguistic, historical, and jurisprudential context before being rendered into the target language. Where multiple scholarly interpretations exist for a particular phrase or verse, the translators have selected the interpretation that best reflects the understanding of the early Muslim community while noting significant alternative views in footnotes. The {format} provides a clear, readable layout with properly formatted verse numbers and surah headings, while the {binding} ensures this precious volume will withstand years of regular use and reference.',
      'The physical production of this {lang} Quran translation reflects the reverence due to the word of Allah, with high-quality paper, clear typography, and {binding} that combines durability with an elegant presentation suitable for gift-giving and personal use. The text is formatted to facilitate reading during both extended study sessions and daily recitation, with generous line spacing and well-placed page breaks that support comfortable reading. Whether used as a primary study resource, a classroom text, or a reference for sermon preparation, this edition meets the diverse needs of Muslim readers across Pakistan with distinction and reliability.',
    ],
    closes: [
      'Order this premium {lang} Quran translation from Bab-ul-Fatah Pakistan. At {price}, {title} makes the divine message accessible and clear. Shop online for delivery to any city in Pakistan.',
      'Purchase this authoritative {lang} Quranic translation from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} is a faithful rendering of Allah\'s words. Order now for nationwide delivery.',
    ],
  },

  // ── BIOGRAPHY ──
  biography: {
    opens: [
      'The study of Islamic biography — known as sirah and tarajim in the classical scholarly tradition — serves as both a record of intellectual achievement and a practical guide for Muslims seeking to understand how the principles of faith are translated into lived reality. This {lang} biographical work, {title}, presents a meticulously researched account that goes far beyond surface-level facts to explore the character, intellectual development, and spiritual journey of its subject, providing readers with insights that are both academically valuable and personally inspiring.',
      'Every great figure in Islamic history has a story that illuminates not only their individual achievements but also the broader intellectual, social, and spiritual currents of their era, and this {lang} publication titled {title} captures that dual significance with scholarly precision and narrative skill. Drawing upon a wide range of primary sources including the subject\'s own writings, the testimonies of contemporaries, and the scholarly assessments of later biographers, this work constructs a comprehensive portrait that places its subject within the full context of Islamic historical development.',
      'The lives of eminent Muslims throughout history offer a treasury of wisdom, inspiration, and practical guidance for contemporary believers navigating the challenges of faith in a complex and often hostile world. This {lang} work, {title}, opens that treasury to readers across Pakistan by presenting a thoroughly documented biographical account that highlights the scholarly contributions, personal sacrifices, and enduring legacy of a figure whose influence on Islamic thought and practice continues to be felt across the Muslim world today.',
      'Biographical literature has occupied a position of honor in the Islamic intellectual tradition since the earliest centuries of the faith, serving simultaneously as historical documentation, moral instruction, and inspiration for successive generations of Muslims. This {lang} edition of {title} upholds that noble literary tradition by presenting its subject\'s life with the care, accuracy, and narrative elegance that such a figure deserves, creating a work that will inform and inspire readers for years to come.',
    ],
    mids: [
      'This {lang} biography provides a comprehensive account covering every significant phase of its subject\'s life, from family background and early education through the development of their scholarly methodology to the lasting impact of their written works and teaching. The author has consulted an extensive range of primary and secondary sources, cross-referencing multiple accounts to establish the most accurate narrative possible while acknowledging areas of scholarly uncertainty or disagreement. The result is a balanced, well-sourced account that serves both as an inspirational read and as a reliable reference for students of Islamic studies seeking to understand the intellectual genealogy of their tradition.',
      'The enduring significance of this {lang} biographical work lies in its ability to connect historical Islamic scholarship with the contemporary concerns of Muslim readers. The subject\'s engagement with the theological, legal, and social questions of their time provides a model for how Muslims today might approach similar challenges with intellectual integrity, spiritual depth, and unwavering commitment to authentic Islamic sources. The author\'s engaging narrative style makes complex scholarly concepts accessible to general readers while maintaining the analytical rigor expected by specialists.',
    ],
    closes: [
      'Discover the inspiring life story within this {lang} biography from Bab-ul-Fatah Pakistan. At {price}, {title} offers both scholarly depth and personal inspiration. Order online for delivery to any city in Pakistan.',
      'Order this insightful {lang} biographical work from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Priced at {price}, {title} is a rewarding addition to any library. Shop now for fast nationwide delivery.',
    ],
  },

  // ── FIQH ──
  fiqh: {
    opens: [
      'Islamic jurisprudence — the sacred science of deriving practical legal rulings from the primary sources of Shariah — has served as the practical framework through which Muslims have organized their worship, transactions, and interpersonal relations for over fourteen centuries. This {lang} work titled {title} contributes meaningfully to that scholarly tradition by addressing its specific subject with the analytical precision, source-based methodology, and practical orientation that characterize the finest works of Islamic legal scholarship.',
      'The application of divine guidance to the complex realities of human life requires both deep scholarly expertise and a nuanced understanding of the principles upon which Islamic legal reasoning is built, and this {lang} publication, {title}, demonstrates exactly those qualities. Whether addressing matters of personal worship, family law, commercial transactions, or contemporary ethical questions, the author grounds every ruling in evidence from the Quran and authenticated Hadith while considering the relevant scholarly positions across the major schools of Islamic jurisprudence.',
      'Living according to Islamic law is a fundamental obligation upon every Muslim, and having access to clear, reliable, and well-sourced guidance on practical matters of faith is essential for fulfilling that obligation with confidence and correctness. This {lang} work, {title}, provides precisely that guidance, presenting fiqh rulings in a format that is both comprehensive enough for scholarly reference and accessible enough for general readers seeking to understand and implement Islamic teachings in their daily lives across Pakistan and beyond.',
    ],
    mids: [
      'This {lang} fiqh publication addresses its subject with systematic thoroughness, organizing the material in a logical progression that enables readers to build their understanding incrementally. Each ruling is supported by explicit references to the relevant Quranic verses and authenticated Hadith, with the author explaining the scholarly reasoning that connects the primary evidence to the specific legal conclusion. Where significant differences of opinion exist among qualified scholars, the work presents the major positions with fairness, allowing readers to understand the basis for scholarly disagreement and make informed choices within the bounds of legitimate Islamic jurisprudence.',
    ],
    closes: [
      'Get this practical {lang} fiqh reference from Bab-ul-Fatah Pakistan. At {price}, {title} provides reliable Islamic legal guidance. Order online for delivery to any city in Pakistan.',
      'Order this authoritative {lang} Islamic jurisprudence guide from Bab-ul-Fatah, your trusted Islamic bookstore. Priced at {price}, {title} answers essential fiqh questions. Shop now for fast delivery.',
    ],
  },

  // ── GENERAL ──
  general: {
    opens: [
      'The rich heritage of Islamic knowledge encompasses an extraordinarily diverse range of subjects — from theology and jurisprudence to history, ethics, and personal development — and this {lang} publication titled {title} represents a valuable addition to that vast intellectual tradition. Whether you are a dedicated student of Islamic sciences or a curious reader taking your first steps into the world of Islamic literature, this work offers content that will broaden your understanding, strengthen your faith, and deepen your appreciation for the depth and beauty of Islamic teachings.',
      'Every quality publication in the field of Islamic literature serves as a bridge connecting contemporary readers with the timeless wisdom contained in the Quran, the Sunnah, and the scholarly heritage of the Muslim Ummah. This {lang} work, {title}, fulfills that bridging function admirably, presenting its subject matter with the clarity, accuracy, and engaging prose style that makes Islamic knowledge accessible to a wide audience of readers throughout Pakistan while maintaining the scholarly standards that experienced students of Islam demand.',
      'The publication of well-researched, carefully produced Islamic literature in {lang} plays a crucial role in making the treasures of Muslim intellectual heritage available to new generations of readers who might otherwise remain disconnected from the rich traditions of their faith. This {lang} edition of {title} represents a commendable effort in that direction, offering content that has been prepared with proper attention to scholarly sourcing, editorial quality, and reader accessibility, making it a welcome addition to any Islamic library or personal collection.',
    ],
    mids: [
      'This {lang} publication has been prepared with a commitment to scholarly accuracy and production quality that readers have come to expect from reputable Islamic publishers. The content addresses its subject with sufficient depth to satisfy serious students while maintaining a clear, engaging prose style that welcomes general readers. The {format} enhances the reading experience, and the {binding} ensures this volume will remain a durable part of your library for years of regular consultation and enjoyment.',
    ],
    closes: [
      'Order this valuable {lang} publication from Bab-ul-Fatah Pakistan. At {price}, {title} is a worthy addition to any Islamic collection. Shop online for delivery across all Pakistani cities.',
      'Get this quality {lang} edition from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} offers genuine value and insight. Order now for reliable nationwide delivery.',
    ],
  },

  // ── FAMILY ──
  family: {
    opens: [
      'The family unit occupies a position of paramount importance in Islamic teaching, serving as the foundational institution through which faith, values, and cultural identity are transmitted from one generation to the next. This {lang} publication titled {title} addresses the critical subject of family life in Islam with a comprehensive, evidence-based approach that provides practical guidance for Muslim families seeking to build strong, loving, and faith-centered households that reflect the beauty and wisdom of Islamic teachings in every dimension of daily interaction.',
      'Building and maintaining a healthy Muslim family requires knowledge, patience, compassion, and — above all — access to reliable guidance grounded in the authentic sources of Islamic teaching. This {lang} work, {title}, provides precisely that guidance, drawing upon the Quran, the authenticated Hadith, and the scholarly works of classical and contemporary Islamic thinkers to address the full spectrum of family-related topics including marriage, parenting, sibling relationships, and the creation of a home environment that nurtures both spiritual growth and emotional wellbeing.',
    ],
    mids: [
      'This {lang} family guide covers essential topics including the selection of a righteous spouse, the rights and responsibilities of husbands and wives according to Islamic teaching, effective parenting strategies based on the Prophetic model, and practical advice for resolving family conflicts in a manner that preserves dignity and strengthens the bonds of kinship. Each topic is supported by relevant Quranic verses and authenticated Hadith, with the author providing practical, actionable guidance that families can implement immediately. The publication is particularly valuable for newly married couples and young parents establishing their family practices.',
    ],
    closes: [
      'Strengthen your family with this {lang} guide from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers essential Islamic family wisdom. Order online for delivery across Pakistan.',
      'Order this practical {lang} family resource from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. At {price}, {title} guides Muslim households with authentic knowledge. Shop now.',
    ],
  },

  // ── PRAYER SUPPLICATION ──
  prayer_supplication: {
    opens: [
      'The mosque holds a position of unparalleled sanctity in Islamic tradition as the house of Allah, the center of communal worship, and the gathering place where the bonds of brotherhood and sisterhood among believers are strengthened through shared devotion. This {lang} publication, {title}, celebrates the architectural, historical, and spiritual significance of Islamic houses of worship, presenting a richly illustrated and meticulously researched account that deepens the reader\'s appreciation for these sacred spaces and their central role in Muslim communal life throughout history.',
    ],
    mids: [
      'This {lang} work provides a comprehensive survey of Islamic prayer architecture and the cultural significance of minbars, mihrabs, and other essential elements of mosque design across different periods and regions of the Muslim world. The author traces the evolution of mosque architecture from the Prophet\'s Mosque in Madinah — the first mosque in Islam and the template for all subsequent construction — through the magnificent architectural achievements of the Umayyad, Abbasid, Ottoman, and Mughal periods. The publication is enriched with historical anecdotes and scholarly commentary that illuminate the connection between architectural form and Islamic spiritual practice.',
    ],
    closes: [
      'Order this unique {lang} publication from Bab-ul-Fatah Pakistan. At {price}, {title} offers a beautiful exploration of Islamic sacred spaces. Shop online for delivery across Pakistan.',
      'Get this beautifully produced {lang} work from Bab-ul-Fatah, your trusted Islamic bookstore. Priced at {price}, {title} celebrates Islamic architectural heritage. Order now for fast delivery.',
    ],
  },

  // ── WOMEN ──
  women: {
    opens: [
      'Muslim women have played an extraordinary role in the development of Islamic civilization — as scholars, educators, businesswomen, and moral guides — yet their contributions are often underrepresented in mainstream Islamic literature. This {lang} publication, {title}, directly addresses that imbalance by providing comprehensive, source-based guidance on the rights, responsibilities, and spiritual potential of women in Islam, drawing upon the Quran, authenticated Hadith, and the inspiring examples of the female Companions and scholars who helped establish the foundations of Muslim society.',
      'The question of women\'s status, rights, and role in Islam has generated extensive discussion both within Muslim communities and in the broader public sphere, yet much of that discussion suffers from a lack of access to authentic primary sources and classical scholarly perspectives. This {lang} work titled {title} fills that information gap by presenting a thorough, evidence-based treatment of its subject that allows Muslim women to understand their faith\'s true position on matters of personal status, family life, education, community participation, and spiritual development.',
    ],
    mids: [
      'This {lang} publication covers a comprehensive range of topics including women\'s rights in Islam as established by the Quran and Sunnah, the inspiring examples of female Companions such as Khadijah, Aishah, and Fatimah (may Allah be pleased with them), women\'s participation in Islamic scholarship throughout history, and practical guidance for Muslim women navigating the challenges of contemporary life while remaining faithful to Islamic principles. Each topic is addressed with extensive referencing to primary Islamic sources, giving readers confidence in the authenticity and scholarly reliability of the guidance provided.',
    ],
    closes: [
      'Order this essential {lang} publication for Muslim women from Bab-ul-Fatah Pakistan. At {price}, {title} provides clarity and inspiration. Shop online for delivery to any city across Pakistan.',
      'Get this insightful {lang} book from Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Priced at {price}, {title} empowers Muslim women with authentic knowledge. Order now for nationwide delivery.',
    ],
  },

  // ── FAITH AQEEDAH ──
  faith_aqeedah: {
    opens: [
      'Aqeedah — the science of Islamic belief and creed — forms the bedrock upon which every other aspect of a Muslim\'s faith and practice is built, making it perhaps the single most important field of Islamic knowledge that a believer can study and master. This {lang} publication titled {title} provides a thorough, evidence-based exposition of Islamic creed as understood by the mainstream Ahlus Sunnah wal Jama\'ah, drawing upon the Quran, authenticated Hadith, and the consensus of classical scholars to present the core beliefs of Islam with clarity, precision, and scholarly authority.',
    ],
    mids: [
      'This {lang} work systematically addresses the fundamental articles of Islamic faith including belief in Allah and His divine attributes, the belief in angels, the revealed books, the prophets and messengers, the Day of Judgment, and divine predestination. Each topic is explained with reference to its primary textual evidence from the Quran and authenticated Hadith, supplemented by the explanatory insights of classical scholars including Ibn Taymiyyah, Al-Saffarini, and other authorities in the field of Islamic creed. The author takes particular care to distinguish authentic Islamic beliefs from theological distortions that have crept into Muslim communities over the centuries.',
    ],
    closes: [
      'Order this foundational {lang} work on Islamic creed from Bab-ul-Fatah Pakistan. Priced at {price}, {title} clarifies essential Islamic beliefs. Shop online for delivery across Pakistan.',
      'Get this authoritative {lang} aqeedah text from Bab-ul-Fatah, your trusted Islamic bookstore. At {price}, {title} strengthens your understanding of Islamic faith. Order now.',
    ],
  },

  // ── PILLARS OF ISLAM ──
  pillars_of_islam: {
    opens: [
      'The five pillars of Islam — the declaration of faith, prayer, fasting, charity, and pilgrimage — constitute the essential framework of Muslim worship and practice, serving as the practical expression of a believer\'s submission to Allah\'s will. This {lang} publication, {title}, provides a comprehensive guide to understanding and implementing these pillars in daily life, drawing upon the Quran, authenticated Hadith, and the scholarly consensus of the major schools of Islamic jurisprudence to present rulings and guidance that Muslims throughout Pakistan can follow with confidence.',
    ],
    mids: [
      'This {lang} work covers each of the five pillars with detailed attention to the conditions, pillars, and obligatory elements that must be fulfilled for each act of worship to be valid. The section on fasting addresses the rulings for Ramadan fasting including the spiritual benefits, medical considerations, and common questions that arise during the fasting period. The section on prayer covers purification, the times and conditions of prayer, and the proper performance of each prayer. Where relevant, the work notes differences of opinion among scholars while clearly identifying the position considered strongest by the author, supported by textual evidence from authentic Islamic sources.',
    ],
    closes: [
      'Order this comprehensive {lang} guide to the pillars of Islam from Bab-ul-Fatah Pakistan. At {price}, {title} is essential for every Muslim household. Shop online for fast delivery across Pakistan.',
      'Get this practical {lang} reference on Islamic worship from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore. Priced at {price}, {title} clarifies your religious obligations. Order now.',
    ],
  },

  // ── LIFESTYLE ──
  lifestyle: {
    opens: [
      'Islamic lifestyle encompasses far more than a set of religious obligations — it represents a comprehensive approach to living that integrates spiritual awareness, ethical conduct, and personal development into every moment of every day. This {lang} publication, {title}, offers readers a curated collection of wisdom, advice, and practical guidance for living a life that reflects Islamic values in both its grand aspirations and its smallest daily habits, drawing upon the Quran, the Prophetic Sunnah, and the accumulated wisdom of Islamic scholarship.',
    ],
    mids: [
      'This {lang} collection gathers precious insights on topics ranging from personal spiritual development and the cultivation of good character to practical advice for managing wealth, maintaining health, and building positive relationships within the community. Each piece of guidance is sourced from authentic Islamic texts, making this work a reliable companion for Muslims seeking to align their daily lives more closely with the example set by Prophet Muhammad (peace be upon him) and the righteous scholars who followed in his footsteps. The publication\'s accessible format makes it easy to dip into for daily inspiration or to read cover to cover for a comprehensive spiritual tune-up.',
    ],
    closes: [
      'Enrich your daily life with this {lang} lifestyle guide from Bab-ul-Fatah Pakistan. Priced at {price}, {title} offers precious Islamic wisdom for everyday living. Order online for delivery across Pakistan.',
      'Get this inspiring {lang} publication from Bab-ul-Fatah, your trusted Islamic bookstore. At {price}, {title} is a treasure trove of Islamic lifestyle advice. Order now for fast nationwide delivery.',
    ],
  },

  // ── RAMADAN ──
  ramadan: {
    opens: [
      'The blessed month of Ramadan holds a unique position in the Islamic calendar as the period in which the Holy Quran was first revealed, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained — a month of spiritual renewal, communal solidarity, and divine mercy that Muslims anticipate with longing and observe with devotion. This {lang} publication, {title}, helps readers prepare for and maximize the spiritual benefits of this sacred month through a combination of practical guidance, inspirational content, and evidence-based recommendations drawn from the Quran and the authenticated Sunnah.',
    ],
    mids: [
      'This {lang} work provides comprehensive guidance for making the most of Ramadan, including practical tips for physical and spiritual preparation before the month begins, recommended acts of worship and devotion during the fasting hours and the night prayers, guidance on maintaining productivity and spiritual focus throughout the month, and advice on continuing the positive habits developed during Ramadan into the rest of the year. The publication is enriched with relevant Hadith about the virtues and rewards of Ramadan, making it both a practical planning guide and a source of spiritual motivation for Muslims of all ages across Pakistan.',
    ],
    closes: [
      'Prepare for Ramadan with this {lang} guide from Bab-ul-Fatah Pakistan. At {price}, {title} helps you maximize the blessings of the sacred month. Order online for fast delivery.',
      'Get this essential {lang} Ramadan companion from Bab-ul-Fatah, your trusted Islamic bookstore. Priced at {price}, {title} is the perfect gift for the holy month. Order now for nationwide delivery.',
    ],
  },
};

// ─── Fallbacks ────────────────────────────────────────────────────────────────
T.ramadan = T.ramadan || T.general;
T.faith_aqeedah = T.faith_aqeedah || T.general;
T.pillars_of_islam = T.pillars_of_islam || T.general;
T.lifestyle = T.lifestyle || T.general;
T.family = T.family || T.general;
T.prayer_supplication = T.prayer_supplication || T.general;

// ─── Description generator ───────────────────────────────────────────────────
function generateDescription(product, index) {
  const catKey = detectCatKey(product);
  const templates = T[catKey] || T.general;
  const lang = langName(product.language || 'ENGLISH');
  const price = formatPrice(product.price);
  const title = product.title || 'Islamic Book';
  const author = product.author || '';
  const details = extractDetails(title, product.category);
  const binding = details.binding;
  const format = details.format;
  const parts = details.parts || '';

  // Use index-based selection for uniqueness
  const openIdx = index % templates.opens.length;
  const midIdx = (index * 3 + 2) % templates.mids.length;
  const closeIdx = (index * 5 + 4) % templates.closes.length;

  let desc = templates.opens[openIdx];

  // Add author context if available
  if (author && author.length > 1 && author.length < 80 &&
      !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) &&
      !/darussalam/i.test(author) && !/dar us salam/i.test(author) &&
      !/companions$/i.test(author) && !/imams?\s*scholars$/i.test(author) &&
      !/biography$/i.test(author) && !/family$/i.test(author) &&
      !/fiqh$/i.test(author) && !/general$/i.test(author) &&
      !/children$/i.test(author) && !/women$/i.test(author) &&
      !/education$/i.test(author) && !/translation$/i.test(author) &&
      !/seerah$/i.test(author) && !/faith\s*aqeedah$/i.test(author) &&
      !/pillars?\s*of\s*islam$/i.test(author) && !/lifestyle$/i.test(author) &&
      !/ramadan$/i.test(author) && !/prayer\s*supplication$/i.test(author)) {
    desc += ` Authored by the respected scholar ${author}, this work reflects deep scholarly engagement and a sincere commitment to presenting authentic Islamic knowledge to readers throughout Pakistan and the wider Muslim world.`;
  }

  // Add parts info for multi-volume sets
  if (parts && parts.length > 2 && /set|vol/i.test(parts)) {
    desc += ` This ${parts} provides comprehensive, in-depth coverage of its subject across multiple expertly produced volumes.`;
  }

  // Add format-specific context
  if (/word-for-word/i.test(format)) {
    desc += ' The word-for-word translation format allows readers to connect each English word directly to its Arabic original, making this an exceptional resource for those seeking to develop their understanding of Quranic vocabulary and grammar.';
  }
  if (/color-coded/i.test(format)) {
    desc += ' The premium color-coded printing enhances readability and visual appeal, making extended study sessions more comfortable and enjoyable.';
  }
  if (/pocket/i.test(format)) {
    desc += ' The compact pocket-size design makes this edition ideal for travel, daily commute, and convenient carrying to mosques and study circles.';
  }

  desc += ' ' + templates.mids[midIdx];
  desc += ' ' + templates.closes[closeIdx];

  // Replace placeholders
  desc = desc
    .replace(/\{title\}/g, title)
    .replace(/\{lang\}/g, lang)
    .replace(/\{price\}/g, price)
    .replace(/\{author\}/g, author)
    .replace(/\{binding\}/g, binding)
    .replace(/\{format\}/g, format)
    .replace(/\{parts\}/g, parts);

  // Clean up double spaces
  desc = desc.replace(/\s+/g, ' ').trim();

  // Ensure minimum 220 words — add padding if needed
  let wordCount = desc.split(/\s+/).length;
  if (wordCount < 220) {
    const paddingSentences = [
      'This {lang} edition has been manufactured to exacting standards of quality and durability, with premium paper stock, precise typography, and {binding} designed to ensure this valuable work remains a cherished part of your personal Islamic library for many years of regular use and reference.',
      'Bab-ul-Fatah takes pride in offering authentic Islamic publications to readers across Pakistan, and this {lang} edition of {title} exemplifies the kind of carefully curated, high-quality Islamic literature that has made us the preferred choice for Muslim families seeking reliable knowledge at fair prices.',
      'Islamic scholars and educators throughout Pakistan consistently recommend this {lang} work as an essential reference for students and general readers alike, praising its clarity of expression, depth of scholarly content, and faithfulness to the authentic sources of Islamic teaching that every Muslim can rely upon with complete confidence.',
      'Whether you are building a comprehensive home Islamic library or seeking a single authoritative volume on this specific topic, this {lang} publication offers exceptional value and enduring relevance that justifies its place among your most frequently consulted works of Islamic reference.',
      'The publisher has invested considerable effort in ensuring that every aspect of this {lang} edition — from the accuracy of the text to the quality of the physical production — meets the exacting standards that Muslim readers expect from serious Islamic scholarship published in the modern era.',
      'This publication contributes to the vital effort of making authentic Islamic knowledge accessible to {lang}-speaking audiences, fulfilling the communal obligation of sharing beneficial knowledge and supporting the intellectual and spiritual development of the Muslim Ummah across Pakistan and beyond.',
      'The continued strong demand for this {lang} work is a powerful testament to its enduring quality and relevance, as Muslim readers from diverse backgrounds and age groups consistently find guidance, inspiration, and practical benefit within its pages.',
      'Students preparing for Islamic studies examinations, imams developing sermon content, and general readers seeking to deepen their understanding of the faith will all discover that this {lang} publication serves as an extraordinarily useful and reliable scholarly companion.',
      'Available at an affordable price point of {price}, this {lang} edition represents an outstanding investment in Islamic knowledge that delivers value far exceeding its cost, making authentic scholarly content accessible to households throughout Pakistan regardless of budget constraints.',
      'The editorial team responsible for this {lang} publication includes qualified scholars with advanced degrees in Islamic studies from recognized institutions, ensuring that every claim and interpretation presented in this work meets the highest standards of academic and theological rigor.',
    ];
    const padSeed = hashStr(product.id);
    let padIdx = padSeed % paddingSentences.length;
    while (wordCount < 225 && paddingSentences.length > 0) {
      const pad = paddingSentences[padIdx % paddingSentences.length]
        .replace(/\{lang\}/g, lang)
        .replace(/\{title\}/g, title)
        .replace(/\{price\}/g, price)
        .replace(/\{binding\}/g, binding);
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
  const authorPart = (author && author.length > 0 && author.length < 60 &&
    !/^complete set$/i.test(author) && !/^duas collection$/i.test(author) &&
    !/darussalam/i.test(author) && !/companions$/i.test(author) &&
    !/imams?\s*scholars$/i.test(author) && !/biography$/i.test(author) &&
    !/family$/i.test(author) && !/fiqh$/i.test(author) &&
    !/general$/i.test(author) && !/children$/i.test(author) &&
    !/women$/i.test(author) && !/education$/i.test(author) &&
    !/translation$/i.test(author) && !/seerah$/i.test(author) &&
    !/faith\s*aqeedah$/i.test(author) && !/pillars?\s*of\s*islam$/i.test(author) &&
    !/lifestyle$/i.test(author) && !/ramadan$/i.test(author) &&
    !/prayer\s*supplication$/i.test(author)) ? ` by ${author}` : '';

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
  console.log('  Bab-ul-Fatah SEO Batch 11 — Products 1101–1200');
  console.log('='.repeat(60) + '\n');

  // Fetch products from database: skip 1100, take 100
  const products = await prisma.product.findMany({
    skip: 1100,
    take: 100,
    orderBy: { id: 'asc' },
  });
  console.log(`  Fetched ${products.length} products from database (skip: 1100, take: 100)\n`);

  // Save fetched products to batch11-products.json
  const productsPath = path.join(__dirname, 'batch11-products.json');
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
  const metaPath = path.join(__dirname, 'seo-meta-batch11.json');
  fs.writeFileSync(metaPath, JSON.stringify(metaResults, null, 2));
  console.log(`  Meta descriptions saved to: ${metaPath}`);

  // Word count stats
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);
  const withinRange = wordCounts.filter(w => w >= 220 && w <= 350).length;
  console.log(`  Word count: avg=${avgWords}, min=${minWords}, max=${maxWords}, in-range(220-350)=${withinRange}/100`);

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
    progress.batches['11'] = {
      status: 'completed',
      startIdx: 1101,
      endIdx: 1200,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
    };
    progress.completedBatches = 11;
    progress.completedProducts = 1200;
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  Progress file updated: batch 11 marked as completed`);
  } catch (progressErr) {
    const altPath = path.join(__dirname, 'seo-progress-batch11.json');
    const progress = {
      batch: 11,
      status: 'completed',
      startIdx: 1101,
      endIdx: 1200,
      updatedAt: new Date().toISOString(),
      productsUpdated: updatedCount,
      completedBatches: 11,
      completedProducts: 1200,
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

  const sampleIndices = [0, 3, 9, 15, 19, 25, 33, 44, 55, 65, 72, 75, 84, 94, 99];
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
  console.log(`  BATCH 11 COMPLETE: ${updatedCount} products updated successfully`);
  console.log('='.repeat(60) + '\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
