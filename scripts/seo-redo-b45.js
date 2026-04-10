const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  // ─── 1. Qawaid al Sarf (Ibtidai) ───
  {
    slug: "qawaid-al-sarf-ibtidai",
    description: `Qawaid al Sarf Ibtidai is an elementary-level Arabic morphology textbook designed to introduce students to the foundational science of Sarf, which deals with the internal structure and conjugation patterns of Arabic words. Published by Darussalam Publishers, this book serves as the entry point for a comprehensive three-part series that systematically teaches students how Arabic roots, patterns, and verb forms operate. The study of Sarf is considered one of the essential auxiliary sciences in classical Islamic education, sitting alongside Nahw (syntax) as a prerequisite for understanding the Quran and classical Islamic texts with precision.

The Ibtidai volume begins with the most basic concepts, guiding the learner through the recognition of root letters, the concept of word patterns (awzan), and the primary categories of verbs — namely the past tense (maadi), present-future tense (mudhari), and imperative (amr). Each chapter builds upon the last in a carefully scaffolded progression, ensuring that students who have no prior background in Arabic grammar can follow along without confusion. The explanations are presented in a clear, straightforward style that avoids unnecessary complexity while remaining faithful to the classical framework established by centuries of Islamic scholarship.

One of the distinguishing features of this textbook is its emphasis on pattern recognition. Rather than forcing students to memorize endless lists of vocabulary, Qawaid al Sarf Ibtidai teaches the underlying morphological formulas that govern how Arabic words are formed. Once a student grasps the concept of a root consisting of three (and occasionally four) consonantal letters, and understands how vowel patterns are applied to those roots, a vast vocabulary opens up naturally. This approach reflects the traditional method of teaching Arabic in madrasahs and Islamic seminaries, where morphology is treated as a key that unlocks the language of the Quran.

The book includes a generous number of exercises at the end of each lesson, allowing students to apply what they have learned through conjugation drills, pattern-matching tasks, and fill-in-the-blank questions. These exercises reinforce retention and help learners develop fluency in identifying and producing different word forms. The layout is clean and student-friendly, with ample spacing for notes and a well-organized table of contents that makes it easy to locate specific topics for review.

Qawaid al Sarf Ibtidai is ideally suited for students enrolled in madrasah curricula, self-learners beginning their journey into Arabic linguistics, and anyone who wishes to build a solid grammatical foundation before tackling more advanced texts. It pairs naturally with the subsequent volumes — Part 1 and Part 2 — which expand upon the concepts introduced here. Teachers of Arabic and Islamic studies will find this textbook to be an invaluable classroom resource that aligns with traditional pedagogical methods while remaining accessible to a modern audience.`,
    metaDescription: "Qawaid al Sarf Ibtidai is a beginner Arabic morphology textbook covering verb conjugation, root patterns, and word structure for Quranic language learners."
  },

  // ─── 2. Qawaid al Sarf (Part 1) ───
  {
    slug: "qawaid-al-sarf-part-1",
    description: `Qawaid al Sarf Part 1 is the second volume in Darussalam's acclaimed three-part Arabic morphology series, building directly upon the introductory concepts covered in the Ibtidai (elementary) volume. This textbook is designed for students who have already mastered the fundamentals of root letters, basic verb categories, and simple word patterns, and who are now ready to explore the more intricate dimensions of Arabic word formation. The study of Sarf at this level is crucial for anyone seeking to read classical Islamic texts, understand Quranic exegesis, or engage with the vast corpus of Arabic religious literature with grammatical accuracy.

Part 1 of Qawaid al Sarf introduces a range of intermediate-level morphological topics that are essential for advanced comprehension. The book covers the various forms of the triliteral verb in depth, including the enhanced forms (mazid fihi) — those verbs whose root letters are augmented with additional letters to modify meaning. Students learn to identify and conjugate verbs across all ten commonly recognized augmented forms, understanding how each pattern carries a distinct semantic nuance. For example, the doubling of a middle radical, the addition of a hamzah at the beginning, or the insertion of a taa between the second and third radicals each produces a meaning related to the base root but with a specific shade of intensity, repetition, or causation.

The textbook also addresses the morphology of derived nouns, which constitute a significant portion of the Arabic lexicon. Students study the active participle (ism al-fa'il), the passive participle (ism al-maf'ul), the noun of time and place (ism al-zaman wa al-makan), the noun of instrument (ism al-ala), and the superlative (ism al-tafdil). Each of these categories is explained with clear definitions, illustrative examples from the Quran and classical Arabic literature, and practical exercises that solidify understanding. By mastering these patterns, students gain the ability to deduce the meanings of unfamiliar words encountered in their reading, a skill that is indispensable for serious Islamic study.

Another important topic covered in this volume is the treatment of irregular verbs — those verbs whose root letters include a weak letter (hamzah, waw, or yaa). The morphological rules governing these weak verbs, known collectively as al-af'al al-mu'tallah, are presented in a systematic and methodical manner. Students learn how weak letters change or drop in various conjugation contexts, and how to recognize the original root from which a given word is derived.

The layout of Qawaid al Sarf Part 1 maintains the same clean, organized design as the Ibtidai volume. Lessons are structured with clear headings, well-formatted tables for conjugation paradigms, and concise explanations that avoid excessive jargon. Each chapter concludes with a set of exercises designed to test comprehension and reinforce the material. These exercises range from simple conjugation drills to more analytical tasks that require students to identify morphological patterns in sample sentences.

This volume is widely used in madrasahs, Islamic universities, and private study circles. It is suitable for intermediate students of Arabic who have completed the Ibtidai level or an equivalent introductory course. Teachers will find it a well-structured resource that can be easily incorporated into a semester-long curriculum on Arabic morphology.`,
    metaDescription: "Qawaid al Sarf Part 1 covers intermediate Arabic morphology including augmented verb forms, derived nouns, and irregular verb conjugation patterns."
  },

  // ─── 3. Qawaid al Sarf (Part 2) ───
  {
    slug: "qawaid-al-sarf-part-2",
    description: `Qawaid al Sarf Part 2 is the final and most advanced volume in Darussalam's comprehensive three-part series on Arabic morphology, completing the educational journey that begins with the Ibtidai volume and continues through Part 1. This textbook is intended for advanced students of Arabic linguistics who have already developed a firm command of the basic and intermediate morphological concepts covered in the earlier volumes. It addresses the most complex and nuanced aspects of Sarf, equipping students with the analytical tools needed to parse and understand the most challenging forms found in classical Arabic literature, Quranic commentary, and advanced Islamic scholarship.

The opening sections of Part 2 revisit and consolidate the material on irregular verbs introduced in Part 1, extending the analysis to cover more complex cases. Students encounter detailed discussions of the assimilated verb (al-mithal), the hollow verb (al-ajwaf), the deficient verb (al-naqs), and the doubled verb (al-muda'af), along with compound weak forms where two or more weak letters appear in the same root. The textbook provides exhaustive conjugation tables for each type, showing precisely how weak letters behave across all persons, genders, numbers, tenses, moods, and derived forms. This level of detail is essential for students who need to navigate texts where irregular forms appear frequently.

A significant portion of this volume is devoted to the science of ishtiqaq (derivation) and the semantic relationships between morphologically related words. Students learn how words derived from the same root can carry a spectrum of interconnected meanings, and how classical lexicographers organized the Arabic language around these root-based semantic networks. This understanding is particularly valuable for tafsir (Quranic interpretation), where commentators frequently rely on morphological analysis to determine the precise meaning of a word in context.

The book also covers the morphology of nouns in greater depth than previous volumes. Topics include the formation of diminutives (taseghir), the construct of relative adjectives (nisbah), the patterns of verbal nouns (masdar) and their various sub-categories, and the morphological rules governing pluralization — including the sound plurals (jam' salim) and the broken plurals (jam' taksir). The treatment of broken plurals is especially thorough, as these represent one of the most challenging aspects of Arabic morphology due to the numerous patterns involved and the lack of a single governing rule.

Advanced concepts such as al-mu'tal and al-mahmuz nouns, the rules of al-idgham (assimilation), and the principles governing morphological substitution (al-ibdal) are also explored. Each topic is presented with copious examples drawn from the Quran, Hadith, and classical Arabic poetry, connecting the theoretical framework to real-world linguistic practice.

The exercises in Part 2 are more demanding than those in earlier volumes, requiring students to perform full morphological analyses of complex words, identify roots and patterns in unfamiliar vocabulary, and apply the rules of Sarf to predict how a given root would appear in various derived forms. These exercises prepare students for independent study of classical texts.

Qawaid al Sarf Part 2 is an essential resource for advanced students in Islamic seminaries, Arabic language degree programs, and self-directed learners who aspire to achieve mastery of Quranic and classical Arabic. It serves as a fitting capstone to a well-structured series that has helped generations of students build a rigorous foundation in the science of Arabic morphology.`,
    metaDescription: "Qawaid al Sarf Part 2 is an advanced Arabic morphology textbook covering irregular verbs, word derivation, pluralization rules, and complex morphological analysis."
  },

  // ─── 4. Qawaid al Sarf Complete Set (3 Vol.) ───
  {
    slug: "qawaid-al-sarf-complete-set-3-vol",
    description: `The Qawaid al Sarf Complete Set brings together all three volumes of Darussalam's authoritative Arabic morphology series — Ibtidai, Part 1, and Part 2 — into a single, convenient package. This complete set provides a structured and progressive pathway through the entire science of Sarf, from the most elementary concepts of root letters and verb patterns to the advanced analysis of irregular forms, word derivation, and complex morphological rules. For students committed to mastering Arabic grammar as it pertains to Quranic studies and classical Islamic scholarship, this three-volume set represents one of the most comprehensive and methodical textbooks available in the field.

Arabic morphology, the science of how words are formed and how their forms convey meaning, is one of the foundational disciplines of traditional Islamic education. Without a solid grounding in Sarf, students struggle to parse complex sentence structures in the Quran, Hadith, and classical tafsir literature. The Qawaid al Sarf series addresses this need by presenting the subject in a way that is both faithful to the classical Arabic grammatical tradition and accessible to contemporary learners. The progression from Ibtidai through Part 1 to Part 2 mirrors the traditional madrasah curriculum, where students are gradually introduced to increasingly sophisticated concepts as their competence grows.

The Ibtidai volume lays the foundation by teaching students to recognize root letters, understand the basic triliteral verb patterns, and conjugate verbs in the past, present, and imperative tenses. It introduces the idea that Arabic words are not arbitrary collections of letters but are generated from predictable patterns applied to consonantal roots. Part 1 builds upon this foundation by introducing the augmented verb forms (al-af'al al-mazidah fihi), derived nouns such as participles and nouns of time, place, and instrument, and the rules governing weak-letter verbs. Part 2 completes the series with advanced topics including the full conjugation of all types of irregular verbs, the science of derivation (ishtiqaq), the morphology of broken plurals, diminutives, and relative adjectives, and the principles of morphological substitution and assimilation.

Each volume in the set features a consistent pedagogical approach. Lessons begin with clear explanations of new concepts, supported by illustrative examples from the Quran and classical Arabic literature. Well-formatted conjugation tables and pattern charts make it easy to visualize the material. Each chapter concludes with exercises that range from basic drills to analytical challenges, ensuring that students not only understand the theory but can apply it in practice.

The three volumes are designed to be used sequentially, and together they constitute a complete course in Arabic morphology suitable for a multi-semester curriculum. The set is ideal for madrasahs, Islamic schools, Arabic language institutes, university programs in Islamic studies, and self-learners who want a systematic and thorough education in the science of Sarf. By working through all three volumes, students will develop the morphological competence needed to engage with Quranic Arabic and classical Islamic texts with confidence and precision.`,
    metaDescription: "The Qawaid al Sarf Complete Set includes all 3 volumes covering beginner to advanced Arabic morphology, verb conjugation, and word derivation for Quranic studies."
  },

  // ─── 5. Qawaid al Tajweed ───
  {
    slug: "qawaid-al-tajweed",
    description: `Qawaid al Tajweed by Darussalam Publishers is a comprehensive textbook on the science of Tajweed, the set of rules governing the correct pronunciation and recitation of the Holy Quran. Tajweed is derived from the Arabic root j-w-d, meaning "to improve" or "to make excellent," and it refers to the precise phonetic rules that must be observed when reciting the Quran to ensure that each letter is articulated from its proper point of origin (makhraj) and endowed with its correct characteristics (sifat). Mastery of Tajweed is considered an obligatory duty for every Muslim who recites the Quran, as the Prophet Muhammad (peace be upon him) instructed that the Quran be recited in the manner it was revealed.

This textbook covers the full range of Tajweed rules in a structured, easy-to-follow format that is suitable for both classroom instruction and self-study. The book begins with an introduction to the points of articulation (makharij al-huruf), teaching students exactly where in the mouth and throat each of the twenty-nine Arabic letters originates. Understanding makharij is the foundation of correct recitation, as even a slight deviation in the point of articulation can change the meaning of a word. The text provides detailed descriptions, often supplemented by diagrams, that help students identify and practice the correct articulation points for each letter.

Following the discussion of articulation points, Qawaid al Tajweed addresses the primary characteristics (sifat) of the Arabic letters. These characteristics include attributes such as whisper (hams) and loudness (jahr), softness (rikhawah) and hardness (shiddah), and the various flowing and echoing qualities that distinguish one letter from another. Understanding these sifat allows reciters to produce each letter with the precise phonetic quality it requires.

The book then proceeds to cover the operational rules of Tajweed — the rules that govern how letters interact with one another during recitation. These include the rules of nun sakinah and tanween (the nasalizations), the rules of mim sakinah, the rules of noon and mim mushaddadah, the rules of idgham (assimilation), ikhfa (concealment), ith-har (clarity), and iqlab (conversion). Each rule is explained with clarity, supported by examples drawn directly from Quranic verses so that students can see how the rule applies in context.

Additional topics covered include the rules of mad (prolongation), including the natural prolongation (mad tabi'i) and the compulsory prolongations (mad wajib, mad lazim, mad jaiz munfasil, and mad jaiz muttasil). The book also addresses qalqalah (the echoing sound), the rule of tafkhim and tarqiq (the heavy and light pronunciation of the letter raa), the rules concerning the letter laam in the name Allah, and the rules of waqf and ibtida (stopping and starting during recitation).

Qawaid al Tajweed includes practice exercises throughout the text, allowing students to apply each rule as it is learned. The book is designed for students at madrasahs, Islamic schools, and Quran learning centers, as well as adults who wish to improve their recitation. It serves as both a teaching manual and a reference guide, making it a valuable addition to any Quran student's library.`,
    metaDescription: "Qawaid al Tajweed is a comprehensive guide to Quranic recitation rules covering articulation points, letter characteristics, and phonetic laws for proper Tajweed."
  },

  // ─── 6. Qisa Hazrat Essah (Local) ───
  {
    slug: "qisa-hazrat-essah-local",
    description: `Qisa Hazrat Essah (Local) is a biography and life story of Prophet Isa (Jesus, peace be upon him) presented in Urdu by Darussalam Publishers. This book provides a detailed and well-researched account of the life and mission of one of the most prominent prophets in Islamic tradition, drawing upon authentic sources from the Quran, Hadith, and classical Islamic historical works. The narrative is presented in a clear and accessible Urdu style, making it suitable for a wide range of readers, from school students to adults interested in learning about the Islamic perspective on the life of Prophet Isa.

The book begins with the miraculous birth of Prophet Isa, detailing the story of his mother Maryam (Mary) and the extraordinary circumstances surrounding his conception and arrival in the world. It draws extensively from the Quranic account in Surah Al-Imran and Surah Maryam, explaining the significance of Maryam's selection by Allah, the angel's announcement of the glad tidings, and the response of the community to this miraculous event. The text provides contextual explanations that help readers understand the social and historical background against which these events took place.

As the narrative progresses, the book covers Prophet Isa's childhood, his early signs and miracles, and the beginning of his prophetic mission. Among the miracles described in detail are his ability to speak from the cradle, his healing of the sick, his raising of the dead by Allah's will, and his creation of a bird from clay. Each miracle is discussed in the context of its Quranic mention, and the theological significance of these events is explained with reference to classical tafsir.

The book also addresses the challenges and opposition that Prophet Isa faced from his contemporaries, including the religious establishment of his time. It presents the Islamic perspective on the events leading to his alleged crucifixion, clearly explaining the Quranic position that Prophet Isa was neither killed nor crucified, but was raised up to the heavens by Allah. This topic is treated with scholarly depth, drawing upon relevant Quranic verses and authentic Hadith narrations to present a coherent and well-supported account.

The later portions of the book discuss the role of Prophet Isa in Islamic eschatology, including the prophecies concerning his return before the Day of Judgment. The text explains the events that will accompany his second coming, his role in defeating the Dajjal (the False Messiah), and the establishment of justice and peace during that period. This eschatological dimension adds a unique and valuable perspective that distinguishes the Islamic account of Prophet Isa's life from other religious traditions.

Written in straightforward Urdu prose, Qisa Hazrat Essah (Local) is designed to be accessible to readers of all ages and educational backgrounds. It is an ideal resource for families, schools, and Islamic study circles where the stories of the prophets are taught. The book provides a faith-affirming and historically grounded account that helps readers understand and appreciate the elevated status of Prophet Isa in Islamic belief.`,
    metaDescription: "Qisa Hazrat Essah (Local) is a Urdu biography of Prophet Isa (Jesus) covering his birth, miracles, prophetic mission, and eschatological return based on Quran and Hadith."
  },

  // ─── 7. Qisa Hazrat Muhammad SAW (Local) ───
  {
    slug: "qisa-hazrat-muhammad-saw-local",
    description: `Qisa Hazrat Muhammad SAW (Local) is a comprehensive biography of the Prophet Muhammad (peace be upon him) written in Urdu by Darussalam Publishers. This book presents the complete life story of the final messenger of Islam, from his birth in Mecca to his passing in Medina, narrated in a manner that is both engaging and educationally valuable. The account draws upon the most authentic sources of Seerah, including Sahih al-Bukhari, Sahih Muslim, and the classical works of renowned Seerah scholars such as Ibn Hisham, Ibn Kathir, and Ibn al-Qayyim.

The biography is structured chronologically, beginning with the pre-Islamic context of Arabia and the lineage of the Prophet Muhammad (peace be upon him) through the noble family of Hashim and the Quraysh tribe. It covers the remarkable events surrounding his birth, the well-known story of Halimah as-Sa'diyah and his time among the Banu Sa'd, the incident of the splitting of his chest, and his early life experiences that shaped his character — earning him the titles of As-Sadiq (the truthful) and Al-Amin (the trustworthy) among his community.

The book provides a detailed account of the first revelation in the Cave of Hira, the beginning of the prophetic mission, and the intense persecution faced by the early Muslims in Mecca. It covers the migration to Abyssinia, the conversion of key companions such as Umar ibn al-Khattab and Hamzah, the year of sorrow (Aam al-Huzn) in which the Prophet lost his beloved wife Khadijah and his uncle Abu Talib, the miraculous night journey (Isra and Mi'raj), and the eventual migration (Hijrah) to Medina where the first Islamic community was formally established.

The Medinan period is covered with equal thoroughness, including the establishment of the first mosque, the brotherhood between the Ansar and Muhajirun, the Battle of Badr, the Battle of Uhud, the Battle of the Trench (Khandaq), the Treaty of Hudaybiyyah, the conquest of Mecca, the Farewell Pilgrimage (Hajjat al-Wada), and the Prophet's final illness and passing. Each event is presented with appropriate historical context, relevant Quranic verses, and authentic Hadith references.

Throughout the narrative, emphasis is placed on the Prophet's exemplary character, his mercy and compassion, his leadership qualities, his dealings with companions and opponents alike, and his unwavering devotion to the worship of Allah. The book serves not merely as a historical chronicle but as a source of inspiration and guidance for Muslims seeking to follow the Prophetic model in their own lives.

The Urdu prose is clear, engaging, and suitable for a general readership, making this book an excellent choice for families, schools, and madrasahs. It provides a complete and reliable account of the Prophet's life that can be read aloud to children, studied by adults, and referenced by teachers of Islamic studies.`,
    metaDescription: "Qisa Hazrat Muhammad SAW (Local) is a complete Urdu biography of the Prophet Muhammad covering his birth, prophetic mission, key events, and exemplary character based on authentic sources."
  },

  // ─── 8. Qisa Hazrat Musa (Local) ───
  {
    slug: "qisa-hazrat-musa-local",
    description: `Qisa Hazrat Musa (Local) is a detailed Urdu-language biography of Prophet Musa (Moses, peace be upon him) published by Darussalam Publishers. Prophet Musa holds a uniquely prominent position in the Quran, being mentioned by name more times than any other prophet. His life story, filled with dramatic events, divine miracles, and profound lessons, is narrated across multiple Quranic surahs including Al-Baqarah, Al-A'raf, Ta-Ha, Al-Qasas, and others. This book brings together the various elements of Prophet Musa's story into a coherent and chronological narrative that is both informative and spiritually uplifting.

The book opens with the context of the Children of Israel in Egypt under the tyranny of Pharaoh (Fir'awn), the decree to kill all male newborns, and the divine plan to protect the newborn Musa by placing him in a basket on the Nile. It covers his rescue by Pharaoh's household, his upbringing in the palace, his eventual flight from Egypt after the incident with the Egyptian man, his journey to Midian, his marriage, and his encounter with the burning bush where Allah spoke to him directly and commissioned him as a prophet.

One of the most dramatic sections of the book details the confrontation between Prophet Musa and Pharaoh. The narrative covers Musa's return to Egypt with his brother Harun (Aaron), the series of miracles shown to Pharaoh — including the staff that transformed into a serpent and the white hand — the contest with Pharaoh's sorcerers, the plagues that struck Egypt, and the eventual drowning of Pharaoh and his army in the Red Sea while the Children of Israel crossed safely. Each event is explained with reference to the relevant Quranic verses and supplemented with authentic commentary.

The book also covers the forty years of wandering in the desert, the receiving of the Torah (Tawrat) on Mount Sinai, the incident of the golden calf, the story of Prophet Khidr, and the various tests and trials that the Children of Israel faced under Musa's leadership. The narrative highlights the patience, perseverance, and unwavering faith of Prophet Musa despite the repeated disobedience and ingratitude of his people.

The character of Prophet Musa is portrayed with depth and nuance throughout the book. His courage in standing before the most powerful ruler of his time, his humility in speaking to Allah, his love for his people despite their transgressions, and his role as one of the Ulul Azm (the prophets of resolve) are all emphasized. The book draws upon classical tafsir sources to provide context and explanation for the events described in the Quran.

Written in clear and accessible Urdu, Qisa Hazrat Musa (Local) is suitable for readers of all ages. It serves as an excellent educational resource for Islamic schools, a family reading book, and a reference for anyone interested in the Quranic narrative of one of Islam's greatest prophets.`,
    metaDescription: "Qisa Hazrat Musa (Local) is a comprehensive Urdu biography of Prophet Moses, covering his birth, miracles, confrontation with Pharaoh, and leadership of the Israelites."
  },

  // ─── 9. Qisa Hazrat Suleman (Local) ───
  {
    slug: "qisa-hazrat-suleman-local",
    description: `Qisa Hazrat Suleman (Local) is an Urdu-language biography of Prophet Suleman (Solomon, peace be upon him) published by Darussalam Publishers. Prophet Suleman was granted by Allah an extraordinary kingdom and powers that no other prophet possessed — including command over the winds, the jinn, the birds, and an understanding of the speech of ants. His story is one of wisdom, justice, devotion to Allah, and magnificent divine blessings, making his life one of the most captivating narratives in the Quran and Islamic tradition.

The book traces the life of Prophet Suleman from his succession to the throne of his father, Prophet Dawud (David, peace be upon him), through the various events and achievements that defined his prophetic career. It covers his renowned wisdom, exemplified by the famous incident of the two women disputing over a child, where his divinely granted judgment resolved the matter with remarkable insight. This quality of wisdom earned him a place among the most revered figures in Islamic, Jewish, and Christian traditions alike.

A central theme of the book is the magnificent kingdom that Allah bestowed upon Prophet Suleman. The narrative describes his command over the jinn, who constructed palaces, monuments, and works of extraordinary craftsmanship under his direction. It details his ability to understand the speech of birds, as illustrated by the incident of the Hudhud (hoopoe) who reported the existence of the kingdom of Sheba (Bilqis) ruled by a powerful queen. The subsequent exchange between Prophet Suleman and Queen Bilqis, her eventual embrace of faith, and the building of the magnificent mosque in Jerusalem are all narrated with depth and detail.

The book also covers the construction of the Bayt al-Maqdis (the holy temple in Jerusalem), one of the most significant architectural achievements attributed to Prophet Suleman. The collaborative effort between human workers and jinn, the vast resources assembled for the project, and the spiritual significance of this sacred structure are all explored within the narrative.

Throughout the biography, the text emphasizes Prophet Suleman's unwavering devotion to Allah. Despite possessing unparalleled wealth, power, and authority, he remained a humble servant of his Lord, spending his nights in prayer and constantly expressing gratitude for the blessings he received. His famous prayer, recorded in the Quran, asking Allah for a kingdom that would never be matched, is discussed as an example of a prayer made for the right reasons and answered in the most magnificent way.

The book also addresses the Quranic account of Prophet Suleman's passing, noting how the jinn continued working, unaware that he had died, until a woodworm gnawed through his staff and he fell — a powerful reminder that death comes to all, regardless of power and authority.

Written in accessible and engaging Urdu, Qisa Hazrat Suleman (Local) brings to life one of the most remarkable prophets in Islamic history. It is an excellent resource for families, schools, and anyone interested in the stories of the prophets as narrated in the Quran and authentic Islamic sources.`,
    metaDescription: "Qisa Hazrat Suleman (Local) is a detailed Urdu biography of Prophet Solomon covering his divine kingdom, wisdom, the Queen of Sheba story, and temple construction."
  },

  // ─── 10. Qisa Hazrat Yousaf (Local) ───
  {
    slug: "qisa-hazrat-yousaf-local",
    description: `Qisa Hazrat Yousaf (Local) is an Urdu-language biography of Prophet Yousaf (Joseph, peace be upon him) published by Darussalam Publishers. The story of Prophet Yousaf is considered by many scholars to be the most beautifully narrated account in the entire Quran, as Allah Himself describes it as "ahsan al-qasas" — the best of stories. Surah Yousaf, the twelfth chapter of the Quran, is dedicated entirely to this narrative, and it contains within it lessons of patience, forgiveness, trust in Allah, divine wisdom, and the ultimate triumph of righteousness over adversity.

The book follows Prophet Yousaf's life from his childhood in Canaan to his rise as the governor of Egypt. It begins with the famous dream of the young Yousaf — eleven stars, the sun, and the moon bowing to him — and the jealousy it aroused in his brothers. The narrative covers the brothers' conspiracy to throw him into the well, their deception of their father Prophet Yaqub (Jacob), Yousaf's being found by a caravan and sold into slavery in Egypt, and his eventual placement in the household of the Aziz (the minister) of Egypt.

One of the most significant and extensively covered episodes in the book is the trial that Prophet Yousaf faced at the hands of the Aziz's wife, Zulaikha. The narrative describes her attempts to seduce him, his steadfast refusal and preference for prison over disobedience to Allah, and the eventual exoneration that came through the testimony of a woman from the city. This episode is treated with appropriate modesty and depth, emphasizing the moral and spiritual lessons it contains.

The book details Prophet Yousaf's time in prison, his interpretation of the dreams of his fellow inmates — the king's cupbearer and baker — and the eventual interpretation of the king's dream that led to his release and appointment as the governor of Egypt. It covers his management of the famine that struck the region, his reunion with his brothers who came to Egypt seeking grain, his revelation of his identity, and the eventual reunion with his beloved father Prophet Yaqub.

Throughout the biography, the book highlights the Quranic commentary on these events, drawing upon classical tafsir to explain the deeper meanings and lessons embedded in the narrative. The patience of Prophet Yaqub, who waited years for his lost son and never lost hope in Allah's mercy, is portrayed as a model of steadfast faith. Prophet Yousaf's forgiveness of his brothers, despite the great wrong they had done to him, is presented as an example of the highest moral character.

The Urdu prose of Qisa Hazrat Yousaf (Local) captures the beauty and emotional depth of the original Quranic narrative while remaining accessible to contemporary readers. The book is ideal for families, Islamic schools, madrasahs, and anyone who wishes to study the story of Prophet Yousaf in depth. It serves both as an inspirational read and as an educational tool for understanding one of the most important narratives in Islamic scripture.`,
    metaDescription: "Qisa Hazrat Yousaf (Local) is a detailed Urdu biography of Prophet Joseph covering his trials, patience, rise to power in Egypt, and reunion with his family from the Quran."
  },

  // ─── 11. Qisasul Ambiya (Farsi) ───
  {
    slug: "qisasul-ambiya-farsi",
    description: `Qisasul Ambiya (Farsi) is a comprehensive collection of the stories of the prophets presented in the Persian (Farsi) language by Darussalam Publishers. This book compiles the narratives of the major prophets mentioned in the Quran — from Prophet Adam to Prophet Muhammad (peace be upon them all) — into a single, well-organized volume. The stories of the prophets, collectively known as Qisas al-Anbiya, have been a beloved genre of Islamic literature for centuries, serving as a primary means of transmitting religious knowledge, moral values, and spiritual inspiration to Muslim communities across linguistic and cultural boundaries.

The Persian language has a rich and distinguished tradition of prophetic literature. For centuries, Farsi has been the medium through which millions of Muslims — in Iran, Afghanistan, Tajikistan, and across South and Central Asia — have accessed the stories of the prophets. This volume continues that tradition, presenting the Quranic narratives of the prophets in clear, classical-influenced Farsi prose that is both elegant and accessible to contemporary Persian-speaking readers.

The book covers the stories of all the major prophets mentioned in the Quran, including Adam, Nuh (Noah), Hud, Salih, Ibrahim (Abraham), Lut (Lot), Ismail (Ishmael), Ishaq (Isaac), Yaqub (Jacob), Yousaf (Joseph), Musa (Moses), Harun (Aaron), Dawud (David), Suleman (Solomon), Ayyub (Job), Dhul-Kifl, Ilyas (Elijah), Al-Yasa (Elisha), Yunus (Jonah), Zakariyya, Yahya (John), Isa (Jesus), and Muhammad (peace be upon them all). Each prophetic story is narrated with appropriate detail, focusing on the key events, miracles, trials, and lessons that define each prophet's mission.

The narrative approach of Qisasul Ambiya (Farsi) follows the traditional Quranic method of storytelling — presenting events in a way that highlights the moral and spiritual dimensions of each account. The struggles of the prophets against tyranny and idolatry, the responses of their communities to the message of monotheism, the miracles granted by Allah to support their missions, and the ultimate triumph of truth over falsehood are all recurring themes that run through the book. At the same time, each prophet's unique character traits and circumstances are given their due attention, making each story distinct and memorable.

The book draws upon authentic Islamic sources including the Quran, authenticated Hadith collections, and respected classical works of tafsir and Islamic history. The stories are presented without the embellishments and exaggerations found in less reliable works of Qisas al-Anbiya, ensuring that the content is both educationally sound and faith-affirming.

Qisasul Ambiya (Farsi) is an excellent resource for Persian-speaking Muslim families, Islamic schools in Farsi-speaking regions, and anyone interested in accessing the prophetic narratives through the medium of the Persian language. The book is suitable for both adults and younger readers, making it a versatile addition to any Islamic library or educational curriculum. It serves as a bridge connecting contemporary Persian-speaking Muslims to the timeless stories of Allah's chosen messengers.`,
    metaDescription: "Qisasul Ambiya (Farsi) is a Persian-language collection of prophetic stories from Adam to Muhammad, based on authentic Quranic and Hadith sources for Farsi-speaking readers."
  },

  // ─── 12. Qiyam ul Layl ───
  {
    slug: "qiyam-ul-layl",
    description: `Qiyam ul Layl by Darussalam Publishers is a comprehensive book dedicated to the Islamic practice of the Night Prayer, commonly known as Tahajjud. Qiyam ul Layl, literally meaning "standing in the night," refers to the voluntary prayers performed during the last third of the night, a practice that has been highly recommended and regularly observed by the Prophet Muhammad (peace be upon him) and his companions. This book provides a thorough examination of the spiritual significance, rulings, and practical methodology of this meritorious act of worship.

The book begins by establishing the importance of Qiyam ul Layl through extensive references to the Quran and authentic Hadith. The Quran describes the believers who stand in prayer during the night as those who possess a special quality of righteousness and devotion. The Prophet Muhammad (peace be upon him) is reported to have said that the best prayer after the obligatory prayers is the prayer during the night. The book presents these and many other evidences to demonstrate the elevated status of the Night Prayer in Islamic worship.

One of the key sections of the book deals with the specific virtues and benefits of Qiyam ul Layl. The text explains how the last third of the night is the time when Allah descends to the lowest heaven and calls out to His servants, asking if there is anyone seeking forgiveness so that He might forgive them, anyone seeking provision so that He might provide for them. This section draws upon authentic narrations to paint a vivid picture of the spiritual atmosphere of the pre-dawn hours and the unique closeness to Allah that can be achieved during this time.

The book also provides a detailed explanation of the practical aspects of performing Qiyam ul Layl. It covers the recommended times for the prayer, the number of rak'ahs, the manner of recitation, the supplications (duas) that are recommended, and the method of performing the Witr prayer that typically concludes the Night Prayer. The distinction between Tahajjud and Taraweeh is clarified, addressing a common area of confusion among Muslims.

The text also addresses the fiqh (jurisprudence) of Qiyam ul Layl, discussing the various scholarly opinions on its rulings, the conditions for its performance, and the permissibility of combining it with other night prayers. The different opinions of the four major schools of Islamic jurisprudence are presented in a respectful and balanced manner.

Additionally, the book includes inspiring accounts of how the early Muslims — the companions of the Prophet, the Tabi'in, and the righteous scholars of subsequent generations — observed Qiyam ul Layl with remarkable consistency and devotion. These historical anecdotes serve to motivate readers to adopt this practice in their own lives and to appreciate the spiritual heritage of the Muslim Ummah.

Qiyam ul Layl is suitable for anyone who wishes to understand this noble act of worship in greater depth and to incorporate it into their daily routine. It serves as both an inspirational guide and a practical manual for performing the Night Prayer correctly and with proper understanding.`,
    metaDescription: "Qiyam ul Layl is a detailed guide to the Islamic Night Prayer covering its spiritual virtues, practical method, rulings, and the significance of pre-dawn worship."
  },

  // ─── 13. Qiyamat ───
  {
    slug: "qiyamat",
    description: `Qiyamat by Darussalam Publishers is an Urdu-language book that provides a comprehensive discussion of the Islamic belief in the Day of Judgment (Yawm al-Qiyamah), one of the six articles of faith in Islam. The belief in the Hereafter — that all human beings will be resurrected after death and held accountable for their deeds — is a central pillar of Islamic theology. This book explores this fundamental doctrine in depth, drawing upon the Quran, authentic Hadith, and the explanations of classical Islamic scholars to present a thorough and faith-affirming treatment of the subject.

The book begins by establishing the theological importance of belief in Qiyamat, explaining that it is mentioned repeatedly in the Quran alongside belief in Allah, the angels, the scriptures, and the prophets. The Quran addresses the subject of the Hereafter in hundreds of verses, and the Prophet Muhammad (peace be upon him) frequently reminded his companions of the reality of the Day of Judgment. The book presents the Islamic perspective that belief in the Hereafter is not merely an abstract theological concept but a practical reality that should shape a Muslim's conduct, priorities, and moral outlook.

The text covers the major events and signs leading up to the Day of Judgment as described in Islamic eschatology. This includes the minor signs (ashraat al-sughra) — such as the spread of ignorance, the prevalence of musical instruments, the construction of tall buildings by Bedouins, and the general decline of moral standards — as well as the major signs (ashraat al-kubra) — including the appearance of the Dajjal, the descent of Prophet Isa, the emergence of Gog and Magog (Yajuj and Majuj), the rising of the sun from the west, and the beast of the earth. Each sign is discussed with reference to authentic narrations and classical scholarly works.

The book describes the events of the Day of Judgment itself — the blowing of the trumpet (Sur), the resurrection of all creation, the gathering for judgment, the weighing of deeds, the presentation of the book of deeds, the crossing of the Sirat bridge, and the intercession (shafa'ah) of the prophets and righteous believers. The descriptions of Paradise (Jannah) and Hellfire (Jahannam) are presented in detail, drawing upon the vivid Quranic imagery and the Prophet's descriptions.

Throughout the book, the emphasis is not merely on creating fear but on fostering a balanced awareness that motivates positive action. The text stresses that the remembrance of Qiyamat should inspire Muslims to engage in good deeds, seek forgiveness for their shortcomings, maintain strong moral character, and fulfill their obligations to Allah and to fellow human beings.

Qiyamat is written in clear and accessible Urdu prose, making it suitable for a general readership. It serves as an excellent educational resource for Islamic schools, madrasahs, and family study circles where the articles of Islamic faith are taught and discussed.`,
    metaDescription: "Qiyamat is a comprehensive Urdu book on the Islamic Day of Judgment covering signs of the Hour, resurrection, accountability, Paradise, and Hell based on Quran and Hadith."
  },

  // ─── 14. Qiyamat Ka Bayan ───
  {
    slug: "qiyamat-ka-bayan",
    description: `Qiyamat Ka Bayan is an Urdu-language book published by Darussalam Publishers that offers a detailed exposition of the Day of Judgment and the events of the Hereafter from an Islamic perspective. Building upon the foundational topic of eschatology (Aakhirah) in Islamic theology, this book provides a thorough narrative of what the Quran and authentic Hadith literature reveal about the end of the world, the resurrection, the Day of Judgment, and the eternal abodes of Paradise and Hellfire. The book is written in a style that combines scholarly rigor with accessible language, making it suitable for both educated readers and those new to the study of Islamic eschatology.

The book is structured around a systematic treatment of the signs of the Hour (Ashraat al-Sa'ah), beginning with the minor signs that indicate the approach of the Day of Judgment. These include social, moral, and natural phenomena described by the Prophet Muhammad (peace be upon him) — such as the prevalence of falsehood, the decrease in knowledge, the increase in trials and tribulations, the naked and destitute becoming the leaders of people, and the emergence of women in great numbers. Each sign is presented with its source narrations and explained in a way that connects it to contemporary realities, allowing readers to understand the relevance of these prophetic predictions.

The treatment of the major signs is particularly detailed, covering the appearance of the Mahdi, the emergence of the Dajjal (the False Messiah) with his powers of deception, the second coming of Prophet Isa (Jesus, peace be upon him), the release of Gog and Magog (Yajuj and Majuj), the sinking of the earth in three places, the rising of the sun from the west, and the beast of the earth. These events are described with reference to multiple authentic Hadith narrations, providing a comprehensive picture of the sequence and nature of these momentous occurrences.

The book then turns to the events of the Day of Judgment itself — the blowing of the trumpet, the death of all creation, the second blowing that resurrects the dead, the gathering of all humanity for judgment, and the presentation of deeds for accountability. The text explains the concept of the Sirat bridge stretching over Hellfire, the intercession granted to the prophets and the righteous, and the final destinations of the people of Paradise and the people of Hellfire.

A distinctive feature of Qiyamat Ka Bayan is its emphasis on the spiritual and practical implications of belief in the Hereafter. The book argues that a genuine awareness of Qiyamat transforms a believer's relationship with this world — making them more conscious of their responsibilities, more compassionate toward others, more diligent in worship, and more detached from materialism. The text draws upon the example of the companions of the Prophet, who lived with a vivid consciousness of the Day of Judgment in their daily lives.

The book is written in clear, flowing Urdu that makes complex theological concepts accessible to a wide audience. It includes extensive references to the Quran and authenticated Hadith collections, providing readers with the textual basis for each discussion. Qiyamat Ka Bayan is an ideal resource for anyone seeking to deepen their understanding of Islamic eschatology and strengthen their conviction in the realities of the Hereafter.`,
    metaDescription: "Qiyamat Ka Bayan is a thorough Urdu exposition on the Day of Judgment, covering minor and major signs, resurrection, accountability, and the eternal Hereafter."
  },

  // ─── 15. Questions & Answers on Biography of Muhammad Part I ───
  {
    slug: "questions-answers-on-biography-of-muhammad-part-i",
    description: `Questions and Answers on the Biography of Muhammad Part I is an educational reference book published by Darussalam Publishers that presents the life of the Prophet Muhammad (peace be upon him) in an engaging question-and-answer format. This pedagogical approach makes the study of Seerah (the Prophet's biography) more interactive, memorable, and accessible, particularly for students, teachers, and general readers who prefer a structured, bite-sized presentation of information over continuous narrative prose.

The book covers the early portion of the Prophet's life in this first volume, beginning with the historical and geographical context of Arabia before Islam. Questions address the lineage of the Prophet Muhammad (peace be upon him), tracing it back through the Quraysh tribe, the family of Hashim, and ultimately to Prophet Ibrahim (Abraham, peace be upon him). The circumstances of his birth, the well-known events of his infancy — including his being nursed by Halimah as-Sa'diyah in the desert of Banu Sa'd — and the remarkable incident of the splitting of his chest are all covered through carefully crafted questions and thorough answers.

The text proceeds to cover the Prophet's childhood and youth, his reputation among the Meccans as As-Sadiq (the truthful) and Al-Amin (the trustworthy), his participation in the resolution of the dispute over the placement of the Black Stone (Hajr al-Aswad) in the Ka'bah, his marriage to Khadijah bint Khuwaylid, and the spiritual retreats he undertook in the Cave of Hira before the advent of revelation. Each of these topics is presented as a question followed by a detailed answer that draws upon authentic historical sources.

The first revelation — the beginning of the prophetic mission — is covered with particular thoroughness. Questions address the identity of the angel who brought the revelation, the first verses revealed, the Prophet's response to this overwhelming experience, the role of Khadijah in comforting and supporting him, and the confirmation given by Waraqah ibn Nawfal. The subsequent period of private Da'wah, the beginning of public preaching, and the persecution faced by the early Muslims are also addressed.

The book's Q&A format is especially effective for educational settings. Teachers can use it to prepare lesson plans and quiz materials, students can use it for review and self-assessment, and study circles can use the questions as discussion prompts. Each answer is concise yet comprehensive, providing enough detail to be informative without becoming overwhelming.

The content is sourced from the most reliable works of Seerah, including authenticated Hadith collections and the writings of classical Seerah scholars. This ensures that the information presented is historically accurate and consistent with the established Islamic tradition. The book avoids weak or fabricated narrations, maintaining a high standard of scholarly integrity throughout.

Questions and Answers on the Biography of Muhammad Part I is an excellent resource for Islamic schools, madrasahs, homeschooling families, and anyone engaged in the systematic study of the Prophet's life. The Q&A format makes it particularly suitable for younger readers and those who are encountering the study of Seerah for the first time, while the depth of the answers ensures that even experienced readers will find value in this reference work.`,
    metaDescription: "Questions & Answers on Biography of Muhammad Part I presents the Prophet's early life in Q&A format, covering lineage, birth, marriage to Khadijah, and first revelation."
  },

  // ─── 16. Questions & Answers on the Biography of Muhammad (PBUH) (2 vol) ───
  {
    slug: "questions-answers-on-the-biography-of-muhammad-pbuh-2-vol",
    description: `Questions and Answers on the Biography of Muhammad (PBUH) is a two-volume set published by Darussalam Publishers that provides a comprehensive overview of the Prophet Muhammad's life in the popular question-and-answer format. This two-volume collection extends the scope of the single-volume Part I to cover the Prophet's entire biography from birth to passing, making it one of the most complete Q&A references on Seerah available. The set is designed for students, educators, researchers, and general readers who want a thorough, well-organized, and reliable guide to the life of the final messenger of Islam.

The two volumes together encompass every major phase of the Prophet's life. Volume one covers the pre-Islamic period in Arabia, the Prophet's lineage and birth, his childhood and youth, his marriage to Khadijah, the first revelation and the beginning of the prophetic mission, the persecution of the early Muslims in Mecca, the migration to Abyssinia, and the events leading up to the Hijrah (migration to Medina). Volume two continues with the establishment of the Islamic state in Medina, the major battles (Badr, Uhud, Khandaq, and others), the Treaty of Hudaybiyyah, the conquest of Mecca, the Farewell Pilgrimage, the Prophet's illness, and his passing.

Each volume contains hundreds of carefully selected questions that address the most important events, figures, and themes in the Prophet's biography. The questions range from factual inquiries (When did a specific event occur? Who was present?) to analytical questions (What was the significance of this event? What lessons can be derived from the Prophet's conduct in this situation?). The answers are thorough, well-sourced, and written in clear English prose that makes complex historical narratives easy to follow.

The biographical information in this set is drawn from the most authoritative sources of Seerah, including the six major Hadith collections (Kutub al-Sittah), the classical works of Ibn Hisham, Ibn Sa'd, al-Tabari, and Ibn Kathir, and respected modern Seerah scholarship. The compilers have taken care to rely primarily on authenticated narrations and to indicate where scholarly differences of opinion exist regarding specific details.

The Q&A format of this two-volume set makes it an exceptionally versatile reference. It can be used as a textbook in Islamic schools and Seerah courses, a study guide for competitive quiz programs, a quick-reference tool for researchers and writers, a discussion resource for study circles and Halaqah groups, and a self-study tool for individuals who want to systematically learn about the Prophet's life. The table of contents and the logical arrangement of questions by chronological order make it easy to locate information on any specific topic.

Each volume is printed with a clean, readable layout that facilitates both extended reading and quick reference. The questions are clearly separated from the answers, and key terms and names are consistently used throughout, helping readers build familiarity with the important figures and events of Seerah.

This two-volume set is a valuable addition to any Islamic library. It provides a comprehensive, reliable, and accessible guide to the life of the Prophet Muhammad (peace be upon him) that serves the needs of students, teachers, and general readers alike.`,
    metaDescription: "Questions & Answers on Biography of Muhammad (PBUH) 2-volume set is a comprehensive Seerah reference covering the Prophet's complete life story in detailed Q&A format."
  },

  // ─── 17. Questions & Answers on the Mothers of the Believers ───
  {
    slug: "questions-answers-on-the-mothers-of-the-believers",
    description: `Questions and Answers on the Mothers of the Believers is a specialized educational book published by Darussalam Publishers that focuses on the wives of the Prophet Muhammad (peace be upon him), known in Islamic terminology as Ummahat al-Mu'minin (the Mothers of the Believers). This title, derived from the Quranic verse in Surah Al-Ahzab, signifies the elevated status and deep respect accorded to these women in Islam. The book presents their lives, contributions, and significance in an accessible question-and-answer format that makes the material easy to study, teach, and reference.

The book covers all of the Prophet's wives, providing biographical sketches that address their backgrounds, lineage, marriages to the Prophet, key events in their lives, their character traits, and their contributions to Islamic scholarship and society. Each wife is given individual attention, reflecting the unique role that each played in the Prophet's household and in the broader Islamic community.

The first wife, Khadijah bint Khuwaylid, receives extensive coverage as the first person to accept Islam, the Prophet's most steadfast supporter during the most difficult years of the Da'wah, and a woman whose memory the Prophet cherished throughout his life. The book addresses questions about her background as a successful businesswoman, the nature of her marriage to the Prophet, her role in supporting the early Muslim community, and the children she bore.

The subsequent marriages are also covered in detail, with each wife's story presented within its proper historical context. The book explains the circumstances and wisdom behind each marriage, addressing common questions and misconceptions. The military, political, and social contexts of these marriages are explored, helping readers understand the strategic and humanitarian dimensions that accompanied each union.

The book dedicates significant attention to Aisha bint Abu Bakr, highlighting her exceptional intelligence, her vast knowledge of Hadith, her role as a scholar and teacher of the Muslim community, and her participation in key events of Islamic history. The book addresses the various questions that are commonly asked about her life and the controversies that surround certain events, presenting balanced and well-sourced answers.

Other wives covered include Sawdah bint Zam'ah, Hafsa bint Umar, Zaynab bint Khuzaymah, Umm Salamah Hind bint Abi Umayyah, Zaynab bint Jahsh, Juwayriyyah bint al-Harith, Umm Habibah Ramla bint Abi Sufyan, Safiyyah bint Huyayy, and Maymunah bint al-Harith. Each biography includes information about their family background, their life before and after marriage to the Prophet, and their contributions to Islamic history.

The Q&A format makes this book particularly useful for educational settings. Teachers can use the questions to structure lessons and prepare assessments, while students can use the answers as study material. The book is also valuable for study circles, family reading, and personal research. The information is sourced from authenticated Hadith collections and reliable historical works, ensuring accuracy and scholarly integrity.`,
    metaDescription: "Questions & Answers on the Mothers of the Believers is a detailed Q&A book about the Prophet's wives, covering their biographies, contributions, and significance in Islamic history."
  },

  // ─── 18. Questions & Answers on the Rightly Guided Caliphs ───
  {
    slug: "questions-answers-on-the-rightly-guided-caliphs",
    description: `Questions and Answers on the Rightly Guided Caliphs by Darussalam Publishers is a comprehensive educational book that explores the lives and legacies of the Khulafa ar-Rashidun — the four Caliphs who succeeded the Prophet Muhammad (peace be upon him) as leaders of the Muslim community. Abu Bakr as-Siddiq, Umar ibn al-Khattab, Uthman ibn Affan, and Ali ibn Abi Talib are collectively known as the Rightly Guided Caliphs, and their thirty-year period of leadership is regarded as the golden age of Islamic governance and an essential reference point for understanding Islamic political and social principles.

The book presents the biographies of all four Caliphs in a structured question-and-answer format that makes the material accessible, organized, and easy to retain. For each Caliph, the questions cover a wide range of topics including their lineage and tribal background, their early life and conversion to Islam, their close relationship with the Prophet Muhammad (peace be upon him), their character traits and personal qualities, their major achievements and policies as Caliph, and the challenges they faced during their respective periods of leadership.

The section on Abu Bakr as-Siddiq covers his status as the first adult male to accept Islam, his close companionship with the Prophet, his role during the Prophet's final illness, his swift response to the apostasy wars (Ridda wars), the compilation of the Quran into a single written volume, and the launch of military campaigns that expanded the Islamic state into Persia and the Byzantine territories. Questions address the basis for his selection as Caliph and the unity of the Muslim community during his brief but momentous tenure.

The treatment of Umar ibn al-Khattab covers his transformation from a fierce opponent of Islam to one of its greatest champions, his appointment by Abu Bakr as successor, his remarkable administrative reforms, the establishment of the Hijri calendar, the expansion of the Islamic state to its greatest territorial extent, and his personal piety and justice. The book addresses his system of governance, his treatment of non-Muslim subjects, and the circumstances of his assassination.

The biography of Uthman ibn Affan covers his early acceptance of Islam, his two marriages to the Prophet's daughters, his role in financing military campaigns, his expansion of Islamic territories, the standardization of the Quranic text, and the challenges and conspiracies that emerged during his Caliphate. The book presents a balanced account of the fitnah (civil strife) that occurred during his time and addresses the controversies surrounding his martyrdom.

The section on Ali ibn Abi Talib covers his upbringing in the Prophet's household, his early conversion, his bravery in battle, his marriage to the Prophet's daughter Fatimah, his scholarly contributions, and the complex challenges of his Caliphate including the battles of the Camel and Siffin. The book addresses these sensitive topics with scholarly balance and relies on authenticated historical sources.

Questions and Answers on the Rightly Guided Caliphs is an essential reference for Islamic schools, Seerah study circles, and anyone interested in the foundational period of Islamic history. The Q&A format makes it suitable for teaching, self-study, and quick reference, while the depth of content ensures that even advanced readers will find it informative and valuable.`,
    metaDescription: "Questions & Answers on the Rightly Guided Caliphs covers the lives of Abu Bakr, Umar, Uthman, and Ali in Q&A format, detailing their governance, achievements, and legacy."
  },

  // ─── 19. Questions and Answers of Islam (Part 2) ───
  {
    slug: "questions-and-answers-of-islam-part-2",
    description: `Questions and Answers of Islam (Part 2) by Darussalam Publishers is the second installment in a multi-part educational series designed to address common questions about Islamic beliefs, practices, and teachings. This volume continues the format established in Part 1, presenting a wide range of questions on diverse Islamic topics followed by clear, well-researched, and comprehensively sourced answers. The book serves as a valuable reference for anyone seeking reliable information on matters of Islamic faith, worship, social conduct, and contemporary issues.

The book covers a broad spectrum of Islamic knowledge organized into thematic sections. Topics addressed in this volume include questions about the pillars of Islam and Iman (faith), the detailed rulings of daily worship such as prayer (Salah), fasting (Siyam), charity (Zakat), and pilgrimage (Hajj), the etiquette and rules governing various aspects of a Muslim's life, and discussions of contemporary issues that Muslims encounter in modern society. Each section is designed to build upon the knowledge presented in earlier parts, creating a cumulative learning experience.

The questions in this volume range from fundamental inquiries that new Muslims or young students might have — such as the meaning of specific Islamic terms, the reasons behind certain practices, and the basic rulings of worship — to more complex and nuanced questions that address scholarly differences of opinion, the wisdom behind Islamic rulings, and the application of Islamic principles to everyday situations. This diversity of question types ensures that the book is useful for readers at different levels of knowledge and understanding.

Each answer is supported by references to the Quran, authentic Hadith, and the consensus of Islamic scholars. The book draws upon the opinions of the four major schools of Islamic jurisprudence (Hanafi, Maliki, Shafi'i, and Hanbali) where relevant, presenting different scholarly views in a respectful and balanced manner. Where the scholars agree, the book presents the consensus position; where they differ, it acknowledges the differences and explains the basis for each opinion, allowing readers to understand the breadth of Islamic scholarly tradition.

The writing style of the book is clear, concise, and accessible. Complex theological and juristic concepts are explained in straightforward language that avoids unnecessary technical jargon while maintaining scholarly accuracy. This makes the book suitable for a wide audience, including students at Islamic schools, participants in study circles, new Muslims seeking foundational knowledge, and parents who want reliable answers to the questions their children might ask about Islam.

The practical orientation of the book is one of its strongest features. Rather than limiting itself to theoretical discussions, Questions and Answers of Islam (Part 2) addresses the real questions that Muslims encounter in their daily lives — questions about prayer times, fasting rules, business transactions, family relations, social etiquette, and ethical conduct. This makes the book not just an academic reference but a practical guide that readers can consult whenever they encounter a question about Islamic practice.

As the second volume in the series, this book complements the material covered in Part 1 and prepares the reader for the subsequent volumes that continue this educational journey. Together, the series provides a comprehensive foundation in Islamic knowledge that equips readers to practice their faith with understanding and confidence.`,
    metaDescription: "Questions and Answers of Islam (Part 2) addresses common Islamic questions on worship, beliefs, social conduct, and daily life with Quran and Hadith-based answers."
  },

  // ─── 20. Quran (17a QK) ───
  {
    slug: "quran-17a-qk",
    description: `This Quran edition, identified by the code 17a QK, is a standard-format publication of the Holy Quran by Darussalam Publishers, one of the most recognized names in Islamic publishing worldwide. Darussalam's Quran editions are widely used in homes, mosques, Islamic schools, and educational institutions due to their reliable text, clear typography, and adherence to the Uthmani script tradition — the standardized orthographic convention used in the writing of the Quran since the time of the third Caliph, Uthman ibn Affan (may Allah be pleased with him).

The text of this Quran follows the Hafs an-Asim reading (Qira'ah), which is the most widely recited and studied reading of the Quran across the Muslim world. The script is set in a clear, well-proportioned Arabic typeface that ensures readability while maintaining the traditional aesthetic qualities associated with Quranic manuscripts. The Uthmani script preserves the specific orthographic conventions that are part of the Quran's transmitted form, including the exact placement of dots, vowel marks, and other diacritical notations that are essential for correct recitation.

The 17a QK designation refers to a specific size and format within Darussalam's Quran publication catalog. This particular format is designed to balance portability with readability, making it suitable for both daily use and travel. The compact size allows it to be easily carried in a bag or kept on a bedside table, while the print quality ensures that the Arabic text remains legible for readers of all ages. This makes it an ideal choice for individuals who want a practical Quran that can accompany them throughout their day — whether at home, at work, during travel, or at the mosque for congregational prayers.

The Quran's binding and paper quality are consistent with Darussalam's publishing standards, designed to withstand regular handling and use. The cover is sturdy and protective, and the pages are produced on paper that is suitable for the sacred text — balancing durability with a pleasant tactile quality that makes page-turning and reading comfortable over extended periods.

This edition is suitable for a wide range of users. Students of Quran memorization (Hifz) can use it as a daily reading and review copy. Individuals engaged in regular Quran recitation will appreciate the clear script and accurate markings. Teachers and imams can use it for instruction and reference. Families can keep it as a household Quran for daily reading and for teaching children. The standard Hafs reading makes it compatible with virtually all Quranic study materials, Tajweed guides, and audio recitation recordings available today.

As a product from Darussalam Publishers, this Quran edition benefits from the publisher's reputation for accuracy and quality in Islamic text production. The text has been carefully reviewed and proofread to ensure the highest standards of fidelity to the established Mushaf (written Quran) tradition. This commitment to accuracy and quality has made Darussalam's Quran publications a trusted choice for Muslims seeking a reliable edition of the holy book.`,
    metaDescription: "Quran 17a QK is a standard-format Holy Quran by Darussalam Publishers in Uthmani script with Hafs reading, designed for daily recitation, study, and travel use."
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
