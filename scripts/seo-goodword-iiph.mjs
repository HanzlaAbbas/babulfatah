#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — AI-Powered SEO Description Generator
// for Goodword Books & IIPH Products
// ============================================================================
// Uses z-ai-web-dev-sdk to generate rich, unique, SEO-optimized descriptions
// for all 143 products (58 Goodword + 85 IIPH), using scraped source data
// as context for accurate content.
// ============================================================================

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// ─── Load scraped source data ──────────────────────────────────────────────

const iiphScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'iiph-scraped-data.json'), 'utf8'));
const goodwordScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'goodword-scraped-data.json'), 'utf8'));

// ─── Title matching ────────────────────────────────────────────────────────

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
  // Try fuzzy match
  let best = null, bestScore = 0;
  for (const [k, v] of goodwordLookup) {
    const score = titleSimilarity(title, k);
    if (score > bestScore) { bestScore = score; best = v; }
  }
  return bestScore >= 0.5 ? best : null;
}

// ─── Clean source descriptions ─────────────────────────────────────────────

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

// ─── Category detection ────────────────────────────────────────────────────

function detectCategory(title, desc) {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  if (/tafseer|tafsir|mushaf|tajweed/.test(text)) return 'quran';
  if (/(?:^|\s)quran(?:\s|$)/.test(text)) return 'quran';
  if (/(?:^|\s)hadith(?:\s|$)|(?:^|\s)sahih(?:\s|$)|(?:^|\s)bukhari(?:\s|$)|(?:^|\s)sunan(?:\s|$)|(?:^|\s)ahadith(?:\s|$)/.test(text)) return 'hadith';
  if (/(?:^|\s)seerah(?:\s|$)|prophet muhammad|biography|sahab[ai]|companion|mercy to humanity/.test(text)) return 'seerah';
  if (/(?:^|\s)arabic(?:\s|$)|alphabet|writing|madinah|dictionary|spoken/.test(text)) return 'arabic';
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

function detectTarget(title, desc) {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  if (/children|kids|toddlers|young readers|bedtime|storybook|activity|coloring|board book|my first|little library/.test(text)) return 'children';
  if (/woman|women|sisters|female|muslimah/.test(text) && !/general|student/.test(text)) return 'women';
  if (/students|course|learner|reader|beginner|islamic studies/.test(text)) return 'students';
  if (/youth|young/.test(text)) return 'youth';
  return 'general';
}

// ─── AI Description Generator ──────────────────────────────────────────────

async function generateAIDescription(product, sourceData, publisher, zai) {
  const title = product.title;
  const price = product.price;
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : 'Contact for price';
  const sourceDesc = cleanScrapedText(sourceData?.description || '');
  const category = detectCategory(title, sourceDesc);
  const format = detectFormat(title);
  const target = detectTarget(title, sourceDesc);

  // Build source context - trim to avoid token limits
  let sourceContext = '';
  if (sourceDesc) {
    // Clean anti-scraping artifacts
    const cleaned = sourceDesc
      .replace(/\bme\b(?=\s+ad\b)/g, 'men')
      .replace(/\bwome\b/g, 'women')
      .replace(/\bca\b(?=\s+)/g, 'can')
      .replace(/\bo\b(?=\s+)/g, 'of')
      .replace(/\biteractio/g, 'interaction')
      .replace(/\bcomprehesive/g, 'comprehensive')
      .replace(/\bguidace/g, 'guidance')
      .replace(/\breowed/g, 'renowned')
      .replace(/\bavodate/g, 'navigate')
      .replace(/\bdyamics/g, 'dynamics')
      .replace(/\bisightful/g, 'insightful')
      .replace(/\bprofoud/g, 'profound')
      .replace(/\bispiri/g, 'inspiri')
      .replace(/\bteachigs/g, 'teachings')
      .replace(/\bchaleges/g, 'challenges')
      .replace(/\bimportace/g, 'importance')
      .replace(/\bcotrol/g, 'control')
      .replace(/\beditio/g, 'edition')
      .replace(/\bpublicatio/g, 'publication')
      .replace(/\bHumaity/g, 'Humanity')
      .replace(/\bJourey/g, 'Journey')
      .replace(/\bcongregatio/g, 'congregation')
      .replace(/\&bsp;/g, ' ')
      .replace(/\bcomprehesive\b/g, 'comprehensive')
      .replace(/\bguidace\b/g, 'guidance')
      .replace(/\biteractio\b/g, 'interaction')
      .replace(/\brespectful\b/g, 'respectful')
      .replace(/\baccordace\b/g, 'accordance')
      .replace(/\breowed\b/g, 'renowned')
      .replace(/\bdifferet\b/g, 'different')
      .replace(/\bcocise\b/g, 'concise')
      .replace(/\breferece\b/g, 'reference')
      .replace(/\bcaterig\b/g, 'catering')
      .replace(/\bcotributios\b/g, 'contributions')
      .replace(/\bcompellig\b/g, 'compelling')
      .replace(/\btowerig\b/g, 'towering')
      .replace(/\buwaverig\b/g, 'unwavering')
      .replace(/\bexceptioal\b/g, 'exceptional')
      .replace(/\bsigificace\b/g, 'significance')
      .replace(/\bbecomig\b/g, 'becoming')
      .replace(/\baddressig\b/g, 'addressing')
      .replace(/\bempowerig\b/g, 'empowering')
      .replace(/\billumiati/g, 'illuminati')
      .replace(/\brespectivel/g, 'respectivel')
      .replace(/\bsucceede/g, 'succeede')
      .replace(/\badvace/g, 'advance')
      .replace(/\btechical/g, 'technical')
      .replace(/\bpractitioer/g, 'practitioner')
      .replace(/\bessetial/g, 'essential')
      .replace(/\bpersoal/g, 'personal')
      .replace(/\becourag/g, 'encourag')
      .replace(/\bimportat/g, 'important')
      .replace(/\beverythig/g, 'everything')
      .replace(/\bsomethig/g, 'something')
      .replace(/\banythig/g, 'anything')
      .replace(/\bnothig/g, 'nothing')
      .replace(/\bthig\b/g, 'thing')
      .replace(/\bthigs\b/g, 'things')
      .replace(/\bruligs\b/g, 'rulings')
      .replace(/\bquestio\b/g, 'question')
      .replace(/\baswer\b/g, 'answer')
      .replace(/\bdiscussio\b/g, 'discussion');
    
    sourceContext = cleaned.substring(0, 1800);
  }

  const prompt = `Write an SEO product description for an Islamic book listing on Bab-ul-Fatah (Pakistan's premier Islamic online bookstore).

Book Title: "${title}"
Publisher: ${publisher}
Price: ${priceStr}
Format: ${format}
Category: ${category}
Target Audience: ${target}
${sourceContext ? `Publisher's Description (use as reference for accuracy): """${sourceContext}"""` : 'No publisher description available — write based on title analysis.'}

REQUIREMENTS:
1. Write 1,200-2,000 characters of rich, detailed description
2. Start with an engaging overview paragraph (no title repetition)
3. Include specific details about the book's content, themes, and what readers will learn
4. Add 3-4 bullet points highlighting key features (use "- " prefix)
5. End with a marketing line mentioning the price and ordering from Bab-ul-Fatah with delivery across Pakistan
6. Tone: warm, informative, and respectful of Islamic content
7. Language: English only, no Urdu
8. No emojis, no markdown bold/italic, no hashtags
9. Make each description unique — avoid generic filler phrases
10. For children's books: mention age range, illustrations, educational value
11. For scholarly books: mention author credentials, academic rigor, sources used
12. For dictionaries/reference: mention entry count, layout, usability
13. For sets/boxes: mention what's included, value proposition
14. SEO keywords naturally woven in: Islamic books Pakistan, buy ${category} books online, authentic Islamic literature`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO copywriter for Bab-ul-Fatah, Pakistan\'s premier Islamic bookstore. You write compelling, detailed product descriptions that help readers understand the book\'s content and value while being SEO-friendly. Your descriptions are rich in detail, accurate, and never generic. You understand Islamic terminology and use it correctly (e.g., "peace be upon him", "Quran", "Hadith", "Seerah", "Sahabah"). You avoid repetitive phrases and always provide unique, engaging content tailored to each specific book.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    let text = completion.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 200) return null;
    
    // Clean up
    text = text.replace(/\*\*/g, '').replace(/^#+\s/gm, '').replace(/^\s*\n/gm, '\n');
    
    return text;
  } catch (e) {
    console.error(`  AI Error for "${title}": ${e.message?.substring(0, 100)}`);
    return null;
  }
}

// ─── Batch processing with retry ───────────────────────────────────────────

async function processProducts(products, publisher, findDescFn, zai, startIdx = 0) {
  const results = [];
  
  for (let i = startIdx; i < products.length; i++) {
    const product = products[i];
    const num = `[${i + 1}/${products.length}]`;
    const pct = `[${Math.round(((i + 1) / products.length) * 100)}%]`;
    
    const sourceData = findDescFn(product.title);
    
    // Try AI generation with up to 2 retries
    let desc = null;
    for (let retry = 0; retry < 3 && !desc; retry++) {
      if (retry > 0) {
        console.log(`  ${num} Retry ${retry} for "${product.title.substring(0, 40)}"...`);
        await new Promise(r => setTimeout(r, 2000));
      }
      desc = await generateAIDescription(product, sourceData, publisher, zai);
    }
    
    if (desc && desc.length >= 200) {
      // Update database
      await prisma.product.update({
        where: { id: product.id },
        data: { description: desc }
      });
      
      results.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        length: desc.length,
        source: sourceData?.description ? 'ai+scraped' : 'ai-only',
        price: product.price
      });
      
      process.stdout.write(`${pct} ${num} ${product.title.substring(0, 45).padEnd(45)} OK (${desc.length} chars)\n`);
    } else {
      results.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        length: 0,
        source: 'failed',
        price: product.price
      });
      process.stdout.write(`${pct} ${num} ${product.title.substring(0, 45).padEnd(45)} FAILED\n`);
    }
    
    // Small delay between API calls
    await new Promise(r => setTimeout(r, 500));
    
    // Save progress every 10 products
    if ((i + 1) % 10 === 0) {
      const progressFile = path.join(__dirname, 'seo-gw-iiph-progress.json');
      fs.writeFileSync(progressFile, JSON.stringify({
        publisher,
        lastProcessed: i + 1,
        total: products.length,
        results,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  }
  
  return results;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  
  console.log('='.repeat(70));
  console.log('  Bab-ul-Fatah — AI-Powered SEO Description Generator');
  console.log('  Goodword Books + IIPH Products');
  console.log('='.repeat(70));
  console.log(`\nIIPH scraped descriptions available: ${iiphScraped.filter(r => r.description).length}/${iiphScraped.length}`);
  console.log(`Goodword scraped descriptions available: ${goodwordScraped.length}`);
  
  // Initialize AI SDK
  console.log('\nInitializing z-ai-web-dev-sdk...');
  const zai = await ZAI.create();
  console.log('AI SDK initialized successfully!');
  
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
  
  console.log(`\nGoodword products: ${goodwordProducts.length}`);
  console.log(`IIPH products: ${iiphProducts.length}`);
  console.log(`Total to process: ${goodwordProducts.length + iiphProducts.length}`);
  
  const allResults = [];
  
  // ── Process Goodword Books ──
  console.log('\n' + '='.repeat(70));
  console.log('  PART 1: Goodword Books (' + goodwordProducts.length + ' products)');
  console.log('='.repeat(70));
  const gwResults = await processProducts(
    goodwordProducts,
    'Goodword Books',
    findGoodwordDesc,
    zai
  );
  allResults.push(...gwResults);
  
  // ── Process IIPH Books ──
  console.log('\n' + '='.repeat(70));
  console.log('  PART 2: IIPH Books (' + iiphProducts.length + ' products)');
  console.log('='.repeat(70));
  const iiphResults = await processProducts(
    iiphProducts,
    'IIPH (International Islamic Publishing House)',
    findIiphDesc,
    zai
  );
  allResults.push(...iiphResults);
  
  // ── Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const succeeded = allResults.filter(r => r.length > 0).length;
  const failed = allResults.filter(r => r.length === 0).length;
  const fromScraped = allResults.filter(r => r.source === 'ai+scraped').length;
  const aiOnly = allResults.filter(r => r.source === 'ai-only').length;
  const avgLen = succeeded > 0
    ? Math.round(allResults.filter(r => r.length > 0).reduce((s, r) => s + r.length, 0) / succeeded)
    : 0;
  const minLen = succeeded > 0
    ? Math.min(...allResults.filter(r => r.length > 0).map(r => r.length))
    : 0;
  const maxLen = succeeded > 0
    ? Math.max(...allResults.filter(r => r.length > 0).map(r => r.length))
    : 0;
  
  console.log('\n' + '='.repeat(70));
  console.log('  FINAL SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total processed:    ${allResults.length}`);
  console.log(`Succeeded:          ${succeeded}`);
  console.log(`Failed:             ${failed}`);
  console.log(`From AI+Scraped:    ${fromScraped}`);
  console.log(`From AI only:       ${aiOnly}`);
  console.log(`Avg description:    ${avgLen} chars`);
  console.log(`Min description:    ${minLen} chars`);
  console.log(`Max description:    ${maxLen} chars`);
  console.log(`Time elapsed:       ${elapsed}s`);
  
  if (failed > 0) {
    console.log('\nFailed products:');
    allResults.filter(r => r.length === 0).forEach(r => console.log(`  - ${r.title}`));
  }
  
  // Save final results
  const resultsFile = path.join(__dirname, 'seo-gw-iiph-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));
  console.log(`\nResults saved to: ${resultsFile}`);
}

main()
  .catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
