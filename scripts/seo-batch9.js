#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Batch 9 Description Writer
// Writes unique, SEO-optimized product descriptions for products 901-1000
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// ─── Utility ─────────────────────────────────────────────────────────────────
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function formatPrice(p) { return 'Rs. ' + Number(p).toLocaleString('en-PK'); }

// ─── Category detection function ─────────────────────────────────────────────
function detectCat(product) {
  const t = (product.title || '').toLowerCase();
  const s = (product.slug || '').toLowerCase();
  const c = (product.categoryName || '').toLowerCase();
  const ts = t + ' ' + s;

  // Sahah Sitta — check FIRST for hadith collection names
  if (/sahah.*sitta|sahih.*muslim.*arabic|sharah.*sahih.*muslim|sunan.*abu.*dawood|sunan.*an.*nasai|sunan.*ibn.*majah|sunan.*ibn.*e.*majah/i.test(ts)) return 'sahah_sitta';

  // Rehal — check early
  if (/rehal/i.test(ts)) return 'rehal';

  // Home Decor — calligraphy, laser cut, wall art, table decor
  if (/calligraphy|home.?decor|laser.*cut|wall.*art|table.*decor|car.*tag/i.test(ts)) return 'home_decor';

  // Parah Parts — Sipara Set
  if (/sipara|parah.*part/i.test(ts)) return 'parah_parts';

  // Seerah — encyclopedia, seerat-un-nabi, sachi kahaani, short biography of prophet
  if (/seerah.*encyclopedia|seerat.*encyclopedia|seerat.*un.*nabi|sachi.*kahaani|short.*biography.*prophet/i.test(ts)) return 'seerah';

  // Companions — Khulafa-e-Rashideen, sahaba biographies
  if (/companion|khulafa.*e.*rashid|seerat.*khulafa|seerat.*hassan.*hussain|sayeda.*khadija|sayedina.*abu.*bakr|sayedina.*umar|sayedina.*usman|sayedina.*ali.*al.*murtaza|sayedina.*hazrat.*ali|sayedna.*ali.*ibn|seerat.*umar.*farooq|seerat.*usman|shining.*stars|sahih.*seerat.*khulfa|seerat.*sayedina.*abu.*bakr/i.test(ts)) return 'companions';

  // Hadith — Shifaat, Summarized Bukhari
  if (/shifaat.*ka.*bayan|summarized.*sahih.*bukhari|ahadith.*e.*nabvi/i.test(ts)) return 'hadith';

  // Prayer Supplication — seeking forgiveness, waswasay, azkar
  if (/seeking.*forgiveness|shetani.*waswasay|subah.*sham.*allah|subah.*sham.*k.*azkar|subhanallah/i.test(ts)) return 'prayer';

  // Children — Qasas stories, Salamti Wali Aag, Ramadan Kids
  if (/child|children|qissa.*syedna|salamti.*wali.*aag|ramadan.*offer.*kids|special.*ramadan.*offer|samood|sandoq|shaitan.*ki.*awaz|sitaron.*ka.*sajda|sonay.*ka.*bachra/i.test(ts)) return 'children';

  // Ramadan
  if (/ramadan/i.test(ts)) return 'ramadan';

  // Fasting — Shahar Ramzan
  if (/shahar.*ramzan|fasting/i.test(ts)) return 'fasting';

  // Fiqh — Sood
  if (/sood|fiqh/i.test(ts)) return 'fiqh';

  // Biography — Imam Bukhari, Ibrahim AS, personality, Ghazwat, strategies, Khabbab, Stories of Prophets Ibn Kathir
  if (/biography|seerat.*imam.*bukhari|seerat.*syedna.*ibrahim|shakhsiyat.*sazi|silsila.*ghazwat|stories.*prophets.*ibn.*kathir|strategies.*prophet|stronger.*than.*iron/i.test(ts)) return 'biography';

  // Education — scientific miracles, Arabic speaking, Aqeeda, music perspective
  if (/scientific.*miracles|scientific.*wonders|spoken.*arabic|sharah.*al.*aqeeda|singing.*music.*islamic|education/i.test(ts)) return 'education';

  // History — Sapno Ka Shahzada, Sunehray Haroof, English Seerat Encyclopedia
  if (/history|sapno.*ka.*shahzada|sunehray.*haroof|seerat.*encyclopedia.*english/i.test(ts)) return 'history';

  // Products — catch-all for misc products
  if (/products/i.test(c)) return 'products';

  // Darussalam publishers — use category name
  if (/darussalam|darul/i.test(c)) return 'darussalam';

  // Reference
  if (/reference/i.test(ts)) return 'reference';

  // General catch-all
  return 'general';
}

