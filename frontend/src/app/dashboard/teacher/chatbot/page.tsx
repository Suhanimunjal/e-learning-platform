'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatWidget from '@/components/ai/ChatWidget';
import { MessageCircle, Settings, History, Users, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function ChatbotPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
              <p className="text-sm text-gray-500">AI-powered teaching assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Chats Today', value: '127', icon: MessageCircle, color: 'text-indigo-600' },
            { label: 'Active Users', value: '45', icon: Users, color: 'text-green-600' },
            { label: 'Resolved', value: '89%', icon: BarChart3, color: 'text-blue-600' },
            { label: 'Avg Response', value: '2.3s', icon: MessageCircle, color: 'text-amber-600' },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Preview</h2>
              <div className="border rounded-xl overflow-hidden">
                <ChatWidget courseName="General" initialOpen={true} />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Responses
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  View Chat History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Sessions
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Capabilities</h3>
              <div className="space-y-3">
                {[
                  'Answer course questions',
                  'Explain concepts',
                  'Provide code examples',
                  'Summarize lessons',
                  'Generate practice problems',
                ].map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="success" className="h-5 w-5 p-0 flex items-center justify-center">
                      ✓
                    </Badge>
                    <span className="text-gray-700">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
