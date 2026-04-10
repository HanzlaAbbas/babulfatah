import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, ArrowRight, Globe, LayoutGrid } from 'lucide-react';
import type { Metadata } from 'next';

// ═══════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const BASE_URL = 'https://www.babulfatah.com';
const MAX_PRODUCTS = 24;

const LANG_MAP: Record<
  string,
  { value: 'URDU' | 'ARABIC' | 'ENGLISH'; name: string; nativeName: string }
> = {
  urdu: { value: 'URDU', name: 'Urdu', nativeName: 'اردو' },
  english: { value: 'ENGLISH', name: 'English', nativeName: 'English' },
  arabic: { value: 'ARABIC', name: 'Arabic', nativeName: 'العربية' },
};

const LANG_KEYS = Object.keys(LANG_MAP);

// ═══════════════════════════════════════════════════════════════════
//  COMBO PARSING
// ═══════════════════════════════════════════════════════════════════

function parseCombo(
  combo: string
): { categorySlug: string; language: string } | null {
  const lastHyphen = combo.lastIndexOf('-');
  if (lastHyphen === -1) return null;
  const categorySlug = combo.substring(0, lastHyphen);
  const language = combo.substring(lastHyphen + 1);
  if (!LANG_MAP[language]) return null;
  return { categorySlug, language };
}

// ═══════════════════════════════════════════════════════════════════
//  STATIC PARAMS — Generate all category×language combos
// ═══════════════════════════════════════════════════════════════════

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    select: { slug: true, parentId: true },
  });
  // Only generate combos for top-level categories (children have parentId set)
  const topCategories = categories.filter((c) => c.parentId === null);
  const combos: { combo: string }[] = [];

  for (const cat of topCategories) {
    for (const lang of LANG_KEYS) {
      combos.push({ combo: `${cat.slug}-${lang}` });
    }
  }
  return combos;
}

// ═══════════════════════════════════════════════════════════════════
//  DYNAMIC METADATA
// ═══════════════════════════════════════════════════════════════════

interface ComboPageProps {
  params: Promise<{ combo: string }>;
}

