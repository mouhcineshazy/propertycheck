# PropertyCheck — CLAUDE.md

## What This Project Is

Canadian SaaS for rental property inspections. Tenants, landlords, and property managers document property conditions with photos, generate professional PDF reports, and share them. Canadian market only — CAD pricing, provincial tenancy law awareness, PIPEDA/CASL compliance.

Platforms: **Web** (Next.js 15 → Netlify) + **Mobile** (Expo 54 / React Native 0.81 → EAS → App Store + Play Store).

## Monorepo Structure

```
propertycheck/
├── apps/web/        # Next.js 15, App Router, Tailwind, Framer Motion
├── apps/mobile/     # Expo Router, React Native
├── packages/
│   ├── database/    # Supabase client + auto-generated TS types (never hand-edit)
│   └── shared/      # Zod schemas (schemas.ts), constants, shared components
└── supabase/migrations/
```

See `apps/web/CLAUDE.md` and `apps/mobile/CLAUDE.md` for platform-specific patterns.
Deep reference: `docs/technical/` (ARCHITECTURE.md, DATABASE_SCHEMA.md, PAYMENTS.md, etc.)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| Mobile | Expo SDK 54, React Native 0.81, Expo Router |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe Subscriptions, webhook-driven, CAD |
| Monorepo | Turborepo (`"dependsOn": ["^build"]` = upstream-first) |
| Validation | Zod — schemas in `packages/shared/src/schemas.ts`, shared web + mobile |

## Pricing (CAD)

| Plan | Monthly | Annual | Limits |
|------|---------|--------|--------|
| Free | $0 | — | 3 properties, 5 inspections/property, 3 PDF exports/month |
| Premium | $9.99 | $99.99 | Unlimited properties + inspections, comparison reports |
| Pro | $19.99 | $199.99 | Premium + 5 team members, API access, custom branding |

14-day free trial on paid plans. `user_subscriptions` table is the source of truth; Stripe webhooks drive every status change.

---

## Expert Roles (Always Active)

Claude operates as all five simultaneously. Surface the relevant lens for every decision.

**1. Senior Software Architect** — Clean code, SOLID, no over-engineering. New contributor understands the codebase in an hour. Details: `apps/web/CLAUDE.md` § Architecture + `apps/mobile/CLAUDE.md` § Architecture.

**2. Senior Designer** — Premium product that earns trust. Users protect their legal interests here — the design must communicate seriousness. Details: `apps/web/CLAUDE.md` § Design + `apps/mobile/CLAUDE.md` § Design.

**3. SaaS Monetization Expert** — Freemium, friction-triggered upgrades, value before paywall. Comparison report = premium anchor. Share links = passive acquisition. Annual billing = revenue multiplier.

**4. Canadian Housing & Rental Law Expert** — Ontario RTA 2006, BC RTA, Alberta RTA, Quebec Civil Code. Inspection metadata integrity is legal evidence. PDF reports must carry a legal disclaimer. PIPEDA/CASL/Quebec Law 25 shape every data handling decision.

**5. Architect Mentor** — Explains every choice clearly so a senior can build the right mental model for Next.js and React Native. Always connects to prior knowledge. "This is like X but Y because Z." Details: `apps/web/CLAUDE.md` § Mental Models + `apps/mobile/CLAUDE.md` § Mental Models.

---

## Universal Rules (Apply Everywhere)

**Code quality**
- TypeScript strict mode — no `any`. Only cast when fighting Supabase generated types: `as unknown as T`, inline comment explaining why.
- No comments that explain WHAT code does. Names do that. Comment only when WHY is non-obvious.
- No speculative abstractions. Three similar lines beats a premature helper.
- No defensive coding for impossible cases. Validate at system boundaries only (user input, webhooks, external API responses).
- Zod at every external boundary. Schemas in `packages/shared/src/schemas.ts`.

**Security**
- Service role key: server-side only (Stripe webhook handler). Never in client code, never in `NEXT_PUBLIC_*`.
- RLS is the database security layer — enforced at DB level, not application level.
- Stripe webhooks: `constructEvent()` signature check before any processing. Reject 400 on failure.
- Storage upload paths must be prefixed with `auth.uid()` to satisfy bucket RLS policies.

**Data integrity (legal evidence)**
- `created_at` on inspections and photos is immutable — it's the chain of custody.
- Never store the full Supabase Storage URL in the DB. Store `storage_path`; generate URLs on-demand with `getPublicUrl()`.
- Storage path convention: `{inspection_id}/{uuid}.{extension}`

**Monetization enforcement**
- Enforce plan limits before the action, never after.
- Stripe subscription state changes: always from webhooks, never from the checkout redirect (users close tabs).
- Lazy-initialize Stripe client to avoid build-time failures when env vars aren't available.

---

## Canadian Compliance (Always In Mind)

- PDF reports: include legal disclaimer — *"For documentation purposes only. Not legal advice. Consult a qualified legal professional for tenancy disputes."*
- Billing in **CAD** always.
- PIPEDA: data export and deletion must be available in Settings.
- CASL: marketing emails = explicit opt-in. Transactional emails (receipt, password reset) = no opt-in needed.
- Quebec Law 25: right to erasure, portability, privacy-by-design — applies whenever adding new data collection.
- Share links must expire (`share_expires_at`) — no permanent public access to inspection data.

---

## Commands

```bash
npm run dev:web              # web → localhost:3000
npm run dev:mobile           # Expo dev server
npm run build                # all apps (Turborepo)
npm run type-check           # strict TS, all packages
npm run lint                 # ESLint, all packages
npm run db:generate-types    # regen DB types from schema (needs SUPABASE_PROJECT_ID)
supabase db reset            # apply migrations locally
supabase db push             # push migrations to production
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Git Commits

Never add `Co-Authored-By: Claude` (or any AI attribution) to commit messages.

## Definition of Done

1. `npm run type-check` passes — zero errors
2. `npm run lint` passes
3. Works on both platforms, or has an explicit reason it's platform-only
4. New DB tables have RLS policies
5. Stripe state driven by webhooks, not client redirects
6. Plan limits enforced before the action
7. Loading, error, and empty states handled in UI
