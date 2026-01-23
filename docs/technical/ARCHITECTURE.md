# Architecture Overview

## System Architecture

PropertyCheck is a mobile-first SaaS platform for rental property inspections, built as a TypeScript monorepo with three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PropertyCheck                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Web App    │     │  Mobile App  │     │   Landing    │    │
│  │  (Next.js)   │     │   (Expo)     │     │    Page      │    │
│  └──────┬───────┘     └──────┬───────┘     └──────────────┘    │
│         │                    │                                   │
│         └────────────────────┴──────────────────┐               │
│                                                  │               │
│  ┌──────────────────────────────────────────────▼──────────┐   │
│  │                   Shared Packages                        │   │
│  │  ┌─────────────────┐    ┌─────────────────────────┐     │   │
│  │  │    @database    │    │        @shared          │     │   │
│  │  │ Supabase Client │    │ Schemas, Constants, UI  │     │   │
│  │  └─────────────────┘    └─────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      External Services                           │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Supabase   │  │   Stripe    │  │    Netlify / EAS       │ │
│  │  Database   │  │  Payments   │  │      Hosting           │ │
│  │  Auth       │  │             │  │                        │ │
│  │  Storage    │  │             │  │                        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
propertycheck/
├── apps/
│   ├── web/                    # Next.js 15 web application
│   │   ├── app/                # App Router pages & API routes
│   │   │   ├── (auth)/         # Auth route group (login, signup)
│   │   │   ├── (dashboard)/    # Dashboard route group
│   │   │   │   └── dashboard/
│   │   │   │       ├── page.tsx            # Main dashboard
│   │   │   │       ├── inspections/
│   │   │   │       │   ├── page.tsx        # List inspections
│   │   │   │       │   ├── new/            # Create inspection
│   │   │   │       │   └── [id]/           # Inspection detail
│   │   │   │       └── properties/
│   │   │   │           ├── page.tsx        # List properties
│   │   │   │           ├── new/            # Add property
│   │   │   │           └── [id]/           # Property detail
│   │   │   ├── api/            # API routes (Stripe)
│   │   │   ├── checkout/       # Checkout pages
│   │   │   └── auth/           # Auth callbacks
│   │   ├── components/         # React components
│   │   │   ├── landing/        # Landing page sections
│   │   │   └── ui/             # Reusable UI components
│   │   ├── lib/                # Utilities & configurations
│   │   │   ├── stripe/         # Stripe client & config
│   │   │   └── supabase/       # Supabase clients
│   │   └── public/             # Static assets
│   │
│   └── mobile/                 # Expo React Native application
│       ├── app/                # Expo Router pages
│       │   ├── (auth)/         # Auth screens
│       │   ├── (tabs)/         # Tab navigation
│       │   ├── property/       # Property screens
│       │   └── inspection/     # Inspection screens
│       ├── components/         # React Native components
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Utilities
│
├── packages/
│   ├── database/               # Supabase client package
│   │   └── src/
│   │       ├── client.ts       # Browser & Server clients
│   │       ├── types.ts        # Auto-generated DB types
│   │       └── index.ts        # Public exports
│   │
│   └── shared/                 # Shared utilities package
│       └── src/
│           ├── schemas.ts      # Zod validation schemas
│           ├── constants.ts    # App-wide constants
│           └── components/     # Shared React components
│
├── supabase/
│   └── migrations/             # SQL migration files
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json
└── tsconfig.base.json          # Base TypeScript config
```

## Technical Decisions

### 1. Monorepo with Turborepo

**Decision**: Use Turborepo for monorepo management.

**Rationale**:
- Shared code between web and mobile apps (schemas, constants, types)
- Incremental builds with intelligent caching
- Parallel task execution for faster CI/CD
- Single source of truth for dependencies

**Trade-offs**:
- Increased complexity for initial setup
- Requires careful dependency management

### 2. Next.js 15 with App Router

**Decision**: Use Next.js 15 App Router for the web application.

**Rationale**:
- React Server Components for improved performance
- Built-in API routes for Stripe webhooks
- Middleware for authentication
- Optimized image handling
- Static generation for landing page

**Key Patterns**:
- Route Groups: `(auth)`, `(dashboard)` for layout organization
- Server Components by default, `'use client'` for interactivity
- Suspense boundaries for `useSearchParams()` (Next.js 15 requirement)
- Lazy initialization for server-side clients (build-time safety)

### 3. Expo with Expo Router

**Decision**: Use Expo SDK 54 with file-based routing.

**Rationale**:
- Rapid development with managed workflow
- File-based routing mirrors Next.js patterns
- Built-in camera, image picker, and file system APIs
- EAS Build for production builds
- Over-the-air updates capability

**Key Features Used**:
- expo-camera: Photo capture
- expo-image-picker: Gallery access
- expo-file-system: Local file operations
- expo-sharing: Share to other apps
- expo-print: PDF generation

### 4. Supabase for Backend

**Decision**: Use Supabase as the primary backend.

**Rationale**:
- PostgreSQL with real-time subscriptions
- Built-in authentication (email + OAuth)
- Row Level Security (RLS) for data isolation
- Storage for inspection photos
- Auto-generated TypeScript types

**Security Model**:
- RLS policies ensure users can only access their own data
- Service role key used only in server-side webhook handlers
- Anon key safe for client-side usage

### 5. Stripe for Payments

**Decision**: Use Stripe Subscriptions for monetization.

**Rationale**:
- Industry-standard payment processing
- Built-in subscription management
- Webhook-driven architecture for reliability
- Support for trials, promotions, and tax handling

**Integration Pattern**:
- Lazy-initialized Stripe client (avoids build-time errors)
- Checkout Sessions for payment flow
- Webhooks for subscription lifecycle management
- Metadata for user-subscription linking

### 6. Tailwind CSS + Framer Motion

**Decision**: Tailwind for styling, Framer Motion for animations.

**Rationale**:
- Tailwind: Utility-first, rapid prototyping, consistent design system
- Framer Motion: Declarative animations, gesture support, React-native feel

**Custom Configurations**:
- Extended color palette with primary brand colors
- Custom animation keyframes (float, glow, pulse)
- Responsive breakpoints for mobile-first design

### 7. Zod for Validation

**Decision**: Use Zod for runtime validation.

**Rationale**:
- TypeScript-first schema validation
- Shared between frontend and backend
- Descriptive error messages
- Easy integration with form libraries

**Schemas Defined**:
- `propertySchema`: Property creation/update
- `inspectionSchema`: Inspection creation
- `photoSchema`: Photo metadata
- `loginSchema`, `registerSchema`: Auth forms

### 8. TypeScript Strict Mode

**Decision**: Use strict TypeScript configuration.

**Rationale**:
- Catch errors at compile time
- Better IDE autocompletion
- Self-documenting code
- Safer refactoring

**Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

## Data Flow

### Authentication Flow

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Middleware│────▶│ Supabase │────▶│ Database │
│          │◀────│           │◀────│   Auth   │◀────│          │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
     │                                    │
     │         Cookie-based JWT           │
     └────────────────────────────────────┘
```

