'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Navigation, Footer } from '@/components/landing';

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  documentType: 'terms' | 'privacy' | 'cookies';
}

export function LegalPageLayout({
  children,
  title,
  effectiveDate,
  lastUpdated,
  documentType,
}: LegalPageLayoutProps) {
  const handleDownloadPDF = () => {
    // Set document title for PDF filename
    const originalTitle = document.title;
    document.title = `PropertyCheck_${title.replace(/\s+/g, '_')}_${lastUpdated.replace(/,?\s+/g, '_')}`;

    window.print();

    // Restore original title after print dialog
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const pills = [
    { href: '/terms', label: 'Terms of Service', type: 'terms' },
    { href: '/privacy', label: 'Privacy Policy', type: 'privacy' },
    { href: '/cookies', label: 'Cookie Policy', type: 'cookies' },
  ] as const;

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation variant="light" />

      <div className="pb-16 pt-24">
        <div className="legal-print-content container-page max-w-4xl">
          {/* Header */}
          <div className="legal-print-header mb-12">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>

              <button onClick={handleDownloadPDF} className="btn-secondary print-hide shrink-0 px-4 py-2 text-sm" title="Download as PDF">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-fg-subtle">
              <span>Effective Date: {effectiveDate}</span>
              <span className="print-hide">|</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>

            <p className="mt-4 text-fg-muted">
              <em>Une version française de ce document est disponible sur demande. / A French version of this document is available upon request.</em>
            </p>

            <div className="mt-4 hidden border-t border-line pt-4 print:block">
              <p className="text-sm">
                <strong>PropertyCheck</strong> | propertycheck.app | support@propertycheck.app
              </p>
            </div>
          </div>

          {/* Related documents */}
          <nav className="print-hide mb-8">
            <div className="flex flex-wrap gap-2">
              {pills.map((pill) => (
                <Link
                  key={pill.type}
                  href={pill.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    documentType === pill.type ? 'bg-primary-50 text-primary-700' : 'bg-card-muted text-fg-muted hover:bg-line'
                  }`}
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Document Content */}
          {children}

          {/* Footer Note */}
          <div className="mt-12 border-t border-line pt-8">
            <p className="text-sm text-fg-subtle">
              This document was last updated on {lastUpdated}. A history of changes is maintained and available upon request.
            </p>
            <p className="mt-4 text-sm text-fg-subtle">
              By using PropertyCheck, you acknowledge that you have read and understood this document.
            </p>

            {/* Print-only footer */}
            <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} PropertyCheck. All rights reserved.</p>
              <p className="mt-1">
                Downloaded from propertycheck.app on {new Date().toLocaleDateString('en-CA')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
