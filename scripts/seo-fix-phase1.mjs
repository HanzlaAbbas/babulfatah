#!/usr/bin/env node
// ============================================================================
// Phase 1 ONLY: Regex cleanup of template artifacts (no AI needed)
// ============================================================================

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function cleanDescriptionArtifact(desc) {
  let cleaned = desc;
  cleaned = cleaned.replace(/^Title:\s*"[^"]*"\s*\n?/i, '');
  cleaned = cleaned.replace(/^Current Description:\s*\n?/i, '');
  cleaned = cleaned.replace(/^"""\s*\n?/, '');
  cleaned = cleaned.replace(/\s*"""\s*$/, '');
  cleaned = cleaned.replace(/\bthe\s+this\s+renowned\s+publisher\b/gi, 'this acclaimed publisher');
  cleaned = cleaned.replace(/\bthis\s+renowned\s+publisher\b/gi, 'this acclaimed work');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();
  return cleaned;
}

async function main() {
  console.log('=== PHASE 1: Template Artifact Cleanup ===\n');

  const withRenownedPublisher = await prisma.product.findMany({
    where: {
      slug: { startsWith: 'goodword-' },
      description: { contains: 'this renowned publisher' }
    },
    select: { id: true, title: true, slug: true, description: true }
  });

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

  const artifactMap = new Map();
  for (const p of withRenownedPublisher) artifactMap.set(p.id, p);
  for (const p of withTitlePrefix) artifactMap.set(p.id, p);
  const artifactProducts = [...artifactMap.values()];

  console.log(`Found: ${artifactProducts.length} products (renowned: ${withRenownedPublisher.length}, title_prefix: ${withTitlePrefix.length})\n`);

  const fixed = [];
  for (const product of artifactProducts) {
    const oldDesc = product.description;
    const newDesc = cleanDescriptionArtifact(oldDesc);
    const changed = oldDesc !== newDesc;
    if (changed && newDesc.length >= 200) {
      await prisma.product.update({ where: { id: product.id }, data: { description: newDesc } });
      fixed.push({ id: product.id, title: product.title, oldLen: oldDesc.length, newLen: newDesc.length });
      console.log(`  [FIXED] ${product.title.substring(0,55)} | ${oldDesc.length} -> ${newDesc.length}`);
    } else {
      console.log(`  [SKIP]  ${product.title.substring(0,55)} | no change`);
    }
  }

  const resultsFile = path.join(__dirname, 'seo-fix-phase1-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({ fixed, total: artifactProducts.length, timestamp: new Date().toISOString() }, null, 2));
  console.log(`\nPhase 1 done: ${fixed.length}/${artifactProducts.length} fixed. Saved to ${resultsFile}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
