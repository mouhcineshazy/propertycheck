import Stripe from 'stripe';
import { PRICING, FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from '@propertycheck/shared';

// Lazy-initialized Stripe client to avoid errors during build time
// when environment variables aren't available
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Keep backward compatibility with existing imports
// This getter will throw at build time if accessed, but that's expected
// API routes should use getStripe() instead
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get customers() { return getStripe().customers; },
  get webhooks() { return getStripe().webhooks; },
  get billingPortal() { return getStripe().billingPortal; },
} as unknown as Stripe;

// MVP Plan configuration - simplified to Free and Premium only
// Price IDs are created in Stripe Dashboard
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Try PropertyCheck with basic features',
    price: 0,
    annualPrice: 0,
    priceId: null,
    annualPriceId: null,
    features: [
      `${FREE_TIER_LIMITS.maxProperties} property`,
      `${FREE_TIER_LIMITS.maxInspectionsTotal} inspection`,
      `PDF reports (${FREE_TIER_LIMITS.pdfRetentionDays}-day storage)`,
      'Email support',
    ],
    limits: FREE_TIER_LIMITS,
  },
  premium: {
    name: 'Premium',
    description: 'Unlimited properties and inspections',
    price: PRICING.monthly.amount / 100,
    annualPrice: PRICING.annual.amount / 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || null,
    features: [
      'Unlimited properties',
      'Unlimited inspections',
      'Permanent PDF storage',
      'Priority support',
      'Comparison reports',
      'Share with landlords',
    ],
    limits: PREMIUM_TIER_LIMITS,
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Helper to get plan by price ID (useful for webhook handling)
export function getPlanByPriceId(priceId: string): PlanType | null {
  const premiumPlan = PLANS.premium;
  if (premiumPlan.priceId === priceId || premiumPlan.annualPriceId === priceId) {
    return 'premium';
  }
  return null;
}

// Check if a price ID is for annual billing
export function isAnnualPrice(priceId: string): boolean {
  return PLANS.premium.annualPriceId === priceId;
}
