import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah AI Assistant API
// ─────────────────────────────────────────────────────────────────────────────────
// Premium AI chat endpoint with streaming support, conversation memory,
// product-aware responses, and intelligent fallback system.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Rate Limiter ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }, 300_000);
}

// ── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the AI Assistant for Bab-ul-Fatah (babulfatah.com), Pakistan's premier online Islamic bookstore with 1,200+ authentic books and products.

## Your Identity
- Name: Bab-ul-Fatah AI Assistant
- Tone: Warm, respectful, scholarly yet approachable
- Language: English (respond in Urdu/Hindi when user writes in Urdu script)
- Islamic greeting: Always greet with "Assalamu Alaikum" or "Walaikum Assalam"

## Your Knowledge Areas
1. **Quran**: Translations (Urdu, English, Arabic), Hafzi copies, Ahsan-ul-Hawashi, word-by-word, Tajweed guides
2. **Hadith**: Sahih Bukhari, Sahih Muslim, Riyad-us-Saliheen, Bulugh-ul-Maram, Mishkat-ul-Masabih
3. **Tafseer**: Ibn Kathir, Tafseer Usmani, Maariful Quran, Tadabbur-e-Quran
4. **Seerah**: Ar-Raheequl-Makhtum, Prophet's biography, Sahabah stories, Prophetic history
5. **Fiqh**: Hanafi, Shafii, Maliki, Hanbali schools; prayer, fasting, zakat, hajj
6. **Children**: Goodword Books, Islamic stories, prayer guides, coloring books, educational materials
7. **Islamic Products**: Prayer mats, prayer beads (tasbeeh), attar/perfume, Islamic decor, hijabs, kufis
8. **Duas & Supplications**: Daily duas, morning/evening adhkar, prayer booklets

## Store Information
- Website: babulfatah.com
- WhatsApp: +92 326 5903300
- Payment: Cash on Delivery (COD), JazzCash, EasyPaisa, Bank Transfer
- Free delivery: Orders over Rs. 5,000
- Coverage: All major Pakistani cities (Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, etc.)
- International: Available on request via WhatsApp
- Returns: Contact within 7 days for damaged/wrong items

