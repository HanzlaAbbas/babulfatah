'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/use-cart';

// ─── Mobile Sticky Bar ───────────────────────────────────────────────────────
// "The Thumb Zone" — fixed bottom bar for mobile only.
// Shows when cart has items: Cart button (left) + Checkout button (right).
// Hidden on md+ screens.

export function MobileStickyBar() {
  const totalItems = useCart((s) => s.totalItems);
  const totalPrice = useCart((s) => s.totalPrice);
  const finalPrice = useCart((s) => s.finalPrice);
  const openCart = useCart((s) => s.openCart);

  const itemCount = totalItems();
  const price = finalPrice();

  // Don't render if cart is empty
  if (itemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center h-14 px-3 pb-[env(safe-area-inset-bottom)]">
        {/* Left: Cart button with item count + price */}
        <button
          onClick={openCart}
          className="flex items-center gap-2.5 min-h-[44px] min-w-[44px] flex-1 px-3 py-2 rounded-lg active:bg-gray-100 transition-colors duration-150"
          aria-label={`Open cart with ${itemCount} items`}
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#1D333B]/5">
            <ShoppingCart className="h-5 w-5 text-[#1D333B]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[10px] font-bold leading-none text-[#1D333B]">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="text-[13px] font-semibold text-[#1D333B] leading-tight">
              Cart ({itemCount})
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Rs. {price.toLocaleString('en-PK')}
            </p>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" aria-hidden="true" />

        {/* Right: Checkout button */}
        <Link
          href="/checkout"
          className="flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] flex-1 px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#C9A84C] active:bg-[#A88B3A] text-[#1D333B] font-bold text-sm transition-colors duration-150"
        >
          Checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
