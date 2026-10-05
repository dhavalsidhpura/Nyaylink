import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'NyayaLink <onboarding@resend.dev>';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendNotificationEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!resend) {
      console.log(`\n📧 [EMAIL SIMULATION]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`----------------------------------------`);
      return { success: true, simulated: true };
    }

    const response = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title: string, body: string, cta?: { label: string; path: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #073B5C; margin-bottom: 10px;">${escapeHtml(title)}</h2>
      ${body}
      ${
        cta
          ? `<p style="margin-top: 24px;"><a href="${APP_URL}${cta.path}" style="background:#073B5C;color:#F4B942;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">${escapeHtml(cta.label)}</a></p>`
          : ''
      }
      <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">NyayaLink is a legal-technology platform. It is not a law firm and does not provide legal advice itself.</p>
    </div>
  `;
}

const p = (html: string) => `<p style="color: #475569; font-size: 14px;">${html}</p>`;
const box = (html: string) =>
  `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #0f172a;">${html}</div>`;

export function buildOtpEmail(code: string) {
  return layout(
    'Your NyayaLink sign-in code',
    p('Use this one-time code to sign in. It expires in 10 minutes.') +
      box(`<span style="font-size: 28px; letter-spacing: 6px; font-family: monospace; font-weight: bold;">${escapeHtml(code)}</span>`) +
      p('If you did not request this code, you can ignore this email.')
  );
}

export function buildPaymentReceiptEmail(clientName: string, reference: string, amount: number, title: string, path: string) {
  return layout(
    '✓ Payment Confirmed',
    p(`Hello <strong>${escapeHtml(clientName)}</strong>,`) +
      p(`We have received your payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${escapeHtml(title)}</strong>.`) +
      box(`Reference: <strong>${escapeHtml(reference)}</strong><br/>Your GST invoice is available in your dashboard.`),
    { label: 'Open your dashboard', path }
  );
}

export function buildStatusUpdateEmail(clientName: string, orderNumber: string, newStatus: string, remarks?: string) {
  return layout(
    'Filing Status Update',
    p(`Hello <strong>${escapeHtml(clientName)}</strong>,`) +
      p(`The status of your application <strong>${escapeHtml(orderNumber)}</strong> has been updated to:`) +
      box(`<strong style="text-transform: uppercase;">${escapeHtml(newStatus.replace(/_/g, ' '))}</strong>${remarks ? `<br/>${escapeHtml(remarks)}` : ''}`),
    { label: 'View application', path: `/orders/${encodeURIComponent(orderNumber)}` }
  );
}

export function buildDocumentRejectedEmail(clientName: string, orderNumber: string, docName: string, note: string) {
  return layout(
    'Action needed: please re-upload a document',
    p(`Hello <strong>${escapeHtml(clientName)}</strong>,`) +
      p(`Our compliance team could not accept <strong>${escapeHtml(docName)}</strong> for application <strong>${escapeHtml(orderNumber)}</strong>.`) +
      box(`Reason: ${escapeHtml(note)}`),
    { label: 'Re-upload document', path: `/orders/${encodeURIComponent(orderNumber)}` }
  );
}

export function buildNewMessageEmail(recipientName: string, orderNumber: string, isQuery: boolean) {
  return layout(
    isQuery ? 'Your compliance desk has a question' : 'New message on your application',
    p(`Hello <strong>${escapeHtml(recipientName)}</strong>,`) +
      p(`There is a new ${isQuery ? 'query that needs your response' : 'message'} on application <strong>${escapeHtml(orderNumber)}</strong>.`),
    { label: 'Open conversation', path: `/orders/${encodeURIComponent(orderNumber)}` }
  );
}

export function buildPaymentRequestEmail(clientName: string, orderNumber: string, amount: number, description: string) {
  return layout(
    'Payment requested for your application',
    p(`Hello <strong>${escapeHtml(clientName)}</strong>,`) +
      p(`A payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> has been requested on application <strong>${escapeHtml(orderNumber)}</strong>.`) +
      box(escapeHtml(description)),
    { label: 'Review & pay', path: `/orders/${encodeURIComponent(orderNumber)}` }
  );
}

export function buildConsultationConfirmedEmail(name: string, lawyerName: string, startsAt: Date, number: string) {
  const when = startsAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
  return layout(
    'Consultation confirmed',
    p(`Hello <strong>${escapeHtml(name)}</strong>,`) +
      p(`Your consultation <strong>${escapeHtml(number)}</strong> with <strong>${escapeHtml(lawyerName)}</strong> is confirmed.`) +
      box(`🗓️ ${escapeHtml(when)} (IST)`),
    { label: 'View booking', path: '/dashboard' }
  );
}

export function buildStaffInviteEmail(name: string, role: string) {
  return layout(
    'You have been added to the NyayaLink operations team',
    p(`Hello <strong>${escapeHtml(name)}</strong>,`) +
      p(`You have been onboarded as <strong>${escapeHtml(role.replace(/_/g, ' '))}</strong>. Sign in with a one-time code sent to this email address.`),
    { label: 'Sign in', path: '/login' }
  );
}

export function buildLawyerVerificationEmail(name: string, verified: boolean, note?: string | null) {
  return layout(
    verified ? 'Your वकील Search profile is verified' : 'Update on your वकील Search application',
    p(`Hello <strong>${escapeHtml(name)}</strong>,`) +
      p(
        verified
          ? 'Your Bar Council enrollment has been verified and your profile is now visible in वकील Search.'
          : 'We could not verify your Bar Council enrollment at this time.'
      ) +
      (note ? box(escapeHtml(note)) : ''),
    { label: 'Open lawyer dashboard', path: '/lawyer/dashboard' }
  );
}
