import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Navigation, Footer } from '@/components/landing';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.about');
  return { title: `${t('title')} | PropertyCheck`, description: t('subtitle') };
}

const benefitIcons = [
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
];

function AboutContent() {
  const t = useTranslations('pages.about');

  const benefits = [
    { titleKey: 'benefits.easyDocumentation.title', descKey: 'benefits.easyDocumentation.description' },
    { titleKey: 'benefits.legalEvidence.title', descKey: 'benefits.legalEvidence.description' },
    { titleKey: 'benefits.peaceOfMind.title', descKey: 'benefits.peaceOfMind.description' },
  ];
  const steps = ['step1', 'step2', 'step3'] as const;
  const stats = ['depositAtRisk', 'provincesSupported', 'freeToStart', 'accessToReports'] as const;

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation variant="light" />

      <section className="bg-card-muted pb-16 pt-32">
        <div className="container-page max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-6 flex justify-center">
              <Logo size="xl" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-fg md:text-5xl">{t('title')}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-fg-muted">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-4xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-fg">{t('mission.title')}</h2>
              <p className="mb-4 text-fg-muted">{t('mission.description1')}</p>
              <p className="mb-4 text-fg-muted">{t('mission.description2')}</p>
              <p className="text-fg-muted">{t('mission.description3')}</p>
            </div>
            <div className="rounded-2xl bg-card-muted p-8">
              <div className="space-y-6">
                {benefits.map((benefit, i) => (
                  <div key={benefit.titleKey} className="flex items-start gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={benefitIcons[i]} />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-semibold text-fg">{t(benefit.titleKey)}</h3>
                      <p className="text-sm text-fg-muted">{t(benefit.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card-muted py-16">
        <div className="container-page max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-fg">{t('howItWorks.title')}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold text-fg">{t(`howItWorks.${step}.title`)}</h3>
                <p className="text-sm text-fg-muted">{t(`howItWorks.${step}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-4xl">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat}>
                <div className="mb-2 text-4xl font-bold tracking-tight text-primary-600 tabular-nums">{t(`stats.${stat}.value`)}</div>
                <p className="text-sm text-fg-muted">{t(`stats.${stat}.label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-16">
        <div className="container-page max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">{t('cta.title')}</h2>
          <p className="mx-auto mb-8 max-w-xl text-ink-300">{t('cta.subtitle')}</p>
          <Link href="/signup" className="btn bg-white px-8 py-3 text-ink-950 hover:bg-ink-50">{t('cta.button')}</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
