# Native IAP + Launch Prerequisites Plan

Status: **PLAN / scoping only — do not implement IAP yet.** Native purchases require the
founder's Apple Developer + Google Play accounts and store-side product setup before any
code can be tested. This doc is concrete enough to execute from once those accounts exist.

Goal: shortest credible path for a solo dev to ship PropertyCheck to the App Store + Google
Play, with the native In-App Purchase (IAP) blocker fully scoped.

Last grounded against the codebase: 2026-09-12.

---

## 0. Why this is a hard blocker

Every mobile purchase today goes through **web Stripe checkout opened in the device browser**:

- Subscription: `apps/mobile/components/UpgradeModal.tsx` → `POST {APP_URL}/api/stripe/create-checkout-session` → `Linking.openURL(data.url)` (lines 111–154).
- Report unlock: `createReportUnlockCheckout()` in `apps/mobile/lib/api.ts` (lines 627–660) → `POST /api/stripe/create-report-checkout`, opened from `apps/mobile/app/inspection/[id].tsx` (line 362, `handlePurchaseReport`).
- Moving bundle: `createBundleCheckout()` in `apps/mobile/lib/api.ts` (lines 584–617) → `POST /api/stripe/create-bundle-checkout`, opened from `apps/mobile/app/property/[id].tsx` (line 111).

All three sell **digital goods consumed inside the app** (watermark-free PDF, premium
features). Apple **App Store Review Guideline 3.1.1** and Google Play's Payments policy
**require** these to use StoreKit / Play Billing. Shipping the current Stripe-URL flow to
either store = near-certain rejection. This is the #1 launch blocker.

Note also: `packages/shared/src/constants.ts` already documents the requirement inline
(`PAY_PER_USE`, lines 86–94): *"on mobile these MUST be sold via native In-App Purchase
(StoreKit / Play Billing), not Stripe web checkout."*

### What we DON'T have to rebuild
The server-side entitlement model is already clean and product-agnostic. IAP only needs to
write the **same three entitlement records** the Stripe webhook writes today:

| Product | Entitlement source of truth | Written today by |
|---|---|---|
| Premium subscription | `subscriptions.status = 'premium'` (+ `current_period_end`, `cancel_at_period_end`) | `handleCheckoutCompleted` / `handleSubscriptionUpdated` in `apps/web/app/api/stripe/webhook/route.ts` |
| Report unlock (per inspection) | `inspections.report_unlocked = true` | `handleReportUnlock` (webhook lines 157–176) |
| Moving bundle (per property, 18 mo) | row in `bundle_purchases` (`property_id`, `expires_at`) | `handleBundlePurchase` (webhook lines 128–155) |

Mobile reads these directly and is **entirely decoupled from Stripe**:
- Premium: `supabase.from('subscriptions').select('status')`, `status === 'premium'`
  (`app/(tabs)/settings.tsx:206`, `app/inspection/[id].tsx:151`, `app/property/[id].tsx:75`, `app/(tabs)/index.tsx:45`, `app/inspection/compare.tsx:95`).
- Report unlock: `inspection.report_unlocked` (`app/inspection/[id].tsx:280,328,553`).
- Bundle: `checkBundleAccess(propertyId)` → queries `bundle_purchases` (`lib/api.ts:557–578`).

**Key consequence: if IAP writes those same rows, not a single reading screen changes.**
The whole IAP project is: (1) swap the purchase trigger, (2) route the receipt to a new
server endpoint that writes those rows.

> ⚠️ **Price drift to fix before store setup.** The source of truth is `PAY_PER_USE` in
> `packages/shared/src/constants.ts`: report = **$9.99** (`amount: 999`), bundle = **$24.99**
> (`amount: 2499`). Stale strings elsewhere say otherwise — `lib/api.ts:581` comment says
> "$19.99 bundle", `lib/api.ts:624` comment says "$5.99 report", and the web route header
> `create-bundle-checkout/route.ts:44` says "$19.99". Store product prices MUST match
> `PAY_PER_USE`. Fix the stale comments when you touch these files.

