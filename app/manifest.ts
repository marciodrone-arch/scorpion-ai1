import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ScorpionAI',
    short_name: 'ScorpionAI',
    description: 'Assistente de inteligência artificial para conversar, criar e editar imagens.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0c10',
    theme_color: '#0a0c10',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
