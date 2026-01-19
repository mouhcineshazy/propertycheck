# Frontend Guide

## Overview

The PropertyCheck web application is built with Next.js 15 using the App Router, React 19, Tailwind CSS, and Framer Motion for animations.

## Project Structure

```
apps/web/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/            # Dashboard route group
│   │   └── dashboard/
│   │       ├── inspections/
│   │       ├── properties/
│   │       ├── reports/
│   │       └── settings/
│   ├── api/                    # API routes
│   │   └── stripe/
│   ├── auth/                   # Auth callbacks
│   ├── checkout/               # Checkout pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
│
├── components/
│   ├── landing/                # Landing page sections
│   │   ├── Navigation.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   └── ui/                     # Reusable UI components
│       ├── AnimatedSection.tsx
│       ├── GradientCard.tsx
│       └── Logo.tsx
│
├── lib/
│   ├── stripe/
│   │   └── config.ts           # Stripe client & plans
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Session middleware
│   └── utils.ts                # Utility functions
│
├── middleware.ts               # Next.js middleware
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## Routing

### Route Groups

Route groups organize pages without affecting the URL structure:

```
(auth)/         # Auth pages with minimal layout
(dashboard)/    # Dashboard pages with sidebar layout
```

### Page Structure

Each page follows this pattern:

```typescript
// app/(auth)/login/page.tsx
'use client';

import { Suspense } from 'react';

function LoginContent() {
  // Component using useSearchParams
}

function LoginFallback() {
  // Loading state
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
```

**Important**: Next.js 15 requires `useSearchParams()` to be wrapped in a Suspense boundary for static generation.

## Components

### AnimatedSection

Scroll-triggered animation wrapper using Framer Motion and Intersection Observer.

```typescript
// components/ui/AnimatedSection.tsx
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'none';
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

export function AnimatedSection({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold,
  });

  const animations = {
    fadeUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
    fadeDown: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
    fadeLeft: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
    fadeRight: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
    none: { hidden: {}, visible: {} },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={animations[animation]}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Usage**:
```tsx
<AnimatedSection animation="fadeUp" delay={0.2}>
  <h2>Features</h2>
</AnimatedSection>
```

### GradientCard

Premium card component with gradient backgrounds and hover effects.

```typescript
// components/ui/GradientCard.tsx
import { motion } from 'framer-motion';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'primary' | 'secondary' | 'accent' | 'none';
  hoverLift?: number;
  glowOnHover?: boolean;
  disableAnimation?: boolean;
}

export function GradientCard({
  children,
  className = '',
  gradient = 'none',
  hoverLift = 4,
  glowOnHover = false,
  disableAnimation = false,
}: GradientCardProps) {
  const gradients = {
    primary: 'bg-gradient-to-br from-primary-50 to-primary-100',
    secondary: 'bg-gradient-to-br from-gray-50 to-gray-100',
    accent: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    none: 'bg-white',
  };

  const hoverAnimation = disableAnimation
    ? {}
    : {
        whileHover: { y: -hoverLift },
        transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
      };

  return (
    <motion.div
      className={`rounded-2xl border border-gray-200 shadow-sm ${gradients[gradient]} ${className}`}
      {...hoverAnimation}
    >
      {children}
    </motion.div>
  );
}
```

### Logo

Shield logo with house silhouette and checkmark.

```typescript
// components/ui/Logo.tsx
interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Logo({ size = 40, color = 'currentColor', className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      {/* Shield path */}
      <path
        d="M20 2L4 8v12c0 9.33 6.67 16 16 18 9.33-2 16-8.67 16-18V8L20 2z"
        fill={color}
      />
      {/* House silhouette */}
      <path
        d="M20 10l-8 6v10h5v-6h6v6h5V16l-8-6z"
        fill="white"
      />
      {/* Checkmark */}
      <path
        d="M15 22l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

## Styling

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(37, 99, 235, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-white text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold
           hover:bg-primary-700 transition-colors shadow-lg
           shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30;
  }

  .btn-secondary {
    @apply bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold
           border-2 border-gray-200 hover:bg-gray-50
           hover:border-gray-300 transition-colors;
  }

  .input-field {
    @apply w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl
           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
           transition-all text-gray-900 placeholder:text-gray-400;
  }

  .card {
    @apply bg-white rounded-2xl border border-gray-200 shadow-sm;
  }
}
```

## Animation Patterns

### Framer Motion Variants

```typescript
import { type Variants } from 'framer-motion';

// Container with staggered children
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// Individual item animation
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Error/success message
const messageVariants: Variants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
    transition: { duration: 0.2 },
  },
};

// Floating decoration
const floatVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: [0.45, 0.05, 0.55, 0.95],
    },
  },
};
```

**Note**: Use cubic bezier arrays `[0.25, 0.1, 0.25, 1]` instead of string values like `'easeOut'` for Framer Motion ease properties (TypeScript requirement).

### Usage Example

```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.h1 variants={itemVariants}>Title</motion.h1>
  <motion.p variants={itemVariants}>Description</motion.p>
  <motion.button variants={itemVariants}>CTA</motion.button>
</motion.div>
```

## State Management

### Authentication State

```typescript
// Using Supabase client
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

### Form State

```typescript
// Simple form state with React
const [formState, setFormState] = useState({
  email: '',
  password: '',
  isLoading: false,
  error: null as string | null,
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormState(s => ({ ...s, isLoading: true, error: null }));

  try {
    // Submit logic
  } catch (err) {
    setFormState(s => ({
      ...s,
      error: err instanceof Error ? err.message : 'Unknown error',
    }));
  } finally {
    setFormState(s => ({ ...s, isLoading: false }));
  }
};
```

## Utility Functions

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';

// Conditional class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format currency
export function formatCurrency(amount: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
```

## Performance Best Practices

1. **Image Optimization**: Use Next.js `<Image>` component
2. **Code Splitting**: Components are lazy-loaded by route
3. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
4. **Suspense**: Wrap dynamic content in Suspense boundaries
5. **Static Generation**: Landing page is pre-rendered at build time

```tsx
// Lazy loading a heavy component
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./Chart'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded" />,
  ssr: false,
});
```

---

*See [MOBILE_APP.md](./MOBILE_APP.md) for React Native component patterns.*
