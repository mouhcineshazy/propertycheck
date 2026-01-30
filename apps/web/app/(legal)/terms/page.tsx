import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'PropertyCheck Terms of Service - Read our terms and conditions for using our rental property inspection documentation service.',
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      effectiveDate="January 30, 2026"
      lastUpdated="January 30, 2026"
      documentType="terms"
    >
      {/* Table of Contents */}
      <nav className="mb-12 p-6 bg-gray-50 rounded-xl print-hide">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
        <ol className="grid md:grid-cols-2 gap-2 text-sm">
          <li><a href="#acceptance" className="text-primary-600 hover:underline">1. Acceptance of Terms</a></li>
          <li><a href="#eligibility" className="text-primary-600 hover:underline">2. Eligibility</a></li>
          <li><a href="#service-description" className="text-primary-600 hover:underline">3. Service Description</a></li>
          <li><a href="#account" className="text-primary-600 hover:underline">4. Account Registration</a></li>
          <li><a href="#subscriptions" className="text-primary-600 hover:underline">5. Subscriptions & Payments</a></li>
          <li><a href="#refunds" className="text-primary-600 hover:underline">6. Refunds & Cancellations</a></li>
          <li><a href="#acceptable-use" className="text-primary-600 hover:underline">7. Acceptable Use Policy</a></li>
          <li><a href="#user-content" className="text-primary-600 hover:underline">8. User Content</a></li>
          <li><a href="#intellectual-property" className="text-primary-600 hover:underline">9. Intellectual Property</a></li>
          <li><a href="#disclaimers" className="text-primary-600 hover:underline">10. Disclaimers</a></li>
          <li><a href="#limitation" className="text-primary-600 hover:underline">11. Limitation of Liability</a></li>
          <li><a href="#indemnification" className="text-primary-600 hover:underline">12. Indemnification</a></li>
          <li><a href="#termination" className="text-primary-600 hover:underline">13. Termination</a></li>
          <li><a href="#disputes" className="text-primary-600 hover:underline">14. Dispute Resolution</a></li>
          <li><a href="#governing-law" className="text-primary-600 hover:underline">15. Governing Law</a></li>
          <li><a href="#modifications" className="text-primary-600 hover:underline">16. Modifications to Terms</a></li>
          <li><a href="#general" className="text-primary-600 hover:underline">17. General Provisions</a></li>
          <li><a href="#contact" className="text-primary-600 hover:underline">18. Contact Information</a></li>
        </ol>
      </nav>

      {/* Content */}
      <div className="prose prose-gray max-w-none">
        {/* Section 1 */}
        <section id="acceptance" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            Welcome to PropertyCheck. These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and PropertyCheck (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) governing your access to and use of the PropertyCheck website, mobile applications, and services (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            By accessing or using our Service, creating an account, or clicking to accept these Terms, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
          </p>
          <p className="font-semibold bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT ACCESS OR USE THE SERVICE.
          </p>
        </section>

        {/* Section 2 */}
        <section id="eligibility" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
          <p>To use the Service, you must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Be at least 18 years of age, or the age of majority in your province or territory of residence, whichever is greater;</li>
            <li>Be a resident of Canada;</li>
            <li>Have the legal capacity to enter into a binding contract;</li>
            <li>Not be prohibited from using the Service under applicable Canadian law.</li>
          </ul>
          <p>
            By using the Service, you represent and warrant that you meet all eligibility requirements. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
          </p>
        </section>

        {/* Section 3 */}
        <section id="service-description" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Description</h2>
          <p>
            PropertyCheck is a software-as-a-service (SaaS) platform designed to help Canadian renters document the condition of rental properties. Our Service includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Property Management:</strong> Create and manage records of rental properties;</li>
            <li><strong>Inspection Documentation:</strong> Capture timestamped photos of property conditions during move-in, move-out, or routine inspections;</li>
            <li><strong>PDF Report Generation:</strong> Generate professional inspection reports with photos and timestamps;</li>
            <li><strong>Move-in vs Move-out Comparison:</strong> Compare property condition at different points in time (Premium feature);</li>
            <li><strong>Province-Specific Information:</strong> Access general information about residential tenancy legislation in your province (for educational purposes only).</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Service Availability</h3>
          <p>
            We strive to maintain Service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
          </p>
        </section>

        {/* Section 4 */}
        <section id="account" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Account Creation</h3>
          <p>
            To access certain features of the Service, you must create an account. You may register using your email address and password, or through Google OAuth authentication.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Account Responsibilities</h3>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providing accurate, current, and complete information during registration;</li>
            <li>Maintaining the confidentiality of your account credentials;</li>
            <li>All activities that occur under your account;</li>
            <li>Notifying us immediately of any unauthorized use of your account.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Account Security</h3>
          <p>
            You must not share your account credentials with others. We are not liable for any loss or damage arising from your failure to protect your account information.
          </p>
        </section>

        {/* Section 5 */}
        <section id="subscriptions" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscriptions & Payments</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Subscription Tiers</h3>
          <p>PropertyCheck offers the following subscription options:</p>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <p className="font-semibold">Free Tier:</p>
            <ul className="list-disc pl-6 text-sm">
              <li>1 property maximum</li>
              <li>3 inspections maximum</li>
              <li>30 photos per inspection</li>
              <li>PDF reports with watermark</li>
            </ul>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg my-4 border-l-4 border-primary-600">
            <p className="font-semibold">Premium Tier:</p>
            <ul className="list-disc pl-6 text-sm">
              <li>Monthly: $9.99 CAD per month</li>
              <li>Annual: $99.90 CAD per year (equivalent to 2 months free)</li>
              <li>Unlimited properties and inspections</li>
              <li>Unlimited photos per inspection</li>
              <li>Professional PDF reports (no watermark)</li>
              <li>Move-in vs Move-out comparison reports</li>
              <li>Province-specific legal guidance</li>
              <li>Priority support</li>
            </ul>
          </div>
          <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Payment Processing</h3>
          <p>
            All payments are processed securely through Stripe, a PCI-DSS compliant payment processor. We do not store your complete payment card information on our servers. All prices are in Canadian Dollars (CAD) and include applicable taxes where required.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Automatic Renewal</h3>
          <p className="font-semibold bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            IMPORTANT: Premium subscriptions automatically renew at the end of each billing period (monthly or annually) unless cancelled. You will be charged the then-current subscription rate. You may cancel auto-renewal at any time through your account settings or the Stripe Customer Portal.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">5.4 Price Changes</h3>
          <p>
            We reserve the right to change subscription prices. We will provide at least 30 days&apos; notice of any price increase. Continued use of the Service after a price change constitutes acceptance of the new pricing.
          </p>
        </section>

        {/* Section 6 */}
        <section id="refunds" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Refunds & Cancellations</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Money-Back Guarantee</h3>
          <p>
            First-time Premium subscribers are eligible for a full refund within 7 days of their initial subscription purchase, no questions asked.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Annual Subscription Refunds</h3>
          <p>
            Annual subscribers who cancel within 30 days of purchase may receive a pro-rated refund for the unused portion of their subscription.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Monthly Subscription Refunds</h3>
          <p>
            Monthly subscriptions are non-refundable for partial months. Upon cancellation, you will retain access until the end of your current billing period.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">6.4 How to Request a Refund</h3>
          <p>
            To request a refund, contact us at <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a> with your account email and reason for the request. Refunds are processed through Stripe and typically appear within 5-10 business days.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">6.5 Cancellation</h3>
          <p>
            You may cancel your subscription at any time through your account settings or by contacting support. Cancellation takes effect at the end of your current billing period. After cancellation, your account will be downgraded to the Free tier.
          </p>
        </section>

        {/* Section 7 */}
        <section id="acceptable-use" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Acceptable Use Policy</h2>
          <p>When using our Service, you agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any applicable federal, provincial, or local laws or regulations;</li>
            <li>Upload, transmit, or store content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable;</li>
            <li>Infringe upon the intellectual property rights, privacy rights, or other rights of any third party;</li>
            <li>Upload photos of properties you do not have a lawful right to document;</li>
            <li>Misrepresent your identity, affiliation, or the authenticity of any content;</li>
            <li>Use the Service to create false or misleading documentation;</li>
            <li>Attempt to gain unauthorized access to the Service, other accounts, or computer systems;</li>
            <li>Use automated scripts, bots, or other means to access the Service without our express permission;</li>
            <li>Interfere with or disrupt the integrity or performance of the Service;</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service;</li>
            <li>Use the Service for any commercial purpose not expressly permitted by these Terms;</li>
            <li>Circumvent or disable any security or access control measures.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Consequences of Violations</h3>
          <p>
            Violation of this Acceptable Use Policy may result in immediate termination of your account without notice, forfeiture of any prepaid fees, and potential legal action.
          </p>
        </section>

        {/* Section 8 */}
        <section id="user-content" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Content</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Your Content</h3>
          <p>
            &ldquo;User Content&rdquo; includes all photos, notes, property information, and other materials you upload, submit, or create through the Service. You retain ownership of your User Content.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">8.2 License to PropertyCheck</h3>
          <p>
            By uploading User Content, you grant PropertyCheck a limited, non-exclusive, royalty-free license to store, process, and display your User Content solely for the purpose of providing and improving the Service. This license continues only as long as your content remains on our Service.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Content Responsibility</h3>
          <p>
            You are solely responsible for your User Content. You represent and warrant that you have all necessary rights to upload your User Content and that it does not violate any third party&apos;s rights.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">8.4 Content Removal</h3>
          <p>
            We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate, without prior notice.
          </p>
        </section>

        {/* Section 9 */}
        <section id="intellectual-property" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">9.1 Our Intellectual Property</h3>
          <p>
            The Service, including its design, features, functionality, content, trademarks, and all related intellectual property rights, is owned by PropertyCheck and protected by Canadian and international copyright, trademark, and other intellectual property laws.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Limited License</h3>
          <p>
            Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial purposes.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">9.3 Restrictions</h3>
          <p>
            You may not copy, modify, distribute, sell, lease, or create derivative works of the Service or any of its content without our express written permission.
          </p>
        </section>

        {/* Section 10 */}
        <section id="disclaimers" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers</h2>
          <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <h3 className="text-xl font-semibold mb-3">10.1 NOT LEGAL ADVICE</h3>
            <p className="font-semibold">
              PROPERTYCHECK PROVIDES INFORMATION ABOUT RESIDENTIAL TENANCY LAWS FOR EDUCATIONAL PURPOSES ONLY. THE SERVICE DOES NOT PROVIDE LEGAL ADVICE, AND NO ATTORNEY-CLIENT RELATIONSHIP IS CREATED BY USING THE SERVICE. FOR LEGAL MATTERS, YOU SHOULD CONSULT A QUALIFIED LEGAL PROFESSIONAL LICENSED IN YOUR PROVINCE.
            </p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500 mt-4">
            <h3 className="text-xl font-semibold mb-3">10.2 EVIDENCE LIMITATIONS</h3>
            <p className="font-semibold">
              WHILE PROPERTYCHECK HELPS YOU DOCUMENT PROPERTY CONDITIONS, WE CANNOT GUARANTEE THAT INSPECTION REPORTS WILL BE ACCEPTED AS EVIDENCE BY LANDLORD-TENANT BOARDS, COURTS, OR OTHER AUTHORITIES. THE EVIDENTIARY VALUE OF DOCUMENTATION DEPENDS ON VARIOUS FACTORS OUTSIDE OUR CONTROL, INCLUDING PROVINCIAL RULES OF EVIDENCE AND THE DISCRETION OF ADJUDICATORS.
            </p>
          </div>
          <h3 className="text-xl font-semibold mt-6 mb-3">10.3 Accuracy of Information</h3>
          <p>
            Province-specific legal information provided through the Service is for general guidance only and may not reflect the most current legislation. Laws change frequently, and you should verify current requirements with official sources such as provincial landlord-tenant boards or legal professionals.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">10.4 &ldquo;As Is&rdquo; and &ldquo;As Available&rdquo;</h3>
          <p className="font-semibold">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">10.5 Third-Party Services</h3>
          <p>
            We use third-party services for payments (Stripe), authentication (Google OAuth), data storage (Supabase), and email (Resend). Your use of the Service is also subject to the terms and privacy policies of these third-party providers.
          </p>
        </section>

        {/* Section 11 */}
        <section id="limitation" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
          <div className="bg-gray-100 p-6 rounded-lg">
            <p className="font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                PROPERTYCHECK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </li>
              <li>
                OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED CANADIAN DOLLARS ($100 CAD).
              </li>
              <li>
                THESE LIMITATIONS APPLY WHETHER THE CLAIM IS BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY.
              </li>
            </ul>
            <p className="mt-4">
              Some provinces do not allow the exclusion or limitation of certain damages. In such provinces, our liability is limited to the greatest extent permitted by law.
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section id="indemnification" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless PropertyCheck, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, costs, and expenses (including reasonable legal fees) arising from or related to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of the Service;</li>
            <li>Your User Content;</li>
            <li>Your violation of these Terms;</li>
            <li>Your violation of any rights of another party;</li>
            <li>Any dispute between you and a landlord, property manager, or other third party.</li>
          </ul>
        </section>

        {/* Section 13 */}
        <section id="termination" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">13.1 Termination by You</h3>
          <p>
            You may terminate your account at any time by contacting us at <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a> or through your account settings.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">13.2 Termination by Us</h3>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">13.3 Effect of Termination</h3>
          <p>
            Upon termination, you may request a copy of your User Content within 30 days. After this period, we may delete your data in accordance with our Privacy Policy. Provisions of these Terms that by their nature should survive termination will survive, including ownership provisions, warranty disclaimers, and limitations of liability.
          </p>
        </section>

        {/* Section 14 */}
        <section id="disputes" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Dispute Resolution</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">14.1 Informal Resolution</h3>
          <p>
            Before initiating any formal dispute resolution, you agree to first contact us at <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a> to attempt to resolve the dispute informally. We will attempt to resolve disputes within 30 days.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">14.2 Small Claims Court</h3>
          <p>
            Either party may bring a claim in small claims court in the province of your residence if the claim qualifies for small claims jurisdiction.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">14.3 Arbitration</h3>
          <p>
            If informal resolution fails and the dispute does not qualify for small claims court, the dispute shall be resolved by binding arbitration administered by the ADR Institute of Canada or a similar body in accordance with its rules. The arbitration shall take place in your province of residence (or remotely, if available), and the decision of the arbitrator shall be final and binding.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">14.4 Class Action Waiver</h3>
          <p>
            TO THE EXTENT PERMITTED BY LAW, YOU AGREE THAT ANY DISPUTE RESOLUTION WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
          </p>
        </section>

        {/* Section 15 */}
        <section id="governing-law" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of your province of residence in Canada, without regard to conflict of law principles. For residents of Quebec, this agreement is governed by the laws of Quebec and the federal laws of Canada applicable therein.
          </p>
          <p className="mt-4">
            The courts of your province of residence shall have exclusive jurisdiction over any disputes arising from these Terms, subject to the dispute resolution provisions above.
          </p>
        </section>

        {/* Section 16 */}
        <section id="modifications" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of material changes by:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Posting the updated Terms on our website with a new &ldquo;Last Updated&rdquo; date;</li>
            <li>Sending an email notification to the address associated with your account;</li>
            <li>Displaying a notice within the Service.</li>
          </ul>
          <p className="mt-4">
            Material changes will take effect 30 days after notice, unless a longer period is required by law. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the modified Terms.
          </p>
          <p className="mt-4">
            If you do not agree to the modified Terms, you must stop using the Service and may cancel your subscription in accordance with Section 6.
          </p>
        </section>

        {/* Section 17 */}
        <section id="general" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">17. General Provisions</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.1 Entire Agreement</h3>
          <p>
            These Terms, together with the Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and PropertyCheck regarding the Service.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.2 Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be modified to the minimum extent necessary to make it enforceable, or if modification is not possible, severed from these Terms. The remaining provisions shall remain in full force and effect.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.3 Waiver</h3>
          <p>
            Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.4 Assignment</h3>
          <p>
            You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.5 Force Majeure</h3>
          <p>
            PropertyCheck shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, pandemic, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.6 No Third-Party Beneficiaries</h3>
          <p>
            These Terms do not create any third-party beneficiary rights.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">17.7 Language</h3>
          <p>
            These Terms are written in English. Any translation is provided for convenience only, and the English version shall prevail in case of conflict. For Quebec residents, you acknowledge that you have requested that these Terms be drawn up in English. Vous reconnaissez avoir demandé que les présentes conditions soient rédigées en anglais.
          </p>
        </section>

        {/* Section 18 */}
        <section id="contact" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p className="font-semibold text-lg">PropertyCheck</p>
            <p className="mt-2">Email: <a href="mailto:support@propertycheck.app" className="text-primary-600 hover:underline">support@propertycheck.app</a></p>
            <p>Legal Inquiries: <a href="mailto:legal@propertycheck.app" className="text-primary-600 hover:underline">legal@propertycheck.app</a></p>
            <p className="mt-4 text-sm text-gray-600">
              For Quebec residents - Person responsible for the protection of personal information:<br />
              Email: <a href="mailto:privacy@propertycheck.app" className="text-primary-600 hover:underline">privacy@propertycheck.app</a>
            </p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}
