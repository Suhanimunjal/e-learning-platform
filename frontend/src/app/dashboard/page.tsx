'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (user.role === 'TEACHER') {
        router.push('/dashboard/teacher');
      } else {
        router.push('/dashboard/student');
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  );
}
