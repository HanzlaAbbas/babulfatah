'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, BookOpen } from 'lucide-react';

interface SocialProofItem {
  name: string;
  city: string;
  product: string;
}

const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Multan',
  'Faisalabad',
  'Quetta',
];

const PRODUCTS = [
  { title: 'Sahih Al-Bukhari', icon: 'book' },
  { title: 'Tafheem ul Quran', icon: 'book' },
  { title: 'Riyadus Saliheen', icon: 'book' },
  { title: 'Ar-Raheeq Al-Makhtum', icon: 'book' },
  { title: 'Noble Quran (Medium)', icon: 'book' },
  { title: 'Stories of the Prophets', icon: 'book' },
  { title: 'Tafsir Ibn Kathir', icon: 'book' },
  { title: 'Islamic Studies Grade 1', icon: 'book' },
  { title: 'Fortress of the Muslim', icon: 'book' },
  { title: 'Prayer Mat (Premium)', icon: 'bag' },
  { title: 'Tajweed Quran Color Coded', icon: 'book' },
  { title: 'Bismillah Wall Art', icon: 'bag' },
];

const NAMES = [
  'Ahmed',
  'Fatima',
  'Omar',
  'Aisha',
  'Hassan',
  'Zainab',
  'Ali',
  'Maryam',
  'Usman',
  'Khadija',
  'Bilal',
  'Hafsa',
  'Ibrahim',
  'Sumaira',
  'Hamza',
  'Noor',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInterval(): number {
  // 15–25 seconds in ms
  return (15 + Math.random() * 10) * 1000;
}

export function SocialProofToast() {
  const [toast, setToast] = useState<SocialProofItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shownCountRef = useRef(0);
  const lastShownIndexRef = useRef(-1);

  const showNewToast = useCallback(() => {
    // Pick a random product, avoid showing the same one twice in a row
    let productIndex: number;
    do {
      productIndex = Math.floor(Math.random() * PRODUCTS.length);
    } while (productIndex === lastShownIndexRef.current && PRODUCTS.length > 1);
    lastShownIndexRef.current = productIndex;

    const product = PRODUCTS[productIndex];
    const name = getRandomItem(NAMES);
    const city = getRandomItem(CITIES);

    setToast({ name, city, product: product.title });

    // Trigger slide-in animation
    setAnimating(true);
    setVisible(true);

    // Hide after 4 seconds
    hideTimerRef.current = setTimeout(() => {
      setAnimating(false);
      // Wait for slide-out animation to finish
      setTimeout(() => {
        setVisible(false);
        setToast(null);
      }, 400);
    }, 4000);

    shownCountRef.current++;
  }, []);

  const dismissToast = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setAnimating(false);
    setTimeout(() => {
      setVisible(false);
      setToast(null);
    }, 400);
  }, []);

  // Show first toast after 8 seconds
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showNewToast();
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, [showNewToast]);

  // Schedule next toast after current one hides
  useEffect(() => {
    if (!visible && shownCountRef.current > 0) {
      const nextInterval = getRandomInterval();
      timerRef.current = setTimeout(showNewToast, nextInterval);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, showNewToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible || !toast) return null;

  return (
    <div className="fixed bottom-24 right-3 sm:bottom-20 sm:right-5 z-40">
      <div className={animating ? 'toast-enter' : 'toast-exit'}>
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-elevated border border-border/30 p-3.5 max-w-[260px] sm:max-w-xs">
          {/* Product icon */}
          <div className="shrink-0 h-11 w-11 rounded-lg bg-gradient-to-br from-brand/10 to-golden/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-brand" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">
              <span className="text-brand">{toast.name}</span>
              {' '}from{' '}
              <span className="text-brand">{toast.city}</span>
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              just purchased &apos;{toast.product}&apos;
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Just now</p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={dismissToast}
            className="shrink-0 h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
