'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Navigation, Footer } from '@/components/landing';

const SUPPORT_EMAIL = 'support@propertycheck.app';

export default function ContactPage() {
  const t = useTranslations('pages.contact');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // For now, open email client with pre-filled data
    const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    window.location.href = mailtoLink;

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('getInTouch.title')}</h2>
              <p className="text-gray-600 mb-8">
                {t('getInTouch.description')}
              </p>

              {/* Email Card */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('getInTouch.emailSupport.title')}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t('getInTouch.emailSupport.description')}</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>
              </div>

              {/* FAQ Card */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t('getInTouch.checkFaq.title')}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t('getInTouch.checkFaq.description')}</p>
                    <Link
                      href="/faq"
                      className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                    >
                      View FAQ →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-800">
                    <strong>Average response time:</strong> {t('getInTouch.responseTime')}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('form.title')}</h2>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('form.success.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('form.success.message')}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-primary-600 font-medium hover:text-primary-700"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.nameLabel')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder={t('form.namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.emailLabel')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder={t('form.emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.subjectLabel')}
                      </label>
                      <select
                        id="subject"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      >
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
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.messageLabel')}
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                        placeholder={t('form.messagePlaceholder')}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Opening email...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          {t('form.submitButton')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                {t('form.privacyNote').split('Privacy Policy')[0]}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
