'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CASE_STUDIES, PROVINCES } from '@propertycheck/shared';

export function CaseStudiesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-green-600 font-semibold text-sm uppercase tracking-wider mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Renters Who{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Won Their Deposits Back
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real Canadian renters. Real disputes. Real outcomes. See how timestamped evidence made the difference.
          </p>
        </motion.div>

        {/* Case study cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {CASE_STUDIES.map((caseStudy, i) => {
            const province = PROVINCES[caseStudy.province];
            return (
              <motion.div
                key={caseStudy.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/* Province badge */}
                <div className="bg-gray-900 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{province?.name}</span>
                    <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {caseStudy.amountSaved} saved
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Scenario */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      The Dispute
                    </p>
                    <p className="text-gray-900 font-medium">
                      {caseStudy.scenario}
                    </p>
                  </div>

                  {/* How PropertyCheck helped */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                      The Evidence
                    </p>
                    <p className="text-gray-600 text-sm">
                      {caseStudy.howPropertyCheckHelped}
                    </p>
                  </div>

                  {/* Outcome */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">
                      The Outcome
                    </p>
                    <p className="text-green-800 font-medium text-sm">
                      {caseStudy.outcome}
                    </p>
                  </div>

                  {/* Quote */}
                  {caseStudy.anonymizedQuote && (
                    <div className="border-l-2 border-gray-200 pl-4">
                      <p className="text-gray-500 text-sm italic">
                        &ldquo;{caseStudy.anonymizedQuote}&rdquo;
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        — Verified PropertyCheck user, {province?.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dispute body reference */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Resolved via {province?.disputeBody}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-600 mb-4">
            Don&apos;t wait until there&apos;s a dispute. Document everything from day one.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Protect Your Deposit Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
