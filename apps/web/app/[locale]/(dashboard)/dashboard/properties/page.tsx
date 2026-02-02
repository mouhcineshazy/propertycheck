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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          address,
          property_type,
          created_at,
          inspections (id)
        `)
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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">Manage your rental properties</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
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
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
              <p className="text-gray-500">Try a different search term</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No properties yet</h3>
              <p className="text-gray-500 mb-4">Add your first property to get started</p>
              <Link
                href="/dashboard/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Link
              key={property.id}
              href={`/dashboard/properties/${property.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">
                  {property.inspection_count} inspection{property.inspection_count !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mt-4 line-clamp-2">{property.address}</h3>
              <p className="text-sm text-gray-500 mt-1 capitalize">{property.property_type}</p>
              <p className="text-xs text-gray-400 mt-3">
                Added {new Date(property.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
