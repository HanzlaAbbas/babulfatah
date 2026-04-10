#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Description Generator for Goodword & IIPH Products
// ============================================================================
// Generates unique, SEO-optimized descriptions using scraped source data from
// publisher websites. Falls back to intelligent template generation when no
// scraped data is available.
// Uses z-ai-web-dev-sdk when available, otherwise uses advanced template engine.
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ─── Load scraped data ───────────────────────────────────────────────────────

const iiphScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'iiph-scraped-data.json'), 'utf8'));
const goodwordScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'goodword-scraped-data.json'), 'utf8'));

// ─── Title matching ──────────────────────────────────────────────────────────

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a, b) {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return 1.0;
  const wa = new Set(na.split(' ').filter(w => w.length > 2));
  const wb = new Set(nb.split(' ').filter(w => w.length > 2));
  const inter = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union > 0 ? inter / union : 0;
}

const iiphLookup = new Map();
for (const item of iiphScraped) iiphLookup.set(normalizeTitle(item.title), item);

const goodwordLookup = new Map();
for (const item of goodwordScraped) goodwordLookup.set(normalizeTitle(item.dbTitle), item);

function findIiphDesc(title) {
  const key = normalizeTitle(title);
  if (iiphLookup.has(key)) return iiphLookup.get(key);
  let best = null, bestScore = 0;
  for (const [k, v] of iiphLookup) {
    const score = titleSimilarity(title, k);
    if (score > bestScore) { bestScore = score; best = v; }
  }
  return bestScore >= 0.5 ? best : null;
}

function findGoodwordDesc(title) {
  const key = normalizeTitle(title);
  if (goodwordLookup.has(key)) return goodwordLookup.get(key);
  return null;
}

// ─── Content analysis helpers ────────────────────────────────────────────────

function detectCategory(title, sourceDesc) {
  const text = (title + ' ' + (sourceDesc || '')).toLowerCase();
  // Check in order of specificity - most specific first
  if (/tafseer|tafsir|mushaf|tajweed/.test(text)) return 'quran';
  if (/(?:^|\s)quran(?:\s|$)/.test(text)) return 'quran';
  if (/(?:^|\s)hadith(?:\s|$)|(?:^|\s)sahih(?:\s|$)|(?:^|\s)bukhari(?:\s|$)|(?:^|\s)sunan(?:\s|$)|(?:^|\s)ahadith(?:\s|$)/.test(text)) return 'hadith';
  if (/(?:^|\s)seerah(?:\s|$)|prophet muhammad|biography|sahab[ai]|companion|mercy to humanity/.test(text)) return 'seerah';
  if (/(?:^|\s)arabic(?:\s|$)|alphabet|writing|madinah|dictionary|spoken/.test(text)) return 'arabic';
  if (/(?:^|\s)reader(?:\s|$)/.test(text) && /arabic/.test(text)) return 'arabic';
  if (/children|kids|activity|bedtime|stories|storybook|coloring|fun with|my first|little library/.test(text)) return 'children';
  if (/(?:^|\s)fiqh(?:\s|$)|(?:^|\s)salah(?:\s|$)|(?:^|\s)prayer(?:\s|$)|worship|pillars|fundamentals|creed|aqeedah|tawheed/.test(text)) return 'fiqh';
  if (/(?:^|\s)women(?:\s|$)|(?:^|\s)woman(?:\s|$)|(?:^|\s)female(?:\s|$)|(?:^|\s)sisters?(?:\s|$)|(?:^|\s)marriage(?:\s|$)|muslimah/.test(text)) return 'women';
  if (/character|therapy|psychology|personality|self.help|don.?t be sad|tolerance|emotion|steadfast/.test(text)) return 'selfhelp';
  if (/dawah|dialogue|christian|misconception|civilization|muslim christ/.test(text)) return 'dawah';
  if (/ghazali|revival|religious sciences|scholarly/.test(text)) return 'scholarly';
  if (/death|resurrection|grave|hereafter|inevitable|hour|day of judge/.test(text)) return 'hereafter';
  if (/islamic studies|course|curriculum/.test(text)) return 'education';
  return 'general';
}

