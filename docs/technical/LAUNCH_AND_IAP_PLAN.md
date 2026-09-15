# Native IAP + Launch Prerequisites Plan

Status: **IAP engine implemented in code.** The RevenueCat integration — client wrapper,
webhook, migration, and all UI wiring — is done and merged. The remaining work is
**store/dashboard configuration, a production build, submission, and sandbox QA** — most of
it founder account actions, not code. This doc is the execution checklist for that last mile.

Goal: shortest credible path for a solo dev to ship PropertyCheck to the App Store + Google
Play. The former #1 blocker (mobile selling digital goods via Stripe web checkout) is
**resolved in code**.

Last grounded against the codebase: 2026-09-15.

---

## 0. The former blocker — resolved in code

Mobile used to sell every digital good through **web Stripe checkout opened in the device
browser**, which violates Apple **App Store Review Guideline 3.1.1** and Google Play's
Payments policy (digital goods consumed in-app must use StoreKit / Play Billing). That path
is now gone:

- **Subscription** — `apps/mobile/components/UpgradeModal.tsx` calls `purchasePremium(billingCycle)`
  (`lib/revenuecat.ts`), not the old Stripe fetch + `Linking.openURL`.
- **Report unlock** — `app/inspection/[id].tsx` `handlePurchaseReport` → `purchaseReportUnlock(id)`.
- **Moving bundle** — `app/property/[id].tsx` → `purchaseMovingBundle(id)`.
- The dead mobile `createReportUnlockCheckout` / `createBundleCheckout` helpers **and** the
  web `create-report-checkout` / `create-bundle-checkout` routes (+ their webhook handlers)
  were **deleted** (commit `f7bf3cd`). Web Stripe now serves subscriptions only.

### The entitlement model never had to change
The server-side entitlement model was already product-agnostic, so IAP writes the **same
rows** the Stripe webhook used to:

| Product | Entitlement source of truth | Written by (now) |
|---|---|---|
| Premium subscription | `subscriptions.status = 'premium'` (+ `current_period_end`, `cancel_at_period_end`) | `supabase/functions/revenuecat-webhook` (subscription events) |
| Report unlock (per inspection) | `inspections.report_unlocked = true` | `revenuecat-webhook` (`NON_RENEWING_PURCHASE`) |
| Moving bundle (per property, 18 mo) | row in `bundle_purchases` (`property_id`, `expires_at`) | `revenuecat-webhook` (`NON_RENEWING_PURCHASE`) |

Mobile reads these directly and is **entirely decoupled from the payment rail**:
- Premium: `subscriptions.status === 'premium'` (`app/(tabs)/settings.tsx`, `app/inspection/[id].tsx`,
  `app/property/[id].tsx`, `app/(tabs)/index.tsx`, `app/inspection/compare.tsx`).
- Report unlock: `inspection.report_unlocked` (`app/inspection/[id].tsx`).
- Bundle: `checkBundleAccess(propertyId)` → queries `bundle_purchases` (`lib/api.ts`).

**Because IAP writes those same rows, no reading screen changed.** The whole project was
exactly what was scoped: (1) swap the purchase trigger, (2) route the receipt to a webhook
that writes those rows.

---

## A. IAP architecture — decided and shipped

### Decision: **RevenueCat** (`react-native-purchases`) — implemented

We sell **both consumables and an auto-renewable subscription across two stores** — the case
RevenueCat's managed validation + entitlement webhooks were built for. For a solo founder,
DIY renewal/refund receipt handling is the highest-risk, lowest-differentiation code in the
app; RevenueCat's cost (free under ~$2.5K/mo tracked revenue, then 1%) buys not owning it.
`react-native-purchases@9.15.2` is installed; the SDK requires a **custom dev client / EAS
build** (it does not run in Expo Go) — already this project's reality.

> The comparison table below is retained for a future re-evaluation at scale, not as an open
> decision. **Adapty** (RevenueCat-compatible API, ~$5K/mo free ceiling) is the strongest
> swap candidate if we outgrow RevenueCat's free tier; **`expo-iap` DIY** only becomes worth
> it at real scale, and the three-row entitlement model keeps any migration contained.

