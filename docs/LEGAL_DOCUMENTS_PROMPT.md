# PropertyCheck Legal Documents Generation Guide

## Overview

This document provides comprehensive context about the PropertyCheck application and instructions for generating legally compliant Terms of Service, Privacy Policy, and other required legal documents for a Canadian SaaS application.

---

## Part 1: Application Context

### What is PropertyCheck?

PropertyCheck is a Software-as-a-Service (SaaS) application designed to help Canadian renters document the condition of rental properties through photo-based inspections. The app serves as a digital evidence collection tool to protect renters during move-in and move-out processes.

### Target Market

- **Primary Users**: Renters in Canada
- **Geographic Focus**: Canada only (currently Ontario, British Columbia, Alberta, Quebec)
- **User Demographics**: Tenants renting residential properties

### Core Functionality

#### 1. Property Management
- Users can add and manage multiple rental properties
- Properties include address, type (apartment, house, condo, townhouse), and notes
- Properties are linked to the user's account

#### 2. Inspection Documentation
- Create move-in, move-out, or routine inspections
- Capture timestamped photos of property conditions
- Organize photos by room (living room, bedroom, bathroom, kitchen, other)
- Add captions/notes to individual photos
- Photos include EXIF metadata (date, time, location when available)

#### 3. PDF Report Generation
- Generate professional inspection reports
- Reports include all documented photos with timestamps
- Province-specific legal disclaimers included
- Free tier: Reports include watermark and upgrade banner
- Premium tier: Clean, watermark-free professional reports

#### 4. Move-in vs Move-out Comparison
- Side-by-side comparison of property condition
- Helps identify changes/damages during tenancy
- Premium feature for generating comparison reports

#### 5. Province-Specific Legal Guidance
- Tailored information based on user's province
- References to relevant provincial tenancy legislation:
  - Ontario: Residential Tenancies Act, 2006
  - British Columbia: Residential Tenancy Act
  - Alberta: Residential Tenancies Act
  - Quebec: Civil Code of Québec (housing provisions)

### Subscription Tiers

#### Free Tier
- 1 property maximum
- 3 inspections maximum
- 30 photos per inspection
- PDF reports with watermark
- Basic features

#### Premium Tier ($9.99 CAD/month or $99.90 CAD/year)
- Unlimited properties
- Unlimited inspections
- Unlimited photos per inspection
- Professional PDF reports (no watermark)
- Move-in vs Move-out comparison reports
- Priority support
- Province-specific legal guidance

### Technical Infrastructure

#### Data Storage
- **Database**: Supabase (PostgreSQL) hosted in Canada/US
- **Photo Storage**: Supabase Storage (cloud-based)
- **Authentication**: Supabase Auth (email/password and Google OAuth)

#### Platforms
- **Web Application**: Next.js (accessible via browser)
- **Mobile Application**: React Native/Expo (iOS and Android)

#### Payment Processing
- **Provider**: Stripe
- **Supported Payment Methods**: Credit/debit cards
- **Billing**: Recurring monthly or annual subscriptions
- **Currency**: Canadian Dollars (CAD)

### Data Collected

#### User Account Data
- Email address
- Full name
- Province of residence
- Password (hashed, for email signup)
- Google account identifier (for Google SSO)

#### Property Data
- Property address
- Property type
- User notes

#### Inspection Data
- Inspection date and time
- Inspection type (move-in, move-out, routine)
- Status (draft, completed)
- General notes

#### Photo Data
- Photo images (stored in cloud)
- Photo metadata (timestamp, room type, caption)
- EXIF data when available (camera info, GPS if enabled)

#### Payment Data (handled by Stripe)
- Payment card details (stored by Stripe, not PropertyCheck)
- Billing history
- Subscription status

#### Technical/Analytics Data
- Device information
- App usage patterns
- Error logs

---

## Part 2: Canadian Legal Requirements

### Applicable Legislation

#### Federal Laws
1. **Personal Information Protection and Electronic Documents Act (PIPEDA)**
   - Governs collection, use, and disclosure of personal information
   - Requires meaningful consent
   - Applies to commercial activities

2. **Canada's Anti-Spam Legislation (CASL)**
   - Governs commercial electronic messages
   - Requires consent for marketing emails
   - Transactional emails (receipts, account info) are exempt

3. **Competition Act**
   - Prohibits false or misleading advertising
   - Requires clear pricing disclosure

#### Provincial Privacy Laws (where applicable)
- **Quebec**: Law 25 (Bill 64) - Stricter privacy requirements
- **British Columbia**: Personal Information Protection Act (PIPA)
- **Alberta**: Personal Information Protection Act (PIPA)

### Required Legal Documents

