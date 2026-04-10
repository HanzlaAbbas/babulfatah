/**
 * SEO Description Expansion Script - Final Batch
 * Expands all 828 products with descriptions under 180 words to 200+ words
 * Uses category-specific content templates with product-aware customization
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load products needing expansion
const products = require('./short-descriptions-all.json');

// ============================================================
// CATEGORY-SPECIFIC EXPANSION POOLS
// Each category has multiple expansion paragraphs that can be
// appended to existing descriptions based on product context
// ============================================================

const categoryExpansions = {
  // --- BOOK CATEGORIES ---
  'Biography': [
    'The biographical tradition in Islamic literature serves as a vital bridge connecting modern Muslims with the luminaries of their rich heritage. Through carefully documented accounts of the lives of the Prophet Muhammad (peace be upon him), his noble companions, and the great scholars who followed, readers gain not merely historical knowledge but a living connection to the faith that transformed civilizations. Each life story offers practical wisdom for navigating contemporary challenges while remaining anchored in timeless Islamic principles. Whether you are a student of Islamic history, a parent seeking role models for your children, or a seeker of spiritual inspiration, biographical works remain among the most powerful tools for strengthening one\'s faith and understanding of Islam\'s transformative message.',
    'Islamic biographical literature represents one of the most enduring and influential genres within the broader Islamic scholarly tradition. From the earliest seerah compilations to contemporary biographical dictionaries, Muslim scholars have meticulously preserved the lives of those who exemplified the teachings of Islam in its purest form. These works offer readers an unparalleled window into the social, political, and spiritual dimensions of early Muslim society, while simultaneously providing timeless lessons in leadership, patience, justice, and unwavering commitment to divine guidance. The careful study of Islamic biographies cultivates both the mind and the heart, making it an essential pursuit for every serious student of Islamic knowledge.',
    'The science of Islamic biography (ilm al-siyar) has been a cornerstone of Muslim scholarship since the earliest days of Islam, serving as both a historical record and a source of spiritual nourishment. Through the meticulously preserved accounts of the lives of the Prophet, his companions, the righteous predecessors, and the great imams of Islamic history, Muslims across the centuries have found guidance, inspiration, and practical models for living according to divine principles. These biographical works transcend mere storytelling; they represent a sophisticated scholarly methodology for preserving authentic knowledge and making it accessible to future generations of believers.',
  ],
  'Tafseer': [
    'The science of Quranic exegesis (tafseer) stands as one of the most noble and essential disciplines within Islamic scholarship, providing the interpretive framework through which Muslims understand the divine message of the Holy Quran. Rooted in classical methodologies that draw upon the explanations of the Prophet Muhammad (peace be upon him), his companions, and the generation of righteous successors, authentic tafseer works illuminate the deeper meanings, contextual backgrounds, and practical applications of Quranic verses. Studying tafseer transforms one\'s relationship with the Quran from mere recitation to profound comprehension, enabling believers to implement divine guidance in every aspect of their daily lives.',
    'Quranic interpretation has been a central concern of Muslim scholars since the revelation of the Holy Quran, resulting in a rich and diverse body of exegetical literature that spans over fourteen centuries of Islamic intellectual history. From the classical tafseer traditions that emphasize narration-based explanations (tafseer bil-ma\'thoor) to more analytical approaches that explore linguistic, rhetorical, and thematic dimensions of the divine text, the tafseer tradition offers readers multiple pathways to deeper understanding. Each approach contributes unique insights while remaining faithful to the fundamental principle that the Quran is best understood through the lens of authentic prophetic and scholarly tradition.',
    'A comprehensive tafseer serves as an indispensable companion for anyone seeking to engage deeply with the Holy Quran. By explaining the circumstances of revelation (asbab al-nuzool), clarifying ambiguous verses, resolving apparent contradictions, and drawing out the practical legal and spiritual implications of Quranic passages, a well-crafted tafseer bridges the gap between the seventh-century Arabic text and the contemporary reader\'s experience. This interpretive tradition ensures that the Quran\'s timeless guidance remains accessible, relevant, and transformative for Muslims of every generation and cultural background.',
  ],
  'Hadith': [
    'The science of hadith represents one of Islam\'s most sophisticated intellectual achievements, encompassing the meticulous preservation, classification, authentication, and explanation of the sayings and actions of the Prophet Muhammad (peace be upon him). Through a rigorous system of isnad (chain of narration) verification developed by generations of dedicated scholars, Muslims have been able to preserve the prophetic tradition with remarkable accuracy. The study of hadith literature not only provides practical guidance for every aspect of Muslim life but also cultivates a deep appreciation for the scholarly devotion that has safeguarded Islamic knowledge across the centuries.',
    'Hadith collections form the second most important source of Islamic guidance after the Holy Quran, providing detailed explanations of Quranic injunctions, practical demonstrations of prophetic methodology, and comprehensive guidance for personal conduct, family life, business transactions, and community affairs. The great compilers of hadith — such as Imam Bukhari, Imam Muslim, Imam Abu Dawood, Imam Tirmidhi, Imam Nasa\'i, and Imam Ibn Majah — spent years traveling across the Muslim world to collect and verify narrations, establishing standards of scholarship that remain unmatched in human intellectual history.',
    'The preservation and study of prophetic traditions has been the life\'s work of countless Muslim scholars who dedicated their lives to ensuring that the authentic guidance of the Prophet Muhammad (peace be upon him) would remain accessible to future generations. Through the development of a sophisticated system of narrational criticism, classification, and contextual analysis, the hadith scholars created an intellectual framework that enables contemporary Muslims to distinguish authentic prophetic guidance from weak or fabricated reports with remarkable confidence. Engaging with hadith literature is essential for anyone seeking a complete understanding of Islamic teachings.',
  ],
  'Fiqh': [
    'Islamic jurisprudence (fiqh) provides the practical framework through which Muslims implement divine guidance in their daily lives, covering everything from acts of worship and personal conduct to family law, commercial transactions, and international relations. Rooted in the primary sources of the Quran and Sunnah, and developed through centuries of scholarly effort employing established principles of legal reasoning (ijtihad), the fiqh tradition offers comprehensive guidance that balances the immutable principles of divine law with the changing circumstances of human society. Studying fiqh empowers Muslims to fulfill their religious obligations with confidence and understanding.',
    'The development of Islamic jurisprudence represents one of humanity\'s most remarkable intellectual achievements, producing a comprehensive legal system that addresses virtually every aspect of human existence. From the foundational work of the four great imams — Abu Hanifah, Malik, al-Shafi\'i, and Ahmad ibn Hanbal — to the sophisticated legal commentaries and methodological treatises produced by subsequent generations of scholars, the fiqh tradition demonstrates Islam\'s capacity to provide detailed, practical guidance for the complexities of human life while remaining firmly anchored in divine revelation and prophetic tradition.',
    'Understanding Islamic jurisprudence is essential for every Muslim who wishes to live according to the teachings of Islam in a knowledgeable and conscientious manner. Fiqh texts cover the complete spectrum of Muslim practice: the daily prayers, fasting, charity, pilgrimage, marriage, divorce, inheritance, business ethics, food regulations, and much more. By studying fiqh from authentic sources, Muslims gain the knowledge and confidence needed to navigate contemporary life challenges while maintaining their commitment to Islamic principles and values.',
  ],
  'Aqeedah': [
    'Islamic creed and theology (aqeedah) forms the foundation upon which every other aspect of a Muslim\'s faith and practice is built. A sound understanding of the core beliefs of Islam — including the oneness of Allah, the prophethood of Muhammad (peace be upon him), the reality of the unseen world, and the concepts of divine decree and the hereafter — is considered by scholars to be the most essential knowledge a Muslim can acquire. The study of aqeedah protects believers from error and confusion while strengthening the intellectual and spiritual foundations of their faith.',
    'The science of Islamic theology has occupied the attention of Muslim scholars since the earliest days of Islam, resulting in a rich body of literature that addresses the most fundamental questions of human existence: the nature of God, the purpose of creation, the relationship between divine will and human responsibility, and the ultimate destiny of humankind. By engaging with classical and contemporary aqeedah texts, Muslims develop a coherent and intellectually robust understanding of their faith that can withstand the challenges posed by competing ideologies and philosophical systems.',
  ],
  'Faith Aqeedah': [
    'Strengthening one\'s faith and understanding of Islamic theology is a lifelong journey that every Muslim must undertake with sincerity and dedication. The science of aqeedah addresses the fundamental beliefs that define a Muslim\'s relationship with Allah, including the attributes of God, the concept of tawheed (divine unity), the role of the prophets, the reality of the hereafter, and the importance of following authentic Islamic guidance. Books on Islamic faith provide the intellectual tools needed to maintain strong iman in the face of modern challenges and doubts.',
    'Islamic faith literature serves as both an educational resource and a spiritual tonic for believers seeking to deepen their connection with Allah and strengthen their commitment to Islamic principles. By presenting the core tenets of Islam in clear, accessible language supported by evidence from the Quran and authentic hadith, these works help readers build a solid foundation of belief that can withstand the intellectual and spiritual challenges of contemporary life. Whether you are a new Muslim seeking foundational knowledge or a seasoned student of Islamic studies, works on aqeedah remain essential reading.',
  ],
  'Seerah': [
    'The study of the Prophet\'s biography (seerah) is widely regarded by Islamic scholars as one of the most beneficial pursuits a Muslim can undertake, offering a comprehensive model of human excellence that encompasses every dimension of life — spiritual, social, political, economic, and personal. Through the meticulously preserved accounts of the life of Muhammad (peace be upon him), readers gain practical insights into leadership, compassion, justice, perseverance, and the art of balancing worldly responsibilities with spiritual aspirations. The seerah literature connects modern Muslims with their prophetic heritage in the most direct and meaningful way possible.',
    'Prophetic biography represents the cornerstone of Islamic historical consciousness and spiritual education. The detailed accounts of the Prophet Muhammad\'s life — from his noble lineage and upbringing in Mecca through the trials of prophecy, the migration to Medina, the establishment of the Islamic state, and the final farewell pilgrimage — provide an unparalleled template for individual and communal excellence. Seerah studies illuminate the Quran by showing how its teachings were implemented in practice, making the study of prophetic biography an essential complement to Quranic studies.',
  ],
  'History': [
    'Islamic history encompasses one of the most remarkable civilizations in human experience, spanning over fourteen centuries of intellectual achievement, artistic innovation, scientific discovery, and cultural flourishing. From the golden age of the Abbasid caliphate to the great Ottoman, Mughal, and Andalusian civilizations, Muslim societies have made extraordinary contributions to virtually every field of human knowledge. Studying Islamic history not only preserves cultural heritage but also provides valuable lessons in governance, interfaith relations, economic development, and the role of faith in driving human progress.',
    'The study of Muslim history reveals a civilization that, at its best, represented the highest aspirations of human society — a society dedicated to justice, knowledge, spiritual growth, and the betterment of all people regardless of race, ethnicity, or social status. Through the chronicles of great Muslim historians and the analyses of contemporary scholars, readers discover how Islamic principles shaped governance, education, science, art, and commerce across diverse cultures and continents. Understanding this rich heritage empowers contemporary Muslims to draw inspiration from their past while confidently building their future.',
  ],
  'Women': [
    'Islamic literature addressing women\'s issues provides comprehensive guidance rooted in the Quran and authentic Sunnah, covering topics such as family life, personal development, spiritual growth, social responsibilities, and rights within Islamic law. Contrary to common misconceptions, Islam granted women unprecedented rights over fourteen centuries ago, including the right to education, property ownership, inheritance, and participation in public life. Contemporary Islamic publications for women aim to present this balanced perspective while addressing modern challenges with wisdom and sensitivity.',
    'The role of women in Islam has been a subject of profound scholarly attention throughout Islamic history, resulting in a rich body of literature that addresses women\'s spiritual, social, and legal rights within the Islamic framework. From the exemplary lives of Khadijah, Aisha, Fatimah, and other great women of Islam to contemporary discussions of work-life balance, education, and community participation, Islamic scholarship offers a comprehensive and empowering vision of women\'s roles that honors both their dignity and their vital contributions to family and society.',
  ],
  'Children': [
    'Islamic children\'s literature plays a vital role in nurturing the next generation of Muslims by presenting the beauty and wisdom of Islam in age-appropriate, engaging formats. From beautifully illustrated Quran stories and prophetic biographies to interactive activity books and educational series, these publications help children develop a positive and meaningful relationship with their faith from an early age. Quality Islamic children\'s books combine entertainment with education, making learning about Islam an enjoyable experience that children eagerly anticipate.',
    'Investing in quality Islamic education for children is one of the most important responsibilities of Muslim parents, and an excellent library of age-appropriate Islamic books is an essential tool for this sacred duty. The best Islamic children\'s publications combine accurate religious content with engaging storytelling, vibrant illustrations, and interactive elements that capture young imaginations while instilling core Islamic values such as kindness, honesty, gratitude, and respect for others. These books lay the foundation for a lifelong love of learning and a strong Islamic identity.',
  ],
  'Arabic Learning': [
    'The Arabic language holds a uniquely privileged position in Islamic civilization as the language of the Holy Quran and the primary medium of Islamic scholarship throughout history. Learning Arabic opens direct access to the original sources of Islamic knowledge — the Quran, hadith collections, and classical scholarly works — enabling Muslims to engage with their faith at a much deeper level. From introductory textbooks for beginners to advanced grammatical treatises, Arabic learning materials represent one of the most important categories of Islamic educational resources.',
    'Mastery of the Arabic language has been traditionally considered one of the most important tools of Islamic scholarship, as it provides direct access to the primary sources of the faith. Arabic grammar (nahw), morphology (sarf), rhetoric (balaghah), and literature (adab) together form the linguistic foundation upon which Islamic sciences are built. Whether you are a complete beginner taking your first steps in Arabic or an advanced student seeking to perfect your understanding of classical texts, quality Arabic learning resources are essential companions on this rewarding intellectual journey.',
  ],
  'Dua Supplication': [
    'The practice of making dua (supplication) to Allah is one of the most powerful and accessible acts of worship in Islam, providing believers with a direct channel of communication with their Creator. Comprehensive dua compilations — such as the renowned Hisn al-Muslim (Fortress of the Muslim) — gather authentic supplications from the Quran and prophetic tradition, organizing them by occasion and need so that Muslims can easily find the appropriate words for every situation in life. Regular engagement with dua literature strengthens faith, cultivates humility, and deepens one\'s personal relationship with Allah.',
    'Supplication occupies a central place in Muslim spiritual practice, serving as both a structured act of worship and a spontaneous expression of human need before Allah. The Prophet Muhammad (peace be upon him) taught his companions specific supplications for every conceivable occasion — from waking and sleeping to eating, traveling, entering and leaving the mosque, facing difficulties, and expressing gratitude. Authentic dua compilations preserve this precious prophetic heritage, making it accessible to contemporary Muslims who seek to follow the prophetic example in their daily lives.',
  ],
  'Hajj Umrah': [
    'The pilgrimage to Makkah — comprising the obligatory Hajj and the recommended Umrah — represents one of the most profound spiritual experiences available to Muslims, combining physical exertion with deep spiritual reflection and communal solidarity. Comprehensive Hajj and Umrah guides provide step-by-step instructions for performing the rites correctly, along with the supplications to be recited at each stage, practical tips for managing the journey, and explanations of the historical and spiritual significance of each ritual. Proper preparation through quality guidebooks ensures that pilgrims can focus on the spiritual dimensions of their journey.',
    'Performing the pilgrimage is a once-in-a-lifetime obligation for those who are able, and thorough preparation is essential for ensuring that this sacred journey is performed correctly and its full spiritual benefits are realized. Hajj and Umrah guidebooks cover everything from the initial intention and ihram regulations to the detailed rites of tawaf, sa\'i, standing at Arafat, stoning the pillars, and animal sacrifice. They also address practical concerns such as packing lists, health precautions, and navigating the crowded holy sites, making them indispensable companions for every pilgrim.',
  ],
  'Ramadan': [
    'The blessed month of Ramadan holds a special place in the Islamic calendar as the month in which the Holy Quran was first revealed, and fasting during Ramadan is one of the five pillars of Islam. Ramadan preparation guides help Muslims make the most of this precious month by providing practical advice for spiritual preparation, meal planning, maintaining productivity while fasting, and engaging in additional acts of worship such as taraweeh prayers, Quran recitation, and charitable giving. These resources transform Ramadan from a mere exercise in abstaining from food and drink into a comprehensive program of spiritual renewal.',
    'Ramadan literature serves as an essential tool for Muslims seeking to maximize the spiritual benefits of the fasting month. Beyond the basic rules of fasting, comprehensive Ramadan guides explore the deeper dimensions of the month — its historical significance, the virtues of specific days and nights (particularly Laylat al-Qadr), the prophetic traditions regarding fasting, and practical strategies for balancing worship, work, and family responsibilities during this intensive period of spiritual devotion. Quality Ramadan resources help transform the fasting experience from a physical challenge into a profound spiritual journey.',
  ],
  'Tajweed': [
    'The science of Tajweed encompasses the precise rules governing the correct pronunciation and recitation of the Holy Quran, ensuring that each letter is articulated from its proper point of articulation with the appropriate characteristics. Proper Tajweed application transforms Quranic recitation from mere reading into a beautiful act of worship that fulfills the divine command to "recite the Quran with measured recitation." Tajweed textbooks and courses guide learners through the systematic study of articulation points (makharij), letter characteristics (sifaat), nasalization, elongation, stopping rules, and other essential recitation principles.',
    'Mastering the art of Quranic recitation through Tajweed is considered a communal obligation in Islam, as it preserves the integrity of the divine text across generations. The rules of Tajweed, derived from the oral tradition of the Quran\'s transmission, cover every aspect of proper pronunciation — from the exact points of articulation for each Arabic letter to the rules governing nasal sounds, elongation, stopping, and the qualities that distinguish similar letters from one another. Whether you are a beginner starting your Tajweed journey or an advanced student perfecting your recitation, quality Tajweed resources are essential for achieving proficiency.',
  ],
  'Translation': [
    'Quran translations play a crucial role in making the message of the Holy Quran accessible to the global Muslim community, particularly those who have not yet achieved proficiency in classical Arabic. While translations inevitably involve some degree of interpretation, the best Quranic translations are produced by scholars with deep expertise in both Arabic linguistics and Islamic sciences, ensuring that the translated text remains faithful to the original meaning while being clear and accessible to contemporary readers. A reliable translation, used alongside the Arabic text, enables Muslims worldwide to engage meaningfully with divine guidance.',
    'The availability of quality Quran translations has been instrumental in spreading Islamic knowledge to Muslims around the world who may not have access to formal Arabic education. Modern Quran translations typically include detailed explanatory footnotes, cross-references to related verses and hadith, and introductions that provide essential context for understanding each surah\'s themes and significance. Combined with the original Arabic text, these translations serve as invaluable tools for personal study, group learning circles, and academic research into Islamic scripture.',
  ],
  'Quran': [
    'The Holy Quran stands as the final and complete revelation from Allah to humanity, preserved in its original Arabic text through a divine system of memorization and transmission that has remained unbroken for over fourteen centuries. Every Quran published under scholarly supervision undergoes rigorous quality checks to ensure textual accuracy, proper formatting, and readability. From luxurious hardcover editions to portable pocket-sized volumes, from Arabic-only texts to translations in dozens of languages, the variety of Quran editions available today ensures that every Muslim can find a format that suits their needs and preferences.',
    'The preservation of the Quranic text is considered one of the greatest miracles of Islam, maintained through an unbroken chain of oral and written transmission that stretches back to the Prophet Muhammad (peace be upon him) himself. Modern Quran publications build upon this centuries-old tradition of careful preservation, incorporating color-coded tajweed guides, explanatory indexes, topic-based references, and durable binding that ensures years of daily use. Owning a quality Quran is the most fundamental investment in Islamic knowledge that any Muslim can make.',
  ],
  'Islamic Studies': [
    'Comprehensive Islamic studies curricula provide structured, systematic approaches to acquiring essential Islamic knowledge, covering the core disciplines of aqeedah (creed), fiqh (jurisprudence), seerah (prophetic biography), Quranic studies, hadith sciences, and Islamic history. These educational programs are designed to take students from foundational knowledge through progressively more advanced topics, building a well-rounded understanding of Islam that integrates theoretical understanding with practical application. Whether used in formal classroom settings or for self-study, quality Islamic studies materials provide the framework for a lifetime of learning.',
  ],
  'Pillars Of Islam': [
    'The five pillars of Islam — the declaration of faith (shahadah), prayer (salah), charity (zakat), fasting (sawm), and pilgrimage (hajj) — form the essential framework of Muslim practice and the foundation upon which a Muslim\'s entire religious life is built. Comprehensive guides to the pillars of Islam provide detailed, accessible explanations of each obligation, including the specific conditions, prerequisites, and recommended practices associated with each pillar. These works help Muslims fulfill their religious duties with knowledge, confidence, and devotion.',
    'Understanding and implementing the five pillars of Islam is the most fundamental obligation of every Muslim, and comprehensive pillar-focused literature provides the essential knowledge needed to fulfill these obligations correctly. These works cover the declaration of faith in its full theological implications, the detailed rulings of the five daily prayers, the calculation and distribution of zakat, the rules and virtues of fasting in Ramadan, and the complete rites of the Hajj pilgrimage. Authored by qualified scholars, pillar guides serve as indispensable references for Muslim households.',
  ],
  'Zakaat': [
    'Zakat, the obligatory annual charity, represents one of Islam\'s most powerful mechanisms for wealth redistribution and social justice, requiring Muslims who meet the minimum threshold to give a specified portion of their wealth to eligible recipients. Comprehensive zakat guides provide detailed calculations for different types of assets — including cash, gold, silver, business inventory, livestock, and agricultural produce — along with clear explanations of who qualifies as a recipient and the spiritual significance of this important obligation. Proper zakat calculation requires knowledge and attention to detail that these guides provide.',
  ],
  'Fasting': [
    'Fasting during the month of Ramadan and on other recommended occasions is one of the most spiritually transformative acts of worship in Islam, cultivating discipline, empathy, gratitude, and heightened God-consciousness. Fasting guides cover the detailed rulings regarding what invalidates the fast, what is permissible while fasting, the spiritual dimensions of abstaining from food and drink, and the recommended practices that maximize the fast\'s rewards. Whether you are observing Ramadan fasts, making up missed days, or engaging in voluntary fasting throughout the year, these resources provide the guidance needed.',
  ],
  'Hadith Quran & Hadith': [
    'The combined study of the Holy Quran and authentic hadith provides the most complete and authoritative understanding of Islamic teachings, as these two primary sources complement each other perfectly — the Quran provides the broad principles while the hadith supplies the detailed explanations and practical demonstrations. Publications that integrate Quranic and hadith content offer readers a holistic approach to Islamic education, enabling them to see how prophetic tradition illuminates and implements divine revelation. This integrated approach to studying Islamic sources has been the methodology of Muslim scholars for over fourteen centuries.',
  ],
  'Ahadith E Nabvi': [
    'The sayings and teachings of the Prophet Muhammad (peace be upon him), collectively known as Ahadith (or Hadith), form the second primary source of Islamic guidance after the Holy Quran. These prophetic traditions provide detailed explanations of Quranic injunctions, practical demonstrations of Islamic worship and conduct, and comprehensive guidance for every dimension of human life. Collections of ahadith, carefully authenticated by generations of hadith scholars, represent one of the most meticulously preserved bodies of religious literature in human history, offering contemporary Muslims an authentic connection to prophetic guidance.',
  ],
  'Packages': [
    'Islamic book packages and gift sets offer exceptional value by combining multiple essential titles into conveniently curated collections, making it easy to build a comprehensive Islamic library at a significant discount compared to purchasing individual volumes. These thoughtfully assembled sets typically include core reference works such as Quran, hadith collections, fiqh guides, and du\'a compilations, often presented in attractive packaging that makes them ideal gifts for new Muslims, students of knowledge, and family members. Package deals represent the most economical way to acquire a well-rounded collection of Islamic resources.',
  ],
  // --- NON-BOOK / PRODUCT CATEGORIES ---
  'Quran Rehal': [
    'A Quran rehal (stand) is both a practical accessory and a beautiful decorative item that shows reverence for the Holy Quran by keeping it elevated and properly supported during recitation. Crafted from premium materials including brass, wood, and acrylic, modern Quran stands combine traditional Islamic design aesthetics with contemporary durability. Whether placed on a prayer mat, desk, or shelf, a quality Quran rehal adds an elegant touch of Islamic culture to any space while serving the important function of protecting and displaying the Quran with the respect it deserves.',
    'The tradition of using a dedicated stand for the Holy Quran reflects the deep reverence that Muslims hold for the divine scripture, and a beautifully crafted Quran rehal makes an excellent addition to any Muslim home or office. Available in a variety of styles — from ornate brass designs with intricate jaali (lattice) work to minimalist wooden and acrylic models — Quran stands serve as both functional reading accessories and attractive decorative pieces that create an Islamic ambiance in any room.',
  ],
  'Janamaz': [
    'A high-quality prayer mat (janamaz) is one of the most essential items in a Muslim\'s daily life, providing a clean, comfortable, and designated space for performing the five daily prayers wherever one may be. Modern prayer mats combine traditional Islamic design elements with advanced materials for maximum comfort and durability. From luxurious velvet and chenille textures to lightweight portable designs suitable for travel and office use, the variety of available prayer mats ensures that every Muslim can find a design that suits their personal taste and practical needs.',
    'Prayer mats hold a special significance in Muslim culture as the personal space where believers connect with their Creator five times daily through prayer. Premium prayer mats feature thoughtful design elements including cushioned padding for joint comfort during prolonged sujood (prostration), non-slip backing for stability on smooth surfaces, and beautiful Islamic geometric or floral patterns that enhance the prayer experience. Investing in a quality prayer mat is investing in the daily comfort of your most important spiritual practice.',
  ],
  'Bakhoor': [
    'Bakhoor (Arabic incense) has been an integral part of Islamic and Arab culture for centuries, used in homes, mosques, and special occasions to create a welcoming and spiritually uplifting atmosphere. Traditional bakhoor blends premium aromatic ingredients including oud wood, sandalwood, amber, musk, rose, and various exotic resins, producing rich, complex fragrances that fill a space with warmth and tranquility. Bakhoor is traditionally burned on specially designed charcoal discs in decorative burners, releasing curls of fragrant smoke that transform any environment into a sensory oasis.',
    'The tradition of burning fragrant bakhoor is deeply rooted in Islamic culture, inspired by the prophetic recommendation to use pleasant scents. Premium bakhoor products combine natural aromatic ingredients in carefully balanced proportions, creating layered fragrances that evolve beautifully as they burn. Whether used for daily home fragrance, special occasions such as weddings and Eid celebrations, or to create a welcoming atmosphere for guests, quality bakhoor adds an unmistakable touch of Middle Eastern elegance and Islamic tradition to any space.',
  ],
  'Lifestyle': [
    'Islamic lifestyle products encompass a wide range of items designed to support and enhance a Muslim\'s daily practice of faith, from home decor featuring Quranic calligraphy and Islamic geometric patterns to personal accessories that serve as reminders of Islamic values. These products blend functionality with aesthetic beauty, allowing Muslims to express their faith through the objects they use and display in their everyday lives. Quality Islamic lifestyle products are crafted with attention to both practical utility and artistic excellence, making them excellent choices for personal use or as meaningful gifts.',
  ],
  'Attar Perfume': [
    'Attar (traditional Arabic perfume) represents one of the most cherished traditions in Islamic culture, drawing inspiration from the prophetic encouragement to use pleasant fragrances. Authentic attar is crafted from natural ingredients including essential oils extracted from flowers, herbs, woods, and resins, producing concentrated perfumes that are alcohol-free and long-lasting. The art of attar-making has been refined over centuries in the Muslim world, with each fragrance blend carrying its own unique character and spiritual significance.',
  ],
  'Health': [
    'Islamic health and wellness products draw upon the rich tradition of prophetic medicine (tibb al-nabawi), which combines the medical recommendations found in authentic hadith with natural remedies that have been used in Muslim societies for centuries. From black seed (habbatus sauda) and honey — both explicitly recommended by the Prophet Muhammad (peace be upon him) — to Zamzam water and premium dates, these natural health products offer a holistic approach to wellness that is firmly rooted in Islamic tradition and supported by modern scientific research.',
  ],
  'Tasbeeh': [
    'The tasbeeh (prayer beads or misbaha) is a beloved tool for dhikr (remembrance of Allah), used by Muslims around the world to keep count of their daily supplications and devotional phrases. Quality tasbeeh beads are crafted from a variety of materials including natural gemstones, wood, amber, and glass, each offering unique beauty and tactile qualities. Whether used during prayer, while commuting, or during quiet moments of reflection, a tasbeeh serves as a tangible reminder to maintain the habit of remembering Allah throughout the day.',
  ],
  'Arabic Car Hangings': [
    'Islamic car accessories and decorations serve as beautiful reminders of faith during daily commutes and travels, combining practical functionality with spiritual significance. Arabic car hangings featuring Quranic verses, the name of Allah, or traditional Islamic designs transform the vehicle interior into a space of spiritual awareness and tranquility. These decorative items are crafted from premium materials including crystal, metal, and wood, designed to complement any vehicle interior while providing constant visual reminders of Islamic values and divine protection.',
  ],
  'Islamic Caps/Shumagh Romal': [
    'Islamic head coverings hold both cultural and religious significance in Muslim societies worldwide, serving as expressions of faith, identity, and tradition. From the traditional white topi (prayer cap) worn during salah to the larger shemagh and ghutra styles popular across the Middle East, Islamic head coverings come in a wide variety of styles, materials, and designs to suit different occasions and personal preferences. Quality head coverings are crafted from breathable, comfortable fabrics that ensure ease of wear throughout the day.',
  ],
  'Food Items': [
    'Halal food products and traditional Islamic dietary items represent an important aspect of Muslim daily life, ensuring that food consumption adheres to Islamic dietary laws (halal) as prescribed in the Quran and explained in the hadith. From premium quality dates — a staple of the prophetic diet — to honey, olives, Zamzam water, and other traditionally significant food items, these products connect contemporary Muslims with the dietary traditions established by the Prophet Muhammad (peace be upon him) and practiced by Muslims throughout history.',
  ],
  'Healthy Food Items': [
    'Healthy food items aligned with Islamic dietary principles combine the best of traditional prophetic nutrition with modern health consciousness. The Prophet Muhammad (peace be upon him) recommended several specific foods for their health benefits, including black seed, honey, dates, olive oil, and barley, all of which have been validated by contemporary nutritional science. These premium food products allow Muslims to follow prophetic dietary recommendations while maintaining a balanced, healthy lifestyle.',
  ],
  'Miscellaneous': [
    'Bab-ul-Fatah offers a carefully curated selection of miscellaneous Islamic products that cater to the diverse needs of the Muslim community in Pakistan. Each product in our collection is selected for its quality, authenticity, and adherence to Islamic standards. Whether you are looking for a practical everyday item or a special gift that reflects Islamic values, our miscellaneous collection offers something meaningful for everyone, backed by our commitment to excellent customer service and competitive pricing.',
  ],
  'Islamic Products': [
    'Our curated collection of Islamic products encompasses a wide range of items designed to support Muslim daily life, spiritual practice, and cultural expression. Each product is carefully selected for its quality, authenticity, and alignment with Islamic values. From practical worship accessories to beautiful home decor items, these products serve as meaningful reminders of faith and excellent gifts for family and friends. Bab-ul-Fatah is committed to providing Pakistan\'s Muslim community with the finest Islamic products at competitive prices.',
  ],
  'Darul Iblagh': [
    'Darul Iblagh publications represent an important contribution to Urdu Islamic literature, providing accessible and affordable Islamic knowledge to readers across Pakistan and the broader Urdu-speaking world. Their publications cover a wide range of Islamic topics including Quranic studies, hadith, fiqh, seerah, and contemporary issues, all presented in clear, engaging Urdu prose that makes complex scholarly subjects accessible to general readers. These publications play a vital role in Islamic education and dawah within Urdu-speaking communities.',
  ],
  'Darussalam Research Center': [
    'The Darussalam Research Center is internationally recognized for producing high-quality Islamic publications in multiple languages, distinguished by their rigorous scholarship, meticulous referencing, and commitment to presenting authentic Islamic knowledge based exclusively on the Quran and authentic Sunnah. Their publications undergo thorough review by qualified scholars before publication, ensuring accuracy and reliability. From comprehensive multi-volume reference works to accessible introductory texts, Darussalam publications serve the educational needs of Muslims at every level of knowledge.',
  ],
  'Ed. Saniyasnain Khan': [
    'Saniyasnain Khan is one of the most trusted names in Islamic children\'s publishing, renowned for creating engaging, age-appropriate Islamic books that educate and inspire young readers. His publications combine beautiful illustrations, simple language, and authentic Islamic content to introduce children to the stories of the prophets, the teachings of the Quran, and the values of Islam. These books are widely used in Islamic schools, madrasas, and homes around the world, making them an excellent investment in children\'s Islamic education.',
  ],
};

// Fallback expansions for categories not explicitly listed
const fallbackExpansions = [
  'This publication represents the high standards of Islamic scholarship and publishing that Bab-ul-Fatah is committed to bringing to the Muslim community in Pakistan. Carefully reviewed and approved by qualified scholars, it presents authentic Islamic knowledge in a clear and accessible format that serves both casual readers and serious students of Islamic studies. The attention to detail in both content and production quality reflects our dedication to providing only the finest Islamic resources to our valued customers.',
  'Islamic education and knowledge acquisition are among the most highly recommended pursuits in Islam, and this publication serves as a valuable contribution to that noble endeavor. By combining authentic scholarly content with accessible presentation, it bridges the gap between academic Islamic studies and the everyday needs of Muslim readers. Whether you are building a personal Islamic library, seeking a meaningful gift, or simply expanding your knowledge of the faith, this publication offers excellent value and reliable guidance.',
  'The Islamic publishing industry has made tremendous strides in recent years, producing works of exceptional quality that rival the finest publications in any field. This title exemplifies the best of contemporary Islamic publishing, combining rigorous scholarship with attractive design and durable construction. At Bab-ul-Fatah, we are proud to offer such high-quality Islamic resources to our customers in Pakistan, supporting the community\'s pursuit of authentic Islamic knowledge with products that meet the highest standards of excellence.',
];

// ============================================================
// PRODUCT-AWARE CONTENT GENERATORS
// These functions create unique content based on product
// title, author, price, and category
// ============================================================

function generatePriceContext(price) {
  if (price >= 5000) {
    return 'This premium publication represents a significant investment in Islamic knowledge, offering exceptional scholarly content that justifies its price through the depth and breadth of its coverage. Serious students of Islamic studies will find that this comprehensive work provides years of study material and reference value that far exceeds its cost.';
  } else if (price >= 2000) {
    return 'At this competitive price point, this publication offers outstanding value for students and scholars seeking authentic Islamic knowledge. The quality of content, binding, and printing ensures that this work will serve as a reliable reference for years to come, making it a wise addition to any Islamic library.';
  } else if (price >= 800) {
    return 'Priced affordably to make Islamic knowledge accessible to all, this publication delivers excellent quality at a competitive price point. Bab-ul-Fatah is committed to ensuring that cost is never a barrier to acquiring authentic Islamic education, and this title exemplifies our mission of providing premium Islamic resources at prices that every family can afford.';
  } else {
    return 'This budget-friendly publication proves that quality Islamic content does not have to come at a premium price. Carefully produced to maintain high standards of accuracy and readability while keeping costs affordable, it represents Bab-ul-Fatah\'s commitment to making authentic Islamic knowledge accessible to every Muslim household in Pakistan.';
  }
}

function generateAuthorContext(author) {
  if (!author) return '';
  return ` Authored by the esteemed scholar ${author}, whose dedication to authentic Islamic scholarship is reflected in every page of this work, this publication carries the weight of authoritative research and faithful adherence to Islamic principles.`;
}

function generateClosingParagraph(title, price, category) {
  const closings = [
    `Order your copy of "${title}" today from Bab-ul-Fatah, Pakistan's most trusted online Islamic bookstore. We offer fast and reliable delivery across Pakistan, with secure packaging that ensures your order arrives in perfect condition. Join thousands of satisfied customers who have made Bab-ul-Fatah their preferred destination for authentic Islamic books and products. Priced at Rs. ${price.toLocaleString()}, this ${category.toLowerCase()} item is available for immediate dispatch.`,
    `Shop "${title}" online at Bab-ul-Fatah and experience the convenience of Pakistan's leading Islamic e-commerce platform. With our user-friendly website, secure payment options, and fast nationwide delivery, acquiring quality Islamic resources has never been easier. Every product is carefully inspected and packed to ensure it reaches you in pristine condition. Available now at just Rs. ${price.toLocaleString()}, with special discounts available on bulk orders.`,
    `Bab-ul-Fatah is proud to offer "${title}" as part of our extensive collection of authentic Islamic resources. Our commitment to quality, authenticity, and customer satisfaction has made us Pakistan's most trusted Islamic bookstore. Browse our complete catalog online, take advantage of our competitive pricing and nationwide delivery, and join our growing community of satisfied customers. Priced at Rs. ${price.toLocaleString()}, this item offers exceptional value for seekers of Islamic knowledge.`,
  ];
  return closings[Math.floor(Math.random() * closings.length)];
}

function generateCategoryInsight(category, title) {
  const titleLower = title.toLowerCase();
  const categoryInsights = {
    'Biography': `The life stories preserved in Islamic biographical literature offer far more than historical entertainment — they provide practical models of faith, leadership, and moral courage that remain profoundly relevant in today's world. This particular work illuminates aspects of Islamic history that are often overlooked in standard educational curricula, making it a valuable addition to any serious reader's collection.`,
    'Tafseer': `Understanding the Quran through authentic tafseer is essential for every Muslim who wishes to move beyond surface-level recitation to genuine comprehension of divine guidance. This commentary provides contextual insights that illuminate the Quran's timeless wisdom, making its profound message accessible to readers of all backgrounds and educational levels.`,
    'Hadith': `The hadith literature preserved in this collection represents a priceless inheritance from the earliest generations of Muslims, transmitted through an unbroken chain of reliable narrators spanning over fourteen centuries. Engaging with these prophetic traditions cultivates both knowledge and spiritual awareness, deepening one's connection to the prophetic heritage.`,
    'Fiqh': `Practical knowledge of Islamic jurisprudence empowers Muslims to navigate contemporary life with confidence and religious awareness. This fiqh text addresses real-world scenarios that Muslims encounter in their daily lives, providing clear, well-reasoned rulings supported by evidence from the Quran and authentic Sunnah.`,
    'Women': `This publication addresses women's issues within the Islamic framework with sensitivity, scholarship, and practical relevance, dispelling common misconceptions while presenting the authentic Islamic perspective on women's rights, roles, and spiritual equality.`,
    'Children': `Investing in quality Islamic literature for children is one of the most impactful decisions parents can make, as early exposure to Islamic knowledge in an engaging format creates a lasting foundation of faith and identity that will benefit children throughout their lives.`,
    'Seerah': `Studying the life of the Prophet Muhammad (peace be upon him) through authentic seerah literature is considered by scholars to be among the most beneficial pursuits for strengthening one's faith and understanding of Islam. This work brings the prophetic era to life with vivid detail and scholarly precision.`,
  };

  if (categoryInsights[category]) {
    return categoryInsights[category];
  }
  return '';
}

// ============================================================
// MAIN PROCESSING LOGIC
// ============================================================

function expandDescription(product) {
  const currentDesc = product.currentDesc || '';
  const wordsNeeded = Math.max(200 - product.descLen, 80); // At least 80 words of expansion
  
  // Get expansion pool for this category
  let expansions = categoryExpansions[product.category];
  if (!expansions) {
    expansions = fallbackExpansions;
  }
  
  // Pick expansion (deterministic based on product index)
  const expansionIdx = parseInt(product.id.replace(/-/g, '').slice(-8), 16) % expansions.length;
  let categoryExpansion = expansions[expansionIdx];
  
  // Add category-specific insight if available
  const categoryInsight = generateCategoryInsight(product.category, product.title);
  
  // Add author context
  const authorCtx = generateAuthorContext(product.author);
  
  // Build the expanded description
  // Strategy: Insert new content before the closing Bab-ul-Fatah paragraph
  const closingPattern = /(?:Available now at Bab-ul-Fatah|Order your copy|Shop.*Bab-ul-Fatah|Bab-ul-Fatah is proud)/i;
  
  let baseContent = currentDesc;
  let originalClosing = '';
  
  if (closingPattern.test(currentDesc)) {
    const parts = currentDesc.split(closingPattern);
    baseContent = parts[0].trim();
    originalClosing = closingPattern.exec(currentDesc)[0] + currentDesc.slice(currentDesc.indexOf(closingPattern.exec(currentDesc)[0]) + closingPattern.exec(currentDesc)[0].length);
    // Keep some text after the match
    const matchIndex = currentDesc.search(closingPattern);
    originalClosing = currentDesc.substring(matchIndex);
  }
  
  // Build new content sections
  let newContent = '';
  newContent += categoryExpansion;
  if (categoryInsight) newContent += '\n\n' + categoryInsight;
  if (authorCtx) newContent += authorCtx;
  
  // Add price context for variety
  const priceCtx = generatePriceContext(product.price);
  newContent += '\n\n' + priceCtx;
  
  // Generate fresh closing paragraph
  const freshClosing = generateClosingParagraph(product.title, product.price, product.category);
  
  // Combine everything
  let expandedDesc;
  if (baseContent && baseContent.length > 50) {
    expandedDesc = baseContent + '\n\n' + newContent + '\n\n' + freshClosing;
  } else {
    expandedDesc = newContent + '\n\n' + freshClosing;
  }
  
  // Verify word count
  const finalWords = expandedDesc.split(/\s+/).length;
  
  return {
    id: product.id,
    title: product.title,
    originalWords: product.descLen,
    expandedWords: finalWords,
    addedWords: finalWords - product.descLen,
    description: expandedDesc
  };
}

async function main() {
  console.log(`Processing ${products.length} products with short descriptions...`);
  
  let successCount = 0;
  let errorCount = 0;
  let totalAddedWords = 0;
  let stillShort = 0;
  
  const results = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const expanded = expandDescription(product);
      
      if (expanded.expandedWords < 180) {
        stillShort++;
        console.warn(`WARNING: ${product.title} still only ${expanded.expandedWords} words`);
      }
      
      results.push(expanded);
      totalAddedWords += expanded.addedWords;
      
      // Update database in batches of 20
      if ((i + 1) % 20 === 0 || i === products.length - 1) {
        const batch = results.slice(Math.max(0, results.length - 20));
        for (const item of batch) {
          await prisma.product.update({
            where: { id: item.id },
            data: { description: item.description }
          });
          successCount++;
        }
        console.log(`  Updated ${successCount}/${products.length}...`);
      }
    } catch (err) {
      errorCount++;
      console.error(`Error processing ${product.title}: ${err.message}`);
    }
  }
  
  console.log('\n=== RESULTS ===');
  console.log(`Total products processed: ${products.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Still under 180 words: ${stillShort}`);
  console.log(`Total words added: ${totalAddedWords}`);
  console.log(`Average words added per product: ${Math.round(totalAddedWords / products.length)}`);
  
  // Save results for verification
  require('fs').writeFileSync(
    'scripts/seo-expand-results.json',
    JSON.stringify(results.map(r => ({
      id: r.id,
      title: r.title,
      originalWords: r.originalWords,
      expandedWords: r.expandedWords
    })), null, 2)
  );
  console.log('\nResults saved to scripts/seo-expand-results.json');
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
