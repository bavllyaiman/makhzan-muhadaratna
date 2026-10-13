/** Single source of truth for navigation — used by header, drawer and footer. */

export interface NavItem {
  href: string;
  label: string;
  icon: 'settings' | 'lecture' | 'points' | 'patrol' | 'individual' | 'support' | 'home';
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'الرئيسية',
    icon: 'home',
    description: 'لوحة المعلومات',
  },
  {
    href: '/lectures',
    label: 'قسم المحاضرات',
    icon: 'lecture',
    description: 'جدول المحاضرات والطلبات',
  },
  {
    href: '/points',
    label: 'النقاط',
    icon: 'points',
    description: 'رصيدك وسجل النقاط',
  },
  {
    href: '/patrols',
    label: 'الطلائع',
    icon: 'patrol',
    description: 'الطلائع وترتيب الدوري',
  },
  {
    href: '/individuals',
    label: 'الأفراد',
    icon: 'individual',
    description: 'أعضاء الطليعة',
  },
  {
    href: '/settings',
    label: 'الإعدادات',
    icon: 'settings',
    description: 'الحساب والتفضيلات',
  },
  {
    href: '/support',
    label: 'الدعم',
    icon: 'support',
    description: 'الدعم الفني والتواصل',
  },
];

export const SUPPORT_PHONES = ['94997556', '96658378'] as const;

export const SUPPORT_HOURS = 'من السبت إلى الخميس — 8:00 ص إلى 8:00 م';