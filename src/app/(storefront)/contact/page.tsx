import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react';
import { ContactForm } from '@/components/storefront/contact-form';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Contact Us | Bab-ul-Fatah',
  description:
    'Get in touch with Bab-ul-Fatah. Call, WhatsApp, or email us. Find our address, business hours, and answers to frequently asked questions about orders and shipping.',
  openGraph: {
    title: 'Contact Us | Bab-ul-Fatah',
    description:
      'Reach out to Bab-ul-Fatah for questions about orders, shipping, or products.',
    url: 'https://www.babulfatah.com/contact',
    siteName: 'Bab-ul-Fatah',
    type: 'website',
  },
};

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: 'How can I place an order?',
    answer:
      'You can place an order directly on our website by adding items to your cart and proceeding to checkout. Alternatively, you can place your order via WhatsApp at +92 326 5903300. We accept Cash on Delivery (COD) for all orders across Pakistan.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We currently offer Cash on Delivery (COD) for all orders across Pakistan. You pay when your order arrives at your doorstep — no advance payment required. We are working on adding online payment options in the near future.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Most orders are dispatched within 24 hours. Delivery typically takes 3-5 business days for major cities and 5-7 business days for remote areas. We use trusted courier services including TCS, Leopards, and others to ensure safe and timely delivery.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Currently, we ship within Pakistan only. For international orders, please contact us via WhatsApp or email at support@babulfatah.com and we will try our best to accommodate your request.',
  },
  {
    question: 'What is your return/refund policy?',
    answer:
      'If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photos of the issue. We will arrange a replacement or full refund. For more details, please visit our Terms of Service page.',
  },
];

const socialLinks = [
  { href: 'https://www.facebook.com/babulfatahshop', label: 'Facebook', icon: Facebook },
  { href: 'https://www.instagram.com/babulfatahshop/', label: 'Instagram', icon: Instagram },
  { href: 'https://www.youtube.com/channel/UCCdG9wRX9_2FvseQu59e4vQ', label: 'YouTube', icon: Youtube },
  { href: 'https://x.com/babulfatahshop', label: 'Twitter/X', icon: Twitter },
];

const contactMethods = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+92 326 5903300',
    href: 'tel:+923265903300',
    color: 'text-brand',
    bg: 'bg-brand/5',
    hoverBorder: 'hover:border-brand/30',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+92 326 5903300',
    href: 'https://wa.me/+923265903300',
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    hoverBorder: 'hover:border-green-500/30',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@babulfatah.com',
    href: 'mailto:support@babulfatah.com',
    color: 'text-brand',
    bg: 'bg-brand/5',
    hoverBorder: 'hover:border-brand/30',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
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
            Contact Us
          </h1>
          <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4 mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Have a question about an order, need product recommendations, or want to get in touch? We are here to help.
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
          <span>Contact Us</span>
        </nav>
      </div>

      {/* ── Contact Methods ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Get In Touch
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Reach out through your preferred channel — we typically respond within a few hours.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group"
              >
                <Card className={`border border-border/60 ${method.hoverBorder} hover:shadow-premium transition-all duration-300 h-full`}>
                  <CardContent className="flex flex-col items-center text-center pt-8 pb-8 px-5">
                    <div className={`flex items-center justify-center h-14 w-14 rounded-2xl ${method.bg} ${method.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <method.icon className="h-7 w-7" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                      {method.label}
                    </p>
                    <p className={`font-semibold ${method.color} text-sm`}>
                      {method.value}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business Hours & Location ── */}
      <section className="py-10 md:py-14 bg-surface">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Business Hours */}
            <div className="p-6 rounded-xl bg-background border border-border/60 shadow-premium">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-golden/10 text-golden-dark">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { day: 'Monday – Friday', time: '9:00 AM – 9:00 PM' },
                  { day: 'Saturday', time: '9:00 AM – 9:00 PM' },
                  { day: 'Sunday', time: 'Closed' },
                ].map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {schedule.day}
                    </span>
                    <span className={`text-sm font-medium ${schedule.time === 'Closed' ? 'text-crimson' : 'text-foreground'}`}>
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                All times in Pakistan Standard Time (PKT)
              </p>
            </div>

            {/* Location */}
            <div className="p-6 rounded-xl bg-background border border-border/60 shadow-premium">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-golden/10 text-golden-dark">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Our Location
                </h3>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Bab-ul-Fatah is based in <strong className="text-foreground">Nokhar, Punjab, Pakistan</strong>. We serve customers across the entire country through our online store and nationwide delivery network.
                </p>
                <div className="aspect-[16/9] rounded-lg bg-surface-alt border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-6 w-6 text-brand/40" />
                  <p className="text-xs">Map integration coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form Section ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Send Us a Message
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Prefer to write? Fill out the form below and we will get back to you as soon as possible.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border border-border/60 shadow-premium">
              <CardContent className="pt-8 pb-8 px-6 md:px-8">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Social Media ── */}
      <section className="py-10 md:py-14 bg-surface">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Stay Connected
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto mb-8">
              Follow us on social media for new arrivals, exclusive deals, and Islamic content.
            </p>
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center h-12 w-12 rounded-full bg-background border border-border/60 hover:border-golden hover:text-golden hover:shadow-premium transition-all duration-300 text-muted-foreground"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Find answers to the most common questions about shopping with Bab-ul-Fatah.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border border-border/60 shadow-premium">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-14 md:py-20 bg-brand-dark text-white text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif">
            Still Have Questions?
          </h2>
          <div className="w-12 h-1 bg-golden rounded-full mx-auto mb-6" />
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Our team is available Monday through Saturday, 9 AM to 9 PM PKT. Reach out via WhatsApp for the fastest response.
          </p>
          <a
            href="https://wa.me/+923265903300"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-3.5 rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
