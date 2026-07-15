import React from 'react';
import { db } from '@/lib/db';
import { HeroCinematic } from '@/components/storefront/hero-cinematic';
import { TrustMarquee } from '@/components/storefront/trust-marquee';
import { BenefitsBar } from '@/components/storefront/benefits-bar';
import { CategoryShowcase } from '@/components/storefront/category-showcase';
import { BestsellerShowcase } from '@/components/storefront/bestseller-showcase';
import { DealsStrip } from '@/components/storefront/deals-strip';
import { CategoryProductRow } from '@/components/storefront/category-product-row';
import { TestimonialsSection } from '@/components/storefront/testimonials-section';
import { CtaBanner } from '@/components/storefront/cta-banner';
import { TrustBanner } from '@/components/storefront/trust-banner';
import { MobileStickyBar } from '@/components/storefront/mobile-sticky-bar';

// Force dynamic rendering — always fetch fresh data from DB (never cache stale homepage)
export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryNode[];
}

interface HomepageCategory {
  title: string;
  subtitle: string;
  categorySlug: string;
  products: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    language: string;
    images: { id: string; url: string; altText?: string | null }[];
    category: { id: string; name: string };
    author: { id: string; name: string } | null;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectAllIds(node: CategoryNode): string[] {
  const ids = [node.id];
  for (const child of node.children) {
    ids.push(...collectAllIds(child));
  }
  return ids;
}

function countSubtreeProducts(node: CategoryNode, productCountMap: Map<string, number>): number {
  let count = productCountMap.get(node.id) || 0;
  for (const child of node.children) {
    count += countSubtreeProducts(child, productCountMap);
  }
  return count;
}

function buildTree(categories: { id: string; name: string; slug: string; parentId: string | null }[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of categories) {
    nodeMap.set(cat.id, { id: cat.id, name: cat.name, slug: cat.slug, parentId: cat.parentId, children: [] });
  }

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  }

  return roots;
}

// ─── Homepage Server Component ────────────────────────────────────────────────

