'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { InspectionStatus, InspectionPhoto as DbInspectionPhoto } from '@propertycheck/database';

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

interface Inspection {
  id: string;
  property_id: string;
  inspection_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  property: Property;
}

interface PhotoRecord {
  id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

interface Photo extends PhotoRecord {
  photo_url: string;
}

interface UploadingPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inspectionId = params.id as string;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const loadInspection = async () => {
      try {
        const supabase = createClient();

        // Fetch inspection with property
        const { data: inspectionData, error: inspectionError } = await supabase
          .from('inspections')
          .select(`
            *,
            property:properties (
              id,
              address
            )
          `)
          .eq('id', inspectionId)
          .single();

        if (inspectionError) throw inspectionError;
        setInspection(inspectionData);

        // Fetch photos
        const { data: photosData } = await supabase
          .from('inspection_photos')
          .select('*')
          .eq('inspection_id', inspectionId)
          .order('created_at', { ascending: true });

        // Map photos to include public URL
        const photoRecords = (photosData || []) as unknown as DbInspectionPhoto[];
        const photosWithUrls: Photo[] = photoRecords.map((p) => {
          const { data: urlData } = supabase.storage
            .from('inspection-photos')
            .getPublicUrl(p.storage_path);
          return {
            id: p.id,
            storage_path: p.storage_path,
            caption: p.caption,
            created_at: p.created_at,
            photo_url: urlData.publicUrl,
          };
        });

        setPhotos(photosWithUrls);
      } catch (error) {
        console.error('Error loading inspection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (inspectionId) {
      loadInspection();
    }
  }, [inspectionId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();

      // Delete photos from storage first
      if (photos.length > 0) {
        const filePaths = photos.map((p) => p.storage_path);
        await supabase.storage.from('inspection-photos').remove(filePaths);
      }

      // Delete inspection (cascade will delete photo records)
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId);

      if (error) throw error;
      router.push(`/dashboard/properties/${inspection?.property_id}`);
    } catch (error) {
      console.error('Error deleting inspection:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !inspection) return;

    const newPhotos: UploadingPhoto[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      uploading: true,
      uploaded: false,
    }));

    setUploadingPhotos((prev) => [...prev, ...newPhotos]);
    setIsUploading(true);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const supabase = createClient();

