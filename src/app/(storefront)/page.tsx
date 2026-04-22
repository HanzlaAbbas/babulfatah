import { db } from '@/lib/db';
import { HeroSlider } from '@/components/storefront/hero-slider';
import { BenefitsBar } from '@/components/storefront/benefits-bar';
import { CategoryProductRow } from '@/components/storefront/category-product-row';
import { TrustBanner } from '@/components/storefront/trust-banner';


// ─── Category definitions for homepage product rows ──────────────────────────

const HOMEPAGE_CATEGORIES = [
  {
    name: 'Children',
    slug: 'children',
    title: "Children's Islamic Library",
    subtitle: 'Goodword & IIPH — Fun and educational Islamic books for kids',
  },
  {
    name: 'Quran',
    slug: 'quran',
    title: 'Quran Collection',
    subtitle: 'Translations, Tafseer, and Tajweed guides',
  },
  {
    name: "Prophet's Seerah",
    slug: 'prophets-seerah',
    title: "Prophet's Biography",
    subtitle: 'Seerah books from authentic sources',
  },
  {
    name: 'Hadith',
    slug: 'hadith',
    title: 'Hadith Collections',
    subtitle: 'Sahih Bukhari, Muslim, Tirmidhi and more',
  },
  {
    name: 'Goodword Books',
    slug: 'goodword-books',
    title: 'Goodword Books Collection',
    subtitle: 'Premium Islamic books for all ages by Goodword',
  },
  {
    name: 'Fiqh',
    slug: 'fiqh',
    title: 'Islamic Jurisprudence',
    subtitle: 'Hanafi, Shafi, Maliki & Hanbali schools of thought',
  },
] as const;

// ─── Homepage Server Component ──────────────────────────────────────────────

export default async function HomePage() {
  // ── Parallel data fetching for all 5 categories + total count ──

  const categoryDataPromises = HOMEPAGE_CATEGORIES.map(async (cat) => {
    // Find the category — try slug first (more reliable), then name fallback
    let category = await db.category.findFirst({
      where: { slug: cat.slug },
    });

    if (!category) {
      category = await db.category.findFirst({
        where: { name: cat.name },
      });
    }

    if (!category) return { ...cat, slug: cat.slug, products: [] };

    // Get subcategories
    const subcategories = await db.category.findMany({
      where: { parentId: category.id },
      select: { id: true },
    });
    const allCategoryIds = [category.id, ...subcategories.map((s) => s.id)];

    // Fetch up to 8 products
    const products = await db.product.findMany({
      where: { categoryId: { in: allCategoryIds } },
      take: 8,
      orderBy: [
        { stock: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        author: true,
        category: true,
      },
    });

    return {
      ...cat,
      slug: category.slug,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        language: p.language,
        images: p.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
        })),
        category: { id: p.category.id, name: p.category.name },
        author: p.author ? { id: p.author.id, name: p.author.name } : null,
      })),
    };
  });

  // Total product count
  const totalProductsPromise = db.product.count();

  const [categoryData, totalProducts] = await Promise.all([
    Promise.all(categoryDataPromises),
    totalProductsPromise,
  ]);

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
          3. Category Product Rows — horizontal scrollable (6 rows)
         ═══════════════════════════════════════════════════════════ */}
      {categoryData.map(
        (cat) =>
          cat.products.length > 0 && (
            <CategoryProductRow
              key={cat.name}
              title={cat.title}
              subtitle={cat.subtitle}
              categorySlug={cat.slug}
              products={cat.products}
            />
          )
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
