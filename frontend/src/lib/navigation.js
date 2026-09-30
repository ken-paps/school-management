import { LayoutDashboard, Users, GraduationCap, FileText, BookOpen, School, CalendarCheck, ClipboardList, Megaphone } from 'lucide-react'

/**
 * Nav item shape:
 *   { label, to, icon, roles: ['admin', 'teacher', ...] }
 *
 * Add a new module → add one entry here. Sidebar auto-updates.
 */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Students',
    to: '/students',
    icon: GraduationCap,
    roles: ['admin', 'teacher'],
  },
  {
    label: 'Teachers',
    to: '/teachers',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Classes',
    to: '/classes',
    icon: School,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    label: 'Subjects',
    to: '/subjects',
    icon: BookOpen,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    label: 'Attendance',
    to: '/attendance',
    icon: CalendarCheck,
    roles: ['admin', 'teacher'],
  },
  {
    label: 'Exams',
    to: '/exams',
    icon: FileText,
    roles: ['admin', 'teacher'],
  },
  {
    label: 'Grades',
    to: '/grades',
    icon: ClipboardList,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    label: 'Notices',
    to: '/notices',
    icon: Megaphone,
    roles: ['admin', 'teacher', 'student'],
  },
]

/**
 * Filter nav items for a given role.
 */
export function getNavForRole(role) {
  if (!role) return []
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

/**
 * Find the nav item matching a pathname (for Topbar titles).
 */
export function getNavItemForPath(pathname) {
  if (pathname === '/') return NAV_ITEMS[0]
  return NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to))
}
