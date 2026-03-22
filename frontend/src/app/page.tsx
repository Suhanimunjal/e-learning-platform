'use client';

import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Sparkles, 
  Award, 
  Brain,
  Video,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduVerse</span>
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Viewport 1 */}
      <section className="min-h-screen flex items-center pt-16 bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Where Teachers
                <span className="text-indigo-600"> Inspire </span>
                & Students
                <span className="text-indigo-600"> Excel</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                EduVerse brings together passionate educators and eager learners in one powerful platform. 
                Create courses, teach students, and track progress — all powered by AI.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/student-register"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
                >
                  Start Learning Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold"
                >
                  I'm a Teacher
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-100 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Live Course Preview</h3>
                      <p className="text-sm text-gray-500">JavaScript Fundamentals</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Variables & Data Types</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Functions & Scope</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <span className="text-sm text-indigo-700 font-medium">DOM Manipulation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      <span className="text-sm text-gray-500">Async JavaScript</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold text-indigo-600">60%</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-indigo-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers Section - Viewport 2 */}
      <section className="min-h-screen flex items-center bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Educators</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools that help you create, deliver, and manage courses effortlessly
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Content Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate complete course outlines, lesson content, assignments, and quizzes with our AI assistant. 
                Save hours of preparation time.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track student progress, manage enrollments, and provide personalized feedback. 
                See who's excelling and who needs help.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Award className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Auto-Grading</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered grading for assignments and quizzes. Get instant feedback on student submissions 
                and save time on manual grading.
              </p>
            </div>
          </div>
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to Teach?</h3>
                <p className="text-purple-100">Join thousands of educators already using EduVerse</p>
              </div>
              <Link
                href="/teacher-login"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                Teacher Portal
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Students Section - Viewport 3 */}
      <section className="min-h-screen flex items-center bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Learning Journey Starts Here</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Access high-quality courses, learn at your own pace, and earn certificates that matter. 
                Our platform adapts to your learning style.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Interactive Courses</h4>
                    <p className="text-gray-600">Learn through videos, quizzes, assignments, and hands-on projects.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI Tutor</h4>
                    <p className="text-gray-600">Get instant help from our AI assistant whenever you're stuck.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Certificates</h4>
                    <p className="text-gray-600">Earn verified certificates upon course completion.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
                    <p className="text-gray-600">Monitor your learning journey with detailed analytics.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" alt="Student" className="h-14 w-14 rounded-full bg-gray-100" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Alex's Progress</h4>
                    <p className="text-sm text-gray-500">JavaScript Fundamentals</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Course Progress</span>
                      <span className="font-semibold text-green-600">72%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-xs text-gray-500">Lessons Done</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                      <p className="text-xs text-gray-500">Avg Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">8h</p>
                      <p className="text-xs text-gray-500">Study Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & CTA Section */}
      <section className="min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">10K+</div>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">500+</div>
              <p className="text-gray-600">Expert Teachers</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">1,000+</div>
              <p className="text-gray-600">Courses Available</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">50K+</div>
              <p className="text-gray-600">Certificates Issued</p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Education?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teachers and students who are already using EduVerse to create and consume quality education.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/student-register"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors text-lg"
              >
                Sign Up as Student
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition-colors text-lg border border-indigo-400"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>© 2026 EduVerse. All rights reserved. Made with ❤️ for educators worldwide.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
