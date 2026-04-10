import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';
import type { Metadata } from 'next';

const BASE_URL = 'https://www.babulfatah.com';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Bab-ul-Fatah',
  description: 'The page you are looking for does not exist. Browse our collection of 1,285+ authentic Islamic books in Urdu, English & Arabic.',
  robots: { index: false, follow: true },
};

const POPULAR_CATEGORIES = [
  { name: 'Quran & Hadith', slug: 'quran', emoji: '📖' },
  { name: 'Hadith Collections', slug: 'hadith', emoji: '📜' },
  { name: "Prophet's Seerah", slug: 'biography', emoji: '🌙' },
  { name: "Children's Books", slug: 'children', emoji: '👶' },
  { name: 'Tafseer', slug: 'tafseer', emoji: '🔍' },
  { name: 'Ramadan Special', slug: 'ramadan', emoji: '🌙' },
  { name: 'Hajj & Umrah', slug: 'hajj-umrah', emoji: '🕋' },
  { name: 'Prayers', slug: 'prayers', emoji: '🤲' },
];

export default function NotFound() {
  return (
    <>
      {/* JSON-LD: BreadcrumbList for 404 page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Page Not Found" },
            ],
          }),
        }}
      />

      <div className="main-container py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/" aria-label="Return to homepage">
              <Image src="/logo.png" alt="Bab-ul-Fatah" width={140} height={35} className="h-9 w-auto mx-auto" priority />
            </Link>
          </div>

          <h1 className="text-[120px] md:text-[160px] font-black text-[#1D333B]/10 leading-none select-none">
            404
          </h1>

          <h2 className="text-[22px] md:text-[26px] font-bold text-[#1D333B] -mt-8 md:-mt-10">
            Page Not Found
          </h2>
          <p className="text-[15px] text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let us help you find what you need.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#1D333B] hover:bg-[#142229] text-white font-medium px-6 py-3 text-[14px] transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Homepage
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-[#1D333B] text-[#1D333B] hover:bg-[#1D333B] hover:text-white font-medium px-6 py-3 text-[14px] transition-colors"
            >
              Browse All Books
            </Link>
            <a
              href="https://wa.me/923265903300?text=Assalam%20alaikum%20-%20I%20need%20help%20finding%20a%20book"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium px-6 py-3 text-[14px] transition-colors"
            >
              WhatsApp Us
            </a>
          </div>

          <div className="mt-12">
            <h3 className="text-[16px] font-semibold text-[#1D333B] mb-4">
              Popular Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
              {POPULAR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-gray-600 bg-gray-50 border border-gray-100 hover:bg-[#1D333B] hover:text-white hover:border-[#1D333B] transition-colors"
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[13px] text-gray-400">
            <Link href="/shop" className="hover:text-[#1D333B] transition-colors">
              All Books
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/search" className="hover:text-[#1D333B] transition-colors">
              Search Books
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/contact" className="hover:text-[#1D333B] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
