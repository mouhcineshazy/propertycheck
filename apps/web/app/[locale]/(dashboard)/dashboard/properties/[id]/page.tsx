'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
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

const typeIcons: Record<string, string> = {
  apartment: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  house: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6a1 1 0 011-1h4a1 1 0 011 1v6h3a1 1 0 001-1V10',
  condo: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01',
};
const clipboardIcon = 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';

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
        const { data: propertyData, error: propertyError } = await supabase.from('properties').select('*').eq('id', propertyId).single();
        if (propertyError) throw propertyError;
        setProperty(propertyData);
        const { data: inspectionsData } = await supabase
          .from('inspections')
          .select(`id, inspection_date, status, notes, inspection_photos (id)`)
          .eq('property_id', propertyId)
          .order('inspection_date', { ascending: false });
        setInspections(
          (inspectionsData || []).map((i: { id: string; inspection_date: string; status: string; notes: string | null; inspection_photos: { id: string }[] }) => ({
            id: i.id,
            inspection_date: i.inspection_date,
            status: i.status,
            notes: i.notes,
            photo_count: i.inspection_photos?.length || 0,
          }))
        );
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (propertyId) loadProperty();
  }, [propertyId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
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
      <div>
        <div className="skeleton mb-4 h-8 w-64" />
        <div className="skeleton mb-8 h-6 w-48" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-fg">Property not found</h2>
        <p className="mt-2 text-fg-muted">This property may have been deleted.</p>
        <Link href="/dashboard/properties" className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700">Back to Properties</Link>
      </div>
    );
  }

  const propertyTypeLabels: Record<string, string> = { apartment: 'Apartment', house: 'House', condo: 'Condo' };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <Link href="/dashboard/properties" className="mb-4 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">{property.address}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card-muted px-3 py-1 text-sm font-medium text-fg-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={typeIcons[property.property_type] || typeIcons.apartment} />
                </svg>
                {propertyTypeLabels[property.property_type]}
              </span>
              <span className="text-sm text-fg-subtle">
                Added {new Date(property.created_at).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/inspections/new?property=${propertyId}`} className="btn-primary px-4 py-2.5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Inspection
            </Link>
            <button onClick={() => setShowDeleteModal(true)} className="rounded-xl p-2.5 text-fg-subtle transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Delete property">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {property.notes && (
        <motion.div variants={itemVariants} className="card mb-6 p-6">
          <h2 className="font-semibold text-fg">Notes</h2>
          <p className="mt-2 text-fg-muted">{property.notes}</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-fg">Inspections ({inspections.length})</h2>
        </div>

        {inspections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-card p-12 text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-fg-subtle">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={clipboardIcon} />
              </svg>
            </span>
            <h3 className="font-semibold text-fg">No inspections yet</h3>
            <p className="mt-1 text-fg-muted">Create your first inspection to document this property.</p>
            <Link href={`/dashboard/inspections/new?property=${propertyId}`} className="btn-primary mx-auto mt-4 w-fit px-4 py-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Inspection
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((inspection) => (
              <Link key={inspection.id} href={`/dashboard/inspections/${inspection.id}`} className="block card-interactive p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-muted text-fg-muted">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={clipboardIcon} />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-fg">
                        {new Date(inspection.inspection_date).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-fg-muted">
                        {inspection.photo_count} photo{inspection.photo_count !== 1 ? 's' : ''}
                        {inspection.notes && ` • ${inspection.notes.slice(0, 50)}...`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={inspection.status === 'completed' ? 'badge-verified' : 'badge-warning'}>
                      {inspection.status === 'completed' ? 'Completed' : 'Draft'}
                    </span>
                    <svg className="h-5 w-5 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-center text-lg font-bold text-fg">Delete Property?</h3>
              <p className="mt-2 text-center text-fg-muted">This will permanently delete this property and all its inspections. This action cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="btn flex-1 bg-red-600 py-2.5 text-white hover:bg-red-700">
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