    // Upload each photo
    for (const photo of newPhotos) {
      try {
        // Upload to storage
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${inspection.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(fileName, photo.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('inspection-photos')
          .getPublicUrl(fileName);

        // Create photo record
        const { data: photoRecord, error: photoRecordError } = await supabase
          .from('inspection_photos')
          .insert({
            inspection_id: inspection.id,
            storage_path: fileName,
            caption: photo.caption || null,
          } as never)
          .select()
          .single();

        if (photoRecordError) throw photoRecordError;

        // Add to photos array with URL
        const dbPhoto = photoRecord as unknown as DbInspectionPhoto;
        const newPhoto: Photo = {
          id: dbPhoto.id,
          storage_path: dbPhoto.storage_path,
          caption: dbPhoto.caption,
          created_at: dbPhoto.created_at,
          photo_url: urlData.publicUrl,
        };
        setPhotos((prev) => [...prev, newPhoto]);

        // Update uploading status
        setUploadingPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id ? { ...p, uploading: false, uploaded: true } : p
          )
        );

        // Clean up preview URL
        URL.revokeObjectURL(photo.preview);
      } catch (error) {
        console.error('Error uploading photo:', error);
        setUploadingPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, uploading: false, error: 'Failed to upload' }
              : p
          )
        );
      }
    }

    // Remove uploaded photos from uploading list after a delay
    setTimeout(() => {
      setUploadingPhotos((prev) => prev.filter((p) => !p.uploaded));
    }, 2000);

    setIsUploading(false);

    // Update inspection status to completed if it was draft
    if (inspection.status === 'draft') {
      await supabase
        .from('inspections')
        .update({ status: 'completed' } as never)
        .eq('id', inspection.id);

      setInspection((prev) => (prev ? { ...prev, status: 'completed' } : null));
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    try {
      const supabase = createClient();

      // Delete from storage using storage_path
      await supabase.storage.from('inspection-photos').remove([photo.storage_path]);

      // Delete record
      await supabase.from('inspection_photos').delete().eq('id', photoId);

      // Update state
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleGeneratePdf = async () => {
    if (!inspection) return;

    setIsGeneratingPdf(true);

    try {
      // Convert images to base64 for embedding in PDF
      const imagePromises = photos.map(async (photo) => {
        try {
          const response = await fetch(photo.photo_url);
          const blob = await response.blob();
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      });

      const imageDataUrls = await Promise.all(imagePromises);

      // Create HTML content for the PDF
      const inspectionDate = new Date(inspection.inspection_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const reportDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Generate photo grid HTML
      const photosHtml = photos
        .map((photo, index) => {
          const imageData = imageDataUrls[index];
          if (!imageData) return '';
          return `
            <div style="break-inside: avoid; margin-bottom: 20px;">
              <img src="${imageData}" style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb;" />
              ${photo.caption ? `<p style="margin-top: 8px; font-size: 14px; color: #6b7280;">${photo.caption}</p>` : ''}
              <p style="margin-top: 4px; font-size: 12px; color: #9ca3af;">Photo ${index + 1} of ${photos.length} - ${new Date(photo.created_at).toLocaleString()}</p>
            </div>
          `;
        })
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Inspection Report - ${inspection.property.address}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 8px; }
            .title { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .subtitle { font-size: 16px; color: #6b7280; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .info-item { background: #f9fafb; padding: 16px; border-radius: 8px; }
            .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .info-value { font-size: 16px; font-weight: 500; color: #1f2937; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-draft { background: #fef3c7; color: #92400e; }
            .notes { background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap; }
            .photos-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .container { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">PropertyCheck</div>
              <h1 class="title">Property Inspection Report</h1>
              <p class="subtitle">Generated on ${reportDate}</p>
            </div>

            <div class="section">
              <h2 class="section-title">Inspection Details</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Property Address</div>
                  <div class="info-value">${inspection.property.address}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Inspection Date</div>
                  <div class="info-value">${inspectionDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">
                    <span class="status-badge ${inspection.status === 'completed' ? 'status-completed' : 'status-draft'}">
                      ${inspection.status === 'completed' ? 'Completed' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Total Photos</div>
                  <div class="info-value">${photos.length}</div>
                </div>
              </div>
            </div>

            ${inspection.notes ? `
            <div class="section">
              <h2 class="section-title">Notes</h2>
              <div class="notes">${inspection.notes}</div>
            </div>
            ` : ''}

            ${photos.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Photo Documentation</h2>
              <div class="photos-grid">
                ${photosHtml}
              </div>
            </div>
            ` : ''}

            <div class="footer">
              <p>This report was generated by PropertyCheck on ${reportDate}</p>
              <p>Inspection ID: ${inspection.id}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Open print dialog with the generated HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        // Wait for images to load, then print
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-4" />
        <div className="h-6 w-48 bg-gray-100 rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Inspection not found</h2>
        <p className="text-gray-500 mb-4">This inspection may have been deleted.</p>
        <Link href="/dashboard/inspections" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to Inspections
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href={`/dashboard/properties/${inspection.property_id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Property
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {new Date(inspection.inspection_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href={`/dashboard/properties/${inspection.property_id}`}
                className="text-gray-500 hover:text-primary-600 transition-colors"
              >
                {inspection.property.address}
              </Link>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                inspection.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {inspection.status === 'completed' ? 'Completed' : 'Draft'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate PDF
                </>
              )}
            </button>
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

      {/* Notes */}
      {inspection.notes && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-600">{inspection.notes}</p>
        </motion.div>
      )}

      {/* Photos Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Photos ({photos.length})
          </h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {photos.length === 0 && uploadingPhotos.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No photos yet</h3>
            <p className="text-gray-500 mb-4">Add photos to document this inspection.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Existing photos */}
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layoutId={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group relative"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Inspection photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </motion.div>
            ))}

            {/* Uploading photos */}
            {uploadingPhotos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative"
              >
                <img
                  src={photo.preview}
                  alt="Uploading"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {photo.uploading && (
                    <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {photo.uploaded && (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {photo.error && (
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={selectedPhoto.id}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || 'Inspection photo'}
                className="w-full h-full object-contain rounded-lg"
              />
              {selectedPhoto.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-lg">{selectedPhoto.caption}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="absolute top-4 left-4 w-10 h-10 bg-red-500/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Inspection Modal */}
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
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Inspection?</h3>
            <p className="text-gray-500 text-center mb-6">
              This will permanently delete this inspection and all {photos.length} photo{photos.length !== 1 ? 's' : ''}. This action cannot be undone.
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
