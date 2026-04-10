import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { WhatsAppFloat } from '@/components/storefront/whatsapp-float';
import { RecentlyViewedSection } from '@/components/storefront/recently-viewed-section';
import { FlashSaleBanner } from '@/components/storefront/flash-sale-banner';
import { BackToTop } from '@/components/storefront/back-to-top';
import { NewsletterPopup } from '@/components/storefront/newsletter-popup';
import { SocialProofToast } from '@/components/storefront/social-proof-toast';
import { SalameeChat } from '@/components/storefront/salamee-chat';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <FlashSaleBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <RecentlyViewedSection />
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <NewsletterPopup />
      <SocialProofToast />
      <SalameeChat />
    </div>
  );
}
