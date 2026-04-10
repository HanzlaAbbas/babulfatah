#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — AI SEO Description Generator (Rate-Limited Sequential)
// ============================================================================
// Processes products sequentially with 2s delay between calls to respect
// the z-ai-web-dev-sdk rate limits. Processes CHUNK_SIZE products per run.
// Usage: node scripts/generate-descriptions.js [chunk_size] [offset]
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const ZAI = require('z-ai-web-dev-sdk').default;

const prisma = new PrismaClient();
const DELAY_MS = 2500; // 2.5s between calls to avoid 429
const CHUNK_SIZE = parseInt(process.argv[2] || '50');
const OFFSET = parseInt(process.argv[3] || '0');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateBatchDescriptions(zai, products) {
  // Batch up to 5 products per AI call to reduce API calls
  const BATCH = 5;
  let updated = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const productLines = batch.map((p, idx) =>
      `[${idx + 1}] Title: "${p.title}" | Author: ${p.author?.name || 'N/A'} | Category: ${p.category?.name || 'N/A'} | Original: ${(p.description || '').slice(0, 150)}`
    ).join('\n');

    const systemPrompt = `You are an Islamic e-commerce SEO copywriter for Bab-ul-Fatah bookstore. For EACH product listed, write a unique 100-150 word SEO description in 2 paragraphs. Use clean English only. No markdown, HTML, or formatting. Maintain theological accuracy. Remove competitor branding. Format: For each product, output exactly "===N===" followed by the description, where N is the product number.`;

    try {
      const r = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: productLines },
        ],
      });

      const content = r.choices?.[0]?.message?.content?.trim() || '';
      const parts = content.split(/===\d+===/);

      for (let j = 0; j < batch.length; j++) {
        const desc = (parts[j + 1] || parts[j] || '').trim();
        if (desc.length > 50) {
          try {
            await prisma.product.update({ where: { id: batch[j].id }, data: { description: desc } });
            updated++;
          } catch {}
        }
      }

      const pct = Math.round(((Math.min(i + BATCH, products.length) + OFFSET) / (OFFSET + products.length)) * 100);
      process.stdout.write(`\r  [${Math.min(i + BATCH, products.length)}/${products.length}] ${pct}% — Updated: ${updated}     `);
    } catch (err) {
      if (err.message?.includes('429')) {
        process.stdout.write(`\r  ⚠️ Rate limited. Waiting 10s...`);
        await sleep(10000);
        i -= BATCH; // Retry this batch
      }
    }

    await sleep(DELAY_MS);
  }

  return updated;
}

async function main() {
  const start = Date.now();
  console.log(`\n  AI Description Generator`);
  console.log(`  Chunk: ${CHUNK_SIZE} products, Offset: ${OFFSET}\n`);

  let zai;
  try { zai = await ZAI.create(); console.log('  ✅ AI backend ready\n'); } catch (e) { console.error('AI init failed:', e.message); process.exit(1); }

  const total = await prisma.product.count();
  const products = await prisma.product.findMany({
    skip: OFFSET,
    take: CHUNK_SIZE,
    select: { id: true, title: true, description: true, category: { select: { name: true } }, author: { select: { name: true } } },
  });

  console.log(`  Database: ${total} total products`);
  console.log(`  Processing: ${products.length} products (offset ${OFFSET}-${OFFSET + products.length})\n`);

  const updated = await generateBatchDescriptions(zai, products);

  console.log(`\n\n  ✅ Done: ${updated}/${products.length} updated in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`  Next: node scripts/generate-descriptions.js ${CHUNK_SIZE} ${OFFSET + products.length}\n`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
