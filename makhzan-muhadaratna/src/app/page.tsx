"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ScoutCard from "@/components/ScoutCard";
import LoadingScreen from "@/components/LoadingScreen";
import { loadTali3atList } from "@/lib/data";
import { Tali3a } from "@/lib/types";

export default function HomePage() {
  const [tali3at, setTali3at] = useState<Tali3a[]>([]);

  useEffect(() => {
    setTali3at(loadTali3atList());
  }, []);
  return (
    <>
      <LoadingScreen />
      <Header />

      <main>
        <HeroSection />

        <section id="tali3at" className="relative py-20 sm:py-28 bg-cream">
          <div className="absolute inset-0 bg-vintage-pattern" />
          <div className="absolute inset-0 vintage-texture opacity-30" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-reem text-burgundy-dark mb-4">
                طلائعنا
              </h2>
              <div className="w-24 h-0.5 bg-gradient-to-l from-burgundy to-gold mx-auto mb-4" />
              <p className="text-wood text-lg sm:text-xl font-cairo">
                اختر طليعتك لاستعراض محاضراتها
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {tali3at.map((tali3a, index) => (
                <ScoutCard
                  key={tali3a.id}
                  tali3a={tali3a}
                  lectureCount={0}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="relative py-20 sm:py-28 bg-gradient-to-b from-burgundy-dark to-[#1a0a08] overflow-hidden">
          <div className="absolute inset-0 vintage-texture opacity-10" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-6">🏕️</div>
              <h2 className="text-3xl sm:text-5xl font-bold font-reem text-gold mb-6">
                الكشافة تصنع القادة
              </h2>
              <p className="text-cream/70 text-lg leading-relaxed font-cairo max-w-2xl mx-auto">
                مخزن محاضراتنا هو منصة كشفية متكاملة لحفظ وتنظيم جميع محاضرات
                الطلائع، نسعى لتوفير بيئة تعليمية كشفية متميزة تساعد أبناءنا
                على التعلم والتطور في أجواء كشفية أصيلة.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
              {[
                { icon: "📚", title: "محاضرات متنوعة", desc: "مكتبة متكاملة من المحاضرات الكشفية" },
                { icon: "🛡️", title: "حماية وأمان", desc: "بيئة آمنة للمحتوى الكشفي" },
                { icon: "📱", title: "متوفر دائماً", desc: "تصفح من أي جهاز وفي أي وقت" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-white/5 border border-gold/10 hover:bg-white/10 transition-all"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-gold font-bold font-cairo text-lg mb-2">{item.title}</h3>
                  <p className="text-cream/60 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}