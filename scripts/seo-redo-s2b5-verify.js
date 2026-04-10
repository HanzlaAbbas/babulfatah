const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const slugs = [
  "islam-ki-imtiyaazi-khoobiyaan",
  "islam-ki-sachayi-aur-science-k-aitrafaat",
  "islam-kia-hai",
  "islam-made-simple",
  "islam-main-borhon-ki-azmat",
  "islam-main-halal-o-haram",
  "islam-me-dolat-kay-masarif",
  "islam-mein-bunyaadi-haqooq",
  "islam-mein-ikhtilaf-ke-usool-o-adab",
  "islam-the-religion-of-peace",
  "islam-salvation-for-mankind",
  "islami-adaab-e-muashrat",
  "islami-aqeeda-8x12",
  "islami-fatoohat-ka-tabnaak-daur",
  "islami-qanoon-e-wirasat",
  "islami-taaleemi-series-1",
  "islami-taaleemi-series-2",
  "islami-taleem-o-tarbiat",
  "islamic-album-galleries-of-the-two-holy-mosques",
  "islamic-creed"
];

async function main() {
  let allPass = true;
  for (const slug of slugs) {
    const p = await prisma.product.findUnique({ where: { slug }, select: { slug: true, description: true, metaDescription: true } });
    if (!p) { console.log(`MISSING: ${slug}`); allPass = false; continue; }
    const wc = (p.description || '').split(/\s+/).length;
    const ml = (p.metaDescription || '').length;
    const wcOk = wc >= 250;
    const mlOk = ml >= 130 && ml <= 155;
    const promo = (p.description || '').match(/Bab-ul-Fatah|Order online|Rs\.|Priced at|Available at|competitive pricing|browse our/i);
    const status = (wcOk && mlOk && !promo) ? 'PASS' : 'FAIL';
    if (status === 'FAIL') allPass = false;
    console.log(`[${status}] ${slug} | desc: ${wc} words | meta: ${ml} chars${promo ? ' | PROMO!' : ''}`);
  }
  console.log(`\n${allPass ? 'ALL PASS' : 'SOME FAILURES'}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
