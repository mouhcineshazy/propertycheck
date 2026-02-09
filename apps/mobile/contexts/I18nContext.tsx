/**
 * I18n Context Provider
 *
 * Provides internationalization support throughout the app
 * - Automatic locale detection from device
 * - Language persistence via SecureStore
 * - Real-time language switching
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  i18n,
  initializeI18n,
  setLocale as setI18nLocale,
  getCurrentLocale,
  t as translate,
  locales,
  localeNames,
  localeFlagCodes,
  type Locale,
} from '../lib/i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
  isLoading: boolean;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
  localeFlagCodes: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isLoading, setIsLoading] = useState(true);
  // Force re-render when locale changes
  const [, setForceUpdate] = useState(0);

  // Initialize i18n on mount
  useEffect(() => {
    const init = async () => {
      try {
        const detectedLocale = await initializeI18n();
        setLocaleState(detectedLocale);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Set locale and persist
  const setLocale = useCallback(async (newLocale: Locale) => {
    await setI18nLocale(newLocale);
    setLocaleState(newLocale);
    // Force re-render of all components using translations
    setForceUpdate((prev) => prev + 1);
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, options?: Record<string, unknown>) => {
      return translate(key, options);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale] // Re-create when locale changes
  );

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    isLoading,
    locales,
    localeNames,
    localeFlagCodes,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access i18n context
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook for translations only (shorthand)
 */
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}

export { type Locale };
