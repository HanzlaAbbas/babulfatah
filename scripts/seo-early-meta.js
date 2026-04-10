/**
 * seo-early-meta.js  (v3 — final)
 * Fix ALL auto-generated meta descriptions for products 1-160.
 * Preserves hand-written quality metas from earlier scripts.
 * Target: 120-160 characters, product-specific, SEO-friendly.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Detect garbage v1 meta descriptions ──────────────────────
function isBadMeta(m) {
  if (!m) return true;
  if (m.length < 120) return true;
  // v1 artifacts: trailing fragments ending mid-sentence
  if (/ with authentic sources\.$/.test(m) && / for [a-z]/.test(m)) return true;
  if (/covering essential teachings\.$/.test(m)) return true;
  // "Holy Quran — for X" pattern from v1's quran+descPhrase combo on non-Quran products
  if (/Holy Quran — for [a-z]/.test(m)) return true;
  // Truncated endings (word before period is a conjunction/article/preposition)
  if (/\b(and|for|the|with|from|of|inner|daily|spiritual)\.\s*$/.test(m)) return true;
  // Duplicate language label
  if (/Arabic Arabic/i.test(m)) return true;
  // Missing period before suffix (e.g., "Quran Ideal for" — no ". " before capital)
  if (/[a-z] [A-Z][a-z]/.test(m) && !/[.!?] [A-Z]/.test(m)) return true;
  return false;
}

// ── Category → type mapping ──────────────────────────────────
function getProductType(title, category) {
  const cat = (category || '').toLowerCase();
  const t = title.toLowerCase();

  if (/hadith|ahadith|ahadees|qudsi/.test(cat)) return 'hadith';
  if (/tafseer|tafsir/.test(cat)) return 'tafseer';
  if (/seerah/.test(cat)) return 'seerah';
  if (/companion|sahab/.test(cat)) return 'companion';
  if (/biography/.test(cat)) {
    if (/prophet|nabi|muhammad|pbuh|seerah|raheeq|makhtum|mercy|inspiration|jamal/i.test(t)) return 'seerah';
    if (/anbiya|qissa|qasas|silsila|bisharat|khushkhabri|mehmaan|sakhi/i.test(t)) return 'prophet_story';
    return 'general_bio';
  }
  if (/fiqh/.test(cat)) return 'fiqh';
  if (/aqeedah|faith/i.test(cat)) return 'aqeedah';
  if (/spirituality/.test(cat)) return 'spirituality';
  if (/women/i.test(cat)) return 'women';
  if (/children/.test(cat)) return 'children';
  if (/education/.test(cat)) {
    if (/noorani|qaida|sarf|nahw|arabic/i.test(t)) return 'arabic';
    if (/tajweed/i.test(t)) return 'quran';
    if (/tafseer|tafsir|fauz/i.test(t)) return 'tafseer';
    return 'education';
  }
  if (/arabic/.test(cat)) return 'arabic';
  if (/tajweed/.test(cat)) return 'quran';
  if (/parah|para|juz/.test(cat)) return 'quran';
  if (/mushaf/.test(cat)) return 'quran';
  if (/translation/.test(cat)) return 'quran_translation';
  if (/hajj|umrah/.test(cat)) return 'hajj';
  if (/family/.test(cat)) return 'family';
  if (/reference/.test(cat)) return 'reference';
  if (/imams?\s|scholar/i.test(cat)) return 'aqeedah';
  if (/darussalam/.test(cat)) {
    if (/\d+\s*line|quran|para|juz/i.test(t)) return 'quran';
    return 'darussalam';
  }
  if (/food/.test(cat)) return 'product';
  if (/general/.test(cat)) {
    if (/quran/i.test(t) || /\d+\s*line/i.test(t)) return 'quran';
    if (/hadith|ahadith|bukhari|muslim|riyad|nawawi|qudsi/i.test(t)) return 'hadith';
    if (/seerah|raheeq|makhtum|prophet|nabi/i.test(t)) return 'seerah';
    return 'general';
  }
  if (/quran|mushaf|para[ah]?|\d+\s*line|juz|tajweedi|hafzi/i.test(t)) return 'quran';
  if (/bukhari|muslim|hadith|ahadith|ahadees|riyad|lulu|marjan|nawawi|qudsi/i.test(t)) return 'hadith';
  if (/tafseer|tafsir|ibn kathir/i.test(t)) return 'tafseer';
  return 'general';
}

function cleanTitle(title, maxLen = 60) {
  let c = title
    .replace(/\s*[-–—]\s*(Art Paper|Imported|Pocket Size|Soft Cover|Hard Cover|HC|SC|Local|Aala quality|Urdu|English|Arabic|Eng|New)$/gi, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (c.length > maxLen) c = c.substring(0, maxLen - 3) + '...';
  return c;
}

function fmtAuth(name) {
  if (!name) return '';
  let a = name.trim();
  if (/^(complete set|darussalam|duas collection)$/i.test(a)) return '';
  if (a.length > 30) {
    const parts = a.split(/\s+/);
    a = parts.length > 3 ? parts[0] + ' ' + parts[parts.length - 1] : a.substring(0, 30);
  }
  return a;
}

function getLang(language, title) {
  if (/[\u0600-\u06FF]/.test(title) || language === 'URDU') return 'Urdu';
  if (language === 'ARABIC') return 'Arabic';
  return 'English';
}

// ── Meta generator (v3 — no descPhrase, all self-contained) ──
function generateMeta(p) {
  const { title, category, author, language } = p;
  const type = getProductType(title, category?.name);
  const ct = cleanTitle(title);
  const auth = fmtAuth(author?.name);
  const lang = getLang(language, title);
  const ac = auth ? ` by ${auth}` : '';

  let m = '';
  switch (type) {

    case 'hadith': {
      const coll = /bukhari/i.test(title) ? 'Sahih al-Bukhari' :
                   /muslim/i.test(title) ? 'Sahih Muslim' :
                   /riyad/i.test(title) ? 'Riyad us-Saliheen' :
                   /lulu.*marjan|marjan/i.test(title) ? 'Al-Lulu wal-Marjan' :
                   /qudsi/i.test(title) ? 'Hadith Qudsi collection' :
                   /nawawi|40\s*hadith/i.test(title) ? 'Imam Nawawi\'s 40 Hadith' :
                   /golden/i.test(title) ? 'golden Hadith collection' :
                   /sunehri/i.test(title) ? 'selected Prophetic Hadith' :
                   /introduction.*science/i.test(title) ? 'introduction to the science of Hadith' :
                   'authentic Hadith collection';
      const scope = /complete|set|\d+\s*vol/i.test(title) ? ' complete set' :
                    /pocket/i.test(title) ? ' pocket edition' : '';
      m = `${ct}${ac} — ${lang} ${coll}${scope} for daily guidance and Islamic learning.`;
      break;
    }

    case 'tafseer': {
      const work = /ibn kathir/i.test(title) ? 'Tafseer Ibn Kathir' :
                   /fauz.*kabir/i.test(title) ? 'Tafseer al-Fauz al-Kabir' :
                   'Quranic tafseer';
      const scope = /complete|set|\d+\s*vol/i.test(title) ? ' complete set' : '';
      m = `${ct}${ac} — ${lang} ${work}${scope} explaining Quranic verses with scholarly commentary.`;
      break;
    }

    case 'seerah': {
      const focus = /raheeq|sealed nectar|makhtum/i.test(title) ? 'award-winning Seerah of Prophet Muhammad (PBUH)' :
                    /mercy/i.test(title) ? 'Prophet Muhammad (PBUH) as a mercy to all creation' :
                    /jamal/i.test(title) ? 'beauty of Prophethood and the life of Muhammad (PBUH)' :
                    /akhri nabi/i.test(title) ? 'Prophet Muhammad (PBUH) as the final messenger' :
                    /inspiration/i.test(title) ? 'Prophet Muhammad (PBUH) as an inspiration to the world' :
                    'comprehensive biography of Prophet Muhammad (PBUH)';
      m = `${ct}${ac} — ${lang} ${focus} covering key events and Prophetic lessons.`;
      break;
    }

    case 'companion': {
      const who = /umar/i.test(title) ? 'Umar bin al-Khattab (R.A)' :
                  /abdullah bin umar/i.test(title) ? 'Abdullah bin Umar (R.A)' :
                  /abu lahab/i.test(title) ? 'Abu Lahab' :
                  /khulafa/i.test(title) ? 'the Rightly Guided Caliphs' :
                  'the Companions of Prophet Muhammad (PBUH)';
      const detail = /jurist/i.test(title) ? ' renowned jurist' :
                     /advisors/i.test(title) ? ' — key advisors and counsel' : '';
      m = `${ct}${detail} — ${lang} biography of ${who} with lessons from their lives.`;
      break;
    }

    case 'general_bio':
      m = `${ct}${ac} — ${lang} Islamic biography offering lessons in faith, perseverance, and dedication.`;
      break;

    case 'prophet_story': {
      const prophet = /yaqoob/i.test(title) ? 'Prophet Yaqoob (AS)' :
                      /ishaq/i.test(title) ? 'Prophet Ishaq (AS)' :
                      /zakariyya/i.test(title) ? 'Prophet Zakariyya (AS)' :
                      'a Prophet of Islam';
      m = `${ct}${ac} — ${lang} story of ${prophet} from Qasas ul Anbiya with moral lessons for all ages.`;
      break;
    }

    case 'quran': {
      const lines = (title.match(/(\d+)\s*line/i) || [])[1] || '';
      const isSet = /complete.*set|30.*vol|para.*set/i.test(title);
      const isJumbo = /jumbo/i.test(title);
      const isPocket = /pocket/i.test(title);
      const isTajweedi = /tajweedi|tajweed/i.test(title);
      const sizeWord = isJumbo ? 'large-format' : isPocket ? 'pocket-size' : '';
      const fmtWord = lines ? `${lines}-line` : '';
      const setType = isSet ? 'complete 30-Parah set' : '';
      const parts = [fmtWord, sizeWord, setType].filter(Boolean).join(' ');
      const partsStr = parts ? ' ' + parts : '';
      m = `${ct} — ${lang}${partsStr} Holy Quran ideal for recitation, Hifz, and daily reading.`;
      break;
    }

    case 'quran_translation': {
      const transLang = /punjabi/i.test(title) ? 'Punjabi' :
                        /urdu|lafzi/i.test(title) ? 'word-by-word Urdu' : '';
      m = `${ct} — ${lang} Holy Quran with ${transLang} translation for understanding Quranic verses.`;
      break;
    }

    case 'children': {
      const kind = /hadith|ahadith|golden|sunehri/i.test(title) ? 'collection of Hadith' :
                   /number.*1.*10|color/i.test(title) ? 'colorful Islamic counting book' :
                   /zoo/i.test(title) ? 'Islamic story about a zoo visit' :
                   /horse/i.test(title) ? 'moral story with Islamic values' :
                   /angel|jibra/i.test(title) ? 'story of Angel Jibra\'eel\'s return' :
                   /garden/i.test(title) ? 'book about Allah\'s beautiful gardens' :
                   /way of life/i.test(title) ? 'guide for a Muslim child\'s daily life' :
                   /diploma/i.test(title) ? 'Islamic activity and learning book' :
                   /day out/i.test(title) ? 'educational Islamic storybook' :
                   /man and/i.test(title) ? 'moral storybook for kids' :
                   /aqaidah|qaaidah|tajweed/i.test(title) ? 'Quran learning book for beginners' :
                   'Islamic storybook for children';
      m = `${ct}${ac} — ${lang} ${kind} teaching young Muslims about faith and good character.`;
      break;
    }

    case 'women': {
      const focus = /hijab|satr|pardah/i.test(title) ? 'Islamic rulings on Hijab and modesty' :
                    /behan|sister/i.test(title) ? 'comprehensive guide for Muslim women' :
                    /talibaat/i.test(title) ? 'Hadith compilation for female students' :
                    /mother|maa/i.test(title) ? 'guide for expectant and new mothers' :
                    /well guarded/i.test(title) ? 'valuable treasure for Muslim women' :
                    'essential guidance for Muslim women';
      m = `${ct}${ac} — ${lang} ${focus} based on Quran and Sunnah, covering faith and daily life.`;
      break;
    }

    case 'fiqh': {
      const focus = /fatawa/i.test(title) ? 'collection of Islamic Fatawa' :
                    /wuzu|ghusl|salah/i.test(title) ? 'rulings on Wudu, Ghusl, and Salah' :
                    /tijarat|lain dain/i.test(title) ? 'Islamic rulings on trade and lending' :
                    'Islamic jurisprudence and rulings';
      m = `${ct}${ac} — ${lang} ${focus} based on authentic Quranic and Hadith sources.`;
      break;
    }

    case 'aqeedah': {
      const focus = /creed|salaf/i.test(title) ? 'Islamic creed based on the Salaf' :
                    /akherat|akhirat/i.test(title) ? 'detailed account of the Hereafter' :
                    'Islamic theology and creed (Aqeedah)';
      m = `${ct}${ac} — ${lang} ${focus} with Quranic evidence and references.`;
      break;
    }

    case 'spirituality': {
      const focus = /ihya/i.test(title) ? 'classic masterpiece on Islamic spirituality' :
                    /fortress|hisnul|dua/i.test(title) ? 'comprehensive collection of daily supplications' :
                    /azkar|azkaar|card/i.test(title) ? 'daily Azkar and remembrance of Allah' :
                    'Islamic spiritual guidance';
      m = `${ct}${ac} — ${lang} ${focus} for strengthening faith and purification.`;
      break;
    }

    case 'arabic': {
      const focus = /noorani|qaida/i.test(title) ? 'Noorani Qaida for learning Quranic Arabic' :
                    /sarf/i.test(title) ? 'Arabic morphology (Sarf) for Quranic studies' :
                    /thesaurus|synonym/i.test(title) ? 'reference of Arabic synonyms and meanings' :
                    'Arabic language learning resource';
      m = `${ct}${ac} — ${lang === 'Arabic' ? '' : lang + ' '}${focus}, essential for understanding the Quran.`;
      break;
    }

    case 'hajj': {
      const sizeNote = /pocket/i.test(title) ? 'pocket-size ' : '';
      m = `${ct} — ${sizeNote}${lang} step-by-step guide to Hajj and Umrah with rulings and practical tips.`;
      break;
    }

    case 'education': {
      const focus = /guide.*islam|understanding.*islam|look.*islam|beauty.*islam/i.test(title) ? 'introduction to Islam' :
                    /glimpse/i.test(title) ? 'overview of the wisdom of Islam' :
                    /affection/i.test(title) ? 'Islamic moral education on love' :
                    /adyan|mazahib/i.test(title) ? 'comparative study of world religions' :
                    /abadi|taraqi/i.test(title) ? 'Islamic perspective on civilization' :
                    /adab/i.test(title) ? 'book on Islamic etiquette and manners' :
                    'Islamic educational resource';
      m = `${ct}${ac} — ${lang} ${focus} for students and general readers seeking knowledge.`;
      break;
    }

    case 'family': {
      const focus = /hayat/i.test(title) ? 'book on family life in Islam' :
                    /azkaar/i.test(title) ? 'set of daily Azkar cards' :
                    /guide.*hajj/i.test(title) ? 'Hajj and Umrah guide' :
                    'Islamic guidance for family life';
      m = `${ct}${ac} — ${lang} ${focus} based on Quranic teachings and Prophetic traditions.`;
      break;
    }

    case 'reference':
      m = `${ct}${ac} — ${lang} comprehensive Islamic scholarly reference work for students and researchers.`;
      break;

    case 'darussalam':
      m = `${ct}${ac} — ${lang} quality Islamic publication from authentic sources for Muslim readers.`;
      break;

    case 'product': {
      const kind = /oil/i.test(title) ? 'pure natural oil' :
                   /talbeena/i.test(title) ? 'Sunnah food' :
                   /dates/i.test(title) ? 'Ajwa dates' : 'natural product';
      m = `${ct} — ${kind} following the Prophetic Sunnah. Pure, natural, and Halal-certified.`;
      break;
    }

    default:
      m = `${ct}${ac} — ${lang} Islamic book providing valuable knowledge and guidance for readers.`;
      break;
  }

  return fitToRange(m);
}

// ── Length adjuster ───────────────────────────────────────────
function fitToRange(raw) {
  let m = raw.replace(/\.+$/, '').trim().replace(/\s+/g, ' ').replace(/\s*—\s*/g, ' — ');

  if (m.length < 120) {
    const suffixes = [
      '. Ideal for students and daily readers.',
      '. A valuable addition to any Islamic library.',
      '. Perfect for home study and Islamic education.',
      '. Recommended for all Muslims seeking knowledge.',
      '. Suitable for readers of all ages.',
      '. An essential resource for every Muslim home.',
      '. Based on authentic sources and scholarship.',
      '. Ideal for personal study and family reading.',
      '. A must-read for students of Islamic knowledge.',
      '. Packed with practical guidance for daily life.',
      '. Trusted by scholars and students worldwide.',
      '. Covers essential topics with depth and clarity.',
      '. An essential Islamic resource for the household.',
      '. Ideal for Muslims seeking authentic knowledge.',
    ];
    for (const s of suffixes) {
      const c = m + s;
      if (c.length >= 120 && c.length <= 160) { m = c; break; }
    }
  }
  if (m.length < 120) m = m + '. An essential Islamic resource for every household.';

  if (m.length >= 160) {
    m = m.substring(0, 158);
    const ls = m.lastIndexOf(' ');
    if (ls > 100) m = m.substring(0, ls);
    // Remove trailing conjunctions and commas that create broken endings
    m = m.replace(/[\s,]*\b(and|or|the|for|with|from|of|a|an|in|to|is|are)\s*$/, '');
    m = m.replace(/,\s*$/, '');
  }

  if (!m.endsWith('.')) m += '.';
  return m;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('seo-early-meta.js v3 — Final cleanup of meta descriptions\n');

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    skip: 0,
    take: 160,
    select: {
      id: true, title: true, slug: true, metaDescription: true,
      language: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  // Filter: need meta OR have bad v1 meta
  const needUpdate = products.filter(p => isBadMeta(p.metaDescription));
  console.log(`Total products 1-160: ${products.length}`);
  console.log(`Need update (missing + bad patterns): ${needUpdate.length}\n`);

  if (needUpdate.length === 0) {
    console.log('All products have good meta descriptions!');
    await prisma.$disconnect();
    return;
  }

  let updated = 0, failed = 0, skipped = 0;
  const results = [], tooShort = [], tooLong = [];

  for (const p of needUpdate) {
    try {
      const meta = generateMeta(p);
      if (meta.length < 120) tooShort.push({ slug: p.slug, len: meta.length, meta });
      if (meta.length > 160) tooLong.push({ slug: p.slug, len: meta.length, meta });

      await prisma.product.update({
        where: { slug: p.slug },
        data: { metaDescription: meta },
      });

      results.push({ slug: p.slug, len: meta.length });
      updated++;
      console.log(`✅ [${String(meta.length).padStart(3)}] ${p.slug}`);
    } catch (error) {
      console.error(`❌ FAIL: ${p.slug} — ${error.message}`);
      failed++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Processed: ${needUpdate.length} | Updated: ${updated} | Failed: ${failed}`);

  if (results.length > 0) {
    const lengths = results.map(r => r.len);
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    console.log(`Length — min: ${Math.min(...lengths)}, max: ${Math.max(...lengths)}, avg: ${avg}`);
  }
  if (tooShort.length) {
    console.log(`\n⚠️  Under 120: ${tooShort.length}`);
    tooShort.forEach(r => console.log(`   ${r.slug}: ${r.len} — "${r.meta}"`));
  }
  if (tooLong.length) {
    console.log(`\n⚠️  Over 160: ${tooLong.length}`);
    tooLong.forEach(r => console.log(`   ${r.slug}: ${r.len} — "${r.meta}"`));
  }

  console.log('\n✅ Done — ' + updated + ' meta descriptions generated and saved.');
}

main().then(() => prisma.$disconnect()).catch(err => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
