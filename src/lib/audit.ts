import { prisma } from '@/lib/prisma';
import type { Role } from '@prisma/client';

export interface AuditParams {
  actorId?: string | null;
  actorRole?: Role | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

/**
 * Records an immutable audit log entry in the database.
 * Never throws an error that interrupts primary transaction flow, but logs failures to stderr.
 */
export async function logAuditEvent(params: AuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorRole: params.actorRole || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: params.details ? JSON.parse(JSON.stringify(params.details)) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err: any) {
    console.error('[audit] Failed to record immutable audit log entry:', err?.message, params);
    return null;
  }
}