1. **Terms of Service / Terms of Use**
2. **Privacy Policy**
3. **Acceptable Use Policy** (can be part of Terms)
4. **Refund/Cancellation Policy**
5. **Cookie Policy** (if using cookies)

### Key Compliance Points

#### PIPEDA Compliance
- Clear disclosure of what data is collected
- Explanation of how data is used
- User consent mechanisms
- Data retention policies
- Right to access and correct personal information
- Data breach notification procedures
- Designated privacy officer/contact

#### Quebec Law 25 Compliance (Additional)
- Privacy impact assessments
- Data minimization
- Explicit consent requirements
- Cross-border data transfer disclosures
- Right to data portability
- Right to be forgotten

#### CASL Compliance
- Explicit opt-in for marketing emails
- Easy unsubscribe mechanism
- Clear sender identification
- Physical mailing address in emails

---

## Part 3: Legal Document Generation Prompt

### Instructions for AI/Legal Professional

Use the following prompt to generate the legal documents:

---

**PROMPT START**

Please generate comprehensive legal documents for PropertyCheck, a Canadian SaaS application. The documents must comply with PIPEDA, CASL, Quebec's Law 25, and provincial PIPA legislation in BC and Alberta.

### Application Details:
- **Company Name**: PropertyCheck
- **Website**: propertycheck.app
- **Support Email**: support@propertycheck.app
- **Business Location**: Canada
- **Service**: Mobile and web application for rental property inspection documentation

### Services Provided:
1. Photo-based property condition documentation
2. PDF inspection report generation
3. Cloud storage of photos and inspection data
4. Move-in/move-out comparison reports
5. Province-specific tenancy law information

### Subscription Pricing (CAD):
- Free tier: Limited features, no cost
- Premium Monthly: $9.99/month
- Premium Annual: $99.90/year (2 months free)

### Payment Processor:
- Stripe (PCI-DSS compliant)
- Recurring billing for subscriptions
- Stripe Customer Portal for self-service management

### Data Collected:
- Email, name, province (account info)
- Property addresses and details
- Photos of rental properties
- Inspection notes and timestamps
- Payment information (via Stripe)
- Device and usage analytics

### Data Storage:
- Supabase (PostgreSQL database)
- Cloud photo storage
- Data may be stored in US/Canada data centers
- Data encrypted at rest and in transit

### Third-Party Services:
- Supabase (authentication, database, storage)
- Stripe (payment processing)
- Resend (transactional emails)
- Google (OAuth authentication)

### Please Generate:

