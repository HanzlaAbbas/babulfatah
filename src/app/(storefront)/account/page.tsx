import { User, Shield, Package, Heart, Settings, LogIn, UserPlus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account — Bab-ul-Fatah',
  description:
    'Manage your Bab-ul-Fatah account. Track orders, manage wishlist, and update your profile.',
};

// ─── Account Page ────────────────────────────────────────────────────────────
// Clean account gateway page with login/register options.
// Displays account features and quick links.
// ─────────────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ── Header ── */}
      <div className="bg-gradient-to-b from-[#1D333B] to-[#0F1B21] text-white">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border-2 border-[#C9A84C]/30 mb-6">
            <User className="w-10 h-10 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3">
            My Account
          </h1>
          <div className="border-b-2 border-[#C9A84C] w-24 mx-auto mb-4" />
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
            Welcome to Bab-ul-Fatah. Sign in to track your orders, manage your
            wishlist, and get personalized recommendations.
          </p>
        </div>
      </div>

      {/* ── Auth Section ── */}
      <div className="container mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-[#C9A84C] border-b-2 border-[#C9A84C] bg-[#C9A84C]/5">
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium text-muted-foreground hover:text-brand transition-colors">
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {/* Sign In Form */}
          <div className="p-6 md:p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                Remember me
              </label>
              <button className="text-sm text-[#C9A84C] hover:text-[#A88B3A] font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            <button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1D333B] to-[#2A4A55] text-white font-semibold text-sm hover:from-[#243D47] hover:to-[#335464] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
              Sign In
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-muted-foreground">or continue with</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Need help?{' '}
              <a
                href="https://wa.me/+923265903300"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C9A84C] hover:underline font-medium"
              >
                Chat with us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Account Features ── */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h2 className="text-xl md:text-2xl font-bold font-serif text-[#1D333B] text-center mb-3">
          Account Features
        </h2>
        <div className="border-b-2 border-[#C9A84C] w-24 mx-auto mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: Package,
              title: 'Order Tracking',
              desc: 'Track all your orders in real-time',
            },
            {
              icon: Heart,
              title: 'Wishlist',
              desc: 'Save books for later purchase',
            },
            {
              icon: Shield,
              title: 'Secure Checkout',
              desc: 'Safe payments with COD support',
            },
            {
              icon: Settings,
              title: 'Profile',
              desc: 'Manage addresses and preferences',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="text-center p-4 md:p-6 rounded-xl bg-white border border-gray-100 hover:border-[#C9A84C]/20 hover:shadow-md transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C9A84C]/10 mb-3">
                <feature.icon className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1D333B] mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom spacing for mobile bottom nav ── */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
