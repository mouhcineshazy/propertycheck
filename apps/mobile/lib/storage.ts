/**
 * Supabase Storage Utilities
 *
 * Helper functions for uploading and managing inspection photos.
 * Uses expo-file-system/legacy for SDK 54 compatibility.
 */

import { INSPECTION_PHOTOS_BUCKET } from '@propertycheck/database';
import { getMobileSupabaseClient } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Upload a photo to Supabase Storage.
 *
 * The uri is expected to be already compressed/resized (done at capture time in
 * the inspection form, so the cost is spread across the session rather than
 * stacked into the submit). Always uploaded as JPEG.
 *
 * @param uri - Local file URI (already compressed) from camera/picker
 * @param inspectionId - ID of the inspection this photo belongs to
 * @param index - Photo index for unique naming
 * @returns Storage path or null on error
 */
export async function uploadInspectionPhoto(
  uri: string,
  inspectionId: string,
  index: number
): Promise<{ path: string; error: string | null }> {
  try {
    const supabase = getMobileSupabaseClient();

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { path: '', error: 'Not authenticated' };

    // Path: {user_id}/{inspection_id}/{timestamp}_{index}.jpg
    // The user_id prefix is enforced by the storage RLS policy
    const fileName = `${user.id}/${inspectionId}/${Date.now()}_${index}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(INSPECTION_PHOTOS_BUCKET)
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { path: '', error: error.message };
    }

    return { path: data.path, error: null };
  } catch (err) {
    console.error('Upload exception:', err);
    return { path: '', error: 'Failed to upload photo' };
  }
}

/**
 * Get public URL for a storage path
 */
export function getPhotoUrl(storagePath: string): string {
  if (!storagePath) {
    console.warn('getPhotoUrl called with empty storagePath');
    return '';
  }
  const supabase = getMobileSupabaseClient();
  const { data } = supabase.storage
    .from(INSPECTION_PHOTOS_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Delete a photo from storage
 */
export async function deleteInspectionPhoto(
  storagePath: string
): Promise<{ error: string | null }> {
  try {
    const supabase = getMobileSupabaseClient();
    const { error } = await supabase.storage
      .from(INSPECTION_PHOTOS_BUCKET)
      .remove([storagePath]);

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch {
    return { error: 'Failed to delete photo' };
  }
}

/**
 * Delete all photos for an inspection
 */
export async function deleteInspectionPhotos(
  inspectionId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = getMobileSupabaseClient();

    // List all files in the inspection folder
    const { data: files, error: listError } = await supabase.storage
      .from(INSPECTION_PHOTOS_BUCKET)
      .list(inspectionId);

    if (listError) {
      return { error: listError.message };
    }

    if (!files || files.length === 0) {
      return { error: null };
    }

    // Delete all files
    const filePaths = files.map((f) => `${inspectionId}/${f.name}`);
    const { error: deleteError } = await supabase.storage
      .from(INSPECTION_PHOTOS_BUCKET)
      .remove(filePaths);

    if (deleteError) {
      return { error: deleteError.message };
    }

    return { error: null };
  } catch {
    return { error: 'Failed to delete photos' };
  }
}