// ─── Product-specific detail extractor ───────────────────────────────────────
function productDetail(title, index) {
  const t = title.toLowerCase();

  // Sahih Islami Aqeedah
  if (/sahih.*islami.*aqeedah/i.test(t)) return 'comprehensive guide to correct Islamic creed (Aqeedah) by Darussalam, covering the fundamental beliefs that every Muslim must know and uphold';

  // Sahih Muntakhib Waqiyat
  if (/sahih.*muntakhib.*waqiyat/i.test(t)) return '2-volume selected collection of authentic narrations and incidents from Islamic history compiled as a reference work';

  // Sahih Muslim (Urdu) 5 Volume Set
  if (/sahih.*muslim.*urdu.*5/i.test(t)) return 'complete 5-volume Urdu translation of Sahih Muslim — one of the two most authoritative Hadith collections in Islam — containing over 7,500 authenticated narrations';

  // Sahih Muslim Arabic
  if (/sahih.*muslim.*arabic/i.test(t)) return 'Arabic-language edition of Sahih Muslim in 17x24 inch format, the second most authentic book after the Quran according to consensus of Islamic scholarship';

  // Sahih Seerat Khulfa-e-Rashideen
  if (/sahih.*seerat.*khulfa/i.test(t)) return 'authentic biography of the four Rightly Guided Caliphs drawn from verified Hadith and historical sources';

  // Salaf Saliheen k Aqaid o Nazaryat
  if (/salaf.*saliheen/i.test(t)) return 'scholarly exposition of the beliefs and theological positions of the pious predecessors (Salaf Saliheen) by Darussalam';

  // Salamti Wali Aag
  if (/salamti.*wali.*aag/i.test(t)) return 'Darussalam children\'s book teaching fire safety lessons through engaging Islamic storytelling';

  // Qasas ul Anbiya stories (batch 9 specific)
  if (/samood.*ki.*tabahi|qissa.*syedna.*saleh/i.test(t)) return 'part 5 of the 30-part Qasas ul Anbiya series recounting the story of Prophet Saleh (peace be upon him) and the destruction of the Thamud civilization';
  if (/sandoq.*ki.*wapsi|qissa.*syedna.*dawood/i.test(t)) return 'part 23 of the 30-part Qasas ul Anbiya series narrating the story of Prophet Dawood (David) — peace be upon him — titled "Sandoq Ki Wapsi" (Return of the Chest)';
  if (/shaitan.*ki.*awaz|qissa.*syedna.*haroon/i.test(t)) return 'part 21 of the 30-part Qasas ul Anbiya series telling the story of Prophet Haroon (Aaron) — peace be upon him — titled "Shaitan Ki Awaz" (Voice of Satan)';
  if (/sitaron.*ka.*sajda|qissa.*syedna.*yusuf/i.test(t)) return 'part 13 of the 30-part Qasas ul Anbiya series depicting the story of Prophet Yusuf (Joseph) — peace be upon him — titled "Sitaron Ka Sajda" (Prostration of the Stars)';
  if (/sonay.*ka.*bachra|qissa.*syedna.*musa.*18/i.test(t)) return 'part 18 of the 30-part Qasas ul Anbiya series chronicling the story of Prophet Musa (Moses) — peace be upon him — titled "Sonay Ka Bachra" (The Golden Calf)';

  // Sapno Ka Shahzada
  if (/sapno.*ka.*shahzada/i.test(t)) return 'historical narrative exploring the life and legacy of a prince from Islamic history, blending fact with engaging storytelling';

  // Sayeda Khadija (R.A) books
  if (/sayeda.*khadija.*aur.*unki.*betiyan/i.test(t)) return 'account of Sayeda Khadija (R.A) and her daughters, illuminating the lives of the Prophet\'s blessed household';
  if (/sayeda.*khadija.*sunehray.*waqiyat/i.test(t)) return 'collection of golden incidents from the life of Sayeda Khadija bint Khuwaylid (R.A) — the first believer and wife of Prophet Muhammad (PBUH)';

  // Sayedina Abu Bakr Siddique books
  if (/sayedina.*abu.*bakr.*sunehray/i.test(t)) return 'collection of golden incidents from the life of Sayedina Abu Bakr Siddique (R.A) — the first Caliph of Islam and the Prophet\'s closest companion';
  if (/seerat.*sayedina.*abu.*bakr.*2.*vols.*local/i.test(t)) return '2-volume local edition biography of Sayedina Abu Bakr Siddique (R.A) covering his life before and after embracing Islam';
  if (/seerat.*sayedina.*abu.*bakr.*aala/i.test(t)) return 'premium 2-volume set on the life of Sayedina Abu Bakr Siddique (R.A) with enhanced paper quality and detailed scholarly notes';

  // Sayedina Ali books
  if (/sayedina.*ali.*al.*murtaza/i.test(t)) return 'concise biography of Sayedina Ali ibn Abi Talib (R.A) — the fourth Rightly Guided Caliph and the Prophet\'s cousin and son-in-law';
  if (/sayedina.*hazrat.*ali.*sunehray/i.test(t)) return 'collection of golden incidents from the life of Sayedina Ali (R.A), highlighting his wisdom, bravery, and devotion to Islam';

  // Sayedina Umar Farooq books
  if (/sayedina.*umar.*sunehray/i.test(t)) return 'collection of golden incidents from the life of Sayedina Umar Farooq (R.A) — the second Caliph known for his justice and administrative genius';
  if (/sayedina.*umar.*farooq.*r\.a[^.]$/i.test(t)) return 'concise biography of Sayedina Umar Farooq (R.A) — the second Rightly Guided Caliph whose rule transformed the Muslim world';
  if (/seerat.*umar.*farooq.*local.*2/i.test(t)) return '2-volume local edition biography of Sayedina Umar Farooq (R.A) detailing his remarkable journey from opponent to Caliph';

  // Sayedina Usman Ghani
  if (/sayedina.*usman.*ghani.*r\.a[^.]$/i.test(t)) return 'concise biography of Sayedina Usman Ghani (R.A) — the third Rightly Guided Caliph known as Dhun-Noorain (Possessor of Two Lights)';
  if (/seerat.*usman.*bin.*affan.*local/i.test(t)) return 'biography of Sayedina Usman bin Affan (R.A) by Dr. Ali Muhammad Sallabi, covering his life, Caliphate, and martyrdom';

  // Sb se Sachi Kahaani
  if (/sb.*se.*sachi.*kahaani/i.test(t)) return 'imported premium edition of "The Most True Story" — the life of Prophet Muhammad (PBUH) presented as the most authentic narrative in human history';

  // School Se Ghar Tak
  if (/school.*se.*ghar.*tak/i.test(t)) return 'Darussalam publication guiding children on Islamic conduct and manners from school to home, embedding daily etiquette within a religious framework';

  // Scientific Miracles books
  if (/scientific.*miracles.*ocean/i.test(t)) return 'fascinating exploration of scientific miracles found in the Quran related to oceans, marine life, and the animal kingdom — demonstrating divine knowledge in scripture';
  if (/scientific.*wonders.*earth/i.test(t)) return 'compelling study of scientific wonders mentioned in the Quran concerning the earth, atmosphere, and outer space — revealing the supernatural knowledge embedded in revelation';

  // Seed of Righteousness
  if (/seed.*righteousness/i.test(t)) return 'Darussalam publication on nurturing righteousness in children, providing Islamic guidance for moral development and character building from a young age';

  // Seeking Forgiveness
  if (/seeking.*forgiveness/i.test(t)) return 'Darussalam book on the importance, methods, and virtues of seeking forgiveness (Istighfar) from Allah, with Quranic and Prophetic evidence';

  // Seerat e Hassan-O-Hussain
  if (/seerat.*hassan.*hussain/i.test(t)) return 'local edition biography of Hassan and Hussain (R.A) — the grandsons of Prophet Muhammad (PBUH) and leaders of the youth of Paradise';

  // Seerat e Khulafa-e-Rashidin Complete Set
  if (/seerat.*khulafa.*rashidin.*complete/i.test(t)) return 'complete biographical set covering all four Rightly Guided Caliphs — Abu Bakr, Umar, Usman, and Ali (may Allah be pleased with them all)';

  // Seerat Encyclopedia volumes
  if (/seerat.*encyclopedia.*10th/i.test(t)) return 'tenth volume of the monumental 11-volume Seerat Encyclopedia covering the later phases of the Prophet\'s mission and its aftermath';
  if (/seerat.*encyclopedia.*11th/i.test(t)) return 'eleventh and final volume of the Seerat Encyclopedia serving as a comprehensive index and reference supplement to the entire 11-book encyclopedic work';
  if (/seerat.*encyclopedia.*2nd/i.test(t)) return 'second volume of the Seerat Encyclopedia covering the Prophet\'s early life in Makkah and the beginning of revelations';
  if (/seerat.*encyclopedia.*3rd/i.test(t)) return 'third volume of the Seerat Encyclopedia documenting the Prophet\'s Makkan period and the growing Muslim community';
  if (/seerat.*encyclopedia.*4th/i.test(t)) return 'fourth volume of the Seerat Encyclopedia covering the events leading to Hijrah and the establishment of the Muslim community in Madinah';
  if (/seerat.*encyclopedia.*5th/i.test(t)) return 'fifth volume of the Seerat Encyclopedia detailing the battles and treaties of the early Madinan period';
  if (/seerat.*encyclopedia.*6th/i.test(t)) return 'sixth volume of the Seerat Encyclopedia covering the expansion of the Islamic state and major campaigns';
  if (/seerat.*encyclopedia.*7th/i.test(t)) return 'seventh volume of the Seerat Encyclopedia documenting the conquest of Makkah and subsequent events';
  if (/seerat.*encyclopedia.*8th/i.test(t)) return 'eighth volume of the Seerat Encyclopedia covering the Farewell Pilgrimage and the final year of the Prophet\'s life';
  if (/seerat.*encyclopedia.*9[^.]$/i.test(t)) return 'ninth volume of the Seerat Encyclopedia addressing the Prophet\'s final illness, passing, and immediate aftermath';
  if (/seerat.*encyclopedia.*vol.*1/i.test(t)) return 'first volume of the Seerat Encyclopedia introducing the historical context of pre-Islamic Arabia and the birth of Prophet Muhammad (PBUH)';
  if (/seerat.*encyclopedia.*11.*books.*set.*complete/i.test(t)) return 'complete 11-volume Seerat Encyclopedia set — the most comprehensive Prophetic biography ever compiled in Urdu, spanning the entire life of Prophet Muhammad (PBUH) and representing the most expensive publication in the Bab-ul-Fatah catalog at Rs. 65,000';
  if (/seerat.*encyclopedia.*english.*volume.*1/i.test(t)) return 'first English-language volume of the Seerat Encyclopedia making this monumental biographical reference accessible to English-speaking readers';

  // Seerat Imam Bukhari
  if (/seerat.*imam.*bukhari/i.test(t)) return 'biography of Imam Muhammad ibn Ismail al-Bukhari — the greatest compiler of Hadith in Islamic history and author of Sahih al-Bukhari';

  // Seerat Syedna Ali Ibn Abi Taalib
  if (/seerat.*syedna.*ali.*ibn/i.test(t)) return 'imported biography of Sayedina Ali ibn Abi Taalib (R.A) by Dr. Ali Muhammad Sallabi — a definitive scholarly account of the fourth Caliph\'s life';

  // Seerat Syedna Ibrahim
  if (/seerat.*syedna.*ibrahim/i.test(t)) return 'biography of Prophet Ibrahim (Abraham) — peace be upon him — the father of monotheism and a towering figure shared by all Abrahamic faiths';

  // Seerat-un-Nabi by Sallabi
  if (/seerat.*un.*nabi.*sallabi/i.test(t)) return '2-volume biography of Prophet Muhammad (PBUH) by Dr. Ali Muhammad Sallabi, offering a contemporary scholarly account with extensive source references';

  // Sehra Ka Jahaz
  if (/sehra.*ka.*jahaz/i.test(t)) return 'Darussalam publication addressing Islamic wedding customs and the etiquette of marriage celebrations from a religious perspective';

  // Selected Fatawa For Women
  if (/selected.*fatawa.*women/i.test(t)) return 'Darussalam compilation of religious verdicts (Fatawa) specifically addressing the concerns and questions of Muslim women in contemporary life';

  // Selected Friday Sermons
  if (/selected.*friday.*sermons/i.test(t)) return 'curated collection of Friday Khutbahs by Darussalam covering essential topics of faith, worship, morality, and community welfare';

  // Selected Supplications for Day & Night
  if (/selected.*supplications.*day.*night/i.test(t)) return 'Darussalam collection of authentic Prophetic supplications organized by time of day — morning, afternoon, evening, and night — for daily spiritual practice';

  // Selected Surahs and Supplications from The Quran
  if (/selected.*surahs.*supplications.*quran/i.test(t)) return 'Darussalam compilation of selected Quranic Surahs and Duas with translation and commentary for daily recitation and reflection';

  // Shadi se Shadiyon Tak
  if (/shadi.*se.*shadiyon/i.test(t)) return 'Darussalam guide addressing all aspects of married life — from wedding preparations to building a lasting Islamic household — using the marriage journey as its organizing theme';

  // Shahar Ramzan
  if (/shahar.*ramzan/i.test(t)) return 'comprehensive guide to the blessed month of Ramadan covering fasting rules, virtues, Taraweeh prayers, I\'tikaf, Zakat, and Eid celebrations';

  // Shakhsiyat Sazi K Sunehry Usool
  if (/shakhsiyat.*sazi/i.test(t)) return 'book on the golden principles of personality development drawn from Islamic teachings, offering a faith-based approach to building strong moral character';

  // Sharah Al Aqeeda Al Wastiah
  if (/sharah.*al.*aqeeda.*wastiah/i.test(t)) return 'explanatory commentary on Al-Aqeeda Al-Wasitiyyah — the classic theological treatise by Sheikh ul-Islam Ibn Taymiyyah defining the creed of Ahl al-Sunnah wal-Jama\'ah';

  // Sharah Sahih Muslim by Imam Nawawi
  if (/sharah.*sahih.*muslim.*nawawi/i.test(t)) return 'monumental 6-volume Arabic commentary on Sahih Muslim by Imam Yahya ibn Sharaf al-Nawawi — one of the most celebrated and authoritative Sharah (explanations) ever written on any Hadith collection';

  // Sharah Umdat ul Ehkaam (Pashto)
  if (/sharah.*umdat.*pashto/i.test(t)) return 'Pashto-language commentary on Umdat ul Ahkam — the concise Fiqh manual covering essential rulings extracted from authentic Hadith';

  // Shetani Waswasay
  if (/shetani.*waswasay/i.test(t)) return 'guide to recognizing and overcoming satanic whispers and doubts (Waswasah) that plague believers in their faith, worship, and daily life';

  // Shifaat Ka Bayan
  if (/shifaat.*ka.*bayan/i.test(t)) return 'Hadith-based exposition on the concept of Shifaat (intercession) in Islam — explaining who can intercede, when, and under what conditions according to authentic sources';

  // Shining Stars
  if (/shining.*stars/i.test(t)) return '2-volume collection of biographical accounts of the Prophet\'s ten companions who were promised Paradise, illuminating their exemplary lives and sacrifices for Islam';

  // Short Biography of the Prophet and His Ten Companions
  if (/short.*biography.*prophet.*ten.*companions/i.test(t)) return 'concise biographical work covering Prophet Muhammad (PBUH) and his ten promised-Paradise companions in a single accessible volume';

  // Should A Muslim follow A Particular Madhhab
  if (/should.*muslim.*follow.*madhhab/i.test(t)) return 'Darussalam scholarly discussion on the question of Madhhab (school of Islamic jurisprudence) — whether following a particular school is obligatory, recommended, or optional';

  // Shukar, Tobah aur Hum
  if (/shukar.*tobah/i.test(t)) return 'Darussalam reflective work on gratitude (Shukr), repentance (Taubah), and human nature, exploring how these three themes intersect in the life of a believer';

  // Signs of the Hour
  if (/signs.*of.*the.*hour/i.test(t)) return 'Darussalam book cataloging the major and minor signs of the Day of Judgment as described in authentic Hadith and Quranic verses';

  // Silent Moments
  if (/silent.*moments/i.test(t)) return 'Darussalam publication on the spiritual practice of contemplation, quiet reflection, and moments of stillness in a believer\'s daily routine';

  // Silsila Ghazwat e Nabavi
  if (/silsila.*ghazwat.*e.*nabavi/i.test(t)) return '2-volume set documenting the complete chain of military campaigns (Ghazawat and Saraya) conducted by Prophet Muhammad (PBUH) throughout his prophetic mission';

  // Singing & Music in Islamic Perspective
  if (/singing.*music/i.test(t)) return 'scholarly examination of singing and music in Islamic jurisprudence, presenting evidence from Quran, Hadith, and classical scholarly opinions to establish the Islamic ruling';

  // Sipara Set
  if (/sipara.*set.*100/i.test(t)) return 'bulk set of 100 Sipara (Juz) portions from the Quran by Qudrat Ullah Company — ideal for mosques, madrasas, and institutional distribution for Quranic study programs';

  // Slander
  if (/slander$/i.test(t)) return 'Darussalam publication addressing the sin of slander, backbiting (Gheebah), and tale-bearing in Islam, with Quranic warnings and Prophetic admonitions';

  // Smaller Signs of the Day
  if (/smaller.*signs.*day/i.test(t)) return 'Darussalam detailed book on the minor signs of the Last Day — the events and phenomena prophesied to precede the major signs of the Hour';

  // Sood
  if (/sood$/i.test(t)) return 'concise Fiqh treatise on interest (Riba/Sood) in Islam — its prohibition, types, and the devastating economic and spiritual consequences of engaging in usurious transactions';

  // Sorah E Fateha Calligraphy variants
  if (/sorah.*fateha.*calligraphy.*dup/i.test(t)) return 'duplicate variant of the Surah Al-Fateha calligraphy art piece, featuring elegant Arabic script on a decorative display panel';
  if (/sorah.*fateha.*calligraphy.*golden/i.test(t)) return 'premium golden-finish calligraphy art piece of Surah Al-Fateha — the opening chapter of the Quran and the most recited Surah in daily prayers';
  if (/sorah.*fateha.*calligraphy$/i.test(t)) return 'elegant calligraphy art piece of Surah Al-Fateha — the essence of the Quran — crafted as a beautiful Islamic home decoration';

  // Special Ramadan Offer for Muslim Kids
  if (/special.*ramadan.*offer.*kids/i.test(t)) return 'curated Ramadan activity and learning package designed specifically for Muslim children, combining educational content with festive engagement during the blessed month';

  // Spoken Arabic Made Easy
  if (/spoken.*arabic.*made.*easy/i.test(t)) return 'practical guide to conversational Arabic designed for Urdu-speaking learners, enabling them to understand and communicate in everyday Arabic with confidence';

  // Square Flower Rehal variants
  if (/square.*flower.*rehal.*7/i.test(t)) return '7-inch square Flower Rehal — a compact Quran stand with decorative floral design for supporting the Quran during recitation on desks or tables';
  if (/square.*flower.*rehal.*8/i.test(t)) return '8-inch square Flower Rehal — a medium-sized Quran stand with elegant floral motif, ideal for home use during daily Quran recitation';

  // Stories of the Prophets by Ibn Kathir
  if (/stories.*prophets.*ibn.*kathir/i.test(t)) return 'the classic Stories of the Prophets (Qasas al-Anbiya) by Imam Ibn Kathir — a foundational Islamic work presenting the lives of all Prophets from Adam to Muhammad (peace be upon them all)';

  // Stories of the Repentance
  if (/stories.*repentance/i.test(t)) return 'Darussalam collection of inspiring accounts of sincere repentance (Tawbah) from Islamic history — stories of individuals who turned their lives around through genuine remorse and divine mercy';

  // Strategies of Prophet Muhammad (PBUH)
  if (/strategies.*prophet/i.test(t)) return 'analytical study of Prophet Muhammad\'s (PBUH) strategic thinking and leadership methodology across diplomacy, warfare, statecraft, and community building';

  // Stronger Than Iron
  if (/stronger.*than.*iron/i.test(t)) return 'biography of Khabbab ibn al-Aratt (R.A) — one of the earliest Muslims who endured unimaginable torture for the sake of Islam, earning the description "stronger than iron" for his unwavering faith';

  // Subah Shaam Allah Kai Naam (Azkar Card)
  if (/subah.*shaam.*allah.*kai.*naam.*azkar.*card/i.test(t)) return 'morning and evening Azkar card — a compact, portable reference containing the essential remembrances of Allah to be recited at dawn and dusk';

  // Subah Sham k Azkar Flax
  if (/subah.*sham.*k.*azkar.*flax/i.test(t)) return 'flex-bound collection of morning and evening Azkar on durable flax material, designed for frequent use and long-lasting durability during daily recitation';

  // SubhanAllah Laser Cut variants
  if (/subhanallah.*laser.*cut.*table.*decor.*black/i.test(t)) return 'black laser-cut "SubhanAllah" table decoration — a precision-crafted Islamic art piece featuring the glorification of Allah, perfect for desks, shelves, and display surfaces';
  if (/subhanallah.*laser.*cut.*wall.*art.*black/i.test(t)) return 'black laser-cut "SubhanAllah" wall art — an elegant Islamic wall decoration crafted with precision laser cutting, transforming any room into a space of remembrance';
  if (/subhanallah.*laser.*cut.*wall.*art.*golden/i.test(t)) return 'golden laser-cut "SubhanAllah" wall art — a premium Islamic wall decoration with a luxurious gold finish, adding divine elegance to any living space';
  if (/subhanallah.*laser.*cut.*car.*tags.*black/i.test(t)) return 'black laser-cut "SubhanAllah" car tag — a durable Islamic vehicle accessory that keeps the remembrance of Allah present during every journey';

  // Summarized Sahih al Bukhari Arabic-English
  if (/summarized.*sahih.*bukhari.*arabic.*english/i.test(t)) return 'condensed Arabic-English edition of Sahih al-Bukhari containing the most essential narrations selected from the most authentic Hadith collection in Islam';

  // Summarized Sahih Al-Bukhari Farsi/Persian
  if (/summarized.*sahih.*bukhari.*farsi/i.test(t)) return '2-volume Persian (Farsi) summary of Sahih al-Bukhari, making the most authentic Hadith collection accessible to Persian-speaking Muslim communities';

  // Sunan Abu Dawood Urdu
  if (/sunan.*abu.*dawood.*urdu/i.test(t)) return 'complete 4-volume Urdu translation of Sunan Abu Dawood — one of the six principal Hadith collections containing over 4,800 narrations covering Fiqh, worship, and daily life';

  // Sunan An-Nasai
  if (/sunan.*an.*nasai.*7/i.test(t)) return 'complete 7-volume set of Sunan An-Nasai — one of the six canonical Hadith collections, renowned for containing narrations specifically related to the laws and rituals of Islam, priced at Rs. 30,000 as a premium scholarly investment';

  // Sunan Ibn e Majah variants
  if (/sunan.*ibn.*e.*majah.*5.*vol/i.test(t)) return 'complete 5-volume set of Sunan Ibn Majah — one of the six canonical Hadith collections containing over 4,000 narrations, priced at Rs. 25,000 as a major scholarly acquisition';
  if (/sunan.*ibn.*e.*majah.*arabic$/i.test(t)) return 'Arabic-language edition of Sunan Ibn Majah, one of the six principal Hadith compilations recognized by the consensus of Islamic scholarship';
  if (/sunan.*ibn.*majah.*3.*vol/i.test(t)) return '3-volume set of Sunan Ibn Majah — a selected compilation from one of the six canonical Hadith collections covering worship, transactions, and Islamic law';

  // Sunehray Haroof
  if (/sunehray.*haroof/i.test(t)) return 'historical work titled "Golden Letters" exploring significant correspondence, documents, and written records from Islamic history';

  return null;
}

