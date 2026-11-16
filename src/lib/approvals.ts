import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import { logAuditEvent } from '@/lib/audit';
import type { ApprovalType, ApprovalStatus, Role } from '@prisma/client';

export interface CreateApprovalParams {
  type: ApprovalType;
  title: string;
  reason: string;
  payload: Record<string, any>;
  requesterId: string;
  requesterRole: Role;
  ipAddress?: string | null;
}

export interface ReviewApprovalParams {
  approvalId: string;
  reviewerId: string;
  reviewerRole: Role;
  action: 'APPROVE' | 'REJECT';
  reviewNotes?: string;
  ipAddress?: string | null;
}

/**
 * Creates an approval request requiring second-person peer review (Maker-Checker).
 */
export async function createApprovalRequest(params: CreateApprovalParams) {
  const request = await prisma.approvalRequest.create({
    data: {
      type: params.type,
      title: params.title,
      reason: params.reason,
      payload: params.payload,
      requesterId: params.requesterId,
      status: 'PENDING',
    },
  });

  await logAuditEvent({
    actorId: params.requesterId,
    actorRole: params.requesterRole,
    action: `APPROVAL_REQUESTED_${params.type}`,
    entityType: 'ApprovalRequest',
    entityId: request.id,
    details: { title: params.title, reason: params.reason },
    ipAddress: params.ipAddress,
  });

  return request;
}

/**
 * Reviews and either executes or rejects an approval request.
 * Strictly blocks self-approval: the reviewer must be distinct from the maker.
 */
export async function reviewApprovalRequest(params: ReviewApprovalParams) {
  const request = await prisma.approvalRequest.findUnique({
    where: { id: params.approvalId },
  });

  if (!request) {
    throw new HttpError(404, 'Approval request not found.');
  }

  if (request.status !== 'PENDING') {
    throw new HttpError(400, `Approval request has already been ${request.status.toLowerCase()}.`);
  }

  // Strict Maker-Checker Rule: Super Admins and managers cannot approve their own requests
  if (request.requesterId === params.reviewerId) {
    throw new HttpError(
      403,
      'Maker-Checker Security Policy Violation: You cannot approve your own request. A second qualified officer must review and approve this action.'
    );
  }

  const newStatus: ApprovalStatus = params.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  const updated = await prisma.approvalRequest.update({
    where: { id: request.id },
    data: {
      status: newStatus,
      reviewerId: params.reviewerId,
      reviewNotes: params.reviewNotes || null,
      reviewedAt: new Date(),
    },
  });

  await logAuditEvent({
    actorId: params.reviewerId,
    actorRole: params.reviewerRole,
    action: `APPROVAL_${newStatus}_${request.type}`,
    entityType: 'ApprovalRequest',
    entityId: request.id,
    details: {
      requesterId: request.requesterId,
      reviewerNotes: params.reviewNotes,
    },
    ipAddress: params.ipAddress,
  });

  return updated;
}
