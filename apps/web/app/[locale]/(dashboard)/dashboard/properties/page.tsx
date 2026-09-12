'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Property {
  id: string;
  address: string;
  property_type: string;
  created_at: string;
  inspection_count: number;
}

const homeIcon = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('properties')
        .select(`id, address, property_type, created_at, inspections (id)`)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProperties(
          data.map((p: { id: string; address: string; property_type: string; created_at: string; inspections: { id: string }[] }) => ({
            id: p.id,
            address: p.address,
            property_type: p.property_type,
            created_at: p.created_at,
            inspection_count: p.inspections?.length || 0,
          }))
        );
      }
      setIsLoading(false);
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(
    (p) =>
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.property_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div>
        <div className="skeleton mb-8 h-8 w-48" />
        <div className="skeleton mb-6 h-12 w-full max-w-md" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Properties</h1>
          <p className="mt-1 text-fg-muted">Manage your rental properties</p>
        </div>
        <Link href="/dashboard/properties/new" className="btn-primary w-fit px-4 py-2.5">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11"
          />
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-fg-subtle">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={homeIcon} />
            </svg>
          </span>
          {searchQuery ? (
            <>
              <h3 className="text-lg font-semibold text-fg">No properties found</h3>
              <p className="mt-1 text-fg-muted">Try a different search term</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-fg">No properties yet</h3>
              <p className="mt-1 text-fg-muted">Add your first property to get started</p>
              <Link href="/dashboard/properties/new" className="btn-primary mx-auto mt-5 w-fit px-4 py-2.5">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link key={property.id} href={`/dashboard/properties/${property.id}`} className="group card-interactive p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={homeIcon} />
                  </svg>
                </span>
                <span className="text-xs text-fg-subtle">
                  {property.inspection_count} inspection{property.inspection_count !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="mt-4 line-clamp-2 font-semibold text-fg">{property.address}</h3>
              <p className="mt-1 text-sm capitalize text-fg-muted">{property.property_type}</p>
              <p className="mt-3 text-xs text-fg-subtle">Added {new Date(property.created_at).toLocaleDateString('en-CA')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
