# PropertyCheck — Deployment Guide

Complete step-by-step instructions for publishing the web app to Netlify and the mobile app to the App Store and Google Play.

---

## TL;DR — Which Store to Do First?

**Start with the App Store (iOS).** Here's why:

| | Apple App Store | Google Play |
|---|---|---|
| Account fee | $99 CAD/year | $25 CAD one-time |
| Account approval | Hours to 1 day | Hours to 1 day |
| First publish review | 1–3 days | **14+ days** |
| Why the delay? | Standard review | Google now requires new accounts to run **closed testing with 20 real testers for 14 continuous days** before going public |
| Credentials needed | 3 values (IDs) | 1 JSON file from Google Cloud |

Google's closed testing requirement means your first Play Store publish takes at minimum 2 weeks after submission. Start the iOS process and submit to Android simultaneously — they'll arrive roughly together.

---

## Prerequisites

### Accounts you need to create
- [ ] [Apple Developer Program](https://developer.apple.com/programs/) — $99 CAD/year
- [ ] [Google Play Console](https://play.google.com/console) — $25 CAD one-time
- [ ] [Netlify](https://netlify.com) — free tier is fine
- [ ] [Expo](https://expo.dev) — free account for EAS builds
- [ ] [Supabase](https://supabase.com) — project already exists
- [ ] [Stripe](https://stripe.com) — account already exists
- [ ] [Resend](https://resend.com) — for transactional emails
- [ ] A domain name pointed at Netlify (e.g. `propertycheck.app`)

### Tools on your machine
```bash
npm install -g eas-cli       # EAS build + submit CLI
npm install -g netlify-cli   # Netlify deploy CLI (optional)
```

---

## Part 1 — Web App → Netlify

### Step 1: Push to GitHub

Netlify deploys from Git. Make sure your repo is on GitHub (or GitLab/Bitbucket).

```bash
git remote add origin https://github.com/your-username/propertycheck.git
git push -u origin main
```

### Step 2: Connect Netlify to your repo

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Choose GitHub → select your `propertycheck` repo
3. Set build settings:
   - **Base directory:** `apps/web`
   - **Build command:** `cd ../.. && npm run build -- --filter=web`
   - **Publish directory:** `apps/web/.next`
4. Click **Deploy site** — the first deploy will fail because env vars aren't set yet. That's OK.

> **Note:** `netlify.toml` in the repo already configures the build correctly, including security headers and cache rules. Netlify will pick it up automatically.

### Step 3: Add environment variables in Netlify

Go to **Site configuration → Environment variables** and add every variable from `.env.example`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (keep secret) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Created in Step 4 below |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` | Stripe Dashboard → Products → your monthly price |
| `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` | Stripe Dashboard → Products → your annual price |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `FROM_EMAIL` | `noreply@propertycheck.app` (must be verified in Resend) |
| `NEXT_PUBLIC_APP_URL` | `https://propertycheck.app` (your production URL) |

After adding all variables, trigger a new deploy: **Deploys → Trigger deploy → Deploy site**.

### Step 4: Configure Stripe webhook

Stripe needs to send subscription events to your deployed URL.

1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**
2. **Endpoint URL:** `https://propertycheck.app/api/stripe/webhook`
3. **Events to send** (select these exactly):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Click **Add endpoint** → copy the **Signing secret** (`whsec_...`)
5. Go back to Netlify env vars → add `STRIPE_WEBHOOK_SECRET` = the signing secret you just copied
6. Redeploy

### Step 5: Configure Supabase Auth

Supabase needs to know your production URL for OAuth redirects and email confirmation links.

1. **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL:** `https://propertycheck.app`
3. **Redirect URLs** — add:
   - `https://propertycheck.app/auth/callback`
   - `https://propertycheck.app/en/auth/callback`
   - `https://propertycheck.app/fr/auth/callback`

### Step 6: Set up your domain

1. In Netlify: **Domain management → Add a domain** → enter `propertycheck.app`
2. Netlify gives you nameservers — update them at your domain registrar
3. Netlify auto-provisions an SSL certificate (Let's Encrypt) within minutes

### Step 7: Verify Resend sender domain

1. **Resend Dashboard → Domains → Add domain** → `propertycheck.app`
2. Add the DNS TXT and MX records Resend shows you (at your registrar)
3. Wait for verification (usually < 10 minutes)
4. Create a sending address: `noreply@propertycheck.app`

### Step 8: Apply database migrations to production

If your Supabase project is on a separate production instance from local:

```bash
supabase db push
```

Or use the Supabase Dashboard → SQL Editor to run each file in `supabase/migrations/` in order.

### Verify the deployment

- [ ] `https://propertycheck.app` loads the landing page
- [ ] Sign up creates an account (check Supabase Auth dashboard)
- [ ] Stripe checkout opens (`/checkout?plan=premium`)
- [ ] A test subscription triggers the webhook (check Stripe → Webhooks → recent deliveries)
- [ ] Transactional email arrives (check Resend → Logs)

---

## Part 2 — Mobile App → App Store (iOS)

### Step 1: Create your Apple Developer account

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs)
2. Enroll as an **Individual** (for a solo app) or **Organization** (if you have a company)
3. Pay $99 CAD/year
4. Wait for approval — usually same-day for individuals, up to a week for organizations

### Step 2: Create your app in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps → +** (top left) → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** PropertyCheck
   - **Primary Language:** English (Canada)
   - **Bundle ID:** `com.propertycheck.app` ← must match `app.config.ts`
   - **SKU:** `propertycheck-ios-001` (any unique string)
4. Click **Create**
5. On the app page, note your **App ID** (a 10-digit number in the URL) — this is your `ascAppId`

### Step 3: Collect your Apple credentials

You need 3 values for `eas.json`:

**`appleId`** — Your Apple Developer email address (the one you login with at developer.apple.com)

**`appleTeamId`** — Find it at [developer.apple.com/account](https://developer.apple.com/account) → top-right dropdown next to your name → "Membership details" → **Team ID** (10 uppercase characters, e.g. `A1B2C3D4E5`)

**`ascAppId`** — The 10-digit number in your App Store Connect URL when viewing your app:
`https://appstoreconnect.apple.com/apps/`**`1234567890`**`/appstore/ios/version/infos`

### Step 4: Fill in eas.json

Open `apps/mobile/eas.json` and replace the placeholders:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "you@yourmail.com",
      "ascAppId": "1234567890",
      "appleTeamId": "A1B2C3D4E5"
    }
  }
}
```

### Step 5: Set up Expo for EAS

```bash
cd apps/mobile

# Log in to Expo
eas login

# Link this project to your Expo account
eas init --id YOUR_EXPO_PROJECT_ID
```

> If you don't have an Expo project ID yet, go to [expo.dev](https://expo.dev) → New Project → copy the project ID, then add it to `app.config.ts` as `extra.eas.projectId`.

### Step 6: Set mobile environment variables

EAS builds run in the cloud and need your env vars. Create a `.env.production` in `apps/mobile/`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_APP_URL=https://propertycheck.app
```

Then push them to EAS:

```bash
eas env:push --environment production
```

Or set them manually in [expo.dev](https://expo.dev) → your project → **Environment Variables**.

### Step 7: Build for production

```bash
cd apps/mobile
eas build --platform ios --profile production
```

EAS builds in the cloud (M-medium machine, ~15–20 minutes). You'll get an email when it's done.

To monitor:
```bash
eas build:list
```

### Step 8: Prepare App Store listing (do while building)

In App Store Connect → your app:

**App Information:**
- Privacy Policy URL: `https://propertycheck.app/en/privacy`
- Support URL: `https://propertycheck.app/en/contact`
- Category: **Utilities** (primary), **Lifestyle** (secondary)

**Pricing:** Free

**Age Rating:** 4+ (run the questionnaire — no objectionable content)

**Screenshots** (required sizes):
- 6.9" iPhone (iPhone 15 Pro Max): 1320×2868 px
- 6.5" iPhone (iPhone 11 Pro Max): 1284×2778 px
- iPad Pro 13": 2064×2752 px (required even if not iPad-optimized)

Take screenshots in the iOS simulator using `eas build --platform ios --profile development-simulator` and Xcode's simulator.

**Description (suggested):**
> Document your rental property in minutes with timestamped photos and professional inspection reports. PropertyCheck helps Canadian renters protect their damage deposit by creating legally-defensible evidence of their home's condition at move-in and move-out.

**Keywords:** rental inspection, damage deposit, property condition, landlord, tenant, move-in, move-out, Canada

### Step 9: Submit to the App Store

```bash
eas submit --platform ios --profile production
```

EAS will ask you to authenticate with Apple. It will automatically upload the latest successful production build to App Store Connect.

Then in App Store Connect:
1. Go to **TestFlight** → confirm the build was uploaded (takes 10–30 minutes to process)
2. Go to **App Store** → your version → select the uploaded build
3. Fill in **What's New:** `First release — document your rental property in minutes.`
4. Click **Submit for Review**

**Expected review time:** 1–3 business days. Apple sends an email when approved.

---

## Part 3 — Mobile App → Google Play (Android)

### Step 1: Create your Google Play Developer account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Click **Get started** → pay the $25 USD one-time fee
3. Complete the identity verification (takes up to 2 days)

### Step 2: Create your app in Play Console

1. **All apps → Create app**
2. Fill in:
   - **App name:** PropertyCheck
   - **Default language:** English (Canada)
   - **App or game:** App
   - **Free or paid:** Free
3. Agree to declarations → **Create app**

### Step 3: Create a Google Service Account (for EAS submit)

EAS needs API access to upload builds to Google Play automatically.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select the project Google automatically created for your Play account (or create a new one)
3. Navigate to **IAM & Admin → Service Accounts → Create service account**
4. Name it: `eas-submit`, click **Create and continue**
5. Skip the optional steps → **Done**
6. Click on the service account → **Keys → Add key → Create new key → JSON** → Download the file
7. Save the file as `apps/mobile/google-service-account.json`
8. Back in **Play Console → Setup → API access → Link to Google Cloud Project** → select your project
9. Click **Grant access** next to your service account → assign role: **Release manager**

> `google-service-account.json` contains credentials — add it to `.gitignore`.

```bash
echo "apps/mobile/google-service-account.json" >> .gitignore
```

### Step 4: Complete the closed testing requirement (new accounts only)

**This is the step that takes 14+ days.** Google now requires new developer accounts to:
1. Upload a build to a **closed test track**
2. Add at least **20 real testers** (Gmail addresses)
3. Keep the test running for **14 continuous days** before requesting production access

**How to get 20 testers:** Ask friends, family, colleagues. They just need to click an opt-in link — they don't need to actively use the app.

In Play Console:
1. **Testing → Closed testing → Create track** → name it `alpha`
2. Build and upload an AAB (see below)
3. **Testers tab → Create email list** → add 20 Gmail addresses
4. Set the track live → share the opt-in URL with your testers
5. Wait 14 days
6. **Go to → Publishing overview** → request promotion to production

### Step 5: Build for Android

```bash
cd apps/mobile
eas build --platform android --profile production
```

This produces an `.aab` (Android App Bundle). Build time: ~10–15 minutes.

### Step 6: Prepare Play Store listing (do while building)

In Play Console → your app:

**Main store listing:**
- App name: PropertyCheck
- Short description (80 chars): `Document your rental with timestamped photos. Protect your deposit.`
- Full description: same as App Store description above
- Screenshots: at least 2, up to 8 (phone: 1080×1920 recommended)
- Feature graphic: 1024×500 px
- App icon: 512×512 px (already in `apps/mobile/assets/`)

**Content rating:** complete the questionnaire (results in PEGI 3 / Everyone)

**Privacy policy:** `https://propertycheck.app/en/privacy`

**Data safety:** fill in the form:
- Data collected: Name, Email, Location (approximate, for province)
- Data shared: No
- Security practices: Data encrypted in transit ✓, You can request deletion ✓

### Step 7: Submit

```bash
eas submit --platform android --profile production
```

EAS uploads the AAB directly to Google Play. In Play Console, go to **Production → Releases → Promote** the release.

---

## Part 4 — Post-Launch Checklist

### Immediately after launch
- [ ] Test a real Stripe payment end-to-end (use a real card, then refund)
- [ ] Confirm subscription webhook fires (Stripe → Webhooks → recent events)
- [ ] Confirm email delivery (sign up with a real email and check inbox)
- [ ] Test the share page: generate a PDF on mobile, email it, click "View Report Online"
- [ ] Check Supabase RLS: try accessing another user's data (should return empty)
- [ ] Set up Supabase database backups: Dashboard → Database → Backups → Enable

### Monitoring to set up
- **Netlify Analytics** — free, built in, shows page views and errors
- **Supabase → Database → Logs** — for slow queries and errors
- **Stripe → Radar** — for fraud detection
- **Resend → Logs** — for email delivery rates

### OTA updates (JS-only changes, no App Store review needed)
```bash
cd apps/mobile
eas update --branch production --message "Description of what changed"
```

Use this for bug fixes, copy changes, and UI tweaks. Native changes (new permissions, new native modules) always require a new `eas build` + store submission.

---

## Quick Reference

```bash
# Deploy web (auto via Netlify on git push)
git push origin main

# Build mobile (both platforms)
cd apps/mobile
eas build --platform all --profile production

# Submit to both stores after build
eas submit --platform ios --profile production
eas submit --platform android --profile production

# OTA update (JS changes only, instant)
eas update --branch production --message "fix: ..."

# Check build status
eas build:list
```

---

## EAS.json Reference (completed example)

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "you@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "A1B2C3D4E5"
    },
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "production"
    }
  }
}
```

---

## Troubleshooting

**`eas build` fails with "Missing credentials"**
Run `eas credentials` to manage iOS provisioning profiles and certificates interactively. EAS can generate them automatically if you haven't created them before.

**App Store review rejected for missing privacy info**
Make sure your Privacy Policy URL is set in App Store Connect and that the Data Usage declarations match what the app actually collects.

**Google Play "Your app is not compliant with the target API level"**
The `eas.json` production profile already targets the correct API. If this appears, run `eas build --clear-cache --platform android --profile production`.

**Stripe webhook `400 Invalid signature`**
The webhook secret in Netlify env vars must come from the **live mode** webhook endpoint, not the test mode one. Make sure Stripe is in **live mode** when you create the endpoint.

**Supabase auth emails going to spam**
Add your Supabase project's SMTP sender to your Resend domain, or configure Supabase to use Resend as the SMTP provider: Supabase Dashboard → Authentication → Email → SMTP Settings.
