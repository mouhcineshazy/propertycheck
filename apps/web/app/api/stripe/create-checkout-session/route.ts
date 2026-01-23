import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PLANS } from '@/lib/stripe/config';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user using Supabase SSR
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Require authentication - checkout is for logged-in users only
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to continue.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { billingCycle = 'monthly' } = body;

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Choose monthly or annual.' },
        { status: 400 }
      );
    }

    // Get the correct price ID based on billing cycle (MVP: only premium plan)
    const priceId = billingCycle === 'annual'
      ? PLANS.premium.annualPriceId
      : PLANS.premium.priceId;

    if (!priceId) {
      // Price ID not configured - this is a setup issue
      console.error(`Price ID not configured for premium (${billingCycle})`);
      return NextResponse.json(
        { error: 'This plan is not available yet. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if user already has a Stripe customer ID (using correct table name)
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    // Build checkout session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // URLs for redirect after checkout
      success_url: `${request.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: `${request.nextUrl.origin}/dashboard?checkout=canceled`,
      // Store user info for webhook processing
      metadata: {
        userId: user.id,
        plan: 'premium',
        billingCycle: billingCycle,
      },
      // Also store on subscription for future reference
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: 'premium',
          billingCycle: billingCycle,
        },
        // 7-day free trial
        trial_period_days: 7,
      },
      // Allow promotion codes for marketing
      allow_promotion_codes: true,
      // Collect billing address for tax purposes
      billing_address_collection: 'auto',
      // Auto-collect tax if configured in Stripe
      automatic_tax: {
        enabled: true,
      },
    };

    // Use existing customer if available, otherwise set email for new customer
    if (existingSubscription?.stripe_customer_id) {
      sessionConfig.customer = existingSubscription.stripe_customer_id;
    } else {
      sessionConfig.customer_email = user.email ?? undefined;
    }

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Return session ID and URL for redirect
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    // Log error details for debugging (not exposed to client)
    console.error('Stripe checkout error:', error);

    // Return generic error to client
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
