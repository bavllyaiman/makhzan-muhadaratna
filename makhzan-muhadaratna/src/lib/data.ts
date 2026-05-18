import { Tali3a } from "./types";

export function getDefaultTali3at(): Tali3a[] {
  return [
    {
      id: "al-oqab",
      name: "طليعة العقاب",
      logoId: "al-oqab",
      description: "طليعة العقاب - رمز القوة والشجاعة",
      color: "from-red-900 to-red-800",
      bannerColor: "from-red-950 via-red-900 to-amber-900",
    },
    {
      id: "al-bawashiq",
      name: "طليعة البواشق",
      logoId: "al-bawashiq",
      description: "طليعة البواشق - رمز السرعة والمهارة",
      color: "from-slate-800 to-slate-700",
      bannerColor: "from-slate-950 via-slate-900 to-stone-900",
    },
    {
      id: "al-ghurab",
      name: "طليعة الغراب",
      logoId: "al-ghurab",
      description: "طليعة الغراب - رمز الذكاء والحكمة",
      color: "from-gray-900 to-gray-800",
      bannerColor: "from-gray-950 via-gray-900 to-zinc-900",
    },
    {
      id: "al-shahin",
      name: "طليعة الشاهين",
      logoId: "al-shahin",
      description: "طليعة الشاهين - رمز السرعة والانقضاض",
      color: "from-amber-800 to-amber-700",
      bannerColor: "from-amber-950 via-amber-900 to-yellow-900",
    },
    {
      id: "al-nusur",
      name: "طليعة النسور",
      logoId: "al-nusur",
      description: "طليعة النسور - رمز العظمة والكبرياء",
      color: "from-blue-900 to-blue-800",
      bannerColor: "from-blue-950 via-blue-900 to-indigo-900",
    },
    {
      id: "al-suqur",
      name: "طليعة الصقور",
      logoId: "al-suqur",
      description: "طليعة الصقور - رمز القوة والصبر",
      color: "from-emerald-800 to-emerald-700",
      bannerColor: "from-emerald-950 via-emerald-900 to-teal-900",
    },
  ];
}

export function loadTali3atList(): Tali3a[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tali3at_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return getDefaultTali3at();
}

export function saveTali3atList(list: Tali3a[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("tali3at_data", JSON.stringify(list));
  }
}

export const tali3atList: Tali3a[] = getDefaultTali3at();

const logoOptions = [
  { id: "al-oqab", name: "عقاب" },
  { id: "al-bawashiq", name: "باشق" },
  { id: "al-ghurab", name: "غراب" },
  { id: "al-shahin", name: "شاهين" },
  { id: "al-nusur", name: "نسر" },
  { id: "al-suqur", name: "صقر" },
];

export function getLogoOptions() {
  return logoOptions;
}

export const sampleLectures: any[] = [];