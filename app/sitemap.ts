import type { MetadataRoute } from 'next';

const siteUrl = 'https://scorpion-ai1.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ['', '/pricing', '/privacy', '/support', '/terms'];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
