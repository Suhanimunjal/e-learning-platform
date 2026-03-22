'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  User,
  Clock,
  FileText,
  ThumbsUp,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface Submission {
  id: string;
  studentName: string;
  studentAvatar?: string;
  type: 'essay' | 'mcq' | 'assignment';
  assignmentTitle: string;
  submittedAt: string;
  status: 'pending' | 'grading' | 'graded';
  aiScore?: number;
  aiConfidence?: number;
  aiFeedback?: string;
  teacherScore?: number;
  teacherOverride?: boolean;
}

interface GradingPreviewProps {
  submission?: Submission;
  onGrade?: (submissionId: string, overrideScore: number, feedback: string) => void;
  onApprove?: (submissionId: string) => void;
}

export default function GradingPreview({ submission: propSubmission, onGrade, onApprove }: GradingPreviewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(propSubmission ? [propSubmission] : []);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(propSubmission || null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideScore, setOverrideScore] = useState<number>(0);
  const [overrideFeedback, setOverrideFeedback] = useState<string>('');
  const [gradingInProgress, setGradingInProgress] = useState<string | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  const handleGradeSubmission = async (submissionId: string) => {
    setGradingInProgress(submissionId);
    
    try {
      const response = await api.post(`/ai/grade/${submissionId}`);
      const data = response.data?.data || response.data;
      
      setSubmissions(prev => prev.map(s => 
        s.id === submissionId 
          ? { 
              ...s, 
              status: 'graded', 
              aiScore: data.aiScore || data.grade,
              aiConfidence: data.aiConfidence,
              aiFeedback: data.feedback 
            }
          : s
      ));
      
      const updated = submissions.find(s => s.id === submissionId);
      if (updated) {
        setSelectedSubmission({ 
          ...updated, 
          status: 'graded', 
          aiScore: data.aiScore || data.grade,
          aiConfidence: data.aiConfidence,
          aiFeedback: data.feedback 
        });
      }
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setGradingInProgress(null);
    }
  };

  const handleOverrideGrade = () => {
    if (selectedSubmission && onGrade) {
      onGrade(selectedSubmission.id, overrideScore, overrideFeedback);
    }
    setShowOverrideModal(false);
    if (selectedSubmission) {
      setSubmissions(prev => prev.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, teacherOverride: true, teacherScore: overrideScore }
          : s
      ));
    }
  };

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'grading':
        return <Badge variant="info">Grading...</Badge>;
      case 'graded':
        return <Badge variant="success">Graded</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submissions List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Submissions</h3>
            <span className="text-sm text-gray-500">{submissions.length} total</span>
          </div>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {submissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSubmission?.id === submission.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{submission.studentName}</div>
                    <div className="text-xs text-gray-500 truncate">{submission.assignmentTitle}</div>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
                {submission.aiScore !== undefined && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-lg font-bold ${getScoreColor(submission.aiScore)}`}>
                      {submission.aiScore}%
                    </span>
                    <span className={`text-xs ${getConfidenceColor(submission.aiConfidence)}`}>
                      {submission.aiConfidence}% confidence
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{gradedCount}</div>
              <div className="text-xs text-gray-500">Graded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Details */}
      <div className="lg:col-span-2">
        {selectedSubmission ? (
          <div className="bg-white rounded-lg border p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-7 w-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedSubmission.studentName}</h3>
                  <p className="text-gray-500">{selectedSubmission.assignmentTitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {getStatusBadge(selectedSubmission.status)}
            </div>

            {/* AI Grading Results */}
            {selectedSubmission.status === 'graded' && (
              <div className="space-y-6">
                {/* Score Card */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5" />
                      AI Grading Result
                    </h4>
                    {selectedSubmission.teacherOverride && (
                      <Badge variant="info">Teacher Override</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {selectedSubmission.teacherOverride ? 'Final Score' : 'AI Score'}
                      </div>
                      <div className={`text-4xl font-bold ${getScoreColor(selectedSubmission.teacherOverride ? selectedSubmission.teacherScore : selectedSubmission.aiScore)}`}>
                        {selectedSubmission.teacherOverride ? selectedSubmission.teacherScore : selectedSubmission.aiScore}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Confidence</div>
                      <div className={`text-4xl font-bold ${getConfidenceColor(selectedSubmission.aiConfidence)}`}>
                        {selectedSubmission.aiConfidence}%
                      </div>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Low Confidence</span>
                      <span>High Confidence</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (selectedSubmission.aiConfidence || 0) >= 90 ? 'bg-green-500' :
                          (selectedSubmission.aiConfidence || 0) >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedSubmission.aiConfidence || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Feedback */}
                {selectedSubmission.aiFeedback && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">AI Feedback</h4>
                      <button
                        onClick={() => setExpandedFeedback(expandedFeedback === selectedSubmission.id ? null : selectedSubmission.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        {expandedFeedback === selectedSubmission.id ? (
                          <>Hide <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>Show more <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {expandedFeedback === selectedSubmission.id 
                        ? selectedSubmission.aiFeedback
                        : selectedSubmission.aiFeedback.slice(0, 150) + (selectedSubmission.aiFeedback.length > 150 ? '...' : '')}
                    </p>
                  </div>
                )}

                {/* Override Section */}
                {selectedSubmission.teacherOverride ? (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Edit3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Grade Overridden</div>
                      <div className="text-sm text-blue-700">
                        Original AI Score: {selectedSubmission.aiScore}% → Final Score: {selectedSubmission.teacherScore}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setOverrideScore(selectedSubmission.aiScore || 0);
                      setOverrideFeedback(selectedSubmission.aiFeedback || '');
                      setShowOverrideModal(true);
                    }}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Override Grade
                    </Button>
                    <Button className="flex-1" onClick={() => onApprove?.(selectedSubmission.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Pending State */}
            {selectedSubmission.status === 'pending' && (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Awaiting AI Grading</h4>
                <p className="text-gray-500 mb-6">
                  This submission is waiting to be graded by AI. Click below to start the grading process.
                </p>
                <Button 
                  onClick={() => handleGradeSubmission(selectedSubmission.id)}
                  disabled={gradingInProgress === selectedSubmission.id}
                >
                  {gradingInProgress === selectedSubmission.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Grading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start AI Grading
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Grading in Progress */}
            {selectedSubmission.status === 'grading' && (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">AI is Grading...</h4>
                <p className="text-gray-500">
                  Analyzing the submission. This usually takes a few seconds.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Submission</h4>
            <p className="text-gray-500">
              Choose a submission from the list to view grading details
            </p>
          </div>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Override AI Grade</h3>
              <button onClick={() => setShowOverrideModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Suggested Score: {selectedSubmission.aiScore}%
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (optional)
                </label>
                <textarea
                  value={overrideFeedback}
                  onChange={(e) => setOverrideFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add your feedback for the student..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
              <Button variant="outline" className="flex-1" onClick={() => setShowOverrideModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleOverrideGrade}>
                <Save className="mr-2 h-4 w-4" />
                Save Override
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper for sparkles icon
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
