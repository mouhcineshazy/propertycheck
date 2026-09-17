/**
 * API Service Functions
 *
 * All database operations for the mobile app.
 * Uses the shared database client with proper error handling.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { FREE_TIER_LIMITS } from '@propertycheck/shared';
import { getMobileSupabaseClient } from './supabase';
import type { Property, Inspection } from '@propertycheck/database';
import type {
  PropertyFormData,
  InspectionWithPhotos,
  PropertyWithInspections,
  PropertyWithSummaries,
  InspectionSummary,
  RoomSummaryPhoto,
  LocalPhoto,
} from './types';
import { uploadInspectionPhoto, deleteInspectionPhotos } from './storage';
import { mapLimit } from './concurrency';

// Photos uploaded at once during inspection creation. Enough to hide latency,
// low enough not to saturate the connection or spike memory with many base64
// blobs resident simultaneously.
const UPLOAD_CONCURRENCY = 4;

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
    const supabase = getMobileSupabaseClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch properties' };
  }
}

/**
 * Fetch a single property with its inspections
 */
export async function fetchPropertyWithInspections(
  propertyId: string
): Promise<PropertyWithInspections> {
  const supabase = getMobileSupabaseClient();

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

// Category ordering for room groups (matches the PDF report grouping).
const ROOM_ORDER: Record<string, number> = {
  living_room: 1,
  kitchen: 2,
  bedroom: 3,
  bathroom: 4,
  other: 5,
};

type RawSummaryPhoto = {
  id: string;
  storage_path: string;
  room_type: string | null;
  room_label: string | null;
  sort_order: number;
};

// Reduce one inspection's photos to a single representative photo per room,
// grouped the same way the report is (room_label, else room_type category).
function summarizeRoomPhotos(photos: RawSummaryPhoto[]): RoomSummaryPhoto[] {
  const groups = new Map<string, RoomSummaryPhoto & { order: number; sort: number }>();
  for (const photo of photos) {
    const key = photo.room_label || photo.room_type || 'other';
    const existing = groups.get(key);
    if (!existing || photo.sort_order < existing.sort) {
      groups.set(key, {
        id: photo.id,
        roomType: photo.room_type,
        roomLabel: photo.room_label,
        storagePath: photo.storage_path,
        order: ROOM_ORDER[photo.room_type ?? 'other'] ?? 99,
        sort: photo.sort_order,
      });
    }
  }
  return Array.from(groups.values())
    .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.sort - b.sort))
    .map(({ id, roomType, roomLabel, storagePath }) => ({ id, roomType, roomLabel, storagePath }));
}

/**
 * Fetch every property with a lightweight summary of each inspection: one photo
 * per documented room, a photo count, and the derived move-in / move-out role
 * (first / last inspection chronologically). Powers the photo-first property list.
 */
