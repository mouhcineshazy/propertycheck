'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { PRICING, FREE_TIER_LIMITS } from '@propertycheck/shared';

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Free tier features (what they have)
const FREE_FEATURES = [
  { text: `${FREE_TIER_LIMITS.maxProperties} property`, included: true },
  { text: `${FREE_TIER_LIMITS.maxInspectionsTotal} inspections (move-in + move-out)`, included: true },
  { text: 'Basic PDF reports', included: true },
  { text: 'Photo documentation', included: true },
  { text: `${FREE_TIER_LIMITS.pdfRetentionDays}-day cloud storage`, included: true },
];

// Premium-only features (X marks for free) - lead with shareable links
const PREMIUM_ONLY_FEATURES = [
  { text: 'Shareable secure links landlords trust', included: false },
  { text: 'Comparison reports without watermarks', included: false },
  { text: 'Unlimited properties', included: false },
  { text: 'Unlimited inspections', included: false },
  { text: 'Unlimited cloud storage', included: false },
  { text: 'Professional PDF reports', included: false },
  { text: 'Priority email support', included: false },
];

// Premium plan features (all included) - lead with shareable links
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

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canceled = searchParams.get('canceled');

  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual for better value
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/checkout');
      } else {
        setIsAuthenticated(true);
      }
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
        body: JSON.stringify({
          billingCycle: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-white border-b border-gray-100"
      >
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <Logo size={36} color="#1a1a1a" />
          {/* <span className="text-xl font-bold text-gray-900">PropertyCheck</span> */}
        </Link>
      </motion.header>

      {/* Main content */}
      <main className="py-12 px-4 sm:px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Upgrade to Premium
            </h1>
            <p className="text-lg text-gray-600">
              Unlock unlimited properties and inspections with a 7-day free trial
            </p>
          </motion.div>

          {/* Canceled notice */}
          <AnimatePresence>
            {canceled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start gap-3 max-w-2xl mx-auto"
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Your checkout was canceled. You can try again whenever you&apos;re ready.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main checkout card */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left side - Current Plan (Free) */}
            <motion.div variants={itemVariants} className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
                {/* Current plan badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                    Your Current Plan
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">Free</h2>
                <p className="text-gray-500 text-sm mb-6">Great for getting started</p>

                {/* What you have */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Included
                  </p>
                  <ul className="space-y-2.5">
                    {FREE_FEATURES.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-6" />

                {/* What you're missing */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Not included
                  </p>
                  <ul className="space-y-2.5">
                    {PREMIUM_ONLY_FEATURES.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-gray-400">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Right side - Premium Plan */}
            <motion.div variants={itemVariants} className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Plan header - neutral colors */}
                <div className="bg-gray-900 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-wide">
                      Recommended
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">Premium Plan</h2>
                  <p className="text-gray-400 mt-1">Perfect for landlords & tenants</p>
                </div>

                <div className="p-6">
                  {/* Billing toggle - segmented control style */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                      <button
                        onClick={() => setIsAnnual(false)}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                          !isAnnual
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setIsAnnual(true)}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                          isAnnual
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Annual
                      </button>
                    </div>
                    {isAnnual && (
                      <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {PRICING.annual.savings}
                      </span>
                    )}
                  </div>

                  {/* Price display */}
                  <div className="text-center mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        {isAnnual ? PRICING.annual.displayPrice : PRICING.monthly.displayPrice}
                      </span>
                      <span className="text-gray-500 text-lg">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-gray-500 mt-2">
                        Billed annually ({PRICING.annual.annualTotal})
                      </p>
                    )}
                    {!isAnnual && (
                      <p className="text-sm text-gray-500 mt-2">
                        Billed monthly
                      </p>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Everything included
                    </p>
                    {PREMIUM_FEATURES.map((feature, index) => (
                      <motion.div
                        key={feature.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.highlight ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <svg
                            className={`w-3 h-3 ${feature.highlight ? 'text-green-600' : 'text-gray-500'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                      >
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Checkout button - only blue element */}
                  <motion.button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start 7-Day Free Trial
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-sm text-gray-500 mt-3">
                    No charge until your trial ends. Cancel anytime.
                  </p>

                  {/* Trust indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>30-day guarantee</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        <span>Cancel anytime</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Money back guarantee */}
              <motion.div
                variants={itemVariants}
                className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">30-Day Money-Back Guarantee</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Try Premium risk-free. If you&apos;re not satisfied, get a full refund within 30 days—no questions asked.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Back link */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-6 text-center text-sm text-gray-400 border-t border-gray-100"
      >
        <p>&copy; {new Date().getFullYear()} PropertyCheck. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
