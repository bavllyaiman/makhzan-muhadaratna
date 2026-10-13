# دوري الكشافة — Scout League Platform

منصة داخلية لإدارة محاضرات الكشافة، رصيد النقاط، الطلائع، وترتيب الدوري.
بُنيت بـ **Next.js 15 (App Router)**، **React 19**، **Tailwind CSS**، **Framer Motion**،
و**Three.js / React Three Fiber**، مع طبقة أمان مبنية على مبدأ Zero-Trust.

---

## التشغيل السريع

```bash
npm install
cp .env.example .env.local     # ثم املأ JWT_SECRET و CSRF_SECRET بقيمة عشوائية قوية
npm run dev
```

توليد أسرار عشوائية:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

| السكربت | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير |
| `npm run build` | توليد Prisma Client + بناء الإنتاج |
| `npm start` | تشغيل بناء الإنتاج |
| `npm run typecheck` | فحص الأنواع |
| `npm run db:push` | إنشاء الجداول في قاعدة البيانات |
| `npm run db:seed` | تعبئة بيانات تجريبية (idempotent) |
| `npm run db:migrate` | ترحيل بتغيير ملف migration |
| `npm run db:studio` | متصفح بصري للبيانات |

---

## النشر على Netlify

التطبيق مستضاف على **Netlify** (مجاني، ويشمل الاستخدام التجاري)، وقاعدة البيانات على
**Neon** (مجاني، Frankfurt).

### ١. ربط قاعدة البيانات

التطبيق يرفض الإقلاع في الإنتاج بدون `DATABASE_URL` بدل أن يعمل على الذاكرة
ويمسح بيانات الأعضاء عند كل نشر.

1. مشروع Neon موجود بالفعل في `.env.local` محلياً.
2. عند النشر، نفس الرابط goes في Netlify → **Environment variables**.
3. استخدم رابط **`-pooler`** وليس المباشر — الرابط المباشر يفتح اتصال TCP طويل
   العمر، وبيئة serverless هتستهلك كل اتصالات القاعدة في دقائق.

### ٢. النشر

