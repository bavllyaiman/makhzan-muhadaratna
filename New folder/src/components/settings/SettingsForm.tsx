'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Eye, Moon, Save, ShieldCheck } from 'lucide-react';
import { useSecurity } from '@/components/providers/SecurityProvider';

/**
 * Account settings. Demonstrates the CSRF-protected mutation path:
 * `apiFetch` injects the double-submit token automatically and the server
 * re-validates with Zod before touching the database.
 */
export function SettingsForm({
  initial,
}: {
  initial: { phone: string; notifications: boolean; reduceMotion: boolean };
}) {
  const { user, apiFetch } = useSecurity();

  const [notifications, setNotifications] = useState(initial.notifications);
  const [reduceMotion, setReduceMotion] = useState(initial.reduceMotion);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');

    const form = new FormData(event.currentTarget);
    const payload = {
      displayName: user?.fullName ?? '',
      phone: String(form.get('phone') ?? ''),
      notifications,
      reduceMotion,
    };

    try {
      await apiFetch('/api/me', { method: 'PATCH', body: JSON.stringify(payload) });
      setStatus('saved');
      setMessage('تم حفظ التفضيلات بنجاح.');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'تعذّر حفظ التفضيلات');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="surface-card p-6">
        <h2 className="font-display text-lg font-bold text-forest-800">بيانات الحساب</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-semibold text-forest-800">
              الاسم
            </label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={user?.fullName ?? ''}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-beige-200 bg-beige-100 px-4 py-3 text-sm text-beige-400"
            />
            <p className="text-xs text-beige-400">لتغيير الاسم راجع إدارة الطليعة.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-forest-800">
              رقم الجوال
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              dir="ltr"
              defaultValue={initial.phone}
              placeholder="9xxxxxxxx"
              className="w-full rounded-xl border border-beige-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/30"
            />
            <p className="text-xs text-beige-400">من 7 إلى 20 رقمًا.</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-6">
        <h2 className="font-display text-lg font-bold text-forest-800">التفضيلات</h2>

        <div className="mt-4 space-y-3">
          <Toggle
            icon={Bell}
            label="إشعارات المحاضرات"
            description="استقبل تنبيهاً قبل موعد كل محاضرة."
            checked={notifications}
            onChange={setNotifications}
          />
          <Toggle
            icon={Moon}
            label="تقليل الحركة"
            description="تعطيل الرسوم المتحركة في الواجهة."
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </div>
      </section>

      <section className="surface-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
          <ShieldCheck className="h-5 w-5 text-forest-600" />
          الأمان
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-beige-400">
          <li>• تغيير كلمة المرور يتم من إدارة الطليعة فقط.</li>
          <li>• كل جلسة تسجيل دخول قابلة للإلغاء فوراً من الخادم.</li>
          <li>• عند تسجيل الدخول من جهاز جديد سيتم إنهاء بقية الجلسات.</li>
        </ul>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === 'saving'} className="btn-primary">
          <Save className="h-4 w-4" />
          {status === 'saving' ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
        </button>

        {status === 'saved' && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="chip bg-forest-100 text-forest-700"
          >
            <Check className="h-3.5 w-3.5" />
            {message}
          </motion.span>
        )}
        {status === 'error' && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="chip bg-red-50 text-red-600"
            role="alert"
          >
            {message}
          </motion.span>
        )}
      </div>
    </form>
  );
}

function Toggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Eye;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-beige-200 p-4 transition hover:border-forest-300">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700">
        <Icon className="h-5 w-5" />
      </span>

      <span className="flex-1">
        <span className="block text-sm font-semibold text-forest-800">{label}</span>
        <span className="block text-xs text-beige-400">{description}</span>
      </span>

      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-beige-300 transition peer-checked:bg-forest-600" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}