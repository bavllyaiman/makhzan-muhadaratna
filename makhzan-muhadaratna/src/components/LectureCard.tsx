"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Lecture {
  id: string;
  title: string;
  description: string;
  date: string;
  views: number;
}

interface Props {
  lecture: Lecture;
  index: number;
}

export default function LectureCard({ lecture, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <div className="scout-card rounded-xl p-5 sm:p-6 group cursor-pointer relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-burgundy/5 to-transparent rounded-bl-full" />

        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold font-cairo text-burgundy-dark mb-2 line-clamp-2">
            {lecture.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-wood-light mb-3 font-cairo">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {lecture.date}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {lecture.views} مشاهدة
            </span>
          </div>

          <p className="text-wood/80 text-sm mb-4 line-clamp-2 leading-relaxed">
            {lecture.description}
          </p>

          <Link href={`/muhadara/${lecture.id}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-burgundy/20"
            >
              عرض المحاضرة
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}