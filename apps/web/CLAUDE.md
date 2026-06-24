# Web App — CLAUDE.md (`apps/web/`)

Next.js 15, React 19, Tailwind CSS, Framer Motion. See root `CLAUDE.md` for universal rules.

## File Conventions

```
app/
  (auth)/           # Auth route group — minimal layout (login, signup, forgot-password, reset-password)
  (dashboard)/      # Dashboard route group — sidebar layout
    dashboard/
      page.tsx          # Main dashboard
      properties/       # List, new, [id]
      inspections/      # List, new, [id]
      reports/
      settings/
  api/stripe/       # Stripe API routes (webhook, create-checkout-session)
  auth/callback/    # Supabase OAuth callback
  checkout/         # Checkout + success pages
  page.tsx          # Landing page (statically generated)
components/
  landing/          # Navigation, HeroSection, FeaturesSection, PricingSection, etc.
  ui/               # AnimatedSection, GradientCard, Logo
lib/
  stripe/config.ts  # getStripe() (lazy init), PLANS config, getPlanByPriceId()
  supabase/
    client.ts       # createClient() — browser (anon key + cookie session)
    server.ts       # createClient() — server (cookie-aware, async)
    middleware.ts   # updateSession() — session refresh + route protection
middleware.ts       # Edge middleware: calls updateSession()
```

---

## Architecture

### Server vs Client Components

- **Default: Server Component.** No `'use client'` unless you need event handlers, hooks, or browser APIs.
- Add `'use client'` at the lowest possible level — only the interactive leaf, not the whole page.
- `useSearchParams()` must be wrapped in `<Suspense>` — Next.js 15 requirement for static generation.

```tsx
// Correct pattern for pages using useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />   {/* 'use client' lives here */}
    </Suspense>
  );
}
```

### Supabase Clients

Three clients — never mix them up:

| Client | File | Key used | Use for |
|--------|------|----------|---------|
| Browser | `lib/supabase/client.ts` | anon | Client components, form handlers |
| Server | `lib/supabase/server.ts` | anon + cookies | Server Components, Server Actions, API routes |
| Admin | inline in webhook route | service role | Stripe webhook only — bypasses RLS |

```typescript
// Browser (client component)
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server (server component or API route)
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

The admin client (service role) must be lazy-initialized and only used in `app/api/stripe/webhook/route.ts`.

### Stripe

```typescript
// lib/stripe/config.ts — always use getStripe(), never import stripe directly
import { getStripe } from '@/lib/stripe/config';
const session = await getStripe().checkout.sessions.create(...);
```

Lazy init prevents build-time crashes when `STRIPE_SECRET_KEY` isn't in the CI environment.

### Route Protection

Middleware (`middleware.ts`) handles auth redirects at the Edge:
- Unauthenticated → `/dashboard/*` or `/checkout/*` redirects to `/login?redirect=...`
- Authenticated → `/login` or `/signup` redirects to `/dashboard`
- Middleware is for session refresh and redirects only — no business logic here

---

## Design System

### Brand

- Primary: `primary-600` (#2563eb) — blue = trust, security, legal protection
- Trust is the product's core value proposition. Every design decision must reinforce it.

### Tailwind Utilities (extend, never duplicate)

```css
.btn-primary    /* bg-primary-600, hover:bg-primary-700, shadow */
.btn-secondary  /* bg-white, border-gray-200, hover:bg-gray-50 */
.input-field    /* border-2, focus:ring-primary-500, rounded-xl */
.card           /* bg-white, rounded-2xl, border, shadow-sm */
```

### Components

**`AnimatedSection`** — scroll-triggered reveal wrapper:
```tsx
<AnimatedSection animation="fadeUp" delay={0.2}>
  <h2>Features</h2>
</AnimatedSection>
// animations: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'none'
```

**`GradientCard`** — premium card with hover lift:
```tsx
<GradientCard gradient="primary" glowOnHover>
  {children}
</GradientCard>
// gradients: 'primary' | 'secondary' | 'accent' | 'none'
```

### Framer Motion Rules

- Ease values: **always use cubic-bezier arrays** `[0.25, 0.1, 0.25, 1]` — string names like `'easeOut'` are not valid TypeScript in this project.
- Stagger children: `staggerChildren: 0.1`, `delayChildren: 0.2`
- Float animations: hero decorations only, not functional UI
- `AnimatePresence` for exit animations (error messages, modals)

```typescript
// Correct
transition: { ease: [0.25, 0.1, 0.25, 1], duration: 0.6 }

// Wrong — TypeScript error
transition: { ease: 'easeOut', duration: 0.6 }
```

### UX Principles

- **Landing page = sales tool.** Mobile-first. Every section must answer "why should I sign up?"
- **Empty states = onboarding.** "No properties yet" → show a CTA to add the first one, not just a blank slate.
- **Error states = next action.** Tell the user what happened and exactly what to do.
- **Loading states = skeleton screens or subtle spinners.** Never frozen UI.

---

## Photo Upload Flow (Web)

```
1. User selects file(s) via <input type="file"> or drag-and-drop
2. Generate object URL for immediate preview (no waiting for upload)
3. Upload to Supabase Storage: `{inspection_id}/{uuid}.{ext}`
4. Insert row in inspection_photos: { inspection_id, storage_path, caption }
5. Display using getPublicUrl(storage_path) — never store the full URL
```

Supported formats: JPEG, PNG, WebP. Max size: 10MB. Compress before upload (quality 0.8).

---

## Monetization Patterns (Web)

- Upgrade prompts: contextual, not generic banners. Fire exactly when the user hits a limit.
- Checkout flow: surface annual vs monthly toggle early; show CAD savings amount explicitly.
- Share link view page: beautiful, brand-visible, clear "Sign up free" CTA — it's a passive acquisition surface.
- Free PDF watermark: design it as marketing, not punishment. It's seen by landlords who have no account.

---

## Mental Models (Next.js for Senior Devs)

**Route Groups** `(auth)`, `(dashboard)` — layout namespaces. They isolate `layout.tsx` trees without affecting URLs. Think of them like package namespaces: the URL path is the public API, the group is the internal organization.

**Server Components** — SSR with zero client bundle impact. They're like controller actions that return rendered HTML. No hydration cost. Default to them; opt into `'use client'` only when you need the browser.

**`useSearchParams()` + Suspense** — Next.js 15 made URL param reading async at the framework level for static generation compatibility. The Suspense boundary is a build constraint, not a performance choice.

**Middleware** — runs at the Edge (Vercel/Netlify Edge network) before any page render. Latency is ~1ms. Use it for auth redirects and session refresh. Not suitable for DB calls.

**API Routes** — `app/api/*/route.ts` are standard Web `Request`/`Response` handlers. Think of them as stateless Express routes that can run on the Edge. They share no state between requests.

**Supabase anon key on client** — safe because RLS is the authorization layer, not the key. The anon key identifies the project. `auth.uid()` in RLS policies identifies the user from the JWT in the cookie. If RLS is correctly set up, a leaked anon key gives an attacker nothing.

**Stripe webhooks as source of truth** — the checkout redirect is unreliable (tab closes, network drop). Always write subscription state in the webhook handler, never in the redirect handler. The redirect is just UX; the webhook is the real transaction.
