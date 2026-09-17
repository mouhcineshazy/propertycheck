'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PhoneFrame, ReportScreen } from './AppScreens';

const valueProps = [
  {
    labelKey: 'valueProps.timestamped',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    labelKey: 'valueProps.pdfReports',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    labelKey: 'valueProps.secure',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
];

const easeOut = [0.25, 0.1, 0.25, 1] as const;

export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-36 lg:pb-28">
      {/* Ambient background: faint grid + soft brand glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,rgb(37_99_235/0.08),transparent)]" />
        <div className="absolute inset-0 opacity-[0.6] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)] bg-grid-ink bg-[size:44px_44px]" />
        <motion.div
          className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---- Copy ---- */}
        <div className="min-w-0 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified-500/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-verified-500" />
            </span>
            <span className="text-xs font-semibold text-fg-muted">{t('badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: easeOut }}
            className="mt-6 text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl lg:text-display-lg"
          >
            {t('title')}{' '}
            <span className="bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
            className="mt-6 text-pretty text-lg leading-relaxed text-fg-muted"
          >
            {t('subtitle')}{' '}
            <span className="font-semibold text-fg">{t('subtitleHighlight')}</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: easeOut }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a href="#download" className="btn-primary group px-6 py-3.5 text-base">
              {t('cta')}
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
              </svg>
            </a>
            <a href="#how-it-works" className="btn-secondary px-6 py-3.5 text-base">
              {t('howItWorks')}
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8"
          >
            {valueProps.map((item) => (
              <div key={item.labelKey} className="flex flex-col gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </span>
                <dt className="text-sm font-medium text-fg-muted">{t(item.labelKey)}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---- App mockup ---- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
          className="relative mx-auto w-full min-w-0 max-w-sm lg:mx-0"
        >
          <PhoneHero t={t} />
        </motion.div>
      </div>
    </section>
  );
}

function PhoneHero({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-xs rounded-full bg-primary-500/15 blur-3xl" />

      {/* Floating verified stamp */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: easeOut }}
        className="absolute -right-2 top-10 z-20 flex items-center gap-2 rounded-full border border-verified-100 bg-card px-3 py-1.5 shadow-md sm:-right-6"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-verified-500 text-white">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-verified-600">{t('mockup.verified')}</span>
      </motion.div>

      <PhoneFrame>
        <ReportScreen />
      </PhoneFrame>

      {/* Supporting stat card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: easeOut }}
        className="absolute -bottom-4 -left-2 z-20 hidden rounded-2xl border border-line bg-card px-4 py-3 shadow-lg sm:block"
      >
        <p className="text-2xl font-bold tracking-tight text-fg tabular-nums">$2,000</p>
        <p className="text-xs font-medium text-fg-muted">{t('mockup.depositProtected')}</p>
      </motion.div>
    </div>
  );
}
