'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { InspectionStatus, Inspection } from '@propertycheck/database';

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
    <div className="animate-pulse max-w-2xl">
      <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8" />
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-12 w-full bg-gray-100 rounded-xl" />
      </div>
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
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('properties')
          .select('id, address')
          .order('address');

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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
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

      // Create inspection
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

      // Upload photos
      if (photos.length > 0) {
        for (const photo of photos) {
          // Update photo status
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id ? { ...p, uploading: true } : p
            )
          );

          try {
            // Upload to Supabase Storage
            const fileExt = photo.file.name.split('.').pop();
            const fileName = `${inspection.id}/${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('inspection-photos')
              .upload(fileName, photo.file);

            if (uploadError) throw uploadError;

            // Create photo record
            const { error: photoRecordError } = await supabase
              .from('inspection_photos')
              .insert({
                inspection_id: inspection.id,
                storage_path: fileName,
                caption: photo.caption || null,
              } as never);

            if (photoRecordError) throw photoRecordError;

            // Update photo status
            setPhotos((prev) =>
              prev.map((p) =>
                p.id === photo.id
                  ? { ...p, uploading: false, uploaded: true }
                  : p
              )
            );
          } catch (uploadErr) {
            console.error('Error uploading photo:', uploadErr);
            setPhotos((prev) =>
              prev.map((p) =>
                p.id === photo.id
                  ? { ...p, uploading: false, error: 'Failed to upload' }
                  : p
              )
            );
          }
        }
      }

      // Redirect to inspection detail
      router.push(`/dashboard/inspections/${inspection.id}`);
    } catch (err) {
      console.error('Error creating inspection:', err);
      setError('Failed to create inspection. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8" />
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-12 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href="/dashboard/inspections"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inspections
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Inspection</h1>
        <p className="text-gray-500 mt-1">Document the current state of a property</p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6"
        >
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property *
            </label>
            {properties.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                  You need to add a property first before creating an inspection.
                </p>
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex items-center gap-1 text-amber-700 font-medium text-sm mt-2 hover:text-amber-800"
                >
                  Add Property
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                required
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Inspection Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Date *
            </label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="General observations about the property condition..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos
            </label>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Click to upload photos</p>
              <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB each</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="mt-4 space-y-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {photo.uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                      {photo.uploaded && (
                        <div className="absolute inset-0 bg-green-500/50 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {photo.error && (
                        <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                        placeholder="Add a caption (e.g., Kitchen - North Wall)"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0"
                        disabled={photo.uploading || photo.uploaded}
                      />
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {photo.file.name}
                      </p>
                    </div>
                    {!photo.uploading && !photo.uploaded && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/dashboard/inspections"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 text-center hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || properties.length === 0}
              className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
