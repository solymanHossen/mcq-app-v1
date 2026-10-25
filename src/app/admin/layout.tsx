import { ShieldCheck } from 'lucide-react';
import { requireRole } from '@/lib/authorization';
import { LogoutButton } from '@/components/shared/logout-button';
import { Badge } from '@/components/ui/badge';
import { AdminNav } from '@/modules/admin/components/admin-nav';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const admin = await requireRole('ADMIN');

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/30 md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            ExamHub
          </span>
          <Badge variant="secondary" className="ml-auto">
            Admin
          </Badge>
        </div>

        <AdminNav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" />

        <div className="border-t p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials(admin.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{admin.name}</p>
              <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <LogoutButton className="w-full justify-start" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b p-3 md:hidden">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-3.5" />
          </span>
          <span className="font-heading text-sm font-semibold">ExamHub Admin</span>
          <LogoutButton className="ml-auto" />
        </header>
        <div className="border-b md:hidden">
          <AdminNav variant="mobile" className="flex gap-1.5 overflow-x-auto p-2.5" />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
