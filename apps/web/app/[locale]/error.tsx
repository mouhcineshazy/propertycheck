'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-400">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-fg">Something went wrong</h1>
        <p className="mb-8 leading-relaxed text-fg-muted">An unexpected error occurred. Your data is safe — please try again.</p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn-primary px-6 py-3">Try Again</button>
          <Link href="/dashboard" className="btn-secondary px-6 py-3">Go to Dashboard</Link>
        </div>

        {error.digest && <p className="mt-6 text-xs text-fg-subtle">Error ID: {error.digest}</p>}
      </div>
    </div>
  );
}
