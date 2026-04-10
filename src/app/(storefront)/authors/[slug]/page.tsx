import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/storefront/product-card';
import { BookOpen, ChevronRight, Layers, User } from 'lucide-react';
import type { Metadata } from 'next';

// ── Constants ──────────────────────────────────────────────────
const BASE_URL = 'https://www.babulfatah.com';
const BRAND_DARK = '#1D333B';
const BRAND_GOLD = '#C9A84C';

// ── Helpers ────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function decodeSlug(slug: string): string {
  return slug.replace(/-/g, ' ');
}

// ── Types ──────────────────────────────────────────────────────
interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

// ═══════════════════════════════════════════════════════════════════
//  Dynamic Rendering — fetch data at request time
// ═══════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

// ═══════════════════════════════════════════════════════════════════
//  Dynamic Metadata — Per-author SEO
// ═══════════════════════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedName = decodeSlug(slug);

  // Fetch all authors and find by slugified name match
  const authors = await db.author.findMany({
    where: { products: { some: {} } },
    include: {
      products: {
        select: { categoryId: true },
      },
    },
  });

  const author = authors.find(
    (a) => slugify(a.name) === slug
  );

  if (!author) return { title: 'Author Not Found' };

  const bookCount = author.products.length;

  // Get unique categories this author writes in
  const categoryIds = [...new Set(author.products.map((p) => p.categoryId))];
  const categories = await db.category.findMany({
    where: { id: { in: categoryIds } },
    select: { name: true },
  });
  const categoryNames = categories.map((c) => c.name);
  const categoriesText =
    categoryNames.length > 0
      ? categoryNames.slice(0, 4).join(', ') +
        (categoryNames.length > 4 ? ' and more' : '')
      : 'Islamic literature';

  const authorUrl = `${BASE_URL}/authors/${slug}`;

  return {
    title: `${author.name} Books — Buy Online in Pakistan | Bab-ul-Fatah`,
    description: `Browse ${bookCount} books by ${author.name} at Bab-ul-Fatah. ${categoriesText}. Cash on Delivery across Pakistan.`,
    keywords: [
      author.name,
      `${author.name} books`,
      `${author.name} Islamic books`,
      `buy ${author.name} books`,
      `${author.name} books Pakistan`,
      ...categoryNames.map((c) => `${author.name} ${c}`),
    ],
    alternates: {
      canonical: authorUrl,
    },
    openGraph: {
      title: `${author.name} Books — Bab-ul-Fatah`,
      description: `Browse ${bookCount} books by ${author.name}. ${categoriesText}. Cash on Delivery across Pakistan.`,
      type: 'website',
      url: authorUrl,
      siteName: 'Bab-ul-Fatah',
    },
    twitter: {
      card: 'summary',
      title: `${author.name} Books — Bab-ul-Fatah`,
      description: `Browse ${bookCount} books by ${author.name}. Cash on Delivery across Pakistan.`,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Page Component
// ═══════════════════════════════════════════════════════════════════
export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;

  // Fetch all authors with products and find matching one by slugified name
  const authors = await db.author.findMany({
    where: { products: { some: {} } },
    include: {
      products: {
        include: {
          category: true,
          author: true,
          images: { orderBy: { order: 'asc' } },
          _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const author = authors.find((a) => slugify(a.name) === slug);

  if (!author) notFound();

  const products = author.products;
  const bookCount = products.length;

  // Build category data with counts
  const categoryMap = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const product of products) {
    const cat = product.category;
    if (!categoryMap.has(cat.id)) {
      categoryMap.set(cat.id, {
        name: cat.name,
        slug: cat.slug,
        count: 0,
      });
    }
    categoryMap.get(cat.id)!.count += 1;
  }
  const categoriesWithCounts = Array.from(categoryMap.values()).sort(
    (a, b) => b.count - a.count
  );

  const authorUrl = `${BASE_URL}/authors/${slug}`;

  // ── Language distribution ────────────────────────────────────
  const languageMap = new Map<string, number>();
  for (const p of products) {
    languageMap.set(p.language, (languageMap.get(p.language) || 0) + 1);
  }
  const languages = Array.from(languageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => `${lang} (${count})`)
    .join(', ');

  // ── Price range ──────────────────────────────────────────────
  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: Person Schema (Author)
  // ═══════════════════════════════════════════════════════════════════
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: authorUrl,
    jobTitle: 'Islamic Scholar & Author',
    description: `${author.name} is a renowned Islamic scholar and author. Browse ${bookCount} books by ${author.name} available at Bab-ul-Fatah, Pakistan's trusted online Islamic bookstore.`,
    worksFor: {
      '@type': 'Organization',
      name: 'Bab-ul-Fatah',
      url: BASE_URL,
    },
  };

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: ItemList Schema (Books)
  // ═══════════════════════════════════════════════════════════════════
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Books by ${author.name}`,
    description: `Complete collection of ${bookCount} books by ${author.name} at Bab-ul-Fatah`,
    numberOfItems: bookCount,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        url: `${BASE_URL}/shop/${product.slug}`,
        image: product.images[0]?.url || undefined,
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
        author: { '@type': 'Person', name: author.name },
        ...(product.category && {
          category: product.category.name,
        }),
      },
    })),
  };

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: BreadcrumbList Schema
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
        name: 'Authors',
        item: `${BASE_URL}/authors`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: author.name,
        item: authorUrl,
      },
    ],
  };

  return (
    <>
      {/* ── JSON-LD Schemas ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <div className="pb-16">
        {/* ── Breadcrumb ── */}
        <nav
          className="bg-gray-50 border-b border-gray-200"
          aria-label="Breadcrumb"
        >
          <div className="main-container flex items-center gap-2 text-[13px] text-gray-500 h-[42px]">
            <Link
              href="/"
              className="hover:text-[#1D333B] transition-colors"
            >
              Home
            </Link>
            <ChevronRight
              className="h-3.5 w-3.5 text-gray-300"
              aria-hidden="true"
            />
            <span className="text-gray-400">Authors</span>
            <ChevronRight
              className="h-3.5 w-3.5 text-gray-300"
              aria-hidden="true"
            />
            <span
              className="text-[#1D333B] font-medium truncate max-w-[260px]"
              aria-current="page"
            >
              {author.name}
            </span>
          </div>
        </nav>

        {/* ── Author Header ── */}
        <section className="bg-white border-b border-gray-100">
          <div className="main-container py-8 md:py-10">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: BRAND_DARK }}
              >
                <User className="h-9 w-9" strokeWidth={1.5} />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1D333B] leading-tight">
                  {author.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" style={{ color: BRAND_GOLD }} />
                    <strong className="text-[#1D333B]">{bookCount}</strong>{' '}
                    {bookCount === 1 ? 'Book' : 'Books'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" style={{ color: BRAND_GOLD }} />
                    <strong className="text-[#1D333B]">
                      {categoriesWithCounts.length}
                    </strong>{' '}
                    {categoriesWithCounts.length === 1 ? 'Category' : 'Categories'}
                  </span>
                </div>

                {/* Category pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoriesWithCounts.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?category=${cat.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium bg-gray-50 text-gray-600 hover:bg-[#1D333B] hover:text-white transition-colors"
                    >
                      {cat.name}
                      <span className="text-[11px] opacity-60">
                        ({cat.count})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Author Bio ── */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="main-container py-6 md:py-8">
            <div className="max-w-3xl">
              <p className="text-[14px] leading-relaxed text-gray-600">
                <strong className="text-[#1D333B]">{author.name}</strong> is a
                distinguished Islamic scholar and author whose works have
                contributed significantly to Islamic literature. With{' '}
                <strong className="text-[#1D333B]">{bookCount}</strong>{' '}
                {bookCount === 1 ? 'title' : 'titles'} available at
                Bab-ul-Fatah, spanning categories such as{' '}
                {categoriesWithCounts
                  .slice(0, 3)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop?category=${c.slug}`}
                      className="underline decoration-[#C9A84C]/40 hover:text-[#1D333B] transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))
                  .reduce<React.ReactNode[]>((acc, node, i) => {
                    if (i > 0) {
                      acc.push(
                        <span key={`sep-${i}`}>, </span>
                      );
                    }
                    acc.push(node);
                    return acc;
                  }, [])}
                {categoriesWithCounts.length > 3 &&
                  `, and ${categoriesWithCounts.length - 3} more`}
                , their writings serve as a valuable resource for Muslims
                seeking authentic knowledge. All books by{' '}
                {author.name} are available with Cash on Delivery across
                Pakistan.
              </p>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded p-3 border border-gray-100 text-center">
                  <p className="text-lg font-bold text-[#1D333B]">
                    {bookCount}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                    Total Books
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-gray-100 text-center">
                  <p className="text-lg font-bold text-[#1D333B]">
                    {categoriesWithCounts.length}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                    Categories
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-gray-100 text-center">
                  <p className="text-lg font-bold text-[#1D333B]">
                    Rs. {minPrice.toLocaleString('en-PK')}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                    Starting Price
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-gray-100 text-center">
                  <p className="text-lg font-bold text-[#1D333B]">
                    {languages}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                    Languages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content: Sidebar + Grid ── */}
        <section className="bg-white">
          <div className="main-container py-8 md:py-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* ── Sidebar: Categories ── */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="lg:sticky lg:top-4">
                  <h2 className="text-[14px] font-bold text-[#1D333B] uppercase tracking-wider mb-4 pb-2 border-b-2 border-[#1D333B]">
                    Categories
                  </h2>

                  <ul className="space-y-1">
                    {/* All books link */}
                    <li>
                      <span className="flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1D333B] bg-gray-50">
                        All Books
                        <span className="text-[11px] bg-[#1D333B] text-white px-2 py-0.5">
                          {bookCount}
                        </span>
                      </span>
                    </li>

                    {categoriesWithCounts.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          className="flex items-center justify-between px-3 py-2 text-[13px] text-gray-600 hover:text-[#1D333B] hover:bg-gray-50 transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5">
                            {cat.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Price range info */}
                  <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-100">
                    <h3 className="text-[12px] font-bold text-[#1D333B] uppercase tracking-wider mb-2">
                      Price Range
                    </h3>
                    <p className="text-[13px] text-gray-600">
                      Rs. {minPrice.toLocaleString('en-PK')} —{' '}
                      Rs. {maxPrice.toLocaleString('en-PK')}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 p-4 rounded border border-gray-100" style={{ backgroundColor: '#1D333B' }}>
                    <p className="text-[13px] text-white/90 leading-relaxed">
                      <strong className="text-white">
                        Cash on Delivery
                      </strong>{' '}
                      available across Pakistan for all books by{' '}
                      {author.name}.
                    </p>
                  </div>
                </div>
              </aside>

              {/* ── Books Grid ── */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[16px] font-bold text-[#1D333B]">
                    All Books by {author.name}
                    <span className="ml-2 text-[13px] font-normal text-gray-400">
                      ({bookCount} {bookCount === 1 ? 'book' : 'books'})
                    </span>
                  </h2>
                </div>

                {products.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <BookOpen className="h-16 w-16 mb-4" />
                    <p className="text-[14px]">
                      No books found for this author.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
