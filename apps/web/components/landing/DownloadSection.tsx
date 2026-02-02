'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

export function DownloadSection() {
  const t = useTranslations('landing.download');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-4">
            {t('badge')}
          </span>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* App Store Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Apple App Store */}
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all hover:scale-105"
              aria-label={t('appStore.aria')}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">{t('appStore.label')}</div>
                <div className="text-lg font-semibold -mt-1">{t('appStore.store')}</div>
              </div>
            </a>

            {/* Google Play Store */}
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all hover:scale-105"
              aria-label={t('playStore.aria')}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">{t('playStore.label')}</div>
                <div className="text-lg font-semibold -mt-1">{t('playStore.store')}</div>
              </div>
            </a>
          </motion.div>

          {/* Features highlights */}
          <motion.div
            className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{t('features.quickSetup.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('features.quickSetup.description')}</p>
            </div>

            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{t('features.photoDoc.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('features.photoDoc.description')}</p>
            </div>

            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{t('features.pdfReports.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('features.pdfReports.description')}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
