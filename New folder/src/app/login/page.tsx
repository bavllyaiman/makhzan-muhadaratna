import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { SUPPORT_PHONES } from '@/lib/shared/navigation';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full items-center gap-8 lg:grid-cols-2">
        <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-beige-200" />}>
          <LoginForm />
        </Suspense>

        <aside className="hidden lg:block">
          <h2 className="font-display text-3xl font-bold leading-snug text-forest-800">
            نظام آمن لإدارة
            <span className="block text-forest-600">الدوري والمحاضرات</span>
          </h2>

          <ul className="mt-6 space-y-4 text-sm text-beige-400">
            {[
              'كلمات المرور مشفّرة بخوارزمية Argon2id.',
              'جلسات محفوظة في كوكيز HttpOnly لا يمكن قراءتها من جافاسكريبت.',
              'حماية كاملة ضد XSS و SQL Injection عبر التحقق الصارم من المدخلات.',
              'تحديد لعدد المحاولات لمنع هجمات التخمين.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-beige-300 bg-white/70 p-4 text-sm">
            <p className="font-semibold text-forest-800">تحتاج مساعدة؟</p>
            <p className="mt-1 text-beige-400">تواصل مع الدعم الفني:</p>
            <ul className="mt-2 flex flex-wrap gap-2" dir="ltr">
              {SUPPORT_PHONES.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} className="chip bg-forest-100 text-forest-700 hover:bg-forest-200">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}