'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/stripe/config';
import { Logo } from '@/components/ui/Logo';

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

// Floating animation for decorative elements
const floatVariants: Variants = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: [0.45, 0.05, 0.55, 0.95],
    },
  },
};

// Extended plan details for checkout display
const planDetails = {
  premium: {
    name: 'Premium',
    tagline: 'Perfect for landlords & tenants',
    price: 9.99,
    annualPrice: 99.99, // ~17% savings
    features: [
      { text: 'Unlimited properties', highlight: true },
      { text: 'Unlimited inspections', highlight: true },
      { text: 'Professional PDF reports', highlight: false },
      { text: 'Priority email support', highlight: false },
      { text: 'Comparison reports', highlight: false },
      { text: 'Share reports with landlords', highlight: false },
    ],
    gradient: 'from-primary-600 via-primary-700 to-blue-700',
    badge: null,
  },
  pro: {
    name: 'Pro',
    tagline: 'For property managers & agencies',
    price: 19.99,
    annualPrice: 199.99, // ~17% savings
    features: [
      { text: 'Everything in Premium', highlight: false },
      { text: 'Team collaboration (up to 5)', highlight: true },
      { text: 'API access', highlight: true },
      { text: 'Custom branding on reports', highlight: true },
      { text: 'Bulk property import', highlight: false },
      { text: 'Dedicated account manager', highlight: false },
      { text: 'Phone support', highlight: false },
    ],
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
    badge: 'Most Popular',
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get('plan') || 'premium';
  const canceled = searchParams.get('canceled');

  // Validate plan parameter - default to premium if invalid
  const plan = planParam in planDetails ? planParam : 'premium';
  const selectedPlan = planDetails[plan as keyof typeof planDetails];

  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/checkout?plan=${plan}`);
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [router, plan]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          billingCycle: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  // Calculate prices
  const monthlyPrice = selectedPlan.price;
  const annualPrice = selectedPlan.annualPrice;
  const displayPrice = isAnnual ? annualPrice : monthlyPrice;
  const monthlySavings = isAnnual ? ((monthlyPrice * 12 - annualPrice) / 12).toFixed(2) : null;

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <Logo size={36} color="#1a1a1a" />
          <span className="text-xl font-bold text-gray-900">PropertyCheck</span>
        </Link>
      </motion.header>

      {/* Main content */}
      <main className="pb-16 px-4 sm:px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Upgrade to {selectedPlan.name}
            </h1>
            <p className="text-lg text-gray-600">
              {selectedPlan.tagline} • 14-day free trial • Cancel anytime
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
            {/* Left side - Plan comparison */}
            <motion.div variants={itemVariants} className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Compare plans</h2>

                {/* Free plan */}
                <div className="pb-4 mb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">Free</span>
                    <span className="text-gray-500">$0/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {PLANS.free.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium plan */}
                <div className={`pb-4 ${plan === 'pro' ? 'mb-4 border-b border-gray-100' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-medium ${plan === 'premium' ? 'text-primary-600' : 'text-gray-700'}`}>
                      Premium
                    </span>
                    <span className={plan === 'premium' ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                      ${planDetails.premium.price}/mo
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {planDetails.premium.features.slice(0, 4).map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${feature.highlight ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro plan (only show if available) */}
                {plan === 'pro' && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-violet-600">Pro</span>
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                          Popular
                        </span>
                      </div>
                      <span className="text-violet-600 font-medium">${planDetails.pro.price}/mo</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {planDetails.pro.features.slice(0, 4).map((feature) => (
                        <li key={feature.text} className="flex items-center gap-2">
                          <svg className={`w-4 h-4 ${feature.highlight ? 'text-violet-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Switch plan link */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    {plan === 'premium' ? (
                      <>
                        Need team features?{' '}
                        <Link href="/checkout?plan=pro" className="text-violet-600 font-medium hover:text-violet-700">
                          Try Pro →
                        </Link>
                      </>
                    ) : (
                      <>
                        Just need basics?{' '}
                        <Link href="/checkout?plan=premium" className="text-primary-600 font-medium hover:text-primary-700">
                          ← Go Premium
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right side - Checkout form */}
            <motion.div variants={itemVariants} className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Plan header with gradient */}
                <div className={`bg-gradient-to-r ${selectedPlan.gradient} p-6 text-white relative overflow-hidden`}>
                  {/* Floating decorative shapes */}
                  <motion.div
                    variants={floatVariants}
                    animate="animate"
                    className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                  />
                  <motion.div
                    variants={floatVariants}
                    animate="animate"
                    style={{ animationDelay: '2s' }}
                    className="absolute right-20 bottom-0 w-20 h-20 bg-white/5 rounded-full blur-xl"
                  />

                  <div className="relative">
                    {selectedPlan.badge && (
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3">
                        {selectedPlan.badge}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold mb-1">{selectedPlan.name} Plan</h2>
                    <p className="text-white/80">{selectedPlan.tagline}</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Billing toggle */}
                  <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                      Monthly
                    </span>
                    <button
                      onClick={() => setIsAnnual(!isAnnual)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        isAnnual ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
                    >
                      <motion.span
                        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                        animate={{ x: isAnnual ? 28 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                      Annual
                      <span className="ml-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Save 17%
                      </span>
                    </span>
                  </div>

                  {/* Price display */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        ${displayPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-lg">/{isAnnual ? 'year' : 'month'}</span>
                    </div>
                    {isAnnual && monthlySavings && (
                      <p className="text-sm text-green-600 mt-2">
                        You save ${monthlySavings}/month (${(parseFloat(monthlySavings) * 12).toFixed(2)}/year)
                      </p>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-6">
                    {selectedPlan.features.map((feature, index) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

                  {/* Checkout button */}
                  <motion.button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                      plan === 'pro'
                        ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/30'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Start 14-Day Free Trial
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-sm text-gray-500 mt-3">
                    You won&apos;t be charged until your trial ends
                  </p>

                  {/* Trust indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>SSL secured</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>GDPR compliant</span>
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
                className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">30-Day Money-Back Guarantee</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Try {selectedPlan.name} risk-free. If you&apos;re not satisfied, get a full refund within 30 days—no questions asked.
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
        className="py-6 text-center text-sm text-gray-400"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
