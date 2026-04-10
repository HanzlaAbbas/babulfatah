const fs = require('fs');
const { execSync } = require('child_process');

// Load slug mapping
const mapping = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/slug-mapping-400.json', 'utf8'));
const BATCH = parseInt(process.argv[2]) || 1;  // batch number (1-based)
const BATCH_SIZE = 20;
const start = (BATCH - 1) * BATCH_SIZE;
const end = Math.min(start + BATCH_SIZE, mapping.length);
const outputFile = `/home/z/my-project/download/source-desc-batch${BATCH}.json`;

function openPage(slug) {
  try {
    execSync(`agent-browser open "https://darussalam.pk/products/${slug}"`, { timeout: 20000, stdio: 'pipe' });
    execSync('agent-browser wait 2500', { timeout: 10000, stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function extractDescription() {
  try {
    const result = execSync(
      `agent-browser eval "(() => {
        const main = document.querySelector('main');
        if (!main) return JSON.stringify({found: false, reason: 'no-main'});
        const h1 = main.querySelector('h1');
        if (h1 && h1.textContent.includes('404')) return JSON.stringify({found: false, reason: '404'});
        if (h1 && h1.textContent.includes('Not Found')) return JSON.stringify({found: false, reason: '404'});
        
        const allText = [];
        // Get paragraphs
        main.querySelectorAll('p').forEach(p => {
          const t = p.textContent.trim();
          if (t.length > 20 && !t.includes('Taxes, discounts') && !t.includes('Hurry up') && !t.includes('RECENTLY') && !t.includes('RELATED')) {
            allText.push(t);
          }
        });
        // Get headings
        main.querySelectorAll('h3').forEach(h => {
          const t = h.textContent.trim();
          if (t.length > 5) allText.push(t);
        });
        // Get list items
        main.querySelectorAll('li').forEach(li => {
          const t = li.textContent.trim();
          if (t.length > 10 && !t.includes('View as') && !t.includes('Items per') && !t.includes('Sort by')) {
            allText.push('• ' + t);
          }
        });
        
        const desc = allText.join('\\n');
        return JSON.stringify({found: desc.length > 30, desc: desc, len: desc.length});
      })()"`,
      { timeout: 10000, stdio: 'pipe', encoding: 'utf8' }
    );
    
    // Clean up the result - it may have outer quotes
    let clean = result.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = JSON.parse(clean);
    }
    return JSON.parse(clean);
  } catch (e) {
    return { found: false, reason: 'eval-error', error: e.message };
  }
}

async function main() {
  const batch = mapping.slice(start, end);
  console.log(`Processing batch ${BATCH}: products ${start+1} to ${end} (${batch.length} products)`);
  
  const results = [];
  
  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    const dSlug = p.darussalamSlug;
    
    if (!dSlug) {
      console.log(`[${start+i+1}] SKIP (no match): ${p.title}`);
      results.push({
        index: p.index,
        slug: p.slug,
        title: p.title,
        id: p.id,
        sourceDesc: '',
        matchType: 'miss'
      });
      continue;
    }
    
    console.log(`[${start+i+1}] Fetching: ${p.title} -> ${dSlug}`);
    
    const opened = openPage(dSlug);
    if (!opened) {
      console.log(`  ✗ Failed to open page`);
      results.push({
        index: p.index, slug: p.slug, title: p.title, id: p.id,
        sourceDesc: '', matchType: p.matchType, error: 'open-failed'
      });
      continue;
    }
    
    const desc = extractDescription();
    
    if (desc.found && desc.len > 30) {
      console.log(`  ✓ Got ${desc.len} chars`);
      results.push({
        index: p.index, slug: p.slug, title: p.title, id: p.id,
        sourceDesc: desc.desc,
        matchType: p.matchType
      });
    } else {
      console.log(`  ✗ No desc (${desc.reason || 'empty'})`);
      results.push({
        index: p.index, slug: p.slug, title: p.title, id: p.id,
        sourceDesc: '', matchType: p.matchType, error: desc.reason
      });
    }
    
    // Small delay
    if (i < batch.length - 1) {
      execSync('sleep 1', { stdio: 'pipe' });
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  const success = results.filter(r => r.sourceDesc.length > 30).length;
  console.log(`\nBatch ${BATCH} complete: ${success}/${results.length} fetched successfully`);
  console.log(`Saved to ${outputFile}`);
}

main().catch(console.error);
