'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { DrawerProvider, SideDrawer } from './SideDrawer';

/**
 * App shell. A shared `key` on the motion wrapper forces a clean entrance
 * animation on each route change without remounting the header/footer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <DrawerProvider>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <SideDrawer />

        <main id="main" className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </DrawerProvider>
  );
}