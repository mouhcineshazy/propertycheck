/**
 * Application Constants
 *
 * Centralized configuration values shared between mobile and web apps.
 * Keep these in sync with database constraints.
 */

// Property types available in the app
export const PROPERTY_TYPES = ['apartment', 'house', 'condo'] as const;
export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

// Inspection status options
export const INSPECTION_STATUSES = ['draft', 'completed'] as const;
export type InspectionStatusValue = (typeof INSPECTION_STATUSES)[number];

// Subscription status options
export const SUBSCRIPTION_STATUSES = ['free', 'premium', 'canceled', 'past_due'] as const;
export type SubscriptionStatusValue = (typeof SUBSCRIPTION_STATUSES)[number];

// Room types for photo organization (MVP: predefined only, no custom)
export const ROOM_TYPES = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'living_room', label: 'Living Room' },
  { value: 'other', label: 'Other' },
] as const;
export type RoomTypeValue = (typeof ROOM_TYPES)[number]['value'];

// Free tier limits - single source of truth
export const FREE_TIER_LIMITS = {
  maxProperties: 2,
  maxInspectionsTotal: 5,
  maxPhotosPerInspection: 20,
  maxPdfExportsPerMonth: 3,
  maxStorageMb: 100,
} as const;

// Premium tier limits
export const PREMIUM_TIER_LIMITS = {
  maxProperties: -1, // Unlimited
  maxInspectionsTotal: -1,
  maxPhotosPerInspection: 50,
  maxPdfExportsPerMonth: -1,
  maxStorageMb: 1024, // 1GB
} as const;

// Stripe pricing (CAD)
export const PRICING = {
  premium: {
    priceId: '', // Fill with your Stripe Price ID
    amount: 999, // $9.99 CAD in cents
    currency: 'cad',
    interval: 'month' as const,
    displayPrice: '$9.99 CAD/month',
  },
} as const;

// Share link configuration
export const SHARE_LINK_CONFIG = {
  expiryDays: 7,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Photo configuration
export const PHOTO_CONFIG = {
  maxSizeMb: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  compressionQuality: 0.8,
  thumbnailWidth: 200,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  address: { min: 5, max: 200 },
  notes: { max: 2000 },
  caption: { max: 200 },
  fullName: { min: 1, max: 100 },
} as const;

// App metadata
export const APP_CONFIG = {
  name: 'PropertyCheck',
  tagline: 'Rental inspections made simple',
  supportEmail: 'support@propertycheck.app',
  version: '0.1.0',
} as const;
