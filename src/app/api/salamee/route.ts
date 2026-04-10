import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ── Simple in-memory rate limiter (per IP) ──────────────────
// 10 requests per minute per IP. Resets on server restart.
// For production, use Redis or a proper rate-limit middleware.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

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

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }, 300_000);
}

// ── Fallback responses when AI is unavailable ──────────────
// These ensure Salamee always responds even if z-ai-web-dev-sdk fails.

const FALLBACK_RESPONSES: Record<string, string> = {
  quran:
    'The Holy Quran is the central religious text of Islam, believed to be the word of Allah revealed to Prophet Muhammad (PBUH) through Angel Jibreel over 23 years. At Bab-ul-Fatah, we offer a wide range of Quran translations in Urdu, Arabic, and English, including premium Hafzi copies, Ahsan-ul-Hawashi, and word-by-word translations. Browse our Quran collection to find your perfect copy.',

  hadith:
    "Hadith are the collections of sayings, actions, and approvals of Prophet Muhammad (PBUH). The most authentic collections include Sahih Bukhari and Sahih Muslim. We also carry Riyad-us-Saliheen, Bulugh-ul-Maram, and many other hadith compilations. Visit our Hadith section to explore the complete collection.",

  seerah:
    "Seerah refers to the life story of Prophet Muhammad (PBUH). The most famous Seerah book is Ar-Raheequl-Makhtum by Safiur-Rahman Mubarakpuri. We also have detailed biographies, stories of the Sahabah (companions), and books on Prophetic history. Explore our Seerah collection to learn about the Prophet's beautiful life.",

  fiqh:
    'Fiqh is Islamic jurisprudence covering prayer, fasting, zakat, hajj, and daily life matters. We have books from Hanafi, Shafi\'i, Maliki, and Hanbali schools of thought. Popular titles include "Fiqh-us-Sunnah" and "Islamic Jurisprudence" series. Browse our Fiqh section for comprehensive guidance.',

  greeting:
    'Assalamu Alaikum wa Rahmatullah! Welcome to Bab-ul-Fatah, Pakistan\'s largest online Islamic bookstore with over 1,200+ authentic books and products. How can I help you today? I can recommend books, answer questions about Islamic knowledge, or help you find specific products.',

  shipping:
    'Bab-ul-Fatah offers Cash on Delivery (COD) across all major cities in Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, and Multan. We also accept JazzCash, EasyPaisa, and Bank Transfer. Free delivery on orders over Rs. 5,000! For international orders, contact us via WhatsApp at +92 326 5903300.',

  children:
    'We have a wonderful collection of children\'s Islamic books including Goodword Books, Islamic stories, prayer guides, coloring books, and educational materials. Popular series include "My First Quran Storybook" and "Islamic Values for Children." Check out our kids section for age-appropriate Islamic education materials.',

  tafseer:
    'Tafseer is the interpretation and explanation of the Quran. We carry renowned Tafseer works including Tafseer Ibn Kathir, Tafseer Usmani, and Ma\'ariful Quran in multiple languages. Browse our Tafseer collection for deeper understanding of the Holy Quran.',

  hajj:
    'We have comprehensive guides for Hajj and Umrah including step-by-step manuals, dua collections, and practical travel guides. Everything you need for your spiritual journey. Browse our Hajj & Umrah collection.',

  default:
    'Welcome to Bab-ul-Fatah! I\'m here to help you find the perfect Islamic books and products. You can ask me about:\n\n- Quran translations and Tafseer\n- Hadith collections\n- Seerah and Islamic history\n- Fiqh and Islamic law\n- Children\'s Islamic books\n- Prayer guides and supplications\n\nOr browse our full collection at the shop page. For direct assistance, WhatsApp us at +92 326 5903300.',
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  // Quran matches (using double quotes to avoid apostrophe issues)
  if (
    lower.includes('quran') ||
    lower.includes("qur'an") ||
    lower.includes('koran')
  ) {
    return FALLBACK_RESPONSES.quran;
  }

  // Hadith matches
  if (
    lower.includes('hadith') ||
    lower.includes('bukhari') ||
    lower.includes('muslim') ||
    lower.includes('riyad')
  ) {
    return FALLBACK_RESPONSES.hadith;
  }

  // Seerah matches
  if (
    lower.includes('seerah') ||
    lower.includes('prophet') ||
    lower.includes('biography') ||
    lower.includes('sahabah')
  ) {
    return FALLBACK_RESPONSES.seerah;
  }

  // Fiqh matches
  if (
    lower.includes('fiqh') ||
    lower.includes('prayer') ||
    lower.includes('namaz') ||
    lower.includes('salah')
  ) {
    return FALLBACK_RESPONSES.fiqh;
  }

  // Greeting matches
  if (
    lower.includes('salaam') ||
    lower.includes('assalam') ||
    lower.includes('hello') ||
    lower.match(/^(hi|hey|yo|sup)\b/)
  ) {
    return FALLBACK_RESPONSES.greeting;
  }

  // Shipping / payment matches
  if (
    lower.includes('shipping') ||
    lower.includes('delivery') ||
    lower.includes('cod') ||
    lower.includes('payment') ||
    lower.includes('jazzcash') ||
    lower.includes('easypaisa')
  ) {
    return FALLBACK_RESPONSES.shipping;
  }

  // Children matches
  if (
    lower.includes('children') ||
    lower.includes('kids') ||
    lower.includes('child') ||
    lower.includes('goodword')
  ) {
    return FALLBACK_RESPONSES.children;
  }

  // Tafseer matches
  if (lower.includes('tafseer') || lower.includes('tafsir')) {
    return FALLBACK_RESPONSES.tafseer;
  }

  // Hajj / Umrah matches
  if (lower.includes('hajj') || lower.includes('umrah')) {
    return FALLBACK_RESPONSES.hajj;
  }

  return FALLBACK_RESPONSES.default;
}

