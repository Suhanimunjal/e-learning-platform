'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  FileText,
  CheckSquare,
  Languages,
  Lightbulb,
  Search,
  MessageCircle,
  Settings,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import ContentGenerator from '@/components/ai/ContentGenerator';
import GradingPreview from '@/components/ai/GradingPreview';
import TranslationModal from '@/components/ai/TranslationModal';
import SearchBar from '@/components/ai/SearchBar';
import ChatWidget from '@/components/ai/ChatWidget';
import api from '@/lib/api';

type TabType = 'content' | 'grading' | 'translate' | 'search' | 'chat';

const tabs = [
  { id: 'content' as const, label: 'Content Generator', icon: Sparkles },
  { id: 'grading' as const, label: 'Auto-Grading', icon: CheckSquare },
  { id: 'translate' as const, label: 'Translation', icon: Languages },
  { id: 'search' as const, label: 'Smart Search', icon: Search },
  { id: 'chat' as const, label: 'AI Chatbot', icon: MessageCircle },
];

interface Stats {
  contentGenerated: number;
  submissionsGraded: number;
  translationsDone: number;
  studentQuestions: number;
}

export default function TeacherAIPage() {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [stats, setStats] = useState<Stats>({
    contentGenerated: 0,
    submissionsGraded: 0,
    translationsDone: 0,
    studentQuestions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/ai/stats/teacher');
        if (response.data?.success && response.data?.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch AI stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Teaching Assistant</h1>
              <p className="text-sm text-gray-500">AI-powered tools to enhance your teaching</p>
            </div>
          </div>
          <Badge variant="success" className="px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            AI Enabled
          </Badge>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">All AI Features Ready</p>
              <p className="text-sm text-green-700">Your AI assistant is configured and ready to help you teach</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingStats ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 mb-3"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.contentGenerated}</div>
                    <div className="text-xs text-gray-500">Content Generated</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.submissionsGraded}</div>
                    <div className="text-xs text-gray-500">Submissions Graded</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.translationsDone}</div>
                    <div className="text-xs text-gray-500">Translations Done</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.studentQuestions}</div>
                    <div className="text-xs text-gray-500">Student Questions</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Content Generator Tab */}
          {activeTab === 'content' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Generate Content
              </h2>
              <ContentGenerator />
            </div>
          )}

          {/* Auto-Grading Tab */}
          {activeTab === 'grading' && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-indigo-600" />
                  AI Auto-Grading
                </h2>
              </div>
              <GradingPreview />
            </div>
          )}

          {/* Translation Tab */}
          {activeTab === 'translate' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Languages className="h-5 w-5 text-indigo-600" />
                Quick Translation
              </h2>
              <Button onClick={() => setShowTranslationModal(true)} size="lg">
                <Languages className="h-5 w-5 mr-2" />
                Open Translation Tool
              </Button>
            </div>
          )}

          {/* Smart Search Tab */}
          {activeTab === 'search' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-indigo-600" />
                AI-Powered Search
              </h2>
              <SearchBar 
                placeholder="Search courses, lessons, assignments, quizzes..."
                onResultClick={(result) => console.log('Result clicked:', result)}
              />
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-indigo-600" />
                  AI Chatbot Preview
                </h2>
                <Button onClick={() => setShowChatWidget(!showChatWidget)}>
                  {showChatWidget ? 'Hide Widget' : 'Show Widget'}
                </Button>
              </div>
              
              {showChatWidget ? (
                <div className="border rounded-xl overflow-hidden">
                  <ChatWidget courseName="General" initialOpen={true} />
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Click "Show Widget" to preview the chatbot</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Translation Modal */}
      <TranslationModal 
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        onApply={(content, lang) => {
          console.log('Translation applied:', { content, lang });
          setShowTranslationModal(false);
        }}
      />

      {/* Floating Chat Widget */}
      {activeTab !== 'chat' && <ChatWidget courseName="General" />}
    </DashboardLayout>
  );
}
