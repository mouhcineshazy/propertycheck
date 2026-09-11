'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const trustKeys = ['trust.easyToUse', 'trust.freePlan', 'trust.freeTrial'] as const;

export function CTASection() {
  const t = useTranslations('landing.cta');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink-950 py-24 sm:py-28">
      {/* Ambient glow + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary-600/25 blur-3xl" />
      </div>

      <div className="container-page relative">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-display">
            {t('title')}{' '}
            <span className="bg-gradient-to-br from-primary-300 to-primary-500 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-300">{t('subtitle')}</p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn group bg-white px-7 py-3.5 text-base text-ink-950 shadow-lg hover:-translate-y-0.5 hover:bg-ink-50"
            >
              {t('primaryCta')}
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="btn border border-white/25 px-7 py-3.5 text-base text-white hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t('secondaryCta')}
            </Link>
          </div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {trustKeys.map((key) => (
              <div key={key} className="flex items-center gap-2 text-sm text-ink-300">
                <svg className="h-5 w-5 text-verified-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t(key)}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
