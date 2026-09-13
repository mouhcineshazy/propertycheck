-- RevenueCat In-App Purchase support.
--
-- On mobile, the moving bundle and report unlock are sold via native IAP and
-- granted by the RevenueCat webhook (supabase/functions/revenuecat-webhook)
-- instead of the Stripe webhook. Store the RevenueCat transaction id so repeated
-- webhook deliveries (RevenueCat retries until it gets a 2xx) don't double-grant
-- a bundle. Report unlock is a boolean flag, already idempotent; subscriptions
-- upsert on the unique user_id, also idempotent.

ALTER TABLE public.bundle_purchases
  ADD COLUMN IF NOT EXISTS revenuecat_transaction_id TEXT;

-- One bundle per RevenueCat transaction. Partial so existing Stripe-only rows
-- (NULL here) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS bundle_purchases_revenuecat_txn_key
  ON public.bundle_purchases (revenuecat_transaction_id)
  WHERE revenuecat_transaction_id IS NOT NULL;
