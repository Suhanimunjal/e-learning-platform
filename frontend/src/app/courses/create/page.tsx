'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { usePlugins } from '@/contexts/PluginContext';
import { courses, sections as sectionsApi, modules as modulesApi, quizzes as quizzesApi, grading } from '@/lib/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  CheckSquare,
  Video,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import TopicInput from '@/components/ai/TopicInput';
import ContentPreview from '@/components/ai/ContentPreview';
import VideoGenerator from '@/components/ai/VideoGenerator';
import AudioPlayer from '@/components/ai/AudioPlayer';

interface Module {
  id: string;
  title: string;
  type: 'LESSON' | 'QUIZ' | 'ASSIGNMENT' | 'DISCUSSION' | 'SCORM';
  topic?: string;
  generatedContent?: any;
  contentStatus?: 'PENDING' | 'GENERATING' | 'GENERATED' | 'APPROVED' | 'REJECTED';
  videoStatus?: 'PENDING' | 'GENERATING' | 'APPROVED' | 'FAILED' | 'REJECTED';
  audioUrl?: string | null;
  videoUrl?: string | null;
  transcript?: string | null;
  isGenerating?: boolean;
  isLocked?: boolean;
  hasVideo?: boolean;
  sectionId?: string;
}

interface Section {
  id: string;
  title: string;
  modules: Module[];
  courseId?: string;
  order?: number;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { isPluginEnabled } = usePlugins();

