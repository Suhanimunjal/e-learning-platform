'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  QuizGenerator, 
  SubmissionList, 
  GradingPanel,
  PreviewModal
} from '@/components/grading';
import { 
  CheckSquare, 
  Settings, 
  Download, 
  Filter,
  Sparkles,
  Users,
  FileText,
  Clock,
  BarChart3
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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
  options?: string[];
  correctAnswer?: string;
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
  studentAnswers: {
    id: string;
    studentName: string;
    studentAnswer: string;
    submittedAt: string;
  }[];
  submittedAt: string;
  status: 'pending' | 'grading' | 'graded' | 'reviewed';
  gradedCount?: number;
  totalQuestions?: number;
  avgScore?: number;
}

// Mock Data
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    questionText: 'Which keyword is used to declare a variable that cannot be reassigned in JavaScript?',
    aiAnswer: 'The "const" keyword is used to declare a constant variable that cannot be reassigned after initialization. Unlike "let", a const variable must be initialized at declaration and its reference remains fixed.',
    internetReference: {
      title: 'MDN Web Docs - const',
      snippet: 'The const declaration creates a read-only reference to a value. It does not mean the value it holds is immutable.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const'
    },
    topic: 'Variables',
    difficulty: 'easy',
    points: 10,
    options: ['var', 'let', 'const', 'static'],
    correctAnswer: 'const'
  },
  {
    id: 'q2',
    type: 'short-answer',
    questionText: 'Explain the difference between arrow functions and regular functions in JavaScript.',
    aiAnswer: 'Arrow functions are a shorter syntax introduced in ES6. Key differences include: 1) Arrow functions don\'t have their own "this" binding, 2) They can\'t be used as constructors, 3) They don\'t have the "arguments" object, 4) They\'re always anonymous.',
    internetReference: {
      title: 'JavaScript.info - Arrow Functions',
      snippet: 'Arrow functions have shorter syntax compared to function expressions and lexically bind the "this" value.',
      url: 'https://javascript.info/arrow-functions-basics'
    },
    topic: 'Functions',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 'q3',
    type: 'essay',
    questionText: 'Describe how JavaScript closures work and provide a practical use case.',
    aiAnswer: 'A closure is a function bundled with its lexical environment. When a function is created, it captures references to variables from its surrounding scope. This allows inner functions to access outer function variables even after the outer function has returned. Practical use cases include: data privacy, module pattern, and callbacks with state.',
    internetReference: {
      title: 'MDN - Closures',
      snippet: 'A closure is the combination of a function bundled together with references to its surrounding state.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'
    },
    topic: 'Closures',
    difficulty: 'hard',
    points: 25
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    questionText: 'What will console.log(Array.from([1, 2, 3], x => x + x)) output?',
    aiAnswer: 'Array.from() creates a new array from an array-like or iterable object. The second argument is a map function. So [1, 2, 3] becomes [2, 4, 6] after applying x => x + x to each element.',
    internetReference: {
      title: 'MDN - Array.from()',
      snippet: 'The Array.from() static method creates a new, shallow-copied Array instance from an array-like or iterable object.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from'
    },
    topic: 'Arrays',
    difficulty: 'medium',
    points: 10,
    options: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'Error'],
    correctAnswer: '[2, 4, 6]'
  },
  {
    id: 'q5',
    type: 'short-answer',
    questionText: 'What is the purpose of the "use strict" directive in JavaScript?',
    aiAnswer: '"use strict" enables strict mode, which catches common coding mistakes by throwing errors. It prevents: 1) Using undeclared variables, 2) Deleting variables or functions, 3) Duplicate parameter names, 4) Writing to read-only properties. It helps write more reliable and maintainable code.',
    internetReference: {
      title: 'MDN - Strict mode',
      snippet: 'Strict mode makes several changes to normal JavaScript semantics to improve error checking.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode'
    },
    topic: 'Best Practices',
    difficulty: 'easy',
    points: 10
  }
];

