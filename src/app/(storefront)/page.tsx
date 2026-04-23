import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { HeroSlider } from '@/components/storefront/hero-slider';
import { BenefitsBar } from '@/components/storefront/benefits-bar';
import { CategoryProductRow } from '@/components/storefront/category-product-row';
import { TrustBanner } from '@/components/storefront/trust-banner';
import { MobileStickyBar } from '@/components/storefront/mobile-sticky-bar';

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

/**
 * Collect ALL descendant category IDs from a tree node (in-memory).
 * Walks children recursively — works regardless of tree depth (2, 3, or more levels).
 */
function collectAllIds(node: CategoryNode): string[] {
  const ids = [node.id];
  for (const child of node.children) {
    ids.push(...collectAllIds(child));
  }
  return ids;
}

/**
 * Count ALL products in a category subtree (in-memory).
 * Sums direct products + all descendants' products.
 */
function countSubtreeProducts(node: CategoryNode, productCountMap: Map<string, number>): number {
  let count = productCountMap.get(node.id) || 0;
  for (const child of node.children) {
    count += countSubtreeProducts(child, productCountMap);
  }
  return count;
}

/**
 * Build a tree from a flat list of categories (parentId-based).
 * Returns only root nodes (parentId === null).
 */
function buildTree(categories: { id: string; name: string; slug: string; parentId: string | null }[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create all nodes first
  for (const cat of categories) {
    nodeMap.set(cat.id, { id: cat.id, name: cat.name, slug: cat.slug, parentId: cat.parentId, children: [] });
  }

  // Attach children to parents
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
// Data strategy (ZERO raw SQL — pure Prisma, maximum compatibility):
//   1. Fetch ALL categories flat (single query) → build tree in-memory
//   2. Count products per category (single Prisma groupBy query)
//   3. Rank root categories by total subtree product count
//   4. Take top 6 → for each, collect ALL descendant IDs → fetch 8 products
//   5. Fallback: if anything fails, show a friendly message (never white page)

export default async function HomePage() {
  let categories: HomepageCategory[] = [];
  let totalProducts = 0;
  let fetchError = false;

  try {
    // ════════════════════════════════════════════════════════════════════
    //  STEP 1: Fetch all categories (flat) + product count per category
    // ════════════════════════════════════════════════════════════════════

    const [allCategories, productCountByCategory, total] = await Promise.all([
      // All categories — flat list
      db.category.findMany({
        select: { id: true, name: true, slug: true, parentId: true },
        orderBy: { name: 'asc' },
      }),
      // Product count per category (direct children only — we'll sum in-memory)
      db.product.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
      // Total products
      db.product.count(),
    ]);

    totalProducts = total;

    // Build a map: categoryId → product count
    const productCountMap = new Map<string, number>();
    for (const row of productCountByCategory) {
      productCountMap.set(row.categoryId, row._count.id);
    }

    // ════════════════════════════════════════════════════════════════════
    //  STEP 2: Build category tree in-memory
    // ════════════════════════════════════════════════════════════════════

    const rootCategories = buildTree(allCategories);

    // ════════════════════════════════════════════════════════════════════
    //  STEP 3: Rank root categories by total subtree product count
    // ════════════════════════════════════════════════════════════════════

    const rootWithCounts = rootCategories
      .map((root) => ({
        root,
        totalProducts: countSubtreeProducts(root, productCountMap),
      }))
      .filter((r) => r.totalProducts > 0)
      .sort((a, b) => b.totalProducts - a.totalProducts)
      .slice(0, 6);

    if (rootWithCounts.length > 0) {
      // ════════════════════════════════════════════════════════════════════
      //  STEP 4: Fetch up to 8 products per top category (parallel)
      // ════════════════════════════════════════════════════════════════════

      categories = await Promise.all(
        rootWithCounts.map(async ({ root, totalProducts: count }) => {
          try {
            // Collect ALL descendant IDs from tree (handles 2, 3, N levels deep)
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
          } catch {
            return {
              title: root.name,
              subtitle: '',
              categorySlug: root.slug,
              products: [],
            } satisfies HomepageCategory;
          }
        })
      );
    }
  } catch (error) {
    console.error('[Homepage] Data fetch error:', error);
    fetchError = true;
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
          1. Hero Slider
         ═══════════════════════════════════════════════════════════ */}
      <HeroSlider />

      {/* ═══════════════════════════════════════════════════════════
          2. Benefits / Features Bar
         ═══════════════════════════════════════════════════════════ */}
      <BenefitsBar />

      {/* ═══════════════════════════════════════════════════════════
          3. Category Product Rows — horizontal scrollable
          Dynamically populated from top 6 categories by product count.
          Uses in-memory tree traversal (zero raw SQL) for maximum
          database compatibility.
         ═══════════════════════════════════════════════════════════ */}
      {categories.length > 0 ? (
        categories.map(
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
        )
      ) : (
        /* Fallback: database unreachable or unexpected error */
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold text-[#1D333B] mb-3">
              Welcome to Bab-ul-Fatah
            </h2>
            <div className="border-b-2 border-[#D4AF37] w-24 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-md mx-auto">
              {fetchError
                ? 'Unable to connect to the store database. Please try again in a moment.'
                : totalProducts > 0
                  ? `Loading ${totalProducts.toLocaleString()} products — please refresh the page.`
                  : 'Our collection is being prepared. Please check back shortly!'}
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          4. Custom Features Wrapper — for user-injected components
         ═══════════════════════════════════════════════════════════ */}
      <section
        id="custom-features-wrapper"
        className="py-12 w-full overflow-hidden"
        aria-label="Custom features section"
      >
        {/* Empty — user will inject custom components here */}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. Trust Banner — 4-column feature strip
         ═══════════════════════════════════════════════════════════ */}
      <TrustBanner />

      {/* ═══════════════════════════════════════════════════════════
          6. Mobile Sticky Bar — cart quick access (client component)
         ═══════════════════════════════════════════════════════════ */}
      <MobileStickyBar />
    </>
  );
}
