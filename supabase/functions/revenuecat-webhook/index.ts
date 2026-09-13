// RevenueCat webhook — the SOURCE OF TRUTH for IAP entitlements on mobile.
//
// Mirrors what the Stripe webhook does, but for native purchases:
//   - report unlock  -> inspections.report_unlocked = true
//   - moving bundle  -> insert bundle_purchases (18-month validity)
//   - premium sub    -> upsert subscriptions.status
//
// Never grant entitlements from the app after a purchase redirect — grant here,
// where RevenueCat has already validated the receipt with Apple/Google.
//
// Deploy:   supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secrets:  supabase secrets set REVENUECAT_WEBHOOK_AUTH=<random-string>
//           (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically)
// In the RevenueCat dashboard, set the webhook Authorization header to the same
// REVENUECAT_WEBHOOK_AUTH value so spoofed calls are rejected.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Must match IAP_PRODUCT_IDS in packages/shared/src/constants.ts.
const PRODUCT = {
  report: 'pc_report_unlock',
  bundle: 'pc_moving_bundle',
  premiumMonthly: 'pc_premium_monthly',
  premiumAnnual: 'pc_premium_annual',
} as const;

const BUNDLE_VALIDITY_MONTHS = 18;

interface RevenueCatEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  entitlement_ids?: string[] | null;
  transaction_id?: string;
  expiration_at_ms?: number | null;
  store?: string;
  environment?: string;
  subscriber_attributes?: Record<string, { value?: string }>;
}

const admin = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const isSubscriptionProduct = (id?: string) =>
  id === PRODUCT.premiumMonthly || id === PRODUCT.premiumAnnual;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  // Shared-secret auth. RevenueCat sends the value configured on the webhook.
  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (!expected || req.headers.get('Authorization') !== expected) {
    return json(401, { error: 'Unauthorized' });
  }

  let event: RevenueCatEvent;
  try {
    const body = await req.json();
    event = body.event as RevenueCatEvent;
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  if (!event?.type) return json(400, { error: 'Missing event' });

  const userId = event.app_user_id ?? event.original_app_user_id;
  if (!userId || userId.startsWith('$RCAnonymousID:')) {
    // Not tied to a Supabase user yet (e.g. purchase before login). Ack so
    // RevenueCat stops retrying; nothing to grant.
    console.log(`Skipping ${event.type}: no resolvable app_user_id`);
    return json(200, { received: true });
  }

  const db = admin();

  try {
    switch (event.type) {
      case 'NON_RENEWING_PURCHASE': {
        const contextId = event.subscriber_attributes?.pc_context_id?.value;
        if (!contextId) {
          console.error('NON_RENEWING_PURCHASE without pc_context_id');
          return json(200, { received: true });
        }

        if (event.product_id === PRODUCT.report) {
          const { error } = await db
            .from('inspections')
            .update({ report_unlocked: true })
            .eq('id', contextId);
          if (error) throw error;
          console.log(`Report unlocked for inspection ${contextId}`);
          return json(200, { received: true });
        }

        if (event.product_id === PRODUCT.bundle) {
          const txnId = event.transaction_id ?? null;
          if (txnId) {
            const { data: existing } = await db
              .from('bundle_purchases')
              .select('id')
              .eq('revenuecat_transaction_id', txnId)
              .maybeSingle();
            if (existing) {
              console.log(`Bundle already recorded for txn ${txnId}`);
              return json(200, { received: true });
            }
          }
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + BUNDLE_VALIDITY_MONTHS);
          const { error } = await db.from('bundle_purchases').insert({
            user_id: userId,
            property_id: contextId,
            revenuecat_transaction_id: txnId,
            expires_at: expiresAt.toISOString(),
          });
          if (error) throw error;
          console.log(`Bundle created for property ${contextId}, user ${userId}`);
          return json(200, { received: true });
        }

        console.log(`Unhandled non-renewing product: ${event.product_id}`);
        return json(200, { received: true });
      }

      // Subscription is (or remains) active.
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
      case 'UNCANCELLATION': {
        if (!isSubscriptionProduct(event.product_id)) {
          console.log(`${event.type} for non-subscription ${event.product_id}, ignoring`);
          return json(200, { received: true });
        }
        const { error } = await db
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              status: 'premium',
              current_period_end: event.expiration_at_ms
                ? new Date(event.expiration_at_ms).toISOString()
                : null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
        if (error) throw error;
        console.log(`Premium active for user ${userId}`);
        return json(200, { received: true });
      }

      // Auto-renew turned off — still premium until it expires.
      case 'CANCELLATION': {
        if (!isSubscriptionProduct(event.product_id)) return json(200, { received: true });
        const { error } = await db
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            current_period_end: event.expiration_at_ms
              ? new Date(event.expiration_at_ms).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        if (error) throw error;
        console.log(`Premium set to cancel at period end for user ${userId}`);
        return json(200, { received: true });
      }

      // Renewal failed — grace period; treat as past due.
      case 'BILLING_ISSUE': {
        const { error } = await db
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', userId);
        if (error) throw error;
        console.log(`Billing issue for user ${userId}`);
        return json(200, { received: true });
      }

      // Subscription lapsed — downgrade to free.
      case 'EXPIRATION': {
        const { error } = await db
          .from('subscriptions')
          .update({
            status: 'free',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        if (error) throw error;
        console.log(`Premium expired for user ${userId}`);
        return json(200, { received: true });
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return json(200, { received: true });
    }
  } catch (err) {
    // 500 so RevenueCat retries.
    console.error('Webhook handler error:', err);
    return json(500, { error: 'Handler failed' });
  }
});
