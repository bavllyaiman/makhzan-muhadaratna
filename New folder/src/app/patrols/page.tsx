import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Medal, UsersRound } from 'lucide-react';
import { requireSession } from '@/lib/server/auth';
import { patrolRepository } from '@/lib/server/repositories';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الطلائع' };

export default async function PatrolsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login?next=/patrols');

  const ranking = await patrolRepository.ranking();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-600 text-white">
          <UsersRound className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-800">الطلائع</h1>
          <p className="text-sm text-beige-400">ترتيب الدوري حسب مجموع نقاط الأعضاء</p>
        </div>
      </header>

      <ol className="space-y-4">
        {ranking.map((patrol) => {
          const isMine = patrol.id === session.user.patrolId;
          return (
            <li
              key={patrol.id}
              className={`surface-card-hover flex flex-wrap items-center gap-4 p-5 ${
                isMine ? 'ring-2 ring-forest-500' : ''
              }`}
            >
              <span
                className={`tabular grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold text-white
                  ${patrol.rank <= 3 ? 'bg-gradient-to-br from-gold-300 to-gold-500 text-olive-900' : 'bg-forest-600'}`}
              >
                {patrol.rank}
              </span>

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold text-forest-800">
                  {patrol.name}
                  {isMine && <span className="chip ms-2 bg-forest-100 text-forest-700">طليعتك</span>}
                </h2>
                <p className="text-sm text-beige-400">{patrol.motto}</p>
              </div>

              <div className="text-left">
                <p className="text-xs text-beige-400">الأعضاء</p>
                <p className="tabular font-semibold text-forest-700">{patrol.memberCount}</p>
              </div>

              <div className="text-left">
                <p className="text-xs text-beige-400">إجمالي النقاط</p>
                <p className="tabular flex items-center gap-1 font-display text-xl font-bold text-forest-700">
                  <Medal className="h-4 w-4 text-gold-500" />
                  {patrol.totalPoints.toLocaleString('ar-EG')}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}