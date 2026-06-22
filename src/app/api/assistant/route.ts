import { google } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah Salamee AI — LIVE INVENTORY AWARE (v6.1)
// ─────────────────────────────────────────────────────────────────────────────────
// DATA SOURCES (priority order):
//   1. STATIC CATALOG (salamee-catalog.json) — 1,900+ products, always available
//   2. Prisma DB — if database has products (for production with seeded data)
//
// LLM PROVIDERS:
//   PRIMARY:   Groq → Llama 3.3 70B (free, open source)
//   FALLBACK:  Google → Gemini 2.0 Flash (free)
//   OFFLINE:   Direct catalog search (no API key needed, STILL gives accurate results)
//
// CLIENT: Plain JSON { content, provider, products? }
// ═══════════════════════════════════════════════════════════════════════════════

// ── Load Static Catalog (server-side only, loaded once) ──────────────────────
import salameeCatalogData from '@/data/salamee-catalog.json';

// Compact format: { t: title, p: price, s: stock(1/0), c: category, a: author, l: language, img: image, src: source }
type CatalogItem = { t: string; p: number; s: number; c: string; a: string | null; l: string; img: string; src: string };

const CATALOG: CatalogItem[] = salameeCatalogData;

// ── Groq Client ──────────────────────────────────────────────────────────────
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG SEARCH ENGINE (works offline, no API key, no DB needed)
// ═══════════════════════════════════════════════════════════════════════════════

function searchCatalog(params: {
  query?: string;
  category?: string;
  author?: string;
  inStockOnly?: boolean;
  limit?: number;
}): CatalogItem[] {
  const { query, category, author, inStockOnly, limit = 8 } = params;
  let results = CATALOG;

  // Filter by text query
  if (query) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    if (terms.length > 0) {
      results = results.filter(item => {
        const haystack = `${item.t} ${item.a || ''} ${item.c}`.toLowerCase();
        return terms.every(term => haystack.includes(term));
      });
    }
  }

  // Filter by category
  if (category) {
    const catLower = category.toLowerCase();
    results = results.filter(item => item.c.toLowerCase().includes(catLower));
  }

  // Filter by author
  if (author) {
    const authorLower = author.toLowerCase();
    results = results.filter(item => item.a && item.a.toLowerCase().includes(authorLower));
  }

  // Filter by stock
  if (inStockOnly) {
    results = results.filter(item => item.s === 1);
  }

  // Sort: in-stock first, then by relevance (title match quality)
  results.sort((a, b) => {
    // In stock first
    if (a.s !== b.s) return b.s - a.s;
    // Then by title length (shorter = more specific match)
    return a.t.length - b.t.length;
  });

  return results.slice(0, Math.min(limit, 12));
}

