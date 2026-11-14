import type { MetadataRoute } from 'next';

const siteUrl = 'https://scorpion-ai1.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/app', '/login'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
