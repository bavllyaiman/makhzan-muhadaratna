import { Tali3a } from "./types";
import { supabase } from "./supabase";

export function getDefaultTali3at(): Tali3a[] {
  return [
    { id: "al-oqab", name: "طليعة العقاب", logoId: "al-oqab", description: "طليعة العقاب - رمز القوة والشجاعة", color: "from-red-900 to-red-800", bannerColor: "from-red-950 via-red-900 to-amber-900" },
    { id: "al-bawashiq", name: "طليعة البواشق", logoId: "al-bawashiq", description: "طليعة البواشق - رمز السرعة والمهارة", color: "from-slate-800 to-slate-700", bannerColor: "from-slate-950 via-slate-900 to-stone-900" },
    { id: "al-ghurab", name: "طليعة الغراب", logoId: "al-ghurab", description: "طليعة الغراب - رمز الذكاء والحكمة", color: "from-gray-900 to-gray-800", bannerColor: "from-gray-950 via-gray-900 to-zinc-900" },
    { id: "al-shahin", name: "طليعة الشاهين", logoId: "al-shahin", description: "طليعة الشاهين - رمز السرعة والانقضاض", color: "from-amber-800 to-amber-700", bannerColor: "from-amber-950 via-amber-900 to-yellow-900" },
    { id: "al-nusur", name: "طليعة النسور", logoId: "al-nusur", description: "طليعة النسور - رمز العظمة والكبرياء", color: "from-blue-900 to-blue-800", bannerColor: "from-blue-950 via-blue-900 to-indigo-900" },
    { id: "al-suqur", name: "طليعة الصقور", logoId: "al-suqur", description: "طليعة الصقور - رمز القوة والصبر", color: "from-emerald-800 to-emerald-700", bannerColor: "from-emerald-950 via-emerald-900 to-teal-900" },
  ];
}

function loadLocal(key: string) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved) { try { return JSON.parse(saved); } catch {} }
  }
  return null;
}
function saveLocal(key: string, data: any) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(data));
}

// --- الطلائع ---
export async function fetchTali3at(): Promise<Tali3a[]> {
  if (supabase) {
    const { data } = await supabase.from("tali3at").select("*");
    if (data && data.length > 0) {
      const mapped = data.map((t: any) => ({ id: t.id, name: t.name, logoId: t.logo_id, description: t.description, color: t.color, bannerColor: t.banner_color, imageUrl: t.image_url }));
      saveLocal("tali3at_data", mapped);
      return mapped;
    }
  }
  return loadLocal("tali3at_data") || getDefaultTali3at();
}

export async function updateTali3a(id: string, updates: Partial<Tali3a>) {
  if (supabase) {
    await supabase.from("tali3at").update({ name: updates.name, description: updates.description, image_url: updates.imageUrl }).eq("id", id);
  }
  const local = loadLocal("tali3at_data") || getDefaultTali3at();
  saveLocal("tali3at_data", local.map((t: Tali3a) => t.id === id ? { ...t, ...updates } : t));
}

// --- المحاضرات ---
export async function fetchLectures(): Promise<any[]> {
  if (supabase) {
    const { data } = await supabase.from("muhadarat").select("*").order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((l: any) => ({ id: l.id, tali3aId: l.tali3a_id, title: l.title, description: l.description, date: l.date, pdfUrl: l.pdf_url, views: l.views }));
      saveLocal("muhadarat_data", mapped);
      return mapped;
    }
  }
  return loadLocal("muhadarat_data") || [];
}

export async function addLecture(lecture: any) {
  if (supabase) {
    await supabase.from("muhadarat").insert({ id: lecture.id, tali3a_id: lecture.tali3aId, title: lecture.title, description: lecture.description, date: lecture.date, pdf_url: lecture.pdfUrl, views: 0 });
  }
  const local = loadLocal("muhadarat_data") || [];
  saveLocal("muhadarat_data", [lecture, ...local]);
}

export async function deleteLecture(id: string) {
  if (supabase) {
    await supabase.from("muhadarat").delete().eq("id", id);
  }
  const local = loadLocal("muhadarat_data") || [];
  saveLocal("muhadarat_data", local.filter((l: any) => l.id !== id));
}

// --- الزوار ---
export async function fetchVisitors(): Promise<any[]> {
  if (supabase) {
    const { data } = await supabase.from("visitors").select("*").order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((v: any) => ({ id: v.id, fullName: v.full_name, phone: v.phone, tali3a: v.tali3a, createdAt: v.created_at }));
      saveLocal("muhadarat_visitors", mapped);
      return mapped;
    }
  }
  return loadLocal("muhadarat_visitors") || [];
}

export async function addVisitor(visitor: any) {
  if (supabase) {
    await supabase.from("visitors").insert({ id: visitor.id, full_name: visitor.fullName, phone: visitor.phone, tali3a: visitor.tali3a });
  }
  const local = loadLocal("muhadarat_visitors") || [];
  saveLocal("muhadarat_visitors", [visitor, ...local]);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function convertGoogleDriveLink(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  return url;
}
