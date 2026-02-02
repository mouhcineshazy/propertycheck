'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

const freeFeatureIcons = [
  <svg key="photo" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  <svg key="pdf" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
  <svg key="property" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
];

const premiumFeatureIcons = [
  <svg key="share" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>,
  <svg key="compare" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>,
  <svg key="legal" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>,
  <svg key="unlimited" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
  <svg key="cloud" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>,
  <svg key="support" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>,
];

const freeGradients = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-green-500 to-emerald-500',
];

const premiumGradients = [
  'from-primary-500 to-blue-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-amber-500 to-orange-500',
];

export function FeaturesSection() {
  const t = useTranslations('landing.features');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
    <section id="features" ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('badge')}
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Free Plan Features */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-2xl font-bold text-gray-900">{t('freePlan')}</h3>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {t('getStarted')}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {freeFeatures.map((feature, i) => (
              <motion.div
                key={i}
                className="group relative bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${freeGradients[i]} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {freeFeatureIcons[i]}
                </div>

                {/* Content */}
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t(feature.titleKey)}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Plan Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-2xl font-bold text-gray-900">{t('premiumPlan')}</h3>
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
              {t('freeTrial')}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, i) => (
              <motion.div
                key={i}
                className="group relative bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${premiumGradients[i]} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

                {/* Icon */}
                <div className={`relative w-12 h-12 bg-gradient-to-br ${premiumGradients[i]} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  {premiumFeatureIcons[i]}
                </div>

                {/* Content */}
                <h4 className="relative text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {t(feature.titleKey)}
                </h4>
                <p className="relative text-gray-600 text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
