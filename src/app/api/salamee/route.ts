import { NextRequest, NextResponse } from 'next/server';

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

    // ── Dynamic import z-ai-web-dev-sdk ──
    // This prevents build-time import failures on environments where the SDK
    // is not available or has initialization issues.
    let ZAI: any;
    try {
      const sdk = await import('z-ai-web-dev-sdk');
      ZAI = sdk.default || sdk.ZAI || sdk;
    } catch (sdkErr) {
      console.error('Failed to import z-ai-web-dev-sdk:', sdkErr);
      return NextResponse.json({
        reply: "I'm currently having trouble connecting to my knowledge base. Please try again in a moment, or contact us on WhatsApp at +92 326 5903300 for immediate assistance."
      });
    }

    let zai: any;
    try {
      zai = await ZAI.create();
    } catch (createErr) {
      console.error('Failed to initialize ZAI SDK:', createErr);
      return NextResponse.json({
        reply: "I'm having trouble initializing right now. Please try again in a moment, or WhatsApp us at +92 326 5903300 for help."
      });
    }

    // ── Try AI completion with fallback ──
    let reply: string | null = null;

    try {
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

      reply = completion?.choices?.[0]?.message?.content || null;
    } catch (completionErr) {
      console.error('AI completion failed:', completionErr);
    }

    // ── Fallback: helpful predefined responses ──
    if (!reply) {
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('quran') || lowerMsg.includes('qur'an')) {
        reply = "We have a wide range of Quran translations including Urdu (Kanzul Iman, Ahsan-ul-Bayan), Arabic, and English (Sahih International, Pickthall). Our premium quality Qurans feature beautiful binding and clear print. You can browse our collection at /shop?category=quran or WhatsApp us at +92 326 5903300 for recommendations!";
      } else if (lowerMsg.includes('hadith')) {
        reply = "Our Hadith collection includes Sahih Bukhari, Sahih Muslim, Riyad-us-Saliheen, Bulugh-ul-Maram, and more — available in Urdu, Arabic, and English. These are essential for every Muslim's library. Visit /shop?category=hadith to explore or message us on WhatsApp for suggestions!";
      } else if (lowerMsg.includes('seerah') || lowerMsg.includes('prophet') || lowerMsg.includes('biography')) {
        reply = "For Seerah, we highly recommend Ar-Raheequl-Makhtum (The Sealed Nectar) — a masterpiece about the Prophet's life ﷺ. We also carry detailed biographies of the Sahabah and Islamic scholars. Browse at /shop?category=prophets-seerah or contact us for personalized recommendations!";
      } else if (lowerMsg.includes('children') || lowerMsg.includes('kids')) {
        reply = "We have a wonderful selection of children's Islamic books including Goodword publications — storybooks, coloring books, prayer guides, and educational series. They make perfect gifts to nurture love for Islam in young hearts! Visit /shop?category=children to explore the collection.";
      } else if (lowerMsg.includes('price') || lowerMsg.includes('cod') || lowerMsg.includes('delivery') || lowerMsg.includes('shipping')) {
        reply = "We offer Cash on Delivery (COD) nationwide across Pakistan! Delivery is FREE on orders above Rs. 5,000. We also accept JazzCash, EasyPaisa, and Bank Transfer. For international orders, please WhatsApp us at +92 326 5903300. Standard delivery takes 3-5 business days within Pakistan.";
      } else if (lowerMsg.includes('whatsapp') || lowerMsg.includes('contact') || lowerMsg.includes('phone')) {
        reply = "You can reach us anytime on WhatsApp at +92 326 5903300. Our team is available 24/7 to help with book recommendations, order inquiries, and any questions. You can also email us at support@babulfatah.com.";
      } else {
        reply = "Thank you for your message! I'd love to help you find the perfect Islamic books. You can browse our collection of 1,200+ titles at babulfatah.com, or for personalized recommendations, please WhatsApp us at +92 326 5903300 — our team is available 24/7. JazakAllahu Khairan for shopping with Bab-ul-Fatah!";
      }
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Salamee API error:', msg);
    return NextResponse.json({
      reply: "I apologize for the inconvenience. I'm currently unable to process your request. Please try again in a moment, or reach out to us directly on WhatsApp at +92 326 5903300 for immediate assistance. JazakAllahu Khairan!"
    });
  }
}