function detectFormat(title) {
  const t = title.toLowerCase();
  if (/hb\b|hardbound|hardcover|hard.?back/.test(t)) return 'hardcover';
  if (/pb\b|paperback|softcover|soft.?back/.test(t)) return 'softcover';
  if (/board\s*book/.test(t)) return 'board book';
  if (/set|complete|box|slipcase|gift box/.test(t)) return 'gift set';
  if (/dictionary/.test(t)) return 'dictionary';
  return 'book';
}

function detectTarget(title, sourceDesc) {
  const text = (title + ' ' + (sourceDesc || '')).toLowerCase();
  if (/children|kids|toddlers|young readers|bedtime|storybook|activity|coloring|board book|my first|little library/.test(text)) return 'children';
  if (/woman|women|sisters|female|muslimah/.test(text) && !/general|student/.test(text)) return 'women';
  if (/students|course|learner|reader|beginner|islamic studies/.test(text)) return 'students';
  if (/youth|young/.test(text)) return 'youth';
  return 'general';
}

function cleanScrapedText(text) {
  if (!text) return '';
  return text
    .replace(/Product Descriptio\s*:?/gi, '')
    .replace(/Additional information[\s\S]*$/i, '')
    .replace(/Return Policy[\s\S]*$/i, '')
    .replace(/FAQ[\s\S]*$/i, '')
    .replace(/Weight\s*[\d.]+\s*kg/gi, '')
    .replace(/Dimensions\s*[\d.x\s]+cm/gi, '')
    .replace(/ISBN[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── SEO Description Generator (Template-based with source data) ─────────────

function generateSeoDescription(product, sourceData, publisher) {
  const title = product.title;
  const price = product.price;
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : 'Contact for price';
  const sourceDesc = cleanScrapedText(sourceData?.description || '');
  const category = detectCategory(title, sourceDesc);
  const format = detectFormat(title);
  const target = detectTarget(title, sourceDesc);

  // Extract key info from source description
  const sentences = sourceDesc.split(/[.!]\s+/).filter(s => s.length > 30);
  const mainContent = sentences.slice(0, 2).join('. ').trim();

  // Build the description
  let description = '';

  // Opening paragraph
  if (sourceDesc && mainContent.length > 50) {
    // Clean up anti-scraping encoding artifacts in the source
    const cleanedContent = reconstructText(mainContent);
    description = `${title} is a ${format} published by ${publisher}. ${cleanedContent}`;
  } else {
    description = generateFallbackDescription(title, publisher, format, category, target);
  }

  // Add bullet points based on category and detected features
  const bullets = generateBullets(title, sourceDesc, category, target, publisher);
  if (bullets.length > 0) {
    description += '\n\n' + bullets.join('\n');
  }

  // Closing CTA
  const cta = generateCTA(title, target, priceStr, publisher);
  description += '\n\n' + cta;

  return description.trim();
}

function reconstructText(text) {
  // Try to fix common anti-scraping encoding issues where letters are dropped
  // Common patterns: "comprehesive" -> "comprehensive", "guidace" -> "guidance"
  const fixes = {
    'iteractio': 'interaction', 'comprehesive': 'comprehensive', 'guidace': 'guidance',
    'respectful': 'respectful', 'chaste': 'chaste', 'accordace': 'accordance',
    'reowed': 'renowned', 'avodate': 'navigate', 'dyamics': 'dynamics',
    'isightful': 'insightful', 'upliftig': 'uplifting', 'ecourages': 'encourages',
    'fid': 'find', 'happiess': 'happiness', 'cotetmet': 'contentment',
    'writte': 'written', 'ad': 'and', 'ovecome': 'overcome', 'sadess': 'sadness',
    'axiety': 'anxiety', 'fulfillig': 'fulfilling', 'orgaized': 'organized',
    'addressig': 'addressing', 'differet': 'different', 'cocer': 'concern',
    'compedium': 'compendium', 'ruligs': 'rulings', 'questio': 'question',
    'aswer': 'answer', 'cocise': 'concise', 'referece': 'reference',
    'caterig': 'catering', 'eed': 'need', 'kow': 'known', 'exceptioal': 'exceptional',
    'cotributios': 'contributions', 'compellig': 'compelling', 'isightful': 'insightful',
    'towerig': 'towering', 'uwaverig': 'unwavering', 'profoud': 'profound',
    'ispirig': 'inspiring', 'persoal': 'personal', 'aecdot': 'anecdote',
    'teachigs': 'teachings', 'draws': 'draws', 'upo': 'upon', 'chaleges': 'challenges',
    'emphasizes': 'emphasizes', 'importace': 'importance', 'havig': 'having',
    'ecourages': 'encourages', 'cotrol': 'control', 'thikig': 'thinking',
    'authored': 'Authored', 'editio': 'edition', 'publicatio': 'publication',
    'islamic': 'Islamic', 'muslim': 'Muslim', 'prophet': 'Prophet',
    'qura': 'Quran', 'hadith': 'Hadith', 'sunah': 'Sunnah',
    'me': 'men', 'wome': 'women', 'ca': 'can', 'each': 'each',
    'ig': 'ing', 'tio': 'tion', 'ce': 'ce', 'at': 'at',
    'is': 'is', 'it': 'it', 'to': 'to', 'in': 'in', 'of': 'of',
    'or': 'or', 'the': 'the', 'a ': 'a ', 'an ': 'an ',
  };

  let result = text;
  // Fix double-space patterns from dropped letters (e.g., "me ad wome" -> "men and women")
  result = result.replace(/\bme\b(?=\s+ad\b)/g, 'men');
  result = result.replace(/\bwome\b/g, 'women');
  result = result.replace(/\bca\b(?=\s+)/g, 'can');
  result = result.replace(/\bo\b(?=\s+)/g, 'of');

  // Apply word-level fixes
  for (const [wrong, right] of Object.entries(fixes)) {
    if (wrong.length > 2) {
      result = result.replace(new RegExp(wrong, 'gi'), right);
    }
  }

  return result;
}

function generateFallbackDescription(title, publisher, format, category, target) {
  const templates = {
    quran: [
      `${title} is a beautifully presented ${format} published by ${publisher}, offering readers a deeper connection with the divine words of Allah. This carefully crafted ${format} is designed to enhance your Quranic reading and understanding experience.`,
    ],
    hadith: [
      `${title} is an authoritative ${format} published by ${publisher}, preserving the authentic sayings and teachings of Prophet Muhammad (peace be upon him). This invaluable resource serves as a comprehensive guide for Muslims seeking to follow the Prophetic example in their daily lives.`,
    ],
    seerah: [
      `${title} is an inspiring ${format} published by ${publisher} that brings to life the remarkable stories of Islamic history. Through engaging narratives and meticulous research, this book offers readers profound lessons in faith, courage, and devotion.`,
    ],
    arabic: [
      `${title} is a comprehensive ${format} published by ${publisher}, designed to help learners master the Arabic language. Whether you are a beginner starting your Arabic journey or an advanced student seeking to refine your skills, this resource provides structured, progressive lessons for effective learning.`,
    ],
    children: [
      `${title} is a delightful ${format} published by ${publisher}, specially crafted to introduce young readers to the beauty of Islamic teachings. With engaging stories and age-appropriate content, this book makes learning about Islam an enjoyable experience for children.`,
    ],
    fiqh: [
      `${title} is a scholarly ${format} published by ${publisher}, providing clear and comprehensive guidance on Islamic jurisprudence and worship. Based on authentic sources, this book is an essential reference for Muslims seeking to practice their faith with knowledge and confidence.`,
    ],
    women: [
      `${title} is a thoughtful ${format} published by ${publisher}, addressing important topics relevant to Muslim women. Written with sensitivity and scholarly depth, this book provides guidance grounded in authentic Islamic sources.`,
    ],
    selfhelp: [
      `${title} is a transformative ${format} published by ${publisher}, offering practical and spiritual guidance for personal development. Drawing upon Islamic teachings and psychological insights, this book helps readers find peace, purpose, and contentment in their lives.`,
    ],
    dawah: [
      `${title} is an informative ${format} published by ${publisher}, exploring important aspects of Islamic knowledge and interfaith understanding. This well-researched work serves as a valuable resource for both Muslims and those interested in learning about Islam.`,
    ],
    scholarly: [
      `${title} is a distinguished scholarly ${format} published by ${publisher}, representing the finest traditions of Islamic academic publishing. This comprehensive work draws upon classical sources and contemporary scholarship to deliver authoritative content.`,
    ],
    hereafter: [
      `${title} is a thought-provoking ${format} published by ${publisher} that explores the realities of death, the grave, and the Hereafter. Drawing upon authentic Islamic sources, this book serves as a powerful reminder of our ultimate destination and encourages readers to prepare for the life to come.`,
    ],
    education: [
      `${title} is a well-structured educational ${format} published by ${publisher}, designed to provide students with a solid foundation in Islamic knowledge. This comprehensive textbook covers essential topics in a clear, organized manner suitable for both classroom use and self-study.`,
    ],
    general: [
      `${title} is a valuable ${format} published by ${publisher}, offering readers authentic and well-researched Islamic content. This carefully prepared publication upholds the highest standards of Islamic scholarly work and serves as a meaningful addition to any Islamic library.`,
    ],
  };

  const pool = templates[category] || templates.general;
  return pool[0];
}

function generateBullets(title, sourceDesc, category, target, publisher) {
  const bullets = [];
  const text = (title + ' ' + (sourceDesc || '')).toLowerCase();

  // Category-specific bullets
  if (category === 'quran') {
    bullets.push('- Published by ' + publisher + ', ensuring authentic and reliable content');
    bullets.push('- Features clear, readable formatting ideal for both study and daily recitation');
  } else if (category === 'hadith') {
    bullets.push('- Authentic narrations with proper chain of transmission verification');
    bullets.push('- Organized thematically for easy reference and practical application');
  } else if (category === 'seerah') {
    bullets.push('- Brings Islamic history to life with engaging, well-researched narratives');
    bullets.push('- Offers timeless lessons in faith, leadership, and moral character');
  } else if (category === 'arabic') {
    bullets.push('- Structured progressive lessons suitable for self-study or classroom use');
    bullets.push('- Helps build strong foundation in Arabic reading, writing, and comprehension');
  } else if (category === 'children') {
    bullets.push('- Specially designed for young readers with age-appropriate language and content');
    bullets.push('- Beautifully illustrated to capture children\'s imagination and interest');
    bullets.push('- Makes learning about Islam fun, engaging, and educational');
  } else if (category === 'fiqh') {
    bullets.push('- Based on authentic Islamic sources with clear, practical guidance');
    bullets.push('- Covers essential rulings for daily worship and practice');
  } else if (category === 'women') {
    bullets.push('- Addresses contemporary issues with scholarly depth and sensitivity');
    bullets.push('- Grounded in authentic Quran and Sunnah references');
  } else if (category === 'selfhelp') {
    bullets.push('- Combines spiritual wisdom with practical advice for daily life');
    bullets.push('- Draws upon Quran, Hadith, and scholarly insights for holistic guidance');
  } else if (category === 'dawah') {
    bullets.push('- Well-researched content promoting understanding and dialogue');
    bullets.push('- An excellent resource for both Muslims and non-Muslims interested in Islam');
  } else if (category === 'scholarly') {
    bullets.push('- Represents the finest traditions of Islamic academic publishing');
    bullets.push('- Draws upon classical sources and contemporary scholarship');
  } else if (category === 'hereafter') {
    bullets.push('- A powerful reminder of the Hereafter based on authentic Islamic sources');
    bullets.push('- Encourages spiritual preparation and reflection on the afterlife');
  } else if (category === 'education') {
    bullets.push('- Well-organized curriculum suitable for classroom and self-study');
    bullets.push('- Covers essential Islamic knowledge in a progressive, structured manner');
  } else {
    bullets.push('- Published by ' + publisher + ', a trusted name in Islamic publications');
    bullets.push('- Carefully researched and reviewed for accuracy and authenticity');
  }

  // Add format-specific bullet if relevant
  if (title.toLowerCase().includes('set') || title.toLowerCase().includes('complete')) {
    bullets.push('- Complete set offering comprehensive coverage of the subject');
  }
  if (title.toLowerCase().includes('gift box') || title.toLowerCase().includes('slipcase')) {
    bullets.push('- Beautifully packaged gift set, perfect for special occasions');
  }
  if (title.toLowerCase().includes('quiz')) {
    bullets.push('- Interactive quiz format makes learning fun and engaging');
  }
  if (title.toLowerCase().includes('activity')) {
    bullets.push('- Packed with engaging activities to reinforce Islamic learning');
  }
  if (title.toLowerCase().includes('dictionary')) {
    bullets.push('- Comprehensive reference with thousands of entries for quick lookup');
  }

  // Ensure we always have at least 2 bullets; if category gave us bullets, use them
  // Otherwise add generic ones
  if (bullets.length < 2) {
    bullets.push('- Published by ' + publisher + ', ensuring authentic and reliable content');
    bullets.push('- Carefully researched and reviewed for accuracy and authenticity');
  }

  return bullets.slice(0, 3);
}

function generateCTA(title, target, priceStr, publisher) {
  const targetCTAs = {
    children: `Perfect for young Muslim learners and families. Available at ${priceStr} from Bab-ul-Fatah, Pakistan's trusted Islamic bookstore. Order online for delivery across Pakistan.`,
    students: `An essential resource for students and seekers of knowledge. Get your copy at ${priceStr} from Bab-ul-Fatah with fast delivery across Pakistan.`,
    women: `A must-read for Muslim women seeking authentic Islamic guidance. Order at ${priceStr} from Bab-ul-Fatah, delivered to your doorstep anywhere in Pakistan.`,
    youth: `Highly recommended for young Muslims navigating modern life. Available at ${priceStr} from Bab-ul-Fatah, your trusted source for Islamic books.`,
    general: `Available now at ${priceStr} from Bab-ul-Fatah. Order online for fast, reliable delivery across Pakistan and enrich your Islamic library with this valuable publication.`,
  };

  return targetCTAs[target] || targetCTAs.general;
}

// ─── AI-enhanced generation (when z-ai SDK is available) ─────────────────────

let useAI = false;
let zaiInstance = null;

async function tryInitAI() {
  try {
    const ZAI = require('z-ai-web-dev-sdk').default;
    zaiInstance = await ZAI.create();
    useAI = true;
    console.log('AI SDK initialized successfully.');
  } catch (e) {
    console.log('AI SDK not available, using advanced template engine.');
    useAI = false;
  }
}

async function generateWithAI(product, sourceDesc, publisher) {
  if (!useAI || !zaiInstance) return null;

  const priceStr = product.price > 0 ? `Rs. ${Math.round(product.price).toLocaleString('en-PK')}` : 'Contact for price';

  let sourceContext = '';
  if (sourceDesc) {
    sourceContext = `Source description from publisher: "${sourceDesc.substring(0, 1500)}"`;
  }

  const prompt = `Write an SEO product description for: "${product.title}" by ${publisher}. Price: ${priceStr}. ${sourceContext}

Rules: 400-800 chars. English. No emojis. Include publisher name. Format: 2-3 sentences, then bullet points with "-", then a marketing line. Plain text only.`;

  try {
    const completion = await zaiInstance.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are an SEO copywriter for Islamic books. Write concise, compelling product descriptions.' },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' },
    });
    const text = completion.choices?.[0]?.message?.content?.trim();
    return text ? text.replace(/\*\*/g, '').replace(/^#+\s/gm, '').trim() : null;
  } catch (e) {
    // Silently fall back to template generation
    return null;
  }
}

// ─── Process products ────────────────────────────────────────────────────────

async function processBatch(products, publisher, findDescFn) {
  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const num = `[${i + 1}/${products.length}]`;

    const sourceData = findDescFn(product.title);
    const sourceDesc = cleanScrapedText(sourceData?.description || '');

    // Try AI first, fall back to template
    let desc = await generateWithAI(product, sourceDesc, publisher);
    if (!desc || desc.length < 100) {
      desc = generateSeoDescription(product, sourceData, publisher);
    }

    if (desc && desc.length > 100) {
      await prisma.product.update({
        where: { id: product.id },
        data: { description: desc }
      });
      results.push({ id: product.id, title: product.title, slug: product.slug, length: desc.length, source: sourceDesc ? 'scraped+enhanced' : 'template' });
      process.stdout.write(`${num} ${product.title.substring(0, 40).padEnd(40)} OK (${desc.length} chars)\n`);
    } else {
      results.push({ id: product.id, title: product.title, slug: product.slug, length: 0, source: 'failed' });
      process.stdout.write(`${num} ${product.title.substring(0, 40).padEnd(40)} FAILED\n`);
    }

    // Small delay for DB writes
    if ((i + 1) % 50 === 0) await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('  Bab-ul-Fatah SEO Description Generator');
  console.log('  Goodword Books + IIPH Products');
  console.log('='.repeat(60));
  console.log(`\nIIPH scraped descriptions: ${iiphScraped.filter(r => r.description).length}/${iiphScraped.length}`);
  console.log(`Goodword scraped descriptions: ${goodwordScraped.length}`);

  // Try to initialize AI
  await tryInitAI();

  // Fetch products from DB
  const goodwordProducts = await prisma.product.findMany({
    where: { slug: { startsWith: 'goodword-' } },
    select: { id: true, title: true, slug: true, price: true, language: true },
    orderBy: { title: 'asc' }
  });

  const iiphProducts = await prisma.product.findMany({
    where: { slug: { startsWith: 'iiph-' } },
    select: { id: true, title: true, slug: true, price: true, language: true },
    orderBy: { title: 'asc' }
  });

  console.log(`\nGoodword products in DB: ${goodwordProducts.length}`);
  console.log(`IIPH products in DB: ${iiphProducts.length}`);
  console.log(`Total to process: ${goodwordProducts.length + iiphProducts.length}`);

  const allResults = [];

  // Process IIPH products
  console.log('\n' + '-'.repeat(60));
  console.log('  Processing IIPH Products');
  console.log('-'.repeat(60));
  const iiphResults = await processBatch(iiphProducts, 'IIPH (International Islamic Publishing House)', findIiphDesc);
  allResults.push(...iiphResults);

  // Process Goodword products
  console.log('\n' + '-'.repeat(60));
  console.log('  Processing Goodword Products');
  console.log('-'.repeat(60));
  const gwResults = await processBatch(goodwordProducts, 'Goodword Books', findGoodwordDesc);
  allResults.push(...gwResults);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const succeeded = allResults.filter(r => r.length > 0).length;
  const failed = allResults.filter(r => r.length === 0).length;
  const fromScraped = allResults.filter(r => r.source === 'scraped+enhanced').length;
  const avgLen = succeeded > 0 ? Math.round(allResults.filter(r => r.length > 0).reduce((s, r) => s + r.length, 0) / succeeded) : 0;

  console.log('\n' + '='.repeat(60));
  console.log('  FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total processed: ${allResults.length}`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);
  console.log(`From scraped data: ${fromScraped}`);
  console.log(`From templates: ${succeeded - fromScraped}`);
  console.log(`Average description length: ${avgLen} chars`);
  console.log(`Time elapsed: ${elapsed}s`);

  if (failed > 0) {
    console.log('\nFailed products:');
    allResults.filter(r => r.length === 0).forEach(r => console.log(`  - ${r.title}`));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'seo-gen-results.json'),
    JSON.stringify(allResults, null, 2)
  );
  console.log(`\nResults saved to scripts/seo-gen-results.json`);
}

main()
  .catch(e => console.error('Fatal error:', e))
  .finally(() => prisma.$disconnect());
