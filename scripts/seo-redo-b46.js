const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const updates = [

  // ─────────────────────────────────────────────
  // 1. Quran e Pak 13-QP (Pocket Size) — Mushaf
  // ─────────────────────────────────────────────
  {
    slug: "quran-e-pak-13-qp-pocket-size",
    description: `The Quran e Pak 13-QP Pocket Size is a compact, travel-friendly edition of the Noble Quran designed for Muslims who need a reliable Mushaf that fits comfortably in a bag, purse, or pocket. Measuring a convenient 13-line format per page, this pocket Quran maintains the standard South Asian 13-line layout that millions of readers are accustomed to, making it easy to follow along in congregational prayers or personal recitation sessions without losing your place.

Printed on high-quality, opaque paper specifically chosen to minimize bleed-through, this edition ensures that the Arabic text remains sharp and legible even under varying lighting conditions. The font size, while compact, has been carefully calibrated for readability — a common challenge with pocket-sized Qurans that this edition addresses effectively. Each page presents the text in the traditional Naskh script, widely regarded as one of the most readable Arabic calligraphy styles for both experienced reciters and those still building their fluency.

The binding of the Quran e Pak 13-QP is built to withstand frequent handling. Its flexible yet sturdy cover protects the pages during daily commute, travel, or storage in a bedside drawer. Many users appreciate keeping a pocket Quran at their desk, in their car, or with them during flights, ensuring they always have access to the word of Allah wherever they go. This portability factor makes it especially popular among students, working professionals, and travelers who do not want to carry a full-sized Quran but still wish to maintain their daily recitation habits.

This edition is an ideal gift for new Muslims learning to read the Quran, schoolchildren beginning their hifz journey, or anyone who simply wants the convenience of a lightweight Mushaf. The 13-line format aligns with most South Asian mosques and Islamic schools, so readers can seamlessly transition between this pocket edition and larger copies used during taraweeh or classroom settings. Compact, practical, and produced with care for accuracy, the Quran e Pak 13-QP Pocket Size is a dependable companion for everyday Quran engagement.`,
    metaDescription: "Buy Quran e Pak 13-QP pocket size Mushaf — compact 13-line travel Quran with durable binding and clear Naskh script for daily recitation."
  },

  // ─────────────────────────────────────────────
  // 2. Quran Hakeem (QAKFU) — Translation
  // ─────────────────────────────────────────────
  {
    slug: "quran-hakeem-qakfu",
    description: `The Quran Hakeem (QAKFU) is a distinguished Urdu translation edition of the Noble Quran that pairs the original Arabic text with a widely respected Urdu rendering, making the message of the Quran accessible to Urdu-speaking audiences around the world. Published by Darussalam, this edition carries the scholarly credibility that readers have come to associate with one of the most prominent Islamic publishing houses, ensuring both linguistic accuracy and adherence to accepted tafsir principles.

What sets the Quran Hakeem QAKFU apart from standard Quran-only copies is its integrated translation approach. The Arabic text appears alongside the Urdu translation in a clear, side-by-side or interleaved format that allows readers to cross-reference each verse with its meaning without flipping between separate books. This layout is particularly beneficial for readers who are still developing their Arabic comprehension skills but want to deepen their understanding of the Quranic message in their native language. The translation captures not just the literal meaning of the verses but also conveys the broader context and spirit of the original revelation.

The printing quality of this edition reflects Darussalam's commitment to producing durable, long-lasting Islamic publications. The paper is selected for its thickness and opacity, preventing ink from showing through from the reverse side — a critical feature for any publication that contains both Arabic and translated text on facing pages. The typography is sharp and consistent, with the Arabic in a traditional script and the Urdu in a clear, readable font that does not strain the eyes even during extended reading sessions.

This edition serves a broad audience: students of Islamic studies who need a reliable translation for academic work, families who read the Quran together and benefit from having the Urdu meaning readily available, and scholars who reference multiple translations during tafsir research. The Quran Hakeem QAKFU is also frequently used in mosques, madrasahs, and Islamic centers where Urdu is the medium of instruction. For anyone seeking a dependable, well-bound, and thoughtfully formatted Urdu Quran, this edition delivers a balanced combination of readability, accuracy, and build quality.`,
    metaDescription: "Quran Hakeem QAKFU — Arabic text with Urdu translation in a clear format. Published by Darussalam with durable printing for daily Quran reading."
  },

  // ─────────────────────────────────────────────
  // 3. Quran Majid k Haqooq — Education
  // ─────────────────────────────────────────────
  {
    slug: "quran-majid-k-haqooq",
    description: `Quran Majid k Haqooq is a focused Islamic education book that explores the rights and responsibilities associated with the Noble Quran — essentially answering the question of what the Quran demands from those who claim to revere it. Written in Urdu, this book addresses a critical gap in Islamic literature: while countless books discuss how to recite or memorize the Quran, far fewer examine the behavioral, spiritual, and practical obligations that the Quran places upon its readers and followers.

The book systematically categorizes the rights of the Quran into actionable chapters. It discusses the obligation to believe in the Quran as the final divine revelation, the duty to recite it regularly with proper tajweed, the importance of understanding its meanings and reflecting upon its verses, and the responsibility to act upon its commandments in daily life. Each chapter draws upon relevant Quranic verses, authentic hadith, and scholarly commentary to build a comprehensive framework for what it truly means to honor the Book of Allah.

Beyond individual obligations, Quran Majid k Haqooq also addresses communal responsibilities related to the Quran. It covers topics such as teaching the Quran to children, establishing Quran study circles in the community, handling the physical copy of the Quran with proper respect (including rules regarding storage, transportation, and disposal of worn copies), and the etiquette of listening to Quranic recitation. The author presents these guidelines in a straightforward, accessible Urdu style that makes the content suitable for readers of various educational backgrounds — from madrasah students to working adults who want to deepen their relationship with the Quran.

This book is particularly valuable for Islamic school curricula, Friday sermon preparation, and family study circles. Parents will find it useful for teaching their children not just how to read the Quran, but how to approach it with the reverence and seriousness it deserves. Quran Majid k Haqooq serves as a practical guide that bridges the gap between mechanical recitation and genuine spiritual engagement with the word of Allah.`,
    metaDescription: "Quran Majid k Haqooq — Urdu book on the rights and responsibilities of the Noble Quran. Covers recitation duties, etiquette, and practical guidance."
  },

  // ─────────────────────────────────────────────
  // 4. Quran Tells me The Story of Prophet Hud (A.S.) — The Arrogant People
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-hud-as-the-arrogant-people",
    description: `Quran Tells me The Story of Prophet Hud (A.S.) — The Arrogant People is a beautifully illustrated children's book that retells the Quranic narrative of Prophet Hud and the ancient civilization of Aad. Part of the popular "Quran Tells Me" storybook series published by Darussalam, this volume brings to life one of the most powerful stories of divine justice and the consequences of arrogance found in the Quran.

The story centers on the people of Aad, a mighty civilization that built grand structures and possessed immense physical strength, yet rejected the message of Prophet Hud. Despite clear signs and sincere warnings, they clung to their idol worship and dismissed the idea that a single prophet could challenge their established way of life. The book carefully narrates how Prophet Hud pleaded with his people to abandon falsehood and worship the one true God, emphasizing the patience and perseverance required of all prophets in delivering Allah's message.

What makes this book particularly effective for young readers is its balance between narrative engagement and moral instruction. The illustrations are vibrant and age-appropriate, capturing the imagination of children without crossing into inappropriate visual representation. Each page presents the story in simple yet meaningful language, with Quranic references provided so that parents and teachers can connect the storybook narrative directly to the original verses in the Quran. Key lessons about humility, the dangers of pride, the importance of heeding sincere advice, and the reality of divine punishment are woven naturally into the storytelling rather than delivered as heavy-handed sermons.

This book is designed for children aged approximately 5 to 10, though it also serves as a useful bedtime reading resource for families. Islamic schools and weekend Quran classes frequently incorporate this series into their curriculum for seerah and Quranic studies. The durable binding and quality paper ensure that the book holds up to repeated use by young hands. Parents looking for a meaningful alternative to secular storybooks will find this volume — and the broader series — an excellent tool for nurturing Islamic values and Quranic literacy in their children from an early age.`,
    metaDescription: "Prophet Hud AS storybook for kids — illustrated Quran narrative about the people of Aad. Part of Darussalam's Quran Tells Me children's series."
  },

  // ─────────────────────────────────────────────
  // 5. Quran tells me The Story of Prophet Ibrahim A.S. — 1/3 The Quest for Truth
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-ibrahim-as-13-the-quest-for-truth",
    description: `Quran Tells me The Story of Prophet Ibrahim A.S. — Part 1: The Quest for Truth is the first installment in a three-part children's storybook series that chronicles the life of Prophet Ibrahim (Abraham), one of the most frequently mentioned prophets in the Quran and a central figure revered by Muslims, Christians, and Jews alike. Published by Darussalam as part of their acclaimed "Quran Tells Me" series, this volume focuses on the early life of Ibrahim and his intellectual and spiritual journey toward monotheism.

The book opens with young Ibrahim observing the world around him — the stars, the moon, the sun — and reasoning through observation that none of these celestial bodies could be the true God, since each sets and disappears. This narrative of logical inquiry and spiritual awakening is presented in child-friendly language that encourages young readers to think critically about the world and recognize the signs of a Creator. The story then moves to Ibrahim's confrontation with his community's idol worship, including the famous incident where he smashed the idols and challenged his people to explain how their powerless gods could not even defend themselves.

Each chapter is enriched with colorful, thoughtfully designed illustrations that bring the ancient settings to life without compromising Islamic guidelines regarding visual representation of prophets. The text includes direct references to relevant Quranic verses, allowing parents and educators to seamlessly connect the storybook content with actual Quran study. Discussion prompts at the end of each section encourage children to reflect on the lessons embedded in the narrative — the value of seeking truth, the courage to stand against wrongdoing, and the importance of trusting in Allah.

This book is ideally suited for children between the ages of 5 and 10, making it an excellent resource for home reading, Islamic school libraries, and weekend madrasah programs. The first of three volumes, it sets the stage for Ibrahim's later trials — including the confrontation with Nimrod and the ultimate test of willingness to sacrifice his son — which are covered in the subsequent parts. Families building a home Islamic library will find this series to be a valuable and engaging addition that makes Quranic stories accessible and memorable for young readers.`,
    metaDescription: "Prophet Ibrahim AS story for kids — Part 1: The Quest for Truth. Illustrated Quran storybook about Ibrahim's journey to monotheism by Darussalam."
  },

  // ─────────────────────────────────────────────
  // 6. Quran tells me The Story of Prophet Ibrahim A.S. — 2/3 Cool Flames
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-ibrahim-as-23-cool-flames",
    description: `Quran Tells me The Story of Prophet Ibrahim A.S. — Part 2: Cool Flames continues the epic three-part storybook series about the life of Prophet Ibrahim, picking up where the first volume left off. This installment focuses on one of the most dramatic and spiritually significant episodes in the Quran: Prophet Ibrahim's confrontation with the tyrant king Nimrod and the miraculous event of the fire that Allah commanded to be "cool and safe" for His faithful prophet.

The narrative builds tension and excitement as it describes Ibrahim's fearless stand before Nimrod, who claimed divinity for himself. When Ibrahim logically refutes Nimrod's claim by pointing out that the king cannot cause the sun to rise from the west, Nimrod responds with brute force — ordering a massive fire to be built and throwing Ibrahim into it. The book captures the profound faith of Ibrahim, who remained calm and trusting in Allah even as the flames rose around him. The miraculous transformation of the blazing fire into a source of comfort and safety is narrated with a sense of wonder that resonates deeply with young readers.

As with all books in this series, the illustrations are carefully crafted to be engaging and colorful while respecting Islamic sensibilities. The text uses simple but expressive Urdu language that children can follow easily, with key Quranic ayat referenced so families can look up the original verses together. Each page advances the story at a pace that holds a child's attention, and the dramatic elements — the bonfire, the catapult, the prayer of Ibrahim — are presented with appropriate emphasis that makes this one of the most memorable stories in the series.

This second volume reinforces important themes: unwavering trust in Allah (tawakkul), the futility of opposing truth through force and oppression, and the idea that Allah's power transcends all earthly authority. It is suitable for children aged 5 to 10 and works well as both a standalone read-aloud and as a sequential continuation of the series. Islamic schools, madrasahs, and families will find this book an excellent resource for teaching children about faith, courage, and the miraculous protection that Allah grants to those who stand firm in their belief.`,
    metaDescription: "Prophet Ibrahim AS Part 2: Cool Flames — children's Quran storybook about Ibrahim and the miraculous fire. Illustrated by Darussalam publishers."
  },

  // ─────────────────────────────────────────────
  // 7. Quran tells me The Story of Prophet Ibrahim A.S. — 3/3 His Faith Was Great
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-ibrahim-as-33-his-faith-was-great",
    description: `Quran Tells me The Story of Prophet Ibrahim A.S. — Part 3: His Faith Was Great is the concluding volume of the three-part storybook series dedicated to the life and legacy of Prophet Ibrahim. This final installment covers the most emotionally powerful episodes of Ibrahim's life, including the dream in which he is commanded to sacrifice his beloved son, the son's remarkable willingness to submit to Allah's command, and the divine intervention that replaces the sacrifice with a ram — an event commemorated by Muslims worldwide every year during Eid al-Adha.

The book sensitively handles this profound narrative, presenting it in a way that is honest and authentic to the Quranic account while remaining accessible to young minds. It explores the depth of Ibrahim's faith — a faith so great that he was willing to sacrifice what he loved most simply because Allah asked him to. Equally highlighted is the response of his son, who, when told of the dream, immediately replied that his father should do as commanded, displaying a level of submission and trust in Allah that serves as a timeless example for all believers.

Beyond the sacrifice narrative, this volume also touches upon Ibrahim's role in building the Kaaba in Makkah alongside his son Ismail, establishing the foundations of the holiest site in Islam. The story connects these events to the rituals of Hajj, helping children understand the historical and spiritual significance of the pilgrimage their families may perform. The book also references Ibrahim's duaa (supplication) for righteous offspring and his prayer for the city of Makkah, linking these supplications to the continued blessings enjoyed by the Muslim ummah.

Illustrated with vibrant, culturally appropriate artwork and written in clear, engaging Urdu, this volume brings the series to a deeply satisfying conclusion. Discussion points and Quranic references are included throughout, enabling parents and teachers to extend the learning experience beyond the pages of the book. Suitable for children aged 5 to 10, this book — along with its two companion volumes — forms a comprehensive and beloved resource for teaching children about one of the greatest prophets in Islamic history and the enduring lessons of faith, obedience, and sacrifice that his life represents.`,
    metaDescription: "Prophet Ibrahim AS Part 3: His Faith Was Great — Quran storybook for children about the sacrifice and building of Kaaba. By Darussalam publishers."
  },

  // ─────────────────────────────────────────────
  // 8. Quran tells me The Story of Prophet Salih A.S. — That One Scream
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-salih-as-that-one-scream",
    description: `Quran Tells me The Story of Prophet Salih A.S. — That One Scream is an illustrated children's storybook that retells the Quranic account of Prophet Salih and the people of Thamud, an ancient Arabian civilization known for their advanced architecture and their tragic refusal to heed divine guidance. Published by Darussalam as part of the "Quran Tells Me" series, this book presents a compelling narrative about arrogance, gratitude, and the devastating consequences of rejecting Allah's messengers.

The people of Thamud were blessed by Allah with fertile land, spacious homes carved into mountains, and material prosperity unmatched by neighboring tribes. When Prophet Salih was sent to guide them toward monotheism and righteous living, many refused — particularly the wealthy and powerful among them who feared losing their privileged position. The book narrates the famous incident of the she-camel (Naqah) that Allah sent as a miraculous sign: a single camel that was to share the community's water supply on alternate days. When the disbelievers defiantly hamstrung the camel despite Salih's warnings, the consequence was swift and absolute — a single scream (sayhah) from the heavens that destroyed the entire civilization in a matter of moments.

This storybook handles the dramatic elements of the narrative with skill and sensitivity. The illustrations capture the grandeur of Thamud's mountain dwellings and the majesty of the miraculous she-camel while maintaining age-appropriate restraint in depicting the final judgment. The text is written in accessible Urdu that flows naturally for young readers, with key moral lessons woven into each chapter: the importance of gratitude for Allah's blessings, the danger of arrogance, the duty to protect Allah's signs, and the reality that divine punishment comes when a community persistently rejects truth after clear warnings have been delivered.

The book includes Quranic verse references throughout, enabling parents and teachers to connect each part of the story to its source in Surah Al-A'raf, Surah Hud, and other relevant surahs. A discussion section at the end encourages children to think about how the lessons of Thamud apply to their own lives — particularly the importance of using Allah's blessings responsibly and listening to good counsel. Suitable for children aged 5 to 10, this volume is a powerful addition to any Islamic home library or school curriculum.`,
    metaDescription: "Prophet Salih AS story for children — That One Scream. Illustrated Quranic narrative about the people of Thamud by Darussalam publishers."
  },

  // ─────────────────────────────────────────────
  // 9. Quran tells me The Story of Prophet Sulaiman A.S. — A Flying Envoy
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-sulaiman-as-a-flying-envoy",
    description: `Quran Tells me The Story of Prophet Sulaiman A.S. — A Flying Envoy is a captivating children's storybook from Darussalam's "Quran Tells Me" series that brings to life the extraordinary story of Prophet Sulaiman (Solomon), who was granted by Allah a kingdom unlike any other — one that included control over jinn, understanding of the speech of birds and animals, and mastery over the wind. This volume focuses on specific episodes from Sulaiman's remarkable reign, including the famous story of the hoopoe bird (hudhud) that served as a flying envoy, discovering the kingdom of Queen Bilqis (the Queen of Sheba) and reporting its wonders back to the prophet.

The narrative is rich with elements that naturally fascinate children: talking birds, an army of jinn, magnificent palaces, and a queen's throne that was miraculously transported across great distances before she even arrived. The book carefully presents each of these wonders within its proper Quranic context, emphasizing that all of Sulaiman's extraordinary powers were gifts from Allah — not personal achievements to be boasted about. This central theme reinforces the Islamic principle that all abilities and blessings ultimately come from the Creator and should be used with gratitude and humility.

The illustrations in this volume are among the most visually engaging in the series, depicting the grandeur of Sulaiman's court, the vibrant plumage of the hoopoe, and the splendor of Bilqis's kingdom. Each illustration is designed to spark a child's imagination while adhering to Islamic guidelines. The Urdu text is clear and age-appropriate, with a narrative rhythm that keeps young readers eagerly turning pages to find out what happens next.

Key Quranic lessons are embedded throughout the story: the importance of justice in leadership (Sulaiman's fair judgment in the dispute over a field), the value of knowledge and wisdom, the duty of gratitude to Allah for His blessings, and the power of da'wah (inviting others to truth) through wisdom and beautiful preaching rather than force. Quranic verse references are provided for each episode, allowing families to explore the original ayat together. Suitable for children aged 5 to 10, this book is an outstanding resource for Islamic schools, madrasahs, and home libraries, offering a story that is as educational as it is entertaining.`,
    metaDescription: "Prophet Sulaiman AS storybook — A Flying Envoy. Illustrated children's Quran story about King Solomon, the hoopoe, and Queen Sheba. By Darussalam."
  },

  // ─────────────────────────────────────────────
  // 10. Quran Tells me The Story of Prophet Younus (A.S) — The Great Repentance
  // ─────────────────────────────────────────────
  {
    slug: "quran-tells-me-the-story-of-prophet-younus-as-the-great-repentance",
    description: `Quran Tells me The Story of Prophet Younus (A.S.) — The Great Repentance is an illustrated children's storybook that narrates the powerful Quranic account of Prophet Younus (Jonah), the prophet who was swallowed by a giant fish (or whale) after leaving his people in frustration, only to be saved through his sincere repentance and dua from the darkness of the ocean's depths. Published by Darussalam, this volume belongs to the popular "Quran Tells Me" series and focuses on themes of patience, repentance, and the boundless mercy of Allah.

The book opens by introducing Prophet Younus as a messenger sent to the people of Nineveh, calling them to worship Allah alone. When his people persistently rejected his message, Younus — unlike other prophets who stayed to endure the rejection — left in despair, believing that Allah would not hold him accountable for leaving a disobedient nation. The narrative then shifts to the dramatic scene at sea, where the ship's crew, facing a violent storm, draws lots to determine which passenger is responsible for the calamity. When Younus's name is drawn, he voluntarily throws himself into the turbulent waters, only to be swallowed by a massive sea creature.

Inside the belly of the fish, in complete darkness, Younus turns to Allah with one of the most famous duas in the Quran: "La ilaha illa Anta, subhanaka, inni kuntu minaz-zalimin" (There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers). The book beautifully captures the transformative power of this prayer and how Allah responded by commanding the fish to release Younus onto a barren shore, where he was restored to health under a gourd plant. The story concludes with Younus returning to his people, only to discover that they had all believed in his message during his absence — a reminder that Allah's plans work in ways beyond human understanding.

Written in clear, engaging Urdu with vibrant illustrations, this book makes the story accessible to children aged 5 to 10. It emphasizes that no matter how dire a situation becomes, turning to Allah with sincerity can change everything. Quranic references from Surah Al-Anbiya and Surah As-Saffat are included throughout. This volume is an essential addition to any Islamic children's library, teaching one of the most profound lessons in the Quran about hope, repentance, and divine mercy.`,
    metaDescription: "Prophet Younus AS story for kids — The Great Repentance. Illustrated Quran storybook about Jonah and the whale. By Darussalam publishers."
  },

  // ─────────────────────────────────────────────
  // 11. Qurani Aur Islami Naamon Ki Dictionary — Family
  // ─────────────────────────────────────────────
  {
    slug: "qurani-aur-islami-naamon-ki-dictionary",
    description: `Qurani Aur Islami Naamon Ki Dictionary is a comprehensive Urdu-language dictionary dedicated exclusively to Quranic and Islamic names, their meanings, origins, and significance. Published by Darussalam, this reference book serves as an invaluable resource for Muslim families seeking meaningful names for their children, students of Islamic studies researching the linguistic roots of Quranic vocabulary, and anyone interested in understanding the deeper significance behind the names that appear throughout Islamic scripture and tradition.

The dictionary is organized alphabetically for ease of use, with each entry providing the name in Arabic script alongside its Urdu transliteration, detailed meaning, and relevant context. Names sourced directly from the Quran are clearly marked and accompanied by the specific verse reference in which they appear, allowing readers to study the original context. Names derived from hadith literature, Islamic history, and the lives of the Sahabah (companions of the Prophet) are also included, providing a broad and representative collection of names that have been cherished by Muslim families for generations.

Beyond simple definitions, many entries include supplementary information such as the linguistic root of the name, variant spellings or pronunciations, and brief notes on notable individuals who bore the name throughout Islamic history. This depth of information transforms the book from a basic name list into a genuine reference work that families can return to repeatedly. The inclusion of both male and female names ensures that the dictionary serves the needs of parents expecting children of either gender.

The physical production of the book reflects Darussalam's usual standards — clean typography on quality paper, with a binding designed to withstand frequent reference use. The Urdu language is formal yet accessible, making the content approachable for readers of various educational levels. This dictionary is particularly useful during the naming process for newborns, when families want to choose a name that carries positive meaning and Islamic significance. It is also a helpful tool for Islamic school teachers, imams, and researchers who need to verify the meaning or origin of Quranic names. For any Muslim household, Qurani Aur Islami Naamon Ki Dictionary is a practical and educational addition to the home library that bridges the gap between linguistic study and everyday Islamic practice.`,
    metaDescription: "Qurani Aur Islami Naamon Ki Dictionary — Urdu reference book of Quranic and Islamic names with meanings, origins, and verse references. By Darussalam."
  },

  // ─────────────────────────────────────────────
  // 12. Qurani Duaien Aur Wazaif (Hard Cover) — Darussalam Publishers
  // ─────────────────────────────────────────────
  {
    slug: "qurani-duaien-aur-wazaif-hard-cover",
    description: `Qurani Duaien Aur Wazaif (Hard Cover Edition) is a comprehensive Urdu compilation of Quranic supplications (duas) and prescribed spiritual practices (wazaif) that draws directly from the verses of the Noble Quran and the authenticated traditions of Prophet Muhammad (peace be upon him). Published by Darussalam in a sturdy hardcover binding, this edition is designed for long-term daily use — whether placed on a prayer mat for regular reference, kept on a bedside table for morning and evening adhkar, or studied in a classroom setting.

The book organizes its content into clearly defined sections, making it easy for readers to find the specific dua or wazifa they need. Sections include daily prayers (morning and evening supplications), prayers for specific occasions such as before eating, traveling, entering and leaving the home, visiting the sick, and preparing for sleep. Each dua is presented with the complete Arabic text, its Urdu translation, and often a brief explanation of the context in which the dua was revealed or recommended. This three-layer approach ensures that readers not only recite the words correctly but also understand their meaning and significance.

The wazaif section covers spiritually prescribed practices that include the recitation of specific Quranic verses or surahs for particular purposes — such as seeking protection from harm, asking for guidance in difficult decisions, praying for family well-being, and seeking relief from hardship. Each wazifa is accompanied by clear instructions on how many times it should be recited, the recommended time, and any specific conditions mentioned in authentic sources. The book takes care to distinguish between practices that are firmly established in the Quran and Sunnah and those that are simply popular in cultural tradition, providing readers with a reliable and theologically sound reference.

The hardcover binding gives this edition a premium feel and significantly enhances its durability compared to the softcover version. The paper quality is designed to handle frequent page-turning without tearing, and the printing is crisp and legible. This edition is particularly well-suited for use in Islamic centers, madrasah libraries, and households where the book will be shared among multiple family members. Qurani Duaien Aur Wazaif in hardcover is a dependable, beautifully produced resource for anyone seeking to incorporate authentic Quranic supplications into their daily routine.`,
    metaDescription: "Qurani Duaien Aur Wazaif hardcover — comprehensive Urdu collection of Quranic duas and wazaif with Arabic text, translation, and instructions."
  },

  // ─────────────────────────────────────────────
  // 13. Qurani Duayen aur Wazaif (Soft Cover) — Prayer Supplication
  // ─────────────────────────────────────────────
  {
    slug: "qurani-duayen-aur-wazaif-soft-cover",
    description: `Qurani Duayen aur Wazaif (Soft Cover Edition) is the same comprehensive Urdu compilation of Quranic supplications and prescribed spiritual practices as the hardcover version, presented in a lighter, more portable softcover format. This edition is ideal for individuals who want to carry the book with them — in a bag, purse, or even a coat pocket — ensuring they always have access to authentic Quranic duas and wazaif wherever they go. Published by Darussalam, this softcover version contains the same carefully curated content in a more affordable and travel-friendly package.

The content is organized into clear thematic sections covering daily supplications, occasion-specific prayers (for eating, sleeping, traveling, and other routine activities), prayers for seeking guidance, protection, and blessings, and a dedicated section on wazaif — prescribed spiritual practices involving the recitation of specific Quranic verses or surahs. Each entry features the Arabic text of the dua, its Urdu translation, and in many cases a brief explanation of its origin and context. This structured approach helps readers understand not just what to recite but why each supplication matters and how it connects to the broader teachings of Islam.

The wazaif section provides step-by-step instructions for various spiritual practices, specifying the number of recitations, recommended times, and any relevant conditions. The book distinguishes carefully between practices rooted in authentic Quranic and Prophetic sources and those that are merely popular customs, giving readers confidence in the reliability of what they are practicing.

The softcover format makes this edition more accessible price-wise, which is particularly beneficial for Islamic schools and madrasahs that need to procure multiple copies for students. It is also a practical choice for personal use — the lighter weight makes it comfortable to hold during prayer sessions, and the flexible cover allows the book to lay flat when open. Whether you are establishing a new routine of daily supplication or looking for a portable reference for your existing spiritual practices, this softcover edition of Qurani Duayen aur Wazaif is a practical and spiritually enriching companion.`,
    metaDescription: "Qurani Duayen aur Wazaif softcover — portable Urdu book of Quranic duas and spiritual wazaif with Arabic text and Urdu translation."
  },

  // ─────────────────────────────────────────────
  // 14. Qurani Masnoon Duain (Al Huda) Large — Prayer Supplication
  // ─────────────────────────────────────────────
  {
    slug: "qurani-masnoon-duain-al-huda-large",
    description: `Qurani Masnoon Duain (Al Huda) Large Format is a beautifully produced, oversized collection of authentic Prophetic supplications sourced from the Quran and the verified hadith of Prophet Muhammad (peace be upon him). Published under the Al Huda imprint, this large-format edition is specifically designed for ease of reading — featuring generous font sizes, spacious page layouts, and clear Arabic typography that makes it accessible to readers of all ages, including the elderly and those with visual difficulties.

The book compiles a wide range of masnoon (Prophetic) duas covering virtually every aspect of a Muslim's daily life. Sections include morning and evening adhkar, supplications for prayer (before, during, and after salah), duas for eating and drinking, prayers for entering and leaving the home, supplications for traveling, duas for seeking forgiveness (istighfar), prayers for parents, for children, for the deceased, for relief from hardship, and many more. Each dua is presented with the original Arabic text written in a large, clear script, followed by its Urdu translation and often a transliteration guide for those who are still learning to read Arabic fluently.

The large format serves several practical purposes beyond readability. The spacious layout reduces eye strain during extended reading or recitation sessions, making it particularly suitable for group settings where the book might be passed around or read from a distance — such as in halaqah circles, family gathering spaces, or mosque study groups. The enhanced page size also allows for more comfortable margin annotations by teachers and students who use the book as a study text.

The physical quality of this edition reflects careful production: thick, durable paper, strong binding, and a cover design that is both elegant and functional. The Al Huda imprint is well-regarded in Islamic publishing for its commitment to accurate content and attractive presentation. This large-format edition of Qurani Masnoon Duain is an excellent choice for households with elderly members, Islamic school classrooms where teachers need to display text clearly, and anyone who prefers a more comfortable reading experience. It makes a thoughtful gift for parents, grandparents, and new Muslims learning the daily adhkar for the first time.`,
    metaDescription: "Qurani Masnoon Duain Al Huda large format — authentic Prophetic duas in big clear text with Urdu translation. Ideal for daily adhkar."
  },

  // ─────────────────────────────────────────────
  // 15. Qurani Masnoon Duain (Al Huda) Small — Children
  // ─────────────────────────────────────────────
  {
    slug: "qurani-masnoon-duain-al-huda-small",
    description: `Qurani Masnoon Duain (Al Huda) Small Format is a compact, child-friendly edition of the popular Al Huda dua collection, specifically designed for young learners and for use in situations where a smaller, lighter book is more practical. This edition contains the same authentic Quranic and Prophetic supplications as the large-format version but in a reduced size that is easy for small hands to hold, fits comfortably in a school bag, and can be carried along for daily use without adding bulk.

The selection of duas in this small edition has been curated with children in mind, prioritizing the supplications that are most relevant to a young person's daily routine. These include the dua before eating, the dua after eating, the dua before sleeping, the dua for waking up, the dua before entering the mosque, the dua for parents, the dua before studying, and the dua for seeking protection. The Arabic text is printed in a clear, appropriately sized font for young readers, and each dua is accompanied by its Urdu translation to help children understand what they are reciting.

What makes this small-format edition particularly effective as a children's resource is its manageable size and approachable design. Young children are more likely to engage with a book that feels proportionate to their hands, and the simplified layout reduces visual overwhelm. Parents and Islamic school teachers can use this book as a structured tool for teaching daily adhkar — assigning specific duas each week and tracking progress as children memorize and incorporate them into their routines. The compact size also makes it suitable for use during travel, allowing families to maintain their daily dua practice even when away from home.

The Al Huda imprint ensures that all content is verified against authentic sources, giving parents confidence that their children are learning correct supplications. The binding and paper quality are sturdy enough to withstand regular use by young readers. This small-format edition of Qurani Masnoon Duain is an excellent starting point for children's daily spiritual education and a practical companion for families on the go. It also makes a wonderful gift for young students beginning their formal Islamic education.`,
    metaDescription: "Qurani Masnoon Duain Al Huda small — compact children's dua book with daily Prophetic supplications, Arabic text, and Urdu translation for kids."
  },

  // ─────────────────────────────────────────────
  // 16. Qurani Qaidah 14X21 — Children
  // ─────────────────────────────────────────────
  {
    slug: "qurani-qaidah-14x21",
    description: `The Qurani Qaidah 14x21 is a foundational Arabic alphabet and Quran reading primer published in a compact 14 by 21 centimeter format, making it one of the smaller standard sizes for Noorani Qaidah books. This essential learning tool is designed for young children and adult beginners who are taking their first steps toward reading the Noble Quran with proper pronunciation and fluency. Published by Darussalam, this Qaidah follows the widely recognized Noorani methodology that has been the gold standard for Quran reading instruction across South Asia and beyond for generations.

The book begins with the Arabic alphabet (huroof), teaching students to recognize and pronounce each letter individually. It then progressively introduces join letters (murakkabat), vowel marks (harakat), tanween, sukoon, shaddah, and other diacritical marks that are essential for correct Quranic recitation. Each lesson builds systematically upon the previous one, following a pedagogical sequence that has been refined through decades of classroom use. Practice exercises on every page give students ample opportunity to apply what they have learned, and the循序渐进 progression ensures that learners develop confidence before moving to more complex combinations.

The 14x21 centimeter size is particularly well-suited for young children. The book fits comfortably in a child's hands and in standard school bags, yet the pages are large enough to display the Arabic text clearly. The font size is calibrated for readability at this dimensions, with each letter and word given adequate spacing to prevent confusion between similar-looking characters. The paper quality supports writing practice — students can trace letters with a pencil or finger as part of their learning process without the paper tearing easily.

This Qaidah is the standard text used in madrasahs, Islamic schools, and home-schooling environments throughout Pakistan and the broader Urdu-speaking world. Its structured approach makes it equally effective for classroom instruction under a teacher's guidance and for self-study with parental supervision. The 14x21 edition offers a practical balance between portability and readability, making it an excellent choice for families with limited shelf space or for institutions that need to distribute copies to large numbers of students. Whether a child is beginning their first madrasah class or an adult convert is learning to read Arabic from scratch, the Qurani Qaidah 14x21 provides the structured foundation needed for a lifetime of Quranic engagement.`,
    metaDescription: "Qurani Qaidah 14x21 — compact Noorani Qaidah for children and beginners. Systematic Arabic alphabet and Quran reading primer by Darussalam."
  },

  // ─────────────────────────────────────────────
  // 17. Qurani Qaidah 17X24 — Children
  // ─────────────────────────────────────────────
  {
    slug: "qurani-qaidah-17x24",
    description: `The Qurani Qaidah 17x24 is a larger-format edition of the essential Noorani Qaidah — the foundational Arabic alphabet and Quran reading primer used universally in madrasahs, Islamic schools, and homes across the Muslim world. Measuring 17 by 24 centimeters, this edition offers significantly more page space than the smaller 14x21 version, resulting in larger Arabic text, more generous spacing between letters and words, and practice exercises that are easier for young learners to read and complete. Published by Darussalam, this Qaidah follows the time-tested Noorani method of teaching Quranic reading from the ground up.

The pedagogical structure of the Qurani Qaidah 17x24 is identical to the standard Noorani curriculum: it begins with individual Arabic letters, progresses to combined letter forms (murakkabat), introduces vowel marks (harakat), noon ghunna, meem sakinah, tanween, and all essential tajweed rules needed for basic Quran reading. Each lesson is designed to be completed before advancing to the next, ensuring that students build a solid foundation before tackling more complex material. The larger page size of this edition makes each character more prominent and easier to distinguish — a significant advantage for very young children (ages 4 to 6) who are just beginning to recognize letter shapes, as well as for students with learning difficulties who benefit from reduced visual clutter.

The 17x24 format also enhances the book's utility in classroom settings. Teachers can hold up the book and the text is visible to students sitting several rows away, making it effective for group instruction. The larger pages accommodate more comprehensive practice exercises, allowing students to complete their writing and reading drills without feeling cramped. The paper quality and binding are designed for the demands of daily classroom use, with pages that can be turned repeatedly without detaching.

This edition is the preferred choice for madrasahs and Islamic schools that prioritize readability and classroom visibility. It is also an excellent option for home schooling parents who want their children to have the most comfortable learning experience possible. The 17x24 Qurani Qaidah transforms the often-daunting task of learning to read Arabic into a structured, step-by-step process that builds confidence and competence. For any institution or family committed to providing high-quality Quran education, this larger-format Qaidah is the professional-grade tool that delivers results.`,
    metaDescription: "Qurani Qaidah 17x24 — large format Noorani Qaidah for kids. Clear Arabic text with spacious layout for classroom and home Quran learning."
  },

  // ─────────────────────────────────────────────
  // 18. Qurani Wazaif — Prayer Supplication
  // ─────────────────────────────────────────────
  {
    slug: "qurani-wazaif",
    description: `Qurani Wazaif is a focused Urdu-language compilation of prescribed spiritual practices derived directly from the Noble Quran and authenticated Prophetic traditions. Unlike broader dua collections that cover general supplications for everyday situations, this book specifically concentrates on wazaif — structured spiritual exercises that involve the recitation of particular Quranic verses, surahs, or names of Allah for defined periods, at specific times, and with particular intentions. Published by Darussalam, this book serves as a reliable guide for Muslims seeking to incorporate authenticated Quranic spiritual practices into their daily lives.

The book is organized by purpose, making it easy for readers to locate the wazifa relevant to their specific need. Categories include wazaif for seeking Allah's protection (from evil eye, from harm, from enemies), wazaif for financial stability and rizq (provision), wazaif for family well-being (marriage, children's health, spousal harmony), wazaif for spiritual growth (increasing iman, seeking forgiveness, developing khushu in prayer), and wazaif for relief from specific difficulties such as illness, debt, or anxiety. Each wazifa entry specifies the exact verses or words to be recited, the number of repetitions required, the recommended time of day or night, and any specific conditions mentioned in the source texts.

A critical strength of this book is its commitment to authenticity. In a genre where unverified and innovated practices are unfortunately common, Qurani Wazaif takes care to reference the original source for each practice — whether it is a specific Quranic verse, a hadith from Bukhari or Muslim, or a recommendation from a recognized scholar. This scholarly approach gives readers confidence that they are engaging in practices that are firmly grounded in Islamic tradition rather than cultural innovation. Where there is scholarly difference of opinion regarding a particular practice, the book acknowledges this transparency.

The production quality is typical of Darussalam publications — clean printing, durable paper, and a binding designed for frequent reference use. The Urdu language used throughout is accessible without sacrificing precision or scholarly rigor. Qurani Wazaif is a practical resource for individuals seeking structured spiritual routines, for families looking to establish collective wazaif practices at home, and for Islamic teachers who need a reliable reference when guiding students. It occupies an important space in Islamic literature by bridging the gap between scholarly authenticity and practical accessibility in the realm of Quranic spiritual practices.`,
    metaDescription: "Qurani Wazaif — authentic Quranic spiritual practices and prescribed recitations in Urdu. Organized by purpose with sourced references by Darussalam."
  },

  // ─────────────────────────────────────────────
  // 19. Qurbani, Aqeeqah aur Ashra Zil Hajja — Hajj Umrah
  // ─────────────────────────────────────────────
  {
    slug: "qurbani-aqeeqah-aur-ashra-zil-hajja",
    description: `Qurbani, Aqeeqah aur Ashra Zil Hajja is a comprehensive Urdu-language guide that covers three interconnected Islamic practices: the ritual sacrifice of Eid al-Adha (Qurbani), the birth celebration sacrifice (Aqeeqah), and the significance of the first ten days of Dhul Hijjah (Ashra Zil Hajja). Published by Darussalam, this book provides clear, detailed, and Islamically sound guidance on these important religious observances, drawing upon Quranic injunctions, authenticated hadith, and established fiqh (jurisprudence) rulings to ensure accuracy and practical relevance.

The Qurbani section covers the complete jurisprudential framework for the Eid al-Adha sacrifice: who is obligated to perform it, the types of animals that qualify, the minimum age and physical requirements for sacrificial animals, the correct method of slaughter according to Islamic guidelines, the distribution of meat (how much to keep, how much to give in charity, and how much to distribute to neighbors and the needy), and common questions and answers about modern scenarios such as pooling money for a shared sacrifice or performing Qurbani on behalf of deceased parents. The book addresses rulings from all major schools of thought where relevant, giving readers a well-rounded understanding of the practice.

The Aqeeqah section provides similarly detailed guidance on the Islamic tradition of sacrificing an animal upon the birth of a child. It covers the timing of the Aqeeqah (preferably on the seventh day after birth), the recommended number of animals (two for a boy, one for a girl), the wisdom behind this Sunnah practice, the naming ceremony, and the shaving of the newborn's head. The book also discusses contemporary questions such as whether Aqeeqah is obligatory or recommended and what to do if the parents cannot afford it at the prescribed time.

The section on Ashra Zil Hajja (the first ten days of Dhul Hijjah) is particularly timely and spiritually enriching. It highlights the extraordinary virtue of these days as described in hadith, outlines the recommended acts of worship (fasting, increased dhikr, charity, recitation of Quran), and connects these practices to the broader significance of Hajj for those unable to perform the pilgrimage themselves. The book is an essential reference for every Muslim household as Dhul Hijjah approaches each year, providing all the information needed to observe these important occasions correctly and with full spiritual benefit.`,
    metaDescription: "Qurbani Aqeeqah aur Ashra Zil Hajja — complete Urdu guide to Eid sacrifice, birth Aqeeqah, and first 10 days of Dhul Hijjah with fiqh rulings."
  },

  // ─────────────────────────────────────────────
  // 20. Rab Ka Dar Per — General
  // ─────────────────────────────────────────────
  {
    slug: "rab-ka-dar-per",
    description: `Rab Ka Dar Per is an Urdu Islamic book that explores themes of spiritual closeness to Allah, the significance of the house of the Lord, and the believer's journey toward divine proximity. The title, which translates roughly to "At the Door of the Lord," evokes the powerful imagery of a servant standing humbly before their Creator — a motif that resonates deeply within Islamic spirituality and Sufi literature. This book invites readers to reflect on their relationship with Allah and to cultivate a sense of constant awareness of the divine presence in their daily lives.

The book weaves together Quranic verses, authentic hadith, and scholarly reflections to construct a narrative about what it means to truly be "at the door" of Allah. It discusses the concept of taqwa (God-consciousness) as the key that unlocks this door, the role of sincere repentance (tawbah) in maintaining proximity to the Creator, and the importance of consistent acts of worship — both the obligatory prayers and the voluntary supererogatory acts that demonstrate a believer's love and devotion. The author draws upon the rich tradition of Islamic spiritual writings, presenting complex theological concepts in accessible Urdu prose that speaks to both the heart and the intellect.

Central to the book's message is the idea that Allah's door is always open to those who approach with sincerity, humility, and persistence. Unlike worldly doors that may be closed, locked, or guarded, the door of divine mercy remains perpetually accessible — a theme drawn directly from the famous hadith qudsi in which Allah says that He is as His servant thinks of Him, and that if a servant draws near to Him by a hand's span, He draws near by an arm's length. The book elaborates on this divine promise, offering practical guidance on how a believer can draw nearer to Allah through daily spiritual practices.

The physical production of the book is clean and well-crafted, with clear Urdu typography on quality paper. It is suitable for personal reading and reflection, for group study in halaqah circles, and as a gift for anyone seeking spiritual reconnection. Rab Ka Dar Per speaks to Muslims at all stages of their spiritual journey — from those just beginning to explore the deeper dimensions of their faith to seasoned practitioners who find renewed inspiration in its pages. Its message of hope, divine mercy, and the transformative power of sincere worship makes it a meaningful addition to any Islamic home library.`,
    metaDescription: "Rab Ka Dar Per — Urdu Islamic book on spiritual closeness to Allah. Explores taqwa, repentance, and divine proximity through Quran and hadith."
  }

];

async function main() {
  for (const item of updates) {
    await prisma.product.update({
      where: { slug: item.slug },
      data: { description: item.description, metaDescription: item.metaDescription }
    });
    console.log('Updated:', item.slug);
  }
  console.log('Done. Total:', updates.length);
}
main().then(() => prisma.$disconnect());
