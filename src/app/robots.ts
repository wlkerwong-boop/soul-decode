import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aisoulcode.cn';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