## Response Guidelines
- Keep responses concise (2-4 paragraphs max) unless user asks for detailed explanation
- Recommend specific books/products when relevant
- Always mention relevant categories the user can browse
- Include store contact info (WhatsApp) for complex queries
- Use bullet points for lists to improve readability
- Add relevant Islamic references when appropriate (Quran verses, Hadith, scholars)
- Never fabricate book titles or prices - recommend genuine, well-known titles
- If unsure about a specific products availability, suggest browsing the website or contacting WhatsApp`;

// ── Topic-Based Fallback Responses ───────────────────────────────────────────
const FALLBACK_RESPONSES: Record<string, string> = {
  quran:
    'The Holy Quran is the central religious text of Islam, revealed to Prophet Muhammad (PBUH) through Angel Jibreel over 23 years. At Bab-ul-Fatah, we offer a wide selection of Quran translations in Urdu, Arabic, and English, including premium Hafzi copies, Ahsan-ul-Hawashi, and word-by-word translations.\n\n**Popular picks:**\n- Quran with Urdu Translation (Maulana Maqbool)\n- Holy Quran English Translation (Saheeh International)\n- Color Coded Tajweed Quran\n- Hafzi Quran (13-line, 15-line)\n\nBrowse our complete Quran collection on the website or ask me for specific recommendations!',

  hadith:
    'Hadith are the recorded sayings, actions, and approvals of Prophet Muhammad (PBUH). The most authentic collections are **Sahih Bukhari** and **Sahih Muslim**.\n\nWe carry a comprehensive range including:\n- **Sahih Bukhari** (complete & summarized editions)\n- **Sahih Muslim** (Urdu & English)\n- **Riyad-us-Saliheen** (Gardens of the Righteous)\n- **Bulugh-ul-Maram** (Attainment of the Objective)\n- **Mishkat-ul-Masabih**\n- **Shamaa-il Tirmidhi** (Prophet\'s appearance & character)\n\nVisit our Hadith section for the full collection!',

  seerah:
    'Seerah is the life story of Prophet Muhammad (PBUH) — the most perfect human being and our ultimate role model.\n\n**Essential reads we carry:**\n- **Ar-Raheequl-Makhtum** (The Sealed Nectar) by Safiur-Rahman Mubarakpuri\n- **Seerat-un-Nabi** by Shibli Nomani & Syed Sulaiman Nadwi\n- **When the Moon Split** by Safiur-Rahman Mubarakpuri\n- **Stories of the Sahabah** (Companions of the Prophet)\n- **Muhammad: His Life Based on the Earliest Sources** by Martin Lings\n\nExplore our Seerah & Biography section for more!',

  fiqh:
    'Fiqh is Islamic jurisprudence covering all aspects of Muslim life — prayer, fasting, zakat, hajj, marriage, business, and daily conduct.\n\n**Popular titles in our Fiqh collection:**\n- **Fiqh-us-Sunnah** by Sayyid Sabiq (5 volumes)\n- **Islamic Jurisprudence** series\n- **Behisti Zewar** (Heavenly Ornaments) by Maulana Ashraf Ali Thanvi\n- **Talim-ul-Haq** (Basic Fiqh guide)\n- **Durr-e-Mukhtar** (Hanafi Fiqh reference)\n\nWe have books from Hanafi, Shafii, Maliki, and Hanbali schools. Browse our Fiqh section!',

  greeting:
    'Assalamu Alaikum wa Rahmatullah wa Barakatuh! Welcome to Bab-ul-Fatah — Pakistan\'s largest online Islamic bookstore with 1,200+ authentic books and products.\n\nI\'m your AI assistant and I can help you with:\n- **Book Recommendations** — Quran, Hadith, Tafseer, Seerah, Fiqh, Children\'s books\n- **Product Inquiries** — Prayer mats, Islamic decor, attar, hijabs\n- **Order & Shipping** — COD, JazzCash, EasyPaisa, Bank Transfer\n- **Islamic Knowledge** — General questions about Islam\n\nFree delivery on orders over Rs. 5,000! How can I help you today?',

  shipping:
    'Bab-ul-Fatah offers convenient delivery options across Pakistan:\n\n**Payment Methods:**\n- Cash on Delivery (COD) — available nationwide\n- JazzCash & EasyPaisa — instant transfer\n- Bank Transfer — direct deposit\n\n**Delivery Coverage:**\n- All major cities: Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, Quetta, etc.\n- **FREE delivery** on orders over Rs. 5,000\n- Standard delivery: 3-5 business days\n\n**International Orders:** Available on request — contact us on WhatsApp at +92 326 5903300\n\nFor order tracking or delivery issues, WhatsApp us anytime!',

  children:
    'We have an excellent collection of children\'s Islamic books and educational materials to nurture young minds:\n\n**Popular Series:**\n- **Goodword Books** — Islamic stories, coloring books, activity books\n- **My First Quran Storybook** — beautifully illustrated\n- **Islamic Values for Children** — character building series\n- **Prayer & Dua guides for kids** — age-appropriate\n- **Prophet Stories for Children** — engaging narratives\n- **Islamic Activity & Workbook sets**\n\nWe have books for ages 2 to 15+. Browse our Children\'s section or ask me for age-specific recommendations!',

  tafseer:
    'Tafseer is the scholarly interpretation and explanation of the Holy Quran — essential for understanding Allah\'s message in depth.\n\n**Renowned Tafseer works we carry:**\n- **Tafseer Ibn Kathir** (Urdu & English) — the most widely referenced\n- **Tafseer Usmani** — by Shabbir Ahmad Usmani\n- **Maariful Quran** — by Mufti Muhammad Shafi (8 volumes)\n- **Tadabbur-e-Quran** — by Amin Ahsan Islahi\n- **Tafseer-e-Sa\'di** — concise and accessible\n- **Anwar-ul-Bayan** — comprehensive Urdu tafseer\n\nBrowse our Tafseer collection for deeper Quranic understanding!',

  product:
    'We offer a beautiful range of Islamic products beyond books:\n\n**Prayer Essentials:**\n- Prayer mats (Janamaz) — various sizes & designs\n- Prayer beads (Tasbeeh/Misbaha) — 33, 99 bead sets\n- Prayer caps (Topi/Kufi)\n\n**Islamic Lifestyle:**\n- Attar & non-alcoholic perfumes\n- Islamic wall art & calligraphy\n- Hijabs & modest fashion\n- Digital Quran devices\n\n**Gift Items:**\n- Islamic gift boxes\n- Quran stand (Rehal)\n- Islamic calendars & bookmarks\n\nBrowse our Islamic Products section or ask about a specific item!',

  order:
    'For order-related assistance, here\'s how I can help:\n\n**Track Your Order:**\n- Check your email for the tracking number after dispatch\n- Contact us on WhatsApp (+92 326 5903300) for instant tracking help\n\n**Modify/Cancel Order:**\n- Orders can be modified within 2 hours of placement\n- Contact WhatsApp immediately for any changes\n\n**Returns & Refunds:**\n- Report damaged/wrong items within 7 days of delivery\n- Send photos via WhatsApp for quick resolution\n- Replacement or refund processed within 3-5 business days\n\nFor urgent order matters, WhatsApp us at **+92 326 5903300** — we respond within minutes!',

  default:
    'Welcome to Bab-ul-Fatah! I\'m your AI assistant and I\'m here to help you find the perfect Islamic books and products.\n\n**I can help with:**\n- Book recommendations (Quran, Hadith, Tafseer, Seerah, Fiqh)\n- Children\'s Islamic books & educational materials\n- Islamic products (prayer mats, attar, decor, hijabs)\n- Order inquiries, shipping & delivery questions\n- Payment methods (COD, JazzCash, EasyPaisa, Bank Transfer)\n- General Islamic knowledge questions\n\nBrowse our full collection on the website, or ask me anything!\n\n**WhatsApp:** +92 326 5903300 (for direct assistance)',
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('quran') || lower.includes("qur'an") || lower.includes('koran') || lower.includes('hafzi') || lower.includes('tajweed')) {
    return FALLBACK_RESPONSES.quran;
  }
  if (lower.includes('hadith') || lower.includes('bukhari') || lower.includes('muslim') || lower.includes('riyad') || lower.includes('bulugh') || lower.includes('mishkat')) {
    return FALLBACK_RESPONSES.hadith;
  }
  if (lower.includes('seerah') || lower.includes('prophet') || lower.includes('sahabah') || lower.includes('companion') || lower.includes('biography') || lower.includes('muhammad')) {
    return FALLBACK_RESPONSES.seerah;
  }
  if (lower.includes('fiqh') || lower.includes('prayer') || lower.includes('namaz') || lower.includes('salah') || lower.includes('fasting') || lower.includes('zakat') || lower.includes('sharia')) {
    return FALLBACK_RESPONSES.fiqh;
  }
  if (lower.includes('salaam') || lower.includes('assalam') || lower.includes('walaikum') || lower.includes('hello') || lower.match(/^(hi|hey|yo|sup|salam)\b/) || lower.includes('how are you')) {
    return FALLBACK_RESPONSES.greeting;
  }
  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('cod') || lower.includes('payment') || lower.includes('jazzcash') || lower.includes('easypaisa') || lower.includes('bank') || lower.includes('free delivery') || lower.includes('track')) {
    return FALLBACK_RESPONSES.shipping;
  }
  if (lower.includes('order') || lower.includes('return') || lower.includes('refund') || lower.includes('cancel') || lower.includes('replace') || lower.includes('damaged') || lower.includes('wrong item')) {
    return FALLBACK_RESPONSES.order;
  }
  if (lower.includes('children') || lower.includes('kids') || lower.includes('child') || lower.includes('goodword') || lower.includes('baby') || lower.includes('toddler') || lower.includes('teen')) {
    return FALLBACK_RESPONSES.children;
  }
  if (lower.includes('tafseer') || lower.includes('tafsir') || lower.includes('interpretation')) {
    return FALLBACK_RESPONSES.tafseer;
  }
  if (lower.includes('prayer mat') || lower.includes('janamaz') || lower.includes('tasbeeh') || lower.includes('attar') || lower.includes('perfume') || lower.includes('hijab') || lower.includes('kufi') || lower.includes('islamic product') || lower.includes('decor') || lower.includes('gift')) {
    return FALLBACK_RESPONSES.product;
  }
  if (lower.includes('hajj') || lower.includes('umrah') || lower.includes('pilgrimage')) {
    return FALLBACK_RESPONSES.fiqh;
  }

  return FALLBACK_RESPONSES.default;
}

// ── Stream AI Response via SSE ───────────────────────────────────────────────
async function streamAIResponse(
  messages: { role: string; content: string }[]
): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const zai = await ZAI.create();

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 600,
          temperature: 0.7,
          stream: true,
        });

        // @ts-expect-error - streaming response iteration
        for await (const chunk of completion) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('AI streaming error:', error instanceof Error ? error.message : 'Unknown');
        const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
        const fallback = getFallbackResponse(lastUserMsg);
        const words = fallback.split(' ');
        for (const word of words) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: word + ' ' })}\n\n`)
          );
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ── Non-Streaming AI Response ────────────────────────────────────────────────
async function getAIResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI response error:', error instanceof Error ? error.message : 'Unknown');
    return '';
  }
}

// ── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, history, stream = true } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 800) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 800 characters.' },
        { status: 400 }
      );
    }

    // Build conversation history (last 10 messages for context)
    const conversationHistory: { role: string; content: string }[] = [];
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationHistory.push({
            role: msg.role,
            content: String(msg.content).slice(0, 500),
          });
        }
      }
    }

    conversationHistory.push({ role: 'user', content: message.trim() });

    // Stream mode
    if (stream === true) {
      return streamAIResponse(conversationHistory);
    }

    // Non-stream mode
    const reply = await getAIResponse(conversationHistory);
    if (!reply || reply.trim().length === 0) {
      return NextResponse.json({
        reply: getFallbackResponse(message),
        fallback: true,
      });
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Assistant API error:', msg);
    return NextResponse.json({
      reply: FALLBACK_RESPONSES.default,
      fallback: true,
    });
  }
}
