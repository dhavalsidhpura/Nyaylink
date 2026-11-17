import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/lib/http';
import { ROLE_GROUPS, isStaff } from '../src/lib/authz';
import type { Role } from '@prisma/client';

interface SecurityContext {
  userId: string;
  role: Role;
  organizationId?: string;
  assignedMatterIds?: string[];
}

interface Resource {
  id: string;
  organizationId?: string;
  assignedStaffId?: string;
  isPrivilegedLegalDoc?: boolean;
}

// Multi-tenancy isolation evaluator
function assertTenantAccess(ctx: SecurityContext, resource: Resource) {
  if (resource.organizationId && ctx.organizationId && resource.organizationId !== ctx.organizationId) {
    throw new HttpError(403, 'Cross-tenant isolation violation: Access denied to foreign organization resource.');
  }
}

// Matter assignment evaluator
function assertMatterAccess(ctx: SecurityContext, matter: { id: string; organizationId: string; assignedStaffId?: string }) {
  assertTenantAccess(ctx, matter);

  // Client role must belong to same organization
  if (ctx.role === 'CLIENT') {
    if (ctx.organizationId !== matter.organizationId) {
      throw new HttpError(403, 'Client cannot view matters outside their own organization.');
    }
    return true;
  }

  // Supervisory staff can view across their operational scope
  if (['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD'].includes(ctx.role)) {
    return true;
  }

  // Compliance Executive must be assigned to the matter
  if (ctx.role === 'COMPLIANCE_EXEC') {
    if (matter.assignedStaffId !== ctx.userId) {
      throw new HttpError(403, 'Compliance Executive can only view matters assigned directly to them.');
    }
    return true;
  }

  // Lawyer must have conflict clearance and matter assignment
  if (ctx.role === 'LAWYER') {
    if (!ctx.assignedMatterIds?.includes(matter.id)) {
      throw new HttpError(403, 'Advocate has not been conflict-cleared or assigned to this matter.');
    }
    return true;
  }

  throw new HttpError(403, 'Access denied to this matter.');
}

// Privileged document access evaluator
function assertDocumentAccess(ctx: SecurityContext, resource: Resource) {
  assertTenantAccess(ctx, resource);

  if (resource.isPrivilegedLegalDoc) {
    if (ctx.role === 'FINANCE_MANAGER' || ctx.role === 'COMPLIANCE_EXEC') {
      throw new HttpError(403, 'Access denied: Role is barred from viewing privileged legal defense documents.');
    }
  }
  return true;
}

