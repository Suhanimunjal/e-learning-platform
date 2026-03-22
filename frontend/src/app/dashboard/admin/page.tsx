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
import { browserApiBaseUrl } from '@/lib/runtime-config';

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

interface StudentListItem {
  id: string;
  name: string;
  email: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
}

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    createdAt: string;
  } | null;
  enrollments: Array<{
    id: string;
    accessStatus: string;
    createdAt: string;
    course: {
      id: string;
      title: string;
      status: string;
      price: number;
      createdAt: string;
    };
  }>;
}

interface TeacherListItem {
  id: string;
  name: string;
  email: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
}

interface TeacherDetail {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    createdAt: string;
  } | null;
  coursesCreated: Array<{
    id: string;
    title: string;
    status: string;
    price: number;
    createdAt: string;
    _count: {
      sections: number;
    };
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Log filter states
  const [logTypes, setLogTypes] = useState<string[]>([]);
  const [logFilter, setLogFilter] = useState<{ action?: string; entityType?: string }>({});
  const [lastLogFetch, setLastLogFetch] = useState<Date>(new Date());
  
  // Loading states for actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState(false);

  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<StudentListItem[]>([]);

  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [studentProfileLoading, setStudentProfileLoading] = useState(false);
  const [studentProfileError, setStudentProfileError] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentDetail | null>(null);

  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);
  const [teachersList, setTeachersList] = useState<TeacherListItem[]>([]);

  const [showTeacherProfileModal, setShowTeacherProfileModal] = useState(false);
  const [teacherProfileLoading, setTeacherProfileLoading] = useState(false);
  const [teacherProfileError, setTeacherProfileError] = useState<string | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherDetail | null>(null);
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    loadData();
    // Fetch log types for filter dropdown
    fetchLogTypes();
  }, []);

  // Auto-refresh logs every 5 seconds when on logs tab
  useEffect(() => {
    if (activeTab !== 'logs') return;
    
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        let url = `${browserApiBaseUrl}/admin/logs/new?since=${lastLogFetch.toISOString()}&limit=100`;
        if (logFilter.action) url += `&action=${logFilter.action}`;
        if (logFilter.entityType) url += `&entityType=${logFilter.entityType}`;
        
        const res = await fetch(url, { headers });
        if (res.ok) {
          const newLogs = await res.json();
          if (newLogs.length > 0) {
            setActivityLogs(prev => [...newLogs, ...prev].slice(0, 200));
            setLastLogFetch(new Date());
          }
        }
      } catch (err) {
        console.error('Auto-refresh logs failed:', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab, lastLogFetch, logFilter]);

  const fetchLogTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/admin/logs/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const types = await res.json();
        setLogTypes(types);
      }
    } catch (err) {
      console.error('Failed to fetch log types:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, studentsRes, logsRes, teachersRes] = await Promise.all([
        fetch(`${browserApiBaseUrl}/admin/stats`, { headers }),
        fetch(`${browserApiBaseUrl}/admin/users/pending`, { headers }),
        fetch(`${browserApiBaseUrl}/admin/logs?limit=50`, { headers }),
        fetch(`${browserApiBaseUrl}/admin/teachers`, { headers }),
      ]);

      const [statsData, studentsData, logsData, teachersData] = await Promise.all([
        statsRes.json(),
        studentsRes.json(),
        logsRes.json(),
        teachersRes.json(),
      ]);

      if (!statsRes.ok || !studentsRes.ok || !logsRes.ok || !teachersRes.ok) {
        throw new Error('One or more admin dashboard endpoints failed to load.');
      }

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
      const res = await fetch(`${browserApiBaseUrl}/admin/users/${userId}/approve`, {
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
      const res = await fetch(`${browserApiBaseUrl}/admin/users/${userId}/reject`, {
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
      const res = await fetch(`${browserApiBaseUrl}/admin/teachers/register`, {
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

  const openStudentsModal = async () => {
    setStudentsLoading(true);
    setStudentsError(null);
    setShowStudentsModal(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load students');
      }

      setStudentsList(data);
    } catch (err: any) {
      setStudentsError(err.message || 'Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const openStudentProfile = async (studentId: string) => {
    setStudentProfileLoading(true);
    setStudentProfileError(null);
    setShowStudentProfileModal(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load student details');
      }

      setStudentProfile(data);
    } catch (err: any) {
      setStudentProfileError(err.message || 'Failed to load student details');
      setStudentProfile(null);
    } finally {
      setStudentProfileLoading(false);
    }
  };

  const openTeachersModal = async () => {
    setTeachersLoading(true);
    setTeachersError(null);
    setShowTeachersModal(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load teachers');
      }

      setTeachersList(data);
    } catch (err: any) {
      setTeachersError(err.message || 'Failed to load teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  const openTeacherProfile = async (teacherId: string) => {
    setTeacherProfileLoading(true);
    setTeacherProfileError(null);
    setShowTeacherProfileModal(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/admin/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load teacher details');
      }

      setTeacherProfile(data);
    } catch (err: any) {
      setTeacherProfileError(err.message || 'Failed to load teacher details');
      setTeacherProfile(null);
    } finally {
      setTeacherProfileLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_REGISTERED': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'USER_APPROVED': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'USER_REJECTED': return <UserX className="h-4 w-4 text-red-500" />;
      case 'TEACHER_CREATED': return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'COURSE_CREATED': return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'COURSE_ACCESSED': return <Eye className="h-4 w-4 text-indigo-500" />;
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
                onClick={openStudentsModal}
              />
              <StatCard
                title="Total Teachers"
                value={stats?.totalTeachers || 0}
                icon={BookOpen}
                color="purple"
                onClick={openTeachersModal}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Auto-refreshing every 5s
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Action Type</label>
                <select
                  value={logFilter.action || ''}
                  onChange={(e) => {
                    setLogFilter(prev => ({ ...prev, action: e.target.value || undefined }));
                    loadData();
                  }}
                  className="block w-48 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">All Actions</option>
                  {logTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Entity Type</label>
                <select
                  value={logFilter.entityType || ''}
                  onChange={(e) => {
                    setLogFilter(prev => ({ ...prev, entityType: e.target.value || undefined }));
                    loadData();
                  }}
                  className="block w-40 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="USER">User</option>
                  <option value="COURSE">Course</option>
                  <option value="ENROLLMENT">Enrollment</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="ASSIGNMENT">Assignment</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setLogFilter({});
                  loadData();
                }}
                className="self-end px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Clear Filters
              </button>
            </div>

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
                        {log.metadata?.name && ` - ${log.metadata.name}`}
                        {log.metadata?.reason && ` (${log.metadata.reason})`}
                      </p>
                      {(log as any).user && (
                        <p className="text-xs text-gray-400 mt-1">
                          By: {(log as any).user?.name || (log as any).user?.email}
                        </p>
                      )}
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

        <Modal
          isOpen={showStudentsModal}
          onClose={() => setShowStudentsModal(false)}
          title="Students"
          size="lg"
        >
          {studentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading students...</span>
            </div>
          ) : studentsError ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{studentsError}</div>
          ) : studentsList.length === 0 ? (
            <p className="text-sm text-gray-500">No students found.</p>
          ) : (
            <div className="space-y-2">
              {studentsList.map((student) => (
                <button
                  key={student.id}
                  onClick={() => openStudentProfile(student.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                  <div className="text-xs text-gray-500">{student.status}</div>
                </button>
              ))}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showStudentProfileModal}
          onClose={() => {
            setShowStudentProfileModal(false);
            setStudentProfile(null);
            setStudentProfileError(null);
          }}
          title="Student Profile"
          size="xl"
        >
          {studentProfileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading student profile...</span>
            </div>
          ) : studentProfileError ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{studentProfileError}</div>
          ) : studentProfile ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">{studentProfile.name}</h4>
                <p className="text-sm text-gray-600">{studentProfile.email}</p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>Status: {studentProfile.status}</span>
                  <span>Joined: {new Date(studentProfile.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h5 className="mb-2 font-semibold text-gray-900">Organization</h5>
                {studentProfile.organization ? (
                  <div className="text-sm text-gray-700">
                    <p>Name: {studentProfile.organization.name}</p>
                    <p>Created: {new Date(studentProfile.organization.createdAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No organization assigned.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h5 className="mb-3 font-semibold text-gray-900">Enrollments</h5>
                {studentProfile.enrollments.length === 0 ? (
                  <p className="text-sm text-gray-500">No enrollments found.</p>
                ) : (
                  <div className="space-y-3">
                    {studentProfile.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="rounded-lg bg-gray-50 p-3">
                        <p className="font-medium text-gray-900">{enrollment.course.title}</p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>Access: {enrollment.accessStatus}</span>
                          <span>Course Status: {enrollment.course.status}</span>
                          <span>Price: {enrollment.course.price}</span>
                          <span>Enrolled: {new Date(enrollment.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={showTeachersModal}
          onClose={() => setShowTeachersModal(false)}
          title="Teachers"
          size="lg"
        >
          {teachersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading teachers...</span>
            </div>
          ) : teachersError ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{teachersError}</div>
          ) : teachersList.length === 0 ? (
            <p className="text-sm text-gray-500">No teachers found.</p>
          ) : (
            <div className="space-y-2">
              {teachersList.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => openTeacherProfile(teacher.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-purple-300 hover:bg-purple-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                  </div>
                  <div className="text-xs text-gray-500">{teacher.status}</div>
                </button>
              ))}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showTeacherProfileModal}
          onClose={() => {
            setShowTeacherProfileModal(false);
            setTeacherProfile(null);
            setTeacherProfileError(null);
          }}
          title="Teacher Profile"
          size="xl"
        >
          {teacherProfileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading teacher profile...</span>
            </div>
          ) : teacherProfileError ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{teacherProfileError}</div>
          ) : teacherProfile ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">{teacherProfile.name}</h4>
                <p className="text-sm text-gray-600">{teacherProfile.email}</p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>Status: {teacherProfile.status}</span>
                  <span>Joined: {new Date(teacherProfile.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h5 className="mb-2 font-semibold text-gray-900">Organization</h5>
                {teacherProfile.organization ? (
                  <div className="text-sm text-gray-700">
                    <p>Name: {teacherProfile.organization.name}</p>
                    <p>Created: {new Date(teacherProfile.organization.createdAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No organization assigned.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h5 className="mb-3 font-semibold text-gray-900">Courses</h5>
                {teacherProfile.coursesCreated.length === 0 ? (
                  <p className="text-sm text-gray-500">No courses found.</p>
                ) : (
                  <div className="space-y-3">
                    {teacherProfile.coursesCreated.map((course) => (
                      <div key={course.id} className="rounded-lg bg-gray-50 p-3">
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>Status: {course.status}</span>
                          <span>Sections: {course._count.sections}</span>
                          <span>Price: {course.price}</span>
                          <span>Created: {new Date(course.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
