'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useState } from 'react';
import {
  Bot,
  Sparkles,
  FileText,
  CheckSquare,
  BookOpen,
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

type TabType = 'content' | 'grading' | 'translate' | 'search' | 'chat';

const tabs = [
  { id: 'content' as const, label: 'Content Generator', icon: Sparkles },
  { id: 'grading' as const, label: 'Auto-Grading', icon: CheckSquare },
  { id: 'translate' as const, label: 'Translation', icon: Languages },
  { id: 'search' as const, label: 'Smart Search', icon: Search },
  { id: 'chat' as const, label: 'AI Chatbot', icon: MessageCircle },
];

export default function TeacherAIPage() {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

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
          {[
            { label: 'Content Generated', value: '127', icon: FileText, color: 'text-indigo-600' },
            { label: 'Submissions Graded', value: '89', icon: CheckSquare, color: 'text-green-600' },
            { label: 'Translations Done', value: '45', icon: Languages, color: 'text-cyan-600' },
            { label: 'Student Questions', value: '234', icon: MessageCircle, color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Generator */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Generate Content
                </h2>
                <ContentGenerator />
              </div>

              {/* Recent Generations */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Generations</h2>
                <div className="space-y-3">
                  {[
                    { type: 'Assignment', title: 'JavaScript Functions Practice', time: '2 hours ago', tone: 'Formal' },
                    { type: 'Examples', title: 'React Hooks Code Examples', time: '4 hours ago', tone: 'Casual' },
                    { type: 'Summary', title: 'CSS Grid Lecture Summary', time: '1 day ago', tone: 'Simplified' },
                    { type: 'Assignment', title: 'Node.js API Assignment', time: '2 days ago', tone: 'Formal' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.type} • {item.tone} • {item.time}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Auto-Grading Tab */}
          {activeTab === 'grading' && (
            <div>
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                    AI Auto-Grading
                  </h2>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <GradingPreview />
              </div>
            </div>
          )}

          {/* Translation Tab */}
          {activeTab === 'translate' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 space-y-4">
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

                {/* Recent Translations */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Translations</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'JavaScript Lesson 1', lang: 'Spanish', progress: 'Completed' },
                      { title: 'React Quiz', lang: 'French', progress: 'Completed' },
                      { title: 'Node.js Guide', lang: 'German', progress: 'Completed' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Languages className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-xs text-gray-500">To: {item.lang}</div>
                          </div>
                        </div>
                        <Badge variant="success">{item.progress}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Supported Languages */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Supported Languages</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Dutch'].map((lang) => (
                    <div key={lang} className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 text-center">
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Smart Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
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

              {/* Search Tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <Lightbulb className="h-6 w-6 text-indigo-600 mb-2" />
                  <h4 className="font-medium text-indigo-900 mb-1">Natural Language</h4>
                  <p className="text-sm text-indigo-700">Ask questions naturally like "show me JavaScript courses for beginners"</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-green-900 mb-1">Smart Filters</h4>
                  <p className="text-sm text-green-700">Filter by type, difficulty, topic, or any keyword</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <Sparkles className="h-6 w-6 text-amber-600 mb-2" />
                  <h4 className="font-medium text-amber-900 mb-1">Auto-Corrections</h4>
                  <p className="text-sm text-amber-700">"Did you mean?" suggestions for typos</p>
                </div>
              </div>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Preview */}
              <div className="lg:col-span-2 bg-white rounded-xl border p-6">
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

              {/* Chat Info */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Chatbot Capabilities</h3>
                  <div className="space-y-3">
                    {[
                      'Answer course-related questions',
                      'Explain complex concepts',
                      'Provide code examples',
                      'Help with assignments',
                      'Summarize lessons',
                      'Suggest additional resources',
                    ].map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Chatbot Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      View Chat History
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Training Data
                    </Button>
                  </div>
                </div>
              </div>
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
