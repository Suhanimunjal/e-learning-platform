'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { usePlugins } from '@/contexts/PluginContext';
import { backendOrigin } from '@/lib/runtime-config';
import { courses, uploads as uploadsApi, sections as sectionsApi, modules as modulesApi, quizzes as quizzesApi, grading, UploadedFile } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
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
  Upload,
  File,
  Link,
  Youtube,
  Eye,
  Edit3,
  Image as ImageIcon,
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

  // STATE: Materials & Links
  const [materials, setMaterials] = useState<UploadedFile[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [newYoutubeLink, setNewYoutubeLink] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // STATE: Markdown preview toggle
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // STATE: Sections & Modules
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // STATE: UI
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // FILE UPLOAD HANDLER
  // =========================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const fileArray = Array.from(files);
      const uploaded = await uploadsApi.uploadMultiple(fileArray);
      setMaterials((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      console.error('File upload error:', err);
      alert('Failed to upload files: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // YOUTUBE LINK HANDLERS
  // =========================
  const handleAddYoutubeLink = () => {
    const link = newYoutubeLink.trim();
    if (!link) return;

    if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setYoutubeLinks((prev) => [...prev, link]);
    setNewYoutubeLink('');
  };

  const handleRemoveYoutubeLink = (index: number) => {
    setYoutubeLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // COURSE CREATION
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
        slug: courseData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        materials: materials.length > 0 ? materials : undefined,
        youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
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
  // SECTION CREATION
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
  // MODULE CREATION
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
  // CONTENT FLOW
  // =========================
  const handleGenerateContent = async (
    sectionId: string,
    moduleId: string,
    topic: string
  ) => {
    try {
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

      const res = await modulesApi.generateContent(moduleId, topic);
      const approvedRes = await modulesApi.approveContent(moduleId);
      const videoRes = await modulesApi.generateVideo(moduleId);

      try {
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
        }
      } catch (quizErr) {
        console.error('Quiz creation failed (continuing anyway):', quizErr);
      }

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

      alert('Content, video, and quiz generated successfully!');
    } catch (err: any) {
      console.error('Content generation failed:', err);
      alert('Content generation failed: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));

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

  const handleApproveContent = async (sectionId: string, moduleId: string) => {
    try {
      await modulesApi.approveContent(moduleId);
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId ? { ...m, contentStatus: 'APPROVED' } : m
                ),
              }
            : s
        )
      );
      alert('Content approved successfully!');
    } catch (err: any) {
      console.error('Approval failed:', err);
      alert('Approval failed: ' + (err?.response?.data?.message || err?.message));
    }
  };

  const handleGenerateVideo = async (sectionId: string, moduleId: string, voiceId?: string) => {
    try {
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                modules: s.modules.map(m =>
                  m.id === moduleId ? { ...m, videoStatus: 'GENERATING', isGenerating: true } : m
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
                  m.id === moduleId ? { ...m, videoStatus: 'PENDING', isGenerating: false } : m
                ),
              }
            : s
        )
      );
    }
  };

  const handleDeleteModule = (sectionId: string, moduleId: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, modules: s.modules.filter(m => m.id !== moduleId) }
          : s
      )
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

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

  const handlePublishCourse = async () => {
    if (!courseId) {
      alert('Create course first');
      return;
    }

    try {
      setSubmitting(true);
      await courses.update(courseId, { published: true });
      alert('Course published!');
      router.push('/dashboard/teacher/courses');
    } catch (err: any) {
      console.error('Publish error:', err);
      alert('Failed to publish course');
    } finally {
      setSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={16} className="text-red-500" />;
      case 'ppt': return <FileText size={16} className="text-orange-500" />;
      case 'doc': return <FileText size={16} className="text-blue-500" />;
      case 'xls': return <FileText size={16} className="text-green-500" />;
      case 'image': return <ImageIcon size={16} className="text-purple-500" />;
      case 'video': return <Video size={16} className="text-pink-500" />;
      default: return <File size={16} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Course Details</h2>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Enter course title"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description with Markdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-900">
                    Description (Markdown supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showMarkdownPreview ? (
                      <>
                        <Edit3 size={14} /> Edit
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Preview
                      </>
                    )}
                  </button>
                </div>
                {showMarkdownPreview ? (
                  <div className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] bg-gray-50 prose prose-sm max-w-none text-gray-900">
                    <ReactMarkdown>{courseData.description || '*No description yet*'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={courseData.description}
                    onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                    placeholder={"Enter course description. You can use Markdown:\n\n**Bold**, *italic*, `code`\n- Bullet lists\n- Item 2\n\n## Headings\n[Links](url)\n> Blockquotes"}
                    className="w-full border border-gray-300 rounded px-3 py-2 h-36 text-gray-900 bg-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Supports Markdown formatting: **bold**, *italic*, `code`, lists, headings, links, and more
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={e => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* File Uploads */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Course Materials (PDF, PPT, DOC, etc.)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload size={32} className="text-gray-500 mb-2" />
                    <span className="text-sm font-semibold text-gray-800">
                      {uploadingFiles ? 'Uploading...' : 'Click to upload files'}
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      PDF, PPT, DOC, XLS, images, videos (max 50MB each)
                    </span>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {materials.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {materials.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getFileIcon(file.type)}
                          <span className="text-sm text-gray-900 truncate">{file.name}</span>
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveMaterial(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* YouTube Links */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  YouTube Video Links
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center border border-gray-300 rounded overflow-hidden">
                    <span className="pl-3 text-red-500">
                      <Youtube size={18} />
                    </span>
                    <input
                      type="url"
                      value={newYoutubeLink}
                      onChange={e => setNewYoutubeLink(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddYoutubeLink();
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-3 py-2 text-gray-900 bg-white outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddYoutubeLink}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* YouTube Links List */}
                {youtubeLinks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {youtubeLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-red-50 border border-red-200 rounded px-3 py-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Youtube size={16} className="text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate">{link}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveYoutubeLink(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleCreateCourse} loading={loading}>
                Create Course
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Course Created */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div className="flex-1">
                <p className="font-bold text-green-900">{courseData.title}</p>
                <div className="text-sm text-green-800 prose prose-sm max-w-none">
                  <ReactMarkdown>{courseData.description}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Materials Summary */}
            {(materials.length > 0 || youtubeLinks.length > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Course Resources</h3>
                <div className="flex flex-wrap gap-2">
                  {materials.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white border border-blue-200 rounded px-2 py-1 text-xs text-gray-800">
                      {getFileIcon(m.type)} {m.name}
                    </span>
                  ))}
                  {youtubeLinks.map((link, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white border border-red-200 rounded px-2 py-1 text-xs text-gray-800">
                      <Youtube size={12} className="text-red-500" /> Video {i + 1}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-4">
              {sections.map(section => (
                <div key={section.id} className="border rounded-lg p-4">
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 font-bold hover:text-blue-600 flex-1 text-gray-900"
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
                              className="flex items-center gap-2 font-semibold hover:text-blue-600 flex-1 text-gray-900"
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
                                       <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                         <p className="font-semibold text-blue-900">Content Generated</p>
                                         <p className="text-sm text-blue-800">{module.topic}</p>
                                         <p className="text-xs text-blue-700 mt-1">
                                           Status: <span className="font-semibold">{module.contentStatus}</span>
                                         </p>
                                       </div>

                                       {module.contentStatus === 'GENERATED' && (
                                         <button
                                           onClick={() => handleApproveContent(section.id, module.id)}
                                           className="w-full px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded font-medium flex items-center justify-center gap-2"
                                         >
                                           <CheckCircle size={18} />
                                           Approve Content
                                         </button>
                                       )}

                                       {module.contentStatus === 'APPROVED' && (
                                         <div className="bg-green-50 border border-green-200 rounded p-3">
                                           <p className="font-semibold text-green-900 flex items-center gap-2">
                                             <CheckCircle size={18} className="text-green-600" />
                                             Content Approved
                                           </p>
                                         </div>
                                       )}

                                       {module.videoUrl && (
                                         <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                           <p className="text-sm font-medium text-purple-900 mb-2">Video:</p>
                                           <video controls className="w-full max-w-md">
                                             <source src={`${backendOrigin}${module.videoUrl}`} />
                                           </video>
                                         </div>
                                       )}

                                       {module.audioUrl && (
                                         <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                           <p className="text-sm font-medium text-orange-900 mb-2">Audio:</p>
                                           <AudioPlayer
                                             audioUrl={`${backendOrigin}${module.audioUrl}`}
                                           />
                                         </div>
                                       )}
                                     </div>
                                   )}
                                 </>
                               )}

                               {module.type === 'QUIZ' && (
                                 <>
                                   {module.contentStatus === 'APPROVED' ? (
                                     <div className="bg-green-50 border border-green-200 rounded p-3">
                                       <p className="font-semibold text-green-900 flex items-center gap-2">
                                         <CheckCircle size={18} className="text-green-600" />
                                         Quiz Ready for Questions
                                       </p>
                                       <p className="text-sm text-green-800 mt-1">This quiz module is approved and ready to accept questions.</p>
                                     </div>
                                   ) : (
                                     <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                       <p className="font-semibold text-yellow-900 flex items-center gap-2">
                                         <AlertCircle size={18} className="text-yellow-600" />
                                         Waiting for Approval
                                       </p>
                                       <p className="text-sm text-yellow-800 mt-1">This quiz module needs to be approved before creating questions.</p>
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
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-gray-800"
              >
                <Plus size={20} /> Add Section
              </button>
            </div>

            {/* Publish Button */}
            <div className="mt-8 flex gap-3">
              <Button onClick={handlePublishCourse} loading={submitting} variant="primary">
                Publish Course
              </Button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border rounded hover:bg-gray-50 text-gray-800"
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
