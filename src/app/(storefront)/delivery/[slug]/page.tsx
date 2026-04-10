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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ── Hardcoded city data ──────────────────────────────────────────
const CITIES = [
  { slug: 'lahore', name: 'Lahore', province: 'Punjab', population: '13M+', deliveryDays: '1-2' },
  { slug: 'karachi', name: 'Karachi', province: 'Sindh', population: '16M+', deliveryDays: '2-3' },
  { slug: 'islamabad', name: 'Islamabad', province: 'Federal', population: '1.2M+', deliveryDays: '2-3' },
  { slug: 'rawalpindi', name: 'Rawalpindi', province: 'Punjab', population: '2.3M+', deliveryDays: '2-3' },
  { slug: 'faisalabad', name: 'Faisalabad', province: 'Punjab', population: '3.5M+', deliveryDays: '2-3' },
  { slug: 'multan', name: 'Multan', province: 'Punjab', population: '2M+', deliveryDays: '2-4' },
  { slug: 'peshawar', name: 'Peshawar', province: 'KPK', population: '2M+', deliveryDays: '3-4' },
  { slug: 'quetta', name: 'Quetta', province: 'Balochistan', population: '1.2M+', deliveryDays: '3-5' },
  { slug: 'sialkot', name: 'Sialkot', province: 'Punjab', population: '700K+', deliveryDays: '2-3' },
  { slug: 'gujranwala', name: 'Gujranwala', province: 'Punjab', population: '1.1M+', deliveryDays: '2-3' },
  { slug: 'hyderabad', name: 'Hyderabad', province: 'Sindh', population: '1.8M+', deliveryDays: '2-3' },
  { slug: 'bahawalpur', name: 'Bahawalpur', province: 'Punjab', population: '500K+', deliveryDays: '3-4' },
  { slug: 'sargodha', name: 'Sargodha', province: 'Punjab', population: '800K+', deliveryDays: '2-3' },
  { slug: 'sukkur', name: 'Sukkur', province: 'Sindh', population: '500K+', deliveryDays: '3-4' },
  { slug: 'abbottabad', name: 'Abbottabad', province: 'KPK', population: '400K+', deliveryDays: '3-4' },
  { slug: 'mardan', name: 'Mardan', province: 'KPK', population: '350K+', deliveryDays: '3-5' },
  { slug: 'mingora', name: 'Mingora (Swat)', province: 'KPK', population: '300K+', deliveryDays: '3-5' },
  { slug: 'dera-ismail-khan', name: 'Dera Ismail Khan', province: 'KPK', population: '200K+', deliveryDays: '4-5' },
  { slug: 'dera-ghazi-khan', name: 'Dera Ghazi Khan', province: 'Punjab', population: '300K+', deliveryDays: '3-4' },
  { slug: 'jhang', name: 'Jhang', province: 'Punjab', population: '400K+', deliveryDays: '2-4' },
] as const;

const BASE_URL = 'https://www.babulfatah.com';
const WHATSAPP_NUMBER = '923265903300';

// ── Dynamic Rendering — fetch data at request time ────────────────
export const dynamic = 'force-dynamic';

