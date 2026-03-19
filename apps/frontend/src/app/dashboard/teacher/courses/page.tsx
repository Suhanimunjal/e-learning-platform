'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import CourseCard from '@/components/ui/CourseCard';
import { useState, useEffect } from 'react';
import { Loader2, Plus, BookOpen, FileText, CheckSquare, Video, Sparkles, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlugins } from '@/contexts/PluginContext';
import { courses } from '@/lib/api';

export default function TeacherCoursesPage() {
  const { user } = useAuth();
  const { isPluginEnabled } = usePlugins();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAdvancedAssignments = isPluginEnabled('advanced-assignments');
  const hasAdvancedQuizzes = isPluginEnabled('advanced-quizzes');
  const hasLiveSessions = isPluginEnabled('live-sessions');
  const hasAiContent = isPluginEnabled('ai-content-generator');
  const hasPeerAssessment = isPluginEnabled('peer-assessment');
  const hasBadges = isPluginEnabled('badges-certificates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allCourses = await courses.getAll();
      const filtered = allCourses?.filter((c: any) => c.instructorId === user?.id) || [];
      setMyCourses(filtered);
    } catch (error) {
      console.error('Error loading courses:', error);
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          
          <div className="flex flex-wrap gap-2">
            {/* Always show basic Create Course */}
            <Link href="/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
            
            {/* Plugin-Enabled Buttons */}
            {hasAiContent && (
              <Link href="/dashboard/teacher/ai">
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  AI Generate
                </Button>
              </Link>
            )}
            
            {hasAdvancedAssignments && (
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                Advanced Assignment
              </Button>
            )}
            
            {hasAdvancedQuizzes && (
              <Button variant="outline">
                <CheckSquare className="mr-2 h-4 w-4 text-green-500" />
                Advanced Quiz
              </Button>
            )}
            
            {hasLiveSessions && (
              <Button variant="outline">
                <Video className="mr-2 h-4 w-4 text-red-500" />
                Live Session
              </Button>
            )}
          </div>
        </div>

        {/* Plugin Quick Actions Bar */}
        {(hasAiContent || hasAdvancedAssignments || hasAdvancedQuizzes || hasLiveSessions || hasBadges || hasPeerAssessment) && (
          <div className="rounded-lg bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 border border-indigo-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions (Plugins Enabled):</p>
            <div className="flex flex-wrap gap-2">
              {hasAdvancedAssignments && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <FileText className="h-3 w-3" /> Advanced Assignments
                </span>
              )}
              {hasAdvancedQuizzes && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <CheckSquare className="h-3 w-3" /> Advanced Quizzes
                </span>
              )}
              {hasLiveSessions && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  <Video className="h-3 w-3" /> Live Sessions
                </span>
              )}
              {hasAiContent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  <Sparkles className="h-3 w-3" /> AI Content
                </span>
              )}
              {hasPeerAssessment && (
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                  <Users className="h-3 w-3" /> Peer Assessment
                </span>
              )}
              {hasBadges && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  <Award className="h-3 w-3" /> Badges
                </span>
              )}
            </div>
          </div>
        )}

        {myCourses.length === 0 ? (
          <div className="mt-8 rounded-lg bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-2 text-gray-500">Create your first course to get started.</p>
            <Link href="/courses/create">
              <Button className="mt-4">Create Course</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                price={course.price}
                published={course.published}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
