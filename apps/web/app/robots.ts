import { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://propertycheck.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/share/', '/settings/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
