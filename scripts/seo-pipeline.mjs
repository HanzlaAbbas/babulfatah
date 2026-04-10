#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — AI SEO Pipeline: Brand-Cleanse + Meta Description Generator
// ============================================================================
// Stages:
//   --stage desc    : Generate AI descriptions for products with short/missing ones
//   --stage cleanse : Remove all competitor branding from all 143 products
//   --stage meta    : Generate metaDescription (130-155 chars) for all 143
//   --stage audit   : Final verification pass
//   --stage all     : Run all stages sequentially
// ============================================================================
// Usage:
//   node scripts/seo-pipeline.mjs --stage desc --batch 0      (batch 0 = products 0-19)
//   node scripts/seo-pipeline.mjs --stage cleanse --batch 0
//   node scripts/seo-pipeline.mjs --stage meta --batch 0
//   node scripts/seo-pipeline.mjs --stage audit
// ============================================================================

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const BATCH_SIZE = 5;

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf('--' + name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const stage = getArg('stage') || 'all';
const batchNum = parseInt(getArg('batch') || '0');
const LOG_FILE = path.join(__dirname, 'seo-pipeline-log.json');

// ─── Logging ───────────────────────────────────────────────────────────────

function loadLog() {
  try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch { return {}; }
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// ─── Source Data ───────────────────────────────────────────────────────────

const iiphScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'iiph-scraped-data.json'), 'utf8'));
const goodwordScraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'goodword-scraped-data.json'), 'utf8'));

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a, b) {
  const na = normalizeTitle(a), nb = normalizeTitle(b);
  if (na === nb) return 1.0;
  const wa = new Set(na.split(' ').filter(w => w.length > 2));
  const wb = new Set(nb.split(' ').filter(w => w.length > 2));
  const inter = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union > 0 ? inter / union : 0;
}

function findSource(product, scraped) {
  for (const item of scraped) {
    if (normalizeTitle(product.title) === normalizeTitle(item.dbTitle || item.title)) return item;
  }
  let best = null, bestScore = 0;
  for (const item of scraped) {
    const score = titleSimilarity(product.title, item.dbTitle || item.title);
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore >= 0.5 ? best : null;
}

function cleanScrapedText(text) {
  if (!text) return '';
  return text.replace(/Product Descriptio\s*:?/gi, '').replace(/Additional information[\s\S]*$/i, '')
    .replace(/Return Policy[\s\S]*$/i, '').replace(/FAQ[\s\S]*$/i, '')
    .replace(/Weight\s*[\d.]+\s*kg/gi, '').replace(/Dimensions\s*[\d.x\s]+cm/gi, '')
    .replace(/ISBN[\s\S]*$/i, '').replace(/\s+/g, ' ').trim();
}

function fixEncoding(text) {
  return text.replace(/\bme\b(?=\s+ad\b)/g, 'men').replace(/\bwome\b/g, 'women')
    .replace(/\bca\b(?=\s+)/g, 'can').replace(/\bo\b(?=\s+)/g, 'of')
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

// ─── API Call with Retry ───────────────────────────────────────────────────

async function callAI(zai, systemPrompt, userPrompt) {
  for (let retry = 0; retry < 3; retry++) {
    if (retry > 0) {
      process.stdout.write(`  [retry ${retry}]`);
      await new Promise(r => setTimeout(r, 8000));
    }
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      });
      return completion.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      if (e.message?.includes('429')) {
        await new Promise(r => setTimeout(r, 12000));
        continue;
      }
      throw e;
    }
  }
  return null;
}

function cleanOutput(text) {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/^#+\s/gm, '').replace(/^\s*\n/gm, '\n').trim();
}

// ─── STAGE 1: Generate AI Descriptions for Short Products ─────────────────

