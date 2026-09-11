'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { FREE_TIER_LIMITS, PRICING } from '@propertycheck/shared';

const easeOut = [0.25, 0.1, 0.25, 1] as const;

function Check({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5 flex-shrink-0', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PricingSection() {
  const t = useTranslations('landing.pricing');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      nameKey: 'free.name',
      descriptionKey: 'free.description',
      price: { monthly: 0, annual: 0 },
      features: [
        t('free.features.property', { count: FREE_TIER_LIMITS.maxProperties }),
        t('free.features.inspections', { count: FREE_TIER_LIMITS.maxInspectionsTotal }),
        t('free.features.basicPdf'),
        t('free.features.photoDoc'),
        t('free.features.storage', { days: FREE_TIER_LIMITS.pdfRetentionDays }),
      ],
      limitations: [
        t('free.limitations.noLinks'),
        t('free.limitations.watermark'),
        t('free.limitations.noSupport'),
      ],
      ctaKey: 'free.cta',
      popular: false,
    },
    {
      nameKey: 'premium.name',
      descriptionKey: 'premium.description',
      price: {
        monthly: parseFloat(PRICING.monthly.displayPrice.replace('$', '')),
        annual: parseFloat(PRICING.annual.displayPrice.replace('$', '')),
      },
      features: [
        t('premium.features.shareLinks'),
        t('premium.features.legalEvidence'),
        t('premium.features.unlimitedProperties'),
        t('premium.features.unlimitedInspections'),
        t('premium.features.comparisonReports'),
        t('premium.features.professionalPdf'),
        t('premium.features.unlimitedStorage'),
        t('premium.features.prioritySupport'),
      ],
      limitations: [],
      ctaKey: 'premium.cta',
      popular: true,
    },
  ];

  const addons = [
    {
      nameKey: 'addons.reportUnlock.name',
      periodKey: 'addons.reportUnlock.period',
      descKey: 'addons.reportUnlock.description',
      priceKey: 'addons.reportUnlock.price',
      ctaKey: 'addons.reportUnlock.cta',
      featureKeys: ['feature1', 'feature2', 'feature3'] as const,
      prefix: 'addons.reportUnlock',
      primary: false,
    },
    {
      nameKey: 'addons.bundle.name',
      periodKey: 'addons.bundle.period',
      descKey: 'addons.bundle.description',
      priceKey: 'addons.bundle.price',
      ctaKey: 'addons.bundle.cta',
      featureKeys: ['feature1', 'feature2', 'feature3', 'feature4'] as const,
      prefix: 'addons.bundle',
      primary: true,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="bg-card-muted py-24 sm:py-28">
      <div className="container-page">
        {/* Header */}
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

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="inline-flex items-center rounded-xl border border-line bg-card p-1 shadow-xs">
            {(['monthly', 'annual'] as const).map((cycle) => {
              const active = (cycle === 'annual') === isAnnual;
              return (
                <button
                  key={cycle}
                  onClick={() => setIsAnnual(cycle === 'annual')}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                    active ? 'bg-ink-950 text-white shadow-sm' : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {t(cycle)}
                </button>
              );
            })}
          </div>
          {isAnnual && <span className="badge-verified">{PRICING.annual.savings}</span>}
        </div>

        {/* Plan cards */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.nameKey}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-3xl bg-card p-8',
                plan.popular
                  ? 'shadow-lg ring-2 ring-primary-600'
                  : 'border border-line shadow-sm'
              )}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: easeOut }}
            >
              {plan.popular && (
                <div className="absolute right-5 top-5">
                  <span className="badge-primary">{t('mostPopular')}</span>
                </div>
              )}

              <h3 className="text-xl font-bold text-fg">{t(plan.nameKey)}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{t(plan.descriptionKey)}</p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold tracking-tight text-fg tabular-nums">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-sm font-medium text-fg-muted">/{t('perMonth')}</span>
                  )}
                </div>
                {isAnnual && plan.price.monthly > 0 && (
                  <p className="mt-1 text-sm text-fg-subtle">
                    {t('billedAnnually', { total: PRICING.annual.annualTotal })}
                  </p>
                )}
              </div>

              <Link
                href={plan.price.monthly === 0 ? '/signup' : '/signup?plan=premium'}
                className={cn('mt-7', plan.popular ? 'btn-primary py-3' : 'btn-secondary py-3')}
              >
                {t(plan.ctaKey)}
              </Link>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                  {t('whatsIncluded')}
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className={cn('mt-0.5', plan.popular ? 'text-primary-600' : 'text-verified-500')} />
                      <span className="text-sm text-fg-muted">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, j) => (
                    <li key={`limit-${j}`} className="flex items-start gap-3">
                      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-fg-subtle line-through decoration-ink-200">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-2 text-sm text-fg-muted"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Check className="text-verified-500" />
          <span>{t('guarantee')}</span>
        </motion.div>

        {/* Add-ons */}
        <div className="mx-auto mt-16 flex max-w-4xl items-center gap-4">
          <div className="h-px flex-1 bg-line" />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fg">{t('addons.title')}</p>
            <p className="mt-0.5 text-xs text-fg-subtle">{t('addons.subtitle')}</p>
          </div>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
          {addons.map((addon, i) => (
            <motion.div
              key={addon.prefix}
              className="card-interactive p-6 hover:border-primary-200"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.05, ease: easeOut }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-fg">{t(addon.nameKey)}</h3>
                <span className="badge-warning">{t(addon.periodKey)}</span>
              </div>
              <p className="mb-4 text-sm text-fg-muted">{t(addon.descKey)}</p>
              <div className="mb-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-fg tabular-nums">{t(addon.priceKey)}</span>
                <span className="text-sm text-fg-subtle">{t(addon.periodKey)}</span>
              </div>
              <Link href="#download" className={cn('w-full', addon.primary ? 'btn-primary py-2.5' : 'btn-secondary py-2.5')}>
                {t(addon.ctaKey)}
              </Link>
              <ul className="mt-5 space-y-2.5">
                {addon.featureKeys.map((key) => (
                  <li key={key} className="flex items-center gap-2.5 text-sm text-fg-muted">
                    <Check className="h-4 w-4 text-verified-500" />
                    {t(`${addon.prefix}.${key}`)}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-fg-subtle">{t('addons.appNote')}</p>
      </div>
    </section>
  );
}
