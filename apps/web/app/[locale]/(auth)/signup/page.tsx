'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { getProvinceOptions } from '@propertycheck/shared';

// Get province options for dropdown
const PROVINCE_OPTIONS = getProvinceOptions();

// Animation variants
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

const errorVariants: Variants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
    transition: { duration: 0.2 },
  },
};

const successVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const floatVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: [0.45, 0.05, 0.55, 0.95],
    },
  },
};

const floatVariants2: Variants = {
  animate: {
    y: [0, 15, 0],
    rotate: [0, -3, 3, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: [0.45, 0.05, 0.55, 0.95],
      delay: 1,
    },
  },
};

const floatVariants3: Variants = {
  animate: {
    y: [0, -10, 0],
    x: [0, 10, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: [0.45, 0.05, 0.55, 0.95],
      delay: 2,
    },
  },
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = (searchParams.get('plan') as 'free' | 'premium') || 'free';
  const t = useTranslations('auth.signup');
  const tCommon = useTranslations('common');

  // Plan-specific content using translations
  const planContent = {
    free: {
      title: t('titleFree'),
      subtitle: t('subtitleFree'),
      features: [
        t('freeFeatures.0'),
        t('freeFeatures.1'),
        t('freeFeatures.2'),
        t('freeFeatures.3'),
      ],
      badge: null,
    },
    premium: {
      title: t('titlePremium'),
      subtitle: t('subtitlePremium'),
      features: [
        t('premiumFeatures.0'),
        t('premiumFeatures.1'),
        t('premiumFeatures.2'),
        t('premiumFeatures.3'),
      ],
      badge: t('badgePremium'),
    },
  };

  const content = planContent[plan] || planContent.free;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!agreedToTerms) {
      setError(t('error.termsRequired'));
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            province: province,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}`,
        },
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generic'));
      setIsGoogleLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 p-6">
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              className="w-10 h-10 text-green-600"
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
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('success.message')}{' '}
            <strong className="text-gray-900">{email}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            {t('success.hint')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('success.backToLogin')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 bg-white">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <Logo size={36} color="#1a1a1a" />
          </Link>
        </motion.div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center py-8">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
                {content.badge && (
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    {content.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{content.subtitle}</p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign Up */}
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {t('googleButton')}
            </motion.button>

            <motion.div variants={itemVariants} className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('orDivider')}</span>
              </div>
            </motion.div>

            {/* Email Sign Up Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullNameLabel')}
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passwordLabel')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  minLength={8}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-2 text-xs text-gray-500">{t('passwordHint')}</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('provinceLabel')}
                </label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="" disabled>{t('provincePlaceholder')}</option>
                  {PROVINCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">{t('provinceHint')}</p>
              </motion.div>

              {/* Terms and Privacy Agreement Checkbox */}
              <motion.div variants={itemVariants} className="flex items-start gap-3">
                <input
                  id="agreedToTerms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="mt-1 w-4 h-4 text-primary-600 border-2 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="agreedToTerms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                    {t('termsLink')}
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                    {t('privacyLink')}
                  </Link>
                  , and consent to the collection and use of my personal information as described.
                </label>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading || isGoogleLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-primary-600 text-white px-4 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('submitButton')
                )}
              </motion.button>
            </form>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-center text-gray-600"
            >
              {t('hasAccount')}{' '}
              <Link
                href="/login"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                {t('signInLink')}
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          <p>&copy; {new Date().getFullYear()} {tCommon('appName')}. All rights reserved.</p>
        </motion.footer>
      </div>

      {/* Right Side - Social Proof / Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        {/* Floating shapes */}
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm"
        />
        <motion.div
          variants={floatVariants2}
          animate="animate"
          className="absolute bottom-32 left-16 w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          variants={floatVariants3}
          animate="animate"
          className="absolute top-1/2 right-32 w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm"
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute bottom-20 right-40 w-20 h-20 bg-white/5 rounded-full backdrop-blur-sm"
        />
        <motion.div
          variants={floatVariants2}
          animate="animate"
          className="absolute top-40 left-32 w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm"
        />

        {/* Content */}
        <div className="flex flex-col justify-center px-12 xl:px-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Plan features */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-10 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                {plan === 'premium' ? t('premiumIncludes') : t('freePlanIncludes')}
              </h2>
              <div className="space-y-4">
                {content.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Download App Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-white font-semibold mb-3">{t('downloadApp.title')}</h3>
              <p className="text-white/80 text-sm mb-4">
                {t('downloadApp.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Apple App Store */}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg hover:bg-black transition-all"
                  aria-label="Download on the App Store"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-tight">Download on the</div>
                    <div className="text-sm font-semibold -mt-0.5">App Store</div>
                  </div>
                </a>

                {/* Google Play Store */}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg hover:bg-black transition-all"
                  aria-label="Get it on Google Play"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-tight">Get it on</div>
                    <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm">{t('trustIndicators.ssl')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">{t('trustIndicators.gdpr')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SignupFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  );
}
