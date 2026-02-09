/**
 * i18n Configuration for PropertyCheck Mobile App
 *
 * Uses i18n-js with expo-localization for automatic locale detection
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from '../../locales/en.json';
import fr from '../../locales/fr.json';

// Create i18n instance
const i18n = new I18n({
  en,
  fr,
});

// Configuration
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Storage key for user's language preference
const LANGUAGE_KEY = 'user_language';

// Available locales
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

// Flag codes for each locale (using flag-icons codes)
export const localeFlagCodes: Record<Locale, string> = {
  en: 'ca', // Canada flag for English
  fr: 'fr', // France flag for French
};

/**
 * Initialize i18n with user's preferred language
 * First checks stored preference, then falls back to device locale
 */
export async function initializeI18n(): Promise<Locale> {
  try {
    // Check for stored language preference
    const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);

    if (storedLanguage && locales.includes(storedLanguage as Locale)) {
      i18n.locale = storedLanguage;
      return storedLanguage as Locale;
    }

    // Fall back to device locale
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    const supportedLocale = locales.includes(deviceLocale as Locale)
      ? deviceLocale as Locale
      : 'en';

    i18n.locale = supportedLocale;
    return supportedLocale;
  } catch (error) {
    console.error('Error initializing i18n:', error);
    i18n.locale = 'en';
    return 'en';
  }
}

/**
 * Get current locale
 */
export function getCurrentLocale(): Locale {
  return (i18n.locale as Locale) || 'en';
}

/**
 * Set locale and persist preference
 */
export async function setLocale(locale: Locale): Promise<void> {
  i18n.locale = locale;
  try {
    await SecureStore.setItemAsync(LANGUAGE_KEY, locale);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * Translation function
 */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string): boolean {
  const translation = i18n.t(key, { defaultValue: '__MISSING__' });
  return translation !== '__MISSING__';
}

export { i18n };
export default i18n;
