import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Award, Crown, Minus, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { requireSession } from '@/lib/server/auth';
import { patrolRepository, toSessionUser, userRepository } from '@/lib/server/repositories';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الملف الشخصي' };

/**
 * Server-rendered profile. Authorisation is enforced by `requireSession()`
 * here — the client cannot reach this component's data without a valid,
 * signature-verified, non-revoked session.
 */
export default async function ProfilePage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login?next=/profile');

  const record = await userRepository.findById(session.user.id);
  if (!record) redirect('/login');

  const user = toSessionUser(record);
  const patrol = user.patrolId ? await patrolRepository.findById(user.patrolId) : null;
  const initial = user.fullName.charAt(0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <section className="surface-card overflow-hidden">
        <div className="h-28 bg-gradient-to-l from-forest-700 via-forest-600 to-olive-600" />

        <div className="flex flex-col items-center gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <span
            className="-mt-14 grid h-28 w-28 place-items-center rounded-3xl border-4 border-white bg-forest-600 font-display text-4xl font-bold text-white shadow-lg"
            aria-hidden="true"
          >
            {initial}
          </span>

          <div className="flex-1 text-center sm:pb-2 sm:text-right">
            <h1 className="font-display text-2xl font-bold text-forest-800">{user.fullName}</h1>
            <p className="tabular mt-1 text-sm text-beige-400" dir="ltr">
              {user.nationalId}
            </p>
          </div>

          <span className="chip bg-olive-100 text-olive-700">
            <Crown className="h-3.5 w-3.5" />
            {user.rank}
          </span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Sparkles}
          label="رصيد النقاط"
          value={user.pointsBalance}
          tone="forest"
          hint="الرصيد القابل للاستخدام"
        />
        <StatCard icon={Plus} label="النقاط المكتسبة" value={user.pointsEarned} tone="olive" />
        <StatCard icon={Minus} label="النقاط المخصومة" value={user.pointsDeducted} tone="red" />
      </div>

      <section className="surface-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
          <Award className="h-5 w-5 text-forest-600" />
          بيانات العضوية
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Row label="الاسم الكامل" value={user.fullName} />
          <Row label="الرتبة" value={user.rank} />
          <Row label="الطليعة" value={patrol?.name ?? 'غير مسند'} />
          <Row label="الدور" value={roleLabel(user.role)} />
          <Row label="رقم الهوية" value={user.nationalId} ltr />
          <Row
            label="تاريخ الانضمام"
            value={new Date(record.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
          />
        </dl>
      </section>

      <p className="flex items-center justify-center gap-2 text-xs text-beige-400">
        <ShieldCheck className="h-4 w-4 text-forest-600" />
        تُعرض هذه البيانات بناءً على جلستك المحمية فقط.
      </p>
    </div>
  );
}

function roleLabel(role: string): string {
  return { SCOUT: 'كشاف', PATROL_LEADER: 'قائد طلائع', LEADER: 'قائد', ADMIN: 'إدارة' }[role] ?? role;
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl border border-beige-200 bg-beige-50/60 px-4 py-3">
      <dt className="text-xs text-beige-400">{label}</dt>
      <dd className={`mt-0.5 font-medium text-forest-800 ${ltr ? 'tabular text-left' : ''}`} dir={ltr ? 'ltr' : undefined}>
        {value}
      </dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Award;
  label: string;
  value: number;
  hint?: string;
  tone: 'forest' | 'olive' | 'red';
}) {
  const tones = {
    forest: 'bg-forest-50 text-forest-700 border-forest-200',
    olive: 'bg-olive-100 text-olive-700 border-olive-300',
    red: 'bg-red-50 text-red-600 border-red-200',
  } as const;

  return (
    <div className={`surface-card p-5 ${tones[tone]}`}>
      <Icon className="h-5 w-5" />
      <p className="tabular mt-3 font-display text-3xl font-bold">{value.toLocaleString('ar-EG')}</p>
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs opacity-70">{hint}</p>}
    </div>
  );
}