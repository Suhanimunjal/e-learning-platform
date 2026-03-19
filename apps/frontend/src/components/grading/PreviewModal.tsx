'use client';

import { useState } from 'react';
import { 
  X, 
  FileQuestion,
  Edit3,
  Save,
  CheckCircle,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  FileText,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  aiAnswer?: string;
  internetReference?: {
    title: string;
    snippet: string;
  };
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface GeneratedQuiz {
  id: string;
  title: string;
  courseName: string;
  questions: Question[];
  createdAt: string;
  totalPoints: number;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: GeneratedQuiz | null;
  onSave?: (quiz: GeneratedQuiz) => void;
  onPublish?: (quiz: GeneratedQuiz) => void;
}

export default function PreviewModal({ 
  isOpen, 
  onClose, 
  quiz,
  onSave,
  onPublish 
}: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingQuiz, setEditingQuiz] = useState<GeneratedQuiz | null>(quiz);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (quiz) {
      setEditingQuiz(quiz);
    }
  });

  if (!isOpen || !editingQuiz) return null;

  const currentQuestion = editingQuiz.questions[currentIndex];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return <CheckSquare className="h-4 w-4" />;
      case 'short-answer':
        return <FileText className="h-4 w-4" />;
      case 'essay':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileQuestion className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
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
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave?.(editingQuiz);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onPublish?.(editingQuiz);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionEdit = (field: string, value: any) => {
    setEditingQuiz(prev => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      newQuestions[currentIndex] = {
        ...newQuestions[currentIndex],
        [field]: value
      };
      return { ...prev, questions: newQuestions };
    });
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingQuiz.title}</h2>
            <p className="text-sm text-gray-500">
              {editingQuiz.courseName} • {editingQuiz.questions.length} Questions • {editingQuiz.totalPoints} Points
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Question Navigation */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {editingQuiz.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                  i === currentIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(prev => Math.min(editingQuiz.questions.length - 1, prev + 1))}
            disabled={currentIndex === editingQuiz.questions.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(currentQuestion.type)}`}>
                    {getTypeIcon(currentQuestion.type)}
                    {currentQuestion.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">• {currentQuestion.topic}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {currentQuestion.points} points
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                {isEditing ? 'Done Editing' : 'Edit'}
              </Button>
            </div>

            {/* Question Text */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Question {currentIndex + 1}
              </h3>
              {isEditing ? (
                <textarea
                  value={currentQuestion.questionText}
                  onChange={(e) => handleQuestionEdit('questionText', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 text-lg">{currentQuestion.questionText}</p>
              )}
            </div>

            {/* Multiple Choice Options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Options:</h4>
                {currentQuestion.options.map((option, i) => {
                  const isCorrect = currentQuestion.correctAnswer === option;
                  return (
                    <div 
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isCorrect 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                        {isCorrect && <CheckCircle className="h-4 w-4 text-white" />}
                      </div>
                      {isEditing ? (
                        <input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(currentQuestion.options || [])];
                            newOptions[i] = e.target.value;
                            handleQuestionEdit('options', newOptions);
                          }}
                          className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className={isCorrect ? 'text-green-700 font-medium' : 'text-gray-700'}>
                          {option}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Answer */}
            {currentQuestion.aiAnswer && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-indigo-700">AI-Generated Answer</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={currentQuestion.aiAnswer}
                    onChange={(e) => handleQuestionEdit('aiAnswer', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{currentQuestion.aiAnswer}</p>
                )}
              </div>
            )}

            {/* Internet Reference */}
            {currentQuestion.internetReference && (
              <div className="bg-cyan-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-500 font-medium">📚 Internet Reference</span>
                </div>
                <p className="font-medium text-gray-900">{currentQuestion.internetReference.title}</p>
                <p className="text-sm text-gray-600 mt-1">{currentQuestion.internetReference.snippet}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Question {currentIndex + 1} of {editingQuiz.questions.length}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Revert Changes
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Publish Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
