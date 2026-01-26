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
        .select(`
          id,
          inspection_date,
          status,
          properties (
            address
          ),
          inspection_photos (id)
        `)
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
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and share PDF reports for your inspections</p>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No completed inspections</h3>
          <p className="text-gray-500 mb-4">
            Complete an inspection to generate a PDF report
          </p>
          <Link
            href="/dashboard/inspections"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Inspections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Completed
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 line-clamp-2">{inspection.property_address}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(inspection.inspection_date).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {inspection.photo_count} photos
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/inspections/${inspection.id}`}
                  className="flex-1 px-3 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View
                </Link>
                <button
                  onClick={() => {
                    // TODO: Implement PDF generation
                    alert('PDF generation will be available soon!');
                  }}
                  className="flex-1 px-3 py-2 text-center text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">About PDF Reports</h3>
            <p className="text-sm text-gray-600">
              PDF reports include timestamped photos, property details, and inspection notes.
              They serve as legal evidence for deposit disputes and can be shared with
              landlords or letting agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
