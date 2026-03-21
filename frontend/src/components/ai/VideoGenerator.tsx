'use client';

import { useState } from 'react';
import { Video, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface VideoStatus {
  moduleId: string;
  topic: string;
  contentStatus: 'PENDING' | 'GENERATING' | 'GENERATED' | 'APPROVED' | 'REJECTED';
  videoStatus: 'PENDING' | 'GENERATING' | 'APPROVED' | 'REJECTED' | 'FAILED';
  audioUrl: string | null;
  videoUrl: string | null;
  transcript: string | null;
  retryCount: number;
  canRetry: boolean;
  canGenerateVideo: boolean;
  hasVideo?: boolean; // CRITICAL: Include hasVideo flag
}

interface VideoGeneratorProps {
  moduleId: string;
  videoStatus: VideoStatus;
  onGenerate: (voiceId?: string) => Promise<void>;
  onPreview?: () => void;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  isGenerating?: boolean;
  isApproving?: boolean;
}

export default function VideoGenerator({
  moduleId,
  videoStatus,
  onGenerate,
  onPreview,
  onApprove,
  onReject,
  isGenerating = false,
  isApproving = false,
}: VideoGeneratorProps) {
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('neural2-female-1');

  const voices = [
    { id: 'neural2-female-1', name: 'Neural2 Female (US)', type: 'Neural2' },
    { id: 'neural2-male-1', name: 'Neural2 Male (US)', type: 'Neural2' },
    { id: 'neural2-female-2', name: 'Neural2 Female (UK)', type: 'Neural2' },
    { id: 'waveNet-female-1', name: 'WaveNet Female', type: 'WaveNet' },
    { id: 'waveNet-male-1', name: 'WaveNet Male', type: 'WaveNet' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'GENERATING':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Video className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'GENERATING':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Video Approved';
      case 'REJECTED':
        return 'Video Rejected';
      case 'FAILED':
        return 'Video Generation Failed';
      case 'GENERATING':
        return 'Generating Video...';
      case 'PENDING':
        return 'Video Pending';
      default:
        return status;
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getStatusColor(videoStatus.videoStatus)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6" />
          <h3 className="font-semibold text-lg">AI Video Generation</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(videoStatus.videoStatus)}
          <span className="font-medium">{getStatusText(videoStatus.videoStatus)}</span>
        </div>
      </div>

      {!videoStatus.canGenerateVideo && videoStatus.contentStatus !== 'APPROVED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Content Not Approved</p>
              <p className="text-xs text-yellow-700 mt-1">
                You must approve the content before generating the video.
              </p>
            </div>
          </div>
        </div>
      )}

      {videoStatus.canGenerateVideo && videoStatus.videoStatus === 'PENDING' && (
        <div className="space-y-3">
          <p className="text-sm">
            Generate AI narration audio for this module. You have{' '}
            <span className="font-semibold">{videoStatus.retryCount}/2 retries</span> remaining.
          </p>

          {!showVoiceSelector ? (
            <Button
              onClick={() => setShowVoiceSelector(true)}
              disabled={isGenerating || !videoStatus.canRetry}
              className="w-full flex items-center justify-center gap-2"
            >
              <Video className="h-4 w-4" />
              Generate Video
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Select Voice</label>
                <div className="space-y-2">
                  {voices.map((voice) => (
                    <label
                      key={voice.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedVoice === voice.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="voice"
                        value={voice.id}
                        checked={selectedVoice === voice.id}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{voice.name}</p>
                        <p className="text-xs text-gray-500">{voice.type} Voice</p>
                      </div>
                      {selectedVoice === voice.id && (
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onGenerate(selectedVoice)}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowVoiceSelector(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!videoStatus.canRetry && (
            <p className="text-xs text-red-600 text-center">
              Maximum retries reached. Please regenerate content to continue.
            </p>
          )}
        </div>
      )}

      {videoStatus.videoStatus === 'GENERATING' && (
        <div className="text-center py-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-medium">Generating your AI video...</p>
          <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
        </div>
      )}

      {videoStatus.videoStatus === 'APPROVED' && videoStatus.audioUrl && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Video Generated Successfully!</span>
            </div>
            <p className="text-sm text-green-700">
              Your AI narration is ready. Preview it below or approve.
            </p>
          </div>

          {onPreview && (
            <Button
              onClick={onPreview}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              Preview Audio
            </Button>
          )}

          {onApprove && (
            <Button
              onClick={onApprove}
              disabled={isApproving}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Video
            </Button>
          )}
        </div>
      )}

      {videoStatus.videoStatus === 'REJECTED' && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Video Rejected</span>
            </div>
            {videoStatus.retryCount > 0 && (
              <p className="text-sm text-red-700">
                You have {videoStatus.retryCount} retry remaining.
              </p>
            )}
          </div>

          <Button
            onClick={() => onGenerate()}
            disabled={isGenerating || !videoStatus.canRetry}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate Video
          </Button>
        </div>
      )}

      {videoStatus.retryCount > 0 && videoStatus.videoStatus !== 'PENDING' && (
        <p className="text-xs text-center text-gray-500 mt-2">
          Retries used: {videoStatus.retryCount}/2
        </p>
      )}
    </div>
  );
}
