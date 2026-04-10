/**
 * Scrape IIPH product descriptions from zamzampublishers.com.pk
 * Extracts the product description text from each product page
 */
const fs = require('fs');
const path = require('path');

const products = require('../download/iiph_products.json');

function decodeEntities(text) {
  return text
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-').replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#8217;s/g, "'s")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '-').replace(/&mdash;/g, '—');
}

function extractDescription(html) {
  // Method 1: Look for description content after tab-content
  const tabContentIdx = html.indexOf('tab-content">');
  if (tabContentIdx > -1) {
    const content = html.substring(tabContentIdx + 14);
    // Get everything until the next major section (Additional Info, Return Policy, FAQ)
    const endIdx = content.indexOf('<div class="tab-pane') || content.indexOf('</div>', 2000) || 2000;
    let descHtml = content.substring(0, Math.min(endIdx, 5000));
    
    // Remove the "Description" heading text
    descHtml = descHtml.replace(/^Description\s*/i, '');
    
    // Clean HTML tags but keep text
    let text = descHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Cut at obvious section boundaries
    const sections = ['Additional Info', 'Return Policy', 'FAQ', 'Reviews', 'You may also like'];
    for (const section of sections) {
      const sIdx = text.indexOf(section);
      if (sIdx > 100) {
        text = text.substring(0, sIdx).trim();
        break;
      }
    }
    
    if (text.length > 50) {
      return decodeEntities(text);
    }
  }
  
  return null;
}

async function fetchDescription(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      return extractDescription(html);
    } catch (err) {
      if (attempt === retries) {
        console.error(`  Failed after ${retries + 1} attempts: ${err.message}`);
        return null;
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log(`Scraping descriptions for ${products.length} IIPH products...\n`);
  
  const results = [];
  let success = 0, failed = 0;
  
  // Process in batches of 5 with delay
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const num = `[${i + 1}/${products.length}]`;
    
    process.stdout.write(`${num} ${product.title.substring(0, 50)}... `);
    
    const description = await fetchDescription(product.sourceUrl);
    
    if (description) {
      success++;
      console.log(`OK (${description.length} chars)`);
      results.push({
        title: product.title,
        sourceUrl: product.sourceUrl,
        description: description,
        descriptionLength: description.length,
      });
    } else {
      failed++;
      console.log('NO DESC');
      results.push({
        title: product.title,
        sourceUrl: product.sourceUrl,
        description: null,
        descriptionLength: 0,
      });
    }
    
    // Delay between requests
    if ((i + 1) % 5 === 0) {
      await new Promise(r => setTimeout(r, 1500));
    } else {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\nResults: ${success} found, ${failed} missing`);
  
  const outputPath = path.join(__dirname, 'iiph-scraped-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Saved to ${outputPath}`);
  
  // Show some samples
  console.log('\n--- Sample Descriptions ---');
  results.filter(r => r.description).slice(0, 3).forEach(r => {
    console.log(`\n${r.title}:`);
    console.log(r.description.substring(0, 300) + '...');
  });
}

main().catch(console.error);
