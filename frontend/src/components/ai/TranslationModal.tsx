'use client';

import { useState, useEffect } from 'react';
import { 
  Languages, 
  Loader2, 
  X, 
  Copy, 
  Check, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  contentType?: 'lesson' | 'assignment' | 'quiz';
  contentId?: string;
  onApply?: (translatedContent: string, targetLang: string) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
];

export default function TranslationModal({ 
  isOpen, 
  onClose, 
  initialContent = '',
  onApply 
}: TranslationModalProps) {
  const [sourceText, setSourceText] = useState(initialContent);
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSourceText(initialContent);
      setTranslatedText('');
      setError(null);
    }
  }, [isOpen, initialContent]);

  const handleDetectLanguage = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to detect language');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const response = await api.post('/ai/detect-language', { text: sourceText });
      const data = response.data?.data || response.data;
      setDetectedLanguage(`${data.language || 'Unknown'} (${Math.round((data.confidence || 0) * 100)}% confidence)`);
    } catch (err: any) {
      setError(err.message || 'Failed to detect language');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setError(null);
    setIsTranslating(true);

    try {
      const response = await api.post('/ai/translate', { 
        text: sourceText, 
        targetLang: selectedLanguage.name,
        sourceLang: detectedLanguage.split(' ')[0] || undefined
      });
      
      const data = response.data?.data || response.data;
      setTranslatedText(data.translated || JSON.stringify(data, null, 2));
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(translatedText, selectedLanguage.code);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Translation</h3>
              <p className="text-sm text-gray-500">Translate your content to multiple languages</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Source Text</label>
                <button 
                  onClick={handleDetectLanguage}
                  disabled={isDetecting}
                  className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                >
                  {isDetecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Detect Language
                    </>
                  )}
                </button>
              </div>
              {detectedLanguage && (
                <div className="text-xs text-gray-500 mb-2">{detectedLanguage}</div>
              )}
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !sourceText.trim()}
                className="w-full"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    Translate
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Target Language</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selectedLanguage.code === lang.code
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {translatedText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Translation</label>
                    <button
                      onClick={handleCopy}
                      className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="w-full h-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{translatedText}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!translatedText}
          >
            Apply Translation
          </Button>
        </div>
      </div>
    </div>
  );
}