// ── Metadata ─────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);

  if (!city) {
    return { title: 'City Not Found' };
  }

  const title = `Islamic Books Delivery in ${city.name} — Cash on Delivery`;
  const description = `Order Islamic books online with delivery to ${city.name}, ${city.province}. Cash on Delivery available. Free shipping on orders above Rs. 5,000. Delivery in ${city.deliveryDays} days.`;
  const canonical = `${BASE_URL}/delivery/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Bab-ul-Fatah',
      type: 'website',
      locale: 'en_PK',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ── FAQ data ─────────────────────────────────────────────────────
function getFaqs(city: (typeof CITIES)[number]) {
  return [
    {
      question: `How long does delivery take to ${city.name}?`,
      answer: `Delivery to ${city.name}, ${city.province} typically takes ${city.deliveryDays} business days via our trusted courier partners. Orders are dispatched within 24 hours of confirmation.`,
    },
    {
      question: `Is Cash on Delivery (COD) available in ${city.name}?`,
      answer: `Yes! Cash on Delivery is fully available in ${city.name}. You can pay in cash when your Islamic books arrive at your doorstep. No advance payment is required.`,
    },
    {
      question: `Is there free shipping to ${city.name}?`,
      answer: `Absolutely! Bab-ul-Fatah offers free shipping on all orders above Rs. 5,000 delivered to ${city.name}. For orders below Rs. 5,000, a nominal shipping fee of Rs. 200 applies.`,
    },
    {
      question: `Can I track my order to ${city.name}?`,
      answer: `Yes, once your order is shipped, you will receive a tracking number via WhatsApp or SMS. You can use this to track your package in real-time until it reaches ${city.name}.`,
    },
    {
      question: `What is the return policy for orders in ${city.name}?`,
      answer: `If you receive a damaged or incorrect book, we offer a 7-day return/exchange policy for customers in ${city.name}. Simply contact us via WhatsApp and we will arrange a hassle-free return.`,
    },
  ];
}

// ── JSON-LD schemas ──────────────────────────────────────────────
function buildJsonLd(city: (typeof CITIES)[number]) {
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
        name: 'Delivery',
        item: `${BASE_URL}/delivery`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `${BASE_URL}/delivery/${city.slug}`,
      },
    ],
  };

  const faqs = getFaqs(city);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return { breadcrumbJsonLd, faqJsonLd };
}

// ── Page component ───────────────────────────────────────────────
export default async function CityDeliveryPage({ params }: PageProps) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);

  if (!city) {
    notFound();
  }

  const otherCities = CITIES.filter((c) => c.slug !== city.slug);
  const { breadcrumbJsonLd, faqJsonLd } = buildJsonLd(city);
  const faqs = getFaqs(city);

  // Fetch popular in-stock products with images
  const popularProducts = await db.product.findMany({
    where: { stock: { gt: 0 } },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
    take: 12,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch top 6 categories
  const topCategories = await db.category.findMany({
    take: 6,
  });

  const whatsappMessage = encodeURIComponent(
    `Assalam alaikum - I want delivery in ${city.name} for some Islamic books`
  );
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  // Delivery info cards
  const deliveryFeatures = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
      title: 'Cash on Delivery',
      description: 'Pay when you receive your books. No advance payment needed for orders in ' + city.name + '.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      title: 'Free Shipping',
      description: 'Free delivery on all orders above Rs. 5,000. Nominal Rs. 200 fee for smaller orders.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: `${city.deliveryDays} Day Delivery`,
      description: `Fast and reliable delivery to ${city.name}, ${city.province}. Orders shipped within 24 hours.`,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: 'Order via WhatsApp',
      description: 'Place your order quickly through WhatsApp. Share your book list and get instant confirmation.',
    },
  ];

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="bg-white">
        {/* ── Breadcrumb ────────────────────────────────────── */}
        <div className="main-container py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/delivery">Delivery</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{city.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* ── City Hero ─────────────────────────────────────── */}
        <section className="bg-brand text-white">
          <div className="main-container py-12 md:py-16 text-center">
            <Badge className="bg-golden text-golden-foreground border-golden mb-4 text-sm px-3 py-1">
              {city.province} · Population {city.population}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {city.name} — Islamic Books{' '}
              <span className="text-golden">at Your Doorstep</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-6">
              Browse our curated collection of Islamic books with reliable delivery
              to {city.name}. Cash on Delivery available.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge
                variant="outline"
                className="border-white/40 text-white text-base px-4 py-1.5"
              >
                🚚 Delivery in {city.deliveryDays} days
              </Badge>
              <Badge
                variant="outline"
                className="border-white/40 text-white text-base px-4 py-1.5"
              >
                💵 Cash on Delivery
              </Badge>
              <Badge
                variant="outline"
                className="border-white/40 text-white text-base px-4 py-1.5"
              >
                📦 Free Shipping &gt; Rs.5,000
              </Badge>
            </div>
          </div>
        </section>

        {/* ── Delivery Info Cards ───────────────────────────── */}
        <section className="main-container py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliveryFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="border border-border/60 hover:border-golden/40 hover:shadow-md transition-all duration-300 py-0"
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-brand/5 flex items-center justify-center text-brand">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-brand">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Popular Books Grid ────────────────────────────── */}
        {popularProducts.length > 0 && (
          <section className="main-container pb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-brand mb-2">
                Popular Islamic Books
              </h2>
              <p className="text-muted-foreground">
                Handpicked titles delivered to {city.name}, {city.province}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {popularProducts.map((product) => {
                const coverImage = product.images[0];
                return (
                  <Link
                    key={product.id}
                    href={`/buy/${product.slug}`}
                    className="group block rounded-lg border border-border/60 overflow-hidden hover:shadow-lg hover:border-golden/50 transition-all duration-300 bg-white"
                  >
                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={coverImage.url}
                          alt={coverImage.altText || product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 opacity-40">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                          </svg>
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-brand text-white text-[10px] px-1.5 py-0.5">
                        {product.language}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-brand leading-tight line-clamp-2 mb-1.5 group-hover:text-golden-dark transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-golden-dark font-bold text-base">
                        Rs. {product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                View All Books
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* ── Category Links ────────────────────────────────── */}
        {topCategories.length > 0 && (
          <section className="bg-gray-50/70 py-12">
            <div className="main-container">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-brand mb-2">
                  Browse by Category
                </h2>
                <p className="text-muted-foreground">
                  Explore Islamic book categories delivered to {city.name}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-white hover:border-golden/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-12 w-12 rounded-lg bg-brand/5 flex items-center justify-center flex-shrink-0 group-hover:bg-golden/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-brand group-hover:text-golden-dark transition-colors">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-brand group-hover:text-golden-dark transition-colors">
                        Browse {category.name} Books
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Delivered to {city.name}
                      </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── WhatsApp CTA ──────────────────────────────────── */}
        <section className="main-container py-12">
          <div className="rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 p-8 md:p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" className="h-8 w-8">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-brand mb-3">
              Order via WhatsApp for Delivery to {city.name}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Send us your book list on WhatsApp and we&apos;ll confirm your order
              instantly. Cash on Delivery available across {city.province}.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </section>

        {/* ── FAQ Section ───────────────────────────────────── */}
        <section className="bg-gray-50/70 py-12">
          <div className="main-container">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-brand mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Common questions about delivery to {city.name}
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-border/60 bg-white overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-medium text-brand hover:text-golden-dark transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <span className="pr-4">{faq.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/40 pt-4">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Other Cities ──────────────────────────────────── */}
        <section className="main-container py-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-brand mb-2">
              We Also Deliver To
            </h2>
            <p className="text-muted-foreground">
              Bab-ul-Fatah delivers Islamic books across Pakistan
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {otherCities.map((otherCity) => (
              <Link
                key={otherCity.slug}
                href={`/delivery/${otherCity.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-white text-sm text-brand hover:border-golden/50 hover:text-golden-dark hover:bg-golden/5 transition-all duration-200"
              >
                {otherCity.name}
                <span className="text-xs text-muted-foreground">
                  {otherCity.province}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────── */}
        <section className="bg-brand text-white">
          <div className="main-container py-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              Ready to Order Islamic Books in {city.name}?
            </h2>
            <p className="text-white/75 mb-6 max-w-lg mx-auto">
              Browse our complete collection or contact us on WhatsApp for
              personalized recommendations and quick ordering.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-golden hover:bg-golden-light text-golden-foreground font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m6 9 6 6 6-6" />
                </svg>
                Browse All Books
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
