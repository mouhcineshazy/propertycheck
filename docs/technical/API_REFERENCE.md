# API Reference

## Overview

PropertyCheck uses a combination of Next.js API Routes and Supabase client-side queries for data operations. This document covers the server-side API endpoints.

## Base URL

```
Production: https://propertycheck.app/api
Development: http://localhost:3000/api
```

## Authentication

All API routes (except webhooks) require authentication via Supabase session cookies.

```typescript
// Session is automatically handled by Supabase SSR middleware
// Cookies are sent with every request
```

---

## Stripe Endpoints

### Create Checkout Session

Creates a Stripe Checkout Session for subscription purchase.

**Endpoint**: `POST /api/stripe/create-checkout-session`

**Authentication**: Required (Supabase session)

**Request Body**:
```typescript
{
  priceId: string;      // Stripe Price ID
  plan: 'premium' | 'pro';
  billingCycle: 'monthly' | 'annual';
}
```

**Response (200)**:
```typescript
{
  url: string;  // Stripe Checkout URL to redirect user
}
```

**Response (400)**:
```typescript
{
  error: string;  // Error message
}
```

**Response (401)**:
```typescript
{
  error: "Unauthorized"
}
```

**Example**:
```typescript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    plan: 'premium',
    billingCycle: 'monthly'
  })
});

const { url } = await response.json();
window.location.href = url;
```

**Implementation Details**:
- Creates Stripe customer if not exists
- Attaches user metadata (userId, plan, billingCycle)
- Includes 14-day free trial
- Enables promotion codes
- Auto-calculates tax
- Success URL: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/checkout?canceled=true`

---

### Stripe Webhook

Handles Stripe webhook events for subscription lifecycle management.

**Endpoint**: `POST /api/stripe/webhook`

**Authentication**: Stripe signature verification (not user auth)

**Headers Required**:
```
stripe-signature: <signature from Stripe>
```

**Handled Events**:

| Event | Description | Database Action |
|-------|-------------|-----------------|
| `checkout.session.completed` | User completed checkout | Create subscription record |
| `customer.subscription.updated` | Subscription changed | Update status, plan, period |
| `customer.subscription.deleted` | Subscription canceled | Set status to 'canceled', plan to 'free' |
| `invoice.paid` | Renewal successful | Update period end, set status 'active' |
| `invoice.payment_failed` | Payment declined | Set status to 'past_due' |
| `customer.subscription.trial_will_end` | Trial ending in 3 days | (Planned: Send reminder email) |

**Response (200)**:
```typescript
{
  received: true
}
```

**Response (400)**:
```typescript
{
  error: "Missing stripe-signature header"
}
// or
{
  error: "Invalid signature"
}
```

**Response (500)**:
```typescript
{
  error: "Webhook handler failed"
}
```

**Webhook Configuration**:
```bash
# In Stripe Dashboard, configure webhook to:
# URL: https://propertycheck.app/api/stripe/webhook
# Events: checkout.session.completed, customer.subscription.*, invoice.*
```

---

## Auth Endpoints

### Auth Callback

Handles OAuth callback and email confirmation redirects.

**Endpoint**: `GET /auth/callback`

**Query Parameters**:
```typescript
{
  code?: string;    // OAuth authorization code
  error?: string;   // Error from OAuth provider
  plan?: string;    // Plan to redirect to after auth
}
```

**Behavior**:
1. Exchanges authorization code for session
2. Sets session cookies
3. Redirects to:
   - `/checkout?plan={plan}` if plan provided
   - `/dashboard` otherwise
   - `/auth/auth-code-error` on error

---

## Database Operations (Supabase Client)

PropertyCheck uses Supabase client-side queries for most data operations. These are not traditional API endpoints but are documented here for completeness.

### Properties

**List Properties**:
```typescript
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .order('created_at', { ascending: false });
```

**Get Property**:
```typescript
const { data, error } = await supabase
  .from('properties')
  .select('*, inspections(*)')
  .eq('id', propertyId)
  .single();
