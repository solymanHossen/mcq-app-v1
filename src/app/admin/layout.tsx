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

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const BASE_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard />, exact: true },
  { href: '/admin/users', label: 'Users', icon: <Users /> },
  { href: '/admin/teachers', label: 'Teacher verification', icon: <GraduationCap /> },
  { href: '/admin/subscriptions', label: 'Plans', icon: <CreditCard /> },
  { href: '/admin/coupons', label: 'Coupons', icon: <Ticket /> },
  { href: '/admin/payments', label: 'Payments', icon: <Receipt /> },
  { href: '/admin/audit-log', label: 'Audit log', icon: <ScrollText /> },
];

// Only a SUPER_ADMIN can see or reach /admin/settings — the page itself
// re-asserts this (see app/admin/settings/page.tsx), this just keeps a plain
// ADMIN from being shown a link that would reject them.
const SUPER_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <Settings />,
    items: [
      {
        href: '/admin/settings',
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
  const admin = await requireRole(...ADMIN_ROLES);
  const isSuperAdmin = admin.role === 'SUPER_ADMIN';
  const navItems = isSuperAdmin ? [...BASE_NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS] : BASE_NAV_ITEMS;

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
