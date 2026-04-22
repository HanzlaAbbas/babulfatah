import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { HeroSlider } from '@/components/storefront/hero-slider';
import { BenefitsBar } from '@/components/storefront/benefits-bar';
import { CategoryProductRow } from '@/components/storefront/category-product-row';
import { TrustBanner } from '@/components/storefront/trust-banner';

// ─── Types for raw SQL results ──────────────────────────────────────────────────

interface TopCategoryRow {
  root_id: string;
  root_name: string;
  root_slug: string;
  product_count: number;
}

interface CategoryIdsRow {
  root_id: string;
  category_ids: string[];
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

// ─── Homepage Server Component ──────────────────────────────────────────────────
// Data strategy:
//   1. Recursive CTE to find top 6 ROOT categories by total product count
//      (counts products across ALL subcategory levels, not just direct children)
//   2. Recursive CTE to get ALL descendant category IDs for each root
//   3. Parallel fetch of 8 products per category
// This is fully dynamic — no hardcoded slugs. Works regardless of what
// category names/slugs exist in the database.

export default async function HomePage() {
  let categories: HomepageCategory[] = [];
  let totalProducts = 0;

  try {
    // ══════════════════════════════════════════════════════════════════
    //  STEP 1: Find top 6 root categories by product count (recursive)
    // ══════════════════════════════════════════════════════════════════

    const topCategories = await db.$queryRaw<TopCategoryRow[]>`
      WITH RECURSIVE cat_tree AS (
        SELECT id, id as root_id
        FROM "Category"
        WHERE "parentId" IS NULL
        UNION ALL
        SELECT c.id, ct.root_id
        FROM "Category" c
        JOIN cat_tree ct ON c."parentId" = ct.id
      )
      SELECT
        ct.root_id,
        cr.name  as root_name,
        cr.slug  as root_slug,
        COUNT(p.id)::int as product_count
      FROM cat_tree ct
      JOIN "Product" p ON p."categoryId" = ct.id
      JOIN "Category" cr ON cr.id = ct.root_id
      GROUP BY ct.root_id, cr.name, cr.slug
      ORDER BY product_count DESC
      LIMIT 6
    `;

    if (topCategories.length > 0) {
      // ══════════════════════════════════════════════════════════════════
      //  STEP 2: Get ALL descendant category IDs for these 6 roots
      // ══════════════════════════════════════════════════════════════════

      const rootIds = topCategories.map((c) => c.root_id);

      const idsMap = await db.$queryRaw<CategoryIdsRow[]>`
        WITH RECURSIVE cat_tree AS (
          SELECT id, id as root_id
          FROM "Category"
          WHERE id = ANY(${rootIds}::uuid[])
          UNION ALL
          SELECT c.id, ct.root_id
          FROM "Category" c
          JOIN cat_tree ct ON c."parentId" = ct.id
        )
        SELECT root_id, ARRAY_AGG(DISTINCT id) as category_ids
        FROM cat_tree
        GROUP BY root_id
      `;

      const rootToIds = new Map(idsMap.map((r) => [r.root_id, r.category_ids]));

      // ══════════════════════════════════════════════════════════════════
      //  STEP 3: Fetch up to 8 products per category (parallel)
      // ══════════════════════════════════════════════════════════════════

      categories = await Promise.all(
        topCategories.map(async (cat) => {
          try {
            const allIds = rootToIds.get(cat.root_id) || [cat.root_id];
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
              title: cat.root_name,
              subtitle: `${cat.product_count} books available`,
              categorySlug: cat.root_slug,
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
                author: p.author
                  ? { id: p.author.id, name: p.author.name }
                  : null,
              })),
            } satisfies HomepageCategory;
          } catch {
            // If one category fails, skip it gracefully
            return {
              title: cat.root_name,
              subtitle: '',
              categorySlug: cat.root_slug,
              products: [],
            } satisfies HomepageCategory;
          }
        })
      );
    }

    // Total product count
    totalProducts = await db.product.count();
  } catch (error) {
    console.error('[Homepage] Data fetch error:', error);
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
        /* Fallback: database unreachable or no products yet */
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold text-[#1D333B] mb-3">
              Welcome to Bab-ul-Fatah
            </h2>
            <div className="border-b-2 border-[#D4AF37] w-24 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-md mx-auto">
              {totalProducts > 0
                ? `Loading ${totalProducts.toLocaleString()} products... Please refresh the page.`
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
    </>
  );
}
