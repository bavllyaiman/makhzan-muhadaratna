"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScoutLogo from "@/components/ScoutLogo";
import { loadTali3atList, saveTali3atList, getLogoOptions } from "@/lib/data";
import { Tali3a } from "@/lib/types";

type Tab = "overview" | "lectures" | "visitors" | "add" | "tali3at";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_auth") === "true";
    }
    return false;
  });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [filterTali3a, setFilterTali3a] = useState("all");

  const [tali3at, setTali3at] = useState<Tali3a[]>(loadTali3atList);
  const [editingTali3a, setEditingTali3a] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", logoId: "", imageUrl: "" });
  const [editMsg, setEditMsg] = useState("");

  const totalViews = 0;
  const totalLectures = 0;
  const totalTali3at = tali3at.length;
  const lecturesByTali3a = tali3at.map((t) => ({ name: t.name, count: 0 }));
  const filteredLectures: any[] = [];

  const startEdit = (t: Tali3a) => {
    setEditingTali3a(t.id);
    setEditForm({ name: t.name, description: t.description, logoId: t.logoId, imageUrl: t.imageUrl || "" });
    setEditMsg("");
  };

  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.description.trim()) {
      setEditMsg("جميع الحقول مطلوبة");
      return;
    }
    const updated = tali3at.map((t) =>
      t.id === editingTali3a
        ? { ...t, name: editForm.name, description: editForm.description, logoId: editForm.logoId, imageUrl: editForm.imageUrl || undefined }
        : t
    );
    setTali3at(updated);
    saveTali3atList(updated);
    setEditingTali3a(null);
    setEditMsg("✅ تم الحفظ بنجاح");
    setTimeout(() => setEditMsg(""), 3000);
  };

  const cancelEdit = () => {
    setEditingTali3a(null);
    setEditMsg("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === "admin" && loginData.password === "admin1988") {
      sessionStorage.setItem("admin_auth", "true");
      setAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-burgundy-dark via-burgundy to-burgundy-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-cream rounded-2xl p-8 vintage-shadow">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold font-reem text-burgundy-dark mb-2">
                لوحة التحكم
              </h1>
              <p className="text-wood font-cairo">تسجيل دخول المشرف</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-burgundy-dark font-cairo font-semibold text-sm mb-1">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-cairo"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-burgundy-dark font-cairo font-semibold text-sm mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-cairo"
                  placeholder="******"
                />
              </div>

              {loginError && (
                <p className="text-scout-red text-sm font-cairo text-center">{loginError}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-lg hover:shadow-lg hover:shadow-burgundy/30 transition-all"
              >
                دخول
              </motion.button>
            </form>

            <p className="text-xs text-wood/50 text-center mt-6 font-cairo">
              المشرف فقط هو من يمكنه الدخول
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "نظرة عامة" },
    { id: "lectures", label: "المحاضرات" },
    { id: "visitors", label: "الزوار" },
    { id: "add", label: "إضافة محاضرة" },
    { id: "tali3at", label: "إدارة الطلائع" },
  ];

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <div className="bg-gradient-to-l from-burgundy-dark via-burgundy to-burgundy-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold font-reem">لوحة التحكم</h1>
                <p className="text-cream/60 text-sm font-cairo">إدارة المحاضرات والبيانات</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-cream rounded-lg font-cairo text-sm transition-all"
            >
              تسجيل خروج
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg font-cairo font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-cream text-burgundy-dark"
                    : "bg-white/10 hover:bg-white/20 text-cream"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "المحاضرات", value: totalLectures, icon: "📚", color: "from-burgundy to-burgundy-light" },
                { label: "الطلائع", value: totalTali3at, icon: "🏕️", color: "from-wood to-wood-light" },
                { label: "إجمالي المشاهدات", value: totalViews, icon: "👁️", color: "from-gold to-yellow-700" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="scout-card rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <span className={`text-3xl font-bold font-reem text-transparent bg-clip-text bg-gradient-to-l ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="text-wood font-cairo font-bold">{stat.label}</h3>
                </motion.div>
              ))}
            </div>

            <div className="scout-card rounded-xl p-6">
              <h3 className="text-xl font-bold font-reem text-burgundy-dark mb-6">
                المحاضرات حسب الطليعة
              </h3>
              <div className="space-y-4">
                {lecturesByTali3a.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-24 sm:w-32 text-sm font-cairo text-burgundy-dark font-bold">
                      {item.name}
                    </span>
                    <div className="flex-1 bg-wood/10 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / Math.max(...lecturesByTali3a.map((l) => l.count))) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-l from-burgundy to-gold rounded-full"
                      />
                    </div>
                    <span className="text-sm font-bold font-cairo text-burgundy-dark w-8 text-left">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "lectures" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-wrap gap-4 mb-8 items-center">
              <h2 className="text-2xl font-bold font-reem text-burgundy-dark">
                المحاضرات
              </h2>
              <select
                value={filterTali3a}
                onChange={(e) => setFilterTali3a(e.target.value)}
                className="px-4 py-2 bg-white border border-wood/20 rounded-lg font-cairo text-sm focus:outline-none focus:border-burgundy"
              >
                <option value="all">كل الطلائع</option>
                {tali3at.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl overflow-hidden vintage-shadow">
                <thead>
                  <tr className="bg-burgundy text-cream">
                    <th className="py-3 px-4 text-right font-cairo text-sm">العنوان</th>
                    <th className="py-3 px-4 text-right font-cairo text-sm">الطليعة</th>
                    <th className="py-3 px-4 text-right font-cairo text-sm">التاريخ</th>
                    <th className="py-3 px-4 text-right font-cairo text-sm">المشاهدات</th>
                    <th className="py-3 px-4 text-right font-cairo text-sm">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLectures.map((lecture, i) => {
                    const t = tali3at.find((t) => t.id === lecture.tali3aId);
                    return (
                      <motion.tr
                        key={lecture.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-wood/10 hover:bg-wood/5 transition-colors"
                      >
                        <td className="py-3 px-4 font-cairo text-burgundy-dark font-semibold">
                          {lecture.title}
                        </td>
                        <td className="py-3 px-4 text-wood text-sm">{t?.name}</td>
                        <td className="py-3 px-4 text-wood text-sm">{lecture.date}</td>
                        <td className="py-3 px-4 text-wood text-sm">{lecture.views}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-burgundy/10 text-burgundy rounded-lg text-xs font-cairo font-bold hover:bg-burgundy/20 transition-colors">
                              تعديل
                            </button>
                            <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-cairo font-bold hover:bg-red-100 transition-colors">
                              حذف
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "visitors" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold font-reem text-burgundy-dark mb-6">
              بيانات الزوار
            </h2>

            <div className="scout-card rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold font-cairo text-burgundy-dark mb-2">
                قريباً
              </h3>
              <p className="text-wood">
                سيتم عرض بيانات الزوار بعد ربط قاعدة البيانات
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "add" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold font-reem text-burgundy-dark mb-6">
              إضافة محاضرة جديدة
            </h2>

            <div className="scout-card rounded-xl p-6 sm:p-8 max-w-2xl">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
              >
                <div>
                  <label className="block text-burgundy-dark font-cairo font-bold text-sm mb-2">
                    اسم المحاضرة
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-cairo"
                    placeholder="أدخل عنوان المحاضرة"
                  />
                </div>

                <div>
                  <label className="block text-burgundy-dark font-cairo font-bold text-sm mb-2">
                    الطليعة
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-cairo">
                    <option value="">اختر الطليعة</option>
                    {tali3at.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-burgundy-dark font-cairo font-bold text-sm mb-2">
                    الوصف
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-cairo resize-none"
                    placeholder="وصف المحاضرة"
                  />
                </div>

                <div>
                  <label className="block text-burgundy-dark font-cairo font-bold text-sm mb-2">
                    ملف PDF
                  </label>
                  <div className="border-2 border-dashed border-wood/30 rounded-lg p-8 text-center hover:border-burgundy/50 transition-colors cursor-pointer">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-wood font-cairo text-sm">
                      اسحب ملف PDF هنا أو اضغط للاختيار
                    </p>
                    <p className="text-wood/50 text-xs mt-1 font-cairo">
                      يدعم ملفات PDF فقط
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-lg hover:shadow-lg hover:shadow-burgundy/30 transition-all"
                >
                  إضافة المحاضرة
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "tali3at" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-reem text-burgundy-dark">
                إدارة الطلائع
              </h2>
              {editMsg && (
                <span className="text-green-700 font-cairo font-bold text-sm bg-green-50 px-4 py-2 rounded-lg">
                  {editMsg}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tali3at.map((t) => (
                <div key={t.id} className="scout-card rounded-xl p-4 sm:p-6">
                  {editingTali3a === t.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <ScoutLogo logoId={editForm.logoId} className="w-16 h-16" />
                        <select
                          value={editForm.logoId}
                          onChange={(e) => setEditForm({ ...editForm, logoId: e.target.value })}
                          className="px-3 py-2 bg-white border border-wood/20 rounded-lg font-cairo text-sm"
                        >
                          {getLogoOptions().map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg font-cairo"
                        placeholder="اسم الطليعة"
                      />
                      <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg font-cairo resize-none"
                        placeholder="الوصف"
                      />
                      <input
                        type="text"
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-wood/20 rounded-lg font-cairo text-sm"
                        placeholder="رابط صورة الطليعة (اختياري)"
                      />
                      {editForm.imageUrl && (
                        <div className="relative h-24 rounded-lg overflow-hidden border border-wood/20">
                          <img src={editForm.imageUrl} alt="معاينة" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                          <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-cream px-2 py-0.5 rounded">معاينة</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-6 py-2 bg-green-600 text-white rounded-lg font-cairo font-bold text-sm hover:bg-green-700 transition-all">
                          حفظ
                        </button>
                        <button onClick={cancelEdit} className="px-6 py-2 bg-gray-400 text-white rounded-lg font-cairo font-bold text-sm hover:bg-gray-500 transition-all">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {t.imageUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-wood/10">
                          <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <ScoutLogo logoId={t.logoId} className="w-16 h-16 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold font-reem text-burgundy-dark">{t.name}</h3>
                        <p className="text-wood text-sm truncate">{t.description}</p>
                      </div>
                      <button onClick={() => startEdit(t)} className="px-4 py-2 bg-burgundy/10 text-burgundy rounded-lg font-cairo font-bold text-sm hover:bg-burgundy/20 transition-all shrink-0">
                        تعديل
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}