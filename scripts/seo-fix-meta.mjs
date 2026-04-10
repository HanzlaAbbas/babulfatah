#!/usr/bin/env node
// Fix meta descriptions: regenerate short ones + remove brand names
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function generateMeta(title, price, description) {
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : '';
  const d = (description || '').toLowerCase();
  
  // Category detection
  let cat = 'Islamic book', feature = 'authentic content';
  if (/quran|tajweed|tafseer/i.test(title + d)) { cat = 'Quran'; feature = 'beautifully illustrated Islamic content'; }
  else if (/hadith|bukhari|sahih/i.test(title + d)) { cat = 'Hadith collection'; feature = 'authentic narrations with chains'; }
  else if (/seerah|prophet muhammad|sahab/i.test(title + d)) { cat = 'Seerah'; feature = 'inspiring Islamic history narratives'; }
  else if (/arabic|writing|madinah|dictionary/i.test(title + d)) { cat = 'Arabic learning'; feature = 'structured lessons for effective learning'; }
  else if (/children|kids|bedtime|activity|stories|coloring|my first/i.test(title + d)) { cat = "children's Islamic"; feature = 'engaging illustrations for young learners'; }
  else if (/fiqh|salah|prayer|tawheed|pillars/i.test(title + d)) { cat = 'Islamic jurisprudence'; feature = 'clear guidance from authentic sources'; }
  else if (/women|muslimah|wives|marriage/i.test(title + d)) { cat = "women's Islamic"; feature = 'valuable guidance for Muslim women'; }
  else if (/don'?t be sad|psychology|therapy|emotion|character/i.test(title + d)) { cat = 'Islamic self-help'; feature = 'spiritual wisdom for personal growth'; }
  else if (/dawah|dialogue|misconception|civilization/i.test(title + d)) { cat = 'Islamic dawah'; feature = 'well-researched informative content'; }
  else if (/ghazali|revival|scholarly/i.test(title + d)) { cat = 'Islamic scholarship'; feature = 'renowned scholarly work'; }
  else if (/death|resurrection|grave|hereafter/i.test(title + d)) { cat = 'Islamic hereafter'; feature = 'important reminders about the afterlife'; }
  else if (/islamic studies|course/i.test(title + d)) { cat = 'Islamic studies'; feature = 'comprehensive curriculum content'; }

  // Multiple template variants - pick one that fits 130-155 chars
  const templates = [
    `Shop ${title} online in Pakistan at ${priceStr}. ${cap(feature)} for your ${cat.toLowerCase()} collection. Fast nationwide delivery.`,
    `Order ${title} at ${priceStr}. This ${cat.toLowerCase()} offers ${feature}. Buy online with delivery across Pakistan.`,
    `${title} — ${cap(feature)}. Get your copy at ${priceStr} with fast delivery across Pakistan today.`,
    `Buy ${title} at ${priceStr}. A premium ${cat.toLowerCase()} with ${feature}. Order online for delivery across Pakistan.`,
    `${title} at ${priceStr}. Explore ${feature} in this ${cat.toLowerCase()}. Shop online with delivery across Pakistan.`,
  ];
  
  // Pick the best fitting one
  let best = templates[0];
  for (const t of templates) {
    if (t.length >= 130 && t.length <= 155) { best = t; break; }
  }
  // Adjust if too long or short
  if (best.length > 155) best = best.substring(0, 153).replace(/\s+[^\s]*$/, '');
  if (best.length < 130) best = `${title} at ${priceStr}. ${cap(feature)}. Shop ${cat.toLowerCase()} online with delivery across Pakistan.`;
  if (best.length > 155) best = best.substring(0, 153).replace(/\s+[^\s]*$/, '');
  return best;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

async function main() {
  const all = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { id: true, title: true, price: true, description: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  let regenCount = 0;
  for (const p of all) {
    const meta = p.metaDescription || '';
    const needsRegen = 
      meta.length < 120 || 
      meta.length > 165 ||
      meta.match(/\bGoodword\b/i) || 
      meta.match(/\bIIPH\b/i) ||
      meta.match(/\bBab-ul-Fatah\b/i);
    
    if (needsRegen) {
      const newMeta = generateMeta(p.title, p.price, p.description);
      await prisma.product.update({ where: { id: p.id }, data: { metaDescription: newMeta } });
      process.stdout.write(`[${String(newMeta.length).padStart(3)}c] ${p.title.substring(0, 50).padEnd(50)} (was: ${meta.length}c)\n`);
      regenCount++;
    }
  }
  console.log(`\nRegenerated: ${regenCount} meta descriptions`);

  // Final audit
  const final = await prisma.product.findMany({
    where: { OR: [{ slug: { startsWith: 'goodword-' } }, { slug: { startsWith: 'iiph-' } }] },
    select: { title: true, description: true, metaDescription: true },
  });
  const brands = final.filter(p => p.description?.match(/\bGoodword\b/i) || p.description?.match(/\bIIPH\b/i));
  const metaBrands = final.filter(p => p.metaDescription?.match(/\bGoodword\b/i) || p.metaDescription?.match(/\bIIPH\b/i));
  const shortMeta = final.filter(p => p.metaDescription && p.metaDescription.length < 120);
  const longMeta = final.filter(p => p.metaDescription && p.metaDescription.length > 165);
  const avgMeta = Math.round(final.filter(p => p.metaDescription).reduce((s,p) => s + (p.metaDescription?.length || 0), 0) / final.length);

  console.log(`\nFINAL AUDIT:`);
  console.log(`  Products: ${final.length}`);
  console.log(`  Brand in descriptions: ${brands.length}`);
  console.log(`  Brand in meta: ${metaBrands.length}`);
  console.log(`  Short meta (<120): ${shortMeta.length}`);
  console.log(`  Long meta (>165): ${longMeta.length}`);
  console.log(`  Meta avg: ${avgMeta}c`);
  console.log(brands.length + metaBrands.length + shortMeta.length + longMeta.length === 0 ? '  ALL PASSED!' : '  ISSUES REMAIN');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
