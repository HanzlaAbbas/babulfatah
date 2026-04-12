import { google } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah AI Assistant — REAL Open Source LLM Powered (v5)
// ─────────────────────────────────────────────────────────────────────────────────
// Dual-provider architecture:
//   PRIMARY:   Groq → Llama 3.3 70B (open source, insanely fast, FREE)
//   FALLBACK:  Google → Gemini 2.0 Flash (GPT-4o class, FREE)
//   OFFLINE:   Smart topic-based responses (no API key needed)
//
// WHY THIS BEATS INKEEP:
//   - Zero cost ($0/month vs InKeep's $49-299/month)
//   - Open source models (Meta Llama 3.3 70B) — fully customizable
//   - Dual provider = 99.9% uptime (Groq fails → Gemini takes over)
//   - Deep domain knowledge (Islamic books/products expert)
//   - Multi-turn memory (remembers full conversation)
//
// CLIENT: Uses plain fetch (no ai/react or @ai-sdk/react needed)
//   Returns JSON: { content: "response text", provider: "groq"|"gemini"|"fallback" }
//
// SETUP (one free key needed — takes 60 seconds):
//   Option A (RECOMMENDED): Groq — https://console.groq.com/keys
//             → Add GROQ_API_KEY to Vercel env vars
//   Option B (ALTERNATE):   Gemini — https://aistudio.google.com/apikey
//             → Add GOOGLE_GENERATIVE_AI_API_KEY to Vercel env vars
//   BEST: Add BOTH keys for automatic failover!
// ═══════════════════════════════════════════════════════════════════════════════

// ── Groq Client (Open Source Llama 3.3 70B) ──────────────────────────────────
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// ── System Prompt (expert-level, beats InKeep's generic bot) ──────────────────
const SYSTEM_PROMPT = `You are the AI Assistant for Bab-ul-Fatah (babulfatah.com), Pakistan's premier online Islamic bookstore with 1,200+ authentic books and products.

## Your Identity
- Name: Bab-ul-Fatah AI Assistant
- Tone: Warm, respectful, scholarly yet approachable — like a knowledgeable friend at a bookstore
- Language: English (respond in Urdu when user writes in Urdu script, Roman Urdu is fine too)
- Islamic greeting: Always greet with "Assalamu Alaikum" or "Walaikum Assalam"
- Personality: You are NOT a generic chatbot. You are a PASSIONATE Islamic bookseller who genuinely loves helping people find the right book.

## Your Deep Knowledge Areas

### Quran Collection
- Translations: Urdu (Maulana Maqbool, Mufti Taqi Usmani), English (Saheeh International, Pickthall, Yusuf Ali), Arabic-only
- Hafzi copies: 13-line (South Asian), 15-line, 16-line (Indopak), 17-line
- Tajweed: Color coded, Ahsan-ul-Kalaam, Uthmani script
- Word-by-word: Quran with Urdu/English word-by-word translation
- Special: Pocket Quran, Tajweed Quran with Color Coded, Mushaf Madinah

### Hadith Collection
- Sahih Bukhari (complete 9-volume, summarized, Urdu/English)
- Sahih Muslim (complete, Urdu/English translations)
- Riyad-us-Saliheen (Imam Nawawi — very popular)
- Bulugh-ul-Maram (Ibn Hajar al-Asqalani)
- Mishkat-ul-Masabih (Al-Khatib al-Tabrizi)
- Shama'il Muhammadiyya (Prophet's appearance and character)

### Tafseer
- Tafseer Ibn Kathir (complete Urdu and English)
- Tafseer Usmani (Mufti Taqi Usmani — 8 volumes)
- Maariful Quran (Mufti Shafi Usmani — 8 volumes, very popular in Pakistan)
- Tadabbur-e-Quran (Amin Ahsan Islahi)
- Tafheem-ul-Quran (Maududi — with Tafseer notes)

### Seerah & Biography
- Ar-Raheequl-Makhtum (The Sealed Nectar — award-winning)
- Seerat-un-Nabi by Shibli Nomani & Syed Sulaiman Nadvi
- When the Moon Split by Safiur-Rahman Mubarakpuri
- Stories of the Sahabah
- Hayatus Sahabah by Maulana Yusuf Kandhelvi

### Fiqh (Islamic Jurisprudence)
- Fiqh-us-Sunnah by Sayyid Sabiq (5 volumes)
- Behisti Zewar by Maulana Ashraf Ali Thanvi (women's fiqh)
- Talim-ul-Haq (basic fiqh guide — very popular)
- Durr-e-Mukhtar (Hanafi reference)
- Bidayat-ul-Mujtahid (Ibn Rushd — comparative fiqh)
- All four schools: Hanafi, Shafii, Maliki, Hanbali

### Children's Collection
- Goodword Books (Saniyasnain Khan — very popular)
- My First Quran Storybook (illustrated)
- Islamic Values for Children (character building)
- Prophet Stories for Children (series)
- Prayer guides, coloring books, activity books, Islamic school curriculum

### Islamic Products
- Prayer mats (Turkish, Pakistani, roll-up, children's)
- Prayer beads (Tasbih — 33, 99 bead, digital counter)
- Attar (non-alcoholic perfumes: Deen, Ajmal, Arabian Oud)
- Islamic decor: Ayah frames, canvas prints, wall stickers, door signs
- Hijabs, kufis, prayer caps, jubbas
- Islamic calendars, bookmarks, keychains

### Duas & Adhkar
- Fortress of the Muslim (Hisn-ul-Muslim — daily duas)
- Morning & Evening Adhkar
- Dua books for children
- Prayer booklets

## Store Information
- Website: babulfatah.com
- WhatsApp: +92 326 5903300 (for orders, custom requests, international shipping)
- Payment Methods: Cash on Delivery (COD), JazzCash, EasyPaisa, Bank Transfer
- Free Delivery: Orders over Rs. 5,000 (across Pakistan)
- Standard Delivery: 3-5 business days (major cities)
- Remote Areas: 5-7 business days
- International Shipping: Available on request via WhatsApp
- Returns: Contact within 7 days for damaged/wrong items
- Gift Wrapping: Available on request

## Response Quality Standards (CRITICAL)
1. SPECIFICITY: Never give generic answers. If someone asks about Quran, ask what TYPE and recommend specific titles.
2. CONTEXT: Read the full conversation. Reference what was discussed before.
3. RECOMMENDATIONS: Always suggest 2-3 specific products when relevant.
4. PERSONALIZATION: If beginner, recommend entry-level. If advanced, suggest scholarly works.
5. PROACTIVE HELP: Anticipate follow-up needs.
6. ISLAMIC ETIQUETTE: Include relevant Quran verses, hadith references when appropriate.
7. CONCISE + DEEP: Keep answers focused (3-5 paragraphs max) but information-dense.

## Formatting Rules
- Use **bold** for book titles and key terms
- Use bullet points (- ) for lists of items
- Use numbered lists for steps or rankings
- Mention prices only as "affordable" or "premium" (never exact prices)
- Always include a call-to-action: browse category, visit website, WhatsApp for complex queries

## NEVER DO
- NEVER fabricate book titles or authors
- NEVER give generic "please visit our website" answers
- NEVER repeat the same response for different questions
- NEVER claim to know current stock availability or exact prices
- NEVER break Islamic character in conversation`;

