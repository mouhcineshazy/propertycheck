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

const homeIcon = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';

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
        .select(`id, inspection_date, status, properties ( address ), inspection_photos (id)`)
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
      <div>
        <div className="skeleton mb-8 h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Inspections</h1>
          <p className="mt-1 text-fg-muted">View and manage all your inspections</p>
        </div>
        <Link href="/dashboard/inspections/new" className="btn-primary w-fit px-4 py-2.5">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Inspection
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="inline-flex gap-1 rounded-xl border border-line bg-card p-1 shadow-xs">
          {statusTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === 'all' ? '/dashboard/inspections' : `/dashboard/inspections?status=${tab.id}`}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === tab.id ? 'bg-ink-950 text-white shadow-sm' : 'text-fg-muted hover:text-fg'
              )}
            >
              {tab.label}
              <span className={cn('ml-1.5 text-xs', statusFilter === tab.id ? 'text-white/60' : 'text-fg-subtle')}>({tab.count})</span>
            </Link>
          ))}
        </div>

        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" placeholder="Search by property..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-11" />
        </div>
      </div>

      {filteredInspections.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-fg-subtle">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          {searchQuery || statusFilter !== 'all' ? (
            <>
              <h3 className="text-lg font-semibold text-fg">No inspections found</h3>
              <p className="mt-1 text-fg-muted">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-fg">No inspections yet</h3>
              <p className="mt-1 text-fg-muted">Create your first inspection to get started</p>
              <Link href="/dashboard/inspections/new" className="btn-primary mx-auto mt-5 w-fit px-4 py-2.5">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Inspection
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-card-muted">
                <tr>
                  {['Property', 'Date', 'Photos', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fg-subtle">{h}</th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-fg-subtle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="transition-colors hover:bg-card-muted">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-muted text-fg-muted">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={homeIcon} />
                          </svg>
                        </span>
                        <span className="font-medium text-fg">{inspection.property_address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-fg-muted">{new Date(inspection.inspection_date).toLocaleDateString('en-CA')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-fg-muted">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {inspection.photo_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('capitalize', inspection.status === 'completed' ? 'badge-verified' : 'badge-warning')}>
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/inspections/${inspection.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
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
    <div>
      <div className="skeleton mb-8 h-8 w-48" />
      <div className="skeleton h-64 w-full" />
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
