import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bab-ul-Fatah - Islamic Books',
    short_name: 'Bab-ul-Fatah',
    description: "Pakistan's Largest Online Islamic Store",
    start_url: '/',
    display: 'standalone',
    theme_color: '#1D333B',
    background_color: '#ffffff',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
