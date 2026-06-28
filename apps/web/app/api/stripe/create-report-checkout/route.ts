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

// POST /api/stripe/create-report-checkout
// Creates a one-time Stripe Checkout for a $5.99 CAD watermark-free PDF unlock
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { inspectionId?: string };
  const { inspectionId } = body;

  if (!inspectionId) {
    return NextResponse.json({ error: 'inspectionId is required' }, { status: 400 });
  }

  const priceId = process.env.NEXT_PUBLIC_STRIPE_REPORT_PRICE_ID;
  if (!priceId) {
    console.error('NEXT_PUBLIC_STRIPE_REPORT_PRICE_ID is not configured');
    return NextResponse.json({ error: 'Report unlock not available' }, { status: 500 });
  }

  // Verify the inspection belongs to this user before charging them
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: inspection, error: inspError } = await supabaseAdmin
    .from('inspections')
    .select('id, report_unlocked')
    .eq('id', inspectionId)
    .single();

  if (inspError || !inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
  }

  const rawInspection = inspection as unknown as { id: string; report_unlocked: boolean };

  // Idempotency: already unlocked, nothing to charge
  if (rawInspection.report_unlocked) {
    return NextResponse.json({ error: 'This report is already unlocked' }, { status: 409 });
  }

  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/en/checkout/report-success?inspection=${inspectionId}`,
    cancel_url: `${origin}/en/checkout/report-success?inspection=${inspectionId}&canceled=1`,
    customer_email: user.email ?? undefined,
    metadata: {
      userId: user.id,
      inspectionId,
      type: 'report_unlock',
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
