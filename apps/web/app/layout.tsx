import type { Metadata } from 'next';
import './globals.css';
import { APP_CONFIG } from '@propertycheck/shared';

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
  description:
    'Document rental property conditions with photos, generate professional PDF reports, and share them with tenants and landlords. Perfect for move-in and move-out inspections.',
  keywords: [
    'property inspection',
    'rental inspection',
    'move-in inspection',
    'move-out inspection',
    'property management',
    'landlord tools',
  ],
  openGraph: {
    title: APP_CONFIG.name,
    description: APP_CONFIG.tagline,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
