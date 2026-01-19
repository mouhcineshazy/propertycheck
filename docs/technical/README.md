# PropertyCheck Technical Documentation

> Complete technical documentation for the PropertyCheck SaaS platform

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture Overview](./ARCHITECTURE.md) | System architecture, monorepo structure, and design decisions |
| [Business Features](./BUSINESS_FEATURES.md) | Product features, pricing plans, and user workflows |
| [API Reference](./API_REFERENCE.md) | REST API endpoints, authentication, and webhooks |
| [Database Schema](./DATABASE_SCHEMA.md) | Tables, relationships, RLS policies, and migrations |
| [Frontend Guide](./FRONTEND_GUIDE.md) | React components, animations, and styling system |
| [Mobile App Guide](./MOBILE_APP.md) | React Native/Expo architecture and native features |
| [Authentication](./AUTHENTICATION.md) | Auth flows, session management, and security |
| [Payments & Subscriptions](./PAYMENTS.md) | Stripe integration, plans, and webhook handling |
| [Deployment Guide](./DEPLOYMENT.md) | CI/CD, Netlify, and environment configuration |
| [Dependencies Reference](./DEPENDENCIES.md) | All libraries with documentation links |

## Quick Links

- **Web App**: `apps/web/` - Next.js 15 with App Router
- **Mobile App**: `apps/mobile/` - Expo React Native
- **Shared Packages**: `packages/` - Database client and shared utilities
- **Database Migrations**: `supabase/migrations/`

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend (Web) | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| Frontend (Mobile) | Expo 54, React Native 0.81, Expo Router |
| Backend | Next.js API Routes, Supabase Edge Functions |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth (Email + OAuth) |
| Payments | Stripe Subscriptions |
| Hosting | Netlify (Web), Expo EAS (Mobile) |
| Monorepo | Turborepo |

---

*Last updated: January 2026*
