'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Sparkles, CheckCircle, Copy, X } from 'lucide-react';

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [copied, setCopied] = useState(false);
  const submitted = useRef(false);

  // Show popup after 15 seconds, only once per session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('newsletter-dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (submitted.current) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/storefront/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        submitted.current = true;

        if (data.couponCode) {
          setCouponCode(data.couponCode);
        }

        // Auto close after 8 seconds (more time to copy coupon)
        setTimeout(() => {
          setOpen(false);
          sessionStorage.setItem('newsletter-dismissed', 'true');
        }, 8000);
      } else {
        setErrorMsg(data.message || 'Something went wrong');
        setStatus('idle');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('idle');
    }
  }, [email]);

  const handleClose = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem('newsletter-dismissed', 'true');
  }, []);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = couponCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [couponCode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubscribe();
    },
    [handleSubscribe]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup card — centered on all screens */}
      <div
        className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          animation: 'fadeInUp 0.3s ease-out',
        }}
      >
        {/* Close button — always visible, easy to tap on mobile */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {status === 'success' && couponCode ? (
          /* ── Success State: Show coupon code ── */
          <div className="px-5 pt-8 pb-6 text-center">
            {/* Green checkmark */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>

            <h2 className="text-xl font-bold text-foreground font-serif mb-1">
              JazakAllah Khair!
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Here&apos;s your exclusive discount code
            </p>

            {/* Coupon code box */}
            <div className="bg-brand rounded-xl p-4 mb-4 relative overflow-hidden">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-5 bg-[length:20px_20px]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              <div className="relative">
                <p className="text-[11px] text-white/60 uppercase tracking-wider font-medium mb-1">
                  Your 10% Discount Code
                </p>
                <p className="text-2xl font-bold font-mono text-golden tracking-[0.15em]">
                  {couponCode}
                </p>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyCode}
              className="w-full h-11 rounded-xl bg-golden hover:bg-golden-light text-golden-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </button>

            <p className="text-[11px] text-muted-foreground/60 mt-3">
              Apply this code at checkout for 10% off your first order
            </p>
          </div>
        ) : (
          /* ── Subscribe Form ── */
          <>
            {/* Golden header */}
            <div className="relative bg-gradient-to-br from-golden via-golden to-golden-dark px-5 py-7 text-center overflow-hidden">
              {/* Decorative pattern */}
              <div
                className="absolute inset-0 opacity-10 bg-[length:60px_60px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative z-10">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Mail className="h-6 w-6 text-golden-foreground" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-golden-foreground font-serif leading-tight">
                  Get 10% Off
                </h2>
                <p className="text-sm text-golden-foreground/80 mt-1">
                  Your first order
                </p>
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-center">
                Subscribe for exclusive deals, new arrivals &amp; Islamic knowledge.
              </p>

              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full h-11 px-4 rounded-xl border border-border/60 bg-surface text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-golden focus:ring-2 focus:ring-golden/15 transition-all"
                  disabled={status === 'loading'}
                  autoComplete="email"
                />

                {errorMsg && (
                  <p className="text-xs text-red-500">{errorMsg}</p>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={status === 'loading'}
                  className="w-full h-11 rounded-xl bg-golden hover:bg-golden-light text-golden-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-golden-foreground/30 border-t-golden-foreground" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Get My 10% Off Code
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-muted-foreground/50">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
