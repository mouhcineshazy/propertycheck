import { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://propertycheck.app';

function url(path: string) {
  return `${base}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Home (pricing is a section on the homepage — no separate /pricing route)
    { url: url('/en'), lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: url('/fr'), lastModified: now, changeFrequency: 'weekly', priority: 1.0 },

    // Static marketing pages (EN)
    { url: url('/en/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/en/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/en/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

    // Static marketing pages (FR)
    { url: url('/fr/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/fr/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/fr/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

    // Legal
    { url: url('/en/legal/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: url('/en/legal/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: url('/fr/legal/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: url('/fr/legal/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
