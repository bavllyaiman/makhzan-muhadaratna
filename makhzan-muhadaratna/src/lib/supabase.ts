import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function registerVisitor(name: string, phone: string, tali3a: string) {
  const { data, error } = await supabase.from("visitors").insert([
    { full_name: name, phone, tali3a },
  ]);
  if (error) throw error;
  return data;
}

export async function getVisitors() {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function incrementLectureViews(lectureId: string) {
  const { data, error } = await supabase.rpc("increment_views", {
    lecture_id: lectureId,
  });
  if (error) throw error;
  return data;
}

export async function getLecturesByTali3a(tali3aId: string) {
  const { data, error } = await supabase
    .from("muhadarat")
    .select("*")
    .eq("tali3a_id", tali3aId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllLectures() {
  const { data, error } = await supabase
    .from("muhadarat")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadPDF(file: File, lectureId: string) {
  const { data, error } = await supabase.storage
    .from("lectures-pdf")
    .upload(`${lectureId}.pdf`, file);
  if (error) throw error;
  return data;
}

export async function getPDFUrl(lectureId: string) {
  const { data } = supabase.storage
    .from("lectures-pdf")
    .getPublicUrl(`${lectureId}.pdf`);
  return data.publicUrl;
}