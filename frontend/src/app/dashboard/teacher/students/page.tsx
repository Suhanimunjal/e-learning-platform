'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { courses as coursesApi, enrollments } from '@/lib/api';
import { Loader2, Users, Trash2, ChevronDown, ChevronUp, Mail, Phone, Hash, GraduationCap } from 'lucide-react';

interface EnrolledStudent {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    rollNo: string | null;
    year: string | null;
    branch: string | null;
    course: string | null;
  };
}

interface TeacherCourse {
  id: string;
  title: string;
  status: string;
}

export default function TeacherStudentsPage() {
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [courseStudents, setCourseStudents] = useState<Record<string, EnrolledStudent[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Remove confirmation
  const [confirmRemove, setConfirmRemove] = useState<{ enrollmentId: string; studentName: string; courseName: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allCourses = await coursesApi.getAll();
      const myCourses = (allCourses as TeacherCourse[]).filter(c => c.status === 'APPROVED');
      setTeacherCourses(myCourses);

      // Load students for each course
      const studentsMap: Record<string, EnrolledStudent[]> = {};
      await Promise.all(myCourses.map(async (course) => {
        try {
          const students = await enrollments.getCourseStudents(course.id);
          studentsMap[course.id] = students;
        } catch { studentsMap[course.id] = []; }
      }));
      setCourseStudents(studentsMap);

      // Expand first course by default
      if (myCourses.length > 0) {
        setExpandedCourses(new Set([myCourses[0].id]));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally { setLoading(false); }
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const handleRemoveStudent = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      await enrollments.removeStudent(confirmRemove.enrollmentId);
      setCourseStudents(prev => {
        const updated = { ...prev };
        for (const cid of Object.keys(updated)) {
          updated[cid] = updated[cid].filter(s => s.id !== confirmRemove.enrollmentId);
        }
        return updated;
      });
      setConfirmRemove(null);
    } catch (err: any) {
      alert('Failed to remove student: ' + (err?.response?.data?.message || err?.message));
    } finally { setRemoving(false); }
  };

  const totalStudents = Object.values(courseStudents).reduce((sum, list) => sum + list.length, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading students...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
            <p className="text-sm text-gray-500">{totalStudents} student{totalStudents !== 1 ? 's' : ''} enrolled across {teacherCourses.length} course{teacherCourses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {teacherCourses.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-2 text-gray-500">Create a course to start enrolling students.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teacherCourses.map(course => {
              const students = courseStudents[course.id] || [];
              const isExpanded = expandedCourses.has(course.id);
              return (
                <div key={course.id} className="rounded-lg bg-white shadow-sm border border-gray-200">
                  <button onClick={() => toggleCourse(course.id)}
                    className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
                      </div>
                    </div>
                    <Badge variant="info">{students.length}</Badge>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-200 px-6 py-4">
                      {students.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">No students enrolled in this course yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {students.map(enrollment => (
                            <div key={enrollment.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                                  {enrollment.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{enrollment.user.name}</p>
                                  <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {enrollment.user.phone && <span className="text-xs text-gray-400">{enrollment.user.phone}</span>}
                                    {enrollment.user.rollNo && <span className="text-xs text-gray-400">Roll: {enrollment.user.rollNo}</span>}
                                    {enrollment.user.year && <span className="text-xs text-gray-400">{enrollment.user.year}</span>}
                                    {enrollment.user.branch && <span className="text-xs text-gray-400">{enrollment.user.branch}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  Joined {new Date(enrollment.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => setConfirmRemove({ enrollmentId: enrollment.id, studentName: enrollment.user.name, courseName: course.title })}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  title="Remove student from course"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Remove Confirmation Modal */}
        <Modal isOpen={!!confirmRemove} onClose={() => setConfirmRemove(null)} title="Remove Student">
          {confirmRemove && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to remove <strong>{confirmRemove.studentName}</strong> from <strong>{confirmRemove.courseName}</strong>?
              </p>
              <p className="text-sm text-gray-500">They will lose access to all course materials.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
                <Button onClick={handleRemoveStudent} loading={removing} className="bg-red-600 hover:bg-red-700 text-white">
                  <Trash2 className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
