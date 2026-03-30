import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://view1sort.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/onboarding/', '/auth/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
