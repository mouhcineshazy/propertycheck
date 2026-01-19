# Payments & Subscriptions

## Overview

PropertyCheck uses Stripe for payment processing, supporting subscription-based pricing with free trials, annual discounts, and promotional codes.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Payment Flow Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌───────────────┐     ┌───────────────┐      │
│  │  Client  │────▶│ API Route     │────▶│    Stripe     │      │
│  │          │     │ /checkout     │     │  Checkout     │      │
│  │          │◀────│               │◀────│  Session      │      │
│  └──────────┘     └───────────────┘     └───────────────┘      │
│       │                                         │               │
│       │  Redirect to Stripe                     │               │
│       ▼                                         │               │
│  ┌──────────┐                                   │               │
│  │  Stripe  │                                   │               │
│  │ Checkout │                                   │               │
│  │   Page   │                                   │               │
│  └────┬─────┘                                   │               │
│       │                                         │               │
│       │  Payment Success                        │               │
│       ▼                                         ▼               │
│  ┌──────────┐     ┌───────────────┐     ┌───────────────┐      │
│  │  Success │     │   Webhook     │◀────│   Stripe      │      │
│  │   Page   │     │   Handler     │     │   Events      │      │
│  └──────────┘     └───────┬───────┘     └───────────────┘      │
│                           │                                     │
│                           ▼                                     │
│                    ┌───────────────┐                           │
│                    │   Database    │                           │
│                    │ Subscriptions │                           │
│                    └───────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Stripe Configuration

### Client Setup

```typescript
// lib/stripe/config.ts
import Stripe from 'stripe';

// Lazy-initialized Stripe client
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

// Backward-compatible export
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get customers() { return getStripe().customers; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;
```

**Important**: The lazy initialization pattern prevents build-time errors when environment variables aren't available.

### Plan Configuration

```typescript
// lib/stripe/config.ts
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
    annualPrice: 99.99,
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
      properties: -1, // Unlimited
      inspectionsPerProperty: -1,
      teamMembers: 1,
    },
  },
  pro: {
    name: 'Pro',
    description: 'For property managers & agencies',
    price: 19.99,
    annualPrice: 199.99,
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
```

### Helper Functions

```typescript
// Get plan by Stripe price ID
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [planKey, planConfig] of Object.entries(PLANS)) {
    if (planConfig.priceId === priceId || planConfig.annualPriceId === priceId) {
      return planKey as PlanType;
    }
  }
  return null;
}

// Check if price ID is for annual billing
export function isAnnualPrice(priceId: string): boolean {
  for (const planConfig of Object.values(PLANS)) {
    if (planConfig.annualPriceId === priceId) {
      return true;
    }
  }
  return false;
}
```

## Checkout Flow

### Create Checkout Session

```typescript
// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, type PlanType } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, plan, billingCycle } = body as {
      priceId: string;
      plan: PlanType;
      billingCycle: 'monthly' | 'annual';
    };

    // Validate plan
    const planConfig = PLANS[plan];
    if (!planConfig || plan === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan,
        billingCycle,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
          plan,
          billingCycle,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      automatic_tax: { enabled: true },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Checkout Page Component

```typescript
// app/checkout/page.tsx (simplified)
'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/stripe/config';

export default function CheckoutPage() {
  const [plan, setPlan] = useState<'premium' | 'pro'>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlan = PLANS[plan];
  const price = billingCycle === 'annual'
    ? selectedPlan.annualPrice
    : selectedPlan.price;
  const priceId = billingCycle === 'annual'
    ? selectedPlan.annualPriceId
    : selectedPlan.priceId;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan, billingCycle }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... UI implementation
  );
}
```

## Webhook Handling

### Webhook Route

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanByPriceId, isAnnualPrice } from '@/lib/stripe/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Lazy-initialized Supabase admin client
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

### Event Handlers

```typescript
// Handle checkout completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan || 'premium';
  const billingCycle = session.metadata?.billingCycle || 'monthly';

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  let currentPeriodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  }

  const { error } = await getSupabaseAdmin()
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      plan,
      billing_cycle: billingCycle,
      status: 'trialing',
      current_period_end: currentPeriodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) || 'premium' : 'premium';
  const billingCycle = priceId && isAnnualPrice(priceId) ? 'annual' : 'monthly';

  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'expired',
    paused: 'paused',
  };

  const status = statusMap[subscription.status] || 'active';

  const { error } = await getSupabaseAdmin()
    .from('user_subscriptions')
    .update({
      plan,
      billing_cycle: billingCycle,
      status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) throw error;
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await getSupabaseAdmin()
    .from('user_subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) throw error;
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const { error } = await getSupabaseAdmin()
    .from('user_subscriptions')
    .update({
      status: 'active',
      current_period_end: new Date(
        (invoice.lines.data[0]?.period?.end || 0) * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (error) throw error;
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const { error } = await getSupabaseAdmin()
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (error) throw error;
}

// Handle trial ending (3 days before)
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  // TODO: Send email reminder
  console.log(`Trial ending soon for user: ${userId}`);
}
```

## Stripe Dashboard Setup

### Products & Prices

Create these products in Stripe Dashboard:

| Product | Price ID Environment Variable | Amount |
|---------|-------------------------------|--------|
| Premium Monthly | STRIPE_PREMIUM_PRICE_ID | $9.99 CAD |
| Premium Annual | STRIPE_PREMIUM_ANNUAL_PRICE_ID | $99.99 CAD |
| Pro Monthly | STRIPE_PRO_PRICE_ID | $19.99 CAD |
| Pro Annual | STRIPE_PRO_ANNUAL_PRICE_ID | $199.99 CAD |

### Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from Stripe Dashboard)
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
```

## Subscription State Management

### Check Subscription Status

```typescript
// Client-side
async function getSubscriptionStatus() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .single();

  if (error) return { plan: 'free', status: 'free' };
  return data;
}

// Server-side (with RPC)
const { data: status } = await supabase.rpc('get_user_subscription_status');
```

### Limit Enforcement

```typescript
// Check if user can create more properties
async function canCreateProperty() {
  const subscription = await getSubscriptionStatus();
  const plan = PLANS[subscription.plan as PlanType];

  if (plan.limits.properties === -1) return true; // Unlimited

  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  return (count || 0) < plan.limits.properties;
}
```

## Customer Portal (Future)

For subscription management (cancel, upgrade, payment method):

```typescript
// Create portal session
async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return session.url;
}
```

---

*See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for subscription table details.*
