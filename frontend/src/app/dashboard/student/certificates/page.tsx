'use client';

import { useEffect, useState } from 'react';
import { Award, Download, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import { StudentCertificate, student } from '@/lib/api';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await student.getCertificates();
        setCertificates(data);
      } catch {
        setError('Failed to load certificates.');
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  const downloadCertificate = async (certificateId: string) => {
    try {
      const { downloadUrl } = await student.getCertificateDownload(certificateId);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Failed to download certificate.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading certificates...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>

        {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        {certificates.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No certificates yet</h3>
            <p className="mt-2 text-gray-500">Complete a course to earn your first certificate.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{cert.course.title}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="success">Verified</Badge>
                      <span className="text-sm text-gray-500">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadCertificate(cert.id)}
                      className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
