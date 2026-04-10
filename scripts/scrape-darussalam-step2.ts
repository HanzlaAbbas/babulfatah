// ============================================================================
// Bab-ul-Fatah — Phase 2: AI Descriptions + Phase 3: DB Import
// ============================================================================
// Reads darussalam-raw.json, generates SEO descriptions via AI,
// and imports everything into the database.
//
// Run: npx ts-node --project tsconfig.scripts.json scripts/scrape-darussalam-step2.ts
// ============================================================================

import ZAI from "z-ai-web-dev-sdk";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const RAW_FILE = path.join(process.cwd(), "download", "darussalam-raw.json");
const AI_DELAY = 1500;

// ── Helpers ─────────────────────────────────────────────────────────────

function log(lvl: string, msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  const ico = lvl === "OK" ? "✅" : lvl === "ERR" ? "❌" : "⚠️";
  console.log(`${ico} [${ts}] ${msg}`);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/&amp;/g, "").replace(/&[a-z]+;/gi, "")
    .replace(/[^a-z0-9\s\-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 80);
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  const zai = await ZAI.create();

  if (!fs.existsSync(RAW_FILE)) {
    console.error(`❌ ${RAW_FILE} not found. Run step1 first.`);
    process.exit(1);
  }

  const raw: any[] = JSON.parse(fs.readFileSync(RAW_FILE, "utf-8"));
  console.log(`\nLoaded ${raw.length} products from step 1.\n`);

  // ════════════════════════════════════════════════════════
  //  PHASE 2: AI DESCRIPTIONS
  // ════════════════════════════════════════════════════════
  console.log(`Phase 2: Generating ${raw.length} SEO descriptions via AI...\n`);

  const catalog = raw.map((r: any, i: number) => {
    const breadcrumbs = r.breadcrumbs || ["Books"];
    const lang = r.language || "ENGLISH";
    return {
      title: r.title,
      slug: slugify(r.title),
      description: "", // filled below
      price: r.price || 0,
      stock: r.inStock ? 15 : 0,
      sku: r.sku || "",
      language: lang,
      images: r.images || [],
      breadcrumbs,
      authorName: r.authorName || null,
      source: "Darussalam.pk",
    };
  });

  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    console.log(`[${i + 1}/${raw.length}] ${r.title.slice(0, 55)}`);

    try {
      const resp = await zai.chat.completions.create({
        messages: [
          { role: "system", content: "You are an expert Islamic commerce copywriter for Bab-ul-Fatah, Pakistan's premium Islamic e-commerce platform. Write concise SEO-optimized product descriptions in plain paragraphs. No HTML, no markdown, no JSON." },
          { role: "user", content: `Write a 2-3 paragraph SEO product description for:\n\nTitle: ${r.title}\nPrice: Rs. ${(r.price || 0).toLocaleString("en-PK")}\nCategory: ${breadcrumbs.join(" → ")}\nAuthor: ${r.authorName || "N/A"}\nLanguage: ${lang}${r.rawDescription ? `\nReference (DO NOT copy): ${r.rawDescription.slice(0, 400)}` : ""}\n\nRequirements:\n1. Write in ${lang === "URDU" ? "Urdu with some English terms" : "English"}\n2. Mention key features, target audience, and value\n3. Include relevant SEO keywords naturally\n4. Do NOT mention Darussalam or competitors\n5. No HTML/markdown — just plain paragraphs\n6. 150-300 words` },
        ],
      });
      catalog[i].description = (resp.choices[0]?.message?.content?.trim() || "").slice(0, 2000)
        || `${r.title} is a premium Islamic publication available at Bab-ul-Fatah. Authored by ${r.authorName || "a renowned scholar"}, this essential work serves as a valuable resource for Muslims seeking authentic Islamic knowledge.`;
      log("OK", `Description written (${catalog[i].description.length} chars)`);
    } catch (e: any) {
      log("WARN", `AI failed: ${e.message}`);
      catalog[i].description = `${r.title} is a premium Islamic publication available at Bab-ul-Fatah. Authored by ${r.authorName || "a renowned scholar"}, this essential work provides authentic and reliable knowledge for Muslims seeking to deepen their understanding of the deen.`;
    }
    if (i < raw.length - 1) await sleep(AI_DELAY);
  }

  // ════════════════════════════════════════════════════════
  //  PHASE 3: DATABASE IMPORT
  // ════════════════════════════════════════════════════════
  console.log(`\nPhase 3: Importing ${catalog.length} products into database...\n`);

  const prisma = new PrismaClient();
  const catCache = new Map<string, string>();

  async function upsertChain(breadcrumbs: string[]): Promise<string> {
    let pid: string | null = null;
    for (const name of breadcrumbs) {
      const slug = slugify(name) || `cat-${Date.now()}`;
      const key: string = `${slug}|${pid || "root"}`;
      if (catCache.has(key)) { pid = catCache.get(key) as string; continue; }
      const display = name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const cat: any = await prisma.category.upsert({
        where: { slug_parentId: { slug, parentId: pid ?? null } } as any,
        update: { name: display },
        create: { name: display, slug, parentId: pid },
      });
      if (cat?.id) { catCache.set(key, cat.id); pid = cat.id; }
    }
    return pid!;
  }

  let created = 0, updated = 0, imgCount = 0;

  for (let i = 0; i < catalog.length; i++) {
    const p = catalog[i];
    const prog = `[${i + 1}/${catalog.length}]`;
    try {
      const catId = await upsertChain(p.breadcrumbs);
      let authId: string | null = null;
      if (p.authorName) {
        const ex = await prisma.author.findFirst({ where: { name: p.authorName } });
        if (ex) authId = ex.id;
        else { const c = await prisma.author.create({ data: { name: p.authorName } }); authId = c.id; }
      }
      const ex = await prisma.product.findUnique({ where: { slug: p.slug } });
      const prod = await prisma.product.upsert({
        where: { slug: p.slug },
        update: { title: p.title, description: p.description, price: p.price, stock: p.stock, language: p.language as any, categoryId: catId, authorId: authId, sku: p.sku || null },
        create: { title: p.title, slug: p.slug, description: p.description, price: p.price, stock: p.stock, language: p.language as any, categoryId: catId, authorId: authId, sku: p.sku || null },
      });
      if (ex) updated++; else created++;
      // Images
      if (p.images.length > 0) {
        await prisma.image.deleteMany({ where: { productId: prod.id } });
        for (const imgUrl of p.images) {
          await prisma.image.create({ data: { url: imgUrl, altText: p.title, productId: prod.id } });
          imgCount++;
        }
      }
      log("OK", `${prog} ${ex ? "Updated" : "Created"}: ${p.title.slice(0, 50)} (${p.images.length} imgs)`);
    } catch (e: any) {
      log("ERR", `${prog} FAILED "${p.title.slice(0, 40)}": ${e.message}`);
    }
  }

  await prisma.$disconnect();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  IMPORT COMPLETE`);
  console.log(`${"═".repeat(60)}`);
  console.log(`  Products created  : ${created}`);
  console.log(`  Products updated  : ${updated}`);
  console.log(`  Images imported  : ${imgCount}`);
  console.log(`  Total products  : ${created + updated}`);
  console.log(`  Elapsed         : ${elapsed}s`);
  console.log(`${"═".repeat(60)}\n`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