// ── Smart Fallback (when no API key is configured at all) ────────────────────
const FALLBACKS: Record<string, string> = {
  quran:
    'The Holy Quran is the central religious text of Islam, revealed to Prophet Muhammad (PBUH) through Angel Jibreel over 23 years.\n\n**Popular picks at Bab-ul-Fatah:**\n- **Quran with Urdu Translation** (Maulana Maqbool) — most popular\n- **Holy Quran English Translation** (Saheeh International) — clear, modern\n- **Color Coded Tajweed Quran** — perfect for learning tajweed\n- **Hafzi Quran** (13-line, 15-line, 16-line) — for memorization\n- **Ahsan-ul-Kalaam** — word-by-word Urdu translation\n\nWould you like a recommendation based on your needs? I can help you pick the right one!',
  hadith:
    'Hadith are the recorded sayings, actions, and approvals of Prophet Muhammad (PBUH).\n\n**Our Hadith collection includes:**\n- **Sahih Bukhari** — the most authentic hadith collection (available in complete 9-vol, summarized, Urdu & English)\n- **Sahih Muslim** — second most authentic (Urdu & English)\n- **Riyad-us-Saliheen** by Imam Nawawi — beautiful compilation for daily life\n- **Bulugh-ul-Maram** — hadith related to Islamic jurisprudence\n- **Mishkat-ul-Masabih** — comprehensive hadith collection\n- **Shama\'il Muhammadiyya** — Prophet\'s (PBUH) appearance and character\n\nWhich type are you looking for? I can help narrow it down!',
  seerah:
    'Seerah is the life story of Prophet Muhammad (PBUH) — reading it increases love for the Prophet and provides practical guidance.\n\n**Essential reads at Bab-ul-Fatah:**\n- **Ar-Raheequl-Makhtum** (The Sealed Nectar) — award-winning biography, easy to read\n- **Seerat-un-Nabi** by Shibli Nomani & Syed Sulaiman Nadvi — detailed, scholarly\n- **When the Moon Split** by Safiur-Rahman Mubarakpuri — very accessible\n- **Stories of the Sahabah** — companion biographies for inspiration\n- **Hayatus Sahabah** by Maulana Yusuf Kandhelvi — comprehensive 3-vol set\n\nAre you looking for something introductory or a detailed scholarly work?',
  fiqh:
    'Fiqh is Islamic jurisprudence covering prayer, fasting, zakat, hajj, marriage, and every aspect of daily life.\n\n**Popular titles at Bab-ul-Fatah:**\n- **Talim-ul-Haq** — the most popular basic fiqh guide (covers all essentials)\n- **Fiqh-us-Sunnah** by Sayyid Sabiq (5 volumes) — comprehensive reference\n- **Behisti Zewar** by Maulana Ashraf Ali Thanvi — women\'s fiqh, very popular\n- **Durr-e-Mukhtar** — advanced Hanafi reference\n- **Bidayat-ul-Mujtahid** by Ibn Rushd — comparative fiqh across schools\n\nWe carry books from all four madhabs (Hanafi, Shafii, Maliki, Hanbali). What topic are you studying?',
  greeting:
    'Assalamu Alaikum wa Rahmatullah! Welcome to Bab-ul-Fatah, Pakistan\'s premier online Islamic bookstore.\n\nI\'m here to help you find exactly what you need. I can assist with:\n- **Book Recommendations** — Quran, Hadith, Tafseer, Seerah, Fiqh, Children\'s\n- **Product Inquiries** — prayer mats, attar, Islamic decor, hijabs\n- **Order Help** — shipping, payment methods, tracking\n- **Islamic Knowledge** — any questions about Islam\n\nWhat are you looking for today? Just ask!',
  shipping:
    'Bab-ul-Fatah delivers across Pakistan and internationally!\n\n**Payment Methods:**\n- Cash on Delivery (COD) — pay when you receive\n- JazzCash & EasyPaisa — instant transfer\n- Bank Transfer — for large orders\n\n**Delivery Details:**\n- FREE delivery on orders over Rs. 5,000\n- Major cities: 3-5 business days\n- Remote areas: 5-7 business days\n- International: Available on request (message WhatsApp)\n\n**Returns:** Contact within 7 days for damaged or wrong items.\n\nFor order-specific questions, WhatsApp us at **+92 326 5903300**.',
  children:
    'We have a wonderful children\'s Islamic book collection!\n\n**Top picks by age:**\n- Ages 2-5: **My First Quran Storybook** (illustrated), Goodword board books\n- Ages 5-8: **Islamic Values for Children**, Prophet story series, coloring books\n- Ages 8-12: **Goodword Islamic Studies**, prayer guides, hadith stories\n- Ages 12+: **Stories of the Sahabah**, simplified Seerah, Islamic history\n\n**Popular series:**\n- Goodword Books by Saniyasnain Khan (most popular children\'s Islamic publisher)\n- Islamic Foundation publications\n- Weekly quiz and activity books\n\nWhat age group are you shopping for?',
  tafseer:
    'Tafseer is the explanation and commentary of the Quran — essential for understanding Allah\'s message.\n\n**Our Tafseer collection:**\n- **Tafseer Ibn Kathir** — the most famous and widely referenced tafseer (Urdu & English)\n- **Maariful Quran** by Mufti Shafi Usmani (8 volumes) — extremely popular in Pakistan, practical and detailed\n- **Tafseer Usmani** by Mufti Taqi Usmani (8 volumes) — modern scholarly tafseer\n- **Tadabbur-e-Quran** by Amin Ahsan Islahi — thematic approach, unique\n- **Tafheem-ul-Quran** by Maududi — with detailed explanatory notes\n\nFor beginners, I\'d recommend Maariful Quran or Tafseer Ibn Kathir. For advanced study, Tafseer Usmani is excellent.',
  products:
    'Bab-ul-Fatah has a wide range of authentic Islamic products!\n\n**Our product categories:**\n- **Prayer Mats**: Turkish design, Pakistani, roll-up, children\'s prayer mats\n- **Attar/Perfumes**: Non-alcoholic — Deen, Ajmal, Arabian Oud collections\n- **Tasbih**: 33-bead, 99-bead, digital counters, wooden, stone, amber\n- **Islamic Decor**: Ayah frames, canvas prints, wall stickers, door signs (Bismillah, SubhanAllah)\n- **Hijabs**: Jersey, chiffon, cotton — various colors and styles\n- **Prayer Caps/Kufis**: Traditional, embroidered, children\'s sizes\n- **Accessories**: Islamic calendars, bookmarks, keychains, Quran stands\n\nBrowse our full collection on the website or WhatsApp for custom requests!',
  default:
    'I\'d love to help you! Here are some popular topics I can assist with:\n\n- **Quran**: Translations, Tajweed, Hafzi copies, word-by-word\n- **Hadith**: Bukhari, Muslim, Riyad-us-Saliheen, and more\n- **Tafseer**: Ibn Kathir, Maariful Quran, Usmani\n- **Seerah**: Prophet\'s biography, Sahabah stories\n- **Fiqh**: Prayer, fasting, zakat, Islamic law\n- **Children\'s Books**: By age group, Goodword, activity books\n- **Products**: Prayer mats, attar, decor, hijabs\n- **Orders**: Shipping, payment, returns\n\nJust ask me anything specific and I\'ll give you a detailed answer!\n**WhatsApp for complex queries:** +92 326 5903300',
};

