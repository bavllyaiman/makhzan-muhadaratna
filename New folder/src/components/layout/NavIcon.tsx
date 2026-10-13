import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CircleUser,
  Home,
  Medal,
  Phone,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react';
import type { NavItem } from '@/lib/shared/navigation';

const MAP: Record<NavItem['icon'], LucideIcon> = {
  home: Home,
  lecture: BookOpen,
  points: Medal,
  patrol: UsersRound,
  individual: Users,
  settings: Settings,
  support: Phone,
};

export function NavIcon({ name, className }: { name: NavItem['icon']; className?: string }) {
  const Icon = MAP[name];
  return <Icon className={className} aria-hidden="true" strokeWidth={2} />;
}

export function AccountIcon({ className }: { className?: string }) {
  return <CircleUser className={className} aria-hidden="true" strokeWidth={2} />;
}