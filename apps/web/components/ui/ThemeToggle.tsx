'use client';

import { useEffect, useState } from 'react';

type Preference = 'system' | 'light' | 'dark';

const order: Preference[] = ['system', 'light', 'dark'];

const icons: Record<Preference, React.ReactNode> = {
  system: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  ),
  light: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  ),
  dark: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  ),
};

const labels: Record<Preference, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

function apply(pref: Preference) {
  const root = document.documentElement;
  if (pref === 'system') {
    root.removeAttribute('data-theme');
    try {
      localStorage.removeItem('theme');
    } catch {}
  } else {
    root.setAttribute('data-theme', pref);
    try {
      localStorage.setItem('theme', pref);
    } catch {}
  }
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [pref, setPref] = useState<Preference>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: Preference = 'system';
    try {
      const v = localStorage.getItem('theme');
      if (v === 'light' || v === 'dark') stored = v;
    } catch {}
    setPref(stored);
    setMounted(true);
  }, []);

  const cycle = () => {
    const next = order[(order.indexOf(pref) + 1) % order.length];
    setPref(next);
    apply(next);
  };

  // Render a stable icon until mounted to avoid hydration mismatch.
  const current = mounted ? pref : 'system';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={labels[current]}
      title={labels[current]}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-card-muted hover:text-fg ${className}`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[current]}
      </svg>
    </button>
  );
}
