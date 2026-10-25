import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';
import { LogoutButton } from '@/components/logout-button';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  await requireRole('ADMIN');

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b p-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/users" className="hover:underline">
            Users
          </Link>
          <Link href="/admin/teachers" className="hover:underline">
            Teacher verification
          </Link>
          <Link href="/admin/subscriptions" className="hover:underline">
            Plans
          </Link>
          <Link href="/admin/coupons" className="hover:underline">
            Coupons
          </Link>
          <Link href="/admin/payments" className="hover:underline">
            Payments
          </Link>
          <Link href="/admin/audit-log" className="hover:underline">
            Audit log
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
