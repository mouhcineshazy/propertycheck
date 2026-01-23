import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanByPriceId, isAnnualPrice } from '@/lib/stripe/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Lazy-initialized Supabase admin client with service role to bypass RLS
// This is required because webhooks don't have user context
// We use lazy initialization to avoid errors during build time when env vars aren't available
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

// Webhook handler for Stripe events
// Stripe sends events here when subscription status changes
export async function POST(request: NextRequest) {
  // Get raw body for signature verification - MUST be raw, not parsed JSON
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // Verify webhook signature to ensure request is from Stripe
  // This prevents malicious actors from spoofing webhook events
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log('Webhook verified:', event.type);

  try {
    // Handle different event types
    switch (event.type) {
      // Checkout completed - user finished payment flow
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // Subscription updated - plan change, renewal, etc.
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // Subscription deleted - canceled or expired
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // Invoice paid - subscription renewed successfully
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      // Invoice payment failed - charge declined
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      // Trial ending soon - send reminder (3 days before)
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook handler error:', message);

    // Return 500 so Stripe will retry the webhook
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout session
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  console.log(`Checkout completed for user ${userId}`);

  // Get subscription details for period end date
  let currentPeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to trial end (7 days)

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  }

  // Map to database status: 'free', 'premium', 'canceled', 'past_due'
  const status = 'premium'; // After checkout, user is premium (even if trialing)

  // Upsert subscription record (using correct table name: subscriptions)
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      status: status,
      current_period_end: currentPeriodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Failed to upsert subscription:', error);
    throw error;
  }
}

// Handle subscription updates (status changes, plan changes)
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Map Stripe status to our database status
  // Database allows: 'free', 'premium', 'canceled', 'past_due'
  const statusMap: Record<string, string> = {
    active: 'premium',
    trialing: 'premium', // Trialing users get premium features
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'free',
    incomplete_expired: 'free',
    paused: 'free',
  };

  const status = statusMap[subscription.status] || 'free';

  console.log(`Subscription updated: ${subscription.id}, status: ${status}`);

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);

  // Downgrade to free
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'free',
      stripe_subscription_id: null, // Clear the subscription ID
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to handle subscription deletion:', error);
    throw error;
  }
}

// Handle successful invoice payment (renewal)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  console.log(`Invoice paid for subscription: ${invoice.subscription}`);

  // Update period end date and ensure status is premium
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'premium',
      current_period_end: new Date((invoice.lines.data[0]?.period?.end || 0) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (error) {
    console.error('Failed to update subscription after invoice paid:', error);
    throw error;
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  console.log(`Invoice payment failed for subscription: ${invoice.subscription}`);

  // Mark subscription as past due
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (error) {
    console.error('Failed to update subscription after payment failure:', error);
    throw error;
  }

  // TODO: Send email notification about payment failure
}

// Handle trial ending soon notification
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  console.log(`Trial ending soon for subscription: ${subscription.id}`);

  if (userId) {
    // TODO: Send email reminder about trial ending
    console.log(`Would send trial ending reminder to user: ${userId}`);
  }
}
