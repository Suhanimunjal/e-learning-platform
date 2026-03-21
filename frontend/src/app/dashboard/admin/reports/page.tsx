'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';

const reportTypes = [
  {
    id: 'enrollment',
    name: 'Enrollment Report',
    description: 'Complete overview of course enrollments, completion rates, and student progress',
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Detailed breakdown of all revenue streams, transactions, and financial metrics',
  },
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'User engagement metrics, login patterns, and platform usage statistics',
  },
  {
    id: 'course-performance',
    name: 'Course Performance Report',
    description: 'Individual course metrics including ratings, feedback, and student outcomes',
  },
  {
    id: 'subscription',
    name: 'Subscription Report',
    description: 'Subscription status, churn analysis, and renewal projections',
  },
  {
    id: 'audit',
    name: 'Audit Log Report',
    description: 'System-wide activity logs for compliance and security auditing',
  },
];

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateReport = async (reportId: string) => {
    setGenerating(reportId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {reportTypes.map((report) => (
            <div key={report.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={generating !== null}
                    >
                      {generating === report.id ? 'Generating...' : 'Generate Report'}
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900">Recent Reports</h3>
          <p className="mt-1 text-sm text-gray-500">Your recently generated reports will appear here</p>
          <div className="mt-4 text-center text-gray-500">
            No recent reports
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
