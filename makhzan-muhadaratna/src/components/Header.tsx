"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "الطلائع", href: "/#tali3at" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "nav-scrolled" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <svg width="32" height="32" viewBox="0 0 100 100" className="text-burgundy">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M50 15 L50 50 L75 60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <span className="text-xl md:text-2xl font-bold text-burgundy-dark hidden sm:block">
              مخزن محاضراتنا
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="relative text-burgundy-dark hover:text-burgundy transition-colors font-cairo text-lg font-semibold group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-burgundy transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/admin"
              className="px-4 py-2 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-sm hover:shadow-lg hover:shadow-burgundy/20 transition-all"
            >
              المشرف
            </Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="فتح القائمة"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-burgundy-dark block"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-0.5 bg-burgundy-dark block"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-burgundy-dark block"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cream border-t border-wood/20"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-burgundy-dark hover:text-burgundy font-cairo text-xl py-2"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block text-center px-4 py-3 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-lg"
              >
                المشرف
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}