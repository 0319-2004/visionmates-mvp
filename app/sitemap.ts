import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // In production, you would fetch project IDs to include detail pages
  return [
    {
      url: 'https://example.com/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
