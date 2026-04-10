// ============================================================================
// Bab-ul-Fatah — Phase 1: Darussalam.pk Scraper (data-only)
// ============================================================================
// Scrapes product data from darussalam.pk and saves to JSON.
// Run: npx ts-node --project tsconfig.scripts.json scripts/scrape-darussalam-step1.ts
// Then: npx ts-node --project tsconfig.scripts.json scripts/scrape-darussalam-step2.ts
// ============================================================================

import ZAI from "z-ai-web-dev-sdk";
import * as fs from "fs";
import * as path from "path";

const OUTPUT = path.join(process.cwd(), "download", "darussalam-raw.json");
const DELAY = 1500;

const URLS: string[] = [
  "https://darussalam.pk/products/110-ahadith-qudsi-1",
  "https://darussalam.pk/products/60-golden-hadith-for-children-urdu-arabic-english",
  "https://darussalam.pk/products/a-flying-envoy",
  "https://darussalam.pk/products/ahkam-e-satr-o-hijab",
  "https://darussalam.pk/products/al-quran-al-kareem-ahsan-al-hawashi-imp",
  "https://darussalam.pk/products/al-talibaat-ma-ahadith-rasool",
  "https://darussalam.pk/products/allah-kay-akhri-nabi-saw",
  "https://darussalam.pk/products/an-nawawi-40-hadith-prophets-traditions-pocket-size",
  "https://darussalam.pk/products/ar-raheeq-al-makhtum-urdu",
  "https://darussalam.pk/products/ar-raheeq-al-makhtum-urdu-aala-quality",
  "https://darussalam.pk/products/asaan-tarjuma-quran-e-kareem-ds",
  "https://darussalam.pk/products/byan-ul-quran-by-dr-israr-ahmed",
  "https://darussalam.pk/products/hidayat-al-qari-sharh-sahih-al-bukhari-10-volume-set-local",
  "https://darussalam.pk/products/his-faith-was-great-the-story-of-prophet-ibrahim-a-3rd-part-3",
  "https://darussalam.pk/products/hisn-ul-muslim-14x21",
  "https://darussalam.pk/products/hisn-ul-muslim-8x12-pocket-size",
  "https://darussalam.pk/products/jaado-ki-haqeeqat",
  "https://darussalam.pk/products/jadoo-tonay-ka-ilaaj",
  "https://darussalam.pk/products/khawateen-aur-ramadan-ul-mubarak-1",
  "https://darussalam.pk/products/muallim-al-tajweed-7b-tajweedi-quran-16-lines",
  "https://darussalam.pk/products/mukhtasar-sahih-al-bukhari-2-volume-set",
  "https://darussalam.pk/products/namaz-e-nabvi-hard-cover-14x21",
  "https://darussalam.pk/products/namaz-e-nabvi-s-c-12x17",
  "https://darussalam.pk/products/pyary-rasool-ki-payari-duain-pocket-aam",
  "https://darussalam.pk/products/qisas-al-anbiya",
  "https://darussalam.pk/products/questions-answers-on-the-mothers-of-the-believers",
  "https://darussalam.pk/products/qurani-qaidah-14x21",
  "https://darussalam.pk/products/qurani-qaidah-17x24",
  "https://darussalam.pk/products/rabbana-qurani-duayein",
  "https://darussalam.pk/products/rehmat-e-alam",
  "https://darussalam.pk/products/rehnima-e-hajj-o-umrah",
  "https://darussalam.pk/products/riyad-us-saliheen-2-vol-set-1",
  "https://darussalam.pk/products/riyad-us-saliheen-2-vol-set-new-edition-17x24",
  "https://darussalam.pk/products/riyad-us-saliheen-darsi-urdu",
  "https://darussalam.pk/products/sayeda-khadija-r-a-aur-unki-betiyan",
  "https://darussalam.pk/products/sayeda-khadija-r-a-ki-zindagi-kai-sunehray-waqiyat",
  "https://darussalam.pk/products/sayedina-hazrat-ali-r-a-ki-zindagi-kay-sunehray-waqiyat",
  "https://darussalam.pk/products/seerat-encyclopedia-11-books-complete-set",
  "https://darussalam.pk/products/seerat-un-nabi-pbuh-2-vols-set",
  "https://darussalam.pk/products/story-of-khabbab-bin-al-aratt",
  "https://darussalam.pk/products/summarized-sahih-al-bukhari-arabic-english-local",
  "https://darussalam.pk/products/sunan-abu-daood-urducomplete-set",
  "https://darussalam.pk/products/sunehri-kirney",
  "https://darussalam.pk/products/sunnat-e-mutahirah-aur-adab-e-mubashrat",
  "https://darussalam.pk/products/syedina-usman-bin-affna-ki-zindagi-k-sunehray-waqiyat",
  "https://darussalam.pk/products/tafseer-ahsan-ul-bayyan-jumbo-size",
  "https://darussalam.pk/products/tafseer-ahsan-ul-kalam-17x24",
  "https://darussalam.pk/products/tafseer-ibn-e-kathir-6-vol-set-imported",
  "https://darussalam.pk/products/tafsir-ahsan-ul-bayan-17x24",
  "https://darussalam.pk/products/tafsir-ahsan-ul-kalaam-hard-cover-pocket-size",
  "https://darussalam.pk/products/tafsir-ibn-kathir-english-10-vols-set",
  "https://darussalam.pk/products/taiseer-al-quran-4-volume-set-computerized",
  "https://darussalam.pk/products/the-biography-of-abu-bakr-as-siddeeq-r-a",
  "https://darussalam.pk/products/the-biography-of-uthman-ibn-affan",
  "https://darussalam.pk/products/the-noble-quran-art-paper",
  "https://darussalam.pk/products/the-quest-for-truth",
  "https://darussalam.pk/products/the-sealed-nectar-ar-raheeq-al-makhtoum-4-color-print",
  "https://darussalam.pk/products/the-sealed-nectar-ar-raheequl-makhtum",
  "https://darussalam.pk/products/the-story-of-muhammad-saw-in-makkah-art-paper",
  "https://darussalam.pk/products/tib-e-nabvi-latest",
  "https://darussalam.pk/products/when-the-moon-split-new-edition",
  "https://darussalam.pk/products/why-women-are-accepting-islam",
];