async function stageDesc(zai) {
  console.log('\n' + '='.repeat(70));
  console.log('  STAGE 1: AI Description Generation (short descriptions only)');
  console.log('='.repeat(70));

  const allProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } },
      ]
    },
    select: { id: true, title: true, slug: true, price: true, description: true },
    orderBy: { title: 'asc' }
  });

  const shortProducts = allProducts.filter(p => (p.description?.length || 0) < 1200);
  const totalBatches = Math.ceil(shortProducts.length / BATCH_SIZE);

  if (batchNum >= totalBatches) {
    console.log(`No products in batch ${batchNum} (total batches: ${totalBatches}). All done!`);
    return;
  }

  const batch = shortProducts.slice(batchNum * BATCH_SIZE, (batchNum + 1) * BATCH_SIZE);
  console.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} products with short descriptions\n`);

  const systemPrompt = `You are an expert SEO copywriter for Bab-ul-Fatah, Pakistan's premier Islamic bookstore. Write compelling, detailed, unique product descriptions. Use correct Islamic terminology (peace be upon him, Quran, Hadith, Seerah, Sahabah). Each description must be unique and specific to the book.

CRITICAL RULES:
- NEVER mention "Goodword", "IIPH", "International Islamic Publishing House", "Zamzam Publishers", or any competitor/publisher brand name.
- Do NOT add "Bab-ul-Fatah" branding in the description body either.
- Write as a neutral, professional book description.`;

  let ok = 0, fail = 0;
  for (let i = 0; i < batch.length; i++) {
    const product = batch[i];
    const globalIdx = batchNum * BATCH_SIZE + i + 1;
    const num = `[${globalIdx}/${shortProducts.length}]`;
    const pct = `[${Math.round((globalIdx / shortProducts.length) * 100)}%]`;

    const scraped = product.slug.startsWith('goodword-') ? goodwordScraped : iiphScraped;
    const sourceData = findSource(product, scraped);
    const sourceDesc = fixEncoding(cleanScrapedText(sourceData?.description || ''));
    const category = detectCategory(product.title, sourceDesc);
    const format = detectFormat(product.title);
    const target = detectTarget(product.title, sourceDesc);
    const priceStr = product.price > 0 ? `Rs. ${Math.round(product.price).toLocaleString('en-PK')}` : 'Contact for price';

    const userPrompt = `Write an SEO product description for an Islamic book.

Title: "${product.title}"
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
- End with marketing line: price + "Order online for delivery across Pakistan"
- Warm, informative, respectful Islamic tone
- English only, no Urdu, no emojis, no markdown, no hashtags
- Unique content, no generic filler
- Children's books: mention age range, illustrations
- Scholarly books: mention author credentials, sources`;

    try {
      const raw = await callAI(zai, systemPrompt, userPrompt);
      const desc = cleanOutput(raw);
      if (desc && desc.length >= 500) {
        await prisma.product.update({ where: { id: product.id }, data: { description: desc } });
        ok++;
        process.stdout.write(`${pct} ${num} ${product.title.substring(0, 42).padEnd(42)} OK (${desc.length}c)\n`);
      } else {
        fail++;
        process.stdout.write(`${pct} ${num} ${product.title.substring(0, 42).padEnd(42)} TOO-SHORT\n`);
      }
    } catch (e) {
      fail++;
      process.stdout.write(`${pct} ${num} ${product.title.substring(0, 42).padEnd(42)} ERROR\n`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n--- Stage Desc Batch ${batchNum}: ${ok}/${batch.length} OK, ${fail} failed ---`);
  return { stage: 'desc', batch: batchNum, ok, fail, total: batch.length };
}

// ─── STAGE 2: Brand-Cleanse Descriptions ───────────────────────────────────

