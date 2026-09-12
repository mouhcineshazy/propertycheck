'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Inspection {
  id: string;
  property_address: string;
  inspection_date: string;
  status: string;
  photo_count: number;
}

export default function ReportsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('inspections')
        .select(`id, inspection_date, status, properties ( address ), inspection_photos (id)`)
        .eq('status', 'completed')
        .order('inspection_date', { ascending: false });
      if (error) {
        console.error('Error fetching inspections:', error);
        setIsLoading(false);
        return;
      }
      if (data) {
        setInspections(
          data.map((i: { id: string; inspection_date: string; status: string; properties: { address: string } | null; inspection_photos: { id: string }[] }) => ({
            id: i.id,
            property_address: i.properties?.address || 'Unknown',
            inspection_date: i.inspection_date,
            status: i.status,
            photo_count: i.inspection_photos?.length || 0,
          }))
        );
      }
      setIsLoading(false);
    };
    fetchInspections();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="skeleton mb-8 h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-fg">Reports</h1>
        <p className="mt-1 text-fg-muted">Generate and share PDF reports for your inspections</p>
      </div>

      {inspections.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-fg-subtle">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <h3 className="text-lg font-semibold text-fg">No completed inspections</h3>
          <p className="mt-1 text-fg-muted">Complete an inspection to generate a PDF report</p>
          <Link href="/dashboard/inspections" className="btn-primary mx-auto mt-5 w-fit px-4 py-2.5">
            View Inspections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="card-interactive p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-verified-50 text-verified-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="badge-verified">Completed</span>
              </div>

              <h3 className="line-clamp-2 font-semibold text-fg">{inspection.property_address}</h3>
              <p className="mt-1 text-sm text-fg-muted">{new Date(inspection.inspection_date).toLocaleDateString('en-CA')}</p>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-fg-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {inspection.photo_count} photos
              </div>

              <div className="mt-4 flex gap-2 border-t border-line pt-4">
                <Link href={`/dashboard/inspections/${inspection.id}`} className="btn-secondary flex-1 py-2 text-sm">
                  View
                </Link>
                <a
                  href="https://apps.apple.com/ca/app/propertycheck"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Generate PDF in the mobile app"
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 p-6">
        <div className="flex gap-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-fg">PDF Reports — Mobile App</h3>
            <p className="mt-1 text-sm text-fg-muted">
              PDF generation and emailing to your landlord is available in the PropertyCheck mobile app. Use this dashboard to browse your inspection history. Tap the PDF button above to open the App Store and download the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
