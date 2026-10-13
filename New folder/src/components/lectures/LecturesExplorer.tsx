'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Filter, MapPin, Search, Users } from 'lucide-react';
import { lectureQuerySchema, type Lecture, type LectureStatus } from '@/lib/shared/schemas';
import { useSecurity } from '@/components/providers/SecurityProvider';

/**
 * Filterable lecture list. Sorting and filtering happen client-side for instant
 * feedback, but the same Zod query schema is enforced server-side in
 * `/api/lectures`, so a crafted request cannot bypass these constraints.
 */

const STATUS_TABS: Array<{ value: 'ALL' | LectureStatus; label: string }> = [
  { value: 'ALL', label: 'الكل' },
  { value: 'OPEN', label: 'مفتوحة' },
  { value: 'UPCOMING', label: 'قادمة' },
  { value: 'CLOSED', label: 'مكتملة' },
  { value: 'ARCHIVED', label: 'مؤرشفة' },
];

const STATUS_STYLE: Record<LectureStatus, string> = {
  OPEN: 'bg-forest-100 text-forest-700',
  UPCOMING: 'bg-olive-100 text-olive-700',
  CLOSED: 'bg-beige-200 text-olive-900',
  ARCHIVED: 'bg-beige-100 text-beige-400',
};

const STATUS_LABEL: Record<LectureStatus, string> = {
  OPEN: 'مفتوحة',
  UPCOMING: 'قادمة',
  CLOSED: 'مكتملة',
  ARCHIVED: 'مؤرشفة',
};

export function LecturesExplorer({ initial }: { initial: Lecture[] }) {
  const { apiFetch } = useSecurity();
  const [lectures, setLectures] = useState<Lecture[]>(initial);
  const [status, setStatus] = useState<'ALL' | LectureStatus>('ALL');
  const [sort, setSort] = useState<'order' | 'recent' | 'oldest'>('order');
  const [term, setTerm] = useState('');

  useEffect(() => {
    if (initial.length) return;
    void (async () => {
      try {
        const result = await apiFetch<{ items: Lecture[] }>('/api/lectures?pageSize=50');
        setLectures(result.items);
      } catch {
        /* handled by empty state */
      }
    })();
  }, [apiFetch, initial.length]);

  // Parse the filter state through the shared schema so client and server agree.
  const query = useMemo(
    () => lectureQuerySchema.safeParse({ sort, q: term || undefined, pageSize: 50 }),
    [sort, term],
  );

  const visible = useMemo(() => {
    if (!query.success) return [];
    const { q } = query.data;
    const needle = q?.toLowerCase() ?? '';

    return lectures
      .filter((l) => (status === 'ALL' ? true : l.status === status))
      .filter((l) => (needle ? l.title.toLowerCase().includes(needle) : true))
      .sort((a, b) => {
        if (query.data.sort === 'recent') return b.requestedAt.localeCompare(a.requestedAt);
        if (query.data.sort === 'oldest') return a.requestedAt.localeCompare(b.requestedAt);
        return a.order - b.order;
      });
  }, [lectures, status, query]);

  return (
    <div className="space-y-5">
      <div className="surface-card space-y-4 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-beige-400" />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value.slice(0, 80))}
            placeholder="ابحث باسم المحاضرة…"
            aria-label="بحث في المحاضرات"
            className="w-full rounded-xl border border-beige-300 bg-white py-3 pl-3 pr-10 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              aria-pressed={status === tab.value}
              className={`chip transition ${
                status === tab.value
                  ? 'bg-forest-600 text-white'
                  : 'bg-beige-200 text-olive-700 hover:bg-beige-300'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <label className="ms-auto flex items-center gap-2 text-xs text-beige-400">
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">ترتيب</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-beige-300 bg-white px-2 py-1.5 text-xs text-forest-800 outline-none focus:border-forest-500"
            >
              <option value="order">حسب رقم الترتيب</option>
              <option value="recent">الأحدث طلباً</option>
              <option value="oldest">الأقدم طلباً</option>
            </select>
          </label>
        </div>
      </div>

      {!visible.length && (
        <div className="surface-card p-10 text-center text-sm text-beige-400">
          لا توجد محاضرات مطابقة للفلتر المحدد.
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {visible.map((lecture, index) => (
          <motion.li
            key={lecture.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
          >
            <article className="surface-card-hover flex h-full flex-col p-5">
              <header className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="chip bg-forest-50 text-forest-700">محاضرة رقم {lecture.order}</span>
                  <h2 className="mt-2 font-display text-lg font-bold text-forest-800">{lecture.title}</h2>
                </div>
                <span className={`chip shrink-0 ${STATUS_STYLE[lecture.status]}`}>
                  {STATUS_LABEL[lecture.status]}
                </span>
              </header>

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-beige-400">{lecture.summary}</p>

              <dl className="mt-4 space-y-2 text-xs text-beige-400">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-forest-500" />
                  <dt className="sr-only">الموعد</dt>
                  <dd>
                    {new Date(lecture.scheduledAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-forest-500" />
                  <dt className="sr-only">المكان</dt>
                  <dd>{lecture.location}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0 text-forest-500" />
                  <dt className="sr-only">الحضور</dt>
                  <dd className="tabular">
                    {lecture.attendanceCount} / {lecture.capacity}
                  </dd>
                </div>
              </dl>

              <footer className="mt-auto flex items-center justify-between border-t border-beige-200 pt-3 text-xs">
                <span className="chip bg-gold-300/40 text-olive-700">+{lecture.pointsReward} نقطة</span>
                <span className="text-beige-400">{lecture.speaker}</span>
              </footer>
            </article>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}