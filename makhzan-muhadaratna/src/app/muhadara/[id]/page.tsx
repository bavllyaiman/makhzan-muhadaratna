"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MuhadaraPage() {
  const params = useParams();

  return (
    <>
      <Header />

      <section className="relative pt-24 pb-16 bg-gradient-to-br from-burgundy-dark via-burgundy to-burgundy-dark">
        <div className="absolute inset-0 vintage-texture opacity-10" />
      </section>

      <section className="min-h-[60vh] flex items-center justify-center bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-3xl font-bold font-reem text-burgundy-dark mb-4">
            المحاضرة غير موجودة
          </h2>
          <p className="text-wood mb-6 font-cairo">
            هذه المحاضرة غير متوفرة حالياً
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold transition-all hover:shadow-lg"
          >
            العودة للرئيسية
          </Link>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}