'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import SearchBar from '@/components/ai/SearchBar';
import { Search as SearchIcon, BookOpen, FileText, CheckSquare, Lightbulb, Sparkles } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useState } from 'react';

export default function SearchPage() {
  const [lastSearch, setLastSearch] = useState<string>('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Search</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            AI-powered search across all your courses, lessons, assignments, and quizzes.
            Ask questions naturally and get relevant results.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto">
          <SearchBar
            placeholder="Search anything... Try 'JavaScript functions' or 'React hooks tutorial'"
            onSearch={(query) => setLastSearch(query)}
            onResultClick={(result) => console.log('Clicked:', result)}
          />
        </div>

        {/* Search Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Natural Language</h3>
            <p className="text-sm text-gray-600">
              Search using natural language queries. The AI understands context and intent.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Suggestions</h3>
            <p className="text-sm text-gray-600">
              Get "Did you mean?" suggestions for typos and related search terms.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <SearchIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Deep Indexing</h3>
            <p className="text-sm text-gray-600">
              All your content is indexed for fast, accurate search results.
            </p>
          </div>
        </div>

        {/* Search Examples */}
        <div className="max-w-4xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Try These Searches</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { text: 'JavaScript variables tutorial', icon: BookOpen },
              { text: 'React hooks examples', icon: FileText },
              { text: 'CSS quiz for beginners', icon: CheckSquare },
              { text: 'Node.js assignment', icon: FileText },
              { text: 'Advanced React patterns', icon: BookOpen },
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setLastSearch(example.text)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <example.icon className="h-4 w-4 text-gray-400" />
                {example.text}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {lastSearch && (
          <div className="max-w-4xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Search Results for "{lastSearch}"</h3>
            <div className="bg-white rounded-xl border p-6">
              <p className="text-gray-500 text-center py-8">
                Results would appear here. Connect to backend API for live results.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
