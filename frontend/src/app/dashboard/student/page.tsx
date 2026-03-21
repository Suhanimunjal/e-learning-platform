'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import CourseCard from '@/components/ui/CourseCard';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { usePlugins } from '@/contexts/PluginContext';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Loader2,
  Trophy,
  Star,
  Flame,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { analytics, enrollments, courses } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { isPluginEnabled } = usePlugins();
  const [myAnalytics, setMyAnalytics] = useState<any>(null);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasGamification = isPluginEnabled('points-leaderboard') || isPluginEnabled('achievements') || isPluginEnabled('streaks-rewards');
  const hasPoints = isPluginEnabled('points-leaderboard');
  const hasAchievements = isPluginEnabled('achievements');
  const hasBadges = isPluginEnabled('badges-certificates');
  const hasStreaks = isPluginEnabled('streaks-rewards');
  const hasAiRecommendations = isPluginEnabled('ai-recommendations');
  const hasForums = isPluginEnabled('forums');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [analyticsData, enrollmentsData, coursesData] = await Promise.all([
        analytics.getMyAnalytics().catch(err => {
          console.error('Analytics error:', err);
          return null;
        }),
        enrollments.getMyCourses().catch(err => {
          console.error('Enrollments error:', err);
          return [];
        }),
        courses.getAll().catch(err => {
          console.error('Courses error:', err);
          return [];
        }),
      ]);

      setMyAnalytics(analyticsData);
      setMyEnrollments(enrollmentsData || []);
      setAllCourses(coursesData || []);
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

  // Calculate enrolled course IDs
  const enrolledCourseIds = myEnrollments.map((e: any) => e.courseId);
  
  // Courses not yet enrolled
  const recommendedCourses = allCourses
    .filter((course: any) => !enrolledCourseIds.includes(course.id))
    .slice(0, 3);

  // Progress calculation for enrolled courses (mock for now)
  const enrolledWithProgress = myEnrollments.map((enrollment: any) => ({
    ...enrollment,
    progress: Math.floor(Math.random() * 100), // Will be replaced with real progress data
    lastAccessed: new Date(enrollment.createdAt).toLocaleDateString(),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-gray-500">
            Continue your learning journey
          </p>
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
            title="Enrolled Courses"
            value={myAnalytics?.enrollmentCount || 0}
            icon={BookOpen}
            color="indigo"
          />
          <StatCard
            title="Completed"
            value={myAnalytics?.coursesCompleted || 0}
            icon={Award}
            color="green"
          />
          <StatCard
            title="In Progress"
            value={(myAnalytics?.enrollmentCount || 0) - (myAnalytics?.coursesCompleted || 0)}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Certificates"
            value={myAnalytics?.certificatesEarned || 0}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Gamification Section (Plugin-Enabled) */}
        {hasGamification && (
          <div className="rounded-lg bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 border border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Your Achievements
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hasPoints && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1,250</p>
                    <p className="text-sm text-gray-500">Points Earned</p>
                  </div>
                </div>
              )}
              {hasAchievements && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-sm text-gray-500">Achievements</p>
                  </div>
                </div>
              )}
              {hasBadges && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-500">Badges Earned</p>
                  </div>
                </div>
              )}
              {hasStreaks && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                    <p className="text-sm text-gray-500">Day Streak</p>
                  </div>
                </div>
              )}
            </div>
            
            {hasPoints && (
              <div className="mt-4 bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Leaderboard Position</span>
                  <span className="text-sm font-bold text-indigo-600">#12</span>
                </div>
                <ProgressBar value={75} color="indigo" />
                <p className="mt-1 text-xs text-gray-500">Top 15% of all learners</p>
              </div>
            )}
          </div>
        )}

        {/* Continue Learning */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
            <Link href="/dashboard/student/courses">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {enrolledWithProgress.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
              <p className="mt-2 text-gray-500">Start your learning journey by enrolling in a course.</p>
              <Link href="/courses" className="mt-4 inline-block">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledWithProgress.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="h-20 w-32 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 sm:h-24 sm:w-40">
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white opacity-50" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/courses/${enrollment.course.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {enrollment.course.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {enrollment.course.instructor?.name || 'Unknown Instructor'}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-full sm:w-48">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">{enrollment.progress}%</span>
                    </div>
                    <ProgressBar value={enrollment.progress} color="indigo" size="md" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <Link href="/courses">
                <Button variant="ghost" size="sm">
                  Browse All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  price={course.price}
                  instructor={course.instructor?.name}
                  published={course.published}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        {myAnalytics?.recentEvents && myAnalytics.recentEvents.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="space-y-3">
                {myAnalytics.recentEvents.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                    <span className="text-gray-600">
                      {event.type === 'course.enrolled' && 'Enrolled in a course'}
                      {event.type === 'module.viewed' && 'Viewed a lesson'}
                      {event.type === 'quiz.completed' && 'Completed a quiz'}
                      {!['course.enrolled', 'module.viewed', 'quiz.completed'].includes(event.type) && event.type}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certificates Section */}
        {(myAnalytics?.certificatesEarned || 0) > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Certificates</h2>
              <Link href="/dashboard/student/certificates">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Course Certificate</p>
                  <Badge variant="success">Verified</Badge>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
