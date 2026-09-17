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
  // Universal rule (all tiers): a property may hold at most 2 COMPLETED
  // inspections. Enforced in the DB (see 20260916_inspection_completion_rules).
  maxCompletedInspectionsPerProperty: 2,
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

// Pay-per-use pricing (CAD) — the PRIMARY monetization path.
// Usage is transactional (people inspect ~twice per lease), so the one-time
// products are the hero; the subscription (PRICING above) is the secondary tier
// for frequent movers / people managing multiple places.
//
// These are one-time In-App Purchases (StoreKit / Play Billing), mapped in
// RevenueCat via IAP_PRODUCT_IDS. The real charge is the price set on each store
// product — the amounts below are the canonical display reference; keep them in
// sync with the store prices manually.
export const PAY_PER_USE = {
  report: {
    amount: 1499, // $14.99 CAD — one clean, watermark-free, shareable report
    currency: 'cad',
    displayPrice: '$14.99',
    period: 'one-time',
  },
  bundle: {
    // The hero product: matches the "I'm moving" purchase intent.
    amount: 2499, // $24.99 CAD — move-in + move-out + comparison, one property, 18 mo
    currency: 'cad',
    displayPrice: '$24.99',
    period: 'one-time',
    validityMonths: 18,
  },
} as const;

// Native In-App Purchase product identifiers (RevenueCat).
// These are the store-level product IDs created in App Store Connect + Play Console
// and mapped in the RevenueCat dashboard. On mobile, digital goods MUST be sold via
// these (Apple Guideline 3.1.1 / Play Payments policy) — never Stripe web checkout.
// The prices above (PAY_PER_USE / PRICING) are display-only; the real charge is the
// price you set on each store product. Keep the two in sync manually.
// The RevenueCat webhook (supabase/functions/revenuecat-webhook) grants entitlements
// from these product IDs — change one, change the webhook mapping too.
export const IAP_PRODUCT_IDS = {
  report: 'pc_report_unlock', // consumable — one watermark-free report
  bundle: 'pc_moving_bundle', // consumable — move-in + move-out + comparison, 18 mo
  premiumMonthly: 'pc_premium_monthly', // auto-renewing subscription
  premiumAnnual: 'pc_premium_annual', // auto-renewing subscription
} as const;

// RevenueCat entitlement identifier that grants premium (subscription) access.
export const REVENUECAT_PREMIUM_ENTITLEMENT = 'premium';

// Share link configuration
export const SHARE_LINK_CONFIG = {
  expiryDays: 7,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Photo configuration
export const PHOTO_CONFIG = {
  maxSizeMb: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  // Balanced compression: resize longest side to maxDimension and re-encode JPEG
  // at compressionQuality. Keeps damage/detail legible while cutting storage
  // ~5-10x. Note: re-encoding strips EXIF; the immutable photo `created_at` is
  // the chain-of-custody timestamp.
  maxDimension: 1600,
  compressionQuality: 0.6,
  thumbnailWidth: 200,
} as const;

// Max photos attached to a single room within an inspection. The per-inspection
// cap (FREE_TIER_LIMITS / PREMIUM_TIER_LIMITS maxPhotosPerInspection) still applies
// across all rooms.
export const MAX_PHOTOS_PER_ROOM = 10;

// Max distinct rooms (category-numbered or custom-named) per inspection.
export const MAX_ROOMS_PER_INSPECTION = 20;

// Max length of a custom room name.
export const MAX_ROOM_NAME_LENGTH = 40;

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
