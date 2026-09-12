'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { PRICING, FREE_TIER_LIMITS } from '@propertycheck/shared';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

const FREE_FEATURES = [
  `${FREE_TIER_LIMITS.maxProperties} property`,
  `${FREE_TIER_LIMITS.maxInspectionsTotal} inspections (move-in + move-out)`,
  'Basic PDF reports',
  'Photo documentation',
  `${FREE_TIER_LIMITS.pdfRetentionDays}-day cloud storage`,
];

const PREMIUM_ONLY_FEATURES = [
  'Shareable secure links landlords trust',
  'Comparison reports without watermarks',
  'Unlimited properties',
  'Unlimited inspections',
  'Unlimited cloud storage',
  'Professional PDF reports',
  'Priority email support',
];

const PREMIUM_FEATURES = [
  { text: 'Shareable secure links landlords trust', highlight: true },
  { text: 'Legally defensible evidence for disputes', highlight: true },
  { text: 'Unlimited properties', highlight: false },
  { text: 'Unlimited inspections', highlight: false },
  { text: 'Comparison reports without watermarks', highlight: true },
  { text: 'Professional PDF reports', highlight: false },
  { text: 'Unlimited cloud storage', highlight: false },
  { text: 'Priority email support', highlight: false },
];

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600/30 border-t-primary-600" />
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canceled = searchParams.get('canceled');

  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login?redirect=/checkout');
      else setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle: isAnnual ? 'annual' : 'monthly' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) return <Spinner />;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-card p-6">
        <Link href="/" className="w-fit">
          <Logo size={40} color="#0B1524" />
        </Link>
      </header>

      <main className="px-4 py-12 sm:px-6">
        <motion.div className="mx-auto max-w-5xl" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">Upgrade to Premium</h1>
            <p className="mt-3 text-lg text-fg-muted">Unlock unlimited properties and inspections with a 7-day free trial</p>
          </motion.div>

          <AnimatePresence>
            {canceled && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mx-auto mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
              >
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Your checkout was canceled. You can try again whenever you&apos;re ready.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Free plan */}
            <motion.div variants={itemVariants} className="order-2 lg:order-1 lg:col-span-2">
              <div className="card sticky top-6 p-6">
                <span className="badge-neutral">Your Current Plan</span>
                <h2 className="mt-4 text-2xl font-bold text-fg">Free</h2>
                <p className="mt-1 text-sm text-fg-muted">Great for getting started</p>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Included</p>
                  <ul className="space-y-2.5">
                    {FREE_FEATURES.map((text) => (
                      <li key={text} className="flex items-center gap-3 text-sm">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-card-muted text-fg-muted">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-fg-muted">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="my-6 h-px bg-line" />

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Not included</p>
                  <ul className="space-y-2.5">
                    {PREMIUM_ONLY_FEATURES.map((text) => (
                      <li key={text} className="flex items-center gap-3 text-sm">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                        <span className="text-fg-subtle">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Premium plan */}
            <motion.div variants={itemVariants} className="order-1 lg:order-2 lg:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-xl">
                <div className="bg-ink-950 p-6 text-white">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-sm font-semibold uppercase tracking-wide text-amber-400">Recommended</span>
                  </div>
                  <h2 className="text-2xl font-bold">Premium Plan</h2>
                  <p className="mt-1 text-ink-300">Perfect for landlords &amp; tenants</p>
                </div>

                <div className="p-6">
                  <div className="mb-6 flex flex-col items-center">
                    <div className="inline-flex rounded-xl border border-line bg-card-muted p-1">
                      {(['monthly', 'annual'] as const).map((cycle) => {
                        const active = (cycle === 'annual') === isAnnual;
                        return (
                          <button
                            key={cycle}
                            onClick={() => setIsAnnual(cycle === 'annual')}
                            className={`rounded-lg px-5 py-2.5 text-sm font-semibold capitalize transition-all ${
                              active ? 'bg-ink-950 text-white shadow-sm' : 'text-fg-muted hover:text-fg'
                            }`}
                          >
                            {cycle}
                          </button>
                        );
                      })}
                    </div>
                    {isAnnual && <span className="badge-verified mt-2">{PRICING.annual.savings}</span>}
                  </div>

                  <div className="mb-6 border-b border-line pb-6 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold tracking-tight text-fg tabular-nums">
                        {isAnnual ? PRICING.annual.displayPrice : PRICING.monthly.displayPrice}
                      </span>
                      <span className="text-lg text-fg-muted">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-fg-subtle">
                      {isAnnual ? `Billed annually (${PRICING.annual.annualTotal})` : 'Billed monthly'}
                    </p>
                  </div>

                  <div className="mb-6 space-y-3">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Everything included</p>
                    {PREMIUM_FEATURES.map((feature, index) => (
                      <motion.div
                        key={feature.text}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.04 }}
                        className="flex items-center gap-3"
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${feature.highlight ? 'bg-verified-50 text-verified-600' : 'bg-card-muted text-fg-muted'}`}>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className={feature.highlight ? 'font-medium text-fg' : 'text-fg-muted'}>{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                      >
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    {isLoading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start 7-Day Free Trial
                      </>
                    )}
                  </motion.button>

                  <p className="mt-3 text-center text-sm text-fg-subtle">No charge until your trial ends. Cancel anytime.</p>

                  <div className="mt-6 border-t border-line pt-6">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fg-subtle">
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure checkout
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        30-day guarantee
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div variants={itemVariants} className="mt-6 rounded-xl border border-line bg-card-muted p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-card text-verified-500 shadow-xs">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-medium text-fg">30-Day Money-Back Guarantee</h3>
                    <p className="mt-1 text-sm text-fg-muted">Try Premium risk-free. If you&apos;re not satisfied, get a full refund within 30 days—no questions asked.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-fg-subtle">
        <p>&copy; {new Date().getFullYear()} PropertyCheck. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CheckoutContent />
    </Suspense>
  );
}