// ─── Templates (ALL NEW for batch 9) ────────────────────────────────────────
const T = {

  // ── Seerah (Seerat Encyclopedia, Seerat-un-Nabi, etc.) ───────────────────
  seerah: {
    opens: [
      'The life of Prophet Muhammad (peace be upon him) represents the single most documented and meticulously preserved biography in all of human history — a claim supported not merely by the volume of surviving sources but by the extraordinary chain-of-custody system (Isnad) that Islamic scholarship developed to verify every reported incident, every recorded saying, and every attributed action. This rich biographical tradition has produced works ranging from concise summaries to multi-volume encyclopedias, each serving different audiences and purposes while drawing upon the same core body of authenticated material. {title} stands within that noble tradition, contributing to the Urdu-speaking world\'s understanding of the Prophet\'s life through carefully researched and systematically organized content.',
      'Every generation of Muslims has felt the need to reconnect with the life of Prophet Muhammad (peace be upon him) through fresh biographical works that address contemporary questions while remaining anchored to the unchanging body of authenticated historical sources. The Seerat genre in Urdu literature has been particularly productive, producing landmark works that have shaped the religious consciousness of millions of readers across the subcontinent. This {detail} — {title} — continues that productive tradition by offering readers a thorough, well-sourced account of the Prophet\'s life that balances scholarly precision with narrative accessibility, making it suitable for both academic study and personal spiritual enrichment.',
      'The study of Prophetic biography (Seerah) serves purposes that extend far beyond historical curiosity — it establishes the practical model of Islamic living that every Muslim is encouraged to emulate, provides the contextual framework for understanding Quranic revelations, and demonstrates through concrete example how divine guidance translates into human action under real-world conditions. {title} has been prepared with full awareness of these multiple purposes, presenting the Prophet\'s life in a manner that simultaneously informs, inspires, and guides readers toward a more complete understanding of their faith.',
      'A comprehensive Seerat Encyclopedia represents the culmination of decades of scholarly effort — the gathering, authentication, organization, and contextualization of thousands of individual reports into a unified narrative that covers every aspect of the Prophet\'s life from his birth in Makkah to his passing in Madinah. The magnitude of this undertaking is difficult to overstate: it requires mastery of Arabic linguistics, Hadith science, Islamic history, Fiqh, and Tafsir, combined with the literary skill to present complex material in a coherent and engaging manner. This {detail} — {title} — is the product of precisely such an undertaking, and it offers readers a depth and breadth of Prophetic biography that few other works can match.',
      'The Prophet Muhammad (peace be upon him) once told his companions that the best among them were those who were best to their families — a statement that reveals the deeply personal, relatable dimension of his character that is sometimes overshadowed by the grand narrative of military campaigns and political achievements. The most valuable Seerat works are those that capture both dimensions: the public leadership that established a civilization and the private compassion that endeared him to those closest to him. {title} strives to present that complete picture, ensuring that readers encounter not just the historical figure but the human being whose example continues to illuminate the lives of over a billion Muslims worldwide.',
      'Understanding the Seerah is fundamentally different from reading ordinary history — it is an act of devotion, a means of strengthening one\'s love for the Prophet (peace be upon him), and a practical guide to implementing Islamic teachings in daily life. The Quran itself instructs believers to follow the Prophet\'s example, making the study of his life not merely commendable but religiously obligatory. This {detail} — {title} — facilitates that obligation by providing a reliable, well-organized account that readers can study sequentially, consult for specific incidents, or use as a reference for teaching and discussion.',
    ],
    mids: [
      'This {detail} — {title} — has been prepared using the most authoritative sources of Prophetic biography available in both Arabic and Urdu, including the classical works of Ibn Hisham, Ibn Kathir, Ibn Sa\'d, and Al-Waqidi, supplemented by contemporary scholarship that has re-examined these sources using modern historical methodology. The content has been organized chronologically, with each phase of the Prophet\'s life treated as a distinct chapter that addresses its political, military, social, and spiritual dimensions. Cross-referencing to primary Hadith sources ensures that every significant claim can be traced to its original report. The production quality — whether in the individual volumes or the complete 11-book set — reflects the significance of the subject matter, with durable binding, clear Arabic and Urdu typography, and quality paper that supports extended study. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making this landmark Seerat work accessible to Pakistani readers and institutions.',
      'The encyclopedic approach adopted in this {detail} — {title} — distinguishes it from conventional biographies by treating each aspect of the Prophet\'s life as a subject worthy of independent, detailed examination rather than as a brief episode within a flowing narrative. This means that topics such as the Prophet\'s treaties, his correspondence with world leaders, his judicial decisions, his family relationships, and his spiritual practices each receive the thorough treatment they deserve. The result is a reference work that serves not only as a biography but as a comprehensive guide to virtually every dimension of the Prophetic mission. The complete set represents a substantial investment in Islamic knowledge — one that will serve libraries, institutions, and serious students of Seerah for generations to come. Available from Bab-ul-Fatah Pakistan at {price}.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. A landmark Seerat work for serious students and collectors. Shop online with delivery across Pakistan.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. The definitive Prophetic biography in Urdu. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Comprehensive, well-sourced Seerat literature. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential Prophetic biography for every Muslim home and library. Order with reliable nationwide delivery.',
    ],
  },

  // ── Companions (Khulafa-e-Rashideen, Sahaba biographies) ──────────────────
  companions: {
    opens: [
      'The companions of Prophet Muhammad (peace be upon him) — the Sahabah — occupy a uniquely exalted position in Islamic theology and history, having been personally selected by Allah to serve as the first generation of Muslims and the primary transmitters of the faith to all subsequent generations. The Quran itself bears witness to their excellence, and the Prophet guaranteed that the best of his followers were those who lived during his lifetime. Studying the lives of these remarkable individuals is therefore not an optional exercise in historical interest but a religious duty that connects contemporary Muslims to the foundational generation of their faith. {title} provides that essential connection by presenting the lives of the companions with the thoroughness and respect they deserve.',
      'The four Rightly Guided Caliphs — Abu Bakr, Umar, Usman, and Ali (may Allah be pleased with them all) — represent the pinnacle of Islamic leadership: a succession of rulers who combined absolute political authority with profound personal piety, administrative genius with humble devotion to prayer, and military prowess with compassionate justice. Each Caliph brought unique qualities to the office, and together they transformed a small community in the Arabian desert into a civilization that stretched from Spain to the borders of India within just three decades. {title} examines the lives of these extraordinary leaders, drawing upon authenticated historical sources to present a balanced, comprehensive account of their achievements, challenges, and enduring legacy.',
      'Behind every great historical movement stand the individuals whose courage, sacrifice, and conviction made it possible — and in the case of Islam, those individuals include not only the Prophet himself but the men and women who abandoned their homes, their wealth, and sometimes their lives to support the mission of spreading monotheism and establishing justice on earth. The biographies of the companions collected in this {detail} — {title} — tell those individual stories: stories of conversion under persecution, of standing firm in battle against overwhelming odds, of governing vast territories with the simplicity and fairness that the Prophet had taught them.',
      'The lives of the Prophet\'s household — his wives, his daughters, and his grandsons Hassan and Hussain (may Allah be pleased with them) — provide an intimate portrait of how Islamic teachings were lived within the closest family circle of the Messenger of Allah. These are not distant historical figures but real people who cooked, cleaned, raised children, managed households, and navigated the same daily challenges that every family faces — all while serving as living examples of the Prophet\'s teachings. {title} brings these personal stories to life with warmth, accuracy, and scholarly rigor, making the Prophet\'s family feel present and relatable to contemporary readers.',
      'The golden incidents (Sunehray Waqiyat) from the lives of the companions serve a purpose that transcends mere historical documentation — they provide practical demonstrations of how Islamic principles translate into real-world action under conditions of crisis, uncertainty, and moral complexity. These stories have been treasured by Muslim scholars for over fourteen centuries because they illuminate the application of faith in ways that abstract theological discussions cannot. This {detail} — {title} — gathers a curated selection of these golden incidents, each one verified for authenticity and presented with context that makes its relevance to contemporary life immediately apparent.',
      'Dr. Ali Muhammad Sallabi has established himself as one of the foremost contemporary biographers of the companions, combining rigorous academic methodology with engaging narrative style and a commitment to presenting multiple perspectives on contested historical events. His biographies are distinguished by their extensive use of primary sources, their willingness to address difficult questions honestly, and their ability to make complex historical material accessible to general readers. {title} exemplifies these qualities, offering a level of scholarly depth and narrative sophistication that sets it apart from more superficial treatments of the same subjects.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from the most trusted sources of companion biographies, including the classical works of Ibn Sa\'d (Al-Tabaqat al-Kubra), Ibn Hajar al-Asqalani (Al-Isabah fi Tamyz al-Sahabah), and Al-Dhahabi (Siyar A\'lam al-Nubala), supplemented by contemporary research that has shed new light on various aspects of early Islamic history. Each biography has been organized to cover the companion\'s background before Islam, their conversion experience, their contributions during the Prophet\'s lifetime, their role in the early Caliphate period, and their lasting legacy. The Urdu translation maintains both the scholarly precision of the source material and the narrative flow that makes these biographies engaging to read. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing Pakistani readers with access to the finest companion literature available.',
      'The value of this {detail} — {title} — as an educational and inspirational resource cannot be overstated. Whether used for personal study, family reading, academic research, or as a teaching tool in Islamic schools and madrasas, these biographies provide the kind of concrete, detailed examples that bring abstract Islamic principles to life. The production quality — durable binding, clear typography, and quality paper — ensures that these volumes will withstand the frequent use and handling that reference works of this importance typically receive. At {price}, this {detail} represents a meaningful investment in Islamic knowledge that will yield spiritual and intellectual returns for years to come. Available from Bab-ul-Fatah Pakistan with delivery to all major cities.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Inspiring companion biographies for every Muslim household. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Authentic Sahaba stories drawn from verified sources. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Learn from the lives of Islam\'s greatest generation. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential companion literature for students and scholars of Islamic history. Order with reliable nationwide delivery.',
    ],
  },

  // ── Sahah E Sitta (Major Hadith Collections) ─────────────────────────────
  sahah_sitta: {
    opens: [
      'The six canonical Hadith collections — known collectively as the Sahah Sitta or Al-Kutub Al-Sittah — constitute the foundational secondary sources of Islamic law and theology, standing second only to the Quran in their authority over the beliefs and practices of the Muslim community. Each collection was compiled by a master scholar who spent decades traveling the Muslim world to collect, verify, authenticate, and organize narrations attributed to Prophet Muhammad (peace be upon him), creating reference works whose reliability has withstood over a millennium of scholarly scrutiny. {title} makes one of these foundational works available to readers who wish to engage directly with the primary sources of Islamic knowledge.',
      'The compilation of Hadith represents one of the most remarkable achievements of Islamic civilization — a scholarly enterprise that produced the most rigorous system of source verification and authentication that the world had ever seen, anticipating modern historiographical methods by over a thousand years. The scholars who compiled the Sahah Sitta applied exacting standards to every narration they accepted, evaluating the memory, character, and chronological reliability of every person in every chain of transmission before granting a Hadith their stamp of approval. This {detail} — {title} — gives readers access to the fruits of that extraordinary scholarly labor.',
      'Access to the original Arabic texts of the major Hadith collections remains essential for anyone who wishes to engage with Islamic scholarship at a serious level — whether as a student of Fiqh, a researcher in Islamic studies, or a dedicated Muslim seeking to verify the evidence behind the practices and beliefs that define their faith. Translations, however excellent, inevitably involve interpretive choices that can affect the reader\'s understanding of the original text. {title} provides that direct access to the Arabic source, enabling readers to engage with the Hadith in the language in which they were originally recorded.',
      'The commentary tradition (Sharh) that has grown up around the major Hadith collections represents some of the finest intellectual work produced by Islamic civilization — detailed scholarly expositions that explain the meaning of each narration, resolve apparent contradictions between different reports, extract Fiqh rulings, and contextualize the Prophetic guidance within the broader framework of Islamic law and theology. Imam Nawawi\'s Sharh on Sahih Muslim is universally regarded as one of the greatest examples of this genre, combining linguistic precision, Fiqh expertise, and spiritual insight in a manner that has earned the admiration of scholars across every school of thought. This {detail} — {title} makes that monumental commentary available in its complete, unabridged form.',
      'The multi-volume nature of the major Hadith collections reflects not merely the quantity of narrations they contain but the extraordinary range of subjects they address — from the minutiae of ritual purification and prayer to the grand themes of divine mercy, social justice, and eschatology. A complete set of any of the Sahah Sitta represents a comprehensive library of Prophetic guidance that addresses virtually every dimension of human experience. This {detail} — {title} — provides that comprehensive library, offering readers the complete text rather than selected excerpts or condensed summaries.',
    ],
    mids: [
      'This {detail} — {title} — has been produced to the highest standards of Islamic academic publishing, using carefully typeset Arabic text with proper diacritical marks, durable binding designed to withstand the frequent consultation that Hadith reference works demand, and quality paper that ensures comfortable reading during extended study sessions. The organizational structure follows the traditional chapter arrangement established by the original compiler, with clear headings and numbering systems that facilitate both sequential reading and quick reference. Where applicable, the text includes the full chains of transmission (Isnad) alongside the content of each narration, allowing readers to trace every Hadith back to its source. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making these essential Islamic reference works accessible to scholars, students, and institutions throughout Pakistan.',
      'The investment required for a complete set of this {detail} — {title} — is substantial but justified by the enduring value of the content: this is not a book that will be read once and shelved but a reference work that will be consulted regularly throughout the owner\'s lifetime and potentially passed down to future generations. Libraries, masjid study circles, Islamic educational institutions, and serious students of Islamic knowledge will find that the convenience and completeness of a full set far outweighs the cost of acquiring individual volumes over time. Available at {price} from Bab-ul-Fatah Pakistan, this {detail} represents one of the most significant investments a Muslim household or institution can make in its Islamic library.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Authentic Hadith literature from the six canonical collections. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Primary Islamic source material for scholars and students. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Complete canonical Hadith collection. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential Hadith reference for every Islamic library. Order with reliable nationwide delivery.',
    ],
  },

  // ── Darussalam Publishers ─────────────────────────────────────────────────
  darussalam: {
    opens: [
      'Among the constellation of Islamic publishers serving the Urdu-speaking world, Darussalam has earned a position of particular distinction through its unwavering commitment to a single guiding principle: that every book it publishes must present Islamic knowledge in a manner that is simultaneously authentic, accessible, and physically durable. This principle manifests in every aspect of Darussalam\'s production process — from the selection of qualified authors and translators through the scholarly review of manuscripts to the final choice of paper, binding, and typography. {title} bears the Darussalam imprint as a mark of that commitment, signaling to readers that the contents have been prepared, verified, and produced to exacting standards.',
      'The Pakistani Islamic book market benefits enormously from Darussalam\'s consistent presence — a presence that provides readers with a reliable anchor point in a market sometimes cluttered with publications of uncertain provenance and questionable accuracy. When readers select a Darussalam title, they are selecting not just a book but a guarantee: guarantee that Quranic verses have been verified, that Hadith narrations have been authenticated, that theological positions reflect mainstream scholarship, and that the physical production will endure through years of use. This {detail} — {title} carries that guarantee, offering Pakistani readers the assurance of quality that the Darussalam name has come to represent.',
      'What distinguishes Darussalam from many other Islamic publishers is its systematic approach to quality control — a multi-layered review process that subjects every manuscript to scrutiny by qualified scholars before it reaches the printing press. This process catches errors that less rigorous publishers might miss: misattributed Hadith, incorrect Quranic references, theological positions that stray from the orthodox consensus, and translations that distort the meaning of the original Arabic. The result is a catalog of publications that Muslim readers can consult with confidence, knowing that the content has been vetted by specialists who share their commitment to accuracy and authenticity. {title} exemplifies this quality-first approach.',
      'Darussalam\'s publishing program covers an impressively broad range of Islamic subjects — from Aqeedah and Fiqh to Seerah and supplications, from children\'s literature to advanced scholarly works — and every title in that program shares the same foundational commitment to presenting verified, well-sourced content in reader-friendly formats. The breadth of the catalog means that readers can build a complete Islamic library from Darussalam publications alone, trusting that every volume on their shelf meets the same high standards. {title} is one such volume, contributing its specific subject matter to that comprehensive library of authenticated Islamic knowledge.',
    ],
    mids: [
      'This {detail} — {title} — has been produced through Darussalam\'s established workflow: authorship or translation by qualified subject-matter experts, scholarly review by specialists in the relevant discipline, verification of all scriptural references against primary sources, editorial polishing for clarity and readability, and final production using materials and techniques optimized for both visual appeal and long-term durability. The result is a publication that functions equally well as a personal study resource, a teaching aid, a family reading selection, and a gift item — each role requiring slightly different qualities that this Darussalam edition has been designed to fulfill. Bab-ul-Fatah Pakistan offers this Darussalam publication at {price}, ensuring that Pakistani readers have convenient access to carefully vetted Islamic literature.',
      'The enduring popularity of Darussalam publications among Pakistani Muslim readers reflects a sophisticated collective judgment about quality — a judgment formed over years of experience with books from various publishers and refined through the recognition that Darussalam titles consistently deliver a combination of accuracy, clarity, and physical durability that few competitors can match. This {detail} — {title} is likely to become a frequently consulted reference in the household or institution that acquires it, its pages growing familiar through repeated use while the binding and paper continue to perform as expected. Available at {price} from Bab-ul-Fatah Pakistan with delivery across all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. A Darussalam publication you can read with confidence. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Authenticated Islamic content from a globally trusted publisher. Order today.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s leading Islamic bookstore, for {price}. Darussalam quality — verified and reliable. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Scholarly accuracy and reader-friendly presentation in every page. Order with reliable nationwide delivery.',
    ],
  },

  // ── Home Decor (Calligraphy, Laser Cut) ──────────────────────────────────
  home_decor: {
    opens: [
      'Islamic home decoration serves a dual purpose that distinguishes it from purely aesthetic interior design: it beautifies the living space while simultaneously creating a constant visual reminder of Allah\'s presence, His attributes, and His guidance. A well-placed calligraphy piece or laser-cut decoration transforms an ordinary wall or surface into a point of spiritual focus — a place where the eyes naturally rest and the heart is gently drawn toward remembrance of the Divine. This {detail} — {title} — fulfills that dual purpose with craftsmanship that honors both the artistic tradition of Islamic decoration and the sacred words it displays.',
      'The art of Islamic calligraphy has evolved over fourteen centuries into one of the world\'s most sophisticated and visually striking artistic traditions — an art form that transforms the written word into objects of breathtaking beauty while maintaining strict adherence to the proportions and rules established by master calligraphers of earlier generations. Modern laser-cutting technology has introduced new possibilities into this ancient art, enabling the creation of intricate designs with a precision that hand-cutting cannot match. This {detail} — {title} — represents the intersection of that ancient artistic tradition with contemporary manufacturing technology, resulting in a decorative piece that is both traditional in its inspiration and modern in its execution.',
      'A Muslim home gains something intangible but profoundly important when its walls carry reminders of faith — whether in the form of Quranic verses, divine names, or words of remembrance like "SubhanAllah" and "Bismillah." These visual elements create an atmosphere of spirituality and peace that affects everyone who enters the space, serving as silent teachers that communicate Islamic identity and values without a single spoken word. This {detail} — {title} — has been designed to provide exactly that kind of atmospheric enhancement, combining aesthetic appeal with spiritual significance in a format that complements any interior decoration style.',
      'The choice of material, color, and finish in Islamic decorative art significantly affects both the visual impact of the piece and its suitability for different settings and lighting conditions. Black laser-cut pieces create dramatic contrast against light-colored walls, making them ideal for contemporary interiors, while golden-finish pieces add warmth and luxury that suits more traditional or formal settings. This {detail} — {title} — has been carefully crafted with its intended display context in mind, ensuring that the material and finish choices maximize the visual impact and aesthetic appeal of the design.',
    ],
    mids: [
      'This {detail} — {title} — has been manufactured using precision laser-cutting technology that produces clean, sharp edges and consistent detail across every element of the design. The material has been selected for its durability and resistance to warping, fading, and discoloration over time, ensuring that the piece will maintain its appearance through years of display. The mounting system — whether for wall hanging, table placement, or vehicle attachment — has been designed for secure installation and easy repositioning. The overall dimensions and proportions have been calibrated to work well in standard Pakistani home and office settings. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic decorative art affordable and accessible to Muslim households across the country.',
      'The demand for Islamic decorative art in Pakistan has grown significantly in recent years as Muslims increasingly seek to express their faith through their home and personal environments rather than limiting religious expression to the mosque. This {detail} — {title} — responds to that demand with a product that combines traditional Islamic design sensibilities with contemporary manufacturing quality and competitive pricing. Whether displayed in the living room, bedroom, study, office, or vehicle, this decorative piece serves as a constant reminder of Allah\'s presence and a beautiful expression of Islamic identity. Available at {price} from Bab-ul-Fatah Pakistan with delivery to all major cities nationwide.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Beautiful Islamic art for your home or office. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. Precision-crafted Islamic decoration that inspires remembrance. Order today with fast shipping.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Elegant Islamic calligraphy and laser-cut art. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Transform your space with beautiful Islamic decorative pieces. Order with reliable nationwide delivery.',
    ],
  },

  // ── Children (Qasas stories, kids books) ─────────────────────────────────
  children: {
    opens: [
      'The Quran repeatedly instructs believers to narrate the stories of the Prophets — not merely as entertainment but as vehicles for moral instruction, spiritual inspiration, and the strengthening of faith in Allah\'s wisdom and mercy. For Muslim children growing up in Pakistan, access to these stories in engaging, age-appropriate formats is essential for developing a strong Islamic identity and a deep emotional connection to the Prophetic tradition. {title} has been specifically designed to serve that developmental need, presenting the stories of Allah\'s messengers in language and style that captivate young readers while maintaining the accuracy and reverence that these sacred narratives deserve.',
      'The 30-part Qasas ul Anbiya series represents one of the most ambitious and comprehensive attempts to bring the stories of the Prophets to Urdu-speaking children in a serialized format that builds anticipation and encourages continued reading. Each installment focuses on a single Prophet or a specific episode from a Prophet\'s life, allowing young readers to engage deeply with each story before moving on to the next. This {detail} — {title} — is one such installment, and it continues the series\' tradition of combining historical accuracy with narrative excitement, ensuring that children learn genuine Islamic history while enjoying a compelling story.',
      'Children absorb moral and spiritual lessons far more effectively through stories than through abstract instruction — a reality that the Prophet Muhammad (peace be upon him) himself recognized and utilized in his teaching of the companions. The stories of the Prophets are particularly powerful vehicles for moral education because they demonstrate, through concrete example, how faith in Allah manifests in human action: how Ibrahim (peace be upon him) stood alone against his entire community, how Musa confronted the mightiest tyrant of his age, and how every Prophet endured hardship with patience and trust in divine wisdom. {title} harnesses that pedagogical power, making these timeless lessons accessible to the youngest generation of Pakistani Muslims.',
      'Islamic children\'s literature in Urdu has made remarkable strides in recent years, moving beyond dry, textbook-style presentations toward genuinely engaging narratives that respect both the intelligence of young readers and the sacredness of the subject matter. The best Islamic children\'s books combine colorful presentation, accessible language, and age-appropriate content with a commitment to presenting Islamic teachings accurately and in a manner that parents can trust. {title} exemplifies this new generation of Islamic children\'s publishing, offering content that delights young readers while earning the confidence of the parents and teachers who select it.',
    ],
    mids: [
      'This {detail} — {title} — has been written and produced with careful attention to the specific needs of its young target audience: the vocabulary is calibrated for the intended age group, the narrative pacing maintains engagement without overwhelming young readers, and the visual presentation — including layout, typography, and any illustrations — supports rather than distracts from the reading experience. The content has been verified for accuracy by qualified Islamic scholars, and the storytelling approach has been tested with actual child readers to ensure that it achieves the intended balance of education and entertainment. The physical production — durable binding, quality paper, and child-safe materials — is designed to withstand the handling that children\'s books typically receive. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic children\'s literature affordable for families throughout Pakistan.',
      'Parents who introduce their children to the stories of the Prophets through publications like this {detail} — {title} are making an investment in their children\'s spiritual development that will yield benefits for the rest of their lives. These stories provide children with moral role models, strengthen their connection to Islamic tradition, and create shared family experiences that become treasured memories. The affordable pricing of this {detail} ensures that it can be purchased not just as a single book but as part of a growing collection of Islamic children\'s literature. Available at {price} from Bab-ul-Fatah Pakistan with delivery across all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Engaging Islamic stories for young readers. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Authentic Prophet stories in child-friendly format. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Quality Islamic children\'s literature. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Inspire your children with the stories of Allah\'s Prophets. Order with reliable nationwide delivery.',
    ],
  },

  // ── Prayer Supplication (Forgiveness, Waswasay, Azkar) ───────────────────
  prayer: {
    opens: [
      'The remembrance of Allah — Dhikr — occupies a central position in the daily spiritual practice of every Muslim, serving as the thread that connects the five daily prayers and transforms the intervals between them from ordinary time into opportunities for continued communion with the Divine. The specific words of remembrance that the Prophet Muhammad (peace be upon him) taught to his companions cover every conceivable situation: waking and sleeping, eating and drinking, entering and leaving the home, traveling and returning, experiencing joy and facing difficulty. {title} gathers these Prophetic invocations into a format designed for regular consultation and practical application.',
      'The battle against spiritual distraction and satanic whispering (Waswasah) is one that every Muslim fights — regardless of their level of knowledge, the length of their worship, or the strength of their faith. These internal struggles are not signs of weak faith but of the ongoing test that defines human existence in a world where the accursed Satan has been granted temporary respite to tempt and mislead. {title} provides readers with the knowledge and tools they need to recognize these spiritual attacks, understand their nature, and respond with the Quranic and Prophetic remedies that have proven effective for fourteen centuries.',
      'The practice of seeking forgiveness — Istighfar — is described in the Quran and Hadith as one of the most powerful and meritorious acts of worship available to a Muslim. The Prophet (peace be upon him) himself used to seek Allah\'s forgiveness more than seventy times each day, despite being completely free of sin, and he urged his companions to make Istighfar a constant practice in their lives. Understanding why forgiveness-seeking is so important, how to do it correctly, and what benefits it produces in both this world and the next is therefore essential knowledge for every believer. {title} provides that understanding with clarity, depth, and practical guidance.',
      'The morning and evening Azkar represent a structured daily spiritual routine that the Prophet (peace be upon him) personally observed and strongly recommended to his followers — a routine that bookends each day with divine remembrance, spiritual protection, and conscious gratitude. These are not optional extras for the especially devout but essential practices that provide spiritual armor against the challenges and temptations of daily life. {title} makes these essential practices easily accessible by collecting them into a portable, well-organized format that can be kept on a desk, in a bag, or by the bedside for convenient reference.',
      'The Islamic understanding of remembrance extends far beyond the mechanical repetition of specific phrases — it encompasses a complete spiritual orientation that transforms the believer\'s relationship with time, with the material world, and with their own inner life. Every moment of genuine Dhikr recalibrates the heart toward its true purpose, pushes back against the distractions and anxieties that dominate modern life, and strengthens the connection between the servant and the Creator. This {detail} — {title} — facilitates that recalibration by providing the specific words and practices that the Prophet himself used for spiritual nourishment and protection.',
    ],
    mids: [
      'This {detail} — {title} — has been prepared with meticulous attention to the authenticity of every supplication, remembrance, and remedy it contains — verifying each item against the primary collections of Hadith and the established works of the scholars of Dhikr and Du\'a. Where multiple authentic wordings exist for a single supplication, the compiler has included the variants, allowing readers to choose the version they find most meaningful. The Arabic text of each invocation is presented with Urdu translation and transliteration where helpful, and brief explanatory notes clarify the context and proper usage of each item. The physical format — whether card, flex-bound booklet, or standard book — has been designed to support the specific usage pattern for which it is intended. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making essential spiritual practices accessible to Muslims throughout the country.',
      'The practical value of this {detail} — {title} — becomes apparent from the very first day of use — as readers begin incorporating these Prophetic invocations into their daily routine, they typically report a noticeable improvement in their sense of inner peace, their ability to manage anxiety and stress, and the quality of their prayers and worship. The compact size and durable construction ensure that this spiritual companion can accompany the reader wherever they go — to the office, on journeys, to the mosque, and through every transition of daily life. At {price}, this {detail} represents a modest investment with profound spiritual returns. Available from Bab-ul-Fatah Pakistan with delivery to all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Essential supplications and remembrances for daily practice. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Protect yourself with Prophetic Azkar and Duas. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Daily spiritual nourishment and protection. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Authentic morning and evening remembrances for every believer. Order with reliable nationwide delivery.',
    ],
  },

  // ── Education (Scientific Miracles, Arabic, Aqeeda, Music) ───────────────
  education: {
    opens: [
      'The relationship between Islamic revelation and modern scientific knowledge has fascinated Muslim scholars and scientists for well over a century — a fascination rooted in the remarkable number of natural phenomena that the Quran described with stunning accuracy more than fourteen hundred years before modern science discovered them. {title} explores this relationship with scientific rigor and scholarly honesty, presenting specific Quranic verses alongside the scientific discoveries that appear to confirm their accuracy, while carefully avoiding the exaggerations and oversimplifications that have sometimes marred popular treatments of this subject.',
      'Modern education in Pakistan increasingly demands resources that can bridge the gap between religious knowledge and secular learning — resources that demonstrate to students, parents, and educators that Islam and science are not opposing forces but complementary dimensions of a single truth. {title} serves that bridging function by presenting scientific material within an Islamic framework, showing how the discoveries of modern science have consistently confirmed rather than contradicted the foundational claims of Islamic revelation. The result is an educational experience that strengthens both scientific literacy and religious conviction simultaneously.',
      'The acquisition of Arabic language skills opens doors to the original sources of Islamic knowledge — the Quran, the Hadith, and the classical scholarly works that form the foundation of Islamic civilization. For Urdu-speaking Muslims who wish to move beyond translations and engage directly with these primary sources, a practical, well-designed Arabic learning resource is an essential first step. {title} provides that first step, focusing specifically on conversational Arabic proficiency that enables learners to understand and communicate in everyday Arabic with growing confidence.',
      'Islamic education encompasses far more than the memorization of facts and the recitation of texts — it involves the development of a coherent worldview that integrates faith with reason, revelation with experience, and worship with daily life. The best Islamic educational resources are those that facilitate this integrative understanding rather than merely transmitting information in isolation. {title} has been designed with this integrative approach in mind, presenting its subject in a manner that connects it to the broader framework of Islamic knowledge and practice.',
      'The question of music and singing in Islam is one of those topics where popular opinion, cultural practice, and scholarly ruling often diverge — creating confusion among Muslims who genuinely wish to understand what their religion permits and prohibits in this area of daily life. {title} addresses that confusion by examining the relevant Quranic verses, Hadith narrations, and scholarly opinions from across the Islamic legal tradition, presenting the evidence in a balanced manner that allows readers to arrive at an informed understanding of the Islamic position.',
    ],
    mids: [
      'This {detail} — {title} — has been prepared by authors who possess both subject-matter expertise and the pedagogical skill needed to communicate complex ideas in language that is accessible to readers who may not have specialized prior knowledge. The content has been organized to support both systematic study and convenient reference, with clear headings, logical sequencing, and helpful supplementary materials including glossaries, indexes, and summary tables. The production quality — durable binding, clear typography on quality paper — ensures that this educational resource will withstand the repeated use and handling that learning materials typically receive. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic education affordable and accessible throughout Pakistan.',
      'The instructional approach of this {detail} — {title} — reflects contemporary best practices in educational publishing: material is presented in manageable units, key concepts are reinforced through examples and exercises, and the overall progression moves from foundational concepts to more advanced applications in a manner that supports genuine comprehension rather than superficial familiarity. Whether used in a formal classroom setting, for individual self-study, or as a supplementary reference alongside other educational materials, this {detail} delivers reliable, well-organized content that respects the reader\'s time while delivering genuine educational value. Available at {price} from Bab-ul-Fatah Pakistan with delivery across all major cities.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. A valuable educational resource for students and lifelong learners. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Quality Islamic education that bridges faith and knowledge. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Strengthen your understanding with this proven educational material. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Engaging, well-structured Islamic education for classroom and self-study. Order with reliable nationwide delivery.',
    ],
  },

  // ── Biography (Imam Bukhari, Ibrahim AS, Personality, Ghazwat, etc.) ────
  biography: {
    opens: [
      'The biographical genre (Sirah) in Islamic literature extends beyond the life of Prophet Muhammad (peace be upon him) to encompass the lives of all those figures — Prophets, companions, scholars, and reformers — whose contributions have shaped the course of Islamic civilization. These biographies serve as repositories of practical wisdom, moral exemplars, and historical documentation that illuminate the principles of Islamic living through the concrete details of actual human lives. {title} contributes to this rich biographical tradition by presenting the life of its subject with scholarly thoroughness and narrative engagement.',
      'The military campaigns (Ghazawat and Saraya) of Prophet Muhammad (peace be upon him) constitute one of the most extensively documented and analytically studied aspects of early Islamic history — a body of material that provides invaluable insights into the Prophet\'s strategic thinking, his moral conduct in warfare, his treatment of prisoners and conquered peoples, and his ability to inspire extraordinary courage and discipline in his followers. Understanding these campaigns is essential for any serious student of Islamic history, military science, or leadership studies. This {detail} — {title} — provides a comprehensive account of these campaigns in a systematic, well-organized format.',
      'The lives of the great scholars of Islam — figures like Imam Muhammad ibn Ismail al-Bukhari — remind us that the preservation and transmission of Islamic knowledge required sacrifices of almost unimaginable magnitude: decades of travel across the Muslim world, the memorization of hundreds of thousands of narrations, the rigorous application of authentication standards that most modern researchers would find impossibly demanding, and the perseverance to continue this work despite poverty, political instability, and physical hardship. {title} brings these extraordinary lives to vivid detail, inspiring readers with the dedication and sacrifice that built the edifice of Islamic scholarship.',
      'The stories of the Prophets — from Adam to Muhammad (peace be upon them all) — form the oldest continuous narrative tradition in human history, a tradition that has been preserved with remarkable fidelity through the Quran, the Hadith, and the works of classical historians like Imam Ibn Kathir. These stories serve simultaneously as historical documentation, moral instruction, theological exposition, and spiritual inspiration — functions that no other body of narrative can match in terms of breadth and depth. This {detail} — {title} presents these stories in the masterful literary style that has made Ibn Kathir\'s work the definitive reference on this subject for over seven centuries.',
      'Islamic personality development — the process of building strong moral character grounded in faith — is a subject of profound practical importance that receives relatively little systematic attention in contemporary Muslim education. The Quran and Sunnah provide comprehensive guidance on character traits such as honesty, patience, courage, humility, generosity, and justice, but that guidance is scattered across thousands of verses and narrations. This {detail} — {title} — gathers that scattered guidance into a coherent framework, presenting the golden principles of Islamic character development in a systematic, accessible format.',
    ],
    mids: [
      'This {detail} — {title} — draws upon the most authoritative biographical sources available in both Arabic and Urdu, supplemented by contemporary research that has brought new insights and perspectives to our understanding of these historical figures. The narrative has been organized to provide both chronological continuity and thematic depth, allowing readers to follow the subject\'s life story while also exploring specific aspects of their character, achievements, and legacy in focused detail. The production quality reflects the significance of the content, with durable binding, clear typography, and quality paper that supports extended reading and frequent reference. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making these important biographical works accessible to readers throughout Pakistan.',
      'Whether read for personal inspiration, academic research, family education, or community teaching, this {detail} — {title} — delivers biographical content that meets the highest standards of accuracy and readability. The lives presented in these pages offer lessons in faith, courage, perseverance, and moral integrity that remain as relevant today as they were when these individuals first walked the earth. At {price}, this {detail} represents an investment in both knowledge and character — a book that can change not just what its readers know but who they aspire to become. Available from Bab-ul-Fatah Pakistan with delivery to all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Inspiring biographies from Islamic history. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Lessons in faith and character from remarkable lives. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Well-researched Islamic biographies. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential reading for every student of Islamic history. Order with reliable nationwide delivery.',
    ],
  },

  // ── Hadith (Shifaat, Summarized Bukhari) ─────────────────────────────────
  hadith: {
    opens: [
      'The concept of Shifaat — intercession on the Day of Judgment — is one of the most discussed and sometimes misunderstood aspects of Islamic theology, touching upon fundamental questions about divine mercy, the role of the Prophet Muhammad (peace be upon him) in the Hereafter, and the conditions under which intercession will be granted. Understanding this concept correctly is essential for maintaining a sound creed and avoiding the extremes of either denying intercession altogether or attributing to it powers that belong to Allah alone. {title} provides a thorough, Hadith-based exposition of this important theological subject.',
      'The Hadith collections — particularly Sahih al-Bukhari and Sahih Muslim — represent the most carefully authenticated body of religious literature in any human tradition, a claim supported by the elaborate system of source criticism (Jarh wa Ta\'deel) that Islamic scholars developed and refined over centuries of dedicated scholarship. Access to these collections in summarized or translated form serves an important function: it makes the essential content of these monumental works accessible to readers who may not have the linguistic or scholarly preparation to engage with the complete Arabic originals. This {detail} — {title} — serves that accessibility function by presenting selected narrations with translation and explanatory notes.',
      'The science of Hadith — Ulum al-Hadith — encompasses not only the authentication of individual narrations but the systematic extraction of legal rulings, moral principles, and theological positions from the accumulated body of Prophetic guidance. This extraction process requires knowledge of Arabic linguistics, Islamic jurisprudence, historical context, and the methodological principles that govern the interpretation of Hadith. {title} engages with the Hadith tradition at this analytical level, presenting not just the texts of narrations but the scholarly understanding of their implications and applications.',
    ],
    mids: [
      'This {detail} — {title} — has been prepared with reference to the most authoritative Hadith sources and scholarly commentaries, ensuring that every position presented is supported by authentic evidence and reflects the understanding of the classical scholars who dedicated their lives to the preservation and interpretation of Prophetic guidance. The content has been organized to facilitate both systematic study and quick reference, with clear topical headings, cross-references between related narrations, and explanatory notes that clarify the context and implications of each Hadith discussed. The production quality — durable binding, clear typography, and quality paper — supports the kind of extended consultation that reference works of this nature require. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making important Hadith literature accessible to readers throughout Pakistan.',
      'The practical value of this {detail} — {title} — lies in its ability to make complex Hadith-based discussions accessible to readers who may not have advanced training in Islamic scholarship while maintaining the level of accuracy and depth that more knowledgeable readers require. Whether used as an introduction to the Hadith tradition, a reference for specific questions, or a teaching resource for study circles and classroom instruction, this {detail} delivers reliable content in a format that supports effective learning and genuine understanding. Available at {price} from Bab-ul-Fatah Pakistan with delivery across all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Authentic Hadith-based scholarship for every reader. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Essential Hadith literature with verified sources. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Engage with Prophetic traditions directly. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Important Hadith studies for students and general readers. Order with reliable nationwide delivery.',
    ],
  },

  // ── History ──────────────────────────────────────────────────────────────
  history: {
    opens: [
      'Islamic history encompasses a civilization of extraordinary breadth, diversity, and achievement — a civilization that produced breakthroughs in science, mathematics, medicine, philosophy, art, and governance while simultaneously developing the most sophisticated system of religious scholarship that the world has ever seen. Understanding that history is essential for every Muslim who wishes to appreciate the full scope of their intellectual and spiritual heritage, and for every student of world history who recognizes that the Islamic contribution to human civilization has been systematically underrepresented in conventional historical narratives. {title} contributes to a more complete understanding of that heritage.',
      'The golden age of Islamic civilization produced a wealth of written material — correspondence between rulers and scholars, administrative documents, literary works, and historical chronicles — that provides modern readers with a remarkably detailed window into the thoughts, concerns, and daily lives of people who lived centuries ago. These surviving documents are not dry historical curiosities but vibrant records of human experience that speak across the centuries about universal themes: power and justice, faith and doubt, love and loss, ambition and humility. This {detail} — {title} — brings some of these remarkable historical records to the attention of contemporary Urdu-speaking readers.',
      'History is not merely the record of past events but the key to understanding the present and navigating the future — a truth that applies with particular force to Islamic history, where many of the challenges, debates, and achievements of earlier centuries continue to resonate in the contemporary Muslim world. Studying the historical experience of the Muslim community provides perspective on current affairs, inspiration from the achievements of earlier generations, and cautionary lessons from the failures and divisions that have periodically weakened the community. {title} serves that educational purpose by presenting historical content that is both informative and relevant.',
    ],
    mids: [
      'This {detail} — {title} — has been compiled from the most reliable historical sources available, with careful attention to distinguishing verified historical accounts from legendary or anecdotal material. The narrative has been organized in a manner that facilitates both sequential reading and topical reference, and the language has been chosen for its ability to communicate complex historical material in an engaging and accessible manner. The production quality — durable binding, clear typography, and quality paper — ensures that this historical work will serve as a lasting reference for personal, academic, or institutional libraries. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making important historical literature accessible throughout Pakistan.',
      'The enduring relevance of this {detail} — {title} — lies in its ability to connect historical events and personalities to broader themes of faith, governance, culture, and human experience that transcend any single time period. Readers who engage with this historical content will find themselves better equipped to understand not only the past but also the present, as many of the patterns, challenges, and achievements of Islamic history continue to echo in contemporary Muslim life. Available at {price} from Bab-ul-Fatah Pakistan with delivery to all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Explore the rich tapestry of Islamic history. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Well-researched historical content for every reader. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Engaging Islamic history that illuminates the present. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential historical literature for students and general readers. Order with reliable nationwide delivery.',
    ],
  },

  // ── Fiqh ─────────────────────────────────────────────────────────────────
  fiqh: {
    opens: [
      'The prohibition of interest (Riba) in Islam is one of the most unequivocal and frequently reiterated commands in the entire Quran — mentioned in at least a dozen verses with language that leaves no room for ambiguity or interpretive flexibility. Despite this textual clarity, the practical application of the Riba prohibition in modern financial contexts raises complex questions about what constitutes interest, what distinguishes it from legitimate profit, and how Muslims can participate in the modern economy while remaining faithful to this fundamental divine command. {title} addresses these questions with clarity, scholarly depth, and practical relevance.',
      'The economic philosophy underlying Islam\'s prohibition of interest (Sood/Riba) reflects a comprehensive vision of economic justice that prioritizes genuine productive activity over passive wealth accumulation, risk-sharing over guaranteed returns, and social welfare over individual profit maximization. Understanding this philosophy is essential for any Muslim who wishes to navigate the modern financial landscape — with its credit cards, mortgages, bank accounts, and investment instruments — while remaining within the boundaries of Islamic law. This {detail} — {title} provides that understanding in a concise, focused format.',
    ],
    mids: [
      'This {detail} — {title} — has been prepared with reference to the primary sources of Islamic law — the Quran, the authentic Hadith, the consensus of the companions, and the established principles of Islamic jurisprudence — supplemented by the rulings of contemporary scholars and Islamic finance experts who have addressed the specific challenges posed by modern financial instruments and institutions. The content covers both the theoretical foundations of the Riba prohibition and its practical applications in everyday financial scenarios. The concise format makes this {detail} accessible to readers who want essential guidance without extensive academic discussion. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making important Fiqh literature affordable for readers throughout Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Essential Fiqh guidance on a critical Islamic topic. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Understand Islam\'s stance on interest and finance. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Concise Fiqh guidance for modern Muslims. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Important Islamic jurisprudence at an accessible price. Order with reliable nationwide delivery.',
    ],
  },

  // ── Fasting ──────────────────────────────────────────────────────────────
  fasting: {
    opens: [
      'The blessed month of Ramadan stands as the most spiritually intense period in the Islamic calendar — thirty days of fasting, prayer, Quran recitation, charity, and self-discipline that collectively represent the most comprehensive spiritual workout available to a Muslim in any single month. The rewards of Ramadan are described in the Hadith as beyond human comprehension, and the Prophet (peace be upon him) described it as a month whose beginning is mercy, whose middle is forgiveness, and whose end is freedom from the Hellfire. {title} serves as a comprehensive companion for this sacred month, covering every aspect of Ramadan observance with scholarly thoroughness.',
    ],
    mids: [
      'This {detail} — {title} — covers the complete spectrum of Ramadan-related guidance: the Fiqh of fasting including Suhoor and Iftar timings, the nullifiers of the fast, and exemptions for the sick, elderly, and travelers; the virtues and special prayers of Ramadan including Taraweeh and the Night of Decree (Laylatul Qadr); the obligation of Zakat al-Fitr and its calculation; the recommended acts of worship, charity, and Quran recitation; and the Eid celebrations that mark the conclusion of the blessed month. The content has been sourced from authenticated Hadith and the rulings of established Islamic scholars. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing comprehensive Ramadan guidance for every Muslim household.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Your complete Ramadan companion and guide. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Comprehensive Ramadan guidance for the whole family. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Prepare for Ramadan with this essential guide. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Everything you need for a blessed Ramadan. Order with reliable nationwide delivery.',
    ],
  },

  // ── Rehal (Quran Stands) ─────────────────────────────────────────────────
  rehal: {
    opens: [
      'A Rehal — the traditional Quran stand — occupies a special place in Muslim material culture as the piece of furniture that most directly serves the act of worship: it holds the Quran open during recitation, relieving the reader\'s hands and maintaining the book at an angle that is both ergonomically comfortable and respectful of the sacred text. The tradition of using a Rehal during Quran recitation extends back many centuries and reflects the Muslim community\'s deep reverence for the physical book of the Quran and the desire to handle it with the utmost care and dignity. This {detail} — {title} — continues that tradition with a design that combines traditional functionality with contemporary aesthetics.',
      'Every Muslim household that maintains a daily practice of Quran recitation benefits from having a dedicated Quran stand — a stable, angled surface that keeps the Mushaf open at the desired page, protects the book from damage during use, and elevates it to a position of physical respect that reflects its spiritual significance. The Rehal has evolved over the centuries into a wide variety of designs, materials, and sizes, each suited to different contexts and preferences. This {detail} — {title} — offers a well-crafted option in the popular square flower design, providing both functional utility and decorative appeal.',
    ],
    mids: [
      'This {detail} — {title} — has been manufactured from quality materials selected for their combination of stability, durability, and aesthetic appeal. The square flower design features an attractive decorative motif that enhances the visual appeal of the Quran recitation area, whether in a home, office, mosque, or Islamic center. The folding mechanism allows the Rehal to be stored compactly when not in use, and the construction quality ensures stable, wobble-free support for the Quran during extended recitation sessions. The size has been calibrated to accommodate standard Quran editions commonly used in Pakistan. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Rehal affordable for Muslim households across the country.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. A beautiful Quran stand for your daily recitation. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. Quality Rehal with elegant floral design. Order today with fast shipping across Pakistan.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. A respectful home for your Quran. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Durable, attractive Quran stand for home and mosque use. Order with reliable nationwide delivery.',
    ],
  },

  // ── Parah Parts (Sipara Sets) ───────────────────────────────────────────
  parah_parts: {
    opens: [
      'The distribution of Quran portions — Sipara or Juz — serves a vital function in Islamic education and community service: it enables mosques, madrasas, schools, and charitable organizations to provide individual copies of Quran sections to students, worshippers, and community members who may not be able to afford a complete Quran. Bulk Sipara sets are among the most frequently requested items by Islamic institutions, reflecting the ongoing demand for Quranic study materials in communities across Pakistan. This {detail} — {title} — addresses that institutional demand by providing a large quantity of Sipara at a bulk price that makes wide distribution economically feasible.',
    ],
    mids: [
      'This {detail} — {title} — contains 100 complete sets of the 30 Sipara (Juz) of the Holy Quran, produced by Qudrat Ullah Company — a well-established name in Pakistani Quran printing with decades of experience in producing clear, accurate, and durable Quranic texts. Each Sipara features clear Arabic typography optimized for readability during recitation, standard Pakistani script style, and durable paper and binding that can withstand the handling that educational materials typically receive. The bulk pricing of this set — at {price} for 100 copies — makes it exceptionally cost-effective for institutional buyers including mosques, madrasas, Islamic schools, and charitable organizations. Bab-ul-Fatah Pakistan offers this institutional package with delivery across Pakistan.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Bulk Quran portions for mosques and madrasas. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. 100 Sipara sets for institutional distribution. Order today with fast shipping across Pakistan.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Cost-effective Quran distribution solution. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Quality Sipara sets in bulk for Islamic institutions. Order with reliable nationwide delivery.',
    ],
  },

  // ── Ramadan ──────────────────────────────────────────────────────────────
  ramadan: {
    opens: [
      'Ramadan holds a unique power to capture the hearts and imagination of Muslim children — the sight of the community fasting, the sounds of Taraweeh in the mosque, the excitement of Eid preparations — all of these create lasting memories that shape a child\'s understanding of their faith for years to come. Channeling that natural excitement into meaningful learning is one of the most important responsibilities of Muslim parents and educators during the blessed month. This {detail} — {title} — has been specifically designed to serve that purpose, offering a curated package of Ramadan-themed activities and educational content that keeps children engaged, learning, and spiritually connected throughout the month.',
    ],
    mids: [
      'This {detail} — {title} — has been assembled to provide a comprehensive Ramadan experience for Muslim children, combining educational content about the significance and rulings of Ramadan with engaging activities that make the learning process enjoyable and memorable. The materials have been selected for their age-appropriateness, their alignment with mainstream Islamic teachings, and their ability to hold children\'s attention throughout the long days of fasting. The package format makes it easy for parents to provide structured Ramadan activities without the need for extensive preparation. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making it easy for families to invest in their children\'s Ramadan experience.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Make this Ramadan special for your children. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. Ramadan learning and fun for Muslim kids. Order today with fast shipping.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. A meaningful Ramadan gift for your children. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Engage your kids with Islam during the blessed month. Order with reliable nationwide delivery.',
    ],
  },

  // ── Products (miscellaneous) ─────────────────────────────────────────────
  products: {
    opens: [
      'Islamic lifestyle accessories have evolved significantly in recent years, with Muslim consumers increasingly seeking products that allow them to express their faith identity in their daily lives — not just during prayer but while commuting, working, socializing, and going about their ordinary routines. This {detail} — {title} — responds to that demand by providing a practical, well-crafted item that keeps the remembrance of Allah present in the everyday environment.',
    ],
    mids: [
      'This {detail} — {title} — has been manufactured using precision laser-cutting technology that produces clean, consistent details across every unit. The material has been selected for durability and resistance to wear, ensuring that the product maintains its appearance through regular daily use. The design has been optimized for its intended application, balancing aesthetic appeal with practical functionality. Bab-ul-Fatah Pakistan offers this {detail} at {price}, providing an affordable way to incorporate Islamic identity into daily life.',
    ],
    closes: [
      'Order this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Express your faith in everyday life. Shop online with nationwide delivery.',
      'Buy {title} from Bab-ul-Fatah Pakistan for {price}. Quality Islamic lifestyle product. Order today with fast shipping across Pakistan.',
      'Purchase this {detail} from Bab-ul-Fatah, Pakistan\'s trusted Islamic store, for {price}. Keep Allah\'s remembrance with you always. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. A meaningful Islamic accessory for daily use. Order with reliable nationwide delivery.',
    ],
  },

  // ── Reference ────────────────────────────────────────────────────────────
  reference: {
    opens: [
      'Reference works in Islamic scholarship serve a function that is fundamentally different from that of books meant for sequential reading — they are designed to be consulted repeatedly for specific information, and their value is measured not by how quickly they can be finished but by how reliably and efficiently they deliver the answers that readers seek. The best Islamic reference works combine comprehensive coverage with clear organization, enabling readers to locate relevant material quickly without sacrificing depth or accuracy. {title} has been prepared with that reference-oriented approach, serving as a reliable resource for anyone who needs quick access to verified Islamic information.',
    ],
    mids: [
      'This {detail} — {title} — has been organized to maximize its utility as a reference tool, with clear structural divisions, helpful indexing or cross-referencing, and a presentation style that facilitates rapid information retrieval. The content covers its subject comprehensively, drawing upon the most authoritative primary and secondary sources available in the field. The physical production — durable binding, clear typography, and quality paper — supports the frequent handling that reference works typically receive. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making important Islamic reference material accessible to readers and institutions throughout Pakistan.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. A reliable Islamic reference for your library. Shop online with nationwide delivery.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. Comprehensive reference content from trusted sources. Order today with fast shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Authoritative reference work for students and scholars. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Essential Islamic reference at an accessible price. Order with reliable nationwide delivery.',
    ],
  },

  // ── General (fallback) ────────────────────────────────────────────────────
  general: {
    opens: [
      'The corpus of Islamic literature in Urdu represents one of the richest bodies of religious writing in any contemporary language — a tradition that has produced seminal works on every aspect of Islamic knowledge, from Quranic exegesis and Hadith commentary to Fiqh, Seerah, and practical spiritual guidance. Within that vast literary landscape, individual titles distinguish themselves through the quality of their scholarship, the clarity of their presentation, and their ability to address the needs and questions of contemporary readers. {title} has earned its place within that tradition by offering content that is simultaneously authentic, accessible, and relevant to the concerns of Pakistani Muslim readers.',
      'Every worthwhile addition to the Islamic bookshelf serves at least one of three essential functions: it informs the reader about aspects of their faith they did not previously understand, it corrects misunderstandings that may have developed through informal or incomplete learning, or it inspires a deeper engagement with Islamic knowledge and practice than the reader had previously maintained. {title} aims to fulfill all three of these functions, providing content that educates, clarifies, and motivates in equal measure.',
      'The enduring demand for quality Islamic publications in Pakistan reflects a community that values both religious literacy and intellectual engagement — a community that wants to understand its faith deeply rather than merely following inherited practices without comprehension. Publications that respect this desire for genuine understanding, while maintaining the scholarly rigor that Islamic subjects require, perform a valuable service that extends far beyond the commercial transaction of buying and selling books. {title} is one such publication, contributing to the intellectual and spiritual development of its readers with content they can trust.',
    ],
    mids: [
      'This {detail} — {title} — has been produced to meet the standards that Pakistani readers of Islamic literature have come to expect: well-organized content, clear and accurate writing, reliable sourcing from primary Islamic texts, and physical construction that supports the kind of regular use and handling that these books typically receive. The subject has been addressed with appropriate depth, balancing comprehensiveness with readability, and the production quality ensures that this title will serve as a lasting addition to any Islamic library. Bab-ul-Fatah Pakistan offers this {detail} at {price}, making quality Islamic literature affordable for readers throughout Pakistan.',
      'The practical value of this {detail} — {title} — extends well beyond its purchase price — it represents an investment in Islamic knowledge that will continue to yield spiritual and intellectual returns for years to come. Whether used for personal study, family reading circles, formal educational settings, or as a meaningful gift for special occasions, this publication delivers reliable content in an appealing format. Available at {price} from Bab-ul-Fatah Pakistan with delivery across all major cities nationwide.',
    ],
    closes: [
      'Order {title} from Bab-ul-Fatah Pakistan for {price}. Quality Islamic content for every reader. Shop online with delivery across all Pakistani cities.',
      'Buy this {detail} — {title} — from Bab-ul-Fatah Pakistan for {price}. A valuable addition to your Islamic library. Order today with fast nationwide shipping.',
      'Purchase {title} from Bab-ul-Fatah, Pakistan\'s trusted Islamic bookstore, for {price}. Reliable, well-presented Islamic literature. Order online now.',
      'Get {title} at Bab-ul-Fatah Pakistan for {price}. Trusted Islamic content at an accessible price. Order with reliable nationwide delivery.',
    ],
  },
};

