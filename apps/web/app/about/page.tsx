import { Metadata } from 'next';
import { Navigation, Footer } from '@/components/landing';
import { Logo } from '@/components/ui/Logo';

export const metadata: Metadata = {
  title: 'About Us | PropertyCheck',
  description: 'Learn about PropertyCheck - the app helping Canadian renters protect their damage deposits with professional inspection reports.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <Logo size="xl" className="justify-center mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Protecting Renters Across Canada
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              PropertyCheck helps renters document property conditions with timestamped,
              legally-defensible inspection reports - ensuring you never lose your damage deposit unfairly.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Every year, thousands of Canadian renters lose money from their damage deposits
                due to disputes over property conditions. Without proper documentation, it's
                often a case of &quot;their word against yours&quot;.
              </p>
              <p className="text-gray-600 mb-4">
                PropertyCheck was created to level the playing field. We provide renters with
                an easy-to-use mobile app that creates professional, timestamped inspection
                reports that can be used as evidence in rental disputes.
              </p>
              <p className="text-gray-600">
                Our reports are designed to meet the documentation standards required by
                provincial rental tribunals across Canada, including the Landlord and Tenant
                Board (Ontario), Residential Tenancy Branch (BC), and more.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Timestamped Evidence</h3>
                    <p className="text-sm text-gray-600">Every photo is automatically timestamped and geotagged for legal validity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Professional Reports</h3>
                    <p className="text-sm text-gray-600">Generate PDF reports that meet provincial rental tribunal standards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Side-by-Side Comparison</h3>
                    <p className="text-sm text-gray-600">Compare move-in and move-out conditions to show changes over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How PropertyCheck Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Your Property</h3>
              <p className="text-sm text-gray-600">
                Take photos of every room when you move in. Our app automatically
                timestamps and organizes your documentation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate Reports</h3>
              <p className="text-sm text-gray-600">
                Create professional PDF inspection reports with one tap.
                Share them with your landlord or save for your records.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Protect Your Deposit</h3>
              <p className="text-sm text-gray-600">
                When you move out, compare conditions side-by-side.
                Use your documented evidence to protect your deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">$1,500</div>
              <p className="text-sm text-gray-600">Average deposit at risk</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10+</div>
              <p className="text-sm text-gray-600">Provinces supported</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <p className="text-sm text-gray-600">Free to start</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <p className="text-sm text-gray-600">Access to reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Protect Your Deposit?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join thousands of Canadian renters who trust PropertyCheck to document their
            rental properties and protect their hard-earned money.
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
