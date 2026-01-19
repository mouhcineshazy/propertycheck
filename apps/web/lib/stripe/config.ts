import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 properties',
      '5 inspections per property',
      'Basic PDF reports',
      'Email support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Unlimited properties',
      'Unlimited inspections',
      'Professional PDF reports',
      'Priority support',
      'Comparison reports',
      'Share with landlords',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
