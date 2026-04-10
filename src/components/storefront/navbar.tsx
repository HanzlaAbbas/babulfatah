'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  BookOpen,
  User,
  Search,
  Star,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import { CartSheet } from '@/components/storefront/cart-sheet';
import { SearchBar } from '@/components/storefront/search-bar';
import { useCart } from '@/store/use-cart';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryNode[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Max top-level categories to show as pills before "More ▾" on desktop */
const MAX_VISIBLE_CATEGORIES = 7;

// ─── Navbar Component ─────────────────────────────────────────────────────────
// Premium "Scholar's Library" navbar with:
//   - Glass-effect sticky header with scroll shadow
//   - Desktop: Logo (left) + Search (center) + Cart+User (right)
//   - Horizontal category pill nav with "More ▾" mega-menu
//   - Mobile: Hamburger (left) + Logo (center) + Cart (right)
//   - Mobile sheet: accordion categories + static quick links
// ─────────────────────────────────────────────────────────────────────────────

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = useCart((s) => s.totalItems);
  const cartIsOpen = useCart((s) => s.isOpen);
  const openCart = useCart((s) => s.openCart);
  const closeCart = useCart((s) => s.closeCart);

  // ── Scroll shadow effect ──
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll(); // initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch category tree on mount ──
  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const res = await fetch('/api/storefront/categories');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCategoryTree(data.tree || []);
        }
      } catch {
        // Silent fail — navbar works without categories
      }
    }

    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  // ── "More" dropdown hover handlers ──
  const handleMoreEnter = useCallback(() => {
    if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
    setMoreOpen(true);
  }, []);

  const handleMoreLeave = useCallback(() => {
    moreTimeoutRef.current = setTimeout(() => setMoreOpen(false), 200);
  }, []);

  // ── Dismiss "More" on click outside ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Derived: visible vs overflow categories ──
  const visibleCategories = categoryTree.slice(0, MAX_VISIBLE_CATEGORIES);
  const overflowCategories = categoryTree.slice(MAX_VISIBLE_CATEGORIES);

  // ── Static quick links (mobile sheet) ──
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'All Books' },
    { href: '/shop?category=goodword-books', label: '⭐ Goodword Books' },
    { href: '/shop?category=iiph', label: '📚 IIPH Books' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════════
          HEADER — Sticky solid white bar
          ════════════════════════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white ${
          scrolled
            ? 'shadow-[0_1px_3px_rgba(29,51,59,0.08),0_4px_16px_rgba(29,51,59,0.06)]'
            : 'border-b border-border/50'
        }`}
      >
        {/* ── Main Row ── */}
        <div className="container mx-auto flex items-center h-14 md:h-[60px] px-4 md:px-6 gap-4">
          {/* ── Mobile: Hamburger (left) ── */}
          <div className="flex items-center lg:hidden shrink-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="px-5 pt-6 pb-4 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-3">
                    <Image
                      src="/logo.svg"
                      alt="Bab-ul-Fatah"
                      width={32}
                      height={32}
                      className="h-8 w-auto rounded"
                    />
                    <div>
                      <span className="text-base font-bold text-brand tracking-tight block leading-tight">
                        Bab-ul-Fatah
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        Islamic Bookstore
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {/* ── Mobile Search ── */}
                  <div className="px-4 py-3">
                    <SearchBar variant="mobile" />
                  </div>

                  {/* ── Categories Accordion ── */}
                  {categoryTree.length > 0 && (
                    <div className="px-4 pb-3">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-golden-dark mb-2 px-1">
                        Categories
                      </h4>
                      <MobileCategoryAccordion
                        categories={categoryTree}
                        onClose={() => setMobileOpen(false)}
                      />
                    </div>
                  )}

                  {/* ── Quick Links ── */}
                  <div className="border-t border-border/40 px-4 pt-3 pb-6">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                      Quick Links
                    </h4>
                    <nav className="flex flex-col gap-0.5">
                      {quickLinks.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-brand transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* ── Logo (desktop: left, mobile: center) ── */}
          <Link
            href="/"
            className="shrink-0 hidden lg:block"
          >
            <Image
              src="/logo.svg"
              alt="Bab-ul-Fatah"
              width={36}
              height={36}
              priority
              className="h-9 w-auto rounded"
            />
          </Link>

          {/* Mobile center logo */}
          <Link href="/" className="shrink-0 lg:hidden absolute left-1/2 -translate-x-1/2">
            <Image
              src="/logo.svg"
              alt="Bab-ul-Fatah"
              width={32}
              height={32}
              priority
              className="h-8 w-auto rounded"
            />
          </Link>

          {/* ── Desktop: Center Search Bar ── */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="w-full max-w-md">
              <SearchBar variant="navbar" />
            </div>
          </div>

          {/* ── Desktop: Right Actions ── */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {/* User / Account */}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-brand">
              <User className="h-[18px] w-[18px]" />
              <span className="sr-only">Account</span>
            </Button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors"
            >
              <Heart className="h-[18px] w-[18px]" />
              <span className="sr-only">Wishlist</span>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-brand"
              onClick={() => openCart()}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-golden text-[10px] font-bold text-golden-foreground flex items-center justify-center px-1">
                  {totalItems()}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </div>

          {/* ── Mobile: Cart (right) ── */}
          <div className="flex items-center gap-1 lg:hidden shrink-0 ml-auto">
            {/* Mobile Wishlist */}
            <Link
              href="/wishlist"
              className="relative h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors"
            >
              <Heart className="h-[18px] w-[18px]" />
              <span className="sr-only">Wishlist</span>
            </Link>
            {/* Mobile search trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => {
                // Open mobile search by dispatching ⌘K-like event logic
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: false,
                  ctrlKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            >
              <Search className="h-[18px] w-[18px]" />
              <span className="sr-only">Search</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-brand"
              onClick={() => openCart()}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-golden text-[10px] font-bold text-golden-foreground flex items-center justify-center px-1">
                  {totalItems()}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            CATEGORY NAV — Horizontal pill bar
            ══════════════════════════════════════════════════════════════════════ */}
        {categoryTree.length > 0 && (
          <div className="border-t border-border/30 bg-white">
            <div className="container mx-auto px-4 md:px-6">
              {/* ── Desktop: pills + More dropdown ── */}
              <div className="hidden lg:flex items-center h-10 gap-1">
                {/* "All Books" pill */}
                <Link
                  href="/shop"
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-brand bg-brand/5 hover:bg-brand/10 transition-colors whitespace-nowrap"
                >
                  All Books
                </Link>

                {/* Goodword Books — highlighted publisher pill */}
                <Link
                  href="/shop?category=goodword-books"
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-golden-foreground bg-golden hover:bg-golden-light transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <Star className="h-3 w-3" />
                  Goodword
                </Link>

                {/* IIPH Books — highlighted publisher pill */}
                <Link
                  href="/shop?category=iiph"
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-golden-foreground bg-golden hover:bg-golden-light transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <BookOpen className="h-3 w-3" />
                  IIPH
                </Link>

                {/* Visible category pills */}
                {visibleCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:text-brand hover:bg-muted/70 transition-colors whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}

                {/* "More ▾" dropdown */}
                {overflowCategories.length > 0 && (
                  <div
                    ref={moreMenuRef}
                    className="relative"
                    onMouseEnter={handleMoreEnter}
                    onMouseLeave={handleMoreLeave}
                  >
                    <button
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:text-brand hover:bg-muted/70 transition-colors whitespace-nowrap"
                      onClick={() => setMoreOpen((prev) => !prev)}
                    >
                      More
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          moreOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* ── Dropdown Panel ── */}
                    {moreOpen && (
                      <div
                        className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-border/60 rounded-xl shadow-elevated overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150"
                        onMouseEnter={handleMoreEnter}
                        onMouseLeave={handleMoreLeave}
                      >
                        {/* Golden accent line */}
                        <div className="h-0.5 bg-gradient-to-r from-golden via-golden-light to-golden" />

                        <div className="py-2 max-h-80 overflow-y-auto scrollbar-thin">
                          {overflowCategories.map((cat) => (
                            <div key={cat.id}>
                              <Link
                                href={`/shop?category=${cat.slug}`}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 hover:text-brand transition-colors"
                                onClick={() => setMoreOpen(false)}
                              >
                                <span className="w-1 h-1 rounded-full bg-golden/60 shrink-0" />
                                {cat.name}
                                {cat.children && cat.children.length > 0 && (
                                  <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/40" />
                                )}
                              </Link>

                              {/* Sub-categories inline */}
                              {cat.children && cat.children.length > 0 && (
                                <div className="ml-5 border-l border-border/40 pl-3 pb-1">
                                  {cat.children.slice(0, 5).map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/shop?category=${sub.slug}`}
                                      className="flex items-center gap-2 py-1.5 pr-4 text-[13px] text-muted-foreground hover:text-brand transition-colors"
                                      onClick={() => setMoreOpen(false)}
                                    >
                                      <span className="w-0.5 h-0.5 rounded-full bg-golden/40 shrink-0" />
                                      {sub.name}
                                    </Link>
                                  ))}
                                  {cat.children.length > 5 && (
                                    <Link
                                      href={`/shop?category=${cat.slug}`}
                                      className="flex items-center gap-1.5 py-1.5 pr-4 text-[13px] text-golden-dark hover:text-golden font-medium transition-colors"
                                      onClick={() => setMoreOpen(false)}
                                    >
                                      View all {cat.children.length} subcategories →
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Footer: All categories link */}
                          <div className="border-t border-border/40 mt-2 pt-2">
                            <Link
                              href="/shop"
                              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-golden-dark hover:text-golden hover:bg-golden/5 transition-colors"
                              onClick={() => setMoreOpen(false)}
                            >
                              <BookOpen className="h-4 w-4" />
                              Browse All Categories
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Mobile: horizontal scrollable pills ── */}
              <div className="flex lg:hidden items-center h-10 gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4">
                <Link
                  href="/shop"
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-brand bg-brand/5 hover:bg-brand/10 transition-colors whitespace-nowrap shrink-0"
                >
                  All Books
                </Link>
                {/* Goodword Books — highlighted publisher pill (mobile) */}
                <Link
                  href="/shop?category=goodword-books"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-golden-foreground bg-golden hover:bg-golden-light transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <Star className="h-2.5 w-2.5" />
                  Goodword
                </Link>
                {/* IIPH Books — highlighted publisher pill (mobile) */}
                <Link
                  href="/shop?category=iiph"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-golden-foreground bg-golden hover:bg-golden-light transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <BookOpen className="h-2.5 w-2.5" />
                  IIPH
                </Link>
                {categoryTree.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-brand hover:bg-muted/70 transition-colors whitespace-nowrap shrink-0"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Cart Sheet ── */}
      <CartSheet
        open={cartIsOpen}
        onOpenChange={(open) => {
          if (!open) closeCart();
          else openCart();
        }}
      />
    </>
  );
}

