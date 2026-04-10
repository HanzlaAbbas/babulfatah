'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Sparkles, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const submitted = useRef(false);

  // Show popup after 20 seconds, only once per session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('newsletter-dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (submitted.current) return;

    // Basic email validation
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
        // Auto close after 4 seconds
        setTimeout(() => {
          setOpen(false);
          sessionStorage.setItem('newsletter-dismissed', 'true');
        }, 4000);
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubscribe();
      }
    },
    [handleSubscribe]
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 mx-4">
        {/* Golden gradient header */}
        <div className="relative bg-gradient-to-br from-golden via-golden to-golden-dark px-5 py-6 sm:px-6 sm:py-8 text-center overflow-hidden">
          {/* Decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-10 bg-[length:60px_60px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Mail className="h-7 w-7 text-golden-foreground" />
            </div>
            <DialogTitle className="text-2xl font-bold text-golden-foreground font-serif">
              Get 10% Off Your First Order!
            </DialogTitle>
          </div>
        </div>

        <div className="px-6 py-6">
          {status === 'success' ? (
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                JazakAllah!
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Check your inbox for your discount code.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader className="text-center mb-4">
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  Subscribe to our newsletter for exclusive deals, new arrivals, and Islamic knowledge.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    onKeyDown={handleKeyDown}
                    className="pl-4 h-10 sm:h-11 border-border/60 focus-visible:border-golden focus-visible:ring-golden/20"
                    disabled={status === 'loading'}
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500">{errorMsg}</p>
                )}

                <Button
                  onClick={handleSubscribe}
                  disabled={status === 'loading'}
                  className="w-full h-10 sm:h-11 bg-golden hover:bg-golden-hover text-golden-foreground font-semibold gap-2 transition-all duration-200"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-golden-foreground/30 border-t-golden-foreground" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Subscribe &amp; Get 10% Off
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground/60">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
