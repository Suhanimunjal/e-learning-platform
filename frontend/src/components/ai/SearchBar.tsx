'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Loader2, 
  X,
  Filter,
  Sparkles,
  FileText,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mic
} from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'assignment' | 'quiz';
  title: string;
  snippet: string;
  courseName?: string;
  relevanceScore?: number;
}

interface SearchFilters {
  type?: string;
  difficulty?: string;
  topic?: string;
}

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
}

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CONTENT_TYPES = ['Course', 'Lesson', 'Assignment', 'Quiz'];

export default function SearchBar({ 
  onSearch, 
  onResultClick,
  placeholder = 'Search courses, lessons, assignments...' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setDidYouMean(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.get('/ai/search', { params: { query: searchQuery, ...filters } });
      const data = response.data?.data || [];
      
      const formattedResults: SearchResult[] = data.map((item: any) => ({
        id: item.id || item._id || String(Math.random()),
        type: item.type || 'course',
        title: item.title || item.name || 'Untitled',
        snippet: item.snippet || item.description || '',
        courseName: item.courseName || item.course?.title,
        relevanceScore: item.relevanceScore || 80
      }));

      setResults(formattedResults);

      const suggestionResponse = await api.get('/ai/search/suggestions', { params: { query: searchQuery } });
      const suggestionData = suggestionResponse.data?.data || [];
      setSuggestions(suggestionData.slice(0, 5));

      setDidYouMean(null);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowResults(true);
    handleSearch(suggestion);
  };

  const handleDidYouMeanClick = () => {
    if (didYouMean) {
      setQuery(didYouMean);
      handleSearch(didYouMean);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    onResultClick?.(result);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'lesson':
        return FileText;
      case 'assignment':
        return CheckCircle;
      case 'quiz':
        return Sparkles;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-purple-100 text-purple-600';
      case 'lesson':
        return 'bg-blue-100 text-blue-600';
      case 'assignment':
        return 'bg-green-100 text-green-600';
      case 'quiz':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 2) {
                handleSearch(e.target.value);
              }
            }}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
          />
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-4 p-2 rounded-lg transition-colors ${
              showFilters || Object.keys(filters).some(k => filters[k as keyof SearchFilters])
                ? 'bg-indigo-100 text-indigo-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
          
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-14 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-lg border z-10">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  {CONTENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value || undefined })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  value={filters.topic || ''}
                  onChange={(e) => setFilters({ ...filters, topic: e.target.value || undefined })}
                  placeholder="Enter topic..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFilters({})}>
                Clear Filters
              </Button>
              <Button type="button" size="sm" onClick={() => { handleSearch(query); setShowFilters(false); }}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Results Dropdown */}
      {showResults && (query || results.length > 0) && (
        <div 
          ref={resultsRef}
          className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border max-h-96 overflow-y-auto z-20"
        >
          {/* Did You Mean */}
          {didYouMean && (
            <button
              onClick={handleDidYouMeanClick}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b"
            >
              <div className="text-sm text-gray-500">Did you mean:</div>
              <div className="text-indigo-600 font-medium">"{didYouMean}"</div>
            </button>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && results.length === 0 && (
            <div className="p-4 border-b">
              <div className="text-xs text-gray-500 mb-2">SUGGESTIONS</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="text-xs text-gray-500 mb-2">RECENT SEARCHES</div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs text-gray-500">
                {results.length} results found
              </div>
              {results.map((result) => {
                const TypeIcon = getTypeIcon(result.type);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-indigo-600">
                            {result.title}
                          </h4>
                          {result.relevanceScore && (
                            <span className="text-xs text-green-600 font-medium">
                              {result.relevanceScore}% match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-1">
                          {result.snippet}
                        </p>
                        {result.courseName && (
                          <div className="text-xs text-gray-400">
                            From: {result.courseName}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {query.length > 2 && results.length === 0 && !isLoading && !didYouMean && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">No results found</h4>
              <p className="text-sm text-gray-500">
                Try different keywords or adjust your filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
