const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: "the-story-of-muhammad-saw-in-madinah-art-paper",
    description: `The Story of Muhammad (SAW) in Madinah in art paper edition chronicles the pivotal Madinan period of the Prophet's life — the decade that transformed Islam from a persecuted minority movement into a thriving civilization. Printed on premium art paper with enhanced color reproduction, this volume brings the events of this foundational period to visual life through detailed illustrations and a vivid narrative drawn from authentic Islamic sources.

The book opens with the Prophet's migration (hijrah) from Makkah to Madinah, one of the most significant turning points in human history. The author narrates the dangerous journey, the pursuit by the Quraysh, the stay in the Cave of Thawr, and the warm reception that the Aws and Khazraj tribes of Madinah extended to their new guests. The establishment of the first Islamic community in Madinah — including the building of the Prophet's Mosque, the brotherhood between the Ansar and Muhajirun, and the drafting of the Constitution of Madinah — receives thorough coverage.

The military challenges that defined the Madinan period are narrated with both strategic detail and spiritual context. The Battle of Badr, where a small, poorly equipped Muslim force defeated a vastly superior Makkan army, is presented as a lesson in trust in Allah. The setback at Uhud, where discipline broke down and Muslims nearly lost, teaches the consequences of disobeying the Prophet's instructions. The Battle of the Trench (Al-Khandaq), where Salman al-Farisi's suggestion of digging a defensive trench saved the community from annihilation, demonstrates the value of counsel and wisdom.

Beyond military events, the book covers the social and legal developments of the Madinan period: the establishment of the Islamic calendar, the treaties with Jewish tribes, the system of zakat and welfare, the educational programs in the Prophet's Mosque, the sending of letters to neighboring empires inviting them to Islam, and the gradual purification of Arabian society from idolatry, blood feuds, and moral corruption.

The art paper format elevates the visual presentation significantly. Illustrations of the Madinan landscape, the Prophet's Mosque, battle scenes, and key moments from the narrative are rendered with vivid color and fine detail that standard paper cannot support. This edition is particularly valued as a gift item and as a classroom resource where visual quality enhances student engagement with the material. Families use it during Ramadan and throughout the year as a tool for teaching children about the Prophet's life in a format that combines scholarly accuracy with artistic beauty.`,
    metaDescription: "The Prophet's Madinan period on premium art paper, covering hijrah, battles, and community building with vivid Quranic illustrations."
  },
  {
    slug: "the-story-of-muhammad-saw-in-makkah-art-paper",
    description: `The Story of Muhammad (SAW) in Makkah in art paper edition focuses on the first thirteen years of the prophetic mission — the Makkan period that laid the spiritual and organizational foundation for everything that followed. This premium art paper edition presents the extraordinary story of how one man, armed only with the truth of divine revelation, challenged an entire society's corrupt value system and emerged victorious despite facing persecution, boycott, assassination attempts, and the death of his closest supporters.

The book begins by reconstructing the social landscape of pre-Islamic Makkah — the tribal structure, the economic system built around the Ka'bah pilgrimage, the moral degradation that had taken root in Arabian society, and the lingering traces of Ibrahim's monotheism that survived among a few individuals known as Hunafa. Within this context, the Prophet's forty years of life before his mission are summarized, establishing the reputation for honesty and integrity (Al-Amin) that gave him the credibility to deliver a message that would upend the established order.

The first revelation in the Cave of Hira receives detailed narration, followed by the gradual unfolding of the prophetic mission: the secret preaching to family and close friends, the public declaration from Mount Safa, the fierce opposition of the Quraysh, the persecution of weaker Muslims including the torture of Bilal and Yasir's family, and the migration of Muslims to Abyssinia seeking refuge. Each event is told with its Quranic basis and supporting hadith evidence.

The dramatic events of the later Makkan period receive full treatment: the conversion of Hamzah and Umar that shifted the balance of power, the boycott of Banu Hashim that confined the Prophet's clan to a valley for three years, the Year of Sorrow that took Khadijah and Abu Talib, the journey to Ta'if where the Prophet was rejected and stoned, and the Night Journey and Ascension (Isra and Mi'raj) that provided spiritual sustenance during the darkest period of the mission.

The book culminates with the pledges of Al-Aqabah where the people of Madinah accepted Islam and invited the Prophet to migrate — setting the stage for the transformative events of the Madinan period. Throughout, the premium art paper supports illustrations that capture the drama and emotion of these events with exceptional color quality. This edition serves as both an educational resource and a beautiful gift that honors the Prophet's struggle in Makkah with the production quality it deserves.`,
    metaDescription: "The Prophet's Makkah period on art paper, covering first revelation, persecution, and the Year of Sorrow with vivid, detailed illustrations."
  },
  {
    slug: "the-story-of-the-prophet-dawud-and-sulyman",
    description: `The Story of the Prophet Dawud and Sulayman presents the intertwined narratives of two prophets who hold an extraordinary place in Islamic tradition — a father and son who were both divinely appointed as kings, both granted prophethood, and both gifted with remarkable abilities that distinguished them among Allah's messengers. This book draws upon Quranic accounts and authentic hadith to reconstruct their lives, ministries, and legacies with accuracy and narrative engagement.

The section on Dawud (David) begins with his youth as a shepherd who slew the giant Jalut (Goliath) with a single stone, an event that demonstrated how faith and trust in Allah can overcome seemingly impossible odds. The book traces Dawud's rise from a young warrior to the king of the Children of Israel, his receipt of the Zabur (Psalms) as divine scripture, and his legendary voice that moved mountains and birds to join him in praising Allah. The Quranic account of the two disputants who climbed over the wall to seek Dawud's judgment is narrated as a lesson in the importance of hearing both sides before reaching a verdict.

Dawud's craftsmanship in making chainmail armor is highlighted as an example of how prophets were also practical men who contributed to human civilization through tangible skills. The book explains how Allah granted Dawud the understanding of iron — a reference to metallurgical knowledge that advanced his society's military and economic capabilities.

The Sulayman (Solomon) section covers his reign as one of the most powerful and wealthy prophets in history. The Quran describes Sulayman's control over jinn, his ability to communicate with birds and animals, his command over the wind, and his vast kingdom that extended across the known world. The story of the Queen of Sheba (Bilqis) is narrated in detail, including the hoopoe's report, Sulayman's letter, the queen's visit, and her eventual submission to Allah — a story that illustrates the power of wisdom and diplomacy over military force.

Sulayman's construction of the magnificent temple in Jerusalem, his extraordinary throne, and his unparalleled wisdom in adjudicating disputes (including the famous case of the disputed child between two women) receive dedicated treatment. The book emphasizes that despite all the power and wealth granted to Sulayman, he remained a faithful servant of Allah whose greatest concern was gratitude and righteousness rather than worldly splendor. His final prayer, recorded in the Quran, expresses this priority with eloquence that the book highlights as a model for all who hold positions of power and authority.`,
    metaDescription: "The intertwined stories of Prophets Dawud and Sulayman — kings, warriors, and recipients of divine wisdom — told through Quranic narrative."
  },
  {
    slug: "the-story-of-the-prophet-ibrahim",
    description: `The Story of the Prophet Ibrahim offers a detailed narrative account of the life of Ibrahim (Abraham), whom the Quran identifies as a hanif (upright monotheist) and khalil (friend) of Allah. This book presents Ibrahim's story as told in the Quran and authenticated prophetic traditions, carefully distinguishing the Islamic account from versions found in other religious texts that include elements not confirmed by Islamic sources.

The narrative begins with Ibrahim's youth in the ancient city of Ur (identified in Islamic tradition as part of Babylon), where his father Azar was a craftsman who carved idols for the community. The young Ibrahim's intellectual and spiritual journey toward monotheism is narrated step by step: his observation of a star, the moon, and the sun as potential objects of worship, and his ultimate rejection of each as created and temporary, leading him to the conviction that only the Creator of all things deserves worship. This rational approach to faith is emphasized throughout the book as a model for intellectual engagement with theological questions.

The dramatic confrontation between Ibrahim and his community forms a central section. Ibrahim's systematic destruction of the idols in the temple, his placement of the axe in the hands of the largest idol, and his witty challenge to the community to ask the surviving idol who committed the destruction demonstrate both his courage and his intellectual brilliance. The community's response — throwing him into a massive fire — and Allah's command to the fire to become "cool and safe" for Ibrahim is narrated as one of the most dramatic miracles in prophetic history.

Ibrahim's subsequent journey from Mesopotamia takes him through Palestine, Egypt, and ultimately to the barren valley of Makkah, where he leaves his wife Hajar and infant son Isma'il in obedience to Allah's command. The story of the Zamzam well, the building of the Ka'bah, and the establishment of the Hajj rites are covered in thorough detail. The book culminates with the narrative of the sacrifice — Allah's command to sacrifice Isma'il, the father and son's equal submission, and the divine substitution of a ram — connecting this event to the institution of Eid al-Adha.

Throughout the book, Ibrahim is presented as the archetypal monotheist whose faith, patience, and willingness to sacrifice everything for Allah's pleasure established a model that the Prophet Muhammad was later instructed to follow. The author draws connections between Ibrahim's story and key Islamic practices — the five daily prayers, the Hajj pilgrimage, and the annual Eid sacrifice — helping readers understand how this ancient prophet's life continues to shape Muslim worship today.`,
    metaDescription: "The life of Prophet Ibrahim from idol breaker to friend of Allah, covering his trials, migration, and legacy in Islamic worship practices."
  },
  {
    slug: "the-story-of-the-prophet-musa",
    description: `The Story of the Prophet Musa presents the most frequently mentioned prophet in the Quran — a figure whose life narrative occupies more verses than any other prophet and whose struggle against tyranny has inspired oppressed peoples throughout human history. This book reconstructs Musa's extraordinary journey from infancy to prophethood to the leadership of his people, drawing exclusively upon Quranic accounts and authenticated prophetic traditions.

The story begins with the perilous circumstances of Musa's birth during Pharaoh's reign of terror against the Children of Israel. Pharaoh's decree to kill all male Israelite infants, Musa's mother's inspiration to place him in a basket on the Nile, his discovery by Pharaoh's household, and his mother's grief and reunion with her son through a remarkable turn of events are narrated with attention to every Quranic detail. The book emphasizes how Allah's plan worked through ordinary human actions and emotions to protect the future prophet.

Musa's youth in Pharaoh's palace, his instinctive sense of justice that led him to strike and kill an Egyptian who was assaulting an Israelite, his flight to Madyan, his marriage to the daughter of Prophet Shu'ayb, and his years of shepherding in the desert are presented as formative experiences that prepared him for his eventual mission. The book draws parallels between Musa's spiritual preparation and the principle that Allah chooses His messengers after thorough testing and development.

The calling at Mount Sinai is narrated with dramatic intensity: the fire, the voice, the command to remove his shoes, the dialogue between Allah and Musa, and the request for his brother Harun (Aaron) as a helper. The subsequent confrontation with Pharaoh — the miracles of the staff, the white hand, the gathering of the sorcerers, the plagues, and the parting of the sea — forms the most extensive section of the book, each event analyzed for its spiritual lessons and practical implications.

The book also covers the less frequently discussed portions of Musa's story: the years in the desert with the Children of Israel, their repeated disobedience and complaints, the worship of the golden calf during Musa's absence on Mount Sinai, the receiving of the Torah, and Musa's interaction with the mysterious teacher Khidr. Each episode is presented as a lesson in leadership, patience, trust in Allah, and the challenges that even the greatest prophets faced when leading their communities.`,
    metaDescription: "The epic narrative of Prophet Musa from infancy in Egypt to Mount Sinai, detailing his confrontation with Pharaoh and leadership struggles."
  },
  {
    slug: "the-story-of-the-prophet-yusuf",
    description: `The Story of the Prophet Yusuf is a detailed retelling of the Quranic narrative that Allah Himself describes as "the best of stories" (ahsan al-qasas). This book presents the complete account of Yusuf (Joseph) as told in Surah Yusuf — the only surah in the Quran dedicated entirely to the story of a single prophet — drawing out the layers of meaning, moral lessons, and spiritual insights that have made this narrative one of the most beloved and frequently studied in Islamic tradition.

The narrative opens with young Yusuf's dream of eleven stars, the sun, and the moon bowing to him, and his father Yaqub's (Jacob's) warning to keep the dream secret from his jealous brothers. The brothers' conspiracy to eliminate Yusuf, their decision to throw him into a well, and their deception of their father with the false story of his death are narrated with attention to the Quranic language that conveys both the crime and its emotional aftermath.

Yusuf's journey from the well to slavery in Egypt, his sale to the Aziz's household, the trial of seduction by the Aziz's wife (Zulaikha), his imprisonment on false charges, and his interpretation of fellow prisoners' dreams demonstrate a recurring pattern: every apparent catastrophe became the means through which Allah elevated Yusuf to greater heights. The book emphasizes this theme as a lesson in trusting Allah's wisdom during periods of hardship that seem to make no sense.

Yusuf's interpretation of the king's dream about seven fat and seven lean cows, his subsequent appointment as the minister of agriculture and finance in Egypt, his management of the famine, and his eventual reunion with his brothers and father form the dramatic climax of the story. The book highlights Yusuf's extraordinary restraint and forgiveness toward the brothers who had wronged him — a masterclass in emotional intelligence and spiritual maturity that the Quran presents as a model for all believers.

Throughout the book, the author draws out the practical lessons embedded in Yusuf's story: the importance of patience through adversity, the danger of envy, the test of wealth and power, the virtue of forgiveness, the wisdom of keeping secrets, and the reality that Allah's plans for His faithful servants ultimately lead to good even when the path passes through the deepest valleys. The author also connects Yusuf's story to broader Quranic themes of divine providence, the testing of the righteous, and the ultimate triumph of truth over falsehood.`,
    metaDescription: "The complete Quranic narrative of Prophet Yusuf — from the well to the throne of Egypt — exploring themes of patience, envy, and divine wisdom."
  },
  {
    slug: "the-third-caliph-of-islam-uthman-bin-affan-ra",
    description: `The Third Caliph of Islam — Uthman bin Affan (R.A) is a comprehensive biography of the companion whom the Prophet Muhammad described as the most modest of his ummah and one of the ten promised Paradise. This book provides a thorough account of Uthman's life, his contributions to Islam, the achievements of his caliphate, and the tragic circumstances of his martyrdom — events that permanently shaped the trajectory of Islamic civilization.

The biography begins with Uthman's distinguished lineage in the Umayyad branch of the Quraysh, his education, his character traits, and his early career as a successful and wealthy merchant. The narrative of his conversion to Islam is particularly significant: Uthman was among the earliest converts, embracing Islam through the influence of Abu Bakr, and he endured persecution and hardship alongside the Prophet during the Makkan period. He was the first Muslim to migrate to Abyssinia with his wife Ruqayyah (the Prophet's daughter) and the first to acquire a well in Madinah and donate it to the Muslim community — actions that illustrate his characteristic generosity.

The book documents Uthman's close relationship with the Prophet, including his two marriages to the Prophet's daughters (after Ruqayyah's death, he married Umm Kulthum), earning him the title "Dhun-Nurayn" (the Possessor of Two Lights). His participation in the major battles, his role as one of the Prophet's scribes who recorded Quranic revelations, and his steadfastness during moments of crisis are detailed with reference to authentic hadith sources.

The bulk of the work covers Uthman's twelve-year caliphate (644-656 CE), during which the Islamic empire expanded to its greatest territorial extent, encompassing North Africa, Persia, Afghanistan, and the islands of the Mediterranean. The author details the administrative, military, and fiscal achievements of this period, while also addressing the controversies that arose: the appointment of young relatives to provincial governorships, the standardization of the Quranic text into a single written compilation (the event for which Uthman is perhaps most historically significant), and the growing discontent that led to rebellion.

The siege of Uthman's house and his martyrdom while reading the Quran is narrated with sensitivity and extensive sourcing. The book examines the causes of the conflict from multiple perspectives, presenting the various scholarly assessments of what went wrong during Uthman's caliphate. A concluding chapter assesses Uthman's legacy — his unparalleled contribution to Quranic preservation, his generosity, his modesty, and the lessons his leadership offers to Muslim communities navigating governance and accountability.`,
    metaDescription: "A comprehensive biography of Caliph Uthman bin Affan covering his generosity, Quran compilation, expansion of the empire, and martyrdom."
  },
  {
    slug: "the-traveler-from-the-heavons",
    description: `The Traveler from the Heavens is a children's book that presents a creative and engaging narrative centered around a character who arrives from the heavens — a concept that captures children's imagination while gently introducing Islamic concepts of the unseen world, the angels, and the relationship between the Creator and His creation. Written with young Muslim readers in mind, this story uses the framework of a visitor from another realm to explore themes of wonder, faith, kindness, and the purpose of human existence.

The narrative follows the heavenly traveler's experiences upon arriving in the human world, where everything is strange and new compared to the existence they have known. Through the traveler's eyes, everyday aspects of human life are presented afresh, allowing child readers to see their own world from a new perspective. The traveler encounters various people and situations that illustrate moral lessons: a child sharing food with a friend demonstrates generosity, a family praying together shows devotion, a person helping an elderly neighbor exemplifies kindness, and a student working hard at their studies reflects the Islamic value of seeking knowledge.

As the story progresses, the heavenly traveler learns about the human condition — the capacity for both great good and great harm, the importance of making choices, and the reality that every action carries consequences. The book handles these themes with appropriate simplicity for its target audience, avoiding heavy moralizing in favor of letting the story communicate its messages naturally through character interactions and situations that children can relate to.

The concept of the traveler from the heavens connects naturally to Islamic teachings about angels, the barzakh (the intermediate realm between death and the Day of Judgment), and the broader unseen world that Islam affirms. While the story is fictional, its spiritual framework is consistent with Islamic theology, making it a comfortable choice for parents who want their children's reading material to align with their values. The book avoids frightening or fantastical elements that conflict with Islamic sensibilities.

The writing style is age-appropriate for children aged five to ten, with engaging dialogue, gentle humor, and enough suspense to maintain interest without being scary. Illustrations throughout the book bring the characters and settings to life with colorful, child-friendly artwork. The Traveler from the Heavens works well both as a bedtime story for parents to read aloud and as a book for early readers to enjoy independently. It is a welcome addition to the growing body of quality English-language children's literature rooted in Islamic values.`,
    metaDescription: "A children's story about a heavenly visitor exploring the human world, teaching Islamic values of kindness, faith, and purpose through narrative."
  },
  {
    slug: "the-tribe-of-quraysh",
    description: `The Tribe of Quraysh is a detailed historical study of the tribe that dominated Makkah at the time of Prophet Muhammad's birth and that produced both the fiercest opponents of Islam and some of its most devoted champions. This book examines every aspect of Qurayshi society — its lineage, structure, economy, religion, politics, and culture — to provide the essential context for understanding the environment in which Islam emerged and the challenges it confronted during its formative years.

The book begins with the genealogical origins of the Quraysh, tracing their lineage back to Fihr ibn Malik (known as Quraysh) and ultimately to Adnan and the Prophet Isma'il. The author explains how the Quraysh came to dominate Makkah through their custodianship of the Ka'bah, a position granted to their ancestor Qusayy ibn Kilab, who established the foundations of Makkan political and economic power. The sub-clans of Quraysh — Banu Hashim, Banu Umayyah, Banu Makhzum, Banu Zuhrah, and others — are profiled individually, with their roles, rivalries, alliances, and prominent members documented.

The economic system of Quraysh receives substantial attention. The two annual trade caravans — the winter journey to Yemen and the summer journey to Syria — formed the backbone of Makkan wealth and drove the tribal economy. The book explains how the Quraysh's control of pilgrimage traffic to the Ka'bah generated additional revenue and how their commercial networks extended across the Arabian Peninsula and into the Byzantine and Sassanid empires. This economic context is essential for understanding why the Qurayshi elite perceived Muhammad's message of social equality and economic justice as a threat to their entire way of life.

The religious landscape of pre-Islamic Makkah is thoroughly reconstructed: the 360 idols surrounding the Ka'bah, the roles of priests and soothsayers, the surviving traces of Ibrahim's monotheism, the concept of the haram (sacred precinct), and the various pagan practices that Islam would eventually abolish. The author also covers the social customs of the Quraysh — hospitality codes, honor culture, poetry, warfare conventions, and the treatment of women, slaves, and the poor.

The book traces the Quraysh's evolving relationship with Islam: from initial dismissal and mockery, to persecution and economic boycott, to military confrontation at Badr, Uhud, and the Trench, to eventual reconciliation and the peaceful conquest of Makkah. The author profiles key Qurayshi personalities on both sides of the conflict — Abu Sufyan, Abu Jahl, and Amr ibn al-Aas among the opponents, and Hamzah, Umar, and Uthman among the supporters — providing human faces to this historical drama. The Tribe of Quraysh is an essential reference for anyone seeking to understand the world that produced Islam's first generation.`,
    metaDescription: "A comprehensive historical study of the Quraysh tribe — their genealogy, economy, religion, and pivotal role in early Islamic history."
  },
  {
    slug: "the-unchallengeable-miracles-of-the-quran",
    description: `The Unchallengeable Miracles of the Quran presents a systematic and evidence-based argument for the miraculous nature of the Quranic text, organized around the specific categories of miracles that have defied human replication for over fourteen centuries. This work approaches the topic with analytical rigor, examining each claimed miracle through the lens of linguistic analysis, historical documentation, scientific data, and philosophical reasoning to demonstrate that the Quran stands alone among religious texts in its claim to divine origin.

The book is structured around several major categories of Quranic miracles. The linguistic miracle (i'jaz) forms the foundational chapter, where the author demonstrates how the Quran's Arabic composition — its vocabulary, syntax, rhetorical devices, semantic precision, and stylistic consistency — challenged the most accomplished poets and linguists of pre-Islamic Arabia and has continued to resist imitation by every subsequent generation. Specific examples of Quranic rhetorical techniques are analyzed, showing how a text revealed piecemeal over twenty-three years maintains a level of internal coherence and stylistic unity that no human-authored text of comparable length and complexity has achieved.

The scientific miracle is addressed through a survey of Quranic verses that reference natural phenomena later confirmed by modern science. The author examines references to embryology, astronomy, geology, oceanography, and atmospheric science, comparing the Quranic descriptions with the state of scientific knowledge at the time of revelation and demonstrating the implausibility of a seventh-century human source possessing this information. Care is taken to distinguish between genuine convergence and overreaching interpretations that have weakened the scientific miracle argument in popular discourse.

Prophetic foretelling receives a dedicated chapter, documenting Quranic predictions about specific historical events — the Roman-Persian wars, the preservation of the Pharaoh's body, the conquest of Makkah, and the eventual triumph of Islam — that were fulfilled within the lifetimes of the Prophet's contemporaries or shortly thereafter. The precise nature of these predictions and their fulfillment is documented with historical sources.

Additional chapters address the numerical and structural patterns found in the Quranic text, the absence of historical anachronisms and internal contradictions despite the text's complex compilation process, the Quran's preservation through oral and written transmission chains unmatched by any other ancient text, and the transformative social impact the Quran achieved in transforming Arabian society within a single generation. The Unchallengeable Miracles of the Quran provides a comprehensive intellectual case for the divine authorship of Islam's central text, suitable for academic study, personal conviction building, and dialogue with people of other faiths.`,
    metaDescription: "A systematic analysis of Quranic miracles covering linguistic inimitability, scientific foreknowledge, prophetic predictions, and preservation."
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
