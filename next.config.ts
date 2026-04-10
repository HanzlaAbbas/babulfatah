import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // ── Image Optimization ──────────────────────────────────────
  // Configure allowed remote image sources for next/image.
  // Add your CDN domain (Cloudinary, S3, etc.) here when
  // product images are migrated from local placeholders.
  images: {
    qualities: [75, 80, 85, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'babulfatah.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.babulfatah.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'darussalam.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'web.archive.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'babussalam.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zamzampublishers.com.pk',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
