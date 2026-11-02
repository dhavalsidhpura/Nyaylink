import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, requireRole, ROLE_GROUPS, HttpError } from '@/lib/authz';
import { getActiveService } from '@/lib/catalog';
import { computeQuote, formatINR, stateName } from '@/lib/pricing';
import { num } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

const schema = z.object({
  leadId: z.string().min(1),
  serviceSlug: z.string().min(1),
  clientState: z.string().length(2).default('MH'),
  tokenAmount: z.number().min(99).max(500000).default(999),
  customNote: z.string().trim().max(300).optional(),
});

export const POST = apiHandler(async (request: Request) => {
  const user = await requireRole(ROLE_GROUPS.staff);
  const input = schema.parse(await request.json());

  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
  });
  if (!lead) throw new HttpError(404, 'Lead not found.');

  const service = await getActiveService(input.serviceSlug);
  if (!service) throw new HttpError(404, 'Service not found in catalog.');

  const quote = computeQuote(
    {
      professionalFee: num(service.professionalFee),
      govtFee: num(service.govtFee),
      gstRate: num(service.gstRate),
    },
    input.clientState
  );

  const baseUrl = process.env.NEXTAUTH_URL || 'https://nyayalink.vercel.app';
  const checkoutUrl = `${baseUrl}/services/${service.slug}?state=${encodeURIComponent(
    input.clientState
  )}&advance=${input.tokenAmount === 999 ? 'true' : 'custom'}&leadId=${encodeURIComponent(lead.id)}`;

  const customerFirstName = lead.fullName.split(' ')[0] || lead.fullName;
  const stateLabel = stateName(input.clientState);

  // Pre-approved WhatsApp message template for Sales Telecaller
  const whatsappScript =
    `Namaste ${customerFirstName} ji! 🙏\n\n` +
    `Greetings from NyayaLink (Official CA/CS Legal Platform).\n\n` +
    `Regarding your inquiry for *${service.title}* (${stateLabel}):\n` +
    `• Professional Fee: ₹${formatINR(quote.professionalFee)}\n` +
    `• Govt Pass-Through (Pure Agent): ₹${formatINR(quote.govtFee)}\n` +
    `• Total Estimated Package: ₹${formatINR(quote.total)}\n\n` +
    `⚡ *Special Advance Token:* You can initiate your filing right now by locking your dedicated CA/CS compliance desk for just *₹${formatINR(
      input.tokenAmount
    )}*.\n\n` +
    `Click here to activate your filing docket & vault:\n` +
    `${checkoutUrl}\n\n` +
    `Need clarification? Reply to this message to connect directly with your assigned compliance officer.`;

  // Auto update lead status to CONTACTED if it was NEW
  if (lead.status === 'NEW') {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'CONTACTED' },
    });
  }

  return NextResponse.json({
    success: true,
    checkoutUrl,
    whatsappScript,
    quote: {
      professionalFee: quote.professionalFee,
      govtFee: quote.govtFee,
      total: quote.total,
    },
  });
});
