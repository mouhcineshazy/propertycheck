import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PLANS, PlanType } from '@/lib/stripe/config';
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
    const { plan, billingCycle = 'monthly' } = body;

    // Validate plan type
    if (!plan || !['premium', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose premium or pro.' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Choose monthly or annual.' },
        { status: 400 }
      );
    }

    // Get the correct price ID based on plan and billing cycle
    const planConfig = PLANS[plan as PlanType];
    const priceId = billingCycle === 'annual'
      ? planConfig.annualPriceId
      : planConfig.priceId;

    if (!priceId) {
      // Price ID not configured - this is a setup issue
      console.error(`Price ID not configured for ${plan} (${billingCycle})`);
      return NextResponse.json(
        { error: 'This plan is not available yet. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
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
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout?plan=${plan}&canceled=true`,
      // Store user info for webhook processing
      metadata: {
        userId: user.id,
        plan: plan,
        billingCycle: billingCycle,
      },
      // Also store on subscription for future reference
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
          billingCycle: billingCycle,
        },
        // 14-day free trial
        trial_period_days: 14,
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
