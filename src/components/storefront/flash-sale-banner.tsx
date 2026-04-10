'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { X, Phone, Truck, ShieldCheck, Headphones } from 'lucide-react';

// ─── Dismissal Persistence ──────────────────────────────────────────────────

const DISMISS_KEY = 'bf-topbar-dismissed';

function getInitialVisible(): boolean {
  if (typeof window === 'undefined') return true;
  return !sessionStorage.getItem(DISMISS_KEY);
}

// ─── Top Bar ────────────────────────────────────────────────────────────────
// Professional utility announcement bar — Darussalam-inspired.
//
// Design:
//   • #1D333B brand background, ALL text/icons pure white
//   • Marquee ticker scrolling announcements left → right
//   • Dismiss × button on far right
//   • Subtle golden accent line at bottom
//   • No logo (logo lives in navbar)
//
// ────────────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'Welcome to Bab-ul-Fatah — Pakistan\'s Largest Online Islamic Bookstore',
  '📞 +92 326 5903300',
  '🚚 Free Delivery on Orders over Rs. 5,000',
  '✅ 100% Authentic Products',
  '💬 WhatsApp Support Available 24/7',
  '📦 Cash on Delivery Nationwide',
];

export function FlashSaleBanner() {
  const [visible, setVisible] = useState(getInitialVisible);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, 'true');
  }, []);

  if (!visible) return null;

  return (
    <div className="relative w-full">
      <div className="bg-brand relative flex items-center h-9 md:h-10 overflow-hidden">
        {/* ── Marquee Ticker ── */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* Two copies for seamless loop */}
            {[0, 1].map((setIdx) => (
              <span key={setIdx} className="inline-flex items-center">
                {TICKER_ITEMS.map((text, i) => (
                  <span
                    key={`${setIdx}-${i}`}
                    className="inline-flex items-center"
                  >
                    <span className="text-[12px] md:text-[13px] font-medium tracking-wide text-white px-4 md:px-6">
                      {text}
                    </span>
                    {/* Diamond separator between items */}
                    <span className="text-white/30 text-[8px]">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── Dismiss × Button ── */}
        <button
          onClick={handleDismiss}
          className="shrink-0 flex items-center justify-center h-full w-9 md:w-10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          aria-label="Dismiss top bar"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* ── Golden Accent Line (bottom) ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-golden/50 to-transparent" />
      </div>
    </div>
  );
}
