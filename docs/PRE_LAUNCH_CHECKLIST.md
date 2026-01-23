# PropertyCheck Pre-Launch Testing Checklist

This document outlines the testing scenarios required before launching PropertyCheck.

## 1. Free Tier Flow (2 Inspections)

### Test Case 1.1: First Inspection (Success)
- [ ] Create new account
- [ ] Complete onboarding (select province)
- [ ] Add first property
- [ ] Start first inspection (move-in)
- [ ] Take/upload photos
- [ ] Complete inspection
- [ ] Verify inspection counter shows "1 / 2 total"

### Test Case 1.2: Second Inspection (Success)
- [ ] Start second inspection on same property (move-out)
- [ ] Take/upload photos
- [ ] Complete inspection
- [ ] Verify inspection counter shows "2 / 2 total"
- [ ] Verify comparison report preview displays (watermarked for free tier)

### Test Case 1.3: Third Inspection (Blocked)
- [ ] Attempt to start third inspection
- [ ] Verify upgrade modal appears with message about multiple properties
- [ ] Modal should show province-specific messaging (if province selected)
- [ ] "Maybe Later" closes modal
- [ ] "Start 7-Day Free Trial" opens Stripe checkout

## 2. Comparison Report Preview

### Test Case 2.1: Free Tier Watermark
- [ ] After completing 2nd inspection, comparison report preview shows
- [ ] Report displays watermark "Upgrade to save permanently"
- [ ] CTA button leads to upgrade modal

### Test Case 2.2: Premium Clean Report
- [ ] With active premium subscription
- [ ] Comparison report displays without watermark
- [ ] Can download/share clean PDF

## 3. Shareable Links

### Test Case 3.1: Free Tier Share Attempt
- [ ] Try to share inspection from free tier
- [ ] Upgrade modal appears with "share_link" reason
- [ ] Shows message: "Premium: Send secure links landlords trust"
- [ ] If province selected, shows province-specific messaging

### Test Case 3.2: Premium Share Link
- [ ] With premium subscription, share inspection
- [ ] Shareable link generated successfully
- [ ] Link opens clean (non-watermarked) inspection view
- [ ] Link contains timestamp verification

## 4. Province Selector

### Test Case 4.1: New User Onboarding
- [ ] New user sees onboarding screen after registration
- [ ] Four provinces displayed: Ontario, BC, Alberta, Quebec
- [ ] Selecting province shows preview of legal info
- [ ] "Continue" saves province to user profile
- [ ] "Skip for now" allows bypassing

### Test Case 4.2: Province Stored Correctly
- [ ] After onboarding, check Settings screen
- [ ] Province displays correctly
- [ ] Upgrade modals show province-specific messaging

### Test Case 4.3: Province Not Set
- [ ] If skipped, Settings shows "Not set"
- [ ] Upgrade modals use generic messaging

## 5. Upgrade Modal Province Messaging

### Test Case 5.1: Ontario User
- [ ] Upgrade modal shows "per Residential Tenancies Act"
- [ ] References "Landlord and Tenant Board"

### Test Case 5.2: BC User
- [ ] References mandatory inspection requirements
- [ ] Mentions "Residential Tenancy Branch"

### Test Case 5.3: Alberta User
- [ ] References Alberta RTA requirements
- [ ] Mentions "RTDRS"

### Test Case 5.4: Quebec User
- [ ] References Civil Code
- [ ] Mentions "Tribunal administratif du logement"

## 6. Pricing Page Updates

### Test Case 6.1: Feature Order
- [ ] Premium features list starts with "Share secure timestamped links with landlords"
- [ ] "Legally defensible evidence for disputes" is second
- [ ] Unlimited properties/inspections come after

### Test Case 6.2: Free Tier Description
- [ ] Shows "2 inspections (move-in + move-out)"
- [ ] Shows limitations with X marks:
  - No shareable links
  - Watermarked comparison reports
  - No priority support

### Test Case 6.3: Pricing Consistency
- [ ] Monthly: $9.99/month
- [ ] Annual: $7.99/month (billed $95.88/year)
- [ ] Shows "Save 20%" badge for annual

## 7. Landing Page Case Studies

### Test Case 7.1: Section Displays
- [ ] "Renters Who Won Deposits Back" section visible
- [ ] Three case studies displayed (ON, BC, AB)
- [ ] Each shows:
  - Province badge
  - Amount saved
  - Dispute scenario
  - How PropertyCheck helped
  - Outcome
  - Anonymized quote
  - Dispute body reference

### Test Case 7.2: CTA Works
- [ ] "Protect Your Deposit Now" button links to signup

## 8. Province-Specific Legal Pages

### Test Case 8.1: Page Generation
- [ ] /legal/on loads Ontario page
- [ ] /legal/bc loads BC page
- [ ] /legal/ab loads Alberta page
- [ ] /legal/qc loads Quebec page

### Test Case 8.2: Content Accuracy
- [ ] Each page shows correct:
  - Tenancy Act name
  - Regulatory body (with link)
  - Dispute body (with link)
  - Inspection requirements
  - Legal highlights
  - PropertyCheck benefits

### Test Case 8.3: Navigation
- [ ] "Other Provinces" links work
- [ ] CTA "Get Started Free" links to signup

## 9. Mobile Onboarding Flow

### Test Case 9.1: New User Journey
1. [ ] Register with email/password or Google
2. [ ] Redirected to onboarding (province selector)
3. [ ] Select province → Continue
4. [ ] Lands on main dashboard
5. [ ] First-time guidance/tooltip shows

### Test Case 9.2: Skip Onboarding
1. [ ] Register
2. [ ] Click "Skip for now"
3. [ ] Lands on dashboard without province set
4. [ ] Province shows as "Not set" in Settings

## 10. Stripe Integration

### Test Case 10.1: Checkout Flow
- [ ] Monthly checkout creates correct subscription
- [ ] Annual checkout creates correct subscription
- [ ] 7-day trial is applied

### Test Case 10.2: Webhook Events
- [ ] checkout.session.completed updates user to premium
- [ ] customer.subscription.updated handles plan changes
- [ ] customer.subscription.deleted handles cancellations

### Test Case 10.3: Billing Portal
- [ ] "Manage Subscription" opens Stripe portal
- [ ] Can change payment method
- [ ] Can cancel subscription

## 11. Database Migrations

### Required Schema Updates
- [ ] users.province column added (VARCHAR, nullable)
- [ ] users.onboarding_completed column added (BOOLEAN, default false)
- [ ] check_free_tier_limits function updated for 2 inspection limit

## 12. Environment Variables

### Web App (.env)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set
- [ ] STRIPE_SECRET_KEY set
- [ ] STRIPE_WEBHOOK_SECRET set
- [ ] NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID set
- [ ] NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID set

### Mobile App (.env)
- [ ] EXPO_PUBLIC_APP_URL set correctly
- [ ] Supabase keys configured

---

## Sign-off

| Test Category | Tester | Date | Status |
|---------------|--------|------|--------|
| Free Tier Flow | | | |
| Comparison Report | | | |
| Shareable Links | | | |
| Province Selector | | | |
| Upgrade Modal | | | |
| Pricing Page | | | |
| Case Studies | | | |
| Legal Pages | | | |
| Mobile Onboarding | | | |
| Stripe Integration | | | |
| Database | | | |
| Environment | | | |

**Launch Approval:** ___________________ Date: ___________
