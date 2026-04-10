const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  // ============================================================
  // 1. Rabbana (Qurani Duayein) — Prayer Supplication
  // ============================================================
  {
    slug: "rabbana-qurani-duayein",
    description: `The Quran contains a remarkable collection of supplications that begin with the word "Rabbana" (Our Lord), each one carrying profound spiritual weight and offering believers a direct template for meaningful communication with Allah. The Rabbana Qurani Duayein compilation gathers every instance of these prayers from the Quranic text, presenting them in a structured and accessible format that makes it easy for readers to incorporate them into their daily worship routine. Each dua is provided with its original Arabic text alongside an Urdu translation and contextual explanation, ensuring that the reader understands not only the words being recited but the circumstances in which they were originally revealed and the deeper meanings embedded within them.

These Quranic supplications cover an enormous range of human needs and spiritual aspirations. Some address the desire for guidance and steadfastness on the straight path, while others seek forgiveness for sins, protection from trials, patience during hardship, or blessings in this world and the hereafter. The beauty of these duas lies in the fact that they are divinely chosen words — they represent the exact phrases that Allah Himself has placed in the Quran, making them among the most powerful and accepted forms of prayer a Muslim can offer. By learning and regularly reciting these supplications, a believer connects directly with the language of the Quran and the prayers of the prophets and righteous individuals who came before.

The book is designed for a wide readership. It serves as an excellent resource for individuals who want to memorize Quranic duas for daily use, for teachers who wish to instruct their students in the art of supplication, and for families looking to establish a practice of collective dua in their homes. The clear typography and organized layout make it easy to navigate, with each supplication numbered and referenced to its specific Quranic verse. Whether read during the quiet hours of Tahajjud, after the five daily prayers, or during moments of personal difficulty, the Rabbana collection provides a spiritually enriching companion that deepens one's relationship with Allah through the most beautiful and effective words of prayer found in the Quranic revelation.`,
    metaDescription: "Rabbana Qurani Duayein collects all Quranic supplications starting with Rabbana, with Arabic text and Urdu translation for daily worship."
  },

  // ============================================================
  // 2. Rah-e-Nijat — General Islamic Book
  // ============================================================
  {
    slug: "rah-e-nijat",
    description: `Rah-e-Nijat, meaning "The Path to Salvation," is a comprehensive Islamic guidebook in Urdu that addresses the fundamental principles a Muslim must understand and practice to achieve success in both this world and the hereafter. Written in a clear and methodical style, the book covers a wide spectrum of religious knowledge, including the pillars of faith (Iman), the pillars of Islam, the core tenets of righteous conduct, and the common pitfalls that lead believers astray. It is designed to serve as a practical manual for everyday life, offering actionable guidance on how to navigate moral challenges, fulfill religious obligations, and cultivate a strong spiritual foundation.

The book places particular emphasis on the concept of salvation as understood in Islamic theology — not merely as an abstract theological idea but as a lived reality that depends on the choices a person makes each day. The author draws extensively from the Quran and Hadith to establish each point, grounding the discussion in authentic scriptural evidence while presenting the material in a manner that is accessible to readers of all educational backgrounds. Topics covered include the correct understanding of Tawheed (monotheism), the importance of following the Sunnah of the Prophet Muhammad (SAW), the dangers of innovations (bid'ah) in religious practice, and the rights and responsibilities that Islam places upon every individual in their relationships with Allah, their family, and society at large.

Rah-e-Nijat is especially valuable for readers who are seeking a structured overview of Islamic teachings without having to consult multiple specialized texts. It consolidates essential knowledge into a single volume, making it an ideal reference for household libraries, Islamic schools, and study circles. The book's straightforward language and logical progression from foundational concepts to more detailed discussions make it suitable for both beginners who are building their understanding of Islam and more advanced readers who want a concise review of core principles. Each chapter addresses a specific theme, allowing readers to focus on areas of particular interest or need. Whether used for personal study, group discussion, or as a teaching resource, Rah-e-Nijat provides the kind of grounded, evidence-based Islamic guidance that helps believers stay on the straight path.`,
    metaDescription: "Rah-e-Nijat is a comprehensive Urdu Islamic guidebook covering pillars of faith, righteous conduct, and the path to salvation based on Quran and Hadith."
  },

  // ============================================================
  // 3. Rahbar o Rahnuma — Prophets Seerah
  // ============================================================
  {
    slug: "rahbar-o-rahnuma",
    description: `Rahbar o Rahnuma, which translates to "The Guide and the Guided," is an insightful Urdu-language work that explores the life and character of the Prophet Muhammad (SAW) through the lens of his unparalleled role as humanity's ultimate guide. The book examines how the Prophet (SAW) not only received divine guidance through revelation but also embodied that guidance in every aspect of his personal conduct, social interactions, and leadership. By studying his life as both the recipient and the perfect exemplar of Allah's message, readers gain a deeper appreciation of how his Seerah (biography) serves as a timeless blueprint for individual and collective success.

The narrative is structured around key themes rather than a strictly chronological account, allowing the author to draw connections between different phases of the Prophet's life and extract practical lessons that remain relevant today. Chapters address his method of calling people to Islam (da'wah), his approach to building community and establishing justice, his compassion toward the weak and marginalized, his patience in the face of opposition, and his wisdom in resolving conflicts. The book also discusses the ways in which the Companions absorbed his guidance and transmitted it to subsequent generations, creating a chain of mentorship and spiritual development that continues to inform Islamic practice to this day.

What sets Rahbar o Rahnuma apart from standard Seerah works is its focus on the practical application of prophetic guidance. Rather than simply recounting historical events, the author consistently draws attention to how the Prophet's example can be implemented in contemporary life — in family relationships, business dealings, community service, and personal spiritual development. The writing is supported by authentic Hadith references and scholarly commentary, making it a reliable resource for students of Islamic knowledge. It is well-suited for readers who want to move beyond a surface-level understanding of the Prophet's life and engage with his Seerah as a living, actionable guide for navigating the challenges of modern existence while remaining faithful to Islamic principles.`,
    metaDescription: "Rahbar o Rahnuma explores the Prophet Muhammad's (SAW) life as the ultimate guide, drawing practical lessons from his Seerah for contemporary Muslim life."
  },

  // ============================================================
  // 4. Rahber-e-Kamil — Biography
  // ============================================================
  {
    slug: "rahber-e-kamil",
    description: `Rahber-e-Kamil, meaning "The Perfect Guide," is a distinguished Urdu biography of the Prophet Muhammad (SAW) that provides one of the most detailed and thoroughly researched accounts of his life available in the Urdu language. Drawing from the earliest and most reliable sources of Islamic history — including the works of Ibn Ishaq, Ibn Hisham, Imam at-Tabari, and the major Hadith collections — the author constructs a comprehensive narrative that spans from the pre-Islamic context of Arabia through every significant phase of the Prophet's mission, culminating in his passing and the immediate aftermath. The book is widely regarded as an essential text for anyone seeking a serious and academically grounded understanding of Seerah.

The depth of Rahber-e-Kamil lies not only in its chronological thoroughness but in the way it contextualizes events within their broader historical and social settings. The author carefully explains the tribal dynamics of Arabian society, the religious landscape that preceded Islam, and the geopolitical forces at play during the Prophet's era. This contextual approach allows readers to understand why certain decisions were made, how specific challenges were addressed, and what strategies the Prophet (SAW) employed to establish and strengthen the Muslim community. Battles, treaties, migrations, and social reforms are all treated with scholarly rigor, supported by chains of narration and source citations that enable readers to evaluate the authenticity of the material for themselves.

Beyond its historical value, Rahber-e-Kamil serves as a profound source of spiritual inspiration. The book highlights the Prophet's unwavering trust in Allah, his extraordinary patience through years of persecution and hardship, his mercy toward allies and adversaries alike, and his ability to transform a fractured society into a unified community bound by faith and justice. It is used as a textbook in many Islamic seminaries and educational institutions across the Urdu-speaking world, and it remains equally valuable for general readers who want to deepen their connection with the Prophet's life. The multi-volume format allows for a level of detail that single-volume biographies cannot achieve, making it the definitive Seerah reference for Urdu readers.`,
    metaDescription: "Rahber-e-Kamil is a comprehensive multi-volume Urdu Seerah of Prophet Muhammad (SAW) based on classical Islamic sources with scholarly depth."
  },

  // ============================================================
  // 5. Rahmat Kay Farishty aap kay Pass — Reference
  // ============================================================
  {
    slug: "rahmat-kay-farishty-aap-kay-pass",
    description: `Rahmat Kay Farishty Aap Kay Pass, meaning "The Angels of Mercy are with You," is a unique and spiritually uplifting Urdu book that explores the Islamic concept of angels (mala'ika) and their constant, unseen presence in the life of every believer. Rooted entirely in Quranic verses and authentic Hadith narrations, the book provides a detailed account of the various roles angels play in human existence — from the moment of creation through death and into the hereafter. The central thesis of the book is that believers are never truly alone; angels of mercy accompany them, record their deeds, protect them from harm, and pray for their forgiveness, providing a profound source of comfort and motivation for righteous living.

The book systematically covers the major categories of angels mentioned in Islamic scripture. It discusses Jibril (Gabriel), the angel of revelation, and his role in conveying Allah's messages to the prophets. It covers Mika'il, the angel entrusted with managing natural phenomena such as rain and sustenance. It addresses Israfil, the angel responsible for blowing the trumpet on the Day of Judgment. And it provides detailed information about the angels of death, the guardian angels assigned to each individual (Kiraman Katibin), the angels of the grave (Munkar and Nakir), and the angels who participate in the cosmic events of the hereafter. Each category is explained with reference to specific Quranic ayat and verified Hadith, making the text both informative and theologically sound.

What makes this book particularly engaging is its ability to translate abstract theological concepts into emotionally resonant narratives. The author uses vivid but restrained language to help readers visualize the angelic realm without crossing into speculation or unfounded embellishment. The book emphasizes the practical implications of belief in angels — how awareness of their presence should encourage good conduct, discourage sin, and provide solace during times of grief or difficulty. It is an excellent resource for families, teachers, and anyone who wants to strengthen their understanding of one of the six articles of Islamic faith. The clear Urdu prose and well-organized chapters make it accessible to readers of all ages and backgrounds.`,
    metaDescription: "Rahmat Kay Farishty Aap Kay Pass explores angels in Islam through Quran and Hadith, detailing their roles and unseen presence in every believer's life."
  },

  // ============================================================
  // 6. Ramadan — An Opportunity to Connect With Your Lord — Ramadan
  // ============================================================
  {
    slug: "ramadan-an-opportunity-to-connect-with-your-lord",
    description: `Ramadan: An Opportunity to Connect with Your Lord is an English-language guide that frames the month of fasting as one of the most precious spiritual opportunities in a Muslim's life. Rather than treating Ramadan as a mere ritual obligation, the book presents it as a divinely designed period of intensive spiritual renewal — a yearly retreat that Allah offers to every believer as a chance to reset their relationship with Him, cleanse their heart, and emerge as a stronger, more conscious Muslim. The writing style is motivational yet grounded in solid Islamic scholarship, making it suitable for readers who want both spiritual inspiration and authentic religious guidance.

The book is organized around the key dimensions of Ramadan worship. It provides detailed guidance on fasting (sawm), including the fiqh rulings related to who must fast, what breaks the fast, and how to handle common scenarios and medical conditions. It covers the Taraweeh prayer, explaining its significance, the recommended manner of its performance, and the spiritual rewards associated with it. Substantial attention is given to the Night of Decree (Laylatul Qadr), which the Quran describes as better than a thousand months — the author explains how to recognize it, how to maximize worship during it, and why seeking it during the last ten nights is so strongly emphasized in the Sunnah.

Beyond the acts of worship themselves, the book addresses the inner dimensions of Ramadan that many Muslims overlook. It discusses the importance of sincerity (ikhlas), the cultivation of patience and gratitude, the avoidance of sins of the tongue and eyes, and the practice of self-reflection and repentance. The author provides practical tips for managing time effectively during Ramadan, balancing worship with work and family responsibilities, and maintaining the spiritual momentum gained during the month after Ramadan has ended. Chapters on dua (supplication) provide specific prayers and formulae from the Quran and Sunnah that are particularly recommended during Ramadan. Whether you are a new Muslim experiencing your first Ramadan or a seasoned practitioner looking to take your worship to the next level, this book offers the structure, knowledge, and encouragement needed to make the most of this blessed month.`,
    metaDescription: "A comprehensive English guide to Ramadan covering fasting rulings, Taraweeh, Laylatul Qadr, spiritual renewal, and practical worship tips."
  },

  // ============================================================
  // 7. Ramadan — Rules and Related Issues — Ramadan
  // ============================================================
  {
    slug: "ramadan-rules-and-related-issues",
    description: `Ramadan: Rules and Related Issues is an English-language reference work that provides a clear, systematic treatment of the jurisprudence (fiqh) of fasting during the month of Ramadan. Published by Darussalam, this book is designed for Muslims who want to understand the legal and practical dimensions of fasting without ambiguity or confusion. It addresses every major category of question that arises during Ramadan, from the basic obligations of the fasting person to the more complex scenarios involving medical conditions, travel, pregnancy, and other exceptional circumstances.

The book follows a well-structured methodology, presenting each ruling with reference to the primary sources of Islamic law — the Quran, the authenticated Sunnah of the Prophet Muhammad (SAW), and the scholarly consensus of the early Muslim community. Where there is a difference of opinion among the schools of fiqh, the author presents the various positions with their respective evidences, allowing the reader to understand the basis of each view. Topics covered include the precise definition of the fasting period (from dawn to sunset), the intention (niyyah) required for a valid fast, things that invalidate the fast and things that are permissible during fasting, the rulings for those who are ill, elderly, traveling, pregnant, or nursing, the expiation (kaffarah) required for intentionally breaking the fast, and the rules governing the payment of fidya on behalf of those who are permanently unable to fast.

In addition to the core legal discussion, the book includes chapters on related Ramadan issues such as the sighting of the new moon (hilal) and its role in determining the start and end of the month, the virtues and recommended acts of worship during Ramadan, the fiqh of Iftar and Suhoor, and the guidelines for Taraweeh prayer. The language used throughout is precise and accessible, avoiding unnecessary jargon while maintaining scholarly accuracy. This makes the book suitable both for general readers who want a straightforward understanding of the rules and for students of Islamic knowledge who need a reliable fiqh reference for Ramadan. It is a practical handbook that belongs in every Muslim household, providing authoritative answers to the questions that inevitably arise during the fasting month.`,
    metaDescription: "Ramadan Rules and Related Issues is an English fiqh reference covering fasting obligations, exemptions, kaffarah, moon sighting, and Taraweeh."
  },

  // ============================================================
  // 8. Ramadan al Mubarak (Ahkaam-o-Masail) — Fiqh
  // ============================================================
  {
    slug: "ramadan-al-mubarak-ahkaam-o-masail",
    description: `Ramadan al Mubarak: Ahkaam-o-Masail is a detailed Urdu-language book that addresses the rulings (ahkaam) and practical issues (masail) related to the blessed month of Ramadan. As a fiqh-focused text, it provides authoritative guidance on every aspect of fasting, drawing its content primarily from the Quran, the verified Hadith of the Prophet Muhammad (SAW), and the established principles of Islamic jurisprudence. The book is structured to serve as a comprehensive handbook that Muslims can consult throughout Ramadan whenever a question arises about the correctness of their fast or the permissibility of a particular action.

The book methodically covers the fundamental requirements of a valid fast, including the conditions under which fasting becomes obligatory, the correct time for Suhoor (pre-dawn meal) and Iftar (breaking the fast), the things that nullify the fast such as eating, drinking, and intentional vomiting, and the distinction between major and minor breakers of the fast. Separate chapters are devoted to the rulings for special situations: the elderly and chronically ill who may feed a poor person instead of fasting, pregnant and nursing women, travelers, and those facing medical emergencies. The author also addresses contemporary questions that are frequently asked in modern contexts, such as the use of inhalers, injections, blood tests, and other medical procedures during fasting hours, providing clear answers grounded in fiqh principles.

Beyond the purely legal aspects, the book includes sections on the spiritual virtues (faza'il) of Ramadan, the significance of Laylatul Qadr, the recommended acts of worship such as increased Quran recitation, charity, and night prayers, and the etiquettes of fasting that enhance its spiritual rewards. The discussion on Zakat al-Fitr (Sadaqatul Fitr) provides clear guidance on who must pay it, what constitutes a valid payment, and when it must be disbursed. Written in straightforward Urdu that is accessible to readers without formal Islamic education, the book is equally valuable for scholars seeking a quick fiqh reference, Imams preparing Ramadan sermons, and families who want to ensure their Ramadan worship is conducted correctly and in accordance with the Shariah.`,
    metaDescription: "Ramadan al Mubarak Ahkaam-o-Masail is a comprehensive Urdu fiqh guide covering fasting rulings, medical exemptions, Zakat al-Fitr, and virtues."
  },

  // ============================================================
  // 9. Ramadan al Mubarak main Karne Wale Kaam — Ramadan
  // ============================================================
  {
    slug: "ramadan-al-mubarak-main-karne-wale-kaam",
    description: `Ramadan al Mubarak Main Karne Wale Kaam is a practical Urdu guidebook that focuses specifically on the virtuous deeds and recommended acts of worship that Muslims should perform during the blessed month of Ramadan. While many books concentrate on the legal rulings of fasting, this title takes a complementary approach by emphasizing the spiritual activities that maximize the rewards and blessings of Ramadan — the good deeds (a'maal) that transform the month from a period of mere abstention into a season of intensive spiritual growth and nearness to Allah.

The book provides a detailed, actionable plan for Ramadan worship. It covers the importance of reciting and reflecting upon the Quran, which was revealed in this month, and offers practical suggestions for completing a full recitation during Ramadan. It discusses the Taraweeh prayer in depth, including its format, the number of rak'ahs, and the spiritual benefits of praying it consistently throughout the month. The significance of Tahajjud (the night prayer) during Ramadan receives special attention, as do the last ten nights, which contain Laylatul Qadr — a night described in the Quran as being better than a thousand months. The author provides specific dua recommendations, dhikr formulas, and acts of charity that are particularly meritorious during Ramadan.

The book also addresses the importance of maintaining good character during fasting, reminding readers that abstaining from food and drink is only one dimension of the fast — controlling the tongue, lowering the gaze, and avoiding anger and gossip are equally essential. It provides guidance on preparing for Ramadan in advance, setting realistic spiritual goals, and avoiding common pitfalls such as excessive eating at Iftar or neglecting sleep to the point of being unable to perform worship effectively. Special sections discuss the recommended practices for Eid preparation, the payment of Sadaqatul Fitr before the Eid prayer, and how to sustain the spiritual gains of Ramadan after the month has concluded. The book is written in an encouraging, motivational style that inspires readers to make the most of every moment of this precious month.`,
    metaDescription: "A practical Urdu guide to virtuous Ramadan deeds including Quran recitation, Taraweeh, Tahajjud, Laylatul Qadr, charity, and good character."
  },

  // ============================================================
  // 10. Ramadan Bachat Deal - Economy 2 — Packages
  // ============================================================
  {
    slug: "ramadan-bachat-deal-economy-2",
    description: `The Ramadan Bachat Deal — Economy 2 is a curated bundle of essential Islamic books packaged together to provide a comprehensive Ramadan reading and worship companion at an accessible price point. Designed specifically for the blessed month, this collection brings together eight carefully selected titles from Darussalam's catalog that collectively cover the major themes a Muslim needs to focus on during Ramadan: fasting rulings, prophetic duas, night worship, monotheism, prophetic biography, women's hadith guidance, Zakat and charity, and the merits of Nabuwat (prophethood).

The bundle includes Qiyam-ul-Lail, which provides guidance on the night prayer and its significance during Ramadan. It contains Ramadan al Mubarak Main Karne Wale Kaam, which outlines the recommended deeds and worship practices for the fasting month. Ramadan al Mubarak Ahkaam-o-Masail is included as the fiqh reference for understanding fasting rules and related issues. Hisnul Muslim (Fortress of the Muslim) offers a daily dua companion with authenticated supplications for every occasion. The Zakat, Ushr, and Sadaqatul Fitr book provides comprehensive guidance on all forms of obligatory and voluntary charity. Kitab-ut-Tauheed reinforces the foundational principle of Islamic monotheism. Tajaliyat-e-Nabuwat covers the magnificent aspects of prophethood, and Khawateen ke Liye Hadith ki Kitab offers a hadith-based guide specifically tailored for women.

This Economy 2 package is particularly well-suited for families who want to build an Islamic home library that serves the needs of all household members during Ramadan. The selection covers spiritual, legal, and devotional dimensions, ensuring that readers have access to guidance for every aspect of their Ramadan experience. Having these books available in a single bundle makes it convenient to distribute among family members, assign readings for study circles, or use as gifts for relatives and neighbors during the month of blessings. Each book in the collection is produced with Darussalam's characteristic quality — clear printing, durable binding, and well-organized content — making this a practical and lasting investment for any Muslim household.`,
    metaDescription: "Ramadan Bachat Deal Economy 2 is a curated 8-book Islamic bundle covering fasting rulings, duas, Tauheed, Seerah, and charity for Ramadan."
  },

  // ============================================================
  // 11. Ramadan Excellent Merits and Virtuous Deeds — Fiqh
  // ============================================================
  {
    slug: "ramadan-excellent-merits-and-virtuous-deeds",
    description: `Ramadan: Excellent Merits and Virtuous Deeds is a focused Urdu-language work that compiles the virtues (faza'il) and meritorious deeds associated with the month of Ramadan from authentic Islamic sources. The book serves as a motivational companion during the fasting month, reminding readers of the extraordinary spiritual rewards that Allah has attached to Ramadan and encouraging them to make the most of this limited opportunity for earning divine blessings. Drawing from verified Hadith narrations, the author presents a compelling case for treating Ramadan as the most valuable spiritual season in the Islamic calendar.

The book opens by establishing the foundational merits of Ramadan through the words of the Prophet Muhammad (SAW), including the famous Hadith in which he announces that the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained during this month. Subsequent chapters detail the specific rewards for fasting — including the Hadith in which Allah declares that fasting is for Him and He Himself grants its reward — and the multiplied rewards for prayers, charity, Quran recitation, and other acts of worship performed during Ramadan. The special status of Laylatul Qadr receives detailed treatment, with the author explaining its significance, the signs associated with it, and the types of worship recommended during the last ten nights.

The book also addresses the virtuous deeds that Muslims are encouraged to perform during Ramadan, going beyond the obligatory fast to include voluntary prayers, increased charity, feeding the fasting person, I'tikaf (spiritual retreat in the mosque), and the recitation and study of the Quran. The author provides Hadith-based encouragement for each of these acts, demonstrating how they contribute to spiritual elevation and divine proximity. Practical advice is woven throughout the text, helping readers develop a structured plan for their Ramadan worship that balances obligatory acts with voluntary devotion. The language is inspirational without being exaggerated, and every claim is properly sourced from authentic Hadith collections. This makes the book suitable for use in Ramadan preparation seminars, mosque study circles, family reading sessions, and personal spiritual planning.`,
    metaDescription: "Ramadan Excellent Merits and Virtuous Deeds compiles authentic Hadith about Ramadan's spiritual rewards, Laylatul Qadr, and meritorious deeds in Urdu."
  },

  // ============================================================
  // 12. Ramadan Ky Ahkam O Masail — Darussalam Publishers
  // ============================================================
  {
    slug: "ramadan-ky-ahkam-o-masail",
    description: `Ramadan Ky Ahkam O Masail is an Urdu-language guide that provides a thorough and accessible treatment of the rulings (ahkam) and practical issues (masail) pertaining to the month of Ramadan. Published by Darussalam, this book addresses the fiqh of fasting in a question-and-answer format that makes it easy for readers to quickly find answers to the specific situations they encounter during the fasting month. The Q&A structure is particularly practical because it anticipates the real-world questions that ordinary Muslims face, covering common scenarios as well as less frequently discussed edge cases.

The book covers the essential prerequisites for fasting, including the Islamic definition of dawn (fajr) and sunset (maghrib), the requirement of making a daily intention, and the conditions under which fasting becomes obligatory or optional. It provides detailed rulings on things that invalidate the fast — such as intentional eating and drinking — and distinguishes them from actions that are makruh (disliked) but do not break the fast. The medical section addresses contemporary questions about using eye drops, ear drops, nasal sprays, asthma inhalers, blood tests, intravenous drips, and dental procedures during fasting hours, presenting fiqh-based answers that help Muslims navigate modern healthcare without compromising their fast.

Special attention is given to the rulings for individuals in exceptional circumstances: the traveler, the elderly, the chronically ill, pregnant and nursing women, and those experiencing temporary sickness. The book explains the concepts of qada (making up missed fasts) and fidya (feeding a poor person in lieu of fasting) with clarity and precision. Additional chapters cover the Zakat al-Fitr obligation, the sighting of the Ramadan moon, the etiquettes of Suhoor and Iftar, and the recommended acts of worship during Ramadan. Each answer is supported by references to the relevant Quranic verses, Hadith narrations, and fiqh opinions, giving the reader confidence in the accuracy of the guidance provided. The book is an essential Ramadan companion for Urdu-speaking households, mosques, and Islamic educational institutions.`,
    metaDescription: "Ramadan Ky Ahkam O Masail is a practical Urdu Q&A guide on Ramadan fasting rulings, medical exemptions, Zakat al-Fitr, and moon sighting."
  },

  // ============================================================
  // 13. Ramadan Work Book — Children
  // ============================================================
  {
    slug: "ramadan-work-book",
    description: `The Ramadan Work Book is an interactive, activity-based educational resource designed specifically for Muslim children to engage with the blessed month of Ramadan in a meaningful and enjoyable way. Recognizing that children learn best through hands-on participation rather than passive listening, this workbook transforms the concepts of fasting, prayer, charity, and good character into age-appropriate activities that children can complete independently or with minimal parental guidance. It serves as an excellent tool for parents and teachers who want to help children develop a positive and enthusiastic relationship with Ramadan from an early age.

The workbook is filled with a diverse range of activities that cater to different learning styles and age groups. It includes coloring pages featuring Ramadan-themed illustrations such as mosques, lanterns, dates, and Quran stands, which help younger children associate Ramadan with positive visual imagery. Tracing and writing activities introduce children to key Ramadan vocabulary and duas in Arabic and Urdu, reinforcing language skills alongside religious education. Maze puzzles, word searches, and matching games make learning about Islamic concepts fun and interactive, while comprehension exercises and short answer sections encourage children to think critically about what they have learned.

One of the workbook's most valuable features is its inclusion of daily trackers and checklists. Children can track their daily prayers, Quran recitation, acts of kindness, and other good deeds throughout Ramadan, creating a visual record of their spiritual progress that motivates continued effort. The book also includes sections on the story of Ramadan's revelation, the significance of Laylatul Qadr, the importance of Zakat and charity, and the celebration of Eid-ul-Fitr — all presented in simple, child-friendly language that young readers can understand and relate to. Activities involving dua memorization help children learn essential supplications with proper Arabic text and Urdu translations.

The workbook is printed on quality paper with a durable binding that withstands daily use by young hands. It is ideal for use at home, in Islamic Sunday schools, during Ramadan camps, and as a gift for children at the beginning of the fasting month. By making Ramadan learning interactive and enjoyable, this workbook helps establish lifelong habits of worship and spiritual awareness in the next generation of Muslims.`,
    metaDescription: "The Ramadan Work Book is an interactive activity book for Muslim children with coloring, puzzles, dua memorization, and daily worship trackers."
  },

  // ============================================================
  // 14. Rasool Allah (SAW) Kay Sawalat aur Sahaba Kay Jawaab — Seerah
  // ============================================================
  {
    slug: "rasool-allah-saw-kay-sawalat-aur-sahaba-kay-jawaab",
    description: `Rasool Allah (SAW) Kay Sawalat aur Sahaba Kay Jawaab, meaning "The Questions of the Messenger of Allah and the Answers of the Companions," is a remarkable Urdu work that presents a unique and often overlooked dimension of the Prophet Muhammad's (SAW) teaching methodology. Rather than focusing solely on the questions that the Companions posed to the Prophet, this book collects instances in which the Prophet himself asked questions — testing the understanding of his followers, provoking thought, stimulating discussion, and drawing out wisdom from those around him. This pedagogical approach reveals the Prophet not merely as a transmitter of knowledge but as an extraordinary teacher who actively engaged his students in the learning process.

Each chapter of the book presents a specific question asked by the Prophet (SAW) along with the response given by one or more Companions, followed by an analysis of the lesson embedded within that exchange. The questions range from matters of faith and theology to practical guidance on worship, ethics, and social conduct. Some questions were designed to assess the depth of a Companion's understanding, while others served to correct misconceptions, introduce new concepts, or reinforce previously taught principles. The responses of the Companions — which include figures such as Abu Bakr, Umar, Uthman, Ali, Aisha, Abu Hurairah, and many others — demonstrate not only their individual intelligence and spiritual insight but also the quality of the education they received directly from the Prophet.

The author provides detailed commentary on each exchange, explaining the context in which the question was asked, the significance of the Companion's answer, and the broader Islamic principle that the exchange illustrates. This commentary is supported by references to classical Hadith collections and scholarly works of Tafsir and Seerah. The book is particularly valuable for teachers, Imams, and educators who can draw upon the Prophet's questioning techniques to improve their own teaching methods. It is equally beneficial for general readers who will gain a deeper appreciation of the dynamic, interactive relationship between the Prophet and his Companions. The clear Urdu prose and well-organized format make it accessible to a wide audience while maintaining the scholarly depth that serious students of Islamic knowledge demand.`,
    metaDescription: "A unique Urdu Seerah book where Prophet Muhammad (SAW) asked questions to his Companions, revealing his remarkable teaching methodology."
  },

  // ============================================================
  // 15. Rasool Allah Ke Aansoo — Biography
  // ============================================================
  {
    slug: "rasool-allah-ke-aansoo",
    description: `Rasool Allah Ke Aansoo, meaning "The Tears of the Messenger of Allah," is an emotionally powerful Urdu book that explores the instances in the life of the Prophet Muhammad (SAW) where he was moved to tears. Through these deeply personal moments, the book reveals a side of the Prophet's character that is often underemphasized — his profound compassion, his capacity for deep emotional engagement, and his tender humanity that coexisted with his unwavering strength as the final messenger of Allah. Each chapter documents a specific occasion on which the Prophet wept, providing the full context of the event, the reason for his tears, and the lessons that Muslims can draw from his emotional responses.

The book draws exclusively from authenticated Hadith narrations, presenting each incident with its complete chain of transmission and scholarly verification. The occasions covered include the Prophet's tears upon reciting certain verses of the Quran, his weeping for the deceased, his grief over the suffering of the early Muslim community, his emotional reaction to the disobedience of his followers, his tears during prayer out of reverence for Allah, and his sorrow at the passing of loved ones including his son Ibrahim and his uncle Abu Talib. Each narrative is presented with sensitivity and respect, avoiding any portrayal that could be perceived as diminishing the Prophet's dignity while still conveying the genuine depth of his emotional experience.

What makes this book particularly moving is the way it connects the Prophet's emotional expressions to broader Islamic teachings. The author explains how the Prophet's tears were never signs of weakness but rather manifestations of his complete humanity and his perfect balance between strength and compassion. His weeping for the ummah demonstrated his love for his followers. His tears during Quran recitation showed his profound engagement with Allah's words. His grief at funerals reflected his deep respect for human life and the reality of death. The book challenges the misconception that prophetic dignity requires emotional detachment, showing instead that the Prophet's ability to feel and express emotion was itself part of his divine wisdom. It is a book that will move readers to tears while simultaneously strengthening their love for the Prophet and their commitment to following his example of balanced, compassionate humanity.`,
    metaDescription: "Rasool Allah Ke Aansoo documents authenticated instances where Prophet Muhammad (SAW) wept, revealing his profound compassion and humanity."
  },

  // ============================================================
  // 16. Rasool Allah Ki Muskurahatain — Biography
  // ============================================================
  {
    slug: "rasool-allah-ki-muskurahatain",
    description: `Rasool Allah Ki Muskurahatain, meaning "The Smiles of the Messenger of Allah," is a heartwarming Urdu book that collects the authenticated narrations in which the Prophet Muhammad (SAW) smiled, laughed, or expressed joy and happiness. While many Seerah works focus on the trials, battles, and serious moments of the Prophet's life, this book deliberately highlights the lighter, more joyful aspects of his character — demonstrating that the Prophet was not a stern or unapproachable figure but a man of warmth, humor, and genuine happiness who brought light into the lives of everyone around him.

Each chapter presents a specific incident in which the Prophet smiled or laughed, accompanied by its complete Hadith reference and chain of narration. The situations range from playful exchanges with children to witty responses to his Companions' questions, from expressions of delight at good news to moments of tender amusement at the innocent actions of those around him. The book shows that the Prophet's smile was considered so characteristic that his Companions described it as being "like a burst of clouds" — a metaphor that captures both its warmth and its frequency. He was known to smile more than he frowned, and his companions described his face as constantly radiant with contentment.

The author provides thoughtful commentary on each narration, explaining the context of the event, the personalities involved, and the deeper lesson that each smile conveys. These lessons are surprisingly rich: the Prophet's smiles teach us about the importance of maintaining a positive disposition, the value of making others feel comfortable and welcomed, the permissibility of clean humor and lightheartedness within the boundaries of Islamic etiquette, and the importance of balancing seriousness with joy in our daily lives. The book also addresses the broader principle that a Muslim should not be so consumed by the seriousness of religious obligation that they forget to enjoy the blessings of life and share happiness with others.

Rasool Allah Ki Muskurahatain is an important corrective to one-dimensional portrayals of the Prophet that focus exclusively on his authority and sternness. By presenting the full spectrum of his emotional life — including his frequent smiles and laughter — the book helps readers develop a more complete and relatable understanding of his character. It is an ideal gift for families, a wonderful resource for Friday sermons, and a source of personal inspiration for anyone who wants to cultivate the Prophet's beautiful balance of seriousness and joy in their own life.`,
    metaDescription: "Rasool Allah Ki Muskurahatain collects authenticated Hadith about Prophet Muhammad's (SAW) smiles, humor, and joyful moments with commentary."
  },

  // ============================================================
  // 17. Rasul Allah Ke 200 Sunehre Irshadat (Arabic) — Reference
  // ============================================================
  {
    slug: "rasul-allah-ke-200-sunehre-irshadat-arabic",
    description: `Rasul Allah Ke 200 Sunehre Irshadat — Arabic Edition is a carefully curated collection of two hundred of the most impactful and universally applicable sayings of the Prophet Muhammad (SAW), presented entirely in Arabic script. The title "Sunehre Irshadat" translates to "Golden Teachings," reflecting the editor's selection criterion: each Hadith in this collection represents a piece of prophetic guidance that is concise yet profoundly comprehensive — a saying that, in just a few words, encapsulates a major principle of Islamic faith, worship, ethics, or social conduct. The Arabic edition is specifically designed for Arabic-speaking readers and students who want to engage with the Prophet's words in their original linguistic form.

The Hadiths included in this collection span every major area of Islamic life. Some address the fundamentals of faith and the relationship between the believer and Allah — such as the famous narration about actions being judged by intentions, the Hadith about the superiority of the one who is mindful of Allah, and the narration about the seven categories of people who will be shaded by Allah on the Day of Judgment. Others focus on interpersonal ethics — kindness to parents, honesty in trade, the rights of neighbors, the importance of keeping family ties, and the prohibition of backbiting and envy. Yet another group addresses personal development — the encouragement to seek knowledge, the virtue of patience, the importance of moderation, and the warning against arrogance and worldly attachment.

Each Hadith is presented with its Arabic text in clear, well-vocalized script that facilitates correct pronunciation for students of the language. The sayings are numbered for easy reference, and the collection is organized thematically so that readers can locate guidance on specific topics quickly. Brief explanatory notes accompany each narration, providing context about when and why the Prophet said those words, which Companion narrated it, and how it has been understood by classical scholars. The book is an excellent resource for Arabic-language Islamic schools, for memorization programs, and for anyone who wants to keep a compact collection of the Prophet's most essential teachings close at hand. Its selection methodology ensures that every Hadith included is both authentic in its chain of transmission and universal in its applicability to Muslims of every era and circumstance.`,
    metaDescription: "Arabic edition of 200 golden Hadith of Prophet Muhammad (SAW) covering faith, ethics, worship, and social conduct in clear Arabic script."
  },

  // ============================================================
  // 18. Rasul Allah Ke 200 Sunehre Irshadat (Pashto) — Reference
  // ============================================================
  {
    slug: "rasul-allah-ke-200-sunehre-irshadat-pashto",
    description: `Rasul Allah Ke 200 Sunehre Irshadat — Pashto Edition brings the timeless wisdom of the Prophet Muhammad (SAW) to Pashto-speaking Muslims through a carefully selected compilation of two hundred essential Hadith narrations. This edition maintains the same rigorous selection criteria as the Arabic and Urdu versions, choosing sayings that are brief in wording but vast in meaning — prophetic instructions that can transform a person's understanding of Islam and guide them toward a more righteous and fulfilling life. The Pashto translation makes this invaluable collection accessible to millions of readers in Afghanistan, Khyber Pakhtunkhwa, and Pashtun communities worldwide.

The book covers the full range of Islamic teachings through its curated Hadith selection. It includes sayings about the foundations of Islamic belief, the importance of sincerity in worship, the rights of Allah over His servants and the rights of servants over Allah, the virtues of good character and the vices to be avoided, the importance of family bonds and community responsibility, and the spiritual realities of the hereafter. The Prophet's guidance on matters such as honesty in business dealings, the treatment of women, the education of children, the care of orphans, and the duty to enjoin good and forbid evil are all represented in this collection. Each Hadith was chosen because it addresses a principle that is relevant to every Muslim regardless of their specific circumstances.

The Pashto translation is rendered in clear, natural language that captures both the literal meaning and the spirit of the original Arabic text. Each Hadith is accompanied by its Arabic original, allowing bilingual readers to compare the two and students of Arabic to use the Pashto translation as an aid to comprehension. The narrations are organized into thematic sections that make it easy for readers to find guidance on specific topics, and each Hadith is numbered for convenient reference. Brief contextual notes explain the circumstances under which each saying was uttered, the Companion who narrated it, and the practical implications of the Prophet's words. The book serves as an ideal daily reader — Pashto-speaking Muslims can read one or two Hadith each day, gradually building a comprehensive understanding of the Prophet's guidance over the course of several months. It is an essential addition to the library of any Pashto-speaking Muslim household, mosque, or educational institution.`,
    metaDescription: "Pashto edition of 200 golden Hadith of Prophet Muhammad (SAW) with Arabic text, covering faith, ethics, worship, and daily life guidance."
  },

  // ============================================================
  // 19. Rasul Allah Ke 200 Sunehre Irshadat (Urdu) — Reference
  // ============================================================
  {
    slug: "rasul-allah-ke-200-sunehre-irshadat-urdu",
    description: `Rasul Allah Ke 200 Sunehre Irshadat — Urdu Edition is one of the most popular and widely circulated Hadith collections in the Urdu-speaking Islamic world. It presents a handpicked selection of two hundred sayings of the Prophet Muhammad (SAW) that are distinguished by their conciseness, depth, and universal applicability. The title "Sunehre Irshadat" (Golden Teachings) accurately reflects the editorial philosophy behind this compilation: every included Hadith is a gem of wisdom that can fundamentally reshape a reader's understanding of Islam and their approach to living as a conscious Muslim.

The Urdu edition is particularly valuable because of the quality of its translation and the clarity of its presentation. Each Hadith is provided with the original Arabic text followed by a fluent, accurate Urdu translation that preserves both the literal meaning and the rhetorical beauty of the prophetic words. The collection is organized into thematic categories that cover the core pillars of Islamic life: faith and belief, prayer and worship, character and morality, family and social relations, knowledge and education, patience and gratitude, death and the hereafter, and the virtues of various righteous acts. This thematic arrangement allows readers to find guidance on any topic of interest with ease, making the book a practical daily reference.

Brief explanatory footnotes accompany many of the narrations, providing essential context about the occasion of the Hadith's utterance, the identity of the narrator, and the scholarly interpretation of its meaning. The book includes narrations that have become foundational to Islamic education across South Asia — such as the Hadith on intentions, the Hadith on perfection of character, the Hadith on the rights of Muslims over one another, and the Hadith on the signs of a hypocrite. These are the sayings that shape the moral compass of Urdu-speaking Muslims from childhood through adulthood.

The physical production of this edition reflects Darussalam's commitment to quality: clear typography, vocalized Arabic text for correct pronunciation, durable binding, and a compact size that makes it convenient for daily carrying and reading. It is widely used in madrassas, Islamic schools, and mosque study circles across Pakistan and India, and it serves as an excellent introduction to Hadith literature for readers who are beginning their journey into Islamic knowledge. For more advanced readers, it provides a concise reference collection of the Prophet's most essential teachings — a treasury of wisdom that rewards repeated reading and deep contemplation throughout one's life.`,
    metaDescription: "Urdu edition of 200 golden Hadith of Prophet Muhammad (SAW) with Arabic text, fluent translation, and thematic daily Islamic reference."
  },

  // ============================================================
  // 20. Rational & Benefits of Salaat — Darussalam Publishers
  // ============================================================
  {
    slug: "rational-benefits-of-salaat",
    description: `Rational and Benefits of Salaat is an English-language book that presents a thoughtful, multifaceted exploration of the Islamic prayer (Salaat) — examining it not only as a religious obligation but as a practice with profound rational, physical, psychological, social, and spiritual dimensions. Published by Darussalam, this work is designed to deepen the reader's understanding and appreciation of the daily prayer, transforming it from a routine act of worship into a conscious, meaningful practice that enriches every aspect of a Muslim's life. The book is addressed both to practicing Muslims who want to enhance the quality of their prayers and to inquisitive non-Muslims who seek to understand the wisdom behind one of Islam's most central institutions.

The book is structured around several key themes. The "rational" dimension explores the logical coherence of the prayer system — why five daily prayers at specific times, why particular physical movements and recitations, and how the structure of the prayer reflects the fundamental relationship between the Creator and His creation. The author argues that the design of Salaat reflects a profound understanding of human psychology, with the regular intervals preventing spiritual neglect and the physical postures — standing, bowing, prostrating, and sitting — embodying the full spectrum of human submission to Allah. The "benefits" section presents a detailed analysis of the positive effects that regular prayer has on an individual's life, including its role as a source of stress relief and mental clarity, its physical benefits through the controlled movements and postures, its function as a daily reminder of moral accountability, and its power to build discipline and consistency in a person's character.

The social dimensions of Salaat receive substantial attention. The book discusses how congregational prayers create community bonds, how the Friday prayer serves as a weekly gathering that strengthens social cohesion, and how the prayer's emphasis on equality — with all worshippers standing shoulder to shoulder regardless of wealth, status, or ethnicity — reinforces the Islamic principle of universal human dignity. The spiritual benefits are explored through an examination of the Quranic verses and Hadith narrations that describe Salaat as a light, a purification of the soul, a means of drawing closer to Allah, and the first thing a person will be questioned about on the Day of Judgment.

The writing style is clear and analytical, avoiding both excessive sentimentality and dry academic formality. Each chapter is supported by references to the Quran, authentic Hadith, and, where relevant, contemporary scientific research on the physical and psychological effects of meditative practices. The book includes a glossary of Islamic terms and a guide to the basic steps of performing the prayer, making it accessible to readers who are new to the subject. It is an ideal resource for Islamic schools, da'wah programs, personal study, and as a gift for new Muslims who are learning to establish their prayer practice.`,
    metaDescription: "Rational and Benefits of Salaat explores the logical, physical, psychological, social, and spiritual dimensions of Islamic prayer in English."
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
    console.log('Updated:', item.slug);
  }
  console.log('Done. Total:', updates.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
