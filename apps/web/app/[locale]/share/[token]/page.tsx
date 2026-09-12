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
      <div className="flex min-h-screen flex-col bg-canvas">
        <header className="bg-ink-950 px-6 py-5">
          <div className="mx-auto max-w-3xl">
            <Logo size="md" variant="light" />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-card-muted text-fg-subtle">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h1 className="mb-3 text-xl font-bold text-fg">{t('expired.title')}</h1>
            <p className="mb-8 text-sm leading-relaxed text-fg-muted">{t('expired.description')}</p>
            <Link href="/" className="btn-primary px-6 py-3">{t('expired.button')}</Link>
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
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-ink-950 px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Logo size="md" variant="light" />
          <span className="text-xs font-medium uppercase tracking-wider text-ink-400">{t('inspectionReport')}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Summary */}
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="bg-ink-950 px-6 py-5">
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-ink-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-verified-500 text-white">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {t('sharedBy')} {result.senderName}
            </p>
            <h1 className="text-xl font-bold leading-tight text-white">{result.address || '—'}</h1>
          </div>
          <div className="flex flex-wrap gap-8 px-6 py-5">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-fg-subtle">{t('inspectionDate')}</p>
              <p className="font-semibold text-fg">{formattedDate}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-fg-subtle">Photos</p>
              <p className="font-semibold text-fg tabular-nums">{t('photoCount', { count: result.photos.length })}</p>
            </div>
          </div>
        </div>

        {/* Photos by room */}
        {Object.entries(photosByRoom).map(([room, photos]) => (
          <section key={room} className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">{roomLabels[room] ?? room}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-card-muted">
                    <Image
                      src={getPhotoUrl(photo.storage_path)}
                      alt={photo.caption ?? `${roomLabels[room] ?? room} photo`}
                      fill
                      className="object-cover transition-transform duration-200 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {photo.caption && <p className="line-clamp-2 text-xs font-medium leading-tight text-fg-muted">{photo.caption}</p>}
                    <p className="text-xs text-fg-subtle">{format(new Date(photo.created_at), 'MMM d, h:mm a', { locale: dateLocale })}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Notes */}
        {result.notes && (
          <section className="rounded-2xl border border-line bg-card px-6 py-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fg-muted">{t('notes')}</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{result.notes}</p>
          </section>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-xs leading-relaxed text-amber-800">{t('disclaimer')}</p>
        </div>

        {/* Acquisition CTA */}
        <div className="overflow-hidden rounded-2xl bg-ink-950 px-6 py-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="md" variant="light" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">{t('cta.title')}</h2>
          <p className="mx-auto mb-6 max-w-xs text-sm text-ink-300">{t('cta.subtitle')}</p>
          <Link href="/" className="btn-primary px-6 py-3">{t('cta.button')}</Link>
        </div>

        <p className="pb-4 text-center text-xs text-fg-subtle">
          {t('poweredBy')} ·{' '}
          <a href={appUrl} className="transition-colors hover:text-fg-muted">propertycheck.app</a>
        </p>
      </main>
    </div>
  );
}
