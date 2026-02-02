'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const t = useTranslations('auth.login');
  const tTips = useTranslations('auth.tips');
  const tCommon = useTranslations('common');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deposit protection tips for right side
  const depositTips = [
    {
      title: tTips('tip1.title'),
      description: tTips('tip1.description'),
    },
    {
      title: tTips('tip2.title'),
      description: tTips('tip2.description'),
    },
    {
      title: tTips('tip3.title'),
      description: tTips('tip3.description'),
    },
    {
      title: tTips('tip4.title'),
      description: tTips('tip4.description'),
    },
  ];

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify we actually got a session
      if (!data.session) {
        throw new Error('No session returned from login');
      }

      // Small delay to ensure cookies are set before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use window.location for a full page reload to ensure cookies are sent
      // router.push doesn't always trigger middleware re-evaluation with new cookies
      window.location.href = redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generic'));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generic'));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
              <p className="text-gray-600">{t('subtitle')}</p>
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

            {/* Google Sign In */}
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={handleGoogleLogin}
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

            {/* Email Sign In Form */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('passwordLabel')}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
                />
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
              className="mt-8 text-center text-gray-600"
            >
              {t('noAccount')}{' '}
              <Link
                href="/signup"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                {t('signUpLink')}
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

      {/* Right Side - Social Proof / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 relative overflow-hidden">
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
          style={{ animationDelay: '3s' }}
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
            {/* Deposit Protection Tips */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {tTips('title')}
              </h2>
              <div className="space-y-4">
                {depositTips.map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{tip.title}</p>
                      <p className="text-white/70 text-sm">{tip.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Download App Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-white font-semibold mb-3">Download the App</h3>
              <p className="text-white/80 text-sm mb-4">
                Available on iOS and Android. Document your rental property anywhere, anytime.
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
