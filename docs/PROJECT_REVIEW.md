# PropertyCheck — Project Review
*Technical, Compliance & Monetization Audit*
*Reviewed: June 2026*

---

## Executive Summary

The project is in a strong position for an MVP. The architecture is well-chosen, the code quality is high, and several features that were listed as "V2 roadmap" are already built. However, there are **4 critical bugs** that will break the product in production, **significant pricing inconsistencies** across files, and **real compliance gaps** for a Canadian SaaS. All are fixable before launch.

---

## 1. What Is Actually Built (vs the Docs)

The docs and the codebase are out of sync — the code is *ahead* of the docs in several areas.

| Feature | Docs say | Code reality |
|---------|----------|-------------|
| i18n | Not mentioned | Fully implemented with `next-intl`, EN + FR, locale detection in middleware |
| French translations | V2 roadmap | `fr.json` exists in `apps/web/messages/` |
| Legal pages | Checklist item | Already built: `/terms`, `/privacy`, `/cookies` |
| Comparison report | Premium feature | Mobile already has `inspection/compare.tsx` + `ComparisonReport.tsx` |
| Email system | "TODO" | Resend integration live, welcome + payment-failed emails implemented |
| Stripe portal | "Future" | `api/stripe/create-portal-session/route.ts` exists |
| Province in DB | V2 roadmap | `province` column added in migration `20260123` |
| Onboarding | Not documented | `onboarding_completed` column in DB, `onboarding.tsx` screen in mobile |
| Pro plan | Priced at $19.99 | **Not implemented anywhere in DB or code** |

---

## 2. Critical Bugs (Fix Before Launch)

### Bug 1 — Mobile Supabase Client Exported as Function Reference

**File**: `apps/mobile/lib/supabase.ts`

```typescript
// WRONG — exports the function itself, not its return value
export const supabase = getMobileSupabaseClient;

// Any code doing supabase.from('properties') will crash
// Only getMobileSupabaseClient() works throughout the app
```

**Impact**: Any screen that imports `supabase` directly (instead of calling `getMobileSupabaseClient()`) will get a function object instead of a Supabase client, causing a runtime crash.

**Fix**: Either `export const supabase = getMobileSupabaseClient();` (singleton at module load) or standardize all callers to use `getMobileSupabaseClient()` — the pattern already used in `api.ts` and `useAuth.ts`.

---

### Bug 2 — Storage Policies Do Not Enforce Path Ownership

**File**: `supabase/migrations/20260116_storage_policies.sql`

```sql
-- Current (INSECURE): any authenticated user can write to ANY path
CREATE POLICY "Authenticated users can upload inspection photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inspection-photos');
```

**Impact**: User A can upload to `{user_B_id}/{inspection_id}/file.jpg` and overwrite another user's inspection photos. This is both a security vulnerability and a legal evidence integrity issue — inspection photos that can be tampered with by a third party are inadmissible.

**Fix**:
```sql
CREATE POLICY "Authenticated users can upload inspection photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'inspection-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```
Path convention must be `{user_id}/{inspection_id}/{uuid}.{ext}` — enforce it in both the policy and the upload functions.

---

### Bug 3 — No Subscription Row Created on User Signup

**File**: `supabase/migrations/20260115_initial_schema.sql`

The `handle_new_user()` trigger creates a row in `users` but **not** in `subscriptions`. This means:
- `SELECT * FROM subscriptions WHERE user_id = auth.uid()` returns nothing for new users
- `check_free_tier_limits()` works (uses LEFT JOIN) but `get_user_subscription_status()` returns NULL instead of `'free'` — and the `COALESCE` at the end fixes it only in that function
- Any direct query to `subscriptions` for a new user will return empty, causing subtle bugs in limit enforcement or upgrade flows

**Fix** — add to `handle_new_user()`:
```sql
INSERT INTO public.subscriptions (user_id, status)
VALUES (NEW.id, 'free');
```

---

### Bug 4 — `trial_will_end` Email Is Not Implemented

**File**: `apps/web/app/api/stripe/webhook/route.ts`

```typescript
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  console.log(`Trial ending soon for subscription: ${subscription.id}`);
  if (userId) {
    console.log(`Would send trial ending reminder to user: ${userId}`);
  }
}
```

**Impact**: Users who start the 14-day trial receive no warning when it's about to end. This is the highest-value conversion touchpoint in the freemium funnel. Missing it directly costs paying customers.

**Fix**: Implement the email using the existing `lib/email/` infrastructure. The `sendPremiumWelcomeEmail` pattern is already there — add a `sendTrialEndingEmail` alongside it.

---

## 3. Pricing Inconsistencies (Pick One and Enforce It)

There are **three different free tier limit definitions** and **two different annual prices** across the codebase. This will confuse users if different values show up in different parts of the app.

### Free Tier Limits

