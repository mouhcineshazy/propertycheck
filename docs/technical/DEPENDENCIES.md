# Dependencies Reference

Complete list of all dependencies used in PropertyCheck with documentation links.

## Table of Contents

- [Core Frameworks](#core-frameworks)
- [React Ecosystem](#react-ecosystem)
- [Backend & Database](#backend--database)
- [Payments](#payments)
- [UI & Styling](#ui--styling)
- [Mobile (React Native)](#mobile-react-native)
- [Validation & Utilities](#validation--utilities)
- [Build Tools](#build-tools)
- [Development Tools](#development-tools)

---

## Core Frameworks

### Next.js

**Version**: 15.1.11
**Purpose**: React meta-framework for web application

| Resource | Link |
|----------|------|
| Documentation | https://nextjs.org/docs |
| App Router Guide | https://nextjs.org/docs/app |
| API Routes | https://nextjs.org/docs/app/building-your-application/routing/route-handlers |
| Middleware | https://nextjs.org/docs/app/building-your-application/routing/middleware |
| Image Optimization | https://nextjs.org/docs/app/building-your-application/optimizing/images |
| GitHub | https://github.com/vercel/next.js |

### React

**Version**: 19.0.0
**Purpose**: UI component library

| Resource | Link |
|----------|------|
| Documentation | https://react.dev |
| Hooks Reference | https://react.dev/reference/react/hooks |
| Server Components | https://react.dev/reference/rsc/server-components |
| Suspense | https://react.dev/reference/react/Suspense |
| GitHub | https://github.com/facebook/react |

### Expo

**Version**: 54.0.0
**Purpose**: React Native development platform

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev |
| Expo Router | https://docs.expo.dev/router/introduction |
| EAS Build | https://docs.expo.dev/build/introduction |
| EAS Submit | https://docs.expo.dev/submit/introduction |
| SDK Reference | https://docs.expo.dev/versions/latest |
| GitHub | https://github.com/expo/expo |

### React Native

**Version**: 0.81.5
**Purpose**: Mobile UI framework

| Resource | Link |
|----------|------|
| Documentation | https://reactnative.dev/docs/getting-started |
| Components | https://reactnative.dev/docs/components-and-apis |
| APIs | https://reactnative.dev/docs/accessibilityinfo |
| GitHub | https://github.com/facebook/react-native |

---

## React Ecosystem

### React DOM

**Version**: 19.0.0
**Purpose**: React renderer for web

| Resource | Link |
|----------|------|
| Documentation | https://react.dev/reference/react-dom |
| Client APIs | https://react.dev/reference/react-dom/client |

### React Native Web

**Version**: 0.21.0
**Purpose**: React Native components for web

| Resource | Link |
|----------|------|
| Documentation | https://necolas.github.io/react-native-web/docs |
| GitHub | https://github.com/necolas/react-native-web |

---

## Backend & Database

### Supabase

**Packages**: `@supabase/supabase-js` (2.39.0), `@supabase/ssr` (0.1.0)
**Purpose**: Backend-as-a-Service (PostgreSQL, Auth, Storage)

| Resource | Link |
|----------|------|
| Documentation | https://supabase.com/docs |
| JavaScript Client | https://supabase.com/docs/reference/javascript |
| Auth | https://supabase.com/docs/guides/auth |
| Database | https://supabase.com/docs/guides/database |
| Storage | https://supabase.com/docs/guides/storage |
| Row Level Security | https://supabase.com/docs/guides/auth/row-level-security |
| SSR Guide | https://supabase.com/docs/guides/auth/server-side |
| TypeScript Types | https://supabase.com/docs/reference/javascript/typescript-support |
| GitHub | https://github.com/supabase/supabase-js |

### PostgreSQL

**Purpose**: Relational database (via Supabase)

| Resource | Link |
|----------|------|
| Documentation | https://www.postgresql.org/docs |
| SQL Reference | https://www.postgresql.org/docs/current/sql.html |
| Functions | https://www.postgresql.org/docs/current/functions.html |

---

## Payments

### Stripe

**Packages**: `stripe` (14.25.0), `@stripe/stripe-js` (8.6.1)
**Purpose**: Payment processing

| Resource | Link |
|----------|------|
| Documentation | https://stripe.com/docs |
| API Reference | https://stripe.com/docs/api |
| Node.js SDK | https://stripe.com/docs/api?lang=node |
| Stripe.js | https://stripe.com/docs/js |
| Checkout Sessions | https://stripe.com/docs/api/checkout/sessions |
| Subscriptions | https://stripe.com/docs/billing/subscriptions/overview |
| Webhooks | https://stripe.com/docs/webhooks |
| Testing | https://stripe.com/docs/testing |
| GitHub (Node) | https://github.com/stripe/stripe-node |
| GitHub (JS) | https://github.com/stripe/stripe-js |

---

## UI & Styling

### Tailwind CSS

**Version**: 3.4.1
**Purpose**: Utility-first CSS framework

| Resource | Link |
|----------|------|
| Documentation | https://tailwindcss.com/docs |
| Configuration | https://tailwindcss.com/docs/configuration |
| Utility Classes | https://tailwindcss.com/docs/utility-first |
| Responsive Design | https://tailwindcss.com/docs/responsive-design |
| Dark Mode | https://tailwindcss.com/docs/dark-mode |
| GitHub | https://github.com/tailwindlabs/tailwindcss |

### Framer Motion

**Version**: 12.26.2
**Purpose**: Animation library for React

| Resource | Link |
|----------|------|
| Documentation | https://www.framer.com/motion |
| Animation | https://www.framer.com/motion/animation |
| Gestures | https://www.framer.com/motion/gestures |
| Variants | https://www.framer.com/motion/animation#variants |
| Layout Animations | https://www.framer.com/motion/layout-animations |
| Transition | https://www.framer.com/motion/transition |
| GitHub | https://github.com/framer/motion |

### clsx

**Version**: 2.1.1
**Purpose**: Conditional className utility

| Resource | Link |
|----------|------|
| Documentation | https://github.com/lukeed/clsx#readme |
| GitHub | https://github.com/lukeed/clsx |

### Canvas Confetti

**Version**: 1.9.4
**Purpose**: Confetti animations

| Resource | Link |
|----------|------|
| Documentation | https://github.com/catdad/canvas-confetti#readme |
| GitHub | https://github.com/catdad/canvas-confetti |

---

## Mobile (React Native)

### Expo Camera

**Version**: 17.0.10
**Purpose**: Camera access for photo capture

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/camera |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-camera |

### Expo Image Picker

**Version**: 17.0.10
**Purpose**: Photo gallery access

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/imagepicker |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-image-picker |

### Expo File System

**Version**: 18.1.0
**Purpose**: File system operations

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/filesystem |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-file-system |

### Expo Secure Store

**Version**: 15.0.0
**Purpose**: Secure credential storage

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/securestore |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-secure-store |

### Expo Sharing

**Version**: 13.1.0
**Purpose**: Share to other apps

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/sharing |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-sharing |

### Expo Print

**Version**: 14.1.0
**Purpose**: PDF generation and printing

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/print |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-print |

### Expo Mail Composer

**Version**: 14.1.0
**Purpose**: Email composition

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/versions/latest/sdk/mailcomposer |
| GitHub | https://github.com/expo/expo/tree/main/packages/expo-mail-composer |

### React Native SVG

**Version**: 15.15.1
**Purpose**: SVG rendering in React Native

| Resource | Link |
|----------|------|
| Documentation | https://github.com/software-mansion/react-native-svg#readme |
| GitHub | https://github.com/software-mansion/react-native-svg |

### React Native Screens

**Version**: 4.16.0
**Purpose**: Native navigation primitives

| Resource | Link |
|----------|------|
| Documentation | https://github.com/software-mansion/react-native-screens#readme |
| GitHub | https://github.com/software-mansion/react-native-screens |

### React Native Safe Area Context

**Version**: 5.6.0
**Purpose**: Safe area handling for notches

| Resource | Link |
|----------|------|
| Documentation | https://github.com/th3rdwave/react-native-safe-area-context#readme |
| GitHub | https://github.com/th3rdwave/react-native-safe-area-context |

### Expo Vector Icons

**Version**: 15.0.3
**Purpose**: Icon library (Ionicons, MaterialIcons, etc.)

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/guides/icons |
| Icon Directory | https://icons.expo.fyi |
| GitHub | https://github.com/expo/vector-icons |

### date-fns

**Version**: 3.6.0
**Purpose**: Date utility library

| Resource | Link |
|----------|------|
| Documentation | https://date-fns.org/docs |
| API Reference | https://date-fns.org/docs/Getting-Started |
| GitHub | https://github.com/date-fns/date-fns |

### base64-arraybuffer

**Version**: 1.0.2
**Purpose**: Base64 encoding/decoding for binary data

| Resource | Link |
|----------|------|
| Documentation | https://github.com/nicklockwood/base64-arraybuffer#readme |
| GitHub | https://github.com/nicklockwood/base64-arraybuffer |

---

## Validation & Utilities

### Zod

**Version**: 3.22.4
**Purpose**: TypeScript-first schema validation

| Resource | Link |
|----------|------|
| Documentation | https://zod.dev |
| Basic Usage | https://zod.dev/?id=basic-usage |
| Primitives | https://zod.dev/?id=primitives |
| Objects | https://zod.dev/?id=objects |
| Error Handling | https://zod.dev/?id=error-handling |
| GitHub | https://github.com/colinhacks/zod |

### React Intersection Observer

**Version**: 10.0.2
**Purpose**: Viewport visibility detection (scroll animations)

| Resource | Link |
|----------|------|
| Documentation | https://github.com/thebuilder/react-intersection-observer#readme |
| Storybook | https://react-intersection-observer.vercel.app |
| GitHub | https://github.com/thebuilder/react-intersection-observer |

---

## Build Tools

### Turborepo

**Version**: 2.0.0
**Purpose**: Monorepo build system

| Resource | Link |
|----------|------|
| Documentation | https://turbo.build/repo/docs |
| Getting Started | https://turbo.build/repo/docs/getting-started |
| Configuration | https://turbo.build/repo/docs/reference/configuration |
| Caching | https://turbo.build/repo/docs/core-concepts/caching |
| GitHub | https://github.com/vercel/turborepo |

### TypeScript

**Version**: 5.3.3
**Purpose**: Static type checking

| Resource | Link |
|----------|------|
| Documentation | https://www.typescriptlang.org/docs |
| Handbook | https://www.typescriptlang.org/docs/handbook |
| tsconfig Reference | https://www.typescriptlang.org/tsconfig |
| GitHub | https://github.com/microsoft/TypeScript |

### PostCSS

**Version**: 8.4.33
**Purpose**: CSS processing

| Resource | Link |
|----------|------|
| Documentation | https://postcss.org |
| Plugins | https://www.postcss.parts |
| GitHub | https://github.com/postcss/postcss |

### Autoprefixer

**Version**: 10.4.17
**Purpose**: CSS vendor prefixes

| Resource | Link |
|----------|------|
| Documentation | https://github.com/postcss/autoprefixer#readme |
| GitHub | https://github.com/postcss/autoprefixer |

---

## Development Tools

### ESLint

**Version**: 9.0.0
**Purpose**: JavaScript/TypeScript linting

| Resource | Link |
|----------|------|
| Documentation | https://eslint.org/docs |
| Rules | https://eslint.org/docs/rules |
| Configuration | https://eslint.org/docs/user-guide/configuring |
| GitHub | https://github.com/eslint/eslint |

### eslint-config-next

**Version**: 15.1.11
**Purpose**: Next.js ESLint configuration

| Resource | Link |
|----------|------|
| Documentation | https://nextjs.org/docs/basic-features/eslint |
| GitHub | https://github.com/vercel/next.js/tree/canary/packages/eslint-config-next |

### Babel

**Version**: 7.24.0
**Purpose**: JavaScript transpiler (React Native)

| Resource | Link |
|----------|------|
| Documentation | https://babeljs.io/docs |
| Presets | https://babeljs.io/docs/presets |
| Plugins | https://babeljs.io/docs/plugins |
| GitHub | https://github.com/babel/babel |

### dotenv

**Version**: 16.4.7
**Purpose**: Environment variable loading

| Resource | Link |
|----------|------|
| Documentation | https://github.com/motdotla/dotenv#readme |
| GitHub | https://github.com/motdotla/dotenv |

---

## CLI Tools

### Netlify CLI

**Purpose**: Netlify deployment and management

| Resource | Link |
|----------|------|
| Documentation | https://docs.netlify.com/cli/get-started |
| Commands | https://cli.netlify.com |
| GitHub | https://github.com/netlify/cli |

### Supabase CLI

**Purpose**: Supabase local development and migrations

| Resource | Link |
|----------|------|
| Documentation | https://supabase.com/docs/guides/cli |
| Commands | https://supabase.com/docs/reference/cli |
| GitHub | https://github.com/supabase/cli |

### Stripe CLI

**Purpose**: Stripe webhook testing and management

| Resource | Link |
|----------|------|
| Documentation | https://stripe.com/docs/stripe-cli |
| Commands | https://stripe.com/docs/stripe-cli/overview |
| GitHub | https://github.com/stripe/stripe-cli |

### EAS CLI

**Purpose**: Expo Application Services

| Resource | Link |
|----------|------|
| Documentation | https://docs.expo.dev/eas |
| Commands | https://docs.expo.dev/build/eas-json |
| GitHub | https://github.com/expo/eas-cli |

---

## Additional Resources

### General

| Resource | Link |
|----------|------|
| npm | https://www.npmjs.com |
| Node.js | https://nodejs.org/docs |
| MDN Web Docs | https://developer.mozilla.org |

### Design

| Resource | Link |
|----------|------|
| Heroicons | https://heroicons.com |
| Tailwind UI | https://tailwindui.com |
| Headless UI | https://headlessui.com |

### Learning

| Resource | Link |
|----------|------|
| Next.js Learn | https://nextjs.org/learn |
| Expo Tutorial | https://docs.expo.dev/tutorial/introduction |
| Supabase Guides | https://supabase.com/docs/guides |

---

*Last updated: January 2026*
