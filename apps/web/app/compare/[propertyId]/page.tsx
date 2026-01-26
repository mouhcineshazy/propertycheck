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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            {APP_CONFIG.name}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Move-in vs Move-out Comparison
              </h1>
              <p className="text-gray-600">{property.address}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">Move-in</div>
                <div className="text-sm text-gray-500">{moveInDate}</div>
                <div className="text-xs text-gray-400">
                  {moveInInspection.photos.length} photos
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">Move-out</div>
                <div className="text-sm text-gray-500">{moveOutDate}</div>
                <div className="text-xs text-gray-400">
                  {moveOutInspection.photos.length} photos
                </div>
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
            <div
              key={room}
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {ROOM_LABELS[room]}
                </h2>
                <p className="text-sm text-gray-500">
                  {roomMoveIn.length + roomMoveOut.length} photos
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-sm font-medium text-emerald-600">
                    Move-in ({moveInDate})
                  </div>
                  <div className="text-sm font-medium text-amber-600">
                    Move-out ({moveOutDate})
                  </div>
                </div>

                {Array.from({ length: maxCount }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 mb-4 last:mb-0"
                  >
                    <div>
                      {roomMoveIn[index] ? (
                        <div>
                          <img
                            src={getPhotoUrl(roomMoveIn[index].storage_path)}
                            alt={roomMoveIn[index].caption || `${room} move-in`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          {roomMoveIn[index].caption && (
                            <p className="mt-2 text-sm text-gray-600">
                              {roomMoveIn[index].caption}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 border-dashed flex items-center justify-center">
                          <span className="text-sm text-gray-400">No photo</span>
                        </div>
                      )}
                    </div>
                    <div>
                      {roomMoveOut[index] ? (
                        <div>
                          <img
                            src={getPhotoUrl(roomMoveOut[index].storage_path)}
                            alt={roomMoveOut[index].caption || `${room} move-out`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          {roomMoveOut[index].caption && (
                            <p className="mt-2 text-sm text-gray-600">
                              {roomMoveOut[index].caption}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 border-dashed flex items-center justify-center">
                          <span className="text-sm text-gray-400">No photo</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500">No photos to compare</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p className="mb-2">
            This comparison report was generated by {APP_CONFIG.name}
          </p>
          <p>
            Generated on {format(new Date(), 'MMMM d, yyyy')} at{' '}
            {format(new Date(), 'h:mm a')}
          </p>
        </div>

        {/* CTA for non-users */}
        <div className="mt-8 bg-blue-600 rounded-xl p-8 text-center print:hidden">
          <h3 className="text-xl font-bold text-white mb-2">
            Protect Your Security Deposit
          </h3>
          <p className="text-blue-100 mb-6">
            Create your own inspection reports with timestamped evidence.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started Free
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-8 print:hidden">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
