const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const updates = [
  {
    slug: "methodical-interpretation-of-the-noble-quran-part-30-tafsir-manhaji",
    description: `Juz Amma, the thirtieth and final portion of the Quran, holds a special place in the daily worship of Muslims around the world. It contains the shortest yet most frequently recited surahs, making it the section that many Muslims first learn to read and memorize. Tafsir Manhaji offers a methodical, structured approach to understanding these surahs, moving beyond surface-level translation to provide readers with a systematic framework for Quranic interpretation.

This commentary follows a clear analytical methodology that breaks down each verse into its linguistic components, contextual background, and legal or spiritual implications. The word-by-word analysis helps readers appreciate the precision of Quranic Arabic, while the broader thematic discussions connect individual verses to the overarching message of the surahs in Juz Amma. Each surah is introduced with information about its period of revelation—whether Makkan or Madinan—which fundamentally shapes the tone, themes, and intended audience of the verses.

The tafsir draws upon classical exegetical sources while presenting the material in a format accessible to contemporary readers. Scholars of tafsir will recognize the influence of renowned mufassirun in the methodology, while students and general readers benefit from the clear organizational structure. Topics such as the Day of Judgment, the nature of divine oneness, the stories of past nations, and the descriptions of Paradise and Hell are treated with scholarly rigor and explanatory clarity.

For teachers of Quranic studies, this volume on Part 30 serves as an excellent classroom resource. The structured approach allows for systematic lesson planning, and the depth of commentary provides material for advanced discussion. For independent learners, the methodical format supports self-paced study without sacrificing academic thoroughness. The commentary addresses common questions that arise during the study of Juz Amma, providing answers grounded in classical scholarship and linguistic analysis.`,
    metaDescription: "Tafsir Manhaji Part 30 provides a structured, analytical commentary on Juz Amma with linguistic analysis, contextual background, and scholarly depth."
  },
  {
    slug: "mian-biwi-aik-dosray-ka-dil-kaisay-jeetain",
    description: `Marital harmony stands as one of the most significant and challenging aspects of a Muslim's daily life. This Urdu-language guide addresses the fundamental question embedded in its title—how a husband and wife can win each other's hearts—by drawing upon Islamic teachings, psychological insights, and practical advice grounded in the Sunnah of the Prophet Muhammad (peace be upon him) and the guidance of the Quran.

The book examines the concept of marital love through an Islamic lens, presenting the marriage relationship not merely as a social contract but as a sacred bond blessed by Allah. It discusses the rights and responsibilities of both spouses as outlined in Islamic jurisprudence, framing these obligations not as burdens but as pathways to mutual affection and respect. The Prophet's own example with his wives serves as a recurring reference point throughout the text, illustrating how kindness, patience, and consideration form the foundation of a successful Islamic marriage.

Practical communication strategies receive considerable attention in the text. The author provides guidance on resolving conflicts through constructive dialogue, active listening, and the avoidance of destructive habits such as harsh criticism, contempt, and stonewalling. Real-life scenarios common to South Asian households are addressed with cultural sensitivity, making the advice immediately applicable for Urdu-speaking readers. Topics such as financial management within the household, balancing relationships with in-laws, raising children together, and maintaining intimacy and romance are covered with appropriate modesty and depth.

The book also tackles contemporary challenges facing Muslim marriages, including the pressures of modern life, social media influences, and differing expectations shaped by generational gaps. By anchoring its advice in Quranic wisdom and Prophetic tradition while acknowledging present-day realities, the guide offers solutions that are both principled and practical. Each chapter concludes with actionable steps that couples can implement immediately, making the book not merely a theoretical treatise but a working manual for strengthening the marital relationship.`,
    metaDescription: "Urdu guide on building strong Islamic marriages through Quranic wisdom, Prophetic example, and practical communication strategies for couples."
  },
  {
    slug: "migo-ali",
    description: `Children's literature that combines engaging storytelling with meaningful moral lessons holds exceptional value in a young reader's development. Migo and Ali presents a collection of stories designed specifically for Muslim children, using relatable characters and age-appropriate narratives to introduce core Islamic concepts and values. The book follows the adventures of its titular characters—Migo and Ali—through situations that mirror the everyday experiences of children, making the lessons feel relevant and accessible rather than abstract or distant.

Each story in the collection focuses on a particular Islamic value or teaching, ranging from honesty and kindness to gratitude, patience, and respect for parents. The narrative style keeps young readers engaged through dialogue, gentle humor, and situations that children encounter in their own lives—at school, at home, during play, and in interactions with friends and family. Rather than presenting moral lessons in a didactic or preachy manner, the stories allow the characters to learn through their experiences, demonstrating consequences and rewards in ways that children can understand and remember.

The illustrations complement the text by bringing the characters and settings to life, helping visual learners connect more deeply with the material. The book's formatting and language level are calibrated for young readers, making it suitable for independent reading or shared reading sessions between parents and children. For families looking to establish a regular reading habit rooted in Islamic values, this book provides material that children will genuinely enjoy returning to.

Teachers at Islamic schools and weekend madrasah programs will find this collection useful as a supplementary resource for character education. The stories can serve as discussion starters, prompting children to reflect on how the values portrayed in the book apply to their own behavior. The gentle, non-judgmental tone ensures that children receive positive reinforcement for good character without feeling lectured or scolded.`,
    metaDescription: "Migo and Ali is an engaging children's storybook teaching Islamic values like honesty, kindness, and gratitude through relatable characters."
  },
  {
    slug: "mingling-between-men-and-women-is-prohibited",
    description: `The question of gender interaction occupies a central position in contemporary Islamic discourse, with diverse viewpoints and interpretations contributing to an ongoing debate. This book presents a thorough scholarly treatment of the Islamic position on free mixing between men and women, assembling evidence from the primary sources of Islamic law—the Quran, the authenticated Sunnah, the practice of the Companions, and the rulings of classical jurists—to construct a comprehensive case for the prohibition of unrestricted mingling between unrelated men and women.

The author begins by establishing the foundational Quranic verses that address modesty, lowering the gaze, and the boundaries of interaction between genders. These verses are analyzed through the lens of classical tafsir, with particular attention to the explanations offered by the earliest generations of Muslim scholars whose proximity to the time of revelation provides them with authoritative insight. The hadith evidence is then systematically presented, with each narration examined for its chain of transmission, authenticity grading, and contextual application.

The book dedicates substantial chapters to addressing common objections and misunderstandings. Arguments based on the practices of Muslim communities in certain historical periods are examined critically, distinguishing between culturally influenced customs and genuinely Islamic principles. The difference between necessary interaction in regulated settings—such as markets, educational institutions, and workplaces where Islamic guidelines are observed—and the free, unrestricted mixing that the book argues is prohibited receives careful analysis.

The societal consequences of abandoning these guidelines are discussed with reference to both Islamic teaching and observed outcomes in communities that have relaxed these boundaries. The text maintains a scholarly, evidence-based tone throughout, presenting its arguments systematically rather than emotionally. Students of Islamic jurisprudence, researchers, and Muslims seeking clarity on this topic will find the book's comprehensive evidentiary approach valuable for understanding the Islamic legal reasoning behind these guidelines.`,
    metaDescription: "Scholarly examination of Islamic rulings on gender interaction with Quranic evidence, hadith, and classical jurisprudence on prohibiting free mixing."
  },
  {
    slug: "minhaj-ul-muslim-english-2-vols",
    description: `Minhaj ul Muslim stands as one of the most comprehensive guides to Islamic practice and belief composed in the modern era. This two-volume English translation brings the monumental work of Abu Bakr Jabir Al-Jaza'iri to a wider audience, covering virtually every aspect of a Muslim's religious life with scholarly precision and practical clarity. The scope of the work is remarkable—spanning creed, worship, transactions, ethics, social relations, and personal conduct—making it a genuine reference work that addresses the totality of Islamic living.

The first volume focuses primarily on matters of faith and worship. It opens with a detailed treatment of Islamic creed, explaining the six pillars of iman with evidential support from the Quran and Sunnah. The section on prayer is particularly thorough, covering the prerequisites, obligatory elements, recommended acts, and common errors in Salah with meticulous detail. Fasting, charity, and the pilgrimage receive similarly comprehensive treatment, with each topic organized into clear subsections that make the material navigable for both sequential reading and quick reference.

The second volume shifts to broader aspects of Muslim life, including family relations, financial transactions, food and dress regulations, and ethical conduct. The chapters on family law cover marriage, divorce, inheritance, and the rights of parents and children with reference to the relevant Quranic verses and hadith narrations. Business ethics, interest-free transactions, and the Islamic approach to wealth management receive detailed discussion. The section on morals and manners draws heavily from Prophetic guidance, providing specific behavioral guidelines for situations ranging from greeting others and visiting the sick to conducting business and resolving disputes.

Throughout both volumes, the author maintains a methodology grounded in the Quran, the authenticated Sunnah, and the understanding of the early generations of Muslims. Controversial or disputed matters are noted with the positions of different schools of thought clearly attributed. The English translation preserves the structured, reference-friendly format of the original Arabic work, making this two-volume set an indispensable resource for English-speaking Muslims seeking a comprehensive and reliable guide to Islamic practice.`,
    metaDescription: "Two-volume English Minhaj ul Muslim covering creed, worship, family law, ethics, and daily Islamic practice with comprehensive scholarly detail."
  },
  {
    slug: "minhaj-ul-muslim-urdu",
    description: `Minhaj ul Muslim ka Urdu edition Pakistani aur Hindustani Musalmanon ke liye ek ahem maujooda hai jo apne deeni zindagi ke har pehlu mein Qurani aur Nabvi hedayat ki roshni mein rehna chahte hain. Yeh kitaab Abu Bakr Jabir Al-Jaza'iri ki azeem tasneef ka Urdu tarjuma hai jo deeni ilm ke mamlaat mein mukammal aur mustanad marja ka darja rakhti hai.

Aqeedah ke bab mein yeh kitaab Islam ke bunyadi aqaid—Allah ki wahdaniyat, farishton par iman, kitabon par iman, anbiya par iman, Qayamat ka iman, aur taqdeer ke bare mein—is se bohat waseh aur mustanad tafseel se mutalliq hoti hai. Har aqeedah ko Quranic aayaat aur Saheeh ahadith ki roshni mein samjhaya gaya hai taake parhne wale ko sirf kahaayi par bharosa na karna paray balke ilmi aur daleeli asar se waqif ho sake.

Ibadat ke ahkaam ka bayan is kitaab ke sab se waseh hisson mein se ek hai. Namaz, roza, zakat, aur Hajj ke bare mein har zaroori masla aur maslatal-fiqhiya ka tafseeli bayan maujood hai. Namaz ki ahmiyat, uski arkaan, sunnon, mustahabbat, aur namaz se mutaliq aam ghaltiyon ka tazkara us tareeqay se kiya gaya hai ke parhne wala namaz ke bharpoor aur sahih tariqay se mutalliq mukammal ilm hasil kar sake.

Khandaani aur ijtemai masail ka hissa bhi is kitaab mein ahemiyat se ada kiya gaya hai. Nikah, talaq, mahram aur naamahram ke tawazoqat, walidain ke haqooq, aur aulaad ki tarbiyat ke bare mein Quran-o-Sunnah ki roshni mein mufassal hidayat di gayi hai. Muamlaat, pesha, aur rozi hal ki bayan mein bhi Islamic bankari aur sood se parhez ke ahkaam ko tafseeli tor par samjhaya gaya hai. Yeh kitaab ghar ki library ke liye ek laazmi maujooda hai jo har musalman ko apne din ki ghuzisht ke liye rahnumai farham kare gi.`,
    metaDescription: "Minhaj ul Muslim Urdu edition provides comprehensive guidance on Islamic creed, worship, family law, and daily conduct based on Quran and Sunnah in Urdu."
  },
  {
    slug: "minhaj-ul-muslim-local",
    description: `The local edition of Minhaj-ul-Muslim brings Abu Bakr Jabir Al-Jaza'iri's comprehensive Islamic reference work in a format tailored for readers seeking an accessible, budget-friendly version of this essential text. While maintaining the substance and scholarly rigor that has made Minhaj-ul-Muslim a trusted resource across the Muslim world, this edition presents the material in a practical, compact format suited for daily reference and study.

This book serves as a complete manual of Islamic life, organizing its vast subject matter into clearly defined sections that readers can navigate efficiently. The chapters on Islamic creed establish the foundational beliefs with scriptural evidence, while the sections on worship provide step-by-step guidance for performing the pillars of Islam correctly. The prayer section deserves particular mention for its systematic treatment of each stage of Salah, including the intentions, recitations, physical postures, and common mistakes that worshippers should avoid.

Beyond formal worship, the local edition covers the practical aspects of living as a Muslim in contemporary society. Matters of personal conduct, including etiquette for eating, sleeping, dressing, and interacting with others, are addressed with specific references to the Sunnah. The chapters on financial transactions help readers navigate modern economic life while adhering to Islamic principles regarding halal earnings, interest, and fair dealings.

The family section addresses the rights and responsibilities within the household, covering the parent-child relationship, the husband-wife dynamic, and the broader obligations toward relatives and neighbors. Each topic is supported by relevant Quranic verses and authenticated hadith, giving readers confidence that the guidance they receive is rooted in the primary sources of Islam. For new Muslims seeking a structured introduction to Islamic practice, for students of knowledge building their reference library, or for families wanting a single comprehensive guide, this local edition of Minhaj-ul-Muslim delivers essential Islamic knowledge in an approachable format.`,
    metaDescription: "Local edition of Minhaj-ul-Muslim offers comprehensive Islamic guidance on creed, worship, ethics, and family life in a compact reference format."
  },
  {
    slug: "miracles-and-merits-of-allahs-messenger",
    description: `The prophetic miracles of Muhammad (peace be upon him) represent one of the most compelling bodies of evidence supporting his claim to divine messengership. This book presents a systematic compilation of these miracles, drawing exclusively from authenticated sources to provide readers with a reliable and scholarly account of the extraordinary events that accompanied the Prophet's mission. The author has taken care to verify each reported miracle through the rigorous standards of hadith authentication, distinguishing between narrations of confirmed authenticity and those whose chains of transmission require qualification.

The book organizes the miracles into logical categories for structured reading and easy reference. Physical miracles—such as the splitting of the moon, the miraculous increase of food and water, and the healing of the sick—form one major category. Prophecies and foreknowledge of future events, where the Prophet accurately predicted outcomes that later materialized, form another. The inimitability of the Quran itself as an enduring linguistic and literary miracle receives dedicated treatment, with analysis of why the Quran's linguistic features have remained unchallenged since its revelation.

Beyond the dramatic miracles, the book also examines what scholars term the "miracles of character and conduct"—the Prophet's unparalleled ethical standards, his wisdom in resolving disputes, his treatment of allies and enemies alike, and his personal habits that demonstrated a life guided by divine instruction. These subtler miracles, while less spectacular, carry profound evidentiary weight because they were witnessed continuously over a period of twenty-three years by thousands of individuals.

The merits of the Prophet—his virtues, praiseworthy qualities, and the rights that Islam accords him—are discussed in separate chapters. The book addresses the proper Islamic manner of expressing love and respect for the Prophet while maintaining the boundaries established by the Quran and Sunnah. This balanced approach makes the book suitable for readers across a spectrum of Islamic orientations, providing factual, source-based content that educates without sensationalizing.`,
    metaDescription: "Compilation of authenticated prophetic miracles, categorized by type, with verified hadith sources and analysis of evidence for prophethood."
  },
  {
    slug: "miracles-of-the-messenger-pbuh",
    description: `The miraculous events surrounding the life of Prophet Muhammad (peace be upon him) have been documented by generations of Muslim scholars, each contributing to a rich corpus of literature that serves both as evidence of his prophethood and as a source of spiritual inspiration for believers. This book approaches the subject from a distinct analytical perspective, focusing not merely on cataloguing the miracles but on examining their significance, context, and the lessons they convey about the relationship between divine power and prophetic mission.

The author begins with a methodological introduction explaining the criteria used to select and authenticate the miracle accounts presented in the book. Unlike uncritical compilations that include every reported miracle regardless of source quality, this work applies strict hadith verification standards, clearly identifying the strength of each narration. This transparent approach allows readers to assess the evidence for themselves and distinguishes this book from less rigorous treatments of the same subject.

The miracles are presented in roughly chronological order, beginning with the events surrounding the Prophet's birth and early life, moving through the Makkan period of persecution and endurance, and culminating in the Madinan phase when the Muslim community was established and strengthened. This narrative structure helps readers understand each miracle within its historical context—why a particular miracle was granted at a particular moment and what message it conveyed to the Prophet's contemporaries.

Special attention is given to the Quran itself as the Prophet's most significant and enduring miracle. The linguistic, legislative, and scientific dimensions of Quranic inimitability are explored with reference to both classical and contemporary scholarship. The book also addresses philosophical questions about the nature of miracles, why they occur, and their role in the framework of divine guidance. For readers interested in Islamic apologetics, comparative religion, or simply deepening their appreciation of the Prophet's life, this work provides a thoughtful and well-researched treatment of one of Islam's most important topics.`,
    metaDescription: "Analytical study of Prophet Muhammad's miracles with hadith authentication, chronological arrangement, and examination of their significance."
  },
  {
    slug: "misali-khatoon",
    description: `The role of women in Islamic civilization has produced some of the most remarkable figures in religious, scholarly, and social history. Misali Khatoon, written in Urdu, presents the life stories and character profiles of exemplary Muslim women whose conduct, achievements, and devotion serve as enduring models for contemporary readers. The book moves beyond hagiography to present well-researched accounts that highlight the genuine contributions these women made to their families, communities, and the broader Muslim ummah.

The book opens with the Mothers of the Believers—the wives of Prophet Muhammad (peace be upon him)—whose lives provide the foundational template for Muslim womanhood. Each wife is introduced with her unique qualities and contributions: Khadijah's unwavering support during the earliest days of the prophetic mission, Aisha's scholarly legacy and her role in preserving and transmitting hadith, Umm Salamah's wisdom in counsel, and the distinct virtues of each of the other blessed wives. Their examples demonstrate that Muslim womanhood encompasses a wide range of strengths, talents, and roles.

Beyond the Prophet's household, the book profiles female companions who played significant roles in the early Muslim community. Women who participated in battles as nurses and combatants, women who engaged in commerce, women who memorized the Quran and taught it to others, and women who were sought out for their knowledge and judgment all feature in the narrative. These profiles challenge narrow assumptions about the scope of women's participation in early Islamic society.

The later sections of the book introduce readers to notable women from Islamic history across different eras and regions—scholars, mystics, rulers, and social reformers who left lasting legacies. The Urdu prose is accessible and engaging, making the historical material approachable for a general readership. For young women seeking role models who combine faith with accomplishment, for mothers looking for inspirational material to share with their daughters, and for anyone interested in the often-underappreciated history of women in Islam, Misali Khatoon provides a valuable and uplifting resource.`,
    metaDescription: "Urdu book profiling exemplary Muslim women from the Prophet's wives to scholars, mystics, and reformers, with well-researched historical accounts."
  }
];
async function main() {
  for (const item of updates) {
    await prisma.product.update({
      where: { slug: item.slug },
      data: { description: item.description, metaDescription: item.metaDescription }
    });
    console.log("Updated:", item.slug);
  }
  console.log("Done");
}
main().then(() => prisma.$disconnect());
