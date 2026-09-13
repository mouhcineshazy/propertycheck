# RevenueCat Setup — PropertyCheck

How to wire the app's native In-App Purchases to RevenueCat, end to end. The code
is already implemented (see "How the code is wired" at the bottom); this is the
dashboard + store + Supabase configuration you do once.

> **Why RevenueCat / IAP at all:** on iOS and Android, digital goods must be sold
> through Apple StoreKit / Google Play Billing (Apple Guideline 3.1.1, Play
> Payments policy). Stripe web checkout inside the app = rejection. RevenueCat
> manages receipt validation + renewal/refund state and fires a webhook we turn
> into Supabase entitlement rows.

---

## 0. Products & prices (the single source of truth)

Product IDs are defined once in `packages/shared/src/constants.ts` (`IAP_PRODUCT_IDS`)
and must match **exactly** in App Store Connect, Play Console, and RevenueCat.

| Product | Product ID | Type | Price (CAD) |
|---|---|---|---|
| Report unlock | `pc_report_unlock` | Consumable | **$14.99** one-time |
| Moving bundle | `pc_moving_bundle` | Consumable | **$24.99** one-time |
| Premium monthly | `pc_premium_monthly` | Auto-renewable sub | **$9.99 / month** |
| Premium annual | `pc_premium_annual` | Auto-renewable sub | **$95.88 / year** |

The prices in `PAY_PER_USE` / `PRICING` are **display-only**. The real charge is
whatever you set on the store product — set them to match this table.

The `premium` entitlement (`REVENUECAT_PREMIUM_ENTITLEMENT`) is what the two
subscriptions unlock. Consumables do **not** use an entitlement — they're granted
per-transaction by the webhook.

---

## 1. Prerequisites (founder)

- [ ] **Apple Developer Program** membership ($99 USD/yr), and in App Store Connect:
      **Agreements, Tax, and Banking** → Paid Apps agreement **active**. IAP returns
      nothing until this is signed.
- [ ] **Google Play Developer** account ($25 USD one-time) + a **merchant/payments
      profile** set up.
