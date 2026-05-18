import type { Metadata } from "next";
import { Cairo, Changa, IBM_Plex_Sans_Arabic, Reem_Kufi } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

const changa = Changa({
  variable: "--font-changa",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const reemKufi = Reem_Kufi({
  variable: "--font-reem",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "مخزن محاضراتنا | منصة حفظ وتنظيم محاضرات الطلائع الكشفية",
  description:
    "منصة حفظ وتنظيم محاضرات الطلائع الكشفية - مخزن محاضراتنا",
  keywords: ["كشافة", "طلائع", "محاضرات", "مخزن محاضرات", "الكشافة تصنع القادة"],
  openGraph: {
    title: "مخزن محاضراتنا",
    description: "منصة حفظ وتنظيم محاضرات الطلائع الكشفية",
    type: "website",
    locale: "ar_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${changa.variable} ${ibmPlexSansArabic.variable} ${reemKufi.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-[var(--foreground)] font-ibm antialiased">
        {children}
      </body>
    </html>
  );
}