function cleanPrice(raw: string): number {
  const c = raw.replace(/[Rs.\s]|PKR|₨|Rs/gi, "").replace(/,/g, "").trim();
  return isNaN(parseFloat(c)) ? 0 : parseFloat(c);
}

function detectLang(title: string): string {
  if (/[\u0600-\u06FF]/.test(title)) return "URDU";
  if (/\b(Urdu|اردو)\b/i.test(title)) return "URDU";
  return "ENGLISH";
}

function extractAuthor(title: string): string | null {
  const m = title.match(/\s+by\s+(.+)$/i);
  if (m) return m[1].trim();
  return null;
}

async function scrapeOne(zai: any, url: string) {
  const r = await zai.functions.invoke("page_reader", { url });
  const html = (r.data?.html || "") as string;
  if (html.length < 500) return null;

  // Images
  const imgs: string[] = [];
  const seen = new Set<string>();
  for (const tag of (html.match(/<img[^>]+>/gi) || [])) {
    const m = tag.match(/src="(\/\/darussalam\.pk\/cdn\/shop\/files\/[^"]+)"/i);
    if (!m) continue;
    const src = m[1].split("?")[0];
    if (seen.has(src) || /Logo_|icon|favicon|emoji/i.test(src)) continue;
    const wm = tag.match(/width="(\d+)"/);
    if (wm && parseInt(wm[1]) < 200) continue;
    seen.add(src);
    imgs.push(`https:${src}`);
  }
  if (imgs.length === 0) {
    for (const tag of (html.match(/<img[^>]+>/gi) || [])) {
      const m = tag.match(/src="(\/\/darussalam\.pk\/cdn\/shop\/files\/[^"]+)"/i);
      if (!m || seen.has(m[1]) || /Logo_/i.test(m[1])) continue;
      seen.add(m[1].split("?")[0]);
      imgs.push(`https:${m[1].split("?")[0]}`);
      if (imgs.length >= 3) break;
    }
  }

  // Title
  let title = "";
  for (const blk of (html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gis) || [])) {
    try { const p = JSON.parse(blk); if (p.name) { title = p.name; break; } } catch {}
  }
  if (!title) {
    const tm = html.match(/<title>([^<]+)/i);
    if (tm) title = tm[1].replace(/\s*[-|].*Darussalam.*/i, "").trim();
  }

  // Price
  let price = 0;
  for (const blk of (html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gis) || [])) {
    try { const p = JSON.parse(blk); if (p.offers?.price) { price = parseFloat(p.offers.price); break; } } catch {}
  }
  if (!price) { const pm = html.match(/Rs\.?\s*[\d,]+\.?\d*/); if (pm) price = cleanPrice(pm[0]); }

  // SKU
  const sm = html.match(/SKU:\s*(\S+)/i);
  const sku = sm ? sm[1] : "";

  // Description
  let desc = "";
  const dm = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (dm) desc = dm[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);

  // Breadcrumbs
  const bcs: string[] = [];
  const bcm = html.match(/<nav[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/i);
  if (bcm) {
    for (const lm of (bcm[0].match(/<a[^>]*>([^<]+)<\/a>/gi) || [])) {
      const t = lm.replace(/<[^>]+>/g, "").trim();
      if (t.length > 1 && !["home", "shop", "store", ""].includes(t.toLowerCase())) bcs.push(t);
    }
  }
  if (bcs.length === 0) bcs.push("Books");

  return { url, title, price, sku, images: imgs.slice(0, 20), breadcrumbs: bcs, authorName: extractAuthor(title), rawDescription: desc, language: detectLang(title), inStock: !/sold out|out of stock/i.test(html) };
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const start = Date.now();
  console.log(`\nScraping ${URLS.length} products from darussalam.pk...\n`);
  const zai = await ZAI.create();
  const results: any[] = [];
  let fails = 0;

  for (let i = 0; i < URLS.length; i++) {
    console.log(`[${i + 1}/${URLS.length}] ${URLS[i].split("/").pop()}...`);
    try {
      const p = await scrapeOne(zai, URLS[i]);
      if (p && p.title) {
        results.push(p);
        console.log(`  ✅ ${p.title} | Rs.${p.price.toLocaleString()} | ${p.images.length} imgs`);
      } else { fails++; console.log("  ⚠️ Skipped (no title)"); }
    } catch (e: any) { fails++; console.log(`  ❌ ${e.message}`); }
    if (i < URLS.length - 1) await sleep(DELAY);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Done! ${results.length} products, ${fails} fails, ${elapsed}s`);
  console.log(`Saved to ${OUTPUT}`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
