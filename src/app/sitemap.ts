import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// ── Dynamic Sitemap ──────────────────────────────────────────
// Generates a comprehensive XML sitemap with ALL public-facing
// URLs: static pages, categories, products, prog-SEO pages
// (buy, combo, authors, delivery), RSS, and JSON-LD feeds.
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.babulfatah.com';

// Delivery cities (mirrored from delivery/[slug]/page.tsx)
const CITIES = [
  'lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad',
  'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala',
  'hyderabad', 'bahawalpur', 'sargodha', 'sukkur', 'abbottabad',
  'mardan', 'mingora', 'dera-ismail-khan', 'dera-ghazi-khan', 'jang',
];

// Languages for category×language combos (mirrored from c/[combo]/page.tsx)
const LANG_KEYS = ['urdu', 'english', 'arabic'];

// Helper: slugify author names (mirrored from authors/[slug]/page.tsx)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all slugs in parallel
  const [products, categories, authors] = await Promise.all([
    db.product.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.category.findMany({
      select: { slug: true, parentId: true },
      orderBy: { name: 'asc' },
    }),
    db.author.findMany({
      where: { products: { some: {} } },
      select: { name: true },
    }),
  ]);

  const now = new Date();

  // ── 1. Static Pages ────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // ── 2. Category Pages ──────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/shop?category=${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ── 3. Product Pages (/shop/[slug]) ────────────────────────
  const recentThreshold = Math.max(1, Math.floor(products.length * 0.2));
  const productPages: MetadataRoute.Sitemap = products.map((product, index) => ({
    url: `${BASE_URL}/shop/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: index < recentThreshold ? 0.9 : 0.8,
  }));

  // ── 4. Buy Pages (/buy/[slug]) — Prog SEO ──────────────────
  const buyPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/buy/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ── 5. Category×Language Combo Pages (/c/[combo]) ──────────
  const topCategories = categories.filter((c) => c.parentId === null);
  const comboPages: MetadataRoute.Sitemap = topCategories.flatMap((cat) =>
    LANG_KEYS.map((lang) => ({
      url: `${BASE_URL}/c/${cat.slug}-${lang}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  );

  // ── 6. Author Pages (/authors/[slug]) ──────────────────────
  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${BASE_URL}/authors/${slugify(author.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // ── 7. City Delivery Pages (/delivery/[slug]) ──────────────
  const deliveryPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE_URL}/delivery/${city}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...buyPages,
    ...comboPages,
    ...authorPages,
    ...deliveryPages,
  ];
}
