'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';

const footerLinks = {
  product: [
    { labelKey: 'links.features', href: '#features' },
    { labelKey: 'links.pricing', href: '#pricing' },
    { labelKey: 'links.faq', href: '/faq' },
  ],
  company: [{ labelKey: 'links.about', href: '/about' }],
  legal: [
    { labelKey: 'links.privacy', href: '/privacy' },
    { labelKey: 'links.terms', href: '/terms' },
    { labelKey: 'links.cookies', href: '/cookies' },
  ],
  support: [{ labelKey: 'links.contact', href: '/contact' }],
} as const;

const columns = [
  { section: 'sections.product', links: footerLinks.product },
  { section: 'sections.company', links: footerLinks.company },
  { section: 'sections.legal', links: footerLinks.legal },
  { section: 'sections.support', links: footerLinks.support },
] as const;

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-ink-950 pt-16 pb-8 text-ink-400">
      <div className="container-page">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center">
              <Logo size="md" variant="light" />
            </Link>
            <p className="text-sm leading-relaxed text-ink-500">{t('description')}</p>
          </div>

          {columns.map((col) => (
            <div key={col.section}>
              <h4 className="mb-4 text-sm font-semibold text-white">{t(col.section)}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('#') ? (
                      <a href={link.href} className="text-sm text-ink-400 transition-colors hover:text-white">
                        {t(link.labelKey)}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-ink-400 transition-colors hover:text-white">
                        {t(link.labelKey)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-ink-500">{t('copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2 4h20v4H2zM2 16h20v4H2z" opacity="0.35" />
              <path d="M2 9h20v6H2z" />
            </svg>
            <span>{t('madeIn')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