#### 1. Terms of Service
Include:
- Acceptance of terms
- Service description
- User eligibility (18+ or legal age in province)
- Account responsibilities
- Acceptable use policy
- Subscription terms and auto-renewal
- Payment terms (CAD pricing)
- Refund policy (pro-rated refunds, no refunds for partial months)
- Cancellation process
- Intellectual property rights
- User content license
- Service availability and uptime (no SLA guarantees for MVP)
- Limitation of liability
- Disclaimer (app is not legal advice)
- Indemnification
- Dispute resolution (arbitration or small claims in user's province)
- Governing law (laws of user's province)
- Modification of terms
- Termination
- Severability
- Contact information

#### 2. Privacy Policy
Include:
- Information collected and purposes
- Legal basis for processing
- How information is used
- Information sharing (third parties)
- Data retention periods
- Data security measures
- Cross-border data transfers
- User rights under PIPEDA and provincial laws
- Quebec-specific rights (Law 25)
- Children's privacy (not intended for under 18)
- Cookies and tracking technologies
- Marketing communications (CASL compliance)
- Data breach procedures
- Privacy officer contact
- Policy updates
- Last updated date

#### 3. Acceptable Use Policy (can be section in ToS)
Include:
- Prohibited content (illegal, harmful, fraudulent)
- No misrepresentation
- No automated access/scraping
- No interference with service
- Consequences of violations

#### 4. Refund Policy
Include:
- 7-day money-back guarantee for first-time subscribers
- Pro-rated refunds for annual plans cancelled within 30 days
- No refunds for partial months on monthly plans
- Process for requesting refunds
- Stripe handles refund processing

#### 5. Cookie Policy
Include:
- Essential cookies only (no advertising/tracking cookies)
- Authentication session cookies
- User preferences cookies
- How to manage cookies
- Third-party cookies (Stripe, Google OAuth if applicable)

### Legal Disclaimers to Include:

1. **Not Legal Advice**: PropertyCheck provides information about tenancy laws for educational purposes only. The app does not provide legal advice. Users should consult qualified legal professionals for legal matters.

2. **Evidence Limitations**: While PropertyCheck helps document property conditions, we cannot guarantee that inspection reports will be accepted as evidence by landlord-tenant boards, courts, or other authorities. The evidentiary value depends on various factors outside our control.

3. **Accuracy**: Province-specific legal information is provided as a general guide and may not reflect the most current legislation. Laws change frequently, and users should verify current requirements with official sources.

4. **Third-Party Services**: We use third-party services for payments, authentication, and data storage. Users are also bound by those services' terms and privacy policies.

### Format Requirements:

- Use clear, plain language (Grade 8 reading level)
- Include effective date and last updated date
- Use numbered sections with descriptive headings
- Include table of contents for documents over 2000 words
- Highlight important terms (liability limitations, auto-renewal)
- Include French translation consideration notice for Quebec users
- Documents should be provided in HTML format for web display
- Include provision for PDF download

### Specific Canadian Requirements:

1. **PIPEDA 10 Fair Information Principles**: Ensure all 10 principles are addressed in the Privacy Policy

2. **CASL Requirements**:
   - Explicit consent for commercial emails
   - Unsubscribe mechanism
   - Sender identification
   - Physical address

3. **Quebec Law 25**:
   - Privacy impact assessment mention
   - Data portability rights
   - Right to erasure
   - Consent withdrawal process

4. **Provincial Variations**:
   - Reference applicable provincial privacy legislation
   - Note that governing law follows user's province of residence

**PROMPT END**

---

## Part 4: Implementation Recommendations

### Display Options

#### Option A: Dedicated Legal Pages (Recommended for Canadian Compliance)
```
/terms - Terms of Service
/privacy - Privacy Policy
/cookies - Cookie Policy (optional, can be in Privacy)
```

**Pros:**
- Full text always accessible
- SEO-friendly
- Easy to update
- Required links can be placed in footer

**Cons:**
- Users rarely read full documents

#### Option B: Modal/Popup During Signup
- Show summary of key terms
- Link to full documents
- Checkbox for acceptance

**Recommendation**: Use both - dedicated pages with acceptance during signup.

### Required Placements

1. **Footer Links** (all pages):
   - Terms of Service
   - Privacy Policy

2. **Signup Flow**:
   - Checkbox: "I agree to the Terms of Service and Privacy Policy"
   - Links must open full documents

3. **Checkout Flow**:
   - Link to Terms showing subscription/refund policy
   - "By subscribing, you agree to recurring billing..."

4. **Settings Page**:
   - Link to manage data (PIPEDA compliance)
   - Link to download/delete data (Quebec Law 25)

5. **Email Footer**:
   - Physical mailing address (CASL)
   - Unsubscribe link for marketing emails

### Document Versioning

- Keep version history of all legal documents
- Display "Last Updated" date prominently
- Notify users of material changes via email
- Allow 30 days before new terms take effect (unless legally required sooner)

### French Language Requirements (Quebec)

Under Quebec's Charter of the French Language:
- Consumer contracts may need to be available in French
- Recommendation: Provide French translations for Quebec users
- At minimum: Notice that French version available upon request

### Record Keeping

Maintain records of:
- User consent timestamps
- Version of terms accepted
- Opt-in/opt-out for marketing
- Data access/deletion requests

---

## Part 5: Implementation Checklist

### Before Launch
- [ ] Terms of Service document created
- [ ] Privacy Policy document created
- [ ] Cookie Policy created (or integrated into Privacy)
- [ ] Refund Policy documented
- [ ] Legal pages added to website
- [ ] Footer links added to all pages
- [ ] Signup checkbox implemented
- [ ] Checkout terms disclosure added
- [ ] Email templates include required disclosures
- [ ] CASL-compliant email opt-in implemented
- [ ] Privacy contact email configured
- [ ] Data export functionality available
- [ ] Account deletion functionality available

### Post-Launch
- [ ] Monitor for legal requirement changes
- [ ] Respond to data access requests within 30 days
- [ ] Annual privacy policy review
- [ ] Document any data breaches
- [ ] Maintain consent records

---

## Part 6: Contact Information Template

Include in all legal documents:

```
PropertyCheck
Email: support@propertycheck.app
Privacy Inquiries: privacy@propertycheck.app

For Quebec residents:
Person responsible for the protection of personal information:
Email: privacy@propertycheck.app
```

---

## Notes for Legal Review

This document is intended as a starting point. Before launching:

1. **Have documents reviewed by a Canadian lawyer** specializing in technology/privacy law
2. **Consider Quebec-specific legal review** if targeting Quebec users
3. **Consult with a PIPEDA compliance specialist** for data handling procedures
4. **Review Stripe's compliance requirements** for payment terms
5. **Check provincial tenancy board requirements** for any disclaimers about evidence

---

*Document created: January 2026*
*For: PropertyCheck MVP Launch*
