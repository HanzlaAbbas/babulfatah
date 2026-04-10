#!/usr/bin/env node
// ============================================================================
// Bab-ul-Fatah — SEO Description Engine v2 (High Uniqueness)
// ============================================================================
// Generates unique, SEO-optimized descriptions using a large pool of
// sentence fragments that combine dynamically. Each product gets a
// unique description based on its metadata hash.
// ============================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Deterministic hash for consistent selection per product ──────────────────
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

// ─── Category detection ──────────────────────────────────────────────────────
function detectCategory(name) {
  const n = name.toLowerCase();
  if (/quran|mushaf|translation|tafseer|tajweed|parah/.test(n)) return 'quran';
  if (/hadith|sahah|ahadith|bukhari|muslim|nasai|tirmidhi|abu dawud/.test(n)) return 'hadith';
  if (/biography|seerah|prophet|companion|imam|scholar/.test(n)) return 'biography';
  if (/family|women|children|kids|marital|wife|husband/.test(n)) return 'family';
  if (/prayer|supplication|dua|fasting|hajj|umrah|zakaat|faith|aqeedah|pillar/.test(n)) return 'worship';
  if (/fiqh|law|jurisprudence/.test(n)) return 'fiqh';
  if (/education|dars|reference|school|curriculum/.test(n)) return 'education';
  if (/tasbeeh|calligraphy|rehal|dates|bakhoor|decor|hanging|janamaz|romal|cap|ramadan|food|perfume|burner/.test(n)) return 'product';
  if (/history|lifestyle|health|science|dawah|miscellaneous|general/.test(n)) return 'general';
  return 'general';
}

function langName(lang) {
  return { URDU: 'Urdu', ARABIC: 'Arabic', ENGLISH: 'English', PUNJABI: 'Punjabi', SPANISH: 'Spanish' }[lang] || 'English';
}

// ─── Massive fragment pools per category ─────────────────────────────────────

