import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Award, Medal, TrendingDown, TrendingUp } from 'lucide-react';
import { requireSession } from '@/lib/server/auth';
import { patrolRepository, ledgerRepository, toSessionUser, userRepository } from '@/lib/server/repositories';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'النقاط' };

const LADDER = [
  { rank: 'مبتدئ', threshold: 0 },
  { rank: 'مستكشف', threshold: 100 },
  { rank: 'مغامر', threshold: 250 },
  { rank: 'مقدام', threshold: 450 },
  { rank: 'قائد', threshold: 700 },
];

export default async function PointsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login?next=/points');

  const record = await userRepository.findById(session.user.id);
  if (!record) redirect('/login');

  const [patrol, ledger] = await Promise.all([
    record.patrolId ? patrolRepository.findById(record.patrolId) : null,
    ledgerRepository.listForUser(record.id, 20),
  ]);

  const user = toSessionUser(record);

  const nextRank = LADDER.find((r) => r.threshold > user.pointsBalance) ?? null;
  const previous = [...LADDER].reverse().find((r) => r.threshold <= user.pointsBalance)?.threshold ?? 0;
  const progress = nextRank
    ? Math.round(((user.pointsBalance - previous) / (nextRank.threshold - previous)) * 100)
    : 100;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-forest-800">النقاط</h1>
        <p className="text-sm text-beige-400">رصيدك، مستحقاتك، وسجل الحركات</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'الرصيد', value: user.pointsBalance, tone: 'border-forest-200 bg-forest-50 text-forest-700' },
          { label: 'المكتسبة', value: user.pointsEarned, tone: 'border-olive-300 bg-olive-100 text-olive-700' },
          { label: 'المخصومة', value: user.pointsDeducted, tone: 'border-red-200 bg-red-50 text-red-600' },
        ].map((item) => (
          <div key={item.label} className={`surface-card border p-5 ${item.tone}`}>
            <p className="tabular font-display text-3xl font-bold">{item.value.toLocaleString('ar-EG')}</p>
            <p className="text-sm font-medium">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="surface-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
          <Award className="h-5 w-5 text-forest-600" />
          سلم الرُّتب
        </h2>

        <ol className="mt-5 space-y-3">
          {LADDER.map((step) => {
            const reached = user.pointsBalance >= step.threshold;
            const active = nextRank?.rank === step.rank;
            return (
              <li
                key={step.rank}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition
                  ${reached ? 'border-forest-200 bg-forest-50' : 'border-beige-200 bg-beige-50/60'}`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white
                    ${reached ? 'bg-forest-600' : 'bg-beige-300 text-beige-400'}`}
                >
                  {reached ? <Medal className="h-4 w-4" /> : '·'}
                </span>
                <span className={`flex-1 text-sm font-medium ${reached ? 'text-forest-800' : 'text-beige-400'}`}>
                  {step.rank}
                </span>
                <span className="tabular text-xs text-beige-400">{step.threshold}+</span>
                {active && <span className="chip bg-gold-300/50 text-olive-700">الهدف الحالي</span>}
              </li>
            );
          })}
        </ol>

        {nextRank && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-beige-400">
              <span>التقدم</span>
              <span className="tabular">{progress}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-beige-200">
              <div
                className="h-full rounded-full bg-gradient-to-l from-gold-300 to-gold-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-beige-400">
              يتبقى {(nextRank.threshold - user.pointsBalance).toLocaleString('ar-EG')} نقطة للوصول إلى رتبة{' '}
              {nextRank.rank}
            </p>
          </div>
        )}
      </section>

      <section className="surface-card p-6">
        <h2 className="font-display text-lg font-bold text-forest-800">سجل النقاط</h2>

        <ul className="mt-4 divide-y divide-beige-200">
          {ledger.length === 0 && (
            <li className="py-6 text-center text-sm text-beige-400">لا توجد حركات نقاط بعد.</li>
          )}
          {ledger.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-forest-800">{entry.label}</p>
                <p className="text-xs text-beige-400">
                  {new Date(entry.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                </p>
              </div>
              <span
                className={`tabular flex items-center gap-1 text-sm font-bold
                  ${entry.delta >= 0 ? 'text-forest-600' : 'text-red-500'}`}
              >
                {entry.delta >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {entry.delta > 0 ? '+' : ''}
                {entry.delta}
              </span>
            </li>
          ))}
        </ul>

        {patrol && (
          <p className="mt-4 rounded-xl bg-beige-100 p-3 text-xs text-beige-400">
            إجمالي نقاط {patrol.name}:{' '}
            <span className="tabular font-semibold text-forest-700">
              {patrol.totalPoints.toLocaleString('ar-EG')}
            </span>
          </p>
        )}
      </section>
    </div>
  );
}