import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Simulating Admin Route Protection (/admin)
  if (pathname.startsWith('/admin')) {
    // In production, verify session cookie / JWT token role here
    const authHeader = request.headers.get('authorization');
    console.log(`🔒 Accessing Admin Console: ${pathname}`);
    
    // Pass through for now, or redirect to login if unauthenticated
  }

  // 2. Simulating Customer Dashboard Route Protection (/dashboard)
  if (pathname.startsWith('/dashboard')) {
    console.log(`👤 Accessing Client Dashboard: ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};