import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import Link from 'next/link';
import { APP_CONFIG } from '@propertycheck/shared';
import type { Database } from '@propertycheck/database';

// Create a service role client for public access
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Room type labels
const ROOM_LABELS: Record<string, string> = {
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  other: 'Other Areas',
};

// Room order for display
const ROOM_ORDER = ['living_room', 'bedroom', 'bathroom', 'kitchen', 'other'];

export async function generateMetadata({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;

  // Fetch property for metadata
  const { data: property } = await supabase
    .from('properties')
    .select('address')
    .eq('id', propertyId)
    .single();

  if (!property) {
    return {
      title: 'Comparison Not Found',
    };
  }

  return {
    title: `Comparison Report - ${property.address} | ${APP_CONFIG.name}`,
    description: `Move-in vs Move-out comparison report for ${property.address}`,
  };
}

async function getComparisonData(propertyId: string) {
  // Fetch property
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (propError || !property) {
    return null;
  }

  // Fetch completed inspections (with valid share tokens)
  const { data: inspections, error: inspError } = await supabase
    .from('inspections')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'completed')
    .not('share_token', 'is', null)
    .order('inspection_date', { ascending: true });

  if (inspError || !inspections || inspections.length < 2) {
    return null;
  }

  const moveInInspection = inspections[0];
  const moveOutInspection = inspections[inspections.length - 1];

  // Fetch photos for both inspections
  const [moveInPhotos, moveOutPhotos] = await Promise.all([
    supabase
      .from('inspection_photos')
      .select('*')
      .eq('inspection_id', moveInInspection.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('inspection_photos')
      .select('*')
      .eq('inspection_id', moveOutInspection.id)
      .order('sort_order', { ascending: true }),
  ]);

  return {
    property,
    moveInInspection: {
      ...moveInInspection,
      photos: moveInPhotos.data || [],
    },
    moveOutInspection: {
      ...moveOutInspection,
      photos: moveOutPhotos.data || [],
    },
  };
}

function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('inspection-photos')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const data = await getComparisonData(propertyId);

  if (!data) {
    notFound();
  }

  const { property, moveInInspection, moveOutInspection } = data;

  const moveInDate = format(new Date(moveInInspection.inspection_date), 'MMMM d, yyyy');
  const moveOutDate = format(new Date(moveOutInspection.inspection_date), 'MMMM d, yyyy');

  // Group photos by room type
  const groupByRoom = (photos: typeof moveInInspection.photos) => {
    return photos.reduce(
      (acc, photo) => {
        const room = photo.room_type || 'other';
        if (!acc[room]) acc[room] = [];
        acc[room].push(photo);
        return acc;
      },
      {} as Record<string, typeof photos>
    );
  };

  const moveInByRoom = groupByRoom(moveInInspection.photos);
  const moveOutByRoom = groupByRoom(moveOutInspection.photos);

  // Get all room types that have photos
  const allRooms = new Set([
    ...Object.keys(moveInByRoom),
    ...Object.keys(moveOutByRoom),
  ]);

  // Sort rooms in preferred order
  const sortedRooms = ROOM_ORDER.filter((room) => allRooms.has(room));

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b border-line bg-card print:hidden">
        <div className="container-page py-4">
          <Link href="/" aria-label={`${APP_CONFIG.name} home`}>
            <span className="text-lg font-bold tracking-tight text-fg">
              Property<span className="text-primary-600">Check</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Report Header */}
        <div className="card mb-8 p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-fg">Move-in vs Move-out Comparison</h1>
              <p className="text-fg-muted">{property.address}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-verified-500" />
              <div>
                <div className="text-sm font-medium text-fg">Move-in</div>
                <div className="text-sm text-fg-muted">{moveInDate}</div>
                <div className="text-xs text-fg-subtle">{moveInInspection.photos.length} photos</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div>
                <div className="text-sm font-medium text-fg">Move-out</div>
                <div className="text-sm text-fg-muted">{moveOutDate}</div>
                <div className="text-xs text-fg-subtle">{moveOutInspection.photos.length} photos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Sections */}
        {sortedRooms.map((room) => {
          const roomMoveIn = moveInByRoom[room] || [];
          const roomMoveOut = moveOutByRoom[room] || [];
          const maxCount = Math.max(roomMoveIn.length, roomMoveOut.length);

          return (
            <div key={room} className="card mb-6 overflow-hidden">
              <div className="border-b border-line bg-card-muted px-6 py-4">
                <h2 className="text-lg font-semibold text-fg">{ROOM_LABELS[room]}</h2>
                <p className="text-sm text-fg-muted">{roomMoveIn.length + roomMoveOut.length} photos</p>
              </div>

              <div className="p-6">
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium text-verified-600">Move-in ({moveInDate})</div>
                  <div className="text-sm font-medium text-amber-600">Move-out ({moveOutDate})</div>
                </div>

                {Array.from({ length: maxCount }).map((_, index) => (
                  <div key={index} className="mb-4 grid grid-cols-2 gap-4 last:mb-0">
                    <div>
                      {roomMoveIn[index] ? (
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL */}
                          <img src={getPhotoUrl(roomMoveIn[index].storage_path)} alt={roomMoveIn[index].caption || `${room} move-in`} className="h-48 w-full rounded-lg border border-line object-cover" />
                          {roomMoveIn[index].caption && <p className="mt-2 text-sm text-fg-muted">{roomMoveIn[index].caption}</p>}
                        </div>
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-line-strong bg-card-muted">
                          <span className="text-sm text-fg-subtle">No photo</span>
                        </div>
                      )}
                    </div>
                    <div>
                      {roomMoveOut[index] ? (
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL */}
                          <img src={getPhotoUrl(roomMoveOut[index].storage_path)} alt={roomMoveOut[index].caption || `${room} move-out`} className="h-48 w-full rounded-lg border border-line object-cover" />
                          {roomMoveOut[index].caption && <p className="mt-2 text-sm text-fg-muted">{roomMoveOut[index].caption}</p>}
                        </div>
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-line-strong bg-card-muted">
                          <span className="text-sm text-fg-subtle">No photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {sortedRooms.length === 0 && (
          <div className="card p-12 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-card-muted text-fg-subtle">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <p className="text-fg-muted">No photos to compare</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-line pt-8 text-center text-sm text-fg-subtle">
          <p className="mb-2">This comparison report was generated by {APP_CONFIG.name}</p>
          <p>Generated on {format(new Date(), 'MMMM d, yyyy')} at {format(new Date(), 'h:mm a')}</p>
        </div>

        {/* CTA */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-ink-950 p-8 text-center print:hidden">
          <h3 className="mb-2 text-xl font-bold text-white">Protect Your Security Deposit</h3>
          <p className="mb-6 text-ink-300">Create your own inspection reports with timestamped evidence.</p>
          <Link href="/#download" className="btn bg-white px-6 py-3 text-ink-950 hover:bg-ink-50">
            Get the app
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="mt-8 border-t border-line bg-card py-8 print:hidden">
        <div className="container-page text-center text-sm text-fg-subtle">
          <p>&copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
