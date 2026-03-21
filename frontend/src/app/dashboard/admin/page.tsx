'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
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
  FileText,
  CheckCircle,
  XCircle,
  UserPlus,
  Book,
  UserCheck,
  UserX,
  LogOut,
  Plus,
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

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  organization?: { name: string };
}

interface PendingCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  instructor?: { id: string; name: string; email: string };
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  targetUserId?: string;
  metadata: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'teachers' | 'logs'>('overview');
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('Last 30 days');
  
  // Pending data
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Teacher registration modal
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [teacherStep, setTeacherStep] = useState<'form' | 'otp'>('form');
  const [teacherOtp, setTeacherOtp] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, coursesRes, pendingUsersRes, pendingCoursesRes, logsRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/stats', { headers }),
        fetch('http://localhost:3001/api/courses', { headers }),
        fetch('http://localhost:3001/api/admin/users/pending', { headers }),
        fetch('http://localhost:3001/api/admin/courses/pending', { headers }),
        fetch('http://localhost:3001/api/admin/logs?limit=50', { headers }),
      ]);

      const [stats, courses, pUsers, pCourses, logs] = await Promise.all([
        statsRes.json(),
        coursesRes.json(),
        pendingUsersRes.json(),
        pendingCoursesRes.json(),
        logsRes.json(),
      ]);

      setPlatformAnalytics(stats);
      setAllCourses(courses || []);
      setPendingUsers(pUsers || []);
      setPendingCourses(pCourses || []);
      setActivityLogs(logs || []);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load some data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const handleRejectUser = async (userId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to reject user:', err);
    }
  };

  const handleApproveCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/courses/${courseId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error('Failed to approve course:', err);
    }
  };

  const handleRejectCourse = async (courseId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/courses/${courseId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to reject course:', err);
    }
  };

  const handleRegisterTeacher = async () => {
    setTeacherLoading(true);
    setTeacherMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (teacherStep === 'form') {
        const res = await fetch('http://localhost:3001/api/admin/teachers/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(teacherForm),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to send OTP');
        }
        
        setTeacherStep('otp');
        setTeacherEmail(teacherForm.email);
        setTeacherMessage('OTP sent to teacher email');
      } else {
        const res = await fetch('http://localhost:3001/api/admin/teachers/verify-otp', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            email: teacherEmail, 
            otp: teacherOtp, 
            name: teacherForm.name, 
            password: teacherForm.password 
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'OTP verification failed');
        }
        
        setShowTeacherModal(false);
        setTeacherStep('form');
        setTeacherForm({ name: '', email: '', password: '' });
        setTeacherOtp('');
        loadData();
      }
    } catch (err: any) {
      setTeacherMessage(err.message);
    } finally {
      setTeacherLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_REGISTERED': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'USER_APPROVED': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'USER_REJECTED': return <UserX className="h-4 w-4 text-red-500" />;
      case 'TEACHER_CREATED': return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'COURSE_CREATED': return <Book className="h-4 w-4 text-blue-500" />;
      case 'COURSE_APPROVED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'COURSE_REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ENROLLMENT_REQUESTED': return <UserPlus className="h-4 w-4 text-yellow-500" />;
      case 'ENROLLMENT_APPROVED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ENROLLMENT_REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const userColumns = [
    {
      key: 'name',
      label: 'User',
      render: (u: PendingUser) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.name}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u: PendingUser) => (
        <Badge variant={u.role === 'TEACHER' ? 'warning' : 'info'}>{u.role}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (u: PendingUser) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u: PendingUser) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleApproveUser(u.id)}>
            <CheckCircle className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleRejectUser(u.id)}>
            <XCircle className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  const courseColumns = [
    {
      key: 'title',
      label: 'Course',
      render: (c: PendingCourse) => (
        <div>
          <p className="font-medium text-gray-900">{c.title}</p>
          <p className="text-sm text-gray-500">{c.instructor?.name || 'Unknown'}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (c: PendingCourse) => c.price > 0 ? `₹${c.price}` : 'Free',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (c: PendingCourse) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleApproveCourse(c.id)}>
            <CheckCircle className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleRejectCourse(c.id)}>
            <XCircle className="h-4 w-4 mr-1" /> Reject
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
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage users, courses, and approvals</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Approvals
              {(pendingUsers.length + pendingCourses.length) > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingUsers.length + pendingCourses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 ${
                activeTab === 'teachers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Teacher Management
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Logs
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={platformAnalytics?.totalUsers || 0}
                icon={Users}
                color="indigo"
              />
              <StatCard
                title="Pending Users"
                value={platformAnalytics?.pendingUsers || 0}
                icon={AlertTriangle}
                color="yellow"
              />
              <StatCard
                title="Pending Courses"
                value={platformAnalytics?.pendingCourses || 0}
                icon={BookOpen}
                color="yellow"
              />
              <StatCard
                title="Total Enrollments"
                value={platformAnalytics?.totalEnrollments || 0}
                icon={CreditCard}
                color="purple"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pending Users Summary */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Users</h3>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('pending')}>
                    View All
                  </Button>
                </div>
                {pendingUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending users</p>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.slice(0, 3).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.role}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleApproveUser(u.id)}>
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Courses Summary */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Courses</h3>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('pending')}>
                    View All
                  </Button>
                </div>
                {pendingCourses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending courses</p>
                ) : (
                  <div className="space-y-3">
                    {pendingCourses.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.instructor?.name}</p>
                        </div>
                        <Button size="sm" onClick={() => handleApproveCourse(c.id)}>
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Pending Users */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending User Registrations</h3>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending users</p>
              ) : (
                <DataTable data={pendingUsers} columns={userColumns} />
              )}
            </div>

            {/* Pending Courses */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Course Approvals</h3>
              {pendingCourses.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending courses</p>
              ) : (
                <DataTable data={pendingCourses} columns={courseColumns} />
              )}
            </div>
          </div>
        )}

        {/* Teacher Management Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Teacher Accounts</h3>
                  <p className="text-sm text-gray-500">Add new teachers - they will receive an OTP to complete registration</p>
                </div>
                <Button onClick={() => setShowTeacherModal(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Teacher
                </Button>
              </div>
              
              {/* Teachers list would go here */}
              <p className="text-gray-500 text-sm">Teacher list coming soon...</p>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {activityLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity logs</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{formatAction(log.action)}</p>
                      <p className="text-sm text-gray-500">
                        {log.entityType} {log.entityId.slice(0, 8)}...
                        {log.metadata?.courseTitle && ` - ${log.metadata.courseTitle}`}
                        {log.metadata?.email && ` - ${log.metadata.email}`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            <button onClick={loadData} className="ml-2 underline">Retry</button>
          </div>
        )}

        {/* Teacher Registration Modal */}
        <Modal
          isOpen={showTeacherModal}
          onClose={() => {
            setShowTeacherModal(false);
            setTeacherStep('form');
            setTeacherForm({ name: '', email: '', password: '' });
            setTeacherOtp('');
          }}
          title={teacherStep === 'form' ? 'Add New Teacher' : 'Verify Teacher OTP'}
        >
          <div className="space-y-4">
            {teacherMessage && (
              <div className={`rounded-lg p-3 text-sm ${teacherMessage.includes('sent') || teacherMessage.includes('OTP') ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                {teacherMessage}
              </div>
            )}

            {teacherStep === 'form' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="teacher@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <Button onClick={handleRegisterTeacher} disabled={teacherLoading} className="w-full">
                  {teacherLoading ? 'Sending OTP...' : 'Send OTP to Teacher'}
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    OTP sent to <strong>{teacherEmail}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    value={teacherOtp}
                    onChange={(e) => setTeacherOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
                <Button onClick={handleRegisterTeacher} disabled={teacherLoading} className="w-full">
                  {teacherLoading ? 'Verifying...' : 'Verify and Create Teacher'}
                </Button>
                <button
                  type="button"
                  onClick={() => setTeacherStep('form')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
