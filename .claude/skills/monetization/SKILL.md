---
name: monetization
description: >
  How PropertyCheck's billing, subscriptions, and plan limits work, and how to
  change them safely. Use when touching Stripe (checkout, webhooks, portal,
  add-ons), the free/premium tiers, plan-limit enforcement, trials, or the
  upgrade/paywall UX on web or mobile. Encodes the webhook-driven, limit-before-
  action rules and the web-is-presentation-only constraint.
---

# Monetization (Stripe + plan limits)

Freemium. Free = 1 property, 2 inspections total, watermarked PDF, no direct email.
Premium = $9.99 CAD/mo or $95.88/yr (save 20%), 14-day trial, unlimited + clean
PDFs + comparison + share links. Add-ons: pay-per-report, moving bundle. Pricing
constants live in `packages/shared` (`PRICING`, `FREE_TIER_LIMITS`). Bill in **CAD**.

## Iron rules
1. **Webhooks are the source of truth.** Subscription/entitlement state is written
   only in `apps/web/app/api/stripe/webhook/route.ts` after
   `stripe.webhooks.constructEvent(...)` verifies the signature (reject 400 on
   failure). **Never** set entitlement from the checkout redirect — users close
   tabs. The `subscriptions` table is the source of truth for status.
2. **Lazy Stripe client.** Always `getStripe()` from `apps/web/lib/stripe/config.ts`
   — never a module-scope `new Stripe()` (breaks CI builds without the key). Plans
   map via `getPlanByPriceId()`.
3. **Service-role only in the webhook.** Writing entitlements bypasses RLS, so it
   happens exclusively in the webhook handler with the admin client.
4. **Enforce limits BEFORE the action.** Check `FREE_TIER_LIMITS` before creating a
   property/inspection or generating a clean PDF — never after. Free vs premium is
   read from `subscriptions.status === 'premium'` (plus add-on/bundle access checks
   in `packages/`/`lib`).

## The checkout flows
- **Web checkout page** (`/checkout`) is currently **disabled** (web is
  presentation-only; middleware redirects it home). Don't build new web upgrade UI.
- **Mobile** upgrade: `UpgradeModal` → `POST /api/stripe/create-checkout-session`
  with a Bearer token → opens the returned Stripe URL. Add-ons use
  `create-report-checkout` / `create-bundle-checkout`.
- **Stripe return URLs are live and must stay reachable:**
  `/checkout/success`, `/checkout/report-success`, `/checkout/bundle-success`.
  Do not redirect these in middleware. Their CTAs return to `/` ("Done"), since the
  dashboard is disabled.
- Subscription management: `create-portal-session` (Stripe billing portal).

## Paywall / upgrade UX
- Contextual, not generic banners — fire exactly at the limit (the "email the
  landlord" moment is the key gate). Surface annual vs monthly with the explicit
  CAD savings. The free-PDF watermark is **marketing** (a landlord sees it), design
  it as such, not as punishment.
- Mobile `UpgradeModal` is province-aware (`getProvince`) and leads with shareable
  secure links as the top premium feature.

## When changing pricing/tiers
- Update `packages/shared` constants (single source), the Stripe price IDs +
  `getPlanByPriceId()`, and any copy referencing numbers. Keep the landing
  `PricingSection`, `UpgradeModal`, FAQ, and docs in sync — grep for the old price.
- The **Pro plan is not implemented** — do not reintroduce it in UI.

## Verify
`npm run type-check` + `npm run lint` clean. Trace: limit check happens before the
action; entitlement writes happen only in the webhook; success URLs still resolve;
CAD everywhere.
