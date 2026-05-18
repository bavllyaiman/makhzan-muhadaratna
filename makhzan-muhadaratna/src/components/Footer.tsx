"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-burgundy-dark to-[#1a0a08] text-cream overflow-hidden">
      <div className="absolute inset-0 vintage-texture opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold font-reem text-gold mb-4">
              مخزن محاضراتنا
            </h3>
            <p className="text-cream/80 leading-relaxed">
              منصة حفظ وتنظيم محاضرات الطلائع الكشفية
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold font-cairo text-gold mb-4">الطلائع</h4>
            <ul className="space-y-2 text-cream/70">
              {["العقاب", "البواشق", "الغراب", "الشاهين", "النسور", "الصقور"].map(
                (name) => (
                  <li key={name}>
                    <a href={`#`} className="hover:text-gold transition-colors">
                      طليعة {name}
                    </a>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold font-cairo text-gold mb-4">روابط</h4>
            <ul className="space-y-2 text-cream/70">
              <li>
                <a href="/" className="hover:text-gold transition-colors">الرئيسية</a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-cream/10 text-center"
        >
          <motion.p
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-2xl md:text-3xl font-bold text-gold font-reem mb-4"
          >
            الكشافة تصنع القادة
          </motion.p>
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} جميع الحقوق محفوظة - مخزن محاضراتنا
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-gold via-burgundy to-gold" />
    </footer>
  );
}