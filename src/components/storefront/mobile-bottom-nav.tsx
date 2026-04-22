'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, User, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/use-cart';

// ─── Mobile Bottom Navigation ────────────────────────────────────────────────
// Fixed bottom navigation bar (mobile only).
// 5 tabs: Home, Search, Account, Cart, Wishlist
// Always visible — sits above WhatsApp (left) and AI (right) float buttons.
// ─────────────────────────────────────────────────────────────────────────────

interface NavTab {
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  matchPaths?: string[];
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  const tabs: NavTab[] = [
    {
      label: 'Home',
      icon: Home,
      href: '/',
      matchPaths: ['/'],
    },
    {
      label: 'Search',
      icon: Search,
      action: () => {
        // Trigger the full-screen search overlay via Ctrl+K
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: false,
          ctrlKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      },
    },
    {
      label: 'Account',
      icon: User,
      href: '/account',
      matchPaths: ['/account'],
    },
    {
      label: 'Cart',
      icon: ShoppingCart,
      action: openCart,
    },
    {
      label: 'Wishlist',
      icon: Heart,
      href: '/wishlist',
      matchPaths: ['/wishlist'],
    },
  ];

  function isActive(tab: NavTab): boolean {
    if (!tab.matchPaths) return false;
    if (tab.matchPaths.includes('/')) {
      return pathname === '/';
    }
    return tab.matchPaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ height: 'calc(60px + env(safe-area-inset-bottom))' }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="mx-auto flex h-[60px] max-w-screen-xl items-center justify-around px-1">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;

          const content = (
            <>
              <div className="relative flex items-center justify-center">
                <Icon
                  className="transition-colors duration-200"
                  size={22}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {tab.label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[10px] font-bold leading-none text-[#1D333B]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight transition-colors duration-200 font-medium">
                {tab.label}
              </span>
              {active && (
                <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#C9A84C] transition-all duration-200" />
              )}
            </>
          );

          if (tab.href) {
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors duration-200 min-h-[44px] min-w-[44px] ${
                  active
                    ? 'text-[#C9A84C]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <Button
              key={tab.label}
              variant="ghost"
              size="sm"
              onClick={tab.action}
              className={`relative h-auto flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors duration-200 min-h-[44px] min-w-[44px] ${
                active
                  ? 'text-[#C9A84C] hover:bg-transparent hover:text-[#C9A84C]'
                  : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
              }`}
              aria-label={tab.label}
            >
              {content}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
