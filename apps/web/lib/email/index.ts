/**
 * Email service using Resend
 *
 * Handles all transactional emails for PropertyCheck
 */

import { Resend } from 'resend';

// Lazy-initialized Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_YOUR_RESEND_API_KEY') {
      console.warn('RESEND_API_KEY not configured - emails will be logged but not sent');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// Get configured from email
function getFromEmail(): string {
  return process.env.FROM_EMAIL || 'noreply@propertycheck.app';
}

// Brand colors for email templates
const BRAND = {
  primary: '#2563eb',      // Blue (Check)
  primaryDark: '#1d4ed8',
  dark: '#0f172a',         // Dark (Property)
  gray: '#64748b',
  background: '#f8fafc',
  white: '#ffffff',
};

/**
 * Send premium welcome email after successful subscription
 */
export async function sendPremiumWelcomeEmail(params: {
  to: string;
  userName?: string;
  planType: 'monthly' | 'annual';
  periodEnd: Date;
}): Promise<{ success: boolean; error?: string }> {
  const { to, userName, planType, periodEnd } = params;
  const fromEmail = getFromEmail();

  const planLabel = planType === 'annual' ? 'Annual' : 'Monthly';
  const renewalDate = periodEnd.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PropertyCheck Premium!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BRAND.background};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.background};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: ${BRAND.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.dark} 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                <span style="color: ${BRAND.white};">Property</span><span style="color: ${BRAND.primary};">Check</span>
              </h1>
              <p style="margin: 8px 0 0; color: ${BRAND.primary}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Premium</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; color: ${BRAND.dark}; font-weight: 700;">
                Welcome to Premium${userName ? `, ${userName}` : ''}! 🎉
              </h2>

              <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.gray}; line-height: 1.6;">
                Thank you for upgrading to PropertyCheck Premium! You now have access to all premium features to protect yourself during your rental journey.
              </p>

              <!-- Plan Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border-left: 4px solid ${BRAND.primary};">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.gray}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Plan</p>
                    <p style="margin: 0 0 4px; font-size: 20px; color: ${BRAND.dark}; font-weight: 700;">${planLabel} Premium</p>
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.gray};">Renews on ${renewalDate}</p>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <h3 style="margin: 32px 0 16px; font-size: 18px; color: ${BRAND.dark}; font-weight: 600;">What's included:</h3>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: ${BRAND.primary}; font-size: 18px;">✓</span>
                    <span style="margin-left: 12px; font-size: 15px; color: ${BRAND.dark};">Unlimited property inspections</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: ${BRAND.primary}; font-size: 18px;">✓</span>
                    <span style="margin-left: 12px; font-size: 15px; color: ${BRAND.dark};">Unlimited photo documentation</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: ${BRAND.primary}; font-size: 18px;">✓</span>
                    <span style="margin-left: 12px; font-size: 15px; color: ${BRAND.dark};">Professional PDF reports (no watermark)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: ${BRAND.primary}; font-size: 18px;">✓</span>
                    <span style="margin-left: 12px; font-size: 15px; color: ${BRAND.dark};">Move-in vs Move-out comparison reports</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: ${BRAND.primary}; font-size: 18px;">✓</span>
                    <span style="margin-left: 12px; font-size: 15px; color: ${BRAND.dark};">Province-specific legal guidance</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: ${BRAND.primary}; font-size: 18px;">✓</span>
                    <span style="margin-left: 12px; font-size: 15px; color: ${BRAND.dark};">Priority support</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://propertycheck.app'}/dashboard"
                       style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); color: ${BRAND.white}; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.background}; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.gray};">
                Questions? Reply to this email or contact us at support@propertycheck.app
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} PropertyCheck. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Check if API key is configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_YOUR_RESEND_API_KEY') {
    console.log('=== EMAIL (DEV MODE - NOT SENT) ===');
    console.log('To:', to);
    console.log('Subject: Welcome to PropertyCheck Premium!');
    console.log('Plan:', planLabel);
    console.log('Renewal:', renewalDate);
    return { success: true };
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: `PropertyCheck <${fromEmail}>`,
      to: [to],
      subject: 'Welcome to PropertyCheck Premium! 🎉',
      html,
    });

    if (error) {
      console.error('Failed to send premium welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Premium welcome email sent to ${to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending premium welcome email:', message);
    return { success: false, error: message };
  }
}

/**
 * Send payment failed notification email
 */
export async function sendPaymentFailedEmail(params: {
  to: string;
  userName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, userName } = params;
  const fromEmail = getFromEmail();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Issue - PropertyCheck</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BRAND.background};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.background};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: ${BRAND.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.dark} 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                <span style="color: ${BRAND.white};">Property</span><span style="color: ${BRAND.primary};">Check</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; color: ${BRAND.dark}; font-weight: 700;">
                Payment Issue${userName ? `, ${userName}` : ''}
              </h2>

              <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.gray}; line-height: 1.6;">
                We were unable to process your payment for PropertyCheck Premium. To continue using premium features, please update your payment method.
              </p>

              <!-- Warning Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0; font-size: 15px; color: #92400e;">
                      <strong>Action Required:</strong> Update your payment method to avoid losing access to premium features.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://propertycheck.app'}/dashboard/settings"
                       style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); color: ${BRAND.white}; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                      Update Payment Method
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.background}; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.gray};">
                Questions? Reply to this email or contact us at support@propertycheck.app
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} PropertyCheck. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Check if API key is configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_YOUR_RESEND_API_KEY') {
    console.log('=== EMAIL (DEV MODE - NOT SENT) ===');
    console.log('To:', to);
    console.log('Subject: Payment Issue - PropertyCheck');
    return { success: true };
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: `PropertyCheck <${fromEmail}>`,
      to: [to],
      subject: 'Payment Issue - Action Required',
      html,
    });

    if (error) {
      console.error('Failed to send payment failed email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Payment failed email sent to ${to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending payment failed email:', message);
    return { success: false, error: message };
  }
}
