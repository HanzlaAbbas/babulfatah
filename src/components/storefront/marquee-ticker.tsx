'use client';

import { Sparkles } from 'lucide-react';

/**
 * MarqueeTicker — Fast, readable scrolling announcement bar.
 * Brand: #1D333B background, #C9A84C "New" badge.
 */
export function MarqueeTicker() {
  const message =
    'Assalamu Alaikum! Welcome to Bab-ul-Fatah — Pakistan\'s Premier Online Islamic Bookstore • 100% Authentic Islamic Titles • Free Delivery on Orders Above Rs. 5,000 • Cash on Delivery Available Nationwide • Call / WhatsApp: +92 326 5903300 • JazakAllahu Khairan for Shopping with Us!';

  const repeated = Array(6).fill(message).join('    ★    ');

  return (
    <div className="bg-[#1D333B] text-white overflow-hidden relative">
      <div className="flex items-center h-[40px]">
        <div className="shrink-0 bg-[#C9A84C] px-3 sm:px-4 h-full flex items-center gap-1.5 z-10">
          <Sparkles className="h-3 w-3 text-[#1D333B]" />
          <span className="text-[10px] sm:text-[11px] font-bold text-[#1D333B] uppercase tracking-wider">New</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="whitespace-nowrap animate-marquee">
            <span className="text-[13px] font-medium tracking-wide">{repeated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
