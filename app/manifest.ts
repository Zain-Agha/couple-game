import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Two of Us - Couples Game',
    short_name: 'Two of Us',
    description: 'The ultimate real-time couples arcade game',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#ec4899',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}