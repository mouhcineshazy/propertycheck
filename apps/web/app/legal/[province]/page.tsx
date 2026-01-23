import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvince, PROVINCE_CODES, APP_CONFIG } from '@propertycheck/shared';

// Generate static params for all provinces
export function generateStaticParams() {
  return PROVINCE_CODES.map((code) => ({
    province: code.toLowerCase(),
  }));
}

// Generate metadata for each province page
export async function generateMetadata({ params }: { params: Promise<{ province: string }> }) {
  const { province: provinceParam } = await params;
  const province = getProvince(provinceParam.toUpperCase());

  if (!province) {
    return {
      title: 'Province Not Found',
    };
  }

  return {
    title: `${province.name} Rental Inspection Guide | ${APP_CONFIG.name}`,
    description: `Learn about ${province.name} rental inspection requirements under the ${province.tenancyAct}. Protect your security deposit with PropertyCheck.`,
  };
}

export default async function ProvinceLegalPage({ params }: { params: Promise<{ province: string }> }) {
  const { province: provinceParam } = await params;
  const province = getProvince(provinceParam.toUpperCase());

  if (!province) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            {APP_CONFIG.name}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {province.name}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rental Inspection Guide for {province.name}
            </h1>
            <p className="text-xl text-gray-300">
              Everything you need to know about protecting your security deposit under the {province.tenancyActShort}.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl">
          {/* Legal Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Legal Framework
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Governing Legislation
                  </dt>
                  <dd className="text-lg text-gray-900 mt-1">
                    {province.tenancyAct}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Regulatory Body
                  </dt>
                  <dd className="text-lg text-gray-900 mt-1">
                    <a
                      href={province.regulatoryBodyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {province.regulatoryBody}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Dispute Resolution
                  </dt>
                  <dd className="text-lg text-gray-900 mt-1">
                    <a
                      href={province.disputeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {province.disputeBody}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Inspection Requirements */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Inspection Requirements
            </h2>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
              <p className="text-blue-900 text-lg">
                {province.inspectionRequirements}
              </p>
            </div>
          </section>

          {/* Key Legal Highlights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What {province.name} Renters Should Know
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ul className="space-y-4">
                {province.legalHighlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* How PropertyCheck Helps */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How {APP_CONFIG.name} Helps {province.name} Renters
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ul className="space-y-4">
                {province.appBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gray-900 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Protect Your Deposit Today
            </h2>
            <p className="text-gray-300 mb-6">
              Start documenting your rental property with {APP_CONFIG.name}. Free for your first move-in & move-out inspections.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </section>

          {/* Other provinces */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guides for Other Provinces
            </h3>
            <div className="flex flex-wrap gap-2">
              {PROVINCE_CODES.filter((code) => code !== province.code).map((code) => {
                const otherProvince = getProvince(code);
                return otherProvince ? (
                  <Link
                    key={code}
                    href={`/legal/${code.toLowerCase()}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    {otherProvince.name}
                  </Link>
                ) : null;
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p className="mb-2">
            This page is for informational purposes only and does not constitute legal advice.
            Please consult with a qualified legal professional for specific legal questions.
          </p>
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
