#!/usr/bin/env node
// Background runner: processes ALL remaining cleanse + meta + audit
// Writes progress to seo-pipeline-bg.log
import { PrismaClient } from '@prisma/client';
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const LOG = path.join(__dirname, 'seo-pipeline-bg.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  process.stdout.write(line + '\n');
  fs.appendFileSync(LOG, line + '\n');
}

async function callAI(zai, system, user) {
  for (let r = 0; r < 3; r++) {
    if (r > 0) { log('  retry ' + r + ' (waiting 30s)...'); await new Promise(x => setTimeout(x, 30000)); }
    try {
      const c = await zai.chat.completions.create({ messages: [{ role: 'system', content: system }, { role: 'user', content: user }] });
      return c.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      log(`  API error (attempt ${r+1}/3): ${e.message?.substring(0, 80)}`);
      if (r < 2) { await new Promise(x => setTimeout(x, 30000)); }
    }
  }
  return null;
}

function clean(t) { return t ? t.replace(/\*\*/g, '').replace(/^#+\s/gm, '').trim() : ''; }

process.on('unhandledRejection', (reason) => { log('UNHANDLED: ' + reason?.message || reason); });

async function main() {
  log('=== PIPELINE START ===');
  log('Waiting 60s for rate limit cooldown...');
  await new Promise(x => setTimeout(x, 60000));
  const zai = await ZAI.create();
  log('AI SDK ready');

  // ── Get branded products ──
  const branded = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } },
      ]
    },
    select: { id: true, title: true, slug: true, description: true },
    orderBy: { title: 'asc' }
  }).then(all => all.filter(p => p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i)));

  log(`Branded products: ${branded.length}`);

  // ── Cleanse all branded products ──
  const cleanseSys = `You are an expert Islamic commerce copywriter. Rewrite product descriptions to remove ALL competitor brand names while keeping ALL factual content and Islamic references intact.
RULES:
- Remove EVERY instance of: "Goodword", "Goodword Books", "IIPH", "International Islamic Publishing House", "Zamzam Publishers"
- Replace brand mentions with generic phrases or simply remove them
- Do NOT add any store branding
- Keep the same length (1,200-2,000 chars), structure, and bullet points
- Keep ALL Islamic content, Quran/Hadith references exactly as-is
- English only, no emojis, no markdown`;

  let cleansed = 0, cleanseFail = 0;
  for (let i = 0; i < branded.length; i++) {
    const p = branded[i];
    log(`[${i+1}/${branded.length}] Cleanse: ${p.title.substring(0, 45)}`);
    const user = `Rewrite this description to remove all competitor brand names:\n\nTitle: "${p.title}"\n\n"""\n${p.description}\n"""\n\nRemove: Goodword, IIPH, International Islamic Publishing House, Zamzam Publishers. Keep everything else.`;
    try {
      const raw = await callAI(zai, cleanseSys, user);
      const desc = clean(raw);
      if (desc && desc.length >= 500 && !desc.match(/\bGoodword\b/i) && !desc.match(/\bIIPH\b/i)) {
        await prisma.product.update({ where: { id: p.id }, data: { description: desc } });
        cleansed++;
        log(`  OK (${desc.length}c)`);
      } else {
        cleanseFail++;
        log(`  FAIL (brand still present or too short: ${desc?.length || 0}c)`);
      }
    } catch (e) {
      cleanseFail++;
      log(`  ERROR: ${e.message?.substring(0, 60)}`);
    }
    await new Promise(x => setTimeout(x, 5000));
  }
  log(`Cleanse complete: ${cleansed} OK, ${cleanseFail} failed`);

  // ── Generate meta descriptions ──
  const allProducts = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { id: true, title: true, slug: true, price: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });
  const needsMeta = allProducts.filter(p => !p.metaDescription || p.metaDescription.length < 100);
  log(`Products needing meta: ${needsMeta.length}`);

  const metaSys = `You are an SEO expert for an Islamic bookstore. Generate a meta description.
CRITICAL: EXACTLY 130-155 characters. No quotes. No emojis. No hashtags. No competitor brand names.
Include keywords naturally. One or two compelling sentences about the book's value.`;

  let metaOk = 0, metaFail = 0;
  for (let i = 0; i < needsMeta.length; i++) {
    const p = needsMeta[i];
    log(`[${i+1}/${needsMeta.length}] Meta: ${p.title.substring(0, 45)}`);
    const excerpt = (p.description || '').substring(0, 500);
    const user = `Title: "${p.title}"\nPrice: Rs. ${Math.round(p.price)}\nDescription: ${excerpt}\n\nGenerate ONLY a meta description. 130-155 characters. One line. No quotes.`;
    try {
      const raw = await callAI(zai, metaSys, user);
      let meta = clean(raw)?.replace(/^["']|["']$/g, '').trim();
      if (meta && meta.length >= 120 && meta.length <= 165 && !meta.match(/\bGoodword\b/i) && !meta.match(/\bIIPH\b/i)) {
        if (meta.length > 155) meta = meta.substring(0, 155).replace(/\s+[^\s]*$/, '');
        await prisma.product.update({ where: { id: p.id }, data: { metaDescription: meta } });
        metaOk++;
        log(`  OK (${meta.length}c)`);
      } else {
        metaFail++;
        log(`  FAIL (${meta?.length || 0}c: ${meta?.substring(0, 50) || 'empty'})`);
      }
    } catch (e) {
      metaFail++;
      log(`  ERROR: ${e.message?.substring(0, 60)}`);
    }
    await new Promise(x => setTimeout(x, 5000));
  }
  log(`Meta complete: ${metaOk} OK, ${metaFail} failed`);

  // ── Final audit ──
  const final = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { title: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });
  const emptyDesc = final.filter(p => !p.description || p.description.length < 500);
  const brandedDesc = final.filter(p => p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i));
  const noMeta = final.filter(p => !p.metaDescription || p.metaDescription.length < 100);
  const badMetaLen = final.filter(p => { const l = p.metaDescription?.length || 0; return l >= 100 && (l < 120 || l > 165); });
  const descLens = final.map(p => p.description?.length || 0);

  log('=== FINAL AUDIT ===');
  log(`Total products: ${final.length}`);
  log(`Empty/short descriptions: ${emptyDesc.length}`);
  log(`Competitor brands in descriptions: ${brandedDesc.length}`);
  log(`Missing meta descriptions: ${noMeta.length}`);
  log(`Meta length out of range: ${badMetaLen.length}`);
  log(`Description avg length: ${Math.round(descLens.reduce((a,b)=>a+b,0)/descLens.length)} chars`);
  if (brandedDesc.length > 0) {
    brandedDesc.forEach(p => {
      const brands = [];
      if (p.description?.match(/\bGoodword\b/i)) brands.push('Goodword');
      if (p.description?.match(/\bIIPH\b/i)) brands.push('IIPH');
      log(`  BRANDED: ${p.title} [${brands.join(',')}]`);
    });
  }
  const allOk = emptyDesc.length === 0 && brandedDesc.length === 0 && noMeta.length === 0 && badMetaLen.length === 0;
  log(allOk ? 'ALL CHECKS PASSED!' : 'ISSUES FOUND - see above');
  log('=== PIPELINE END ===');
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); }).finally(() => prisma.$disconnect());
