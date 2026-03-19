'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { usePlugins } from '@/contexts/PluginContext';
import { courses, modules as modulesApi, sections as sectionsApi } from '@/lib/api';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  FileText,
  CheckSquare,
  Video,
  Sparkles,
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
  type: 'LESSON' | 'QUIZ' | 'ASSIGNMENT';
  // Video Generation Fields
  topic?: string;
  generatedContent?: any;
  contentStatus?: 'PENDING' | 'GENERATING' | 'GENERATED' | 'APPROVED' | 'REJECTED';
  videoStatus?: 'PENDING' | 'GENERATING' | 'APPROVED' | 'REJECTED' | 'FAILED';
  audioUrl?: string | null;
  videoUrl?: string | null;
  transcript?: string | null;
  isGenerating?: boolean;
  isLocked?: boolean;
  hasVideo?: boolean; // CRITICAL: Include hasVideo flag
  quiz?: any[];
  assignment?: any;
}

interface Section {
  id: string;
  title: string;
  modules: Module[];
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { isPluginEnabled } = usePlugins();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  const hasAdvancedAssignments = isPluginEnabled('advanced-assignments');
  const hasAdvancedQuizzes = isPluginEnabled('advanced-quizzes');
  const hasLiveSessions = isPluginEnabled('live-sessions');
  const hasAiContent = isPluginEnabled('ai-content-generator');
  const hasBranchingLessons = isPluginEnabled('branching-lessons');
  const hasScorm = isPluginEnabled('scorm-h5p');

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    published: false,
  });

  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: 'Getting Started', modules: [] },
  ]);

  const [expandedSections, setExpandedSections] = useState<string[]>(['1']);

  // Check module locking - first module of first section is always unlocked
  const isModuleLocked = (sectionIndex: number, moduleIndex: number): boolean => {
    if (sectionIndex === 0 && moduleIndex === 0) return false;
    
    // First, find the index of this module in the overall sequence
    let totalModulesBefore = 0;
    for (let s = 0; s < sectionIndex; s++) {
      totalModulesBefore += sections[s].modules.length;
    }
    totalModulesBefore += moduleIndex;
    
    // If it's the first module, it's not locked
    if (totalModulesBefore === 0) return false;
    
    // Check if all previous modules are approved
    let modulesChecked = 0;
    for (let s = 0; s < sections.length; s++) {
      for (let m = 0; m < sections[s].modules.length; m++) {
        if (modulesChecked === totalModulesBefore) break;
        
        const module = sections[s].modules[m];
        if (module.type === 'LESSON' && module.videoStatus !== 'APPROVED') {
          return true; // Locked because previous module not approved
        }
        modulesChecked++;
      }
      if (modulesChecked === totalModulesBefore) break;
    }
    
    return false;
  };

  // Get all lesson modules count and approved count (using hasVideo flag)
  const getVideoProgress = () => {
    let total = 0;
    let approved = 0;
    
    sections.forEach(section => {
      section.modules.forEach(module => {
        if (module.type === 'LESSON') {
          total++;
          // CRITICAL FIX: Use hasVideo flag instead of just videoStatus
          if (module.hasVideo || module.videoStatus === 'APPROVED') {
            approved++;
          }
        }
      });
    });
    
    return { total, approved };
  };

  const toggleModule = (moduleId: string) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Section ${sections.length + 1}`,
      modules: [],
    };
    setSections([...sections, newSection]);
    setExpandedSections([...expandedSections, newSection.id]);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length === 1) return;
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleSectionTitleChange = (sectionId: string, title: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title } : s
    ));
  };

  const handleAddModule = (sectionId: string, type: Module['type']) => {
    // Check if any previous lesson module is not approved
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    const newModuleIndex = sections[sectionIndex].modules.length;
    
    // If adding a lesson, check if previous module is approved
    if (type === 'LESSON') {
      for (let i = 0; i <= sectionIndex; i++) {
        for (let j = 0; j < sections[i].modules.length; j++) {
          if (i === sectionIndex && j === newModuleIndex) break;
          const prevModule = sections[i].modules[j];
          if (prevModule.type === 'LESSON' && prevModule.videoStatus !== 'APPROVED') {
            alert('Please approve the previous lesson module before adding a new one.');
            return;
          }
        }
      }
    }

    const newModule: Module = {
      id: Date.now().toString(),
      title: `${type.charAt(0) + type.slice(1).toLowerCase()} Module`,
      type,
      contentStatus: 'PENDING',
      videoStatus: 'PENDING',
      audioUrl: null,
      transcript: null,
      isGenerating: false,
      isLocked: type === 'LESSON' ? isModuleLocked(sectionIndex, newModuleIndex) : false,
    };
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, modules: [...s.modules, newModule] } : s
    ));
  };

  const handleDeleteModule = (sectionId: string, moduleId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, modules: s.modules.filter(m => m.id !== moduleId) } : s
    ));
  };

  const handleModuleTitleChange = (sectionId: string, moduleId: string, title: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { 
        ...s, 
        modules: s.modules.map(m => m.id === moduleId ? { ...m, title } : m)
      } : s
    ));
  };

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  // Video Generation Functions
  const handleGenerateContent = async (sectionId: string, moduleId: string, topic: string) => {
    // Update state to show generating
    setSections(sections.map(s => 
      s.id === sectionId ? { 
        ...s, 
        modules: s.modules.map(m => m.id === moduleId ? { 
          ...m, 
          topic,
          contentStatus: 'GENERATING',
          isGenerating: true 
        } : m)
      } : s
    ));

    try {
      // Call backend API
      const response = await modulesApi.generateContent(moduleId, topic);
      
      // Update module with generated content
      setSections(sections.map(s => 
        s.id === sectionId ? { 
          ...s, 
          modules: s.modules.map(m => m.id === moduleId ? { 
            ...m, 
            generatedContent: response.content,
            contentStatus: 'GENERATED',
            isGenerating: false,
            // Store quiz and assignment from response
            quiz: response.quiz || [],
            assignment: response.assignment || null,
          } : m)
        } : s
      ));
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
      setSections(sections.map(s => 
        s.id === sectionId ? { 
          ...s, 
          modules: s.modules.map(m => m.id === moduleId ? { 
            ...m, 
            contentStatus: 'PENDING',
            isGenerating: false 
          } : m)
        } : s
      ));
    }
  };

  const handleApproveContent = (sectionId: string, moduleId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { 
        ...s, 
        modules: s.modules.map(m => m.id === moduleId ? { 
          ...m, 
          contentStatus: 'APPROVED',
          videoStatus: 'PENDING'
        } : m)
      } : s
    ));
  };

  const handleGenerateVideo = async (sectionId: string, moduleId: string, voiceId?: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { 
        ...s, 
        modules: s.modules.map(m => m.id === moduleId ? { 
          ...m, 
          videoStatus: 'GENERATING',
          isGenerating: true 
        } : m)
      } : s
    ));

    try {
      // Call backend API for video generation
      const response = await modulesApi.generateVideo(moduleId, voiceId);
      
      // Update module with generated audio and set hasVideo = true
      setSections(sections.map(s => 
        s.id === sectionId ? { 
          ...s, 
          modules: s.modules.map(m => m.id === moduleId ? { 
            ...m, 
            audioUrl: response.audioUrl,
            videoUrl: response.videoUrl,
            transcript: response.transcript,
            videoStatus: 'APPROVED',
            isGenerating: false,
            hasVideo: true, // CRITICAL FIX: Set hasVideo flag
          } : m)
        } : s
      ));
      
      alert('Video generated successfully! Preview it below.');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
      setSections(sections.map(s => 
        s.id === sectionId ? { 
          ...s, 
          modules: s.modules.map(m => m.id === moduleId ? { 
            ...m, 
            videoStatus: 'FAILED',
            isGenerating: false 
          } : m)
        } : s
      ));
    }
  };

  const handleSubmit = async () => {
    if (!courseData.title.trim()) {
      alert('Please enter a course title');
      return;
    }

    // Check if all lesson modules have approved videos
    const hasUnapprovedLessons = sections.some(section => 
      section.modules.some(module => 
        module.type === 'LESSON' && module.videoStatus !== 'APPROVED'
      )
    );

    if (hasUnapprovedLessons) {
      const proceed = confirm(
        'Some lesson modules do not have approved videos. Students may not be able to access these lessons. Do you want to continue?'
      );
      if (!proceed) return;
    }

    try {
      setSubmitting(true);
      
      const createdCourse = await courses.create({
        ...courseData,
        slug: courseData.title.toLowerCase().replace(/\s+/g, '-'),
      });

      alert('Course created successfully!');
      router.push('/dashboard/teacher/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const getModuleStatus = (module: Module) => {
    if (module.type !== 'LESSON') return null;
    
    if (module.contentStatus === 'PENDING') {
      return { color: 'gray', text: 'Topic Needed', icon: AlertCircle };
    }
    if (module.contentStatus === 'GENERATING') {
      return { color: 'blue', text: 'Generating...', icon: Loader2 };
    }
    if (module.contentStatus === 'GENERATED') {
      return { color: 'yellow', text: 'Review Content', icon: AlertCircle };
    }
    if (module.contentStatus === 'APPROVED' && module.videoStatus === 'PENDING') {
      return { color: 'purple', text: 'Ready for Video', icon: Video };
    }
    if (module.videoStatus === 'GENERATING') {
      return { color: 'blue', text: 'Generating Video...', icon: Loader2 };
    }
    if (module.videoStatus === 'APPROVED') {
      return { color: 'green', text: 'Completed', icon: CheckCircle };
    }
    return null;
  };

  const videoProgress = getVideoProgress();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          
          {/* Video Progress Bar */}
          {videoProgress.total > 0 && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">AI Video Generation Progress</span>
                </div>
                <span className="text-sm font-medium text-purple-700">
                  {videoProgress.approved}/{videoProgress.total} Modules
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(videoProgress.approved / videoProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-purple-700 mt-2">
                {videoProgress.total - videoProgress.approved} more modules need video approval
              </p>
            </div>
          )}
          
          {/* Course Basic Info */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Title *</label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                placeholder="Enter course title"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Describe what students will learn"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: Number(e.target.value) })}
                  min="0"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.published}
                    onChange={(e) => setCourseData({ ...courseData, published: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                </label>
              </div>
            </div>
          </div>

          {/* Course Content Builder */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
              <Button size="sm" onClick={handleAddSection}>
                <Plus className="mr-1 h-4 w-4" />
                Add Section
              </Button>
            </div>

            {/* Module Type Legend */}
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <BookOpen className="h-4 w-4 text-indigo-500" /> Lesson
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <CheckSquare className="h-4 w-4 text-green-500" /> Quiz
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <FileText className="h-4 w-4 text-blue-500" /> Assignment
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Video className="h-4 w-4 text-purple-500" /> AI Video
              </span>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="rounded-lg border border-gray-200 bg-gray-50">
                  {/* Section Header */}
                  <div 
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                      <span className="text-xs font-medium text-gray-500">Section {sectionIndex + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSectionTitleChange(section.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded border-transparent bg-transparent px-2 py-1 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none"
                      />
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                      {sections.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.id);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Content */}
                  {expandedSections.includes(section.id) && (
                    <div className="border-t border-gray-200 bg-white p-4">
                      {/* Modules List */}
                      <div className="space-y-3">
                        {section.modules.map((module, moduleIndex) => {
                          const status = getModuleStatus(module);
                          const isLocked = module.isLocked;
                          const isExpanded = expandedModules.includes(module.id);
                          
                          return (
                            <div key={module.id} className={`rounded-lg border ${isLocked ? 'border-gray-200 bg-gray-50' : 'border-indigo-200 bg-white'}`}>
                              {/* Module Header */}
                              <div 
                                className={`flex items-center gap-3 px-4 py-3 ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
                                onClick={() => !isLocked && toggleModule(module.id)}
                              >
                                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                {isLocked ? (
                                  <Lock className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Unlock className="h-5 w-5 text-green-500" />
                                )}
                                {module.type === 'LESSON' && <BookOpen className="h-5 w-5 text-indigo-500" />}
                                {module.type === 'QUIZ' && <CheckSquare className="h-5 w-5 text-green-500" />}
                                {module.type === 'ASSIGNMENT' && <FileText className="h-5 w-5 text-blue-500" />}
                                <input
                                  type="text"
                                  value={module.title}
                                  onChange={(e) => handleModuleTitleChange(section.id, module.id, e.target.value)}
                                  className="flex-1 rounded border-transparent bg-transparent text-sm focus:border-indigo-500 focus:bg-gray-50 focus:outline-none px-2 py-1"
                                  disabled={isLocked}
                                />
                                
                                {/* Status Badge */}
                                {status && (
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                    status.color === 'gray' ? 'bg-gray-100 text-gray-700' :
                                    status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                    status.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                    status.color === 'green' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {status.icon === Loader2 ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <status.icon className="h-3 w-3" />
                                    )}
                                    {status.text}
                                  </span>
                                )}
                                
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  {module.type}
                                </span>
                                
                                {!isLocked && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteModule(section.id, module.id);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              {/* Locked Message */}
                              {isLocked && (
                                <div className="px-4 py-3 bg-gray-100 border-t border-gray-200">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Lock className="h-4 w-4" />
                                    Complete the previous lesson module to unlock this one.
                                  </div>
                                </div>
                              )}

                              {/* Expanded Content (Video Generation Workflow) */}
                              {!isLocked && isExpanded && module.type === 'LESSON' && (
                                <div className="border-t border-gray-200 p-4 space-y-4">
                                  {/* Step 1: Topic Input */}
                                  {(!module.topic || module.contentStatus === 'PENDING') && (
                                    <TopicInput
                                      moduleId={module.id}
                                      currentTopic={module.topic}
                                      onGenerate={(topic) => handleGenerateContent(section.id, module.id, topic)}
                                      disabled={false}
                                      isGenerating={module.isGenerating}
                                    />
                                  )}

                                  {/* Step 2: Content Preview & Approval */}
                                  {module.contentStatus === 'GENERATING' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                                      <p className="text-blue-800 font-medium">Generating AI Content...</p>
                                      <p className="text-blue-600 text-sm">This may take a few seconds</p>
                                    </div>
                                  )}

                                  {module.contentStatus === 'GENERATED' && module.generatedContent && (
                                    <div className="space-y-4">
                                      <ContentPreview
                                        content={module.generatedContent}
                                        onApprove={() => handleApproveContent(section.id, module.id)}
                                        onReject={() => {
                                          setSections(sections.map(s => 
                                            s.id === section.id ? { 
                                              ...s, 
                                              modules: s.modules.map(m => m.id === module.id ? { 
                                                ...m, 
                                                contentStatus: 'GENERATED'
                                              } : m)
                                            } : s
                                          ));
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Step 3: Video Generation */}
                                  {module.contentStatus === 'APPROVED' && (
                                    <>
                                      <VideoGenerator
                                        moduleId={module.id}
                                        videoStatus={{
                                          moduleId: module.id,
                                          topic: module.topic || '',
                                          contentStatus: module.contentStatus || 'PENDING',
                                          videoStatus: module.videoStatus || 'PENDING',
                                          audioUrl: module.audioUrl || null,
                                          videoUrl: module.audioUrl || null,
                                          transcript: module.transcript || null,
                                          retryCount: 0,
                                          canRetry: true,
                                          canGenerateVideo: true,
                                          hasVideo: module.hasVideo || false, // CRITICAL: Pass hasVideo
                                        }}
                                        onGenerate={(voiceId) => handleGenerateVideo(section.id, module.id, voiceId)}
                                        onApprove={() => {
                                          // Video is auto-approved after generation
                                          alert('Video approved! Module is now complete.');
                                        }}
                                        isGenerating={module.isGenerating}
                                      />

                                      {/* Audio Player */}
                                      {module.audioUrl && (
                                        <AudioPlayer
                                          audioUrl={`http://localhost:3001${module.audioUrl}`}
                                          transcript={module.transcript || undefined}
                                          title={module.title}
                                        />
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Module Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAddModule(section.id, 'LESSON')}
                          className="flex items-center gap-1 rounded-lg border border-dashed border-indigo-300 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="h-4 w-4" />
                          <BookOpen className="h-4 w-4" />
                          Lesson
                        </button>
                        <button
                          onClick={() => handleAddModule(section.id, 'QUIZ')}
                          className="flex items-center gap-1 rounded-lg border border-dashed border-green-300 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4" />
                          <CheckSquare className="h-4 w-4" />
                          Quiz
                        </button>
                        <button
                          onClick={() => handleAddModule(section.id, 'ASSIGNMENT')}
                          className="flex items-center gap-1 rounded-lg border border-dashed border-blue-300 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="h-4 w-4" />
                          <FileText className="h-4 w-4" />
                          Assignment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <div>
              <p className="text-sm text-gray-500">
                {sections.length} section(s), {sections.reduce((acc, s) => acc + s.modules.length, 0)} module(s)
              </p>
              {videoProgress.total > 0 && (
                <p className="text-sm text-purple-600 font-medium">
                  {videoProgress.approved}/{videoProgress.total} lessons have AI videos
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/dashboard/teacher/courses')}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                {submitting ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
