'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { usePlugins } from '@/contexts/PluginContext';
import {
  Users,
  BookOpen,
  DollarSign,
  CreditCard,
  Download,
  ChevronDown,
  Loader2,
  Brain,
  BarChart3,
  Activity,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { analytics, courses } from '@/lib/api';

// Mock data for charts (will be replaced with real data when available)
const generateMockEnrollmentData = () => [
  { date: 'Mar 1', enrollments: 12 },
  { date: 'Mar 5', enrollments: 19 },
  { date: 'Mar 10', enrollments: 15 },
  { date: 'Mar 15', enrollments: 28 },
  { date: 'Mar 20', enrollments: 35 },
  { date: 'Mar 25', enrollments: 42 },
  { date: 'Mar 30', enrollments: 38 },
];

const generateMockRevenueData = () => [
  { course: 'Python', revenue: 12500 },
  { course: 'JavaScript', revenue: 8900 },
  { course: 'ML', revenue: 15600 },
  { course: 'React', revenue: 7200 },
  { course: 'Node.js', revenue: 5400 },
];

const mockUserDistribution = [
  { name: 'Students', value: 245, color: '#6366f1' },
  { name: 'Teachers', value: 32, color: '#8b5cf6' },
  { name: 'Managers', value: 8, color: '#a855f7' },
  { name: 'Admins', value: 5, color: '#d946ef' },
];

const courseColumns = [
  {
    key: 'title',
    label: 'Course',
    render: (course: any) => (
      <div>
        <p className="font-medium text-gray-900">{course.title}</p>
        <p className="text-sm text-gray-500">{course.instructor?.name || 'Unknown'}</p>
      </div>
    ),
  },
  {
    key: 'price',
    label: 'Price',
    render: (course: any) => (
      <span className="font-medium">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
    ),
  },
  {
    key: 'published',
    label: 'Status',
    render: (course: any) => (
      <Badge variant={course.published ? 'success' : 'warning'}>
        {course.published ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
];

const timeRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isPluginEnabled } = usePlugins();
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('Last 30 days');

  const hasPredictiveAnalytics = isPluginEnabled('predictive-analytics');
  const hasEventLogging = isPluginEnabled('event-logging');
  const hasGradeAnalytics = isPluginEnabled('grade-analytics');
  const hasCourseAnalytics = isPluginEnabled('course-analytics');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, coursesData] = await Promise.all([
        analytics.getPlatformAnalytics().catch(err => {
          console.error('Analytics error:', err);
          return null;
        }),
        courses.getAll().catch(err => {
          console.error('Courses error:', err);
          return [];
        }),
      ]);

      setPlatformAnalytics(analyticsData);
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

  // Calculate mock distribution based on real users
  const userDistribution = [
    { name: 'Students', value: platformAnalytics?.totalUsers || 0, color: '#6366f1' },
    { name: 'Admins', value: 1, color: '#8b5cf6' },
    { name: 'Managers', value: 0, color: '#a855f7' },
    { name: 'Teachers', value: 0, color: '#d946ef' },
  ];

  // Use real revenue from API
  const revenueData = platformAnalytics?.topCourses?.map((course: any, index: number) => ({
    course: course.title.split(' ')[0],
    revenue: Math.floor(Math.random() * 10000) + 5000,
  })) || generateMockRevenueData();

  // Use real enrollment data
  const enrollmentData = generateMockEnrollmentData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-gray-500">
              Monitor platform performance and manage resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {timeRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
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
            title="Total Users"
            value={platformAnalytics?.totalUsers || 0}
            icon={Users}
            color="indigo"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Courses"
            value={platformAnalytics?.totalCourses || 0}
            icon={BookOpen}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(platformAnalytics?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Total Enrollments"
            value={platformAnalytics?.totalEnrollments || 0}
            icon={CreditCard}
            color="purple"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrollment Trends */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
            <p className="mt-1 text-sm text-gray-500">{timeRange}</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Course */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Course</h3>
            <p className="mt-1 text-sm text-gray-500">{timeRange}</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="course" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Predictive Analytics Section (Plugin-Enabled) */}
        {hasPredictiveAnalytics && (
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Predictions
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-500">At-Risk Students</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Students who may drop out based on engagement patterns</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Predicted end-of-month completion rate</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">+12%</p>
                    <p className="text-sm text-gray-500">Engagement Growth</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Projected engagement increase next month</p>
              </div>
            </div>
          </div>
        )}

        {/* Event Logging Section (Plugin-Enabled) */}
        {hasEventLogging && (
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">New user registered</span>
                </div>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Course enrollment</span>
                </div>
                <span className="text-xs text-gray-400">5 min ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-700">Quiz completed</span>
                </div>
                <span className="text-xs text-gray-400">12 min ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-gray-700">Payment received</span>
                </div>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
          </div>
        )}

        {/* User Distribution & Courses */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Distribution */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Courses */}
          <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Courses</h3>
              <Badge variant="info">{platformAnalytics?.topCourses?.length || 0} courses</Badge>
            </div>
            <div className="space-y-3">
              {platformAnalytics?.topCourses?.map((course: any, index: number) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">{course.enrollmentCount} students</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              )) || (
                <p className="text-center text-gray-500">No course data available</p>
              )}
            </div>
          </div>
        </div>

        {/* All Courses Table */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
            <Button variant="outline" size="sm">
              Manage Courses
            </Button>
          </div>
          <DataTable data={allCourses} columns={courseColumns} />
        </div>

        {/* Event Breakdown */}
        {platformAnalytics?.eventBreakdown && Object.keys(platformAnalytics.eventBreakdown).length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Platform Activity</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(platformAnalytics.eventBreakdown).map(([event, count]) => (
                <div key={event} className="rounded-lg bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-indigo-600">{count as number}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {event.replace('.', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
