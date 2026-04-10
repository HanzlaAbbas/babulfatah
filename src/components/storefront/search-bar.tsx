'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  author: { id: string; name: string } | null;
  images: { id: string; url: string; altText?: string | null }[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const POPULAR_SEARCHES = ['Quran', 'Hadith', 'Tafseer', 'Seerah', 'Children'];
const DEBOUNCE_MS = 300;
const MAX_RECENT = 5;
const RECENT_KEY = 'bf_recent_searches';

// ─── Local Storage helpers ────────────────────────────────────────────────────

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches().filter(
      (s) => s.toLowerCase() !== term.toLowerCase()
    );
    existing.unshift(term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(existing.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

// ─── SearchBar Component ──────────────────────────────────────────────────────

interface SearchBarProps {
  /** Inline mode for desktop navbar */
  variant?: 'navbar' | 'mobile';
}

export function SearchBar({ variant = 'navbar' }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mobileOverlay, setMobileOverlay] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setMobileOverlay(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (variant === 'mobile') {
          setMobileOverlay(true);
        } else {
          inputRef.current?.focus();
        }
        setOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [variant]);

  // Auto-focus mobile overlay input
  useEffect(() => {
    if (mobileOverlay) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mobileOverlay]);

  // ── Search function ──
  const doSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/storefront/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm.trim(), limit: 8 }),
      });

      if (!res.ok) {
        setResults([]);
        return;
      }

      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced search ──
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIdx(-1);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setOpen(true);
      debounceRef.current = setTimeout(() => {
        doSearch(value);
      }, DEBOUNCE_MS);
    },
    [doSearch]
  );

  // ── Navigate to product ──
  const navigateToProduct = useCallback(
    (slug: string) => {
      setOpen(false);
      setMobileOverlay(false);
      inputRef.current?.blur();

      if (query.trim().length >= 2) {
        saveRecentSearch(query.trim());
        setRecentSearches(getRecentSearches());
      }

      router.push(`/shop/${slug}`);
    },
    [query, router]
  );

  // ── Click on recent / popular search ──
  const handleTermClick = useCallback(
    (term: string) => {
      setQuery(term);
      setOpen(true);
      doSearch(term);
    },
    [doSearch]
  );

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = results.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) =>
          prev < totalItems - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) =>
          prev > 0 ? prev - 1 : totalItems - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIdx >= 0 && selectedIdx < results.length) {
          navigateToProduct(results[selectedIdx].slug);
        } else if (query.trim().length >= 2) {
          setOpen(false);
          setMobileOverlay(false);
          saveRecentSearch(query.trim());
          setRecentSearches(getRecentSearches());
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setMobileOverlay(false);
        inputRef.current?.blur();
      }
    },
    [results, selectedIdx, query, navigateToProduct, router]
  );

  // ── Clear search ──
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedIdx(-1);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  }, []);

  // ── Show dropdown condition ──
  const showDropdown = open && !mobileOverlay
    ? query.trim().length >= 2 || results.length > 0
    : false;

  const hasResults = results.length > 0;
  const isSearching = loading && query.trim().length >= 2;
  const isEmpty = query.trim().length >= 2 && !loading && results.length === 0;

  // ── Result row component ──
  const ResultRow = ({ product, idx }: { product: SearchResult; idx: number }) => (
    <button
      onClick={() => navigateToProduct(product.slug)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        idx === selectedIdx
          ? 'bg-brand/5'
          : 'hover:bg-muted/40'
      }`}
    >
      <div className="relative w-10 h-14 rounded-md overflow-hidden bg-surface shrink-0">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText || product.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookIcon className="h-4 w-4 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {product.title}
        </p>
        {product.author && (
          <p className="text-xs text-muted-foreground truncate">
            {product.author.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <p className={`text-sm font-bold mt-0.5 ${product.stock <= 0 ? 'text-muted-foreground line-through' : 'text-brand-dark'}`}>
            Rs. {product.price.toLocaleString('en-PK')}
          </p>
          {product.stock <= 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 leading-none">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </button>
  );

  // ── Mobile overlay content ──
  if (mobileOverlay) {
    return (
      <div className="fixed inset-0 z-[60] bg-background animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors..."
            className="flex-1 h-10 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => {
              setMobileOverlay(false);
              setOpen(false);
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="overflow-y-auto max-h-[calc(100vh-57px)]">
          {/* Popular searches */}
          {!query.trim() && (
            <div className="px-4 py-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTermClick(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-sm text-foreground hover:bg-surface-alt transition-colors"
                  >
                    <TrendingUp className="h-3 w-3 text-golden" />
                    {term}
                  </button>
                ))}
              </div>

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Recent Searches
                  </h3>
                  <div className="flex flex-col gap-1">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTermClick(term)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-surface transition-colors text-left"
                      >
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {term}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        localStorage.removeItem(RECENT_KEY);
                        setRecentSearches([]);
                      }}
                      className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear recent searches
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-golden animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* No results */}
          {isEmpty && (
            <div className="px-4 py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No results found for &ldquo;{query.trim()}&rdquo;</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try different keywords or check spelling
              </p>
            </div>
          )}

          {/* Results list */}
          {hasResults && (
            <div className="py-2">
              {results.map((product, idx) => (
                <ResultRow key={product.id} product={product} idx={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Navbar variant ──
  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Search input */}
      <div className="relative flex items-center rounded-full h-10 border border-border/60 bg-surface/50 focus-within:border-golden/40 focus-within:bg-white transition-all">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search books, authors... ⌘K"
          className="w-full bg-transparent pl-9 pr-8 h-10 text-sm outline-none placeholder:text-muted-foreground rounded-full"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 mt-2 w-full max-w-sm rounded-xl shadow-elevated border border-border/50 bg-white overflow-hidden z-50 animate-fade-in-up"
        >
          {/* Popular / Recent when no query */}
          {query.trim().length < 2 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTermClick(term)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface text-xs text-foreground hover:bg-surface-alt transition-colors"
                  >
                    <TrendingUp className="h-2.5 w-2.5 text-golden" />
                    {term}
                  </button>
                ))}
              </div>

              {recentSearches.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Recent
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTermClick(term)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors text-left"
                      >
                        <Clock className="h-3 w-3 shrink-0" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-golden animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* No results */}
          {isEmpty && (
            <div className="px-4 py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No results found for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try different keywords or check spelling
              </p>
            </div>
          )}

          {/* Search results */}
          {hasResults && (
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {results.map((product, idx) => (
                <ResultRow key={product.id} product={product} idx={idx} />
              ))}

              {/* Footer: view all results */}
              <button
                onClick={() => {
                  setOpen(false);
                  if (query.trim().length >= 2) {
                    saveRecentSearch(query.trim());
                    setRecentSearches(getRecentSearches());
                  }
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-golden hover:bg-golden/5 border-t border-border/50 transition-colors font-medium"
              >
                <Search className="h-3.5 w-3.5" />
                View all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Small inline book icon for empty image state ───
function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