| Option | What it is | Free until | After free | Verdict |
|---|---|---|---|---|
| **RevenueCat** (`react-native-purchases`) | Market-leader managed IAP: validation, renewals, refunds, entitlement webhooks | $2.5K/mo tracked revenue | 1% MTR | **Shipped** — biggest ecosystem, best docs |
| **Adapty** (`react-native-adapty`) | RevenueCat-compatible managed IAP + paywall A/B testing | $5K/mo MTR | 1% MTR | Best swap candidate at scale |
| **Qonversion** | Managed IAP, analytics-leaning | ~$10K/mo MTR | ~$6–8 per $1K MTR | More analytics than infra |
| **`expo-iap` / `react-native-iap`** (OpenIAP) | Open-source (MIT), Nitro modules | Free forever, no % | — | You own receipt validation + sync (~weeks + maintenance) |

`expo-in-app-purchases` is deprecated and archived by Expo — not used.

### Product → store-product mapping

Prices from `PAY_PER_USE` + `PRICING` in `packages/shared/src/constants.ts`. Store product
IDs live in `IAP_PRODUCT_IDS` (same file) so the app and webhook share one mapping.

| Our product | Store product type | Product ID | Price (CAD) | RevenueCat entitlement |
|---|---|---|---|---|
| Report unlock | **Consumable** (one per inspection, buyable repeatedly) | `pc_report_unlock` | **$14.99** | n/a — granted server-side (see §A.3) |
| Moving bundle | **Consumable** (one active per property, 18-mo validity is app-enforced) | `pc_moving_bundle` | **$24.99** | n/a — granted server-side |
| Premium monthly | **Auto-renewable subscription** (group `premium`) | `pc_premium_monthly` | $9.99/mo | `premium` |
| Premium annual | **Auto-renewable subscription** (group `premium`) | `pc_premium_annual` | $95.88/yr | `premium` |

Product-type reasoning:
- **Report unlock = consumable** — per `inspection_id`; a user unlocks many inspections over
  time. Non-consumable ("buy once ever") would be wrong.
- **Moving bundle = consumable** — per `property_id` with an 18-month window
  (`bundle_purchases.expires_at`), enforced by our DB, not the store. A user moving again
  buys again; non-consumable "restore forever" semantics are wrong here.
- **Premium = auto-renewable subscription**, two durations in one subscription group so the
  store handles monthly↔annual proration; both map to the single `premium` entitlement. Keep
  the 7-day free trial as an **introductory offer** on each.

### A.3 Binding account-level IAP to our per-object entitlements — as implemented

The friction: **IAP is account-level and finalized on-device**, but two of our three
products are scoped to an object chosen *before* purchase (report → `inspection_id`, bundle
→ `property_id`), and the store receipt doesn't carry those ids. We bind the purchase to the
object ourselves.

**Implemented design — RevenueCat subscriber attribute (not a `pending_purchase` table).**
The original plan proposed a `pending_purchase` intent row + an `iap-intent` Edge Function.
We shipped the simpler equivalent instead: the object id rides along as a **subscriber
attribute** RevenueCat forwards into the webhook payload. No extra table, no second function.

```
Consumable (report unlock / moving bundle):
  1. User taps "Unlock report" on inspection X (or "Buy bundle" on property Y).
  2. Client sets the object id as a subscriber attribute, then purchases:
       Purchases.setAttributes({ pc_context_id: <inspectionId | propertyId> })
       Purchases.purchaseStoreProduct(product)            // lib/revenuecat.ts
  3. RevenueCat validates the receipt and fires NON_RENEWING_PURCHASE to
       supabase/functions/revenuecat-webhook, carrying pc_context_id.
  4. The webhook (service role) writes the REAL entitlement:
       report  → UPDATE inspections SET report_unlocked = true WHERE id = pc_context_id
       bundle  → INSERT bundle_purchases (user_id, property_id = pc_context_id,
                                          expires_at = now()+18mo,
                                          revenuecat_transaction_id = <txn>)
  5. Client re-reads the entitlement on focus (report_unlocked / checkBundleAccess) —
     screens already do this.

Subscription (premium monthly/annual):
  1. UpgradeModal → purchasePremium(cycle) → Purchases.purchaseStoreProduct(subId).
  2. RevenueCat (INITIAL_PURCHASE / RENEWAL / PRODUCT_CHANGE / UNCANCELLATION /
     CANCELLATION / BILLING_ISSUE / EXPIRATION) → revenuecat-webhook upserts
     subscriptions (status, current_period_end, cancel_at_period_end).
  3. Account-level, no target object.
```