async function stageCleanse(zai) {
  console.log('\n' + '='.repeat(70));
  console.log('  STAGE 2: Brand-Cleanse (remove competitor mentions)');
  console.log('='.repeat(70));

  const allProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } },
      ]
    },
    select: { id: true, title: true, slug: true, price: true, description: true },
    orderBy: { title: 'asc' }
  });

  // Filter to products that actually contain competitor brands
  const branded = allProducts.filter(p =>
    p.description?.match(/\bGoodword\b/i) ||
    p.description?.match(/\bIIPH\b/i) ||
    p.description?.match(/International Islamic Publishing House/i) ||
    p.description?.match(/Zamzam Publishers/i)
  );

  const totalBatches = Math.ceil(branded.length / BATCH_SIZE);

  if (batchNum >= totalBatches) {
    console.log(`No products in batch ${batchNum} (total batches: ${totalBatches}). All clean!`);
    return;
  }

  const batch = branded.slice(batchNum * BATCH_SIZE, (batchNum + 1) * BATCH_SIZE);
  console.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} products with competitor branding\n`);

  const systemPrompt = `You are an expert Islamic commerce copywriter for Bab-ul-Fatah, Pakistan's premier Islamic bookstore.

CRITICAL TASK: Rewrite the given product description to remove ALL competitor brand mentions while keeping ALL factual content, Islamic references, and book details intact.

RULES:
- Remove EVERY instance of: "Goodword", "Goodword Books", "IIPH", "International Islamic Publishing House", "Zamzam Publishers", or any other publisher name
- Replace brand mentions with generic phrases like "this publisher", "the author", or simply remove them
- Do NOT add "Bab-ul-Fatah" branding
- Keep the same overall length (1,200-2,000 chars), structure, and bullet points
- Keep ALL Islamic content, Quran/Hadith references, and factual details exactly as-is
- Preserve the marketing CTA at the end (price + "Order online for delivery across Pakistan")
- English only, no emojis, no markdown`;

  let ok = 0, fail = 0;
  for (let i = 0; i < batch.length; i++) {
    const product = batch[i];
    const globalIdx = batchNum * BATCH_SIZE + i + 1;
    const num = `[${globalIdx}/${branded.length}]`;

    const userPrompt = `Rewrite this product description to remove all competitor brand names while preserving all content:

Title: "${product.title}"
Current Description:
"""
${product.description}
"""

Remember: Remove "Goodword", "IIPH", "International Islamic Publishing House", "Zamzam Publishers" etc. Keep everything else.`;

    try {
      const raw = await callAI(zai, systemPrompt, userPrompt);
      const desc = cleanOutput(raw);
      if (desc && desc.length >= 500) {
        // Verify no competitor brands remain
        const hasBrands = desc.match(/\bGoodword\b/i) || desc.match(/\bIIPH\b/i) || desc.match(/International Islamic Publishing House/i);
        if (hasBrands) {
          fail++;
          process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} BRAND-STILL-PRESENT\n`);
        } else {
          await prisma.product.update({ where: { id: product.id }, data: { description: desc } });
          ok++;
          process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} CLEANSED (${desc.length}c)\n`);
        }
      } else {
        fail++;
        process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} TOO-SHORT\n`);
      }
    } catch (e) {
      fail++;
      process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} ERROR\n`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n--- Stage Cleanse Batch ${batchNum}: ${ok}/${batch.length} cleansed, ${fail} failed ---`);
  return { stage: 'cleanse', batch: batchNum, ok, fail, total: batch.length };
}

// ─── STAGE 3: Generate Meta Descriptions ──────────────────────────────────

async function stageMeta(zai) {
  console.log('\n' + '='.repeat(70));
  console.log('  STAGE 3: Meta Description Generation (130-155 chars)');
  console.log('='.repeat(70));

  const allProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } },
      ]
    },
    select: { id: true, title: true, slug: true, price: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  const needsMeta = allProducts.filter(p => !p.metaDescription || p.metaDescription.length < 100);
  const totalBatches = Math.ceil(needsMeta.length / BATCH_SIZE);

  if (batchNum >= totalBatches) {
    console.log(`No products in batch ${batchNum} (total batches: ${totalBatches}). All have meta!`);
    return;
  }

  const batch = needsMeta.slice(batchNum * BATCH_SIZE, (batchNum + 1) * BATCH_SIZE);
  console.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} products needing meta descriptions\n`);

  const systemPrompt = `You are an SEO expert for Bab-ul-Fatah, Pakistan's premier Islamic bookstore. Generate a single meta description for the given product.