| Location | Max Properties | Max Inspections |
|----------|---------------|----------------|
| Root `CLAUDE.md` | 3 | 5/property |
| `docs/MVP_SCOPE.md` | 2 | 5 total |
| `packages/shared/src/constants.ts` | **1** | **2 total** |
| `supabase/migrations/20260123_*` | **1** | **2 total** |

The database and `constants.ts` agree on **1 property, 2 inspections**. The docs are stale. Update `CLAUDE.md` and all documentation to match the code. The rationale in `constants.ts` is actually good: "2 inspections = complete move-in & move-out cycle for 1 property" — this is the right freemium hook for this product.

### Annual Pricing

| Location | Annual Price | Monthly equivalent | Savings |
|----------|-------------|-------------------|---------|
| `docs/BUSINESS_FEATURES.md` | $99.99/year | $8.33/mo | ~17% |
| `packages/shared/src/constants.ts` | **$95.88/year** | **$7.99/mo** | **20%** |

The code ($95.88) and the docs ($99.99) disagree. Pick one. The code's $95.88 with "Save 20%" messaging is cleaner to communicate.

### Pro Plan

The Pro plan ($19.99/month) is documented, priced, and described everywhere. It does not exist in the database schema, the subscription status enum, or any webhook handler. The DB only supports `'free'` and `'premium'` statuses. Either remove Pro from all documentation until V2, or add it to the schema now.

**Recommendation**: Remove Pro from the landing page and pricing section for MVP. Launch with two tiers (Free + Premium). Add Pro when team collaboration is built.

---

## 4. Architecture — What's Good

**Turborepo monorepo**: correct choice. Shared `constants.ts` and `schemas.ts` prevent the pricing inconsistencies from becoming runtime bugs — they're caught at the type level.

**Stripe webhook as source of truth**: correctly implemented. The webhook handler returns 500 on error (Stripe retries), validates the signature before processing, and uses lazy-initialized admin client. The pattern is right.

**`useSyncExternalStore` in `useAuth` (mobile)**: this is a React 19 best practice, not the naive `useEffect + useState` antipattern. Good call.

**Server-side limit enforcement**: `createInspection` in `api.ts` calls `supabase.rpc('check_free_tier_limits')` before creating. Client-side checks can be bypassed; this can't.

**Email graceful degradation**: when `RESEND_API_KEY` isn't set, emails log to console instead of crashing. This is the right dev experience.

**CI/CD**: type-check + lint + build, with `concurrency` to cancel stale runs. Correct and minimal.

**i18n**: `next-intl` with `[locale]` routing is production-grade. Locale detection from `Accept-Language` header is the right default for a Canadian product where French/English detection matters.

---

## 5. Architecture — What Needs Work

### Excessive Console Logging in Webhook Handler

The Stripe webhook handler has ~20 `console.log` statements that will flood production logs with internal state. Before launch, reduce to error-only logging or use a structured logger. This also leaks internal data (user IDs, Stripe IDs) to log aggregators.

### Comments Violate Their Own Rule

`CLAUDE.md` says: *"No comments that explain WHAT the code does."* The codebase has dozens of them (`// Handle successful checkout session`, `// Map Stripe status to our database status`). Not a critical bug but creates maintenance debt and contradicts the stated standards.

### Share Token Auto-Generated for Every Inspection

```sql
share_token UUID UNIQUE DEFAULT gen_random_uuid(),
share_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
```

Every inspection gets a share link the moment it's created, expiring in 7 days. The user never opted in to sharing. After 7 days, the token expires and cannot be refreshed without a DB update. This design has two problems:
1. **Privacy**: every inspection is shareable without user action
2. **Usability**: share links expire whether or not the user ever shared them

**Recommendation**: Generate `share_token` only when the user explicitly clicks "Share". Set `share_expires_at` relative to that moment, not creation time. Allow token refresh.

### No `plan` Column (Blocks Pro Tier and Analytics)

The `subscriptions` table has `status` (`free/premium/canceled/past_due`) but no `plan` column. This means:
- Pro tier cannot be launched without a schema migration
- You cannot distinguish annual vs monthly subscribers in the DB
- Analytics on plan distribution is impossible

Even for MVP, add `plan TEXT DEFAULT 'free'` and `billing_cycle TEXT DEFAULT 'monthly'` to the `subscriptions` table now. Migrating this later when there are paying customers is painful.

---

## 6. Compliance — Canadian Specifics

### CASL: Physical Address Missing from Emails

Under CASL, commercial electronic messages must include a physical mailing address. The current email templates (`sendPremiumWelcomeEmail`, `sendPaymentFailedEmail`) have no address in the footer.

**Fix**: Add to all email footers:
```html
<p>PropertyCheck | [Business address or P.O. Box] | Canada</p>
<p><a href="[unsubscribe-url]">Unsubscribe from marketing emails</a></p>
```
Note: transactional emails (receipts, password resets) are exempt — only marketing emails need the unsubscribe link.

### CASL: No Marketing Email Opt-In

