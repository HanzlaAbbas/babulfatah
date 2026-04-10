/**
 * Scrape IIPH products from zamzampublishers.com.pk
 * 85 products across 8 pages
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://zamzampublishers.com.pk/product-category/imported-books/iiph/';

function decodeEntities(text) {
  return text
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-').replace(/&#8212;/g, '—')
    .replace(/&#8360;/g, '₨').replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#8217;s/g, "'s");
}

async function fetchPage(pageNum) {
  const url = pageNum === 1 ? BASE : `${BASE}page/${pageNum}/`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for page ${pageNum}`);
  return res.text();
}

function parseProducts(html) {
  const products = [];
  
  // Pattern: find each product card by looking for the image with product link
  // Each card has: image link -> out of stock badge -> content with h3 + price
  
  // Match product image cards
  const imgCardRe = /<a href="(https:\/\/zamzampublishers\.com\.pk\/product\/([^"]+))"[^>]*class="[^"]*nikstore-hover-thumb[^"]*"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"[^>]*\/?>/gi;
  
  let imgMatch;
  const imageData = [];
  while ((imgMatch = imgCardRe.exec(html)) !== null) {
    imageData.push({
      url: imgMatch[1],
      slug: imgMatch[2].replace(/\/$/, ''),
      imgSrc: imgMatch[3],
      alt: decodeEntities(imgMatch[4])
    });
  }
  
  // Match titles from h3
  const h3Re = /<h3[^>]*class="[^"]*nik-pstyle-5-title[^"]*"[^>]*>\s*<a\s+href="https:\/\/zamzampublishers\.com\.pk\/product\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  
  const titleData = [];
  let h3Match;
  while ((h3Match = h3Re.exec(html)) !== null) {
    titleData.push({
      slug: h3Match[1].replace(/\/$/, ''),
      title: decodeEntities(h3Match[2].trim())
    });
  }
  
  // Match prices (sale price from <ins> tag)
  // Format: <ins ...><span class="woocommerce-Price-amount amount"><bdi><span ...>₨</span>&nbsp;1,767</bdi></span></ins>
  const priceRe = /<ins[^>]*><span class="woocommerce-Price-amount amount"><bdi><span[^>]*>[^<]*<\/span>&nbsp;([\d,]+)<\/bdi><\/span><\/ins>/gi;
  const prices = [];
  let priceMatch;
  while ((priceMatch = priceRe.exec(html)) !== null) {
    prices.push(parseInt(priceMatch[1].replace(/,/g, ''), 10));
  }
  
  // If no sale price, try regular price
  if (prices.length === 0) {
    const regularPriceRe = /<span class="woocommerce-Price-amount amount"><bdi><span[^>]*>[^<]*<\/span>&nbsp;([\d,]+)<\/bdi><\/span>/gi;
    while ((priceMatch = regularPriceRe.exec(html)) !== null) {
      prices.push(parseInt(priceMatch[1].replace(/,/g, ''), 10));
    }
  }
  
  // Match out of stock - check for nik-oos-badge within each product
  // We'll do this per product card
  const oosRe = /nik-oos-badge/gi;
  const oosPositions = [];
  let oosMatch;
  while ((oosMatch = oosRe.exec(html)) !== null) {
    oosPositions.push(oosMatch.index);
  }
  
  // Match "Out of stock" title on add-to-cart button
  const cartOosRe = /title="Out of stock"/gi;
  const cartOosPositions = [];
  let cartOosMatch;
  while ((cartOosMatch = cartOosRe.exec(html)) !== null) {
    cartOosPositions.push(cartOosMatch.index);
  }
  
  // Combine data - products are in order in the HTML
  const count = Math.min(imageData.length, titleData.length);
  for (let i = 0; i < count; i++) {
    const img = imageData[i];
    const title = titleData[i];
    const price = prices[i] || null;
    
    // Check if this product is out of stock
    // Find the h3 position for this product
    const h3Pos = html.indexOf(`product/${img.slug}`);
    let isOOS = false;
    
    // Check within 3000 chars after the product link for OOS indicators
    if (h3Pos > -1) {
      const context = html.substring(h3Pos, h3Pos + 4000);
      isOOS = context.includes('nik-oos-badge') || context.includes('title="Out of stock"');
    }
    
    // Get the full-size image URL (replace -300xNNN with larger version)
    let fullImg = img.imgSrc;
    // Try to get a larger image
    fullImg = fullImg.replace(/-\d+x\d+\./, '.');
    
    products.push({
      slug: img.slug,
      title: title.title || img.alt,
      price: price,
      image: fullImg,
      inStock: !isOOS,
      sourceUrl: img.url,
    });
  }
  
  return products;
}

async function main() {
  console.log('🚀 Scraping IIPH products from zamzampublishers.com.pk...\n');
  
  const allProducts = [];
  
  for (let page = 1; page <= 10; page++) {
    console.log(`  Fetching page ${page}...`);
    try {
      const html = await fetchPage(page);
      const products = parseProducts(html);
      
      if (products.length === 0) {
        console.log(`    No products found, stopping.`);
        break;
      }
      
      console.log(`    Found ${products.length} products`);
      allProducts.push(...products);
    } catch (err) {
      console.error(`    Error: ${err.message}`);
      break;
    }
    
    await new Promise(r => setTimeout(r, 800));
  }
  
  console.log(`\n✅ Total: ${allProducts.length} products`);
  const inStock = allProducts.filter(p => p.inStock).length;
  const outOfStock = allProducts.filter(p => !p.inStock).length;
  const withPrice = allProducts.filter(p => p.price).length;
  console.log(`  In Stock: ${inStock}`);
  console.log(`  Out of Stock: ${outOfStock}`);
  console.log(`  With Price: ${withPrice}`);
  console.log(`  Without Price: ${allProducts.length - withPrice}`);
  
  // Save
  const outputPath = path.join(__dirname, '..', 'download', 'iiph_products.json');
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
  console.log(`\n💾 Saved to ${outputPath}`);
  
  // Print sample
  console.log('\n--- Sample Products ---');
  allProducts.slice(0, 5).forEach((p, i) => {
    console.log(`${i+1}. ${p.title}`);
    console.log(`   Price: ${p.price ? 'Rs. ' + p.price.toLocaleString() : 'N/A'}`);
    console.log(`   Stock: ${p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
    console.log(`   Image: ${p.image ? '✓' : '✗'}`);
    console.log('');
  });
}

main().catch(console.error);
