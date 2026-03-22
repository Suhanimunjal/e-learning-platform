'use client';

import Link from 'next/link';
import { GraduationCap, Users, Shield, ChevronRight, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header with Login Button */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">E-Learn</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Learning Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A comprehensive e-learning platform with AI-powered content, interactive courses, and personalized learning paths.
          </p>
          <Link
            href="/student-register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started Free <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Students</h3>
            <p className="text-gray-600 mb-4">Access courses, track progress, earn certificates, and learn at your own pace.</p>
            <Link href="/student-login" className="text-green-600 font-medium hover:underline">
              Student Login →
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <GraduationCap className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Teachers</h3>
            <p className="text-gray-600 mb-4">Create courses, generate AI content, grade assignments, and track student progress.</p>
            <Link href="/teacher-login" className="text-purple-600 font-medium hover:underline">
              Teacher Login →
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Administrators</h3>
            <p className="text-gray-600 mb-4">Manage users, approve courses, monitor activity, and configure the platform.</p>
            <Link href="/admin-login" className="text-indigo-600 font-medium hover:underline">
              Admin Login →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-indigo-100 mb-8">Join thousands of students and teachers on our platform.</p>
          <Link
            href="/student-register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Register as Student <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
