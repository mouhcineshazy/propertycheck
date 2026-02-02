'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

interface Property {
  id: string;
  address: string;
  property_type: string;
  notes: string | null;
  created_at: string;
}

interface Inspection {
  id: string;
  inspection_date: string;
  status: string;
  notes: string | null;
  photo_count: number;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const supabase = createClient();

        // Fetch property
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (propertyError) throw propertyError;
        setProperty(propertyData);

        // Fetch inspections with photo count
        const { data: inspectionsData } = await supabase
          .from('inspections')
          .select(`
            id,
            inspection_date,
            status,
            notes,
            inspection_photos (id)
          `)
          .eq('property_id', propertyId)
          .order('inspection_date', { ascending: false });

        const formattedInspections = (inspectionsData || []).map((i: {
          id: string;
          inspection_date: string;
          status: string;
          notes: string | null;
          inspection_photos: { id: string }[];
        }) => ({
          id: i.id,
          inspection_date: i.inspection_date,
          status: i.status,
          notes: i.notes,
          photo_count: i.inspection_photos?.length || 0,
        }));

        setInspections(formattedInspections);
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      router.push('/dashboard/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-4" />
        <div className="h-6 w-48 bg-gray-100 rounded-lg mb-8" />
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-full bg-gray-100 rounded mb-2" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Property not found</h2>
        <p className="text-gray-500 mb-4">This property may have been deleted.</p>
        <Link href="/dashboard/properties" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to Properties
        </Link>
      </div>
    );
  }

  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    condo: 'Condo',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {property.property_type === 'apartment' && '🏢'}
                {property.property_type === 'house' && '🏠'}
                {property.property_type === 'condo' && '🏬'}
                {propertyTypeLabels[property.property_type]}
              </span>
              <span className="text-sm text-gray-500">
                Added {new Date(property.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/dashboard/inspections/new?property=${propertyId}`}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Inspection
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Property Notes */}
      {property.notes && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-600">{property.notes}</p>
        </motion.div>
      )}

      {/* Inspections */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Inspections ({inspections.length})
          </h2>
        </div>

        {inspections.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No inspections yet</h3>
            <p className="text-gray-500 mb-4">Create your first inspection to document this property.</p>
            <Link
              href={`/dashboard/inspections/new?property=${propertyId}`}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Inspection
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((inspection) => (
              <Link
                key={inspection.id}
                href={`/dashboard/inspections/${inspection.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(inspection.inspection_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {inspection.photo_count} photo{inspection.photo_count !== 1 ? 's' : ''}
                        {inspection.notes && ` • ${inspection.notes.slice(0, 50)}...`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      inspection.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inspection.status === 'completed' ? 'Completed' : 'Draft'}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Property?</h3>
            <p className="text-gray-500 text-center mb-6">
              This will permanently delete this property and all its inspections. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
