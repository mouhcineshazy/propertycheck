-- Moving bundle purchases: move-in + move-out + comparison for one property, valid 18 months
CREATE TABLE IF NOT EXISTS public.bundle_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bundle_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own bundle purchases"
  ON public.bundle_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert bundle purchases"
  ON public.bundle_purchases FOR INSERT
  WITH CHECK (true);
