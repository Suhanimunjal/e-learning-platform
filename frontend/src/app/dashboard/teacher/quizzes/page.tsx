'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  BookOpen,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import { quizzes as quizzesApi, courses as coursesApi, sections as sectionsApi, modules as modulesApi } from '@/lib/api';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
  questions: any[];
  attempts: any[];
}

interface Course {
  id: string;
  title: string;
}

interface Section {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  type: string;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSections(selectedCourse);
      setSelectedSection('');
      setSelectedModule('');
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSection) {
      fetchModules(selectedSection);
      setSelectedModule('');
    }
  }, [selectedSection]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const coursesData = await coursesApi.getAll();
      if (coursesData?.length > 0) {
        const quizzesData = await quizzesApi.getByCourse(coursesData[0].id);
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      }
    } catch (err) {
      setError('Failed to load quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await coursesApi.getAll();
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  const fetchSections = async (courseId: string) => {
    try {
      const data = await sectionsApi.getByCourse(courseId);
      setSections(data || []);
    } catch (err) {
      console.error('Failed to load sections', err);
    }
  };

  const fetchModules = async (sectionId: string) => {
    try {
      const data = await modulesApi.getBySection(sectionId);
      const quizModules = data ? data.filter((m: any) => m.type === 'QUIZ') : [];
      setModules(quizModules);
    } catch (err) {
      console.error('Failed to load modules', err);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !quizTitle) {
      setError('Please select a module and enter a title');
      return;
    }

    try {
      setCreateLoading(true);
      setError('');
      const newQuiz = await quizzesApi.create({
        title: quizTitle,
        description: quizDescription,
        moduleId: selectedModule,
      });

      setShowCreateModal(false);
      setQuizTitle('');
      setQuizDescription('');
      setSelectedCourse('');
      setSelectedSection('');
      setSelectedModule('');

      router.push(`/dashboard/teacher/quizzes/${newQuiz.id}`);
    } catch (err) {
      setError('Failed to create quiz');
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await quizzesApi.delete(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      setError('Failed to delete quiz');
      console.error(err);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'published' && quiz.published) ||
      (filterStatus === 'draft' && !quiz.published);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.published).length,
    draft: quizzes.filter(q => !q.published).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 mt-1">Manage and review your quizzes</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Quiz
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-100 rounded-lg p-2 bg-blue-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-100 rounded-lg p-2 bg-green-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft</p>
                <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-100 rounded-lg p-2 bg-orange-50" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Quizzes</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Quiz
          </Button>
        </div>

        {/* Filtered Quizzes List */}
        <div className="grid gap-4 mt-6">
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
                      <Badge variant={quiz.published ? 'success' : 'warning'}>
                        {quiz.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{quiz.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{quiz.questions?.length || 0} questions</span>
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No quizzes found. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter quiz title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter quiz description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedSection('');
                    setSelectedModule('');
                    if (e.target.value) fetchSections(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Selection */}
              {selectedCourse && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Section *
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setSelectedModule('');
                      if (e.target.value) fetchModules(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a section</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Module Selection */}
              {selectedSection && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Module *
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a module</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Loading Message */}
              {createLoading && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  Creating quiz...
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => handleCreateQuiz(e as any)}
                disabled={createLoading || !quizTitle || !selectedModule}
              >
                Create Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
