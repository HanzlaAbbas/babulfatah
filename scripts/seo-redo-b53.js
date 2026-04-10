const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  // 1. Shifa'at Ka Bayan
  {
    slug: "shifaat-ka-bayan",
    description: `Shifa'at Ka Bayan is a comprehensive Urdu-language treatise that explores one of the most essential and deeply cherished articles of Islamic belief: the concept of intercession (Shifa'at) on the Day of Judgement. Authored with scholarly precision and rooted in authentic Quranic verses and verified Hadith narrations, this book provides a thorough examination of who will be granted the right to intercede, under what conditions, and how this divine mercy operates within the framework of Allah's supreme justice and wisdom.

The book systematically addresses the different categories of intercession recognized in Islamic theology. It discusses the Great Intercession (Shifa'at al-Uzma) granted exclusively to Prophet Muhammad — peace be upon him — when the creation will be in desperate need of relief on the Day of Resurrection. It further elaborates on the intercession of other prophets, the righteous, the angels, and the martyrs, drawing from classical sources including Sahih al-Bukhari, Sahih Muslim, and the works of eminent scholars such as Imam Ibn Kathir and Imam al-Qurtubi. Each type of Shifa'at is explained with its specific context, evidences, and scholarly rulings, making the complex theological subject accessible to the general Urdu readership.

A significant portion of the book is dedicated to addressing common misconceptions and doubts that have emerged regarding intercession, particularly those raised by deviant sects. The author carefully dismantles false claims while remaining firmly anchored to the methodology of Ahl al-Sunnah wal-Jama'ah. The text clarifies that intercession is not an independent right of any creation but is entirely subject to Allah's permission, as stated in the Quran. The conditions under which a person becomes eligible to receive intercession are also outlined, emphasizing the importance of sincere Tawheed, righteous deeds, and maintaining a strong connection with Allah throughout one's life.

The writing style is clear, methodical, and engaging, making it suitable for both scholars seeking a consolidated reference and lay readers wanting to strengthen their understanding of this fundamental belief. The book serves as a powerful reminder of the boundless mercy of Allah and the honour bestowed upon His beloved Prophet and the righteous believers. It is an invaluable addition to the library of any student of Islamic knowledge, particularly those studying Aqeedah in the Urdu language.`,
    metaDescription: "Shifa'at Ka Bayan \u2013 a detailed Urdu book on Islamic intercession (Shifa'at) based on Quran and Hadith. Covers types, conditions, and scholarly rulings."
  },

  // 2. Shining Stars (2 vol)
  {
    slug: "shining-stars-2-vol",
    description: `Shining Stars Among the Prophet's Companions is a remarkable two-volume English-language series published by Darussalam that brings to life the extraordinary stories of the Sahabah — the noble companions of Prophet Muhammad — peace be upon him. These two volumes serve as a rich biographical collection, narrating the inspiring journeys of the men and women who sacrificed everything for the cause of Islam and became the guiding stars for the entire Muslim Ummah.

The first volume focuses on the early companions who embraced Islam during its most difficult and perilous phase in Makkah. Readers are introduced to figures such as Abu Bakr as-Siddiq, Umar ibn al-Khattab, Uthman ibn Affan, Ali ibn Abi Talib, and many others who stood firm against the relentless persecution of the Quraysh. Each biography is meticulously researched and presented in an engaging narrative style, drawing from classical sources such as Sirat Ibn Hisham, al-Isabah fi Tamyeez al-Sahabah by Ibn Hajar al-Asqalani, and Usd al-Ghabah by Ibn al-Athir. The accounts highlight not only the military and political contributions of these companions but also their personal piety, humility, and unwavering devotion to Allah and His Messenger.

The second volume expands the scope to include companions who played pivotal roles during the Madinan period and the subsequent expansion of the Islamic state. It features detailed accounts of military commanders, governors, scholars, and female companions whose contributions were equally significant. The stories of companions like Khalid ibn al-Walid, Saad ibn Abi Waqqas, Aisha bint Abi Bakr, and Khadijah bint Khuwaylid are told with depth and sensitivity, providing readers with well-rounded portraits of these remarkable personalities.

Each chapter is structured to provide context, chronological narrative, key lessons, and the lasting legacy of each companion. The series is designed to serve as both an educational resource and a source of spiritual inspiration. Students of Islamic history, teachers, parents, and general readers alike will find these volumes to be an indispensable reference for understanding the foundations of Islamic civilization through the lives of its earliest builders. The beautiful hardcover binding and clear typesetting make this set ideal for personal reading, classroom instruction, and gifting purposes.`,
    metaDescription: "Shining Stars (2 vol) \u2013 detailed English biographies of the Prophet's Companions by Darussalam. Covers Sahabah stories from Makkah to Madinah with classical sources."
  },

  // 3. Short Biography of the Prophet and His Ten Companions
  {
    slug: "short-biography-of-the-prophet-and-his-ten-companions",
    description: `Short Biography of the Prophet and His Ten Companions is a concise yet comprehensive English-language book that presents the essential life story of Prophet Muhammad — peace be upon him — alongside biographical sketches of the ten companions who were given the glad tidings of Paradise (Asharah Mubashsharah). Published by Darussalam, this book serves as an excellent introductory resource for readers who wish to gain a solid foundational understanding of the Prophet's seerah and the key figures of early Islam in a single, manageable volume.

The seerah section of the book covers the major milestones of the Prophet's life, beginning with his lineage and birth in Makkah, his upbringing under the care of Halimah as-Sa'diyah and his grandfather Abdul Muttalib, and the first revelation received in the Cave of Hira. The narrative continues through the years of persecution in Makkah, the historic migration to Madinah, the establishment of the first Islamic state, the major battles including Badr, Uhud, and the Trench, the Treaty of Hudaybiyyah, the Conquest of Makkah, the Farewell Pilgrimage, and ultimately the Prophet's illness and passing. Each event is presented with relevant Hadith references and historical context, making the account both informative and spiritually enriching.

The second part of the book dedicates individual chapters to each of the ten companions promised Paradise: Abu Bakr as-Siddiq, Umar ibn al-Khattab, Uthman ibn Affan, Ali ibn Abi Talib, Talhah ibn Ubaydullah, Zubayr ibn al-Awwam, Sa'd ibn Abi Waqqas, Sa'eed ibn Zayd, Abdur-Rahman ibn Awf, and Abu Ubaydah ibn al-Jarrah. Each biography highlights the companion's unique qualities, their contributions to Islam, their relationship with the Prophet, and the circumstances behind the glad tidings they received. These profiles collectively paint a vivid picture of the calibre of individuals who formed the backbone of the early Muslim community.

The book is written in clear, accessible English that makes it suitable for readers of all backgrounds, including new Muslims, young adults, and those with limited prior knowledge of Islamic history. It is an ideal resource for Islamic schools, study circles, dawah purposes, and personal libraries. The compact format ensures that readers can easily carry and refer to it, while the quality printing and binding ensure long-lasting durability.`,
    metaDescription: "Short Biography of the Prophet and His Ten Companions \u2013 concise English seerah and biographies of Asharah Mubashsharah. Ideal for students and new Muslims."
  },

  // 4. Should A Muslim follow A Particular Madhhab
  {
    slug: "should-a-muslim-follow-a-particular-madhhab",
    description: `Should A Muslim Follow A Particular Madhhab is an insightful English-language book published by Darussalam that tackles one of the most frequently debated questions in contemporary Islamic discourse: the issue of taqleed (following a specific school of Islamic jurisprudence) versus directly deriving rulings from the Quran and Sunnah. Written in a balanced and scholarly manner, this book provides readers with a thorough understanding of the different positions held by Islamic scholars throughout history and offers a well-reasoned middle-ground approach.

The book begins by explaining what the four major madhhabs — Hanafi, Maliki, Shafi'i, and Hanbali — represent and how they emerged as organized schools of jurisprudence. It traces the historical development of each school, introducing the founding imams and their unique methodologies for deducing Islamic law from primary sources. The reader gains appreciation for the immense scholarly effort that went into codifying Islamic rulings and the rigorous standards each madhhab maintained in preserving the authenticity of its chain of transmission and legal reasoning.

The core of the book examines the central debate between those who advocate strict taqleed and those who argue for ittiba' (direct following of evidence). The author presents arguments from both sides with fairness and academic integrity, citing the views of classical scholars as well as contemporary thinkers. The book addresses common objections raised against taqleed, such as the claim that it leads to blind following, and simultaneously responds to criticisms levelled against those who reject madhhab-based practice, explaining the potential dangers of unqualified independent reasoning.

A dedicated section explores the concept of \u201Cfollowing the evidence\u201D and discusses the qualifications required for a person to engage in ijtihad (independent legal reasoning). The book makes a clear distinction between the layperson, the student of knowledge, and the qualified mujtahid, assigning appropriate levels of responsibility to each. Practical guidance is offered for Muslims who are confused about which approach to adopt in their daily worship and dealings.

The text is supported by extensive Quranic references, prophetic traditions, and scholarly citations from across the Islamic intellectual tradition. Written in clear and structured English, this book is an essential read for anyone seeking clarity on the madhhab debate, including students of Islamic studies, imams, educators, and the general Muslim public looking to make informed decisions about their religious practice.`,
    metaDescription: "Should A Muslim Follow A Particular Madhhab \u2013 scholarly English book on taqleed vs ijtihad debate. Covers all four schools with balanced analysis and practical guidance."
  },

  // 5. Shukar, Tobah aur Hum
  {
    slug: "shukar-tobah-aur-hum",
    description: `Shukar, Tobah aur Hum is a thought-provoking Urdu-language book that addresses three interconnected themes central to a Muslim's spiritual life: gratitude (Shukar), repentance (Tobah), and the role of the individual believer (Hum) in maintaining a meaningful relationship with Allah. Published by Darussalam, this book offers a practical and spiritually uplifting guide for readers who wish to transform their daily routines into acts of worship through conscious awareness of Allah's blessings and a sincere commitment to self-improvement.

The section on Shukar explores the Quranic concept of gratitude in remarkable depth. The author explains that gratitude in Islam goes far beyond merely saying \u201Calhamdulillah\u201D with the tongue; it encompasses gratitude of the heart (recognizing blessings as coming from Allah), gratitude of the tongue (expressing praise and thanks), and gratitude of the limbs (using one's body parts in obedience to Allah). The book draws on numerous Quranic verses, including the famous promise that those who are grateful will be given more, and Hadith narrations that describe the Prophet's own practice of constant gratitude. Practical tips are provided for cultivating a grateful mindset in everyday life, from maintaining a daily gratitude journal to expressing thanks during specific moments such as after eating, waking up, and completing tasks.

The Tobah section provides a comprehensive guide to the Islamic concept of repentance. The author explains the conditions for a sincere repentance as outlined by scholars: immediate cessation of the sin, genuine remorse, firm resolve not to return to the sin, and (if the sin involves the rights of another person) restoring those rights. The book draws inspiring examples from the Quran, including the repentance of Prophet Adam, Prophet Yunus, Prophet Dawood, and the repentance of the man who killed ninety-nine people. These stories serve to demonstrate that no matter how grave a sin may be, Allah's mercy is always greater, provided the repentance is sincere.

The final section ties both themes together by focusing on the individual's responsibility in this world. The author discusses how every person is accountable for their actions and how the practices of gratitude and repentance serve as the two wings that carry a believer through life. The book encourages self-reflection, regular muhasabah (self-audit), and maintaining a balance between hope in Allah's mercy and fear of His punishment. Written in an engaging and accessible Urdu style, this book is suitable for readers of all ages and backgrounds, making it an excellent choice for personal reading, family discussion, and Islamic study circles.`,
    metaDescription: "Shukar, Tobah aur Hum \u2013 Urdu book on gratitude, repentance, and spiritual self-improvement. Quran and Hadith-based guidance for everyday Muslim life."
  },

  // 6. Signs of the Hour
  {
    slug: "signs-of-the-hour",
    description: `Signs of the Hour is a comprehensive English-language book published by Darussalam that provides a thorough and well-organized compilation of the various signs indicating the approach of the Day of Judgement as foretold in the Quran and the authentic Hadith collections. This book serves as a vital resource for Muslims seeking to understand the eschatological framework of Islamic belief and the prophetic warnings that have been preserved for the guidance of the Ummah until the end of time.

The book is methodically structured into clear sections that distinguish between the major signs (Alamat al-Kubra) and the minor signs (Alamat al-Sughra) of the Last Hour. Each sign is presented with its primary source references, predominantly drawn from Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawood, Sunan at-Tirmidhi, Jami' at-Tirmidhi, and the Musnad of Imam Ahmad. The author has taken great care to include only authentic narrations, clearly marking the grading of each Hadith and providing explanatory notes where necessary to resolve apparent contradictions between different narrations.

Among the major signs discussed in detail are the appearance of the Dajjal (the False Messiah), the descent of Prophet Isa (Jesus) — peace be upon him —, the emergence of Gog and Magog (Yajuj and Majuj), the rising of the sun from the west, the beast of the earth (Dabbat al-Ard), and the three massive landslides. Each of these events is explained with the relevant Hadith descriptions, scholarly commentary, and an analysis of their implications for human faith and conduct.

The section on minor signs covers a wide range of phenomena that the Prophet — peace be upon him — prophesied would appear before the major signs. These include the widespread consumption of alcohol and interest, the construction of tall buildings by desert dwellers, the prevalence of musical instruments, the nakedness and promiscuity in society, the increase in natural disasters, the near-equality between men and women in numbers, the rapid passage of time, and the spread of ignorance while knowledge is diminished. The author connects many of these signs to observable conditions in the contemporary world, allowing readers to reflect on the relevance of these prophetic warnings to their own lives.

Beyond merely listing signs, the book emphasises the practical lessons that Muslims should derive from this knowledge: strengthening one's faith, increasing good deeds, maintaining patience in the face of tribulations, and remaining steadfast on the truth. The clear, scholarly, and accessible writing style makes this book suitable for both general readers and students of Islamic studies seeking a reliable reference on this important topic.`,
    metaDescription: "Signs of the Hour \u2013 comprehensive English book on major and minor signs of the Day of Judgement. Based on authentic Hadith with scholarly commentary and analysis."
  },

  // 7. Silent Moments
  {
    slug: "silent-moments",
    description: `Silent Moments is a reflective English-language book published by Darussalam that captures the profound and often overlooked moments of stillness, contemplation, and spiritual awakening experienced by the prophets and righteous individuals throughout Islamic history. The book is part of Darussalam's wider collection of stories from the prophetic traditions (Qasas ul Anbiya) and is designed to draw lessons from the quiet, introspective periods in the lives of Allah's chosen messengers.

Drawing primarily from Quranic narratives and authenticated Hadith literature, Silent Moments focuses on the transformative experiences that occurred during periods of solitude and divine communication. The book explores how Prophet Ibrahim — peace be upon him — contemplated the stars and the creation to arrive at the recognition of one true God, how Prophet Musa experienced the divine calling at Mount Sinai, how Prophet Muhammad — peace be upon him — found solace and revelation in the Cave of Hira, and how Prophet Yunus turned to Allah from the darkness of the whale's belly. These narratives are presented not merely as historical accounts but as living lessons in the power of disconnecting from worldly distractions and connecting with the Creator.

Each chapter is structured to present the narrative context, the spiritual significance of the silent moment, and the practical lessons that contemporary Muslims can derive from these experiences. The author emphasises the importance of creating quiet moments in one's own daily routine — whether through the late-night tahajjud prayer, morning adhkar, or simply sitting in reflection after salah. The book argues that in an age of constant noise, digital distraction, and sensory overload, the Islamic tradition of muraqabah (mindful awareness of Allah) and tafakkur (contemplation) is more relevant than ever.

The writing style is engaging, emotive, and spiritually uplifting without compromising on scholarly rigour. Quranic verses are provided with context, and Hadith narrations are referenced with their sources. The book is particularly valuable for readers who feel overwhelmed by the pace of modern life and are seeking a spiritually grounded approach to finding peace, purpose, and closeness to Allah. It is suitable for personal reading, book club discussions, dawah initiatives, and as a supplementary text for Islamic studies courses. The compact and attractive design makes it an ideal gift for friends, family members, and colleagues who may benefit from its timeless message.`,
    metaDescription: "Silent Moments \u2013 reflective English book on spiritual contemplation through prophetic stories. Draws Quranic and Hadith lessons on finding peace in stillness."
  },

  // 8. Silsila Ghazwat e Nabavi (PBUH) (2 vol set)
  {
    slug: "silsila-ghazwat-e-nabavi-pbuh-2-vol-set",
    description: `Silsila Ghazwat-e-Nabavi (PBUH) is a detailed two-volume Urdu-language set that documents every military expedition and campaign led by Prophet Muhammad — peace be upon him — throughout his prophetic mission. Published by Darussalam, this comprehensive work stands as one of the most thorough and well-researched Urdu compilations on the subject, providing readers with an in-depth understanding of the military dimensions of the Prophet's mission and the strategic, political, and spiritual lessons embedded in each campaign.

The first volume covers the early expeditions that took place during the Makkan period and the initial years after the migration to Madinah. It includes detailed accounts of the Sariyyah missions (reconnaissance and patrol expeditions) sent by the Prophet to monitor the movements of the Quraysh, secure trade routes, and establish alliances with neighbouring tribes. The volume then moves into the major ghazawat (battles in which the Prophet participated directly), beginning with the Battle of Badr — the first major armed confrontation between the Muslims and the Quraysh. The narrative of Badr is presented with meticulous attention to detail: the numerical disparity between the two sides, the divine assistance promised by Allah, the military tactics employed, the role of individual companions, and the aftermath including the treatment of prisoners of war.

The second volume continues with the Battles of Uhud and the Trench (Khandaq), the Treaty of Hudaybiyyah and its surrounding expeditions, the Battle of Khaibar, the Conquest of Makkah, the Battle of Hunayn, the Siege of Ta'if, and the Expedition of Tabuk. Each campaign is analysed from multiple angles: the strategic objectives, the intelligence gathered beforehand, the composition of the Muslim forces, the enemy's strength and positioning, the course of the battle itself, and the long-term consequences for the Muslim community and the broader Arabian Peninsula.

What sets this work apart is its balanced approach. While it provides exhaustive military detail, it never loses sight of the ethical and humanitarian principles that governed the Prophet's conduct in warfare. The rules of engagement established by the Prophet, the prohibition against harming non-combatants, the treatment of prisoners, the respect shown to treaties, and the emphasis on proportionality are all highlighted throughout the text. Each chapter concludes with key lessons and reflections that connect the historical events to contemporary applications.

The two-volume set is extensively referenced with sources from the major books of seerah and Hadith, including Sirat Ibn Hisham, al-Waqidi's Maghazi, Sahih al-Bukhari, Sahih Muslim, and the works of Ibn Kathir. The clear Urdu prose, well-organized chapter structure, and quality production make this set an essential reference for students of Islamic history, researchers, educators, and anyone with a serious interest in the prophetic military campaigns and their enduring significance.`,
    metaDescription: "Silsila Ghazwat-e-Nabavi (2 vol set) \u2013 comprehensive Urdu documentation of all Prophet's military campaigns. Covers Badr to Tabuk with strategic and spiritual analysis."
  },

  // 9. SINGING & MUSIC IN ISLAMIC PERSPECTIVE
  {
    slug: "singing-music-in-islamic-perspective",
    description: `Singing and Music in Islamic Perspective is a scholarly English-language book published by Darussalam that examines the Islamic ruling on singing, musical instruments, and entertainment from a comprehensive and evidence-based standpoint. This book addresses a topic that has generated considerable debate among Muslims for centuries and provides readers with a well-researched, balanced, and authoritative analysis based on the primary sources of Islamic law.

The book begins by establishing the foundational principles of Islamic jurisprudence that govern the evaluation of any act of worship or entertainment: the concepts of halal and haram, the role of textual evidence (nass) versus rational reasoning, and the methodology of reconciling apparently conflicting narrations. With this framework in place, the author proceeds to present and analyse every significant Hadith related to singing and music, including narrations from Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawood, Sunan at-Tirmidhi, and other major collections. Each Hadith is examined in terms of its chain of transmission (isnad), its text (matn), the context in which it was reported, and the scholarly understanding that has been derived from it over the centuries.

The book devotes detailed chapters to specific aspects of the debate: the permissibility or prohibition of the daff (hand drum) at weddings and celebrations, the use of musical instruments in general, the nasheed (Islamic songs) genre, the influence of music on behaviour and spirituality, and the concept of \u201Clahw al-hadith\u201D (idle talk and entertainment) mentioned in the Quran. The author carefully presents the positions of the four major schools of jurisprudence, showing that while there is some difference of opinion among scholars on specific issues, there is a strong scholarly consensus on the general ruling regarding musical entertainment that contradicts Islamic values.

A particularly valuable section of the book addresses the common modern arguments in favour of music, including claims about its therapeutic benefits, cultural significance, and alleged permissibility based on certain Hadith interpretations. The author responds to each argument with academic rigour, distinguishing between cultural practices that may have been tolerated in specific contexts and the clear prohibitions established by the prophetic guidance.

The writing style is academic yet accessible, making the book suitable for a wide readership including students of Islamic studies, imams, parents concerned about media consumption in their homes, and anyone seeking clarity on this important topic. The extensive footnotes, bibliography, and index further enhance the book's value as a reference work.`,
    metaDescription: "Singing and Music in Islamic Perspective \u2013 scholarly English book analysing Islamic rulings on music with Hadith evidence. Covers all four schools of jurisprudence."
  },

  // 10. Sipara Set Qudrat Ullah Company 100
  {
    slug: "sipara-set-qudrat-ullah-company-100",
    description: `The Sipara Set from Qudrat Ullah Company (Model 100) is a complete 30-part set of the Holy Quran, divided into individual siparas (juz') for convenient reading, distribution, and educational use. Each sipara is bound as a separate booklet, making this set one of the most practical formats for those who need the Quran in a portable, segment-based arrangement. The Qudrat Ullah Company has been a trusted name in Quran publication for generations in Pakistan, and this particular edition continues their tradition of producing reliable and readable scripture.

Each of the 30 siparas in this set contains clearly printed Urdu/Persian script (Naskh style) that is optimised for readability. The font size is chosen to be comfortable for reading during daily prayers, recitation sessions, and teaching purposes. The text layout follows the standard 15-line per page format that is widely used in South Asian madrassahs, mosques, and homes, making it immediately familiar to readers across Pakistan, India, and Bangladesh. Proper stop signs (waqf), sajda markings, and other standard Quranic notation are included throughout to assist readers with correct pronunciation and recitation pauses.

The binding quality of the Qudrat Ullah Company edition is designed for durability and frequent handling. Each sipara features a sturdy cover that protects the pages from wear and tear, and the pages themselves are printed on quality paper that is resistant to easy tearing. The compact size of individual siparas makes them easy to carry in a bag or pocket, ideal for commuters, students, and travellers who want to maintain their daily Quran reading routine without carrying a complete mus-haf.

This sipara set is particularly useful in educational settings. Madrassah teachers and Quran tutors frequently use individual siparas to distribute to students during class, allowing each student to follow along from their own copy. The set is also commonly used in mosques for congregational reading programs, funeral rites (where specific siparas may be assigned to different reciters), and charitable distribution projects. Many families purchase multiple sets to distribute as sadaqah jariyah, particularly during Ramadan and on occasions of bereavement.

The Qudrat Ullah Company takes great care in ensuring the accuracy of the text, with each edition undergoing meticulous proofreading by qualified Quranic scholars (huffaz and qaris) to verify that every letter, diacritical mark, and verse number is correctly placed. This attention to detail makes the set a reliable choice for both recitation and memorisation purposes. Whether for personal use, gifting, educational distribution, or charitable purposes, this 30-sipara set remains one of the most practical and widely trusted Quran formats available in the market.`,
    metaDescription: "Qudrat Ullah Company Sipara Set (30 parts) \u2013 complete Quran in individual booklets. Clear 15-line Naskh script, durable binding, ideal for mosques and madrassahs."
  },

  // 11. Sitaron Ka Sajda (Qissa Syedna Yusuf) Silsila Qasas ul Anbiya 13/30
  {
    slug: "sitaron-ka-sajda-qissa-syedna-yusuf-silsila-qasas-ul-anbiya-1330",
    description: `Sitaron Ka Sajda (The Prostration of Stars) is the thirteenth installment in the acclaimed Silsila Qasas ul Anbiya series published by Darussalam, presenting the timeless and inspiring story of Prophet Yusuf — peace be upon him — in an engaging and child-friendly Urdu format. This beautifully illustrated book is specifically designed to introduce young Muslim readers to one of the most detailed and emotionally powerful narratives found in the Holy Quran, as narrated in Surah Yusuf.

The story follows the complete journey of Prophet Yusuf from his childhood dreams in Canaan to his eventual rise as the minister of Egypt. Young readers are taken through each dramatic episode: the jealousy of his brothers who threw him into a well, his sale into slavery in Egypt, the trial of seduction by the Aziz's wife, his years of imprisonment, his gift of interpreting dreams, his eventual exoneration and appointment as a minister, and the touching reunion with his family. The title \u201CSitaron Ka Sajda\u201D refers to the famous dream of young Yusuf in which eleven stars, the sun, and the moon prostrated before him, symbolising the future honour that Allah had destined for him.

The narrative is written in simple yet eloquent Urdu that captures the attention of children while remaining faithful to the Quranic account. Difficult concepts are explained in age-appropriate language, and the moral lessons embedded in each episode — patience in adversity, forgiveness, trust in Allah, resisting temptation, and the importance of family bonds — are clearly highlighted throughout the text. The book avoids decorative embellishment while presenting the Quranic story with accuracy and respect.

Vibrant and colourful illustrations accompany the text on every page, helping children visualise the settings, characters, and events of the story. The artwork is designed in accordance with Islamic guidelines, ensuring that the book is appropriate for all Muslim households. The illustrations serve as visual anchors that keep young readers engaged and help them remember key moments in the narrative.

As part of the 30-part Qasas ul Anbiya series, this book is designed to be collected in its entirety, giving children a comprehensive library of prophetic stories. Each book in the series follows a consistent format and quality standard, making them ideal for building a home library. Parents, teachers, and Islamic school educators will find this book to be an excellent tool for bedtime storytelling, classroom instruction, weekend Islamic school lessons, and encouraging children to develop a love for the Quran and its teachings. The sturdy binding and quality paper ensure that the book withstands repeated reading by enthusiastic young hands.`,
    metaDescription: "Sitaron Ka Sajda \u2013 Urdu children's story of Prophet Yusuf from the Qasas ul Anbiya series (13/30). Illustrated, Quran-based narrative for young Muslim readers."
  },

  // 12. SLANDER
  {
    slug: "slander",
    description: `Slander is an important English-language book published by Darussalam that addresses the serious Islamic prohibition of backbiting (ghibah), slander (buhtan), and tale-bearing (namimah) — social evils that the Quran and Hadith have strongly condemned and compared to the most repugnant of deeds. This book provides a comprehensive and evidence-based examination of these destructive behaviours, their spiritual consequences, and the practical steps Muslims must take to protect themselves and their communities from their harm.

The book opens by establishing the gravity of the offence through powerful Quranic verses, most notably the passage in Surah al-Hujurat where Allah asks believers: \u201CWould any of you like to eat the flesh of his dead brother? No, you would hate it.\u201D This striking analogy sets the tone for the entire discussion, making it clear that gossip and slander are not minor social faux pas but major sins that corrupt the moral fabric of the Muslim community. The Hadith literature is extensively cited throughout, including the famous narration in which the Prophet — peace be upon him — was asked about backbiting and responded with the same flesh-eating metaphor.

The author provides clear definitions and distinctions between related concepts: ghibah (speaking about someone behind their back in a manner they would dislike), buhtan (fabricating or spreading false information about someone), and namimah (carrying tales between people to sow discord). Each category is explained with its specific Quranic terminology, the types of punishment prescribed in the Hadith for each, and the conditions under which speaking about someone may be permissible (such as seeking legal redress, warning others about a known fraud, or seeking scholarly advice).

Practical scenarios are presented throughout the book to help readers identify instances of these sins in everyday life: social media gossip, family discussions, workplace conversations, community politics, and even religious circles where backbiting can occur under the guise of \u201Cadvice\u201D or \u201Cconcern.\u201D The book offers concrete strategies for avoiding these sins, including developing the habit of speaking only when necessary, giving others the benefit of the doubt, making immediate repentance when one slips, and actively discouraging gossip in social settings.

A particularly impactful chapter discusses the consequences of these sins in the Hereafter, including the Hadith about the righteous people who will claim their good deeds from those who engaged in backbiting against them. The book also addresses the importance of seeking forgiveness from the person who was slandered and the proper way to make amends. Written in clear, compelling English, this book is essential reading for every Muslim household, youth groups, Islamic study circles, and anyone seeking to purify their tongue and social conduct in accordance with Islamic teachings.`,
    metaDescription: "Slander \u2013 English Islamic book on the prohibition of backbiting, slander, and tale-bearing. Quran and Hadith-based guidance with practical strategies for purification."
  },

  // 13. Smaller Signs of the Day
  {
    slug: "smaller-signs-of-the-day",
    description: `Smaller Signs of the Day is a detailed English-language book published by Darussalam that focuses specifically on the minor signs (Alamat al-Sughra) of the Day of Judgement as foretold by Prophet Muhammad — peace be upon him — in the authentic Hadith collections. While many books cover both major and minor signs together, this dedicated volume provides an in-depth and focused analysis of the numerous minor indicators that signal the approaching end times, offering readers a thorough understanding of each phenomenon and its significance.

The book presents the minor signs in a well-organised and systematic manner, grouping them into thematic categories for ease of understanding and reference. Among the signs discussed are those related to moral and social decline: the widespread consumption of alcohol and intoxicants, the open practice of adultery and fornication, the prevalence of usury (riba), the dressing of men in women's clothing and vice versa, and the general erosion of modesty and family values. The author connects these prophetic warnings to observable trends in contemporary society, allowing readers to reflect on the accuracy and relevance of the Prophet's predictions.

Another set of signs relates to changes in the natural world: the frequent occurrence of earthquakes, the appearance of landslides and sinkholes, severe weather events, and changes in the behaviour of animals. The book cites the relevant narrations and provides scholarly commentary on how these natural phenomena serve as warnings from Allah to humanity.

The book also covers signs related to the Muslim community itself: the death of righteous scholars, the rise of ignorant leaders, the abundance of wealth, the construction of tall buildings by formerly poor people (identified by many scholars as the desert-dwellers of Arabia), the near-equality of men and women in number, the rapid passage of time, the contraction of knowledge and the spread of ignorance, and the appearance of false prophets and misleading religious figures.

Each sign is presented with its primary Hadith source, the chain of narration, the scholarly grading, and a detailed explanation of what the sign means and how it might manifest. The author draws on the works of major scholars including Ibn Kathir, Imam al-Qurtubi, Imam an-Nawawi, and contemporary researchers who have documented the emergence of these signs in the modern era. The book concludes with a practical section on how Muslims should respond to the awareness of these signs: by strengthening their faith, increasing good deeds, maintaining hope in Allah's mercy, and living righteously rather than becoming fearful or fatalistic.

This book is an invaluable resource for students of Islamic eschatology, teachers, imams, and general readers who want to understand the prophetic signs of the Last Hour in a detailed, well-referenced, and accessible format.`,
    metaDescription: "Smaller Signs of the Day \u2013 detailed English book on minor signs of the Last Hour. Hadith-referenced analysis of social, natural, and community-related end-times indicators."
  },

  // 14. Sonay Ka Bachra (Qissa Syedna Musa) Silsila Qasas ul Anbiya 18/30
  {
    slug: "sonay-ka-bachra-qissa-syedna-musa-silsila-qasas-ul-anbiya-1830",
    description: `Sonay Ka Bachra (The Golden Calf) is the eighteenth volume in the popular Silsila Qasas ul Anbiya series by Darussalam, presenting the dramatic episode of the golden calf from the life of Prophet Musa — peace be upon him — in a captivating Urdu narrative specially crafted for young readers. This beautifully produced children's book covers one of the most instructive incidents in the Quranic account of the Bani Israel, teaching powerful lessons about faith, obedience, patience, and the dangers of idolatry.

The story begins with Prophet Musa's departure for Mount Tur to receive the Torah from Allah, leaving his brother Prophet Harun — peace be upon him — in charge of the Bani Israel. During Musa's forty-day absence, a man named as-Samiri deceives the people by fashioning a golden calf from their collected jewellery and claims it to be their deity. The narrative vividly describes the temptation faced by the Bani Israel, the weak faith of those who succumbed to idol worship, and the steadfastness of the few who remained firm in their monotheistic belief.

The book goes on to narrate Prophet Musa's return to find his people engaged in the worship of the calf, his righteous anger, his confrontation with as-Samiri, and the subsequent punishment and forgiveness that followed. The dramatic moments — Musa seizing his brother's beard in anger, Harun's dignified response, Musa's plea to Allah for forgiveness, the destruction of the calf, and the command for the wrongdoers to repent — are all rendered in age-appropriate Urdu prose that maintains the gravity and spiritual depth of the Quranic account.

Key moral lessons are woven throughout the narrative: the importance of following rightful leadership, the danger of blindly following charismatic but misguided individuals, the virtue of patience and trust in Allah's timing, the power of sincere repentance, and the absolute prohibition of shirk (associating partners with Allah). Each lesson is stated clearly and reinforced through the story's natural progression, helping young readers internalise these values without feeling lectured.

The book features vibrant, full-colour illustrations that bring each scene to life while adhering to Islamic guidelines regarding visual representation. The artwork depicts the settings of the story — the mountain, the camp of the Bani Israel, and the dramatic moments of confrontation — without depicting the prophets themselves, maintaining respect for the sanctity of these blessed personalities. The layout is clean and inviting, with large text that is easy for young readers to follow.

As part of the 30-volume Qasas ul Anbiya collection, this book is designed to be both a standalone read and part of a comprehensive prophetic stories library. Parents will find it an excellent bedtime reading choice, while Islamic school teachers can use it effectively in classroom settings for lessons on Tawheed, the stories of the prophets, and moral development.`,
    metaDescription: "Sonay Ka Bachra \u2013 Urdu children's story of Prophet Musa and the golden calf from Qasas ul Anbiya series (18/30). Illustrated, Quran-based, with moral lessons for kids."
  },

  // 15. Sood
  {
    slug: "sood",
    description: `Sood is a comprehensive Urdu-language book that provides a thorough examination of the Islamic prohibition of interest (riba/sood) — one of the most severe and clearly established haram acts in Islamic law. Categorised under Fiqh, this book addresses the concept of sood from every relevant angle: its definition, its types, its presence in classical and modern financial systems, the Quranic and Hadith evidence against it, and the devastating consequences it inflicts on individuals, communities, and economies.

The book begins by establishing the foundational texts that prohibit sood in Islam. The Quranic verses are presented with their full context and scholarly commentary, including the powerful declaration in Surah al-Baqarah that those who consume interest do not stand except as one stands who is being beaten by Satan into insanity. The relevant Hadith narrations are also compiled and analysed, including the Prophet's — peace be upon him — famous curse on the one who consumes interest, the one who pays it, the one who records it, and the two witnesses to it, equating them all as equal participants in the sin.

The author provides a detailed taxonomy of riba as understood by Islamic jurists, distinguishing between riba al-nasi'ah (interest based on time delay) and riba al-fadl (interest based on unequal exchange of commodities). Each type is explained with practical examples drawn from classical and contemporary contexts. The book also addresses the various forms in which sood appears in modern financial transactions, including bank interest, credit card charges, mortgage arrangements, insurance products, and speculative trading. The discussion extends to seemingly innocuous transactions that may contain hidden elements of riba, helping readers identify and avoid them in their daily financial dealings.

A dedicated section explores the Islamic alternatives to interest-based finance, introducing concepts such as mudarabah (profit-sharing), musharakah (joint venture), murabahah (cost-plus financing), and ijarah (leasing). The author explains how these Shariah-compliant modes of financing work in practice and how they differ fundamentally from interest-based transactions by sharing risk between parties rather than guaranteeing a fixed return to the lender.

The economic and social consequences of sood are analysed in detail, drawing on both classical Islamic scholarship and contemporary economic research. The book demonstrates how interest-based systems lead to wealth concentration, economic exploitation of the poor, inflation, boom-and-bust cycles, and the erosion of social cohesion. The contrast with Islamic economic principles, which promote equitable distribution of wealth, social justice, and shared prosperity, is clearly articulated throughout.

The practical guidance section offers actionable advice for Muslims seeking to transition away from interest-based transactions, including how to deal with existing interest-bearing loans, how to structure business dealings in compliance with Shariah, and how to educate family members about the dangers of sood. Written in clear and structured Urdu, this book is an essential reference for students of Islamic finance, business professionals, religious scholars, and every Muslim household that takes the prohibition of riba seriously.`,
    metaDescription: "Sood \u2013 comprehensive Urdu Fiqh book on the Islamic prohibition of interest/riba. Covers Quranic evidence, modern financial systems, and Shariah-compliant alternatives."
  },

  // 16. Sorah E Fateha Calligraphy
  {
    slug: "sorah-e-fateha-calligraphy",
    description: `The Surah Al-Fateha Calligraphy piece is a stunning piece of Islamic wall art that features the complete text of Surah Al-Fatiha — the opening chapter of the Holy Quran and the most recited surah in daily prayers — rendered in elegant Arabic calligraphy. This decorative piece serves as both a beautiful addition to home, office, or mosque interiors and a constant spiritual reminder of the profound meanings contained in this foundational chapter of the Quran.

The calligraphy is meticulously crafted by skilled artisans who specialise in traditional Arabic script styles. The flowing, interconnected lettering follows classical proportions and aesthetics, ensuring that the sacred words are presented with the reverence and artistic excellence they deserve. Each stroke and curve is carefully formed to create a harmonious visual composition that draws the eye and invites contemplation. The calligraphic style pays homage to the centuries-old tradition of Islamic artistic expression, where the written word of Allah has been elevated to the highest form of visual art.

The piece is produced on high-quality material that ensures durability and long-lasting visual appeal. The printing technique captures the fine details of the calligraphy with precision, maintaining the depth and texture that give the artwork its premium feel. The colour scheme is designed to complement a wide range of interior decors, featuring a sophisticated palette that works well in both traditional and contemporary settings. The overall design balances artistic expression with legibility, ensuring that those familiar with Arabic script can read and appreciate the words of Surah Al-Fatiha.

Installation is straightforward, with the piece designed to be mounted on standard wall fixtures. The dimensions are carefully chosen to make a statement without overwhelming the space, making it suitable for living rooms, bedrooms, hallways, offices, reception areas, and prayer rooms. The piece also makes a thoughtful and meaningful gift for housewarmings, weddings, Ramadan, Eid occasions, and other special events.

Surah Al-Fatiha holds a special place in every Muslim's heart as the \u201CMother of the Quran\u201D — the chapter recited in every unit of every prayer. Having its text displayed as calligraphy in one's living space serves as a daily reminder of the core message of the surah: the praise of Allah, the acknowledgement of His lordship, the seeking of His guidance, and the request to be kept on the straight path. This calligraphy piece allows Muslims to surround themselves with the words of Allah in a form that is both artistically beautiful and spiritually meaningful, creating an atmosphere of peace, reverence, and divine remembrance in any room it adorns.`,
    metaDescription: "Surah Al-Fateha Calligraphy \u2013 elegant Islamic wall art featuring the complete Surah Fatiha in traditional Arabic script. Premium quality, suitable for home or mosque."
  },

  // 17. Sorah E Fateha Calligraphy (variant 2)
  {
    slug: "sorah-e-fateha-calligraphy-1",
    description: `This Surah Al-Fateha Calligraphy variant offers a distinctive artistic interpretation of the opening chapter of the Holy Quran, presenting the sacred text in an alternative calligraphic style that appeals to collectors and enthusiasts of Islamic decorative art. While sharing the same foundational purpose as the standard edition — displaying the complete text of Surah Al-Fatiha as a centrepiece of wall decoration — this variant features a unique design composition that sets it apart with its own visual character and aesthetic appeal.

The calligraphy in this variant employs a different artistic approach, with the letters arranged in a layout that emphasises the vertical and horizontal balance of the text. The calligrapher has chosen a composition that creates a distinctive visual flow, making this piece ideal for spaces where a more varied or personalised calligraphic presentation is desired. The artistic choices in line thickness, spacing, and overall form give this variant a character that distinguishes it from other Surah Al-Fatiha calligraphy pieces, allowing decorators and homeowners to select the specific style that best matches their interior aesthetic.

Like its counterpart, this piece is produced using high-quality printing techniques on premium material that ensures sharp detail reproduction and lasting colour fidelity. The construction is designed to resist fading, warping, and deterioration, ensuring that the calligraphy retains its visual impact over extended periods of display. The piece comes ready for wall mounting and is appropriately sized to serve as a focal point in rooms of various dimensions.

The significance of displaying Surah Al-Fatiha in calligraphic form extends beyond mere decoration. As the chapter known as Umm al-Quran (the Mother of the Quran) and Ash-Shifa (the Cure), Surah Al-Fatiha is regarded as containing the essence of the entire Quranic message in its seven verses. Its themes of divine praise, submission to Allah's will, and the supplication for guidance resonate deeply with every Muslim, making its visual presence in the home a source of ongoing spiritual reflection and blessing.

This variant is particularly suited for collectors who appreciate different calligraphic interpretations of the same sacred text. It pairs beautifully with other pieces from the same collection, allowing homeowners to create curated gallery walls that showcase multiple styles of Islamic calligraphy. The piece is also an excellent gift choice for occasions such as weddings, housewarmings, graduations, and religious celebrations, offering recipients both artistic beauty and spiritual significance in a single, meaningful present.`,
    metaDescription: "Surah Al-Fateha Calligraphy (variant) \u2013 distinctive Islamic wall art with an alternative calligraphic style of the complete Surah Fatiha. Premium print for home decor."
  },

  // 18. Sorah E Fateha Calligraphy - Golden
  {
    slug: "sorah-e-fateha-calligraphy-golden",
    description: `The Surah Al-Fateha Calligraphy in Golden finish is a premium edition of Islamic wall art that combines the sacred text of Surah Al-Fatiha with a luxurious gold-toned aesthetic, creating a showpiece that commands attention and elevates the visual appeal of any interior space. This golden variant represents the pinnacle of the calligraphy collection, designed for those who wish to display their faith with the highest level of artistic sophistication and elegance.

The golden colour palette applied to the calligraphy gives the sacred Arabic text a radiant and luminous quality that evokes the grandeur and beauty of classical Islamic art as found in historic mosques, palaces, and manuscripts across the Muslim world. The gold finish catches and reflects ambient light, creating a subtle shimmer effect that changes character depending on the lighting conditions of the room. In natural daylight, the gold takes on a warm, inviting glow; under artificial lighting, it exudes a refined and opulent character that adds a touch of luxury to any setting.

The calligraphic artistry is executed to the highest standards, with each letter of Surah Al-Fatiha rendered with meticulous attention to proportion, spacing, and flow. The golden treatment enhances the three-dimensional quality of the script, giving depth and texture to the calligraphy that makes it appear almost sculptural against its background. The design achieves a perfect balance between artistic expression and readability, ensuring that the sacred words remain clearly discernible while maintaining their decorative function.

The production quality matches the premium aesthetic. The printing process utilises advanced techniques that faithfully reproduce the richness of the golden finish, ensuring consistent colour and sharp detail across the entire piece. The base material is selected for its durability and its ability to support the weight and texture of the golden print without buckling or fading over time. The piece is constructed to be a lasting addition to any collection, capable of maintaining its visual impact for years with proper care.

The golden Surah Al-Fatiha calligraphy is ideally suited for spaces where a touch of elegance and grandeur is desired: formal living rooms, executive offices, hotel lobbies, mosque interiors, reception halls, and banquet venues. It makes an especially impressive gift for weddings, anniversaries, milestone celebrations, and corporate occasions where a premium and meaningful present is appropriate. For homeowners who have invested in creating a refined and spiritually enriched living environment, this golden calligraphy piece serves as both the crowning decorative element and a constant, beautiful reminder of the central prayer of the Islamic faith — the Surah that every Muslim recites multiple times daily in their prayers.`,
    metaDescription: "Surah Al-Fateha Calligraphy Golden \u2013 premium gold-finish Islamic wall art featuring Surah Fatiha. Luxurious design for homes, offices, and mosques."
  },

  // 19. Special Ramadan Offer for Muslim Kids
  {
    slug: "special-ramadan-offer-for-muslim-kids",
    description: `The Special Ramadan Offer for Muslim Kids is a thoughtfully curated collection of Islamic educational materials and activity resources designed specifically to engage young Muslim children during the blessed month of Ramadan. This bundle brings together a selection of books, booklets, and learning aids that help children understand the significance of Ramadan, develop a connection with the Quran and the Prophet's teachings, and build positive habits that extend well beyond the holy month. The package is structured to provide a comprehensive Ramadan learning experience that combines knowledge, creativity, and fun.

The contents of the package are selected to cover the essential aspects of Ramadan that children should be familiar with. Materials addressing the concept of fasting, the importance of salah and Quran recitation, the significance of Laylatul Qadr, the spirit of charity and generosity, and the celebration of Eid ul-Fitr are all included in age-appropriate formats. The books are written in clear and engaging language that captures children's attention while conveying authentic Islamic knowledge. Stories of the prophets, companions, and great Muslim personalities who demonstrated remarkable devotion during Ramadan are featured to inspire young readers and provide them with role models to emulate.

The activity component of the package includes interactive elements such as Ramadan tracking charts, daily dua lists, colouring pages with Islamic themes, puzzles and quizzes that test knowledge, and creative writing prompts that encourage children to express their Ramadan experiences. These activities are designed to keep children constructively occupied during the long fasting hours, reducing screen time and channeling their energy into meaningful learning. Parents can use the tracking charts to monitor their children's progress in fasting, prayer, Quran reading, and good deeds, creating a sense of achievement and motivation throughout the month.

The materials in this package are produced by reputable Islamic publishers, including Darussalam, ensuring that the content is authentic, well-researched, and aligned with the principles of Ahl al-Sunnah wal-Jama'ah. The production quality is child-friendly, with durable covers, non-toxic materials, and vibrant printing that appeals to young readers. The variety of formats — storybooks, workbooks, activity sheets, and reference cards — ensures that children with different learning styles and interests find something that resonates with them.

This Ramadan package is ideal for parents and educators who want to make Ramadan a meaningful and educational experience for their children. It eliminates the need to source individual items separately, offering a convenient and cost-effective solution for families, Islamic schools, weekend madrassah programs, and community organisations running Ramadan children's programs. The package also makes an excellent gift for relatives, friends, and neighbours with young children, spreading the joy and learning of Ramadan within the wider community.`,
    metaDescription: "Special Ramadan Offer for Muslim Kids \u2013 curated bundle of Islamic books, activities, and learning aids for children. Covers fasting, salah, Quran, and Eid with fun activities."
  },

  // 20. Spoken Arabic Made Easy
  {
    slug: "spoken-arabic-made-easy",
    description: `Spoken Arabic Made Easy is a practical and user-friendly English-language guidebook authored by Ammanulla Vadakkangra, designed to teach conversational Arabic to non-Arabic speakers in a straightforward and progressive manner. Unlike traditional Arabic grammar books that overwhelm learners with complex rules and terminology, this book takes a functional approach that prioritises the ability to communicate in everyday situations, making it particularly valuable for Muslims who wish to understand the language of the Quran and daily prayers.

The book is structured around common conversational scenarios that learners are likely to encounter, including greetings and introductions, shopping and marketplace interactions, asking for and giving directions, ordering food, making phone calls, visiting hospitals, and engaging in social conversations. Each chapter introduces vocabulary and phrases relevant to the specific context, followed by practice exercises that reinforce retention. The transliteration system used throughout the book makes it accessible even to learners who have no prior familiarity with the Arabic script, while those who can read Arabic will also find the original text alongside the transliteration.

The methodology employed by the author is based on the proven communicative language teaching approach. Rather than starting with abstract grammar rules, the book immerses the learner in practical dialogues and gradually introduces grammatical structures as they naturally occur in conversation. This approach mirrors the way children learn their first language — through exposure, repetition, and contextual understanding rather than through formal grammar instruction. The result is a more natural and confident acquisition of spoken Arabic skills.

A significant advantage of this book for Muslim learners is the inclusion of Islamic vocabulary and phrases that are used in religious contexts. Common supplications (duas), phrases from the salah, expressions of gratitude and praise to Allah, and terms frequently encountered in Quranic discussions are woven into the lessons. This dual-purpose approach means that learners are simultaneously improving their general Arabic communication skills and deepening their understanding of the language of their faith.

The author, Ammanulla Vadakkangra, brings extensive experience in Arabic language instruction to this work, and his teaching methodology reflects years of practical classroom experience with students from diverse linguistic backgrounds. The exercises are varied and engaging, including fill-in-the-blank activities, matching exercises, role-play scenarios, and translation tasks that progressively build the learner's confidence and competence.

The book is suitable for a wide range of learners: beginners with no prior Arabic knowledge, intermediate learners looking to improve their conversational fluency, students preparing for travel to Arabic-speaking countries, Islamic studies students who need practical Arabic skills, and anyone with a general interest in learning one of the world's most widely spoken languages. The clear layout, systematic progression, and practical focus make this book an excellent self-study resource as well as a useful textbook for classroom instruction in Islamic schools, community centres, and adult education programmes.`,
    metaDescription: "Spoken Arabic Made Easy by Ammanulla Vadakkangra \u2013 practical English guide to conversational Arabic with Islamic vocabulary. Ideal for beginners and Muslim learners."
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

main().then(() => prisma.$disconnect());
