"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoutLogo from "@/components/ScoutLogo";
import { loadTali3atList } from "@/lib/data";
import { Tali3a } from "@/lib/types";

export default function Tali3aPage() {
  const params = useParams();
  const id = params.id as string;
  const [tali3a, setTali3a] = useState<Tali3a | null>(null);
  const lectures: any[] = [];

  useEffect(() => {
    const list = loadTali3atList();
    setTali3a(list.find((t) => t.id === id) || null);
  }, [id]);

  if (!tali3a) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-reem text-burgundy-dark mb-4">
              الطليعة غير موجودة
            </h2>
            <Link
              href="/"
              className="text-burgundy hover:text-burgundy-light font-cairo font-bold underline"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <section
        className={`relative min-h-[40vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br ${tali3a.bannerColor}`}
      >
        {tali3a.imageUrl && (
          <div className="absolute inset-0">
            <img src={tali3a.imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        )}
        <div className="absolute inset-0 vintage-texture opacity-20" />
        <div className="absolute inset-0 dark-overlay" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-6"
          >
            <ScoutLogo logoId={tali3a.logoId} className="w-32 h-32 sm:w-40 sm:h-40 text-cream" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-reem text-cream mb-4"
          >
            {tali3a.name}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-cream/70 font-cairo"
          >
            {tali3a.description}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Link href="/#tali3at">
              <motion.span
                whileHover={{ x: -5 }}
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-cairo transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                العودة للطلائع
              </motion.span>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <section className="relative py-16 sm:py-24 bg-cream">
        <div className="absolute inset-0 bg-vintage-pattern" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-reem text-burgundy-dark mb-2">
              المحاضرات
            </h2>
            <div className="w-16 h-0.5 bg-burgundy" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold font-cairo text-burgundy-dark mb-2">
              لا توجد محاضرات بعد
            </h3>
            <p className="text-wood">
              سيتم إضافة محاضرات قريباً
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}