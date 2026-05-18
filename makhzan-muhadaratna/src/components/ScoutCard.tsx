"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Tali3a } from "@/lib/types";
import ScoutLogo from "./ScoutLogo";

interface Props {
  tali3a: Tali3a;
  lectureCount: number;
  index: number;
}

export default function ScoutCard({ tali3a, lectureCount, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link href={`/tali3a/${tali3a.id}`}>
        <div className="scout-card rounded-2xl p-6 sm:p-8 h-full relative group cursor-pointer overflow-hidden">
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${tali3a.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

          {tali3a.imageUrl && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity duration-500">
              <img src={tali3a.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-cream" />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="mb-2"
            >
              <ScoutLogo logoId={tali3a.logoId} className="w-24 h-24 sm:w-28 sm:h-28" />
            </motion.div>

            <h3 className="text-2xl sm:text-3xl font-bold font-reem text-burgundy-dark">
              {tali3a.name}
            </h3>

            <p className="text-wood text-sm">
              {tali3a.description}
            </p>

            <div className="flex items-center gap-2 text-wood-light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              <span className="font-cairo font-semibold">
                عدد المحاضرات: {lectureCount}
              </span>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-6 py-3 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-burgundy/20"
            >
              دخول المحاضرات
            </motion.div>
          </div>

          <div className="absolute -bottom-2 -left-2 w-16 h-16 border-l-2 border-b-2 border-wood/20 rounded-bl-2xl transition-all duration-300 group-hover:w-20 group-hover:h-20" />
          <div className="absolute -top-2 -right-2 w-16 h-16 border-r-2 border-t-2 border-wood/20 rounded-tr-2xl transition-all duration-300 group-hover:w-20 group-hover:h-20" />
        </div>
      </Link>
    </motion.div>
  );
}