const FRAGMENTS = {
  quran: {
    openings: [
      'Immerse yourself in the divine words of Allah with this exceptional {lang} {type}. The Holy Quran stands as the ultimate source of guidance, wisdom, and spiritual nourishment for Muslims across the world, offering timeless answers to life\'s most profound questions.',
      'Experience the beauty and majesty of the Holy Quran through this carefully prepared {lang} edition. As Islam\'s most sacred text, the Quran provides comprehensive guidance for every dimension of human existence — from personal morality to social justice.',
      'This remarkable {lang} {type} brings the reader closer to the message of the Quran through its thoughtful presentation and accessible {lang} translation. The Holy Quran remains the cornerstone of Islamic faith, offering divine wisdom that transcends time and culture.',
      'Open the doors to Quranic understanding with this beautifully produced {lang} edition. Whether you are memorizing, studying, or simply reading for blessings, this {type} serves as a faithful companion on your spiritual journey through Islam\'s holiest book.',
      'Discover the transformative power of the Holy Quran with this premium {lang} {type}. Each page invites deeper reflection and connection with the divine message, making it an ideal resource for both daily recitation and serious scholarly study.',
      'The Holy Quran, revealed to Prophet Muhammad ﷺ over fourteen centuries ago, continues to guide billions of Muslims worldwide. This {lang} edition makes the Quranic message accessible to {lang}-speaking readers with clarity and precision.',
    ],
    mids: [
      'This edition features professional formatting that enhances the reading experience, with clear typography and thoughtful layout design that makes it suitable for readers of all ages. The text has been carefully reviewed to ensure accuracy and readability.',
      'Scholars and students alike will appreciate the attention to detail in this publication, which includes essential markings and references that aid in proper recitation and comprehension of the Quranic text.',
      'Designed for both personal use and gifting, this {type} represents the finest standards of Islamic publishing. Its durable binding and quality paper ensure it will remain a treasured part of your Islamic library for years to come.',
      'The presentation of this {type} reflects a deep respect for the sacred text it contains, with careful attention to every detail of production — from the choice of script to the quality of materials used in its crafting.',
      'Ideal for daily recitation, memorization, or contemplative reading, this {lang} Quran {type} supports all forms of engagement with the divine text. Its portable yet substantial format makes it perfect for home, mosque, or travel use.',
    ],
    closes: [
      'Available now at Bab-ul-Fatah — Pakistan\'s most trusted Islamic bookstore. Order online for fast, reliable delivery to your doorstep anywhere in Pakistan, and enrich your spiritual life with this essential Islamic treasure.',
      'Bring this blessed Quran {type} into your home and experience the peace and guidance that comes from regular engagement with Allah\'s words. Shop confidently at Bab-ul-Fatah, where quality Islamic books are our specialty.',
      'Order this essential Quranic {type} from Bab-ul-Fatah today. As Pakistan\'s leading Islamic bookstore, we ensure every order is handled with care and delivered promptly to your location.',
      'Add this beautiful Quran {type} to your Islamic library or gift it to a loved one. Available at competitive prices from Bab-ul-Fatah — your reliable source for authentic Islamic publications in Pakistan.',
    ],
  },
  hadith: {
    openings: [
      'Connect with the Prophetic tradition through this authoritative {lang} collection of Hadith. The authentic sayings and actions of Prophet Muhammad ﷺ represent the second source of Islamic guidance after the Holy Quran, providing practical wisdom for every aspect of Muslim life.',
      'This comprehensive {lang} Hadith compilation preserves the precious words and deeds of the Messenger of Allah ﷺ, offering readers direct access to the Prophetic example that has guided Muslims for over fourteen centuries.',
      'Strengthen your faith and practice with this meticulously compiled {lang} Hadith collection. Each narration has been carefully verified through rigorous chains of transmission, ensuring the authenticity that Islamic scholarship demands.',
      'Explore the rich heritage of Prophetic wisdom with this essential {lang} Hadith reference. Covering topics from faith and purification to social conduct and worship, this collection serves as a comprehensive guide to living according to the Sunnah.',
      'This invaluable {lang} work brings together authentic narrations that illuminate the path of righteousness laid out by Prophet Muhammad ﷺ. It is an indispensable resource for anyone seeking to implement Islamic teachings in their daily life.',
    ],
    mids: [
      'The narrations in this collection address the full spectrum of Muslim life, including matters of belief, worship, character development, family relations, and community welfare. Each Hadith is presented with context that aids understanding and practical application.',
      'Organized thematically for easy reference, this Hadith collection allows readers to quickly find guidance on specific topics. The clear {lang} translation ensures that the profound wisdom of each narration is accessible to contemporary readers.',
      'Scholars have praised this collection for its scholarly rigor and accessibility. The compiler\'s meticulous approach to authentication and organization makes this work a reliable reference for both academic study and personal enrichment.',
      'This work stands as a bridge between classical Islamic scholarship and contemporary Muslim life, presenting timeless Prophetic guidance in a format that speaks directly to the challenges and opportunities faced by Muslims today.',
    ],
    closes: [
      'Add this essential Hadith collection to your Islamic library. Available at Bab-ul-Fatah with fast shipping throughout Pakistan — order online today and deepen your understanding of the Prophetic tradition.',
      'Invest in your knowledge of the Sunnah with this authentic Hadith compilation. Shop at Bab-ul-Fatah — Pakistan\'s trusted Islamic bookstore — for the best selection of authentic Islamic literature.',
      'Order this comprehensive Hadith reference from Bab-ul-Fatah and have it delivered to your door anywhere in Pakistan. Strengthening your connection to the Prophetic tradition starts with the right resources.',
    ],
  },
  biography: {
    openings: [
      'Embark on a journey through Islamic history with this compelling {lang} biography. The lives of Islam\'s greatest figures — from the Prophet Muhammad ﷺ and his noble companions to the great scholars and reformers — offer timeless lessons in faith, courage, and perseverance.',
      'This engaging {lang} biography brings to life the extraordinary stories of Islam\'s most influential personalities. Through meticulous research and vivid narrative, it illuminates the struggles, triumphs, and spiritual journeys that shaped Islamic civilization.',
      'Discover the inspiring lives that defined Islamic history with this beautifully written {lang} account. From the revelation of the Quran to the spread of Islam across continents, these biographies capture the essence of what it means to live a life dedicated to Allah.',
      'This important {lang} work chronicles the remarkable achievements of Islam\'s greatest men and women, whose faith, wisdom, and sacrifice continue to inspire Muslims around the world today. Each biography offers practical lessons for contemporary readers.',
    ],
    mids: [
      'Written with scholarly precision and narrative skill, this biography draws upon authentic historical sources to present an accurate and engaging account. The author weaves together historical facts with spiritual insights, creating a work that educates and inspires in equal measure.',
      'Readers will gain a profound understanding of the historical context in which these great figures lived, the challenges they faced, and the enduring impact of their contributions to Islamic thought and civilization.',
      'This biography serves as both an educational resource and a source of spiritual inspiration. It reminds us that the same faith and determination that guided these great personalities can guide us in our own lives and communities.',
    ],
    closes: [
      'Enrich your understanding of Islamic history with this essential biography. Order from Bab-ul-Fatah — Pakistan\'s premier Islamic bookstore — with reliable delivery across the country.',
      'Bring home this inspiring Islamic biography and discover the remarkable lives that shaped Muslim civilization. Available now at Bab-ul-Fatah at competitive prices.',
    ],
  },
  family: {
    openings: [
      'Build a stronger, faith-centered family with this insightful {lang} Islamic guide. Islam provides comprehensive guidance for every aspect of family life, from marriage and parenting to sibling relationships and elder care, and this book brings that wisdom into clear focus.',
      'Nurture your family\'s spiritual growth with this practical {lang} resource on Islamic family life. Addressing the real challenges faced by Muslim families in the modern world, this book offers solutions grounded in the Quran and authentic Sunnah.',
      'This essential {lang} guide provides Muslim families with the knowledge and tools needed to create homes filled with faith, love, and mutual respect. Drawing from authentic Islamic sources, it covers everything from choosing a spouse to raising righteous children.',
    ],
    mids: [
      'With practical advice and spiritual guidance, this book addresses contemporary family issues while remaining firmly rooted in Islamic principles. Topics include maintaining strong marriages, effective Islamic parenting, managing household finances according to Shariah, and fostering a love of Islam in young hearts.',
      'Each chapter provides actionable guidance supported by Quranic verses, authentic Hadith, and scholarly commentary, making it suitable for both individual study and family reading circles.',
    ],
    closes: [
      'Invest in your family\'s well-being with this invaluable Islamic resource. Order from Bab-ul-Fatah — Pakistan\'s trusted Islamic bookstore — and take the first step toward building a more harmonious, faith-filled home.',
      'Give your family the gift of authentic Islamic knowledge. Shop at Bab-ul-Fatah for this essential family guide and have it delivered anywhere in Pakistan.',
    ],
  },
  worship: {
    openings: [
      'Perfect your practice of Islam\'s essential acts of worship with this detailed {lang} guide. From the five daily prayers to fasting, charity, and pilgrimage, this comprehensive resource covers everything a Muslim needs to know to fulfill their religious obligations correctly.',
      'This authoritative {lang} reference provides step-by-step guidance for performing each pillar of Islam according to authentic scholarly sources. Whether you are a new Muslim learning the basics or an experienced practitioner seeking to refine your practice, this book is an essential companion.',
      'Deepen your worship and strengthen your relationship with Allah through this comprehensive {lang} guide to Islamic rituals and practices. Based on the Quran, authentic Sunnah, and established scholarly consensus, this work offers reliable guidance for every aspect of Muslim worship.',
    ],
    mids: [
      'Each chapter addresses a specific act of worship with clarity and thoroughness, providing the necessary knowledge to perform it correctly while also explaining the wisdom and spiritual benefits behind each practice.',
      'The author combines scholarly depth with practical accessibility, making complex rulings easy to understand and implement. Common mistakes and misunderstandings are addressed, ensuring readers can worship with confidence and sincerity.',
    ],
    closes: [
      'Order this essential worship guide from Bab-ul-Fatah today. As Pakistan\'s leading Islamic bookstore, we ensure prompt delivery of authentic Islamic resources to your doorstep.',
      'Perfect your daily worship with this must-have Islamic guide. Available now at Bab-ul-Fatah — shop online for the best selection of Islamic books in Pakistan.',
    ],
  },
  fiqh: {
    openings: [
      'Navigate the practical application of Islamic law with this comprehensive {lang} fiqh reference. Understanding the principles of Islamic jurisprudence is essential for every Muslim seeking to ensure their daily life, worship, and business dealings align with Shariah.',
      'This scholarly {lang} work presents Islamic legal rulings in a clear, organized format that makes complex fiqh issues accessible to both students and general readers. Covering worship, transactions, family law, and contemporary issues.',
    ],
    mids: [
      'Based on authentic sources and established schools of Islamic jurisprudence, this book provides reliable guidance for the practical situations Muslims encounter in daily life. The author\'s balanced approach respects scholarly tradition while addressing modern challenges.',
      'Organized by topic for easy reference, this fiqh guide covers everything from ritual purification and prayer to financial transactions and contemporary ethical questions, making it a comprehensive resource for Islamic legal guidance.',
    ],
    closes: [
      'Add this essential fiqh reference to your Islamic library. Order from Bab-ul-Fatah — Pakistan\'s trusted source for authentic Islamic scholarly works.',
      'Get this comprehensive Islamic jurisprudence guide from Bab-ul-Fatah with fast delivery across Pakistan. Ensure your daily practice aligns with authentic Islamic teachings.',
    ],
  },
  education: {
    openings: [
      'Advance your Islamic education with this comprehensive {lang} academic resource designed for students and educators alike. This work provides structured, progressive learning in essential Islamic disciplines that form the foundation of a sound Islamic education.',
      'This well-organized {lang} educational text bridges the gap between traditional Islamic scholarship and modern pedagogical methods, making advanced Islamic subjects accessible to students of all backgrounds and levels.',
    ],
    mids: [
      'Structured for progressive learning, this resource guides students through complex subjects with clarity and precision. Each chapter builds upon the previous one, creating a cohesive learning experience that supports both classroom instruction and self-directed study.',
      'Drawing upon centuries of Islamic educational tradition, this work presents essential knowledge in a format that respects classical scholarship while meeting the needs of contemporary learners.',
    ],
    closes: [
      'Invest in your Islamic education with this essential academic resource. Available at Bab-ul-Fatah — Pakistan\'s trusted Islamic bookstore — with delivery across the country.',
      'Order this comprehensive educational Islamic book from Bab-ul-Fatah today and take your understanding of Islam to the next level.',
    ],
  },
  product: {
    openings: [
      'Elevate your Islamic lifestyle with this premium quality item from Bab-ul-Fatah\'s curated collection. Carefully selected for quality, authenticity, and craftsmanship, this product is designed to enhance your daily worship and spiritual practice.',
      'This beautifully crafted Islamic product combines traditional design with practical functionality, making it a meaningful addition to your home or a thoughtful gift for loved ones. Each item in our collection has been chosen for its quality and adherence to Islamic values.',
    ],
    mids: [
      'Made with attention to detail and quality materials, this product reflects the excellence that Islamic craftsmanship is known for. It serves as both a practical item for daily use and a beautiful reminder of faith.',
      'Whether for personal use or as a gift, this premium Islamic product represents the perfect blend of aesthetic appeal and spiritual significance that enriches everyday life.',
    ],
    closes: [
      'Order this quality Islamic product from Bab-ul-Fatah — Pakistan\'s trusted source for authentic Islamic goods. Fast, reliable delivery available across Pakistan.',
      'Shop at Bab-ul-Fatah for this premium Islamic product and have it delivered to your doorstep anywhere in Pakistan.',
    ],
  },
  general: {
    openings: [
      'Expand your Islamic knowledge with this valuable {lang} publication from Bab-ul-Fatah\'s extensive collection. This carefully researched work provides authentic, reliable information on its subject, making it a worthy addition to any Muslim\'s personal library.',
      'This thoughtfully written {lang} Islamic book offers readers a comprehensive exploration of its subject matter, drawing upon authentic sources and scholarly expertise to deliver content that is both informative and spiritually enriching.',
      'Discover the depth and beauty of Islamic knowledge with this engaging {lang} publication. Written with clarity and precision, this work serves as an essential resource for Muslims seeking to deepen their understanding of the faith.',
    ],
    mids: [
      'The author brings extensive knowledge and a passion for Islamic scholarship to this work, creating a resource that educates and inspires in equal measure. Each chapter is carefully structured to build understanding progressively.',
      'This publication represents the commitment of Islamic scholars and publishers to make authentic, quality Islamic knowledge accessible to {lang}-speaking readers. Its thorough coverage and clear presentation make it suitable for a wide range of readers.',
    ],
    closes: [
      'Add this valuable Islamic book to your collection. Order online from Bab-ul-Fatah with fast, reliable delivery to any location in Pakistan.',
      'Shop at Bab-ul-Fatah — Pakistan\'s most trusted Islamic bookstore — for this and hundreds of other quality Islamic publications.',
    ],
  },
};

