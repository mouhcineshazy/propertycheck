/**
 * @propertycheck/database
 *
 * Shared database package for PropertyCheck
 * Provides typed Supabase clients and database types
 */

// Client exports
export {
  getSupabaseBrowserClient,
  getSupabaseServerClient,
  supabase,
  getStoragePublicUrl,
  INSPECTION_PHOTOS_BUCKET,
  type TypedSupabaseClient,
} from './client';

// Type exports
export type {
  Database,
  Json,
  PropertyType,
  InspectionStatus,
  SubscriptionStatus,
  RoomType,
  User,
  UserInsert,
  UserUpdate,
  Property,
  PropertyInsert,
  PropertyUpdate,
  Inspection,
  InspectionInsert,
  InspectionUpdate,
  InspectionPhoto,
  InspectionPhotoInsert,
  InspectionPhotoUpdate,
  Subscription,
  SubscriptionInsert,
  SubscriptionUpdate,
  InspectionWithPhotos,
  InspectionWithProperty,
  PropertyWithInspections,
  FreeTierLimits,
} from './types';
