'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: any;
  correctAnswer?: string;
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  shuffleQuestions: boolean;
  questions: Question[];
  attempts: any[];
  module: {
    id: string;
    section: {
      id: string;
    };
  };
}

export default function QuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      } else {
        setError('Failed to load quiz');
      }
    } catch (err) {
      setError('Failed to load quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!quiz) return;

    if (quiz.questions && quiz.questions.length === 0) {
      alert('Quiz must have at least one question to publish');
      return;
    }

    try {
      setIsPublishing(true);
      const response = await fetch(`/api/quizzes/${quizId}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchQuiz();
      }
    } catch (err) {
      console.error('Failed to publish quiz:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!quiz) return;

    try {
      setIsPublishing(true);
      const response = await fetch(`/api/quizzes/${quizId}/unpublish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchQuiz();
      }
    } catch (err) {
      console.error('Failed to unpublish quiz:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await fetchQuiz();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const addQuestion = async () => {
    const typeSelect = document.getElementById('questionType') as HTMLSelectElement;
    const textInput = document.getElementById('questionText') as HTMLTextAreaElement;
    const pointsInput = document.getElementById('points') as HTMLInputElement;

    if (!textInput.value || !pointsInput.value) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await fetch(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type: typeSelect.value,
          text: textInput.value,
          points: parseInt(pointsInput.value),
        }),
      });
      setShowAddQuestion(false);
      await fetchQuiz();
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  };

  const deleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this entire quiz?')) return;

    try {
      await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      router.push('/dashboard/teacher/quizzes');
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{quiz?.title}</h1>
          <Badge variant={quiz?.published ? 'success' : 'warning'}>
            {quiz?.published ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 mb-8">
          {!quiz?.published ? (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Publish Quiz
            </Button>
          ) : (
            <Button
              onClick={handleUnpublish}
              disabled={isPublishing}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Clock className="h-5 w-5" />
              Unpublish
            </Button>
          )}
          <Button
            onClick={deleteQuiz}
            variant="danger"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Delete Quiz
          </Button>
        </div>

        {quiz ? (
          <>
            {/* Quiz Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-gray-900">{quiz.description || 'No description'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created
                  </label>
                  <p className="text-gray-900">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit
                  </label>
                  <p className="text-gray-900">{quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'Unlimited'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <p className="text-gray-900">{quiz.maxAttempts || 'Unlimited'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score
                  </label>
                  <p className="text-gray-900">{quiz.passingScore}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shuffle Questions
                  </label>
                  <p className="text-gray-900">{quiz.shuffleQuestions ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Questions ({quiz.questions?.length || 0})
                </h3>
                <Button onClick={() => setShowAddQuestion(true)} className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              {quiz.questions && quiz.questions.length > 0 ? (
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                              Q{index + 1}
                            </span>
                            <span className="text-xs font-medium text-gray-600 uppercase bg-gray-200 px-2 py-1 rounded">
                              {question.type}
                            </span>
                            <span className="text-xs text-gray-500">Points: {question.points}</span>
                          </div>
                          <p className="text-gray-800 font-medium">{question.text}</p>
                        </div>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No questions yet. Add one to get started!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">{error || 'Quiz not found'}</p>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddQuestion && quiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-800">Add Question</h2>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    id="questionType"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    id="questionText"
                    placeholder="Enter the question"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    id="points"
                    placeholder="Enter points for this question"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddQuestion(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addQuestion}>
                  Add Question
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
