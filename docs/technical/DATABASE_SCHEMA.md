# Database Schema

## Overview

PropertyCheck uses PostgreSQL via Supabase with Row Level Security (RLS) for data isolation. The schema is designed for multi-tenant SaaS with user-scoped data access.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   users     │       │   properties    │       │   inspections    │
├─────────────┤       ├─────────────────┤       ├──────────────────┤
│ id (PK)     │◀──────│ user_id (FK)    │       │ id (PK)          │
│ email       │       │ id (PK)         │◀──────│ property_id (FK) │
│ full_name   │       │ address         │       │ inspection_date  │
│ avatar_url  │       │ property_type   │       │ status           │
│ created_at  │       │ notes           │       │ notes            │
│ updated_at  │       │ created_at      │       │ share_token      │
└─────────────┘       │ updated_at      │       │ share_expires_at │
      │               └─────────────────┘       │ created_at       │
      │                                         └──────────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────────────┐                    ┌────────────────────────┐
│ user_subscriptions  │                    │   inspection_photos    │
├─────────────────────┤                    ├────────────────────────┤
│ id (PK)             │                    │ id (PK)                │
│ user_id (FK, UQ)    │                    │ inspection_id (FK)     │
│ stripe_customer_id  │                    │ storage_path           │
│ stripe_sub_id       │                    │ caption                │
│ plan                │                    │ room_type              │
│ billing_cycle       │                    │ sort_order             │
│ status              │                    │ created_at             │
│ current_period_end  │                    └────────────────────────┘
│ cancel_at_period_end│
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

## Tables

### users

Extends Supabase `auth.users` with profile data.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | - | Primary key, references auth.users |
| email | TEXT | No | - | User's email (unique) |
| full_name | TEXT | Yes | NULL | Display name |
| avatar_url | TEXT | Yes | NULL | Profile picture URL |
| created_at | TIMESTAMPTZ | No | NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | No | NOW() | Last profile update |

**Indexes**:
- `users_pkey` (id) - Primary key
- `users_email_key` (email) - Unique constraint

**RLS Policies**:
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

### properties

Rental properties owned/managed by users.

```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'condo')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Owner reference |
| address | TEXT | No | - | Property address |
| property_type | TEXT | No | - | 'apartment', 'house', or 'condo' |
| notes | TEXT | Yes | NULL | Additional notes |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update |

**Indexes**:
- `properties_pkey` (id)
- `properties_user_id_idx` (user_id)

**RLS Policies**:
```sql
-- Users can view their own properties
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create properties
CREATE POLICY "Users can create properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own properties
CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own properties
CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);
```

---

### inspections

Property inspections with optional sharing capability.

```sql
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  inspection_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  notes TEXT,
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| property_id | UUID | No | - | Property reference |
| inspection_date | TIMESTAMPTZ | No | NOW() | Date of inspection |
| status | TEXT | No | 'draft' | 'draft' or 'completed' |
| notes | TEXT | Yes | NULL | Inspection notes |
| share_token | TEXT | Yes | NULL | Unique share link token |
| share_expires_at | TIMESTAMPTZ | Yes | NULL | Share link expiration |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp |

**Indexes**:
- `inspections_pkey` (id)
- `inspections_property_id_idx` (property_id)
- `inspections_share_token_key` (share_token) - Unique

**RLS Policies**:
```sql
-- Users can view inspections for their properties
CREATE POLICY "Users can view own inspections" ON inspections
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Public can view via valid share token
CREATE POLICY "Public can view shared inspections" ON inspections
  FOR SELECT USING (
    share_token IS NOT NULL
    AND share_expires_at > NOW()
  );

-- Users can create inspections for their properties
CREATE POLICY "Users can create inspections" ON inspections
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Users can update their own inspections
CREATE POLICY "Users can update own inspections" ON inspections
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Users can delete their own inspections
CREATE POLICY "Users can delete own inspections" ON inspections
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
```

---

### inspection_photos

Photos attached to inspections.

```sql
CREATE TABLE public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  room_type TEXT NOT NULL CHECK (room_type IN ('bedroom', 'bathroom', 'kitchen', 'living_room', 'other')),
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| inspection_id | UUID | No | - | Inspection reference |
| storage_path | TEXT | No | - | Supabase storage path (see below) |
| caption | TEXT | Yes | NULL | Photo description |
| room_type | TEXT | Yes | - | Room category |
| sort_order | INTEGER | No | 0 | Display order |
| created_at | TIMESTAMPTZ | No | NOW() | Upload timestamp |

**Storage Path Convention**:

The `storage_path` column stores the relative path in the Supabase Storage bucket `inspection-photos`:

```
{inspection_id}/{uuid}.{extension}
```

Example: `a1b2c3d4-5678-90ab-cdef-123456789abc/f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg`

**Getting Public URLs**:

The public URL is not stored in the database. It's generated on-demand:

```typescript
const { data } = supabase.storage
  .from('inspection-photos')
  .getPublicUrl(photo.storage_path);
