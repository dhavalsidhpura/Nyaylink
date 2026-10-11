import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS, STAFF_ROLES, publicUserSelect } from '@/lib/authz';
import { sendNotificationEmail, buildStaffInviteEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
  await requireRole(ROLE_GROUPS.staff);
  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    select: { ...publicUserSelect, assignedOrders: { select: { id: true, status: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ success: true, staff });
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC', 'FINANCE_MANAGER']),
});

// Only super admins can onboard staff. Staff sign in with an email OTP — no shared passwords.
export const POST = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.superAdmin);
  const input = schema.parse(await request.json());

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, 'An account with this email already exists.');

  const staffMember = await prisma.user.create({
    data: { name: input.name, email: input.email, role: input.role },
    select: publicUserSelect,
  });

  await sendNotificationEmail({
    to: staffMember.email,
    subject: 'Welcome to the NyayaLink operations team',
    html: buildStaffInviteEmail(staffMember.name, staffMember.role),
  });

  return NextResponse.json({ success: true, staff: staffMember }, { status: 201 });
});
