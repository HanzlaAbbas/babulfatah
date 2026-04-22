'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  ShoppingCart,
  ChevronRight,
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

/** Hardcoded navbar category pills — curated list (7 items) */
const NAV_PILLS = [
  { label: 'All Books', href: '/shop', highlight: false },
  { label: 'Goodword', href: '/search?q=goodword', highlight: true, icon: 'star' as const },
  { label: 'IIPH Women', href: '/shop?category=women', highlight: true, icon: 'book' as const },
  { label: 'Tafseer', href: '/shop?category=tafseer', highlight: false },
  { label: 'Hadith', href: '/shop?category=hadith', highlight: false },
  { label: 'Biography', href: '/shop?category=biography', highlight: false },
  { label: 'KIDS', href: '/shop?category=children', highlight: false },
];

// ─── Navbar Component ─────────────────────────────────────────────────────────
// Premium "Scholar's Library" navbar with:
//   - Sticky solid white header with scroll shadow
//   - Desktop: Logo + Search icon (left) · Account + Wishlist + Cart (right)
//   - Mobile: Menu + Search (left) · Logo (center) · Account + Wishlist + Cart (right)
//   - Hardcoded horizontal category pill nav
//   - Mobile sheet: accordion categories (from API) + static quick links (NO search)
//   - All icon buttons enlarged to h-11 w-11 with 22px icons
// ─────────────────────────────────────────────────────────────────────────────

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  const totalItems = useCart((s) => s.totalItems);
  const cartIsOpen = useCart((s) => s.isOpen);
  const openCart = useCart((s) => s.openCart);
  const closeCart = useCart((s) => s.closeCart);

  // ── Scroll shadow effect ──
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch category tree for mobile sheet accordion only ──
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

  // ── Static quick links (mobile sheet) ──
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'All Books' },
    { href: '/shop?category=goodword-books', label: 'Goodword Books' },
    { href: '/shop?category=iiph', label: 'IIPH Books' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/account', label: 'My Account' },
  ];

  // ── Open full-screen search overlay via Ctrl+K shortcut ──
  const openSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: false,
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

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
        <div className="container mx-auto flex items-center h-16 md:h-[68px] px-3 md:px-6 gap-2">

          {/* ════════════════════════════════════════════════════
              LEFT SIDE: Menu + Search (mobile) / Logo + Search (desktop)
             ════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-1 shrink-0">

            {/* ── Mobile: Hamburger Menu ── */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 text-brand-dark hover:text-brand">
                    <Menu className="h-[22px] w-[22px]" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="px-5 pt-6 pb-4 border-b border-border/50">
                    <SheetTitle className="flex items-center gap-3">
                      <Image
                        src="/logo.png"
                        alt="Bab-ul-Fatah"
                        width={48}
                        height={48}
                        className="h-12 w-auto"
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
                    {/* ── Categories Accordion (NO search here) ── */}
                    {categoryTree.length > 0 && (
                      <div className="px-4 py-3">
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

            {/* ── Search Icon — triggers full-screen search overlay ── */}
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-brand-dark hover:text-brand"
              onClick={openSearch}
              aria-label="Search"
            >
              <Search className="h-[22px] w-[22px]" />
            </Button>

            {/* ── Desktop Logo (left) — enlarged, no rounded ── */}
            <Link href="/" className="shrink-0 hidden lg:block ml-1">
              <Image
                src="/logo.png"
                alt="Bab-ul-Fatah"
                width={56}
                height={56}
                priority
                className="h-14 w-auto"
              />
            </Link>

            {/* ── Mobile Logo (center) — enlarged, no rounded ── */}
            <Link href="/" className="shrink-0 lg:hidden absolute left-1/2 -translate-x-1/2">
              <Image
                src="/logo.png"
                alt="Bab-ul-Fatah"
                width={44}
                height={44}
                priority
                className="h-11 w-auto"
              />
            </Link>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ════════════════════════════════════════════════════
              RIGHT SIDE: Account + Wishlist + Cart
             ════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Account */}
            <Link
              href="/account"
              className="h-11 w-11 flex items-center justify-center text-brand-dark hover:text-brand transition-colors rounded-full hover:bg-muted/50"
              aria-label="Account"
            >
              <User className="h-[22px] w-[22px]" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="h-11 w-11 flex items-center justify-center text-brand-dark hover:text-brand transition-colors rounded-full hover:bg-muted/50"
              aria-label="Wishlist"
            >
              <Heart className="h-[22px] w-[22px]" />
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 text-brand-dark hover:text-brand"
              onClick={() => openCart()}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-[22px] w-[22px]" />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] rounded-full bg-golden text-[10px] font-bold text-golden-foreground flex items-center justify-center px-1">
                  {totalItems()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            CATEGORY NAV — Hardcoded horizontal pill bar
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="border-t border-border/30 bg-white">
          <div className="container mx-auto px-3 md:px-6">
            {/* ── Desktop: static pills ── */}
            <div className="hidden lg:flex items-center h-10 gap-1">
              {NAV_PILLS.map((pill) => (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className={
                    pill.highlight
                      ? 'px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-golden-foreground bg-golden hover:bg-golden-light transition-colors whitespace-nowrap flex items-center gap-1.5'
                      : 'px-3.5 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:text-brand hover:bg-muted/70 transition-colors whitespace-nowrap'
                  }
                >
                  {pill.icon === 'star' && <Star className="h-3 w-3" />}
                  {pill.icon === 'book' && <BookOpen className="h-3 w-3" />}
                  {pill.label}
                </Link>
              ))}
            </div>

            {/* ── Mobile: horizontal scrollable pills ── */}
            <div className="flex lg:hidden items-center h-10 gap-1.5 overflow-x-auto scrollbar-none -mx-3 px-3">
              {NAV_PILLS.map((pill) => (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className={
                    pill.highlight
                      ? 'px-3 py-1.5 rounded-full text-xs font-semibold text-golden-foreground bg-golden hover:bg-golden-light transition-colors whitespace-nowrap shrink-0 flex items-center gap-1'
                      : 'px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-brand hover:bg-muted/70 transition-colors whitespace-nowrap shrink-0'
                  }
                >
                  {pill.icon === 'star' && <Star className="h-2.5 w-2.5" />}
                  {pill.icon === 'book' && <BookOpen className="h-2.5 w-2.5" />}
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hidden SearchBar — provides Ctrl+K overlay handler ── */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <SearchBar variant="mobile" />
      </div>

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