### Subscription Flow

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ API Route │────▶│  Stripe  │────▶│ Checkout │
│          │◀────│           │◀────│ Sessions │◀────│          │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
                                          │
                                          ▼
┌──────────┐     ┌───────────┐     ┌──────────┐
│ Database │◀────│  Webhook  │◀────│  Stripe  │
│          │     │  Handler  │     │ Webhooks │
└──────────┘     └───────────┘     └──────────┘
```

### Inspection Photo Flow (Mobile)

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  Mobile  │────▶│  Camera/  │────▶│  Local   │────▶│ Compress │
│   App    │     │  Gallery  │     │  File    │     │  Image   │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
                                                           │
                                                           ▼
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│ Database │◀────│  Create   │◀────│ Supabase │◀────│  Upload  │
│ (photos) │     │  Record   │     │ Storage  │     │   API    │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
```

### Inspection Photo Flow (Web)

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│   Web    │────▶│   File    │────▶│  Preview │
│  Browser │     │   Input   │     │  (blob)  │
└──────────┘     └───────────┘     └──────────┘
                                        │
                                        ▼
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│ Database │◀────│  Create   │◀────│ Supabase │◀────│  Upload  │
│ (photos) │     │  Record   │     │ Storage  │     │   File   │
│          │     │storage_path│     │          │     │          │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
                       │
                       ▼
┌──────────┐     ┌───────────┐
│ Generate │────▶│  Display  │
│Public URL│     │  Gallery  │
└──────────┘     └───────────┘
```

**Storage Path Convention**: `{inspection_id}/{uuid}.{extension}`

The `storage_path` is stored in the database, and public URLs are generated on-demand using `supabase.storage.from('inspection-photos').getPublicUrl(storage_path)`.

## Performance Optimizations

1. **Static Generation**: Landing page pre-rendered at build time
2. **Image Optimization**: Next.js Image component with WebP format
3. **Code Splitting**: Automatic route-based splitting
4. **Lazy Loading**: Components loaded on demand
5. **Caching**: Turborepo caches build artifacts
6. **CDN**: Static assets served from Netlify CDN
7. **Compression**: Gzip/Brotli compression enabled

## Security Measures

1. **RLS Policies**: All database queries filtered by user_id
2. **HTTPS Only**: Enforced via Netlify headers
3. **CSP Headers**: Content Security Policy configured
4. **Webhook Verification**: Stripe signature validation
5. **Environment Variables**: Secrets never committed to Git
6. **Service Role Isolation**: Admin client only in server routes
7. **Input Validation**: Zod schemas on all user inputs

---

*See [DEPENDENCIES.md](./DEPENDENCIES.md) for complete library documentation links.*
