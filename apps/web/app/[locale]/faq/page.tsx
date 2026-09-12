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
    <div className={`group border-b border-line transition-colors last:border-0 ${isOpen ? 'bg-primary-500/10' : 'hover:bg-card-muted/50'}`}>
      <button className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left" onClick={onToggle} aria-expanded={isOpen}>
        <div className="flex items-start gap-4">
          <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            isOpen ? 'bg-primary-600 text-white' : 'bg-card-muted text-fg-muted group-hover:bg-primary-100 group-hover:text-primary-600'
          }`}>
            {index + 1}
          </span>
          <span className={`pt-1 font-medium transition-colors ${isOpen ? 'text-fg' : 'text-fg'}`}>{question}</span>
        </div>
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
          isOpen ? 'rotate-180 bg-primary-600 text-white' : 'bg-card-muted text-fg-muted group-hover:bg-primary-100 group-hover:text-primary-600'
        }`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ height: `${height}px` }}>
        <div ref={contentRef} className="px-6 pb-6 pl-[4.5rem]">
          <p className="m-0 leading-relaxed text-fg-muted">{answer}</p>
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
      className={`overflow-hidden rounded-2xl border bg-card transition-all duration-300 ${
        isActive ? 'border-primary-200 shadow-md' : 'border-line shadow-sm hover:border-line-strong hover:shadow-md'
      }`}
    >
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-4 px-6 py-5 transition-colors ${isActive ? 'bg-primary-500/10' : 'bg-card hover:bg-card-muted'}`}
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-primary-600 text-white' : 'bg-card-muted text-fg-muted'}`}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <h2 className={`text-lg font-bold transition-colors ${isActive ? 'text-fg' : 'text-fg'}`}>{title}</h2>
          <p className="text-sm text-fg-muted">{questionCount} questions</p>
        </div>
        <svg className={`h-5 w-5 text-fg-subtle transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isActive && (
        <div className="bg-card">
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
    <main className="min-h-screen bg-canvas">
      <Navigation variant="light" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-card-muted pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary-100 opacity-40 blur-3xl" />
        </div>

        <div className="container-page relative z-10 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 shadow-xs">
            <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-primary-700">{totalQuestions} {t('questionsAnswered')}</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-fg md:text-5xl lg:text-display-lg">{t('title')}</h1>
          <p className="mx-auto mb-10 mt-4 max-w-2xl text-xl text-fg-muted">{t('subtitle')}</p>

          <div className="mx-auto max-w-xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input py-4 pl-12 shadow-md"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-4 text-fg-subtle hover:text-fg" aria-label="Clear search">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category nav */}
      <section className="sticky top-0 z-20 border-b border-line bg-canvas/95 py-4 backdrop-blur-xl">
        <div className="container-page">
          <div className="scrollbar-hide flex justify-center gap-2 overflow-x-auto pb-2">
            {faqCategories.map((category) => {
              const active = activeCategory === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => {
                    setActiveCategory(category.key);
                    setSearchQuery('');
                    setTimeout(() => {
                      const element = document.getElementById(category.key);
                      if (element) {
                        const offsetPosition = element.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                      }
                    }, 50);
                  }}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active ? 'bg-ink-950 text-white shadow-sm' : 'bg-card-muted text-fg-muted hover:bg-line'
                  }`}
                >
                  <span className="h-5 w-5">{categoryIcons[category.key]}</span>
                  <span className="hidden sm:inline">{category.title}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-card'}`}>{category.questions.length}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12" id="faq-content">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-8 rounded-xl border border-primary-100 bg-primary-50 p-4 text-center">
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
              <div className="py-16 text-center">
                <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card-muted text-fg-subtle">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <h3 className="mb-2 text-lg font-semibold text-fg">{t('noResults.title')}</h3>
                <p className="mb-4 text-fg-muted">{t('noResults.subtitle')}</p>
                <button onClick={() => setSearchQuery('')} className="font-medium text-primary-600 hover:text-primary-700">{t('noResults.clearSearch')}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="relative overflow-hidden bg-ink-950 py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary-600/20 blur-3xl" />
        </div>

        <div className="container-page relative z-10 max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{t('stillHaveQuestions.title')}</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-ink-300">{t('stillHaveQuestions.subtitle')}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact" className="btn bg-white px-8 py-4 text-ink-950 hover:-translate-y-0.5 hover:bg-ink-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t('stillHaveQuestions.contactButton')}
            </Link>
            <a href="mailto:support@propertycheck.app" className="btn border border-white/20 px-8 py-4 text-white hover:bg-white/10">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
