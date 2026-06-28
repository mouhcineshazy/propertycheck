import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

interface Props {
  searchParams: Promise<{ inspection?: string; canceled?: string }>;
}

export default async function ReportSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const canceled = params.canceled === '1';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <Logo className="h-8 mx-auto" />
        </div>

        {canceled ? (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-500 mb-8">
              Your report has not been unlocked. You can try again any time from the PropertyCheck app.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Unlocked!</h1>
            <p className="text-gray-500 mb-2">
              Your watermark-free PDF is ready. Return to the PropertyCheck app and tap{' '}
              <strong>Generate PDF</strong> — your clean report will download instantly.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              This unlock is permanent and applies only to this inspection.
            </p>
          </>
        )}

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
