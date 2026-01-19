# Business Features

## Product Overview

PropertyCheck is a mobile-first SaaS platform designed to simplify rental property inspections for landlords, tenants, and property managers. The platform enables users to document property conditions with photos, generate professional reports, and share inspection results securely.

## Target Users

| User Type | Primary Need | Key Features |
|-----------|--------------|--------------|
| **Tenants** | Document move-in/move-out condition | Photo capture, basic reports, share with landlord |
| **Landlords** | Track property condition over time | Multiple properties, comparison reports, storage |
| **Property Managers** | Manage inspections at scale | Team collaboration, custom branding, API access |

## Core Features

### 1. Property Management

**Functionality**:
- Create and manage multiple rental properties
- Store property details (address, type, notes)
- View inspection history per property
- Property types: Apartment, House, Condo

**User Flow**:
```
Add Property → Enter Details → Save → View in Dashboard
```

**Database**: `properties` table with RLS filtering by `user_id`

### 2. Inspection Creation

**Functionality**:
- Create new inspections linked to properties
- Capture photos via camera or gallery
- Add captions and room labels to photos
- Save inspections as draft or completed
- Edit inspections until finalized

**Room Types Supported**:
- Bedroom
- Bathroom
- Kitchen
- Living Room
- Other

**User Flow**:
```
Select Property → New Inspection → Capture Photos → Add Details → Save
```

**Database**: `inspections` + `inspection_photos` tables

### 3. Photo Documentation

**Functionality**:
- Capture photos directly from camera
- Import from device gallery
- Automatic image compression (max 10MB, 0.8 quality)
- Add captions (up to 200 characters)
- Assign room type to each photo
- Reorder photos within inspection

**Supported Formats**: JPEG, PNG, WebP

**Storage**: Supabase Storage bucket (`inspection-photos`)

### 4. PDF Report Generation

**Functionality**:
- Generate professional PDF reports
- Include all photos with captions
- Property details and inspection date
- Room-by-room organization
- Timestamp and signature fields

**Free Tier**: 3 PDF exports per month
**Premium/Pro**: Unlimited exports

### 5. Sharing & Collaboration

**Functionality**:
- Generate shareable links for inspections
- Links expire after 7 days (configurable)
- View-only access for recipients
- Revoke links at any time
- Email sharing integration (mobile)

**Security**: Token-based access, no authentication required for viewers

### 6. Subscription Management

**Functionality**:
- Self-service plan upgrades/downgrades
- Secure checkout via Stripe
- 14-day free trial on paid plans
- Annual billing discount (~17% savings)
- Promo code support
- Cancel anytime

## Pricing Plans

### Free Plan ($0/month)

**Features**:
- Up to 3 properties
- 5 inspections per property
- Basic PDF reports
- Photo documentation
- Email support

**Limits**:
- 20 photos per inspection
- 3 PDF exports per month
- 100 MB total storage
- 1 team member

### Premium Plan ($9.99 CAD/month or $99.99 CAD/year)

**Features**:
- Unlimited properties
- Unlimited inspections
- Professional PDF reports
- Comparison reports (before/after)
- Share with landlords
- Priority support

**Limits**:
- 50 photos per inspection
- Unlimited PDF exports
- 1 GB storage
- 1 team member

**Trial**: 14 days free, no credit card required

### Pro Plan ($19.99 CAD/month or $199.99 CAD/year)

**Features**:
- Everything in Premium
- Team collaboration (up to 5 members)
- API access
- Custom branding on reports
- Bulk property import
- Dedicated account manager
- Phone support

**Limits**:
- 50 photos per inspection
- Unlimited everything
- 5 team members

## User Workflows

### Tenant Move-In Workflow

