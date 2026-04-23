import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/storefront/product-card';
import { ShopToolbar } from '@/components/storefront/shop-toolbar';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';
import { Prisma } from '@prisma/client';

const PRODUCTS_PER_PAGE = 24;

export const metadata: Metadata = {
  title: 'Shop All Books | Bab-ul-Fatah',
  description:
    'Browse our complete collection of authentic Islamic books, literature, and resources.',
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    lang?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category || '';
  const currentPage = Math.max(1, parseInt(params.page || '1'));
  const sort = params.sort || 'newest';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null;
  const languages = params.lang
    ? params.lang.split(',').filter(Boolean)
    : [];

  // ════════════════════════════════════════════════════════════════════
  //  STEP 1: Resolve all descendant category IDs for selected category
  //  (recursive CTE — fixes the "empty category" bug)
  // ════════════════════════════════════════════════════════════════════

  let categoryIds: string[] | null = null;
  if (selectedCategory) {
    const rows = await db.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE cat_tree AS (
        SELECT id FROM "Category" WHERE slug = ${selectedCategory}
        UNION ALL
        SELECT c.id FROM "Category" c JOIN cat_tree ct ON c."parentId" = ct.id
      )
      SELECT id FROM cat_tree
    `;
    categoryIds = rows.map((r) => r.id);
  }

  // ════════════════════════════════════════════════════════════════════
  //  STEP 2: Build where clause (use recursive IDs for category filter)
  // ════════════════════════════════════════════════════════════════════

  const andConditions: Prisma.ProductWhereInput[] = [];

  if (categoryIds && categoryIds.length > 0) {
    andConditions.push({ categoryId: { in: categoryIds } });
  } else if (selectedCategory) {
    // Category slug exists in URL but no categories found — will show empty
    andConditions.push({ categoryId: '___none___' } as any);
  }

  if (minPrice !== null && !isNaN(minPrice)) {
    andConditions.push({ price: { gte: minPrice } });
  }

  if (maxPrice !== null && !isNaN(maxPrice)) {
    andConditions.push({ price: { lte: maxPrice } });
  }

  if (languages.length > 0) {
    andConditions.push({ language: { in: languages as Prisma.EnumLanguageFilter['in'] } });
  }

  const whereClause: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // ── Build orderBy clause (always stock-first, then user sort) ──
  let secondarySort: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case 'price-asc':
      secondarySort = { price: 'asc' };
      break;
    case 'price-desc':
      secondarySort = { price: 'desc' };
      break;
    case 'name-asc':
      secondarySort = { title: 'asc' };
      break;
    case 'name-desc':
      secondarySort = { title: 'desc' };
      break;
    case 'newest':
    default:
      secondarySort = { createdAt: 'desc' };
      break;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { stock: 'desc' },
    secondarySort,
  ];

  // ════════════════════════════════════════════════════════════════════
  //  STEP 3: Fetch categories with RECURSIVE product counts
  //  (shows total products in entire subtree, not just direct children)
  // ════════════════════════════════════════════════════════════════════

  interface CategoryWithCount {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    product_count: number;
  }

  const categoriesWithCounts = await db.$queryRaw<CategoryWithCount[]>`
    WITH RECURSIVE cat_tree AS (
      SELECT id, id as root_id FROM "Category" WHERE "parentId" IS NULL
      UNION ALL
      SELECT c.id, ct.root_id FROM "Category" c JOIN cat_tree ct ON c."parentId" = ct.id
    )
    SELECT
      cr.id, cr.name, cr.slug, cr."parentId",
      COUNT(p.id)::int as product_count
    FROM "Category" cr
    LEFT JOIN cat_tree ct ON ct.root_id = cr.id
    LEFT JOIN "Product" p ON p."categoryId" = ct.id
    WHERE cr."parentId" IS NULL
    GROUP BY cr.id, cr.name, cr.slug, cr."parentId"
    ORDER BY cr.name ASC
  `;

  // ════════════════════════════════════════════════════════════════════
  //  STEP 4: Fetch products and total count (parallel)
  // ════════════════════════════════════════════════════════════════════

  const [totalCount, products] = await Promise.all([
    db.product.count({ where: whereClause }),
    db.product.findMany({
      where: whereClause,
      include: {
        category: true,
        author: true,
        images: { take: 1, orderBy: { order: 'asc' } },
        _count: { select: { orderItems: true } },
      },
      orderBy,
      skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const activeCategory = categoriesWithCounts.find((c) => c.slug === selectedCategory);
  const totalAllProducts = categoriesWithCounts.reduce((sum, c) => sum + c.product_count, 0);

  // Build URL helper preserving all current params
  const pageUrl = (page: number) => {
    const p = new URLSearchParams();
    if (selectedCategory) p.set('category', selectedCategory);
    if (sort !== 'newest') p.set('sort', sort);
    if (minPrice !== null && !isNaN(minPrice)) p.set('minPrice', String(minPrice));
    if (maxPrice !== null && !isNaN(maxPrice)) p.set('maxPrice', String(maxPrice));
    if (languages.length > 0) p.set('lang', languages.join(','));
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* ── CollectionPage JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: activeCategory ? `${activeCategory.name} — Bab-ul-Fatah` : 'Islamic Books Collection — Bab-ul-Fatah',
            description: activeCategory ? `Browse our ${activeCategory.name} collection of authentic Islamic books.` : 'Browse our complete collection of authentic Islamic books, literature, and resources.',
            url: `https://www.babulfatah.com/shop${selectedCategory ? `?category=${selectedCategory}` : ''}`,
          }),
        }}
      />

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand transition-colors">
          Shop
        </Link>
        {activeCategory && (
          <>
            <span>/</span>
            <span className="text-foreground font-medium">
              {activeCategory.name}
            </span>
          </>
        )}
      </nav>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
          {activeCategory ? activeCategory.name : 'All Books'}
        </h1>
        <div className="relative mt-3">
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-golden via-golden-light to-transparent" />
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          {totalCount} {totalCount === 1 ? 'book' : 'books'} available
          {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
        </p>
      </div>

      {/* ── Mobile Category Filter ──────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-4 md:hidden mb-6 scrollbar-none">
        <Link href="/shop">
          <button
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'bg-golden text-golden-foreground shadow-sm'
                : 'bg-surface-alt text-muted-foreground hover:bg-muted'
            }`}
          >
            All Books
          </button>
        </Link>
        {categoriesWithCounts.map((cat) => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
            <button
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.slug
                  ? 'bg-golden text-golden-foreground shadow-sm'
                  : 'bg-surface-alt text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat.name}
              <span className="ml-1.5 text-xs opacity-70">
                {cat.product_count}
              </span>
            </button>
          </Link>
        ))}
      </div>

      <div className="flex gap-8">
        {/* ── Desktop Sidebar ────────────────────────────────── */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-3">
              Categories
            </h2>
            <nav className="flex flex-col gap-1">
              <Link
                href="/shop"
                className={`flex items-center justify-between rounded-lg py-2.5 px-3 text-sm transition-all duration-200 ${
                  !selectedCategory
                    ? 'bg-brand/5 text-brand font-medium border-l-2 border-golden'
                    : 'text-muted-foreground hover:bg-surface-alt hover:text-foreground border-l-2 border-transparent'
                }`}
              >
                <span>All Books</span>
                <span className="text-xs opacity-60 tabular-nums">
                  {totalAllProducts}
                </span>
              </Link>
              {categoriesWithCounts.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`flex items-center justify-between rounded-lg py-2.5 px-3 text-sm transition-all duration-200 ${
                    selectedCategory === cat.slug
                      ? 'bg-brand/5 text-brand font-medium border-l-2 border-golden'
                      : 'text-muted-foreground hover:bg-surface-alt hover:text-foreground border-l-2 border-transparent'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-60 tabular-nums">
                    {cat.product_count}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Product Grid Area ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* ── Sort / Filter Toolbar ── */}
          <ShopToolbar
            currentSort={sort}
            currentMinPrice={minPrice !== null && !isNaN(minPrice) ? minPrice : null}
            currentMaxPrice={maxPrice !== null && !isNaN(maxPrice) ? maxPrice : null}
            currentLanguages={languages}
            totalCount={totalCount}
          />

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-surface-alt flex items-center justify-center mb-5">
                <BookOpen className="h-9 w-9 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No books found
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                Try adjusting your filters or browse all books.
              </p>
              <Link href="/shop" className="mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-golden/30 text-golden-dark hover:bg-golden/5 hover:text-golden-dark"
                >
                  View All Books
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* ── Pagination ───────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                    className="min-w-[36px] h-9 rounded-lg"
                  >
                    {currentPage > 1 ? (
                      <Link href={pageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>

                  {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
                    page === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 text-sm text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        asChild={currentPage !== page}
                        className={`min-w-[36px] h-9 rounded-lg text-sm ${
                          currentPage === page
                            ? 'bg-golden hover:bg-golden-hover text-golden-foreground shadow-sm'
                            : ''
                        }`}
                      >
                        {currentPage !== page ? (
                          <Link href={pageUrl(page as number)}>{page}</Link>
                        ) : (
                          String(page)
                        )}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                    className="min-w-[36px] h-9 rounded-lg"
                  >
                    {currentPage < totalPages ? (
                      <Link href={pageUrl(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Generate page number array with ellipsis for large page counts */
function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}
