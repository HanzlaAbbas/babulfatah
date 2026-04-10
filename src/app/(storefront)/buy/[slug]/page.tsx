import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import {
  BookOpen,
  Truck,
  ShieldCheck,
  Package,
  ChevronRight,
  CheckCircle2,
  Phone,
  ArrowRight,
  MessageCircle,
  Star,
} from 'lucide-react';
import type { Metadata } from 'next';

// ── Constants ──────────────────────────────────────────────────
const BASE_URL = 'https://www.babulfatah.com';
const WHATSAPP_NUMBER = '923265903300';
const BRAND_DARK = '#1D333B';
const BRAND_GOLDEN = '#C9A84C';
const FREE_SHIPPING_THRESHOLD = 5000;

interface BuyPageProps {
  params: Promise<{ slug: string }>;
}

// ═══════════════════════════════════════════════════════════════════
//  STATIC GENERATION — Pre-render all /buy/[slug] pages at build
// ═══════════════════════════════════════════════════════════════════
export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

// ═══════════════════════════════════════════════════════════════════
//  ADVANCED SEO — Programmatic "Buy" Page Metadata
//  Title pattern targets "buy [product] online" long-tail keywords
// ═══════════════════════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: BuyPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  if (!product) return { title: 'Product Not Found' };

  const buyUrl = `${BASE_URL}/buy/${product.slug}`;
  const productImage =
    product.images.length > 0 && product.images[0].url
      ? product.images[0].url
      : undefined;

  const authorName = product.author?.name || 'Bab-ul-Fatah';
  const categoryName = product.category.name;
  const priceFormatted = `Rs. ${product.price.toLocaleString('en-PK')}`;
  const inStockText =
    product.stock > 0
      ? 'In stock — ready to ship'
      : 'Pre-order — limited stock';

  // ── SEO Title: targets "buy [title] online in pakistan" query ──
  const seoTitle = `Buy ${product.title} by ${authorName} Online in Pakistan — ${priceFormatted} | Bab-ul-Fatah`;

  // ── SEO Description: rich, keyword-dense with intent signals ──
  const seoDescription =
    product.metaDescription ||
    `Shop ${product.title} by ${authorName} at the best price in Pakistan — only ${priceFormatted}. ${categoryName} book in ${product.language} language with Cash on Delivery (COD) and free shipping on orders above Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()}. ${inStockText}. Order now from Bab-ul-Fatah — Pakistan's trusted Islamic bookstore.`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      `buy ${product.title}`,
      `${product.title} price in pakistan`,
      `${product.title} online`,
      `${product.title} ${authorName}`,
      `${categoryName} books online pakistan`,
      `buy ${categoryName} books`,
      `islamic books pakistan cod`,
      `${product.title} cash on delivery`,
      `${authorName} books`,
      `${product.language} ${categoryName} book`,
    ],
    alternates: {
      canonical: buyUrl,
    },
    openGraph: {
      title: `Buy ${product.title} Online — ${priceFormatted} | Bab-ul-Fatah`,
      description: `Order ${product.title} by ${authorName} for ${priceFormatted}. Cash on Delivery across Pakistan. Fast shipping.`,
      type: 'website',
      url: buyUrl,
      siteName: 'Bab-ul-Fatah',
      ...(productImage && {
        images: [
          {
            url: productImage,
            width: 800,
            height: 1067,
            alt: `Buy ${product.title} by ${authorName} — ${categoryName}`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `Buy ${product.title} — ${priceFormatted} | Bab-ul-Fatah`,
      description: `Order ${product.title} by ${authorName}. Cash on Delivery. ${priceFormatted}.`,
      ...(productImage && { images: [productImage] }),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
//  BUY PAGE COMPONENT — Programmatic SEO Landing / Buying Guide
// ═══════════════════════════════════════════════════════════════════
export default async function BuyPage({ params }: BuyPageProps) {
  const { slug } = await params;

  // ── Data Fetch ───────────────────────────────────────────────
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  if (!product) notFound();

  // ── Related Products (6 from same category, exclude current) ──
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      author: true,
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  // ── Derived Data ─────────────────────────────────────────────
  const inStock = product.stock > 0;
  const hasImage = product.images.length > 0 && product.images[0].url;
  const primaryImage = hasImage ? product.images[0] : null;
  const authorName = product.author?.name || null;
  const priceFormatted = `Rs. ${product.price.toLocaleString('en-PK')}`;
  const canonicalProductUrl = `${BASE_URL}/shop/${product.slug}`;
  const buyUrl = `${BASE_URL}/buy/${product.slug}`;
  const whatsappText = encodeURIComponent(
    `Assalam alaikum - I want to buy ${product.title}`
  );
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: Product Schema (comprehensive with shipping & seller)
  // ═══════════════════════════════════════════════════════════════════
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': canonicalProductUrl,
    name: product.title,
    description: product.description.slice(0, 500),
    image: hasImage
      ? product.images.map((img) => img.url)
      : undefined,
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: 'Bab-ul-Fatah',
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalProductUrl,
      priceCurrency: 'PKR',
      price: product.price.toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Bab-ul-Fatah',
        url: BASE_URL,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
    ...(authorName && {
      author: { '@type': 'Person', name: authorName },
    }),
    ...(product.category && {
      category: {
        '@type': 'Thing',
        name: product.category.name,
        url: `${BASE_URL}/shop?category=${product.category.slug}`,
      },
    }),
    ...(product.weight && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Weight',
        value: `${product.weight} kg`,
      },
    }),
  };

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: BreadcrumbList Schema (Home > Shop > Buy [Product])
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
        name: 'Shop',
        item: `${BASE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Buy ${product.title}`,
        item: buyUrl,
      },
    ],
  };

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: FAQPage Schema (3-4 product-specific buying FAQs)
  // ═══════════════════════════════════════════════════════════════════
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the price of ${product.title} in Pakistan?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The price of ${product.title} by ${authorName || 'Bab-ul-Fatah'} is ${priceFormatted} in Pakistan. Order now with Cash on Delivery available across all cities including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, and Quetta.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I buy ${product.title} online?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can buy ${product.title} directly from Bab-ul-Fatah's website. Simply click "Buy Now" to add it to your cart and checkout. We also accept orders via WhatsApp at +92 326 5903300. Cash on Delivery (COD) is available for all orders across Pakistan.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${product.title} available with Cash on Delivery in Pakistan?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${product.title} is available with Cash on Delivery (COD) across Pakistan. You can pay when the book arrives at your doorstep. We deliver to all major cities including Karachi, Lahore, Islamabad, Rawalpindi, Multan, Faisalabad, Peshawar, and Quetta.`,
        },
      },
      {
        '@type': 'Question',
        name: `How long does delivery take for ${product.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Orders for ${product.title} are processed within 1-2 business days and delivered within 3-7 business days depending on your location. Orders above Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()} qualify for free shipping. Track your order status via WhatsApp.`,
        },
      },
    ],
  };

  // ═══════════════════════════════════════════════════════════════════
  //  JSON-LD: WebPage Schema with about pointing to Product
  // ═══════════════════════════════════════════════════════════════════
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Buy ${product.title} Online in Pakistan — ${priceFormatted}`,
    description: `Complete buying guide for ${product.title} by ${authorName || 'Bab-ul-Fatah'}. Price, specifications, and how to order with Cash on Delivery in Pakistan.`,
    url: buyUrl,
    about: {
      '@type': 'Product',
      name: product.title,
      url: canonicalProductUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bab-ul-Fatah',
      url: BASE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${BASE_URL}/shop` },
        { '@type': 'ListItem', position: 3, name: `Buy ${product.title}`, item: buyUrl },
      ],
    },
  };

  // ── Trust Badges Data ────────────────────────────────────────
  const trustBadges = [
    {
      icon: Phone,
      title: 'Cash on Delivery',
      description: 'Pay when you receive your order. No advance payment needed.',
    },
    {
      icon: ShieldCheck,
      title: '100% Original',
      description: 'All books are sourced directly from publishers. Guaranteed authentic.',
    },
    {
      icon: Truck,
      title: `Free Shipping > Rs.${FREE_SHIPPING_THRESHOLD.toLocaleString()}`,
      description: 'Free delivery on orders above the threshold across Pakistan.',
    },
    {
      icon: Package,
      title: 'Fast Delivery',
      description: '3–7 business days delivery to all major cities in Pakistan.',
    },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          JSON-LD: All structured data schemas
      ═══════════════════════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <article>
        {/* ═══════════════════════════════════════════════════════════
            SECTION 1: Breadcrumb Navigation
            Home > Shop > Category > Buy [Title]
        ═══════════════════════════════════════════════════════════ */}
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
            <ChevronRight className="size-3.5 text-gray-300" aria-hidden="true" />
            <Link
              href="/shop"
              className="hover:text-[#1D333B] transition-colors"
            >
              Shop
            </Link>
            <ChevronRight className="size-3.5 text-gray-300" aria-hidden="true" />
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-[#1D333B] transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="size-3.5 text-gray-300" aria-hidden="true" />
            <span
              className="text-[#1D333B] font-medium truncate max-w-[200px]"
              aria-current="page"
            >
              Buy {product.title}
            </span>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2: Buying Guide Header
            Hero-style section with product image, price, CTAs
        ═══════════════════════════════════════════════════════════ */}
        <section
          className="bg-white border-b border-gray-100"
          itemScope
          itemType="https://schema.org/Product"
        >
          <div className="main-container py-8 md:py-14">
            {/* Section label */}
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  color: BRAND_GOLDEN,
                  backgroundColor: 'rgba(201, 168, 76, 0.1)',
                }}
              >
                <BookOpen className="size-3" />
                Buying Guide
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
              {/* Left: Product Image */}
              <div className="lg:col-span-4">
                <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={`${product.title} by ${authorName || 'Bab-ul-Fatah'} — ${product.category.name} book`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 384px"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="flex flex-col items-center gap-3 text-gray-300">
                        <BookOpen className="h-20 w-20" />
                        <span className="text-sm">Product Image</span>
                      </div>
                    </div>
                  )}
                  {/* Stock badge */}
                  {inStock && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="size-3" />
                        In Stock
                      </span>
                    </div>
                  )}
                  {!inStock && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        Pre-Order
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Product Buying Info */}
              <div className="lg:col-span-8 flex flex-col">
                {/* Product Title */}
                <h1
                  className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                  style={{ color: BRAND_DARK }}
                  itemProp="name"
                >
                  Buy {product.title}
                </h1>

                {/* Author + Category + Language meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-600">
                  {authorName && (
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">by</span>
                      <span className="font-medium text-[#1D333B]">
                        {authorName}
                      </span>
                    </span>
                  )}
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="hover:underline"
                    style={{ color: BRAND_GOLDEN }}
                  >
                    {product.category.name}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-[12px] font-medium text-gray-700">
                    {product.language}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-3">
                  <span
                    className="text-3xl md:text-4xl font-bold"
                    style={{ color: BRAND_DARK }}
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                  >
                    <meta itemProp="priceCurrency" content="PKR" />
                    <meta
                      itemProp="price"
                      content={product.price.toFixed(2)}
                    />
                    <meta
                      itemProp="availability"
                      content={
                        inStock
                          ? 'https://schema.org/InStock'
                          : 'https://schema.org/PreOrder'
                      }
                    />
                    {priceFormatted}
                  </span>
                  <span className="text-sm text-gray-400">
                    inc. applicable taxes
                  </span>
                </div>

                {/* Stock status line */}
                <p className="mt-2 text-sm">
                  {inStock ? (
                    <span className="text-green-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" />
                      Available — ready to ship within 1-2 business days
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">
                      Currently out of stock — place a pre-order to reserve your copy
                    </span>
                  )}
                </p>

                {/* Delivery note */}
                <div
                  className="mt-4 flex items-start gap-2 p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(201, 168, 76, 0.08)',
                    borderLeft: `3px solid ${BRAND_GOLDEN}`,
                  }}
                >
                  <Truck className="size-4 mt-0.5 shrink-0" style={{ color: BRAND_GOLDEN }} />
                  <span className="text-gray-700">
                    {product.price >= FREE_SHIPPING_THRESHOLD ? (
                      <>
                        <strong className="text-green-700">Free delivery</strong> on this order! Expected delivery:{' '}
                        <strong>3–7 business days</strong> across Pakistan.
                      </>
                    ) : (
                      <>
                        Add <strong>Rs. {(FREE_SHIPPING_THRESHOLD - product.price).toLocaleString()}</strong> more for{' '}
                        <strong className="text-green-700">free shipping</strong>. Expected delivery:{' '}
                        <strong>3–7 business days</strong> across Pakistan.
                      </>
                    )}
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-base font-bold text-white transition-all shadow-md hover:shadow-lg"
                    style={{ backgroundColor: BRAND_DARK }}
                  >
                    <ShoppingCartIcon />
                    Buy Now
                  </Link>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="size-5" />
                    Order on WhatsApp
                  </a>
                </div>

                {/* Quick trust signals under CTAs */}
                <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-green-600" />
                    Cash on Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-green-600" />
                    100% Original
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="size-3.5 text-green-600" />
                    Nationwide Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5 text-green-600" />
                    WhatsApp Support
                  </span>
                </div>

                {/* Link to full product page */}
                <div className="mt-5">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline transition-colors"
                    style={{ color: BRAND_GOLDEN }}
                  >
                    View full product details
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3: Product Details
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="main-container py-8 md:py-12">
            <h2
              className="text-xl md:text-2xl font-bold mb-6"
              style={{ color: BRAND_DARK }}
            >
              About {product.title}
            </h2>

            <div className="max-w-3xl">
              {/* Description */}
              <div className="prose prose-gray max-w-none text-[14px] leading-relaxed text-gray-600">
                {product.description
                  .split('\n')
                  .filter(Boolean)
                  .map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
              </div>

              {/* Product Specs Grid */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.sku && (
                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                      SKU
                    </span>
                    <p className="font-semibold text-sm mt-1" style={{ color: BRAND_DARK }}>
                      {product.sku}
                    </p>
                  </div>
                )}
                <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                    Category
                  </span>
                  <p className="font-semibold text-sm mt-1" style={{ color: BRAND_DARK }}>
                    <Link
                      href={`/shop?category=${product.category.slug}`}
                      className="hover:underline"
                      style={{ color: BRAND_GOLDEN }}
                    >
                      {product.category.name}
                    </Link>
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                    Language
                  </span>
                  <p className="font-semibold text-sm mt-1" style={{ color: BRAND_DARK }}>
                    {product.language}
                  </p>
                </div>
                {product.weight && (
                  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                      Weight
                    </span>
                    <p className="font-semibold text-sm mt-1" style={{ color: BRAND_DARK }}>
                      {product.weight} kg
                    </p>
                  </div>
                )}
              </div>

              {/* Author info */}
              {authorName && (
                <div className="mt-6 p-5 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                      Written by
                    </h3>
                    <p className="font-semibold mt-1" style={{ color: BRAND_DARK }}>
                      {authorName}
                    </p>
                  </div>
                  <Link
                    href={`/shop?author=${authorName}`}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: BRAND_GOLDEN }}
                  >
                    View all books
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 4: Why Buy From Bab-ul-Fatah — Trust Badges
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white border-t border-gray-200">
          <div className="main-container py-10 md:py-14">
            <div className="text-center mb-8">
              <h2
                className="text-xl md:text-2xl font-bold"
                style={{ color: BRAND_DARK }}
              >
                Why Buy From Bab-ul-Fatah?
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
                Pakistan&apos;s most trusted Islamic bookstore with thousands of happy customers nationwide
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBadges.map((badge) => (
                <div
                  key={badge.title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-full mb-4"
                    style={{ backgroundColor: 'rgba(201, 168, 76, 0.12)' }}
                  >
                    <badge.icon className="size-7" style={{ color: BRAND_GOLDEN }} />
                  </div>
                  <h3
                    className="font-bold text-sm mb-1.5"
                    style={{ color: BRAND_DARK }}
                  >
                    {badge.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 5: Buying FAQ
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="main-container py-10 md:py-14">
            <h2
              className="text-xl md:text-2xl font-bold mb-6"
              style={{ color: BRAND_DARK }}
            >
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl space-y-4">
              {[
                {
                  q: `What is the price of ${product.title} in Pakistan?`,
                  a: `${product.title} is available for ${priceFormatted} on Bab-ul-Fatah. This is the best price for an authentic copy in ${product.language} language. Cash on Delivery is available.`,
                },
                {
                  q: `How can I order ${product.title} online?`,
                  a: `You can buy ${product.title} directly from this page by clicking the "Buy Now" button above. You can also place your order via WhatsApp at +92 326 5903300. We deliver across Pakistan with Cash on Delivery.`,
                },
                {
                  q: `Is ${product.title} available with Cash on Delivery?`,
                  a: `Yes! ${product.title} is available with Cash on Delivery (COD) across all major cities in Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Multan, Faisalabad, Peshawar, and Quetta.`,
                },
                {
                  q: `How long will it take to deliver ${product.title}?`,
                  a: `We process orders within 1-2 business days and deliver within 3-7 business days depending on your location. Orders above Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()} qualify for free shipping. You can track your order via WhatsApp.`,
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm"
                >
                  <h3
                    className="font-semibold text-sm mb-2"
                    style={{ color: BRAND_DARK }}
                  >
                    {faq.q}
                  </h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 6: Related Products — Same Category
        ═══════════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <section className="bg-white border-t border-gray-200">
            <div className="main-container py-10 md:py-14">
              <div className="flex items-center justify-between mb-8">
                <h2
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: BRAND_DARK }}
                >
                  Related {product.category.name} Books
                </h2>
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  style={{ color: BRAND_GOLDEN }}
                >
                  View all
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {relatedProducts.map((rp) => {
                  const rpImage = rp.images.length > 0 ? rp.images[0].url : null;
                  return (
                    <Link
                      key={rp.id}
                      href={`/shop/${rp.slug}`}
                      className="group flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-gray-50">
                        {rpImage ? (
                          <Image
                            src={rpImage}
                            alt={rp.title}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <BookOpen className="size-10 text-gray-300" />
                          </div>
                        )}
                        {rp.stock <= 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-semibold bg-amber-500 text-white px-2 py-0.5 rounded">
                              Pre-Order
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3 flex flex-col gap-1">
                        <h3 className="text-[12px] font-semibold line-clamp-2 leading-snug group-hover:underline" style={{ color: BRAND_DARK }}>
                          {rp.title}
                        </h3>
                        {rp.author && (
                          <p className="text-[11px] text-gray-400 truncate">
                            {rp.author.name}
                          </p>
                        )}
                        <p className="text-[13px] font-bold mt-auto" style={{ color: BRAND_GOLDEN }}>
                          Rs. {rp.price.toLocaleString('en-PK')}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile view all link */}
              <div className="mt-6 text-center sm:hidden">
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  style={{ color: BRAND_GOLDEN }}
                >
                  View all {product.category.name} books
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION 7: Category CTA
            "Browse more [category] books →"
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-t border-gray-200">
          <div
            className="main-container py-10 md:py-12"
            style={{ backgroundColor: BRAND_DARK }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Browse more {product.category.name} books
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Explore our complete collection of {product.category.name.toLowerCase()} books at the best prices in Pakistan
                </p>
              </div>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all shrink-0"
                style={{
                  backgroundColor: BRAND_GOLDEN,
                  color: BRAND_DARK,
                }}
              >
                Explore Collection
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 8: Bottom Buying CTA (re-engage)
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white border-t border-gray-100">
          <div className="main-container py-10 md:py-12">
            <div className="max-w-2xl mx-auto text-center">
              <Star className="size-8 mx-auto mb-3" style={{ color: BRAND_GOLDEN }} />
              <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: BRAND_DARK }}>
                Ready to order {product.title}?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Get {product.title} delivered to your doorstep with Cash on Delivery.{' '}
                <strong>{priceFormatted}</strong> — best price guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/shop/${product.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-base font-bold text-white transition-all shadow-md hover:shadow-lg"
                  style={{ backgroundColor: BRAND_DARK }}
                >
                  <ShoppingCartIcon />
                  Buy Now — {priceFormatted}
                </Link>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-all border border-green-200"
                >
                  <MessageCircle className="size-5" />
                  Order on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

// ── Inline SVG icon component for cart (no extra dependency) ────
function ShoppingCartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
