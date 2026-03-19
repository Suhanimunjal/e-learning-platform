'use client';

import { useState } from 'react';
import { 
  FileText,
  User,
  Clock,
  CheckCircle,
  Loader2,
  Search,
  ChevronRight,
  CheckSquare
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface SubmissionListProps {
  submissions: any[];
  selectedSubmission: any | null;
  onSelect: (submission: any) => void;
  onGradeAll?: () => void;
  loading?: boolean;
}

export default function SubmissionList({ 
  submissions, 
  selectedSubmission,
  onSelect,
  onGradeAll,
  loading = false 
}: SubmissionListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubmissions = submissions.filter((sub: any) => {
    const matchesFilter = filter === 'all' || sub.status === filter || (filter === 'pending' && sub.status === 'pending');
    const matchesSearch = !searchQuery || 
      sub.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.quizTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = submissions.filter((s: any) => s.status === 'pending' || s.status === 'grading').length;
  const gradedCount = submissions.filter((s: any) => s.status === 'graded' || s.status === 'reviewed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'grading':
        return <Badge variant="info">Grading</Badge>;
      case 'graded':
        return <Badge variant="success">Graded</Badge>;
      case 'reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Student Submissions</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-600 font-medium">{pendingCount} pending</span>
            <span className="text-gray-300">•</span>
            <span className="text-green-600 font-medium">{gradedCount} graded</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student or quiz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'pending', 'graded'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submission List */}
      <div className="divide-y max-h-[500px] overflow-y-auto">
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission: any) => (
            <button
              key={submission.id}
              onClick={() => onSelect(submission)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                selectedSubmission?.id === submission.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {submission.studentName}
                    </span>
                    {getStatusBadge(submission.status)}
                  </div>
                  
                  <div className="text-sm text-gray-500 truncate mb-1">
                    {submission.quizTitle}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {submission.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(submission.submittedAt)}
                    </span>
                    {submission.avgScore !== undefined && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Avg: {submission.avgScore}%
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bulk Actions */}
      {pendingCount > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <Button onClick={onGradeAll} className="w-full">
            <CheckSquare className="h-4 w-4 mr-2" />
            Grade All Pending ({pendingCount})
          </Button>
        </div>
      )}
    </div>
  );
}
