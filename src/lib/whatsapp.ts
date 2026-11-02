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
    console.log(`Message:\n${bodyText}`);
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

export type OrderMilestoneType =
  | 'BOOKING_CONFIRMED'
  | 'NAME_APPROVED'
  | 'FORMS_SUBMITTED'
  | 'QUERY_RAISED'
  | 'APPROVED_COMPLETED'
  | 'TEST_ALERT';

/** Dispatches a structured milestone alert to client's WhatsApp */
export async function dispatchMilestoneWhatsApp(params: {
  phone: string;
  clientName: string;
  orderNumber: string;
  serviceTitle: string;
  milestone: OrderMilestoneType;
  srn?: string;
  cin?: string;
  remarks?: string;
  amountPaid?: number;
}) {
  const { phone, clientName, orderNumber, serviceTitle, milestone, srn, cin, remarks, amountPaid } = params;

  let bodyText = '';

  switch (milestone) {
    case 'BOOKING_CONFIRMED':
      bodyText = `🎉 *Payment & Booking Confirmed!*\n\nHello *${clientName}*,\nThank you for choosing NyayaLink! Your booking for *${serviceTitle}* (${orderNumber}) is confirmed${amountPaid ? ` (Advance Token: ₹${amountPaid.toLocaleString('en-IN')})` : ''}.\n\n👨‍💼 *Dedicated Desk:* A Senior Chartered Accountant has been assigned to your filing.\n\n👉 *Next Step:* Please upload your KYC documents or share them on WhatsApp:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;
      break;

    case 'NAME_APPROVED':
      bodyText = `🎊 *Good News: Name Approved by ROC!*\n\nHello *${clientName}*,\nYour proposed entity name for *${serviceTitle}* (${orderNumber}) has been officially reserved by the Ministry of Corporate Affairs under Rule 8.\n\n📑 Our CA desk is now preparing your electronic Memorandum (e-MOA) and Articles of Association (e-AOA).\n\nReview draft documents live:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;
      break;

    case 'FORMS_SUBMITTED':
      bodyText = `🏛️ *Forms Submitted to Government Registry!*\n\nHello *${clientName}*,\nYour statutory application for *${serviceTitle}* (${orderNumber}) has been uploaded to the official portal.\n\n📋 *Government SRN / Challan #:* ${srn || 'SRN Generated'}\n\nOur compliance team is monitoring the government verification queue. Track real-time progress:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;
      break;

    case 'QUERY_RAISED':
      bodyText = `⚠️ *Action Required: Clarification Needed*\n\nHello *${clientName}*,\nThe government registry has requested a clarification regarding your filing for *${serviceTitle}* (${orderNumber}):\n\n📝 *Note:* "${remarks || 'Document re-verification requested'}"\n\nPlease submit the required detail so we can resubmit immediately:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;
      break;

    case 'APPROVED_COMPLETED':
      bodyText = `🚀 *Congratulations! Entity Officially Registered!* 🇮🇳\n\nHello *${clientName}*,\nYour filing for *${serviceTitle}* (${orderNumber}) has been *OFFICIALLY APPROVED* by the Registrar!\n\n${cin ? `📜 *Official CIN / Reg #:* ${cin}\n` : ''}${srn ? `🏛️ *Final SRN:* ${srn}\n` : ''}\nAll statutory deliverables (Certificate of Incorporation, e-PAN, e-MOA & e-AOA) are ready for download in your encrypted vault:\n${APP_URL}/orders/${orderNumber}\n\nWelcome to India's founder community!\n— Team NyayaLink`;
      break;

    case 'TEST_ALERT':
    default:
      bodyText = `🔔 *NyayaLink WhatsApp Milestone Alerts Active*\n\nHello *${clientName}*,\nThis is a test notification confirming that live status alerts for *${serviceTitle}* (${orderNumber}) are connected to this WhatsApp number (+${formatE164Phone(phone)}).\n\nYou will automatically receive updates when your name is reserved, government SRNs are generated, and certificates are issued.\n\nTrack your order anytime:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;
      break;
  }

  return sendWhatsAppMessage({ to: phone, bodyText });
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

  if (status === 'APPROVED') {
    return dispatchMilestoneWhatsApp({
      phone,
      clientName,
      orderNumber,
      serviceTitle,
      milestone: 'APPROVED_COMPLETED',
      srn,
      cin: remarks?.match(/CIN:\s*([A-Z0-9]+)/i)?.[1],
      remarks,
    });
  }

  if (status === 'QUERY_RAISED') {
    return dispatchMilestoneWhatsApp({
      phone,
      clientName,
      orderNumber,
      serviceTitle,
      milestone: 'QUERY_RAISED',
      srn,
      remarks,
    });
  }

  if (status === 'IN_PROGRESS' && srn) {
    return dispatchMilestoneWhatsApp({
      phone,
      clientName,
      orderNumber,
      serviceTitle,
      milestone: 'FORMS_SUBMITTED',
      srn,
      remarks,
    });
  }

  const statusDisplay = status.replace(/_/g, ' ');
  let message = `⚖️ *NyayaLink Docket Update*\n\nHello *${clientName}*,\nYour application for *${serviceTitle}* (${orderNumber}) is now:\n👉 *${statusDisplay}*\n`;

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

  const message = `⚠️ *Action Required: Document Re-Upload*\n\nHello *${clientName}*,\nOur CA desk reviewed your document *${docName}* for filing *${orderNumber}* and noticed an issue:\n\n💬 *Reason:* "${rejectNote}"\n\nPlease upload a revised copy to avoid government registry delays:\n${APP_URL}/orders/${orderNumber}\n\n— Team NyayaLink`;

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

  return dispatchMilestoneWhatsApp({
    phone,
    clientName,
    orderNumber,
    serviceTitle,
    milestone: 'BOOKING_CONFIRMED',
    amountPaid,
  });
}
