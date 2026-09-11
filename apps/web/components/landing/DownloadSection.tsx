'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const iconProps = { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' } as const;

const features = [
  {
    prefix: 'features.quickSetup',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    prefix: 'features.photoDoc',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
  },
  {
    prefix: 'features.pdfReports',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
];

export function DownloadSection() {
  const t = useTranslations('landing.download');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="download" ref={ref} className="bg-card-muted py-24 sm:py-28">
      <div className="container-page">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <span className="eyebrow">{t('badge')}</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-fg sm:text-4xl lg:text-display-sm">
            {t('title')}{' '}
            <span className="bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-fg-muted">{t('subtitle')}</p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
          >
            <a
              href="#"
              className="btn gap-3 bg-ink-950 px-6 py-3 text-white hover:-translate-y-0.5 hover:bg-ink-900"
              aria-label={t('appStore.aria')}
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="text-left leading-tight">
                <span className="block text-[10px] font-normal text-white/70">{t('appStore.label')}</span>
                <span className="text-base font-semibold">{t('appStore.store')}</span>
              </span>
            </a>
            <a
              href="#"
              className="btn gap-3 bg-ink-950 px-6 py-3 text-white hover:-translate-y-0.5 hover:bg-ink-900"
              aria-label={t('playStore.aria')}
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <span className="text-left leading-tight">
                <span className="block text-[10px] font-normal text-white/70">{t('playStore.label')}</span>
                <span className="text-base font-semibold">{t('playStore.store')}</span>
              </span>
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {features.map((feature) => (
            <div key={feature.prefix} className="card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <svg {...iconProps}>{feature.icon}</svg>
              </div>
              <h3 className="font-semibold text-fg">{t(`${feature.prefix}.title`)}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{t(`${feature.prefix}.description`)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
