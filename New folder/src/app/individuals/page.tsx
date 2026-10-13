import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Crown, Users } from 'lucide-react';
import { requireSession } from '@/lib/server/auth';
import { patrolRepository, userRepository } from '@/lib/server/repositories';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الأفراد' };

export default async function IndividualsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login?next=/individuals');

// Scouting organisation data is available to any authenticated member.
const [patrols, members] = await Promise.all([
  patrolRepository.listAll(),
  userRepository.listAll(),
]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-600 text-white">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-800">الأفراد</h1>
          <p className="text-sm text-beige-400">أعضاء الطلائع ورتبهم ونقاطهم</p>
        </div>
      </header>

      {patrols.map((patrol) => {
        const roster = members.filter((m) => m.patrolId === patrol.id);

        return (
          <section key={patrol.id} className="surface-card overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-beige-200 bg-beige-50/70 px-5 py-4">
              <h2 className="font-display text-base font-bold text-forest-800">{patrol.name}</h2>
              <span className="chip bg-forest-100 text-forest-700">{roster.length} عضو</span>
            </header>

            <ul className="divide-y divide-beige-200">
              {roster.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-beige-50"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-600 font-bold text-white"
                    aria-hidden="true"
                  >
                    {member.fullName.charAt(0)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-800">{member.fullName}</p>
                    <p className="tabular text-xs text-beige-400" dir="ltr">
                      {member.nationalId}
                    </p>
                  </div>

                  <span className="chip hidden bg-olive-100 text-olive-700 sm:inline-flex">
                    <Crown className="h-3 w-3" />
                    {member.rank}
                  </span>

                  <span className="tabular w-16 text-left text-sm font-bold text-forest-700">
                    {member.pointsBalance.toLocaleString('ar-EG')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}