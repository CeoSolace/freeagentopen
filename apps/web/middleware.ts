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

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const { pathname } = req.nextUrl;

    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    const token = req.nextauth?.token;

    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
          return true;
        }

        return !!token;
      }
    }
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|\\.\\w+$).*)']
};
