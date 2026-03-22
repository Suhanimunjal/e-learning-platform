'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Info,
  ExternalLink,
  Check,
  X,
  Sparkles,
  Clock,
  Award,
  Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface Recommendation {
  id: string;
  courseId: string;
  title: string;
  description: string;
  reason: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  estimatedHours?: number;
  matchScore: number;
  tags: string[];
  thumbnail?: string;
  status?: 'pending' | 'completed' | 'dismissed';
}

interface RecommendationsGridProps {
  studentId?: string;
  studentName?: string;
  onAccept?: (recommendationId: string) => void;
  onDismiss?: (recommendationId: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export default function RecommendationsGrid({ 
  studentId,
  studentName = 'Student',
  onAccept, 
  onDismiss, 
  onViewCourse 
}: RecommendationsGridProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showPaths, setShowPaths] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/ai/recommendations/${studentId}`);
        const data = response.data?.data || [];
        setRecommendations(data.map((item: any) => ({
          id: item.courseId || item.id || String(Math.random()),
          courseId: item.courseId || item.id,
          title: item.title || item.courseTitle || 'Untitled Course',
          description: item.description || '',
          reason: item.reason || 'Recommended for you',
          category: item.category || 'General',
          difficulty: item.difficulty || 'Intermediate',
          progress: item.progress || 0,
          estimatedHours: item.estimatedHours,
          matchScore: item.matchScore || 75,
          tags: item.tags || [],
          thumbnail: item.thumbnail,
          status: 'pending' as const
        })));
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [studentId]);

  const handleAccept = async (id: string) => {
    try {
      await api.post('/ai/recommendations/track', { 
        studentId, 
        courseId: id, 
        score: 100 
      });
      setRecommendations(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'completed' as const } : r
      ));
      onAccept?.(id);
    } catch (err) {
      console.error('Failed to accept recommendation:', err);
    }
  };

  const handleDismiss = (id: string) => {
    setRecommendations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'dismissed' as const } : r
    ));
    onDismiss?.(id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const activeRecommendations = recommendations.filter(r => r.status === 'pending');
  const acceptedCount = recommendations.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Personalized Learning Path</h2>
            <p className="text-white/80">
              Based on your progress and performance, we've curated these recommendations just for you.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{acceptedCount}</div>
            <div className="text-sm text-white/80">Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setShowPaths(false)}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            !showPaths ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Recommended Courses
          {!showPaths && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => setShowPaths(true)}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            showPaths ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Learning Paths
          {showPaths && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Recommendations Grid */}
      {!showPaths ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRecommendations.map((rec) => (
            <div 
              key={rec.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Match Score Badge */}
              <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMatchColor(rec.matchScore)}`}>
                  {rec.matchScore}% Match
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(rec.difficulty)}`}>
                  {rec.difficulty}
                </span>
              </div>

              <div className="p-4">
                {/* Course Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{rec.title}</h3>
                    <p className="text-xs text-gray-500">{rec.category}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {rec.description}
                </p>

                {/* Reason Tooltip */}
                <div className="mb-3">
                  <button
                    onClick={() => setSelectedReason(selectedReason === rec.id ? null : rec.id)}
                    className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    <Info className="h-4 w-4" />
                    Why this recommendation?
                  </button>
                  {selectedReason === rec.id && (
                    <div className="mt-2 p-3 bg-indigo-50 rounded-lg text-sm text-gray-700">
                      <Sparkles className="h-4 w-4 text-indigo-500 mb-1" />
                      {rec.reason}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                {rec.estimatedHours && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Clock className="h-3 w-3" />
                    {rec.estimatedHours} hours
                  </div>
                )}

                {/* Progress Bar */}
                {rec.progress !== undefined && rec.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{rec.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${rec.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDismiss(rec.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAccept(rec.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Learning Paths - Not yet implemented */
        null
      )}
    </div>
  );
}
