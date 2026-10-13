import { HeroSection } from '@/components/home/HeroSection';
import { LeaderboardCarousel } from '@/components/home/LeaderboardCarousel';
import { AssessmentSection } from '@/components/home/AssessmentSection';
import { LatestLectureBanner } from '@/components/home/LatestLectureBanner';
import { lectureRepository, patrolRepository, platformStats } from '@/lib/server/repositories';
import { leaderboardEntrySchema, lectureSchema } from '@/lib/shared/schemas';

export const dynamic = 'force-dynamic';

/**
 * Server Component — the leaderboard aggregate and the latest lecture are
 * computed on the server so no personal data is shipped to unauthenticated
 * visitors beyond aggregate rankings.
 */
export default async function HomePage() {
  const [stats, ranked, lectures] = await Promise.all([
    platformStats(),
    patrolRepository.ranking(),
    lectureRepository.listAll(),
  ]);

  const leaderboard = ranked.map((patrol) =>
    leaderboardEntrySchema.parse({
      rank: patrol.rank,
      patrolId: patrol.id,
      patrolName: patrol.name,
      totalPoints: patrol.totalPoints,
      memberCount: patrol.memberCount,
      trend: patrol.trend,
    }),
  );

  const latestLecture = [...lectures]
    .map((lecture) => lectureSchema.parse(lecture))
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-6 sm:px-6">
      <HeroSection patrols={stats.patrols} lectures={stats.lectures} members={stats.users} />

      <LatestLectureBanner lecture={latestLecture} />

      <LeaderboardCarousel entries={leaderboard} />

      <AssessmentSection />
    </div>
  );
}