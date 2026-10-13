'use client';

import { motion } from 'framer-motion';
import { Award, CalendarCheck, Star, TrendingUp, Users } from 'lucide-react';

interface Rule {
  icon: typeof Award;
  title: string;
  points: string;
  description: string;
}

const RULES: Rule[] = [
  {
    icon: CalendarCheck,
    title: 'الحضور والمشاركة',
    points: '10 – 50',
    description: 'نقاط تُمنح عند الحضور وتسجيل المشاركة في كل محاضرة.',
  },
  {
    icon: Star,
    title: 'إنجاز المهام',
    points: '5 – 40',
    description: 'نقاط تقديرية على إنجاز المهام الخاصة والعروض العملية.',
  },
  {
    icon: Users,
    title: 'العمل الجماعي',
    points: '15 – 35',
    description: 'التعاون في تنظيم الفعاليات وقيادة الأنشطة داخل الطليعة.',
  },
  {
    icon: Award,
    title: 'الأوسمة والشارات',
    points: '50 – 150',
    description: 'الأوسمة الاستثنائية تُضاف كشارة دائمة إلى ملف الكشاف.',
  },
];

/** Points progress toward the next rank. */
export function AssessmentSection({ balance = 0 }: { balance?: number }) {
  const thresholds = [0, 100, 250, 450, 700, 1000];
  const currentIndex = thresholds.reduce((acc, t, i) => (balance >= t ? i : acc), 0);
  const next = thresholds[currentIndex + 1] ?? thresholds[thresholds.length - 1] ?? 0;
  const previous = thresholds[currentIndex] ?? 0;
  const progress = Math.min(100, Math.round(((balance - previous) / Math.max(1, next - previous)) * 100));

  return (
    <section aria-labelledby="assessment-heading" className="space-y-5">
      <div>
        <h2 id="assessment-heading" className="font-display text-xl font-bold text-forest-800 sm:text-2xl">
          آلية التقييم
        </h2>
        <p className="text-sm text-beige-400">كيف تُكتسب النقاط وتُحتسب الرتبة</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="surface-card overflow-hidden"
      >
        <div className="grid gap-4 border-b border-beige-200 bg-gradient-to-l from-forest-700 to-forest-600 p-6 text-white sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <div className="tabular text-center">
            <p className="text-3xl font-bold">{balance.toLocaleString('ar-EG')}</p>
            <p className="text-xs text-beige-200">رصيد النقاط الحالي</p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-beige-200">
              <span>التقدم نحو الرتبة التالية</span>
              <span className="tabular">{progress}%</span>
            </div>
            <div
              className="mt-2 h-3 w-full overflow-hidden rounded-full bg-forest-900/40"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="التقدم نحو الرتبة التالية"
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-l from-gold-300 to-gold-500"
              />
            </div>
            <p className="mt-2 text-xs text-beige-200">
              تحتاج <span className="tabular font-semibold">{(next - balance).toLocaleString('ar-EG')}</span> نقطة للوصول
              إلى الرتبة التالية.
            </p>
          </div>
        </div>

        <ul className="grid gap-4 p-5 sm:grid-cols-2">
          {RULES.map((rule, index) => (
            <motion.li
              key={rule.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="group flex gap-3 rounded-xl border border-beige-200 bg-beige-50/70 p-4 transition hover:border-forest-300 hover:bg-white"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700 transition group-hover:bg-forest-600 group-hover:text-white">
                <rule.icon className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-forest-800">{rule.title}</h3>
                  <span className="chip bg-gold-300/40 text-olive-700">
                    <TrendingUp className="h-3 w-3" />
                    {rule.points}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-beige-400">{rule.description}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}