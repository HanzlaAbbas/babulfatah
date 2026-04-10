const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: "the-magnificence-of-the-quran",
    description: `The Magnificence of the Quran is a comprehensive study that examines the linguistic, structural, and spiritual grandeur of Islam's central scripture. Drawing upon classical tafsir scholarship and contemporary analytical approaches, this work systematically presents the inimitable qualities that distinguish the Quran from all other texts in human history. Each chapter addresses a distinct dimension of Quranic excellence, from the breathtaking eloquence of its Arabic prose to the profound coherence of its legal and ethical framework.

The author methodically catalogs the various categories of Quranic miracles, including scientific foreknowledge revealed centuries before modern discovery, precise historical narratives confirmed by archaeology, and mathematical patterns embedded within the text that continue to astonish researchers. The book also explores the Quran's preservation through oral and written transmission chains, demonstrating how a text revealed over twenty-three years to an unlettered prophet in seventh-century Arabia has been maintained with remarkable fidelity across more than fourteen centuries.

Beyond its miraculous attributes, this volume delves into the transformative impact the Quran has had on civilizations, legal systems, literature, and individual lives. Readers will find detailed discussions on how Quranic principles shaped the development of international law, human rights discourse, and scientific inquiry during Islam's golden age. The work further addresses common misconceptions and criticisms, providing well-reasoned responses grounded in scholarly tradition.

Designed for both general readers seeking a deeper appreciation of their faith and serious students of Islamic studies, The Magnificence of the Quran serves as an essential reference. Its clear organization, extensive referencing of primary sources, and accessible writing style make complex theological concepts understandable without sacrificing academic rigor. Whether used for personal study, classroom instruction, or as a gift for someone curious about Islam's foundational text, this book provides a thorough and compelling case for the Quran's unparalleled status as divine revelation.`,
    metaDescription: "A scholarly exploration of the Quran's linguistic miracles, scientific foreknowledge, and preservation across fourteen centuries of Islamic history."
  },
  {
    slug: "the-man-a-strange-creature-with-diverse-qualities",
    description: `The Man: A Strange Creature with Diverse Qualities presents a thought-provoking examination of human nature through the lens of Islamic theology and psychology. This work dissects the complex dualities that define the human condition — the capacity for supreme righteousness and devastating moral failure coexisting within a single being. Drawing extensively from Quranic verses, authentic hadith literature, and classical Islamic scholarship, the author constructs a multidimensional portrait of humanity that is both intellectually stimulating and spiritually enriching.

The book begins by establishing the Islamic framework for understanding human creation, exploring the unique status granted to Adam and his descendants as khalifah (vicegerents) on earth. It then moves through a systematic analysis of human strengths, including intellect, free will, emotional depth, and creative capacity, contrasting these with vulnerabilities such as arrogance, forgetfulness, desires, and susceptibility to external influence. Each quality is examined through specific Quranic passages and prophetic traditions, providing readers with a scripturally grounded understanding of themselves.

Particularly valuable are the chapters addressing the internal conflicts every person faces between their higher spiritual aspirations and lower worldly impulses. The author does not merely catalog these tensions but offers practical guidance derived from the Quran and Sunnah for achieving balance and self-mastery. Topics such as managing anger, cultivating gratitude, overcoming envy, and developing patience receive detailed treatment with actionable advice.

The work also explores how human diversity — in temperament, talent, culture, and experience — reflects divine wisdom and serves a purpose in the broader tapestry of creation. Readers gain insight into why people differ in their inclinations and how these differences can be understood as tests rather than flaws. Written in clear, engaging prose, this book appeals to anyone interested in understanding themselves better through the comprehensive worldview that Islam provides on the nature of the human being.`,
    metaDescription: "An Islamic perspective on human nature exploring the spiritual and psychological duality of mankind through Quran and prophetic traditions."
  },
  {
    slug: "the-many-shades-of-shirk",
    description: `The Many Shades of Shirk offers a detailed and nuanced exploration of associating partners with Allah, examining how this fundamental violation of tawhid can manifest in forms both obvious and subtle. Unlike introductory texts that focus solely on idol worship, this work digs deeply into the spectrum of shirk as understood by classical Islamic scholars, revealing how practices and beliefs that appear harmless or even virtuous to the untrained eye may carry serious theological implications.

The book is organized into clear categories, beginning with major shirk (shirk akbar) in its historical and contemporary manifestations. It covers idolatry, grave worship, seeking intercession from the dead, and attributing divine qualities to created beings. Each form is documented with evidence from the Quran and authentic hadith, accompanied by scholarly commentary from Ibn Taymiyyah, Ibn al-Qayyim, and other leading authorities on aqidah.

The more extensive sections address minor shirk (shirk asghar), which the Prophet Muhammad, peace be upon him, described as the thing he feared most for his ummah. These chapters examine riya (showing off in worship), swearing by other than Allah, wearing amulets and talismans for protection, and the danger of loving something or someone to a degree that rivals love for Allah. The author provides practical diagnostic tools to help readers identify these tendencies within themselves.

Additional chapters tackle the grey areas that Muslims frequently debate, such as the boundaries between permissible respect for righteous individuals and impermissible veneration, the use of intermediaries in supplication, and the distinction between tawassul through good deeds versus tawassul through the status of the deceased. Real-world examples make abstract theological concepts concrete and relatable. The Many Shades of Shirk serves as an essential resource for anyone serious about understanding and protecting the purity of their monotheistic faith, equipping readers with knowledge to distinguish between practices that honor Allah and those that compromise the foundation of Islamic belief.`,
    metaDescription: "A thorough examination of major and minor shirk in Islam, covering subtle forms of polytheism with Quranic evidence and scholarly commentary."
  },
  {
    slug: "the-merits-of-islam",
    description: `The Merits of Islam presents a well-organized compilation of the distinctive qualities, benefits, and superiorities of Islam as a complete way of life. Rather than engaging in comparative theology for polemical purposes, this work systematically highlights the genuine strengths and unique features that make Islam a compelling framework for individual spiritual growth, social harmony, and intellectual fulfillment.

The book opens with an exploration of Islam's core concept of tawhid — the absolute oneness of God — and demonstrates how this foundational principle provides clarity, purpose, and psychological stability that polytheistic or secular worldviews struggle to match. Subsequent chapters examine the comprehensive nature of Islamic teachings, showing how the religion addresses every aspect of human existence, from personal hygiene and dietary guidelines to governance, economics, and international relations.

Particularly illuminating sections detail Islam's contributions to human civilization, including its pioneering role in establishing rights for women, children, minorities, prisoners, and animals centuries before such concepts gained traction in other societies. The author documents how Quranic injunctions and prophetic practices laid the groundwork for principles now universally recognized, such as the presumption of innocence, the right to privacy, environmental stewardship, and the prohibition of cruel and unusual punishment.

The work also covers Islam's approach to knowledge and learning, documenting how the Quran's repeated emphasis on observation, reflection, and intellectual inquiry catalyzed an era of scientific achievement that profoundly influenced the European Renaissance. Chapters on the simplicity and rationality of Islamic worship, the balance between spiritual and worldly pursuits, and the religion's adaptability across diverse cultures provide readers with a rounded appreciation.

Written with academic precision and accessible language, The Merits of Islam avoids sectarian bias and instead focuses on universally accepted principles derived from the primary sources. It serves as an excellent resource for Muslims wishing to articulate the strengths of their faith and for non-Muslims seeking an honest, source-based understanding of what Islam genuinely offers to humanity.`,
    metaDescription: "A systematic presentation of Islam's unique qualities, from its concept of monotheism to its pioneering contributions to rights and civilization."
  },
  {
    slug: "the-ministers-around-the-prophet-pbuh",
    description: `The Ministers around the Prophet (PBUH) brings to life the remarkable group of close companions who formed the inner circle of counsel and support around the Messenger of Allah. These were not merely followers but trusted advisors, military strategists, judges, governors, and scholars who helped translate prophetic guidance into the functioning institutions of the first Islamic state. This book provides detailed biographical sketches of these key figures, examining how their individual strengths and personalities complemented the Prophet's mission.

Each companion profiled in this volume — including Abu Bakr as-Siddiq, Umar ibn al-Khattab, Uthman ibn Affan, Ali ibn Abi Talib, and several others who served as the Prophet's deputies — receives thorough treatment. The author traces their backgrounds in pre-Islamic Arabia, their paths to accepting Islam (often at great personal cost), and the specific roles they played during the critical years of the prophetic mission in Makkah and Madinah.

The book excels in illustrating the practical leadership model that the Prophet established by delegating responsibilities based on each companion's aptitude. Readers learn how Abu Bakr's gentle wisdom made him the ideal interpreter of dreams and arbitrator of disputes, while Umar's firm resolve suited him for maintaining order and justice. Ali's encyclopedic knowledge of Quranic revelation positioned him as the primary legal scholar, while others like Zayd ibn Thabit became experts in scripture compilation and Muadh ibn Jabal in Islamic jurisprudence.

Beyond individual profiles, the work examines how these ministers operated collectively — how they debated strategy before battles, resolved disagreements through consultation (shura), and maintained unity despite their diverse backgrounds and temperaments. The author draws lessons from their example for contemporary leadership, teamwork, and organizational management. Extensive sourcing from hadith collections, biographical works like Ibn Hisham's Sirah and Ibn Sa'd's Tabaqat, and classical Islamic histories ensures accuracy and depth throughout this engaging study of the Prophet's trusted inner circle.`,
    metaDescription: "Detailed biographical profiles of the Prophet Muhammad's closest advisors, exploring their unique roles in building the first Islamic state."
  },
  {
    slug: "the-miracles-the-incident-of-cleft-moon-part-1",
    description: `The Miracles: The Incident of the Cleft Moon (Part 1) is a dedicated study of one of the most visually dramatic miracles attributed to Prophet Muhammad, peace be upon him — the splitting of the moon. This first volume in a broader series on prophetic miracles approaches the event with scholarly rigor, analyzing it from multiple angles including Quranic exegesis, hadith authentication, historical documentation, astronomical perspectives, and comparative religion.

The book begins by establishing the Quranic basis for the miracle in Surah Al-Qamar (54:1-2), providing a thorough linguistic analysis of the relevant verses and their classical tafsir interpretations. Multiple chains of narration are examined to assess the strength and reliability of the hadith reports describing the event, with the author drawing upon the methodologies of hadith scholars to evaluate each source. Readers gain insight into how Islamic scholarship authenticates miraculous claims through rigorous criteria that have no parallel in other religious traditions.

A substantial portion of the work is devoted to historical documentation, citing not only Muslim sources but also references in contemporary and near-contemporary non-Muslim accounts that some scholars argue corroborate the event. The author presents various opinions from classical and modern scholars regarding the nature of the miracle — whether it was a literal splitting of the celestial body visible worldwide or a localized phenomenon witnessed by specific communities.

The volume also addresses common objections and skeptical arguments, including questions about why the event is not more widely documented in world histories, astronomical concerns about the consequences of splitting a celestial body, and philosophical challenges to the concept of miracles generally. Each objection receives a considered response grounded in Islamic epistemology and scientific reasoning. With its balanced approach, this work appeals to believers seeking to strengthen their conviction and intellectually curious readers who want to understand how Islamic scholarship handles one of its most extraordinary historical claims.`,
    metaDescription: "A scholarly analysis of the miracle of the splitting of the moon, examining Quranic sources, hadith chains, and historical documentation."
  },
  {
    slug: "the-most-beautiful-mihrab",
    description: `The Most Beautiful Mihrab is a visually stunning and historically rich exploration of the mihrab — the niche in a mosque wall that indicates the direction of prayer toward Makkah. This book combines architectural photography, art historical analysis, and cultural commentary to present the mihrab as one of the most significant and artistically evolved elements in Islamic sacred architecture.

Spanning fourteen centuries of Islamic civilization, the volume showcases mihrabs from across the Muslim world, from the earliest surviving examples in the Great Mosque of Damascus and the Mosque of Cordoba to contemporary masterworks in Malaysia, Turkey, and the Gulf states. Each featured mihrab is accompanied by detailed commentary on its design elements, materials, calligraphic inscriptions, geometric patterns, and the historical context of its creation.

The book traces the evolution of the mihrab from its origins as a simple marker of the qiblah direction to its development into an elaborate focal point of mosque decoration. Readers learn how different Islamic dynasties — Umayyads, Abbasids, Fatimids, Seljuks, Mamluks, Ottomans, Safavids, and Mughals — each contributed distinctive styles and innovations to mihrab design. The Umayyads favored flowing vegetal motifs in marble and glass mosaic, while the Mamluks perfected the art of carved stone with intricate geometric arabesques. Ottoman mihrabs often incorporated Iznik tiles in brilliant cobalt and turquoise, and Persian examples achieved extraordinary refinement in stucco and tile work.

Special attention is given to the calligraphic programs found in mihrabs, where Quranic verses related to prayer, light, and divine presence are rendered in scripts ranging from angular Kufic to flowing thuluth. The author explains how these inscriptions are not merely decorative but serve as visual reminders of the sacred purpose of the prayer space.

With hundreds of high-resolution photographs, architectural diagrams, and period illustrations, The Most Beautiful Mihrab serves as both a reference work for students of Islamic art and architecture and an appreciation of the spiritual symbolism encoded in one of Islam's most iconic architectural features.`,
    metaDescription: "A richly illustrated survey of mihrab architecture across Islamic history, spanning fourteen centuries of design evolution and artistic mastery."
  },
  {
    slug: "the-most-beautiful-minbars",
    description: `The Most Beautiful Minbars offers an extensive visual and historical survey of the minbar — the pulpit from which the Friday sermon (khutbah) is delivered in mosques throughout the Muslim world. This book documents how the minbar evolved from a simple three-step wooden platform in the Prophet's Mosque in Madinah into one of the most elaborately crafted and symbolically significant furnishings in Islamic architecture.

The volume features minbars from every major region and period of Islamic history, photographed with meticulous attention to detail. Beginning with the earliest surviving wooden minbars, including the renowned minbar of the Qarawiyyin Mosque in Fez and the masterwork in the Great Mosque of Kairouan, the book traces how craftsmanship traditions developed and spread across the Islamic world. Readers encounter stunning examples of woodcarving, marquetry, stone carving, metalwork, ceramic tile, and mother-of-pearl inlay, each representing the pinnacle of artisanal skill in its respective era and region.

Particularly captivating are the detailed close-up photographs revealing the intricate geometric patterns, arabesque flourishes, and calligraphic elements that adorn these pulpits. The author provides insightful commentary on the symbolic meanings embedded in minbar design — how the number of steps, the placement of inscriptions, and the choice of decorative motifs all carry theological and cultural significance.

The book examines regional variations in depth: the restrained elegance of Andalusian minbars with their interlocking geometric latticework, the monumental stone pulpits of Mamluk Egypt, the color-splashed tile-covered minbars of Ottoman mosques, and the ornately carved teak minbars of South and Southeast Asia. Contemporary examples demonstrating how modern architects and artisans are reinterpreting traditional forms for new mosque constructions are also included.

With comprehensive captions, a glossary of architectural terms, and an introductory essay on the religious significance of the minbar in Islamic worship, this book stands as an authoritative resource for architects, art historians, and anyone with an appreciation for the artistic heritage of Islamic civilization.`,
    metaDescription: "A comprehensive visual survey of Islamic minbar craftsmanship, featuring examples from Andalusia to Southeast Asia across fourteen centuries."
  },
  {
    slug: "the-most-honorable-women",
    description: `The Most Honorable Women is a carefully researched collection of biographical accounts celebrating the women who hold the highest status in Islamic history. Central to this work are detailed portrayals of the wives of Prophet Muhammad, peace be upon him, each of whom is presented with her distinct personality, contributions, and enduring legacy. Rather than treating these remarkable women as a monolithic group, the author gives each figure individual attention that reveals the diversity of character, talent, and circumstance among those the Quran describes as "mothers of the believers."

Khadijah bint Khuwaylid's chapter highlights her role as the first believer, her unwavering support during the most difficult early years of the prophetic mission, and her exceptional qualities as a successful businesswoman in a male-dominated society. Aisha bint Abi Bakr's profile covers her vast knowledge of hadith, jurisprudence, and Quranic interpretation, her role as a political figure, and her contributions to Islamic scholarship that continue to influence the ummah today. Other wives receive equally thorough treatment, with each biography drawing upon authentic sources from classical Islamic literature.

Beyond the Prophet's household, the book extends its scope to include other women of exceptional honor in Islam: Maryam (Mary), the mother of Isa (Jesus), who is held up in the Quran as an example for all believers; Asiyah, the wife of Pharaoh, who demonstrated faith under persecution; Fatimah az-Zahra, the Prophet's daughter, known for her piety and generosity; and Khawla bint al-Azwar, the warrior-poet who fought alongside Muslim armies.

The author also addresses the role of women scholars in Islamic history, documenting how female teachers, jurists, and hadith narrators played active and influential roles throughout the centuries. The Most Honorable Women corrects common misconceptions about women's status in Islam by presenting authentic, source-based accounts that demonstrate the religion's genuine respect for female dignity, intellect, and contribution to society.`,
    metaDescription: "Biographical portraits of Islam's most honored women, including the Prophet's wives, Maryam, and female scholars across Islamic history."
  },
  {
    slug: "the-muslim-creed-expounded-pocket-size",
    description: `The Muslim Creed Expounded (Pocket Size) is a compact yet comprehensive reference guide to the fundamental beliefs of Islam as understood through the lens of Ahl al-Sunnah wal-Jama'ah. Despite its small physical dimensions, this book delivers a thorough treatment of the six articles of faith — belief in Allah, His angels, His revealed books, His messengers, the Day of Judgment, and divine decree (qadar) — with clarity and scholarly precision that makes complex theological concepts accessible to readers at all levels.

The book is structured around a classical text of aqidah that has been taught in Islamic seminaries for generations, presented here with a contemporary English translation and explanatory notes. Each point of doctrine is supported by evidence from the Quran and authentic hadith, with cross-references to major works of creed by scholars such as Imam al-Tahawi, Ibn Taymiyyah, and Muhammad ibn Abdul Wahhab. The author addresses common misunderstandings and contemporary deviations from orthodox Islamic belief, providing readers with the knowledge to distinguish between sound creed and error.

Particularly useful are the sections on the attributes of Allah, which explain the balanced Sunni approach of affirming divine attributes mentioned in the Quran and Sunnah without likening them to created things (tashbih) or stripping them of meaning (ta'thil). The treatment of qadar (divine predestination) is similarly balanced, explaining how human free will operates within the framework of Allah's complete knowledge and absolute decree.

Additional chapters cover topics essential for a complete understanding of Muslim creed, including the status of the Companions, the nature of intercession, the conditions for valid faith, and the ruling on those who abandon prayer. The pocket-size format makes this an ideal companion for daily carrying, allowing readers to review foundational beliefs during commutes, breaks, or travel. Students of Islamic studies will find it a quick reference for key doctrinal points, while new Muslims and those seeking to strengthen their understanding of core beliefs will appreciate its straightforward, evidence-based approach.`,
    metaDescription: "A pocket-sized guide to Islamic creed covering the six articles of faith with Quranic evidence and scholarly commentary on core beliefs."
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
