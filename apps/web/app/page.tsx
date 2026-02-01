'use client';

import {
  Navigation,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  // TestimonialsSection, // Commented out for MVP - no real testimonials yet
  // CaseStudiesSection,  // Commented out for MVP - no real case studies yet
  DownloadSection,
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
      {/* TestimonialsSection and CaseStudiesSection commented out for MVP */}
      {/* <TestimonialsSection /> */}
      {/* <CaseStudiesSection /> */}
      <DownloadSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