// ─── Mobile Category Accordion ─────────────────────────────────────────────────
// Renders nested category tree as a collapsible accordion for the mobile
// sheet menu. Each level indented with golden accent styling.
// ─────────────────────────────────────────────────────────────────────────────

function MobileCategoryAccordion({
  categories,
  onClose,
  depth = 0,
}: {
  categories: CategoryNode[];
  onClose: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col">
      {categories.map((cat) => {
        const isExpanded = expanded[cat.id];
        const hasChildren = cat.children && cat.children.length > 0;

        return (
          <div key={cat.id}>
            <Link
              href={hasChildren ? '#' : `/shop?category=${cat.slug}`}
              onClick={(e) => {
                if (hasChildren) {
                  e.preventDefault();
                  toggleExpand(cat.id);
                } else {
                  onClose();
                }
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                depth > 0 ? 'ml-3' : ''
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  depth === 0
                    ? 'bg-golden'
                    : 'bg-golden/50'
                }`}
              />
              <span
                className={`flex-1 text-left ${
                  depth === 0
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {cat.name}
              </span>
              {hasChildren && (
                <ChevronRight
                  className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              )}
            </Link>

            {/* Collapsible Children */}
            {hasChildren && isExpanded && (
              <div className="ml-3 border-l border-golden/15 pl-2 py-0.5 animate-fade-in">
                <MobileCategoryAccordion
                  categories={cat.children}
                  onClose={onClose}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
