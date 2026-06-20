import { google } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah Salamee AI — LIVE INVENTORY AWARE (v6)
// ─────────────────────────────────────────────────────────────────────────────────
// Dual-provider with TOOL CALLING:
//   PRIMARY:   Groq → Llama 3.3 70B + tool use
//   FALLBACK:  Google → Gemini 2.0 Flash + tool use
//   OFFLINE:   Smart fallback with live DB product search
//
// KEY UPGRADE (v6): AI now queries REAL inventory from database.
//   - "Is [book] available?" → checks stock, reports exact status
//   - "Show me Quran books" → returns actual products with prices & stock
//   - "What's in stock for children?" → live inventory check
//   - Tool-calling architecture: LLM decides when to search, what to search
//
// CLIENT: Uses plain fetch (no ai/react needed)
//   Returns JSON: { content, provider, products? }
// ═══════════════════════════════════════════════════════════════════════════════

// ── Groq Client ──────────────────────────────────────────────────────────────
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// ── System Prompt (tool-aware) ───────────────────────────────────────────────
const SYSTEM_PROMPT = `You are **Salamee**, the AI Assistant for Bab-ul-Fatah (babulfatah.com), Pakistan's premier online Islamic bookstore with 1,200+ authentic books and products.

## Your Identity
- Name: Salamee (سَلَامِي — "my peace/greeting")
- Tone: Warm, respectful, scholarly yet approachable — like a knowledgeable friend at a bookstore
- Language: English (respond in Urdu when user writes in Urdu script, Roman Urdu is fine too)
- Islamic greeting: Always greet with "Assalamu Alaikum" or "Walaikum Assalam"
- Personality: You are a PASSIONATE Islamic bookseller who genuinely loves helping people find the right book.

## YOUR SUPERPOWER: LIVE INVENTORY ACCESS
You have **REAL-TIME access** to the Bab-ul-Fatah product database. You can:
- Search for actual books/products by title, author, category, language
- Check EXACT stock levels and availability
- Report REAL prices in Pakistani Rupees (Rs.)
- Tell customers if something is IN STOCK or SOLD OUT

## When to Use Tools (CRITICAL)
You MUST use your search tools when the user asks about:
- Any specific book or product ("Is X available?", "Do you have X?")
- Any category ("What Quran books do you have?", "Show me hadith collection")
- Availability/stock questions ("Is this in stock?", "What's available?")
- Price questions ("How much is X?")
- Author queries ("What books by Imam Ghazzali do you have?")
- Children's books, language-specific queries
- ANY question where real product data would be helpful

## How to Present Products
When you find products, present them beautifully:
- For 1-2 products: Describe each with title, author, price, and stock status
- For 3-5 products: Use a numbered list with key details
- For 6+ products: Show top 5-6 and mention more are available on the website
- ALWAYS mention if a product is SOLD OUT — this builds trust
- ALWAYS give the exact price in Rs. when known
- If user asks in Urdu, respond in Urdu with product names in English

## Store Information
- Website: babulfatah.com
- WhatsApp: +92 326 5903300 (for orders, custom requests, international shipping)
- Payment Methods: Cash on Delivery (COD), JazzCash, EasyPaisa, Bank Transfer
- Free Delivery: Orders over Rs. 5,000 (across Pakistan)
- Standard Delivery: 3-5 business days (major cities)
- Remote Areas: 5-7 business days
- International Shipping: Available on request via WhatsApp
- Returns: Contact within 7 days for damaged/wrong items

## Response Quality Standards
1. SPECIFICITY: Use tool results to give exact titles, prices, stock status
2. HONESTY: If sold out, SAY SO clearly. Suggest alternatives.
3. CONTEXT: Read full conversation history
4. RECOMMENDATIONS: Suggest 2-3 alternatives when something is sold out
5. ISLAMIC ETIQUETTE: Include relevant references when appropriate
6. CONCISE + DEEP: Focused answers (3-5 paragraphs) but information-dense

## Formatting Rules
- Use **bold** for book titles and key terms
- Use bullet points (- ) for lists
- Use numbered lists for rankings/steps
- ALWAYS include exact prices from tool results (e.g., "Rs. 1,250")
- Stock status: "✅ In Stock", "🔴 Sold Out"
- Include a link to product: [View Product](/shop/slug-here)
- CTA: browse category, visit website, WhatsApp for complex queries

## NEVER DO
- NEVER fabricate book titles, authors, prices, or stock status
- NEVER say "I don't have access to inventory" — YOU DO via tools
- NEVER give generic answers when you can search the database
- NEVER claim a product is available without checking first
- NEVER break Islamic character in conversation`;

