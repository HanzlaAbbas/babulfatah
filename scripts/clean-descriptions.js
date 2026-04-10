#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — Description Cleanup Script
// ============================================================================
// Cleans up product descriptions by removing HTML remnants, competitor
// branding, and normalizing formatting. This is a quick programmatic
// cleanup until AI description generation rate limits reset.
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, description: true },
  });

  let cleaned = 0;
  for (const p of products) {
    let desc = p.description || '';

    // Remove HTML tags
    desc = desc.replace(/<[^>]+>/g, '');

    // Remove common HTML entities
    desc = desc.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/&copy;/g, '©').replace(/&reg;/g, '®');

    // Remove Darussalam branding
    desc = desc.replace(/Darussalam\s+(Publishers|Research|International|PK)?/gi, 'Bab-ul-Fatah');
    desc = desc.replace(/darussalam\.pk/gi, 'babulfatah.com');
    desc = desc.replace(/www\.darussalam\.com/gi, 'www.babulfatah.com');

    // Remove "Best Seller" / "New Arrival" marketing fluff
    desc = desc.replace(/Best\s+Seller/gi, '').replace(/New\s+Arrival/gi, '').replace(/Top\s+Rated/gi, '');

    // Remove excess whitespace and normalize line breaks
    desc = desc.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();

    // Ensure minimum description quality
    if (desc.length < 30) {
      desc = `Explore ${desc.length > 0 ? desc : 'this product'} at Bab-ul-Fatah — your trusted source for authentic Islamic books and products in Pakistan. Browse our complete collection of quality Islamic literature at competitive prices.`;
    }

    // Add Bab-ul-Fatah branding at the end if not present
    if (!desc.includes('Bab-ul-Fatah') && desc.length > 50) {
      desc += '\n\nAvailable at Bab-ul-Fatah — Pakistan\'s trusted Islamic bookstore.';
    }

    await prisma.product.update({ where: { id: p.id }, data: { description: desc } });
    cleaned++;
    if (cleaned % 200 === 0) process.stdout.write(`\r  Cleaned: ${cleaned}/${products.length}`);
  }

  console.log(`\n  ✅ Cleaned ${cleaned} product descriptions`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
