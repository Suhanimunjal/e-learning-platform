'use client';

import { useState } from 'react';
import { 
  FileQuestion,
  User,
  Bot,
  Globe,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  questionText: string;
  aiAnswer: string;
  internetReference?: {
    title: string;
    snippet: string;
    url?: string;
  };
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface StudentAnswer {
  id: string;
  studentName: string;
  studentAnswer: string;
  submittedAt: string;
}

interface GradedResult {
  id: string;
  studentAnswer?: string;
  aiAnswer?: string;
  internetReference?: {
    title: string;
    snippet: string;
    url?: string;
  };
  feedback: string;
  points: number;
  confidence?: number;
  isOverridden?: boolean;
}

interface QuestionCardProps {
  question: Question;
  studentAnswer?: StudentAnswer;
  gradedResult?: GradedResult;
  onGrade?: (result: Partial<GradedResult>) => void;
  isActive?: boolean;
}

export default function QuestionCard({ 
  question, 
  studentAnswer, 
  gradedResult,
  onGrade,
  isActive = false 
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(isActive);
  const [feedback, setFeedback] = useState(gradedResult?.feedback || '');
  const [points, setPoints] = useState(gradedResult?.points || question.points);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return 'bg-blue-100 text-blue-700';
      case 'short-answer':
        return 'bg-green-100 text-green-700';
      case 'essay':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getGradingIcon = () => {
    if (!gradedResult) return null;
    const score = (gradedResult.points / question.points) * 100;
    if (score >= 80) return <ThumbsUp className="h-4 w-4 text-green-500" />;
    if (score >= 50) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <ThumbsDown className="h-4 w-4 text-red-500" />;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onGrade?.({
        feedback,
        points,
        isOverridden: isEditing
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isActive ? 'ring-2 ring-indigo-500' : ''
    } ${gradedResult?.isOverridden ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileQuestion className="h-5 w-5 text-gray-400" />
          <div className="text-left">
            <div className="font-medium text-gray-900 line-clamp-1">{question.questionText}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getTypeColor(question.type)}>{question.type}</Badge>
              <span className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{question.topic}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {gradedResult && (
            <div className="flex items-center gap-2">
              {getGradingIcon()}
              <span className="font-semibold text-gray-900">
                {gradedResult.points}/{question.points}
              </span>
            </div>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t p-4 space-y-4">
          {/* Student Answer */}
          {studentAnswer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {studentAnswer.studentName}&apos;s Answer
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{studentAnswer.studentAnswer}</p>
              <div className="text-xs text-gray-400 mt-2">
                Submitted: {new Date(studentAnswer.submittedAt).toLocaleString()}
              </div>
            </div>
          )}

          {/* AI Answer */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-700">AI Answer (from course content)</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{question.aiAnswer}</p>
          </div>

          {/* Internet Reference */}
          {question.internetReference && (
            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium text-cyan-700">Internet Reference</span>
              </div>
              <p className="text-gray-700 text-sm">{question.internetReference.snippet}</p>
              {question.internetReference.url && (
                <a 
                  href={question.internetReference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-600 hover:text-cyan-800 mt-2 inline-block"
                >
                  {question.internetReference.title} →
                </a>
              )}
            </div>
          )}

          {/* Grading Section */}
          {studentAnswer && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Grading</span>
                <div className="flex items-center gap-2">
                  {gradedResult?.confidence && (
                    <span className="text-xs text-gray-500">
                      AI Confidence: {gradedResult.confidence}%
                    </span>
                  )}
                  {gradedResult?.isOverridden && (
                    <Badge variant="warning">Overridden</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points (max: {question.points})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={question.points}
                    value={points}
                    onChange={(e) => {
                      setPoints(Number(e.target.value));
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing ? 'border-indigo-300 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                {/* Quick Point Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quick Set</label>
                  <div className="flex gap-2">
                    {[0, Math.floor(question.points / 2), question.points].map(val => (
                      <button
                        key={val}
                        onClick={() => {
                          setPoints(val);
                          setIsEditing(true);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          points === val
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    setIsEditing(true);
                  }}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Provide feedback for the student..."
                  className={`w-full px-3 py-2 border rounded-lg resize-none ${
                    isEditing ? 'border-indigo-300 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setFeedback(gradedResult?.feedback || '');
                        setPoints(gradedResult?.points || question.points);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="flex items-center">
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save Grade
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Override Grade
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
