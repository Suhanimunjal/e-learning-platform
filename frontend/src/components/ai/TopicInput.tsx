'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

interface TopicInputProps {
  moduleId: string;
  currentTopic?: string;
  onGenerate: (topic: string) => Promise<void>;
  disabled?: boolean;
  isGenerating?: boolean;
}

export default function TopicInput({
  moduleId,
  currentTopic,
  onGenerate,
  disabled = false,
  isGenerating = false,
}: TopicInputProps) {
  const [topic, setTopic] = useState(currentTopic || '');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (topic.length > 200) {
      setError('Topic must be less than 200 characters');
      return;
    }

    setError('');
    try {
      await onGenerate(topic);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-800">AI Content Generation</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Topic for this Module
          </label>
          <textarea
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError('');
            }}
            placeholder="e.g., Introduction to JavaScript Variables and Data Types"
            disabled={disabled || isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={3}
          />
          <div className="flex justify-between items-center mt-1">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <span className="text-xs text-gray-500 ml-auto">
              {topic.length}/200
            </span>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={disabled || isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate AI Content
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          AI will generate comprehensive content including theory, examples, practice exercises, and quiz questions
        </p>
      </div>
    </div>
  );
}
