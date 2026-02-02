'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Navigation, Footer } from '@/components/landing';

// Icons for each category
const categoryIcons: Record<string, React.ReactNode> = {
  gettingStarted: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  inspectionsReports: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  legalEvidence: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  accountSubscription: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  troubleshooting: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`group border-b border-gray-100 last:border-0 transition-colors ${
        isOpen ? 'bg-primary-50/50' : 'hover:bg-gray-50/50'
      }`}
    >
      <button
        className="w-full px-6 py-5 flex items-start justify-between text-left gap-4"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4">
          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
            isOpen
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
          }`}>
            {index + 1}
          </span>
          <span className={`font-medium pt-1 transition-colors ${
            isOpen ? 'text-primary-900' : 'text-gray-900'
          }`}>
            {question}
          </span>
        </div>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-primary-600 text-white rotate-180'
            : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
        }`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="px-6 pb-6 pl-[4.5rem]">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed m-0">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  categoryKey,
  title,
  questions,
  icon,
  isActive,
  onClick,
  questionCount
}: {
  categoryKey: string;
  title: string;
  questions: { question: string; answer: string }[];
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  questionCount: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      id={categoryKey}
      className={`rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'border-primary-200 shadow-lg shadow-primary-100/50'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
      }`}
    >
      {/* Category Header */}
      <button
        onClick={onClick}
        className={`w-full px-6 py-5 flex items-center gap-4 rounded-t-2xl transition-colors ${
          isActive ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          isActive
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <h2 className={`text-lg font-bold transition-colors ${
            isActive ? 'text-primary-900' : 'text-gray-900'
          }`}>
            {title}
          </h2>
          <p className="text-sm text-gray-500">{questionCount} questions</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Questions List */}
      {isActive && (
        <div className="bg-white rounded-b-2xl">
          {questions.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations('pages.faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>('gettingStarted');

  // Build FAQ sections from translations
  const faqCategories = [
    {
      key: 'gettingStarted',
      title: t('categories.gettingStarted.title'),
      questions: [
        { question: t('categories.gettingStarted.questions.q1.question'), answer: t('categories.gettingStarted.questions.q1.answer') },
        { question: t('categories.gettingStarted.questions.q2.question'), answer: t('categories.gettingStarted.questions.q2.answer') },
        { question: t('categories.gettingStarted.questions.q3.question'), answer: t('categories.gettingStarted.questions.q3.answer') },
        { question: t('categories.gettingStarted.questions.q4.question'), answer: t('categories.gettingStarted.questions.q4.answer') },
      ],
    },
    {
      key: 'inspectionsReports',
      title: t('categories.inspectionsReports.title'),
      questions: [
        { question: t('categories.inspectionsReports.questions.q1.question'), answer: t('categories.inspectionsReports.questions.q1.answer') },
        { question: t('categories.inspectionsReports.questions.q2.question'), answer: t('categories.inspectionsReports.questions.q2.answer') },
        { question: t('categories.inspectionsReports.questions.q3.question'), answer: t('categories.inspectionsReports.questions.q3.answer') },
        { question: t('categories.inspectionsReports.questions.q4.question'), answer: t('categories.inspectionsReports.questions.q4.answer') },
      ],
    },
    {
      key: 'legalEvidence',
      title: t('categories.legalEvidence.title'),
      questions: [
        { question: t('categories.legalEvidence.questions.q1.question'), answer: t('categories.legalEvidence.questions.q1.answer') },
        { question: t('categories.legalEvidence.questions.q2.question'), answer: t('categories.legalEvidence.questions.q2.answer') },
        { question: t('categories.legalEvidence.questions.q3.question'), answer: t('categories.legalEvidence.questions.q3.answer') },
      ],
    },
    {
      key: 'accountSubscription',
      title: t('categories.accountSubscription.title'),
      questions: [
        { question: t('categories.accountSubscription.questions.q1.question'), answer: t('categories.accountSubscription.questions.q1.answer') },
        { question: t('categories.accountSubscription.questions.q2.question'), answer: t('categories.accountSubscription.questions.q2.answer') },
        { question: t('categories.accountSubscription.questions.q3.question'), answer: t('categories.accountSubscription.questions.q3.answer') },
        { question: t('categories.accountSubscription.questions.q4.question'), answer: t('categories.accountSubscription.questions.q4.answer') },
      ],
    },
    {
      key: 'troubleshooting',
      title: t('categories.troubleshooting.title'),
      questions: [
        { question: t('categories.troubleshooting.questions.q1.question'), answer: t('categories.troubleshooting.questions.q1.answer') },
        { question: t('categories.troubleshooting.questions.q2.question'), answer: t('categories.troubleshooting.questions.q2.answer') },
        { question: t('categories.troubleshooting.questions.q3.question'), answer: t('categories.troubleshooting.questions.q3.answer') },
      ],
    },
  ];

  // Filter questions based on search
  const filteredCategories = searchQuery.trim()
    ? faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqCategories;

  const totalQuestions = faqCategories.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-100 rounded-full px-4 py-2 mb-6">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-primary-700">{totalQuestions} {t('questionsAnswered')}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            {t('subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Navigation */}
      <section className="py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="container mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
            {faqCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => {
                  setActiveCategory(category.key);
                  setSearchQuery('');
                  // Use setTimeout to allow state update before scrolling
                  setTimeout(() => {
                    const element = document.getElementById(category.key);
                    if (element) {
                      const headerOffset = 100; // Account for sticky header
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.scrollY - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }, 50);
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.key
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="w-5 h-5">{categoryIcons[category.key]}</span>
                <span className="hidden sm:inline">{category.title}</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {category.questions.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12" id="faq-content">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-8 p-4 bg-primary-50 rounded-xl border border-primary-100 text-center">
                <p className="text-primary-800">
                  {filteredCategories.reduce((acc, cat) => acc + cat.questions.length, 0)} {t('resultsFound')} &quot;{searchQuery}&quot;
                </p>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-6">
              {filteredCategories.map((section) => (
                <CategoryCard
                  key={section.key}
                  categoryKey={section.key}
                  title={section.title}
                  questions={section.questions}
                  icon={categoryIcons[section.key]}
                  isActive={searchQuery ? true : activeCategory === section.key}
                  onClick={() => setActiveCategory(activeCategory === section.key ? null : section.key)}
                  questionCount={section.questions.length}
                />
              ))}
            </div>

            {/* No Results */}
            {searchQuery && filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noResults.title')}</h3>
                <p className="text-gray-600 mb-4">{t('noResults.subtitle')}</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  {t('noResults.clearSearch')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('stillHaveQuestions.title')}</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            {t('stillHaveQuestions.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t('stillHaveQuestions.contactButton')}
            </Link>
            <a
              href="mailto:support@propertycheck.app"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('stillHaveQuestions.emailButton')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
