# PropertyCheck

Mobile-first property inspection SaaS for landlords and property managers.

## Tech Stack

- **Mobile**: React Native + Expo (TypeScript)
- **Web**: Next.js 14 App Router (TypeScript)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe
- **Monorepo**: Turborepo

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)
- A Supabase project (free tier: https://supabase.com)
- A Stripe account (test mode: https://stripe.com)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/propertycheck.git
cd propertycheck
npm install
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values:
# - Supabase URL and keys (from Supabase Dashboard > Settings > API)
# - Stripe keys (from Stripe Dashboard > Developers > API keys)
```

### 3. Database Setup

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply database migrations
supabase db push

# Generate TypeScript types (optional but recommended)
npm run db:generate-types
```

### 4. Run Development Servers

```bash
# Run everything (web + mobile)
npm run dev

# Or run individually:
npm run dev:web      # Next.js on http://localhost:3000
npm run dev:mobile   # Expo (scan QR with Expo Go app)
```

## Project Structure

```
propertycheck/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── web/             # Next.js 14 web app + landing page
├── packages/
│   ├── database/        # Supabase client, types, queries
│   └── shared/          # Shared utilities, schemas, constants
├── supabase/
│   └── migrations/      # SQL migration files
├── docs/
│   └── MVP_SCOPE.md     # MVP feature scope (read this!)
└── .github/
    └── workflows/       # CI/CD pipelines
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development |
| `npm run dev:web` | Start only the web app |
| `npm run dev:mobile` | Start only the mobile app |
| `npm run build` | Build all apps for production |
| `npm run lint` | Lint all packages |
| `npm run type-check` | TypeScript type checking |
| `npm run clean` | Clean all build artifacts |
| `npm run db:generate-types` | Generate Supabase types |

## MVP Features

See [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) for the complete feature scope.

**In Scope:**
- Email/password authentication
- Property CRUD (address, type, notes)
- Inspection creation with photos
- Basic PDF report generation
- Public sharing links (7-day expiry)
- Stripe subscription ($9.99 CAD/month)

**Out of Scope (V2):**
- Photo annotations
- Voice notes
- Custom checklists
- Team collaboration
- Multi-language

## Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard > Developers > API keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard > Developers > API keys |

## License

Private - All rights reserved.
