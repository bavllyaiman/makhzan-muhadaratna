'use client';

import { Phone, ShieldCheck } from 'lucide-react';
import { SUPPORT_PHONES } from '@/lib/shared/navigation';

/**
 * Support bar. Numbers are constants from a shared module and are rendered as
 * text — never interpolated into `href` from user input, and `rel="noopener"`
 * prevents tabnabbing.
 */
export function SupportBar() {
  return (
    <div className="w-full border-y border-beige-300/70 bg-olive-900 text-beige-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6">
        <span className="flex items-center gap-2 text-beige-300">
          <ShieldCheck className="h-4 w-4 text-olive-300" />
          للدعم الفني والتواصل المباشر
        </span>

        <ul className="flex flex-wrap items-center gap-2" dir="ltr">
          {SUPPORT_PHONES.map((phone) => (
            <li key={phone}>
              <a
                href={`tel:${phone}`}
                className="chip bg-white/10 text-beige-50 tabular transition hover:bg-olive-700 hover:text-white"
              >
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}