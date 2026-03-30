import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'View1 Sort',
    short_name: 'View1',
    description: 'AI-powered photo sorting and client delivery for photographers',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#6366f1',
    orientation: 'portrait-primary',
    categories: ['photography', 'productivity', 'business'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'AI Sort',
        url: '/dashboard/ai-sort',
        description: 'Sort a new shoot with AI',
      },
      {
        name: 'On-Set',
        url: '/on-set',
        description: 'On-set shot list companion',
      },
    ],
  }
}
