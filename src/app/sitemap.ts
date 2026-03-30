import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://view1sort.com'

  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/auth/login`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
