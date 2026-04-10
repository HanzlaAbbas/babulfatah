import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Books | Bab-ul-Fatah',
  description: 'Search our collection of Islamic books, Quran, Hadith, Seerah, Tafseer and more.',
  robots: {
    index: false, // Search results pages should NEVER be indexed
    follow: true,
  },
};

import SearchResultsClient from './search-results-client';
import { Suspense } from 'react';

function SearchLoadingSkeleton() {
  return (
    <div className="main-container py-8">
      <div className="h-4 w-48 bg-gray-100 animate-pulse mb-6" />
      <div className="h-[50px] w-full bg-gray-100 animate-pulse mb-6" />
      <div className="h-5 w-32 bg-gray-100 animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 aspect-[3/3.8]" />
            <div className="pt-3 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-5 bg-gray-100 rounded w-1/3" />
              <div className="h-[42px] bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchResultsClient />
    </Suspense>
  );
}
