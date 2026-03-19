'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  Star,
  CheckSquare,
  Plus,
  Bot,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { courses, enrollments, analytics } from '@/lib/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allCoursesData, enrollmentsData] = await Promise.all([
        courses.getAll().catch(err => {
          console.error('Courses error:', err);
          return [];
        }),
        enrollments.getMyCourses().catch(err => {
          console.error('Enrollments error:', err);
          return [];
        }),
      ]);

      setAllCourses(allCoursesData || []);
      setMyCourses(allCoursesData?.filter((c: any) => c.instructorId === user?.id) || []);

      // Calculate stats
      const totalStudents = enrollmentsData?.length || 0;
      const activeCourses = allCoursesData?.filter((c: any) => c.published && c.instructorId === user?.id).length || 0;
      
      // Mock pending grading count
      const pendingGrading = Math.floor(Math.random() * 10) + 5;
      
      // Store for stats
      setCourseAnalytics({
        totalStudents,
        activeCourses,
        pendingGrading,
        avgRating: 4.5 + Math.random(),
      });
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load some data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate mock student data per course
  const coursesWithStats = myCourses.map(course => ({
    ...course,
    studentCount: Math.floor(Math.random() * 50) + 10,
    avgProgress: Math.floor(Math.random() * 40) + 30,
  }));

  // Mock pending submissions
  const mockPendingSubmissions = [
    {
      id: '1',
      studentName: 'Student 1',
      assignmentTitle: 'Quiz 1',
      submittedAt: '2 hours ago',
      type: 'quiz',
    },
    {
      id: '2',
      studentName: 'Student 2',
      assignmentTitle: 'Assignment 1',
      submittedAt: '5 hours ago',
      type: 'assignment',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="mt-1 text-gray-500">
              Manage your courses and track student progress
            </p>
          </div>
          <Link href="/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            <button onClick={loadData} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={courseAnalytics.totalStudents || 0}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Active Courses"
            value={courseAnalytics.activeCourses || 0}
            icon={BookOpen}
            color="green"
          />
          <StatCard
            title="Pending Grading"
            value={courseAnalytics.pendingGrading || 0}
            icon={CheckSquare}
            color="yellow"
          />
          <StatCard
            title="Avg Rating"
            value={`${(courseAnalytics.avgRating || 0).toFixed(1)}/5`}
            icon={Star}
            color="purple"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* My Courses */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              <Link href="/dashboard/teacher/courses">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {coursesWithStats.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
                <p className="mt-2 text-gray-500">Create your first course to get started.</p>
                <Link href="/courses/create" className="mt-4 inline-block">
                  <Button>Create Course</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {coursesWithStats.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white opacity-50" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/courses/${course.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {course.title}
                          </Link>
                          <Badge variant={course.published ? 'success' : 'warning'}>
                            {course.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                          {course.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            {course.studentCount} students
                          </span>
                          <span className="text-sm font-medium text-indigo-600">
                            ₹{course.price}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Avg Progress</span>
                            <span>{course.avgProgress}%</span>
                          </div>
                          <ProgressBar value={course.avgProgress} size="sm" color="green" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Grading Queue */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Grading Queue</h2>
              <Link href="/dashboard/teacher/grading">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {mockPendingSubmissions.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <CheckSquare className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="mt-2 text-gray-500">No pending submissions to grade.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockPendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        {submission.type === 'quiz' ? (
                          <CheckSquare className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{submission.studentName}</p>
                        <p className="text-sm text-gray-500">
                          {submission.assignmentTitle}
                        </p>
                        <p className="text-xs text-gray-400">
                          {submission.submittedAt}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Grade
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* AI Tools */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">AI Tools</h2>
            <Bot className="h-5 w-5 text-indigo-600" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/dashboard/teacher/ai"
              className="flex items-center gap-4 rounded-lg bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
                <CheckSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Quiz</p>
                <p className="text-sm text-gray-500">AI-powered quiz creation</p>
              </div>
            </Link>
            <Link
              href="/dashboard/teacher/ai"
              className="flex items-center gap-4 rounded-lg bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Flashcards</p>
                <p className="text-sm text-gray-500">Create flashcards from content</p>
              </div>
            </Link>
            <Link
              href="/dashboard/teacher/ai"
              className="flex items-center gap-4 rounded-lg bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Lessons</p>
                <p className="text-sm text-gray-500">AI-assisted lesson creation</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