- [ ] The app registered in both stores with the correct bundle ID / package name.
- [ ] **Small Business Program** enrolment (do this now — it's 15% instead of 30%):
      - Apple: [App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/)
      - Google: reduced 15% rate on first $1M/yr applies automatically once configured.

---

## 2. Create the store products

### App Store Connect (iOS)
1. **Features → In-App Purchases** → create two **Consumable** products:
   - `pc_report_unlock` — price tier ≈ **CAD $14.99**
   - `pc_moving_bundle` — price tier ≈ **CAD $24.99**
2. **Subscriptions** → create a subscription group (e.g. "PropertyCheck Premium")
   with two **Auto-Renewable** products:
   - `pc_premium_monthly` — **$9.99 / month**
   - `pc_premium_annual` — **$95.88 / year**
3. Give each a display name, review screenshot, and localized description.
   Products stay in "Ready to Submit" until the app's first review — that's fine
   for sandbox testing.

### Google Play Console (Android)
1. **Monetize → Products → In-app products** → create:
   - `pc_report_unlock` — **$14.99 CAD**
   - `pc_moving_bundle` — **$24.99 CAD**
2. **Monetize → Products → Subscriptions** → create `pc_premium_monthly` and
   `pc_premium_annual` with base plans at **$9.99/month** and **$95.88/year**.
3. Activate each product.

> Product IDs are immutable once created and cannot be reused after deletion —
> type them carefully to match `IAP_PRODUCT_IDS`.

---

## 3. RevenueCat dashboard

1. Create a **Project** ("PropertyCheck").
2. **Add two apps** to the project: one **App Store**, one **Play Store**.
   - **iOS:** upload an **App Store Connect API key** (App Store Connect → Users
     and Access → Integrations → App Store Connect API → generate a key with
     "App Manager" access).
   - **Android:** upload a **Google Play service account JSON** with permissions
     to view financial data / manage orders (create it in Google Cloud console,
     grant access in Play Console → Users and permissions).
3. **Products** → import / add all four product IDs for each platform.
4. **Entitlements** → create one entitlement with identifier **`premium`**.
   Attach `pc_premium_monthly` and `pc_premium_annual` to it. Do **not** attach the
   consumables.
5. **Offerings** (optional but recommended): create a "default" offering with
   packages for the subscriptions. The app currently purchases by product ID, so
   this is not required — but it lets you run price experiments later without a
   new build.
6. **API keys** (Project settings → API keys) → copy the **public SDK keys**:
   - Apple public key → `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
   - Google public key → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
   These are safe to ship in the app — they only identify the project.

---

## 4. Supabase — migration, function, secrets

```bash
# 1. Apply the idempotency migration (adds bundle_purchases.revenuecat_transaction_id)
supabase db push

# 2. Deploy the webhook. --no-verify-jwt because RevenueCat can't send a Supabase JWT;
#    we authenticate it with our own shared-secret header instead.
supabase functions deploy revenuecat-webhook --no-verify-jwt

# 3. Set the shared secret (any long random string)
supabase secrets set REVENUECAT_WEBHOOK_AUTH="$(openssl rand -hex 24)"
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
```

The function URL is:
`https://<project-ref>.functions.supabase.co/revenuecat-webhook`

---

## 5. RevenueCat webhook

In RevenueCat: **Project settings → Integrations → Webhooks → Add**:
- **URL:** the function URL above.
- **Authorization header:** paste the **same** value you set for
  `REVENUECAT_WEBHOOK_AUTH`. The function rejects any request whose `Authorization`
  header doesn't match (401).
- Environment: send both **Sandbox** and **Production** so you can test.

Use RevenueCat's "Send test event" to confirm you get a `200`. A test event has no
`pc_context_id` and an anonymous user, so it will be acked-and-skipped — that's the
expected success path for the test.

---

## 6. App env keys

Add to the mobile build env (EAS secrets for production, `.env` for local dev):

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
```

`react-native-purchases` is a **native module**, so picking up these keys and the
SDK requires a **new EAS build** — not an OTA `eas update`.

```bash
eas build --platform all --profile production
```

---

## 7. Sandbox testing

- **iOS:** App Store Connect → Users and Access → **Sandbox testers** → create a
  tester. Sign out of the real App Store account on the device, run a dev/preview
  build, and purchase — you'll be prompted for the sandbox account. Sandbox
  renewals are accelerated (a "month" ≈ 5 minutes) so you can watch RENEWAL and
  EXPIRATION events hit the webhook.
- **Android:** Play Console → **License testing** → add the tester's Google
  account; upload the build to internal testing. Test purchases are free and
  auto-refunded.

**End-to-end check for each product:**
1. Buy in the app.
2. Confirm the RevenueCat dashboard shows the transaction.
3. Confirm the webhook logged a `200` (Supabase → Edge Functions → Logs).
4. Confirm the Supabase row changed:
   - report → `inspections.report_unlocked = true`
   - bundle → new `bundle_purchases` row with `revenuecat_transaction_id`
   - subscription → `subscriptions.status = 'premium'`
5. Confirm the app UI updates (the screens poll briefly after purchase).

---

## How the code is wired (for reference)

- `apps/mobile/lib/revenuecat.ts` — SDK wrapper: `configureRevenueCat()`,
  `identifyRevenueCatUser(uid)` / `logOutRevenueCat()`, and the purchase functions
  `purchaseReportUnlock`, `purchaseMovingBundle`, `purchasePremium`, plus
  `restorePurchases`. All no-op safely on web / when keys are missing.
- `apps/mobile/hooks/useAuth.ts` — configures RevenueCat at startup and keeps its
  identity in lockstep with the Supabase session (so `app_user_id` == Supabase
  user id, which the webhook relies on).
- **Context passing:** before a consumable purchase the app sets the subscriber
  attribute `pc_context_id` to the inspection id (report) or property id (bundle).
  The webhook reads it from `subscriber_attributes.pc_context_id` to know which row
  to grant. A user buys one item at a time, so the single attribute slot is safe.
- `supabase/functions/revenuecat-webhook/index.ts` — the source of truth. Verifies
  the shared secret, then writes the same rows the Stripe webhook did. Idempotent:
  report is a boolean, bundle dedupes on `revenuecat_transaction_id`, subscription
  upserts on `user_id`.
- **Entitlements are read Stripe-/RevenueCat-decoupled** — the app reads the
  Supabase rows directly, so no reading screen changed.

## What still uses Stripe

The Stripe webhook and `create-*-checkout` routes stay for the **future web
landlord** path (web is presentation-only today). Mobile no longer calls them.
