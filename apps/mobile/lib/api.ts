/**
 * API Service Functions
 *
 * All database operations for the mobile app.
 * Uses the shared database client with proper error handling.
 */

import { getSupabaseBrowserClient } from '@propertycheck/database';
import type { Property, Inspection, InspectionPhoto } from '@propertycheck/database';
import type {
  PropertyFormData,
  InspectionWithPhotos,
  PropertyWithInspections,
  LocalPhoto,
} from './types';
import { uploadInspectionPhoto, deleteInspectionPhotos } from './storage';

// ============================================
// PROPERTIES
// ============================================

/**
 * Fetch all properties for the current user
 */
export async function fetchProperties(): Promise<{
  data: Property[] | null;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'Failed to fetch properties' };
  }
}

/**
 * Fetch a single property with its inspections
 */
export async function fetchPropertyWithInspections(
  propertyId: string
): Promise<PropertyWithInspections> {
  const supabase = getSupabaseBrowserClient();

  // Fetch property
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (propError) {
    throw new Error(propError.message);
  }

  // Fetch inspections
  const { data: inspections, error: inspError } = await supabase
    .from('inspections')
    .select('*')
    .eq('property_id', propertyId)
    .order('inspection_date', { ascending: false });

  if (inspError) {
    throw new Error(inspError.message);
  }

  return { ...property, inspections: inspections || [] };
}

/**
 * Create a new property
 */
export async function createProperty(data: PropertyFormData): Promise<Property> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      user_id: user.id,
      address: data.address,
      property_type: data.property_type,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return property;
}

/**
 * Update a property
 */
export async function updateProperty(
  propertyId: string,
  data: Partial<PropertyFormData>
): Promise<Property> {
  const supabase = getSupabaseBrowserClient();
  const { data: property, error } = await supabase
    .from('properties')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return property;
}

/**
 * Delete a property and all its inspections
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  // First, get all inspections to delete their photos
  const { data: inspections } = await supabase
    .from('inspections')
    .select('id')
    .eq('property_id', propertyId);

  // Delete photos from storage for each inspection
  if (inspections) {
    for (const inspection of inspections) {
      await deleteInspectionPhotos(inspection.id);
    }
  }

  // Delete property (cascades to inspections and photos in DB)
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================
// INSPECTIONS
// ============================================

/**
 * Fetch an inspection with its photos
 */
export async function fetchInspectionWithPhotos(
  inspectionId: string
): Promise<InspectionWithPhotos> {
  const supabase = getSupabaseBrowserClient();

  // Fetch inspection with property
  const { data: inspection, error: inspError } = await supabase
    .from('inspections')
    .select('*, property:properties(*)')
    .eq('id', inspectionId)
    .single();

  if (inspError) {
    throw new Error(inspError.message);
  }

  // Fetch photos
  const { data: photos, error: photoError } = await supabase
    .from('inspection_photos')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('sort_order', { ascending: true });

  if (photoError) {
    throw new Error(photoError.message);
  }

  return {
    ...inspection,
    photos: photos || [],
  };
}

/**
 * Create a new inspection with photos
 */
export async function createInspection(
  propertyId: string,
  notes: string | undefined,
  photos: LocalPhoto[]
): Promise<Inspection> {
  const supabase = getSupabaseBrowserClient();

  // Create inspection record
  const { data: inspection, error: inspError } = await supabase
    .from('inspections')
    .insert({
      property_id: propertyId,
      notes: notes || null,
      status: 'draft',
      inspection_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (inspError) {
    throw new Error(inspError.message);
  }

  // Upload photos and create photo records
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    console.log(`Uploading photo ${i + 1}/${photos.length}:`, photo.uri);

    const { path, error: uploadError } = await uploadInspectionPhoto(
      photo.uri,
      inspection.id,
      i
    );

    if (uploadError) {
      console.error('Photo upload failed:', uploadError);
      continue;
    }

    console.log('Photo uploaded successfully, storage_path:', path);

    // Create photo record
    const { error: insertError } = await supabase.from('inspection_photos').insert({
      inspection_id: inspection.id,
      storage_path: path,
      caption: photo.caption || null,
      room_type: photo.room_type || 'other',
      sort_order: i,
    });

    if (insertError) {
      console.error('Failed to create photo record:', insertError);
    } else {
      console.log('Photo record created successfully');
    }
  }

  return inspection;
}

/**
 * Update inspection status to completed
 */
export async function completeInspection(inspectionId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from('inspections')
    .update({ status: 'completed' })
    .eq('id', inspectionId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Delete an inspection and its photos
 */
export async function deleteInspection(inspectionId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  // Delete photos from storage
  await deleteInspectionPhotos(inspectionId);

  // Delete inspection (cascades to photo records)
  const { error } = await supabase
    .from('inspections')
    .delete()
    .eq('id', inspectionId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Generate a shareable link for an inspection
 */
export async function getShareableLink(
  inspectionId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Get or refresh share token
    const { data, error } = await supabase
      .from('inspections')
      .select('share_token')
      .eq('id', inspectionId)
      .single();

    if (error) {
      return { url: null, error: error.message };
    }

    // Construct shareable URL
    const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app';
    const url = `${baseUrl}/share/${data.share_token}`;

    return { url, error: null };
  } catch (err) {
    return { url: null, error: 'Failed to generate link' };
  }
}

// ============================================
// USER & SUBSCRIPTION
// ============================================

/**
 * Check free tier limits for the current user
 */
export async function checkFreeTierLimits(): Promise<{
  data: {
    propertyCount: number;
    inspectionCount: number;
    canAddProperty: boolean;
    canAddInspection: boolean;
  } | null;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Call the database function
    const { data, error } = await supabase.rpc('check_free_tier_limits');

    if (error) {
      return { data: null, error: error.message };
    }

    const limits = data?.[0];
    return {
      data: {
        propertyCount: limits?.properties_count || 0,
        inspectionCount: limits?.inspections_count || 0,
        canAddProperty: limits?.can_create_property || false,
        canAddInspection: limits?.can_create_inspection || false,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: 'Failed to check limits' };
  }
}
