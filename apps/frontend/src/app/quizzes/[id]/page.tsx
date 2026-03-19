'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { usePlugins } from '@/contexts/PluginContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
  Bot,
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  maxAttempts: number;
  passingScore: number;
  questions: Question[];
}

// Mock quiz data
const mockQuiz: Quiz = {
  id: '1',
  title: 'JavaScript Basics Quiz',
  description: 'Test your knowledge of JavaScript fundamentals',
  timeLimit: 15, // 15 minutes
  maxAttempts: 3,
  passingScore: 70,
  questions: [
    {
      id: '1',
      text: 'What is the correct way to declare a variable in JavaScript?',
      type: 'multiple-choice',
      options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
      correctAnswer: 'var x = 5;',
      points: 10,
    },
    {
      id: '2',
      text: 'Which of the following is NOT a JavaScript data type?',
      type: 'multiple-choice',
      options: ['String', 'Boolean', 'Character', 'Number'],
      correctAnswer: 'Character',
      points: 10,
    },
    {
      id: '3',
      text: 'What will console.log(typeof []) output?',
      type: 'multiple-choice',
      options: ['array', 'object', 'undefined', 'list'],
      correctAnswer: 'object',
      points: 10,
    },
    {
      id: '4',
      text: 'What is the purpose of the "use strict" directive?',
      type: 'multiple-choice',
      options: [
        'To enable experimental features',
        'To enforce stricter parsing and error handling',
        'To enable TypeScript',
        'To enable ES6 modules',
      ],
      correctAnswer: 'To enforce stricter parsing and error handling',
      points: 10,
    },
    {
      id: '5',
      text: 'Which method is used to add an element to the end of an array?',
      type: 'multiple-choice',
      options: ['push()', 'pop()', 'shift()', 'unshift()'],
      correctAnswer: 'push()',
      points: 10,
    },
  ],
};

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    percentage: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);

  const { isPluginEnabled } = usePlugins();
  const hasAiAutoGrading = isPluginEnabled('ai-auto-grading');
  const hasBadges = isPluginEnabled('badges-certificates');
  const hasPoints = isPluginEnabled('points-leaderboard');

  useEffect(() => {
    // Simulate loading quiz
    setTimeout(() => {
      setQuiz(mockQuiz);
      setTimeLeft(mockQuiz.timeLimit ? mockQuiz.timeLimit * 60 : 0);
      setLoading(false);
    }, 1000);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!quiz || quizSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, quizSubmitted, timeLeft]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;

    // Calculate results
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = correctCount * (100 / quiz.questions.length);
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    setResults({
      score: earnedPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length,
    });

    setQuizSubmitted(true);
    setShowConfirmModal(false);
    setShowResultsModal(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = quiz ? (answeredCount / quiz.questions.length) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading quiz...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Quiz not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Quiz Header */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="mt-1 text-gray-500">{quiz.description}</p>
              )}
            </div>
            {quiz.timeLimit && !quizSubmitted && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {!quizSubmitted && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Progress: {answeredCount} of {quiz.questions.length} answered</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} size="sm" color="indigo" />
            </div>
          )}
        </div>

        {/* Question Card */}
        {currentQuestion && !quizSubmitted && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="info">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Badge>
              <span className="text-sm text-gray-500">{currentQuestion.points} points</span>
            </div>

            <h2 className="mb-6 text-lg font-medium text-gray-900">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        answers[currentQuestion.id] === option
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {answers[currentQuestion.id] === option && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        {!quizSubmitted && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-8 w-8 rounded-full text-sm font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : answers[quiz.questions[index].id]
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={() => setShowConfirmModal(true)}>
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(quiz.questions.length - 1, prev + 1)
                  )
                }
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Question Navigator Summary */}
        {!quizSubmitted && (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-gray-700">Question Navigator</h3>
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : answers[q.id]
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-100 border border-green-200"></div>
                Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-gray-100"></div>
                Not Answered ({quiz.questions.length - answeredCount})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Quiz?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">You have answered {answeredCount} out of {quiz.questions.length} questions.</p>
              {answeredCount < quiz.questions.length && (
                <p className="mt-1 text-sm text-yellow-700">
                  You still have {quiz.questions.length - answeredCount} unanswered questions.
                </p>
              )}
            </div>
          </div>
          <p className="text-gray-600">
            Are you sure you want to submit your quiz? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Continue Quiz
            </Button>
            <Button onClick={handleSubmitQuiz}>
              Submit Quiz
            </Button>
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        title="Quiz Results"
      >
        {results && (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
                  results.passed ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {results.passed ? (
                  <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">
                {results.passed ? 'Congratulations!' : 'Keep Trying!'}
              </h3>
              <p className="mt-1 text-gray-500">
                {results.passed
                  ? 'You passed the quiz!'
                  : `You need ${quiz.passingScore}% to pass.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">{results.percentage}%</p>
                <p className="text-sm text-gray-500">Your Score</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {results.correctAnswers}/{results.totalQuestions}
                </p>
                <p className="text-sm text-gray-500">Correct Answers</p>
              </div>
            </div>

            <div className="flex justify-between rounded-lg bg-indigo-50 p-4">
              <div>
                <p className="text-sm text-gray-500">Passing Score</p>
                <p className="font-bold text-indigo-600">{quiz.passingScore}%</p>
              </div>
            <div>
              <p className="text-sm text-gray-500">Time Taken</p>
              <p className="font-bold text-indigo-600">
                {quiz.timeLimit ? formatTime(quiz.timeLimit * 60 - timeLeft) : '-'}
              </p>
            </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to Course
              </Button>
              {!results.passed && (
                <Button>Retry Quiz</Button>
              )}
            </div>

            {/* Plugin-Enabled Features in Results */}
            {(hasAiAutoGrading || hasBadges || hasPoints) && results.passed && (
              <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-100">
                <h4 className="font-medium text-indigo-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  You Unlocked:
                </h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {hasAiAutoGrading && (
                    <div className="flex items-center gap-2 bg-white rounded-lg p-3">
                      <Bot className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">AI Feedback</p>
                        <p className="text-xs text-gray-500">Detailed analysis ready</p>
                      </div>
                    </div>
                  )}
                  {hasPoints && (
                    <div className="flex items-center gap-2 bg-white rounded-lg p-3">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">+50 Points</p>
                        <p className="text-xs text-gray-500">Added to leaderboard</p>
                      </div>
                    </div>
                  )}
                  {hasBadges && (
                    <div className="flex items-center gap-2 bg-white rounded-lg p-3">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Quiz Master</p>
                        <p className="text-xs text-gray-500">Badge earned!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
