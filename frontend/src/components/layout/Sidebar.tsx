'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Award,
  FileText,
  Bot,
  Plug,
  CheckSquare,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { label: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { label: 'Browse Courses', href: '/courses', icon: GraduationCap },
  { label: 'Certificates', href: '/dashboard/student/certificates', icon: Award },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
  { label: 'My Courses', href: '/dashboard/teacher/courses', icon: BookOpen },
  { label: 'Create Course', href: '/courses/create', icon: Plus },
  { label: 'Quizzes', href: '/dashboard/teacher/quizzes', icon: CheckSquare },
  { label: 'Students', href: '/dashboard/teacher/students', icon: Users },
  { label: 'Grading', href: '/dashboard/teacher/grading', icon: CheckSquare },
  { label: 'AI Tools', href: '/dashboard/teacher/ai', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'My Courses', href: '/dashboard/admin/courses', icon: BookOpen },
  { label: 'Create Course', href: '/courses/create', icon: Plus },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Subscriptions', href: '/dashboard/admin/subscriptions', icon: CreditCard },
  { label: 'Plugins', href: '/dashboard/admin/plugins', icon: Plug },
  { label: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = user?.role === 'ADMIN' ? adminNav
    : user?.role === 'TEACHER' ? teacherNav
    : studentNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Desktop: always visible. Mobile: slide in/out based on isOpen */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">E-Learning</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Logged in as</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
