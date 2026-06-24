import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { sendReportEmailSchema } from '@propertycheck/shared';
import { sendInspectionReportEmail } from '@/lib/email';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function POST(request: NextRequest) {
  try {
    // Auth: Bearer token (mobile) or cookie session (web)
    const authHeader = request.headers.get('Authorization');
    let user = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.auth.getUser(token);
      user = data?.user;
    } else {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet: CookieToSet[]) {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            },
          },
        }
      );
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const parsed = sendReportEmailSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid request';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { inspectionId, recipientEmail, pdfBase64 } = parsed.data;

    // Use admin client for DB reads; ownership is enforced explicitly below
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: inspection, error: inspectionError } = await adminClient
      .from('inspections')
      .select(`
        id,
        inspection_date,
        user_id,
        property:properties(address),
        photos:inspection_photos(id)
      `)
      .eq('id', inspectionId)
      .single();

    if (inspectionError || !inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Ownership check — user must own the inspection
    if (inspection.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch sender's display name
    const { data: userData } = await adminClient
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const senderName = userData?.full_name || userData?.email || user.email || 'Your tenant';
    const propertyData = inspection.property as unknown as { address: string } | null;
    const propertyAddress = propertyData?.address ?? 'Unknown property';
    const photoCount = Array.isArray(inspection.photos) ? inspection.photos.length : 0;
    const inspectionDate = format(new Date(inspection.inspection_date), 'MMMM d, yyyy');

    const result = await sendInspectionReportEmail({
      to: recipientEmail,
      senderName,
      propertyAddress,
      inspectionDate,
      photoCount,
      pdfBase64,
    });

    if (!result.success) {
      console.error('Email send failed:', result.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Report email route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
