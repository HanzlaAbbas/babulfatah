const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: "the-nature-of-fasting",
    description: `The Nature of Fasting is a detailed study that goes far beyond the basic rules of abstaining from food and drink to explore the profound spiritual, physical, and social dimensions of sawm (Islamic fasting). This work examines fasting as a comprehensive act of worship that engages the entire human being — body, mind, and soul — and reveals how the Ramadan fast serves as an annual reset for a Muslim's relationship with Allah, with themselves, and with the broader community.

The book begins by establishing the Quranic foundations of fasting, analyzing the relevant verses in Surah Al-Baqarah that define the obligation, its purpose (taqwa), and the concessions granted to travelers, the ill, the elderly, and pregnant or nursing women. The author then moves through a systematic discussion of the jurisprudential rulings (fiqh) related to fasting, covering topics such as the intention (niyyah), things that invalidate the fast, recommended acts during Ramadan, and the spiritual significance of suhoor and iftar. Each ruling is supported by evidence from the Quran, authenticated hadith, and the consensus of the major schools of Islamic jurisprudence.

Beyond the legal framework, the book dedicates substantial chapters to the inner dimensions of fasting. It explains how controlling physical desires serves as training for controlling the tongue from gossip and lying, the eyes from viewing the prohibited, the ears from listening to harmful speech, and the mind from harboring ill thoughts. The author draws upon the works of spiritual masters like Imam al-Ghazali and Ibn al-Qayyim to explain how fasting cultivates taqwa (God-consciousness), patience, gratitude, humility, and empathy for those less fortunate.

The physiological benefits of fasting receive thoughtful treatment as well, with the author citing contemporary medical research on intermittent fasting while remaining grounded in the prophetic tradition. The book explores how the Prophet's guidance on eating patterns during Ramadan aligns remarkably with modern nutritional science. Additional sections cover the special virtues of the last ten nights of Ramadan, the significance of Laylatul Qadr, Zakat al-Fitr, and the spiritual atmosphere that makes Ramadan a uniquely transformative period in the Muslim calendar.`,
    metaDescription: "A comprehensive guide to Islamic fasting covering its jurisprudence, spiritual dimensions, and health benefits of the Ramadan fast."
  },
  {
    slug: "the-night-of-decree",
    description: `The Night of Decree is a focused scholarly work dedicated entirely to Laylatul Qadr — the single night within the last ten days of Ramadan that the Quran describes as better than a thousand months. This book gathers every relevant hadith, scholarly opinion, and practical guidance related to this most blessed night into a single comprehensive volume, making it an essential reference for every Muslim seeking to maximize their spiritual gains during Ramadan.

The book opens by examining the Quranic verses in Surah Al-Qadr that establish the night's existence and significance, providing a detailed linguistic analysis of key terms including "laylah" (night), "qadr" (decree/power), and the phrase "khayrun min alfi shahr" (better than a thousand months). Multiple scholarly interpretations of these verses are presented, giving readers a range of perspectives on exactly what makes this night so extraordinary.

A substantial portion of the work is devoted to identifying when Laylatul Qadr falls. The author presents the various opinions held by the Companions and early scholars — whether it is consistently on the twenty-seventh night or shifts among the odd nights of the last ten days — with supporting evidence for each position. The signs that the Prophet mentioned as indicators of Laylatul Qadr are documented and discussed, including the weather conditions and the unique spiritual atmosphere that many have reported experiencing.

Practical guidance forms a major section of this book. The author outlines in detail how to seek Laylatul Qadr, recommending specific prayers, supplications, forms of dhikr, and Quranic recitation practices that the Prophet and his companions engaged in during these nights. The emphasis is on quality and sincerity of worship rather than mere quantity, with guidance on maintaining focus, managing physical fatigue, and cultivating the proper internal state during extended worship sessions.

The book also addresses common questions and misunderstandings: whether Laylatul Qadr can be experienced differently by different people, whether its blessings extend to those who sleep through it, and how people with demanding schedules or physical limitations can still participate meaningfully. The Night of Decree combines scholarly depth with practical applicability, serving as both an academic resource and a personal guide for one of the most important nights in a Muslim's spiritual calendar.`,
    metaDescription: "A comprehensive study of Laylatul Qadr covering its Quranic significance, scholarly opinions on its timing, and practical worship guidance."
  },
  {
    slug: "the-noble-life-of-the-prophet-pbuh-3-vols",
    description: `The Noble Life of the Prophet (PBUH) in three volumes represents one of the most thorough and well-documented English-language biographies of Prophet Muhammad, peace be upon him. Spanning the entirety of the prophetic mission from pre-Islamic Arabia through the Madinan period and the farewell pilgrimage, this comprehensive work draws upon the most authoritative sources in Islamic historiography to present a detailed, chronological account of the Prophet's life that is both academically rigorous and spiritually engaging.

The first volume covers the background of Arabian society before Islam, the lineage and early life of Muhammad, the first revelation, and the difficult years of persecution and preaching in Makkah. Readers gain a vivid understanding of the social conditions that made Islam's message revolutionary — the tribal warfare, moral decay, oppression of women and the weak, and idolatrous practices that dominated Arabian society. The Prophet's character before his prophethood, known even to his enemies as "Al-Amin" (the trustworthy), is documented with authentic reports.

The second volume chronicles the migration to Madinah, the establishment of the first Islamic community, the major battles of Badr, Uhud, and the Trench, and the treaties that shaped the early Muslim state. Military campaigns are analyzed not merely as historical events but as case studies in leadership, strategy, ethics in warfare, and community building. The Constitution of Madinah receives detailed examination as one of history's first written constitutional documents.

The third volume covers the conquest of Makkah, the Farewell Pilgrimage, the Prophet's final illness, and his passing. The expansion of Islam across the Arabian Peninsula is documented along with the diplomatic correspondence with surrounding empires. Each event is supported by multiple chains of narration, with the author carefully noting where sources agree and where scholarly differences exist. Maps, genealogical charts, and timelines enhance the reader's comprehension of complex historical developments. Extensive footnotes provide cross-references to original Arabic sources including Sahih al-Bukhari, Sahih Muslim, the Musnad of Ahmad, and the major sirah works of Ibn Hisham, Ibn Kathir, and Ibn Sa'd.`,
    metaDescription: "A three-volume scholarly biography of Prophet Muhammad covering his entire life with extensive sourcing from authentic Islamic historiography."
  },
  {
    slug: "the-noble-quran-hard-cover-14x21",
    description: `The Noble Quran in hard cover at 14x21 centimeters is a substantial, desk-friendly edition designed for regular reading, study, and reference. This mid-size format offers a practical balance between portability and readability, making it well-suited for home libraries, study desks, office spaces, and classrooms where a dependable, daily-use Quran is needed. The hard cover binding provides excellent durability and protection, ensuring the pages remain flat during reading sessions and the spine withstands repeated handling over years of use.

The Arabic text is presented in a clear, well-spaced Uthmani script that follows the standard Middle Eastern layout familiar to readers worldwide. Side-by-side English translation by Dr. Muhammad Taqi-ud-Din Al-Hilali and Dr. Muhammad Muhsin Khan accompanies the Arabic, with explanatory footnotes placed at the bottom of each page for immediate reference without interrupting the flow of reading. These footnotes draw upon authentic tafsir sources to clarify historical context, linguistic nuances, and legal implications of specific verses.

This edition includes several valuable reference features: a comprehensive index of Quranic subjects, a color-coded tajweed guide for those learning proper recitation, and a table mapping each surah to the period of its revelation (Makkan or Madinan). The translation philosophy prioritizes accuracy and faithfulness to the original Arabic meaning while maintaining readability in English, making it suitable for both English-speaking Muslims and Arabic-speaking students who benefit from bilingual access.

The 14x21 centimeter dimensions place this edition in the category of a full-size study Quran — large enough for comfortable reading of both Arabic and English text but not so large as to be cumbersome. It is an ideal choice for individuals who engage in regular Quran study, teachers and students at Islamic educational institutions, imams and khateebs who prepare sermons, and families wanting a quality Quran for their shared reading space. The binding quality and paper stock are manufactured to institutional standards, reflecting a commitment to producing a Quran that can serve as a lifelong companion for serious students of the Book of Allah.`,
    metaDescription: "A hardcover 14x21cm Noble Quran with Arabic text and English translation, featuring footnotes and tajweed guide for study and reference."
  },
  {
    slug: "the-noble-quran-soft-cover-812-pocket-size",
    description: `The Noble Quran in soft cover at 8x12 centimeters is a genuinely pocket-sized edition designed for maximum portability without compromising the readability of the sacred text. This compact format is intended for Muslims who want constant access to the Quran throughout their daily routines — during commutes, lunch breaks, travel, waiting rooms, or any situation where carrying a full-size Quran would be impractical.

Despite its small dimensions, this edition maintains the complete Arabic text of the Quran in a legible Uthmani script. The soft cover binding keeps the overall weight minimal, and the flexible cover allows the book to fit comfortably in a jacket pocket, handbag, backpack compartment, or vehicle glove compartment. The pages are printed on thin but durable paper specifically chosen for this format, resisting wear and tear while keeping the volume slim enough for genuine pocket carry.

This pocket-size edition includes the complete English translation by Dr. Muhammad Taqi-ud-Din Al-Hilali and Dr. Muhammad Muhsin Khan, paired with the Arabic text. While the font size is necessarily smaller than full-size editions to accommodate the compact format, careful typography choices ensure that both the Arabic and English remain readable for most users under normal lighting conditions. The translation maintains the same accuracy and faithfulness to the original as the larger editions in this series.

The edition is particularly valued by commuters who use public transportation, students who carry their Quran between classes, healthcare workers who read during breaks, and travelers who prefer not to pack larger volumes. It also serves as an excellent secondary copy for those who already own a full-size Quran for home study but want a travel companion. Many readers keep a copy in their car, workplace desk, or travel bag so they can maintain their daily recitation and reflection habits regardless of location. The soft cover format makes this one of the most affordable and accessible ways to own a complete Arabic-English Quran.`,
    metaDescription: "A pocket-size 8x12cm Noble Quran with Arabic and English translation in soft cover, designed for everyday carry and portable reading."
  },
  {
    slug: "the-noble-quran-word-for-word-3-vol-set",
    description: `The Noble Quran Word-for-Word in three volumes is a specialized study edition that presents the Quranic text with each Arabic word individually translated and color-coded according to its grammatical role. This unique format transforms the reading experience from passive comprehension to active linguistic engagement, making it an indispensable resource for anyone serious about understanding the Quran in its original Arabic.

In this three-volume set, each page displays the Arabic text in the left column with every word numbered and matched to its English equivalent in the right column. The color-coding system distinguishes between nouns, verbs, particles, and other grammatical categories, allowing readers to visually parse the sentence structure of Quranic Arabic. This feature is particularly valuable for students who have some familiarity with Arabic grammar but need assistance recognizing word forms, roots, and syntactic relationships in the flowing Quranic text.

The first volume covers Surah Al-Fatiha through Surah Al-Ma'idah, the second volume covers Surah Al-An'am through Surah Al-Kahf, and the third completes the remaining surahs through Surah An-Nas. Each volume is separately bound for ease of handling and study. The three-volume division also makes this set more manageable than a single massive volume, allowing readers to focus on specific sections without being overwhelmed.

This edition is especially beneficial for several categories of users: students enrolled in Arabic language courses who want to apply their grammar knowledge directly to the Quran, non-Arabic-speaking Muslims who are learning to understand the prayer text in its original language, converts to Islam who wish to connect with the Quran beyond translations, and advanced students of tafsir who need to trace grammatical structures for deeper exegesis. The word-for-word format also reveals linguistic patterns and rhetorical devices that are often invisible in smooth prose translations — parallelism, chiasmus, and the rhythmic structures that contribute to the Quran's inimitable eloquence.

For serious Quran students, this three-volume set serves as a bridge between relying entirely on translations and achieving independent comprehension of the Arabic text.`,
    metaDescription: "A three-volume word-for-word Arabic-English Quran with color-coded grammar, designed for students learning Quranic Arabic structure."
  },
  {
    slug: "the-noble-quran-4-color-17x24-single-volume",
    description: `The Noble Quran in a single 17x24 centimeter volume with four-color interior printing represents the premium production standard in Quran publication. This large-format edition uses a sophisticated four-color printing process that enhances the Arabic text, translation, and supplementary materials with visual clarity that single-color editions cannot achieve. The result is a Quran that is not only a sacred text but a beautifully crafted book worthy of its central place in Muslim life.

The four-color printing system allows for color-differentiated elements on every page: the Arabic Uthmani script appears in its traditional dark color, the English translation in a contrasting shade, tajweed markings in a distinctive color for easy identification, and explanatory footnotes in yet another color to distinguish them from the primary translation text. This multi-color approach dramatically improves reading fluency by allowing the eye to immediately identify the type of content on any given line without conscious effort.

At 17x24 centimeters, this is a large-format edition designed primarily for home and institutional use. The generous page size accommodates both the Arabic and English texts in comfortably large fonts, making extended reading sessions significantly less taxing on the eyes. This format is particularly appreciated by elderly readers, those with visual impairments, and anyone who finds smaller fonts difficult to sustain over long periods. The book lays flat when open due to its sturdy binding, a practical feature for those who read the Quran regularly during prayer preparation or study.

The single-volume format ensures the entire Quran is contained within one binding, eliminating the need to switch between multiple volumes during recitation or study. This edition is the preferred choice for mosque libraries, Islamic school classrooms, and family settings where the Quran serves as a shared reference. The premium paper stock, durable binding, and protective dust jacket all reflect the reverence due to the Book of Allah. Scholars, imams, and serious students of Quran consistently choose this format as their primary study copy, valuing the combination of readability, durability, and aesthetic quality.`,
    metaDescription: "A premium 17x24cm single-volume Noble Quran with four-color printing, large fonts, and enhanced tajweed markings for comfortable reading."
  },
  {
    slug: "the-noble-quran-pocket-size-10x15cm-sc",
    description: `The Noble Quran Pocket Size at 10x15 centimeters in soft cover occupies a practical middle ground between the ultra-compact 8x12 pocket edition and the full-size study formats. This slightly larger pocket format offers improved readability compared to the smallest editions while retaining enough portability for daily carry. It has become one of the most popular formats for personal use among Muslims who need a Quran that travels easily but doesn't sacrifice too much in terms of font size and page layout.

The 10x15 centimeter dimensions mean each page is roughly 40 percent larger in area than the 8x12 edition, which translates directly to larger Arabic and English text that is significantly easier to read for extended periods. The soft cover binding keeps the weight manageable — this edition slips easily into a backpack, briefcase, large handbag, or vehicle storage compartment. It is a versatile format that works equally well on a nightstand, a desk, or held in the hands during travel.

This edition presents the complete Arabic Uthmani script alongside the Hilali-Khan English translation, maintaining the same scholarly accuracy and footnote system found in the larger editions in this series. The footnotes, while necessarily more compact to fit the reduced page size, retain their essential explanatory function, providing context for historical references, legal terminology, and linguistic subtleties that aid comprehension.

The 10x15 soft cover format has proven particularly popular among several user groups: university students who carry their Quran between classes and the prayer hall, working professionals who read during lunch breaks or commutes, parents who keep a personal copy separate from the family's main Quran, and new Muslims who appreciate having an accessible, affordable edition as they begin their Quranic engagement. It is also frequently chosen as a gift copy — substantial enough to feel meaningful while remaining affordable enough for distribution.

The paper quality and printing standards are consistent with the Noble Quran series, ensuring that this pocket edition delivers reliable text reproduction and reasonable durability despite its soft cover construction.`,
    metaDescription: "A 10x15cm pocket Noble Quran in soft cover offering improved readability with Arabic-English text for daily personal use and travel."
  },
  {
    slug: "the-noble-quran-with-spanish-translation",
    description: `The Noble Quran with Spanish Translation is a bilingual edition that presents the Arabic Uthmani text alongside a Spanish translation, serving the significant Spanish-speaking Muslim population across Latin America, Spain, and Spanish-speaking communities worldwide. This edition addresses a growing demand for authentic, scholarly Quran translations in Spanish that maintain the accuracy and reliability standards established by the renowned Hilali-Khan translation methodology.

The Spanish translation follows the same approach as the English editions in the Noble Quran series — prioritizing faithfulness to the Arabic original, providing explanatory notes drawn from classical tafsir sources, and avoiding interpretive liberties that could distort the original meaning. Footnotes in Spanish appear at the bottom of each page, offering context for historical events, clarifying legal terminology, and explaining references that might be unfamiliar to Spanish-speaking readers approaching the Quran for the first time.

This edition is particularly significant given the rapid growth of Islam among Spanish-speaking communities. Latin American countries, Spain, and Hispanic communities in the United States and Europe have seen increasing numbers of people embracing Islam, creating a need for quality Quranic resources in their native language. A Spanish-speaking new Muslim, for example, can now engage with the Quran in Spanish while simultaneously learning to read the Arabic text, building bilingual Quranic literacy from the outset.

The format makes this edition valuable beyond converts as well. Spanish-speaking imams and community leaders use it for sermon preparation and educational programming. Muslim families where Spanish is the primary household language can read the Quran together in their mother tongue while maintaining access to the authoritative Arabic text. Academic researchers studying the global spread of Islam benefit from having a reliable Spanish Quran edition for comparative linguistic and translational analysis.

The production quality matches the standards of the broader Noble Quran series, with clear typography, durable binding, and high-quality paper that ensures comfortable reading. This edition represents an important step in making the Quran accessible to one of the world's major language groups, connecting hundreds of millions of Spanish speakers directly with Islam's foundational text.`,
    metaDescription: "A bilingual Arabic-Spanish Noble Quran with scholarly translation and footnotes, serving Spanish-speaking Muslim communities worldwide."
  },
  {
    slug: "the-pillars-of-islam-iman",
    description: `The Pillars of Islam and Iman is a structured, comprehensive guide to the two foundational frameworks that define a Muslim's belief system and practice. This work treats Islam's five pillars (shahadah, salah, zakat, sawm, and hajj) and the six articles of faith (belief in Allah, angels, books, messengers, the Last Day, and divine decree) as interconnected components of a complete spiritual architecture, showing how each pillar supports and reinforces the others.

The book is divided into two major sections. The first section covers the pillars of Islam as acts of worship, beginning with the shahadah (testimony of faith) as the entry point into Islam and proceeding through each remaining pillar in order. For each pillar, the author provides the Quranic and hadith basis, the essential conditions for validity, detailed procedural guidance, common mistakes to avoid, and the spiritual wisdom behind the obligation. The discussion of salah (prayer), for example, covers not only the physical movements and recitations but also the inner states of concentration, humility, and awareness of Allah's presence that elevate the prayer from mere ritual to genuine communion with the Creator.

The second section addresses the pillars of iman (faith), which represent the internal belief system that gives meaning to external acts of worship. Each article of faith receives thorough treatment: the nature and attributes of Allah as understood through Quran and Sunnah, the categories of angels and their specific roles, the revealed scriptures and their relationship to the Quran, the prophetic continuum from Adam to Muhammad, the events of the Day of Judgment, and the complex topic of qadar (divine predestination) explained in a manner that resolves the apparent tension between human free will and Allah's sovereign decree.

The author draws extensively upon the works of major scholars of aqidah and fiqh, presenting information in a format that is simultaneously suitable for classroom instruction and self-study. Review questions at the end of each chapter reinforce key concepts, and a comprehensive glossary of Arabic terms helps readers build their Islamic vocabulary. This book serves as an excellent textbook for new Muslims, an organized review resource for lifelong Muslims, and a teaching tool for Islamic educators at all levels.`,
    metaDescription: "A complete guide to the five pillars of Islam and six articles of faith, combining practical worship guidance with theological depth."
  }
];

async function main() {
  for (const item of updates) {
    await prisma.product.update({
      where: { slug: item.slug },
      data: {
        description: item.description,
        metaDescription: item.metaDescription
      }
    });
    console.log("Updated:", item.slug);
  }
  console.log("Done");
}

main().then(() => prisma.$disconnect());
