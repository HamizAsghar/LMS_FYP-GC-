import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verifyemail'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    PUBLIC.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('eduhub_token')?.value;
  const hasClientAuth = request.headers.get('x-eduhub-auth') === '1';

  if (!token && !hasClientAuth) {
    const rolePrefix = pathname.split('/')[1];
    if (['admin', 'student', 'instructor'].includes(rolePrefix)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