There is no `marketing_emails_opted_in` column in the `users` table and no checkbox on the signup form. Before sending any marketing emails (trial reminders, feature announcements), this must exist.

**Fix**: Add `marketing_opt_in BOOLEAN DEFAULT FALSE` to `users` table. Add checkbox to signup form (unchecked by default for CASL compliance).

### PIPEDA: No Data Export / Deletion in Settings

The compliance checklist in `CLAUDE.md` says "users can request data export and deletion — build these into the settings page." The `settings/page.tsx` exists but whether these features are implemented is unknown from the file listing alone. This must be verified and built before launch for PIPEDA compliance.

### Quebec Law 25: Province Detected but No Special Handling

The `province` column exists in the DB. Quebec users triggering Law 25 requirements (stricter consent, portability, erasure rights) need special handling. At minimum: if `province = 'QC'`, the privacy policy must be presented in French or a French version offered.

### Share Link Privacy

Every inspection auto-generates a share link (see Bug 4 above). Under PIPEDA, sharing personal data (property address, user name, inspection photos) without explicit user action may constitute unauthorized disclosure. The share-on-demand approach fixes both the technical and compliance issue.

### Evidence Integrity: EXIF Must Not Be Stripped

The mobile upload flow reads files as base64 and uploads to Supabase Storage. Supabase Storage does not strip EXIF by default, which is correct. Verify this is not being stripped somewhere in the image compression path in `lib/storage.ts`.

---

## 7. SaaS Monetization — Assessment

### What's Right

- **Freemium hook is well-designed**: 1 property + 2 inspections (move-in + move-out) is the perfect free tier. Users complete one full cycle for free and then need Premium to add the next property. This is the right moment to upgrade — after they've seen the value.
- **14-day trial**: correct. Long enough to use it for a real move-in or move-out.
- **Comparison report as premium anchor**: this is the right premium feature. It's uniquely valuable for tenants who need to prove the state of the apartment at move-out vs move-in.
- **Annual billing implemented and properly discounted**: 20% savings is the right number.
- **Stripe Customer Portal route exists**: reduces churn friction significantly.

### What's Missing

**The upgrade prompt flow is not visible in the web codebase.** The mobile has `UpgradeModal.tsx` but the web `dashboard/` pages don't appear to have limit-triggered upgrade prompts. Free users hitting the 1-property limit on web will get a generic error or silent failure, not a conversion opportunity.

**Trial ending email is a TODO** (Bug 4 above). This is the highest-ROI email in the entire product. Day 11 of trial: "3 days left, here's what you'll lose." Without it, trial-to-paid conversion will be low.

**No analytics events implemented.** The docs list `user_signed_up`, `inspection_started`, `subscription_converted`, etc. None are wired up. Without these, you cannot measure the conversion funnel, identify where users drop off, or know which features drive upgrades.

**PDF watermark for free users is mentioned but not verified.** If the watermark is absent, free users have no incentive to upgrade for "clean reports."

---

## 8. Priority Fix List

### Before Any Beta Users

| Priority | Issue | File | Effort |
|----------|-------|------|--------|
| P0 | Bug 2: Storage path ownership not enforced | `migrations/20260116_storage_policies.sql` | 30 min |
| P0 | Bug 3: No subscription row on signup | `migrations/20260115_initial_schema.sql` | 15 min |
| P0 | Pricing inconsistency across files | `CLAUDE.md`, docs | 20 min |
| P1 | Bug 1: Mobile `supabase` export | `apps/mobile/lib/supabase.ts` | 5 min |
| P1 | Bug 4: trial_will_end email | `apps/web/app/api/stripe/webhook/route.ts` | 2 hours |
| P1 | Remove Pro plan from UI (not implemented) | Landing page, pricing | 30 min |

### Before Launch

| Priority | Issue | Effort |
|----------|-------|--------|
| P1 | CASL: physical address in all emails | 15 min |
| P1 | CASL: marketing opt-in on signup | 1 hour |
| P1 | Share link: generate on-demand, not on creation | 2 hours |
| P1 | Upgrade prompt on web when limit hit | 3 hours |
| P2 | Add `plan` + `billing_cycle` to subscriptions table | 1 hour |
| P2 | PIPEDA: data export/deletion in settings | 3 hours |
| P2 | Remove excessive console.log from webhook | 30 min |
| P3 | Analytics events (at least signup + first inspection + conversion) | 4 hours |

---

## 9. Final Verdict

**Ship-readiness**: 70%. The core product works. The architecture is sound. Two of the four critical bugs (P0) are 15-30 minute migrations. The pricing inconsistency is a documentation fix. The compliance gaps are real but addressable in a day of work.

The product is significantly more complete than the docs suggest. i18n, legal pages, email, comparison reports, and the Stripe portal are already built. That's 3-4 weeks of "roadmap" work already done.

**Biggest risk is not the code — it's the missing analytics.** You cannot validate PMF without knowing where users drop off. Add at minimum: signup event, first inspection created, and subscription converted. Everything else is nice to have.
