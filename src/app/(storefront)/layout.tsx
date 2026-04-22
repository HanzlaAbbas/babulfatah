import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { WhatsAppFloat } from '@/components/storefront/whatsapp-float';
import { RecentlyViewedSection } from '@/components/storefront/recently-viewed-section';
import { FlashSaleBanner } from '@/components/storefront/flash-sale-banner';
import { BackToTop } from '@/components/storefront/back-to-top';
import { NewsletterPopup } from '@/components/storefront/newsletter-popup';
import { SocialProofToast } from '@/components/storefront/social-proof-toast';
import { AIAssistant } from '@/components/storefront/ai-assistant';
import { MobileBottomNav } from '@/components/storefront/mobile-bottom-nav';

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
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
}
