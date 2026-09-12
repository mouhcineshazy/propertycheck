import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

interface Props {
  searchParams: Promise<{ inspection?: string; canceled?: string }>;
}

export default async function ReportSuccessPage({ searchParams }: Props) {
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
            <p className="mb-8 mt-2 text-fg-muted">Your report has not been unlocked. You can try again any time from the PropertyCheck app.</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verified-50 text-verified-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-fg">Report Unlocked!</h1>
            <p className="mt-2 text-fg-muted">
              Your watermark-free PDF is ready. Return to the PropertyCheck app and tap <strong className="text-fg">Generate PDF</strong> — your clean report will download instantly.
            </p>
            <p className="mb-8 mt-2 text-xs text-fg-subtle">This unlock is permanent and applies only to this inspection.</p>
          </>
        )}

        <Link href="/" className="btn-primary w-full py-3">Done</Link>
      </div>
    </div>
  );
}
