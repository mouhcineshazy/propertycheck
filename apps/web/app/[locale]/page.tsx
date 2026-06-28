import {
  Navigation,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  DownloadSection,
  PricingSection,
  CTASection,
  Footer,
} from '@/components/landing';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PropertyCheck',
  description:
    "Canada's rental inspection app for documenting property conditions, protecting damage deposits, and generating professional PDF reports accepted by provincial tenancy boards.",
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'iOS, Android',
  url: 'https://propertycheck.app',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CAD',
  },
  // Placeholder ratings — update after launch with real data
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1',
    reviewCount: '1',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DownloadSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
