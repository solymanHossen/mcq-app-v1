import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  authConfig,
  isAdminRole,
  isAdminRoute,
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
  matcher: ['/((?!_next|api|favicon\\.ico|.*\\.(?:png|jpg|svg|webp)).*)'],
};