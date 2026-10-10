import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Edge-level gate (defence in depth). Every route handler still calls requireUser/requireRole,
// which re-checks the role against the database.
const STAFF_ROLES = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC', 'FINANCE_MANAGER'];
const CA_ROLES = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return new NextResponse('Server misconfigured: NEXTAUTH_SECRET is not set.', { status: 500 });
  }

  const token = await getToken({ req: request, secret });
  const role = token?.role as string | undefined;
  const isApi = pathname.startsWith('/api/');

  const deny = (status: 401 | 403) => {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: status === 401 ? 'Please sign in to continue.' : 'Forbidden.' },
        { status }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  };

  if (!token) return deny(401);

  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && !STAFF_ROLES.includes(role || '')) {
    return deny(403);
  }

  if ((pathname.startsWith('/ca') || pathname.startsWith('/api/ca')) && !CA_ROLES.includes(role || '')) {
    return deny(403);
  }

  if ((pathname.startsWith('/lawyer/dashboard') || pathname.startsWith('/api/lawyer/')) && role !== 'LAWYER') {
    // /api/lawyer/apply is open to any signed-in user who wants to join.
    if (pathname !== '/api/lawyer/apply') return deny(403);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/ca/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/invoices/:path*',
    '/lawyer/dashboard/:path*',
    '/lawyer/join',
    '/api/admin/:path*',
    '/api/ca/:path*',
    '/api/lawyer/:path*',
  ],
};
