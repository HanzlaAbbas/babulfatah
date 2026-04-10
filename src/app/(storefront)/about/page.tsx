import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  ShieldCheck,
  Truck,
  MessageCircle,
  PackageCheck,
  ChevronRight,
  Sparkles,
  Quote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ─── JSON-LD Organization Schema ─────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bab-ul-Fatah',
  url: 'https://www.babulfatah.com',
  logo: 'https://www.babulfatah.com/logo.png',
  description:
    'Your trusted destination for authentic Islamic books, Quran, Hadith, Tafseer, and Islamic products. Serving the Ummah with premium quality products.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nokhar',
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+92-326-5903300',
    contactType: 'customer service',
    availableLanguage: ['English', 'Urdu'],
  },
  sameAs: [
    'https://www.facebook.com/babulfatahshop',
    'https://www.instagram.com/babulfatahshop/',
    'https://www.youtube.com/channel/UCCdG9wRX9_2FvseQu59e4vQ',
    'https://x.com/babulfatahshop',
  ],
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'About Us | Bab-ul-Fatah',
  description:
    'Learn about Bab-ul-Fatah — your trusted source for authentic Islamic books, Quran translations, Hadith collections, Tafseer, and more. Serving the Ummah from Nokhar, Punjab, Pakistan.',
  openGraph: {
    title: 'About Us | Bab-ul-Fatah',
    description:
      'Your trusted destination for authentic Islamic books and literature.',
    url: 'https://www.babulfatah.com/about',
    siteName: 'Bab-ul-Fatah',
    type: 'website',
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const missionCards = [
  {
    icon: BookOpen,
    title: 'Authentic Knowledge',
    description:
      'Every book in our catalog is sourced from trusted, renowned publishers. We verify content authenticity so you can shop with complete confidence.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description:
      'From art-paper editions to durable bindings, we stock only the finest publications. Quality is not optional — it is our standard.',
  },
  {
    icon: ShieldCheck,
    title: 'Customer Trust',
    description:
      'Thousands of families, scholars, and students across Pakistan trust Bab-ul-Fatah for reliable service, honest pricing, and fast delivery.',
  },
];

const whatWeOffer = [
  { icon: BookOpen, label: 'Quran', desc: 'Translations, Tajweed, Tafseer & Mushaf editions in Arabic, Urdu & English' },
  { icon: Award, label: 'Hadith', desc: 'Sahih Bukhari, Muslim, Tirmidhi, Abu Dawud and all six authentic collections' },
  { icon: BookOpen, label: 'Tafseer', desc: 'Ibn Kathir, Tafheem ul Quran, Ahsan al Bayan and renowned exegeses' },
  { icon: Sparkles, label: 'Seerah', desc: 'Prophet Muhammad (PBUH), companion stories and scholarly biographies' },
  { icon: ShieldCheck, label: "Children's Books", desc: 'Islamic studies, Quran stories, moral education and activity books' },
  { icon: PackageCheck, label: 'Islamic Products', desc: 'Tasbeeh, calligraphy, Quran rehals, prayer mats and home décor' },
];

const trustSignals = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'On orders above Rs. 3,000 across Pakistan with trusted courier services.',
  },
  {
    icon: PackageCheck,
    title: 'Cash on Delivery',
    description: 'Pay when you receive. COD available on all orders nationwide.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    description: 'Get instant help via WhatsApp for orders, recommendations and queries.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentic Products',
    description: 'Every item sourced from verified, reputable Islamic publishers.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Banner ── */}
      <section className="bg-brand-dark py-16 md:py-24 text-center relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 left-8 w-32 h-32 border border-golden/30 rotate-45" />
          <div className="absolute bottom-8 right-8 w-48 h-48 border border-golden/30 rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-golden/20 rounded-full" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">
            About Bab-ul-Fatah
          </h1>
          <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4 mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Pakistan&apos;s trusted Islamic bookstore — bringing authentic knowledge to every home since our founding.
          </p>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div className="container mx-auto px-4 md:px-6 pt-6">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>About Us</span>
        </nav>
      </div>

      {/* ── Our Story Section ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Our Story
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From a small bookshop to one of Pakistan&apos;s most trusted Islamic bookstores.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-surface-alt border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-muted-foreground overflow-hidden">
                <div className="h-16 w-16 rounded-full bg-brand/5 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-brand" />
                </div>
                <p className="text-sm">Our Bookstore</p>
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-golden/10 rounded-2xl -z-10" />
            </div>

            {/* Story Text */}
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Bab-ul-Fatah was founded with a singular vision — to make authentic Islamic literature accessible to everyone, from scholars and students to families and young learners. Based in Nokhar, Punjab, Pakistan, we started as a small bookshop with a passion for spreading the light of knowledge.
              </p>
              <p>
                Over time, our commitment to quality and authenticity earned the trust of thousands of customers across Pakistan. Today, Bab-ul-Fatah has grown into one of the most comprehensive online Islamic bookstores, offering over 1,200 carefully curated titles spanning Quran, Hadith, Tafseer, Fiqh, Seerah, children&apos;s literature, and Islamic lifestyle products.
              </p>
              <p>
                Every product in our catalog is hand-selected to ensure it meets the highest standards of scholarship and publication quality. We work with renowned publishers including Darussalam, Daar Ul Noor, and many others to bring you the most authentic and respected works in Islamic literature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission Section ── */}
      <section className="py-10 md:py-14 bg-surface">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Our Mission
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Three pillars that guide everything we do at Bab-ul-Fatah.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {missionCards.map((card) => (
              <Card
                key={card.title}
                className="text-center border-0 shadow-premium hover:shadow-elevated transition-all duration-300 bg-background"
              >
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-golden/10 text-golden-dark mx-auto mb-5">
                    <card.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Section ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-10 w-10 text-golden/40 mx-auto mb-4" />
            <blockquote className="text-xl md:text-2xl text-foreground font-serif italic leading-relaxed mb-4">
              &ldquo;Whoever treads a path in search of knowledge, Allah will make easy for him the path to Paradise.&rdquo;
            </blockquote>
            <cite className="text-sm text-muted-foreground not-italic">
              — Sahih Muslim, 2699
            </cite>
          </div>
        </div>
      </section>

      {/* ── What We Offer Section ── */}
      <section className="py-10 md:py-14 bg-surface">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              What We Offer
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              A comprehensive collection of Islamic books and products, carefully curated for scholars, students, and families.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatWeOffer.map((item) => (
              <div
                key={item.label}
                className="group p-5 rounded-xl bg-background border border-border/60 hover:border-golden/40 hover:shadow-premium transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand/5 text-brand group-hover:bg-golden/10 group-hover:text-golden-dark transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.label}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us Section ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Why Choose Us
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Here is what sets us apart and keeps thousands of customers coming back.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustSignals.map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-xl bg-surface hover:shadow-premium transition-all duration-300"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-golden/10 text-golden-dark mx-auto mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-14 md:py-20 bg-brand-dark text-white text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif">
            Ready to Explore Our Collection?
          </h2>
          <div className="w-12 h-1 bg-golden rounded-full mx-auto mb-6" />
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Browse over 1,200 authentic Islamic books and products — from Quran and Hadith to children&apos;s stories and Islamic lifestyle items.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-medium px-8 py-3.5 rounded-lg transition-colors shadow-golden"
          >
            Browse All Books
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
