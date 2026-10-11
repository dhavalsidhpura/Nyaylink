import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { Role } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';

export const STAFF_ROLES: Role[] = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC', 'FINANCE_MANAGER'];

// Who may do what. Every admin route picks one of these groups.
export const ROLE_GROUPS: Record<'staff' | 'superAdmin' | 'ops' | 'caseworkers' | 'finance' | 'assignable', Role[]> = {
  staff: STAFF_ROLES,
  superAdmin: ['SUPER_ADMIN'],
  ops: ['SUPER_ADMIN', 'OPS_MANAGER'],
  caseworkers: ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC'],
  finance: ['SUPER_ADMIN', 'FINANCE_MANAGER'],
  assignable: ['CA_CS_LEAD', 'COMPLIANCE_EXEC'],
};

export type SessionUser = { id: string; role: Role; name: string; email: string };

export { HttpError };

export const isStaff = (role: Role) => STAFF_ROLES.includes(role);

/**
 * Resolves the signed-in user and re-reads the role from the database, so a
 * demoted or deleted account loses access immediately rather than when its JWT expires.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true, email: true },
  });
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, 'Please sign in to continue.');
  return user;
}

export async function requireRole(roles: readonly Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new HttpError(403, 'You do not have permission to perform this action.');
  return user;
}

/** Wraps a route handler so thrown HttpErrors / validation errors become JSON responses. */
export function apiHandler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Next.js control-flow errors (dynamic-usage bailout, redirect, notFound) carry a `digest` — let them through.
      if (error && typeof error === 'object' && 'digest' in error) throw error;
      if (error instanceof HttpError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.join('.');
        return NextResponse.json(
          { success: false, error: field ? `${field}: ${issue.message}` : issue?.message || 'Invalid request.' },
          { status: 400 }
        );
      }
      console.error('API error:', error);
      return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    }
  };
}

export function clientIp(request: Request): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || null;
}

/** Fields safe to expose for a user record — never include `password`. */
export const publicUserSelect = { id: true, name: true, email: true, phone: true, role: true } as const;

/**
 * Case-level access: the owning client, ops leadership, CA/CS leads, and compliance execs on
 * orders assigned to them. Finance staff do not get document/case access.
 */
export function orderAccess(
  user: SessionUser,
  order: { clientId: string; assignedCAId: string | null }
): 'client' | 'staff' | null {
  if (order.clientId === user.id) return 'client';
  if (['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD'].includes(user.role)) return 'staff';
  if (user.role === 'COMPLIANCE_EXEC' && order.assignedCAId === user.id) return 'staff';
  return null;
}
