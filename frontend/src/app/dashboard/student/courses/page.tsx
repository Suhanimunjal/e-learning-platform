'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseCard from '@/components/ui/CourseCard';
import { StudentEnrolledCourse, student } from '@/lib/api';

export default function StudentCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<StudentEnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await student.getEnrolled();
        setEnrolledCourses(data);
      } catch {
        setError('Failed to load enrolled courses.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

        {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        {enrolledCourses.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-2 text-gray-500">Start learning by enrolling in a course.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                id={enrollment.course.id}
                title={enrollment.course.title}
                description={enrollment.course.description}
                price={enrollment.course.price}
                instructor={enrollment.course.instructor.name}
                published={enrollment.course.status === 'APPROVED'}
                progress={enrollment.progress.percentage}
                showProgress
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