export async function fetchPropertiesWithSummaries(): Promise<PropertyWithSummaries[]> {
  const supabase = getMobileSupabaseClient();
  const { data, error } = await supabase
    .from('properties')
    .select(
      '*, inspections(*, inspection_photos(id, storage_path, room_type, room_label, sort_order)), bundle_purchases(expires_at)'
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // The nested embeds aren't in the generated Row types; shape them explicitly.
  const rows = (data ?? []) as unknown as (Property & {
    inspections: (Inspection & { inspection_photos: RawSummaryPhoto[] })[];
    bundle_purchases: { expires_at: string }[];
  })[];

  const now = Date.now();

  return rows.map((property) => {
    const chronological = [...property.inspections].sort(
      (a, b) => new Date(a.inspection_date).getTime() - new Date(b.inspection_date).getTime()
    );
    const lastIndex = chronological.length - 1;

    const inspections: InspectionSummary[] = chronological.map((inspection, index) => {
      const photos = inspection.inspection_photos ?? [];
      const role: InspectionSummary['role'] =
        index === 0 ? 'moveIn' : index === lastIndex ? 'moveOut' : 'inspection';
      const { inspection_photos: _photos, ...rest } = inspection;
      return {
        ...rest,
        role,
        roomPhotos: summarizeRoomPhotos(photos),
        photoCount: photos.length,
      };
    });

    const completedCount = inspections.filter((i) => i.status === 'completed').length;
    const isLocked = (property.bundle_purchases ?? []).some(
      (b) => new Date(b.expires_at).getTime() > now
    );

    return { ...property, inspections, completedCount, isLocked };
  });
}

/**
 * Per-property inspection gate — mirrors the DB rule (universal 2-completed cap
 * plus the Moving Bundle lock). The database triggers are the real guard; this
 * lets the UI block before the user does any work.
 */
export async function getPropertyInspectionAccess(propertyId: string): Promise<{
  completedCount: number;
  isLocked: boolean;
  canAdd: boolean;
}> {
  const supabase = getMobileSupabaseClient();
  const [{ count }, bundle] = await Promise.all([
    supabase
      .from('inspections')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .eq('status', 'completed'),
    checkBundleAccess(propertyId),
  ]);

  const completedCount = count ?? 0;
  const isLocked = bundle.hasBundle;
  return {
    completedCount,
    isLocked,
    canAdd: !isLocked && completedCount < FREE_TIER_LIMITS.maxCompletedInspectionsPerProperty,
  };
}

/**
 * Create a new property
 */
export async function createProperty(data: PropertyFormData): Promise<Property> {
  const supabase = getMobileSupabaseClient();
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
  const supabase = getMobileSupabaseClient();
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
  const supabase = getMobileSupabaseClient();

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
  const supabase = getMobileSupabaseClient();

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
 * Includes server-side free tier limit enforcement
 */
export async function createInspection(
  propertyId: string,
  notes: string | undefined,
  photos: LocalPhoto[],
  onProgress?: (uploaded: number, total: number) => void
): Promise<Inspection> {
  const supabase = getMobileSupabaseClient();

  // Pre-check the per-property rule (2 completed max, or finalized by a bundle)
  // so we fail before uploading anything. The DB triggers are the real guard.
  const access = await getPropertyInspectionAccess(propertyId);
  if (!access.canAdd) {
    throw new Error(
      access.isLocked
        ? 'This property has been finalized with a Moving Bundle and can no longer be changed.'
        : 'This property already has 2 completed inspections (move-in and move-out).'
    );
  }

  // Create inspection record (DB trigger enforces the same rules)
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

  // Upload photos in parallel (bounded pool) instead of serially — a 20-photo
  // inspection on cellular was minutes of blocking otherwise. sort_order keeps
  // the original per-room ordering regardless of which upload finishes first.
  let uploaded = 0;
  onProgress?.(0, photos.length);

  await mapLimit(photos, UPLOAD_CONCURRENCY, async (photo, i) => {
    const { path, error: uploadError } = await uploadInspectionPhoto(
      photo.uri,
      inspection.id,
      i
    );

    if (uploadError) {
      console.error(`Photo ${i + 1} upload failed:`, uploadError);
    } else {
      const { error: insertError } = await supabase.from('inspection_photos').insert({
        inspection_id: inspection.id,
        storage_path: path,
        caption: photo.caption || null,
        room_type: photo.room_type || 'other',
        room_label: photo.room_label || null,
        sort_order: i,
      });
      if (insertError) {
        console.error(`Photo ${i + 1} record failed:`, insertError);
      }
    }

    uploaded += 1;
    onProgress?.(uploaded, photos.length);
  });

  return inspection;
}

/**
 * Update inspection status to completed
 */
export async function completeInspection(inspectionId: string): Promise<void> {
  const supabase = getMobileSupabaseClient();
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
  const supabase = getMobileSupabaseClient();

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
    const supabase = getMobileSupabaseClient();

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
  } catch {
    return { url: null, error: 'Failed to generate link' };
  }
}

// ============================================
// USER & SUBSCRIPTION
// ============================================


// ============================================
// COMPARISON REPORTS
// ============================================

/**
 * Fetch comparison data for a property's two inspections
 */
export async function fetchComparisonData(propertyId: string): Promise<{
  data: {
    property: Property;
    moveInInspection: InspectionWithPhotos;
    moveOutInspection: InspectionWithPhotos;
  } | null;
  error: string | null;
}> {
  try {
    const supabase = getMobileSupabaseClient();

    // Fetch property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propError) {
      return { data: null, error: propError.message };
    }

    // Fetch completed inspections ordered by date
    const { data: inspections, error: inspError } = await supabase
      .from('inspections')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'completed')
      .order('inspection_date', { ascending: true });

    if (inspError) {
      return { data: null, error: inspError.message };
    }

    if (!inspections || inspections.length < 2) {
      return { data: null, error: 'Need at least 2 completed inspections to compare' };
    }

    // Get the first and last completed inspections (move-in and move-out)
    const moveInInsp = inspections[0];
    const moveOutInsp = inspections[inspections.length - 1];

    // Fetch photos for both inspections
    const [moveInPhotos, moveOutPhotos] = await Promise.all([
      supabase
        .from('inspection_photos')
        .select('*')
        .eq('inspection_id', moveInInsp.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('inspection_photos')
        .select('*')
        .eq('inspection_id', moveOutInsp.id)
        .order('sort_order', { ascending: true }),
    ]);

    if (moveInPhotos.error || moveOutPhotos.error) {
      return { data: null, error: 'Failed to load inspection photos' };
    }

    return {
      data: {
        property,
        moveInInspection: {
          ...moveInInsp,
          photos: moveInPhotos.data || [],
          property,
        },
        moveOutInspection: {
          ...moveOutInsp,
          photos: moveOutPhotos.data || [],
          property,
        },
      },
      error: null,
    };
  } catch {
    return { data: null, error: 'Failed to fetch comparison data' };
  }
}