  // STATE: Course
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    published: false,
  });
  const [courseId, setCourseId] = useState<string | null>(null);

  // STATE: Sections & Modules
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // STATE: UI
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // ✅ FIXED: REAL COURSE CREATION
  // =========================
  const handleCreateCourse = async () => {
    try {
      setLoading(true);

      if (!courseData.title.trim()) {
        alert('Please enter course title');
        return;
      }

      const created = await courses.create({
        ...courseData,
        slug: courseData.title.toLowerCase().replace(/\s+/g, '-'),
      });

      setCourseId(created.id);

      // Create initial section
      const initialSection = await sectionsApi.create({
        title: 'Getting Started',
        courseId: created.id,
        order: 1,
      });

      setSections([{ ...initialSection, modules: [] }]);
      setExpandedSections([initialSection.id]);

      alert('Course created! Now add modules.');
    } catch (err: any) {
      console.error('Course creation error:', err);
      alert('Failed to create course: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ✅ FIXED: REAL SECTION CREATION
  // =========================
  const handleAddSection = async () => {
    if (!courseId) {
      alert('Create course first');
      return;
    }

    try {
      setLoadingSections(true);

      const order = sections.length + 1;
      const created = await sectionsApi.create({
        title: `Section ${order}`,
        courseId,
        order,
      });

      setSections(prev => [...prev, { ...created, modules: [] }]);
      setExpandedSections(prev => [...prev, created.id]);
    } catch (err: any) {
      console.error('Section creation error:', err);
      alert('Failed to create section');
    } finally {
      setLoadingSections(false);
    }
  };

  // =========================
  // ✅ FIXED: REAL MODULE CREATION (NO FAKE IDS)
  // =========================
  const handleAddModule = async (sectionId: string, type: Module['type']) => {
    try {
      const created = await modulesApi.create({
        title: `${type} Module`,
        sectionId,
        type,
      });

      const newModule: Module = {
        ...created,
        contentStatus: 'PENDING',
        videoStatus: 'PENDING',
        isGenerating: false,
        hasVideo: false,
        sectionId,
      };

      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? { ...s, modules: [...s.modules, newModule] }
            : s
        )
      );
    } catch (err: any) {
      console.error('Module creation error:', err);
      alert('Failed to create module: ' + (err?.response?.data?.message || 'Unknown error'));
    }
  };

  // =========================
  // ✅ FIXED: CONTENT FLOW (GENERATE + APPROVE + QUIZ + VIDEO)
  // =========================
  const handleGenerateContent = async (
    sectionId: string,
    moduleId: string,
    topic: string
  ) => {
    try {
      // 1️⃣ Set GENERATING status
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? { ...m, isGenerating: true, contentStatus: 'GENERATING' }
                    : m
                ),
              }
            : s
        )
      );

      // 2️⃣ Generate content from AI
      const res = await modulesApi.generateContent(moduleId, topic);
      console.log('✅ Content generated:', res);

      // 3️⃣ Approve content automatically
      const approvedRes = await modulesApi.approveContent(moduleId);
      console.log('✅ Content approved');

      // 4️⃣ Generate video automatically
      const videoRes = await modulesApi.generateVideo(moduleId);
      console.log('✅ Video generated:', videoRes);

      // 5️⃣ Create quiz automatically from generated content
      try {
        // Find QUIZ module for this section
        const quizModule = sections
          .find(s => s.id === sectionId)
          ?.modules.find(m => m.type === 'QUIZ');

        if (quizModule) {
          const quizData = {
            moduleId: quizModule.id,
            title: `Quiz: ${topic}`,
            description: `Auto-generated quiz for ${topic}`,
            passingScore: 70,
            questions: res.quiz?.questions || [],
          };

          await quizzesApi.create(quizData);
          console.log('✅ Quiz created');
        }
      } catch (quizErr) {
        console.error('⚠️ Quiz creation failed (continuing anyway):', quizErr);
      }

      // 6️⃣ Update UI with final state
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? {
                        ...m,
                        topic,
                        generatedContent: res.content,
                        contentStatus: 'APPROVED',
                        videoStatus: 'APPROVED',
                        audioUrl: videoRes.audioUrl,
                        videoUrl: videoRes.videoUrl,
                        transcript: videoRes.transcript,
                        hasVideo: true,
                        isGenerating: false,
                      }
                    : m
                ),
              }
            : s
        )
      );

      alert('✅ Content, video, and quiz generated successfully!');
    } catch (err: any) {
      console.error('❌ Content generation failed:', err);
      alert('Content generation failed: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));

      // Reset state on error
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? { ...m, isGenerating: false, contentStatus: 'PENDING' }
                    : m
                ),
              }
            : s
        )
      );
    }
  };

  // =========================
  // MANUAL APPROVAL
  // =========================
  const handleApproveContent = async (
    sectionId: string,
    moduleId: string
  ) => {
    try {
      const res = await modulesApi.approveContent(moduleId);
      console.log('✅ Content approved:', res);

      // Update UI state
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? { ...m, contentStatus: 'APPROVED' }
                    : m
                ),
              }
            : s
        )
      );

      alert('✅ Content approved successfully!');
    } catch (err: any) {
      console.error('❌ Approval failed:', err);
      alert('Approval failed: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    }
  };

  // =========================
  // MANUAL VIDEO GENERATION
  // =========================
  const handleGenerateVideo = async (
    sectionId: string,
    moduleId: string,
    voiceId?: string
  ) => {
    try {
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? { ...m, videoStatus: 'GENERATING', isGenerating: true }
                    : m
                ),
              }
            : s
        )
      );

      const res = await modulesApi.generateVideo(moduleId, voiceId);

      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? {
                        ...m,
                        audioUrl: res.audioUrl,
                        videoUrl: res.videoUrl,
                        transcript: res.transcript,
                        videoStatus: 'APPROVED',
                        hasVideo: true,
                        isGenerating: false,
                      }
                    : m
                ),
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Video generation error:', err);
      alert('Video generation failed');

      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId
                    ? { ...m, videoStatus: 'PENDING', isGenerating: false }
                    : m
                ),
              }
            : s
        )
      );
    }
  };

  // =========================
  // DELETE MODULE
  // =========================
  const handleDeleteModule = (sectionId: string, moduleId: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, modules: s.modules.filter(m => m.id !== moduleId) }
          : s
      )
    );
  };

  // =========================
  // DELETE SECTION
  // =========================
  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  // =========================
  // UI HELPERS
  // =========================
  const toggleModule = (id: string) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // =========================
  // PUBLISH COURSE
  // =========================
  const handlePublishCourse = async () => {
    if (!courseId) {
      alert('Create course first');
      return;
    }

    try {
      setSubmitting(true);
      await courses.update(courseId, { published: true });
      alert('✅ Course published!');
      router.push('/dashboard/teacher/courses');
    } catch (err: any) {
      console.error('Publish error:', err);
      alert('Failed to publish course');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create Course</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Course Details */}
        {!courseId ? (
          <div className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Course Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Title *</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Enter course title"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={courseData.description}
                  onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Enter course description"
                  className="w-full border rounded px-3 py-2 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={e => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <Button onClick={handleCreateCourse} loading={loading}>
                ✅ Create Course
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Course Created */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-bold text-green-900">{courseData.title}</p>
                <p className="text-sm text-green-700">{courseData.description}</p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map(section => (
                <div key={section.id} className="border rounded-lg p-4">
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 font-bold hover:text-blue-600 flex-1"
                    >
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                      <BookOpen size={20} />
                      {section.title}
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Section Content */}
                  {expandedSections.includes(section.id) && (
                    <div className="mt-4 space-y-3">
                      {/* Modules */}
                      {section.modules.map(module => (
                        <div key={module.id} className="border rounded-lg p-4 bg-gray-50">
                          {/* Module Header */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleModule(module.id)}
                              className="flex items-center gap-2 font-semibold hover:text-blue-600 flex-1"
                            >
                              {expandedModules.includes(module.id) ? (
                                <ChevronUp size={18} />
                              ) : (
                                <ChevronDown size={18} />
                              )}
                              {module.type === 'LESSON' && <FileText size={18} />}
                              {module.type === 'QUIZ' && <CheckSquare size={18} />}
                              {module.type === 'ASSIGNMENT' && <Video size={18} />}
                              <span>{module.title}</span>

                              {/* Status Badge */}
                              {module.isGenerating && (
                                <Loader2 className="animate-spin text-blue-600 ml-2" size={16} />
                              )}
                              {module.contentStatus === 'APPROVED' && (
                                <CheckCircle className="text-green-600 ml-2" size={16} />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteModule(section.id, module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                           {/* Module Content */}
                           {expandedModules.includes(module.id) && (
                             <div className="mt-3 space-y-3">
                               {module.type === 'LESSON' && (
                                 <>
                                   {!module.generatedContent ? (
                                     <TopicInput
                                       moduleId={module.id}
                                       onGenerate={topic =>
                                         handleGenerateContent(section.id, module.id, topic)
                                       }
                                       isGenerating={module.isGenerating}
                                     />
                                   ) : (
                                     <div className="space-y-3">
                                       {/* Content Status Section */}
                                       <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                         <p className="font-semibold text-blue-900">📝 Content Generated</p>
                                         <p className="text-sm text-blue-700">{module.topic}</p>
                                         <p className="text-xs text-blue-600 mt-1">
                                           Status: <span className="font-semibold">{module.contentStatus}</span>
                                         </p>
                                       </div>

                                       {/* Approval Button - Only show if GENERATED but not APPROVED */}
                                       {module.contentStatus === 'GENERATED' && (
                                         <button
                                           onClick={() => handleApproveContent(section.id, module.id)}
                                           className="w-full px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded font-medium flex items-center justify-center gap-2"
                                         >
                                           <CheckCircle size={18} />
                                           Approve Content
                                         </button>
                                       )}

                                       {/* Approved Badge */}
                                       {module.contentStatus === 'APPROVED' && (
                                         <div className="bg-green-50 border border-green-200 rounded p-3">
                                           <p className="font-semibold text-green-900 flex items-center gap-2">
                                             <CheckCircle size={18} className="text-green-600" />
                                             ✅ Content Approved
                                           </p>
                                         </div>
                                       )}

                                       {/* Video Section */}
                                       {module.videoUrl && (
                                         <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                           <p className="text-sm font-medium text-purple-900 mb-2">🎬 Video:</p>
                                           <video controls className="w-full max-w-md">
                                             <source src={`http://localhost:3001${module.videoUrl}`} />
                                           </video>
                                         </div>
                                       )}

                                       {/* Audio Section */}
                                       {module.audioUrl && (
                                         <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                           <p className="text-sm font-medium text-orange-900 mb-2">🔊 Audio:</p>
                                           <AudioPlayer
                                             audioUrl={`http://localhost:3001${module.audioUrl}`}
                                           />
                                         </div>
                                       )}
                                     </div>
                                   )}
                                 </>
                               )}

                               {/* QUIZ Type */}
                               {module.type === 'QUIZ' && (
                                 <>
                                   {module.contentStatus === 'APPROVED' ? (
                                     <div className="bg-green-50 border border-green-200 rounded p-3">
                                       <p className="font-semibold text-green-900 flex items-center gap-2">
                                         <CheckCircle size={18} className="text-green-600" />
                                         ✅ Quiz Ready for Questions
                                       </p>
                                       <p className="text-sm text-green-700 mt-1">This QUIZ module is approved and ready to accept quiz questions.</p>
                                     </div>
                                   ) : (
                                     <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                       <p className="font-semibold text-yellow-900 flex items-center gap-2">
                                         <AlertCircle size={18} className="text-yellow-600" />
                                         ⏳ Waiting for Approval
                                       </p>
                                       <p className="text-sm text-yellow-700 mt-1">This QUIZ module needs to be approved before creating questions.</p>
                                     </div>
                                   )}
                                 </>
                               )}
                             </div>
                           )}
                        </div>
                      ))}

                      {/* Add Module Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleAddModule(section.id, 'LESSON')}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                        >
                          <Plus size={16} /> LESSON
                        </button>
                        <button
                          onClick={() => handleAddModule(section.id, 'QUIZ')}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded border border-purple-200"
                        >
                          <Plus size={16} /> QUIZ
                        </button>
                        <button
                          onClick={() => handleAddModule(section.id, 'ASSIGNMENT')}
                          className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded border border-orange-200"
                        >
                          <Plus size={16} /> ASSIGNMENT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Section Button */}
              <button
                onClick={handleAddSection}
                disabled={loadingSections}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus size={20} /> Add Section
              </button>
            </div>

            {/* Publish Button */}
            <div className="mt-8 flex gap-3">
              <Button onClick={handlePublishCourse} loading={submitting} variant="primary">
                🚀 Publish Course
              </Button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