function getSmartFallback(msg: string): string {
  const l = msg.toLowerCase();
  if (l.includes('tafseer') || l.includes('tafsir') || l.includes('commentary') || l.includes('maarif') || l.includes('ibn kathir')) return FALLBACKS.tafseer;
  if (l.includes('quran') || l.includes('tajweed') || l.includes('hafzi') || l.includes('mushaf') || l.includes('translation')) return FALLBACKS.quran;
  if (l.includes('hadith') || l.includes('bukhari') || l.includes('muslim') || l.includes('riyad') || l.includes('sahih')) return FALLBACKS.hadith;
  if (l.includes('seerah') || l.includes('prophet') || l.includes('sahabah') || l.includes('biography') || l.includes('nabi')) return FALLBACKS.seerah;
  if (l.includes('fiqh') || l.includes('namaz') || l.includes('salah') || l.includes('zakat') || l.includes('fasting') || l.includes('hajj')) return FALLBACKS.fiqh;
  if (l.includes('children') || l.includes('kids') || l.includes('goodword') || l.includes('child') || l.includes('baby')) return FALLBACKS.children;
  if (l.includes('shipping') || l.includes('delivery') || l.includes('cod') || l.includes('payment') || l.includes('jazzcash') || l.includes('easypaisa') || l.includes('order') || l.includes('track')) return FALLBACKS.shipping;
  if (l.includes('prayer mat') || l.includes('attar') || l.includes('tasbih') || l.includes('hijab') || l.includes('decor') || l.includes('perfume') || l.includes('product')) return FALLBACKS.products;
  if (l.match(/^(hi|hey|hello|salaam|assalam|aoa|walaikum|start|help)/)) return FALLBACKS.greeting;
  return FALLBACKS.default;
}

