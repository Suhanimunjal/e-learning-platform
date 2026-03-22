'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { admin } from '@/lib/api';
import {
  Users,
  Loader2,
  GraduationCap,
  BookOpen,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Building,
  Hash,
  Clock,
  Eye,
  Ban,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rollNo: string | null;
  year: string | null;
  branch: string | null;
  course: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string } | null;
  _count: { enrollments: number };
}

interface TeacherData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string } | null;
  _count: { coursesCreated: number };
}

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rollNo: string | null;
  year: string | null;
  branch: string | null;
  course: string | null;
  role: string;
  status: string;
  rejectionReason: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string } | null;
  enrollments: Array<{
    id: string;
    accessStatus: string;
    createdAt: string;
    course: { id: string; title: string; status: string; price: number };
  }>;
}

interface TeacherDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  rejectionReason: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string } | null;
  coursesCreated: Array<{
    id: string;
    title: string;
    status: string;
    price: number;
    createdAt: string;
    _count: { sections: number };
  }>;
}

interface BlacklistedUserData {
  id: string;
  originalUserId: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  rollNo: string | null;
  year: string | null;
  branch: string | null;
  course: string | null;
  reason: string;
  blacklistedAt: string;
  organizationId: string | null;
}

type Tab = 'students' | 'teachers' | 'blacklisted';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [blacklistedUsers, setBlacklistedUsers] = useState<BlacklistedUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentFilter, setStudentFilter] = useState<string>('');

  // Detail modal state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetail | null>(null);
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<TeacherDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'blacklist-student' | 'unblacklist-student' | 'blacklist-teacher' | 'unblacklist-teacher' | 'blacklist-course' | 'unblacklist-course' | 'delete-course' | 'cleanup' | 'revert-blacklist';
    id: string;
    name: string;
  } | null>(null);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, studentFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'students') {
        const data = await admin.getStudents(studentFilter || undefined);
        setStudents(data);
      } else if (activeTab === 'teachers') {
        const data = await admin.getTeachers();
        setTeachers(data);
      } else if (activeTab === 'blacklisted') {
        const data = await admin.getBlacklistedUsers();
        setBlacklistedUsers(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student: StudentData) => {
    setLoadingDetail(true);
    try {
      const detail = await admin.getStudentById(student.id);
      setSelectedStudentDetail(detail);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleTeacherClick = async (teacher: TeacherData) => {
    setLoadingDetail(true);
    try {
      const detail = await admin.getTeacherById(teacher.id);
      setSelectedTeacherDetail(detail);
    } catch (err) {
      console.error('Failed to load teacher detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActing(true);
    try {
      switch (confirmAction.type) {
        case 'blacklist-student':
          await admin.blacklistUser(confirmAction.id, blacklistReason || 'Blacklisted by admin');
          break;
        case 'unblacklist-student':
          await admin.unblacklistUser(confirmAction.id);
          break;
        case 'blacklist-teacher':
          const tRes = await admin.blacklistUser(confirmAction.id, blacklistReason || 'Blacklisted by admin');
          if (tRes.blacklistedCourses > 0) {
            alert(`Teacher blacklisted. ${tRes.blacklistedCourses} course(s) also blacklisted.`);
          }
          break;
        case 'unblacklist-teacher':
          const uRes = await admin.unblacklistUser(confirmAction.id);
          if (uRes.restoredCourses > 0) {
            alert(`Teacher restored. ${uRes.restoredCourses} course(s) also restored.`);
          }
          break;
        case 'blacklist-course':
          await admin.blacklistCourse(confirmAction.id, blacklistReason || 'Blacklisted by admin');
          break;
        case 'unblacklist-course':
          await admin.unblacklistCourse(confirmAction.id);
          break;
        case 'delete-course':
          await admin.deleteCourse(confirmAction.id);
          break;
        case 'cleanup':
          const cRes = await admin.cleanupAllRejected();
          alert(cRes.message || 'Cleanup done');
          break;
        case 'revert-blacklist':
          const rRes = await admin.revertBlacklist(confirmAction.id);
          if (rRes.success) {
            if (rRes.restoredCourses > 0) {
              alert(`User restored. ${rRes.restoredCourses} course(s) also restored.`);
            }
          } else {
            alert(rRes.message || 'Failed to revert blacklist');
          }
          break;
      }
      setConfirmAction(null);
      setBlacklistReason('');
      setSelectedStudentDetail(null);
      setSelectedTeacherDetail(null);
      loadData();
    } catch (err: any) {
      console.error('Action failed:', err);
      alert('Action failed: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setActing(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING_APPROVAL': return 'warning';
      case 'REJECTED': return 'danger';
      case 'BLACKLISTED': return 'danger';
      default: return 'default';
    }
  };

  const studentColumns = [
    {
      key: 'name',
      label: 'Student',
      render: (s: StudentData) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
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
      render: (s: StudentData) => <span className="text-gray-700">{s.phone || '-'}</span>,
    },
    {
      key: 'rollNo',
      label: 'Roll No',
      render: (s: StudentData) => <span className="text-gray-700">{s.rollNo || '-'}</span>,
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (s: StudentData) => <span className="text-gray-700">{s.branch || '-'}</span>,
    },
    {
      key: 'year',
      label: 'Year',
      render: (s: StudentData) => <span className="text-gray-700">{s.year || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: StudentData) => <Badge variant={getStatusBadgeVariant(s.status) as any}>{s.status}</Badge>,
    },
    {
      key: 'enrollments',
      label: 'Enrollments',
      render: (s: StudentData) => s._count?.enrollments || 0,
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (s: StudentData) => new Date(s.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (s: StudentData) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleStudentClick(s); }}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title="View details"
          >
            <Eye size={16} />
          </button>
          {s.status === 'BLACKLISTED' ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'unblacklist-student', id: s.id, name: s.name }); }}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
              title="Unblacklist"
            >
              <ShieldCheck size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'blacklist-student', id: s.id, name: s.name }); }}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title="Blacklist"
            >
              <Ban size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const teacherColumns = [
    {
      key: 'name',
      label: 'Teacher',
      render: (t: TeacherData) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-medium">
            {t.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{t.name}</p>
            <p className="text-sm text-gray-500">{t.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (t: TeacherData) => <span className="text-gray-700">{t.phone || '-'}</span>,
    },
    {
      key: 'organization',
      label: 'Organization',
      render: (t: TeacherData) => <span className="text-gray-700">{t.organization?.name || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (t: TeacherData) => <Badge variant={getStatusBadgeVariant(t.status) as any}>{t.status}</Badge>,
    },
    {
      key: 'courses',
      label: 'Courses',
      render: (t: TeacherData) => t._count?.coursesCreated || 0,
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (t: TeacherData) => new Date(t.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (t: TeacherData) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleTeacherClick(t); }}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title="View details"
          >
            <Eye size={16} />
          </button>
          {t.status === 'BLACKLISTED' ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'unblacklist-teacher', id: t.id, name: t.name }); }}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
              title="Unblacklist (also restores courses)"
            >
              <ShieldCheck size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'blacklist-teacher', id: t.id, name: t.name }); }}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title="Blacklist (also blacklists all courses)"
            >
              <Ban size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const blacklistedColumns = [
    {
      key: 'name',
      label: 'User',
      render: (b: BlacklistedUserData) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-medium">
            {b.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{b.name}</p>
            <p className="text-sm text-gray-500">{b.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (b: BlacklistedUserData) => <Badge variant="default">{b.role}</Badge>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (b: BlacklistedUserData) => <span className="text-gray-700">{b.phone || '-'}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (b: BlacklistedUserData) => <span className="text-sm text-red-600">{b.reason}</span>,
    },
    {
      key: 'blacklistedAt',
      label: 'Blacklisted On',
      render: (b: BlacklistedUserData) => new Date(b.blacklistedAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (b: BlacklistedUserData) => (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'revert-blacklist', id: b.id, name: b.name }); }}
          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
          title="Revert blacklist (restore user)"
        >
          <RotateCcw size={16} />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction({ type: 'cleanup', id: '', name: 'all rejected entries' })}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Clean Rejected
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(['students', 'teachers', 'blacklisted'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'students' ? <GraduationCap size={18} /> : tab === 'teachers' ? <BookOpen size={18} /> : <Ban size={18} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <Badge variant={tab === 'blacklisted' ? 'danger' : 'info'}>{tab === 'students' ? students.length : tab === 'teachers' ? teachers.length || '...' : blacklistedUsers.length}</Badge>
            </button>
          ))}
        </div>

        {/* Student filter */}
        {activeTab === 'students' && (
          <div className="flex gap-2">
            {['', 'ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'BLACKLISTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStudentFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  studentFilter === status
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {activeTab === 'students' ? (
            <DataTable data={students} columns={studentColumns} />
          ) : activeTab === 'teachers' ? (
            <DataTable data={teachers} columns={teacherColumns} />
          ) : (
            <DataTable data={blacklistedUsers} columns={blacklistedColumns} />
          )}
        </div>

        {/* Student Detail Modal */}
        <Modal
          isOpen={!!selectedStudentDetail}
          onClose={() => setSelectedStudentDetail(null)}
          title={selectedStudentDetail ? `Student: ${selectedStudentDetail.name}` : ''}
          size="lg"
        >
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : selectedStudentDetail ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Mail size={16} />} label="Email" value={selectedStudentDetail.email} />
                  <InfoRow icon={<Phone size={16} />} label="Phone" value={selectedStudentDetail.phone} />
                  <InfoRow icon={<Hash size={16} />} label="Roll No" value={selectedStudentDetail.rollNo} />
                  <InfoRow icon={<GraduationCap size={16} />} label="Year" value={selectedStudentDetail.year} />
                  <InfoRow icon={<Building size={16} />} label="Branch" value={selectedStudentDetail.branch} />
                  <InfoRow icon={<BookOpen size={16} />} label="Course" value={selectedStudentDetail.course} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedStudentDetail.status) as any}>{selectedStudentDetail.status}</Badge>
                  </div>
                  <InfoRow icon={<Building size={16} />} label="Organization" value={selectedStudentDetail.organization?.name} />
                  <InfoRow icon={<Calendar size={16} />} label="Joined" value={new Date(selectedStudentDetail.createdAt).toLocaleString()} />
                  <InfoRow icon={<Clock size={16} />} label="Last Updated" value={new Date(selectedStudentDetail.updatedAt).toLocaleString()} />
                  {selectedStudentDetail.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Rejection / Blacklist Reason</p>
                      <p className="text-sm text-red-600">{selectedStudentDetail.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {selectedStudentDetail.status === 'BLACKLISTED' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction({ type: 'unblacklist-student', id: selectedStudentDetail.id, name: selectedStudentDetail.name })}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <ShieldCheck size={14} className="mr-1" /> Unblacklist
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction({ type: 'blacklist-student', id: selectedStudentDetail.id, name: selectedStudentDetail.name })}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Ban size={14} className="mr-1" /> Blacklist
                  </Button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Enrollments ({selectedStudentDetail.enrollments?.length || 0})
                </h4>
                {selectedStudentDetail.enrollments?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudentDetail.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{enrollment.course.title}</p>
                          <p className="text-xs text-gray-500">Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={enrollment.accessStatus === 'APPROVED' ? 'success' : enrollment.accessStatus === 'PENDING' ? 'warning' : 'danger'}>
                          {enrollment.accessStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No enrollments</p>
                )}
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Teacher Detail Modal */}
        <Modal
          isOpen={!!selectedTeacherDetail}
          onClose={() => setSelectedTeacherDetail(null)}
          title={selectedTeacherDetail ? `Teacher: ${selectedTeacherDetail.name}` : ''}
          size="lg"
        >
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : selectedTeacherDetail ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Mail size={16} />} label="Email" value={selectedTeacherDetail.email} />
                  <InfoRow icon={<Phone size={16} />} label="Phone" value={selectedTeacherDetail.phone} />
                  <InfoRow icon={<Building size={16} />} label="Organization" value={selectedTeacherDetail.organization?.name} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedTeacherDetail.status) as any}>{selectedTeacherDetail.status}</Badge>
                  </div>
                  <InfoRow icon={<Calendar size={16} />} label="Joined" value={new Date(selectedTeacherDetail.createdAt).toLocaleString()} />
                  <InfoRow icon={<Clock size={16} />} label="Last Updated" value={new Date(selectedTeacherDetail.updatedAt).toLocaleString()} />
                  {selectedTeacherDetail.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Rejection / Blacklist Reason</p>
                      <p className="text-sm text-red-600">{selectedTeacherDetail.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {selectedTeacherDetail.status === 'BLACKLISTED' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction({ type: 'unblacklist-teacher', id: selectedTeacherDetail.id, name: selectedTeacherDetail.name })}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <ShieldCheck size={14} className="mr-1" /> Unblacklist (restores courses too)
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction({ type: 'blacklist-teacher', id: selectedTeacherDetail.id, name: selectedTeacherDetail.name })}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Ban size={14} className="mr-1" /> Blacklist (blacklists all courses)
                  </Button>
                )}
              </div>

              {/* Courses with per-course blacklist/delete */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Courses ({selectedTeacherDetail.coursesCreated?.length || 0})
                </h4>
                {selectedTeacherDetail.coursesCreated?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeacherDetail.coursesCreated.map((course) => (
                      <div key={course.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-xs text-gray-500">
                            {course._count.sections} sections | Created: {new Date(course.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant={course.status === 'APPROVED' ? 'success' : course.status === 'PENDING_APPROVAL' ? 'warning' : course.status === 'BLACKLISTED' ? 'danger' : 'default'}>
                            {course.status}
                          </Badge>
                          {course.status === 'BLACKLISTED' ? (
                            <button
                              onClick={() => setConfirmAction({ type: 'unblacklist-course', id: course.id, name: course.title })}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Unblacklist course"
                            >
                              <ShieldCheck size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmAction({ type: 'blacklist-course', id: course.id, name: course.title })}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="Blacklist course"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmAction({ type: 'delete-course', id: course.id, name: course.title })}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete course permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No courses created</p>
                )}
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Confirm Action Modal */}
        <Modal
          isOpen={!!confirmAction}
          onClose={() => { setConfirmAction(null); setBlacklistReason(''); }}
          title={
            confirmAction?.type.includes('blacklist') && !confirmAction.type.includes('un')
              ? `Blacklist ${confirmAction?.name}`
              : confirmAction?.type.includes('unblacklist')
              ? `Unblacklist ${confirmAction?.name}`
              : confirmAction?.type === 'delete-course'
              ? `Delete Course: ${confirmAction?.name}`
              : 'Confirm Action'
          }
        >
          {confirmAction && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-red-700">
                  {confirmAction.type === 'blacklist-student' && <p>This student will be blocked from logging in.</p>}
                  {confirmAction.type === 'blacklist-teacher' && (
                    <p>This teacher will be blocked and <strong>all their courses will also be blacklisted</strong>.</p>
                  )}
                  {confirmAction.type === 'unblacklist-student' && <p>This student will be able to log in again.</p>}
                  {confirmAction.type === 'unblacklist-teacher' && (
                    <p>This teacher will be restored and <strong>their courses will also be restored</strong>.</p>
                  )}
                  {confirmAction.type === 'blacklist-course' && <p>This course will be hidden from students.</p>}
                  {confirmAction.type === 'unblacklist-course' && <p>This course will be visible again.</p>}
                  {confirmAction.type === 'delete-course' && (
                    <p>This will <strong>permanently delete</strong> the course and all its sections, modules, quizzes, enrollments, and progress data. This cannot be undone.</p>
                  )}
                  {confirmAction.type === 'cleanup' && (
                    <p>This will permanently delete all rejected students, teachers, and courses.</p>
                  )}
                </div>
              </div>

              {confirmAction.type.includes('blacklist') && !confirmAction.type.includes('un') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={blacklistReason}
                    onChange={(e) => setBlacklistReason(e.target.value)}
                    placeholder="Enter reason for blacklisting"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setConfirmAction(null); setBlacklistReason(''); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  loading={acting}
                  className={
                    confirmAction.type.includes('unblacklist')
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  {confirmAction.type.includes('unblacklist') ? 'Confirm Unblacklist' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500 flex items-center gap-1">{icon} {label}</p>
      <p className="text-sm text-gray-900">{value || <span className="text-gray-400 italic">Not provided</span>}</p>
    </div>
  );
}