// ── Product Search Tool ──────────────────────────────────────────────────────
async function searchProductsFromDB(params: {
  query?: string;
  category?: string;
  author?: string;
  language?: string;
  inStockOnly?: boolean;
  limit?: number;
}) {
  try {
    const { query, category, author, language, inStockOnly, limit = 8 } = params;

    const where: Prisma.ProductWhereInput = {};

    // Build search conditions
    const conditions: Prisma.ProductWhereInput[] = [];

    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      if (terms.length > 0) {
        const searchOr = terms.flatMap((term) => [
          { title: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { sku: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { tags: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { author: { name: { contains: term, mode: Prisma.QueryMode.insensitive } } },
          { category: { name: { contains: term, mode: Prisma.QueryMode.insensitive } } },
        ]);
        conditions.push({ OR: searchOr });
      }
    }

    if (category) {
      conditions.push({
        category: { name: { contains: category, mode: Prisma.QueryMode.insensitive } },
      });
    }

    if (author) {
      conditions.push({
        author: { name: { contains: author, mode: Prisma.QueryMode.insensitive } },
      });
    }

    if (language) {
      conditions.push({ language: language as Prisma.EnumLanguageFilter });
    }

    if (inStockOnly) {
      conditions.push({ stock: { gt: 0 } });
    }

    where.AND = conditions;

    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        stock: true,
        language: true,
        sku: true,
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { order: 'asc' }, select: { id: true, url: true, altText: true } },
      },
      orderBy: [{ stock: 'desc' }, { title: 'asc' }],
      take: Math.min(limit, 12),
    });

    return products;
  } catch (error) {
    console.error('[SALAMEE_TOOL] searchProducts error:', error);
    return [];
  }
}

// ── Check Single Product Availability ────────────────────────────────────────
async function checkProductAvailability(params: { title?: string; sku?: string }) {
  try {
    const { title, sku } = params;

    if (!title && !sku) return null;

    const where: Prisma.ProductWhereInput = {};
    if (sku) {
      where.sku = sku;
    } else if (title) {
      const terms = title.split(/\s+/).filter(Boolean);
      where.OR = terms.map((term) => ({
        title: { contains: term, mode: Prisma.QueryMode.insensitive },
      }));
    }

    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        stock: true,
        language: true,
        sku: true,
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { order: 'asc' }, select: { id: true, url: true, altText: true } },
      },
      take: 5,
      orderBy: { stock: 'desc' },
    });

    return products;
  } catch (error) {
    console.error('[SALAMEE_TOOL] checkAvailability error:', error);
    return null;
  }
}

// ── Get Category Overview ────────────────────────────────────────────────────
async function getCategoryOverview(params: { categoryName: string; inStockOnly?: boolean }) {
  try {
    const { categoryName, inStockOnly = false } = params;

    const where: Prisma.ProductWhereInput = {
      category: { name: { contains: categoryName, mode: Prisma.QueryMode.insensitive } },
    };

    if (inStockOnly) {
      where.AND = [{ stock: { gt: 0 } }];
    }

    const [products, count, inStockCount, avgPrice] = await Promise.all([
      db.product.findMany({
        where: { ...where, AND: [...(where.AND || []), { stock: { gt: 0 } }] },
        select: {
          id: true, title: true, slug: true, price: true, stock: true, language: true,
          author: { select: { name: true } },
          category: { select: { name: true } },
          images: { take: 1, orderBy: { order: 'asc' }, select: { url: true, altText: true } },
        },
        orderBy: { stock: 'desc' },
        take: 6,
      }),
      db.product.count({ where }),
      db.product.count({ where: { ...where, stock: { gt: 0 } } }),
      db.product.aggregate({ where, _avg: { price: true }, _min: { price: true }, _max: { price: true } }),
    ]);

    return { products, count, inStockCount, avgPrice: avgPrice._avg.price, minPrice: avgPrice._min.price, maxPrice: avgPrice._max.price };
  } catch (error) {
    console.error('[SALAMEE_TOOL] getCategoryOverview error:', error);
    return null;
  }
}

