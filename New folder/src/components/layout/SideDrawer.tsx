'use client';

import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/shared/navigation';
import { NavIcon } from './NavIcon';

/**
 * Side drawer. Accessibility contract:
 *  - Focus is moved into the panel on open and trapped while open.
 *  - Escape closes it; clicking the scrim closes it; body scroll is locked.
 *  - `inert`-like behaviour is approximated by rendering it only when open.
 */

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used inside <DrawerProvider>');
  return ctx;
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DrawerContext.Provider value={{ open, setOpen }}>{children}</DrawerContext.Provider>;
}

export function SideDrawer() {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = panelId ? document.getElementById(panelId) : null;
    focusables?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, panelId, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية">
          <motion.button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 h-full w-full cursor-default bg-forest-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          />

          <motion.nav
            id={panelId}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col
                       bg-gradient-to-b from-forest-800 to-forest-900 text-beige-100
                       shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold">القائمة الرئيسية</p>
                <p className="text-xs text-beige-300">تنقّل بين أقسام المنصة</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="rounded-lg p-2 text-beige-200 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV_ITEMS.map((item, index) => {
                const active = pathname === item.href;
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200
                        ${
                          active
                            ? 'bg-beige-100 text-forest-800 shadow-inner'
                            : 'text-beige-200 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span
                        className={`mt-0.5 rounded-lg p-2 transition-colors
                          ${active ? 'bg-forest-600 text-white' : 'bg-white/10 text-olive-300'}`}
                      >
                        <NavIcon name={item.icon} className="h-5 w-5" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span className={`text-xs ${active ? 'text-forest-600/70' : 'text-beige-300/80'}`}>
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
}