Trade-off to know: the attribute is a **single slot per user** — it works because a user
buys one consumable at a time (same assumption the "newest pending row" design relied on).
The purchase overwrites it immediately before buying, so there's no cross-contamination in
practice.

**Idempotency & reliability:**
- The webhook — never the client success callback — is the source of truth (same rule as
  "Stripe state is webhook-driven, not from the redirect").
- **Double-grant protection:** `bundle_purchases.revenuecat_transaction_id` has a unique
  partial index (migration `20260913_revenuecat_iap.sql`), so RevenueCat's retries (it
  redelivers until it gets a 2xx) can't insert a bundle twice. Report unlock is a boolean
  (idempotent); subscriptions upsert on `user_id` (idempotent).
- `restorePurchases()` in Settings re-syncs entitlements so a webhook landing after the app
  is backgrounded still reconciles.

### A.4 Stripe stays — web subscriptions only

All `apps/web/app/api/stripe/*` **subscription** routes and the Stripe webhook's
subscription/invoice/trial handlers stay, for the web-landlord path (card checkout + billing
portal, which App Store rules don't govern on web). Both rails converge on the same Supabase
entitlement rows. The mobile Stripe helpers, the web one-time-product routes, and their
`report_unlock` / `moving_bundle` webhook handlers were **removed** (commit `f7bf3cd`) now
that IAP is the mobile path.

---

## B. What's built vs. what remains

### Built (code complete)
- ✅ `react-native-purchases@9.15.2` installed; keys read from `EXPO_PUBLIC_REVENUECAT_IOS_KEY` /
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` via `app.config.ts` → `extra`.
- ✅ `apps/mobile/lib/revenuecat.ts` — `configureRevenueCat`, `identifyRevenueCatUser`,
  `logOutRevenueCat`, `purchaseReportUnlock` / `purchaseMovingBundle` (via `pc_context_id`),
  `purchasePremium`, `restorePurchases`, `hasActivePremium`. No-ops safely on web / missing keys.
- ✅ `configureRevenueCat()` on app start + `identifyRevenueCatUser` on auth (`hooks/useAuth.ts`).
- ✅ `supabase/functions/revenuecat-webhook` — shared-secret auth; handles
  `NON_RENEWING_PURCHASE` (report/bundle) + all subscription lifecycle events.
- ✅ Migration `20260913_revenuecat_iap.sql` — `bundle_purchases.revenuecat_transaction_id` +
  unique partial index (double-grant guard). *(Apply to prod if not yet pushed.)*
- ✅ All three CTAs swapped to IAP (`UpgradeModal`, `inspection/[id]`, `property/[id]`).
- ✅ **Restore Purchases** button in Settings (`handleRestorePurchases`).
- ✅ **In-app account deletion** in Settings (`deleteAccount()` + Danger Zone + confirm modal
  + i18n) — the former Apple 5.1.1(v) blocker, now done (also satisfies PIPEDA / Law 25).
- ✅ Dashboard/setup walkthrough: **[REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md)**.

### Remains — mostly founder/store actions
| # | Task | Est. | Type |
|---|---|---|---|
| R1 | Create the 4 products (`pc_report_unlock`, `pc_moving_bundle`, `pc_premium_monthly`, `pc_premium_annual`) in **App Store Connect** + **Play Console** at CAD prices matching `PAY_PER_USE` / `PRICING`; attach 7-day intro offer to both subs | 3–4 h | [founder] |
| R2 | **RevenueCat dashboard**: link both apps, map products → offerings + `premium` entitlement, add store credentials (ASC API key, Play service-account JSON), set the webhook shared secret + URL | 2–3 h | [founder] + [code: secrets] |
| R3 | Put RevenueCat public SDK keys into EAS env (`EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY`); webhook auth secret + service-role key into Edge Function secrets (server-only) | 0.5 h | [code] |
| R4 | Fill `eas.json` `submit.production` iOS creds (currently placeholders `YOUR_APPLE_ID@email.com` / `YOUR_APP_STORE_CONNECT_APP_ID` / `YOUR_APPLE_TEAM_ID`) + Play service-account JSON | 0.5 h | [both] |
| R5 | Push pending migrations to prod (`20260913_revenuecat_iap.sql`, `20260914_add_room_label.sql`) + regenerate DB types | 0.5 h | [code] |
| R6 | `eas build --platform all --profile production` carrying `react-native-purchases`; `eas submit` to TestFlight + Play internal | 2–3 h + build wait | [code] |
| R7 | **Sandbox QA**: iOS Sandbox tester + Play licence testers — buy / restore / renew / refund each of the 3 products; verify each writes the correct Supabase row and per-object binding via `pc_context_id` works | 1–2 days | [both] |

**Realistic remaining: ~1 dev-day of code/config (R3–R6) + ~2 days sandbox QA (R7)**, plus
founder store setup (R1, R2) which can run in parallel, plus store-review latency.

---

## C. Launch prerequisites checklist

Legend: **[founder]** = account/console/legal; **[code]** = repo change; **[both]** = both.

### Accounts & programs
- [ ] **Apple Developer Program** — $99 USD/yr. **[founder]**
- [ ] **App Store Small Business Program** — drops Apple's cut 30% → **15%** (huge on our margins). **[founder]**
- [ ] **Google Play Console** — $25 USD one-time. **[founder]**
- [ ] **RevenueCat account** — free tier; create project, add iOS + Android apps. **[founder]**

### Identifiers (already set in `app.config.ts`)
- [ ] iOS bundle ID `com.propertycheck.app` registered in App Store Connect. **[founder]**
- [ ] Android package `com.propertycheck.app` created in Play Console. **[founder]**

### IAP products + finance
- [ ] Create the 4 products (§A) in both stores at CAD prices matching `PAY_PER_USE` / `PRICING`. **[founder]**
- [ ] 7-day free-trial intro offer on both subscription products. **[founder]**
- [ ] **Apple:** Paid Apps Agreement signed; banking + Canadian tax forms complete (IAP won't sell without this). **[founder]**
- [ ] **Google:** merchant/payments profile + tax info complete. **[founder]**

### Privacy / data disclosures
The app collects: **email + full name** (auth), **province**, **inspection photos with
preserved EXIF incl. GPS/timestamp** (EXIF intentionally not stripped — legal evidence
chain), **property addresses/notes**, **purchase/subscription state**. Photos + EXIF GPS =
location data → disclose it.
- [ ] **iOS App Privacy labels**: Contact Info (email, name), User Content (photos), **Location (from photo EXIF)**, Identifiers, Purchases → purpose App Functionality. **[founder]**
- [ ] **Google Play Data Safety** form: same set; encryption in transit; in-app deletion path (now implemented). **[founder]**
- [ ] Privacy + Terms URLs live on web (`apps/web/app/[locale]/(legal)/privacy`, `/terms`; mobile Settings links to them) — paste both into both store listings. **[both]**

### Apple 5.1.1(v) — in-app account deletion — ✅ DONE
Implemented: `apps/mobile/app/(tabs)/settings.tsx` Danger Zone → `deleteAccount()`
(`lib/api.ts`) erases storage + DB + `auth.users` (service role), with confirm modal and
EN/FR-CA i18n. Clears Apple 5.1.1(v) **and** PIPEDA / Law 25 right-to-erasure.
- [ ] *(Nice-to-have)* data-export action to fully round out PIPEDA portability. **[code]**

### Native config
- [ ] Camera + photo-library usage strings — **present** in `app.config.ts` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `expo-camera`/`expo-image-picker` plugin permissions). IAP adds no new permission. **[verify only]**
- [ ] Android `CAMERA` / `READ_EXTERNAL_STORAGE` present. **[verify only]**
- [ ] RevenueCat SDK keys wired into `app.config.ts` `extra` — **present** (`revenueCatIosKey` / `revenueCatAndroidKey` from `EXPO_PUBLIC_*`); just set the actual key values in EAS env. **[code]**

### Store assets & listing
- [ ] App icon (`assets/icon.png`, `adaptive-icon.png`) — verify final art. **[founder]**
- [ ] **Screenshots**: iOS 6.7" (1290×2796) + 6.5" + iPad (`supportsTablet` true); Android phone + 7"/10" tablet. Story: document → report → send. **[founder]**
- [ ] App name/subtitle/keywords/descriptions (EN + FR-CA) — copy in `docs/marketing/LEAN_LAUNCH_AUTOPILOT.md` §4. **[founder]**
- [ ] Support + marketing URLs (web site). **[founder]**

### Build, submit, test
- [ ] `eas build --platform all --profile production` including the RevenueCat module. **[code]**
- [ ] Fill `eas.json` `submit.production` creds (iOS placeholders + Play service account), then `eas submit -p ios` / `-p android`. **[both]**
- [ ] **TestFlight** internal + **Play internal testing** — required to test IAP with sandbox/licence testers before public release. **[both]**
- [ ] Full purchase → entitlement QA on real devices for all 3 products. **[both]**

### Env / config wiring
- [ ] RevenueCat public SDK keys (iOS + Android) → `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY`. **[code]**
- [ ] RevenueCat webhook auth secret + Supabase service-role key → Edge Function secrets (never `EXPO_PUBLIC_*`). **[code]**
- [ ] Keep Stripe env (`NEXT_PUBLIC_STRIPE_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) for the **web subscription** path. **[verify]**

