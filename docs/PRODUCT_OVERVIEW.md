# PropertyCheck — Product & Business Overview

---

## What the App Does

PropertyCheck is a mobile-first app for Canadian renters that turns a phone into a professional property inspection tool. The core job: document the condition of a rental unit with timestamped photos, generate a PDF inspection report, and share it with the landlord — all in under 10 minutes.

The two moments that matter are **move-in** (before you unpack) and **move-out** (before you hand back the keys). Both create timestamped, photographic evidence of exactly what the property looked like. If a landlord later tries to charge for pre-existing damage, the tenant has a professional report to dispute it.

### Core workflow

1. **Walk through the property** — the app guides you room by room (kitchen, bathroom, bedroom, living room). You photograph each surface, appliance, and any visible damage. Each photo is automatically timestamped and geotagged.

2. **Add notes** — describe what you see. Pre-existing damage, condition of appliances, state of walls and floors.

3. **Generate a PDF report** — a professionally formatted report with all photos organized by room, timestamps, property address, and a legal disclaimer. On the free plan the report has a watermark; Premium removes it.

4. **Email to landlord** — one tap sends the PDF as an attachment directly to the landlord's inbox. No mail app, no link to click. The landlord receives a branded email with the full report attached. Premium users also get a QR code in the PDF that links to a live web view of the inspection.

### Web dashboard

The web app (`propertycheck.app`) is a companion dashboard for managing multiple properties and viewing inspection history. PDF generation is mobile-only (V1). The web serves as an acquisition surface (landing page, SEO) and account management tool (subscription, settings, data export).

---

## The Problem Being Solved

Every year, Canadian renters lose billions of dollars in damage deposit disputes. The average deposit is $1,500–$3,000 CAD depending on the province. In a dispute, it's the tenant's word against the landlord's — and without documentation, landlords win by default.

The existing solutions are all broken:

- **Taking photos on your phone** — disorganized, easy to dismiss in a dispute ("when were these taken? how do we know this is the same apartment?")
- **Writing a paper condition report** — landlords often don't countersign, copies get lost, no photos
- **Third-party inspection services** — cost $150–$300, require scheduling, overkill for most renters
- **Generic PDF tools** — technical, not built for this use case, no legal framing

PropertyCheck fixes all of this: automatic timestamps, location data, room-by-room structure, professional formatting, and a legal disclaimer that frames the document correctly for a tenancy tribunal.

### Provincial context (Canada)

Every province has its own residential tenancy legislation that governs how deposits work and what documentation is accepted in disputes:

- **Ontario** — Residential Tenancies Act 2006. Landlord-Tenant Board adjudicates. Deposits capped at one month's rent for last month only (no damage deposits in Ontario — security deposits are technically illegal, though "key deposits" exist).
- **British Columbia** — Residential Tenancy Act. BC RTB handles disputes. Damage deposits up to half a month's rent.
- **Alberta** — Residential Tenancies Act. Damage deposits up to one month's rent. Condition inspections are legally required at move-in and move-out.
- **Quebec** — Civil Code of Québec. No damage deposits allowed. Disputes go to the Tribunal administratif du logement.

The app generates reports with province-specific legal disclaimers and is aware of which provinces allow damage deposits vs. which don't.

---

## Who Uses This (Target Users)

### Primary: Young renters (25–35), urban, mobile-first

The core user is a 25–35 year old renting in a major Canadian city (Toronto, Vancouver, Calgary, Montreal). They're tech-comfortable, have rented before, and have either been burned by a deposit dispute or know someone who has. They live on their phone and expect apps to "just work."

**Key characteristics:**
- Rents are high — a $2,000 deposit in Toronto is 6 weeks of groceries. They care about getting it back.
- They move every 1–3 years (job changes, relationship changes, moving to a bigger place)
- They distrust landlords and are familiar with tenant rights from Reddit/TikTok
- They don't have money to hire a lawyer or an inspection service
- They want evidence, not advice

**Acquisition:** organic search ("move-in inspection checklist", "how to get deposit back Canada"), App Store search ("rental inspection"), social media (TikTok/Instagram content about tenant rights)

### Secondary: Frequent movers and remote workers

People who move often — remote workers relocating every 6–12 months, students moving between semesters, people in corporate housing. They do multiple inspections per year and are the most likely to upgrade to Premium (unlimited inspections).

### Secondary: Landlords and small-scale property managers

A landlord with 1–5 units who wants to document condition systematically before and after each tenant. They would pay Premium for the comparison report feature — seeing move-in vs. move-out side by side is exactly what they need to justify a deduction.

> This is a future segment, not the V1 focus. The branding and positioning currently skew toward tenants. A future "PropertyCheck for Landlords" angle (different onboarding, B2B pricing) is a V2/V3 consideration.

### Viral user: The landlord who receives the report

Every time a tenant emails a PDF to their landlord, the landlord opens a branded PropertyCheck report. They didn't ask for this, they don't have an account, but they just saw a professional product. The email footer says "Powered by PropertyCheck" with a link to the landing page. The PDF watermark on free reports says the same thing.

This is the secondary acquisition loop. A landlord who sees enough of these reports may sign up themselves, or recommend the app to their other tenants.

---

## Business Model

### Freemium SaaS, individual subscriptions

The app is free to download with a functional free tier. Revenue comes from Premium subscriptions.