ادفع الكود لـ GitHub، ثم من [app.netlify.com](https://app.netlify.com):
**Add new site → Import an existing project**. الـ build command وحقل publish
**سيبهم فاضيين** — الـ Next.js runtime بيتكفّل بيهما.

أي `git push` بعد كده = نشر تلقائي.

الإعدادات كلها في `netlify.toml`.

### ٣. متغيرات البيئة

من **Site configuration → Environment variables**، فعّلها لـ Production:

```
DATABASE_URL                     رابط Neon الـ pooled
JWT_SECRET                       48 حرف عشوائي
CSRF_SECRET                      48 حرف عشوائي، مختلف عن اللي فوق
SECURE_COOKIES                   true
TRUST_PROXY                      true
AUDIT_LOG_ENABLED                true
SEED_DEMO_ACCOUNTS               false
NODE_ENV                         production
NETLIFY_NEXT_SKEW_PROTECTION     true
```

> ⚠️ **`SEED_DEMO_ACCOUNTS=false` إجباري.** الموقع عام، ولو فُعّل هذا الخيار فإن
> أي نشر جديد هيعيد إنشاء حسابات بكلمة مرور معروفة.

### ٤. لا تضيف `public/_redirects`

قاعدة `/* /index.html 200` هي اختصار تطبيقات SPA (Create React App / Vite) اللي
بتعمل routing في المتصفح. مشروعك بيستخدم **App Router** وبيعمل routing في
السيرفر. القواعد دي بتتخطى إعادة الكتابة اللي Next.js Runtime بيولّدها، وبتحوّل
كل الطلبات — بما فيها `/api/auth/login` — إلى `index.html`. التوجيه بيتم بالكامل
عبر Next.js، فمفيش حاجة تضيفها.

نفس السبب: ترويسات الأمان موجودة في `next.config.mjs` بس، ولا تُكرَّر في
`netlify.toml` — تكرارها بيخرج ترويسين لنفس البوليصة.

### ٥. حدّد المحاولات يحتاج Redis

المحدّد الحالي في ذاكرة العملية. على Netlify كل function بينفَّذ في lambda
مستقل، فالعدّاد بيبدأ من صفر كل مرة — يعني الحد بيتجاهَل فعلياً.
الواجهة جاهزة في `lib/server/rate-limit.ts`، والتبديل لمخزن مشترك (Upstash
Redis مثلاً) تغيير في ملف واحد.

---

## البنية

```
src/
├── middleware.ts                 # CSP بالـ nonce + بوابة أولية للمسارات المحمية
├── app/
│   ├── layout.tsx                # جذر RTL + خطوط عربية + AppShell
│   ├── page.tsx                  # الرئيسية / لوحة المعلومات (Server Component)
│   ├── login/                    # تسجيل الدخول بالهوية الوطنية
│   ├── profile/  points/  patrols/  individuals/  lectures/  settings/  support/
│   └── api/                      # Route Handlers
│       ├── auth/login  auth/logout  auth/session
│       ├── leaderboard  lectures  points  me
├── components/
│   ├── layout/                   # Header, SideDrawer, Footer, SupportBar, AppShell
│   ├── home/                     # HeroSection, LeaderboardCarousel, AssessmentSection
│   ├── three/                    # ScoutCanvas (Three.js) + ScoutHero (بديل آمن)
│   ├── auth/  lectures/  settings/  providers/
├── lib/
│   ├── shared/                   # schemas.ts (Zod) + navigation.ts  ← مشتركة بين الطرفين
│   └── server/                   # طبقة الخادم (غير مسرّبة للعميل)
│       ├── env.ts                # عقد البيئة مع فشل مبكر
│       ├── jwt.ts  password.ts  csrf.ts  auth.ts  auth-service.ts
│       ├── rate-limit.ts  security-headers.ts  http.ts
│       └── data-source/          # ← طبقة التخزين (المحور)
│           ├── types.ts          #    عقد DataSource
│           ├── postgres.ts       #    Prisma + Postgres
│           ├── memory.ts         #    Maps (تطوير فقط)
│           └── index.ts          #    اختيار المحوّل + منع الإقلاع بلا قاعدة بيانات
├── repositories.ts               # واجهة المستودعات (async) — نقطة الدخول الوحيدة للبيانات
prisma/
├── schema.prisma                 # الجداول و الـ enums
├── seed.ts                       # تعبئة البيانات (idempotent)
└── migrations/                   # (اختياري) استخدم db:migrate بدل db:push
prisma.config.ts                  # يربط Prisma CLI بـ .env.local
```

**نظافة المعمارية:** طبقة `lib/server` لا تستورد أي شيء من العميل، والحزم التي تنوي
`server-only` ملفوفة بـ`import 'server-only'` فتنكسر بصمت لو أُعيد استخدامها في
مكوّن عميل. الواجهة الأمامية لا تتحدث مع قاعدة البيانات إطلاقاً — فقط عبر
`src/app/api`.

---

## نموذج الأمان

### 1. المصادقة (Authentication)

| الخاصية | التنفيذ |
| --- | --- |
| تخزين الجلسة | كوكي **HttpOnly** — لا يمكن لجافاسكريبت قراءتها، لذا XSS لا يمكنه سرقة الجلسة |
| `SameSite` | `Strict` — الكوكي لا تُرسل مع طلبات من مواقع أخرى |
| `__Host-` بادئة | تُستخدم عند `SECURE_COOKIES=true` — يمنع تظليل الكوكي عبر نطاق فرعي. البادئة مربوطة بـ`SECURE_COOKIES` وليس `NODE_ENV` لأن المتصفحات ترفض `__Host-` بدون `Secure` |
| توقيع الرمز | **HS256** عبر `jose`، خوارزمية مثبّتة صريحاً لمنع هجمات خلط الخوارزميات |
| المحتوى | الرمز يحمل `sub` + `sid` + `role` فقط — **لا توجد بيانات شخصية** داخله |
| الإبطال | فحص مخزن الجلسات في كل طلب: الخروج وتغيير كلمة المرور يُبطلان فوراً |
| الصلاحية | 30 دقيقة افتراضياً (قابلة للضبط) |

### 2. منع تعداد المستخدمين

كل حالات الفشل تُعيد **نفس الرسالة** (`بيانات الدخول غير صحيحة`)، وعند عدم وجود
الحساب يتم تنفيذ **تحقّق Argon2id وهمي** على نفس الـ digest حتى يتساوى زمن
الاستجابة، فلا يمكن استنتاج وجود الحساب من زمن الرد. القفل التدريجي بعد
5 محاولات يوقف التخمين.

### 3. كلمات المرور

**Argon2id** بمعاملات OWASP: `m=19456 KiB`, `t=2`, `p=1`, salt 19 بايت, tag 32 بايت.
سلسلة PHC ذاتية الوصف، لذا يمكن رفع التكلفة لاحقاً دون إبطال الهاشات القائمة.

### 4. التحقق من المدخلات (Zod)

المخططات في `lib/shared/schemas.ts` تُنفَّذ على **الطرفين** — في المتصفح لتحسين
التجربة، وفي الخادم كحدّ أمني حقيقي.

```ts
export const NATIONAL_ID_PATTERN = /^[0-9]{8}$/;
```

حقل الهوية يرشّح `[^0-9]` عند الكتابة واللصق والإفلات، فالأحرف والمسافات لا تدخل
الحالة أصلاً. الاستعلامات تُحلَّل بقوائم بيضاء: أي معامل غير معروف يُسقَط بواسطة
Zod ولا يصل إلى طبقة البيانات. حد 8 كيلوبايت لحجم الطلب يمنع استنزاف الذاكرة.

**XSS:** لا يوجد `dangerouslySetInnerHTML` في المشروع — قيم React تُهرَّب تلقائياً،
و`CSP` بدون `unsafe-inline` يغلق أي مسار متبقٍ.

**SQL Injection:** لا استعلامات SQL نصية في هذه النسخة؛ طبقة المستودعات هي الحد
الفاصل، وأي استبدال بـ ORM/prisma يجب أن يستخدم الاستعلامات المعاملية حصراً.

### 5. الترويسات الأمنية

تُبنى في `next.config.mjs` (ثابتة) وفي `middleware.ts` (ديناميكية):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic';
  style-src 'self' 'nonce-…'; object-src 'none'; frame-ancestors 'none'; form-action 'self';
  base-uri 'self'; upgrade-insecure-requests; block-all-mixed-content
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

الـ **nonce عشوائي لكل طلب** ويُمرَّر عبر ترويسة `x-nonce` ليستخدمه Next.js في
وسومه المُولَّدة. `'strict-dynamic'` يسمح للـ bootstrap المحمَّل بالـ nonce بتحميل
بقية الحزم دون فتح قائمة مضيفات.

### 6. CSRF

طبقتان: `SameSite=Strict` + **double-submit token**. الكوكي `scout_csrf` مقروء من
JS ويُعاد إرساله في ترويسة `x-csrf-token`، ويُقارَن بزمن ثابت في
`assertCsrf()` لكل طلب مُعدِّل.

### 7. تحديد المعدل

محدِّد نوافذ ثابت في الذاكرة، بمفتاحين منفصلين لواجهة الدخول:
`login:ip` (يقاوم رشّ المحاولات على عناوين متعددة) و`login:id` (يقاوم هجوم التخمّن الموزّع على حساب واحد).
`clientIp()` **يتجاهل** `X-Forwarded-For` ما لم يكن `TRUST_PROXY=true`، وإلا لأمكن
انتحال الترويسة لتخطّي الحد.

> **ملاحظة للنشر:** مخزن المعدلات في الذاكرة خاص بالعملية. عند التوسّع الأفقي
> أو التشغيل على serverless استبدل `RateLimitStore` بتخزين Redis
> (`INCR` + `EXPIRE` أو سكربت Lua للذرّية). الواجهة مصمّمة ليكون الاستبدال
> في ملف واحد.

### 8. RBAC

`requireRole(...roles)` — **لا يوجد مسار "أي مستخدم مصدَّق"**، فالطرق الجديدة
آمنة افتراضياً. الأدوار تُقرأ من قاعدة البيانات في كل طلب (لا من العميل ولا من
الـ JWT بمفرده)، فتنزيل رتبة يسري فوراً. صفحات العرض تستدعي
`requireSession()` على الخادم.

---

## الواجهة الأمامية

- **RTL كامل** مع خطوط Cairo / Tajawal.
- **Framer Motion** حركات دخول وتسلسل + احترام `prefers-reduced-motion`.
- **مشهد ثلاثي الأبعاد**: `ScoutCanvas.tsx` يبني شخصية كشاف منخفضة المضلّعات من
  primitives (زي زيتوني، وشاح، قبعة، بنطال جينز أزرق) — استبدلها بنموذج GLB
  بتبديل محتوى `<group>` بـ `<primitive object={gltf.scene} />`.
  `ScoutHero.tsx` يكتشف WebGL ويعيد الرسم إلى لوحة ثابتة عند غيابه.
- **قائمة جانبية**: تركيز محبوس، إغلاق بـEscape، قفل تمرير، وإغلاق تلقائي عند
  تغيير المسار.
- **تنقّل لوحة المفاتيح**: مؤشر تركيز مرئي، `aria-label` عربي، حلقات تسميات
  (`role="status"`/`tab`/`menu`)، ومنع إعادة التوجيه المفتوح في صفحة الدخول.

---

## ملاحظات ما قبل الإنتاج

1. **دوّر كلمة مرور Neon.** رابط الاتصال اتكتب في محادثة مسجّلة؛ اعمل
   **Neon → Roles → reset** وحدّث `DATABASE_URL` في Netlify.
2. **انقل المحدِّد إلى Redis** — على serverless العدّاد في الذاكرة لا يعمل.
3. `SEED_DEMO_ACCOUNTS=false` في الإنتاج، واحذف أي حسابات تجريبية عبر
   `npm run db:studio` قبل admissions حقيقي.
4. فعّل `AUDIT_LOG_ENABLED` ووجّه `auditLogin()` إلى SIEM.
5. أضف `Content-Security-Policy-Report-Only` وراقب التقارير قبل تشديد السياسة.
6. دوّر `JWT_SECRET` عبر مدير أسرار؛ تدويره يُبطل كل الجلسات بطبيعته.
7. صدّر نسخة احتياطية دورية من Neon — قاعدة البيانات الوحيدة اللي فيها بيانات
   مُنتَج، فحمايتها أهم مهمة تشغيلية.
8. **ما تحطش `NEXT_OUTPUT_STANDALONE`** — دي كانت خاصية Docker بس اتشالت.