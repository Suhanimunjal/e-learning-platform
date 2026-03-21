'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2,
  BookOpen,
  FileQuestion,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { courses as coursesApi, quizzes as quizzesApi, sections as sectionsApi, modules as modulesApi } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  moduleCount?: number;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questionCount: number;
  createdAt: string;
  status?: 'draft' | 'published';
}

interface QuizGeneratorProps {
  onQuizGenerated?: (quiz: Quiz) => void;
}

const QUESTION_TYPES = [
  { id: 'multiple-choice', label: 'Multiple Choice', description: 'Single or multiple correct answers' },
  { id: 'short-answer', label: 'Short Answer', description: 'Brief text response' },
  { id: 'essay', label: 'Essay', description: 'Detailed written response' },
];

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple-choice', 'short-answer']);
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch quizzes when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      fetchQuizzes();
    }
  }, [courses]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await coursesApi.getAll();
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const allQuizzes: Quiz[] = [];
      
      for (const course of courses) {
        try {
          const courseQuizzes = await quizzesApi.getByCourse(course.id);
          if (Array.isArray(courseQuizzes)) {
            allQuizzes.push(...courseQuizzes.map(q => ({
              ...q,
              courseId: course.id,
              status: q.published ? 'published' : 'draft',
              questionCount: q.questions?.length || 0,
            })));
          }
        } catch (e) {
          // Skip courses with no quizzes
        }
      }
      
      setQuizzes(allQuizzes);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCourse) {
      setError('Please select a course first');
      return;
    }

    setError(null);
    setGeneratingQuiz(selectedCourse.id);

    try {
      // Find a QUIZ type module in the course to create the quiz under
      const sections = await sectionsApi.getByCourse(selectedCourse.id);
      
      let quizModuleId: string | null = null;
      
      for (const section of sections) {
        const sectionModules = await modulesApi.getBySection(section.id);
        const quizModule = sectionModules.find((m: any) => m.type === 'QUIZ');
        if (quizModule) {
          quizModuleId = quizModule.id;
          break;
        }
      }

      if (!quizModuleId) {
        // Create a new section and module for the quiz
        const newSection = await sectionsApi.create({
          title: 'Quizzes',
          courseId: selectedCourse.id,
        });
        
        const newModule = await modulesApi.create({
          title: `Quiz ${Date.now()}`,
          sectionId: newSection.id,
          type: 'QUIZ',
        });
        
        quizModuleId = newModule.id;
      }

      // Generate quiz via AI
      const newQuiz = await quizzesApi.create({
        title: `${selectedCourse.title} - Quiz ${Date.now()}`,
        description: 'AI Generated Quiz',
        moduleId: quizModuleId,
      });

      // Refresh quizzes list
      await fetchQuizzes();
      
      onQuizGenerated?.(newQuiz);
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
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

  const getCourseQuizzes = (courseId: string) => {
    return quizzes.filter(q => q.courseId === courseId);
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
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
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
            disabled={loadingCourses}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-400" />
              {loadingCourses ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <span className={selectedCourse ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedCourse ? selectedCourse.title : 'Choose a course...'}
                </span>
              )}
            </div>
            {showCourseDropdown ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showCourseDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {courses.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No courses found</div>
              ) : (
                courses.map(course => (
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
                  </button>
                ))
              )}
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
              <Badge variant="info">{courses.indexOf(selectedCourse) + 1} selected</Badge>
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
            disabled={generatingQuiz !== null || questionTypes.length === 0}
            className="w-full"
            size="lg"
          >
            {generatingQuiz !== null ? (
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
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
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
                                    {quiz.questionCount} questions - {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}
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
        )}
      </div>
    </div>
  );
}
