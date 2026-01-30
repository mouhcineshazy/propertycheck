import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PropertyCheck Privacy Policy - Learn how we collect, use, and protect your personal information in compliance with PIPEDA and Canadian privacy laws.',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="January 30, 2026"
      lastUpdated="January 30, 2026"
      documentType="privacy"
    >
      {/* PIPEDA Commitment Banner */}
      <div className="mb-8 p-6 bg-primary-50 rounded-xl border-l-4 border-primary-600">
        <h2 className="text-lg font-semibold text-primary-900 mb-2">Our Privacy Commitment</h2>
        <p className="text-primary-800">
          PropertyCheck is committed to protecting your privacy in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA), Canada&apos;s Anti-Spam Legislation (CASL), Quebec&apos;s Law 25, and applicable provincial privacy legislation including British Columbia&apos;s and Alberta&apos;s Personal Information Protection Acts (PIPA).
        </p>
      </div>

      {/* Table of Contents */}
      <nav className="mb-12 p-6 bg-gray-50 rounded-xl print-hide">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
        <ol className="grid md:grid-cols-2 gap-2 text-sm">
          <li><a href="#introduction" className="text-primary-600 hover:underline">1. Introduction</a></li>
          <li><a href="#information-collected" className="text-primary-600 hover:underline">2. Information We Collect</a></li>
          <li><a href="#how-we-use" className="text-primary-600 hover:underline">3. How We Use Your Information</a></li>
          <li><a href="#legal-basis" className="text-primary-600 hover:underline">4. Legal Basis for Processing</a></li>
          <li><a href="#information-sharing" className="text-primary-600 hover:underline">5. Information Sharing</a></li>
          <li><a href="#data-retention" className="text-primary-600 hover:underline">6. Data Retention</a></li>
          <li><a href="#data-security" className="text-primary-600 hover:underline">7. Data Security</a></li>
          <li><a href="#cross-border" className="text-primary-600 hover:underline">8. Cross-Border Data Transfers</a></li>
          <li><a href="#your-rights" className="text-primary-600 hover:underline">9. Your Privacy Rights</a></li>
          <li><a href="#quebec-rights" className="text-primary-600 hover:underline">10. Quebec Residents&apos; Rights</a></li>
          <li><a href="#cookies" className="text-primary-600 hover:underline">11. Cookies & Tracking</a></li>
          <li><a href="#marketing" className="text-primary-600 hover:underline">12. Marketing Communications</a></li>
          <li><a href="#children" className="text-primary-600 hover:underline">13. Children&apos;s Privacy</a></li>
          <li><a href="#data-breach" className="text-primary-600 hover:underline">14. Data Breach Procedures</a></li>
          <li><a href="#pipeda-principles" className="text-primary-600 hover:underline">15. PIPEDA Fair Information Principles</a></li>
          <li><a href="#changes" className="text-primary-600 hover:underline">16. Changes to This Policy</a></li>
          <li><a href="#contact" className="text-primary-600 hover:underline">17. Contact Us</a></li>
        </ol>
      </nav>

      {/* Content */}
      <div className="prose prose-gray max-w-none">
        {/* Section 1 */}
        <section id="introduction" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p>
            PropertyCheck (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the PropertyCheck website and mobile applications (collectively, the &ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Service.
          </p>
          <p>
            We are committed to protecting your privacy and handling your personal information responsibly. This policy applies to all users of our Service in Canada.
          </p>
          <p>
            By using our Service, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our practices, please do not use our Service.
          </p>
        </section>

        {/* Section 2 */}
        <section id="information-collected" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information You Provide Directly</h3>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold mb-2">Account Information:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Email address</li>
              <li>Full name</li>
              <li>Province of residence</li>
              <li>Password (stored in hashed form) for email signup</li>
              <li>Google account identifier (if using Google OAuth)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold mb-2">Property Information:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Property address</li>
              <li>Property type (apartment, house, condo, townhouse)</li>
              <li>Property notes and descriptions</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold mb-2">Inspection Information:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Inspection date and time</li>
              <li>Inspection type (move-in, move-out, routine)</li>
              <li>Inspection status and notes</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold mb-2">Photo Information:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Photos you upload of property conditions</li>
              <li>Photo captions and descriptions</li>
              <li>Room categorization</li>
              <li>Photo metadata (EXIF data including timestamp, and GPS location if available on your device)</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Information Collected Automatically</h3>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold mb-2">Technical Information:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Device type and operating system</li>
              <li>Browser type and version</li>
              <li>IP address</li>
              <li>Access times and dates</li>
              <li>Pages viewed and features used</li>
              <li>App crash reports and error logs</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Payment Information</h3>
          <p>
            Payment card details are collected and processed exclusively by Stripe, our PCI-DSS compliant payment processor. PropertyCheck does not store complete credit card numbers on our servers. We receive only:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Last four digits of your card</li>
            <li>Card brand (Visa, Mastercard, etc.)</li>
            <li>Billing address (for fraud prevention)</li>
            <li>Transaction history and subscription status</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="how-we-use" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p>We use your personal information for the following purposes:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Providing the Service</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Creating and managing your account</li>
            <li>Storing your property and inspection documentation</li>
            <li>Generating PDF inspection reports</li>
            <li>Enabling move-in vs move-out comparisons</li>
            <li>Providing province-specific tenancy information</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Communication</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sending transactional emails (account confirmation, password reset, subscription receipts)</li>
            <li>Responding to your inquiries and support requests</li>
            <li>Notifying you of Service updates and changes</li>
            <li>Sending marketing communications (with your consent)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Business Operations</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processing payments and managing subscriptions</li>
            <li>Analyzing Service usage to improve features</li>
            <li>Ensuring Service security and preventing fraud</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="legal-basis" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
          <p>Under PIPEDA, we process your personal information based on the following legal grounds:</p>

          <div className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Consent:</p>
              <p className="text-sm">When you create an account, upload content, or opt-in to marketing communications, you provide express consent for us to process your information for those purposes.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Contract Performance:</p>
              <p className="text-sm">Processing necessary to provide the Service you requested and fulfill our contractual obligations under the Terms of Service.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Legitimate Business Interests:</p>
              <p className="text-sm">Processing for fraud prevention, security, Service improvement, and analytics, balanced against your privacy interests.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Legal Compliance:</p>
              <p className="text-sm">Processing required to comply with applicable laws, regulations, or legal processes.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="information-sharing" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing</h2>
          <p>We do not sell your personal information. We share your information only in the following circumstances:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Service Providers</h3>
          <p>We share information with trusted third-party service providers who assist us in operating the Service:</p>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Provider</th>
                  <th className="text-left py-2 font-semibold">Purpose</th>
                  <th className="text-left py-2 font-semibold">Data Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Supabase</td>
                  <td className="py-2">Database, authentication, file storage</td>
                  <td className="py-2">Account data, photos, inspection data</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Stripe</td>
                  <td className="py-2">Payment processing</td>
                  <td className="py-2">Payment card details, billing info</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Resend</td>
                  <td className="py-2">Transactional emails</td>
                  <td className="py-2">Email address, name</td>
                </tr>
                <tr>
                  <td className="py-2">Google</td>
                  <td className="py-2">OAuth authentication</td>
                  <td className="py-2">Google account identifier</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            These providers are contractually bound to protect your information and may only use it to provide services to us.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Court orders, subpoenas, or legal process</li>
            <li>Requests from law enforcement or government authorities</li>
            <li>Protection of our legal rights or defense against legal claims</li>
            <li>Prevention of fraud, security threats, or illegal activities</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Business Transfers</h3>
          <p>
            If PropertyCheck is involved in a merger, acquisition, or sale of assets, your personal information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have regarding your information.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.4 With Your Consent</h3>
          <p>
            We may share your information for other purposes with your explicit consent.
          </p>
        </section>

        {/* Section 6 */}
        <section id="data-retention" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
          <p>We retain your personal information only as long as necessary for the purposes outlined in this policy:</p>

          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Data Type</th>
                  <th className="text-left py-2 font-semibold">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Account information</td>
                  <td className="py-2">Duration of account + 30 days after deletion request</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Property & inspection data</td>
                  <td className="py-2">Duration of account + 30 days after deletion request</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Photos</td>
                  <td className="py-2">Duration of account + 30 days after deletion request</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Payment records</td>
                  <td className="py-2">7 years (as required for tax/legal purposes)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Technical logs</td>
                  <td className="py-2">90 days</td>
                </tr>
                <tr>
                  <td className="py-2">Marketing preferences</td>
                  <td className="py-2">Until consent is withdrawn</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            After the retention period, data is securely deleted or anonymized. You may request earlier deletion of your data (see Section 9).
          </p>
        </section>

        {/* Section 7 */}
        <section id="data-security" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Technical Safeguards</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption in transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher</li>
            <li><strong>Encryption at rest:</strong> Stored data is encrypted using AES-256 encryption</li>
            <li><strong>Password security:</strong> Passwords are hashed using industry-standard algorithms and never stored in plain text</li>
            <li><strong>Access controls:</strong> Strict access controls limit who can access your data</li>
            <li><strong>Regular security audits:</strong> We conduct regular security assessments and vulnerability testing</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Organizational Safeguards</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Privacy training for employees</li>
            <li>Data minimization practices</li>
            <li>Incident response procedures</li>
            <li>Vendor security assessments</li>
          </ul>

          <p className="mt-4 text-sm text-gray-600">
            While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        {/* Section 8 */}
        <section id="cross-border" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cross-Border Data Transfers</h2>
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
            <p className="font-semibold">Important Notice:</p>
            <p>
              Your personal information may be stored and processed on servers located in Canada and the United States. Our service providers, including Supabase and Stripe, may process your data in the United States.
            </p>
          </div>

          <p className="mt-4">
            When your data is transferred to the United States, it may be subject to U.S. laws, which may differ from Canadian privacy laws. However, we ensure that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Our service providers are contractually obligated to protect your data</li>
            <li>Appropriate safeguards are in place to ensure a level of protection consistent with PIPEDA</li>
            <li>Transfers comply with applicable Canadian privacy law requirements</li>
          </ul>

          <p className="mt-4">
            By using our Service, you consent to the transfer of your information to Canada and the United States as described in this policy.
          </p>
        </section>

        {/* Section 9 */}
        <section id="your-rights" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Privacy Rights</h2>
          <p>Under PIPEDA and provincial privacy laws, you have the following rights regarding your personal information:</p>

          <div className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Access</p>
              <p className="text-sm">Request a copy of the personal information we hold about you.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Correction</p>
              <p className="text-sm">Request correction of inaccurate or incomplete personal information.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Withdraw Consent</p>
              <p className="text-sm">Withdraw your consent to certain processing activities, subject to legal or contractual restrictions.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Challenge Compliance</p>
              <p className="text-sm">Challenge our compliance with PIPEDA by contacting the Office of the Privacy Commissioner of Canada.</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.1 How to Exercise Your Rights</h3>
          <p>To exercise any of these rights, please contact us at:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a></li>
          </ul>
          <p className="mt-4">
            We will respond to your request within 30 days, as required by PIPEDA. We may need to verify your identity before processing your request.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Account Data Export</h3>
          <p>
            You can export your data at any time through your account settings. This includes your property information, inspection records, and photos.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">9.3 Account Deletion</h3>
          <p>
            You can request deletion of your account and personal data by contacting us at <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a> or through your account settings. We will process deletion requests within 30 days.
          </p>
        </section>

        {/* Section 10 */}
        <section id="quebec-rights" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Quebec Residents&apos; Rights (Law 25)</h2>
          <div className="bg-primary-50 p-6 rounded-lg border-l-4 border-primary-600">
            <p className="font-semibold text-primary-900">Additional Rights for Quebec Residents</p>
            <p className="text-primary-800">
              If you are a resident of Quebec, you have additional rights under the Act respecting the protection of personal information in the private sector (Law 25).
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Data Portability</p>
              <p className="text-sm">You have the right to receive your personal information in a structured, commonly used, and machine-readable format, and to have it transferred to another organization where technically feasible.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Be Forgotten (Erasure)</p>
              <p className="text-sm">You have the right to request the deletion of your personal information when it is no longer necessary for the purposes for which it was collected, or when you withdraw consent.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Cease Dissemination</p>
              <p className="text-sm">You have the right to request that we stop disseminating your personal information or de-index any hyperlink attached to your name if dissemination causes harm.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Right to Know Automated Decision-Making</p>
              <p className="text-sm">You have the right to be informed if we use automated decision-making to make decisions about you, and to request human review of such decisions.</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">10.1 Privacy Impact Assessments</h3>
          <p>
            In accordance with Law 25, we conduct privacy impact assessments when implementing new systems or processes that involve personal information of Quebec residents.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">10.2 Person Responsible for Privacy</h3>
          <p>
            For Quebec residents, our person responsible for the protection of personal information can be contacted at:
          </p>
          <p className="font-semibold mt-2">
            Email: <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a>
          </p>
        </section>

        {/* Section 11 */}
        <section id="cookies" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cookies & Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to improve your experience on our Service. For detailed information, please see our <Link href="/cookies" className="text-primary-600 hover:underline">Cookie Policy</Link>.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">11.1 Types of Cookies We Use</h3>
          <div className="space-y-4 mt-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold">Essential Cookies (Required)</p>
              <p className="text-sm">Necessary for the Service to function. These include authentication session cookies and security tokens. Cannot be disabled.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold">Preference Cookies (Optional)</p>
              <p className="text-sm">Remember your settings and preferences, such as language and display options.</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">11.2 Do Not Track</h3>
          <p>
            We do not use advertising or tracking cookies. We do not track you across third-party websites.
          </p>
        </section>

        {/* Section 12 */}
        <section id="marketing" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Marketing Communications (CASL Compliance)</h2>
          <p>
            We comply with Canada&apos;s Anti-Spam Legislation (CASL) for all commercial electronic messages.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.1 Consent</h3>
          <p>
            We will only send you marketing emails if you have provided express opt-in consent. This consent is separate from your agreement to receive transactional emails related to your account.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.2 Transactional Emails</h3>
          <p>
            We may send transactional emails without additional consent, including:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account confirmation and password reset</li>
            <li>Subscription receipts and billing notifications</li>
            <li>Service updates and security alerts</li>
            <li>Responses to your inquiries</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.3 Unsubscribe</h3>
          <p>
            Every marketing email includes an unsubscribe link. You can opt out at any time, and we will process your request within 10 business days as required by CASL.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.4 Sender Identification</h3>
          <p>
            All emails from PropertyCheck will clearly identify us as the sender and include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Our business name: PropertyCheck</li>
            <li>Contact email: <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a></li>
            <li>Unsubscribe mechanism (for marketing emails)</li>
          </ul>
        </section>

        {/* Section 13 */}
        <section id="children" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for individuals under 18 years of age (or the age of majority in their province, whichever is greater). We do not knowingly collect personal information from children.
          </p>
          <p className="mt-4">
            If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a>. We will promptly delete such information from our records.
          </p>
        </section>

        {/* Section 14 */}
        <section id="data-breach" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Data Breach Procedures</h2>
          <p>
            In accordance with PIPEDA and provincial requirements, we have established data breach response procedures:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">14.1 Breach Assessment</h3>
          <p>
            We will promptly assess any security incident to determine if it constitutes a breach of safeguards involving personal information.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">14.2 Notification</h3>
          <p>
            If a breach creates a real risk of significant harm to individuals, we will:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Notify the Office of the Privacy Commissioner of Canada as soon as feasible</li>
            <li>Notify affected individuals as soon as feasible</li>
            <li>For Quebec residents, notify the Commission d&apos;accès à l&apos;information du Québec</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">14.3 Record Keeping</h3>
          <p>
            We maintain records of all breaches of security safeguards for at least 24 months, as required by law.
          </p>
        </section>

        {/* Section 15 */}
        <section id="pipeda-principles" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. PIPEDA Fair Information Principles</h2>
          <p>
            We adhere to the 10 Fair Information Principles outlined in Schedule 1 of PIPEDA:
          </p>

          <div className="grid gap-3 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">1. Accountability</p>
              <p className="text-xs text-gray-600">We are responsible for personal information under our control and have designated a Privacy Officer.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">2. Identifying Purposes</p>
              <p className="text-xs text-gray-600">We identify the purposes for collecting personal information at or before the time of collection.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">3. Consent</p>
              <p className="text-xs text-gray-600">We obtain meaningful consent for the collection, use, and disclosure of personal information.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">4. Limiting Collection</p>
              <p className="text-xs text-gray-600">We limit collection to what is necessary for identified purposes and collect information by fair and lawful means.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">5. Limiting Use, Disclosure, and Retention</p>
              <p className="text-xs text-gray-600">We only use or disclose information for the purposes it was collected, and retain it only as long as necessary.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">6. Accuracy</p>
              <p className="text-xs text-gray-600">We keep personal information accurate, complete, and up-to-date as necessary for its purposes.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">7. Safeguards</p>
              <p className="text-xs text-gray-600">We protect personal information with security safeguards appropriate to the sensitivity of the information.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">8. Openness</p>
              <p className="text-xs text-gray-600">We make information about our privacy policies and practices readily available.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">9. Individual Access</p>
              <p className="text-xs text-gray-600">Upon request, we inform individuals of the existence, use, and disclosure of their personal information and provide access.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">10. Challenging Compliance</p>
              <p className="text-xs text-gray-600">Individuals can challenge our compliance by contacting our Privacy Officer or the Office of the Privacy Commissioner.</p>
            </div>
          </div>
        </section>

        {/* Section 16 */}
        <section id="changes" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. When we make changes, we will:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post the updated policy on our website with a new &ldquo;Last Updated&rdquo; date</li>
            <li>Send an email notification to account holders</li>
            <li>Display a notice within the Service</li>
          </ul>
          <p className="mt-4">
            Material changes will take effect 30 days after notice. Your continued use of the Service after the effective date constitutes acceptance of the updated policy.
          </p>
          <p className="mt-4">
            We encourage you to review this policy periodically. Previous versions of this policy are available upon request.
          </p>
        </section>

        {/* Section 17 */}
        <section id="contact" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Us</h2>
          <p>If you have questions, concerns, or complaints about this Privacy Policy or our privacy practices, please contact us:</p>

          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p className="font-semibold text-lg">PropertyCheck - Privacy Office</p>
            <p className="mt-2">Email: <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a></p>
            <p>General Support: <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a></p>
          </div>

          <div className="bg-primary-50 p-6 rounded-lg mt-4 border-l-4 border-primary-600">
            <p className="font-semibold">For Quebec Residents</p>
            <p className="text-sm mt-2">
              Person responsible for the protection of personal information:<br />
              Email: <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a>
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">17.1 Regulatory Contacts</h3>
          <p>If you are not satisfied with our response, you may contact:</p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="font-semibold">Office of the Privacy Commissioner of Canada</p>
            <p className="text-sm">
              Website: <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.priv.gc.ca</a><br />
              Phone: 1-800-282-1376
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="font-semibold">Commission d&apos;accès à l&apos;information du Québec (Quebec residents)</p>
            <p className="text-sm">
              Website: <a href="https://www.cai.gouv.qc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.cai.gouv.qc.ca</a><br />
              Phone: 1-888-528-7741
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="font-semibold">Office of the Information and Privacy Commissioner (BC residents)</p>
            <p className="text-sm">
              Website: <a href="https://www.oipc.bc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.oipc.bc.ca</a><br />
              Phone: 250-387-5629
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="font-semibold">Office of the Information and Privacy Commissioner (Alberta residents)</p>
            <p className="text-sm">
              Website: <a href="https://www.oipc.ab.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.oipc.ab.ca</a><br />
              Phone: 780-422-6860
            </p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}
