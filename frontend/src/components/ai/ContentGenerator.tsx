'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  BookOpen, 
  CheckCircle, 
  Edit3, 
  Save, 
  X,
  AlertCircle,
  Copy
} from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

type ToneOption = 'formal' | 'casual' | 'simplified';
type ContentType = 'assignment' | 'examples' | 'summary';

interface GeneratedContent {
  type: ContentType;
  title: string;
  content: string;
  tone: ToneOption;
}

interface ContentGeneratorProps {
  courseId?: string;
  moduleId?: string;
  onSave?: (content: GeneratedContent) => void;
}

export default function ContentGenerator({ courseId, moduleId, onSave }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<ContentType>('assignment');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<ToneOption>('formal');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or description');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      let response;
      
      if (contentType === 'assignment') {
        response = await api.post('/ai/generate-assignment', { topic, tone });
      } else if (contentType === 'examples') {
        response = await api.post('/ai/generate-examples', { topic, tone });
      } else {
        response = await api.post('/ai/summarize-content', { content: topic, tone });
      }

      const data = response.data?.data || response.data;
      
      let title = 'Generated Content';
      let content = '';

      if (contentType === 'assignment') {
        title = data?.title || `Assignment: ${topic}`;
        content = data?.content || data?.problemStatement || JSON.stringify(data, null, 2);
      } else if (contentType === 'examples') {
        title = data?.title || `Examples: ${topic}`;
        content = data?.content || JSON.stringify(data, null, 2);
      } else {
        title = `Summary: ${topic}`;
        content = data?.summary || data?.content || JSON.stringify(data, null, 2);
      }

      const generated: GeneratedContent = {
        type: contentType,
        title,
        content,
        tone,
      };

      setGeneratedContent(generated);
      setEditingContent(content);
      setShowPreview(true);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editingContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave && generatedContent) {
      onSave({
        ...generatedContent,
        content: editingContent,
      });
    }
    setShowPreview(false);
  };

  const handleEdit = () => {
    if (generatedContent) {
      setEditingContent(generatedContent.content);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you want to generate?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'assignment', label: 'Assignment', icon: FileText },
            { id: 'examples', label: 'Examples', icon: BookOpen },
            { id: 'summary', label: 'Summary', icon: Sparkles },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setContentType(item.id as ContentType)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                contentType === item.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic or Lesson Description
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`Describe the topic for ${contentType} generation...`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Writing Tone
        </label>
        <div className="flex gap-3">
          {[
            { id: 'formal', label: 'Formal', desc: 'Professional & Academic' },
            { id: 'casual', label: 'Casual', desc: 'Friendly & Conversational' },
            { id: 'simplified', label: 'Simplified', desc: 'Easy & Visual' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTone(item.id as ToneOption)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                tone === item.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`font-medium ${tone === item.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                {item.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full"
        size="lg"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating {contentType === 'examples' ? 'examples' : contentType}...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </>
        )}
      </Button>

      {showPreview && generatedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{generatedContent.title}</h3>
                <p className="text-sm text-gray-500">
                  {contentType.charAt(0).toUpperCase() + contentType.slice(1)} - {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
