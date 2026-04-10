import { db } from '@/lib/db';
import { HeroSlider } from '@/components/storefront/hero-slider';
import { BenefitsBar } from '@/components/storefront/benefits-bar';
import { FeaturedProductsTabs } from '@/components/storefront/featured-products-tabs';
import { CategoryShowcase } from '@/components/storefront/category-showcase';
import { FeaturedCollection } from '@/components/storefront/featured-collection';
import { TrustSection } from '@/components/storefront/trust-section';
import { CtaBanner } from '@/components/storefront/cta-banner';
import type { TabCategory } from '@/components/storefront/featured-products-tabs';

// ─── Tab category names for Featured Products ─────────────────────────────────

const tabCategoryNames = [
  'Education',
  'Biography',
  'Family',
  'Hadith',
  'Quran',
  'Fiqh',
  'Pillars Of Islam',
  'Women',
];

// ─── Homepage Server Component ──────────────────────────────────────────────

export default async function HomePage() {
  // ── Parallel data fetching ──

  // 1. Fetch tabbed products (for FeaturedProductsTabs)
  const tabDataPromises = tabCategoryNames.map(async (catName) => {
    // Find the category (direct child of a root category)
    const category = await db.category.findFirst({
      where: { name: catName },
    });

    if (!category) return { name: catName, products: [] };

    // Get products from this category AND its subcategories
    const subcategories = await db.category.findMany({
      where: { parentId: category.id },
      select: { id: true },
    });
    const allCategoryIds = [category.id, ...subcategories.map((s) => s.id)];

    const products = await db.product.findMany({
      where: { categoryId: { in: allCategoryIds } },
      take: 12,
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

    return { name: catName, products };
  });

  // 2. Fetch showcase categories (Books subcategories + Islamic Products)
  const showcaseCategoriesPromise = db.category.findMany({
    where: { parentId: { not: null } },
    include: {
      _count: { select: { products: true, subcategories: true } },
      parent: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });

  // 3. Fetch Seerah collection products
  const seerahCategoryPromise = db.category.findFirst({
    where: { name: 'Prophets Seerah' },
    include: { parent: true },
  });

  const [tabData, allSubcategories, seerahCategory] = await Promise.all([
    Promise.all(tabDataPromises),
    showcaseCategoriesPromise,
    seerahCategoryPromise,
  ]);

  // ── Process tab data ──
  const tabCategories: TabCategory[] = tabData.map((td) => ({
    name: td.name,
    products: td.products.map((p) => ({
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
  }));

  // Filter out empty tabs
  const filteredTabCategories = tabCategories.filter(
    (cat) => cat.products.length > 0
  );

  // ── Process showcase categories ──
  // Include direct product count + subcategory product counts
  const showcaseCategories = allSubcategories
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      productCount: cat._count.products,
    }))
    .sort((a, b) => b.productCount - a.productCount);

  // ── Fetch Seerah products ──
  let seerahProducts: any[] = [];
  let seerahCategorySlug = 'prophets-seerah';

  if (seerahCategory) {
    seerahCategorySlug = seerahCategory.slug;
    const subcats = await db.category.findMany({
      where: { parentId: seerahCategory.id },
      select: { id: true },
    });
    const seerahIds = [seerahCategory.id, ...subcats.map((s) => s.id)];

    seerahProducts = await db.product.findMany({
      where: { categoryId: { in: seerahIds } },
      take: 10,
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
          3. Featured Products with Category Tabs (carousel)
         ═══════════════════════════════════════════════════════════ */}
      {filteredTabCategories.length > 0 && (
        <FeaturedProductsTabs categories={filteredTabCategories} />
      )}

      {/* ═══════════════════════════════════════════════════════════
          4. Shop by Categories (horizontal carousel)
         ═══════════════════════════════════════════════════════════ */}
      <CategoryShowcase categories={showcaseCategories} />

      {/* ═══════════════════════════════════════════════════════════
          5. Featured Collection: Prophet's Seerah
         ═══════════════════════════════════════════════════════════ */}
      {seerahProducts.length > 0 && (
        <FeaturedCollection
          title="Prophet's Seerah"
          description="Discover the life and teachings of the Prophet Muhammad ﷺ through our carefully curated collection."
          categorySlug={seerahCategorySlug}
          products={seerahProducts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            language: p.language,
            images: p.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
            })),
            category: { id: p.category.id, name: p.category.name },
            author: p.author
              ? { id: p.author.id, name: p.author.name }
              : null,
          }))}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          6. Trust / Why Choose Us Section
         ═══════════════════════════════════════════════════════════ */}
      <TrustSection />

      {/* ═══════════════════════════════════════════════════════════
          7. CTA Banner
         ═══════════════════════════════════════════════════════════ */}
      <CtaBanner />
    </>
  );
}
