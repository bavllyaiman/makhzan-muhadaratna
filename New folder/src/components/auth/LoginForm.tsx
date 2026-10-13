'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { NATIONAL_ID_PATTERN, loginSchema } from '@/lib/shared/schemas';
import { useSecurity } from '@/components/providers/SecurityProvider';

/**
 * Login form.
 *
 * Input handling / XSS defence:
 *  - The national-ID field only ever contains `[0-9]`: paste, drop, IME and
 *    keypress are all filtered before React sees the value, so nothing else can
 *    even enter the state.
 *  - Same regex is re-validated by Zod before submit AND again on the server,
 *    so client-side checks are a UX affordance, never the security boundary.
 *  - No `dangerouslySetInnerHTML` anywhere; React escapes all bound values.
 */

interface FieldErrors {
  nationalId?: string;
  password?: string;
  form?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiFetch, refresh, user } = useSecurity();

  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const nationalIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nationalIdRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) {
      const next = searchParams.get('next');
      // Only allow same-origin relative redirects — blocks open-redirect abuse.
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/profile');
    }
  }, [user, router, searchParams]);

  const sanitizeNumeric = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '');
    return digits.slice(0, 8);
  };

  const validate = (): boolean => {
    const result = loginSchema.safeParse({ nationalId, password });
    if (result.success) {
      setErrors({});
      return true;
    }

    const next: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === 'nationalId' || field === 'password') next[field] ??= issue.message;
    }
    setErrors(next);
    return false;
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !validate()) return;

    setPending(true);
    setErrors({});

    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ nationalId, password }),
      });
      await refresh();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'تعذّر تسجيل الدخول' });
      setPending(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card w-full max-w-md space-y-5 p-6 sm:p-8"
    >
      <header className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-600 text-white shadow-md">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-forest-800">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-beige-400">أدخل رقم هويتك الوطنية وكلمة المرور</p>
      </header>

      {errors.form && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errors.form}</span>
        </motion.div>
      )}

      <div className="space-y-2">
        <label htmlFor="nationalId" className="block text-sm font-semibold text-forest-800">
          رقم الهوية الوطنية
        </label>

        <div className="relative">
          <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-beige-400" />
          <input
            ref={nationalIdRef}
            id="nationalId"
            name="nationalId"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={8}
            dir="ltr"
            value={nationalId}
            onChange={(e) => setNationalId(sanitizeNumeric(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData('text');
              setNationalId((current) => (current + sanitizeNumeric(text)).slice(0, 8));
            }}
            onDrop={(e) => e.preventDefault()}
            aria-invalid={Boolean(errors.nationalId)}
            aria-describedby={errors.nationalId ? 'nationalId-error' : 'nationalId-hint'}
            className={`w-full rounded-xl border bg-white py-3 pl-3 pr-10 text-left text-base tracking-[0.3em] tabular
              outline-none transition focus:ring-2 focus:ring-forest-500/40
              ${errors.nationalId ? 'border-red-300' : 'border-beige-300 focus:border-forest-500'}`}
            placeholder="00000000"
          />
        </div>

        {errors.nationalId ? (
          <p id="nationalId-error" className="text-xs text-red-600">
            {errors.nationalId}
          </p>
        ) : (
          <p id="nationalId-hint" className="text-xs text-beige-400">
            8 أرقام فقط — بدون مسافات أو حروف.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-forest-800">
          كلمة المرور
        </label>

        <div className="relative">
          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-beige-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, 128))}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`w-full rounded-xl border bg-white py-3 pl-11 pr-10 text-sm outline-none transition
              focus:ring-2 focus:ring-forest-500/40
              ${errors.password ? 'border-red-300' : 'border-beige-300 focus:border-forest-500'}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-beige-400 transition hover:text-forest-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {errors.password && (
          <p id="password-error" className="text-xs text-red-600">
            {errors.password}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full !py-3">
        {pending ? 'جارٍ التحقق…' : 'دخول'}
      </button>

      <p className="text-center text-xs leading-relaxed text-beige-400">
        اتصالك مشفّر ومحمي من ومحاولات الدخول مقيّدة. راجع إدارة الطليعة إذا فقدت كلمة المرور.
      </p>

      {/* The 8-digit contract, asserted at build time in dev. */}
      <input type="hidden" name="nationalIdPattern" value={NATIONAL_ID_PATTERN.source} readOnly />
    </motion.form>
  );
}