'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Logo, LanguageSwitcher, ThemeToggle } from '@/components/ui';

interface NavigationProps {
  /** 'light' pins the solid (scrolled) styling for pages without a hero. */
  variant?: 'default' | 'light';
}

const links = [
  { href: '#features', key: 'features' },
  { href: '#app', key: 'app' },
  { href: '#how-it-works', key: 'howItWorks' },
  { href: '#pricing', key: 'pricing' },
] as const;

export function Navigation({ variant = 'default' }: NavigationProps) {
  const t = useTranslations('navigation');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const solid = variant === 'light' || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        solid
          ? 'bg-card/85 backdrop-blur-xl border-b border-line shadow-sm'
          : 'bg-transparent border-b border-transparent'
      )}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="PropertyCheck home">
          <Logo size={40} />
        </Link>

        {variant === 'default' && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-fg-muted rounded-lg hover:text-fg hover:bg-card-muted transition-colors"
              >
                {t(link.key)}
              </a>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href="/#download" className="btn-primary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
            </svg>
            {t('getApp')}
          </Link>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-fg rounded-lg hover:bg-card-muted transition-colors"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
            />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-card border-t border-line shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="container-page py-4 flex flex-col gap-1">
              {variant === 'default' &&
                links.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    className="px-3 py-3 text-base font-medium text-fg-muted rounded-lg hover:bg-card-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(link.key)}
                  </a>
                ))}
              <div className="flex items-center justify-between px-3 py-2">
                <LanguageSwitcher variant="inline" />
                <ThemeToggle />
              </div>
              <div className="h-px bg-line my-2" />
              <Link
                href="/#download"
                className="btn-primary mt-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
                </svg>
                {t('getApp')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
