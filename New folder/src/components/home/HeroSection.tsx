'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ScoutHero } from '@/components/three/ScoutHero';

/**
 * Animated hero. Split into a Client Component so the page itself can stay a
 * Server Component (framer-motion's `motion.*` factories cannot run on the
 * server).
 */
export function HeroSection({
  patrols,
  lectures,
  members,
}: {
  patrols: number;
  lectures: number;
  members: number;
}) {
  return (
    <section className="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="order-2 lg:order-1"
      >
        <span className="chip bg-forest-100 text-forest-700">منصة داخلية للأعضاء</span>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-forest-800 sm:text-4xl lg:text-5xl">
          دوري الكشافة
          <span className="block text-forest-600">محاضرات • نقاط • طلائع</span>
        </h1>

        <p className="mt-4 max-w-lg text-base leading-relaxed text-beige-400">
          تابع جدول المحاضرات، راقب رصيد نقاطك، وشارك طليعتك في ترتيب الدوري. كل شيء في مكان واحد
          وبأمان.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/lectures" className="btn-primary">
            تصفّح المحاضرات
          </Link>
          <Link href="/login" className="btn-ghost">
            تسجيل الدخول
          </Link>
        </div>

        <dl className="mt-9 grid max-w-md grid-cols-3 gap-3">
          {[
            { label: 'الطلائع', value: patrols },
            { label: 'المحاضرات', value: lectures },
            { label: 'الأعضاء', value: members },
          ].map((stat) => (
            <div key={stat.label} className="surface-card px-3 py-4 text-center">
              <dt className="text-xs text-beige-400">{stat.label}</dt>
              <dd className="tabular font-display text-2xl font-bold text-forest-700">
                {stat.value.toLocaleString('ar-EG')}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="order-1 lg:order-2"
      >
        {/* Placeholder container for the Three.js 3D scout character. */}
        <div className="surface-card relative aspect-square w-full overflow-hidden">
          <ScoutHero className="h-full w-full" />
        </div>
      </motion.div>
    </section>
  );
}