CRITICAL RULES:
- EXACTLY 130-155 characters (no exceptions, count carefully)
- Do NOT include the title as-is; rewrite it conversationally
- Include relevant keywords naturally (Islamic books, Pakistan, buy online)
- Do NOT mention "Goodword", "IIPH", or any competitor brand
- Do NOT use quotes, double quotes, or special characters
- No emojis, no hashtags
- Must be a single compelling sentence or two short clauses
- Focus on the book's value proposition`;

  let ok = 0, fail = 0;
  for (let i = 0; i < batch.length; i++) {
    const product = batch[i];
    const globalIdx = batchNum * BATCH_SIZE + i + 1;
    const num = `[${globalIdx}/${needsMeta.length}]`;

    const descExcerpt = (product.description || '').substring(0, 600);

    const userPrompt = `Product Title: "${product.title}"
Price: Rs. ${Math.round(product.price)}
Description excerpt: ${descExcerpt}

Generate ONLY a meta description. Output exactly one line of text, 130-155 characters. No quotes, no explanation, no title, nothing else.`;

    try {
      const raw = await callAI(zai, systemPrompt, userPrompt);
      let meta = cleanOutput(raw);
      if (!meta) { fail++; process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} EMPTY\n`); continue; }

      // Remove any wrapping quotes
      meta = meta.replace(/^["']|["']$/g, '').trim();

      // Validate length
      if (meta.length < 120 || meta.length > 165) {
        // Try to trim/pad
        if (meta.length > 165) meta = meta.substring(0, 155).replace(/\s+[^\s]*$/, '');
        if (meta.length < 120) {
          fail++;
          process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} META-TOO-SHORT (${meta.length})\n`);
          continue;
        }
      }

      await prisma.product.update({ where: { id: product.id }, data: { metaDescription: meta } });
      ok++;
      process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} META (${meta.length}c)\n`);
    } catch (e) {
      fail++;
      process.stdout.write(`${num} ${product.title.substring(0, 42).padEnd(42)} ERROR\n`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n--- Stage Meta Batch ${batchNum}: ${ok}/${batch.length} OK, ${fail} failed ---`);
  return { stage: 'meta', batch: batchNum, ok, fail, total: batch.length };
}

// ─── STAGE 4: Audit ───────────────────────────────────────────────────────

