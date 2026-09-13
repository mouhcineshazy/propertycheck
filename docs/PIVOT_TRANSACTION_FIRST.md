# PropertyCheck — Transaction-First Pivot & Path to $20K MRR

> Decision (pre-launch): the app is **mobile-only**. The web is a
> **presentation-only** marketing site (auth/dashboard/checkout routes redirect
> to home). The landlord/admin web surface is **built but deactivated** — revive
> it only for the B2B phase.

## Why we pivoted
Renters inspect ~twice per lease (move-in + move-out) and move every 1–3 years.
A monthly **subscription** fights that usage pattern: users would subscribe for a
month, do the inspection, and cancel — so LTV collapses and churn is structural.
The honest model is **pay-per-move** (one-time, ROI-anchored), with the
subscription kept only for the minority with recurring need (frequent movers,
roommates managing shared places, and — later — landlords).

## The number (net $14K CAD/mo ≈ ~$20K gross MRR)
After platform fees (Apple/Google ~15% via the Small Business Program while
<$1M/yr), Stripe (~3% on any web charges), infra, and tax set-aside, **~$20K
gross monthly** is the right target.

- **Subscription-only path:** ~$8 net/payer → **~2,500 active payers** → ~30–50k
  monthly free users at 5–8% conversion. Multi-year grind, not year-one-solo.
- **Transaction-first path:** pay-per-move ~$22 net → **~900–1,000 paid moves/mo**
  (~1% of Canada's ~1M+ annual renter moves). Hard but an order of magnitude more
  attainable, and it matches real usage. **This is the plan.**
- Blend: transactions carry the base; subscriptions from power users add ARR on top.

## Pricing (this pass)
Single source of truth: `packages/shared/src/constants.ts` (`PAY_PER_USE`, `PRICING`).
Display copy: `apps/web/messages/{en,fr}.json` (`landing.pricing.addons.*`).

| Product | Price (CAD) | What it is |
|---|---|---|
| **Moving Bundle** (hero) | **$24.99** one-time | move-in + move-out + comparison, 1 property, 18 mo |
| **Report Unlock** | **$14.99** one-time | one clean, watermark-free, shareable report |
| Premium (secondary) | $9.99/mo · $95.88/yr | unlimited + comparison, for frequent movers |
| Free (funnel) | $0 | document + watermarked PDF (the hook; value moment is gated) |

Anchor: $24.99 is ~1% of a $2,000 deposit. Landing now leads with **Pay per move**;
subscription is demoted to "Or subscribe."

> ⚠️ Changing a price = update the **Stripe Price** behind
> `NEXT_PUBLIC_STRIPE_REPORT_PRICE_ID` / `NEXT_PUBLIC_STRIPE_BUNDLE_PRICE_ID`
> **and** the display copy. The `amount` in `PAY_PER_USE` is display-only.

## 🚧 #1 launch blocker — In-App Purchase (native)
A digital unlock consumed **in the iOS/Android app must use native IAP**
(StoreKit / Play Billing) per Apple Guideline 3.1.1 — the current
Stripe-web-checkout flow (mobile `UpgradeModal` → `/api/stripe/*`) will get the
app **rejected**. This must be resolved before submission.

- **Recommended:** `expo-in-app-purchases` / `react-native-iap` for the consumable
  report + bundle and the auto-renewing subscription; validate receipts
  server-side; keep the existing Stripe webhook for the future **web landlord**
  path only.
- Enroll in the **App Store Small Business Program** (15% instead of 30%).
- This is native work requiring an Apple/Google developer account and a new EAS
  build — scope it as its own milestone.

## Roadmap
1. **Now (done in code):** transaction-first repricing + landing reframe; web
   presentation-only; landlord admin deactivated. `type-check` + `lint` clean.
2. **Pre-launch (blocker):** implement native IAP; enroll SBP; new EAS build; QA
   the full purchase → entitlement (webhook/receipt) → clean-PDF flow.
3. **Launch:** ASO (App Store/Play), Product Hunt, tenant-rights subreddits,
   move-out-season timing. Run via the `growth-marketer` agent + `marketing-playbook`.
4. **Scale to the number:** double down on the channel that returns cheapest paid
   moves; add the transactional email nudge at the value moment; measure paid
   moves/month against the ~1,000 target.
5. **B2B (the real venture path):** reactivate the web admin for small landlords /
   independent PMs (1–20 units) — recurring inspections = a subscription that
   earns its name. Different funnel, landlord-side accounts.

## What "done" looks like per phase
Every change: `npm run type-check` + `npm run lint` clean; prices consistent across
constants ↔ Stripe ↔ copy ↔ FAQ; CAD everywhere; entitlements written only by the
webhook/receipt validator; free tier gates the value moment, not the core hook.
