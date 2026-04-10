#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — Non-AI Brand Cleansing + Meta Description Generator
// ============================================================================
// Uses regex-based brand removal + template-based meta generation
// No AI API calls needed — processes all 143 products instantly.
// ============================================================================

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// ─── Brand Cleansing Engine ───────────────────────────────────────────────

function cleanseBrandMentions(text) {
  if (!text) return text;
  let result = text;
  
  // Remove full publisher names and replace with generic alternatives
  const replacements = [
    // Full publisher names (replace with generic)
    [/\bInternational Islamic Publishing House\b/gi, 'the publisher'],
    [/\bIIPH\s*\(International Islamic Publishing House\)/gi, 'the publisher'],
    [/published by\s+IIPH\b/gi, 'published'],
    [/published by\s+Goodword\s+Books\b/gi, 'published'],
    [/Goodword\s+Books\b/gi, 'This publisher'],
    [/Zamzam\s+Publishers?\b/gi, 'the publisher'],
    [/from\s+Goodword\s+Books/gi, ''],
    [/from\s+IIPH/gi, ''],
    [/by\s+Goodword\s+Books/gi, ''],
    [/by\s+IIPH\b/gi, ''],
    // Standalone brand names (careful context-aware replacement)
    [/\bGoodword\b/g, 'the publisher'],
    [/\bIIPH\b/g, 'the publisher'],
    // Fix double spaces from removals
    [/\s{2,}/g, ' '],
    // Fix "published by the" -> "published by"
    [/published by the publisher\b/g, 'published'],
    // Fix "from the publisher." -> remove trailing "from"
    [/\s*from\s+the publisher\.?\s*/g, '. '],
    // Fix sentences starting with "The publisher" that sound awkward
    [/\.\s+The publisher is\b/g, '. This is'],
    [/\.\s+The publisher has\b/g, '. It has'],
    [/\.\s+The publisher offers\b/g, '. It offers'],
  ];
  
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  // Additional cleanup for common patterns
  result = result
    .replace(/published by the publisher\b/g, 'published')
    .replace(/from the publisher\b/g, '')
    .replace(/\s+the publisher's\b/g, " their")
    .replace(/\bthe publisher\b(?!')/g, 'this renowned publisher')
    // Fix "published published" double word
    .replace(/published published/g, 'published')
    // Fix "This renowned publisher is a" patterns
    .replace(/This renowned publisher is a leading/gi, 'It is a leading')
    // Fix trailing periods
    .replace(/\.\./g, '.')
    // Clean up any remaining awkward phrasing
    .replace(/\s+from\s*$/gm, '')
    .trim();
  
  return result;
}

// ─── Meta Description Template Engine ──────────────────────────────────────

function generateMetaDescription(title, price, description) {
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : '';
  const descLower = (description || '').toLowerCase();
  
  // Detect category from title/description
  let category = 'Islamic';
  let audience = '';
  let feature = '';
  
  if (/quran|tajweed|tafseer|mushaf/i.test(title + descLower)) {
    category = 'Quran';
    if (/children|kids|storybook|activity/i.test(descLower)) { audience = 'children'; feature = 'beautifully illustrated'; }
    else if (/dictionary|reference/i.test(title)) { feature = 'comprehensive reference'; }
    else { feature = 'authentic and reliable'; }
  } else if (/hadith|bukhari|sahih|sunan/i.test(title + descLower)) {
    category = 'Hadith';
    feature = 'authentic narrations with proper chains';
  } else if (/seerah|prophet muhammad|biography|sahab/i.test(title + descLower)) {
    category = 'Seerah';
    feature = 'inspiring and well-researched narratives';
  } else if (/arabic|writing|alphabet|madinah|dictionary/i.test(title + descLower)) {
    category = 'Arabic';
    feature = 'structured progressive lessons';
    audience = 'students and learners';
  } else if (/children|kids|activity|bedtime|stories|coloring|my first/i.test(title + descLower)) {
    category = "Children's Islamic";
    audience = 'young readers';
    feature = 'beautifully illustrated and age-appropriate';
  } else if (/fiqh|salah|prayer|worship|pillars|tawheed/i.test(title + descLower)) {
    category = 'Fiqh';
    feature = 'based on authentic Islamic sources';
  } else if (/women|muslimah|wife|wives|marriage/i.test(title + descLower)) {
    category = "Women's Islamic";
    audience = 'Muslim women';
  } else if (/character|therapy|psychology|don'?t be sad|emotion/i.test(title + descLower)) {
    category = 'Islamic Self-Help';
    feature = 'spiritual and practical guidance';
  } else if (/dawah|dialogue|christian|misconception/i.test(title + descLower)) {
    category = 'Dawah';
    feature = 'well-researched and informative';
  } else if (/ghazali|revival|scholarly/i.test(title + descLower)) {
    category = 'Islamic Scholarship';
    feature = 'authored by renowned scholars';
  } else if (/death|resurrection|grave|hereafter|inevitable/i.test(title + descLower)) {
    category = 'Hereafter';
    feature = 'based on authentic Islamic sources';
  } else if (/islamic studies|course/i.test(title + descLower)) {
    category = 'Islamic Studies';
    feature = 'comprehensive and well-structured';
    audience = 'students';
  }
  
  // Build meta description templates (130-155 chars target)
  const templates = [
    // Template 1: Category + feature + price
    () => {
      const base = `Buy ${title} online in Pakistan at ${priceStr}.`;
      const rest = feature ? ` ${capitalize(feature)}.` : '';
      return truncate(base + rest, 155);
    },
    // Template 2: Benefit-focused
    () => {
      const base = `Shop ${title} — a ${category.toLowerCase()} book with ${feature || 'valuable content'}.`;
      const rest = ` Available at ${priceStr} with delivery.`;
      return truncate(base + rest, 155);
    },
    // Template 3: Audience-focused
    () => {
      const aud = audience ? ` ${capitalize(audience)}` : '';
      const base = `${title}${aud}: ${feature || 'A must-have Islamic book'}.`;
      const rest = ` Order at ${priceStr} across Pakistan.`;
      return truncate(base + rest, 155);
    },
    // Template 4: Direct commerce
    () => {
      const base = `Order ${title} at ${priceStr}.`;
      const rest = ` ${capitalize(feature || 'Authentic Islamic literature')} for your collection.`;
      return truncate(base + rest, 155);
    },
  ];
  
  // Try templates until we get one in the 130-155 range
  for (const tpl of templates) {
    const meta = tpl();
    if (meta.length >= 130 && meta.length <= 155) return meta;
  }
  
  // Fallback: use the best template and pad/trim
  const best = templates[0]();
  if (best.length > 155) return best.substring(0, 152) + '...';
  if (best.length < 130) {
    // Add more detail
    return truncate(`Discover ${title} at ${priceStr}. ${feature || 'Authentic Islamic book'} with fast delivery across Pakistan.`, 155);
  }
  return best;
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3).replace(/\s+[^\s]*$/, '') + '...';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Main Pipeline ───────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(70));
  console.log('  Bab-ul-Fatah — Brand Cleansing + Meta Description Pipeline');
  console.log('  (Non-AI, regex + template based)');
  console.log('='.repeat(70));

  const allProducts = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { id: true, title: true, slug: true, price: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  console.log(`\nTotal products: ${allProducts.length}`);
  const gw = allProducts.filter(p => p.slug.startsWith('goodword-'));
  const iiph = allProducts.filter(p => p.slug.startsWith('iiph-'));
  console.log(`  Goodword: ${gw.length}`);
  console.log(`  IIPH: ${iiph.length}`);

  // ── Stage 1: Brand Cleansing ──
  console.log('\n' + '-'.repeat(70));
  console.log('  STAGE 1: Brand Cleansing');
  console.log('-'.repeat(70));

  const branded = allProducts.filter(p =>
    p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i) ||
    p.description?.match(/International Islamic Publishing House/i) ||
    p.description?.match(/Zamzam Publishers/i)
  );
  console.log(`Products with competitor brands: ${branded.length}`);

  let cleanseOk = 0, cleanseStillBranded = 0;
  for (const p of branded) {
    const oldDesc = p.description;
    const newDesc = cleanseBrandMentions(oldDesc);
    const stillBranded = newDesc.match(/\bGoodword\b/i) || newDesc.match(/\bIIPH\b/i) ||
      newDesc.match(/International Islamic Publishing House/i);
    
    if (!stillBranded) {
      await prisma.product.update({ where: { id: p.id }, data: { description: newDesc } });
      cleanseOk++;
      const delta = newDesc.length - oldDesc.length;
      process.stdout.write(`  [OK] ${p.title.substring(0, 48).padEnd(48)} (${delta > 0 ? '+' : ''}${delta}c)\n`);
    } else {
      cleanseStillBranded++;
      process.stdout.write(`  [STILL] ${p.title.substring(0, 48).padEnd(48)}\n`);
    }
  }
  console.log(`\n  Cleansed: ${cleanseOk}, Still branded: ${cleanseStillBranded}`);

  // ── Stage 2: Meta Description Generation ──
  console.log('\n' + '-'.repeat(70));
  console.log('  STAGE 2: Meta Description Generation');
  console.log('-'.repeat(70));

  const needsMeta = allProducts.filter(p => !p.metaDescription || p.metaDescription.length < 100);
  console.log(`Products needing meta: ${needsMeta.length}`);

  let metaOk = 0, metaShort = 0, metaLong = 0;
  for (const p of needsMeta) {
    const meta = generateMetaDescription(p.title, p.price, p.description);
    await prisma.product.update({ where: { id: p.id }, data: { metaDescription: meta } });
    if (meta.length < 120) { metaShort++; }
    else if (meta.length > 165) { metaLong++; }
    else { metaOk++; }
    process.stdout.write(`  [${meta.length}c] ${p.title.substring(0, 44).padEnd(44)}\n`);
  }
  console.log(`\n  In range (120-165): ${metaOk}, Short: ${metaShort}, Long: ${metaLong}`);

  // ── Stage 3: Audit ──
  console.log('\n' + '-'.repeat(70));
  console.log('  STAGE 3: FINAL AUDIT');
  console.log('-'.repeat(70));

  // Re-fetch all products after updates
  const final = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { title: true, slug: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  const issues = [];

  // Check 1: No empty descriptions
  const emptyDesc = final.filter(p => !p.description || p.description.trim().length < 200);
  if (emptyDesc.length > 0) {
    issues.push(`EMPTY DESCRIPTIONS: ${emptyDesc.length}`);
    emptyDesc.forEach(p => issues.push(`  - ${p.title}: ${p.description?.length || 0}c`));
  }

  // Check 2: No short descriptions
  const shortDesc = final.filter(p => (p.description?.length || 0) < 1000);
  if (shortDesc.length > 0) {
    issues.push(`SHORT DESCRIPTIONS (<1000c): ${shortDesc.length}`);
    shortDesc.forEach(p => issues.push(`  - ${p.title}: ${p.description?.length || 0}c`));
  }

  // Check 3: No competitor brands in descriptions
  const brandedDesc = final.filter(p =>
    p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i)
  );
  if (brandedDesc.length > 0) {
    issues.push(`COMPETITOR BRANDS: ${brandedDesc.length}`);
    brandedDesc.forEach(p => {
      const b = [];
      if (p.description?.match(/\bGoodword\b/i)) b.push('Goodword');
      if (p.description?.match(/\bIIPH\b/i)) b.push('IIPH');
      issues.push(`  - ${p.title} [${b.join(',')}]`);
    });
  }

  // Check 4: All have meta descriptions
  const noMeta = final.filter(p => !p.metaDescription || p.metaDescription.length < 50);
  if (noMeta.length > 0) {
    issues.push(`MISSING META: ${noMeta.length}`);
    noMeta.forEach(p => issues.push(`  - ${p.title}`));
  }

  // Check 5: Meta description lengths
  const badMeta = final.filter(p => {
    const l = p.metaDescription?.length || 0;
    return l >= 50 && (l < 120 || l > 165);
  });
  if (badMeta.length > 0) {
    issues.push(`META LENGTH OUT OF RANGE: ${badMeta.length}`);
    badMeta.forEach(p => issues.push(`  - ${p.title}: ${p.metaDescription?.length || 0}c`));
  }

  // Check 6: No competitor brands in meta
  const brandMeta = final.filter(p =>
    p.metaDescription?.match(/\bGoodword\b/i) || p.metaDescription?.match(/\bIIPH\b/i)
  );
  if (brandMeta.length > 0) {
    issues.push(`BRANDS IN META: ${brandMeta.length}`);
    brandMeta.forEach(p => issues.push(`  - ${p.title}: ${p.metaDescription}`));
  }

  // Summary
  const descLens = final.map(p => p.description?.length || 0);
  const metaLens = final.filter(p => p.metaDescription).map(p => p.metaDescription?.length || 0);

  console.log(`\n  Products: ${final.length}`);
  console.log(`  Description avg: ${Math.round(descLens.reduce((a,b)=>a+b,0)/descLens.length)}c (min: ${Math.min(...descLens)}, max: ${Math.max(...descLens)})`);
  console.log(`  Meta descriptions: ${metaLens.length}/${final.length}`);
  console.log(`  Meta avg: ${metaLens.length > 0 ? Math.round(metaLens.reduce((a,b)=>a+b,0)/metaLens.length) : 0}c`);

  if (issues.length === 0) {
    console.log('\n  ✓ ALL CHECKS PASSED!');
  } else {
    console.log(`\n  ✗ ISSUES FOUND: ${issues.length}`);
    issues.forEach(i => console.log(`    ${i}`));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Total time: ${elapsed}s`);

  // Show first 5 product samples
  console.log('\n' + '-'.repeat(70));
  console.log('  SAMPLE OUTPUT (First 5 products):');
  console.log('-'.repeat(70));
  for (const p of final.slice(0, 5)) {
    console.log(`\n  ► ${p.title}`);
    console.log(`    Description (${p.description?.length || 0}c): ${p.description?.substring(0, 150)}...`);
    console.log(`    Meta (${p.metaDescription?.length || 0}c): ${p.metaDescription || '(none)'}`);
  }
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
