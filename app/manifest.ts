import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Two of Us - Couples Game',
    short_name: 'Two of Us',
    description: 'The ultimate real-time couples quiz game',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#ec4899',
    icons: [
      {
        src: 'https://em-content.zobj.net/source/apple/354/revolving-hearts_1f49e.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://em-content.zobj.net/source/apple/354/revolving-hearts_1f49e.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}