export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
} as const;

export const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
] as const;

export function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin');
}