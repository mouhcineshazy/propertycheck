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

// DELETE /api/account/delete
// Erases all user data then deletes the auth user (PIPEDA right to erasure)
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Collect all inspection IDs to delete photos from storage
  const { data: inspections } = await admin
    .from('inspections')
    .select('id')
    .eq('user_id', user.id);

  const inspectionIds = (inspections ?? []).map((i: { id: string }) => i.id);

  if (inspectionIds.length > 0) {
    // 2. Get all storage paths for photos
    const { data: photos } = await admin
      .from('inspection_photos')
      .select('storage_path')
      .in('inspection_id', inspectionIds);

    // 3. Delete photo files from storage
    if (photos && photos.length > 0) {
      const paths = (photos as { storage_path: string }[]).map(p => p.storage_path);
      await admin.storage.from('inspection-photos').remove(paths);
    }
  }

  // 4. Delete DB records — properties cascade to inspections and photos
  await admin.from('properties').delete().eq('user_id', user.id);

  // 5. Delete user profile row
  await admin.from('users').delete().eq('id', user.id);

  // 6. Delete the auth user (must be last — invalidates all sessions)
  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteAuthError) {
    console.error('Failed to delete auth user:', deleteAuthError);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
