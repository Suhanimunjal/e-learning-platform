'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { apiBaseUrl } from '@/lib/runtime-config';
import { CreditCard, Loader2, Check, X } from 'lucide-react';

interface Subscription {
  id: string;
  user: { name: string; email: string };
  plan: { name: string; price: number };
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadSubscriptions();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading subscriptions...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          </div>
          <Badge variant="info">{subscriptions.length} subscriptions</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Active Subscriptions</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {subscriptions.filter(s => s.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              ₹{subscriptions.reduce((acc, s) => acc + (s.plan?.price || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {subscriptions.filter(s => s.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Auto-Renew</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{sub.user?.name}</p>
                        <p className="text-sm text-gray-500">{sub.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{sub.plan?.name}</p>
                        <p className="text-sm text-gray-500">₹{sub.plan?.price}/month</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'CANCELLED' ? 'danger' : 'warning'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {sub.autoRenew ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSubscription(sub.id)}
                          disabled={sub.status !== 'ACTIVE'}
                        >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
