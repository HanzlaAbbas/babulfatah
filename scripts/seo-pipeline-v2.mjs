#!/usr/bin/env node
// Bab-ul-Fatah SEO Pipeline — Resilient Background Runner
// Handles rate limits with aggressive retry logic and process keepalive

process.on('unhandledRejection', (r) => {
  const msg = (typeof r === 'string' ? r : r?.message) || 'unknown';
  fs.appendFileSync(LOG, `[${new Date().toISOString()}] UNHANDLED: ${msg.substring(0,100)}\n`);
});

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const LOG = path.join(__dirname, 'seo-pipeline-bg.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  fs.appendFileSync(LOG, line + '\n');
}

// Keepalive timer prevents process from being killed
setInterval(() => fs.appendFileSync(LOG, `.[${new Date().toISOString()}] heartbeat\n`), 30000);

async function safeAI(zai, system, user, maxRetries = 5) {
  for (let r = 0; r < maxRetries; r++) {
    // Progressive backoff: 15s, 30s, 60s, 90s, 120s
    if (r > 0) {
      const wait = 15000 * r;
      log(`  Retry ${r}/${maxRetries-1} (waiting ${wait/1000}s)...`);
      await new Promise(x => setTimeout(x, wait));
    }
    try {
      const c = await zai.chat.completions.create({
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
      });
      const text = c.choices?.[0]?.message?.content?.trim();
      return text || null;
    } catch (e) {
      log(`  API err (${r+1}/${maxRetries}): ${e.message?.substring(0, 80)}`);
    }
  }
  return null;
}

function clean(t) { return t ? t.replace(/\*\*/g, '').replace(/^#+\s/gm, '').trim() : ''; }

async function main() {
  log('=== PIPELINE START ===');
  
  // Initial cooldown
  log('Cooldown 90s...');
  await new Promise(x => setTimeout(x, 90000));
  
  const zai = await ZAI.create();
  log('SDK ready');

  // ── CLEANSE ──
  const branded = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { id: true, title: true, description: true },
    orderBy: { title: 'asc' }
  }).then(all => all.filter(p => p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i)));

  log(`Cleanse: ${branded.length} branded products`);
  
  const cleanseSys = `You are an expert Islamic commerce copywriter. Rewrite product descriptions to remove ALL competitor brand names while keeping ALL factual content and Islamic references intact.
RULES:
- Remove EVERY instance of: "Goodword", "Goodword Books", "IIPH", "International Islamic Publishing House", "Zamzam Publishers"
- Replace brand mentions with generic phrases or simply remove them
- Do NOT add any store branding
- Keep the same length (1,200-2,000 chars), structure, and bullet points
- Keep ALL Islamic content exactly as-is
- English only, no emojis, no markdown`;

  let cOk = 0, cFail = 0;
  for (let i = 0; i < branded.length; i++) {
    const p = branded[i];
    log(`[${i+1}/${branded.length}] ${p.title.substring(0, 44)}`);
    try {
      const raw = await safeAI(zai, cleanseSys,
        `Rewrite this description removing all competitor brands (Goodword, IIPH, Zamzam Publishers):\n\nTitle: "${p.title}"\n\n"""\n${p.description}\n"""`);
      const desc = clean(raw);
      if (desc && desc.length >= 500 && !desc.match(/\bGoodword\b/i) && !desc.match(/\bIIPH\b/i)) {
        await prisma.product.update({ where: { id: p.id }, data: { description: desc } });
        cOk++;
        log(`  OK ${desc.length}c`);
      } else {
        cFail++;
        log(`  FAIL ${desc?.length || 0}c`);
      }
    } catch (e) {
      cFail++;
      log(`  ERR: ${e.message?.substring(0, 50)}`);
    }
    await new Promise(x => setTimeout(x, 4000));
  }
  log(`Cleanse: ${cOk} OK, ${cFail} FAIL`);

  // ── META ──
  const allP = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { id: true, title: true, price: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });
  const needMeta = allP.filter(p => !p.metaDescription || p.metaDescription.length < 100);
  log(`Meta: ${needMeta.length} need meta`);

  const metaSys = `You are an SEO expert. Generate a meta description. EXACTLY 130-155 characters. No quotes. No emojis. No hashtags. No brand names. One or two compelling sentences.`;

  let mOk = 0, mFail = 0;
  for (let i = 0; i < needMeta.length; i++) {
    const p = needMeta[i];
    log(`[${i+1}/${needMeta.length}] ${p.title.substring(0, 44)}`);
    try {
      const raw = await safeAI(zai, metaSys,
        `Title: "${p.title}"\nPrice: Rs. ${Math.round(p.price)}\nDesc: ${(p.description||'').substring(0, 400)}\n\nMeta description only. 130-155 chars. One line.`);
      let meta = clean(raw)?.replace(/^["']|["']$/g, '').trim();
      if (meta && meta.length >= 120 && meta.length <= 165 && !meta.match(/\bGoodword\b/i) && !meta.match(/\bIIPH\b/i)) {
        if (meta.length > 155) meta = meta.substring(0, 155).replace(/\s+[^\s]*$/, '');
        await prisma.product.update({ where: { id: p.id }, data: { metaDescription: meta } });
        mOk++;
        log(`  OK ${meta.length}c`);
      } else {
        mFail++;
        log(`  FAIL ${meta?.length || 0}c`);
      }
    } catch (e) {
      mFail++;
      log(`  ERR: ${e.message?.substring(0, 50)}`);
    }
    await new Promise(x => setTimeout(x, 4000));
  }
  log(`Meta: ${mOk} OK, ${mFail} FAIL`);

  // ── AUDIT ──
  const final = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { title: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });
  const empty = final.filter(p => !p.description || p.description.length < 500);
  const brands = final.filter(p => p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i));
  const noMeta = final.filter(p => !p.metaDescription || p.metaDescription.length < 100);
  const avgLen = Math.round(final.reduce((s,p) => s + (p.description?.length||0), 0) / final.length);

  log('=== AUDIT ===');
  log(`Products: ${final.length}`);
  log(`Empty desc: ${empty.length}`);
  log(`Branded desc: ${brands.length}`);
  log(`No meta: ${noMeta.length}`);
  log(`Avg desc: ${avgLen}c`);
  brands.forEach(p => log(`  BRAND: ${p.title}`));
  log(empty.length + brands.length + noMeta.length === 0 ? 'ALL PASSED' : 'ISSUES FOUND');
  log('=== DONE ===');
  process.exit(0);
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
