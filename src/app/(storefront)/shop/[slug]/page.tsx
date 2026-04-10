import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  ArrowLeft,
  Check,
  Package,
  Globe,
} from 'lucide-react';
import { ProductImageGallery } from '@/components/storefront/product-image-gallery';
import { AddToCartButton } from '@/components/storefront/add-to-cart-button';
import { RecentlyViewedTracker } from '@/components/storefront/recently-viewed-tracker';
import { RecentlyViewedSection } from '@/components/storefront/recently-viewed-section';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ── Dynamic Rendering — fetch data at request time ────────────────
export const dynamic = 'force-dynamic';

// ── Dynamic Metadata for SEO ──────────────────────────────────
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true, author: true, images: { take: 1, orderBy: { order: 'asc' } } },
  });

  if (!product) return { title: 'Product Not Found' };

  const productImage =
    product.images.length > 0 && product.images[0].url
      ? product.images[0].url
      : undefined;

  return {
    title: `${product.title} | Bab-ul-Fatah`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `https://www.babulfatah.com/shop/${product.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      title: `${product.title} | Bab-ul-Fatah`,
      description: product.description.slice(0, 160),
      type: 'website',
      url: `https://www.babulfatah.com/shop/${product.slug}`,
      siteName: 'Bab-ul-Fatah',
      ...(productImage && {
        images: [
          {
            url: productImage,
            width: 800,
            height: 1067,
            alt: product.images[0]?.altText || product.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Bab-ul-Fatah`,
      description: product.description.slice(0, 160),
      ...(productImage && { images: [productImage] }),
    },
  };
}

// ── Page Component ────────────────────────────────────────────
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      images: { orderBy: { order: 'asc' } },
      _count: { select: { orderItems: true } },
    },
  });

  if (!product) notFound();

  const inStock = product.stock > 0;
  const hasImage = product.images.length > 0 && product.images[0].url;

  // ── JSON-LD Structured Data (Google Rich Results) ─────────
  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description.slice(0, 500),
    image: hasImage
      ? product.images.map((img) => img.url)
      : undefined,
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: 'Bab-ul-Fatah',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.babulfatah.com/shop/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.price.toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Bab-ul-Fatah',
      },
    },
    ...(product.author && {
      author: {
        '@type': 'Person',
        name: product.author.name,
      },
    }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.babulfatah.com' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://www.babulfatah.com/shop' },
      { '@type': 'ListItem', position: 3, name: product.category.name, item: `https://www.babulfatah.com/shop?category=${product.category.slug}` },
      { '@type': 'ListItem', position: 4, name: product.title, item: `https://www.babulfatah.com/shop/${product.slug}` },
    ],
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* ── JSON-LD Injection ─────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-brand transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-brand transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* ── Product Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="rounded-xl overflow-hidden border border-border/30">
          {hasImage ? (
            <ProductImageGallery images={product.images} title={product.title} />
          ) : (
            <div className="aspect-[3/4] bg-surface-alt flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
                <BookOpen className="h-24 w-24" />
                <span className="text-sm">Product Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs font-medium rounded-full bg-surface-alt text-brand-dark border-0"
            >
              <Globe className="h-3 w-3 mr-1" />
              {product.language}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs rounded-full border-golden/30 text-golden-dark"
            >
              {product.category.name}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.title}
            </h1>
            {product.author && (
              <p className="mt-2 text-muted-foreground text-sm">
                by{' '}
                <span className="font-medium text-foreground hover:text-brand transition-colors cursor-pointer">
                  {product.author.name}
                </span>
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <span className="text-3xl font-bold text-brand-dark tracking-tight">
              Rs. {product.price.toLocaleString('en-PK')}
            </span>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-50">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  In Stock
                </span>
                <span className="text-sm text-muted-foreground">
                  ({product.stock} available)
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-50">
                  <Package className="h-3 w-3 text-crimson" />
                </div>
                <span className="text-sm font-medium text-crimson">
                  Out of Stock
                </span>
              </>
            )}
          </div>

          <Separator className="bg-border/60" />

          {/* Add to Cart + SKU */}
          <div className="space-y-3">
            <AddToCartButton product={product} />
            {product.sku && (
              <p className="text-xs text-muted-foreground text-center">
                SKU: {product.sku}
              </p>
            )}
          </div>

          <Separator className="bg-border/60" />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Description
            </h2>
            <div className="text-muted-foreground leading-relaxed text-sm space-y-4">
              {product.description
                .split('\n')
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </div>

          {/* Back Link */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Shop
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recently Viewed Tracker (headless) ── */}
      <RecentlyViewedTracker
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          stock: product.stock,
          image: product.images[0]?.url || '',
          slug: product.slug,
        }}
      />

      {/* ── Recently Viewed Section ── */}
      <RecentlyViewedSection />
    </div>
  );
}
