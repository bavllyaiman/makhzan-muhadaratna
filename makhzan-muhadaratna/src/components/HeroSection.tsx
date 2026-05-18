"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1a0a08]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 0.1}px ${mousePos.y * 0.1}px, rgba(201, 169, 110, 0.15), transparent 50%)`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <pattern id="map-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10 Q 50 0, 90 10 T 10 90" fill="none" stroke="#c9a96e" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="3" fill="#c9a96e" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-lines)" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto">
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none" stroke="#c9a96e" strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.path
              d="M50 10 L50 50 L80 60"
              fill="none" stroke="#f5e6cc" strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <motion.circle
              cx="50" cy="50" r="4" fill="#c9a96e"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 }}
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-cream font-reem mb-6"
        >
          مخزن
          <span className="text-gold"> محاضراتنا</span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl text-cream/80 font-cairo mb-8"
        >
          منصة حفظ وتنظيم محاضرات الطلائع الكشفية
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#tali3at"
            className="px-8 py-4 bg-burgundy hover:bg-burgundy-light text-cream rounded-lg font-cairo text-lg font-bold transition-all duration-300 hover:shadow-lg hover:shadow-burgundy/30 active:scale-95"
          >
            استعرض الطلائع
          </a>
          <a
            href="#about"
            className="px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-burgundy-dark rounded-lg font-cairo text-lg font-bold transition-all duration-300 active:scale-95"
          >
            تعرف علينا
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="mx-auto text-gold/50">
              <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}