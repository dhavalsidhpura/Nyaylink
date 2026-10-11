/**
 * NyayaLink Automated WhatsApp Notification Dispatcher
 * Compatible with Meta WhatsApp Cloud API (Graph API v19.0+)
 * Falls back to structured simulation logging when credentials are not configured.
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const APP_URL = process.env.NEXTAUTH_URL || 'https://nyayalink.com';

export interface WhatsAppMessagePayload {
  to: string; // e.g. "+919876543210" or "9876543210"
  templateName?: string;
  bodyText: string;
}

/** Formats Indian phone number to international E.164 without leading 0 or spaces */
export function formatE164Phone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

export async function sendWhatsAppMessage({ to, bodyText }: WhatsAppMessagePayload) {
  const formattedPhone = formatE164Phone(to);
  if (!formattedPhone || formattedPhone.length < 10) {
    return { success: false, error: 'Invalid phone number.' };
  }

  // Simulation fallback if Meta credentials are not provided
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log(`\n📱 [WHATSAPP SIMULATION] -> +${formattedPhone}`);
    console.log(`Message: ${bodyText}`);
    console.log(`----------------------------------------`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { preview_url: true, body: bodyText },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('WhatsApp API error:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to dispatch WhatsApp message:', error);
    return { success: false, error };
  }
}

/** Dispatched when an application status or government SRN changes */
export async function notifyStatusUpdateWhatsApp(params: {
  phone: string;
  clientName: string;
  orderNumber: string;
  serviceTitle: string;
  status: string;
  srn?: string;
  remarks?: string;
}) {
  const { phone, clientName, orderNumber, serviceTitle, status, srn, remarks } = params;
  const statusDisplay = status.replace(/_/g, ' ');

  let message = `⚖️ *NyayaLink Docket Update*\n\nHello ${clientName},\nYour application for *${serviceTitle}* (${orderNumber}) is now:\n👉 *${statusDisplay}*\n`;

  if (srn) {
    message += `\n🏛️ *Official Government SRN/ARN:* ${srn}`;
  }

  if (remarks) {
    message += `\n📝 *Filing Note:* ${remarks}`;
  }

  message += `\n\nTrack progress or download challans live:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;

  return sendWhatsAppMessage({ to: phone, bodyText: message });
}

/** Dispatched when client needs to correct or re-upload a defective document */
export async function notifyDocQueryWhatsApp(params: {
  phone: string;
  clientName: string;
  orderNumber: string;
  docName: string;
  rejectNote: string;
}) {
  const { phone, clientName, orderNumber, docName, rejectNote } = params;

  const message = `⚠️ *Action Required: Document Re-Upload*\n\nHello ${clientName},\nOur CA desk reviewed your document *${docName}* for filing *${orderNumber}* and noticed an issue:\n\n💬 *Reason:* "${rejectNote}"\n\nPlease upload a revised copy to avoid government registry delays:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;

  return sendWhatsAppMessage({ to: phone, bodyText: message });
}

/** Dispatched upon successful checkout and order initiation */
export async function notifyOrderCreatedWhatsApp(params: {
  phone: string;
  clientName: string;
  orderNumber: string;
  serviceTitle: string;
  amountPaid: number;
}) {
  const { phone, clientName, orderNumber, serviceTitle, amountPaid } = params;

  const message = `🎉 *Payment Received: ${orderNumber}*\n\nHello ${clientName},\nThank you for choosing NyayaLink! Your payment of ₹${amountPaid.toLocaleString('en-IN')} for *${serviceTitle}* has been verified.\n\nNext step: Please upload your required KYC & entity documents to initiate filing:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;

  return sendWhatsAppMessage({ to: phone, bodyText: message });
}