const MOCK_STUDENT_ANSWERS = [
  {
    id: 'q1',
    studentName: 'Alice Johnson',
    studentAnswer: 'I believe the correct answer is "const" because it was introduced in ES6 to create constants that cannot be changed after initialization.',
    submittedAt: '2024-03-18T10:30:00'
  },
  {
    id: 'q2',
    studentName: 'Alice Johnson',
    studentAnswer: 'Arrow functions are a shorter way to write functions in JavaScript. They were introduced in ES6 and are more concise than regular functions.',
    submittedAt: '2024-03-18T10:30:00'
  },
  {
    id: 'q3',
    studentName: 'Alice Johnson',
    studentAnswer: 'A closure is when a function can remember variables from its outer scope even after that scope has finished executing. It\'s like the function has a memory of where it came from.',
    submittedAt: '2024-03-18T10:30:00'
  },
  {
    id: 'q4',
    studentName: 'Alice Johnson',
    studentAnswer: 'The output would be [2, 4, 6] because Array.from takes the second argument as a mapping function that transforms each element.',
    submittedAt: '2024-03-18T10:30:00'
  },
  {
    id: 'q5',
    studentName: 'Alice Johnson',
    studentAnswer: 'use strict is a directive that tells JavaScript to run in strict mode, which catches common mistakes and throws errors for bad practices.',
    submittedAt: '2024-03-18T10:30:00'
  }
];

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub1',
    studentId: 'user1',
    studentName: 'Alice Johnson',
    studentEmail: 'alice@example.com',
    quizTitle: 'JavaScript Fundamentals Quiz',
    courseName: 'JavaScript Fundamentals',
    questionCount: 5,
    questions: MOCK_QUESTIONS,
    studentAnswers: MOCK_STUDENT_ANSWERS,
    submittedAt: '2024-03-18T10:30:00',
    status: 'pending',
    totalQuestions: 5
  },
  {
    id: 'sub2',
    studentId: 'user2',
    studentName: 'Bob Smith',
    studentEmail: 'bob@example.com',
    quizTitle: 'JavaScript Fundamentals Quiz',
    courseName: 'JavaScript Fundamentals',
    questionCount: 5,
    questions: MOCK_QUESTIONS,
    studentAnswers: MOCK_STUDENT_ANSWERS.map(a => ({
      ...a,
      studentName: 'Bob Smith',
      studentAnswer: 'Different answer from Bob for question ' + a.id
    })),
    submittedAt: '2024-03-18T09:15:00',
    status: 'pending',
    totalQuestions: 5
  },
  {
    id: 'sub3',
    studentId: 'user3',
    studentName: 'Carol Davis',
    studentEmail: 'carol@example.com',
    quizTitle: 'JavaScript Fundamentals Quiz',
    courseName: 'JavaScript Fundamentals',
    questionCount: 5,
    questions: MOCK_QUESTIONS,
    studentAnswers: MOCK_STUDENT_ANSWERS.map(a => ({
      ...a,
      studentName: 'Carol Davis',
      studentAnswer: 'Carol\'s excellent answer demonstrating deep understanding of the concepts.'
    })),
    submittedAt: '2024-03-17T16:45:00',
    status: 'graded',
    gradedCount: 5,
    totalQuestions: 5,
    avgScore: 92
  },
  {
    id: 'sub4',
    studentId: 'user4',
    studentName: 'David Lee',
    studentEmail: 'david@example.com',
    quizTitle: 'React Hooks Quiz',
    courseName: 'React Hooks Deep Dive',
    questionCount: 3,
    questions: MOCK_QUESTIONS.slice(0, 3),
    studentAnswers: MOCK_STUDENT_ANSWERS.slice(0, 3).map(a => ({
      ...a,
      studentName: 'David Lee'
    })),
    submittedAt: '2024-03-17T14:20:00',
    status: 'grading',
    totalQuestions: 3
  }
];

type ViewMode = 'quizzes' | 'submissions' | 'grading';

export default function GradingDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('submissions');
  const [submissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const pendingCount = submissions.filter(s => s.status === 'pending' || s.status === 'grading').length;
  const gradedCount = submissions.filter(s => s.status === 'graded' || s.status === 'reviewed').length;

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewMode('grading');
  };

  const handleGradeComplete = (submissionId: string, results: any) => {
    console.log('Grading complete:', submissionId, results);
    // Update submission status
    setViewMode('submissions');
    setSelectedSubmission(null);
  };

  const handleQuizGenerated = (quiz: any) => {
    console.log('Quiz generated:', quiz);
  };

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
            <Button variant="outline" onClick={() => setViewMode('quizzes')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Quiz
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard/teacher/quizzes'}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Manage Quizzes
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Graded Today', value: gradedCount, icon: CheckSquare, color: 'text-green-600 bg-green-50' },
            { label: 'Avg Score', value: '85%', icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Accuracy', value: '96%', icon: FileText, color: 'text-blue-600 bg-blue-50' },
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
                viewMode === 'submissions'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Submissions
              {viewMode === 'submissions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setViewMode('quizzes')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                viewMode === 'quizzes'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Quiz Generator
              {viewMode === 'quizzes' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
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
          {viewMode === 'quizzes' && (
            <QuizGenerator onQuizGenerated={handleQuizGenerated} />
          )}

          {viewMode === 'submissions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quiz Filter */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Select Quiz</h3>
                <div className="space-y-2">
                  {[
                    { id: 'q1', title: 'JavaScript Fundamentals Quiz', count: 12 },
                    { id: 'q2', title: 'React Hooks Quiz', count: 8 },
                    { id: 'q3', title: 'CSS Grid Quiz', count: 5 },
                  ].map(quiz => (
                    <button
                      key={quiz.id}
                      className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-xs text-gray-500">{quiz.count} submissions</div>
                      </div>
                      <Badge variant="info">{quiz.count}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submissions List */}
              <SubmissionList
                submissions={submissions}
                selectedSubmission={selectedSubmission}
                onSelect={handleSelectSubmission}
                onGradeAll={() => submissions.length > 0 && handleSelectSubmission(submissions[0])}
                loading={loading}
              />
            </div>
          )}

          {viewMode === 'grading' && selectedSubmission && (
            <GradingPanel
              submission={selectedSubmission}
              onGradeComplete={handleGradeComplete}
            />
          )}
        </div>

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          quiz={null}
        />
      </div>
    </DashboardLayout>
  );
}
