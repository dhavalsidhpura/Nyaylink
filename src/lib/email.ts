import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'NyayLink <onboarding@resend.dev>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendNotificationEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!resend) {
      console.log(`\n📧 [EMAIL NOT CONFIGURED]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`----------------------------------------`);
      return { success: false, configured: false, error: new Error('Email provider is not configured.') };
    }

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export function buildOrderCreatedEmail(clientName: string, orderNumber: string, serviceTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-bottom: 10px;">Application Received</h2>
      <p style="color: #475569; font-size: 14px;">Hello <strong>${clientName}</strong>,</p>
      <p style="color: #475569; font-size: 14px;">Your application for <strong>${serviceTitle}</strong> has been received successfully.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Application Reference</span>
        <h3 style="margin: 5px 0 0 0; color: #0f172a; font-family: monospace;">${orderNumber}</h3>
      </div>
      <p style="color: #475569; font-size: 14px;">Please complete payment and upload your required KYC documents to initiate government filing.</p>
    </div>
  `;
}

export function buildPaymentReceiptEmail(clientName: string, orderNumber: string, amount: number, serviceTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #166534; margin-bottom: 10px;">✓ Payment Confirmed</h2>
      <p style="color: #475569; font-size: 14px;">Hello <strong>${clientName}</strong>,</p>
      <p style="color: #475569; font-size: 14px;">We have received your payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${serviceTitle}</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 12px; color: #166534; font-weight: bold;">Order Reference: ${orderNumber}</span>
      </div>
      <p style="color: #475569; font-size: 14px;">Our compliance experts are reviewing your document uploads to prepare filing forms.</p>
    </div>
  `;
}

export function buildStatusUpdateEmail(clientName: string, orderNumber: string, newStatus: string, remarks?: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-bottom: 10px;">Filing Status Update</h2>
      <p style="color: #475569; font-size: 14px;">Hello <strong>${clientName}</strong>,</p>
      <p style="color: #475569; font-size: 14px;">The status of your application <strong>${orderNumber}</strong> has been updated to:</p>
      <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 14px; color: #c2410c; font-weight: bold; text-transform: uppercase;">${newStatus.replace('_', ' ')}</span>
        ${remarks ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #9a3412;">${remarks}</p>` : ''}
      </div>
      <p style="color: #475569; font-size: 14px;">You can view detailed logs in your client portal dashboard.</p>
    </div>
  `;
}