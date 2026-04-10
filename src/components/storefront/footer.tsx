'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ─── Footer Data ─────────────────────────────────────────────────────────────

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop All' },
  { href: '/wishlist', label: 'My Wishlist' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/shop?sort=best-selling', label: 'Best Sellers' },
  { href: '/shop?sort=newest', label: 'New Arrivals' },
];

const categories = [
  { href: '/shop?category=quran', label: 'Quran & Hadith' },
  { href: '/shop?category=tafseer', label: 'Tafseer' },
  { href: '/shop?category=biography', label: 'Biography' },
  { href: '/shop?category=children', label: 'Children' },
  { href: '/shop?category=prayers', label: 'Prayers' },
  { href: '/shop?category=hajj-umrah', label: 'Hajj & Umrah' },
  { href: '/shop?category=islamic-products', label: 'Islamic Products' },
  { href: '/shop?category=healthy-foods', label: 'Healthy Foods' },
];

const customerService = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/shop?sort=newest', label: 'New Arrivals' },
  { href: '/contact', label: 'FAQs' },
];

const socialLinks = [
  {
    href: 'https://www.facebook.com/babulfatahshop',
    label: 'Facebook',
    icon: Facebook,
  },
  {
    href: 'https://www.instagram.com/babulfatahshop/',
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: 'https://www.youtube.com/channel/UCCdG9wRX9_2FvseQu59e4vQ',
    label: 'YouTube',
    icon: Youtube,
  },
  {
    href: 'https://x.com/babulfatahshop',
    label: 'Twitter/X',
    icon: Twitter,
  },
];

// ─── Collapsible Section ─────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/15 lg:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left group lg:cursor-default lg:py-0"
        aria-expanded={isOpen}
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider text-golden">
          {title}
        </h4>
        <ChevronDown
          className={`h-4 w-4 text-white transition-transform duration-300 lg:hidden ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:!max-h-none lg:!opacity-100 ${
          isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Footer Component ────────────────────────────────────────────────────────

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/storefront/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription failed. Please try again.');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  return (
    <footer className="bg-brand">
      {/* ── Top golden accent line ── */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-golden/60 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 lg:gap-8">
          {/* ── Column 1: Brand with Logo ── */}
          <div className="pb-6 lg:pb-0 lg:col-span-2">
            <div className="mb-4">
              <Link href="/" className="inline-block mb-3">
                <Image
                  src="/logo.png"
                  alt="Bab-ul-Fatah - Pakistan's Largest Online Islamic Bookstore"
                  width={160}
                  height={40}
                  className="h-10 w-auto rounded brightness-0 invert"
                />
              </Link>
              <div className="h-0.5 w-12 bg-golden mt-2 rounded-full" />
            </div>

            <p className="text-white text-sm leading-relaxed mb-5 max-w-xs opacity-90">
              Pakistan&apos;s most trusted online Islamic bookstore. Authentic books, Quran, Hadith, Tafseer, Seerah, and more — delivered nationwide.
            </p>

            {/* Social Icons — WHITE */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-golden/25 flex items-center justify-center text-white hover:text-golden transition-all duration-200"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* ── Newsletter ── */}
            <div className="mt-6 lg:mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-golden mb-3">
                Subscribe to Newsletter
              </h4>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2 max-w-xs"
              >
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="h-10 min-w-0 bg-white/10 border-white/15 text-white placeholder:text-white/45 text-sm rounded-lg focus:border-golden/40 focus:ring-golden/20"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={status === 'loading'}
                  className="h-10 px-4 bg-golden hover:bg-golden-hover text-golden-foreground rounded-lg shrink-0 transition-all disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              {message && (
                <p className={`text-[11px] mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <CollapsibleSection title="Quick Links" defaultOpen={false}>
              <nav className="flex flex-col gap-0">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white hover:text-golden transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </CollapsibleSection>
          </div>

          {/* ── Column 3: Categories ── */}
          <div>
            <CollapsibleSection title="Categories" defaultOpen={false}>
              <nav className="flex flex-col gap-0">
                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className="text-sm text-white hover:text-golden transition-colors py-1"
                  >
                    {cat.label}
                  </Link>
                ))}
              </nav>
            </CollapsibleSection>
          </div>

          {/* ── Column 4: Contact & Customer Service ── */}
          <div>
            <CollapsibleSection title="Contact Us" defaultOpen={false}>
              <div className="flex flex-col gap-2.5">
                <a
                  href="tel:+923265903300"
                  className="flex items-center gap-2.5 text-sm text-white hover:text-golden transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-white shrink-0" />
                  <span>+92 326 5903300</span>
                </a>
                <a
                  href="https://wa.me/+923265903300"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-white hover:text-golden transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-white shrink-0" />
                  <span>WhatsApp Chat</span>
                </a>
                <a
                  href="mailto:support@babulfatah.com"
                  className="flex items-center gap-2.5 text-sm text-white hover:text-golden transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-white shrink-0" />
                  <span>support@babulfatah.com</span>
                </a>
                <div className="flex items-start gap-2.5 text-sm text-white">
                  <MapPin className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
                  <span>Nokhar, Punjab, Pakistan</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/15">
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-white mb-2.5">
                  Customer Service
                </h5>
                <nav className="flex flex-col gap-0">
                  {customerService.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-white hover:text-golden transition-colors py-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/15">
        <div className="container mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white opacity-75">
            <div className="flex items-center gap-2">
              <p>&copy; {new Date().getFullYear()} Bab-ul-Fatah. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/privacy-policy"
                className="hover:text-golden transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="opacity-40">|</span>
              <Link
                href="/terms-of-service"
                className="hover:text-golden transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-center sm:text-right">
              Cash on Delivery &bull; JazzCash &bull; EasyPaisa &bull; Bank Transfer
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
