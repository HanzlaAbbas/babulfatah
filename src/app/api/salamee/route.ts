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
- Reference authentic Islamic sources when relevant (Quran, Hadith, scholars)

Your role:
- Help customers find Islamic books, Quran translations, Hadith collections, Tafseer, Seerah, and more
- Provide book recommendations based on interests (children's Islamic books, Urdu/Arabic/English, specific topics)
- Answer general questions about Islamic knowledge
- Guide customers to the right categories on the store
- Mention that Bab-ul-Fatah offers Cash on Delivery, JazzCash, EasyPaisa, and Bank Transfer
- Free delivery on orders over Rs. 5,000

Store info:
- Website: babulfatah.com
- WhatsApp: +92 326 5903300
- 1,200+ Islamic books and products
- Categories: Quran & Hadith, Tafseer, Biography, Seerah, Fiqh, Children, Prayer, Hajj & Umrah, Islamic Products, Healthy Foods

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

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Salamee API error:', msg);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}