---

## D. The critical path to launch

The code is done; the path is now account setup → config → build → QA → submit.

1. **[founder] Enrol in Apple Developer + Small Business Program and open Google Play Console.** Nothing testable exists until these do; Apple approval can take days. Start day one.
2. **[founder] Create the 4 IAP products in both stores + finish banking/tax agreements**, and **set up the RevenueCat project** (link apps, offerings, `premium` entitlement, store credentials, webhook secret). IAP returns nothing testable until products exist and finance agreements are signed.
3. **[code] Wire secrets + creds** — RC SDK keys into EAS env, webhook secret + service-role key into Edge Function secrets, fill `eas.json` submit creds, push pending migrations. (R3–R5.)
4. **[code] Production EAS build** carrying `react-native-purchases`, then `eas submit` to TestFlight + Play internal. (R6.)
5. **[both] Sandbox-test all three products** end to end (buy / restore / renew / refund; verify each writes the correct Supabase row and `pc_context_id` binding). Fix, rebuild if native, resubmit. (R7.)
6. **[founder] Finalize store listings** (assets + ASO copy from the marketing doc + privacy labels) and submit for review.

**Realistic total to submission:** ~**1–1.5 weeks** solo now that the engine is built —
roughly 1 dev-day of config (steps 3–4) + ~2 days sandbox QA, overlapped with founder
account/store setup and store-review latency (Apple review typically 1–3 days).

