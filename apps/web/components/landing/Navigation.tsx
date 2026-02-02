'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Logo, LogoOutline, LanguageSwitcher } from '@/components/ui';

interface NavigationProps {
  /** Use 'light' variant for pages with white/light backgrounds (FAQ, Privacy, etc.) */
  variant?: 'default' | 'light';
}

export function Navigation({ variant = 'default' }: NavigationProps) {
  const t = useTranslations('navigation');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // For light variant pages, always show dark styling
  const showDarkStyle = variant === 'light' || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        showDarkStyle
          ? 'bg-white/90 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5">
          {showDarkStyle ? (
            <Logo size={36} color="#1a1a1a" />
          ) : (
            <LogoOutline size={36} color="white" />
          )}
        </Link>

        {/* Desktop Navigation - Only show on landing page (default variant) */}
        {variant === 'default' && (
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className={cn(
                'font-medium transition-colors',
                showDarkStyle
                  ? 'text-gray-700 hover:text-primary-600'
                  : 'text-white/90 hover:text-white'
              )}
            >
              {t('features')}
            </a>
            <a
              href="#how-it-works"
              className={cn(
                'font-medium transition-colors',
                showDarkStyle
                  ? 'text-gray-700 hover:text-primary-600'
                  : 'text-white/90 hover:text-white'
              )}
            >
              {t('howItWorks')}
            </a>
            <a
              href="#pricing"
              className={cn(
                'font-medium transition-colors',
                showDarkStyle
                  ? 'text-gray-700 hover:text-primary-600'
                  : 'text-white/90 hover:text-white'
              )}
            >
              {t('pricing')}
            </a>
          </div>
        )}

        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/login"
            className={cn(
              'font-medium transition-colors px-4 py-2',
              showDarkStyle
                ? 'text-gray-700 hover:text-primary-600'
                : 'text-white hover:text-white/80'
            )}
          >
            {t('login')}
          </Link>
          <Link
            href="/signup"
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/30"
          >
            {t('getStarted')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className={cn('w-6 h-6', showDarkStyle ? 'text-gray-900' : 'text-white')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white border-t"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            {variant === 'default' && (
              <>
                <a
                  href="#features"
                  className="text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('features')}
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('howItWorks')}
                </a>
                <a
                  href="#pricing"
                  className="text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('pricing')}
                </a>
                <hr />
              </>
            )}
            <div className="py-2">
              <LanguageSwitcher variant="inline" />
            </div>
            <hr />
            <Link href="/login" className="text-gray-700 font-medium py-2">
              {t('login')}
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-center"
            >
              {t('getStarted')}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
