import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Settings as SettingsIcon } from 'lucide-react';
import { requireSession } from '@/lib/server/auth';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { userRepository } from '@/lib/server/repositories';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الإعدادات' };

export default async function SettingsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login?next=/settings');

  const record = await userRepository.findById(session.user.id);
  if (!record) redirect('/login');

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-600 text-white">
          <SettingsIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-800">الإعدادات</h1>
          <p className="text-sm text-beige-400">حسابك وتفضيلاتك</p>
        </div>
      </header>

      <SettingsForm
        initial={{
          phone: record.phone,
          notifications: record.notifications,
          reduceMotion: record.reduceMotion,
        }}
      />
    </div>
  );
}