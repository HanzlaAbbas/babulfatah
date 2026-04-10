import type { Metadata } from 'next';
import Link from 'next/link';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Terms of Service | Bab-ul-Fatah',
  description:
    'Read the Bab-ul-Fatah terms of service. Understand our policies on orders, payments, shipping, returns, and your rights when shopping on our Islamic bookstore.',
  openGraph: {
    title: 'Terms of Service | Bab-ul-Fatah',
    description: 'Terms and conditions for shopping at Bab-ul-Fatah.',
    url: 'https://www.babulfatah.com/terms-of-service',
    siteName: 'Bab-ul-Fatah',
    type: 'website',
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ── */}
      <section className="bg-brand-dark py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 left-8 w-32 h-32 border border-golden/30 rotate-45" />
          <div className="absolute bottom-8 right-8 w-48 h-48 border border-golden/30 rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-golden/20 rounded-full" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">
            Terms of Service
          </h1>
          <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4 mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto">
            Please read these terms carefully before using our website or placing an order with Bab-ul-Fatah.
          </p>
          <p className="text-white/40 text-sm mt-4">
            Effective Date: January 2026
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
          <span>Terms of Service</span>
        </nav>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">

          {/* 1. Acceptance of Terms */}
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By accessing and using the Bab-ul-Fatah website{' '}
            <span className="text-foreground">(www.babulfatah.com)</span>, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, along with our{' '}
            <Link href="/privacy-policy" className="text-golden hover:text-golden-dark underline underline-offset-4">
              Privacy Policy
            </Link>. If you do not agree with any part of these terms, you must not use our website or services.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These terms apply to all visitors, users, and customers of Bab-ul-Fatah. We reserve the right to modify these terms at any time, and your continued use of the website after changes are posted constitutes acceptance of the revised terms.
          </p>

          {/* 2. Products and Pricing */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            2. Products and Pricing
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All products listed on Bab-ul-Fatah are subject to availability. We make every effort to display accurate product descriptions, images, and prices; however, we do not guarantee that all information is free from errors. In the event of a pricing error, we reserve the right to:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'Cancel any orders placed for incorrectly priced products.',
              'Contact you to confirm the correct price before processing.',
              'Update prices at any time without prior notice.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All prices are displayed in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless otherwise stated. Shipping charges are calculated separately at checkout and may vary based on delivery location and order size.
          </p>

          {/* 3. Orders and Payment */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            3. Orders and Payment
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you place an order on Bab-ul-Fatah, you agree to the following:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'You provide accurate, complete, and current contact and shipping information.',
              'You are at least 18 years of age or have the consent of a parent or legal guardian.',
              'You are authorized to use the payment method provided for the order.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-muted-foreground leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
              <span>
                <strong className="text-foreground">Cash on Delivery (COD):</strong> Our primary payment method. You pay the full order amount (product price + shipping) in cash to the courier upon delivery.
              </span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
              <span>
                We reserve the right to refuse or cancel any order for any reason, including suspected fraud, unavailability of products, or errors in order information.
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Once an order is confirmed and dispatched, cancellation may not be possible. Please contact us immediately if you wish to cancel or modify an order.
          </p>

          {/* 4. Shipping and Delivery */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            4. Shipping and Delivery
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Bab-ul-Fatah ships to all locations within Pakistan. Our shipping policies are as follows:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              { strong: 'Processing Time:', text: ' Orders are typically processed and dispatched within 24-48 hours of confirmation (excluding Sundays and public holidays).' },
              { strong: 'Delivery Time:', text: ' Major cities: 3-5 business days. Remote areas: 5-7 business days.' },
              { strong: 'Courier Partners:', text: ' We use trusted courier services including TCS, Leopards, and others depending on your location.' },
              { strong: 'Tracking:', text: ' Once your order is dispatched, you will receive a tracking number via WhatsApp or SMS.' },
              { strong: 'Risk of Loss:', text: ' The risk of loss and title for items purchased from Bab-ul-Fatah pass to you upon delivery to the courier service.' },
            ].map((item) => (
              <li key={item.strong} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>
                  <strong className="text-foreground">{item.strong}</strong>{item.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Delivery times are estimates and may vary due to factors beyond our control, including weather conditions, courier delays, or public holidays. Bab-ul-Fatah is not liable for delays caused by courier services.
          </p>

          {/* 5. Returns and Refunds */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            5. Returns and Refunds
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We want you to be completely satisfied with your purchase. If you receive a damaged, defective, or incorrect item, please follow our return process:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              { strong: 'Report Within 48 Hours:', text: ' Contact us via WhatsApp or email within 48 hours of receiving your order with clear photos showing the damage or issue.' },
              { strong: 'Verification:', text: ' Our team will review your claim and respond within 24 hours.' },
              { strong: 'Replacement or Refund:', text: ' Upon verification, we will arrange a replacement or issue a full refund, whichever you prefer.' },
              { strong: 'Non-Returnable Items:', text: ' Items that are not in their original condition, have been used, or are returned after 48 hours are not eligible for return or refund.' },
            ].map((item) => (
              <li key={item.strong} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>
                  <strong className="text-foreground">{item.strong}</strong>{item.text}
                </span>
              </li>
            ))}
          </ul>

          {/* 6. Intellectual Property */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            6. Intellectual Property
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All content on the Bab-ul-Fatah website — including but not limited to text, graphics, logos, images, product descriptions, and software — is the property of Bab-ul-Fatah or its content suppliers and is protected by intellectual property laws. You may not:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'Copy, reproduce, or distribute any content from our website without written permission.',
              'Use our trademarks, logos, or brand identifiers for any purpose without authorization.',
              'Scrape, crawl, or use automated tools to extract data from our website.',
              'Create derivative works based on our website content.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* 7. Limitation of Liability */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            7. Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To the fullest extent permitted by applicable law, Bab-ul-Fatah, its directors, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'Your use of or inability to use our website.',
              'Any products purchased through our website.',
              'Errors, inaccuracies, or omissions in product descriptions or pricing.',
              'Delays or failures in delivery caused by courier services or other factors.',
              'Unauthorized access to your personal information.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our total liability for any claim arising from or related to these terms or your use of our website shall not exceed the amount you paid to Bab-ul-Fatah for the specific product or service in question.
          </p>

          {/* 8. Governing Law */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            8. Governing Law
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These Terms of Service shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Punjab, Pakistan. Both parties agree to attempt to resolve any dispute through amicable negotiation before initiating legal proceedings.
          </p>

          {/* 9. Contact */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            9. Contact
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-surface-alt rounded-xl p-6 space-y-2 text-muted-foreground border border-border/40">
            <p>
              <strong className="text-foreground">Bab-ul-Fatah</strong>
            </p>
            <p>
              Email:{' '}
              <a href="mailto:support@babulfatah.com" className="text-golden hover:text-golden-dark underline underline-offset-4">
                support@babulfatah.com
              </a>
            </p>
            <p>
              Phone:{' '}
              <a href="tel:+923265903300" className="text-golden hover:text-golden-dark underline underline-offset-4">
                +92 326 5903300
              </a>
            </p>
            <p>
              WhatsApp:{' '}
              <a
                href="https://wa.me/+923265903300"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline underline-offset-4"
              >
                +92 326 5903300
              </a>
            </p>
            <p>Address: Nokhar, Punjab, Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
