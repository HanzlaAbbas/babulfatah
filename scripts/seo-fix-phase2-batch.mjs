#!/usr/bin/env node
// Phase 2: Batch all 14 short meta descriptions in ONE AI call

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  console.log('=== PHASE 2: Batch Meta Description Rewrite ===\n');

  const products = await prisma.product.findMany({
    where: {
      OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }],
      metaDescription: { not: null }
    },
    select: { id: true, title: true, slug: true, description: true, price: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  const needsFix = products.filter(p => p.metaDescription.length < 130);
  console.log(`Found ${needsFix.length} products with meta < 130 chars\n`);

  // Build a single prompt for ALL 14 products
  const productList = needsFix.map((p, i) => {
    const priceStr = p.price > 0 ? `Rs. ${Math.round(p.price).toLocaleString('en-PK')}` : 'Contact for price';
    const excerpt = p.description.substring(0, 300).replace(/\n/g, ' ');
    return `${i + 1}. Title: "${p.title}" | Price: ${priceStr} | Excerpt: "${excerpt}"`;
  }).join('\n');

  const systemPrompt = `You are an SEO specialist. Write meta descriptions for product pages.
RULES for EACH meta description:
- EXACTLY 130-155 characters
- Do NOT start with the book title
- Include keywords: Islamic books, Pakistan, buy online
- Mention what the reader gains
- No publisher brands, no "Bab-ul-Fatah"
- English only
- Output format: one line per product, numbered exactly as in the input, format: NUMBER|META
- NO extra text, NO explanations, JUST the numbered lines`;

  const userPrompt = `Write SEO meta descriptions for these ${needsFix.length} Islamic books:\n\n${productList}`;

  console.log('Calling AI (single batch)...');
  const zai = await ZAI.create();

  let response = null;
  for (let retry = 0; retry < 3 && !response; retry++) {
    if (retry > 0) {
      console.log(`Retry ${retry} (waiting 20s)...`);
      await new Promise(r => setTimeout(r, 20000));
    }
    try {
      const comp = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
      response = comp.choices?.[0]?.message?.content?.trim();
    } catch (e) {
      console.error(`API error: ${e.message?.substring(0, 100)}`);
      if (e.message?.includes('429')) await new Promise(r => setTimeout(r, 30000));
      else await new Promise(r => setTimeout(r, 10000));
    }
  }

  if (!response) {
    console.error('Failed to get AI response after 3 retries');
    process.exit(1);
  }

  console.log(`\nRaw AI response:\n${response}\n`);

  // Parse the response: each line should be "NUMBER|META"
  const lines = response.split('\n').filter(l => l.trim());
  const parsed = {};

  for (const line of lines) {
    const match = line.match(/^(\d+)\s*\|\s*"?([^"]+)"?\s*$/);
    if (match) {
      const num = parseInt(match[1]);
      let meta = match[2].trim().replace(/["']/g, '');
      parsed[num] = meta;
    }
  }

  console.log(`Parsed ${Object.keys(parsed).length}/${needsFix.length} meta descriptions\n`);

  const results = [];

  for (let i = 0; i < needsFix.length; i++) {
    const p = needsFix[i];
    const num = i + 1;
    const newMeta = parsed[num];

    if (newMeta && newMeta.length >= 120) {
      await prisma.product.update({
        where: { id: p.id },
        data: { metaDescription: newMeta }
      });
      results.push({ title: p.title, oldLen: p.metaDescription.length, newLen: newMeta.length, newMeta, ok: true });
      console.log(`[${num}] ${p.title}`);
      console.log(`  OLD (${p.metaDescription.length}): "${p.metaDescription}"`);
      console.log(`  NEW (${newMeta.length}): "${newMeta}"`);
      console.log(`  OK\n`);
    } else {
      results.push({ title: p.title, oldLen: p.metaDescription.length, newLen: 0, ok: false, reason: newMeta ? 'too_short' : 'not_parsed' });
      console.log(`[${num}] ${p.title} — FAILED (${newMeta ? 'too short: ' + newMeta.length + ' chars' : 'not parsed'})\n`);
    }
  }

  const fixed = results.filter(r => r.ok).length;
  const lens = results.filter(r => r.ok).map(r => r.newLen);
  console.log(`=== DONE: ${fixed}/${needsFix.length} fixed ===`);
  if (lens.length) console.log(`Lengths: ${Math.min(...lens)}-${Math.max(...lens)}, avg ${Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)}`);

  fs.writeFileSync(path.join(__dirname, 'seo-fix-phase2-results.json'), JSON.stringify(results, null, 2));
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); }).finally(() => prisma.$disconnect());
