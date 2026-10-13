'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Medal, TrendingDown, TrendingUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/shared/schemas';
import { useSecurity } from '@/components/providers/SecurityProvider';

/**
 * League standings carousel. Horizontally scroll-snapping with RTL-aware
 * controls, plus keyboard-accessible arrow buttons.
 */
export function LeaderboardCarousel({ entries }: { entries: LeaderboardEntry[] }) {
  const { apiFetch } = useSecurity();
  const [data, setData] = useState<LeaderboardEntry[]>(entries);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (entries.length) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await apiFetch<LeaderboardEntry[]>('/api/leaderboard');
        if (!cancelled) setData(result);
      } catch {
        /* anonymous visitor — the empty state below is shown instead */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiFetch, entries.length]);

  const perView = 3;
  const pages = Math.max(1, Math.ceil(data.length / perView));

  const scrollBy = (direction: 1 | -1) => {
    setPage((current) => (current + direction + pages) % pages);
    const container = document.getElementById('leaderboard-track');
    container?.scrollBy({ left: direction * container.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (!data.length) {
    return (
      <section aria-labelledby="leaderboard-heading" className="space-y-4">
        <SectionHeading id="leaderboard-heading" title="ترتيب الدوري" subtitle="منافسة بين الطلائع" />
        <div className="surface-card p-8 text-center text-sm text-beige-400">
          ترتيب الدوري متاح لأعضاء المنظمة المسجلين فقط.
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="leaderboard-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <SectionHeading id="leaderboard-heading" title="ترتيب الدوري" subtitle="منافسة بين الطلائع" />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="السابق"
            className="btn-ghost !px-2.5 !py-2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="التالي"
            className="btn-ghost !px-2.5 !py-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul
        id="leaderboard-track"
        className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {data.map((entry, index) => (
          <motion.li
            key={entry.patrolId}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
          >
            <article
              className={`surface-card-hover relative h-full overflow-hidden p-5
                ${entry.rank === 1 ? 'ring-2 ring-gold-400' : ''}`}
            >
              <div
                className="absolute -left-8 -top-8 h-24 w-24 rounded-full opacity-15"
                style={{ background: entry.rank === 1 ? '#D19A2C' : '#458C66' }}
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl font-display text-lg font-bold text-white
                    ${
                      entry.rank === 1
                        ? 'bg-gradient-to-br from-gold-300 to-gold-500'
                        : entry.rank === 2
                          ? 'bg-gradient-to-br from-beige-300 to-olive-300'
                          : entry.rank === 3
                            ? 'bg-gradient-to-br from-olive-300 to-olive-500'
                            : 'bg-forest-600'
                    }`}
                >
                  {entry.rank <= 3 ? <Medal className="h-6 w-6" /> : entry.rank}
                </span>

                <span className="flex items-center gap-1 text-xs font-medium">
                  {entry.trend === 'up' && (
                    <span className="flex items-center gap-1 text-forest-600">
                      <TrendingUp className="h-3.5 w-3.5" /> صاعد
                    </span>
                  )}
                  {entry.trend === 'down' && (
                    <span className="flex items-center gap-1 text-red-500">
                      <TrendingDown className="h-3.5 w-3.5" /> هابط
                    </span>
                  )}
                  {entry.trend === 'same' && <span className="text-beige-400">ثابت</span>}
                </span>
              </div>

              <h3 className="relative mt-4 font-display text-lg font-bold text-forest-800">
                {entry.patrolName}
              </h3>
              <p className="text-xs text-beige-400">{entry.memberCount} عضو</p>

              <div className="relative mt-4 flex items-end justify-between border-t border-beige-200 pt-3">
                <span className="text-xs text-beige-400">إجمالي النقاط</span>
                <span className="tabular font-display text-2xl font-bold text-forest-700">
                  {entry.totalPoints.toLocaleString('ar-EG')}
                </span>
              </div>
            </article>
          </motion.li>
        ))}
      </ul>

      <div className="flex justify-center gap-1.5" role="tablist" aria-label="صفحات الترتيب">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={page === i}
            aria-label={`الصفحة ${i + 1}`}
            onClick={() => setPage(i)}
            className={`h-2 rounded-full transition-all duration-300
              ${page === i ? 'w-7 bg-forest-600' : 'w-2 bg-beige-300 hover:bg-beige-400'}`}
          />
        ))}
      </div>

      <div className="text-center">
        <Link href="/patrols" className="btn-ghost">
          عرض كل الطلائع
        </Link>
      </div>
    </section>
  );
}

function SectionHeading({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div>
      <h2 id={id} className="font-display text-xl font-bold text-forest-800 sm:text-2xl">
        {title}
      </h2>
      <p className="text-sm text-beige-400">{subtitle}</p>
    </div>
  );
}