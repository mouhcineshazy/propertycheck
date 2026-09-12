import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

interface Props {
  searchParams: Promise<{ property?: string; canceled?: string }>;
}

export default async function BundleSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const canceled = params.canceled === '1';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <Logo className="mx-auto" />
        </div>

        {canceled ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card-muted text-fg-subtle">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-fg">Payment Cancelled</h1>
            <p className="mb-8 mt-2 text-fg-muted">Your moving bundle has not been purchased. Return to the app to try again.</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verified-50 text-verified-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-fg">Moving Bundle Activated!</h1>
            <p className="mt-2 text-fg-muted">
              Your bundle is active for this property for the next 18 months. Return to the PropertyCheck app to generate your watermark-free comparison report.
            </p>
            <p className="mb-8 mt-2 text-xs text-fg-subtle">Includes: move-in inspection, move-out inspection, and side-by-side comparison PDF.</p>
          </>
        )}

        <Link href="/dashboard" className="btn-primary w-full py-3">Return to Dashboard</Link>
      </div>
    </div>
  );
}
