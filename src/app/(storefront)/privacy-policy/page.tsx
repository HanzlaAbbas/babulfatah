import type { Metadata } from 'next';
import Link from 'next/link';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Privacy Policy | Bab-ul-Fatah',
  description:
    'Read the Bab-ul-Fatah privacy policy. Learn how we collect, use, and protect your personal information when you shop on our Islamic bookstore.',
  openGraph: {
    title: 'Privacy Policy | Bab-ul-Fatah',
    description: 'Privacy policy for Bab-ul-Fatah Islamic bookstore.',
    url: 'https://www.babulfatah.com/privacy-policy',
    siteName: 'Bab-ul-Fatah',
    type: 'website',
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <div className="w-16 h-1 bg-golden rounded-full mx-auto mt-4 mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains how Bab-ul-Fatah collects, uses, and protects your personal information.
          </p>
          <p className="text-white/40 text-sm mt-4">
            Last Updated: April 2026
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
          <span>Privacy Policy</span>
        </nav>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">

          {/* 1. Information We Collect */}
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            At Bab-ul-Fatah, we collect information that you voluntarily provide to us when you use our website, place an order, subscribe to our newsletter, or contact our customer support. The types of information we may collect include:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              { strong: 'Personal Information:', text: ' Your name, phone number, email address, and shipping address provided during checkout or when contacting us.' },
              { strong: 'Order Information:', text: ' Details of products you purchase, order history, payment method preferences, and delivery instructions.' },
              { strong: 'Technical Information:', text: ' IP address, browser type, device type, operating system, and browsing behavior on our website collected automatically through cookies and similar technologies.' },
              { strong: 'Communication Data:', text: ' Records of your correspondence with our customer support team via WhatsApp, email, or phone.' },
            ].map((item) => (
              <li key={item.strong} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>
                  <strong className="text-foreground">{item.strong}</strong>{item.text}
                </span>
              </li>
            ))}
          </ul>

          {/* 2. How We Use Your Information */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            2. How We Use Your Information
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'Processing and fulfilling your orders accurately.',
              'Communicating with you about your order status and delivery updates.',
              'Providing customer support and responding to your inquiries.',
              'Improving our website, products, and services based on your feedback.',
              'Sending promotional offers, new product announcements, and newsletters (with your consent).',
              'Detecting and preventing fraud, abuse, or unauthorized transactions.',
              'Complying with legal obligations and regulatory requirements.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* 3. Information Sharing */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            3. Information Sharing
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We take your privacy seriously and do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              { strong: 'Courier & Logistics Partners:', text: ' We share your name, phone number, and shipping address with our courier partners (such as TCS, Leopards) solely for the purpose of delivering your orders.' },
              { strong: 'Payment Processors:', text: ' If you use an online payment method, we share transaction details with our payment processor solely to complete the transaction.' },
              { strong: 'Legal Requirements:', text: ' We may disclose your information if required by law, regulation, or legal process, or to protect our rights, property, or safety.' },
              { strong: 'Service Providers:', text: ' We may share information with trusted service providers who assist us in operating our website and business, subject to confidentiality obligations.' },
            ].map((item) => (
              <li key={item.strong} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>
                  <strong className="text-foreground">{item.strong}</strong>{item.text}
                </span>
              </li>
            ))}
          </ul>

          {/* 4. Data Security */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            4. Data Security
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'SSL/TLS encryption for all data transmitted through our website.',
              'Secure storage of personal data with access controls.',
              'Regular security assessments and updates to our systems.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>

          {/* 5. Cookies */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            5. Cookies
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device that help us:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'Remember your shopping cart items and preferences.',
              'Understand how visitors interact with our website.',
              'Improve website performance and functionality.',
              'Deliver personalized content and recommendations.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-golden shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can control cookies through your browser settings. Disabling cookies may limit some features of our website, but your account and personal data will remain secure.
          </p>

          {/* 6. Your Rights */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            6. Your Rights
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              { strong: 'Access:', text: ' Request a copy of the personal information we hold about you.' },
              { strong: 'Correction:', text: ' Request corrections to any inaccurate or incomplete personal information.' },
              { strong: 'Deletion:', text: ' Request the deletion of your personal information, subject to legal obligations.' },
              { strong: 'Opt-Out:', text: ' Unsubscribe from promotional communications at any time by clicking the unsubscribe link in our emails or contacting us directly.' },
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
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:support@babulfatah.com" className="text-golden hover:text-golden-dark underline underline-offset-4">
              support@babulfatah.com
            </a>{' '}
            or call us at{' '}
            <a href="tel:+923265903300" className="text-golden hover:text-golden-dark underline underline-offset-4">
              +92 326 5903300
            </a>.
          </p>

          {/* 7. Third-Party Links */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            7. Third-Party Links
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our website may contain links to third-party websites, including social media platforms and payment gateways. We are not responsible for the privacy practices or content of these external websites. We encourage you to review the privacy policies of any third-party sites you visit through links on our website.
          </p>

          {/* 8. Changes to This Policy */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            8. Changes to This Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Bab-ul-Fatah reserves the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. We encourage you to review this policy periodically to stay informed about how we protect your information. Your continued use of our website after any changes constitutes your acceptance of the updated policy.
          </p>

          {/* 9. Contact Us */}
          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">
            9. Contact Us
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
            <p>Address: Nokhar, Punjab, Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
