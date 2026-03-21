'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { Loader2, Users } from 'lucide-react';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStudents([
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com', course: 'Python', progress: 75 },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com', course: 'JavaScript', progress: 45 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'course', label: 'Course' },
    {
      key: 'progress',
      label: 'Progress',
      render: (student: any) => (
        <div className="flex items-center gap-2">
          <div className="w-24 rounded-full bg-gray-200 h-2">
            <div
              className="h-2 rounded-full bg-indigo-600"
              style={{ width: `${student.progress}%` }}
            />
          </div>
          <span className="text-sm">{student.progress}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (student: any) => (
        <Badge variant={student.progress === 100 ? 'success' : 'info'}>
          {student.progress === 100 ? 'Completed' : 'In Progress'}
        </Badge>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        </div>

        {students.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No students yet</h3>
            <p className="mt-2 text-gray-500">Students will appear here once they enroll in your courses.</p>
          </div>
        ) : (
          <DataTable data={students} columns={columns} />
        )}
      </div>
    </DashboardLayout>
  );
}
