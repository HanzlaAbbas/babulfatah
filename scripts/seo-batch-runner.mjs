#!/usr/bin/env node
// Batch processor for SEO descriptions - processes a range of products
// Usage: node scripts/seo-batch-runner.mjs --publisher goodword --start 0 --end 20

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf('--' + name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const publisher = getArg('publisher'); // 'goodword' or 'iiph'
const startIdx = parseInt(getArg('start') || '0');
const endIdx = parseInt(getArg('end') || '999');

if (!publisher) {
  console.error('Usage: node seo-batch-runner.mjs --publisher <goodword|iiph> [--start N] [--end N]');
  process.exit(1);
}

// Load scraped data
const iiphScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'iiph-scraped-data.json'), 'utf8'));
const goodwordScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'goodword-scraped-data.json'), 'utf8'));

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

function findSource(product, scraped) {
  // Exact match first
  for (const item of scraped) {
    const matchKey = item.dbTitle || item.title;
    if (normalizeTitle(product.title) === normalizeTitle(matchKey)) return item;
  }
  // Fuzzy match
  let best = null, bestScore = 0;
  for (const item of scraped) {
    const matchKey = item.dbTitle || item.title;
    const score = titleSimilarity(product.title, matchKey);
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore >= 0.5 ? best : null;
}

function cleanText(text) {
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

function fixEncoding(text) {
  return text
    .replace(/\bme\b(?=\s+ad\b)/g, 'men')
    .replace(/\bwome\b/g, 'women')
    .replace(/\bca\b(?=\s+)/g, 'can')
    .replace(/\bo\b(?=\s+)/g, 'of')
    .replace(/\biteractio/g, 'interaction').replace(/\bcomprehesive/g, 'comprehensive')
    .replace(/\bguidace/g, 'guidance').replace(/\breowed/g, 'renowned')
    .replace(/\bavodate/g, 'navigate').replace(/\bdyamics/g, 'dynamics')
    .replace(/\bisightful/g, 'insightful').replace(/\bprofoud/g, 'profound')
    .replace(/\bispiri/g, 'inspiri').replace(/\bteachigs/g, 'teachings')
    .replace(/\bchaleges/g, 'challenges').replace(/\bimportace/g, 'importance')
    .replace(/\bcotrol/g, 'control').replace(/\beditio/g, 'edition')
    .replace(/\bpublicatio/g, 'publication').replace(/\bHumaity/g, 'Humanity')
    .replace(/\bJourey/g, 'Journey').replace(/\bcongregatio/g, 'congregation')
    .replace(/\&bsp;/g, ' ').replace(/\bdifferet\b/g, 'different')
    .replace(/\bcocise\b/g, 'concise').replace(/\breferece\b/g, 'reference')
    .replace(/\bcotributios\b/g, 'contributions').replace(/\bcompellig\b/g, 'compelling')
    .replace(/\btowerig\b/g, 'towering').replace(/\buwaverig\b/g, 'unwavering')
    .replace(/\bexceptioal\b/g, 'exceptional').replace(/\bsigificace\b/g, 'significance')
    .replace(/\baddressig\b/g, 'addressing').replace(/\bruligs\b/g, 'rulings')
    .replace(/\bquestio\b/g, 'question').replace(/\baswer\b/g, 'answer')
    .replace(/\bdiscussio\b/g, 'discussion').replace(/\bessetial\b/g, 'essential')
    .replace(/\bpersoal\b/g, 'personal').replace(/\becourag\b/g, 'encourag')
    .replace(/\bimportat\b/g, 'important').replace(/\beverythig\b/g, 'everything')
    .replace(/\bsomethig\b/g, 'something').replace(/\banythig\b/g, 'anything')
    .replace(/\bnothig\b/g, 'nothing').replace(/\bthigs\b/g, 'things');
}

function detectCategory(title, desc) {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  if (/tafseer|tafsir|mushaf|tajweed/.test(text)) return 'quran';
  if (/(?:^|\s)quran(?:\s|$)/.test(text)) return 'quran';
  if (/(?:^|\s)hadith(?:\s|$)|(?:^|\s)sahih(?:\s|$)|(?:^|\s)bukhari(?:\s|$)|(?:^|\s)sunan(?:\s|$)/.test(text)) return 'hadith';
  if (/(?:^|\s)seerah(?:\s|$)|prophet muhammad|biography|sahab[ai]|companion|mercy to humanity/.test(text)) return 'seerah';
  if (/(?:^|\s)arabic(?:\s|$)|alphabet|writing|madinah|dictionary|spoken/.test(text)) return 'arabic';
  if (/children|kids|activity|bedtime|stories|storybook|coloring|fun with|my first|little library/.test(text)) return 'children';
  if (/(?:^|\s)fiqh(?:\s|$)|(?:^|\s)salah(?:\s|$)|worship|pillars|fundamentals|creed|aqeedah|tawheed/.test(text)) return 'fiqh';
  if (/(?:^|\s)women(?:\s|$)|(?:^|\s)marriage(?:\s|$)|muslimah/.test(text)) return 'women';
  if (/character|therapy|psychology|personality|self.help|don.?t be sad/.test(text)) return 'selfhelp';
  if (/dawah|dialogue|christian|misconception|civilization/.test(text)) return 'dawah';
  if (/ghazali|revival|religious sciences|scholarly/.test(text)) return 'scholarly';
  if (/death|resurrection|grave|hereafter/.test(text)) return 'hereafter';
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

function detectTarget(title, desc) {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  if (/children|kids|toddlers|bedtime|storybook|activity|coloring|board book|my first|little library/.test(text)) return 'children';
  if (/woman|women|sisters|muslimah/.test(text)) return 'women';
  if (/students|course|learner|reader|beginner/.test(text)) return 'students';
  return 'general';
}

async function generateDesc(product, sourceData, publisherName, zai) {
  const title = product.title;
  const price = product.price;
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : 'Contact for price';
  const sourceDesc = fixEncoding(cleanText(sourceData?.description || ''));
  const category = detectCategory(title, sourceDesc);
  const format = detectFormat(title);
  const target = detectTarget(title, sourceDesc);

  const prompt = `Write an SEO product description for an Islamic book on Bab-ul-Fatah (Pakistan's Islamic bookstore).

Title: "${title}"
Publisher: ${publisherName}
Price: ${priceStr}
Format: ${format}
Category: ${category}
Audience: ${target}
${sourceDesc ? `Source reference: """${sourceDesc.substring(0, 1500)}"""` : ''}

Rules:
- 1,200-2,000 characters, rich and detailed
- Engaging opening paragraph (don't repeat title exactly)
- Specific details about content, themes, what readers learn
- 3-4 bullet points with "- " prefix for key features
- End with marketing line: price + "Order from Bab-ul-Fatah, delivery across Pakistan"
- Warm, informative, respectful Islamic tone
- English only, no Urdu, no emojis, no markdown, no hashtags
- Unique content per book, no generic filler
- Children's books: mention age range, illustrations
- Scholarly books: mention author credentials, sources
- Sets/boxes: mention contents, value
- Naturally weave SEO: Islamic books Pakistan, buy ${category} books online`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an expert SEO copywriter for Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. Write compelling, detailed, unique product descriptions. Use correct Islamic terminology (peace be upon him, Quran, Hadith, Seerah, Sahabah). Each description must be unique and specific to the book.' },
      { role: 'user', content: prompt }
    ],
  });

  let text = completion.choices?.[0]?.message?.content?.trim();
  if (!text || text.length < 200) return null;
  return text.replace(/\*\*/g, '').replace(/^#+\s/gm, '').replace(/^\s*\n/gm, '\n');
}

async function main() {
  const startTime = Date.now();
  const publisherName = publisher === 'goodword' ? 'Goodword Books' : 'IIPH (International Islamic Publishing House)';
  const scraped = publisher === 'goodword' ? goodwordScraped : iiphScraped;

  console.log(`\nProcessing ${publisherName} products [${startIdx}-${endIdx}]...\n`);

  const zai = await ZAI.create();
  console.log('AI SDK ready.\n');

  const products = await prisma.product.findMany({
    where: { slug: { startsWith: publisher === 'goodword' ? 'goodword-' : 'iiph-' } },
    select: { id: true, title: true, slug: true, price: true },
    orderBy: { title: 'asc' }
  });

  const batch = products.slice(startIdx, endIdx);
  console.log(`Found ${batch.length} products in this batch.\n`);

  const results = [];
  for (let i = 0; i < batch.length; i++) {
    const product = batch[i];
    const globalIdx = startIdx + i + 1;
    const num = `[${globalIdx}/${products.length}]`;
    const pct = `[${Math.round(((globalIdx) / products.length) * 100)}%]`;

    const sourceData = findSource(product, scraped);
    let desc = null;

    for (let retry = 0; retry < 3 && !desc; retry++) {
      if (retry > 0) {
        console.log(`  Retry ${retry}...`);
        await new Promise(r => setTimeout(r, 8000)); // 8s wait on retry
      }
      try {
        desc = await generateDesc(product, sourceData, publisherName, zai);
      } catch (e) {
        console.error(`  Error: ${e.message?.substring(0, 80)}`);
        desc = null;
      }
    }

    if (desc && desc.length >= 200) {
      await prisma.product.update({
        where: { id: product.id },
        data: { description: desc }
      });
      results.push({ id: product.id, title: product.title, slug: product.slug, length: desc.length, source: sourceData ? 'ai+scraped' : 'ai-only' });
      process.stdout.write(`${pct} ${num} ${product.title.substring(0, 42).padEnd(42)} OK (${desc.length}c)\n`);
    } else {
      results.push({ id: product.id, title: product.title, slug: product.slug, length: 0, source: 'failed' });
      process.stdout.write(`${pct} ${num} ${product.title.substring(0, 42).padEnd(42)} FAILED\n`);
    }

    await new Promise(r => setTimeout(r, 3500)); // 3.5s delay to avoid rate limits
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const succeeded = results.filter(r => r.length > 0).length;
  const avgLen = succeeded > 0 ? Math.round(results.filter(r => r.length > 0).reduce((s, r) => s + r.length, 0) / succeeded) : 0;

  console.log(`\n--- Batch Complete: ${succeeded}/${batch.length} succeeded, avg ${avgLen} chars, ${elapsed}s ---`);

  // Append to results file
  const resultsFile = path.join(__dirname, 'seo-gw-iiph-results.json');
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(resultsFile, 'utf8')); } catch {}
  // Remove any existing results for this publisher range
  const existingOther = existing.filter(r => {
    if (publisher === 'goodword') return !r.slug?.startsWith('goodword-');
    return !r.slug?.startsWith('iiph-');
  });
  existingOther.push(...results);
  fs.writeFileSync(resultsFile, JSON.stringify(existingOther, null, 2));
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
