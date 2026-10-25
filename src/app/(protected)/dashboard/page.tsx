import Link from 'next/link';
import { requireUser } from '@/lib/authorization';
import { getLearningSummary } from '@/modules/learning/queries';
import { getPracticeRecommendations } from '@/modules/learning/recommendations';
import { Badge } from '@/components/ui/badge';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh flex-col gap-4 p-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold">
          Welcome back{user.name ? `, ${user.name}` : ''}
        </h1>
      </div>

      {user.role === 'STUDENT' && <StudentLearningWidget studentId={user.id} />}
    </div>
  );
}

async function StudentLearningWidget({ studentId }: { studentId: string }) {
  const [summary, recommendations] = await Promise.all([
    getLearningSummary(studentId),
    getPracticeRecommendations(studentId),
  ]);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-md border p-4">
        <Badge variant="secondary">Level {summary.level}</Badge>
        <Badge variant="secondary">{summary.totalXP} XP</Badge>
        <Badge variant={summary.currentStreak > 0 ? 'default' : 'outline'}>
          {summary.currentStreak} day streak
        </Badge>
        <Link href="/progress" className="ml-auto text-sm hover:underline">
          View full progress
        </Link>
      </div>

      {recommendations.dueReviews.length > 0 && (
        <p className="text-sm">
          You have{' '}
          <Link href="/mistakes" className="font-medium hover:underline">
            {recommendations.dueReviews.length} question
            {recommendations.dueReviews.length === 1 ? '' : 's'} due for review
          </Link>{' '}
          in your mistake notebook.
        </p>
      )}

      <nav className="flex flex-wrap gap-4 text-sm">
        <Link href="/exams" className="hover:underline">
          Exams
        </Link>
        <Link href="/mistakes" className="hover:underline">
          Mistake notebook
        </Link>
        <Link href="/progress" className="hover:underline">
          Your progress
        </Link>
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
      </nav>
    </div>
  );
}
