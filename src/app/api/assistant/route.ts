import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah AI Assistant API — v2 (Fixed)
// ─────────────────────────────────────────────────────────────────────────────────
// Changes from v1:
// - Non-streaming JSON as PRIMARY mode (proven reliable with z-ai-web-dev-sdk)
// - Streaming removed entirely (SDK doesn't support it properly)
// - Conversation history sent correctly for multi-turn context
// - Better error handling with detailed logging
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
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

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
1. Quran: Translations (Urdu, English, Arabic), Hafzi copies, Ahsan-ul-Hawashi, word-by-word, Tajweed guides
2. Hadith: Sahih Bukhari, Sahih Muslim, Riyad-us-Saliheen, Bulugh-ul-Maram, Mishkat-ul-Masabih
3. Tafseer: Ibn Kathir, Tafseer Usmani, Maariful Quran, Tadabbur-e-Quran
4. Seerah: Ar-Raheequl-Makhtum, Prophet biography, Sahabah stories, Prophetic history
5. Fiqh: Hanafi, Shafii, Maliki, Hanbali schools; prayer, fasting, zakat, hajj
6. Children: Goodword Books, Islamic stories, prayer guides, coloring books, educational materials
7. Islamic Products: Prayer mats, prayer beads, attar, Islamic decor, hijabs, kufis
8. Duas and Supplications: Daily duas, morning/evening adhkar, prayer booklets

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
- Add relevant Islamic references when appropriate
- Never fabricate book titles or prices
- CRITICAL: Each answer must be unique and directly address the specific question asked. Do NOT give generic responses.`;

// ── Topic-Based Fallback Responses ───────────────────────────────────────────
const FALLBACK: Record<string, string> = {
  quran:
    'The Holy Quran is the central religious text of Islam, revealed to Prophet Muhammad (PBUH) through Angel Jibreel over 23 years. At Bab-ul-Fatah, we offer a wide selection of Quran translations in Urdu, Arabic, and English, including premium Hafzi copies, Ahsan-ul-Hawashi, and word-by-word translations.\n\n**Popular picks:**\n- Quran with Urdu Translation (Maulana Maqbool)\n- Holy Quran English Translation (Saheeh International)\n- Color Coded Tajweed Quran\n- Hafzi Quran (13-line, 15-line)\n\nBrowse our complete Quran collection on the website or ask me for specific recommendations!',

  hadith:
    'Hadith are the recorded sayings, actions, and approvals of Prophet Muhammad (PBUH). The most authentic collections are **Sahih Bukhari** and **Sahih Muslim**.\n\nWe carry a comprehensive range including:\n- **Sahih Bukhari** (complete and summarized editions)\n- **Sahih Muslim** (Urdu and English)\n- **Riyad-us-Saliheen** (Gardens of the Righteous)\n- **Bulugh-ul-Maram** (Attainment of the Objective)\n- **Mishkat-ul-Masabih**\n\nVisit our Hadith section for the full collection!',

  seerah:
    'Seerah is the life story of Prophet Muhammad (PBUH). The most famous Seerah book is **Ar-Raheequl-Makhtum** (The Sealed Nectar) by Safiur-Rahman Mubarakpuri.\n\n**Essential reads we carry:**\n- Ar-Raheequl-Makhtum\n- Seerat-un-Nabi by Shibli Nomani\n- When the Moon Split by Safiur-Rahman Mubarakpuri\n- Stories of the Sahabah\n- Muhammad: His Life Based on the Earliest Sources by Martin Lings\n\nExplore our Seerah and Biography section for more!',

  fiqh:
    'Fiqh is Islamic jurisprudence covering prayer, fasting, zakat, hajj, marriage, business, and daily conduct.\n\n**Popular titles in our Fiqh collection:**\n- **Fiqh-us-Sunnah** by Sayyid Sabiq (5 volumes)\n- **Behisti Zewar** (Heavenly Ornaments) by Maulana Ashraf Ali Thanvi\n- **Talim-ul-Haq** (Basic Fiqh guide)\n- **Durr-e-Mukhtar** (Hanafi Fiqh reference)\n\nWe have books from Hanafi, Shafii, Maliki, and Hanbali schools. Browse our Fiqh section!',

  greeting:
    'Assalamu Alaikum wa Rahmatullah wa Barakatuh! Welcome to Bab-ul-Fatah, Pakistan\'s largest online Islamic bookstore with 1,200+ authentic books and products.\n\nI can help you with:\n- **Book Recommendations** - Quran, Hadith, Tafseer, Seerah, Fiqh, Children\'s books\n- **Product Inquiries** - Prayer mats, Islamic decor, attar, hijabs\n- **Order and Shipping** - COD, JazzCash, EasyPaisa, Bank Transfer\n- **Islamic Knowledge** - General questions about Islam\n\nFree delivery on orders over Rs. 5,000! How can I help you today?',

  shipping:
    'Bab-ul-Fatah offers convenient delivery options across Pakistan:\n\n**Payment Methods:**\n- Cash on Delivery (COD) - available nationwide\n- JazzCash and EasyPaisa - instant transfer\n- Bank Transfer - direct deposit\n\n**Delivery Coverage:**\n- All major cities: Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, Quetta, etc.\n- **FREE delivery** on orders over Rs. 5,000\n- Standard delivery: 3-5 business days\n\n**International Orders:** Available on request - contact us on WhatsApp at +92 326 5903300',

  children:
    'We have an excellent collection of children\'s Islamic books and educational materials:\n\n**Popular Series:**\n- **Goodword Books** - Islamic stories, coloring books, activity books\n- **My First Quran Storybook** - beautifully illustrated\n- **Islamic Values for Children** - character building series\n- **Prayer and Dua guides for kids** - age-appropriate\n- **Prophet Stories for Children** - engaging narratives\n\nWe have books for ages 2 to 15+. Browse our Children\'s section or ask me for age-specific recommendations!',

  tafseer:
    'Tafseer is the scholarly interpretation and explanation of the Holy Quran.\n\n**Renowned Tafseer works we carry:**\n- **Tafseer Ibn Kathir** (Urdu and English)\n- **Tafseer Usmani** by Shabbir Ahmad Usmani\n- **Maariful Quran** by Mufti Muhammad Shafi (8 volumes)\n- **Tadabbur-e-Quran** by Amin Ahsan Islahi\n- **Tafseer-e-Saadi** - concise and accessible\n- **Anwar-ul-Bayan** - comprehensive Urdu tafseer\n\nBrowse our Tafseer collection for deeper Quranic understanding!',

  product:
    'We offer a beautiful range of Islamic products beyond books:\n\n**Prayer Essentials:**\n- Prayer mats (Janamaz) - various sizes and designs\n- Prayer beads (Tasbeeh/Misbaha) - 33, 99 bead sets\n- Prayer caps (Topi/Kufi)\n\n**Islamic Lifestyle:**\n- Attar and non-alcoholic perfumes\n- Islamic wall art and calligraphy\n- Hijabs and modest fashion\n- Digital Quran devices\n\nBrowse our Islamic Products section or ask about a specific item!',

  order:
    'For order-related assistance:\n\n**Track Your Order:**\n- Check your email for the tracking number after dispatch\n- Contact us on WhatsApp (+92 326 5903300) for instant tracking help\n\n**Modify/Cancel Order:**\n- Orders can be modified within 2 hours of placement\n- Contact WhatsApp immediately for any changes\n\n**Returns and Refunds:**\n- Report damaged/wrong items within 7 days of delivery\n- Send photos via WhatsApp for quick resolution\n- Replacement or refund processed within 3-5 business days\n\nFor urgent matters, WhatsApp us at **+92 326 5903300**!',

  default:
    'Welcome to Bab-ul-Fatah! I am your AI assistant and I am here to help you find the perfect Islamic books and products.\n\n**I can help with:**\n- Book recommendations (Quran, Hadith, Tafseer, Seerah, Fiqh)\n- Children\'s Islamic books and educational materials\n- Islamic products (prayer mats, attar, decor, hijabs)\n- Order inquiries, shipping and delivery questions\n- Payment methods (COD, JazzCash, EasyPaisa, Bank Transfer)\n- General Islamic knowledge questions\n\nBrowse our full collection on the website, or ask me anything!\n\n**WhatsApp:** +92 326 5903300 (for direct assistance)',
};

function getFallbackResponse(message: string): string {
  const l = message.toLowerCase();

  if (l.includes('quran') || l.includes("qur'an") || l.includes('koran') || l.includes('hafzi') || l.includes('tajweed')) return FALLBACK.quran;
  if (l.includes('hadith') || l.includes('bukhari') || l.includes('riyad') || l.includes('bulugh') || l.includes('mishkat')) return FALLBACK.hadith;
  if (l.includes('seerah') || l.includes('prophet') || l.includes('sahabah') || l.includes('biography') || l.includes('muhammad') || l.includes('rasool')) return FALLBACK.seerah;
  if (l.includes('fiqh') || l.includes('prayer') || l.includes('namaz') || l.includes('salah') || l.includes('fasting') || l.includes('zakat') || l.includes('hajj') || l.includes('umrah')) return FALLBACK.fiqh;
  if (l.includes('salaam') || l.includes('assalam') || l.includes('walaikum') || l.includes('hello') || l.match(/^(hi|hey|yo|sup|salam)\b/) || l.includes('how are you')) return FALLBACK.greeting;
  if (l.includes('shipping') || l.includes('delivery') || l.includes('cod') || l.includes('payment') || l.includes('jazzcash') || l.includes('easypaisa') || l.includes('bank') || l.includes('free delivery') || l.includes('track')) return FALLBACK.shipping;
  if (l.includes('order') || l.includes('return') || l.includes('refund') || l.includes('cancel') || l.includes('replace') || l.includes('damaged')) return FALLBACK.order;
  if (l.includes('children') || l.includes('kids') || l.includes('child') || l.includes('goodword') || l.includes('baby') || l.includes('toddler')) return FALLBACK.children;
  if (l.includes('tafseer') || l.includes('tafsir') || l.includes('interpretation')) return FALLBACK.tafseer;
  if (l.includes('prayer mat') || l.includes('janamaz') || l.includes('tasbeeh') || l.includes('attar') || l.includes('perfume') || l.includes('hijab') || l.includes('kufi') || l.includes('islamic product') || l.includes('decor') || l.includes('gift')) return FALLBACK.product;

  return FALLBACK.default;
}

// ── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many messages. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 800) {
      return NextResponse.json({ error: 'Message is too long. Please keep it under 800 characters.' }, { status: 400 });
    }

    // Build conversation for AI (system + history + current message)
    const aiMessages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (provided by client — already has correct state)
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          aiMessages.push({
            role: msg.role,
            content: String(msg.content).slice(0, 500),
          });
        }
      }
    }

    // Add current message
    aiMessages.push({ role: 'user', content: message.trim() });

    // ── Call AI (non-streaming — proven reliable) ──
    let reply = '';
    let aiUsed = false;

    try {
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: aiMessages,
        max_tokens: 600,
        temperature: 0.7,
      });

      reply = completion.choices?.[0]?.message?.content || '';
      aiUsed = true;

      console.log('[Assistant] AI responded successfully, length:', reply.length);
    } catch (aiError) {
      console.error('[Assistant] AI error:', aiError instanceof Error ? aiError.message : 'Unknown');
    }

    // If AI didn't respond, use intelligent fallback
    if (!reply || reply.trim().length === 0) {
      reply = getFallbackResponse(message);
      console.log('[Assistant] Used fallback for:', message.slice(0, 50));
    }

    return NextResponse.json({ reply, aiUsed });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Assistant] API error:', msg);
    return NextResponse.json({ reply: FALLBACK.default, aiUsed: false });
  }
}
