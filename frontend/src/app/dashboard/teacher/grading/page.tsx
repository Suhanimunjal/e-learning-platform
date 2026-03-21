'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CheckSquare, 
  Settings,
  Sparkles,
  Users,
  FileText,
  Clock,
  BarChart3,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Bot,
  Globe,
  ChevronUp,
  Edit3,
  Save,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { quizzes as quizzesApi, grading } from '@/lib/api';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  questionText: string;
  aiAnswer?: string;
  internetReference?: {
    title: string;
    snippet: string;
    url?: string;
  };
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  options?: string[];
  correctAnswer?: string;
}

interface StudentAnswer {
  id: string;
  studentName: string;
  studentAnswer: string;
  submittedAt: string;
}

interface GradedResult {
  id: string;
  studentAnswer?: string;
  aiAnswer?: string;
  internetReference?: {
    title: string;
    snippet: string;
    url?: string;
  };
  feedback: string;
  points: number;
  confidence?: number;
  isOverridden?: boolean;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizTitle: string;
  courseName: string;
  questionCount: number;
  questions: Question[];
  studentAnswers: StudentAnswer[];
  gradedResults?: Record<string, GradedResult>;
  submittedAt: string;
  status: 'pending' | 'grading' | 'graded' | 'reviewed';
  gradedCount?: number;
  totalQuestions?: number;
  avgScore?: number;
  score?: number;
  percentage?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
  questions: any[];
  attempts: any[];
}

type ViewMode = 'quizzes' | 'submissions' | 'grading';

