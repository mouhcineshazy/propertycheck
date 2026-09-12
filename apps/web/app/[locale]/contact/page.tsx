'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Navigation, Footer } from '@/components/landing';

const SUPPORT_EMAIL = 'support@propertycheck.app';

export default function ContactPage() {
  const t = useTranslations('pages.contact');

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation variant="light" />

      <section className="bg-card-muted pb-12 pt-32">
        <div className="container-page max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-fg md:text-5xl">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-fg-muted">{t('subtitle')}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Info */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-fg">{t('getInTouch.title')}</h2>
              <p className="mb-8 text-fg-muted">{t('getInTouch.description')}</p>

              <div className="mb-6 rounded-xl bg-card-muted p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="mb-1 font-semibold text-fg">{t('getInTouch.emailSupport.title')}</h3>
                    <p className="mb-2 text-sm text-fg-muted">{t('getInTouch.emailSupport.description')}</p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary-600 hover:text-primary-700">{SUPPORT_EMAIL}</a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-card-muted p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="mb-1 font-semibold text-fg">{t('getInTouch.checkFaq.title')}</h3>
                    <p className="mb-2 text-sm text-fg-muted">{t('getInTouch.checkFaq.description')}</p>
                    <Link href="/faq" className="font-medium text-primary-600 hover:text-primary-700">View FAQ →</Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg border border-verified-100 bg-verified-50 p-4">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-verified-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-verified-700">
                    <strong>Average response time:</strong> {t('getInTouch.responseTime')}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="card p-6">
                <h2 className="mb-6 text-xl font-bold text-fg">{t('form.title')}</h2>

                {submitted ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verified-50 text-verified-500">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-fg">{t('form.success.title')}</h3>
                    <p className="mb-4 text-fg-muted">{t('form.success.message')}</p>
                    <button onClick={() => setSubmitted(false)} className="font-medium text-primary-600 hover:text-primary-700">Send another message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="label">{t('form.nameLabel')}</label>
                      <input type="text" id="name" required autoComplete="name" className="input" placeholder={t('form.namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="email" className="label">{t('form.emailLabel')}</label>
                      <input type="email" id="email" required autoComplete="email" className="input" placeholder={t('form.emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="subject" className="label">{t('form.subjectLabel')}</label>
                      <select id="subject" required className="input cursor-pointer bg-card" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                        <option value="">{t('form.subjectPlaceholder')}</option>
                        <option value="General Question">{t('form.subjectOptions.generalQuestion')}</option>
                        <option value="Technical Support">{t('form.subjectOptions.technicalSupport')}</option>
                        <option value="Billing Inquiry">{t('form.subjectOptions.billingInquiry')}</option>
                        <option value="Feature Request">{t('form.subjectOptions.featureRequest')}</option>
                        <option value="Bug Report">{t('form.subjectOptions.bugReport')}</option>
                        <option value="Other">{t('form.subjectOptions.other')}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="label">{t('form.messageLabel')}</label>
                      <textarea id="message" required rows={5} className="input resize-none" placeholder={t('form.messagePlaceholder')} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                      {isSubmitting ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Opening email...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                          {t('form.submitButton')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <p className="mt-4 text-center text-sm text-fg-subtle">
                {t('form.privacyNote').split('Privacy Policy')[0]}
                <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