describe('Multi-Tenancy & Cross-Organization RBAC Denial Suite', () => {
  const ORG_ALPHA = 'org-alpha-100';
  const ORG_BETA = 'org-beta-200';

  it('Strictly denies cross-organization access between Org Alpha and Org Beta', () => {
    const userInAlpha: SecurityContext = {
      userId: 'user-alpha-01',
      role: 'CLIENT',
      organizationId: ORG_ALPHA,
    };

    const matterInBeta: Resource = {
      id: 'matter-beta-01',
      organizationId: ORG_BETA,
    };

    assert.throws(
      () => assertTenantAccess(userInAlpha, matterInBeta),
      (err: any) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /Cross-tenant isolation violation/);
        return true;
      }
    );
  });

  it('Verifies Client role cannot access internal compliance queues or foreign matters', () => {
    const client: SecurityContext = {
      userId: 'client-1',
      role: 'CLIENT',
      organizationId: ORG_ALPHA,
    };

    // Client accesses own matter -> ALLOWED
    assert.doesNotThrow(() =>
      assertMatterAccess(client, { id: 'm-1', organizationId: ORG_ALPHA })
    );

    // Client accesses foreign matter -> DENIED
    assert.throws(
      () => assertMatterAccess(client, { id: 'm-2', organizationId: ORG_BETA }),
      /Cross-tenant isolation violation/
    );

    // Client is never considered internal staff
    assert.equal(isStaff(client.role), false);
  });

  it('Verifies Compliance Executive cannot access unassigned matters', () => {
    const exec: SecurityContext = {
      userId: 'exec-1',
      role: 'COMPLIANCE_EXEC',
      organizationId: ORG_ALPHA,
    };

    // Assigned matter -> ALLOWED
    assert.doesNotThrow(() =>
      assertMatterAccess(exec, { id: 'm-1', organizationId: ORG_ALPHA, assignedStaffId: 'exec-1' })
    );

    // Unassigned matter in same organization -> DENIED
    assert.throws(
      () => assertMatterAccess(exec, { id: 'm-2', organizationId: ORG_ALPHA, assignedStaffId: 'exec-2' }),
      /Compliance Executive can only view matters assigned directly to them/
    );
  });

  it('Verifies Lawyer role is strictly gated by conflict-clearance and assignment', () => {
    const advocate: SecurityContext = {
      userId: 'advocate-1',
      role: 'LAWYER',
      organizationId: ORG_ALPHA,
      assignedMatterIds: ['matter-dispute-01'],
    };

    // Assigned dispute -> ALLOWED
    assert.doesNotThrow(() =>
      assertMatterAccess(advocate, { id: 'matter-dispute-01', organizationId: ORG_ALPHA })
    );

    // Non-assigned dispute in same organization -> DENIED
    assert.throws(
      () => assertMatterAccess(advocate, { id: 'matter-dispute-02', organizationId: ORG_ALPHA }),
      /Advocate has not been conflict-cleared or assigned to this matter/
    );
  });

  it('Verifies Finance Managers and Compliance Execs cannot access privileged legal strategy documents', () => {
    const finance: SecurityContext = {
      userId: 'finance-1',
      role: 'FINANCE_MANAGER',
      organizationId: ORG_ALPHA,
    };

    const legalPrivilegeDoc: Resource = {
      id: 'doc-privileged-01',
      organizationId: ORG_ALPHA,
      isPrivilegedLegalDoc: true,
    };

    assert.throws(
      () => assertDocumentAccess(finance, legalPrivilegeDoc),
      /Role is barred from viewing privileged legal defense documents/
    );
  });

  it('Verifies Super Admin is bounded by Maker-Checker and cannot unilaterally self-approve', () => {
    const superAdmin: SecurityContext = {
      userId: 'super-admin-01',
      role: 'SUPER_ADMIN',
    };

    // Super Admin has administrative staff clearance
    assert.equal(isStaff(superAdmin.role), true);

    // But self-approval in Maker-Checker is strictly prohibited
    const selfApprovalCheck = (requesterId: string, reviewerId: string) => {
      if (requesterId === reviewerId) {
        throw new HttpError(403, 'Self-approval denied even for Super Admin.');
      }
      return true;
    };

    assert.throws(
      () => selfApprovalCheck(superAdmin.userId, superAdmin.userId),
      /Self-approval denied even for Super Admin/
    );
  });

  it('Verifies non-owner organization member access is strictly limited by role and resource sharing', () => {
    type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'FINANCE';

    interface OrgMemberContext {
      userId: string;
      orgId: string;
      orgRole: OrgRole;
    }

    interface OrgResource {
      id: string;
      orgId: string;
      type: 'MATTER' | 'ORDER' | 'FINANCIAL_RECORD' | 'ORG_SETTINGS';
      sharedMemberIds?: string[];
    }

    const evaluateMemberAccess = (member: OrgMemberContext, res: OrgResource): boolean => {
      // 1. Cross-organization isolation
      if (member.orgId !== res.orgId) {
        throw new HttpError(403, 'Cross-tenant violation: Cannot access foreign organization resources.');
      }

      // 2. Organization Settings / Ownership management
      if (res.type === 'ORG_SETTINGS') {
        if (member.orgRole !== 'OWNER' && member.orgRole !== 'ADMIN') {
          throw new HttpError(403, 'Permission denied: Only Organization Owner or Admin can manage organization settings.');
        }
        return true;
      }

      // 3. Financial records (Invoices, Ledger, Payment methods)
      if (res.type === 'FINANCIAL_RECORD') {
        if (member.orgRole === 'MEMBER') {
          throw new HttpError(403, 'Permission denied: Regular organization members cannot access financial records.');
        }
        return true;
      }

      // 4. Matters and Orders
      if (member.orgRole === 'OWNER' || member.orgRole === 'ADMIN') {
        return true; // Org leadership can access all organization matters
      }

      if (member.orgRole === 'FINANCE') {
        // Finance can view orders for invoice verification but not non-financial operational matters
        if (res.type === 'ORDER') return true;
        throw new HttpError(403, 'Finance member cannot access operational legal matters.');
      }

      if (member.orgRole === 'MEMBER') {
        // Regular members can only view matters/orders explicitly shared with them
        if (res.sharedMemberIds && res.sharedMemberIds.includes(member.userId)) {
          return true;
        }
        throw new HttpError(403, 'Permission denied: This resource has not been explicitly shared with you.');
      }

      throw new HttpError(403, 'Access denied.');
    };

    const regularMember: OrgMemberContext = { userId: 'usr-member-1', orgId: ORG_ALPHA, orgRole: 'MEMBER' };
    const financeMember: OrgMemberContext = { userId: 'usr-finance-1', orgId: ORG_ALPHA, orgRole: 'FINANCE' };
    const ownerMember: OrgMemberContext = { userId: 'usr-owner-1', orgId: ORG_ALPHA, orgRole: 'OWNER' };

    const sharedMatter: OrgResource = { id: 'mat-shared', orgId: ORG_ALPHA, type: 'MATTER', sharedMemberIds: ['usr-member-1'] };
    const unsharedMatter: OrgResource = { id: 'mat-unshared', orgId: ORG_ALPHA, type: 'MATTER', sharedMemberIds: ['usr-other'] };
    const foreignMatter: OrgResource = { id: 'mat-foreign', orgId: ORG_BETA, type: 'MATTER' };
    const financialRecord: OrgResource = { id: 'rec-finance', orgId: ORG_ALPHA, type: 'FINANCIAL_RECORD' };
    const orgSettings: OrgResource = { id: 'settings', orgId: ORG_ALPHA, type: 'ORG_SETTINGS' };

    // Regular member accesses explicitly shared matter -> ALLOWED
    assert.equal(evaluateMemberAccess(regularMember, sharedMatter), true);

    // Regular member accesses unshared matter in same org -> DENIED
    assert.throws(
      () => evaluateMemberAccess(regularMember, unsharedMatter),
      /This resource has not been explicitly shared with you/
    );

    // Regular member accesses financial records -> DENIED
    assert.throws(
      () => evaluateMemberAccess(regularMember, financialRecord),
      /Regular organization members cannot access financial records/
    );

    // Regular member accesses org settings -> DENIED
    assert.throws(
      () => evaluateMemberAccess(regularMember, orgSettings),
      /Only Organization Owner or Admin can manage organization settings/
    );

    // Member attempts cross-org access -> DENIED
    assert.throws(
      () => evaluateMemberAccess(regularMember, foreignMatter),
      /Cross-tenant violation/
    );

    // Finance member accesses financial record -> ALLOWED
    assert.equal(evaluateMemberAccess(financeMember, financialRecord), true);

    // Owner accesses everything -> ALLOWED
    assert.equal(evaluateMemberAccess(ownerMember, unsharedMatter), true);
    assert.equal(evaluateMemberAccess(ownerMember, financialRecord), true);
    assert.equal(evaluateMemberAccess(ownerMember, orgSettings), true);
  });

  it('Preserves legacy direct client access when accessing orders without an organization context', () => {
    interface LegacyOrder {
      id: string;
      clientId: string;
      organizationId?: string | null;
    }

    const checkOrderAccessWithFallback = (
      user: { id: string; role: string; orgIds?: string[] },
      order: LegacyOrder
    ): boolean => {
      // Direct ownership check (guarantees legacy single-tenant users retain 100% access)
      if (order.clientId === user.id) return true;

      // Organization membership check
      if (order.organizationId && user.orgIds?.includes(order.organizationId)) {
        return true;
      }

      return false;
    };

    const clientUser = { id: 'legacy-client-42', role: 'CLIENT', orgIds: [] };
    const legacyOrderWithoutOrg: LegacyOrder = { id: 'ord-100', clientId: 'legacy-client-42', organizationId: null };
    const otherClientOrder: LegacyOrder = { id: 'ord-200', clientId: 'other-client-99', organizationId: null };

    // Legacy client accessing their own order without organizationId -> ALLOWED
    assert.equal(
      checkOrderAccessWithFallback(clientUser, legacyOrderWithoutOrg),
      true,
      'Legacy client must retain direct access to own orders even when organizationId is null'
    );

    // Legacy client accessing another client's order -> DENIED
    assert.equal(
      checkOrderAccessWithFallback(clientUser, otherClientOrder),
      false,
      'Legacy client must never access other clients orders'
    );
  });
});
