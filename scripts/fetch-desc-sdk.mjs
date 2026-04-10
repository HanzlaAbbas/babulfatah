import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const mapping = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/slug-mapping-400.json', 'utf8'));
const BATCH = parseInt(process.argv[2]) || 3;
const BATCH_SIZE = 20;
const start = (BATCH - 1) * BATCH_SIZE;
const end = Math.min(start + BATCH_SIZE, mapping.length);
const outputFile = `/home/z/my-project/download/source-desc-batch${BATCH}.json`;

async function main() {
  const zai = await ZAI.create();
  const batch = mapping.slice(start, end);
  console.log(`Batch ${BATCH}: products ${start+1} to ${end}`);
  
  const results = [];
  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    if (!p.darussalamSlug) {
      results.push({index: p.index, slug: p.slug, title: p.title, id: p.id, sourceDesc: '', matchType: 'miss'});
      console.log(`[${start+i+1}] SKIP: ${p.title}`);
      continue;
    }
    
    try {
      const url = `https://darussalam.pk/products/${p.darussalamSlug}`;
      console.log(`[${start+i+1}] Fetching: ${p.title}`);
      const result = await zai.functions.invoke('page_reader', { url });
      
      if (result.data && result.data.html) {
        const html = result.data.html;
        // Extract description from main content
        const div = document.createElement('div');
        div.innerHTML = html;
        const ps = div.querySelectorAll('p');
        const h3s = div.querySelectorAll('h3');
        const lis = div.querySelectorAll('li');
        
        const parts = [];
        h3s.forEach(h => { if (h.textContent.trim().length > 3) parts.push(h.textContent.trim()); });
        ps.forEach(p => {
          const t = p.textContent.trim();
          if (t.length > 20 && !t.includes('Taxes') && !t.includes('Hurry') && !t.includes('RECENTLY') && !t.includes('RELATED')) {
            parts.push(t);
          }
        });
        lis.forEach(li => {
          const t = li.textContent.trim();
          if (t.length > 10 && !t.includes('View') && !t.includes('Sort')) parts.push('• ' + t);
        });
        
        const desc = parts.join('\n');
        if (desc.length > 30) {
          console.log(`  ✓ ${desc.length} chars`);
          results.push({index: p.index, slug: p.slug, title: p.title, id: p.id, sourceDesc: desc});
        } else {
          console.log(`  ✗ empty`);
          results.push({index: p.index, slug: p.slug, title: p.title, id: p.id, sourceDesc: ''});
        }
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message.substring(0,80)}`);
      results.push({index: p.index, slug: p.slug, title: p.title, id: p.id, sourceDesc: '', error: e.message.substring(0,100)});
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nBatch ${BATCH} done: ${results.filter(r=>r.sourceDesc.length>30).length}/${results.length}`);
}

main().catch(console.error);