const publicUrl = data.publicUrl;
```

**Indexes**:
- `inspection_photos_pkey` (id)
- `inspection_photos_inspection_id_idx` (inspection_id)

**RLS Policies**:
```sql
-- Users can view photos for their inspections
CREATE POLICY "Users can view own photos" ON inspection_photos
  FOR SELECT USING (
    inspection_id IN (
      SELECT i.id FROM inspections i
      JOIN properties p ON i.property_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Public can view photos for shared inspections
CREATE POLICY "Public can view shared photos" ON inspection_photos
  FOR SELECT USING (
    inspection_id IN (
      SELECT id FROM inspections
      WHERE share_token IS NOT NULL
      AND share_expires_at > NOW()
    )
  );

-- Users can insert photos for their inspections
CREATE POLICY "Users can create photos" ON inspection_photos
  FOR INSERT WITH CHECK (
    inspection_id IN (
      SELECT i.id FROM inspections i
      JOIN properties p ON i.property_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Users can update their own photos
CREATE POLICY "Users can update own photos" ON inspection_photos
  FOR UPDATE USING (
    inspection_id IN (
      SELECT i.id FROM inspections i
      JOIN properties p ON i.property_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON inspection_photos
  FOR DELETE USING (
    inspection_id IN (
      SELECT i.id FROM inspections i
      JOIN properties p ON i.property_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
```

---

### user_subscriptions

Stripe subscription tracking.

```sql
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'expired', 'paused')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | User reference (unique) |
| stripe_customer_id | TEXT | Yes | NULL | Stripe customer ID |
| stripe_subscription_id | TEXT | Yes | NULL | Stripe subscription ID |
| plan | TEXT | No | 'free' | 'free', 'premium', or 'pro' |
| billing_cycle | TEXT | Yes | 'monthly' | 'monthly' or 'annual' |
| status | TEXT | No | 'free' | Subscription status |
| current_period_end | TIMESTAMPTZ | Yes | NULL | Billing period end |
| cancel_at_period_end | BOOLEAN | Yes | FALSE | Scheduled cancellation |
| created_at | TIMESTAMPTZ | No | NOW() | Record creation |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update |

**Status Values**:

| Status | Description |
|--------|-------------|
| free | Free tier (no Stripe subscription) |
| trialing | In trial period |
| active | Paid and current |
| past_due | Payment failed, in grace period |
| canceled | Subscription ended |
| unpaid | Failed payment, access restricted |
| incomplete | Checkout not completed |
| expired | Trial expired without conversion |
| paused | Subscription paused (manual) |

**RLS Policies**:
```sql
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can modify subscriptions (via webhook)
-- No INSERT/UPDATE/DELETE policies for authenticated users
```

---

## Functions

### get_user_subscription_status()

Returns the current user's subscription status.

```sql
CREATE OR REPLACE FUNCTION get_user_subscription_status()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_status TEXT;
BEGIN
  SELECT status INTO sub_status
  FROM user_subscriptions
  WHERE user_id = auth.uid();

  RETURN COALESCE(sub_status, 'free');
END;
$$;
```

### check_free_tier_limits()

Validates if user is within free tier limits.

```sql
CREATE OR REPLACE FUNCTION check_free_tier_limits()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  property_count INTEGER;
  inspection_count INTEGER;
  result JSONB;
BEGIN
  -- Count properties
  SELECT COUNT(*) INTO property_count
  FROM properties
  WHERE user_id = auth.uid();

  -- Count inspections
  SELECT COUNT(*) INTO inspection_count
  FROM inspections i
  JOIN properties p ON i.property_id = p.id
  WHERE p.user_id = auth.uid();

  result := jsonb_build_object(
    'properties', property_count,
    'properties_limit', 3,
    'properties_remaining', GREATEST(0, 3 - property_count),
    'inspections', inspection_count,
    'inspections_limit', 15,
    'inspections_remaining', GREATEST(0, 15 - inspection_count),
    'within_limits', property_count <= 3 AND inspection_count <= 15
  );

  RETURN result;
END;
$$;
```

---

## Storage

### inspection-photos Bucket

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-photos', 'inspection-photos', true);

-- Upload policy
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'inspection-photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- View policy (own photos)
CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'inspection-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public view (for shared inspections)
CREATE POLICY "Public can view shared photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'inspection-photos'
  );

-- Delete policy
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'inspection-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**File Path Convention**:
```
inspection-photos/{user_id}/{inspection_id}/{timestamp}.jpg
```

---

## Triggers

### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Create User Profile on Signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );

  -- Create default free subscription
  INSERT INTO public.user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Migrations

Migrations are located in `supabase/migrations/`:

| File | Description |
|------|-------------|
| `20260115_initial_schema.sql` | Initial schema with all tables, RLS, functions |

**Running Migrations**:
```bash
# Local development
supabase db reset

# Production (via Supabase Dashboard or CLI)
supabase db push
```

---

## Type Definitions

Auto-generated TypeScript types are in `packages/database/src/types.ts`:

```typescript
export type Database = {
  public: {
    Tables: {
      users: { Row: {...}, Insert: {...}, Update: {...} };
      properties: { Row: {...}, Insert: {...}, Update: {...} };
      inspections: { Row: {...}, Insert: {...}, Update: {...} };
      inspection_photos: { Row: {...}, Insert: {...}, Update: {...} };
      user_subscriptions: { Row: {...}, Insert: {...}, Update: {...} };
    };
    Functions: {
      get_user_subscription_status: { Returns: string };
      check_free_tier_limits: { Returns: Json };
    };
  };
};
```

**Regenerating Types**:
```bash
supabase gen types typescript --local > packages/database/src/types.ts
```

---

*See [API_REFERENCE.md](./API_REFERENCE.md) for query examples.*
