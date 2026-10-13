'use client';

import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { LogIn, Menu } from 'lucide-react';
import { useState } from 'react';
import { useSecurity } from '@/components/providers/SecurityProvider';
import { ScoutLogo } from './ScoutLogo';
import { AccountIcon } from './NavIcon';
import { useDrawer } from './SideDrawer';

/**
 * Top navbar: drawer trigger on the start edge, centred logo, account on the
 * opposite edge. The bar condenses on scroll for content density on mobile.
 */
export function Header() {
  const { setOpen } = useDrawer();
  const { user, logout } = useSecurity();
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setCondensed(latest > 24);
  });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300
        ${
          condensed
            ? 'border-beige-300/80 bg-beige-50/90 shadow-sm backdrop-blur-lg'
            : 'border-transparent bg-transparent'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          className="rounded-xl border border-beige-300 bg-white/70 p-2.5 text-forest-700
                     shadow-sm transition hover:bg-white active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="shrink-0" aria-label="الصفحة الرئيسية">
          <ScoutLogo condensed={condensed} />
        </Link>

        {user ? (
          <div className="group relative">
            <button
              type="button"
              aria-label="الحساب"
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl border border-beige-300 bg-white/70
                         py-1.5 pl-3 pr-1.5 shadow-sm transition hover:bg-white active:scale-95"
            >
              <span className="hidden text-xs font-semibold text-forest-800 sm:block">
                {user.fullName.split(' ')[0]}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-600 text-white">
                <AccountIcon className="h-5 w-5" />
              </span>
            </button>

            <div
              role="menu"
              className="invisible absolute left-0 top-full z-50 mt-2 w-56 origin-top-left scale-95
                         rounded-xl border border-beige-300 bg-white p-1.5 opacity-0 shadow-lift
                         transition-all duration-200 group-hover:visible group-hover:scale-100
                         group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
            >
              <p className="px-3 py-2 text-xs text-beige-400">{user.rank} — {user.pointsBalance} نقطة</p>
              <Link
                href="/profile"
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm text-forest-800 transition hover:bg-beige-100"
              >
                الملف الشخصي
              </Link>
              <Link
                href="/settings"
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm text-forest-800 transition hover:bg-beige-100"
              >
                الإعدادات
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => void logout()}
                className="block w-full rounded-lg px-3 py-2 text-right text-sm text-red-600 transition hover:bg-red-50"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="btn-primary !py-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">تسجيل الدخول</span>
          </Link>
        )}
      </div>
    </motion.header>
  );
}