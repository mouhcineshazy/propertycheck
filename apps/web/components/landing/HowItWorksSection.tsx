'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const stepImages = [
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=2070',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070',
];

export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const steps = [
    { number: '01', titleKey: 'step1.title', descKey: 'step1.description', time: '30 sec' },
    { number: '02', titleKey: 'step2.title', descKey: 'step2.description', time: '5 min' },
    { number: '03', titleKey: 'step3.title', descKey: 'step3.description', time: '10 sec' },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-4">
            {t('badge')}
          </span>
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

        {/* Steps */}
        <div className="space-y-32">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className={`flex flex-col ${
                i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 lg:gap-20 items-center`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            >
              {/* Content */}
              <div className="flex-1 max-w-xl">
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-8xl font-bold bg-gradient-to-br from-primary-100 to-primary-200 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-6">
                  {t(step.titleKey)}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {t(step.descKey)}
                </p>

                {/* Progress indicator */}
                <div className="flex items-center gap-3">
                  {steps.map((_, j) => (
                    <div
                      key={j}
                      className={`h-2 rounded-full transition-all ${
                        j <= i
                          ? 'w-12 bg-primary-600'
                          : 'w-8 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 w-full max-w-xl">
                <motion.div
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={stepImages[i]}
                    alt={t(step.titleKey)}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Floating badge */}
                  <motion.div
                    className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + i * 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {t('stepComplete', { step: i + 1 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          ~{step.time}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:scale-105"
          >
            {t('cta')}
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
        </motion.div>
      </div>
    </section>
  );
}
