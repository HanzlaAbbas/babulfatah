#!/usr/bin/env node
// Phase 2: Template-based meta description rewrite (no AI needed)
// Generates 130-155 char SEO meta descriptions programmatically

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function detectCategory(title, desc) {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  if (/tafseer|tafsir|mushaf|tajweed|quran/.test(text)) return 'Quran';
  if (/hadith|sahih|bukhari|sunan|ahadith/.test(text)) return 'Hadith';
  if (/seerah|prophet muhammad|biography|sahab[ai]|companion|mercy to humanity/.test(text)) return 'Seerah';
  if (/arabic|alphabet|writing|madinah|dictionary|spoken/.test(text)) return 'Arabic';
  if (/children|kids|activity|bedtime|stories|storybook|coloring|fun with|my first/.test(text)) return 'children';
  if (/fiqh|salah|prayer|worship|pillars|fundamentals|creed|aqeedah|tawheed|shahadah|sunnah/.test(text)) return 'Fiqh';
  if (/women|woman|female|sisters|marriage|muslimah|home/.test(text)) return 'women';
  if (/character|self.?help|don.?t be sad|tolerance|emotion|steadfast/.test(text)) return 'self-help';
  if (/dawah|dialogue|christian|misconception|civilization/.test(text)) return 'Dawah';
  if (/ghazali|revival|religious sciences|scholarly/.test(text)) return 'scholarly';
  if (/death|resurrection|grave|hereafter|inevitable|hour|day of judge|jin|devil/.test(text)) return 'Hereafter';
  if (/islamic studies|course|curriculum|guide|reference/.test(text)) return 'Education';
  return 'Islamic';
}

