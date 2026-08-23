import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
    timeZone: 'Asia/Kolkata',
  }).format(value);
}

export async function POST(request: Request) {
  const cronSecret = process.env.REMINDER_CRON_SECRET;
  const authorization = request.headers.get('authorization') || '';

  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'Reminder processor is not configured.' },
      { status: 503 },
    );
  }

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 },
    );
  }

  const now = new Date();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  try {
    const reminders = await prisma.complianceReminder.findMany({
      where: { status: 'PENDING', sentAt: null, dueAt: { lte: now } },
      select: {
        id: true,
        title: true,
        dueAt: true,
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, service: { select: { title: true } } } },
      },
      orderBy: { dueAt: 'asc' },
      take: 50,
    });

    for (const reminder of reminders) {
      const claim = await prisma.complianceReminder.updateMany({
        where: { id: reminder.id, status: 'PENDING', sentAt: null },
        data: { status: 'PROCESSING' },
      });

      if (claim.count !== 1) {
        skipped += 1;
        continue;
      }

      const customerName = escapeHtml(reminder.user.name || 'there');
      const title = escapeHtml(reminder.title);
      const serviceTitle = escapeHtml(reminder.order?.service.title || 'your NyayLink service');
      const portalUrl = process.env.NEXTAUTH_URL || 'https://nyayalink.in';
      const result = await sendNotificationEmail({
        to: reminder.user.email,
        subject: `NyayLink compliance reminder: ${reminder.title}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px"><h2 style="color:#073B5C">Upcoming compliance reminder</h2><p style="color:#475569">Hello ${customerName},</p><p style="color:#475569">This is a reminder for <strong>${title}</strong>, related to ${serviceTitle}.</p><p style="color:#475569"><strong>Due date:</strong> ${formatDate(reminder.dueAt)}</p>${reminder.order?.orderNumber ? `<p style="color:#475569"><strong>Case reference:</strong> ${escapeHtml(reminder.order.orderNumber)}</p>` : ''}<p><a href="${escapeHtml(portalUrl)}/dashboard" style="display:inline-block;background:#073B5C;color:#F4B942;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Open your workspace</a></p><p style="font-size:12px;color:#64748b">Dates are based on information confirmed by the service desk. Please contact support if the reminder needs correction.</p></div>`,
      });

      if (result.success) {
        await prisma.complianceReminder.update({
          where: { id: reminder.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
        sent += 1;
      } else {
        await prisma.complianceReminder.update({
          where: { id: reminder.id },
          data: { status: 'PENDING' },
        });
        failed += 1;
      }
    }

    return NextResponse.json({ success: true, processed: reminders.length, sent, failed, skipped });
  } catch (error) {
    console.error('Reminder processor error:', error);
    return NextResponse.json(
      { success: false, error: 'Reminder processing failed.' },
      { status: 500 },
    );
  }
}
