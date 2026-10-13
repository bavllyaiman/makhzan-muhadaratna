import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { requireSession } from '@/lib/server/auth';
import { lectureRepository } from '@/lib/server/repositories';
import { lectureSchema } from '@/lib/shared/schemas';
import { LecturesExplorer } from '@/components/lectures/LecturesExplorer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'قسم المحاضرات' };

export default async function LecturesPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login?next=/lectures');

  const lectures = (await lectureRepository.listAll())
    .map((l) => lectureSchema.parse(l))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-600 text-white">
          <BookOpen className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-800">قسم المحاضرات</h1>
          <p className="text-sm text-beige-400">تصفّح المحاضرات حسب الحالة أو تاريخ الطلب</p>
        </div>
      </header>

      <LecturesExplorer initial={lectures} />
    </div>
  );
}