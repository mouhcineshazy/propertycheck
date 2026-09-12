---
name: trust-ink
description: >
  PropertyCheck's "Trust Ink" design system — how to build or restyle any UI on
  web (Next.js/Tailwind) or mobile (React Native) so it stays consistent, dark-mode
  correct, and on-brand. Use whenever creating/editing a screen, component, color,
  button, card, form, modal, badge, or icon, or when reviewing UI for consistency.
  Covers the token model, the shared classes, the mobile theming hooks, dark mode,
  and the hard rules (SVG icons only, no raw hex, no emoji).
---

# Trust Ink design system

Premium, calm, trustworthy — it's legal-grade evidence software. Deep ink neutrals
+ brand blue (`#2563EB`) + a green "verified/protected" signal + warm off-white
surfaces. Modern sans (Inter). **Light-first, fully dark-ready.**

## Golden rules
- **Never hardcode hex in a screen.** Web → semantic Tailwind tokens / shared
  classes. Mobile → `useTheme()` / `useThemedStyles()` from `apps/mobile/lib/theme.ts`.
- **SVG icons only** (inline `<svg>` on web, Ionicons on mobile). **No emoji as
  icons — ever.** No rainbow/multicolor gradient icons; no AI purple/pink.
- Every screen handles **loading / error / empty** states.
- Respect `prefers-reduced-motion`; animations 150–300ms, ease-out in.
- a11y: touch targets ≥44px, `aria-label` on icon-only buttons, visible focus.

## Web (apps/web)
Tokens are in `tailwind.config.ts`; CSS variables + component classes in
`app/globals.css`. Dark mode = the semantic vars flip via
`@media (prefers-color-scheme: dark)` and `[data-theme="dark"]` (toggle in
`components/ui/ThemeToggle.tsx`).

Use **semantic tokens** so it adapts to dark automatically:
- Surfaces: `bg-canvas` (page), `bg-card`, `bg-card-muted`
- Text: `text-fg`, `text-fg-muted`, `text-fg-subtle`
- Borders: `border-line`, `border-line-strong`
- Brand ramps (fixed): `primary-*`, `verified-*`, `amber-*`, `ink-*`
- Soft accent surfaces that read in dark: prefer `bg-primary-500/10` etc. over
  `bg-primary-50` for large fills.

Shared classes (extend, don't duplicate): `.btn-primary`, `.btn-secondary`,
`.btn-ghost`, `.btn-ink`, `.card`, `.card-interactive`, `.input`, `.label`,
`.badge-primary|verified|warning|danger|neutral`, `.eyebrow`, `.skeleton`,
`.container-page`, `.text-gradient`.

Gotchas:
- **Slash-opacity (`/12`) fails inside `@apply`** — use scale values (`/10`,`/20`)
  or arbitrary `/[0.12]`. Inline classNames accept any `/NN`.
- CSS grid needs an explicit base column (`grid-cols-1`) or a wide child forces
  horizontal overflow on mobile — add `grid-cols-1` and `min-w-0` on grid children.
- The `Logo` component is a **text wordmark** ("Property**Check**"); don't pair it
  with your own text span. Its color is theme-adaptive (`rgb(var(--fg))`).

## Mobile (apps/mobile)
Source of truth: `apps/mobile/lib/theme.ts` — exports `colors`, `spacing`,
`radius`, `typography`, light/dark `semantic` palettes, `ThemeProvider`,
`useTheme()`, `useThemedStyles()`, `useThemePreference()`.

Every screen follows this pattern (so dark mode + tokens work):

```tsx
import { useTheme, useThemedStyles, spacing, radius, type AppTheme } from '../../lib/theme';

export default function Screen() {
  const { semantic } = useTheme();               // inline colors (Ionicons, tint…)
  const styles = useThemedStyles(makeStyles);    // StyleSheet
  // …
  return <Ionicons name="home" color={semantic.primary} />;
}

const makeStyles = ({ semantic, colors, shadows }: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: semantic.canvas },
    card: { backgroundColor: semantic.card, borderColor: semantic.line, borderWidth: 1, borderRadius: radius.lg, ...shadows.sm },
  });
```

Semantic keys: `canvas, card, cardMuted, fg, fgMuted, fgSubtle, line, lineStrong,
primary, primaryContrast, primarySoft, verified/verifiedSoft, danger/dangerSoft,
warning/warningSoft, overlay`. Use `*Soft` for chip/icon backgrounds (they adapt).
- If a screen already has an i18n `t`, name the theme var `th` to avoid collision
  (`makeStyles = (th: AppTheme) => …`, `const th = useTheme()`).
- Cross-platform shadows: always include iOS `shadow*` + Android `elevation`
  (use the `shadows` tokens).
- The only intentional raw hex is `app/inspection/compare.tsx` `BRAND_COLORS` +
  `generateComparisonHtml` — that renders a print PDF, not on-screen UI.

## Before finishing UI work
Web: `npm run type-check` + `npm run lint` clean; check the page at 375px and in
dark mode (toggle or emulate `prefers-color-scheme: dark`). Mobile: `tsc` clean,
verify light + dark. No emoji icons; no horizontal scroll; states handled.