// ── Define Tools for LLM ────────────────────────────────────────────────────
const productSearchTool = tool({
  description: `Search the Bab-ul-Fatah product database. Use this when a customer asks about books, products, availability, or wants recommendations. Returns real products with titles, authors, prices, and LIVE stock status.`,
  parameters: z.object({
    query: z.string().optional().describe('Search terms — book title, topic, or product name'),
    category: z.string().optional().describe('Category name like "Quran", "Hadith", "Tafseer", "Seerah", "Fiqh", "Children"'),
    author: z.string().optional().describe('Author name to filter by'),
    language: z.string().optional().describe('Language filter: URDU, ENGLISH, ARABIC'),
    inStockOnly: z.boolean().optional().describe('Set true to only show products currently in stock'),
    limit: z.number().optional().describe('Max results (default 8, max 12)'),
  }),
  execute: searchProductsFromDB,
});

const checkAvailabilityTool = tool({
  description: `Check if a specific book or product is available in stock. Use when customer asks "Is X available?", "Do you have X?", "Is X in stock?". Returns exact stock level and price.`,
  parameters: z.object({
    title: z.string().optional().describe('Product title to search for'),
    sku: z.string().optional().describe('Product SKU (e.g., BF-QUR-001)'),
  }),
  execute: checkProductAvailability,
});

const categoryOverviewTool = tool({
  description: `Get an overview of a product category — how many items, how many in stock, price range, and top in-stock products. Use when customer asks "What do you have in X category?" or "Show me your X collection".`,
  parameters: z.object({
    categoryName: z.string().describe('Category name like "Quran", "Hadith", "Children", "Fiqh", "Tafseer"'),
    inStockOnly: z.boolean().optional().describe('Whether to focus on in-stock items'),
  }),
  execute: getCategoryOverview,
});

