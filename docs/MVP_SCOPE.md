# PropertyCheck MVP Scope

**Goal**: Validate market demand with minimal investment.
**Timeline**: 4 weeks, 15h/week
**Success Criteria**: 10 beta users, 2 paying customers

---

## Features IN SCOPE

### Authentication
- [x] Email/password sign up
- [x] Email/password login
- [x] Password reset flow
- [x] Session persistence

### Properties
- [x] Create property (address, type, notes)
- [x] List all properties
- [x] View property details
- [x] Edit property
- [x] Delete property
- [x] Property types: apartment, house, condo

### Inspections
- [x] Create inspection for a property
- [x] Add photos (minimum 1 required)
- [x] Add notes/comments
- [x] Save as draft
- [x] Mark as completed
- [x] List inspections per property

### Photos
- [x] Camera capture (mobile)
- [x] Gallery upload (mobile + web)
- [x] Photo preview
- [x] Delete photo before saving
- [x] Caption per photo (optional)

### PDF Reports
- [x] Generate basic PDF
- [x] Include: property address, inspection date
- [x] Include: all photos with captions
- [x] Include: notes
- [x] Download PDF

### Sharing
- [x] Generate public link
- [x] 7-day automatic expiry
- [x] View-only (no editing)
- [x] No authentication required to view

### Payments
- [x] Single plan: Premium $9.99 CAD/month
- [x] Stripe Checkout integration
- [x] Cancel subscription
- [x] Free tier limits: 2 properties, 5 inspections total

### Landing Page
- [x] Hero section with value proposition
- [x] Feature highlights (3-4 features)
- [x] Pricing section
- [x] Call-to-action buttons
- [x] Mobile responsive

---

## Features OUT OF SCOPE (V2+)

### Photo Enhancements
- [ ] ~~Draw annotations on photos~~
- [ ] ~~Add text overlays~~
- [ ] ~~Zoom/pan viewer~~

### Voice & Audio
- [ ] ~~Voice notes recording~~
- [ ] ~~Speech-to-text transcription~~

### Room Management
- [ ] ~~Custom room types~~
- [ ] ~~Custom checklists per room~~
- [ ] ~~Condition ratings (1-5 stars)~~
- [ ] ~~Predefined issues list~~

### Inspection Comparison
- [ ] ~~Side-by-side move-in vs move-out~~
- [ ] ~~Highlight differences~~
- [ ] ~~Damage assessment~~

### Collaboration
- [ ] ~~Team accounts~~
- [ ] ~~Role-based access~~
- [ ] ~~Activity logs~~
- [ ] ~~Comments/mentions~~

### Localization
- [ ] ~~French language~~
- [ ] ~~Other languages~~
- [ ] ~~Currency localization~~

### Authentication
- [ ] ~~Google Sign-In~~
- [ ] ~~Apple Sign-In~~
- [ ] ~~Magic link login~~

### Admin
- [ ] ~~Admin dashboard~~
- [ ] ~~User management~~
- [ ] ~~Analytics dashboard~~
- [ ] ~~Revenue reports~~

### Integrations
- [ ] ~~Property management software~~
- [ ] ~~Cloud storage (Dropbox, Drive)~~
- [ ] ~~Email notifications~~

---

## Technical Decisions

### Why These Choices?

| Decision | Rationale |
|----------|-----------|
| Supabase over Firebase | PostgreSQL = familiar SQL, better RLS, generous free tier |
| Expo over bare RN | Faster development, OTA updates, no native build complexity |
| Next.js over CRA | SSR for landing page SEO, API routes for webhooks |
| Turborepo over Nx | Simpler config, sufficient for 2 apps |
| Stripe over Paddle | Better docs, easier testing, Canada support |

### Limits (Free Tier Enforcement)

| Resource | Free Limit | Premium |
|----------|------------|---------|
| Properties | 2 | Unlimited |
| Inspections | 5 total | Unlimited |
| Photos per inspection | 20 | 50 |
| PDF exports | 3/month | Unlimited |
| Storage | 100MB | 1GB |

---

## Resist Temptation Checklist

Before adding ANY feature, ask:
1. Does it help get the first 10 users? NO = don't build it
2. Did a user specifically request it? NO = don't build it
3. Can we launch without it? YES = don't build it
4. Will it take more than 2 hours? YES = reconsider

**Remember**: The goal is to VALIDATE, not to build a perfect product.
A shipped MVP beats a perfect prototype every time.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-01-15 | Initial MVP scope defined |
