'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Flame, MapPin, User } from 'lucide-react';
import type { Lecture } from '@/lib/shared/schemas';

const STATUS_STYLE: Record<Lecture['status'], { label: string; className: string }> = {
  OPEN: { label: 'مفتوحة للتسجيل', className: 'bg-forest-500 text-white' },
  UPCOMING: { label: 'قادمة', className: 'bg-olive-500 text-white' },
  CLOSED: { label: 'مكتملة', className: 'bg-olive-900/80 text-beige-100' },
  ARCHIVED: { label: 'مؤرشفة', className: 'bg-beige-300 text-olive-900' },
};

/** Home banner for the most recent lecture (e.g. "محاضرة النيران"). */
export function LatestLectureBanner({ lecture }: { lecture: Lecture | null }) {
  if (!lecture) return null;
  const status = STATUS_STYLE[lecture.status];
  const scheduled = new Date(lecture.scheduledAt);

  return (
    <motion.section
      aria-labelledby="latest-lecture-heading"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-forest-700 via-forest-600 to-olive-700 p-6 text-white shadow-lift sm:p-8"
    >
      {/* Decorative flame glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-forest-300/20 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="chip bg-white/15 text-beige-50 backdrop-blur">
            <Flame className="h-3.5 w-3.5" />
            أحدث محاضرة
          </span>

          <h2 id="latest-lecture-heading" className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            {lecture.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-beige-200">{lecture.summary}</p>
        </div>

        <span className={`chip shrink-0 ${status.className}`}>{status.label}</span>
      </div>

      <dl className="relative mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
          <CalendarDays className="h-4 w-4 shrink-0 text-olive-300" />
          <div>
            <dt className="text-xs text-beige-300">الموعد</dt>
            <dd className="font-medium">{scheduled.toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</dd>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
          <MapPin className="h-4 w-4 shrink-0 text-olive-300" />
          <div>
            <dt className="text-xs text-beige-300">المكان</dt>
            <dd className="font-medium">{lecture.location}</dd>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
          <User className="h-4 w-4 shrink-0 text-olive-300" />
          <div>
            <dt className="text-xs text-beige-300">المقدّم</dt>
            <dd className="font-medium">{lecture.speaker}</dd>
          </div>
        </div>
      </dl>

      <div className="relative mt-6 flex flex-wrap items-center gap-3">
        <Link href="/lectures" className="btn bg-white text-forest-800 hover:bg-beige-100">
          كل المحاضرات
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="chip bg-gold-400/90 text-olive-900">
          +{lecture.pointsReward} نقطة عند الحضور
        </span>
      </div>
    </motion.section>
  );
}