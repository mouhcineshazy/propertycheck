import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.auth.getUser(token);
    return data?.user ?? null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// POST /api/stripe/create-bundle-checkout
// One-time $24.99 CAD purchase: move-in + move-out + comparison for one property, valid 18 months
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { propertyId?: string };
  const { propertyId } = body;

  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
  }

  const priceId = process.env.NEXT_PUBLIC_STRIPE_BUNDLE_PRICE_ID;
  if (!priceId) {
    console.error('NEXT_PUBLIC_STRIPE_BUNDLE_PRICE_ID is not configured');
    return NextResponse.json({ error: 'Moving bundle not available' }, { status: 500 });
  }

  // Verify the property belongs to this user
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: property, error: propError } = await supabaseAdmin
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('user_id', user.id)
    .single();

  if (propError || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // Check if an active bundle already exists for this property
  const now = new Date().toISOString();
  const { data: existing } = await supabaseAdmin
    .from('bundle_purchases')
    .select('id')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .gt('expires_at', now)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'An active bundle already exists for this property' }, { status: 409 });
  }

  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/en/checkout/bundle-success?property=${propertyId}`,
    cancel_url: `${origin}/en/checkout/bundle-success?property=${propertyId}&canceled=1`,
    customer_email: user.email ?? undefined,
    metadata: {
      userId: user.id,
      propertyId,
      type: 'moving_bundle',
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
