'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { browserApiBaseUrl, backendOrigin } from '@/lib/runtime-config';
import { student, modules as modulesApi, uploads, quizzes as quizzesApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Youtube,
  ExternalLink,
  CheckCircle,
  Circle,
  Loader2,
  Archive,
  Play,
  Image as ImageIcon,
  Volume2,
  HelpCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  url?: string;
  order: number;
}

interface ModuleData {
  id: string;
  title: string;
  type: string;
  textContent?: string;
  videoUrl?: string;
  audioUrl?: string;
  contentItems: ContentItem[];
  section: {
    id: string;
    title: string;
    order: number;
    course: {
      id: string;
      title: string;
    };
  };
  moduleQuiz?: {
    id: string;
    title: string;
    description?: string;
    questions: any[];
    maxAttempts: number;
    passingScore: number;
  };
}

interface AllModule {
  id: string;
  title: string;
  type: string;
  order: number;
  sectionTitle: string;
  completed: boolean;
}

export default function ModuleViewPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<ModuleData | null>(null);
  const [allModules, setAllModules] = useState<AllModule[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // ZIP download state
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    loadModuleData();
  }, [moduleId, courseId]);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: any = { Authorization: `Bearer ${token}` };

      // Load module data
      const moduleRes = await fetch(`${browserApiBaseUrl}/modules/${moduleId}`, { headers });
      if (!moduleRes.ok) throw new Error('Failed to load module');
      const moduleData = await moduleRes.json();
      setModule(moduleData);

      // Load all modules for navigation
      const courseFull = await student.getCourseFull(courseId);
      const flatModules: AllModule[] = [];
      courseFull.sections.forEach((section: any) => {
        section.modules.forEach((mod: any) => {
          flatModules.push({
            id: mod.id,
            title: mod.title,
            type: mod.type,
            order: mod.order,
            sectionTitle: section.title,
            completed: mod.completed,
          });
        });
      });
      setAllModules(flatModules);

      const idx = flatModules.findIndex(m => m.id === moduleId);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setCompleted(flatModules[idx]?.completed || false);

      // Check quiz attempts
      if (moduleData.moduleQuiz) {
        try {
          const attempts = await quizzesApi.getQuizAttempts(moduleData.moduleQuiz.id);
          setAttemptCount(attempts?.length || 0);
          if (attempts?.length > 0) {
            const lastAttempt = attempts[attempts.length - 1];
            if (lastAttempt.completedAt) {
              setQuizScore(lastAttempt.score);
              setQuizPassed(lastAttempt.passed);
              setQuizSubmitted(true);
            }
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${browserApiBaseUrl}/progress/${moduleId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setCompleted(true);
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNextModule = () => {
    if (currentIndex < allModules.length - 1) {
      const nextModule = allModules[currentIndex + 1];
      router.push(`/courses/${courseId}/modules/${nextModule.id}`);
    }
  };

  const handlePrevModule = () => {
    if (currentIndex > 0) {
      const prevModule = allModules[currentIndex - 1];
      router.push(`/courses/${courseId}/modules/${prevModule.id}`);
    }
  };

  const handleQuizSubmit = async () => {
    if (!module?.moduleQuiz) return;
    setSubmittingQuiz(true);
    try {
      const answers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const result = await quizzesApi.startQuiz(module.moduleQuiz.id);
      const submitResult = await quizzesApi.submitQuiz(module.moduleQuiz.id, {
        answers,
        timeSpent: 0,
      });
      setQuizScore(submitResult.score);
      setQuizPassed(submitResult.passed);
      setQuizSubmitted(true);
      setAttemptCount(prev => prev + 1);
    } catch (err) {
      console.error('Quiz submit error:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizPassed(null);
    setShowQuiz(true);
  };

  const handleDownloadAllAsZip = async () => {
    if (!module) return;
    setDownloadingZip(true);
    try {
      // Download all files individually since JSZip may not be installed
      const materials = getMaterials();
      for (const item of materials) {
        try {
          const filename = item.url.split('/').pop() || item.name;
          const token = localStorage.getItem('token');
          const downloadUrl = `${browserApiBaseUrl}/uploads/download/${filename}?token=${token}`;
          // Open each file in a new tab for download
          window.open(downloadUrl, '_blank');
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.error('Failed to download:', item.name, e);
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const getMaterials = () => {
    if (!module) return [];
    const materials: { name: string; url: string; type: string }[] = [];
    (module.contentItems || []).forEach(item => {
      if (['PDF', 'VIDEO', 'IMAGE', 'AUDIO'].includes(item.type) && item.url) {
        materials.push({ name: item.title, url: item.url, type: item.type });
      }
    });
    return materials;
  };

  const getYoutubeItems = () => {
    if (!module) return [];
    return (module.contentItems || []).filter(item => item.type === 'YOUTUBE');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
      case 'VIDEO': return <Play className="h-5 w-5 text-purple-500" />;
      case 'IMAGE': return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'AUDIO': return <Volume2 className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownloadFile = async (item: { name: string; url: string }) => {
    const filename = item.url.split('/').pop() || '';
    const token = localStorage.getItem('token');
    const downloadUrl = `${browserApiBaseUrl}/uploads/download/${filename}?token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading module...</span>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Module not found'}</p>
          <Link href={`/courses/${courseId}`} className="text-indigo-600 hover:underline">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const materials = getMaterials();
  const youtubeItems = getYoutubeItems();
  const canRetakeQuiz = module.moduleQuiz && quizSubmitted && (!module.moduleQuiz.maxAttempts || attemptCount < module.moduleQuiz.maxAttempts);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/courses/${courseId}`} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{module.title}</h1>
                <p className="text-xs text-gray-500">{module.section.course.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {completed ? (
                <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
              ) : (
                <Button size="sm" onClick={handleMarkComplete} loading={markingComplete}>
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Module Tabs Navigation */}
      <div className="bg-white border-b sticky top-14 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-2 gap-1 scrollbar-hide">
            {allModules.map((mod, idx) => (
              <Link
                key={mod.id}
                href={`/courses/${courseId}/modules/${mod.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  mod.id === moduleId
                    ? 'bg-indigo-600 text-white'
                    : mod.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mod.completed ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {mod.title.length > 25 ? mod.title.substring(0, 25) + '...' : mod.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Files Section - TOP */}
        {materials.filter(m => m.type !== 'VIDEO').length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Course Materials
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {materials.filter(m => m.type !== 'VIDEO').map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(item.type)}
                    <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(item)}
                    className="ml-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded flex-shrink-0"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module Content */}
        {module.textContent && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Content</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {module.textContent}
            </div>
          </div>
        )}

        {/* Module Video */}
        {module.videoUrl && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-600" />
              Video Lesson
            </h2>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video controls className="w-full h-full" src={`${backendOrigin}${module.videoUrl}`}>
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* YouTube Videos - BOTTOM */}
        {youtubeItems.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Video Resources
            </h2>
            <div className="space-y-4">
              {youtubeItems.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{item.title}</p>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={getYoutubeEmbedUrl(item.url || '')}
                      title={item.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module Quiz */}
        {module.moduleQuiz && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-green-600" />
              {module.moduleQuiz.title}
            </h2>
            {module.moduleQuiz.description && (
              <p className="text-sm text-gray-500 mb-4">{module.moduleQuiz.description}</p>
            )}

            {quizSubmitted ? (
              <div className={`p-4 rounded-lg ${quizPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {quizPassed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${quizPassed ? 'text-green-700' : 'text-red-700'}`}>
                    {quizPassed ? 'Passed!' : 'Not Passed'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Score: {quizScore}% (Passing: {module.moduleQuiz.passingScore}%)
                </p>
                <p className="text-xs text-gray-500 mt-1">Attempts: {attemptCount}/{module.moduleQuiz.maxAttempts || '∞'}</p>
                {canRetakeQuiz && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={handleRetakeQuiz}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Retake Quiz
                  </Button>
                )}
              </div>
            ) : !showQuiz ? (
              <Button onClick={() => setShowQuiz(true)}>
                Start Quiz
              </Button>
            ) : (
              <div className="space-y-4">
                {module.moduleQuiz.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">
                      {idx + 1}. {q.text}
                    </p>
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="space-y-2">
                        {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')).map((opt: string, oi: number) => (
                          <label key={oi} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'short_answer' && (
                      <input
                        type="text"
                        value={quizAnswers[q.id] || ''}
                        onChange={e => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Your answer..."
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    )}
                    {q.type === 'essay' && (
                      <textarea
                        value={quizAnswers[q.id] || ''}
                        onChange={e => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Your answer..."
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24"
                      />
                    )}
                  </div>
                ))}
                <Button onClick={handleQuizSubmit} loading={submittingQuiz}>
                  Submit Quiz
                </Button>
              </div>
            )}
          </div>
        )}

        {/* All Resources Section */}
        {(materials.length > 0 || youtubeItems.length > 0) && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Archive className="h-5 w-5 text-amber-600" />
                All Resources ({materials.length + youtubeItems.length})
              </h2>
              {materials.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadAllAsZip}
                  loading={downloadingZip}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download All as ZIP
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {materials.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(item.type)}
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <Badge variant="default">{item.type}</Badge>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(item)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
              {youtubeItems.map((item, idx) => (
                <div key={`yt-${idx}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-700">{item.title}</span>
                    <Badge variant="default">YouTube</Badge>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevModule}
            disabled={currentIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Module
          </Button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {allModules.length}
          </span>
          <Button
            onClick={handleNextModule}
            disabled={currentIndex >= allModules.length - 1}
          >
            Next Module
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}
