"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; tali3a: string }) => void;
  tali3atOptions: string[];
}

export default function RegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  tali3atOptions,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    tali3a: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.tali3a) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    if (formData.phone.length !== 8 || !/^\d+$/.test(formData.phone)) {
      setError("رقم الهاتف يجب أن يكون 8 أرقام");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch {
      setError("حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            <div className="bg-gradient-to-b from-cream to-cream-dark rounded-2xl p-8 vintage-shadow">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-burgundy text-cream px-6 py-2 rounded-full font-cairo font-bold text-sm">
                  تسجيل الدخول
                </div>
              </div>

              <div className="text-center mb-6 mt-4">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-2xl font-bold font-reem text-burgundy-dark">
                  سجل بياناتك
                </h3>
                <p className="text-wood text-sm mt-1">
                  يجب تسجيل البيانات قبل مشاهدة المحاضرة
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-burgundy-dark font-cairo font-semibold text-sm mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all font-cairo"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label className="block text-burgundy-dark font-cairo font-semibold text-sm mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all font-cairo"
                    placeholder="أدخل 8 أرقام"
                  />
                </div>

                <div>
                  <label className="block text-burgundy-dark font-cairo font-semibold text-sm mb-1">
                    اسم الطليعة
                  </label>
                  <select
                    value={formData.tali3a}
                    onChange={(e) =>
                      setFormData({ ...formData, tali3a: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-wood/20 rounded-lg focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all font-cairo appearance-none"
                  >
                    <option value="">اختر طليعتك</option>
                    {tali3atOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-scout-red text-sm font-cairo text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-l from-burgundy to-burgundy-light text-cream rounded-lg font-cairo font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-burgundy/30 disabled:opacity-50"
                >
                  {loading ? "جارٍ التسجيل..." : "دخول المحاضرة"}
                </motion.button>
              </form>

              <button
                onClick={onClose}
                className="absolute top-4 left-4 text-wood hover:text-burgundy transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}