export async function generateMetadata({
  params,
}: ComboPageProps): Promise<Metadata> {
  const { combo } = await params;
  const parsed = parseCombo(combo);

  if (!parsed) return { title: 'Page Not Found' };

  const category = await db.category.findFirst({
    where: { slug: parsed.categorySlug, parentId: null },
    select: { id: true, name: true, slug: true },
  });

  if (!category) return { title: 'Page Not Found' };

  const langInfo = LANG_MAP[parsed.language];
  const catName = category.name;
  const langName = langInfo.name;
  const pageUrl = `${BASE_URL}/c/${combo}`;

  // Count products for this combo (including subcategories)
  const allCategories = await db.category.findMany({
    select: { id: true, parentId: true },
  });
  const catIds = getDescendantIds(allCategories, category.id);

  const productCount = await db.product.count({
    where: {
      categoryId: { in: catIds },
      language: langInfo.value,
    },
  });

  const title = `${catName} Books in ${langName} — Buy Online | Bab-ul-Fatah`;
  const description = `Browse ${productCount} ${catName.toLowerCase()} books in ${langName}. Cash on Delivery across Pakistan. Free shipping on orders above Rs. 5,000.`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${catName} Books in ${langName} — Buy Online | Bab-ul-Fatah`,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'Bab-ul-Fatah',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${catName} Books in ${langName} — Bab-ul-Fatah`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${catName} Books in ${langName} | Bab-ul-Fatah`,
      description,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

function getDescendantIds(
  categories: { id: string; parentId: string | null }[],
  parentId: string
): string[] {
  const ids = [parentId];
  const children = categories.filter((c) => c.parentId === parentId);
  for (const child of children) {
    ids.push(...getDescendantIds(categories, child.id));
  }
  return ids;
}

// ═══════════════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default async function ComboPage({ params }: ComboPageProps) {
  const { combo } = await params;
  const parsed = parseCombo(combo);

  if (!parsed) notFound();

  const { categorySlug, language } = parsed;
  const langInfo = LANG_MAP[language];

  // ── Fetch category (top-level only) ──
  const category = await db.category.findFirst({
    where: { slug: categorySlug, parentId: null },
    select: { id: true, name: true, slug: true },
  });

  if (!category) notFound();

  // ── Fetch all categories for hierarchy + other categories section ──
  const allCategories = await db.category.findMany({
    select: { id: true, slug: true, name: true, parentId: true },
    orderBy: { name: 'asc' },
  });
  const topCategories = allCategories.filter((c) => c.parentId === null);
  const catIds = getDescendantIds(allCategories, category.id);

  // ── Fetch products for this combo ──
  const products = await db.product.findMany({
    where: {
      categoryId: { in: catIds },
      language: langInfo.value,
    },
    include: {
      author: true,
      images: { take: 1, orderBy: { order: 'asc' } },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: MAX_PRODUCTS,
  });

  const productCount = products.length;

  // ── Determine which other languages have products for this category ──
  const otherLanguages = LANG_KEYS.filter((key) => key !== language);

  const langProductCounts = await Promise.all(
    otherLanguages.map(async (key) => {
      const count = await db.product.count({
        where: {
          categoryId: { in: catIds },
          language: LANG_MAP[key].value,
        },
      });
      return { key, count };
    })
  );
  const availableOtherLangs = langProductCounts.filter((l) => l.count > 0);

  // ── Determine which other categories have products in this language ──
  const otherCats = topCategories.filter((c) => c.slug !== category.slug);

  const catProductCounts = await Promise.all(
    otherCats.map(async (cat) => {
      const otherCatIds = getDescendantIds(allCategories, cat.id);
      const count = await db.product.count({
        where: {
          categoryId: { in: otherCatIds },
          language: langInfo.value,
        },
      });
      return { cat, count };
    })
  );
  const availableOtherCats = catProductCounts.filter((c) => c.count > 0);

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: BreadcrumbList
  // ═══════════════════════════════════════════════════════════════════
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `${BASE_URL}/shop?category=${category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${langInfo.name} Books`,
        item: `${BASE_URL}/c/${combo}`,
      },
    ],
  };

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: ItemList
  // ═══════════════════════════════════════════════════════════════════
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Books in ${langInfo.name}`,
    description: `Browse ${productCount} ${category.name.toLowerCase()} books in ${langInfo.name} at Bab-ul-Fatah.`,
    numberOfItems: productCount,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.title,
      url: `${BASE_URL}/shop/${product.slug}`,
      image: product.images[0]?.url || undefined,
      ...(product.author && {
        author: { '@type': 'Person', name: product.author.name },
      }),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PKR',
        price: product.price.toFixed(2),
        availability:
          product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Bab-ul-Fatah',
          url: BASE_URL,
        },
      },
    })),
  };

  return (
    <>
      {/* ── JSON-LD: BreadcrumbList ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── JSON-LD: ItemList ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* ── Visual Breadcrumb ── */}
      <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
        <div className="main-container flex items-center gap-2 text-[13px] text-gray-500 h-[42px]">
          <Link href="/" className="hover:text-[#1D333B] transition-colors">
            Home
          </Link>
          <span className="text-gray-300" aria-hidden="true">
            /
          </span>
          <Link
            href={`/shop?category=${category.slug}`}
            className="hover:text-[#1D333B] transition-colors"
          >
            {category.name}
          </Link>
          <span className="text-gray-300" aria-hidden="true">
            /
          </span>
          <span
            className="text-[#1D333B] font-medium truncate max-w-[200px]"
            aria-current="page"
          >
            {langInfo.name} Books
          </span>
        </div>
      </nav>

      <div className="main-container py-8 md:py-12">
        {/* ── Page Header ─────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1D333B]">
                {category.name} Books in{' '}
                <span className="text-[#C9A84C]">{langInfo.name}</span>
                <span className="text-xl md:text-2xl font-normal text-gray-400 mr-2 ml-2">
                  {langInfo.nativeName}
                </span>
              </h1>
              <p className="text-muted-foreground mt-2 text-[15px]">
                {productCount}{' '}
                {productCount === 1 ? 'book' : 'books'} available
                {productCount >= MAX_PRODUCTS && ' (showing latest 24)'}
              </p>
            </div>
          </div>

          {/* ── Language Tabs ─────────────────────────────────── */}
          <div className="mt-6 flex items-center gap-1 border-b border-gray-200">
            {LANG_KEYS.map((key) => {
              const info = LANG_MAP[key];
              const isActive = key === language;
              const tabCombo = `${category.slug}-${key}`;
              return (
                <Link
                  key={key}
                  href={`/c/${tabCombo}`}
                  className={`relative px-4 py-2.5 text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#1D333B]'
                      : 'text-gray-500 hover:text-[#1D333B]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-2">
                    {info.name}
                    <span className="text-[12px] text-gray-400">
                      {info.nativeName}
                    </span>
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
                  )}
                </Link>
              );
            })}
          </div>
        </header>

        {/* ── Product Grid ───────────────────────────────────── */}
        {productCount === 0 ? (
          /* ── No Results ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-16 w-16 text-gray-200 mb-4" />
            <h2 className="text-lg font-semibold text-[#1D333B]">
              No {langInfo.name} books found in {category.name}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              We don&apos;t have any {category.name.toLowerCase()} books in{' '}
              {langInfo.name} at the moment. Try another language or browse
              our full collection.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#1D333B] text-white text-[13px] font-bold uppercase tracking-[1px] px-6 py-3 hover:bg-[#142229] transition-colors"
              >
                Browse All Books
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/shop?category=${category.slug}`}
                className="inline-flex items-center gap-2 border border-[#1D333B] text-[#1D333B] text-[13px] font-bold uppercase tracking-[1px] px-6 py-3 hover:bg-[#1D333B] hover:text-white transition-colors"
              >
                All {category.name}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section aria-label="Product list">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="group block"
                  >
                    {/* ── Product Image ── */}
                    <div
                      className="relative bg-[#f5f5f5] overflow-hidden"
                      style={{ aspectRatio: '3 / 3.8' }}
                    >
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={
                            product.images[0].altText || product.title
                          }
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <BookOpen className="h-14 w-14 text-gray-200" />
                          <span className="text-[10px] text-gray-300 uppercase tracking-wider">
                            No Image
                          </span>
                        </div>
                      )}

                      {/* ── Sold Out Badge ── */}
                      {product.stock <= 0 && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider z-10">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* ── Product Info ── */}
                    <div className="pt-3 pb-1">
                      <h3 className="text-[15px] font-normal text-[#1D333B] leading-snug line-clamp-2 group-hover:text-[#C9A84C] transition-colors min-h-[2.5rem]">
                        {product.title}
                      </h3>
                      {product.author && (
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                          {product.author.name}
                        </p>
                      )}
                      <p className="text-[16px] font-bold text-[#1D333B] mt-1.5">
                        Rs.{' '}
                        {product.price.toLocaleString('en-PK', {
                          minimumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {productCount >= MAX_PRODUCTS && (
                <div className="mt-8 text-center">
                  <Link
                    href={`/shop?category=${category.slug}&language=${langInfo.value}`}
                    className="inline-flex items-center gap-2 border border-[#1D333B] text-[#1D333B] text-[13px] font-bold uppercase tracking-[1px] px-6 py-3 hover:bg-[#1D333B] hover:text-white transition-colors"
                  >
                    View All {category.name} in {langInfo.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>

            {/* ── Other Languages Section ─────────────────────── */}
            {availableOtherLangs.length > 0 && (
              <section className="mt-12 p-6 bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-[#C9A84C]" />
                  <h2 className="text-[15px] font-semibold text-[#1D333B]">
                    Also available in
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableOtherLangs.map(({ key, count }) => {
                    const info = LANG_MAP[key];
                    return (
                      <Link
                        key={key}
                        href={`/c/${category.slug}-${key}`}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 text-[13px] text-[#1D333B] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                      >
                        <span>{info.name}</span>
                        <span className="text-[12px] text-gray-400">
                          {info.nativeName}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-normal ml-1"
                        >
                          {count}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Other Categories Section ────────────────────── */}
            {availableOtherCats.length > 0 && (
              <section className="mt-6 p-6 bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid className="h-5 w-5 text-[#C9A84C]" />
                  <h2 className="text-[15px] font-semibold text-[#1D333B]">
                    Browse{' '}
                    <span className="text-[#C9A84C]">{langInfo.name}</span> books
                    in
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableOtherCats.map(({ cat, count }) => (
                    <Link
                      key={cat.slug}
                      href={`/c/${cat.slug}-${language}`}
                      className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 text-[13px] text-[#1D333B] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                    >
                      <span>{cat.name}</span>
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-normal ml-1"
                      >
                        {count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── SEO Footer Text ────────────────────────────────── */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="max-w-2xl text-[13px] text-gray-500 leading-relaxed">
            <p>
              Discover authentic {category.name.toLowerCase()} books in{' '}
              {langInfo.name} at Bab-ul-Fatah — Pakistan&apos;s trusted online Islamic
              bookstore. All books are sourced from reputable publishers with
              quality printing and binding. Enjoy Cash on Delivery across all
              cities in Pakistan and free shipping on orders above Rs. 5,000.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
