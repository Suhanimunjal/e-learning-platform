'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Loader2, Shield } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    enrollments: number;
  };
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      setShowRoleModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (user: UserData) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: UserData) => (
        <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'TEACHER' ? 'warning' : 'info'}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'enrollments',
      label: 'Enrollments',
      render: (user: UserData) => user._count?.enrollments || 0,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (user: UserData) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: UserData) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedUser(user);
            setShowRoleModal(true);
          }}
        >
          <Shield className="mr-1 h-4 w-4" />
          Change Role
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <Badge variant="info">{users.length} users</Badge>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <DataTable data={users} columns={columns} />
        </div>

        <Modal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          title={`Change Role for ${selectedUser?.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select a new role for this user:</p>
            {['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'].map((role) => (
              <button
                key={role}
                onClick={() => selectedUser && handleRoleChange(selectedUser.id, role)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedUser?.role === role
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-medium">{role}</p>
                <p className="text-sm text-gray-500">
                  {role === 'ADMIN' && 'Full system access'}
                  {role === 'MANAGER' && 'Organization management'}
                  {role === 'TEACHER' && 'Course creation and grading'}
                  {role === 'STUDENT' && 'Learning access'}
                </p>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
