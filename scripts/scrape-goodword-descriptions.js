/**
 * Scrape Goodword product descriptions from goodwordbooks.com
 * Uses Shopify JSON API to get product data, then matches with our DB products
 */
const fs = require('fs');
const path = require('path');

function normalizeTitle(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleMatch(a, b) {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  // Exact match
  if (na === nb) return 1.0;
  // One contains the other
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  // Word overlap
  const wordsA = new Set(na.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(nb.split(' ').filter(w => w.length > 2));
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchAllGoodwordProducts() {
  const allProducts = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://www.goodwordbooks.com/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.products || data.products.length === 0) break;
    allProducts.push(...data.products);
    if (data.products.length < 250) break;
    await new Promise(r => setTimeout(r, 500));
  }
  return allProducts;
}

async function main() {
  const dbProducts = JSON.parse(fs.readFileSync(path.join(__dirname, 'products-to-update.json'), 'utf8'));
  const gwDbProducts = dbProducts.filter(p => p.slug.startsWith('goodword-'));
  
  console.log(`Fetching all Goodword products from goodwordbooks.com...`);
  const allGwProducts = await fetchAllGoodwordProducts();
  console.log(`Found ${allGwProducts.length} products on goodwordbooks.com`);
  
  // Filter to ones with meaningful descriptions
  const withDesc = allGwProducts.filter(p => p.body_html && p.body_html.length > 100);
  console.log(`${withDesc.length} have descriptions`);
  
  // Match our products
  const results = [];
  const unmatched = [];
  
  for (const dbProduct of gwDbProducts) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const gwProduct of withDesc) {
      const score = titleMatch(dbProduct.title, gwProduct.title);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = gwProduct;
      }
    }
    
    if (bestMatch && bestScore >= 0.5) {
      results.push({
        dbId: dbProduct.id,
        dbTitle: dbProduct.title,
        dbSlug: dbProduct.slug,
        gwTitle: bestMatch.title,
        gwHandle: bestMatch.handle,
        gwUrl: `https://www.goodwordbooks.com/products/${bestMatch.handle}`,
        gwVendor: bestMatch.vendor,
        gwType: bestMatch.product_type,
        description: stripHtml(bestMatch.body_html),
        matchScore: bestScore,
      });
    } else {
      unmatched.push({
        dbId: dbProduct.id,
        dbTitle: dbProduct.title,
        dbSlug: dbProduct.slug,
        bestScore: bestScore,
        bestMatchTitle: bestMatch?.title || null,
      });
    }
  }
  
  console.log(`\nMatched: ${results.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
  
  if (unmatched.length > 0) {
    console.log('\n--- Unmatched ---');
    unmatched.forEach(u => {
      console.log(`  ${u.dbTitle} (score: ${u.bestScore.toFixed(2)}, closest: ${u.bestMatchTitle})`);
    });
  }
  
  // Save results
  const outputPath = path.join(__dirname, 'goodword-scraped-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved to ${outputPath}`);
  
  // Show samples
  console.log('\n--- Sample Matches ---');
  results.slice(0, 3).forEach(r => {
    console.log(`\n${r.dbTitle} -> ${r.gwTitle} (score: ${r.matchScore.toFixed(2)})`);
    console.log(`  ${r.description.substring(0, 300)}...`);
  });
}

main().catch(console.error);