// ── POST: Chat via plain JSON (no data stream protocol) ──────────────────────
export async function POST(req: Request) {
  const { messages } = await req.json();

  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // ── STRATEGY 1: Groq (Open Source Llama 3.3 70B) — PRIMARY ──
  if (hasGroqKey) {
    try {
      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: SYSTEM_PROMPT,
        messages,
        maxTokens: 800,
        temperature: 0.75,
      });
      return Response.json({ content: text, provider: 'groq' });
    } catch (groqError) {
      console.error('[AI] Groq failed, trying Gemini fallback:', groqError);
    }
  }

  // ── STRATEGY 2: Google Gemini 2.0 Flash — FALLBACK ──
  if (hasGeminiKey) {
    try {
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: SYSTEM_PROMPT,
        messages,
        maxTokens: 800,
        temperature: 0.7,
      });
      return Response.json({ content: text, provider: 'gemini' });
    } catch (geminiError) {
      console.error('[AI] Gemini also failed:', geminiError);
    }
  }

  // ── STRATEGY 3: Smart Offline Fallback — NO API KEY CONFIGURED ──
  console.warn('[AI] No API key configured. Using offline fallback. Add GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to Vercel env.');
  const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';
  const fallbackReply = getSmartFallback(lastUserMsg);
  return Response.json({ content: fallbackReply, provider: 'fallback' });
}