---

## Summary

- The former top blocker is **resolved in code**: mobile digital goods now sell through
  **RevenueCat native IAP**, not Stripe web checkout. The dead Stripe one-time-product code
  (mobile helpers + web routes + webhook handlers) was removed (`f7bf3cd`).
- **RevenueCat is shipped**: `lib/revenuecat.ts` (client), `revenuecat-webhook` (source of
  truth), migration `20260913` (idempotency guard), and all three CTAs + Restore Purchases
  are wired. See **[REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md)**.
- Products: 2 consumables (`pc_report_unlock` **$14.99**, `pc_moving_bundle` **$24.99**) + 1
  subscription group (monthly $9.99 / annual $95.88, 7-day trial).
- Per-object binding uses a **`pc_context_id` subscriber attribute** forwarded into the
  webhook (simpler than the originally-planned `pending_purchase` table) — the webhook writes
  the *same* rows (`subscriptions`, `inspections.report_unlocked`, `bundle_purchases`), so
  **no reading screen changed**.
- **In-app account deletion is done** (Apple 5.1.1(v) + PIPEDA/Law 25 cleared).
- Stripe stays for **web subscriptions only**; both rails converge on one entitlement model.
- Remaining path: enrol accounts → create IAP products + RevenueCat dashboard → wire
  secrets/creds → EAS prod build + submit → sandbox QA → listings. **~1–1.5 weeks solo.**