export default async function HomePage() {
  let categories: HomepageCategory[] = [];
  let bestsellers: HomepageCategory['products'] = [];
  let totalProducts = 0;
  let fetchError = false;
  let errorMessage = '';

  try {
    // STEP 1: Fetch all categories + product counts + total — each query individually resilient
    const allCategories = await db.category
      .findMany({
        select: { id: true, name: true, slug: true, parentId: true },
        orderBy: { name: 'asc' },
      })
      .catch((e) => {
        console.error('[Homepage] category.findMany failed:', e.message);
        return [] as { id: string; name: string; slug: string; parentId: string | null }[];
      });

    const productCountByCategory = await db.product
      .groupBy({
        by: ['categoryId'],
        _count: { id: true },
      })
      .catch((e) => {
        console.error('[Homepage] product.groupBy failed:', e.message);
        return [] as { categoryId: string; _count: { id: number } }[];
      });

    const total = await db.product
      .count()
      .catch((e) => {
        console.error('[Homepage] product.count failed:', e.message);
        return 0;
      });

    totalProducts = total;

    if (allCategories.length === 0) {
      fetchError = true;
      errorMessage = 'No categories found in database. Check DATABASE_URL in .env';
      console.error('[Homepage]', errorMessage);
    }

    // Build product count map
    const productCountMap = new Map<string, number>();
    for (const row of productCountByCategory) {
      productCountMap.set(row.categoryId, row._count.id);
    }

    // STEP 2: Build category tree in-memory
    const rootCategories = buildTree(allCategories);

    // STEP 3: Rank root categories by total subtree product count
    const rootWithCounts = rootCategories
      .map((root) => ({
        root,
        totalProducts: countSubtreeProducts(root, productCountMap),
      }))
      .filter((r) => r.totalProducts > 0)
      .sort((a, b) => b.totalProducts - a.totalProducts);

    // STEP 4: Fetch bestsellers (highest stock = bestsellers heuristic) in parallel
    const bestsellerPromise = db.product.findMany({
      where: { stock: { gt: 0 } },
      take: 12,
      orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        author: true,
        category: true,
      },
    }).catch((e) => {
      console.error('[Homepage] bestsellers fetch failed:', e.message);
      return [];
    });

    const topCategories = rootWithCounts.slice(0, 5);

    if (topCategories.length > 0) {
      // STEP 5: Fetch up to 8 products per top category (parallel, each individually resilient)
      const categoryProducts = await Promise.all(
        topCategories.map(async ({ root, totalProducts: count }) => {
          try {
            const allIds = collectAllIds(root);
            const products = await db.product.findMany({
              where: { categoryId: { in: allIds } },
              take: 8,
              orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
              include: {
                images: { take: 1, orderBy: { order: 'asc' } },
                author: true,
                category: true,
              },
            });
            return {
              title: root.name,
              subtitle: `${count} books available`,
              categorySlug: root.slug,
              products: products.map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                price: p.price,
                stock: p.stock,
                language: p.language as string,
                images: p.images.map((img) => ({
                  id: img.id,
                  url: img.url,
                  altText: img.altText,
                })),
                category: { id: p.category.id, name: p.category.name },
                author: p.author ? { id: p.author.id, name: p.author.name } : null,
              })),
            } satisfies HomepageCategory;
          } catch (e) {
            console.error(`[Homepage] Failed to fetch products for ${root.name}:`, e instanceof Error ? e.message : e);
            return {
              title: root.name,
              subtitle: '',
              categorySlug: root.slug,
              products: [],
            } satisfies HomepageCategory;
          }
        })
      );

      categories = categoryProducts;
    }

    // Await bestsellers
    const bestsellerData = await bestsellerPromise;
    bestsellers = bestsellerData.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      language: p.language as string,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
      })),
      category: { id: p.category.id, name: p.category.name },
      author: p.author ? { id: p.author.id, name: p.author.name } : null,
    }));
  } catch (error) {
    console.error('[Homepage] Unexpected error:', error instanceof Error ? error.message : error);
    fetchError = true;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  // ── JSON-LD Structured Data ──

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Bab-ul-Fatah?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Bab-ul-Fatah is Pakistan's largest online Islamic bookstore offering authentic books on Quran, Hadith, Tafseer, Seerah, Fiqh, and more in Urdu, Arabic, and English.",
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer Cash on Delivery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer Cash on Delivery (COD) across all major cities in Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, and Multan.',
        },
      },
      {
        '@type': 'Question',
        name: 'What categories of Islamic books do you have?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "We have a wide range including Quran with translations, Hadith collections (Sahih Bukhari, Muslim, etc.), Tafseer, Seerah, Fiqh, Aqeedah, Children's Islamic books, Prayer guides, Hajj & Umrah, and Islamic products.",
        },
      },
      {
        '@type': 'Question',
        name: 'Do you ship internationally?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we ship worldwide! International orders can be placed via WhatsApp at +92 326 5903300. Shipping charges vary by destination.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I track my order?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can track your order by contacting us via WhatsApp at +92 326 5903300. Our team will provide you with real-time updates on your order status.',
        },
      },
    ],
  };

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Bab-ul-Fatah',
    description:
      "Pakistan's Largest Online Islamic Store — Authentic Islamic books, literature, and resources.",
    url: 'https://www.babulfatah.com',
    telephone: '+923265903300',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nokhar',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    priceRange: 'Rs.',
  };

  return (
    <>
      {/* ── JSON-LD Injection ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* ═══════════════════════════════════════════════════════════
          1. HERO CINEMATIC — Optimized for LCP with Suspense
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={<div className="h-[100svh] w-full bg-[#1D333B] animate-pulse" />}>
        <HeroCinematic />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          2. TRUST MARQUEE — Seamless Framer Motion Infinite Scroll
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={<div className="h-[60px] w-full bg-[#15262C]" />}>
        <TrustMarquee />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          3. CATEGORY SHOWCASE — Bento Grid
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={<div className="h-[500px] w-full bg-[#0B1518] animate-pulse" />}>
        <CategoryShowcase />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          4. BESTSELLERS SHOWCASE — Embla Carousel
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={<div className="h-[500px] w-full bg-[#FAFAFA] animate-pulse" />}>
        {bestsellers.length > 0 && <BestsellerShowcase products={bestsellers} />}
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          5. BENEFITS BAR
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={<div className="h-[100px] w-full bg-white" />}>
        <BenefitsBar />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          6. DEALS STRIP 
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={null}>
        {bestsellers.length > 0 && <DealsStrip products={bestsellers.slice(0, 10)} />}
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          7. CATEGORY PRODUCT ROWS
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={<div className="h-[400px] w-full bg-white" />}>
        {categories.length > 0 ? (
          <div>
            {categories.map(
              (cat) =>
                cat.products.length > 0 && (
                  <CategoryProductRow
                    key={cat.categorySlug}
                    title={cat.title}
                    subtitle={cat.subtitle}
                    categorySlug={cat.categorySlug}
                    products={cat.products}
                  />
                )
            )}
          </div>
        ) : (
          <section className="py-32 text-center bg-[#FAFAFA]">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-serif font-bold text-[#1D333B] mb-4">
                Welcome to BabulFatah
              </h2>
              <div className="border-b-2 border-[#D4AF37] w-24 mx-auto mb-6" />
              <p className="text-neutral-500 max-w-md mx-auto text-lg">
                {fetchError
                  ? 'Unable to connect to the store database. Please try again in a moment.'
                  : totalProducts > 0
                    ? `Loading ${totalProducts.toLocaleString()} products — please refresh the page.`
                    : 'Our collection is being prepared. Please check back shortly!'}
              </p>
              {errorMessage && process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-red-400 mt-6 font-mono break-all max-w-lg mx-auto bg-red-50 p-4 rounded-lg">
                  Debug: {errorMessage}
                </p>
              )}
            </div>
          </section>
        )}
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          8. TESTIMONIALS
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={null}>
        <TestimonialsSection />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          9. CTA BANNER
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={null}>
        <CtaBanner />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          10. TRUST BANNER
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={null}>
        <TrustBanner />
      </React.Suspense>

      {/* ═══════════════════════════════════════════════════════════
          11. MOBILE STICKY BAR
         ═══════════════════════════════════════════════════════════ */}
      <React.Suspense fallback={null}>
        <MobileStickyBar />
      </React.Suspense>
    </>
  );
}