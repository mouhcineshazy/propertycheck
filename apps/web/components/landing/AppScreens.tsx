/**
 * AppScreens — CSS recreations of the mobile app UI for the landing page.
 *
 * No real screenshots exist, so the product is shown as faithful, always-crisp
 * mockups rendered inside a phone frame. Screens mirror the real Expo app:
 * Properties list (tabs/index), inspection capture (inspection/new), and the
 * generated report. Purely presentational — safe to import into client sections.
 */
import type { ReactNode } from 'react';

/* ---- Phone frame -------------------------------------------------------- */

export function PhoneFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-[248px] rounded-[2.6rem] bg-ink-950 p-2.5 shadow-xl ring-1 ring-black/10 sm:w-[268px] ${className}`}
    >
      <div className="relative aspect-[9/19.2] overflow-hidden rounded-[2rem] bg-canvas">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-2.5 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-ink-950" />
        <StatusBar />
        <div className="h-full pt-9">{children}</div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between px-5 pt-2 text-fg">
      <span className="text-[11px] font-semibold tabular-nums">9:41</span>
      <div className="flex items-center gap-1">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M2 16h3v5H2zM7 12h3v9H7zM12 8h3v13h-3zM17 4h3v17h-3z" />
        </svg>
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 4C7 4 2.7 6 0 9l12 15L24 9c-2.7-3-7-5-12-5z" opacity="0.9" />
        </svg>
        <svg className="h-3 w-4" viewBox="0 0 28 14" fill="none" aria-hidden>
          <rect x="0.5" y="1" width="23" height="12" rx="3" stroke="currentColor" opacity="0.5" />
          <rect x="2.5" y="3" width="17" height="8" rx="1.5" fill="currentColor" />
          <rect x="25" y="4.5" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

/* ---- Shared bits -------------------------------------------------------- */

export const ROOMS = [
  { label: 'Kitchen', from: 'from-amber-100', to: 'to-amber-200/60' },
  { label: 'Living', from: 'from-primary-100', to: 'to-primary-200/60' },
  { label: 'Bath', from: 'from-verified-100', to: 'to-verified-200/60' },
  { label: 'Bedroom', from: 'from-ink-100', to: 'to-ink-200/70' },
  { label: 'Hallway', from: 'from-primary-100', to: 'to-verified-100' },
  { label: 'Closet', from: 'from-ink-100', to: 'to-primary-100' },
] as const;

/** Stylized "photo" tile — reads as documented content, never a broken image. */
export function RoomThumb({
  room,
  flag,
  rounded = 'rounded-lg',
}: {
  room: (typeof ROOMS)[number];
  flag?: boolean;
  rounded?: string;
}) {
  return (
    <div
      className={`relative aspect-square overflow-hidden ${rounded} bg-gradient-to-br ${room.from} ${room.to}`}
    >
      <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/40 blur-md" />
      <svg
        className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 text-ink-950/25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4V6z"
        />
      </svg>
      <span className="absolute bottom-1 left-1 rounded bg-ink-950/60 px-1 py-px text-[7px] font-semibold text-white">
        {room.label}
      </span>
      {flag && (
        <span className="absolute left-1 top-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500" />
        </span>
      )}
    </div>
  );
}

/* ---- Screen 1: Properties list ----------------------------------------- */

export function PropertiesScreen() {
  const properties = [
    { address: '48 Wellesley St E', type: 'Apartment' },
    { address: '210 Queen St W', type: 'Condo' },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 pb-3">
        <span className="text-[15px] font-bold text-fg">Properties</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-700">
          MS
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-card-muted px-4 py-2">
        <svg className="h-3 w-3 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[9px] font-medium text-fg-muted">1 of 1 free property used</span>
      </div>

      <div className="flex-1 space-y-2.5 p-3">
        {properties.map((p) => (
          <div key={p.address} className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-2.5 shadow-xs">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10h14V10" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-fg">{p.address}</p>
              <span className="mt-0.5 inline-block rounded bg-card-muted px-1.5 py-px text-[8px] font-semibold text-fg-muted">
                {p.type}
              </span>
            </div>
            <svg className="h-3.5 w-3.5 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div className="pointer-events-none absolute bottom-16 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-primary">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
        </svg>
      </div>

      <TabBar active="properties" />
    </div>
  );
}

function TabBar({ active }: { active: 'properties' | 'settings' }) {
  return (
    <div className="flex items-center justify-around border-t border-line bg-card px-6 pb-4 pt-2">
      <div className="flex flex-col items-center gap-0.5">
        <svg
          className={`h-5 w-5 ${active === 'properties' ? 'text-primary-600' : 'text-ink-400'}`}
          fill={active === 'properties' ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10h14V10" />
        </svg>
        <span className={`text-[8px] font-semibold ${active === 'properties' ? 'text-primary-600' : 'text-ink-400'}`}>
          Properties
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <svg
          className={`h-5 w-5 ${active === 'settings' ? 'text-primary-600' : 'text-ink-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className={`text-[8px] font-semibold ${active === 'settings' ? 'text-primary-600' : 'text-ink-400'}`}>
          Settings
        </span>
      </div>
    </div>
  );
}

/* ---- Screen 2: Inspection capture -------------------------------------- */

export function CaptureScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 pb-3">
        <svg className="h-4 w-4 text-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[13px] font-bold text-fg">New Inspection</span>
      </div>

      <div className="flex-1 overflow-hidden p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-fg">Kitchen</span>
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[8px] font-bold text-primary-700">
            6 photos
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {ROOMS.map((room, i) => (
            <RoomThumb key={room.label} room={room} flag={i === 0} />
          ))}
          <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-line-strong text-fg-subtle">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-card p-2.5 shadow-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-verified-50 text-verified-600">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-fg">Uploading 6 / 8</span>
              <span className="text-[8px] text-fg-subtle">timestamped</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-card-muted">
              <div className="h-full w-3/4 rounded-full bg-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 pb-5">
        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2.5 text-white shadow-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[11px] font-semibold">Save inspection</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Screen 3: Generated report ---------------------------------------- */

export function ReportScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 pb-3">
        <span className="text-[13px] font-bold text-fg">Report</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-verified-50 px-2 py-0.5 text-[8px] font-bold text-verified-700">
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </span>
      </div>

      <div className="flex-1 overflow-hidden p-3">
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700 px-3 py-2.5">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-wider text-white/70">
                Inspection Report
              </p>
              <p className="text-[10px] font-bold text-white">48 Wellesley St E</p>
            </div>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[7px] font-bold text-white">
              Move-in
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-2.5">
            {ROOMS.slice(0, 4).map((room, i) => (
              <RoomThumb key={room.label} room={room} flag={i === 2} rounded="rounded-md" />
            ))}
          </div>
          <div className="flex items-center gap-1.5 border-t border-line px-3 py-2">
            <svg className="h-3 w-3 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[8px] font-medium tabular-nums text-fg-muted">
              Documented Jan 14, 2026 · 2:14 PM
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <div className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-600 py-2 text-white shadow-primary">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-[10px] font-semibold">Export PDF</span>
          </div>
          <div className="flex items-center justify-center gap-1 rounded-lg border border-line bg-card px-3 py-2 text-fg">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
