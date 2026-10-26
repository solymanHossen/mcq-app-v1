import {
  ShieldCheck,
  Crown,
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Ticket,
  Receipt,
  ScrollText,
} from 'lucide-react';
import { requireRole, ADMIN_ROLES } from '@/lib/authorization';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import type { SidebarNavItem } from '@/components/shared/sidebar-nav';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const NAV_ITEMS: SidebarNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard />, exact: true },
  { href: '/admin/users', label: 'Users', icon: <Users /> },
  { href: '/admin/teachers', label: 'Teacher verification', icon: <GraduationCap /> },
  { href: '/admin/subscriptions', label: 'Plans', icon: <CreditCard /> },
  { href: '/admin/coupons', label: 'Coupons', icon: <Ticket /> },
  { href: '/admin/payments', label: 'Payments', icon: <Receipt /> },
  { href: '/admin/audit-log', label: 'Audit log', icon: <ScrollText /> },
];

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const admin = await requireRole(...ADMIN_ROLES);
  const isSuperAdmin = admin.role === 'SUPER_ADMIN';

  return (
    <DashboardShell
      icon={isSuperAdmin ? Crown : ShieldCheck}
      badgeLabel={isSuperAdmin ? 'Super Admin' : 'Admin'}
      mobileLabel={isSuperAdmin ? 'ExamHub Super Admin' : 'ExamHub Admin'}
      navItems={NAV_ITEMS}
      user={admin}
    >
      {children}
    </DashboardShell>
  );
}
