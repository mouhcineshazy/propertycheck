---
name: i18n-strings
description: >
  How to add or change user-facing text in PropertyCheck's bilingual (English +
  Canadian French) apps. Use whenever introducing a new label, button, message,
  placeholder, or any string a user reads on web (next-intl) or mobile (i18n-js),
  or when a `t('…')` key is rendering raw. Ensures both locales stay in sync.
---

# Bilingual strings (EN + FR-CA)

The app is Canada-only and ships English + French. **Every** user-facing string
goes through translations in **both** locales — never hardcode English into a
`t()` call, and never add a key to one locale only (it renders the raw key).

## Web (next-intl)
- Message files: `apps/web/messages/en.json` and `apps/web/messages/fr.json`
  (nested objects, e.g. `landing.hero.title`).
- Read in components with `useTranslations('namespace')` → `t('key')`; server
  components use `getTranslations`. Interpolation: `t('key', { count })`.
- Config: `apps/web/i18n/` (locales `en`, `fr`; locale-prefixed routes; browser
  language detection in middleware). Use the `Link` from `@/i18n/navigation` for
  locale-aware links.

## Mobile (i18n-js)
- String files: `apps/mobile/locales/en.json` and `apps/mobile/locales/fr.json`.
- Read via `useI18n()` / `useTranslation()` → `t('settings.appearance.system')`.
  Locale is persisted in SecureStore; `localeNames` + `locales` come from
  `apps/mobile/lib/i18n`.

## Procedure when adding a string
1. Add the key to the correct nested namespace in **both** `en.json` and
   **`fr.json`** for the platform you're touching. Keep key order/structure
   parallel between the two files.
2. Write a real Canadian-French translation — not English, not machine-literal.
   Use fr-CA conventions (e.g. "Emménagement / Déménagement", "dépôt de garantie",
   24-hour time "14 h 14", "$ CA"). Keep interpolation placeholders identical
   across locales.
3. Reference it via `t('…')`; never inline the literal.
4. Prefer editing JSON with a small script that preserves key order (see how hero
   `mockup.*` and `navigation.getApp` keys were added) rather than by hand, to
   avoid trailing-comma / ordering churn.

## Check before done
- No raw English passed to `t()`; no key present in one locale but missing in the
  other (grep both files for the new key).
- `npm run type-check` + `npm run lint` clean. Load the screen in both `en` and
  `fr` (web: `/en/...` and `/fr/...`; mobile: switch language in Settings) and
  confirm nothing renders a raw key or overflows in French (French text is ~15–20%
  longer — check buttons/labels don't clip).
