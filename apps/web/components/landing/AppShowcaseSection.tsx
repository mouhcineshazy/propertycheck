'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';
import { PhoneFrame, PropertiesScreen, CaptureScreen, ReportScreen } from './AppScreens';

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const screens = [
  { key: 'organize', Screen: PropertiesScreen },
  { key: 'capture', Screen: CaptureScreen },
  { key: 'report', Screen: ReportScreen },
] as const;

const bulletKeys = ['a', 'b', 'c'] as const;

export function AppShowcaseSection() {
  const t = useTranslations('landing.appShowcase');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="app" ref={ref} className="overflow-hidden py-24 sm:py-28">
      <div className="container-page">
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

        <div className="mt-20 space-y-24 lg:space-y-28">
          {screens.map(({ key, Screen }, i) => (
            <motion.div
              key={key}
              className={`flex flex-col items-center gap-12 lg:gap-20 ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1, ease: easeOut }}
            >
              {/* Copy */}
              <div className="max-w-lg flex-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                  {t('stepLabel', { step: i + 1 })}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-fg-muted">{t(`${key}.description`)}</p>
                <ul className="mt-6 space-y-3">
                  {bulletKeys.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-verified-50 text-verified-600">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm text-fg-muted">{t(`${key}.bullets.${b}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-sm rounded-full bg-primary-500/10 blur-3xl" />
                <PhoneFrame>
                  <Screen />
                </PhoneFrame>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
