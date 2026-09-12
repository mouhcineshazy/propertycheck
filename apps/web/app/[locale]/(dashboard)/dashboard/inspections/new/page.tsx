'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { InspectionStatus, Inspection } from '@propertycheck/database';

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
}
interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

function NewInspectionFallback() {
  return (
    <div className="max-w-2xl">
      <div className="skeleton mb-8 h-8 w-48" />
      <div className="skeleton h-48 w-full" />
    </div>
  );
}

function NewInspectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preselectedPropertyId = searchParams.get('property');

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(preselectedPropertyId || '');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('properties').select('id, address').order('address');
        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProperties();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      uploading: false,
      uploaded: false,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      setError('Please select a property');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          property_id: selectedPropertyId,
          inspection_date: inspectionDate,
          notes: notes || null,
          status: (photos.length > 0 ? 'completed' : 'draft') as InspectionStatus,
        } as never)
        .select()
        .single();
      if (inspectionError) throw inspectionError;
      const inspection = inspectionData as unknown as Inspection;

      if (photos.length > 0) {
        for (const photo of photos) {
          setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, uploading: true } : p)));
          try {
            const fileExt = photo.file.name.split('.').pop();
            const fileName = `${inspection.id}/${crypto.randomUUID()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, photo.file);
            if (uploadError) throw uploadError;
            const { error: photoRecordError } = await supabase
              .from('inspection_photos')
              .insert({ inspection_id: inspection.id, storage_path: fileName, caption: photo.caption || null } as never);
            if (photoRecordError) throw photoRecordError;
            setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, uploading: false, uploaded: true } : p)));
          } catch (uploadErr) {
            console.error('Error uploading photo:', uploadErr);
            setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, uploading: false, error: 'Failed to upload' } : p)));
          }
        }
      }
      router.push(`/dashboard/inspections/${inspection.id}`);
    } catch (err) {
      console.error('Error creating inspection:', err);
      setError('Failed to create inspection. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <NewInspectionFallback />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl">
      <motion.div variants={itemVariants} className="mb-8">
        <Link href="/dashboard/inspections" className="mb-4 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inspections
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-fg">New Inspection</h1>
        <p className="mt-1 text-fg-muted">Document the current state of a property</p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div variants={itemVariants} className="card space-y-6 p-6">
          <div>
            <label className="label">Property *</label>
            {properties.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">You need to add a property first before creating an inspection.</p>
                <Link href="/dashboard/properties/new" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800">
                  Add Property
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="input cursor-pointer bg-card" required>
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.address}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">Inspection Date *</label>
            <input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} className="input" required />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General observations about the property condition..." rows={3} className="input resize-none" />
          </div>

          <div>
            <label className="label">Photos</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-line-strong p-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50"
            >
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-card-muted text-fg-subtle">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <p className="font-medium text-fg">Click to upload photos</p>
              <p className="mt-1 text-sm text-fg-subtle">PNG, JPG up to 10MB each</p>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

            {photos.length > 0 && (
              <div className="mt-4 space-y-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="flex gap-4 rounded-xl bg-card-muted p-3">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset */}
                      <img src={photo.preview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
                      {photo.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink-950/50">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        </div>
                      )}
                      {photo.uploaded && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-verified-500/60">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {photo.error && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-500/60">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                        placeholder="Add a caption (e.g., Kitchen - North Wall)"
                        className="input px-3 py-2 text-sm"
                        disabled={photo.uploading || photo.uploaded}
                      />
                      <p className="mt-1 truncate text-xs text-fg-subtle">{photo.file.name}</p>
                    </div>
                    {!photo.uploading && !photo.uploaded && (
                      <button type="button" onClick={() => handleRemovePhoto(photo.id)} className="p-2 text-fg-subtle transition-colors hover:text-red-500" aria-label="Remove photo">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/inspections" className="btn-secondary flex-1 py-3">Cancel</Link>
            <button type="submit" disabled={isSubmitting || properties.length === 0} className="btn-primary flex-1 py-3">
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                'Create Inspection'
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default function NewInspectionPage() {
  return (
    <Suspense fallback={<NewInspectionFallback />}>
      <NewInspectionContent />
    </Suspense>
  );
}
