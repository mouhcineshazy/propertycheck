'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation, Footer } from '@/components/landing';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'What is PropertyCheck?',
        answer: 'PropertyCheck is a mobile app designed to help Canadian renters document the condition of their rental properties. By creating timestamped, photo-based inspection reports, you can protect your damage deposit and have legally-defensible evidence in case of disputes with your landlord.',
      },
      {
        question: 'Is PropertyCheck free to use?',
        answer: 'Yes! PropertyCheck offers a free tier that includes basic inspection documentation, photo capture with timestamps, and the ability to generate inspection reports. Premium features like side-by-side comparison reports and unlimited storage are available with our Premium subscription.',
      },
      {
        question: 'How do I get started?',
        answer: 'Simply download the PropertyCheck app from the App Store or Google Play, create an account, and add your first property. You can then start documenting your property by taking photos of each room. The app will automatically organize and timestamp your photos.',
      },
      {
        question: 'Which provinces does PropertyCheck support?',
        answer: 'PropertyCheck supports all Canadian provinces and territories. Our reports include province-specific legal information and are designed to meet the documentation standards of provincial rental tribunals including the Landlord and Tenant Board (Ontario), Residential Tenancy Branch (BC), RTDRS (Alberta), and others.',
      },
    ],
  },
  {
    category: 'Inspections & Reports',
    questions: [
      {
        question: 'When should I do an inspection?',
        answer: 'You should do a move-in inspection before or on the day you take possession of the property, documenting any existing damage or issues. Do a move-out inspection on your last day in the property. You can also do routine inspections during your tenancy to document changes.',
      },
      {
        question: 'What should I photograph?',
        answer: 'Document everything! This includes walls, floors, ceilings, windows, doors, appliances, fixtures, and any existing damage or wear. Pay special attention to bathrooms, kitchens, and high-traffic areas. The more thorough your documentation, the better protected you\'ll be.',
      },
      {
        question: 'How do I generate a report?',
        answer: 'After completing your inspection and adding photos, simply tap the "Generate PDF" button. PropertyCheck will create a professional inspection report with all your timestamped photos, organized by room. You can share this report via email or save it to your device.',
      },
      {
        question: 'Can I edit an inspection after completing it?',
        answer: 'You can add notes and additional photos to an inspection while it\'s in draft status. Once you mark an inspection as "Complete", it becomes a finalized record with locked timestamps to preserve its integrity as evidence.',
      },
    ],
  },
  {
    category: 'Legal & Evidence',
    questions: [
      {
        question: 'Are PropertyCheck reports legally valid?',
        answer: 'PropertyCheck reports are designed to meet the documentation standards required by Canadian rental tribunals. All photos include timestamps and metadata that can serve as evidence. However, the weight given to any evidence is ultimately determined by the tribunal hearing your case.',
      },
      {
        question: 'Can I use PropertyCheck reports in court or tribunal hearings?',
        answer: 'Yes, PropertyCheck reports can be submitted as evidence in rental disputes before provincial tribunals like the Landlord and Tenant Board (Ontario) or Residential Tenancy Branch (BC). Our reports include timestamps, photo metadata, and professional formatting suitable for legal proceedings.',
      },
      {
        question: 'Should I share my inspection report with my landlord?',
        answer: 'Yes, we recommend sharing your move-in and move-out inspection reports with your landlord. This establishes a clear record that both parties can reference. You can email reports directly from the app or share them via a secure link.',
      },
    ],
  },
  {
    category: 'Account & Subscription',
    questions: [
      {
        question: 'What\'s included in the free tier?',
        answer: 'The free tier includes: property documentation, photo capture with timestamps, basic inspection reports, and cloud storage for up to 2 properties. Premium features like comparison reports and unlimited properties require a subscription.',
      },
      {
        question: 'What does Premium include?',
        answer: 'PropertyCheck Premium includes: unlimited properties, side-by-side move-in vs move-out comparison reports, priority support, enhanced report designs, and unlimited cloud storage for all your inspection photos.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'You can cancel your Premium subscription at any time through the Settings page in the app. After cancellation, you\'ll retain access to Premium features until the end of your current billing period, then revert to the free tier.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, PropertyCheck uses industry-standard encryption to protect your data. Your photos and reports are stored securely in the cloud and are only accessible to you. We never share your personal information with landlords or third parties without your explicit consent.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    questions: [
      {
        question: 'Why won\'t my photos upload?',
        answer: 'Photo uploads require an internet connection. If you\'re having issues, check your connection and try again. Photos taken offline will be queued and uploaded automatically when you\'re back online. Also ensure the app has permission to access your photos.',
      },
      {
        question: 'How do I recover my account?',
        answer: 'If you\'ve forgotten your password, use the "Forgot Password" link on the login screen to reset it via email. If you\'re having other account issues, contact our support team at support@propertycheck.app.',
      },
      {
        question: 'The app is running slowly. What can I do?',
        answer: 'Try closing and reopening the app, or restarting your device. If you have many high-resolution photos, the app may take longer to load. Ensure you have the latest version of the app installed for the best performance.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about PropertyCheck and how it helps
            protect your rental damage deposit.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {faqs.map((section) => (
            <div key={section.category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary-600">
                {section.category}
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {section.questions.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Support
            </Link>
            <a
              href="mailto:support@propertycheck.app"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
