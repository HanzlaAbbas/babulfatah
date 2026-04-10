/**
 * Scrape stock availability from darussalam.pk (Shopify API) and babussalam.pk
 * Match products to our DB by slug and update stock status
 * 
 * Usage: node scripts/scrape-stock-status.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CONCURRENCY = 5; // concurrent requests
const DELAY = 300; // ms between requests to avoid rate limiting

// ============ UTILITY FUNCTIONS ============

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ============ SCRAPE DARUSSALAM.PK (SHOPIFY API) ============

async function scrapeDarussalam() {
  console.log('\n📦 Scraping darussalam.pk via Shopify API...');
  
  const allProducts = [];
  let page = 1;
  
  while (true) {
    const url = `https://darussalam.pk/products.json?limit=250&page=${page}&fields=id,title,handle,variants`;
    console.log(`  Fetching page ${page}...`);
    
    try {
      const data = await fetchJSON(url);
      if (!data.products || data.products.length === 0) break;
      
      data.products.forEach(p => {
        const available = p.variants?.[0]?.available ?? false;
        allProducts.push({
          handle: p.handle,
          title: p.title,
          available: available,
        });
      });
      
      console.log(`    Got ${data.products.length} products (running total: ${allProducts.length})`);
      page++;
      
      if (page > 10) break; // safety limit
      await sleep(DELAY);
    } catch (err) {
      console.error(`    Error on page ${page}: ${err.message}`);
      break;
    }
  }
  
  console.log(`  ✅ Total darussalam.pk products: ${allProducts.length}`);
  const inStock = allProducts.filter(p => p.available).length;
  const outOfStock = allProducts.filter(p => !p.available).length;
  console.log(`  In stock: ${inStock}, Out of stock: ${outOfStock}`);
  
  return allProducts;
}

// ============ SCRAPE BABUSSALAM.PK ============

async function scrapeBabussalam() {
  console.log('\n📦 Scraping babussalam.pk...');
  
  // Get all our goodword product slugs
  const ourProducts = await prisma.product.findMany({
    where: { slug: { startsWith: 'goodword-' } },
    select: { slug: true, title: true },
  });
  
  console.log(`  Our Goodword products to check: ${ourProducts.length}`);
  
  // We'll scrape the Goodword category page from babussalam.pk
  // The URL format is /category/goodword, and we need to check each product
  // First, let's try fetching the category page to get product list
  const stockMap = {};
  
  // Try the category listing API approach
  // babussalam.pk appears to use a custom platform, let's try the product search API
  const ourTitles = ourProducts.map(p => p.title.replace(/^Goodword\s*/i, '').trim());
  
  // Strategy: Fetch the Goodword category pages and parse product listings
  // babussalam.pk shows "Add To Cart" for in-stock and likely "Out of Stock" for unavailable
  
  // Try fetching category page via curl and parse
  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    const url = `https://babussalam.pk/category/goodword?page=${pageNum}`;
    console.log(`  Fetching Goodword category page ${pageNum}...`);
    
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const html = await res.text();
      
      // Parse product cards from HTML
      // babussalam.pk product cards have specific structure - look for product links and stock indicators
      const productRegex = /href="\/product\/([^"]+)"[^>]*>[\s\S]*?<h[45][^>]*>([^<]+)<\/h[45]>[\s\S]*?(Add\s*To\s*Cart|Out\s*of\s*Stock|Sold\s*Out)/gi;
      
      let match;
      while ((match = productRegex.exec(html)) !== null) {
        const slug = match[1].trim();
        const title = match[2].trim();
        const stockText = match[3].trim();
        const inStock = stockText.toLowerCase().includes('add to cart');
        
        stockMap[slug] = { title, inStock, source: `babussalam category page ${pageNum}` };
      }
      
      // If no products found on this page, try a different parsing approach
      if (Object.keys(stockMap).length === 0 && pageNum === 1) {
        // Try broader regex
        const cardRegex = /class="[^"]*product[^"]*"[^>]*>[\s\S]*?href="\/product\/([^"]+)"/gi;
        while ((match = cardRegex.exec(html)) !== null) {
          stockMap[match[1].trim()] = { title: match[1].trim(), inStock: true, source: 'babussalam fallback' };
        }
      }
      
      console.log(`    Found ${Object.keys(stockMap).length} products so far`);
      
      // Check if there are more pages by looking for pagination
      if (!html.includes(`page=${pageNum + 1}`) && !html.includes('next')) break;
      await sleep(DELAY * 2);
    } catch (err) {
      console.error(`    Error: ${err.message}`);
      break;
    }
  }
  
  console.log(`  ✅ Total babussalam.pk products found: ${Object.keys(stockMap).length}`);
  return stockMap;
}

