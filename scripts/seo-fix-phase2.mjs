#!/usr/bin/env node
// Phase 2 ONLY: AI-rewrite 14 short meta descriptions (< 130 chars)

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function generateMeta(title, desc, price, zai) {
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : 'Contact for price';
  const excerpt = desc.substring(0, 500);

  const prompt = `Write a meta description for an Islamic book product page.

Title: "${title}"
Price: ${priceStr}
Excerpt: "${excerpt}"

RULES:
- EXACTLY 130-155 characters
- Do NOT start with the title
- Include keywords: Islamic books, Pakistan, buy online
- Mention what reader gains
- No publisher brands, no "Bab-ul-Fatah"
- English only
- Return ONLY the meta text, no quotes, no labels`;

  for (let retry = 0; retry < 3; retry++) {
    if (retry > 0) {
      await new Promise(r => setTimeout(r, 5000 + retry * 5000));
    }
    try {
      const comp = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You write perfectly sized SEO meta descriptions. Count characters precisely. Never wrap in quotes or add labels.' },
          { role: 'user', content: prompt }
        ]
      });
      let meta = comp.choices?.[0]?.message?.content?.trim();
      if (!meta) continue;
      meta = meta.replace(/^["']|["']$/g, '').trim();
      if (meta.length >= 120 && meta.length <= 165) return meta;
      console.log(`      (bad len ${meta.length}, retry)`);
    } catch (e) {
      if (e.message?.includes('429')) await new Promise(r => setTimeout(r, 15000));
      else await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

async function main() {
  console.log('=== PHASE 2: Meta Description Rewrite (14 products) ===\n');
  
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

  const zai = await ZAI.create();
  console.log('AI SDK ready\n');

  const results = [];

  for (let i = 0; i < needsFix.length; i++) {
    const p = needsFix[i];
    console.log(`[${i+1}/${needsFix.length}] ${p.title}`);
    console.log(`  OLD (${p.metaDescription.length}): "${p.metaDescription}"`);

    const newMeta = await generateMeta(p.title, p.description, p.price, zai);
    if (newMeta) {
      await prisma.product.update({ where: { id: p.id }, data: { metaDescription: newMeta } });
      results.push({ title: p.title, oldLen: p.metaDescription.length, newLen: newMeta.length, newMeta, ok: true });
      console.log(`  NEW (${newMeta.length}): "${newMeta}"`);
      console.log(`  OK\n`);
    } else {
      results.push({ title: p.title, oldLen: p.metaDescription.length, ok: false });
      console.log(`  FAILED\n`);
    }
    if (i < needsFix.length - 1) await new Promise(r => setTimeout(r, 3000));
  }

  const fixed = results.filter(r => r.ok).length;
  const lens = results.filter(r => r.ok).map(r => r.newLen);
  console.log(`=== DONE: ${fixed}/${needsFix.length} fixed ===`);
  if (lens.length) console.log(`Lengths: ${Math.min(...lens)}-${Math.max(...lens)}, avg ${Math.round(lens.reduce((a,b)=>a+b,0)/lens.length)}`);

  fs.writeFileSync(path.join(__dirname, 'seo-fix-phase2-results.json'), JSON.stringify(results, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
