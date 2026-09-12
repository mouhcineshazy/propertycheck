'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
      });
    }, 250);

    // Show content with animation
    setTimeout(() => setShowContent(true), 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div
        className={`card w-full max-w-md p-8 text-center transition-all duration-500 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-verified-50 text-verified-500">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-fg">Welcome to Premium!</h1>
        <p className="mt-2 text-fg-muted">Your subscription is now active. You have access to all premium features.</p>

        <div className="mb-8 mt-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2">
          <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-semibold text-primary-700">Premium Member</span>
        </div>

        <div className="mb-8 rounded-xl bg-card-muted p-5 text-left">
          <h2 className="mb-3 font-semibold text-fg">What&apos;s included:</h2>
          <ul className="space-y-2">
            {['Unlimited properties', 'Unlimited inspections', 'Professional PDF reports', 'Comparison reports', 'Priority support'].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-fg-muted">
                <svg className="h-4 w-4 text-verified-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="btn-primary w-full py-3.5">Done</Link>

        <p className="mt-4 text-sm text-fg-subtle">
          Need help getting started?{' '}
          <Link href="/faq" className="text-primary-600 hover:text-primary-700">View FAQ</Link>
        </p>
      </div>
    </div>
  );
}

function CheckoutSuccessFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600/30 border-t-primary-600" />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
