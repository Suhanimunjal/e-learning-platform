'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { admin } from '@/lib/api';
import {
  Users,
  BookOpen,
  Loader2,
  Activity,
  UserPlus,
  UserCheck,
  UserX,
  Eye,
  Ban,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { browserApiBaseUrl } from '@/lib/runtime-config';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  createdAt: string;
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

interface TeacherDetail {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'TEACHER';
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string; createdAt: string } | null;
  coursesCreated: Array<{
    id: string;
    title: string;
    status: string;
    price: number;
    createdAt: string;
    _count: { sections: number };
  }>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [logTypes, setLogTypes] = useState<string[]>([]);
  const [logFilter, setLogFilter] = useState<{ action?: string; entityType?: string }>({});
  const [lastLogFetch, setLastLogFetch] = useState<Date>(new Date());

  // Teacher detail modal
  const [showTeacherProfileModal, setShowTeacherProfileModal] = useState(false);
  const [teacherProfileLoading, setTeacherProfileLoading] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<TeacherDetail | null>(null);

  // Confirm action for blacklist/delete
  const [confirmAction, setConfirmAction] = useState<{
    type: 'blacklist-teacher' | 'unblacklist-teacher' | 'blacklist-course' | 'unblacklist-course' | 'delete-course';
    id: string;
    name: string;
  } | null>(null);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => { loadData(); fetchLogTypes(); }, []);

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
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, lastLogFetch, logFilter]);

  const fetchLogTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${browserApiBaseUrl}/admin/logs/types`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLogTypes(await res.json());
    } catch {}
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsResult, logsResult, teachersResult] = await Promise.allSettled([
        fetch(`${browserApiBaseUrl}/admin/stats`, { headers }).then(async res => {
          if (!res.ok) throw new Error(`Stats: ${res.status} ${res.statusText}`);
          return res.json();
        }),
        fetch(`${browserApiBaseUrl}/admin/logs?limit=50`, { headers }).then(async res => {
          if (!res.ok) throw new Error(`Logs: ${res.status} ${res.statusText}`);
          return res.json();
        }),
        fetch(`${browserApiBaseUrl}/admin/teachers`, { headers }).then(async res => {
          if (!res.ok) throw new Error(`Teachers: ${res.status} ${res.statusText}`);
          return res.json();
        }),
      ]);

      const errors: string[] = [];

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        errors.push(statsResult.reason?.message || 'Stats failed');
      }

      if (logsResult.status === 'fulfilled') {
        setActivityLogs(Array.isArray(logsResult.value) ? logsResult.value : []);
      } else {
        errors.push(logsResult.reason?.message || 'Logs failed');
      }

      if (teachersResult.status === 'fulfilled') {
        setTeachers(Array.isArray(teachersResult.value) ? teachersResult.value : []);
      } else {
        errors.push(teachersResult.reason?.message || 'Teachers failed');
      }

      if (errors.length > 0) {
        setError(`Failed to load: ${errors.join(', ')}. Please try again.`);
      }
    } catch (err: any) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openTeacherProfile = async (teacherId: string) => {
    setTeacherProfileLoading(true);
    setShowTeacherProfileModal(true);
    try { setTeacherProfile(await admin.getTeacherById(teacherId)); }
    catch { setTeacherProfile(null); }
    finally { setTeacherProfileLoading(false); }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActing(true);
    try {
      switch (confirmAction.type) {
        case 'blacklist-teacher': {
          const res = await admin.blacklistUser(confirmAction.id, blacklistReason || 'Blacklisted by admin');
          if (res.blacklistedCourses > 0) alert(`${res.blacklistedCourses} course(s) also blacklisted.`);
          break;
        }
        case 'unblacklist-teacher': {
          const res = await admin.unblacklistUser(confirmAction.id);
          if (res.restoredCourses > 0) alert(`${res.restoredCourses} course(s) also restored.`);
          break;
        }
        case 'blacklist-course': await admin.blacklistCourse(confirmAction.id, blacklistReason || 'Blacklisted by admin'); break;
        case 'unblacklist-course': await admin.unblacklistCourse(confirmAction.id); break;
        case 'delete-course': await admin.deleteCourse(confirmAction.id); break;
      }
      setConfirmAction(null);
      setBlacklistReason('');
      setTeacherProfile(null);
      setShowTeacherProfileModal(false);
      loadData();
    } catch (err: any) {
      alert('Action failed: ' + (err?.response?.data?.message || err?.message));
    } finally { setActing(false); }
  };

  const getStatusBadge = (status: string) => {
    const v = status === 'ACTIVE' ? 'success' : status === 'BLACKLISTED' ? 'danger' : status === 'PENDING_APPROVAL' ? 'warning' : 'default';
    return <Badge variant={v as any}>{status}</Badge>;
  };

  const getActionIcon = (action: string) => {
    if (action.includes('BLACKLISTED')) return <Ban className="h-4 w-4 text-red-500" />;
    if (action.includes('REGISTERED') || action.includes('CREATED')) return <UserPlus className="h-4 w-4 text-blue-500" />;
    if (action.includes('APPROVED')) return <UserCheck className="h-4 w-4 text-green-500" />;
    if (action.includes('REJECTED')) return <UserX className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const formatAction = (action: string) => action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage platform users and monitor activity</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            {(['overview', 'teachers', 'logs'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-medium text-sm border-b-2 ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab === 'overview' ? 'Overview' : tab === 'teachers' ? `Teachers (${teachers.length})` : 'Activity Logs'}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="indigo" />
            <StatCard title="Total Teachers" value={stats?.totalTeachers || 0} icon={BookOpen} color="purple" />
            <StatCard title="Total Courses" value={stats?.totalCourses || 0} icon={BookOpen} color="green" />
            <StatCard title="Blacklisted" value={(stats?.blacklistedUsers || 0) + (stats?.blacklistedCourses || 0)} icon={Ban} color="red" />
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Teacher Accounts</h3>
              <p className="text-sm text-gray-500">Click a teacher to view details, manage courses, and blacklist/remove</p>
            </div>
            {teachers.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No teachers registered</p>
            ) : (
              <div className="space-y-3">
                {teachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-lg font-medium">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.email}</p>
                        {t.phone && <p className="text-xs text-gray-400">{t.phone}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(t.status)}
                      <button onClick={() => openTeacherProfile(t.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View details & manage">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Auto-refreshing every 5s
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Action Type</label>
                <select value={logFilter.action || ''} onChange={e => setLogFilter(prev => ({ ...prev, action: e.target.value || undefined }))}
                  className="block w-48 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900">
                  <option value="">All Actions</option>
                  {logTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Entity Type</label>
                <select value={logFilter.entityType || ''} onChange={e => setLogFilter(prev => ({ ...prev, entityType: e.target.value || undefined }))}
                  className="block w-40 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900">
                  <option value="">All Types</option>
                  <option value="USER">User</option><option value="COURSE">Course</option>
                  <option value="ENROLLMENT">Enrollment</option><option value="QUIZ">Quiz</option>
                </select>
              </div>
              <button onClick={() => setLogFilter({})} className="self-end px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">Clear</button>
            </div>
            {activityLogs.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No activity logs</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="mt-1">{getActionIcon(log.action)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{formatAction(log.action)}</p>
                      <p className="text-sm text-gray-500">
                        {log.entityType}
                        {log.metadata?.name && ` - ${log.metadata.name}`}
                        {log.metadata?.email && ` (${log.metadata.email})`}
                        {log.metadata?.reason && `: ${log.metadata.reason}`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error} <button onClick={loadData} className="ml-2 underline">Retry</button></div>}

        {/* Teacher Detail Modal */}
        <Modal isOpen={showTeacherProfileModal} onClose={() => { setShowTeacherProfileModal(false); setTeacherProfile(null); }}
          title={teacherProfile ? `Teacher: ${teacherProfile.name}` : 'Teacher Profile'} size="xl">
          {teacherProfileLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-purple-600" /></div>
          ) : teacherProfile ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">{teacherProfile.name}</h4>
                <p className="text-sm text-gray-600">{teacherProfile.email}</p>
                {teacherProfile.phone && <p className="text-sm text-gray-500">{teacherProfile.phone}</p>}
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>Status: {teacherProfile.status}</span>
                  <span>Joined: {new Date(teacherProfile.createdAt).toLocaleDateString()}</span>
                  {teacherProfile.organization && <span>Org: {teacherProfile.organization.name}</span>}
                </div>
                {teacherProfile.rejectionReason && <p className="mt-2 text-sm text-red-600">Reason: {teacherProfile.rejectionReason}</p>}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                {teacherProfile.status === 'BLACKLISTED' ? (
                  <Button size="sm" variant="outline"
                    onClick={() => setConfirmAction({ type: 'unblacklist-teacher', id: teacherProfile.id, name: teacherProfile.name })}
                    className="text-green-600 border-green-300 hover:bg-green-50">
                    <ShieldCheck size={14} className="mr-1" /> Unblacklist (restores courses)
                  </Button>
                ) : (
                  <Button size="sm" variant="outline"
                    onClick={() => setConfirmAction({ type: 'blacklist-teacher', id: teacherProfile.id, name: teacherProfile.name })}
                    className="text-red-600 border-red-300 hover:bg-red-50">
                    <Ban size={14} className="mr-1" /> Blacklist (blacklists all courses)
                  </Button>
                )}
              </div>

              <div>
                <h5 className="mb-3 font-semibold text-gray-900">Courses ({teacherProfile.coursesCreated.length})</h5>
                {teacherProfile.coursesCreated.length === 0 ? (
                  <p className="text-sm text-gray-500">No courses created</p>
                ) : (
                  <div className="space-y-2">
                    {teacherProfile.coursesCreated.map(course => (
                      <div key={course.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-xs text-gray-500">
                            {course._count.sections} sections | {new Date(course.createdAt).toLocaleDateString()}
                            {course.price > 0 && ` | $${course.price}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant={course.status === 'APPROVED' ? 'success' : course.status === 'BLACKLISTED' ? 'danger' : 'warning' as any}>
                            {course.status}
                          </Badge>
                          {course.status === 'BLACKLISTED' ? (
                            <button onClick={() => setConfirmAction({ type: 'unblacklist-course', id: course.id, name: course.title })}
                              className="p-1 text-green-600 hover:bg-green-50 rounded" title="Unblacklist"><ShieldCheck size={14} /></button>
                          ) : (
                            <button onClick={() => setConfirmAction({ type: 'blacklist-course', id: course.id, name: course.title })}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Blacklist"><Ban size={14} /></button>
                          )}
                          <button onClick={() => setConfirmAction({ type: 'delete-course', id: course.id, name: course.title })}
                            className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Confirm Action Modal */}
        <Modal isOpen={!!confirmAction} onClose={() => { setConfirmAction(null); setBlacklistReason(''); }}
          title={confirmAction?.type === 'delete-course' ? `Delete: ${confirmAction?.name}` : confirmAction?.type.includes('un') ? `Unblacklist: ${confirmAction?.name}` : `Blacklist: ${confirmAction?.name}`}>
          {confirmAction && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <Ban className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-red-700">
                  {confirmAction.type === 'blacklist-teacher' && <p>This teacher will be blocked and <strong>all their courses will also be blacklisted</strong>.</p>}
                  {confirmAction.type === 'unblacklist-teacher' && <p>This teacher will be restored and <strong>their courses will also be restored</strong>.</p>}
                  {confirmAction.type === 'blacklist-course' && <p>This course will be hidden from students.</p>}
                  {confirmAction.type === 'unblacklist-course' && <p>This course will be visible again.</p>}
                  {confirmAction.type === 'delete-course' && <p>This will <strong>permanently delete</strong> the course and all its data. Cannot be undone.</p>}
                </div>
              </div>
              {confirmAction.type.includes('blacklist') && !confirmAction.type.includes('un') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                  <input type="text" value={blacklistReason} onChange={e => setBlacklistReason(e.target.value)} placeholder="Enter reason"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setConfirmAction(null); setBlacklistReason(''); }}>Cancel</Button>
                <Button onClick={handleConfirm} loading={acting}
                  className={confirmAction.type.includes('un') ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                  {confirmAction.type.includes('un') ? 'Confirm Unblacklist' : confirmAction.type === 'delete-course' ? 'Delete Permanently' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
