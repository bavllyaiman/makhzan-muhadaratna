import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { SecurityProvider } from '@/components/providers/SecurityProvider';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

/**
 * Metadata hardening: no referrer leakage, no indexing of authenticated views,
 * explicit referrer policy mirroring the response header.
 */
export const metadata: Metadata = {
  title: {
    default: 'دوري الكشافة — منصة المحاضرات والنقاط',
    template: '%s | دوري الكشافة',
  },
  description: 'منصة داخلية لتنظيم محاضرات الكشافة، متابعة النقاط، وترتيب الدوري.',
  applicationName: 'دوري الكشافة',
  referrer: 'strict-origin-when-cross-origin',
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: '/favicon.svg' },
  formatDetection: { telephone: false },
  other: { 'x-frame-options': 'DENY' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#24583E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="min-h-dvh antialiased">
        <SecurityProvider>
          <AppShell>{children}</AppShell>
        </SecurityProvider>
      </body>
    </html>
  );
}