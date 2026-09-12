import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <span className="text-3xl font-bold tracking-tight text-primary-600">404</span>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-fg">Page not found</h1>
        <p className="mb-8 leading-relaxed text-fg-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="btn-primary px-6 py-3">Go to Dashboard</Link>
          <Link href="/" className="btn-secondary px-6 py-3">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
