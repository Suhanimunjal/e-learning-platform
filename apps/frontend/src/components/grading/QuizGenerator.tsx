'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  BookOpen, 
  FileQuestion,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Course {
  id: string;
  title: string;
  description: string;
  moduleCount: number;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questionCount: number;
  createdAt: string;
  status: 'draft' | 'published';
}

interface QuizGeneratorProps {
  onQuizGenerated?: (quiz: Quiz) => void;
}

const MOCK_COURSES: Course[] = [
  { id: '1', title: 'JavaScript Fundamentals', description: 'Learn the basics of JavaScript programming', moduleCount: 8 },
  { id: '2', title: 'React Hooks Deep Dive', description: 'Master useState, useEffect, and custom hooks', moduleCount: 5 },
  { id: '3', title: 'CSS Grid & Flexbox', description: 'Create responsive layouts with modern CSS', moduleCount: 6 },
  { id: '4', title: 'Node.js API Development', description: 'Build RESTful APIs with Express', moduleCount: 7 },
];

const MOCK_QUIZZES: Quiz[] = [
  { id: 'q1', courseId: '1', title: 'JavaScript Variables Quiz', questionCount: 5, createdAt: '2024-03-10', status: 'published' },
  { id: 'q2', courseId: '1', title: 'Functions & Scope Quiz', questionCount: 4, createdAt: '2024-03-12', status: 'draft' },
  { id: 'q3', courseId: '2', title: 'useState Hook Quiz', questionCount: 6, createdAt: '2024-03-14', status: 'published' },
];

const QUESTION_TYPES = [
  { id: 'multiple-choice', label: 'Multiple Choice', description: 'Single or multiple correct answers' },
  { id: 'short-answer', label: 'Short Answer', description: 'Brief text response' },
  { id: 'essay', label: 'Essay', description: 'Detailed written response' },
];

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple-choice', 'short-answer']);
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const getCourseQuizzes = (courseId: string) => {
    return quizzes.filter(q => q.courseId === courseId);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCourse) {
      setError('Please select a course first');
      return;
    }

    setError(null);
    setGenerating(true);
    setGeneratingQuiz(selectedCourse.id);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newQuiz: Quiz = {
        id: `q${Date.now()}`,
        courseId: selectedCourse.id,
        title: `${selectedCourse.title} - Quiz ${getCourseQuizzes(selectedCourse.id).length + 1}`,
        questionCount,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };

      setQuizzes(prev => [...prev, newQuiz]);
      onQuizGenerated?.(newQuiz);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingQuiz(null);
    }
  };

  const toggleQuestionType = (typeId: string) => {
    setQuestionTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quiz Generator</h2>
            <p className="text-sm text-gray-500">AI-powered quiz creation</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Course Selection */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Course</h3>
        
        <div className="relative">
          <button
            onClick={() => setShowCourseDropdown(!showCourseDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <span className={selectedCourse ? 'text-gray-900' : 'text-gray-400'}>
                {selectedCourse ? selectedCourse.title : 'Choose a course...'}
              </span>
            </div>
            {showCourseDropdown ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showCourseDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowCourseDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedCourse?.id === course.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{course.title}</div>
                  <div className="text-sm text-gray-500">{course.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{course.moduleCount} modules</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-indigo-900">{selectedCourse.title}</div>
                <div className="text-sm text-indigo-700">{selectedCourse.description}</div>
              </div>
              <Badge variant="info">{selectedCourse.moduleCount} modules</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Configuration */}
      {selectedCourse && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quiz Configuration</h3>
          
          {/* Question Types */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Types
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {QUESTION_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleQuestionType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    questionTypes.includes(type.id)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium ${
                    questionTypes.includes(type.id) ? 'text-indigo-600' : 'text-gray-700'
                  }`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>3</span>
              <span>20</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateQuiz}
            disabled={generating || questionTypes.length === 0}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Quiz with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Existing Quizzes */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Existing Quizzes</h3>
        
        <div className="space-y-4">
          {courses.map(course => {
            const courseQuizzes = getCourseQuizzes(course.id);
            const isExpanded = expandedCourse === course.id;

            return (
              <div key={course.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500">{courseQuizzes.length} quizzes</div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {courseQuizzes.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No quizzes yet. Generate one above!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {courseQuizzes.map(quiz => (
                          <div
                            key={quiz.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <FileQuestion className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{quiz.title}</div>
                                <div className="text-xs text-gray-500">
                                  {quiz.questionCount} questions - {quiz.createdAt}
                                </div>
                              </div>
                            </div>
                            <Badge variant={quiz.status === 'published' ? 'success' : 'warning'}>
                              {quiz.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
