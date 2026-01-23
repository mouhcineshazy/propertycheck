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
// 2 inspections = complete move-in & move-out cycle for 1 property
export const FREE_TIER_LIMITS = {
  maxProperties: 1,
  maxInspectionsTotal: 2, // Move-in + move-out
  maxPhotosPerInspection: 20,
  maxPdfExportsPerMonth: 1,
  maxStorageMb: 50,
  pdfRetentionDays: 7, // Free users: PDFs expire after 7 days
  comparisonReportWatermarked: true, // Free tier shows watermarked comparison
} as const;

// Premium tier limits
export const PREMIUM_TIER_LIMITS = {
  maxProperties: -1, // Unlimited
  maxInspectionsTotal: -1,
  maxPhotosPerInspection: 50,
  maxPdfExportsPerMonth: -1,
  maxStorageMb: 1024, // 1GB
  pdfRetentionDays: -1, // Unlimited (never expires)
} as const;

// Stripe pricing (CAD)
// Annual plan: 20% discount
// Monthly: $9.99/month = $119.88/year
// Annual: $95.88/year ($7.99/month × 12) = 20% savings
export const PRICING = {
  monthly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    amount: 999, // $9.99 CAD in cents
    currency: 'cad',
    interval: 'month' as const,
    displayPrice: '$9.99',
    displayInterval: '/month',
  },
  annual: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || '',
    amount: 9588, // $95.88 CAD in cents (20% discount)
    currency: 'cad',
    interval: 'year' as const,
    displayPrice: '$7.99',
    displayInterval: '/month',
    annualTotal: '$95.88/year',
    savings: 'Save 20%',
    savingsPercent: 20,
  },
  // Legacy support - default to monthly
  premium: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    amount: 999,
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