async function stageAudit() {
  console.log('\n' + '='.repeat(70));
  console.log('  STAGE 4: FINAL AUDIT');
  console.log('='.repeat(70) + '\n');

  const allProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } },
      ]
    },
    select: { id: true, title: true, slug: true, price: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  const gw = allProducts.filter(p => p.slug.startsWith('goodword-'));
  const iiph = allProducts.filter(p => p.slug.startsWith('iiph-'));

  let issues = [];

  // Check 1: No empty descriptions
  const emptyDesc = allProducts.filter(p => !p.description || p.description.trim().length < 50);
  if (emptyDesc.length > 0) {
    issues.push(`EMPTY DESCRIPTIONS: ${emptyDesc.length}`);
    emptyDesc.forEach(p => issues.push(`  - ${p.title} (${p.slug})`));
  }

  // Check 2: No short descriptions (< 1000 chars)
  const shortDesc = allProducts.filter(p => (p.description?.length || 0) < 1000);
  if (shortDesc.length > 0) {
    issues.push(`SHORT DESCRIPTIONS (<1000c): ${shortDesc.length}`);
    shortDesc.forEach(p => issues.push(`  - ${p.title}: ${p.description?.length || 0}c`));
  }

  // Check 3: No competitor brands
  const brandedDesc = allProducts.filter(p =>
    p.description?.match(/\bGoodword\b/i) ||
    p.description?.match(/\bIIPH\b/i) ||
    p.description?.match(/International Islamic Publishing House/i) ||
    p.description?.match(/Zamzam Publishers/i)
  );
  if (brandedDesc.length > 0) {
    issues.push(`COMPETITOR BRANDS IN DESCRIPTIONS: ${brandedDesc.length}`);
    brandedDesc.forEach(p => {
      const brands = [];
      if (p.description?.match(/\bGoodword\b/i)) brands.push('Goodword');
      if (p.description?.match(/\bIIPH\b/i)) brands.push('IIPH');
      if (p.description?.match(/International Islamic Publishing House/i)) brands.push('IIIPH');
      if (p.description?.match(/Zamzam Publishers/i)) brands.push('Zamzam');
      issues.push(`  - ${p.title}: contains [${brands.join(', ')}]`);
    });
  }

  // Check 4: metaDescription validation
  const noMeta = allProducts.filter(p => !p.metaDescription || p.metaDescription.trim().length < 50);
  if (noMeta.length > 0) {
    issues.push(`MISSING META DESCRIPTIONS: ${noMeta.length}`);
    noMeta.forEach(p => issues.push(`  - ${p.title}`));
  }

  const badMetaLen = allProducts.filter(p => {
    const len = p.metaDescription?.length || 0;
    return len >= 50 && (len < 120 || len > 165);
  });
  if (badMetaLen.length > 0) {
    issues.push(`META LENGTH OUT OF RANGE (120-165): ${badMetaLen.length}`);
    badMetaLen.forEach(p => issues.push(`  - ${p.title}: ${p.metaDescription?.length}c`));
  }

  const brandInMeta = allProducts.filter(p =>
    p.metaDescription?.match(/\bGoodword\b/i) ||
    p.metaDescription?.match(/\bIIPH\b/i)
  );
  if (brandInMeta.length > 0) {
    issues.push(`COMPETITOR BRANDS IN META: ${brandInMeta.length}`);
    brandInMeta.forEach(p => issues.push(`  - ${p.title}: ${p.metaDescription}`));
  }

  // Summary stats
  console.log('AUDIT SUMMARY');
  console.log('-'.repeat(50));
  console.log(`Total Products: ${allProducts.length} (Goodword: ${gw.length}, IIPH: ${iiph.length})`);

  const descLens = allProducts.map(p => p.description?.length || 0);
  console.log(`Description lengths: min=${Math.min(...descLens)}, max=${Math.max(...descLens)}, avg=${Math.round(descLens.reduce((a,b)=>a+b,0)/descLens.length)}`);

  const metaLens = allProducts.filter(p => p.metaDescription).map(p => p.metaDescription?.length || 0);
  console.log(`Meta descriptions: ${metaLens.length}/${allProducts.length} present, avg=${metaLens.length > 0 ? Math.round(metaLens.reduce((a,b)=>a+b,0)/metaLens.length) : 0} chars`);

  if (issues.length === 0) {
    console.log('\n  ALL CHECKS PASSED - Pipeline Complete!');
  } else {
    console.log(`\n  ISSUES FOUND: ${issues.length}`);
    issues.forEach(issue => console.log(`  ${issue}`));
  }

  return { stage: 'audit', issues: issues.length, products: allProducts.length };
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(70));
  console.log('  Bab-ul-Fatah SEO Pipeline');
  console.log('  Stage: ' + stage + ' | Batch: ' + batchNum);
  console.log('  ' + new Date().toISOString());
  console.log('='.repeat(70));

  const zai = await ZAI.create();
  console.log('AI SDK initialized.\n');

  let result;
  switch (stage) {
    case 'desc': result = await stageDesc(zai); break;
    case 'cleanse': result = await stageCleanse(zai); break;
    case 'meta': result = await stageMeta(zai); break;
    case 'audit': result = await stageAudit(); break;
    case 'all':
      console.log('Running all stages...\n');
      await stageDesc(zai);
      await stageCleanse(zai);
      await stageMeta(zai);
      result = await stageAudit();
      break;
    default:
      console.error('Unknown stage. Use: desc, cleanse, meta, audit, all');
      process.exit(1);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nTotal time: ${elapsed}s`);

  // Save to log
  const log = loadLog();
  const key = `${stage}-${batchNum}-${Date.now()}`;
  log[key] = { ...result, elapsed, timestamp: new Date().toISOString() };
  saveLog(log);
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
