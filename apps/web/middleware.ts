import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getAccessState } from './lib/getAccessState';

const PUBLIC_PATHS = [
  '/',
  '/api/health',
  '/verify',
  '/verify/discord',
  '/billing',
  '/billing/resolve',
  '/billing/return',
  '/banned',
  '/bot'
];

/**
 * Custom middleware built on top of NextAuth's `withAuth`. This middleware
 * ensures that a valid JWT exists on protected routes and then computes
 * additional access constraints using the `getAccessState` helper. When the
 * user fails a check the request is redirected to the appropriate page.
 */
export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // Skip access checks on public paths.
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const token = req.nextauth.token;
    if (!token) {
      // Not authenticated; redirect to home page for sign‑in.
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Compute access state using fields embedded in the token. Note that
    // middleware has no access to the database so only token fields can be
    // checked here.
    const userSummary = {
      id: token.id as string,
      roles: (token.roles as string[]) || [],
      verified: token.verified as boolean,
      accountAllowed: token.accountAllowed as boolean,
      banned: token.banned as boolean,
      openingFeeDue: token.openingFeeDue as boolean,
      paymentMethodAdded: token.paymentMethodAdded as boolean
    };
    const access = getAccessState(userSummary);
    if (!access.allowed) {
      if (access.banned) {
        return NextResponse.redirect(new URL('/banned', req.url));
      }
      if (access.requiresVerification) {
        return NextResponse.redirect(new URL('/verify', req.url));
      }
      if (access.openingFeeDue) {
        return NextResponse.redirect(new URL('/billing', req.url));
      }
    }
    // Allowed to proceed.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Run this callback before our middleware to determine whether we have a
      // valid token at all. For protected paths we require a token; for
      // public paths the callback returns true so that our middleware runs
      // and immediately calls next().
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
          return true;
        }
        return !!token;
      }
    }
  }
);

export const config = {
  // Apply the middleware to all pages except static assets. The regular
  // expression excludes the Next.js internal paths and public files. See
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher for details.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|\.\w+$).*)'
  ]
};
