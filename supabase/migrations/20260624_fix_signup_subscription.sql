-- Fix handle_new_user trigger to create a subscriptions row on signup.
-- Previously only the users profile was created, leaving new users with no
-- subscriptions record. check_free_tier_limits() worked via LEFT JOIN, but
-- any direct query to subscriptions for a new user returned empty.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.id, 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: create free subscription rows for any existing users who don't have one
INSERT INTO public.subscriptions (user_id, status)
SELECT id, 'free'
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions);
