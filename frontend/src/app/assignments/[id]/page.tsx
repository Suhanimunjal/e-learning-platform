'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { usePlugins } from '@/contexts/PluginContext';
import api from '@/lib/api';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Users,
  Shield,
  Award,
  CheckSquare,
  FileCheck,
  Sparkles,
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxPoints: number;
  allowFileUpload: boolean;
  allowedFileTypes?: string;
  submissions?: {
    id: string;
    submittedAt: string;
    fileUrl?: string;
    textContent?: string;
    grade?: number;
    feedback?: string;
    gradedAt?: string;
  };
}

export default function AssignmentPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPeerReviewInfo, setShowPeerReviewInfo] = useState(false);
  
  const { isPluginEnabled } = usePlugins();
  const hasAdvancedAssignments = isPluginEnabled('advanced-assignments');
  const hasPeerAssessment = isPluginEnabled('peer-assessment');
  const hasBadges = isPluginEnabled('badges-certificates');

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/assignments/${assignmentId}`);
        const data = response.data;
        setAssignment(data);
        
        if (data.submissions) {
          setSubmitted(true);
          setTextContent(data.submissions.textContent || '');
        }
      } catch (err) {
        console.error('Failed to fetch assignment:', err);
        setError('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignment();
  }, [assignmentId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    if (assignment.allowFileUpload && !selectedFile && !textContent.trim()) {
      alert('Please upload a file or enter text content');
      return;
    }

    setUploading(true);
    
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploading(false);
    setSubmitted(true);
    setAssignment({
      ...assignment,
      submissions: {
        id: 'sub-1',
        submittedAt: new Date().toISOString(),
        fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
        textContent,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilDue = () => {
    if (!assignment) return 0;
    const due = new Date(assignment.dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading assignment...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Assignment not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const submission = assignment.submissions;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                {submission ? (
                  <Badge variant="success">Submitted</Badge>
                ) : isOverdue ? (
                  <Badge variant="danger">Overdue</Badge>
                ) : daysUntilDue <= 2 ? (
                  <Badge variant="warning">Due Soon</Badge>
                ) : (
                  <Badge variant="info">Active</Badge>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {isOverdue
                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                    : `Due in ${daysUntilDue} days`}
                </span>
                <span>{formatDate(assignment.dueDate)}</span>
                <span>{assignment.maxPoints} points</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreviewModal(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Instructions</h2>
          <div className="prose max-w-none text-gray-600">
            {assignment.description?.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return (
                  <h3 key={i} className="mt-6 mb-3 text-xl font-semibold text-gray-800">
                    {line.replace('## ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={i} className="ml-4">
                    {line.replace('- ', '')}
                  </li>
                );
              }
              if (line.match(/^\d+\./)) {
                return (
                  <li key={i} className="ml-4">
                    {line.replace(/^\d+\.\s*/, '')}
                  </li>
                );
              }
              if (line.trim()) {
                return (
                  <p key={i} className="my-2">
                    {line}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Submission Area */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {submitted ? 'Your Submission' : 'Submit Your Work'}
          </h2>

          {submitted && submission ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Submitted successfully!</p>
                  <p className="text-sm text-green-600">
                    Submitted on {formatDate(submission.submittedAt)}
                  </p>
                </div>
              </div>

              {submission.grade !== undefined && (
                <div className="rounded-lg bg-indigo-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Your Grade</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {submission.grade}/{assignment.maxPoints}
                      </p>
                    </div>
                    <Badge
                      variant={submission.grade >= assignment.maxPoints * 0.7 ? 'success' : 'warning'}
                    >
                      {submission.grade >= assignment.maxPoints * 0.7 ? 'Passed' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  {submission.feedback && (
                    <div className="mt-4 border-t border-indigo-200 pt-4">
                      <p className="text-sm font-medium text-gray-700">Instructor Feedback:</p>
                      <p className="mt-1 text-sm text-gray-600">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {hasPeerAssessment && (
                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-800">Peer Review Available</p>
                      <p className="text-sm text-purple-600">
                        After grading, you may be asked to review peer submissions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hasBadges && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">Earn a Badge!</p>
                      <p className="text-sm text-amber-600">
                        Complete this assignment to earn the course completion badge.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submission.fileUrl && (
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">Submitted File</p>
                    <p className="text-sm text-gray-500">
                      {selectedFile?.name || 'assignment.zip'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}

              {submission.textContent && (
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Text Submission:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {submission.textContent}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {assignment.allowFileUpload && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Upload File
                    {assignment.allowedFileTypes && (
                      <span className="ml-2 font-normal text-gray-500">
                        (Allowed: {assignment.allowedFileTypes})
                      </span>
                    )}
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept={assignment.allowedFileTypes}
                      className="absolute inset-0 w-full cursor-pointer opacity-0"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-10 w-10 text-indigo-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Drag and drop your file here, or{' '}
                          <span className="font-medium text-indigo-600">browse</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum file size: 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Or paste your text content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Paste your code or text content here..."
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Make sure to save your work before submitting.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    uploading ||
                    (!selectedFile && !textContent.trim()) ||
                    isOverdue
                  }
                  loading={uploading}
                >
                  {uploading ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Plugin-Enabled Features */}
        {(hasAdvancedAssignments || hasPeerAssessment || hasBadges) && (
          <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border border-indigo-100">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-900">
              <Sparkles className="h-4 w-4" />
              Enhanced Features (Plugins Active)
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {hasAdvancedAssignments && (
                <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Advanced Assignments</p>
                    <p className="mt-1 text-xs text-gray-500">Rubrics, plagiarism check & bulk submissions enabled</p>
                  </div>
                </div>
              )}
              {hasPeerAssessment && (
                <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Peer Assessment</p>
                    <p className="mt-1 text-xs text-gray-500">Review and be reviewed by peers</p>
                  </div>
                </div>
              )}
              {hasBadges && (
                <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Badges & Certificates</p>
                    <p className="mt-1 text-xs text-gray-500">Earn badges on completion</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <AlertCircle className="h-4 w-4" />
            Submission Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• You can submit multiple times before the deadline</li>
            <li>• Only your last submission will be graded</li>
            <li>• Make sure your file format is correct</li>
            <li>• Double-check your submission before clicking submit</li>
          </ul>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Assignment Preview"
        size="xl"
      >
        <div className="prose max-w-none">
          {assignment.description?.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h3 key={i} className="mt-6 mb-3 text-xl font-semibold text-gray-800">
                  {line.replace('## ', '')}
                </h3>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <li key={i} className="ml-4">
                  {line.replace('- ', '')}
                </li>
              );
            }
            if (line.match(/^\d+\./)) {
              return (
                <li key={i} className="ml-4">
                  {line.replace(/^\d+\.\s*/, '')}
                </li>
              );
            }
            if (line.trim()) {
              return (
                <p key={i} className="my-2">
                  {line}
                </p>
              );
            }
            return null;
          })}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
