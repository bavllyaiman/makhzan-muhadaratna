import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/shared/navigation';
import { ScoutLogo } from './ScoutLogo';
import { SupportBar } from './SupportBar';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full">
      <SupportBar />

      <div className="border-t border-beige-300/70 bg-beige-50/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div className="flex flex-col items-start gap-3">
            <ScoutLogo />
            <p className="text-sm leading-relaxed text-beige-400">
              منصة داخلية لتنظيم محاضرات الكشافة، متابعة رصيد النقاط، وترتيب الدوري بين الطلائع.
            </p>
          </div>

          <nav aria-label="روابط الموقع">
            <h2 className="mb-3 text-sm font-bold text-forest-800">الأقسام</h2>
            <ul className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-beige-400 transition-colors hover:text-forest-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-sm font-bold text-forest-800">الأمان والخصوصية</h2>
            <ul className="space-y-2 text-sm text-beige-400">
              <li>اتصال مشفّر بالكامل عبر HTTPS / TLS 1.3</li>
              <li>جلسات محمية بكوكيز HttpOnly و SameSite=Strict</li>
              <li>تشفير كلمات المرور بخوارزمية Argon2id</li>
              <li>سجل تدقيق ومراقبة لحدود الطلبات</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-beige-300/60 px-4 py-4 text-center text-xs text-beige-400 sm:px-6">
          © {year} — جميع الحقوق محفوظة — {new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>
    </footer>
  );
}