export default function GradingDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('submissions');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingAttemptId, setGradingAttemptId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizzesApi.getByCourse('');
      if (Array.isArray(data)) {
        setQuizzes(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = async (quiz: Quiz) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedQuiz(quiz);
      
      const submissionsData = await grading.getSubmissions(quiz.id);
      if (submissionsData && submissionsData.submissions) {
        setSubmissions(submissionsData.submissions);
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewMode('grading');
  };

  const handleAutoGrade = async () => {
    if (!selectedSubmission) return;

    try {
      setGradingLoading(true);
      setError(null);
      setGradingAttemptId(selectedSubmission.id);

      const result = await grading.gradeQuizAttempt(selectedSubmission.id);
      
      if (result.success) {
        const updatedQuestions = selectedSubmission.questions.map(q => {
          const grade = result.grades?.[q.id];
          if (grade) {
            return {
              ...q,
              aiAnswer: q.correctAnswer,
              gradedResult: {
                id: q.id,
                feedback: grade.feedback,
                points: grade.points,
                confidence: grade.confidence,
              }
            };
          }
          return q;
        });

        setSelectedSubmission({
          ...selectedSubmission,
          questions: updatedQuestions,
          status: 'graded',
          score: result.totalScore,
          percentage: result.percentage,
        });

        if (selectedQuiz) {
          handleSelectQuiz(selectedQuiz);
        }
      }
    } catch (err: any) {
      console.error('Grading failed:', err);
      setError(err.message || 'Failed to grade submission. Please try again.');
    } finally {
      setGradingLoading(false);
      setGradingAttemptId(null);
    }
  };

  const handleGradeComplete = async (submissionId: string, results: Record<string, GradedResult>) => {
    try {
      if (!selectedQuiz) return;

      const gradesData: Record<string, { points: number; feedback: string }> = {};
      Object.entries(results).forEach(([questionId, result]) => {
        gradesData[questionId] = {
          points: result.points,
          feedback: result.feedback,
        };
      });

      await grading.saveGrades(selectedQuiz.id, submissionId, gradesData);
      handleSelectQuiz(selectedQuiz);
      setViewMode('submissions');
      setSelectedSubmission(null);
    } catch (err: any) {
      console.error('Failed to save grades:', err);
      setError(err.message || 'Failed to save grades');
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending' || s.status === 'grading').length;
  const gradedCount = submissions.filter(s => s.status === 'graded' || s.status === 'reviewed').length;
  const avgScore = gradedCount > 0 
    ? Math.round(submissions.filter(s => s.percentage).reduce((sum, s) => sum + (s.percentage || 0), 0) / gradedCount)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Grading Dashboard</h1>
              <p className="text-sm text-gray-500">Grade quizzes with AI assistance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/teacher/quizzes'}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Manage Quizzes
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Graded Today', value: gradedCount, icon: CheckSquare, color: 'text-green-600 bg-green-50' },
            { label: 'Avg Score', value: avgScore > 0 ? `${avgScore}%` : '--', icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Quizzes', value: quizzes.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex gap-1">
            <button
              onClick={() => setViewMode('submissions')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                viewMode === 'submissions' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Submissions
              {viewMode === 'submissions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/teacher/quizzes'}
              className="px-4 py-3 font-medium text-gray-500 hover:text-gray-700"
            >
              Manage Quizzes
            </button>
            {selectedSubmission && viewMode === 'grading' && (
              <button
                onClick={() => setViewMode('grading')}
                className="px-4 py-3 font-medium transition-colors relative text-indigo-600"
              >
                Grading: {selectedSubmission.studentName}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {viewMode === 'submissions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quiz Selection */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Select Quiz</h3>
                {loading && quizzes.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No quizzes found. Create a quiz first.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        onClick={() => handleSelectQuiz(quiz)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50 transition-colors ${
                          selectedQuiz?.id === quiz.id ? 'border-indigo-500 bg-indigo-50' : ''
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-xs text-gray-500">
                            {quiz.questions?.length || 0} questions • {quiz.published ? 'Published' : 'Draft'}
                          </div>
                        </div>
                        <Badge variant={quiz.published ? 'success' : 'warning'}>
                          {quiz.published ? 'Published' : 'Draft'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submissions List */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Student Submissions
                  {selectedQuiz && (
                    <span className="text-gray-500 font-normal ml-2">
                      for {selectedQuiz.title}
                    </span>
                  )}
                </h3>
                
                {!selectedQuiz ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Select a quiz to view submissions</p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {submissions.map((submission) => (
                      <button
                        key={submission.id}
                        onClick={() => handleSelectSubmission(submission)}
                        className={`w-full text-left p-4 rounded-lg border hover:bg-gray-50 transition-colors ${
                          selectedSubmission?.id === submission.id ? 'border-indigo-500 bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 truncate">
                                {submission.studentName}
                              </span>
                              <Badge variant={
                                submission.status === 'pending' ? 'warning' :
                                submission.status === 'graded' ? 'success' : 'info'
                              }>
                                {submission.status === 'pending' ? 'Pending' :
                                 submission.status === 'graded' ? 'Graded' : 'Reviewing'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 truncate mb-1">
                              {submission.quizTitle}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>{submission.questionCount || submission.questions?.length || 0} questions</span>
                              {submission.percentage !== undefined && (
                                <span className="font-medium text-indigo-600">
                                  Score: {submission.percentage}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {pendingCount > 0 && selectedQuiz && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={() => submissions.length > 0 && handleSelectSubmission(submissions[0])}
                      className="w-full"
                      disabled={loading}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Grade All Pending ({pendingCount})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'grading' && selectedSubmission && (
            <GradingPanelForTeacher
              submission={selectedSubmission}
              onGradeComplete={handleGradeComplete}
              onAutoGrade={handleAutoGrade}
              gradingLoading={gradingLoading}
              gradingAttemptId={gradingAttemptId}
              onBack={() => {
                setViewMode('submissions');
                setSelectedSubmission(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Grading Panel Component
interface GradingPanelProps {
  submission: Submission;
  onGradeComplete?: (submissionId: string, results: Record<string, GradedResult>) => void;
  onAutoGrade?: () => void;
  gradingLoading?: boolean;
  gradingAttemptId?: string | null;
  onBack?: () => void;
}

function GradingPanelForTeacher({ 
  submission, 
  onGradeComplete,
  onAutoGrade,
  gradingLoading = false,
  gradingAttemptId,
  onBack,
}: GradingPanelProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gradedResults, setGradedResults] = useState<Record<string, GradedResult>>({});
  const [saving, setSaving] = useState(false);
  const [aiAnswerError, setAiAnswerError] = useState<string | null>(null);

  useEffect(() => {
    if (submission.questions) {
      const initialResults: Record<string, GradedResult> = {};
      submission.questions.forEach(q => {
        if ((q as any).gradedResult) {
          initialResults[q.id] = (q as any).gradedResult;
        }
      });
      setGradedResults(initialResults);
    }
    setCurrentQuestionIndex(0);
    setAiAnswerError(null);
  }, [submission]);

  const currentQuestion = submission.questions[currentQuestionIndex];
  const currentStudentAnswer = submission.studentAnswers?.find(a => a.id === currentQuestion?.id);
  const currentGradedResult = gradedResults[currentQuestion?.id];

  const gradedCount = Object.keys(gradedResults).length;
  const totalQuestions = submission.questions?.length || 0;
  const progress = totalQuestions > 0 ? (gradedCount / totalQuestions) * 100 : 0;

  const handleGrade = (result: Partial<GradedResult>) => {
    if (!currentQuestion) return;
    setGradedResults(prev => ({
      ...prev,
      [currentQuestion.id]: {
        id: currentQuestion.id,
        feedback: result.feedback || '',
        points: result.points ?? currentQuestion.points,
        isOverridden: result.isOverridden,
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < submission.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      onGradeComplete?.(submission.id, gradedResults);
    } finally {
      setSaving(false);
    }
  };

  const allGraded = gradedCount === totalQuestions;
  const isLoadingAIAnswer = gradingLoading && gradingAttemptId === submission.id;

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <div>
              <h3 className="font-semibold text-gray-900">{submission.quizTitle}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {submission.studentName}
                </span>
                <span>•</span>
                <span>{submission.courseName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={allGraded ? 'success' : 'warning'}>
              {gradedCount}/{totalQuestions} Graded
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoGrade}
              disabled={gradingLoading || gradedCount > 0}
            >
              {gradingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  AI Grading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI Auto-Grade
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {aiAnswerError && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{aiAnswerError}</span>
          <button 
            onClick={() => setAiAnswerError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Question Tabs */}
      <div className="flex overflow-x-auto border-b bg-gray-50 p-2 gap-1">
        {submission.questions.map((q, index) => {
          const isGraded = !!gradedResults[q.id];
          const isCurrent = index === currentQuestionIndex;
          
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isCurrent
                  ? 'bg-indigo-600 text-white'
                  : isGraded
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Q{index + 1}
              {isGraded && <span className="ml-1">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Question Content */}
      <div className="p-4">
        <QuestionCardForGrading
          question={currentQuestion}
          studentAnswer={currentStudentAnswer}
          gradedResult={currentGradedResult}
          onGrade={handleGrade}
          isActive={true}
          loadingAIAnswer={isLoadingAIAnswer}
          errorAIAnswer={aiAnswerError}
        />
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentQuestionIndex === submission.questions.length - 1 ? (
              <Button
                onClick={handleSaveAll}
                disabled={saving || !allGraded}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete Grading
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Card for Grading
interface QuestionCardProps {
  question: Question;
  studentAnswer?: StudentAnswer;
  gradedResult?: GradedResult;
  onGrade?: (result: Partial<GradedResult>) => void;
  isActive?: boolean;
  loadingAIAnswer?: boolean;
  errorAIAnswer?: string | null;
}

function QuestionCardForGrading({ 
  question, 
  studentAnswer, 
  gradedResult,
  onGrade,
  isActive = false,
  loadingAIAnswer = false,
  errorAIAnswer,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(isActive);
  const [feedback, setFeedback] = useState(gradedResult?.feedback || '');
  const [points, setPoints] = useState(gradedResult?.points || question.points);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return 'bg-blue-100 text-blue-700';
      case 'short-answer':
        return 'bg-green-100 text-green-700';
      case 'essay':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onGrade?.({
        feedback,
        points,
        isOverridden: isEditing
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isActive ? 'ring-2 ring-indigo-500' : ''
    } ${gradedResult?.isOverridden ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <div className="text-left">
            <div className="font-medium text-gray-900 line-clamp-1">{question.questionText}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(question.type)}`}>
                {question.type}
              </span>
              <span className="text-xs text-gray-500">{question.topic}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{question.points} pts</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {gradedResult && (
            <span className="font-semibold text-gray-900">
              {gradedResult.points}/{question.points}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t p-4 space-y-4">
          {/* Student Answer */}
          {studentAnswer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {studentAnswer.studentName}&apos;s Answer
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{studentAnswer.studentAnswer}</p>
            </div>
          )}

          {/* AI Answer - with loading and error states */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-700">
                {loadingAIAnswer ? 'Loading AI Answer...' : 'Correct Answer'}
              </span>
            </div>
            
            {loadingAIAnswer ? (
              <div className="flex items-center gap-2 text-indigo-600 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Fetching answer from AI...</span>
              </div>
            ) : errorAIAnswer ? (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium">Failed to load AI answer</span>
                  <p className="text-xs mt-1">{errorAIAnswer}</p>
                </div>
              </div>
            ) : question.aiAnswer || question.correctAnswer ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {question.aiAnswer || question.correctAnswer}
              </p>
            ) : (
              <p className="text-gray-500 italic">No correct answer available</p>
            )}
          </div>

          {/* Multiple Choice Options */}
          {question.type === 'multiple-choice' && question.options && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Options</span>
              </div>
              <div className="space-y-2">
                {question.options.map((option, i) => {
                  const isCorrect = question.correctAnswer === option;
                  return (
                    <div 
                      key={i}
                      className={`flex items-center gap-3 p-2 rounded-lg border ${
                        isCorrect 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                        {isCorrect && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={isCorrect ? 'text-green-700 font-medium' : 'text-gray-700'}>
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grading Section */}
          {studentAnswer && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Grading</span>
                <div className="flex items-center gap-2">
                  {gradedResult?.confidence && (
                    <span className="text-xs text-gray-500">
                      AI Confidence: {gradedResult.confidence}%
                    </span>
                  )}
                  {gradedResult?.isOverridden && (
                    <Badge variant="warning">Overridden</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points (max: {question.points})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={question.points}
                    value={points}
                    onChange={(e) => {
                      setPoints(Number(e.target.value));
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing ? 'border-indigo-300 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quick Set</label>
                  <div className="flex gap-2">
                    {[0, Math.floor(question.points / 2), question.points].map(val => (
                      <button
                        key={val}
                        onClick={() => {
                          setPoints(val);
                          setIsEditing(true);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          points === val
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    setIsEditing(true);
                  }}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Provide feedback for the student..."
                  className={`w-full px-3 py-2 border rounded-lg resize-none ${
                    isEditing ? 'border-indigo-300 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setFeedback(gradedResult?.feedback || '');
                        setPoints(gradedResult?.points || question.points);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <span className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save Grade
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Override Grade
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
