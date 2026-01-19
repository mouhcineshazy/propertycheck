'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Predefined gradient themes
const gradientThemes = {
  primary: 'from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/10',
  blue: 'from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/10',
  violet: 'from-violet-500/0 to-purple-600/0 group-hover:from-violet-500/5 group-hover:to-purple-600/10',
  emerald: 'from-emerald-500/0 to-teal-600/0 group-hover:from-emerald-500/5 group-hover:to-teal-600/10',
  amber: 'from-amber-500/0 to-orange-600/0 group-hover:from-amber-500/5 group-hover:to-orange-600/10',
  rose: 'from-rose-500/0 to-pink-600/0 group-hover:from-rose-500/5 group-hover:to-pink-600/10',
  gray: 'from-gray-500/0 to-gray-600/0 group-hover:from-gray-500/5 group-hover:to-gray-600/10',
} as const;

type GradientTheme = keyof typeof gradientThemes;

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  // Animation timing
  delay?: number;
  // Gradient theme
  theme?: GradientTheme;
  // Custom gradient (overrides theme)
  gradient?: string;
  // Hover effect intensity
  hoverLift?: number;
  // Disable animations (for static use)
  disableAnimation?: boolean;
  // Click handler
  onClick?: () => void;
  // HTML element to render
  as?: 'div' | 'article' | 'section' | 'button' | 'a';
  // Additional props for link/button variants
  href?: string;
}

/**
 * GradientCard - Premium card component with gradient hover effect
 *
 * Features:
 * - Subtle gradient overlay on hover
 * - Smooth lift animation
 * - Shadow transition
 * - Entrance animation
 *
 * @example
 * // Basic usage
 * <GradientCard>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </GradientCard>
 *
 * @example
 * // With custom theme and delay
 * <GradientCard theme="violet" delay={0.2}>
 *   <PricingPlan />
 * </GradientCard>
 *
 * @example
 * // As clickable card
 * <GradientCard as="button" onClick={handleClick}>
 *   <FeatureItem />
 * </GradientCard>
 */
export function GradientCard({
  children,
  className = '',
  delay = 0,
  theme = 'primary',
  gradient,
  hoverLift = 8,
  disableAnimation = false,
  onClick,
  as = 'div',
  href,
}: GradientCardProps) {
  // Use custom gradient or theme gradient
  const gradientClass = gradient || gradientThemes[theme];

  // Animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Hover animation config
  const hoverAnimation = disableAnimation
    ? {}
    : {
        whileHover: { y: -hoverLift },
        transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
      };

  // Determine the motion component based on 'as' prop
  // For 'a' elements, we'll use 'div' with an inner anchor for Next.js Link compatibility
  const MotionComponent = as === 'a' ? motion.div : motion[as];

  const cardContent = (
    <>
      {/* Gradient overlay - appears on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-all duration-300 rounded-2xl`}
        aria-hidden="true"
      />

      {/* Card content */}
      <div className="relative z-10">{children}</div>
    </>
  );

  const baseClassName = `
    relative group bg-white rounded-2xl shadow-lg border border-gray-100
    hover:shadow-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <MotionComponent
      className={baseClassName}
      initial={disableAnimation ? undefined : 'hidden'}
      animate={disableAnimation ? undefined : 'visible'}
      variants={disableAnimation ? undefined : cardVariants}
      onClick={onClick}
      {...hoverAnimation}
    >
      {href ? (
        <a href={href} className="block">
          {cardContent}
        </a>
      ) : (
        cardContent
      )}
    </MotionComponent>
  );
}

interface GradientCardHeaderProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

/**
 * GradientCardHeader - Header section with gradient background
 */
export function GradientCardHeader({
  children,
  className = '',
  gradient = 'from-primary-600 via-primary-700 to-blue-700',
}: GradientCardHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} p-6 text-white ${className}`}>
      {children}
    </div>
  );
}

interface GradientCardBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * GradientCardBody - Body section with standard padding
 */
export function GradientCardBody({ children, className = '' }: GradientCardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface GradientCardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * GradientCardFooter - Footer section with top border
 */
export function GradientCardFooter({ children, className = '' }: GradientCardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 ${className}`}>
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  theme?: GradientTheme;
}

/**
 * FeatureCard - Predefined card layout for feature sections
 */
export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  theme = 'primary',
}: FeatureCardProps) {
  return (
    <GradientCard delay={delay} theme={theme} className="p-6">
      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </GradientCard>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  onCtaClick: () => void;
  popular?: boolean;
  delay?: number;
}

/**
 * PricingCard - Predefined card layout for pricing sections
 */
export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaText,
  onCtaClick,
  popular = false,
  delay = 0,
}: PricingCardProps) {
  return (
    <GradientCard
      delay={delay}
      theme={popular ? 'violet' : 'primary'}
      className={popular ? 'ring-2 ring-violet-500 shadow-xl' : ''}
    >
      <div className="p-6">
        {popular && (
          <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full mb-4">
            Most Popular
          </span>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 ml-1">{period}</span>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={onCtaClick}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            popular
              ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-600/25'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {ctaText}
        </button>
      </div>
    </GradientCard>
  );
}

export default GradientCard;
