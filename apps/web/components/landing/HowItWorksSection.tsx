'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';
import { RoomThumb, ROOMS } from './AppScreens';

const easeOut = [0.25, 0.1, 0.25, 1] as const;

export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const steps = [
    { number: '01', titleKey: 'step1.title', descKey: 'step1.description', time: '30 sec' },
    { number: '02', titleKey: 'step2.title', descKey: 'step2.description', time: '5 min' },
    { number: '03', titleKey: 'step3.title', descKey: 'step3.description', time: '10 sec' },
  ];

  return (
    <section id="how-it-works" ref={ref} className="overflow-hidden py-24 sm:py-28">
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

        <div className="mt-20 space-y-24">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className={`flex flex-col items-center gap-12 lg:gap-20 ${
                i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1, ease: easeOut }}
            >
              {/* Copy */}
              <div className="max-w-xl flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-6xl font-bold tracking-tight text-ink-100">{step.number}</span>
                  <span className="badge-neutral">~{step.time}</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-fg-muted">{t(step.descKey)}</p>
                <div className="mt-8 flex items-center gap-2.5">
                  {steps.map((_, j) => (
                    <div
                      key={j}
                      className={`h-1.5 rounded-full transition-all ${
                        j <= i ? 'w-10 bg-primary-600' : 'w-6 bg-ink-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="w-full max-w-md flex-1">
                <StepVisual index={i} label={t('stepComplete', { step: i + 1 })} time={step.time} />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
        >
          <a href="#download" className="btn-primary px-7 py-3.5 text-base">
            {t('cta')}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function StepVisual({ index, label, time }: { index: number; label: string; time: string }) {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-lg">
        <div className="rounded-2xl bg-card-muted p-5">
          {index === 0 && <StepAddProperty />}
          {index === 1 && <StepPhotograph />}
          {index === 2 && <StepReport />}
        </div>
      </div>

      {/* Floating completion badge */}
      <div className="absolute -bottom-4 left-6 z-10 flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-md">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-verified-50 text-verified-500">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">{label}</p>
          <p className="text-xs text-fg-subtle">~{time}</p>
        </div>
      </div>
    </div>
  );
}

function StepAddProperty() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-xs">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10h14V10" />
          </svg>
        </span>
        <div className="flex-1">
          <div className="h-2.5 w-2/3 rounded-full bg-ink-200" />
          <div className="mt-1.5 h-2 w-1/3 rounded-full bg-ink-100" />
        </div>
      </div>
      {['Kitchen', 'Bathroom', 'Bedroom'].map((room, i) => (
        <div key={room} className="flex items-center gap-3 rounded-xl bg-card/60 p-2.5">
          <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-primary-600' : 'bg-ink-200'}`} />
          <div className="h-2 w-24 rounded-full bg-ink-100" />
        </div>
      ))}
    </div>
  );
}

function StepPhotograph() {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {ROOMS.map((room, i) => (
        <RoomThumb key={room.label} room={room} flag={i === 0} rounded="rounded-lg" />
      ))}
    </div>
  );
}

function StepReport() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <div>
            <div className="h-2.5 w-24 rounded-full bg-ink-200" />
            <div className="mt-1.5 h-2 w-16 rounded-full bg-ink-100" />
          </div>
        </div>
        <span className="badge-verified">PDF</span>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-xl bg-card p-3 shadow-xs">
        {ROOMS.slice(0, 4).map((room, i) => (
          <RoomThumb key={room.label} room={room} flag={i === 2} rounded="rounded-md" />
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-primary-600 px-3 py-2.5 text-white">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        <div className="h-2 w-28 rounded-full bg-white/50" />
      </div>
    </div>
  );
}