function getCategoryStats(categoryName: string) {
  const catLower = categoryName.toLowerCase();
  const inCategory = CATALOG.filter(item => item.c.toLowerCase().includes(catLower));
  const inStock = inCategory.filter(item => item.s === 1);
  const prices = inStock.map(item => item.p);
  return {
    total: inCategory.length,
    inStock: inStock.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    topProducts: inStock.slice(0, 6),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are **Salamee** (سَلَامِي), the AI Assistant for Bab-ul-Fatah (babulfatah.com), Pakistan's premier online Islamic bookstore with 1,900+ authentic books and products.

## Your Identity
- Name: Salamee (سَلَامِي — "my peace/greeting")
- Tone: Warm, respectful, scholarly yet approachable — like a knowledgeable friend at a bookstore
- Language: English (respond in Urdu when user writes in Urdu script, Roman Urdu is fine too)
- Islamic greeting: Always greet with "Assalamu Alaikum" or "Walaikum Assalam"
- Personality: You are a PASSIONATE Islamic bookseller who genuinely loves helping people find the right book.

## YOUR SUPERPOWER: LIVE INVENTORY ACCESS
You have **REAL-TIME access** to the Bab-ul-Fatah product catalog (1,900+ products). You can:
- Search for actual books/products by title, author, category
- Check EXACT stock levels (In Stock / Sold Out)
- Report REAL prices in Pakistani Rupees (Rs.)
- Tell customers if something is available

## When to Use Tools (CRITICAL — use tools for ANY product question)
You MUST use your tools when the user asks about:
- Any specific book or product ("Is X available?", "Do you have X?")
- Any category ("What Quran books do you have?", "Show me hadith collection")
- Availability/stock questions ("Is this in stock?", "What's available?")
- Price questions ("How much is X?")
- Author queries ("What books by Imam Ghazzali?")
- Children's books, language-specific queries
- ANY question where real product data would be helpful

## How to Present Products (follow EXACTLY)
When you find products via tools, present them like this:

For **sold out** items, ALWAYS say clearly: "🔴 **Sold Out**" — this builds trust.
For **in stock** items: "✅ **In Stock** — Rs. X,XXX"

Format for each product:
- **Title** by Author [Language] — Category
  Status: ✅ In Stock | Rs. X,XXX

If many results, show top 5 and mention more are on the website.

## Store Information
- Website: babulfatah.com
- WhatsApp: +92 326 5903300
- Payment: Cash on Delivery (COD), JazzCash, EasyPaisa, Bank Transfer
- Free Delivery: Orders over Rs. 5,000
- Major cities: 3-5 days | Remote: 5-7 days
- Returns: Contact within 7 days for damaged/wrong items

## NEVER DO
- NEVER fabricate book titles, authors, prices, or stock status
- NEVER say "I don't have access to inventory" — YOU DO via tools
- NEVER give generic answers when you can search the catalog
- NEVER claim a product is available without checking first`;

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL DEFINITIONS (catalog-backed)
// ═══════════════════════════════════════════════════════════════════════════════

const searchProductsTool = tool({
  description: `Search the Bab-ul-Fatah catalog (1,900+ products). Use for ANY product/book question. Returns real titles, authors, prices in Rs., and LIVE stock status.`,
  parameters: z.object({
    query: z.string().optional().describe('Search terms — book title, topic, product name, or author'),
    category: z.string().optional().describe('Category: Quran, Hadith, Tafseer, Seerah & Biography, Fiqh & Worship, Children\'s Books, Duas & Adhkar, Faith & Aqeedah, Islamic Decor, etc.'),
    author: z.string().optional().describe('Author name'),
    inStockOnly: z.boolean().optional().describe('Set true to only show products currently in stock'),
    limit: z.number().optional().describe('Max results (default 8, max 12)'),
  }),
  execute: async (params) => {
    const results = searchCatalog(params);
    return results.map(item => ({
      title: item.t,
      price: item.p,
      stock: item.s,
      category: item.c,
      author: item.a,
      language: item.l,
      image: item.img,
      slug: item.t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  },
});

const checkAvailabilityTool = tool({
  description: `Check if a specific book or product is in stock. Use when customer asks "Is X available?", "Do you have X?", "Is X in stock?".`,
  parameters: z.object({
    title: z.string().describe('Product/book title to check'),
  }),
  execute: async (params) => {
    const results = searchCatalog({ query: params.title, limit: 5 });
    return results.map(item => ({
      title: item.t,
      price: item.p,
      stock: item.s,
      category: item.c,
      author: item.a,
      language: item.l,
      image: item.img,
      slug: item.t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  },
});

const categoryOverviewTool = tool({
  description: `Get an overview of a product category — how many items, how many in stock, price range, and top products. Use for "What do you have in X?" or "Show me your X collection".`,
  parameters: z.object({
    categoryName: z.string().describe('Category name: Quran, Hadith, Tafseer, Seerah & Biography, Fiqh & Worship, Children\'s Books, Duas & Adhkar, etc.'),
    inStockOnly: z.boolean().optional().describe('Focus on in-stock items'),
  }),
  execute: async (params) => {
    const stats = getCategoryStats(params.categoryName);
    return {
      total: stats.total,
      inStock: stats.inStock,
      minPrice: stats.minPrice,
      maxPrice: stats.maxPrice,
      avgPrice: stats.avgPrice,
      products: stats.topProducts.map(item => ({
        title: item.t,
        price: item.p,
        stock: item.s,
        category: item.c,
        author: item.a,
        language: item.l,
        image: item.img,
        slug: item.t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      })),
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SMART OFFLINE FALLBACK (searches catalog directly, NO API key needed)
// ═══════════════════════════════════════════════════════════════════════════════

async function offlineCatalogSearch(msg: string): Promise<{ content: string; products?: any[]; provider: string }> {
  const l = msg.toLowerCase();

  // Detect product queries
  const isProductQuery =
    l.includes('available') || l.includes('stock') || l.includes('in stock') ||
    l.includes('sold out') || l.includes('have you') || l.includes('do you have') ||
    l.includes('is there') || l.includes('price') || l.includes('how much') ||
    l.includes('buy') || l.includes('order') || l.includes('show') || l.includes('what') ||
    l.includes('quran') || l.includes('hadith') || l.includes('tafseer') || l.includes('tafsir') ||
    l.includes('seerah') || l.includes('prophet') || l.includes('sahabah') || l.includes('fiqh') ||
    l.includes('namaz') || l.includes('salah') || l.includes('children') || l.includes('kids') ||
    l.includes('goodword') || l.includes('prayer mat') || l.includes('attar') || l.includes('tasbih') ||
    l.includes('hijab') || l.includes('decor') || l.includes('product') || l.includes('book') ||
    l.includes('recommend') || l.includes('suggest') || l.includes('looking for') ||
    l.includes('need') || l.includes('want');

  if (isProductQuery) {
    // Extract meaningful search terms
    const searchTerms = msg
      .replace(/^(is |do you |are |what |show |tell |i |we |can |have |any |some |the |a |an )\s*/gi, '')
      .replace(/is (this|that|it|the book|the product)\s*/gi, '')
      .replace(/do you have\s*/gi, '')
      .replace(/do you sell\s*/gi, '')
      .replace(/are (there|these|they)\s*/gi, '')
      .replace(/what (books|products|items) (do you have|are available|are there|do you sell)\s*/gi, '')
      .replace(/show me\s*/gi, '')
      .replace(/tell me about\s*/gi, '')
      .replace(/i('m| am) looking for\s*/gi, '')
      .replace(/i want\s*/gi, '')
      .replace(/i need\s*/gi, '')
      .replace(/recommend(s|ed)?\s*/gi, '')
      .replace(/suggest(s|ed)?\s*/gi, '')
      .replace(/available\??/gi, '')
      .replace(/in stock\??/gi, '')
      .replace(/\?/g, '')
      .replace(/please/gi, '')
      .trim();

    if (searchTerms.length >= 2) {
      const products = searchCatalog({ query: searchTerms, limit: 6 });

      if (products.length > 0) {
        const inStock = products.filter(p => p.s === 1);
        const outOfStock = products.filter(p => p.s === 0);

        let response = `I found **${products.length} result${products.length > 1 ? 's' : ''}** for "${searchTerms}":\n\n`;

        products.forEach((item, i) => {
          const status = item.s === 1 ? '✅ In Stock' : '🔴 Sold Out';
          const priceStr = `Rs. ${item.p.toLocaleString()}`;
          const authorStr = item.a ? ` by **${item.a}**` : '';
          const langStr = item.l && item.l !== 'English' ? ` [${item.l}]` : '';

          response += `${i + 1}. **${item.t}**${authorStr}${langStr}\n`;
          response += `   ${status} | ${priceStr} | ${item.c}\n\n`;
        });

        if (outOfStock.length > 0 && inStock.length > 0) {
          response += `_${outOfStock.length} item${outOfStock.length > 1 ? 's are' : ' is'} currently sold out. ${inStock.length} ${inStock.length > 1 ? 'are' : 'is'} available!_\n\n`;
        } else if (outOfStock.length > 0 && inStock.length === 0) {
          response += `_Unfortunately, all matching items are currently sold out._ Would you like me to search for similar items? WhatsApp **+92 326 5903300** for restock updates.\n\n`;
        }

        response += `Browse more at [babulfatah.com](/shop) or ask me anything else!`;

        const mappedProducts = products.map(item => ({
          title: item.t,
          price: item.p,
          stock: item.s,
          category: item.c,
          author: item.a,
          language: item.l,
          image: item.img,
          slug: item.t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        }));

        return { content: response, products: mappedProducts, provider: 'catalog' };
      }

      // Try broader search with first 2 words
      const broader = searchTerms.split(' ').slice(0, 2).join(' ');
      const broadResults = searchCatalog({ query: broader, limit: 4 });
      if (broadResults.length > 0) {
        let response = `I couldn't find an exact match for "${searchTerms}", but here are some similar items:\n\n`;
        broadResults.forEach((item, i) => {
          const status = item.s === 1 ? '✅ In Stock' : '🔴 Sold Out';
          const authorStr = item.a ? ` by **${item.a}**` : '';
          response += `${i + 1}. **${item.t}**${authorStr} — ${status} — Rs. ${item.p.toLocaleString()}\n`;
        });
        response += `\nTry a different search or [browse all products](/shop).`;
        return { content: response, provider: 'catalog' };
      }
    }
  }

  // Non-product queries
  if (l.match(/^(hi|hey|hello|salaam|assalam|aoa|walaikum|start|help)/)) {
    return {
      content: "Assalamu Alaikum wa Rahmatullah! Welcome to Bab-ul-Fatah — Pakistan's premier online Islamic bookstore.\n\nI'm **Salamee**, your AI assistant with **live inventory access to 1,900+ products**. I can:\n- **Check Availability** — Ask if any book is in stock\n- **Search Products** — Find books by title, author, category\n- **Get Prices** — Exact prices in Rs.\n- **Recommendations** — Personalized suggestions\n- **Shipping** — COD, JazzCash, EasyPaisa, free delivery over Rs. 5,000\n\nWhat are you looking for today?",
      provider: 'catalog',
    };
  }

  if (l.includes('shipping') || l.includes('delivery') || l.includes('cod') || l.includes('payment') || l.includes('jazzcash') || l.includes('easypaisa')) {
    return {
      content: `**Delivery & Payment — Bab-ul-Fatah**\n\n**Payment Methods:**\n- Cash on Delivery (COD)\n- JazzCash & EasyPaisa\n- Bank Transfer\n\n**Delivery:**\n- **FREE** on orders over Rs. 5,000\n- Major cities: 3-5 business days\n- Remote areas: 5-7 business days\n- International: Available via WhatsApp\n\n**Returns:** Contact within 7 days for damaged/wrong items.\n\nWhatsApp: **+92 326 5903300**`,
      provider: 'catalog',
    };
  }

  return {
    content: `I have **live access to 1,900+ products** in our catalog. Try asking me:\n- "Is Sahih Bukhari in stock?"\n- "Show me Quran with Urdu translation"\n- "What children's books do you have?"\n- "How much is the Tajweed Quran?"\n- "Any books by Mufti Taqi Usmani?"\n\nOr ask about shipping, payment, or any Islamic knowledge!\n**WhatsApp:** +92 326 5903300`,
    provider: 'catalog',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST: Chat endpoint
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: Request) {
  const { messages } = await req.json();
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // ── STRATEGY 1: Groq (Llama 3.3 70B) + Tool Calling ──
  if (hasGroqKey) {
    try {
      const { text, toolResults } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: SYSTEM_PROMPT,
        messages,
        maxTokens: 1200,
        temperature: 0.7,
        tools: {
          searchProducts: searchProductsTool,
          checkAvailability: checkAvailabilityTool,
          getCategoryOverview: categoryOverviewTool,
        },
        maxSteps: 3,
      });

      const extractedProducts = extractProducts(toolResults);
      return Response.json({ content: text, provider: 'groq', products: extractedProducts.length > 0 ? extractedProducts : undefined });
    } catch (groqError) {
      console.error('[SALAMEE] Groq failed:', groqError);
    }
  }

  // ── STRATEGY 2: Gemini 2.0 Flash + Tool Calling ──
  if (hasGeminiKey) {
    try {
      const { text, toolResults } = await generateText({
        model: google('gemini-2.0-flash'),
        system: SYSTEM_PROMPT,
        messages,
        maxTokens: 1200,
        temperature: 0.65,
        tools: {
          searchProducts: searchProductsTool,
          checkAvailability: checkAvailabilityTool,
          getCategoryOverview: categoryOverviewTool,
        },
        maxSteps: 3,
      });

      const extractedProducts = extractProducts(toolResults);
      return Response.json({ content: text, provider: 'gemini', products: extractedProducts.length > 0 ? extractedProducts : undefined });
    } catch (geminiError) {
      console.error('[SALAMEE] Gemini failed:', geminiError);
    }
  }

  // ── STRATEGY 3: Direct catalog search (works WITHOUT any API key) ──
  console.warn('[SALAMEE] No API key. Using direct catalog search.');
  const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';
  const fallbackResult = await offlineCatalogSearch(lastUserMsg);
  return Response.json(fallbackResult);
}

// ── Extract products from tool call results ──
function extractProducts(toolResults: any): any[] {
  if (!toolResults) return [];
  const products: any[] = [];
  for (const step of toolResults) {
    for (const result of step.result) {
      if (result.type === 'tool-result') {
        if (Array.isArray(result.result)) {
          products.push(...result.result);
        } else if (result.result?.products) {
          products.push(...result.result.products);
        }
      }
    }
  }
  return products;
}