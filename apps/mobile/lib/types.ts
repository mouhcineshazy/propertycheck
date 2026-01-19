/**
 * Mobile App Types
 *
 * Local types that extend or complement the shared database types.
 * These are specific to the mobile app's needs.
 */

import { Property, Inspection, InspectionPhoto } from '@propertycheck/database';

// Extended types with relations
export type PropertyWithInspections = Property & {
  inspections: Inspection[];
};

export type InspectionWithPhotos = Inspection & {
  photos: InspectionPhoto[];
  property?: Property;
};

// Form input types (must match database PropertyType)
export type PropertyFormData = {
  address: string;
  property_type: 'apartment' | 'house' | 'condo';
  notes?: string;
};

export type InspectionFormData = {
  property_id: string;
  notes?: string;
  photos: LocalPhoto[];
};

// Local photo before upload
export type LocalPhoto = {
  uri: string;
  caption?: string;
  room_type?: 'bedroom' | 'bathroom' | 'kitchen' | 'living_room' | 'other';
};

// Navigation params
export type PropertyRouteParams = {
  id: string;
};

export type InspectionRouteParams = {
  id: string;
  propertyId?: string;
};

// API response types
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
