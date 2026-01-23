'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FREE_TIER_LIMITS, PRICING } from '@propertycheck/shared';

const plans = [
  {
    name: 'Free',
    description: 'Complete your move-in & move-out inspections',
    price: { monthly: 0, annual: 0 },
    features: [
      `${FREE_TIER_LIMITS.maxProperties} property`,
      `${FREE_TIER_LIMITS.maxInspectionsTotal} inspections (move-in + move-out)`,
      'Basic PDF reports',
      'Photo documentation',
      `${FREE_TIER_LIMITS.pdfRetentionDays}-day cloud storage`,
    ],
    limitations: [
      'No shareable links',
      'Watermarked comparison reports',
      'No priority support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Premium',
    description: 'For renters who want legally defensible evidence',
    price: {
      monthly: parseFloat(PRICING.monthly.displayPrice.replace('$', '')),
      annual: parseFloat(PRICING.annual.displayPrice.replace('$', '')),
    },
    features: [
      'Share secure timestamped links with landlords', // LEAD with this
      'Legally defensible evidence for disputes',
      'Unlimited properties',
      'Unlimited inspections',
      'Comparison reports without watermarks',
      'Professional PDF reports',
      'Unlimited cloud storage',
      'Priority email support',
    ],
    limitations: [],
    cta: 'Start 7-Day Free Trial',
    popular: true,
  },
];

export function PricingSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Document your move-in & move-out for free. Upgrade to share evidence landlords trust.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          className="flex justify-center items-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              !isAnnual ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="bg-gray-200 p-1 rounded-lg flex"
          >
            <span
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                !isAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              )}
            >
              Monthly
            </span>
            <span
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                isAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              )}
            >
              Annual
            </span>
          </button>
          {isAnnual && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
              {PRICING.annual.savings}
            </span>
          )}
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={cn(
                'relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl',
                plan.popular && 'ring-2 ring-primary-600 shadow-xl'
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-semibold px-4 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan name & description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-500 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-500">/month</span>
                    )}
                  </div>
                  {isAnnual && plan.price.monthly > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed annually ({PRICING.annual.annualTotal})
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.price.monthly === 0 ? '/signup' : '/signup?plan=premium'}
                  className={cn(
                    'block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all',
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  )}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <div className="mt-8 space-y-4">
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    What&apos;s included
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <svg
                          className={cn(
                            'w-5 h-5 flex-shrink-0 mt-0.5',
                            // Highlight first premium feature (shareable links)
                            plan.popular && j === 0 ? 'text-primary-600' : 'text-green-500'
                          )}
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
                        <span className={cn(
                          'text-gray-700',
                          plan.popular && j === 0 && 'font-semibold text-gray-900'
                        )}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, j) => (
                      <li
                        key={`limit-${j}`}
                        className="flex items-start gap-3 opacity-50"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 text-gray-600">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>30-day money-back guarantee • Cancel anytime • No questions asked</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
