export interface Tali3a {
  id: string;
  name: string;
  logoId: string;
  description: string;
  color: string;
  bannerColor: string;
  imageUrl?: string;
}

export interface Muhadara {
  id: string;
  tali3aId: string;
  title: string;
  description: string;
  date: string;
  pdfUrl: string;
  views: number;
}

export interface Visitor {
  id: string;
  fullName: string;
  phone: string;
  tali3a: string;
  createdAt: string;
}

export interface AdminStats {
  totalLectures: number;
  totalVisitors: number;
  totalViews: number;
  lecturesByTali3a: { tali3a: string; count: number }[];
}