'use client';

import { motion, type Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

const iconProps = {
  className: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
} as const;

const freeFeatureIcons = [
  <svg key="photo" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  <svg key="pdf" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
  <svg key="property" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
];

const premiumFeatureIcons = [
  <svg key="share" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>,
  <svg key="compare" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>,
  <svg key="legal" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>,
  <svg key="unlimited" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
  <svg key="cloud" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>,
  <svg key="support" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>,
];

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: easeOut },
  }),
};

export function FeaturesSection() {
  const t = useTranslations('landing.features');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const freeFeatures = [
    { titleKey: 'free.photoDoc.title', descKey: 'free.photoDoc.description' },
    { titleKey: 'free.basicPdf.title', descKey: 'free.basicPdf.description' },
    { titleKey: 'free.oneProperty.title', descKey: 'free.oneProperty.description' },
  ];

  const premiumFeatures = [
    { titleKey: 'premium.shareLinks.title', descKey: 'premium.shareLinks.description' },
    { titleKey: 'premium.comparison.title', descKey: 'premium.comparison.description' },
    { titleKey: 'premium.legal.title', descKey: 'premium.legal.description' },
    { titleKey: 'premium.unlimited.title', descKey: 'premium.unlimited.description' },
    { titleKey: 'premium.cloud.title', descKey: 'premium.cloud.description' },
    { titleKey: 'premium.support.title', descKey: 'premium.support.description' },
  ];

  return (
    <section id="features" ref={ref} className="py-24 sm:py-28">
      <div className="container-page">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
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
          <p className="mt-4 text-lg text-fg-muted">{t('subtitle')}</p>
        </motion.div>

        {/* Free plan */}
        <div className="mt-16">
          <div className="mb-7 flex items-center gap-3">
            <h3 className="text-xl font-bold text-fg">{t('freePlan')}</h3>
            <span className="badge-neutral">{t('getStarted')}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {freeFeatures.map((feature, i) => (
              <motion.div
                key={feature.titleKey}
                custom={i}
                variants={card}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="card-interactive p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-card-muted text-fg ring-1 ring-inset ring-line">
                  {freeFeatureIcons[i]}
                </div>
                <h4 className="text-base font-bold text-fg">{t(feature.titleKey)}</h4>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium plan */}
        <div className="mt-14">
          <div className="mb-7 flex items-center gap-3">
            <h3 className="text-xl font-bold text-fg">{t('premiumPlan')}</h3>
            <span className="badge-primary">{t('freeTrial')}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {premiumFeatures.map((feature, i) => (
              <motion.div
                key={feature.titleKey}
                custom={i}
                variants={card}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="group card-interactive p-6 hover:border-primary-200"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  {premiumFeatureIcons[i]}
                </div>
                <h4 className="text-base font-bold text-fg transition-colors group-hover:text-primary-700">
                  {t(feature.titleKey)}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