function generateMetaDescription(product) {
  const title = product.title;
  const price = product.price;
  const desc = product.description;
  const cat = detectCategory(title, desc);
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : '';

  // Extract key themes from description
  const descLower = desc.toLowerCase();
  let focusArea = '';
  let benefit = '';

  if (/women|female|sisters|marriage|home|family/i.test(title)) {
    focusArea = 'Muslim women';
    benefit = 'practical Islamic guidance';
  } else if (/children|kids|story|bedtime|activity/i.test(title)) {
    focusArea = 'young Muslims';
    benefit = 'Islamic values and knowledge';
  } else if (/fiqh|salah|prayer|worship|tahaarah|janaa/i.test(title)) {
    focusArea = 'practicing Muslims';
    benefit = 'authentic Islamic rulings';
  } else if (/hadith|sahih|narration|chain/i.test(title)) {
    focusArea = 'Hadith enthusiasts';
    benefit = 'authentic Prophetic traditions';
  } else if (/aqeedah|tawheed|creed|fundamental/i.test(title)) {
    focusArea = 'seekers of knowledge';
    benefit = 'essential Islamic creed';
  } else if (/seerah|prophet|biography|sahabah|mercy/i.test(title)) {
    focusArea = 'readers of Islamic history';
    benefit = 'inspiring life lessons';
  } else if (/arabic|writing|dictionary|reading/i.test(title)) {
    focusArea = 'Arabic learners';
    benefit = 'essential language skills';
  } else if (/hereafter|death|grave|hour|jin|devil|predestination/i.test(title)) {
    focusArea = 'seekers of spiritual depth';
    benefit = 'profound Islamic insights';
  } else if (/dawah|christian|misconception|interaction/i.test(title)) {
    focusArea = 'interfaith engagement';
    benefit = 'balanced Islamic perspectives';
  } else if (/ghazali|revival|scholarly/i.test(title)) {
    focusArea = 'serious students of knowledge';
    benefit = 'classical Islamic scholarship';
  } else if (/character|development|psychology|self/i.test(title)) {
    focusArea = 'personal development';
    benefit = 'character refinement through Islamic wisdom';
  } else if (/dua|supplication|daily/i.test(title)) {
    focusArea = 'daily Islamic practice';
    benefit = 'meaningful supplications';
  } else {
    focusArea = 'Islamic knowledge seekers';
    benefit = 'authentic Islamic literature';
  }

  // Extract author if present in description
  const authorMatch = desc.match(/by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  const author = authorMatch ? authorMatch[1] : '';

  // Extract format
  const format = /\(H\.B\)/.test(title) ? 'hardcover' : /\(P\.B\)/.test(title) ? 'paperback' : '';

  // Build meta - multiple templates to choose from
  const templates = [
    // Template 1: Focus + benefit + CTA
    () => {
      let m = `Shop ${cat} books online in Pakistan. ${title} offers ${benefit} for ${focusArea}.`;
      if (priceStr) m += ` ${priceStr}.`;
      return m;
    },
    // Template 2: Benefit-led
    () => {
      let m = `Discover authentic ${cat.toLowerCase()} literature at Pakistan's trusted Islamic bookstore. ${title} delivers ${benefit}.`;
      if (priceStr) m += ` ${priceStr}.`;
      return m;
    },
    // Template 3: Keyword-rich
    () => {
      let m = `Buy ${title} online across Pakistan. A must-have ${cat.toLowerCase()} book providing ${benefit}.`;
      if (priceStr) m += ` ${priceStr}.`;
      return m;
    },
    // Template 4: Audience-focused
    () => {
      let m = `Essential ${cat.toLowerCase()} reading for ${focusArea}. ${title} provides ${benefit} with authentic Islamic sources.`;
      if (priceStr) m += ` Order at ${priceStr}.`;
      return m;
    },
    // Template 5: Author-focused (if author available)
    () => {
      if (!author) return null;
      let m = `${author}'s ${title} offers ${benefit}. Buy this ${cat.toLowerCase()} book online in Pakistan.`;
      if (priceStr) m += ` ${priceStr}.`;
      return m;
    }
  ];

  // Generate all candidates and pick the best one (closest to 145 chars)
  let bestMeta = '';
  let bestScore = Infinity;
  const targetLen = 145;

  for (const tmpl of templates) {
    try {
      const candidate = tmpl();
      if (!candidate) continue;
      const len = candidate.length;
      if (len >= 130 && len <= 155) {
        const score = Math.abs(len - targetLen);
        if (score < bestScore) {
          bestScore = score;
          bestMeta = candidate;
        }
      }
    } catch (e) { /* skip failed template */ }
  }

  // If no template hits the sweet spot, try adjusting the best candidate
  if (!bestMeta) {
    // Try all candidates and pick the closest to range
    for (const tmpl of templates) {
      try {
        const candidate = tmpl();
        if (!candidate) continue;
        const len = candidate.length;
        if (len >= 120 && len <= 165) {
          const score = Math.abs(len - targetLen);
          if (score < bestScore) {
            bestScore = score;
            bestMeta = candidate;
          }
        }
      } catch (e) { /* skip */ }
    }
  }

  // Trim or pad if slightly out of range
  if (bestMeta) {
    if (bestMeta.length > 155) {
      bestMeta = bestMeta.substring(0, 153) + '..';
    }
  }

  return bestMeta;
}

async function main() {
  console.log('=== PHASE 2: Template-Based Meta Description Rewrite ===\n');

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

  const results = [];
  let fixed = 0;

  for (const p of needsFix) {
    const newMeta = generateMetaDescription(p);

    if (newMeta && newMeta.length >= 125) {
      await prisma.product.update({
        where: { id: p.id },
        data: { metaDescription: newMeta }
      });
      results.push({ title: p.title, oldLen: p.metaDescription.length, newLen: newMeta.length, newMeta, ok: true });
      console.log(`[OK] ${p.title}`);
      console.log(`  OLD (${p.metaDescription.length}): "${p.metaDescription}"`);
      console.log(`  NEW (${newMeta.length}): "${newMeta}"\n`);
      fixed++;
    } else {
      results.push({ title: p.title, oldLen: p.metaDescription.length, ok: false });
      console.log(`[FAIL] ${p.title} — generated: "${newMeta?.substring(0, 50)}..."\n`);
    }
  }

  console.log(`=== DONE: ${fixed}/${needsFix.length} fixed ===`);

  const lens = results.filter(r => r.ok).map(r => r.newLen);
  if (lens.length) {
    console.log(`Length range: ${Math.min(...lens)}-${Math.max(...lens)}`);
    console.log(`Average: ${Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)}`);
  }

  fs.writeFileSync(path.join(__dirname, 'seo-fix-phase2-results.json'), JSON.stringify(results, null, 2));
  console.log(`\nResults saved to scripts/seo-fix-phase2-results.json`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
