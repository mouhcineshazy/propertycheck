import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAnonClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
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
    const supabase = createAnonClient(
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

// GET /api/account/export
// Returns all user data as a downloadable JSON file (PIPEDA right of access)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [profileResult, propertiesResult, inspectionsResult, subscriptionResult] =
    await Promise.all([
      admin.from('users').select('full_name, province').eq('id', user.id).single(),
      admin.from('properties').select('*').eq('user_id', user.id),
      admin.from('inspections').select('*').eq('user_id', user.id),
      admin
        .from('subscriptions')
        .select('status, plan, current_period_end, created_at')
        .eq('user_id', user.id)
        .single(),
    ]);

  const inspectionIds = (inspectionsResult.data ?? []).map((i: { id: string }) => i.id);

  const { data: photos } = inspectionIds.length > 0
    ? await admin
        .from('inspection_photos')
        .select('id, inspection_id, caption, room_type, sort_order, created_at')
        .in('inspection_id', inspectionIds)
    : { data: [] };

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      full_name: profileResult.data?.full_name ?? null,
      province: profileResult.data?.province ?? null,
      marketing_consent: user.user_metadata?.marketing_consent ?? false,
    },
    subscription: subscriptionResult.data ?? null,
    properties: propertiesResult.data ?? [],
    inspections: inspectionsResult.data ?? [],
    inspection_photos: photos ?? [],
  };

  const filename = `propertycheck-export-${new Date().toISOString().split('T')[0]}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
