'use client';

import { useState, useEffect } from 'react';
import { 
  FileQuestion,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Printer,
  Download
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import QuestionCard from './QuestionCard';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  questionText: string;
  aiAnswer: string;
  internetReference?: {
    title: string;
    snippet: string;
    url?: string;
  };
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
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
  questions: Question[];
  studentAnswers: StudentAnswer[];
  gradedResults?: Record<string, GradedResult>;
  submittedAt: string;
}

interface GradingPanelProps {
  submission: Submission | null;
  onGradeComplete?: (submissionId: string, results: Record<string, GradedResult>) => void;
}

const MOCK_INTERNET_REFERENCES = [
  {
    title: 'MDN Web Docs - JavaScript',
    snippet: 'Variables in JavaScript are containers for storing values. Learn about var, let, and const declarations.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Variables'
  },
  {
    title: 'W3Schools JavaScript Tutorial',
    snippet: 'JavaScript functions are blocks of code designed to perform a particular task.',
    url: 'https://www.w3schools.com/js/js_functions.asp'
  },
  {
    title: 'JavaScript.info',
    snippet: 'Array methods like map(), filter(), and reduce() are powerful tools for data transformation.',
    url: 'https://javascript.info/array-methods'
  },
];

export default function GradingPanel({ submission, onGradeComplete }: GradingPanelProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gradedResults, setGradedResults] = useState<Record<string, GradedResult>>({});
  const [saving, setSaving] = useState(false);
  const [autoGradeLoading, setAutoGradeLoading] = useState(false);

  useEffect(() => {
    if (submission?.gradedResults) {
      setGradedResults(submission.gradedResults);
    } else {
      setGradedResults({});
    }
    setCurrentQuestionIndex(0);
  }, [submission]);

  if (!submission) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Submission</h3>
        <p className="text-gray-500">
          Choose a student submission from the list to start grading
        </p>
      </div>
    );
  }

  const currentQuestion = submission.questions[currentQuestionIndex];
  const currentStudentAnswer = submission.studentAnswers.find(
    a => a.id === currentQuestion.id
  );
  const currentGradedResult = gradedResults[currentQuestion.id];

  const gradedCount = Object.keys(gradedResults).length;
  const totalQuestions = submission.questions.length;
  const progress = (gradedCount / totalQuestions) * 100;

  const handleGrade = (result: Partial<GradedResult>) => {
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

  const handleAutoGrade = async () => {
    setAutoGradeLoading(true);
    
    for (const question of submission.questions) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate AI grading
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      const maxScore = question.points;
      const earnedPoints = Math.floor((score / 100) * maxScore);
      
      setGradedResults(prev => ({
        ...prev,
        [question.id]: {
          id: question.id,
          feedback: `AI-generated feedback: Good attempt at explaining ${question.topic}. Consider adding more examples.`,
          points: earnedPoints,
          confidence: Math.floor(Math.random() * 20) + 80,
        }
      }));
    }
    
    setAutoGradeLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      onGradeComplete?.(submission.id, gradedResults);
    } finally {
      setSaving(false);
    }
  };

  const allGraded = gradedCount === totalQuestions;
  const currentScore = currentGradedResult?.points || 0;
  const maxScore = currentQuestion?.points || 0;

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{submission.quizTitle}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {submission.studentName}
              </span>
              <span>•</span>
              <span>{submission.courseName}</span>
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

        {/* Question Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoGrade}
              disabled={autoGradeLoading || gradedCount > 0}
            >
              {autoGradeLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-1" />
              )}
              AI Auto-Grade
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>
      </div>

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
        <QuestionCard
          question={currentQuestion}
          studentAnswer={currentStudentAnswer}
          gradedResult={currentGradedResult}
          onGrade={handleGrade}
          isActive={true}
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
