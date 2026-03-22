'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Trophy,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  courses,
  student,
  StudentCertificate,
  StudentDashboardResponse,
  StudentEnrolledCourse,
  StudentNotification,
} from '@/lib/api';

type PublicCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor?: {
    name: string;
  };
  status: string;
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null);
  const [enrolled, setEnrolled] = useState<StudentEnrolledCourse[]>([]);
  const [catalog, setCatalog] = useState<PublicCourse[]>([]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResult, enrolledResult, catalogResult, certificatesResult, notificationsResult, unreadResult] =
        await Promise.allSettled([
          student.getDashboard(),
          student.getEnrolled(),
          courses.getAll(),
          student.getCertificates(),
          student.getNotifications({ limit: 5 }),
          student.getUnreadNotificationCount(),
        ]);

      const errors: string[] = [];

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value);
      } else {
        errors.push('Dashboard');
      }

      if (enrolledResult.status === 'fulfilled') {
        setEnrolled(enrolledResult.value);
      } else {
        errors.push('Enrolled courses');
      }

      if (catalogResult.status === 'fulfilled') {
        setCatalog(catalogResult.value as PublicCourse[]);
      } else {
        errors.push('Course catalog');
      }

      if (certificatesResult.status === 'fulfilled') {
        setCertificates(certificatesResult.value);
      } else {
        errors.push('Certificates');
      }

      if (notificationsResult.status === 'fulfilled') {
        setNotifications(notificationsResult.value);
      } else {
        errors.push('Notifications');
      }

      if (unreadResult.status === 'fulfilled') {
        setUnreadCount(unreadResult.value.unreadCount);
      }

      if (errors.length > 0) {
        setError(`Failed to load: ${errors.join(', ')}. Some data may be missing.`);
      }
    } catch {
      setError('Failed to load student dashboard data.');
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const recommendedCourses = useMemo(() => {
    const enrolledCourseIds = new Set(enrolled.map((item) => item.course.id));
    return catalog
      .filter((course) => !enrolledCourseIds.has(course.id))
      .slice(0, 3);
  }, [catalog, enrolled]);

  const continueLearningItem = useMemo(() => {
    if (enrolled.length === 0) {
      return null;
    }

    const withLastAccess = enrolled.filter((item) => item.progress.lastAccessedAt !== null);
    if (withLastAccess.length > 0) {
      return [...withLastAccess].sort(
        (a, b) =>
          new Date(b.progress.lastAccessedAt as string).getTime() -
          new Date(a.progress.lastAccessedAt as string).getTime(),
      )[0];
    }

    return [...enrolled].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [enrolled]);

  const overallProgress = useMemo(() => {
    const totalModules = enrolled.reduce((sum, item) => sum + item.progress.totalModules, 0);
    const completedModules = enrolled.reduce((sum, item) => sum + item.progress.completedModules, 0);
    const percentage = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

    return {
      totalModules,
      completedModules,
      percentage,
    };
  }, [enrolled]);

  const inProgressCourses = useMemo(
    () => enrolled.filter((item) => item.progress.percentage < 100),
    [enrolled],
  );

  const markAsRead = async (notificationId: string) => {
    try {
      await student.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      setError('Failed to mark notification as read.');
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

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || 'Failed to load student dashboard data.'}
          <button onClick={loadDashboardData} className="ml-2 underline">
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="mt-1 text-gray-500">Track your learning with real-time course progress.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            <button onClick={loadDashboardData} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Enrolled Courses" value={dashboard.totalCourses} icon={BookOpen} color="indigo" />
          <StatCard title="Completed Courses" value={dashboard.completedCourses} icon={CheckCircle2} color="green" />
          <StatCard title="In Progress" value={dashboard.inProgressCourses} icon={Clock} color="yellow" />
          <StatCard title="Certificates" value={certificates.length} icon={Trophy} color="purple" />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
            <Link href="/dashboard/student/courses">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {enrolled.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No enrolled courses</h3>
              <p className="mt-2 text-gray-500">Enroll in a course to begin learning.</p>
              <Link href="/courses" className="mt-4 inline-block">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {continueLearningItem ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        Last Accessed Course
                      </p>
                      <Link
                        href={`/courses/${continueLearningItem.course.id}`}
                        className="mt-1 block text-xl font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        {continueLearningItem.course.title}
                      </Link>
                      <p className="mt-2 text-sm text-gray-500">
                        {continueLearningItem.progress.lastAccessedModuleTitle
                          ? `Current lesson: ${continueLearningItem.progress.lastAccessedModuleTitle}`
                          : 'No lesson accessed yet in this course.'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Instructor: {continueLearningItem.course.instructor.name}
                      </p>
                    </div>
                    <div className="w-full max-w-[240px]">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-gray-900">
                          {continueLearningItem.progress.percentage}%
                        </span>
                      </div>
                      <ProgressBar value={continueLearningItem.progress.percentage} color="indigo" size="md" />
                    </div>
                  </div>
                  <Link href={`/courses/${continueLearningItem.course.id}`}>
                    <Button>Resume</Button>
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link href="/dashboard/student/courses">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {enrolled.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
              You are not enrolled in any course yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolled.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <Link href={`/courses/${item.course.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {item.course.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.course.description}</p>
                  <div className="mt-3 mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {item.progress.percentage === 100 ? 'Completed' : 'Ongoing'}
                    </span>
                    <span className="font-medium text-gray-900">{item.progress.percentage}%</span>
                  </div>
                  <ProgressBar value={item.progress.percentage} color="green" size="sm" />
                  <div className="mt-3">
                    <Link href={`/courses/${item.course.id}`}>
                      <Button size="sm" variant="ghost">
                        Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Progress Overview</h2>
          {enrolled.length === 0 ? (
            <p className="text-sm text-gray-500">Progress data will appear after course enrollment.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall completion</span>
                  <span className="font-semibold text-gray-900">{overallProgress.percentage}%</span>
                </div>
                <ProgressBar value={overallProgress.percentage} color="indigo" size="lg" />
                <p className="mt-1 text-xs text-gray-500">
                  {overallProgress.completedModules} of {overallProgress.totalModules} modules completed
                </p>
              </div>

              <div className="space-y-2">
                {inProgressCourses.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{item.course.title}</span>
                      <span className="text-gray-600">{item.progress.percentage}%</span>
                    </div>
                    <ProgressBar value={item.progress.percentage} color="yellow" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Courses</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                Browse All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recommendedCourses.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
              No additional courses to recommend at the moment.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <Link href={`/courses/${course.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {course.title}
                  </Link>
                  <p className="mt-2 text-sm text-gray-500">{course.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
            {dashboard.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {dashboard.recentActivity.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                    <span className="text-gray-600">{event.type}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell className="h-4 w-4" />
                <span>{unreadCount} unread</span>
              </div>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div key={item.id} className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <Badge variant={item.read ? 'default' : 'warning'}>
                        {item.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</span>
                      {!item.read && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>
            <Link href="/dashboard/student/certificates">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {certificates.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
              No certificates earned yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.slice(0, 3).map((cert) => (
                <div key={cert.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="font-medium text-gray-900">{cert.course.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
