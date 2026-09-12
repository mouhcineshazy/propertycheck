---
name: supabase-feature
description: >
  End-to-end procedure for adding or changing a data-backed feature in
  PropertyCheck's Supabase backend — new tables/columns, RLS policies, generated
  types, Zod schemas, storage, and client usage across web + mobile. Use whenever
  a change touches the database, RLS, Supabase Storage, or the three Supabase
  clients. Encodes the security + data-integrity rules so nothing ships without RLS
  or leaks the service-role key.
---

# Adding a Supabase-backed feature

Inspection data is **legal evidence** and the app takes payments — correctness and
RLS are not optional. Follow this order.

## 1. Model the data (migration)
- Add a migration in `supabase/migrations/` (timestamped). Reference existing
  migrations for style.
- Prefer additive changes. `created_at` on inspections/photos is **immutable** —
  never add triggers or code that mutate it (chain of custody).
- Apply locally with `supabase db reset`; push with `supabase db push`.

## 2. RLS — mandatory for every new table
- Enable RLS and add explicit policies. The standard shape: a row is owned via
  `user_id` (directly or through a parent like `inspections.property_id →
  properties.user_id`), and policies check `auth.uid()`.
- Storage: bucket policies require the object path to be prefixed with
  `auth.uid()`. Uploads use `{user_id}/{inspection_id}/{...}`.
- A table without RLS is a blocker. If a value must bypass RLS, it belongs only in
  the Stripe webhook handler via the service-role client.

## 3. Regenerate types (never hand-edit)
- `npm run db:generate-types` (needs `SUPABASE_PROJECT_ID`). Types land in
  `packages/database`. If generated types are stale/awkward, cast at the call site
  with `as unknown as T` + a one-line reason — don't edit the generated file.

## 4. Validate at the boundary (Zod)
- Add/extend a schema in `packages/shared/src/schemas.ts` (shared web + mobile).
  Validate all external input (forms, API bodies, webhook payloads) with
  `safeParse`; surface errors with `formatZodError`.

## 5. Use the right client (never mix them)
- **Web browser** (`apps/web/lib/supabase/client.ts`, anon + cookies): client
  components / form handlers.
- **Web server** (`apps/web/lib/supabase/server.ts`, anon + cookies, async):
  Server Components, Server Actions, API routes.
- **Admin/service-role**: inline in `apps/web/app/api/stripe/webhook/route.ts`
  only — bypasses RLS, server-only, lazy-initialized. Never in client code, never
  in `NEXT_PUBLIC_*`.
- **Mobile** (`apps/mobile/lib/supabase.ts`): single client with the SecureStore
  adapter, `detectSessionInUrl: false`. Mobile API calls to the web use a Bearer
  token, not cookies.

## 6. Storage rules
- Store `storage_path` in the DB — **never the full public URL**. Resolve on demand
  with `getPublicUrl(storage_path)`.
- Path convention: web `{inspection_id}/{uuid}.{ext}`; mobile
  `{user_id}/{inspection_id}/{timestamp}.jpg`. Preserve EXIF on mobile (GPS +
  timestamp are part of the evidence). Compress at quality 0.8.

## 7. Compliance (PIPEDA / Law 25)
- Any new personal-data collection must be covered by data export
  (`/api/account/export`) and deletion (`/api/account/delete`). On account delete,
  purge Storage + DB. Privacy-by-design: collect only what the feature needs.

## Definition of done
`npm run type-check` + `npm run lint` clean; migration applies cleanly; new tables
have RLS; types regenerated; Zod at the boundary; correct client used; storage uses
`storage_path`. Works on both platforms or has a stated reason it's platform-only.