// ── POST handler ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit check ──
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 500 characters.' },
        { status: 400 }
      );
    }

    // ── Try AI first, fall back to static responses ──
    let reply: string | undefined;

    try {
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              "You are Salamee, an Islamic knowledge assistant for Bab-ul-Fatah - Pakistan's largest online Islamic bookstore.\n\nYour personality:\n- Warm, respectful, and knowledgeable\n- Greet with Islamic greetings (Assalamu Alaikum)\n- Use respectful language and Islamic etiquette\n- Reference authentic Islamic sources when relevant (Quran, Hadith, scholars)\n\nYour role:\n- Help customers find Islamic books, Quran translations, Hadith collections, Tafseer, Seerah, and more\n- Provide book recommendations based on interests\n- Answer general questions about Islamic knowledge\n- Guide customers to the right categories on the store\n- Mention Cash on Delivery, JazzCash, EasyPaisa, and Bank Transfer\n- Free delivery on orders over Rs. 5,000\n\nStore info:\n- Website: babulfatah.com\n- WhatsApp: +92 326 5903300\n- 1,200+ Islamic books and products\n- Categories: Quran & Hadith, Tafseer, Biography, Seerah, Fiqh, Children, Prayer, Hajj & Umrah, Islamic Products\n\nKeep responses concise (2-4 paragraphs max) and helpful.",
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      reply = completion.choices[0]?.message?.content;
    } catch (aiError) {
      // AI unavailable — use fallback silently
      console.error(
        'Salamee AI unavailable, using fallback:',
        aiError instanceof Error ? aiError.message : 'Unknown'
      );
    }

    // Use fallback if AI didn't respond
    if (!reply || reply.trim().length === 0) {
      reply = getFallbackResponse(message);
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Salamee API error:', msg);
    // Instead of returning error, return a fallback response
    return NextResponse.json({
      reply: FALLBACK_RESPONSES.default,
    });
  }
}
