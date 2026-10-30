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
  Settings,
  Palette,
} from 'lucide-react';
import { requireRole, ADMIN_ROLES } from '@/lib/authorization';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import type { SidebarNavItem } from '@/components/shared/sidebar-nav';
import { APP_NAME } from '@/lib/config';
import { countPendingTeacherVerifications } from '@/modules/payments/queries';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const SUPER_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <Settings />,
    items: [
      {
        href: '/admin/settings/branding',
        label: 'Hero & Branding',
        icon: <Palette className="size-3.5" />,
        exact: true,
      },
      {
        href: '/admin/settings/policies',
        label: 'Policies & Billing',
        icon: <ShieldCheck className="size-3.5" />,
        exact: true,
      },
    ],
  },
];

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const [admin, pendingTeacherCount] = await Promise.all([
    requireRole(...ADMIN_ROLES),
    countPendingTeacherVerifications(),
  ]);
  const isSuperAdmin = admin.role === 'SUPER_ADMIN';

  const baseNavItems: SidebarNavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard />, exact: true },
    { href: '/admin/users', label: 'Users', icon: <Users /> },
    {
      href: '/admin/teachers',
      label: 'Teacher verification',
      icon: <GraduationCap />,
      badge: pendingTeacherCount,
    },
    { href: '/admin/subscriptions', label: 'Plans', icon: <CreditCard /> },
    { href: '/admin/coupons', label: 'Coupons', icon: <Ticket /> },
    { href: '/admin/payments', label: 'Payments', icon: <Receipt /> },
    { href: '/admin/audit-log', label: 'Audit log', icon: <ScrollText /> },
  ];

  const navItems = isSuperAdmin ? [...baseNavItems, ...SUPER_ADMIN_NAV_ITEMS] : baseNavItems;

  return (
    <DashboardShell
      icon={isSuperAdmin ? Crown : ShieldCheck}
      badgeLabel={isSuperAdmin ? 'Super Admin' : 'Admin'}
      mobileLabel={isSuperAdmin ? `${APP_NAME} Super Admin` : `${APP_NAME} Admin`}
      navItems={navItems}
      user={admin}
      breadcrumb="Admin Console"
    >
      {children}
    </DashboardShell>
  );
}