---

## A. IAP architecture decision

### Recommendation: **RevenueCat** (with `react-native-purchases`)

Firm recommendation for this project. Rationale below.

| Concern | RevenueCat | react-native-iap (DIY) |
|---|---|---|
| Receipt validation | Managed, both stores, handles Apple's prod/sandbox fallback + renewals | You build + host server-side validation for App Store Server API **and** Play Developer API |
| Subscription lifecycle (renew, cancel, refund, grace, billing retry) | Handled + delivered as webhook events | You poll/subscribe to Apple App Store Server Notifications v2 + Google RTDN yourself |
| Entitlement → Supabase sync | One **RevenueCat webhook → Supabase Edge Function**, mirrors our existing Stripe-webhook pattern | You write and secure the whole validation + sync pipeline |
| Consumables + non-consumables + subs in one SDK | Yes | Yes, but you validate each type's receipt shape yourself |
| Cost | Free under ~$2.5K/mo tracked revenue, then 1% | Free (library), but your time is the cost |
| Solo-dev fit | **Best** — offloads the two things most likely to cause silent revenue bugs (renewal state + refunds) | Viable only if you enjoy owning receipt cryptography |

We sell **both consumables and an auto-renewable subscription across two stores** — exactly
the case RevenueCat's managed validation + entitlement webhooks were built for. For a solo
founder, the DIY renewal/refund handling in `react-native-iap` is the highest-risk, lowest-
differentiation code in the app. Pay the 1% (only above $2.5K/mo) to not own it.

**`expo-in-app-purchases` is deprecated and archived by Expo — do not use it.**

### Is RevenueCat the only option? (2026 landscape)

No. There are three real paths. Free-tier ceilings verified Sep 2026:

| Option | What it is | Free until | After free | Solo-dev verdict |
|---|---|---|---|---|
| **RevenueCat** (`react-native-purchases`) | Market-leader managed IAP: validation, renewals, refunds, entitlement webhooks | **$2.5K/mo** tracked revenue | 1% MTR | Biggest ecosystem, best docs — safest default |
| **Adapty** (`react-native-adapty`) | RevenueCat-compatible managed IAP + strong paywall A/B testing | **$5K/mo** MTR (doubled in early 2026) | 1% MTR | **Highest free ceiling among mature managed SDKs** — our pick |
| **Qonversion** | Managed IAP, analytics-leaning | ~$10K/mo MTR | ~$6–8 per $1K MTR | Even higher free band, but more analytics tool than infra |
| **`expo-iap` / `react-native-iap`** (OpenIAP) | Open-source (MIT), actively maintained (v14, Nitro modules) | **Free forever, no %** | — | You build + host receipt validation & entitlement sync yourself (~weeks + ongoing maintenance) |

**Truly free forever = `expo-iap`** — but "free" means you own the two highest-risk pieces:
cross-store receipt validation and renewal/refund state, in your own Supabase Edge Function.
That's ~10–15 weeks of work plus a permanent maintenance tax, and it's the code most likely
to cause silent revenue bugs.

**Revised recommendation for PropertyCheck:** a **managed free tier**, because we're
pre-revenue and shipping solo — the managed SDK is $0 until we're actually earning, and it
deletes the riskiest code. Between them, **Adapty edges out RevenueCat**: same managed
guarantees, RevenueCat-compatible API (easy to switch), and **double the free ceiling
($5K/mo vs $2.5K/mo)** — at $14.99/report that's ~330 paid reports/mo before we pay a cent.
RevenueCat remains the safe alternative (larger community, more integrations). Either is
swappable later; **`expo-iap` DIY only becomes worth it at real scale** when shaving the 1%
outweighs the maintenance, and even then the entitlement model here (three Supabase rows) is
already decoupled, so migration is contained.

