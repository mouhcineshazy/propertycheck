import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_CONFIG } from '@propertycheck/shared';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} - Protect Your Damage Deposit`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description:
    'Document your rental property in minutes with professional inspection reports. Protect your damage deposit with timestamped photos and court-admissible documentation.',
  keywords: [
    'property inspection',
    'rental inspection',
    'move-in inspection',
    'move-out inspection',
    'damage deposit protection',
    'rental documentation',
    'property photos',
    'inspection report',
  ],
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  openGraph: {
    title: `${APP_CONFIG.name} - Protect Your Damage Deposit`,
    description:
      'Document your rental property in minutes with professional inspection reports that landlords respect.',
    type: 'website',
    locale: 'en_CA',
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: 'Protect your damage deposit with professional inspection reports.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