// ─── Description generator ──────────────────────────────────────────────────
function generateDescription(product, index) {
  const catKey = detectCat(product);
  const templates = T[catKey] || T.general;
  const title = product.title;
  const price = formatPrice(product.price);
  const detail = productDetail(title, index) || 'well-regarded Islamic publication';

  const hash = hashStr(product.title || '') + index;
  const openIdx = hash % templates.opens.length;
  const midIdx = (hash >> 4) % templates.mids.length;
  const closeIdx = (hash >> 8) % templates.closes.length;

  let desc = templates.opens[openIdx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{detail\}/g, detail);

  desc += '\n\n' + templates.mids[midIdx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{detail\}/g, detail);

  desc += '\n\n' + templates.closes[closeIdx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{detail\}/g, detail);

  return desc.trim();
}

// ─── Meta description generator ─────────────────────────────────────────────
function generateMetaDescription(product, index) {
  const title = product.title;
  const price = formatPrice(product.price);
  const cat = ((product.category && product.category.name) || '').toLowerCase();

  const metaTemplates = [
    `Buy ${title} at Bab-ul-Fatah Pakistan for ${price}. Authentic Islamic ${cat} content. Order online with fast delivery across all cities in Pakistan.`,
    `Order ${title} from Bab-ul-Fatah Pakistan — ${price}. Trusted Islamic ${cat} publication with verified content. Shop now with nationwide shipping.`,
    `${title} — available at Bab-ul-Fatah Pakistan for ${price}. Browse our complete Islamic bookstore collection and order with secure delivery.`,
    `Shop ${title} online at Bab-ul-Fatah Pakistan for just ${price}. Quality Islamic ${cat} resource. Reliable nationwide delivery to your doorstep.`,
    `Get ${title} from Bab-ul-Fatah — Pakistan's trusted Islamic store — for ${price}. Order today with fast shipping and careful packaging.`,
    `Purchase ${title} for ${price} at Bab-ul-Fatah Pakistan. Dependable Islamic ${cat} content. Order online for fast, secure delivery anywhere in Pakistan.`,
  ];

  const idx = (hashStr(product.title || '') + index) % metaTemplates.length;
  let meta = metaTemplates[idx]
    .replace(/\{title\}/g, title)
    .replace(/\{price\}/g, price)
    .replace(/\{cat\}/g, cat);

  if (meta.length > 155) meta = meta.substring(0, 152) + '...';
  if (meta.length < 120) {
    const pad = ' Bab-ul-Fatah Pakistan.';
    if (meta.length + pad.length <= 155) meta += pad;
  }

  return meta;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Bab-ul-Fatah — SEO Batch 9 Description Writer             ║');
  console.log('║   Products 901–1000 (skip 900, take 100, orderBy createdAt)║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ── Step 1: Fetch products ──────────────────────────────────────────────
    console.log('[1/5] Fetching products (skip 900, take 100) …');
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      skip: 900,
      take: 100,
      select: { id: true, title: true, slug: true, price: true, category: { select: { name: true } } },
    });

    // Enrich with categoryName for detectCat
    const enriched = products.map(p => ({
      ...p,
      categoryName: (p.category && p.category.name) || '',
    }));

    // Save to batch9-products.json
    const productsPath = path.join(__dirname, 'batch9-products.json');
    fs.writeFileSync(productsPath, JSON.stringify(enriched, null, 2));
    console.log(`  Saved ${enriched.length} products → ${productsPath}\n`);

    // ── Step 2: Generate descriptions ──────────────────────────────────────
    console.log('[2/5] Generating descriptions …');
    const metaRecords = [];

    for (let i = 0; i < enriched.length; i++) {
      const p = enriched[i];
      const desc = generateDescription(p, i);
      const meta = generateMetaDescription(p, i);
      metaRecords.push({
        id: p.id,
        slug: p.slug,
        title: p.title,
        metaDescription: meta,
        wordCount: desc.split(/\s+/).length,
        metaCharCount: meta.length,
      });

      if ((i + 1) % 25 === 0 || i === enriched.length - 1) {
        console.log(`  Processed ${i + 1}/${enriched.length}`);
      }
    }
    console.log();

    // ── Step 3: Update database ────────────────────────────────────────────
    console.log('[3/5] Updating database …');
    let updated = 0;
    for (let i = 0; i < enriched.length; i++) {
      const p = enriched[i];
      const desc = generateDescription(p, i);
      await prisma.product.update({
        where: { id: p.id },
        data: { description: desc },
      });
      updated++;
      if (updated % 25 === 0 || updated === enriched.length) {
        console.log(`  Updated ${updated}/${enriched.length} products`);
      }
    }
    console.log();

    // ── Step 4: Save meta JSON ─────────────────────────────────────────────
    console.log('[4/5] Saving meta descriptions …');
    const metaPath = path.join(__dirname, 'seo-meta-batch9.json');
    fs.writeFileSync(metaPath, JSON.stringify(metaRecords, null, 2));
    console.log(`  Saved ${metaRecords.length} meta records → ${metaPath}\n`);

    // ── Step 5: Update progress ────────────────────────────────────────────
    console.log('[5/5] Updating seo-progress.json …');
    const progressPath = path.join(__dirname, 'seo-progress.json');
    let progress = {};
    try {
      progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    } catch (e) {
      progress = { batches: {}, totalProducts: 1285, totalBatches: 13, completedBatches: 0, completedProducts: 0 };
    }

    progress.batches['9'] = {
      status: 'completed',
      startIdx: 901,
      endIdx: 1000,
      updatedAt: new Date().toISOString(),
      productsUpdated: enriched.length,
      metaFile: 'scripts/seo-meta-batch9.json',
    };
    progress.completedBatches = 9;
    progress.completedProducts = 1000;

    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`  completedBatches: ${progress.completedBatches}`);
    console.log(`  completedProducts: ${progress.completedProducts}\n`);

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Batch 9 complete!');
    console.log(`  Products processed: ${enriched.length}`);
    console.log(`  DB records updated: ${updated}`);
    console.log(`  Meta file: ${metaPath}`);
    console.log(`  Progress: ${progress.completedBatches}/${progress.totalBatches} batches (${progress.completedProducts}/${progress.totalProducts} products)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Batch 9 failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
