'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook that uses IntersectionObserver to add CSS classes
 * when elements with [data-animate] enter the viewport.
 * Powers scroll-triggered fade-in/slide-in animations (darussalam.pk style).
 *
 * Safety: If JS is slow or observer misses elements, a 1.5s timeout
 * force-adds `is-visible` to all observed children so nothing stays hidden.
 */
export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll('[data-animate]');
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    // Observe all children with [data-animate] attribute
    targets.forEach((child) => {
      observer.observe(child);
    });

    // ── Safety fallback: force-show everything after 1.5s ──
    // Prevents elements from staying invisible if observer fails
    const fallbackTimer = setTimeout(() => {
      targets.forEach((child) => {
        if (!child.classList.contains('is-visible')) {
          child.classList.add('is-visible');
        }
      });
    }, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return ref;
}
