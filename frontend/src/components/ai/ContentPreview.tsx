'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, Edit } from 'lucide-react';
import Button from '../ui/Button';

interface StructuredContent {
  topic: string;
  title: string;
  introduction: any;
  theory: any;
  concepts: any[];
  examples: any[];
  practice: any;
  quiz: any;
  assignment: any;
  summary: any;
  mistakes: any[];
  advanced: any;
  resources: any[];
  nextPreview: string;
}

interface ContentPreviewProps {
  content: StructuredContent;
  onEditSection?: (section: string, data: any) => void;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onRequestChanges?: () => void;
  isApproving?: boolean;
}

export default function ContentPreview({
  content,
  onEditSection,
  onApprove,
  onReject,
  onRequestChanges,
  isApproving = false,
}: ContentPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']));
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    { id: 'introduction', title: '📚 Introduction', data: content.introduction },
    { id: 'theory', title: '🧠 Theory', data: content.theory },
    { id: 'concepts', title: '💡 Core Concepts', data: content.concepts },
    { id: 'examples', title: '🎯 Examples', data: content.examples },
    { id: 'practice', title: '✍️ Practice & Lab', data: content.practice },
    { id: 'quiz', title: '❓ Quiz', data: content.quiz },
    { id: 'assignment', title: '📝 Assignment', data: content.assignment },
    { id: 'summary', title: '📋 Summary', data: content.summary },
    { id: 'mistakes', title: '⚠️ Common Mistakes', data: content.mistakes },
    { id: 'advanced', title: '🚀 Advanced Insights', data: content.advanced },
    { id: 'resources', title: '📖 Resources', data: content.resources },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-gray-600">
          Review and edit the generated content before approving
        </p>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 last:border-b-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800">{section.title}</span>
              {expandedSections.has(section.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4 bg-gray-50">
                <div className="prose prose-sm max-w-none">
                  {renderSectionContent(section.id, section.data)}
                </div>
                {onEditSection && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditSection(section.id, section.data)}
                    className="mt-2 flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Section
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            {showRejectForm ? (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      onReject(rejectReason);
                      setShowRejectForm(false);
                    }}
                    disabled={isApproving}
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowRejectForm(false)}
                    disabled={isApproving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowRejectForm(true)}
                disabled={isApproving}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Request Changes
              </Button>
            )}
          </div>

          <Button
            onClick={onApprove}
            disabled={isApproving}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Approve Content
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderSectionContent(sectionId: string, data: any) {
  if (!data) return <p className="text-gray-500 italic">No content available</p>;

  switch (sectionId) {
    case 'introduction':
      return (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">What is it?</h4>
            <p className="text-gray-600">{data.whatIsIt}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Why Important?</h4>
            <p className="text-gray-600">{data.whyImportant}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Learning Objectives</h4>
            <ul className="list-disc list-inside text-gray-600">
              {data.learningObjectives?.map((obj: string, i: number) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'theory':
      return (
        <div className="space-y-3">
          {data.definitions?.map((def: any, i: number) => (
            <div key={i}>
              <h4 className="font-semibold text-sm text-gray-700">{def.term}</h4>
              <p className="text-gray-600 text-sm">{def.explanation}</p>
            </div>
          ))}
          {data.misconceptions?.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-sm text-yellow-800 mb-2">⚠️ Common Misconceptions</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {data.misconceptions.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

    case 'concepts':
      return (
        <div className="space-y-4">
          {data.map((concept: any, i: number) => (
            <div key={i} className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">{concept.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{concept.explanation}</p>
              <div className="bg-blue-50 p-2 rounded text-sm">
                <span className="font-medium text-blue-700">💡 Analogy: </span>
                <span className="text-blue-600">{concept.analogy}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'examples':
      return (
        <div className="space-y-4">
          {data.map((example: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  example.level === 'beginner' ? 'bg-green-100 text-green-700' :
                  example.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {example.level}
                </span>
                <h4 className="font-semibold text-gray-800">{example.title}</h4>
              </div>
              <p className="text-gray-600 text-sm mb-2">{example.description}</p>
              {example.code && (
                <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto mb-2">
                  <code>{example.code}</code>
                </pre>
              )}
              <p className="text-sm text-gray-600 italic">{example.explanation}</p>
            </div>
          ))}
        </div>
      );

    case 'quiz':
      return (
        <div className="space-y-3">
          {data.questions?.map((q: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <p className="font-medium text-gray-800 mb-2">{i + 1}. {q.question}</p>
              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-1 ml-4">
                  {q.options.map((opt: string, j: number) => (
                    <div key={j} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      {opt === q.correctAnswer ? '✓' : '○'} {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'summary':
      return (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Points</h4>
            <ul className="list-disc list-inside text-gray-600 text-sm">
              {data.keyPoints?.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Remember</h4>
            <ul className="list-disc list-inside text-gray-600 text-sm">
              {data.rememberPoints?.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'resources':
      return (
        <div className="space-y-2">
          {data.map((resource: any, i: number) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                resource.type === 'article' ? 'bg-blue-100 text-blue-700' :
                resource.type === 'documentation' ? 'bg-green-100 text-green-700' :
                resource.type === 'video' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {resource.type}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{resource.title}</p>
                <p className="text-xs text-gray-500">{resource.url}</p>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
  }
}
