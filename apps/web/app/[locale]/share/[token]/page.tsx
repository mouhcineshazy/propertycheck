import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
};

type InspectionPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  room_type: string;
  created_at: string;
  sort_order: number | null;
};

type InspectionResult =
  | {
      status: 'ok';
      id: string;
      inspection_date: string;
      notes: string | null;
      address: string;
      photos: InspectionPhoto[];
      senderName: string;
    }
  | { status: 'expired' }
  | { status: 'not_found' };

const ROOM_ORDER = ['kitchen', 'bathroom', 'bedroom', 'living_room', 'other'];

function getPhotoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/inspection-photos/${storagePath}`;
}

type RawInspectionRow = {
  id: string;
  inspection_date: string;
  notes: string | null;
  share_expires_at: string | null;
  user_id: string;
  property: { address: string } | null;
  photos: InspectionPhoto[];
};

async function fetchInspection(token: string): Promise<InspectionResult> {
  // No <Database> generic: the generated types omit user_id from inspections.Row
  // (types are stale; user_id exists in the actual schema)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('inspections')
    .select(`
      id,
      inspection_date,
      notes,
      share_expires_at,
      user_id,
      property:properties(address),
      photos:inspection_photos(id, storage_path, caption, room_type, created_at, sort_order)
    `)
    .eq('share_token', token)
    .single();

  if (error || !data) return { status: 'not_found' };

  const row = data as unknown as RawInspectionRow;

  if (!row.share_expires_at || new Date(row.share_expires_at) < new Date()) {
    return { status: 'expired' };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', row.user_id)
    .single();

  const userRow = userData as unknown as { full_name: string | null; email: string | null } | null;
  const photos = (row.photos ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return {
    status: 'ok',
    id: row.id,
    inspection_date: row.inspection_date,
    notes: row.notes,
    address: row.property?.address ?? '',
    photos,
    senderName: userRow?.full_name || userRow?.email || 'Your tenant',
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await fetchInspection(token);

  if (result.status !== 'ok') {
    return { title: 'Inspection Report | PropertyCheck' };
  }

  return {
    title: `Inspection Report — ${result.address} | PropertyCheck`,
    description: `View the property inspection report for ${result.address}, documented with PropertyCheck.`,
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('share');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://propertycheck.app';
  const result = await fetchInspection(token);

  if (result.status === 'not_found') {
    notFound();
  }

  if (result.status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-[#0f172a] py-5 px-6">
          <div className="max-w-3xl mx-auto">
            <Logo size="md" variant="light" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{t('expired.title')}</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{t('expired.description')}</p>
            <Link
              href="/"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              {t('expired.button')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const dateLocale = locale === 'fr' ? frLocale : undefined;
  const formattedDate = format(new Date(result.inspection_date), 'MMMM d, yyyy', { locale: dateLocale });

  const photosByRoom = ROOM_ORDER.reduce<Record<string, InspectionPhoto[]>>((acc, room) => {
    const roomPhotos = result.photos.filter(p => p.room_type === room);
    if (roomPhotos.length > 0) acc[room] = roomPhotos;
    return acc;
  }, {});

  const roomLabels: Record<string, string> = {
    kitchen: t('roomTypes.kitchen'),
    bathroom: t('roomTypes.bathroom'),
    bedroom: t('roomTypes.bedroom'),
    living_room: t('roomTypes.living_room'),
    other: t('roomTypes.other'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0f172a] py-5 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo size="md" variant="light" />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {t('inspectionReport')}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Inspection summary card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
            <p className="text-primary-100 text-sm font-medium mb-1">
              {t('sharedBy')} {result.senderName}
            </p>
            <h1 className="text-white text-xl font-bold leading-tight">
              {result.address || '—'}
            </h1>
          </div>
          <div className="px-6 py-5 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                {t('inspectionDate')}
              </p>
              <p className="text-gray-900 font-semibold">{formattedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                Photos
              </p>
              <p className="text-gray-900 font-semibold">
                {t('photoCount', { count: result.photos.length })}
              </p>
            </div>
          </div>
        </div>

        {/* Photos grouped by room */}
        {Object.entries(photosByRoom).map(([room, photos]) => (
          <section key={room} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {roomLabels[room] ?? room}
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id}>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getPhotoUrl(photo.storage_path)}
                      alt={photo.caption ?? `${roomLabels[room] ?? room} photo`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {photo.caption && (
                      <p className="text-xs text-gray-700 font-medium leading-tight line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {format(new Date(photo.created_at), 'MMM d, h:mm a', { locale: dateLocale })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Notes */}
        {result.notes && (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {t('notes')}
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{result.notes}</p>
          </section>
        )}

        {/* Legal disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-xs text-amber-800 leading-relaxed">{t('disclaimer')}</p>
        </div>

        {/* Acquisition CTA */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" variant="light" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">{t('cta.title')}</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">{t('cta.subtitle')}</p>
          <Link
            href="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            {t('cta.button')}
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          {t('poweredBy')} ·{' '}
          <a href={appUrl} className="hover:text-gray-600 transition-colors">
            propertycheck.app
          </a>
        </p>
      </main>
    </div>
  );
}
