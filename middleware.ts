import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { NextRequest } from 'next/server';

interface RequestWithAuth extends NextRequest {
  auth: {
    user?: {
      role?: string;
    };
  } | null;
}

export default auth((req: RequestWithAuth) => {
  const isAuthenticated = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isSignInPage = req.nextUrl.pathname === '/admin/signin';

  // Allow access to sign-in page if not authenticated
  if (isSignInPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/signin', req.url));
    }

    // Check for admin role
    const userRole = req.auth?.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: ['/admin/:path*']
}; 