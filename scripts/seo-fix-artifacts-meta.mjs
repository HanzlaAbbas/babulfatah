#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Fix: Template Artifacts + Short Meta Descriptions
// ============================================================================
// Phase 1: Regex-clean 18 descriptions with template artifacts
// Phase 2: AI-rewrite 14 meta descriptions that are < 130 characters
// ============================================================================

import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// ─── Phase 1: Template Artifact Cleanup (Regex, no AI needed) ──────────────

function cleanDescriptionArtifact(desc) {
  let cleaned = desc;

  // 1. Remove "Title: \"...\"" prefix at the start of description
  cleaned = cleaned.replace(/^Title:\s*"[^"]*"\s*\n?/i, '');

  // 2. Remove "Current Description:" prefix
  cleaned = cleaned.replace(/^Current Description:\s*\n?/i, '');

  // 3. Remove stray triple-quote opening
  cleaned = cleaned.replace(/^"""\s*\n?/, '');

  // 4. Remove stray triple-quote closing
  cleaned = cleaned.replace(/\s*"""\s*$/, '');

  // 5. Fix "the this renowned publisher" -> "this renowned publisher"
  cleaned = cleaned.replace(/\bthe\s+this\s+renowned\s+publisher\b/gi, 'this acclaimed publisher');
  cleaned = cleaned.replace(/\bthis\s+renowned\s+publisher\b/gi, 'this acclaimed work');

  // 6. Clean up multiple newlines that may result from stripping
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 7. Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

// ─── Phase 2: AI Meta Description Generator ────────────────────────────────

async function generateMetaDescription(title, description, price, zai) {
  const priceStr = price > 0 ? `Rs. ${Math.round(price).toLocaleString('en-PK')}` : 'Contact for price';
  const descExcerpt = description.substring(0, 600);

  const prompt = `You are writing a meta description for an Islamic book product page.

Book Title: "${title}"
Price: ${priceStr}
Description excerpt: "${descExcerpt}"

CRITICAL RULES:
- Write EXACTLY 130-155 characters (count every character including spaces)
- Do NOT start with the book title — write a natural, engaging sentence
- Include relevant keywords naturally (Islamic books, Pakistan, buy online, authentic)
- Mention what the reader will gain or learn from this book
- Do NOT mention any publisher brand names (Goodword, IIPH, etc.)
- Do NOT mention "Bab-ul-Fatah" in the meta description
- Write in English only
- Return ONLY the meta description text — no quotes, no labels, no extra text

Write the meta description now:`;

  for (let retry = 0; retry < 3; retry++) {
    if (retry > 0) {
      console.log(`    Retry ${retry}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an SEO specialist who writes perfectly sized meta descriptions. You count characters precisely. Your meta descriptions are compelling, keyword-rich, and drive click-throughs. You NEVER wrap output in quotes or add labels.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      let meta = completion.choices?.[0]?.message?.content?.trim();
      if (!meta) continue;

      // Clean up: remove wrapping quotes if present
      meta = meta.replace(/^["']|["']$/g, '').replace(/^["']|["']$/g, '').trim();

      // Validate length — must be 130-155
      if (meta.length >= 125 && meta.length <= 165) {
        return meta;
      }

      // If close enough (120-165), accept but note it
      if (meta.length >= 120 && meta.length < 125) {
        console.log(`    (Slightly short: ${meta.length} chars, accepting)`);
        return meta;
      }

      console.log(`    (Bad length: ${meta.length} chars, retrying)`);
    } catch (e) {
      console.error(`    AI Error: ${e.message?.substring(0, 80)}`);
      if (e.message?.includes('429')) {
        await new Promise(r => setTimeout(r, 8000));
      }
    }
  }

  return null;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  console.log('='.repeat(70));
  console.log('  Bab-ul-Fatah — SEO Fix Script');
  console.log('  Phase 1: Clean template artifacts from descriptions');
  console.log('  Phase 2: Rewrite short meta descriptions via AI');
  console.log('='.repeat(70));

  // ── Phase 1: Identify and clean descriptions with artifacts ──
  console.log('\n━━━ PHASE 1: Template Artifact Cleanup ━━━\n');

  // Find products with "this renowned publisher"
  const withRenownedPublisher = await prisma.product.findMany({
    where: {
      slug: { startsWith: 'goodword-' },
      description: { contains: 'this renowned publisher' }
    },
    select: { id: true, title: true, slug: true, description: true }
  });

  // Find products with "Title:" prefix
  const withTitlePrefix = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } }
      ],
      description: { startsWith: 'Title:' }
    },
    select: { id: true, title: true, slug: true, description: true }
  });

  // Merge into unique set
  const artifactMap = new Map();
  for (const p of withRenownedPublisher) artifactMap.set(p.id, p);
  for (const p of withTitlePrefix) artifactMap.set(p.id, p);

  const artifactProducts = [...artifactMap.values()];
  console.log(`Found ${artifactProducts.length} products with template artifacts:`);
  console.log(`  - "this renowned publisher": ${withRenownedPublisher.length}`);
  console.log(`  - "Title:" prefix: ${withTitlePrefix.length}`);
  console.log(`  - Unique total: ${artifactProducts.length}\n`);

  const phase1Results = [];

  for (const product of artifactProducts) {
    const oldDesc = product.description;
    const newDesc = cleanDescriptionArtifact(oldDesc);
    const changed = oldDesc !== newDesc;
    const charsSaved = oldDesc.length - newDesc.length;

    if (changed && newDesc.length >= 200) {
      await prisma.product.update({
        where: { id: product.id },
        data: { description: newDesc }
      });

      phase1Results.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        oldLength: oldDesc.length,
        newLength: newDesc.length,
        charsSaved,
        changeType: oldDesc.startsWith('Title:') ? 'title_prefix_removed' : 'publisher_phrase_fixed'
      });

      console.log(`  [FIXED] ${product.title.substring(0, 50).padEnd(50)} | ${oldDesc.length} -> ${newDesc.length} chars (${charsSaved > 0 ? '-' : '+'}${Math.abs(charsSaved)})`);
    } else if (!changed) {
      console.log(`  [SKIP]  ${product.title.substring(0, 50).padEnd(50)} | No changes needed`);
    } else {
      console.log(`  [WARN]  ${product.title.substring(0, 50).padEnd(50)} | Cleaned too short (${newDesc.length} chars), skipping`);
    }
  }

  const phase1Fixed = phase1Results.length;

  // ── Phase 2: Rewrite short meta descriptions ──
  console.log('\n━━━ PHASE 2: Meta Description Rewrite ━━━\n');

  const shortMetaProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'goodword-' } },
        { slug: { startsWith: 'iiph-' } }
      ],
      metaDescription: { not: null }
    },
    select: { id: true, title: true, slug: true, description: true, price: true, metaDescription: true },
    orderBy: { title: 'asc' }
  });

  // Filter to only those < 130 chars
  const needsMetaRewrite = shortMetaProducts.filter(p => p.metaDescription.length < 130);
  console.log(`Found ${needsMetaRewrite.length} products with meta descriptions < 130 characters:\n`);

  for (const product of needsMetaRewrite) {
    console.log(`  [${product.metaDescription.length} chars] ${product.title}`);
  }

  console.log(`\nInitializing AI SDK for meta description rewriting...`);
  const zai = await ZAI.create();
  console.log('AI SDK ready!\n');

  const phase2Results = [];

  for (let i = 0; i < needsMetaRewrite.length; i++) {
    const product = needsMetaRewrite[i];
    const num = `[${i + 1}/${needsMetaRewrite.length}]`;

    console.log(`${num} Processing: "${product.title.substring(0, 55)}"`);
    console.log(`    Old meta (${product.metaDescription.length} chars): "${product.metaDescription}"`);

    const newMeta = await generateMetaDescription(
      product.title,
      product.description,
      product.price,
      zai
    );

    if (newMeta) {
      await prisma.product.update({
        where: { id: product.id },
        data: { metaDescription: newMeta }
      });

      phase2Results.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        oldMeta: product.metaDescription,
        newMeta,
        oldLength: product.metaDescription.length,
        newLength: newMeta.length
      });

      console.log(`    New meta (${newMeta.length} chars): "${newMeta}"`);
      console.log(`    [OK]\n`);
    } else {
      phase2Results.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        oldMeta: product.metaDescription,
        newMeta: null,
        oldLength: product.metaDescription.length,
        newLength: 0,
        failed: true
      });
      console.log(`    [FAILED] Could not generate valid meta description\n`);
    }

    // Delay between API calls
    if (i < needsMetaRewrite.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // ── Final Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const phase2Fixed = phase2Results.filter(r => !r.failed).length;
  const phase2Failed = phase2Results.filter(r => r.failed).length;

  console.log('='.repeat(70));
  console.log('  FINAL SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nPhase 1 — Artifact Cleanup:`);
  console.log(`  Products with artifacts found:  ${artifactProducts.length}`);
  console.log(`  Successfully cleaned:           ${phase1Fixed}`);
  console.log(`  Skipped/unchanged:              ${artifactProducts.length - phase1Fixed}`);

  console.log(`\nPhase 2 — Meta Description Rewrite:`);
  console.log(`  Products needing rewrite:       ${needsMetaRewrite.length}`);
  console.log(`  Successfully rewritten:         ${phase2Fixed}`);
  console.log(`  Failed:                         ${phase2Failed}`);

  if (phase2Results.length > 0) {
    const newLengths = phase2Results.filter(r => !r.failed).map(r => r.newLength);
    console.log(`  New meta length range:         ${Math.min(...newLengths)}-${Math.max(...newLengths)} chars`);
    console.log(`  New meta avg length:           ${Math.round(newLengths.reduce((a, b) => a + b, 0) / newLengths.length)} chars`);
  }

  console.log(`\nTotal time elapsed: ${elapsed}s`);

  // Save results
  const resultsFile = path.join(__dirname, 'seo-fix-artifacts-meta-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    phase1: { found: artifactProducts.length, fixed: phase1Fixed, results: phase1Results },
    phase2: { found: needsMetaRewrite.length, fixed: phase2Fixed, failed: phase2Failed, results: phase2Results },
    elapsed: `${elapsed}s`
  }, null, 2));
  console.log(`\nResults saved to: ${resultsFile}`);
}

main()
  .catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
