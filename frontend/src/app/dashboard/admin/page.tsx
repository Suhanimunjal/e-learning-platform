'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  Loader2,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserPlus,
  UserCheck,
  UserX,
  Eye,
  Check,
  X,
} from 'lucide-react';

interface PendingStudent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  phone?: string;
  rollNo?: string;
  year?: string;
  branch?: string;
  course?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Loading states for actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState(false);
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, studentsRes, logsRes, teachersRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/stats', { headers }),
        fetch('http://localhost:3001/api/admin/users/pending', { headers }),
        fetch('http://localhost:3001/api/admin/logs?limit=50', { headers }),
        fetch('http://localhost:3001/api/admin/teachers', { headers }),
      ]);

      const [statsData, studentsData, logsData, teachersData] = await Promise.all([
        statsRes.json(),
        studentsRes.json(),
        logsRes.json(),
        teachersRes.json(),
      ]);

      setStats(statsData);
      setPendingStudents(Array.isArray(studentsData) ? studentsData : []);
      setActivityLogs(Array.isArray(logsData) ? logsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load some data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setProcessedIds(prev => new Set([...prev, userId]));
        setTimeout(() => {
          setPendingStudents(prev => prev.filter(s => s.id !== userId));
          setProcessedIds(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }, 500);
      }
    } catch (err) {
      console.error('Failed to approve user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({}),
      });
      
      if (res.ok) {
        setProcessedIds(prev => new Set([...prev, userId]));
        setTimeout(() => {
          setPendingStudents(prev => prev.filter(s => s.id !== userId));
          setProcessedIds(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }, 500);
      }
    } catch (err) {
      console.error('Failed to reject user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTeacher = async () => {
    setTeacherLoading(true);
    setTeacherMessage('');
    
    try {
      const token = localStorage.getItem('token');
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
        throw new Error(data.message || 'Failed to create teacher');
      }
      
      setTeacherSuccess(true);
      setTimeout(() => {
        setShowTeacherModal(false);
        setTeacherForm({ name: '', email: '', password: '' });
        setTeacherMessage('');
        setTeacherSuccess(false);
        loadData();
      }, 1500);
    } catch (err: any) {
      setTeacherMessage(err.message);
    } finally {
      setTeacherLoading(false);
    }
  };

  const showUserDetail = (student: PendingStudent) => {
    setDetailData(student);
    setShowDetailModal(true);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_REGISTERED': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'USER_APPROVED': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'USER_REJECTED': return <UserX className="h-4 w-4 text-red-500" />;
      case 'TEACHER_CREATED': return <UserPlus className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const studentColumns = [
    {
      key: 'name',
      label: 'Student',
      render: (s: PendingStudent) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-medium">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{s.name}</p>
            <p className="text-sm text-gray-500">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (s: PendingStudent) => s.phone || '-',
    },
    {
      key: 'rollNo',
      label: 'Roll No',
      render: (s: PendingStudent) => s.rollNo || '-',
    },
    {
      key: 'createdAt',
      label: 'Registered On',
      render: (s: PendingStudent) => new Date(s.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (s: PendingStudent) => {
        const isProcessed = processedIds.has(s.id);
        const isLoading = actionLoading === s.id;
        return (
          <div className={`flex items-center gap-2 transition-all duration-500 ${isProcessed ? 'opacity-50 translate-x-4' : ''}`}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => showUserDetail(s)}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleApproveUser(s.id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && actionLoading === s.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => handleRejectUser(s.id)}
              disabled={isLoading}
            >
              {isLoading && actionLoading === s.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
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
            <p className="text-gray-500">Manage student registrations and platform users</p>
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
              Student Approvals
              {pendingStudents.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingStudents.length}
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
              Teachers ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 ${
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Students"
                value={stats?.totalStudents || 0}
                icon={Users}
                color="indigo"
              />
              <StatCard
                title="Total Teachers"
                value={stats?.totalTeachers || 0}
                icon={BookOpen}
                color="purple"
              />
              <StatCard
                title="Pending Approvals"
                value={pendingStudents.length}
                icon={AlertTriangle}
                color="yellow"
              />
              <StatCard
                title="Total Courses"
                value={stats?.totalCourses || 0}
                icon={BookOpen}
                color="green"
              />
            </div>

            {/* Pending Students Quick View */}
            {pendingStudents.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Student Registrations</h3>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('pending')}>
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {pendingStudents.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-medium">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveUser(s.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleRejectUser(s.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Student Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Student Registrations</h3>
            {pendingStudents.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No pending student registrations</p>
            ) : (
              <DataTable data={pendingStudents} columns={studentColumns} />
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Teacher Accounts</h3>
                <p className="text-sm text-gray-500">Add new teachers - they will receive an OTP to complete registration</p>
              </div>
              <Button onClick={() => setShowTeacherModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Add Teacher
              </Button>
            </div>
            {teachers.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No teachers added yet</p>
            ) : (
              <div className="space-y-3">
                {teachers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-lg font-medium">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.email}</p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {activityLogs.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No activity logs</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{formatAction(log.action)}</p>
                      <p className="text-sm text-gray-500">
                        {log.entityType}
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
            setTeacherForm({ name: '', email: '', password: '' });
            setTeacherMessage('');
            setTeacherSuccess(false);
          }}
          title="Add New Teacher"
        >
          <div className="space-y-4">
            {teacherMessage && !teacherSuccess && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {teacherMessage}
              </div>
            )}
            {teacherSuccess && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                Teacher created successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={teacherForm.name}
                onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                disabled={teacherSuccess}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                disabled={teacherSuccess}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 placeholder:text-gray-400"
                placeholder="teacher@example.com"
                style={{ color: '#171717' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                disabled={teacherSuccess}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 placeholder:text-gray-400"
                placeholder="••••••••"
                style={{ color: '#171717' }}
              />
            </div>
            <Button onClick={handleCreateTeacher} disabled={teacherLoading || teacherSuccess} className="w-full">
              {teacherLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                'Create Teacher Account'
              )}
            </Button>
          </div>
        </Modal>

        {/* Student Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Student Details"
        >
          {detailData && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-xl font-medium">
                  {detailData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{detailData.name}</p>
                  <p className="text-gray-500">{detailData.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900">{detailData.phone || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Roll Number</p>
                  <p className="font-medium text-gray-900">{detailData.rollNo || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Year</p>
                  <p className="font-medium text-gray-900">{detailData.year || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Branch</p>
                  <p className="font-medium text-gray-900">{detailData.branch || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Course</p>
                  <p className="font-medium text-gray-900">{detailData.course || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => {
                    handleApproveUser(detailData.id);
                    setShowDetailModal(false);
                  }} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    handleRejectUser(detailData.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
