'use client';

import { createPortal } from 'react-dom';

// ─── Salamee Icon ─────────────────────────────────────────────────────────────
// Islamic AI Chatbot icon: Chat bubble with crescent moon + star inside
// Clearly communicates "AI chat assistant" with Islamic branding
// ─────────────────────────────────────────────────────────────────────────────

interface SalameeIconProps {
  className?: string;
  size?: number;
}

export function SalameeIcon({ className = '', size = 24 }: SalameeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Chat bubble body */}
      <path
        d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V14C21 15.6569 19.6569 17 18 17H8L4 20.5V17C3.44772 17 3 16.5523 3 16V6Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Crescent moon inside bubble */}
      <path
        d="M10 6.5C8.8 7.1 8 8.3 8 9.7C8 11.5 9.5 13 11.3 13C12.1 13 12.8 12.7 13.3 12.2C12.3 12.6 11.2 12.5 10.4 11.7C9.5 10.8 9.3 9.5 10 8.5C10.2 7.9 10.5 7.5 11 7.2L10 6.5Z"
        fill="currentColor"
      />
      {/* Small star */}
      <circle cx="14.5" cy="8" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="15.5" cy="10.5" r="0.6" fill="currentColor" opacity="0.5" />
      {/* AI sparkle dots */}
      <circle cx="16" cy="6" r="0.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// ─── Salamee Chat Panel Icon (for header) ─────────────────────────────────────

interface SalameeHeaderIconProps {
  className?: string;
  size?: number;
}

export function SalameeHeaderIcon({ className = '', size = 20 }: SalameeHeaderIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Chat bubble body */}
      <path
        d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V14C21 15.6569 19.6569 17 18 17H8L4 20.5V17C3.44772 17 3 16.5523 3 16V6Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Crescent moon inside bubble */}
      <path
        d="M10 6.5C8.8 7.1 8 8.3 8 9.7C8 11.5 9.5 13 11.3 13C12.1 13 12.8 12.7 13.3 12.2C12.3 12.6 11.2 12.5 10.4 11.7C9.5 10.8 9.3 9.5 10 8.5C10.2 7.9 10.5 7.5 11 7.2L10 6.5Z"
        fill="currentColor"
      />
      {/* Small star */}
      <circle cx="14.5" cy="8" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="15.5" cy="10.5" r="0.6" fill="currentColor" opacity="0.5" />
      {/* AI sparkle dots */}
      <circle cx="16" cy="6" r="0.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// ─── Portal helper ───────────────────────────────────────────────────────────

export function PortalToBody({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
