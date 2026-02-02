'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const t = useTranslations('footer');

  const footerLinks = {
    product: [
      { labelKey: 'links.features', href: '#features' },
      { labelKey: 'links.pricing', href: '#pricing' },
      { labelKey: 'links.faq', href: '/faq' },
    ],
    company: [
      { labelKey: 'links.about', href: '/about' },
    ],
    legal: [
      { labelKey: 'links.privacy', href: '/privacy' },
      { labelKey: 'links.terms', href: '/terms' },
      { labelKey: 'links.cookies', href: '/cookies' },
    ],
    support: [
      { labelKey: 'links.contact', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo size="sm" variant="light" />
            </Link>
            <p className="text-sm text-gray-500 mb-4">
              {t('description')}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('sections.product')}</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('sections.company')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('sections.legal')}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('sections.support')}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm">{t('madeIn')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