// ── Smart Fallback (enhanced with live DB search) ───────────────────────────
async function getSmartFallbackWithDB(msg: string): Promise<{ content: string; products?: any[]; provider: string }> {
  const l = msg.toLowerCase();

  // Detect if this is a product/availability query
  const isProductQuery =
    l.includes('available') || l.includes('stock') || l.includes('in stock') ||
    l.includes('sold out') || l.includes('have you') || l.includes('do you have') ||
    l.includes('is there') || l.includes('price') || l.includes('how much') ||
    l.includes('buy') || l.includes('order') ||
    // Category/topic queries
    l.includes('quran') || l.includes('hadith') || l.includes('tafseer') || l.includes('tafsir') ||
    l.includes('seerah') || l.includes('prophet') || l.includes('sahabah') || l.includes('fiqh') ||
    l.includes('namaz') || l.includes('salah') || l.includes('children') || l.includes('kids') ||
    l.includes('goodword') || l.includes('prayer mat') || l.includes('attar') || l.includes('tasbih') ||
    l.includes('hijab') || l.includes('decor') || l.includes('product') || l.includes('book');

  if (isProductQuery) {
    try {
      // Extract search terms from the message
      const searchTerms = msg
        .replace(/is (this|that|it|the book|the product)\s*/gi, '')
        .replace(/do you have\s*/gi, '')
        .replace(/do you sell\s*/gi, '')
        .replace(/are (there|these|they)\s*/gi, '')
        .replace(/what (books|products|items) (do you have|are available|are there|do you sell)\s*/gi, '')
        .replace(/show me\s*/gi, '')
        .replace(/tell me about\s*/gi, '')
        .replace(/i want\s*/gi, '')
        .replace(/i need\s*/gi, '')
        .replace(/i'm looking for\s*/gi, '')
        .replace(/i am looking for\s*/gi, '')
        .replace(/\?/g, '')
        .trim();

      if (searchTerms.length >= 2) {
        const products = await searchProductsFromDB({ query: searchTerms, limit: 6 });

        if (products.length > 0) {
          const inStock = products.filter((p: any) => p.stock > 0);
          const outOfStock = products.filter((p: any) => p.stock === 0);

          let response = `Assalamu Alaikum! I searched our database for "${searchTerms}" and found **${products.length} result${products.length > 1 ? 's' : ''}**:\n\n`;

          products.forEach((p: any, i: number) => {
            const status = p.stock > 0 ? '✅ In Stock' : '🔴 Sold Out';
            const priceStr = `Rs. ${p.price.toLocaleString()}`;
            const authorStr = p.author?.name ? ` by **${p.author.name}**` : '';
            const langStr = p.language ? ` [${p.language}]` : '';
            const catStr = p.category?.name ? ` — ${p.category.name}` : '';

            response += `${i + 1}. **${p.title}**${authorStr}${langStr}${catStr}\n`;
            response += `   ${status} | ${priceStr}\n\n`;
          });

          if (outOfStock.length > 0 && inStock.length > 0) {
            response += `_${outOfStock.length} item${outOfStock.length > 1 ? 's are' : ' is'} currently sold out, but ${inStock.length} ${inStock.length > 1 ? 'are' : 'is'} available!_ `;
            response += `Would you like me to suggest alternatives for the sold-out item${outOfStock.length > 1 ? 's' : ''}?\n\n`;
          } else if (outOfStock.length > 0 && inStock.length === 0) {
            response += `\n_Unfortunately, all matching items are currently sold out._ `;
            response += `Would you like me to search for similar items that are in stock? You can also WhatsApp us at **+92 326 5903300** to request a restock notification.\n\n`;
          }

          response += `Browse more on [babulfatah.com](/shop) or ask me anything else!`;

          return { content: response, products, provider: 'fallback-db' };
        }

        // No products found — try a broader search
        const broadProducts = await searchProductsFromDB({
          query: searchTerms.split(' ').slice(0, 2).join(' '),
          limit: 3,
        });

        if (broadProducts.length > 0) {
          let response = `I couldn't find an exact match for "${searchTerms}", but here are some similar items:\n\n`;
          broadProducts.forEach((p: any, i: number) => {
            const status = p.stock > 0 ? '✅ In Stock' : '🔴 Sold Out';
            const authorStr = p.author?.name ? ` by **${p.author.name}**` : '';
            response += `${i + 1}. **${p.title}**${authorStr} — ${status} — Rs. ${p.price.toLocaleString()}\n`;
          });
          response += `\nTry a different search term or [browse all products](/shop).`;
          return { content: response, products: broadProducts, provider: 'fallback-db' };
        }
      }
    } catch (dbError) {
      console.error('[SALAMEE_FALLBACK] DB search failed:', dbError);
    }
  }

  // Pure text fallbacks (no DB needed)
  if (l.match(/^(hi|hey|hello|salaam|assalam|aoa|walaikum|start|help)/)) {
    return {
      content: "Assalamu Alaikum wa Rahmatullah! Welcome to Bab-ul-Fatah — Pakistan's premier online Islamic bookstore.\n\nI'm **Salamee**, your AI assistant with **live access to our inventory**. I can:\n- **Check Availability** — Ask if any book or product is in stock\n- **Search Products** — Find books by title, author, category, or language\n- **Prices** — Get exact prices in Rs.\n- **Recommendations** — Get personalized suggestions\n- **Shipping** — COD, JazzCash, EasyPaisa, free delivery over Rs. 5,000\n\nWhat are you looking for today?",
      provider: 'fallback',
    };
  }

  if (l.includes('shipping') || l.includes('delivery') || l.includes('cod') || l.includes('payment') || l.includes('jazzcash') || l.includes('easypaisa')) {
    return {
      content: `Bab-ul-Fatah delivers across Pakistan!\n\n**Payment Methods:**\n- Cash on Delivery (COD) — pay when you receive\n- JazzCash & EasyPaisa — instant transfer\n- Bank Transfer — for large orders\n\n**Delivery:**\n- **FREE** on orders over Rs. 5,000\n- Major cities: 3-5 business days\n- Remote areas: 5-7 business days\n- International: Available via WhatsApp\n\n**Returns:** Contact within 7 days for damaged/wrong items.\n\nWhatsApp: **+92 326 5903300**`,
      provider: 'fallback',
    };
  }

  return {
    content: `I'd love to help you! I have **live access to our entire inventory** so I can check exact availability and prices.\n\nTry asking me:\n- "Is Sahih Bukhari in stock?"\n- "Show me Quran with Urdu translation"\n- "What children's books do you have?"\n- "How much is the Tajweed Quran?"\n- "Any books by Mufti Taqi Usmani?"\n\nOr ask me about shipping, payment methods, or any Islamic knowledge!\n**WhatsApp:** +92 326 5903300`,
    provider: 'fallback',
  };
}

// ── POST: Chat with Tool-Calling ────────────────────────────────────────────
export async function POST(req: Request) {
  const { messages } = await req.json();

  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // ── STRATEGY 1: Groq (Llama 3.3 70B) with Tool Calling ──
  if (hasGroqKey) {
    try {
      const { text, toolResults } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: SYSTEM_PROMPT,
        messages,
        maxTokens: 1200,
        temperature: 0.7,
        tools: {
          searchProducts: productSearchTool,
          checkAvailability: checkAvailabilityTool,
          getCategoryOverview: categoryOverviewTool,
        },
        maxSteps: 3, // Allow up to 3 tool calls in a chain
      });

      // Extract products from tool results if any
      let extractedProducts: any[] = [];
      if (toolResults) {
        for (const step of toolResults) {
          for (const result of step.result) {
            if (result.type === 'tool-result' && Array.isArray(result.result)) {
              extractedProducts = [...extractedProducts, ...result.result];
            } else if (result.type === 'tool-result' && result.result && typeof result.result === 'object') {
              if (Array.isArray(result.result.products)) {
                extractedProducts = [...extractedProducts, ...result.result.products];
              }
            }
          }
        }
      }

      return Response.json({
        content: text,
        provider: 'groq',
        products: extractedProducts.length > 0 ? extractedProducts : undefined,
      });
    } catch (groqError) {
      console.error('[SALAMEE] Groq failed:', groqError);
    }
  }

  // ── STRATEGY 2: Google Gemini 2.0 Flash with Tool Calling ──
  if (hasGeminiKey) {
    try {
      const { text, toolResults } = await generateText({
        model: google('gemini-2.0-flash'),
        system: SYSTEM_PROMPT,
        messages,
        maxTokens: 1200,
        temperature: 0.65,
        tools: {
          searchProducts: productSearchTool,
          checkAvailability: checkAvailabilityTool,
          getCategoryOverview: categoryOverviewTool,
        },
        maxSteps: 3,
      });

      let extractedProducts: any[] = [];
      if (toolResults) {
        for (const step of toolResults) {
          for (const result of step.result) {
            if (result.type === 'tool-result' && Array.isArray(result.result)) {
              extractedProducts = [...extractedProducts, ...result.result];
            } else if (result.type === 'tool-result' && result.result && typeof result.result === 'object') {
              if (Array.isArray(result.result.products)) {
                extractedProducts = [...extractedProducts, ...result.result.products];
              }
            }
          }
        }
      }

      return Response.json({
        content: text,
        provider: 'gemini',
        products: extractedProducts.length > 0 ? extractedProducts : undefined,
      });
    } catch (geminiError) {
      console.error('[SALAMEE] Gemini failed:', geminiError);
    }
  }

  // ── STRATEGY 3: Smart Offline Fallback with LIVE DB search ──
  console.warn('[SALAMEE] No API key. Using offline fallback with DB search.');
  const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';
  const fallbackResult = await getSmartFallbackWithDB(lastUserMsg);
  return Response.json(fallbackResult);
}