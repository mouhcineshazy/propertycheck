import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Navigation, Footer } from '@/components/landing';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.about');
  return {
    title: `${t('title')} | PropertyCheck`,
    description: t('subtitle'),
  };
}

function AboutContent() {
  const t = useTranslations('pages.about');

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <Logo size="xl" className="justify-center mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('mission.title')}</h2>
              <p className="text-gray-600 mb-4">
                {t('mission.description1')}
              </p>
              <p className="text-gray-600 mb-4">
                {t('mission.description2')}
              </p>
              <p className="text-gray-600">
                {t('mission.description3')}
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
                    <h3 className="font-semibold text-gray-900">{t('benefits.easyDocumentation.title')}</h3>
                    <p className="text-sm text-gray-600">{t('benefits.easyDocumentation.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('benefits.legalEvidence.title')}</h3>
                    <p className="text-sm text-gray-600">{t('benefits.legalEvidence.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('benefits.peaceOfMind.title')}</h3>
                    <p className="text-sm text-gray-600">{t('benefits.peaceOfMind.description')}</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{t('howItWorks.title')}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('howItWorks.step1.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('howItWorks.step1.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('howItWorks.step2.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('howItWorks.step2.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('howItWorks.step3.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('howItWorks.step3.description')}
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
              <div className="text-4xl font-bold text-primary-600 mb-2">{t('stats.depositAtRisk.value')}</div>
              <p className="text-sm text-gray-600">{t('stats.depositAtRisk.label')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{t('stats.provincesSupported.value')}</div>
              <p className="text-sm text-gray-600">{t('stats.provincesSupported.label')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{t('stats.freeToStart.value')}</div>
              <p className="text-sm text-gray-600">{t('stats.freeToStart.label')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{t('stats.accessToReports.value')}</div>
              <p className="text-sm text-gray-600">{t('stats.accessToReports.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('cta.title')}</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
