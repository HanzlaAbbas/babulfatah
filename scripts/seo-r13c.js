const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: "the-precious-pearls",
    description: `The Precious Pearls is an anthology of carefully selected hadith and narrations that the compiler describes as the most valuable gems of prophetic wisdom. Each selection in this collection addresses a fundamental aspect of a Muslim's daily life, providing concise yet profound guidance on matters ranging from personal character development and family relations to worship, ethics, and social responsibility. The title reflects the compiler's intention to gather only the most essential and beneficial narrations, treating each hadith as a precious pearl worthy of careful preservation and contemplation.

The book is organized thematically rather than chronologically, allowing readers to locate guidance on specific life situations quickly. Chapters cover topics such as sincerity of intention, patience through adversity, the rights of parents, the treatment of spouses, the ethics of earning and spending, the importance of seeking knowledge, the dangers of the tongue, the virtue of humility, and the necessity of maintaining good character even in difficult circumstances. Each hadith is presented with its full chain of narration (isnad) and a reference to the primary hadith collection from which it is drawn, including Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasa'i, and Sunan Ibn Majah.

What distinguishes this collection from general hadith compilations is the compiler's focus on practicality. Rather than gathering hadith for their scholarly rarity or legal complexity, The Precious Pearls selects narrations that an ordinary Muslim can immediately apply to improve their daily conduct and spiritual state. Brief explanatory comments follow each hadith, elucidating the context of the narration, defining key Arabic terms, and suggesting how the prophetic teaching can be implemented in contemporary life.

The book serves multiple audiences effectively. New Muslims find in it a manageable introduction to prophetic guidance without being overwhelmed by the vastness of hadith literature. Seasoned Muslims use it as a daily reminder and spiritual tonic, reading a few selections each morning or evening to set their intentions for the day. Teachers and khateebs draw upon it for sermon material and classroom discussions. The compact format and clear organization make The Precious Pearls a perennially useful addition to any Islamic library, offering distilled wisdom that rewards repeated reading and contemplation.`,
    metaDescription: "A curated anthology of essential prophetic hadith organized by theme, offering practical wisdom for daily Muslim life and character."
  },
  {
    slug: "the-principles-of-leadership",
    description: `The Principles of Leadership presents a systematic study of leadership theory and practice as derived from the Quran, the Sunnah of Prophet Muhammad, and the exemplary conduct of his companions and the righteous caliphs who succeeded him. This work bridges the gap between timeless Islamic principles and the modern demand for effective leadership, offering a framework that is both spiritually grounded and practically applicable across organizational, community, and personal contexts.

The book begins by establishing the Islamic concept of leadership as a sacred trust (amanah) rather than a position of privilege. Drawing upon Quranic verses and prophetic hadith, the author demonstrates how Islam defines leadership as a responsibility to serve those being led, a theme illustrated dramatically by the Prophet's statement that a leader is truly a servant. This foundational principle pervades every subsequent chapter, shaping the discussion of specific leadership competencies.

The work covers essential leadership qualities in dedicated chapters: integrity and accountability, justice and fairness, consultation (shura) and participatory decision-making, strategic thinking and planning, courage and resolve in difficult circumstances, compassion and empathy for those under one's authority, and the humility to accept feedback and acknowledge mistakes. Each quality is demonstrated through specific historical examples from the Prophet's leadership in Madinah, Abu Bakr's calm stewardship during the crisis of the apostasy wars, Umar's innovative administrative reforms, and the management challenges faced by subsequent leaders.

Practical applications receive substantial attention. The author translates classical Islamic leadership principles into contemporary frameworks that resonate with modern management theory, drawing parallels between the Prophet's methods of team building, conflict resolution, and delegation and concepts recognized in today's organizational psychology literature. Case studies from Islamic history are presented alongside discussion questions that prompt readers to analyze how these principles apply to their own leadership situations — whether managing a business team, leading a community organization, heading a household, or guiding students in a classroom.

The Principles of Leadership is valuable for Muslim professionals, community leaders, and anyone who seeks an alternative to secular leadership models by grounding their approach in the rich tradition of prophetic guidance and righteous example.`,
    metaDescription: "An Islamic framework for leadership drawn from Quran, Sunnah, and the caliphs, bridging timeless principles with modern organizational practice."
  },
  {
    slug: "the-prophet-pbuh-receives-the-first-revelation",
    description: `The Prophet (PBUH) Receives the First Revelation is a focused historical study of the most pivotal event in Islamic history — the moment when the Angel Jibreel appeared to Muhammad in the Cave of Hira and delivered the first five verses of Surah Al-Alaq. This book gathers every relevant narration, scholarly analysis, and contextual detail into a single volume that allows readers to understand this transformative event with the depth it deserves.

The work begins by reconstructing the historical setting: the spiritual environment of pre-Islamic Arabia where the concept of one God had not been entirely lost among the Hanifs, the Prophet's practice of retreating to the Cave of Hira for meditation and contemplation, and the psychological and spiritual preparation that forty years of life had provided. The author examines the Prophet's character traits that made him the ideal recipient of revelation — his truthfulness, contemplative nature, detachment from the moral corruption of his society, and innate inclination toward monotheism.

The event itself receives meticulous treatment. Every known narration describing the encounter is presented with its chain of transmission and an assessment of its authenticity. The author reconciles apparent differences between various accounts, explaining how minor variations in details (such as whether the Prophet was sitting or standing, whether Jibreel embraced him once, twice, or three times) reflect the natural diversity of eyewitness testimony rather than contradictions. The physical and emotional experience of the Prophet — the trembling, the rush home to Khadijah, her comforting response — is narrated with sensitivity and source documentation.

Subsequent chapters examine the immediate aftermath: Khadijah's role in reassuring the Prophet and taking him to Waraqa ibn Nawfal, the brief pause in revelation (fatra) and its psychological impact on the Prophet, and the resumption of revelation with the opening verses of Surah Al-Muddaththir. The author discusses why the first revelation addressed the theme of knowledge and reading, what this tells us about Islam's attitude toward learning, and how the initial experience of revelation shaped the Prophet's approach to his mission.

A concluding section addresses common questions raised by both Muslim and non-Muslim readers about the nature of revelation, the process by which the Quran was transmitted from Jibreel to Muhammad to the written and oral record, and the significance of this event for understanding the Quran as divine communication. Throughout, the author maintains a balance between academic rigor and narrative engagement.`,
    metaDescription: "A detailed historical study of the first Quranic revelation to Prophet Muhammad in the Cave of Hira, with analysis of every known narration."
  },
  {
    slug: "the-quran-and-modern-science",
    description: `The Quran and Modern Science presents a systematic examination of Quranic verses that reference natural phenomena and compares them with established findings from contemporary scientific disciplines. This work approaches the topic with methodological care, distinguishing between areas where genuine convergence exists between Quranic description and scientific discovery and avoiding the overreach that has characterized some popular works in this genre.

The book is organized by scientific discipline, with dedicated chapters covering cosmology and the origins of the universe, astronomy and the structure of celestial bodies, geology and the formation of the earth, biology and embryonic development, hydrology and the water cycle, meteorology and atmospheric phenomena, and the natural sciences more broadly. For each topic, the relevant Quranic verses are presented in Arabic with translation, followed by an analysis of the classical tafsir understanding and a comparison with modern scientific knowledge.

Particularly compelling sections include the Quranic description of embryonic development in Surah Al-Mu'minun, which outlines stages of fetal growth in remarkable correspondence with modern embryological findings. The author provides a historical survey showing that these details were unknown to seventh-century medicine, lending weight to the argument that the Quran's scientific content constitutes evidence of its divine origin. Similarly, the Quranic references to the expanding universe, the barrier between seas, and the role of mountains as stabilizers receive thorough treatment with current scientific data.

The author is careful to note important methodological distinctions: the Quran is not a science textbook, and its primary purpose is guidance rather than scientific instruction. Where Quranic descriptions are general or allegorical, the book avoids forcing precise scientific interpretations. Where genuine convergence exists, it is presented as an intriguing indicator of the Quran's divine origin rather than conclusive proof that would replace faith with scientific validation.

This balanced approach makes the book valuable for Muslim students and professionals in scientific fields who wish to understand how their faith relates to their discipline. It also serves as a thoughtful resource for dialogue with people of other faiths or no faith who are interested in the relationship between religion and science. Extensive references to both Islamic scholarship and peer-reviewed scientific literature ensure that the work maintains credibility in both domains.`,
    metaDescription: "A balanced examination of Quranic verses and modern scientific findings across cosmology, biology, embryology, and natural sciences."
  },
  {
    slug: "the-quran-the-divine-revelation",
    description: `The Quran: The Divine Revelation is a comprehensive study that establishes the Quran's status as the final, uncorrupted revelation from Allah to humanity. This work systematically builds the case for the Quran's divine origin by examining its preservation, linguistic inimitability, internal consistency, prophetic foretelling, transformative impact, and the inability of any human or jinn to produce anything comparable to it despite repeated challenges over fourteen centuries.

The book begins with the concept of revelation itself, explaining what Muslims believe about how Allah communicates with humanity through prophets and why the Quran represents the final installment in this chain of divine communication. The author compares the Islamic concept of revelation with how other religious traditions understand their scriptures, highlighting the distinctive claim that the Quran has been preserved verbatim — not merely in content but in the exact words — since the moment of its revelation.

A major section addresses the methodology of Quranic preservation. The author traces the dual system of oral memorization and written recording that ensured the text's integrity from the time of the Prophet through the standardization under Abu Bakr and Uthman to the present day. The science of Quranic memorization (hifz) — with millions of memorizers living today who have independently verified the text — is presented as evidence of preservation unparalleled by any other book in human history.

The linguistic miracle (i'jaz) of the Quran receives extensive treatment. The author demonstrates how the Quran's Arabic — its vocabulary, syntax, rhetoric, and stylistic coherence — challenged the most accomplished poets of pre-Islamic Arabia and has continued to defy imitation by the most skilled Arabic linguists in every subsequent generation. Specific examples of Quranic rhetorical devices are analyzed to illustrate the inimitable qualities that led even early Arab critics of Islam to acknowledge the text's supernatural eloquence.

Additional chapters address the Quran's freedom from historical anachronism, its internal consistency despite being revealed piecemeal over twenty-three years, its accurate prophecies, and the absence of contradictions that characterize human-authored texts composed over extended periods. The author also responds to common criticisms and misconceptions with scholarly rigor. The Quran: The Divine Revelation serves as a thorough reference for anyone seeking to understand the intellectual foundations of the Muslim belief in the Quran as the literal word of Allah.`,
    metaDescription: "A scholarly defense of the Quran's divine origin examining its preservation, linguistic miracle, consistency, and prophetic foretelling."
  },
  {
    slug: "the-religion-of-truth",
    description: `The Religion of Truth presents Islam as the final and complete religion of truth as understood through its own primary sources — the Quran and authentic prophetic traditions. This work avoids polemical comparisons with other faiths and instead focuses on building a comprehensive, internally coherent portrait of Islam as a self-sufficient system of belief, practice, and worldview that satisfies human needs at every level.

The book is structured around the concept of truth (haqq) as it appears throughout the Quran and Islamic theology. The author explains how Islam defines truth not merely as propositional accuracy but as a comprehensive alignment with the reality that Allah created — a reality that encompasses the physical universe, human nature, moral law, and the purpose of existence. From this framework, the book demonstrates how Islamic teachings on every subject — from the nature of God and the purpose of life to dietary laws, financial regulations, and interpersonal ethics — flow logically from a single, unified understanding of truth.

Individual chapters systematically cover the major domains that a complete religion must address: the nature of the Creator and His relationship with creation, the human being's purpose and potential, the role of prophets and revealed scriptures, the framework of moral and ethical behavior, the principles of just governance, economic justice and the prohibition of exploitation, family structure and gender relations, and the ultimate destiny of the human soul. Each topic is addressed with extensive reference to Quranic verses and authenticated hadith, supported by the commentary of classical scholars.

The work pays particular attention to how Islam's conception of truth resolves tensions and paradoxes that other worldviews struggle with — the relationship between science and faith, the problem of evil and suffering, the balance between individual rights and community welfare, and the reconciliation of divine sovereignty with human responsibility. The author argues that Islam provides coherent answers to the fundamental questions that philosophy has debated for millennia without resolution.

Written in clear, reasoned prose, The Religion of Truth is suitable for Muslims seeking a deeper understanding of their faith's comprehensive nature and for intellectually curious non-Muslims who want an honest, source-based presentation of what Islam actually teaches rather than media caricatures. The book's systematic approach makes it useful as a reference for apologetics, interfaith dialogue, and personal study.`,
    metaDescription: "A comprehensive presentation of Islam as the religion of truth, addressing theology, ethics, governance, and life's fundamental questions."
  },
  {
    slug: "the-revelation",
    description: `The Revelation is a focused, in-depth study of the process by which Allah communicated the Quran to Prophet Muhammad through the Angel Jibreel. This book examines the mechanics, experience, and implications of divine revelation (wahy) as understood in Islamic theology, drawing upon Quranic descriptions, authentic hadith narrations, and classical scholarly analysis to construct a thorough understanding of this foundational concept.

The book opens by establishing the Islamic definition of wahy — the direct communication from Allah to His chosen prophets — and distinguishes between different categories of revelation. The author explains the various forms that wahy took in relation to the Prophet, including true dreams, inspiration cast into the heart, communication through the Angel Jibreel (the primary mode of Quranic revelation), and the direct speech of Allah experienced during the Night Journey and Ascension (Isra and Mi'raj). Each form is documented with specific narrations and analyzed for its theological implications.

A substantial portion of the work describes the Prophet's physical and psychological experience during the process of receiving revelation. Multiple authentic narrations describe how the Prophet would experience intense pressure, perspiration (even on cold days), heaviness, and a change in demeanor when Jibreel delivered Quranic verses. The author explains the significance of these physical manifestations, addressing why revelation was an embodied experience rather than a purely spiritual one, and what this tells us about the relationship between the physical and spiritual realms in Islamic cosmology.

The book also covers the chronological sequence of revelation — how the Quran was delivered piecemeal over twenty-three years in response to specific circumstances, questions, events, and the needs of the growing Muslim community. The wisdom behind gradual revelation is explored in depth, including how it allowed for the gradual transformation of Arabian society, the building of the Prophet's confidence and the community's capacity, and the memorization and documentation of each verse as it arrived.

Additional topics include the role of the Angel Jibreel as the intermediary of revelation, his appearances in human form, the annual review of the Quran that Jibreel conducted with the Prophet, and the final dual review in the year of the Prophet's passing. The Revelation provides a thorough understanding of how the Quran moved from divine speech to the preserved text Muslims hold today.`,
    metaDescription: "A theological study of Quranic revelation examining the modes, physical experience, and chronological process of wahy to Prophet Muhammad."
  },
  {
    slug: "the-right-way",
    description: `The Right Way is a practical guide to living according to Islamic principles in contemporary society. Written as a roadmap for Muslims navigating the complexities of modern life while remaining faithful to the teachings of the Quran and Sunnah, this book addresses the everyday situations where religious guidance is most needed and most frequently sought.

The book is organized around the major domains of a Muslim's daily experience. Chapters on personal worship cover the five daily prayers, their proper performance, the common mistakes that invalidate or diminish their reward, and strategies for maintaining concentration and spiritual presence during salah. Fasting, charity, and the pilgrimage receive similarly practical treatment, with the author anticipating the questions that arise in real-life application rather than merely restating theoretical rulings.

Substantial sections address the social dimensions of Islamic life: family relations, including the rights and responsibilities of husbands and wives, the proper upbringing of children, and maintaining ties of kinship. Workplace ethics receive detailed coverage, including honesty in business dealings, the Islamic prohibition of interest (riba) and its modern manifestations, appropriate behavior toward colleagues of both genders, and the balance between professional ambition and contentment with Allah's provision.

The author also tackles contemporary challenges that many Muslims face: navigating social media use within Islamic boundaries, dealing with cultural practices that conflict with religious teachings, maintaining Islamic identity in non-Muslim environments, responding to misunderstandings about Islam, and managing personal struggles with doubt, sin, and spiritual stagnation. Each topic is addressed with empathy, avoiding harshness while maintaining clarity about what Islamic guidance requires.

Throughout the book, the author emphasizes that Islam is not merely a set of prohibitions but a comprehensive framework designed to lead human beings to fulfillment, peace, and ultimate success. The "right way" is presented not as a narrow, restrictive path but as the balanced middle course (wasatiyyah) that avoids the extremes of permissiveness on one side and rigid legalism on the other. The Right Way serves as a practical reference that Muslims can consult whenever they face situations requiring Islamic guidance, making it a valuable addition to the home library.`,
    metaDescription: "A practical Islamic guide for contemporary life covering worship, family, workplace ethics, and navigating modern challenges with faith."
  },
  {
    slug: "the-rights-and-duties-of-women-in-islam",
    description: `The Rights and Duties of Women in Islam provides a comprehensive, source-based examination of the position of women in Islamic law and society. This work addresses one of the most discussed and often misrepresented aspects of Islamic teaching by returning directly to the primary texts — the Quran, authentic hadith, and the established rulings of classical Islamic jurisprudence — to present an accurate picture that is neither apologetic nor defensive.

The book is divided into two balanced sections. The first section covers the rights that Islam guarantees to women: the right to life and dignity, the right to education and intellectual development, the right to own and manage property independently, the right to choose a spouse and the conditions of a valid marriage contract, the right to mahr (bridal gift), the right to financial support from husband or male guardian, the right to inheritance, the right to initiate divorce under specific conditions, the right to retain custody of children, the right to participate in public life, and the right to be treated with kindness and respect. Each right is documented with its Quranic or hadith basis and explained in the context of seventh-century Arabian society where many of these rights represented revolutionary improvements over prevailing norms.

The second section addresses the duties and responsibilities that Islam assigns to women: the duty to worship Allah and fulfill religious obligations, the duty of modesty in dress and behavior, the duty to obey the husband within the bounds of Islamic law, the duty to raise children with Islamic values, the duty to maintain family harmony, and the duty to contribute to the community according to her ability and circumstances. The author carefully distinguishes between cultural practices that have been wrongly attributed to Islam and the genuine teachings derived from authentic sources.

Particularly valuable chapters address the common areas of confusion: polygamy and its strict conditions, the hijab and its rationale, women's testimony in legal proceedings, female leadership in prayer and politics, and the concept of male guardianship (wilayah). The author presents the range of scholarly opinions on contested issues, allowing readers to understand the breadth of Islamic jurisprudential thought rather than a single sectarian position.

This book serves as an essential reference for Muslim women seeking to understand their faith-given rights, for Muslim men who want to fulfill their responsibilities toward the women in their lives, for students of Islamic studies, and for anyone engaged in honest dialogue about women's status in religious traditions.`,
    metaDescription: "A source-based study of women's rights and duties in Islam, documenting Quranic foundations and distinguishing religion from cultural practice."
  },
  {
    slug: "the-role-of-mosque-in-islam",
    description: `The Role of Mosque in Islam examines the mosque (masjid) as the central institution of Muslim community life, tracing its evolution from the simple structure that the Prophet Muhammad built in Madinah to the diverse architectural and functional forms it takes across the contemporary Muslim world. This book demonstrates that the mosque in Islam is far more than a building for congregational prayer — it is a multifunctional community center that historically served as a school, court, hospital, hostel, and political assembly point.

The book begins with the establishment of the Prophet's Mosque in Madinah, analyzing every aspect of its design and function as a model for subsequent mosque construction. Readers learn that the Prophet's mosque accommodated not only the five daily prayers and Friday congregation but also served as a classroom where the Companions learned the Quran and Islamic jurisprudence, a shelter for the poor and homeless (Ahl al-Suffah), a reception area for visiting delegations, a hospital where the wounded received treatment, and a court where disputes were adjudicated. This multifunctional model established the template for what a mosque should be in Muslim community life.

Subsequent chapters trace how the mosque evolved across different Islamic civilizations. The book examines the great mosques of Damascus, Baghdad, Cairo, Cordoba, Istanbul, Isfahan, and Samarkand, analyzing how each reflected the priorities and circumstances of its community while maintaining the core functions established in Madinah. The development of specialized institutions — separate madrasas for education, bimaristans for healthcare, and dar al-adl for justice — did not diminish the mosque's central role but rather complemented it.

The contemporary section addresses how mosques function in modern Muslim communities, the challenges they face in Western contexts, and the tension between their traditional multifunctional role and modern tendencies to reduce the mosque to a prayer-only facility. The author argues for reclaiming the mosque's comprehensive role as a center for education, social services, conflict resolution, and community bonding.

Practical guidance is provided for mosque administrators, imams, and community members on how to develop mosque programs that serve the full spectrum of community needs. The book also addresses the etiquette of mosque attendance, the spiritual significance of praying in congregation, and the rewards associated with building and maintaining mosques as outlined in authentic hadith.`,
    metaDescription: "A historical and practical study of the mosque's multifunctional role in Islam, from the Prophet's Mosque to contemporary Muslim communities."
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