### Free tier

Designed to be genuinely useful for a one-time renter — completing one full move-in and move-out inspection at one property:

- 1 property
- 2 inspections total (move-in + move-out)
- Basic PDF reports (watermarked)
- 50 MB photo storage
- No direct email to landlord (use your own mail app to share the PDF)

The free tier is the acquisition mechanism. A renter who moves in, documents the property, and then discovers they can't email the landlord cleanly without upgrading — that's the conversion moment.

### Premium tier — $9.99 CAD/month or $95.88 CAD/year ($7.99/month)

Designed for anyone who moves more than once or wants professional-grade documentation:

- Unlimited properties and inspections
- Direct email to landlord (one tap, PDF attached, branded email)
- Watermark-free PDF reports
- Comparison reports (move-in vs. move-out side by side)
- Unlimited cloud storage
- Priority email support

**Annual pricing saves 20%** — $95.88/year vs. $119.88/year monthly. Annual billing is pushed prominently because it's 3–4x better for retention and cash flow.

**14-day free trial** on Premium — no credit card friction at signup, trial starts on upgrade.

### Why this pricing works

- $9.99/month is less than 1% of the average Canadian monthly rent. The ROI conversation is easy: "this costs less than a pizza and could save your $2,000 deposit."
- Annual plan at $95.88 is an impulse buy — the psychological comparison to a $2,000 deposit makes it feel almost free.
- The comparison report is the premium anchor feature — it's the one thing you can't replicate by taking photos on your phone.

### Revenue model at scale

| Metric | Conservative | Target |
|---|---|---|
| Monthly free signups | 1,000 | 5,000 |
| Free → Premium conversion | 5% | 12% |
| Monthly subscribers | 50 | 600 |
| Average revenue per user | $8.50 (mix of monthly/annual) | $8.50 |
| Monthly recurring revenue | $425 | $5,100 |
| Annual run rate | $5,100 | $61,200 |

At 12% conversion (achievable with output-gated paywalls — the PDF email trigger is the key gate), 5,000 monthly signups produces ~$61K ARR. At 50,000 monthly signups, it's $610K ARR. The CAC is near-zero with organic acquisition.

The path to $100K+ MRR requires either a large organic user base (~60,000 monthly actives at 12% conversion) or a B2B pivot (property managers paying per-unit). The B2B angle is the more direct route to that scale.

---

## Competitive Landscape

| Product | Focus | Problem |
|---|---|---|
| **zInspector** | Property managers, US-focused | Expensive ($35–$75/month), built for professionals, overkill for renters |
| **Inventory Base** | UK landlords | Not in Canada, no French support, landlord-centric |
| **Move-in Buddy** | Renters | Low quality, no PDF, abandoned/unmaintained |
| **Paper condition reports** | Universal | No photos, no timestamps, landlords can dispute |
| **WhatsApp photos** | Universal | No structure, no legal framing, easily dismissed |

**PropertyCheck's moat:**
1. Only product built specifically for **Canadian** renters (provincial law awareness, CAD pricing, French language support)
2. Professional PDF output with legal disclaimer — not just a photo gallery
3. Email-to-landlord in one tap — lower friction than any alternative
4. Free tier that delivers real value — users don't have to pay to see the product work

---

## Compliance & Legal Posture

PropertyCheck stores sensitive legal evidence. The compliance posture is built in from day one:

- **PIPEDA** (federal) — users can export all their data and delete their account from Settings at any time
- **CASL** — marketing emails require explicit opt-in at signup. Transactional emails (receipts, trial reminders) do not require consent.
- **Quebec Law 25** — right to erasure and portability respected; privacy-by-design in all new features
- **PDF legal disclaimer** — every report states "For documentation purposes only. Not legal advice. Consult a qualified legal professional for tenancy disputes." This protects PropertyCheck from liability while keeping the reports useful as evidence.
- **Data retention** — inspection photos and reports are retained for as long as the account exists. On account deletion, all data is permanently erased from storage and the database.
- **Timestamps are immutable** — `created_at` on inspections and photos is set server-side and never updated. Tampering with timestamps would require database access, which creates an auditable trail.

---

## V1 Scope (What's Shipped)

- iOS and Android mobile app
- Web landing page + account dashboard
- Photo documentation with room categorization
- PDF report generation (mobile) with province-specific legal disclaimers
- Email report directly to landlord (with branded email + PDF attachment)
- Public share page for recipients (`/share/[token]`)
- Stripe subscription (monthly + annual Premium, 14-day trial)
- Bilingual: English and French (Canadian)
- Free tier limits enforced server-side (1 property, 2 inspections)
- Data export and account deletion (PIPEDA compliance)

## Not in V1 (Roadmap)

- **Web PDF generation** — currently mobile-only
- **Comparison reports on web** — comparison view exists on mobile; web dashboard shows inspection history only
- **B2B / property manager tier** — multi-property, multi-tenant management, team accounts
- **Landlord-side accounts** — landlords receiving reports can sign up and manage their portfolio
- **AI damage detection** — flag potential issues automatically from photos
- **Integration with provincial RTB filing systems** — submit documentation directly to the Landlord and Tenant Board
- **Pay-per-report** — one-time **$14.99 CAD** purchase for users who only need one clean PDF (implemented; sold via native IAP / RevenueCat)
