'use client';

import { useState } from 'react';
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
  Award
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    courseId: 'course-1',
    title: 'Advanced JavaScript Patterns',
    description: 'Master advanced JavaScript patterns including closures, prototypes, and async programming. Perfect for learners who have completed JavaScript fundamentals.',
    reason: 'Strong performance in JavaScript basics. Ready for more advanced topics.',
    category: 'Programming',
    difficulty: 'Advanced',
    progress: 0,
    estimatedHours: 12,
    matchScore: 95,
    tags: ['JavaScript', 'Patterns', 'Async'],
    status: 'pending'
  },
  {
    id: '2',
    courseId: 'course-2',
    title: 'React Hooks Deep Dive',
    description: 'Learn useState, useEffect, useContext, and custom hooks. Build real-world applications with modern React patterns.',
    reason: 'Completed React basics course. Excellent foundation for hooks.',
    category: 'Frontend',
    difficulty: 'Intermediate',
    progress: 0,
    estimatedHours: 8,
    matchScore: 92,
    tags: ['React', 'Hooks', 'Frontend'],
    status: 'pending'
  },
  {
    id: '3',
    courseId: 'course-3',
    title: 'CSS Grid & Flexbox Masterclass',
    description: 'Create responsive layouts with CSS Grid and Flexbox. Learn modern CSS layout techniques used in production.',
    reason: 'Struggled with layout concepts. This course provides hands-on practice.',
    category: 'CSS',
    difficulty: 'Intermediate',
    progress: 0,
    estimatedHours: 6,
    matchScore: 88,
    tags: ['CSS', 'Layout', 'Responsive'],
    status: 'pending'
  },
  {
    id: '4',
    courseId: 'course-4',
    title: 'Node.js API Development',
    description: 'Build RESTful APIs with Node.js, Express, and MongoDB. Learn authentication, validation, and best practices.',
    reason: 'JavaScript fundamentals strong. Backend development recommended.',
    category: 'Backend',
    difficulty: 'Advanced',
    progress: 0,
    estimatedHours: 15,
    matchScore: 85,
    tags: ['Node.js', 'API', 'Backend'],
    status: 'pending'
  },
  {
    id: '5',
    courseId: 'course-5',
    title: 'TypeScript for Beginners',
    description: 'Learn TypeScript from scratch. Understand types, interfaces, and how TypeScript improves JavaScript development.',
    reason: 'Ready to level up JavaScript skills with type safety.',
    category: 'Programming',
    difficulty: 'Beginner',
    progress: 45,
    estimatedHours: 10,
    matchScore: 78,
    tags: ['TypeScript', 'JavaScript', 'Types'],
    status: 'pending'
  },
  {
    id: '6',
    courseId: 'course-6',
    title: 'Git & GitHub Essentials',
    description: 'Master version control with Git and collaborate using GitHub. Essential skills for any developer.',
    reason: 'Understanding Git will improve your development workflow.',
    category: 'Tools',
    difficulty: 'Beginner',
    progress: 0,
    estimatedHours: 4,
    matchScore: 75,
    tags: ['Git', 'GitHub', 'Version Control'],
    status: 'pending'
  }
];

const MOCK_LEARNING_PATHS = [
  {
    id: 'lp-1',
    title: 'Full Stack Developer Path',
    progress: 35,
    courses: ['JavaScript Basics', 'React Fundamentals', 'Node.js Basics', 'Database Design'],
    completed: 1
  },
  {
    id: 'lp-2',
    title: 'Frontend Specialist Path',
    progress: 50,
    courses: ['HTML & CSS', 'JavaScript', 'React', 'Advanced CSS'],
    completed: 2
  }
];

export default function RecommendationsGrid({ 
  studentId,
  studentName = 'Student',
  onAccept, 
  onDismiss, 
  onViewCourse 
}: RecommendationsGridProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showPaths, setShowPaths] = useState(false);

  const handleAccept = (id: string) => {
    setRecommendations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'completed' as const } : r
    ));
    onAccept?.(id);
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
        /* Learning Paths */
        <div className="space-y-4">
          {MOCK_LEARNING_PATHS.map((path) => (
            <div 
              key={path.id}
              className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{path.title}</h3>
                  <p className="text-sm text-gray-500">{path.courses.length} courses</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{path.progress}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                  style={{ width: `${path.progress}%` }}
                />
              </div>

              {/* Course List */}
              <div className="space-y-2">
                {path.courses.map((course, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      index < path.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index < path.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className={`flex-1 ${index < path.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {course}
                    </span>
                    {index < path.completed && (
                      <Award className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <Button className="w-full mt-4">
                Continue Learning
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeRecommendations.length === 0 && !showPaths && (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">
            You've completed all recommended courses. Check back later for new recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
