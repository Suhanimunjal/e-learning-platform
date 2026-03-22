'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { browserApiBaseUrl } from '@/lib/runtime-config';
import { BarChart3, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendPoint {
  month: string;
  enrollments?: number;
  revenue?: number;
}

interface PlatformAnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  totalCourses: number;
  userGrowthRate?: number;
  revenueGrowthRate?: number;
  enrollmentGrowthRate?: number;
  enrollmentTrend?: TrendPoint[];
  revenueTrend?: TrendPoint[];
  topCourses?: Array<{
    courseId: string;
    title: string;
    enrollmentCount: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/analytics/platform`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </DashboardLayout>
    );
  }

  const enrollmentTrend = data?.enrollmentTrend || [];
  const revenueData = data?.revenueTrend || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={data?.totalUsers || 0}
            icon={Users}
            color="indigo"
            trend={
              typeof data?.userGrowthRate === 'number'
                ? { value: Math.abs(data.userGrowthRate), isPositive: data.userGrowthRate >= 0 }
                : undefined
            }
          />
          <StatCard
            title="Total Revenue"
            value={`₹${((data?.totalRevenue) || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend={
              typeof data?.revenueGrowthRate === 'number'
                ? { value: Math.abs(data.revenueGrowthRate), isPositive: data.revenueGrowthRate >= 0 }
                : undefined
            }
          />
          <StatCard
            title="Active Courses"
            value={data?.totalCourses || 0}
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Enrollment Growth"
            value={`${data?.enrollmentGrowthRate ?? 0}%`}
            icon={TrendingUp}
            color="blue"
            trend={
              typeof data?.enrollmentGrowthRate === 'number'
                ? { value: Math.abs(data.enrollmentGrowthRate), isPositive: data.enrollmentGrowthRate >= 0 }
                : undefined
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Enrollment Trend</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="enrollments" stroke="#6366f1" fill="#e0e7ff" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {data?.topCourses && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Courses</h3>
            <div className="mt-4 space-y-3">
              {data.topCourses.map((course: any, index: number) => (
                <div key={course.courseId} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">{course.enrollmentCount} enrollments</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
