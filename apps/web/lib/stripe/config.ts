import Stripe from 'stripe';

// Initialize Stripe with the API version that matches installed types
// Update this when updating the stripe package
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Plan configuration with pricing and feature details
// Price IDs should be created in Stripe Dashboard and stored in env vars
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Get started with basic features',
    price: 0,
    annualPrice: 0,
    priceId: null,
    annualPriceId: null,
    features: [
      '3 properties',
      '5 inspections per property',
      'Basic PDF reports',
      'Email support',
    ],
    limits: {
      properties: 3,
      inspectionsPerProperty: 5,
      teamMembers: 1,
    },
  },
  premium: {
    name: 'Premium',
    description: 'Perfect for landlords & tenants',
    price: 9.99,
    annualPrice: 99.99, // ~17% savings (vs $119.88 yearly)
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    annualPriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
    features: [
      'Unlimited properties',
      'Unlimited inspections',
      'Professional PDF reports',
      'Priority support',
      'Comparison reports',
      'Share with landlords',
    ],
    limits: {
      properties: -1, // -1 = unlimited
      inspectionsPerProperty: -1,
      teamMembers: 1,
    },
  },
  pro: {
    name: 'Pro',
    description: 'For property managers & agencies',
    price: 19.99,
    annualPrice: 199.99, // ~17% savings (vs $239.88 yearly)
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    annualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    features: [
      'Everything in Premium',
      'Team collaboration (up to 5)',
      'API access',
      'Custom branding on reports',
      'Bulk property import',
      'Dedicated account manager',
      'Phone support',
    ],
    limits: {
      properties: -1,
      inspectionsPerProperty: -1,
      teamMembers: 5,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Helper to get plan by price ID (useful for webhook handling)
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [planKey, planConfig] of Object.entries(PLANS)) {
    if (planConfig.priceId === priceId || planConfig.annualPriceId === priceId) {
      return planKey as PlanType;
    }
  }
  return null;
}

// Check if a price ID is for annual billing
export function isAnnualPrice(priceId: string): boolean {
  for (const planConfig of Object.values(PLANS)) {
    if (planConfig.annualPriceId === priceId) {
      return true;
    }
  }
  return false;
}