Sources: [npm react-native-purchases](https://www.npmjs.com/package/react-native-purchases),
[Adapty pricing 2026 (Outmano)](https://outmano.com/tools/adapty/pricing),
[RevenueCat vs Adapty vs Qonversion (theswiftk.it)](https://theswiftk.it.com/blog/revenuecat-vs-adapty-vs-qonversion-ios),
[RevenueCat alternatives 2026 (sph.sh)](https://sph.sh/en/posts/revenuecat-alternatives-comparison-2026/),
[expo-iap (GitHub)](https://github.com/hyochan/expo-iap),
[LogRocket — best RN subscription libraries](https://blog.logrocket.com/).

RevenueCat needs a **custom dev client / EAS build** (native module); it does **not** work
in Expo Go. That's already our reality — `apps/mobile/CLAUDE.md` documents EAS dev-client
usage, and native `ios/` + `android/` dirs are already prebuilt.

### Product → store-product mapping

Prices from `PAY_PER_USE` + `PRICING` in `packages/shared/src/constants.ts`.

| Our product | Store product type | Suggested product ID | Price (CAD) | RevenueCat entitlement |
|---|---|---|---|---|
| Report unlock | **Consumable** (buyable repeatedly, one per inspection) | `pc_report_unlock` | $9.99 | n/a — grant server-side, see §A.3 |
| Moving bundle | **Consumable** (buyable repeatedly, one active bundle per property, 18-mo validity is app-enforced) | `pc_moving_bundle` | $24.99 | n/a — grant server-side |
| Premium monthly | **Auto-renewable subscription** (group `premium`) | `pc_premium_monthly` | $9.99/mo | `premium` |
| Premium annual | **Auto-renewable subscription** (group `premium`) | `pc_premium_annual` | $95.88/yr | `premium` |

Product-type reasoning:
- **Report unlock = consumable.** It's per-`inspection_id`, and a user unlocks many
  inspections over time. Non-consumable would let them buy it only once ever. Consumable.
- **Moving bundle = consumable.** It's per-`property_id` with an 18-month window
  (`bundle_purchases.expires_at`). A user moving again buys it again. Non-consumable's
  "restore forever" semantics are wrong here; the 18-mo expiry is enforced by our DB, not
  the store. Consumable.
- **Premium = auto-renewable subscription**, two durations in one subscription group so the
  store handles monthly↔annual upgrade/downgrade proration. Map both to the single
  `premium` entitlement; keep the 7-day free trial as an **introductory offer** on each.

### A.3 The reconciliation nuance (account-level IAP vs our per-object entitlements)

The friction: **IAP is account-level and finalized on-device**, but two of our three
products are scoped to a specific object chosen *before* purchase (report → `inspection_id`,
bundle → `property_id`). The store receipt does **not** carry our `inspection_id` /
`property_id`. We must bind the purchase to the chosen object ourselves.

Concrete flow (mirrors the existing Stripe metadata pattern — `type` + `userId` +
`inspectionId`/`propertyId` in `checkout.sessions.create(...metadata)`):

```
Consumable (report unlock / moving bundle):
  1. User taps "Unlock report" on inspection X (or "Buy bundle" on property Y).
  2. Client FIRST records intent server-side:
       POST Supabase Edge Function `iap-intent`
       { productId, inspectionId | propertyId }  (JWT-authed)
     → inserts a `pending_purchase` row (user_id, type, target_id, product_id, status='pending').
  3. Client calls Purchases.purchaseStoreProduct(productId)  [RevenueCat].
  4. On success, RevenueCat validates the receipt and fires a webhook to our
     Edge Function `revenuecat-webhook` (event: NON_RENEWING_PURCHASE for consumables).
  5. Webhook looks up the newest matching `pending_purchase` for that user+product,
     then writes the REAL entitlement using the service role:
        report  → UPDATE inspections SET report_unlocked = true WHERE id = target_id
        bundle  → INSERT bundle_purchases (user_id, property_id=target_id,
                                           expires_at = now()+18mo)
     and marks the pending row status='granted', storing the store transaction id.
  6. Client, after the SDK resolves, re-reads the entitlement (report_unlocked /
     checkBundleAccess) — the screens already do this on focus.

Subscription (premium monthly/annual):
  1. User taps upgrade in UpgradeModal → Purchases.purchaseStoreProduct(subId).
  2. RevenueCat webhook (INITIAL_PURCHASE / RENEWAL / CANCELLATION / EXPIRATION) →
     `revenuecat-webhook` upserts `subscriptions` (status, current_period_end,
     cancel_at_period_end) — same columns handleSubscriptionUpdated writes today.
  3. No target object; account-level. Nothing else changes.
```

Why record intent **before** the purchase (step 2): the receipt/webhook can't tell us which
inspection/property the user was looking at. The `pending_purchase` row is the binding. Use
"newest pending row for this user+product" to resolve — a user can't realistically buy two
report unlocks for two different inspections in the same second, and each purchase creates
exactly one pending row it consumes.

**Reliability:** the RevenueCat webhook is the source of truth for the grant (never grant
from the client success callback alone — same rule as "Stripe state is webhook-driven,
never from the redirect"). Set `Purchases` to call `syncPurchases()` / restore on app
launch so a webhook that lands after the app is backgrounded still reconciles. Consumables
should be **finished/consumed** only after the entitlement is confirmed granted.

**New table needed** (`pending_purchase`) — small, RLS: user can insert/select own rows;
service role updates. Migration in `supabase/migrations`. This is the only schema addition;
`subscriptions`, `bundle_purchases`, and `inspections.report_unlocked` stay exactly as-is.

### A.4 Stripe stays — for web only

Keep all `apps/web/app/api/stripe/*` routes and the Stripe webhook **for the future
web-landlord path** (landlords managing many units will want card checkout + a billing
portal, which App Store rules don't govern on web). Mobile digital goods go through IAP.
The Stripe webhook handlers stay valuable because IAP will write the *same* Supabase rows —
the two payment rails converge on one entitlement model. Do **not** delete the mobile
`create*Checkout` helpers until the IAP path is shipped and validated; swap the call sites,
then remove.

---

## B. Implementation milestone checklist (effort estimates)

Effort assumes one experienced dev. **[native build]** = requires a new EAS build (native
module or config change); **[JS-only]** = shippable via `eas update` OTA after the module
exists in the binary.

| # | Task | Est. | Build type | Files touched |
|---|---|---|---|---|
| B1 | Install `react-native-purchases` (+ `react-native-purchases-ui` if using paywalls), add config plugin, bump deps | 1–2 h | **[native build]** | `apps/mobile/package.json`, `apps/mobile/app.config.ts` (plugin), `eas.json` |
| B2 | First EAS **dev client** build with the module; confirm SDK loads on device | 1–2 h (mostly build wait) | **[native build]** | — |
| B3 | Store product setup: create the 4 products (§A IDs) in **App Store Connect** + **Play Console**; attach 7-day intro offer to both subs; set CAD prices | 3–4 h | [founder action] | — (store consoles) |
| B4 | RevenueCat project: link both apps, map products → offerings + `premium` entitlement, add store credentials (App Store Connect API key, Play service-account JSON) | 2–3 h | [founder action] + [code: API keys into EAS secrets] | `eas.json` env / EAS secrets |
| B5 | `pending_purchase` table + RLS migration; regenerate DB types; add Zod schema for the intent payload | 1–2 h | [JS-only] | `supabase/migrations/…_add_pending_purchase.sql`, `packages/database` (regen), `packages/shared/src/schemas.ts` |
| B6 | Supabase Edge Function `iap-intent` (auth'd, validates payload, inserts pending row) | 2 h | [JS-only] | `supabase/functions/iap-intent/` |
| B7 | Supabase Edge Function `revenuecat-webhook` (verify RC auth header, route by event/product, write `subscriptions` / `inspections.report_unlocked` / `bundle_purchases`, resolve pending row) | 4–6 h | [JS-only] | `supabase/functions/revenuecat-webhook/` |
| B8 | Mobile purchase layer: `lib/iap.ts` — init `Purchases`, `purchaseReportUnlock(inspectionId)`, `purchaseBundle(propertyId)`, `purchasePremium(cycle)`, `restorePurchases()` | 4–6 h | [JS-only]* | new `apps/mobile/lib/iap.ts` |
| B9 | Swap `UpgradeModal` CTA (lines 111–154): replace fetch+`Linking.openURL` with `purchasePremium(billingCycle)` | 2 h | [JS-only]* | `apps/mobile/components/UpgradeModal.tsx` |
| B10 | Swap report CTA: `app/inspection/[id].tsx` `handlePurchaseReport` (line 362) → `purchaseReportUnlock(id)`; re-read `report_unlocked` on resolve | 1–2 h | [JS-only]* | `apps/mobile/app/inspection/[id].tsx` |
| B11 | Swap bundle CTA: `app/property/[id].tsx` (line 111) → `purchaseBundle(id)`; re-read `checkBundleAccess` | 1–2 h | [JS-only]* | `apps/mobile/app/property/[id].tsx` |
| B12 | **Restore Purchases** UI in Settings (Apple requires it for non-consumables/subs) — button → `restorePurchases()` | 1–2 h | [JS-only]* | `apps/mobile/app/(tabs)/settings.tsx` |
| B13 | i18n keys for all new IAP strings (purchase errors, restore, "you already own this") in EN + FR-CA | 1 h | [JS-only] | `apps/mobile/lib/i18n/*` (use `i18n-strings` skill) |
| B14 | Retire mobile Stripe helpers once validated: delete `createReportUnlockCheckout` / `createBundleCheckout` and the UpgradeModal Stripe fetch | 0.5 h | [JS-only] | `apps/mobile/lib/api.ts`, `UpgradeModal.tsx` |
| B15 | **Sandbox testing**: iOS Sandbox tester (buy/restore/renew/refund each product); Play internal test track licence testers; verify each writes the right Supabase row and per-object binding works | 1–2 days | [both] | — |

`*` "JS-only" is only true **after** B1/B2 put `react-native-purchases` in the binary. The
`Purchases` native module and any `app.config.ts` change need a build; all the TS/JSX call-
site swaps after that ship OTA. Plan on **at least one production EAS build** carrying the
module before submission regardless.

**Realistic total: ~5–8 focused working days** of engineering (B1–B14) + **~2 days**
sandbox testing (B15), plus store-review latency. Founder-action items (B3, B4) can run in
parallel with B5–B8.

---

## C. Launch prerequisites checklist (submit ASAP)

Legend: **[founder]** = account/console/legal action only; **[code]** = repo change;
**[both]** = needs both.

### Accounts & programs
- [ ] **Apple Developer Program** — $99 USD/yr, enrol as the legal entity/individual. **[founder]**
- [ ] **App Store Small Business Program** — apply; drops Apple's cut 30% → **15%** (huge on our margins). Marketing doc already flags this (`docs/marketing/LEAN_LAUNCH_AUTOPILOT.md:39`). **[founder]**
- [ ] **Google Play Console** — $25 USD one-time. **[founder]**
- [ ] **RevenueCat account** — free tier; create project, add iOS + Android apps. **[founder]**

### Identifiers (already set in `app.config.ts`)
- [ ] iOS bundle ID `com.propertycheck.app` (`app.config.ts:25`) registered in App Store Connect. **[founder]**
- [ ] Android package `com.propertycheck.app` (`app.config.ts:38`) created in Play Console. **[founder]**

### IAP products + finance
- [ ] Create the 4 products from §A (IDs `pc_report_unlock`, `pc_moving_bundle`, `pc_premium_monthly`, `pc_premium_annual`) in both stores at CAD prices matching `PAY_PER_USE` / `PRICING`. **[founder]**
- [ ] 7-day free-trial intro offer on both subscription products. **[founder]**
- [ ] **Apple:** Paid Apps Agreement signed; banking + Canadian tax forms complete (IAP won't sell without this). **[founder]**
- [ ] **Google:** merchant/payments profile + tax info complete. **[founder]**

### Privacy / data disclosures (ground in what the app actually collects)
The app collects: **email + full name** (`users` table / auth), **province** (`20260123_add_user_province.sql`), **inspection photos with preserved EXIF incl. GPS/timestamp** (mobile CLAUDE.md: EXIF is intentionally not stripped), **property addresses/notes**, and **purchase/subscription state**. Photos + EXIF GPS = location data → disclose it.
- [ ] **iOS App Privacy "nutrition labels"** in App Store Connect: Contact Info (email, name), User Content (photos), **Location (from photo EXIF)**, Identifiers, Purchases. Map each to purpose (App Functionality). **[founder]**
- [ ] **Google Play Data Safety** form: same collection set; declare encryption in transit, and the in-app deletion path (below). **[founder]**
- [ ] Privacy policy + Terms URLs — **already live on web**: `apps/web/app/[locale]/(legal)/privacy` and `/terms` (mobile Settings already links to `/{locale}/privacy`, `settings.tsx:402`). Add the **Terms** link in Settings too if missing, and paste both URLs into both store listings. **[both]**

### Apple 5.1.1(v) — in-app account deletion (**BLOCKER, currently missing**)
Confirmed: `apps/mobile/app/(tabs)/settings.tsx` has **sign-out only** (`settings.tsx:526`,
`handleSignOut`) and **no account-deletion path** anywhere in the mobile app (grep for
`delete`/`erase account` returns nothing). Apple **requires** in-app account deletion, and
it also satisfies PIPEDA / Quebec Law 25 right-to-erasure (root CLAUDE.md).
- [ ] **[code]** Add a "Delete account" action in Settings (Danger Zone): confirm → call a Supabase Edge Function that deletes the user's data (properties/inspections/photos storage + `auth.users`) with the service role, then signs out. Deletes cascade via existing FKs (`bundle_purchases`, inspections, photos all `ON DELETE CASCADE` off the user/property). Estimate: **3–4 h** + a migration/Edge Function. Also add a data-export action to fully satisfy PIPEDA (nice-to-have for launch, required for compliance).
- [ ] i18n keys for the delete/confirm flow (EN + FR-CA). **[code]**

### Native config (verify — mostly already done)
- [ ] Camera + photo-library usage strings — **present** in `app.config.ts` (`NSCameraUsageDescription:27`, `NSPhotoLibraryUsageDescription:29`, plus `expo-camera`/`expo-image-picker` plugin permissions:49–64). No change needed unless IAP adds any permission (it doesn't). **[verify only]**
- [ ] Android permissions `CAMERA`, `READ_EXTERNAL_STORAGE` present (`app.config.ts:39–42`). **[verify only]**
- [ ] Add RevenueCat config plugin to `plugins` and API keys to EAS secrets (needs a build). **[code]**

### Store assets & listing
- [ ] App icon (`assets/icon.png`, `adaptive-icon.png` present) — verify final art. **[founder]**
- [ ] **Screenshots** per required sizes: iOS 6.7" (1290×2796) + 6.5" + iPad if `supportsTablet` stays true (`app.config.ts:24` — it is); Android phone + 7"/10" tablet. Tell the document → report → send story. **[founder]**
- [ ] App name, subtitle, keyword field, short + full description (EN + FR-CA) — **copy already written** in `docs/marketing/LEAN_LAUNCH_AUTOPILOT.md` §4 (title `PropertyCheck: Rental Report`, subtitle `Get your deposit back`, keyword field, descriptions). **[founder]**
- [ ] Support URL + marketing URL (use the web site). **[founder]**

### Build, submit, test
- [ ] `eas build --platform all --profile production` including the RevenueCat module. **[code]**
- [ ] `eas submit -p ios` / `eas submit -p android` (add creds to `eas.json` `submit.production`, currently empty at `eas.json:26–28`). **[both]**
- [ ] **TestFlight** internal + **Play internal testing** track — required to test IAP with sandbox/licence testers before public release. **[both]**
- [ ] Full purchase → entitlement QA on real devices for all 3 products (marketing doc launch gate, `LEAN_LAUNCH_AUTOPILOT.md:45`). **[both]**

### Env / config wiring
- [ ] RevenueCat public SDK keys (iOS + Android) → `EXPO_PUBLIC_*` (public by design). **[code]**
- [ ] RevenueCat webhook auth secret + Supabase service-role key → Edge Function secrets (server-only, never `EXPO_PUBLIC_*`). **[code]**
- [ ] Keep Stripe env (`NEXT_PUBLIC_STRIPE_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) for the web path. **[verify]**

---

## D. The critical path to launch

Do these in order. The first three gate everything after them.

1. **[founder] Enrol in Apple Developer + Small Business Program and open Google Play Console.** Nothing — no build submission, no IAP product, no store listing — can happen until these exist. Start day one; Apple approval can take days.
2. **[founder] Create the 4 IAP products in both stores + finish banking/tax agreements**, and **set up the RevenueCat project** linking both apps. IAP returns nothing testable until products exist and finance agreements are signed.
3. **[code] Add in-app account deletion in Settings.** Hard Apple 5.1.1(v) blocker that is currently missing — build it early so it's ready for the same submission, and it clears PIPEDA/Law 25 at the same time.
4. **[code] Land the IAP engine:** `pending_purchase` migration → `iap-intent` + `revenuecat-webhook` Edge Functions → `lib/iap.ts` → swap the three CTAs (`UpgradeModal`, `inspection/[id]`, `property/[id]`) → Restore Purchases in Settings → i18n both locales. (B5–B13.)
5. **[code] Production EAS build** carrying `react-native-purchases`, then `eas submit` to TestFlight + Play internal.
6. **[both] Sandbox-test all three products** end to end (buy / restore / renew / refund; verify each writes the correct Supabase row and per-object binding). Fix, rebuild if native, resubmit.
7. **[founder] Finalize store listings** (assets + ASO copy from the marketing doc + privacy labels) and submit for review.

**Realistic total to submission:** ~**2–3 weeks** solo — roughly 5–8 dev-days of engineering
(steps 3–5) + ~2 days sandbox QA, overlapped with founder account/store setup and store
review latency (Apple review is typically 1–3 days, first submissions sometimes longer).

---

## Summary

- Mobile currently sells all digital goods via **web Stripe checkout opened in the browser**
  (`UpgradeModal.tsx`, `lib/api.ts` `createReportUnlockCheckout`/`createBundleCheckout`),
  which violates Apple 3.1.1 / Google Play policy — the top launch blocker.
- **Adopt RevenueCat** (`react-native-purchases`): it manages receipt validation, renewals,
  and refunds across both stores and delivers webhooks — the right call for a solo dev
  selling consumables **and** a subscription. `expo-in-app-purchases` is deprecated.
- Map to 2 consumables (`pc_report_unlock` $9.99, `pc_moving_bundle` $24.99) + 1 subscription
  group (monthly $9.99 / annual $95.88, 7-day trial). Fix the stale $5.99/$19.99 comments.
- Reconcile account-level IAP with per-object entitlements via a **`pending_purchase` intent
  row** written before purchase, then a **RevenueCat webhook → Supabase Edge Function** that
  writes the *same* rows the Stripe webhook writes today (`subscriptions`,
  `inspections.report_unlocked`, `bundle_purchases`) — so **no reading screen changes**.
- Keep **Stripe for the web-landlord path only**; both rails converge on one entitlement model.
- **In-app account deletion is missing** in Settings (sign-out only) — a hard Apple blocker;
  build it early (also satisfies PIPEDA/Law 25). Camera/photo usage strings already exist.
- Critical path: enrol accounts → create IAP products + RevenueCat → account deletion → IAP
  engine → EAS prod build + submit → sandbox QA → listings. ~2–3 weeks solo.

Written to: `/Users/moxy/Documents/Property_Check_saas/propertycheck/docs/technical/LAUNCH_AND_IAP_PLAN.md`
</content>
</invoke>
