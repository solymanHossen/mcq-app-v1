import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect('/login');

  return (
    <div className="flex min-h-svh flex-col gap-4 p-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold">
          Welcome back{session.user?.name ? `, ${session.user.name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          You are signed in and can start building protected pages from here.
        </p>
      </div>
    </div>
  );
}