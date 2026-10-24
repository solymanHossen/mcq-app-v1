import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProtectedLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  return <>{children}</>;
}