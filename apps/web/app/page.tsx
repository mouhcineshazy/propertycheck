'use client';

import {
  Navigation,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CaseStudiesSection,
  PricingSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CaseStudiesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
