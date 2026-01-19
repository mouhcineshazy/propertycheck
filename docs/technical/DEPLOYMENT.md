# Deployment Guide

## Overview

PropertyCheck is deployed using:
- **Web App**: Netlify (Next.js)
- **Mobile App**: Expo EAS Build
- **Database**: Supabase Cloud
- **Payments**: Stripe

## Web App Deployment (Netlify)

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

# Next.js plugin (auto-detected)
[[plugins]]
  package = "@netlify/plugin-nextjs"

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co;
      frame-src https://js.stripe.com https://hooks.stripe.com;
    """

# Cache static assets
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"

# Redirect www to non-www
[[redirects]]
  from = "https://www.propertycheck.app/*"
  to = "https://propertycheck.app/:splat"
  status = 301
  force = true
```

### Environment Variables (Netlify)

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://propertycheck.app
```

### Deployment Commands

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to site
netlify link

# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

      # Netlify handles deployment via Git integration
```

## Mobile App Deployment (Expo EAS)

### EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./pc-api-key.json",
        "track": "internal"
      }
    }
  }
}
```

### App Configuration

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PropertyCheck',
  slug: 'propertycheck',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2563eb',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.propertycheck.app',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'PropertyCheck needs camera access to take inspection photos.',
      NSPhotoLibraryUsageDescription: 'PropertyCheck needs photo library access to select inspection photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2563eb',
    },
    package: 'com.propertycheck.app',
    versionCode: 1,
    permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
  },
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  updates: {
    url: 'https://u.expo.dev/your-project-id',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
});
```

### Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for iOS (simulator)
eas build --platform ios --profile preview

# Build for Android (APK)
eas build --platform android --profile preview

# Build for production
eas build --platform all --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

### Over-the-Air Updates

```bash
# Publish update (after build)
eas update --branch production --message "Bug fixes"

# Check update status
eas update:list
```

## Database Deployment (Supabase)

### Migration Management

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Create new migration
supabase migration new my_migration_name

# Apply migrations locally
supabase db reset

# Push migrations to production
supabase db push

# Pull remote schema
supabase db pull
```

### Seed Data (Development)

```sql
-- supabase/seed.sql
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

INSERT INTO public.users (id, email, full_name)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User');

INSERT INTO public.properties (id, user_id, address, property_type)
VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '123 Main St, Toronto, ON', 'apartment');
```

### Production Checklist

- [ ] Enable RLS on all tables
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set up monitoring alerts
- [ ] Review security policies

## Stripe Setup

### Production Checklist

1. **Activate Account**
   - Complete business verification
   - Add bank account for payouts

2. **Create Products**
   ```
   Premium Monthly: $9.99 CAD/month
   Premium Annual: $99.99 CAD/year
   Pro Monthly: $19.99 CAD/month
   Pro Annual: $199.99 CAD/year
   ```

3. **Configure Webhook**
   - Endpoint: `https://propertycheck.app/api/stripe/webhook`
   - Events: checkout.session.completed, customer.subscription.*, invoice.*

4. **Tax Configuration**
   - Enable Stripe Tax
   - Configure tax registration

5. **Customer Portal**
   - Enable self-service portal
   - Configure allowed actions

### Test Cards

```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
```

## Monitoring & Logging

### Netlify Logs

```bash
# View function logs
netlify logs:function stripe-webhook

# Stream logs
netlify logs:function stripe-webhook --follow
```

### Supabase Logs

- Dashboard → Logs → API Logs
- Dashboard → Logs → Postgres Logs
- Dashboard → Logs → Auth Logs

### Error Tracking (Recommended)

```typescript
// Sentry setup (optional)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

## Domain Configuration

### DNS Settings

```
Type    Name    Value
A       @       75.2.60.5 (Netlify)
CNAME   www     propertycheck.app
```

### SSL Certificate

Netlify automatically provisions Let's Encrypt SSL certificates.

## Rollback Procedures

### Web App

```bash
# List deploys
netlify deploy:list

# Rollback to specific deploy
netlify deploy:restore --deploy-id <deploy-id>
```

### Database

```sql
-- Revert last migration (if rollback function exists)
-- Always test in staging first
SELECT revert_last_migration();
```

### Mobile App

```bash
# Publish rollback update
eas update --branch production --message "Rollback to v1.0.0"
```

## Environment Summary

| Environment | Web URL | Database | Stripe |
|-------------|---------|----------|--------|
| Development | localhost:3000 | local | test mode |
| Staging | staging.propertycheck.app | staging | test mode |
| Production | propertycheck.app | production | live mode |

## Deployment Checklist

### Before Deploy

- [ ] All tests passing
- [ ] Type check passing
- [ ] Lint check passing
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Stripe webhooks configured

### After Deploy

- [ ] Verify authentication works
- [ ] Test checkout flow
- [ ] Verify webhook delivery
- [ ] Check error logs
- [ ] Monitor performance

---

*See [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview.*
