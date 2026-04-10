import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// ── Inter: Primary UI font ──
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// ── Geist Mono: Code/monospace fallback ──
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bab-ul-Fatah — Premium Islamic E-Commerce",
    template: "%s | Bab-ul-Fatah",
  },
  description:
    "Discover premium Islamic books, literature, and products at Bab-ul-Fatah. Curated collection of Urdu, Arabic, and English Islamic resources with worldwide shipping.",
  keywords: [
    "Islamic books",
    "Urdu literature",
    "Arabic books",
    "Islamic e-commerce",
    "Bab-ul-Fatah",
    "Islamic products",
    "Quran",
    "Hadith",
    "Islamic education",
  ],
  authors: [{ name: "Bab-ul-Fatah" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Bab-ul-Fatah — Premium Islamic E-Commerce",
    description:
      "Discover premium Islamic books, literature, and products with worldwide shipping.",
    type: "website",
    locale: "en_US",
    siteName: "Bab-ul-Fatah",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bab-ul-Fatah — Premium Islamic E-Commerce",
    description:
      "Discover premium Islamic books, literature, and products with worldwide shipping.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add js-ready class to enable scroll animations only when JS is active */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js-ready')`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
