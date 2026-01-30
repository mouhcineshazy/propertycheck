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

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl legal-print-content">
          {/* Header */}
          <div className="mb-12 legal-print-header">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{title}</h1>

              {/* Download Button */}
              <button
                onClick={handleDownloadPDF}
                className="print-hide inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium shrink-0"
                title="Download as PDF"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Effective Date: {effectiveDate}</span>
              <span className="print-hide">|</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>

            <p className="mt-4 text-gray-600">
              <em>
                Une version française de ce document est disponible sur demande. /
                A French version of this document is available upon request.
              </em>
            </p>

            {/* Print-only header info */}
            <div className="hidden print:block mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm">
                <strong>PropertyCheck</strong> | propertycheck.app | support@propertycheck.app
              </p>
            </div>
          </div>

          {/* Related Documents Navigation - Hide on print */}
          <nav className="mb-8 print-hide">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/terms"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  documentType === 'terms'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  documentType === 'privacy'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  documentType === 'cookies'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cookie Policy
              </Link>
            </div>
          </nav>

          {/* Document Content */}
          {children}

          {/* Footer Note */}
          <div className="border-t pt-8 mt-12">
            <p className="text-sm text-gray-500">
              This document was last updated on {lastUpdated}.
              A history of changes is maintained and available upon request.
            </p>
            <p className="text-sm text-gray-500 mt-4">
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
