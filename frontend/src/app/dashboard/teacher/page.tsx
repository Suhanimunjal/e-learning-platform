'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
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
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { courses, enrollments } from '@/lib/api';
import { apiBaseUrl } from '@/lib/runtime-config';

interface PendingEnrollment {
  id: string;
  userId: string;
  courseId: string;
  user: { id: string; name: string; email: string; phone?: string };
  course: { id: string; title: string };
  createdAt: string;
}

interface QuizSubmission {
  id: string;
  quizId: string;
  quiz: { title: string };
  user: { name: string; email: string };
  score?: number;
  percentage?: number;
  completedAt: string;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[]>([]);
  const [pendingQuizzes, setPendingQuizzes] = useState<QuizSubmission[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [coursesData, enrollmentsData] = await Promise.all([
        courses.getAll().catch(() => []),
        enrollments.getMyCourses().catch(() => []),
      ]);

      // Filter teacher's own courses
      const teacherCourses = coursesData?.filter((c: any) => c.instructorId === user?.id) || [];
      setMyCourses(teacherCourses);

      // Fetch pending enrollments for teacher's courses
      const pendingRes = await fetch(`${apiBaseUrl}/enrollments/pending`, { headers });
      const pendingData = await pendingRes.json();
      setPendingEnrollments(Array.isArray(pendingData) ? pendingData : []);

      // Fetch pending quiz submissions
      const quizzesRes = await fetch(`${apiBaseUrl}/quiz/submissions/pending`, { headers });
      const quizzesData = await quizzesRes.json();
      setPendingQuizzes(Array.isArray(quizzesData) ? quizzesData : []);

      // Calculate stats
      const totalStudents = enrollmentsData?.length || 0;
      const activeCourses = teacherCourses.filter((c: any) => c.status === 'APPROVED').length || 0;

      setCourseAnalytics({
        totalStudents,
        activeCourses,
        pendingGrading: Array.isArray(quizzesData) ? quizzesData.length : 0,
        pendingEnrollments: Array.isArray(pendingData) ? pendingData.length : 0,
      });
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load some data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/enrollments/${enrollmentId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error('Failed to approve enrollment:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/enrollments/${enrollmentId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error('Failed to reject enrollment:', err);
    } finally {
      setActionLoading(null);
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
            title="Pending Enrollments"
            value={courseAnalytics.pendingEnrollments || 0}
            icon={Users}
            color="yellow"
          />
          <StatCard
            title="Pending Grading"
            value={courseAnalytics.pendingGrading || 0}
            icon={CheckSquare}
            color="yellow"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pending Enrollments */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Enrollment Requests</h2>
            </div>

            {pendingEnrollments.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="mt-2 text-gray-500">All enrollment requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEnrollments.slice(0, 5).map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-medium">
                        {enrollment.user?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.user?.name || 'Student'}</p>
                        <p className="text-sm text-gray-500">{enrollment.course?.title}</p>
                        <p className="text-xs text-gray-400">{enrollment.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveEnrollment(enrollment.id)}
                        disabled={actionLoading === enrollment.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === enrollment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRejectEnrollment(enrollment.id)}
                        disabled={actionLoading === enrollment.id}
                      >
                        {actionLoading === enrollment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Quiz Submissions */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Grading</h2>
              <Link href="/dashboard/teacher/grading">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {pendingQuizzes.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <CheckSquare className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="mt-2 text-gray-500">No pending submissions to grade.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingQuizzes.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{submission.user?.name || 'Student'}</p>
                        <p className="text-sm text-gray-500">{submission.quiz?.title || 'Quiz'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(submission.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link href="/dashboard/teacher/grading">
                      <Button variant="outline" size="sm">
                        Grade
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

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

          {myCourses.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
              <p className="mt-2 text-gray-500">Create your first course to get started.</p>
              <Link href="/courses/create" className="mt-4 inline-block">
                <Button>Create Course</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.slice(0, 6).map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                    </div>
                    <Badge variant={course.status === 'APPROVED' ? 'success' : 'warning'}>
                      {course.status === 'APPROVED' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {course._count?.enrollments || 0} students
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <Button variant="ghost" size="sm">
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
