import type { Config } from 'tailwindcss';

/**
 * PropertyCheck — "Trust Ink" design system.
 *
 * Two kinds of color tokens live here on purpose:
 *  1. Static scales (ink / primary / verified / amber) — fixed brand ramps.
 *  2. Semantic tokens (canvas / card / fg / line) — mapped to CSS variables in
 *     globals.css so a dark theme can be enabled later by flipping the vars,
 *     without touching component markup.
 *
 * New tokens are additive: default Tailwind gray/white utilities still work,
 * so screens not yet migrated to the new system keep rendering correctly.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic, theme-switchable (see :root in globals.css)
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          muted: 'rgb(var(--card-muted) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong: 'rgb(var(--line-strong) / <alpha-value>)',
        },

        // Ink — cool navy-tinted neutral ramp (text, nav, surfaces)
        ink: {
          50: '#F2F4F8',
          100: '#E6E9EF',
          200: '#D3DAE4',
          300: '#AEB9C9',
          400: '#8695AB',
          500: '#63748D',
          600: '#45566E',
          700: '#2C3B52',
          800: '#1C2A3E',
          900: '#0F1B2D',
          950: '#0B1524',
        },

        // Primary — brand indigo (trust, security, premium). 600 = #4F46E5.
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },

        // Verified — the "protected / documented" success signal (emerald). 500 = #10B981.
        verified: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },

        // Amber — plan limits / warnings
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Tightened display sizes with baked-in line-height + tracking
        'display-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Soft, layered elevation tuned for light ink-tinted surfaces
        xs: '0 1px 2px 0 rgb(11 21 36 / 0.04)',
        sm: '0 1px 3px 0 rgb(11 21 36 / 0.06), 0 1px 2px -1px rgb(11 21 36 / 0.05)',
        DEFAULT: '0 2px 8px -2px rgb(11 21 36 / 0.08), 0 1px 3px -1px rgb(11 21 36 / 0.05)',
        md: '0 8px 24px -6px rgb(11 21 36 / 0.10), 0 3px 8px -4px rgb(11 21 36 / 0.06)',
        lg: '0 20px 40px -12px rgb(11 21 36 / 0.14), 0 6px 14px -8px rgb(11 21 36 / 0.08)',
        xl: '0 32px 64px -16px rgb(11 21 36 / 0.20)',
        'primary': '0 8px 24px -6px rgb(79 70 229 / 0.35)',
        'primary-lg': '0 16px 40px -10px rgb(79 70 229 / 0.45)',
        'focus': '0 0 0 4px rgb(79 70 229 / 0.15)',
      },
      backgroundImage: {
        'grid-ink':
          'linear-gradient(to right, rgb(15 27 45 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 27 45 / 0.04) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.25,0.1,0.25,1) forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.25,0.1,0.25,1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.25,0.1,0.25,1) forwards',
        'shimmer': 'shimmer 1.6s linear infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;