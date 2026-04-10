#!/usr/bin/env node
const ZAI = require('z-ai-web-dev-sdk').default;
async function main() {
  const zai = await ZAI.create();
  console.log('Testing single AI call...');
  const r = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an SEO copywriter. Write a 100-word product description for each item. Format: ===1=== followed by description.' },
      { role: 'user', content: '[1] Title: "Sahih Al-Bukhari" | Author: Imam Bukhari | Category: Hadith\n[2] Title: "Tajweed Quran" | Author: Darussalam | Category: Quran' },
    ],
  });
  console.log('Response:', r.choices?.[0]?.message?.content?.trim());
}
main().catch(e => console.error('Error:', e.message));
