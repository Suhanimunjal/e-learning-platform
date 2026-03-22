'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { enrollments, payments } from '@/lib/api';
import { usePlugins } from '@/contexts/PluginContext';
import { browserApiBaseUrl } from '@/lib/runtime-config';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  BookOpen, 
  Award, 
  Users, 
  Star, 
  Play,
  FileText,
  MessageSquare,
  Sparkles,
  Video,
  Globe,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.id as string;
  const { isPluginEnabled } = usePlugins();

  const [course, setCourse] = useState<any>(null);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const hasBadges = isPluginEnabled('badges-certificates');
  const hasPoints = isPluginEnabled('points-leaderboard');
  const hasForums = isPluginEnabled('forums');
  const hasLiveSessions = isPluginEnabled('live-sessions');
  const hasVideoHosting = isPluginEnabled('video-hosting');
  const hasScorm = isPluginEnabled('scorm-h5p');
  const hasAiTranslation = isPluginEnabled('ai-translation');

  useEffect(() => {
    loadCourseData();
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${browserApiBaseUrl}/courses/${courseId}`, {
        headers,
        signal: controller.signal 
      });
      clearTimeout(timeout);
      
      if (res.ok) {
        const courseData = await res.json();
        setCourse(courseData);
        
        if (courseData.sections) {
          setSectionsList(courseData.sections);
        }
        
        if (user) {
          try {
            const myCourses = await enrollments.getMyCourses();
            const enrolled = myCourses.some((e: any) => e.course?.id === courseId);
            setIsEnrolled(enrolled);
          } catch (e) {
            // Ignore enrollment check errors
          }
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = '/login?redirect=/courses/' + courseId;
      return;
    }
    
    setError('');
    setEnrolling(true);

    try {
      if (course.price > 0) {
        const order = await payments.createOrder(courseId, course.price);
        alert(`Payment integration would happen here. Order ID: ${order.orderId}`);
        setIsEnrolled(true);
      } else {
        await enrollments.enroll(courseId);
        setIsEnrolled(true);
        alert('Successfully enrolled!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back to Courses
            </Link>
              {!user && (
                <Link
                  href="/login"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Login to Enroll
                </Link>
              )}
              {user?.role === 'STUDENT' && !isEnrolled && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {enrolling ? 'Processing...' : course.price > 0 ? 'Buy Now' : 'Enroll for Free'}
                </button>
              )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">About this course</h2>
              <p className="mt-4 text-gray-600">{course.description}</p>

              {sectionsList.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                  <div className="mt-4 space-y-4">
                    {sectionsList.map((section: any, index: number) => (
                      <div key={section.id} className="rounded-lg border border-gray-200">
                        <div className="bg-gray-50 px-4 py-3">
                          <h4 className="font-medium text-gray-900">
                            Section {index + 1}: {section.title}
                          </h4>
                        </div>
                        {section.modules && section.modules.length > 0 && (
                          <div className="divide-y divide-gray-200">
                            {section.modules.map((module: any) => (
                              <div key={module.id} className="px-4 py-3">
                                <p className="text-sm text-gray-700">{module.title}</p>
                                <p className="text-xs text-gray-500">{module.type}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plugin-Enabled Course Features */}
              {(hasBadges || hasPoints || hasForums || hasLiveSessions) && (
                <div className="mt-8 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border border-indigo-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Enhanced Course Features
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {hasBadges && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <Award className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-gray-700">Earn Badges</span>
                      </div>
                    )}
                    {hasPoints && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">Earn Points</span>
                      </div>
                    )}
                    {hasForums && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Discussion Forum</span>
                      </div>
                    )}
                    {hasLiveSessions && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <Video className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Live Sessions</span>
                      </div>
                    )}
                    {hasScorm && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <Play className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Interactive Content</span>
                      </div>
                    )}
                    {hasAiTranslation && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <Globe className="h-5 w-5 text-cyan-600" />
                        <span className="text-sm font-medium text-gray-700">Multi-language Support</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-lg bg-white p-6 shadow sticky top-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {course.price > 0 ? `₹${course.price}` : 'Free'}
                </p>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-500">
                  Instructor: {course.instructor?.name || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
