import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  authConfig,
  isAdminRole,
  isAdminRoute,
  isOpenRoute,
  isPublicRoute,
  isTeacherRoute,
  roleHomePath,
} from './lib/auth.config';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Open routes accessible by both unauthenticated and authenticated visitors
  if (isOpenRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isPublicRoute(pathname) && !token) {
    const signInUrl = new URL(authConfig.pages.signIn, request.url);
    signInUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (isPublicRoute(pathname) && token) {
    return NextResponse.redirect(new URL(roleHomePath(token.role), request.url));
  }

  if (isAdminRoute(pathname) && !isAdminRole(token?.role)) {
    return NextResponse.redirect(new URL(roleHomePath(token?.role), request.url));
  }

  if (
    isTeacherRoute(pathname) &&
    token?.role !== 'TEACHER' &&
    !isAdminRole(token?.role)
  ) {
    return NextResponse.redirect(new URL(roleHomePath(token?.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // api-docs excluded for the same reason /api/v1/* itself is: it's the
  // REST API's own reference, viewable with or without a web session —
  // unlike publicRoutes (login/register/...), which is "logged-out only"
  // and would otherwise bounce an already-authenticated visitor away.
  matcher: ['/((?!_next|api|api-docs|favicon\\.ico|.*\\.(?:png|jpg|svg|webp)).*)'],
};