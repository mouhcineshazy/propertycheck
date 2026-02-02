'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useState, useRef, useEffect } from 'react';

// Map locales to flag-icons country codes
const localeFlagCodes: Record<Locale, string> = {
  en: 'ca', // Canada flag for English
  fr: 'fr', // France flag for French
};

// Flag component using flag-icons library
function FlagIcon({ locale, className = '' }: { locale: Locale; className?: string }) {
  const flagCode = localeFlagCodes[locale];
  return (
    <span
      className={`fi fi-${flagCode} fis ${className}`}
      style={{
        display: 'inline-block',
        width: '1.33333em',
        lineHeight: '1em',
        verticalAlign: 'middle',
      }}
    />
  );
}

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

export function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex items-center gap-1.5 px-2 py-1 text-sm font-medium rounded transition-colors ${
              locale === loc
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FlagIcon locale={loc} className="w-5 h-4 rounded-sm overflow-hidden" />
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FlagIcon locale={locale} className="w-5 h-4 rounded-sm overflow-hidden" />
        <span>{localeNames[locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                locale === loc
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FlagIcon locale={loc} className="w-5 h-4 rounded-sm overflow-hidden" />
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
