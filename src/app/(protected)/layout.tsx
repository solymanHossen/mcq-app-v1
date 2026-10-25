import { requireUser } from '@/lib/authorization';
import { LogoutButton } from '@/components/shared/logout-button';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProtectedLayout({
  children,
}: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex justify-end border-b p-3">
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
