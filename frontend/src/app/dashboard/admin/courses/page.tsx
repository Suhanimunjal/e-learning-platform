'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { BookOpen, Loader2, Eye, Edit, Trash2, Plus, FileText, CheckSquare, Video, Sparkles, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { usePlugins } from '@/contexts/PluginContext';

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  instructor?: { name: string };
  _count?: { enrollments: number };
}

export default function AdminCoursesPage() {
  const { isPluginEnabled } = usePlugins();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAdvancedAssignments = isPluginEnabled('advanced-assignments');
  const hasAdvancedQuizzes = isPluginEnabled('advanced-quizzes');
  const hasLiveSessions = isPluginEnabled('live-sessions');
  const hasAiContent = isPluginEnabled('ai-content-generator');
  const hasPeerAssessment = isPluginEnabled('peer-assessment');
  const hasBadges = isPluginEnabled('badges-certificates');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Course',
      render: (course: CourseData) => (
        <div>
          <p className="font-medium text-gray-900">{course.title}</p>
          <p className="text-sm text-gray-500">{course.instructor?.name || 'Unknown'}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (course: CourseData) => (
        <span className="font-medium">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
      ),
    },
    {
      key: 'enrollments',
      label: 'Enrollments',
      render: (course: CourseData) => course._count?.enrollments || 0,
    },
    {
      key: 'status',
      label: 'Status',
      render: (course: CourseData) => (
        <Badge variant={course.status === 'APPROVED' ? 'success' : course.status === 'PENDING_APPROVAL' ? 'warning' : 'danger'}>
          {course.status === 'APPROVED' ? 'Approved' : course.status === 'PENDING_APPROVAL' ? 'Pending' : 'Rejected'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course: CourseData) => (
        <div className="flex gap-2">
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

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
        {/* Header with Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <p className="text-sm text-gray-500">{courses.length} total courses</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
            
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

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <DataTable data={courses} columns={columns} />
        </div>
      </div>
    </DashboardLayout>
  );
}