```
1. Sign Up (Free)
   └─▶ Create account with email or Google

2. Add Property
   └─▶ Enter rental address and property type

3. Create Move-In Inspection
   └─▶ Select "New Inspection"
   └─▶ Set inspection date

4. Document Condition
   └─▶ Take photos of each room
   └─▶ Note any existing damage
   └─▶ Add captions to photos

5. Generate Report
   └─▶ Export as PDF
   └─▶ Share link with landlord

6. Save for Records
   └─▶ Inspection stored in account
   └─▶ Available for move-out comparison
```

### Landlord Review Workflow

```
1. Receive Share Link
   └─▶ Email or message with inspection link

2. View Inspection
   └─▶ No account required
   └─▶ Browse all photos and details

3. Download Report
   └─▶ Save PDF for records

4. (Optional) Create Account
   └─▶ Start own inspections
   └─▶ Upgrade for more features
```

### Property Manager Workflow

```
1. Sign Up (Pro)
   └─▶ Start 14-day trial
   └─▶ Or upgrade from Free

2. Bulk Import Properties
   └─▶ CSV upload with addresses
   └─▶ Or manual entry

3. Invite Team Members
   └─▶ Add up to 5 users
   └─▶ Assign properties

4. Conduct Inspections
   └─▶ Mobile app for field work
   └─▶ Dashboard for management

5. Generate Reports
   └─▶ Custom branding
   └─▶ Bulk export

6. API Integration
   └─▶ Connect to property management software
```

## Feature Comparison

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| Properties | 3 | Unlimited | Unlimited |
| Inspections | 5/property | Unlimited | Unlimited |
| Photos/Inspection | 20 | 50 | 50 |
| PDF Reports | 3/month | Unlimited | Unlimited |
| Storage | 100 MB | 1 GB | 5 GB |
| Comparison Reports | - | Yes | Yes |
| Share Links | Yes | Yes | Yes |
| Team Members | 1 | 1 | 5 |
| Custom Branding | - | - | Yes |
| API Access | - | - | Yes |
| Priority Support | - | Yes | Yes |
| Phone Support | - | - | Yes |
| Account Manager | - | - | Yes |

## Growth Strategy

### Acquisition Channels

1. **Organic Search**: SEO-optimized landing page
2. **App Store**: Expo-built apps on iOS/Android
3. **Referrals**: Share links expose brand to new users
4. **Content Marketing**: Blog posts on rental inspection tips

### Conversion Funnel

```
Landing Page Visit
    │
    ▼
Sign Up (Free)
    │
    ▼
Create First Inspection ──▶ Feature Discovery
    │
    ▼
Hit Free Tier Limit
    │
    ▼
Upgrade Prompt ──▶ 14-Day Trial
    │
    ▼
Paid Conversion
```

### Retention Mechanisms

1. **Recurring Need**: Inspections happen at lease boundaries
2. **Data Lock-in**: Photos and reports stored in platform
3. **Comparison Feature**: Value increases over time
4. **Annual Discount**: Encourages long-term commitment

## Analytics Events (Planned)

| Event | Trigger | Purpose |
|-------|---------|---------|
| `user_signed_up` | Account creation | Acquisition tracking |
| `property_created` | New property | Engagement |
| `inspection_started` | New inspection | Feature usage |
| `photo_captured` | Photo taken | Engagement depth |
| `report_generated` | PDF export | Feature value |
| `link_shared` | Share created | Viral coefficient |
| `trial_started` | Premium trial | Conversion funnel |
| `subscription_converted` | Paid signup | Revenue |
| `subscription_churned` | Cancellation | Retention analysis |

## Roadmap (Post-MVP)

### Version 2.0
- Photo annotations (draw on images)
- Voice notes for rooms
- Custom inspection checklists
- Multi-language support (French, Spanish)

### Version 3.0
- AI-powered damage detection
- Automated condition scoring
- Integration with property management software
- White-label solution for agencies

### Version 4.0
- Maintenance request tracking
- Tenant communication portal
- Insurance documentation
- Legal compliance templates

---

*See [PAYMENTS.md](./PAYMENTS.md) for detailed Stripe integration documentation.*
