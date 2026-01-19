'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

// Predefined animation variants for common use cases
const animationVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
};

type AnimationType = keyof typeof animationVariants;

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  // Animation timing
  delay?: number;
  duration?: number;
  // Animation type
  animation?: AnimationType;
  // Custom variants (overrides animation prop)
  variants?: Variants;
  // Intersection observer options
  threshold?: number;
  triggerOnce?: boolean;
  // HTML element to render
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main';
}

/**
 * AnimatedSection - Reusable component for scroll-triggered animations
 *
 * Uses Intersection Observer to detect when element enters viewport,
 * then triggers Framer Motion animation.
 *
 * @example
 * // Basic usage with default fade-up animation
 * <AnimatedSection>
 *   <h2>Hello World</h2>
 * </AnimatedSection>
 *
 * @example
 * // With custom animation and delay
 * <AnimatedSection animation="scale" delay={0.2} duration={0.8}>
 *   <Card>Content</Card>
 * </AnimatedSection>
 *
 * @example
 * // With custom variants
 * <AnimatedSection variants={{
 *   hidden: { opacity: 0, rotate: -10 },
 *   visible: { opacity: 1, rotate: 0 }
 * }}>
 *   <Image />
 * </AnimatedSection>
 */
export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  animation = 'fadeUp',
  variants,
  threshold = 0.2,
  triggerOnce = true,
  as = 'div',
}: AnimatedSectionProps) {
  // Intersection observer hook - detects when element is in viewport
  const { ref, inView } = useInView({
    triggerOnce,
    threshold,
  });

  // Use custom variants if provided, otherwise use predefined animation
  const animationConfig = variants || animationVariants[animation];

  // Motion component with dynamic element type
  const MotionComponent = motion[as];

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={animationConfig}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth animation
      }}
    >
      {children}
    </MotionComponent>
  );
}

// Convenience components for common use cases

interface AnimatedHeadingProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * AnimatedHeading - Animated heading with split text effect ready
 */
export function AnimatedHeading({
  children,
  className = '',
  delay = 0,
  as = 'h2',
}: AnimatedHeadingProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const MotionHeading = motion[as];

  return (
    <MotionHeading
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </MotionHeading>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  as?: 'div' | 'ul' | 'ol' | 'section';
}

/**
 * StaggerContainer - Container that staggers children animations
 *
 * @example
 * <StaggerContainer>
 *   <StaggerItem><Card /></StaggerItem>
 *   <StaggerItem><Card /></StaggerItem>
 *   <StaggerItem><Card /></StaggerItem>
 * </StaggerContainer>
 */
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  as = 'div',
}: StaggerContainerProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const MotionContainer = motion[as];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <MotionContainer
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {children}
    </MotionContainer>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
}

/**
 * StaggerItem - Individual item within a StaggerContainer
 */
export function StaggerItem({
  children,
  className = '',
  animation = 'fadeUp',
}: StaggerItemProps) {
  const itemVariants: Variants = {
    hidden: animationVariants[animation].hidden,
    visible: {
      ...animationVariants[animation].visible,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export default AnimatedSection;
