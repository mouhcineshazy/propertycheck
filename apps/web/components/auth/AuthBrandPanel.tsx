'use client';

import { motion } from 'framer-motion';

const easeOut = [0.25, 0.1, 0.25, 1] as const;

interface AuthBrandPanelProps {
  heading: string;
  items: { title: string; description?: string }[];
  downloadTitle: string;
  downloadSubtitle: string;
  trust?: { ssl: string; gdpr: string };
}

/**
 * Deep-ink brand panel shown on the right of auth screens (lg+ only).
 * Shared by login and signup to keep them consistent.
 */
export function AuthBrandPanel({ heading, items, downloadTitle, downloadSubtitle, trust }: AuthBrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:w-1/2">
      {/* Ambient grid + glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <motion.div
          className="absolute -top-16 right-10 h-80 w-80 rounded-full bg-primary-600/25 blur-3xl"
          animate={{ y: [0, 24, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-verified-500/10 blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-bold text-white">{heading}</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-verified-500 text-white">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    {item.description && <p className="mt-0.5 text-sm text-ink-300">{item.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ease: easeOut }}
            className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl"
          >
            <h3 className="font-semibold text-white">{downloadTitle}</h3>
            <p className="mt-1 text-sm text-ink-300">{downloadSubtitle}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <StoreButton store="App Store" label="Download on the" aria="Download on the App Store" />
              <StoreButton store="Google Play" label="Get it on" aria="Get it on Google Play" play />
            </div>
          </motion.div>

          {trust && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-6"
            >
              <TrustItem label={trust.ssl} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              <TrustItem label={trust.gdpr} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StoreButton({ store, label, aria, play }: { store: string; label: string; aria: string; play?: boolean }) {
  return (
    <a
      href="#"
      aria-label={aria}
      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white transition-colors hover:bg-white/15"
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        {play ? (
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        ) : (
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        )}
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] text-white/70">{label}</span>
        <span className="text-sm font-semibold">{store}</span>
      </span>
    </a>
  );
}

function TrustItem({ label, d }: { label: string; d: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-300">
      <svg className="h-5 w-5 text-verified-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}
