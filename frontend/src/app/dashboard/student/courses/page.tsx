'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseCard from '@/components/ui/CourseCard';
import { useState, useEffect } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { enrollments } from '@/lib/api';

export default function StudentCoursesPage() {
  const [enrollmentsData, setEnrollmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await enrollments.getMyCourses();
      setEnrollmentsData(data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading courses...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        
        {enrollmentsData.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-2 text-gray-500">Start learning by enrolling in a course.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollmentsData.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                id={enrollment.course.id}
                title={enrollment.course.title}
                description={enrollment.course.description}
                price={enrollment.course.price}
                instructor={enrollment.course.instructor?.name}
                published={enrollment.course.status === 'APPROVED'}
                progress={Math.floor(Math.random() * 100)}
                showProgress
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
