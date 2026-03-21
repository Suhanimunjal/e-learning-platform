'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { apiBaseUrl } from '@/lib/runtime-config';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courseList, setCourseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${apiBaseUrl}/courses`, {
        headers,
        signal: controller.signal 
      });
      clearTimeout(timeout);
      
      if (res.ok) {
        const data = await res.json();
        setCourseList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {courseList.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="text-lg text-gray-500">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courseList.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      {course.price > 0 ? `₹${course.price}` : 'Free'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
