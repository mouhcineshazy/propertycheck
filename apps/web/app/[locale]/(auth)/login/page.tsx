'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

const errorVariants: Variants = {
  hidden: { opacity: 0, y: -8, height: 0 },
  visible: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, height: 0, transition: { duration: 0.2 } },
};

function LoginContent() {
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

  const depositTips = [1, 2, 3, 4].map((n) => ({
    title: tTips(`tip${n}.title`),
    description: tTips(`tip${n}.description`),
  }));

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('No session returned from login');
      await new Promise((resolve) => setTimeout(resolve, 100));
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
        options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generic'));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Form side */}
      <div className="flex w-full flex-col p-6 lg:w-1/2 lg:p-12">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="w-fit">
            <Logo size={40} color="#0B1524" />
          </Link>
        </motion.div>

        <div className="flex flex-1 items-center justify-center py-8">
          <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-fg">{t('title')}</h1>
              <p className="mt-2 text-fg-muted">{t('subtitle')}</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
              variants={itemVariants}
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="btn-secondary w-full py-3.5"
            >
              {isGoogleLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-300 border-t-ink-600" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {t('googleButton')}
            </motion.button>

            <motion.div variants={itemVariants} className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-canvas px-4 text-sm text-fg-subtle">{t('orDivider')}</span>
              </div>
            </motion.div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="label">{t('emailLabel')}</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="input"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="label mb-0">{t('passwordLabel')}</label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="input"
                />
              </motion.div>

              <motion.button variants={itemVariants} type="submit" disabled={isLoading || isGoogleLoading} className="btn-primary w-full py-3.5">
                {isLoading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : t('submitButton')}
              </motion.button>
            </form>

            <motion.p variants={itemVariants} className="mt-8 text-center text-fg-muted">
              {t('noAccount')}{' '}
              <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                {t('signUpLink')}
              </Link>
            </motion.p>
          </motion.div>
        </div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-sm text-fg-subtle">
          <p>&copy; {new Date().getFullYear()} {tCommon('appName')}. All rights reserved.</p>
        </motion.footer>
      </div>

      <AuthBrandPanel
        heading={tTips('title')}
        items={depositTips}
        downloadTitle="Download the App"
        downloadSubtitle="Available on iOS and Android. Document your rental property anywhere, anytime."
      />
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600/30 border-t-primary-600" />
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
