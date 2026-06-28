import type { Metadata } from 'next';
import './globals.css';
import { APP_CONFIG } from '@propertycheck/shared';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://propertycheck.app'),
  // 58 chars — hits "rental inspection app Canada" keyword
  title: {
    default: 'PropertyCheck: Rental Inspection App for Canadian Renters',
    template: `%s | ${APP_CONFIG.name}`,
  },
  // 157 chars — benefit + CTA
  description:
    'Document your rental with timestamped photos and PDF inspection reports. Protect your damage deposit and stay legally prepared. Try PropertyCheck free today.',
  keywords: [
    'rental inspection app Canada',
    'move-in inspection',
    'move-out inspection',
    'damage deposit protection Canada',
    'property condition report',
    'rental documentation',
    'tenant rights Canada',
    'inspection report PDF',
  ],
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  openGraph: {
    title: 'PropertyCheck: Rental Inspection App for Canadian Renters',
    description:
      'Document your rental with timestamped photos and PDF inspection reports. Protect your damage deposit and stay legally prepared. Try PropertyCheck free today.',
    type: 'website',
    url: 'https://propertycheck.app',
    locale: 'en_CA',
    siteName: APP_CONFIG.name,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${APP_CONFIG.name} — Rental Inspection Reports` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropertyCheck: Rental Inspection App for Canadian Renters',
    description:
      'Document your rental with timestamped photos and PDF inspection reports. Protect your damage deposit and stay legally prepared.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Props = {
  children: React.ReactNode;
};

// Root layout - minimal wrapper for locale-based routing
// The actual html/body tags are in [locale]/layout.tsx
export default function RootLayout({ children }: Props) {
  return children;
}