/**
 * Send an inspection PDF report to a recipient by email via the server
 */
export async function sendReportByEmail(params: {
  inspectionId: string;
  recipientEmail: string;
  pdfUri: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getMobileSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const pdfBase64 = await FileSystem.readAsStringAsync(params.pdfUri, {
      encoding: 'base64',
    });

    const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app';
    const response = await fetch(`${appUrl}/api/reports/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        inspectionId: params.inspectionId,
        recipientEmail: params.recipientEmail,
        pdfBase64,
      }),
    });

    const data = await response.json() as { success?: boolean; error?: string };

    if (!response.ok) {
      return { success: false, error: data.error ?? 'Failed to send email' };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return { success: false, error: message };
  }
}

/**
 * Check if a property has enough inspections for comparison
 */
export async function canGenerateComparison(propertyId: string): Promise<{
  canCompare: boolean;
  completedCount: number;
}> {
  try {
    const supabase = getMobileSupabaseClient();
    const { count, error } = await supabase
      .from('inspections')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .eq('status', 'completed');

    if (error) {
      return { canCompare: false, completedCount: 0 };
    }

    return {
      canCompare: (count || 0) >= 2,
      completedCount: count || 0,
    };
  } catch {
    return { canCompare: false, completedCount: 0 };
  }
}

// ============================================
// MOVING BUNDLE
// ============================================

/**
 * Check if the user has an active moving bundle for a property.
 * A bundle covers move-in + move-out + comparison, valid 18 months from purchase.
 */
export async function checkBundleAccess(propertyId: string): Promise<{
  hasBundle: boolean;
  expiresAt: string | null;
}> {
  try {
    const supabase = getMobileSupabaseClient();
    const now = new Date().toISOString();

    const { data } = await supabase
      .from('bundle_purchases')
      .select('expires_at')
      .eq('property_id', propertyId)
      .gt('expires_at', now)
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return { hasBundle: !!data, expiresAt: data?.expires_at ?? null };
  } catch {
    return { hasBundle: false, expiresAt: null };
  }
}

// Bundle and report purchases are sold via native In-App Purchase (RevenueCat),
// not Stripe web checkout — see lib/revenuecat.ts (purchaseMovingBundle /
// purchaseReportUnlock). Apple Guideline 3.1.1 / Play Payments policy forbid
// selling digital goods through an external web checkout on mobile.

// ============================================
// ACCOUNT
// ============================================

/**
 * Permanently delete the current user's account and all associated data.
 *
 * Deleting a Supabase auth user requires the service-role key, which mobile must
 * never hold. So this hands the user's session token to the web API route, which
 * validates the Bearer token server-side, then service-role deletes Storage
 * photos + DB rows + the auth user (PIPEDA / Quebec Law 25 right to erasure).
 * The route is idempotent — a partial delete can be safely retried.
 */
export async function deleteAccount(): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getMobileSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://propertycheck.app';
    const response = await fetch(`${appUrl}/api/account/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json() as { success?: boolean; error?: string };

    if (!response.ok) {
      return { success: false, error: data.error ?? 'Failed to delete account' };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete account';
    return { success: false, error: message };
  }
}
