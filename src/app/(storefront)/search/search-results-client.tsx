'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';

// ── Types ──────────────────────────────────────────────────────
interface SearchResult {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  language?: string;
  images: { id: string; url: string; altText?: string | null }[];
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string } | null;
}

const PRODUCTS_PER_PAGE = 24;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const LANGUAGE_OPTIONS = [
  { value: '', label: 'All Languages' },
  { value: 'URDU', label: 'Urdu' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'ARABIC', label: 'Arabic' },
];

// ── Component ──────────────────────────────────────────────────
export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const languageParam = searchParams.get('language') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Sync search input with URL param
  useEffect(() => {
    setSearchInput(query);
    setPage(1);
  }, [query]);

  // Fetch search results
  const fetchResults = useCallback(async (
    searchQuery: string,
    pageNum: number,
    sortValue: string,
    lang: string
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/storefront/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: PRODUCTS_PER_PAGE,
          offset: (pageNum - 1) * PRODUCTS_PER_PAGE,
          sort: sortValue,
          language: lang || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.products || []);
        setTotal(data.total || 0);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch when query/page/sort/language changes
  useEffect(() => {
    if (query.trim()) {
      fetchResults(query, page, sort, languageParam);
    } else {
      setResults([]);
      setTotal(0);
    }
  }, [query, page, sort, languageParam, fetchResults]);

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  // Handle language filter change
  const handleLanguageChange = (lang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (lang) params.set('language', lang);
    else params.delete('language');
    params.set('q', query);
    setPage(1);
    router.push(`/search?${params.toString()}`);
  };

  // Pagination
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const showingFrom = total === 0 ? 0 : (page - 1) * PRODUCTS_PER_PAGE + 1;
  const showingTo = Math.min(page * PRODUCTS_PER_PAGE, total);

  return (
    <div className="main-container py-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-5">
        <button
          onClick={() => router.push('/')}
          className="hover:text-[#1D333B] transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Home
        </button>
        <span>/</span>
        <span className="text-[#1D333B] font-medium">Search Results</span>
      </nav>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} className="flex w-full border border-gray-200 bg-white mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for books, authors, categories..."
          className="flex-1 px-4 h-[50px] text-sm text-gray-700 focus:outline-none bg-white placeholder:text-gray-400"
          autoFocus
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setPage(1); router.push('/search'); }}
            className="flex items-center justify-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="bg-[#1D333B] hover:bg-[#142229] text-white px-6 transition-colors flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Search</span>
        </button>
      </form>

      {/* ── Empty query state ── */}
      {!query.trim() && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Search className="h-16 w-16 text-gray-200" />
          <h2 className="text-xl font-semibold text-[#1D333B]">Search our collection</h2>
          <p className="text-sm text-gray-400 max-w-md">
            Find Islamic books, Quran, Hadith collections, Seerah, Tafseer, children&apos;s books, and more from our catalog of over 1,000 products.
          </p>
        </div>
      )}

      {/* ── Results area ── */}
      {query.trim() && (
        <>
          {/* Results header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-[#1D333B]">
                {loading ? 'Searching...' : (
                  <>
                    {total} result{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                  </>
                )}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-[12px] text-gray-500 hidden sm:inline">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-[13px] text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#1D333B] cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-1.5 text-[13px] text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* ── Filters bar (collapsible) ── */}
          <div className={`border border-gray-200 bg-gray-50/50 mb-6 overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 border-0'}`}>
            <div className="p-4 flex flex-wrap items-center gap-4">
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Quick Filters:</span>

              {/* Language filter */}
              <div className="flex items-center gap-2">
                <label className="text-[12px] text-gray-500">Language:</label>
                <div className="flex gap-1">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleLanguageChange(opt.value)}
                      className={`px-2.5 py-1 text-[11px] border transition-colors ${
                        languageParam === opt.value
                          ? 'bg-[#1D333B] text-white border-[#1D333B]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Loading state ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
              <span className="text-sm text-gray-400">Searching for books...</span>
            </div>
          )}

          {/* ── No results ── */}
          {!loading && query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <BookOpen className="h-16 w-16 text-gray-200" />
              <h2 className="text-lg font-semibold text-[#1D333B]">No books found</h2>
              <p className="text-sm text-gray-400 max-w-md">
                We couldn&apos;t find any books matching &ldquo;{query}&rdquo;. Try different keywords or browse our categories.
              </p>
              <button
                onClick={() => router.push('/shop')}
                className="mt-2 px-6 py-2.5 bg-[#1D333B] hover:bg-[#142229] text-white text-sm font-medium transition-colors"
              >
                Browse All Books
              </button>
            </div>
          )}

          {/* ── Product Grid ── */}
          {!loading && results.length > 0 && (
            <>
              {/* Showing X-Y of Z */}
              <p className="text-[12px] text-gray-400 mb-4">
                Showing {showingFrom}–{showingTo} of {total} products
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: product.price,
                      stock: product.stock,
                      language: product.language ?? '',
                      images: product.images,
                      category: product.category
                        ? { id: product.category.id, name: product.category.name }
                        : { id: '', name: '' },
                      author: product.author,
                    }}
                  />
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-10 min-w-[40px] px-2 flex items-center justify-center text-[13px] font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-[#1D333B] text-white'
                            : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
