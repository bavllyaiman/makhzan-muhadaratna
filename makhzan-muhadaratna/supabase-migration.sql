-- إنشاء جدول الطلائع
CREATE TABLE IF NOT EXISTS tali3at (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_id TEXT NOT NULL DEFAULT 'al-oqab',
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'from-burgundy to-burgundy-light',
  banner_color TEXT NOT NULL DEFAULT 'from-burgundy-dark via-burgundy to-burgundy-dark',
  image_url TEXT
);

-- إنشاء جدول المحاضرات
CREATE TABLE IF NOT EXISTS muhadarat (
  id TEXT PRIMARY KEY,
  tali3a_id TEXT NOT NULL REFERENCES tali3at(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  pdf_url TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إنشاء جدول الزوار
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tali3a TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إدراج الطلائع الافتراضية
INSERT INTO tali3at (id, name, logo_id, description, color, banner_color) VALUES
  ('al-oqab', 'طليعة العقاب', 'al-oqab', 'طليعة العقاب - رمز القوة والشجاعة', 'from-red-900 to-red-800', 'from-red-950 via-red-900 to-amber-900'),
  ('al-bawashiq', 'طليعة البواشق', 'al-bawashiq', 'طليعة البواشق - رمز السرعة والمهارة', 'from-slate-800 to-slate-700', 'from-slate-950 via-slate-900 to-stone-900'),
  ('al-ghurab', 'طليعة الغراب', 'al-ghurab', 'طليعة الغراب - رمز الذكاء والحكمة', 'from-gray-900 to-gray-800', 'from-gray-950 via-gray-900 to-zinc-900'),
  ('al-shahin', 'طليعة الشاهين', 'al-shahin', 'طليعة الشاهين - رمز السرعة والانقضاض', 'from-amber-800 to-amber-700', 'from-amber-950 via-amber-900 to-yellow-900'),
  ('al-nusur', 'طليعة النسور', 'al-nusur', 'طليعة النسور - رمز العظمة والكبرياء', 'from-blue-900 to-blue-800', 'from-blue-950 via-blue-900 to-indigo-900'),
  ('al-suqur', 'طليعة الصقور', 'al-suqur', 'طليعة الصقور - رمز القوة والصبر', 'from-emerald-800 to-emerald-700', 'from-emerald-950 via-emerald-900 to-teal-900')
ON CONFLICT (id) DO NOTHING;

-- تفعيل Row Level Security
ALTER TABLE tali3at ENABLE ROW LEVEL SECURITY;
ALTER TABLE muhadarat ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- السماح للكل بقراءة الطلائع والمحاضرات
CREATE POLICY "الكل يمكنه قراءة الطلائع" ON tali3at FOR SELECT USING (true);
CREATE POLICY "الكل يمكنه قراءة المحاضرات" ON muhadarat FOR SELECT USING (true);

-- السماح للكل بإدراج الزوار
CREATE POLICY "الكل يمكنه تسجيل الدخول" ON visitors FOR INSERT WITH CHECK (true);

-- إنشاء bucket للتخزين PDF
INSERT INTO storage.buckets (id, name, public) VALUES ('lectures-pdf', 'lectures-pdf', true)
ON CONFLICT (id) DO NOTHING;
