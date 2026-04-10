import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Bab-ul-Fatah',
  description: 'Complete your order at Bab-ul-Fatah. Cash on Delivery across Pakistan.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
