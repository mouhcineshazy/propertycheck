'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { getProvinceOptions } from '@propertycheck/shared';

const PROVINCE_OPTIONS = getProvinceOptions();

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
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

function SignupContent() {
  const searchParams = useSearchParams();
  const plan = (searchParams.get('plan') as 'free' | 'premium') || 'free';
  const t = useTranslations('auth.signup');
  const tCommon = useTranslations('common');

  const planContent = {
    free: {
      title: t('titleFree'),
      subtitle: t('subtitleFree'),
      features: [t('freeFeatures.0'), t('freeFeatures.1'), t('freeFeatures.2'), t('freeFeatures.3')],
      badge: null as string | null,
    },
    premium: {
      title: t('titlePremium'),
      subtitle: t('subtitlePremium'),
      features: [t('premiumFeatures.0'), t('premiumFeatures.1'), t('premiumFeatures.2'), t('premiumFeatures.3')],
      badge: t('badgePremium'),
    },
  };
  const content = planContent[plan] || planContent.free;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
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
          data: { full_name: fullName, province, marketing_consent: marketingConsent },
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
        options: { redirectTo: `${window.location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.generic'));
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="card w-full max-w-md p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-verified-50 text-verified-500"
          >
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-fg">{t('success.title')}</h1>
          <p className="mt-2 text-fg-muted">
            {t('success.message')} <strong className="text-fg">{email}</strong>
          </p>
          <p className="mt-4 text-sm text-fg-subtle">{t('success.hint')}</p>
          <Link href="/login" className="mt-8 inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('success.backToLogin')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex w-full flex-col p-6 lg:w-1/2 lg:p-12">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="w-fit">
            <Logo size={40} color="#0B1524" />
          </Link>
        </motion.div>

        <div className="flex flex-1 items-center justify-center py-8">
          <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-fg">{content.title}</h1>
                {content.badge && <span className="badge-primary">{content.badge}</span>}
              </div>
              <p className="mt-2 text-fg-muted">{content.subtitle}</p>
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
              onClick={handleGoogleSignup}
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

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label htmlFor="fullName" className="label">{t('fullNameLabel')}</label>
                <input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('fullNamePlaceholder')} required disabled={isLoading || isGoogleLoading} className="input" />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="label">{t('emailLabel')}</label>
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} required disabled={isLoading || isGoogleLoading} className="input" />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="label">{t('passwordLabel')}</label>
                <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} required minLength={8} disabled={isLoading || isGoogleLoading} className="input" />
                <p className="mt-2 text-xs text-fg-subtle">{t('passwordHint')}</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="province" className="label">{t('provinceLabel')}</label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="input cursor-pointer appearance-none bg-card"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2363748d' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="" disabled>{t('provincePlaceholder')}</option>
                  {PROVINCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-fg-subtle">{t('provinceHint')}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-3">
                <input id="agreedToTerms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} required disabled={isLoading || isGoogleLoading} className="mt-1 h-4 w-4 cursor-pointer rounded border-2 border-line-strong text-primary-600 focus:ring-2 focus:ring-primary-500" />
                <label htmlFor="agreedToTerms" className="cursor-pointer text-sm text-fg-muted">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-primary-600 underline hover:text-primary-700">{t('termsLink')}</Link>{' '}and{' '}
                  <Link href="/privacy" target="_blank" className="text-primary-600 underline hover:text-primary-700">{t('privacyLink')}</Link>, and consent to the collection and use of my personal information as described.
                </label>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-3">
                <input id="marketingConsent" type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} disabled={isLoading || isGoogleLoading} className="mt-1 h-4 w-4 cursor-pointer rounded border-2 border-line-strong text-primary-600 focus:ring-2 focus:ring-primary-500" />
                <label htmlFor="marketingConsent" className="cursor-pointer text-sm text-fg-subtle">
                  I&apos;d like to receive tips, product updates, and deposit-protection advice by email. You can unsubscribe at any time.
                </label>
              </motion.div>

              <motion.button variants={itemVariants} type="submit" disabled={isLoading || isGoogleLoading} className="btn-primary w-full py-3.5">
                {isLoading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : t('submitButton')}
              </motion.button>
            </form>

            <motion.p variants={itemVariants} className="mt-6 text-center text-fg-muted">
              {t('hasAccount')}{' '}
              <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">{t('signInLink')}</Link>
            </motion.p>
          </motion.div>
        </div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-sm text-fg-subtle">
          <p>&copy; {new Date().getFullYear()} {tCommon('appName')}. All rights reserved.</p>
        </motion.footer>
      </div>

      <AuthBrandPanel
        heading={plan === 'premium' ? t('premiumIncludes') : t('freePlanIncludes')}
        items={content.features.map((f) => ({ title: f }))}
        downloadTitle={t('downloadApp.title')}
        downloadSubtitle={t('downloadApp.subtitle')}
        trust={{ ssl: t('trustIndicators.ssl'), gdpr: t('trustIndicators.gdpr') }}
      />
    </div>
  );
}

function SignupFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600/30 border-t-primary-600" />
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
