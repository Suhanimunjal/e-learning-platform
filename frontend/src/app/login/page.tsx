'use client';

import Link from 'next/link';
import { GraduationCap, Users, Shield, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Select your role to login</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Student Login */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Users className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Student</h2>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
              Login or register to access courses and start learning.
            </p>
            <Link 
              href="/student-login"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Student Login <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Teacher Login */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
              <GraduationCap className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Teacher</h2>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
              Login with your credentials. Teachers are added by the administrator.
            </p>
            <Link 
              href="/teacher-login"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              Teacher Login <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Admin Login */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Administrator</h2>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
              Manage platform settings and approve student registrations.
            </p>
            <Link 
              href="/admin-login"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Admin Login <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
