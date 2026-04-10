import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const mappings = JSON.parse(fs.readFileSync('/tmp/iiph-unique-mappings.json', 'utf-8'));
const iiphProducts = JSON.parse(fs.readFileSync('./products-to-update.json', 'utf-8')).filter(p => p.slug.startsWith('iiph-'));

// Get unique IDs from mappings (deduplicated by URL)
const seen = new Set();
const urlToId = new Map();
mappings.forEach(m => {
  const key = m.url.replace(/\/$/, '');
  if (!seen.has(key)) {
    seen.add(key);
    urlToId.set(key, m);
  }
});

// Get all unique product IDs
const uniqueProducts = [...urlToId.values()];

const zai = await ZAI.create();
const results = new Map(); // id -> {title, content, url}

// Fetch products in batches of 5
const batchSize = 5;
for (let i = 0; i < uniqueProducts.length; i += batchSize) {
  const batch = uniqueProducts.slice(i, i + batchSize);
  console.log(`Fetching batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(uniqueProducts.length/batchSize)}...`);
  
  const promises = batch.map(async (p) => {
    try {
      const res = await zai.functions.invoke('page_reader', {
        url: `https://zamzampublishers.com.pk/wp-json/wp/v2/product/${p.id}`
      });
      const html = res.data?.html || '';
      const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      if (match) {
        const jsonStr = match[1].replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const product = JSON.parse(jsonStr);
        const contentHtml = product.content?.rendered || '';
        const text = contentHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#8217;/g, "'")
          .replace(/&#8220;/g, '"')
          .replace(/&#8221;/g, '"')
          .replace(/&#8211;/g, '-')
          .replace(/&#038;/g, '&')
          .replace(/&#(\d+);/g, (m, code) => String.fromCharCode(code))
          .replace(/\s+/g, ' ')
          .trim();
        return { id: p.id, title: product.title?.rendered || p.title, url: p.url, description: text };
      }
      return { id: p.id, title: p.title, url: p.url, description: null, error: 'no pre tag' };
    } catch (e) {
      console.error(`Error fetching product ${p.id}:`, e.message);
      return { id: p.id, title: p.title, url: p.url, description: null, error: e.message };
    }
  });

  const batchResults = await Promise.allSettled(promises);
  batchResults.forEach(r => {
    if (r.status === 'fulfilled') {
      results.set(r.value.id, r.value);
    }
  });
  
  // Small delay between batches
  if (i + batchSize < uniqueProducts.length) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

console.log(`\nFetched ${results.size}/${uniqueProducts.length} products`);

// Save all API results
const apiResults = [...results.values()];
fs.writeFileSync('/tmp/iiph-api-results.json', JSON.stringify(apiResults, null, 2));

// Now match with our IIPH products
function cleanTitle(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const finalResults = iiphProducts.map(product => {
  const cleanProductTitle = cleanTitle(product.title);
  
  // Try to find a matching API result
  let match = null;
  for (const apiProduct of apiResults) {
    const cleanApiTitle = cleanTitle(apiProduct.title);
    // Check if titles are similar
    if (cleanApiTitle === cleanProductTitle || 
        cleanApiTitle.includes(cleanProductTitle) || 
        cleanProductTitle.includes(cleanApiTitle)) {
      match = apiProduct;
      break;
    }
  }
  
  return {
    slug: product.slug,
    title: product.title,
    scrapedDescription: match?.description && match.description.length > 50 ? match.description : null,
    source: match ? match.url : null
  };
});

// Count matches
const matched = finalResults.filter(r => r.scrapedDescription);
const unmatched = finalResults.filter(r => !r.scrapedDescription);
console.log(`Matched: ${matched.length}, Unmatched: ${unmatched.length}`);

// Show unmatched products
if (unmatched.length > 0) {
  console.log('\nUnmatched products:');
  unmatched.forEach(p => console.log('  -', p.title));
}

// Save final results
fs.writeFileSync('./iiph-descriptions.json', JSON.stringify(finalResults, null, 2));
console.log('\nSaved to iiph-descriptions.json');
