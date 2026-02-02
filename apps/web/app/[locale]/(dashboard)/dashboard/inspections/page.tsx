'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Inspection {
  id: string;
  property_address: string;
  inspection_date: string;
  status: string;
  photo_count: number;
}

function InspectionsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        .order('inspection_date', { ascending: false });

      if (!error && data) {
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

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch = i.property_address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusTabs = [
    { id: 'all', label: 'All', count: inspections.length },
    { id: 'completed', label: 'Completed', count: inspections.filter((i) => i.status === 'completed').length },
    { id: 'draft', label: 'Draft', count: inspections.filter((i) => i.status === 'draft').length },
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-600 mt-1">View and manage all your inspections</p>
        </div>
        <Link
          href="/dashboard/inspections/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Inspection
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {statusTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === 'all' ? '/dashboard/inspections' : `/dashboard/inspections?status=${tab.id}`}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                statusFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
            </Link>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {searchQuery || statusFilter !== 'all' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No inspections found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No inspections yet</h3>
              <p className="text-gray-500 mb-4">Create your first inspection to get started</p>
              <Link
                href="/dashboard/inspections/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Inspection
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Property
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Photos
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">{inspection.property_address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(inspection.inspection_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {inspection.photo_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          inspection.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/inspections/${inspection.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectionsFallback() {
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

export default function InspectionsPage() {
  return (
    <Suspense fallback={<InspectionsFallback />}>
      <InspectionsContent />
    </Suspense>
  );
}
