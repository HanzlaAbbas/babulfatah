import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ── Simple in-memory rate limiter (per IP) ──────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
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

// ── Fallback responses when SDK fails ──
const FALLBACK_RESPONSES: Record<string, string> = {
  default: "Assalamu Alaikum! I'm Salamee, your Islamic knowledge assistant at Bab-ul-Fatah. I can help you find Islamic books, Quran translations, Hadith collections, and more. What are you looking for today? Feel free to browse our collection at babulfatah.com or WhatsApp us at +92 326 5903300.",
  quran: "We have a beautiful collection of Holy Qurans including translations in Urdu, English, and Arabic. From standard Hafzi copies to premium Ahsan-ul-Hawashi editions, we have Qurans for every need. Browse our Quran collection at babulfatah.com or contact us on WhatsApp at +92 326 5903300 for personalized recommendations.",
  hadith: "Our Hadith collection includes Sahih Bukhari, Sahih Muslim, Riyad-us-Saliheen, and many more authentic collections in Urdu, English, and Arabic. These are essential for every Muslim household. Visit babulfatah.com to explore our complete Hadith section.",
  seerah: "Discover the life of Prophet Muhammad (PBUH) through our curated Seerah collection. We have Ar-Raheequl-Makhtum, Seerat-un-Nabi, and many detailed biographies. These books are perfect for understanding the beautiful life of our Prophet.",
  children: "We have a wonderful selection of children's Islamic books including Goodword publications, Islamic storybooks, prayer guides, and educational materials. These are perfect for nurturing Islamic values in young minds. Check out our children's section at babulfatah.com!",
  recommendation: "For personalized book recommendations, I'd suggest browsing our bestsellers section at babulfatah.com. You can also WhatsApp us at +92 326 5903300 and our team will help you find exactly what you need. We offer Cash on Delivery nationwide!",
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('quran') || lower.includes('qur'an') || lower.includes('koran')) {
    return FALLBACK_RESPONSES.quran;
  }
  if (lower.includes('hadith') || lower.includes('bukhari') || lower.includes('muslim') || lower.includes('riyad')) {
    return FALLBACK_RESPONSES.hadith;
  }
  if (lower.includes('seerah') || lower.includes('prophet') || lower.includes('muhammad') || lower.includes('biography')) {
    return FALLBACK_RESPONSES.seerah;
  }
  if (lower.includes('children') || lower.includes('kids') || lower.includes('child') || lower.includes('goodword')) {
    return FALLBACK_RESPONSES.children;
  }
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('best')) {
    return FALLBACK_RESPONSES.recommendation;
  }
  return FALLBACK_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit check ──
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
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

    // ── Try SDK first, fall back gracefully ──
    let reply: string | null = null;

    try {
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are Salamee, an Islamic knowledge assistant for Bab-ul-Fatah — Pakistan's largest online Islamic bookstore.

Your personality:
- Warm, respectful, and knowledgeable
- Greet with Islamic greetings (Assalamu Alaikum)
- Use respectful language and Islamic etiquette
- Reference authentic Islamic sources when relevant

Your role:
- Help customers find Islamic books, Quran translations, Hadith collections, Tafseer, Seerah, and more
- Provide book recommendations based on interests
- Answer general questions about Islamic knowledge
- Guide customers to the right categories on the store
- Mention that Bab-ul-Fatah offers Cash on Delivery, JazzCash, EasyPaisa, and Bank Transfer
- Free delivery on orders over Rs. 5,000

Store info:
- Website: babulfatah.com
- WhatsApp: +92 326 5903300
- 1,200+ Islamic books and products

Keep responses concise (2-4 paragraphs max) and helpful. If asked about non-Islamic topics, politely redirect to Islamic knowledge.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      reply = completion.choices?.[0]?.message?.content || null;

      if (reply && reply.trim().length > 0) {
        return NextResponse.json({ reply: reply.trim() });
      }
    } catch (sdkError: unknown) {
      // Log the SDK error for debugging but don't expose to user
      const sdkMsg = sdkError instanceof Error ? sdkError.message : String(sdkError);
      console.error('[Salamee] SDK error (falling back):', sdkMsg);
    }

    // ── SDK failed or returned empty — use intelligent fallback ──
    console.log('[Salamee] Using fallback response for:', message.slice(0, 50));
    const fallbackReply = getFallbackResponse(message);

    return NextResponse.json({ reply: fallbackReply });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Salamee] API error:', msg);

    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}