// ============ MATCH AND UPDATE DATABASE ============

async function updateDatabase(darussalamProducts, babussalamStock) {
  console.log('\n🔄 Updating database...');
  
  // Build a map from darussalam handle -> available
  const darussalamMap = {};
  darussalamProducts.forEach(p => {
    darussalamMap[p.handle] = p.available;
  });
  
  // Get all products from our DB
  const allProducts = await prisma.product.findMany({
    select: { id: true, slug: true, title: true, stock: true },
  });
  
  let matched = 0;
  let updated = 0;
  let unmatched = 0;
  let errors = [];
  
  // Process in batches
  const batchSize = 50;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    const updates = [];
    
    for (const product of batch) {
      let inStock = null;
      let source = 'unknown';
      
      // Check darussalam.pk match
      if (darussalamMap.hasOwnProperty(product.slug)) {
        inStock = darussalamMap[product.slug];
        source = 'darussalam.pk';
        matched++;
      }
      // Check babussalam.pk match (try without goodword- prefix)
      else if (product.slug.startsWith('goodword-')) {
        const babusSlug = product.slug.replace('goodword-', '');
        if (babussalamStock[babusSlug]) {
          inStock = babussalamStock[babusSlug].inStock;
          source = 'babussalam.pk';
          matched++;
        } else {
          // Try matching by title similarity
          for (const [key, val] of Object.entries(babussalamStock)) {
            const normalizedTitle = product.title.replace(/^Goodword\s*/i, '').trim().toLowerCase();
            const normalizedKey = val.title.toLowerCase();
            if (normalizedKey.includes(normalizedTitle) || normalizedTitle.includes(normalizedKey)) {
              inStock = val.inStock;
              source = `babussalam.pk (title match: ${key})`;
              matched++;
              break;
            }
          }
        }
      } else {
        unmatched++;
      }
      
      if (inStock !== null) {
        const newStock = inStock ? 15 : 0;
        if (product.stock !== newStock) {
          updates.push({ id: product.id, stock: newStock });
          updated++;
        }
      }
    }
    
    // Apply batch updates
    if (updates.length > 0) {
      await Promise.all(updates.map(u => 
        prisma.product.update({ where: { id: u.id }, data: { stock: u.stock } })
      ));
    }
    
    if ((i + batchSize) % 200 === 0) {
      console.log(`  Processed ${Math.min(i + batchSize, allProducts.length)}/${allProducts.length} products...`);
    }
  }
  
  console.log(`\n  📊 Results:`);
  console.log(`    Matched to source: ${matched}`);
  console.log(`    Updated stock: ${updated}`);
  console.log(`    Unmatched (kept current): ${unmatched}`);
  
  // Final stats
  const finalInStock = await prisma.product.count({ where: { stock: { gt: 0 } } });
  const finalOutOfStock = await prisma.product.count({ where: { stock: { lte: 0 } } });
  console.log(`\n  Final stock status:`);
  console.log(`    In Stock: ${finalInStock}`);
  console.log(`    Out of Stock: ${finalOutOfStock}`);
  console.log(`    Total: ${finalInStock + finalOutOfStock}`);
}

// ============ MAIN ============

async function main() {
  console.log('🚀 Starting stock status scraping...');
  console.log('========================================');
  
  try {
    // Step 1: Scrape darussalam.pk
    const darussalamProducts = await scrapeDarussalam();
    
    // Step 2: Scrape babussalam.pk
    const babussalamStock = await scrapeBabussalam();
    
    // Step 3: Match and update database
    await updateDatabase(darussalamProducts, babussalamStock);
    
    console.log('\n✅ Stock status update complete!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
