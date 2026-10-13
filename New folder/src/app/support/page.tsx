import type { Metadata } from 'next';
import { Clock, LifeBuoy, Phone } from 'lucide-react';
import { SUPPORT_HOURS, SUPPORT_PHONES } from '@/lib/shared/navigation';

export const metadata: Metadata = { title: 'الدعم' };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-600 text-white">
          <LifeBuoy className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-800">الدعم</h1>
          <p className="text-sm text-beige-400">فريق الدعم الفني جاهز لمساعدتك</p>
        </div>
      </header>

      <section className="surface-card p-6">
        <h2 className="font-display text-lg font-bold text-forest-800">أرقام التواصل</h2>
        <p className="mt-1 text-sm text-beige-400">اختر الرقم المناسب أو اتصل مباشرة.</p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {SUPPORT_PHONES.map((phone) => (
            <li key={phone}>
              <a
                href={`tel:${phone}`}
                className="surface-card-hover flex items-center gap-3 p-5"
                // Constants only — no user-controlled data is interpolated.
                rel="noopener noreferrer"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="tabular block font-display text-lg font-bold text-forest-800" dir="ltr">
                    {phone}
                  </span>
                  <span className="text-xs text-beige-400">اتصال هاتفي</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-5 flex items-center gap-2 rounded-xl bg-beige-100 p-3 text-sm text-beige-400">
          <Clock className="h-4 w-4 text-forest-600" />
          {SUPPORT_HOURS}
        </p>
      </section>

      <section className="surface-card p-6">
        <h2 className="font-display text-lg font-bold text-forest-800">أسئلة شائعة</h2>

        <dl className="mt-4 space-y-4">
          {[
            {
              q: 'نسيت كلمة المرور',
              a: 'تواصل مع إدارة الطليعة أو الدعم الفني لإعادة تعيين كلمة المرور مؤقتاً.',
            },
            {
              q: 'لم تُحتسب نقاط المحاضرة',
              a: 'يتم احتساب النقاط بعد إغلاق المحاضرة واعتماد الحضور من قائد الطليعة.',
            },
            {
              q: 'أريد الاعتراض على رصيدي',
              a: 'راجع سجل النقاط في صفحة النقاط، وأبلغ القائد لطلب التسوية.',
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl border border-beige-200 bg-beige-50/60 p-4">
              <dt className="text-sm font-bold text-forest-800">{faq.q}</dt>
              <dd className="mt-1 text-sm text-beige-400">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}