```

**Create Property**:
```typescript
const { data, error } = await supabase
  .from('properties')
  .insert({
    user_id: userId,
    address: '123 Main St',
    property_type: 'apartment',
    notes: 'Ground floor unit'
  })
  .select()
  .single();
```

**Update Property**:
```typescript
const { data, error } = await supabase
  .from('properties')
  .update({ notes: 'Updated notes' })
  .eq('id', propertyId)
  .select()
  .single();
```

**Delete Property**:
```typescript
const { error } = await supabase
  .from('properties')
  .delete()
  .eq('id', propertyId);
```

### Inspections

**List Inspections**:
```typescript
const { data, error } = await supabase
  .from('inspections')
  .select(`
    id,
    inspection_date,
    status,
    properties (address),
    photos (id)
  `)
  .order('inspection_date', { ascending: false });
```

**Get Inspection with Photos**:
```typescript
const { data, error } = await supabase
  .from('inspections')
  .select(`
    *,
    properties (*),
    photos (*)
  `)
  .eq('id', inspectionId)
  .single();
```

**Create Inspection**:
```typescript
const { data, error } = await supabase
  .from('inspections')
  .insert({
    property_id: propertyId,
    inspection_date: new Date().toISOString(),
    status: 'draft',
    notes: 'Move-in inspection'
  })
  .select()
  .single();
```

**Update Inspection Status**:
```typescript
const { error } = await supabase
  .from('inspections')
  .update({ status: 'completed' })
  .eq('id', inspectionId);
```

### Photos

**Upload Photo**:
```typescript
// 1. Upload to storage
const filePath = `${userId}/${inspectionId}/${Date.now()}.jpg`;
const { error: uploadError } = await supabase.storage
  .from('inspection-photos')
  .upload(filePath, file, {
    contentType: 'image/jpeg',
    upsert: false
  });

// 2. Create database record
const { data, error } = await supabase
  .from('inspection_photos')
  .insert({
    inspection_id: inspectionId,
    storage_path: filePath,
    caption: 'Kitchen sink',
    room_type: 'kitchen',
    sort_order: 0
  })
  .select()
  .single();
```

**Get Photo URL**:
```typescript
const { data } = supabase.storage
  .from('inspection-photos')
  .getPublicUrl(storagePath);
```

**Delete Photo**:
```typescript
// 1. Delete from storage
await supabase.storage
  .from('inspection-photos')
  .remove([storagePath]);

// 2. Delete database record
await supabase
  .from('inspection_photos')
  .delete()
  .eq('id', photoId);
```

### Share Links

**Create Share Link**:
```typescript
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const { error } = await supabase
  .from('inspections')
  .update({
    share_token: token,
    share_expires_at: expiresAt.toISOString()
  })
  .eq('id', inspectionId);

const shareUrl = `${baseUrl}/share/${token}`;
```

**Verify Share Link**:
```typescript
const { data, error } = await supabase
  .from('inspections')
  .select('*, properties(*), photos(*)')
  .eq('share_token', token)
  .gt('share_expires_at', new Date().toISOString())
  .single();
```

**Revoke Share Link**:
```typescript
const { error } = await supabase
  .from('inspections')
  .update({
    share_token: null,
    share_expires_at: null
  })
  .eq('id', inspectionId);
```

### Subscriptions

**Get User Subscription**:
```typescript
const { data, error } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**Check Subscription Status**:
```typescript
const { data, error } = await supabase
  .rpc('get_user_subscription_status');
// Returns: 'free' | 'premium' | 'pro' | 'trialing' | 'past_due'
```

---

## Error Handling

All endpoints follow consistent error response format:

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
```

**HTTP Status Codes**:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (no/invalid session) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Consider Vercel/Netlify edge rate limiting
- Stripe webhooks have built-in retry logic (3 days)
- Supabase has default connection limits

---

## CORS

- API routes are same-origin (Next.js)
- Supabase handles CORS for client requests
- Webhook endpoint accepts requests from Stripe IPs only

---

*See [AUTHENTICATION.md](./AUTHENTICATION.md) for auth flow details.*
