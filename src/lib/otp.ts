import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import { sendNotificationEmail, buildOtpEmail } from '@/lib/email';
import { requireEnv } from '@/lib/env';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

export type Identifier = { kind: 'email' | 'phone'; value: string };

/** Accepts an email or an Indian mobile number and returns a canonical form. */
export function normalizeIdentifier(raw: string): Identifier | null {
  const input = raw.trim();
  if (input.includes('@')) {
    const email = input.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { kind: 'email', value: email } : null;
  }
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? { kind: 'phone', value: `+91${digits}` } : null;
}

function hashCode(identifier: string, code: string) {
  return crypto.createHmac('sha256', requireEnv('NEXTAUTH_SECRET')).update(`${identifier}:${code}`).digest('hex');
}

async function sendSms(phone: string, code: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  if (!authKey || !templateId) {
    if (process.env.NODE_ENV === 'production') throw new HttpError(503, 'SMS login is temporarily unavailable. Please use email.');
    console.log(`\n📱 [SMS OTP SIMULATION] ${phone}: ${code}\n`);
    return;
  }
  // MSG91 OTP API (DLT-approved template must contain ##OTP##)
  const res = await fetch('https://control.msg91.com/api/v5/flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: authKey },
    body: JSON.stringify({ template_id: templateId, recipients: [{ mobiles: phone.replace('+', ''), OTP: code }] }),
  });
  if (!res.ok) {
    console.error('MSG91 send failed', res.status, await res.text().catch(() => ''));
    throw new HttpError(502, 'Could not send the SMS. Please try again or use email.');
  }
}

export async function requestOtp(id: Identifier, ip: string | null) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.otpCode.findMany({
    where: { identifier: id.value, createdAt: { gte: hourAgo } },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  if (recent.length >= MAX_PER_HOUR) throw new HttpError(429, 'Too many codes requested. Please try again in an hour.');
  if (recent[0] && Date.now() - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new HttpError(429, 'Please wait 30 seconds before requesting another code.');
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  await prisma.otpCode.create({
    data: { identifier: id.value, codeHash: hashCode(id.value, code), expiresAt: new Date(Date.now() + OTP_TTL_MS), ip },
  });

  if (id.kind === 'email') {
    await sendNotificationEmail({ to: id.value, subject: `${code} is your NyayaLink sign-in code`, html: buildOtpEmail(code) });
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') console.log(`📧 [EMAIL OTP] ${id.value}: ${code}`);
  } else {
    await sendSms(id.value, code);
  }
}

/** Returns true and consumes the code when it matches; counts failed attempts otherwise. */
export async function verifyOtp(id: Identifier, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({
    where: { identifier: id.value, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!record || record.attempts >= MAX_ATTEMPTS) return false;

  const expected = Buffer.from(record.codeHash, 'hex');
  const actual = Buffer.from(hashCode(id.value, code.trim()), 'hex');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return false;
  }

  // Conditional update so a code can only be consumed once even under concurrent requests.
  const consumed = await prisma.otpCode.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  return consumed.count === 1;
}
