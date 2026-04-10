const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');

const prisma = new PrismaClient();

// Load first 400 products
const products = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/first-400-products.json', 'utf8'));

// Get start/end from command line args
const startIdx = parseInt(process.argv[2]) || 0;
const endIdx = parseInt(process.argv[3]) || startIdx + 20;
const outputFile = process.argv[4] || `/home/z/my-project/download/source-desc-${startIdx+1}-${endIdx}.json`;

async function fetchDescription(slug) {
  try {
    const url = `https://darussalam.pk/products/${slug}`;
    
    // Open the page
    execSync(`agent-browser open "${url}"`, { timeout: 20000, stdio: 'pipe' });
    execSync('agent-browser wait 3000', { timeout: 10000, stdio: 'pipe' });
    
    // Extract description using JS eval
    const result = execSync(
      `agent-browser eval "(() => { 
        const main = document.querySelector('main');
        if (!main) return JSON.stringify({error: 'no main'});
        const ps = main.querySelectorAll('p');
        const h3s = main.querySelectorAll('h3');
        const lis = main.querySelectorAll('li');
        let desc = '';
        h3s.forEach(h => { if (h.textContent.trim().length > 5) desc += h.textContent.trim() + '\\n'; });
        ps.forEach(p => { 
          const t = p.textContent.trim();
          if (t.length > 30 && !t.includes('Taxes, discounts') && !t.includes('Hurry up')) desc += t + '\\n'; 
        });
        lis.forEach(li => { 
          const t = li.textContent.trim();
          if (t.length > 15) desc += '• ' + t + '\\n';
        });
        return JSON.stringify({desc: desc.trim(), len: desc.trim().length});
      })()"`,
      { timeout: 10000, stdio: 'pipe', encoding: 'utf8' }
    );
    
    const parsed = JSON.parse(result.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'));
    return parsed;
  } catch (e) {
    return { error: e.message, desc: '' };
  }
}

async function main() {
  const batch = products.slice(startIdx, endIdx);
  const results = [];
  
  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    console.log(`[${startIdx + i + 1}/${endIdx}] Fetching: ${p.title} (${p.slug})`);
    const result = await fetchDescription(p.slug);
    results.push({
      index: startIdx + i + 1,
      slug: p.slug,
      title: p.title,
      id: p.id,
      sourceDesc: result.desc || '',
      sourceLength: result.len || 0,
      error: result.error || null
    });
    
    // Small delay between requests
    if (i < batch.length - 1) {
      execSync('sleep 1', { stdio: 'pipe' });
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} results to ${outputFile}`);
  
  const successes = results.filter(r => r.sourceLength > 50);
  const failures = results.filter(r => r.error || r.sourceLength <= 50);
  console.log(`Success: ${successes.length}, Failed/Empty: ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failed slugs:', failures.map(f => f.slug).join(', '));
  }
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
