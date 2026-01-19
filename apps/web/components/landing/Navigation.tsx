'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo, LogoOutline } from '@/components/ui/Logo';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5">
          {scrolled ? (
            <Logo size={36} color="#1a1a1a" />
          ) : (
            <LogoOutline size={36} color="white" />
          )}
          <span
            className={cn(
              'text-xl font-semibold tracking-tight transition-colors',
              scrolled ? 'text-gray-900' : 'text-white'
            )}
          >
            PropertyCheck
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className={cn(
              'font-medium transition-colors',
              scrolled
                ? 'text-gray-700 hover:text-primary-600'
                : 'text-white/90 hover:text-white'
            )}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className={cn(
              'font-medium transition-colors',
              scrolled
                ? 'text-gray-700 hover:text-primary-600'
                : 'text-white/90 hover:text-white'
            )}
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className={cn(
              'font-medium transition-colors',
              scrolled
                ? 'text-gray-700 hover:text-primary-600'
                : 'text-white/90 hover:text-white'
            )}
          >
            Pricing
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className={cn(
              'font-medium transition-colors px-4 py-2',
              scrolled
                ? 'text-gray-700 hover:text-primary-600'
                : 'text-white hover:text-white/80'
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/30"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className={cn('w-6 h-6', scrolled ? 'text-gray-900' : 'text-white')}
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
            <Link
              href="#features"
              className="text-gray-700 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-gray-700 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <hr />
            <Link href="/login" className="text-gray-700 font-medium py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-center"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
