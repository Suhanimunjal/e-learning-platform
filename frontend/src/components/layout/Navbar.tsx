'use client';

import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses, lessons..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium text-gray-900 sm:block">
              {user?.name}
            </span>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
                <div className="border-b px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-700">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/settings');
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
