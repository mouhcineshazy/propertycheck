import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'PropertyCheck Cookie Policy - Learn about the cookies and tracking technologies we use on our platform.',
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      effectiveDate="January 30, 2026"
      lastUpdated="January 30, 2026"
      documentType="cookies"
    >
      {/* Introduction */}
      <div className="mb-8 p-6 bg-primary-50 rounded-xl border-l-4 border-primary-600">
        <p className="text-primary-800">
          This Cookie Policy explains how PropertyCheck (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) uses cookies and similar technologies when you visit our website and use our mobile applications. This policy should be read alongside our <Link href="/privacy" className="text-primary-600 hover:underline font-semibold">Privacy Policy</Link>.
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-gray max-w-none">
        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide information to website owners, and enhance user experience.
          </p>
          <p>
            Similar technologies include web beacons, pixels, and local storage, which serve similar purposes.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Our Cookie Philosophy</h2>
          <p>
            PropertyCheck prioritizes your privacy. We use a <strong>minimal cookies approach</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do NOT use advertising cookies</li>
            <li>We do NOT use third-party tracking cookies</li>
            <li>We do NOT sell data collected through cookies</li>
            <li>We only use cookies essential for the Service to function and for basic analytics</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Essential Cookies (Required)</h3>
          <p>
            These cookies are strictly necessary for the Service to function. Without them, you would not be able to use core features. You cannot opt out of these cookies.
          </p>
          <div className="bg-green-50 p-4 rounded-lg my-4 border-l-4 border-green-500">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200">
                  <th className="text-left py-2 font-semibold">Cookie Name</th>
                  <th className="text-left py-2 font-semibold">Purpose</th>
                  <th className="text-left py-2 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-green-100">
                  <td className="py-2">sb-*-auth-token</td>
                  <td className="py-2">Authentication session (Supabase)</td>
                  <td className="py-2">Session / 7 days</td>
                </tr>
                <tr className="border-b border-green-100">
                  <td className="py-2">sb-*-auth-token-code-verifier</td>
                  <td className="py-2">PKCE authentication security</td>
                  <td className="py-2">Session</td>
                </tr>
                <tr>
                  <td className="py-2">__stripe_mid, __stripe_sid</td>
                  <td className="py-2">Stripe fraud prevention</td>
                  <td className="py-2">1 year / Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Functional Cookies (Optional)</h3>
          <p>
            These cookies enable enhanced functionality and personalization. The Service will still work without them, but certain features may be affected.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg my-4 border-l-4 border-blue-500">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-2 font-semibold">Cookie Name</th>
                  <th className="text-left py-2 font-semibold">Purpose</th>
                  <th className="text-left py-2 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-blue-100">
                  <td className="py-2">preferred_province</td>
                  <td className="py-2">Remember your province selection</td>
                  <td className="py-2">1 year</td>
                </tr>
                <tr>
                  <td className="py-2">theme_preference</td>
                  <td className="py-2">Remember display preferences</td>
                  <td className="py-2">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third-party services that appear on our pages. We do not control these cookies, but we carefully select our partners.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Stripe (Payment Processing)</h3>
          <p>
            When you make a payment, Stripe may set cookies for fraud prevention and security purposes. These are essential for secure payment processing.
          </p>
          <p className="text-sm mt-2">
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Stripe Privacy Policy</a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Google (OAuth Authentication)</h3>
          <p>
            If you choose to sign in with Google, Google may set cookies for authentication purposes. This only applies if you use Google Sign-In.
          </p>
          <p className="text-sm mt-2">
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google Privacy Policy</a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Supabase (Authentication & Database)</h3>
          <p>
            Supabase powers our authentication system and sets session cookies to keep you logged in securely.
          </p>
          <p className="text-sm mt-2">
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Supabase Privacy Policy</a>
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Mobile Applications</h2>
          <p>
            Our mobile applications (iOS and Android) do not use browser cookies. However, we may use similar technologies for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure token storage for authentication</li>
            <li>Local preferences storage</li>
            <li>Crash reporting data</li>
          </ul>
          <p className="mt-4">
            This data is stored locally on your device and managed through your device&apos;s standard app data storage mechanisms.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Managing Cookies</h2>
          <p>
            You have control over cookies on your device. Here&apos;s how you can manage them:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Browser Settings</h3>
          <p>
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View what cookies are stored on your device</li>
            <li>Delete all or specific cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Block all cookies (note: this may affect functionality)</li>
            <li>Set your browser to notify you when a cookie is set</li>
          </ul>

          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold mb-2">Browser-specific instructions:</p>
            <ul className="text-sm space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Safari (Mac)</a></li>
              <li><a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Safari (iOS)</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Microsoft Edge</a></li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Impact of Disabling Cookies</h3>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="font-semibold">Please Note:</p>
            <p className="text-sm mt-2">
              Disabling essential cookies will prevent you from:
            </p>
            <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
              <li>Logging into your account</li>
              <li>Staying signed in between sessions</li>
              <li>Making secure payments</li>
            </ul>
            <p className="text-sm mt-2">
              If you disable essential cookies, you will not be able to use the PropertyCheck Service.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Do Not Track Signals</h2>
          <p>
            Some browsers include a &ldquo;Do Not Track&rdquo; (DNT) feature that signals to websites that you do not want your online activity tracked.
          </p>
          <p className="mt-4">
            Since PropertyCheck does not engage in tracking for advertising purposes, we do not change our practices in response to DNT signals. Our data collection practices are the same regardless of DNT settings.
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. When we make changes, we will update the &ldquo;Last Updated&rdquo; date at the top of this page.
          </p>
          <p className="mt-4">
            We encourage you to review this policy periodically to stay informed about our use of cookies.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
          <p>If you have questions about our use of cookies, please contact us:</p>

          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p className="font-semibold text-lg">PropertyCheck</p>
            <p className="mt-2">Email: <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a></p>
            <p>General Support: <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a></p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}