// ─── Description generator ───────────────────────────────────────────────────

function generateDescription(product) {
  const seed = hashStr(product.id);
  const catKey = detectCategory(product.category?.name || '');
  const fragments = FRAGMENTS[catKey] || FRAGMENTS.general;
  const lang = langName(product.language || 'ENGLISH');
  const catName = product.category?.name || 'Islamic Books';
  
  // Determine product type
  const title = product.title || '';
  let type = 'book';
  if (/set|vol|volume|complete/i.test(title)) type = 'set';
  else if (/rehal/i.test(catName)) type = 'Quran stand';
  else if (/tasbeeh/i.test(catName)) type = 'tasbeeh';
  else if (/calligraphy/i.test(catName)) type = 'calligraphy piece';
  else if (/janamaz|prayer mat/i.test(catName)) type = 'prayer mat';
  else if (/mushaf/i.test(catName)) type = 'Mushaf';
  else if (/date/i.test(catName)) type = 'product';
  else if (/bakhoor|burner|perfume/i.test(catName)) type = 'product';
  else if (/decor|hanging|romal|cap/i.test(catName)) type = 'product';
  
  // Pick unique fragments using seed-based selection
  const opening = pick(fragments.openings, seed);
  const mid = pick(fragments.mids, seed + 1);
  const close = pick(fragments.closes, seed + 2);
  
  // Assemble and personalize
  let desc = opening.replace(/{lang}/g, lang).replace(/{type}/g, type);
  
  // Add author context
  const author = product.author?.name || '';
  if (author && author.length > 0 && author.length < 60 && !/darussalam|goodword|product/i.test(author)) {
    desc += ` Authored by the respected scholar ${author}, this work brings years of dedicated research and Islamic scholarship to bear on its subject.`;
  }
  
  desc += '\n\n' + mid.replace(/{lang}/g, lang).replace(/{type}/g, type);
  desc += '\n\n' + close.replace(/{lang}/g, lang).replace(/{type}/g, type);
  
  // Add price CTA
  if (product.price > 0) {
    desc += ` Priced at Rs. ${product.price.toLocaleString('en-PK')}, it offers exceptional value for seekers of authentic Islamic knowledge and products.`;
  }
  
  return desc.trim();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  console.log('\n═'.repeat(60));
  console.log('  Bab-ul-Fatah — SEO Description Engine v2');
  console.log('═'.repeat(60) + '\n');

  const products = await prisma.product.findMany({
    select: {
      id: true, title: true, price: true, language: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  let updated = 0;
  for (const product of products) {
    const desc = generateDescription(product);
    await prisma.product.update({ where: { id: product.id }, data: { description: desc } });
    updated++;
    if (updated % 200 === 0) process.stdout.write(`\r  Updated: ${updated}/${products.length}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\r  ✅ Updated: ${updated}/${products.length} in ${elapsed}s`);

  // Verify uniqueness
  const all = await prisma.product.findMany({ select: { description: true } });
  const starts = new Set(all.map(p => p.description.slice(0, 60)));
  const fulls = new Set(all.map(p => p.description));
  const avgLen = Math.round(all.reduce((s, p) => s + p.description.length, 0) / all.length);

  console.log(`  Unique openings: ${starts.size}/${all.length} (${Math.round(starts.size/all.length*100)}%)`);
  console.log(`  Fully unique: ${fulls.size}/${all.length} (${Math.round(fulls.size/all.length*100)}%)`);
  console.log(`  Avg length: ${avgLen} chars (~${Math.round(avgLen/5)} words)`);
  console.log('═'.repeat(60) + '\n');

  // Samples from different categories
  const samples = await prisma.$queryRaw`SELECT p.title, p.description, c.name as category_name
    FROM "Product" p JOIN "Category" c ON p."categoryId" = c.id 
    WHERE c.name IN ('Quran', 'Hadith', 'Biography', 'Family', 'Islamic Products', 'Pillars Of Islam')
    LIMIT 6`;
  samples.forEach((s, i) => {
    console.log(`--- ${s.title} [${s.category_name}] ---`);
    console.log(s.description.slice(0, 350) + '...\n');
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
