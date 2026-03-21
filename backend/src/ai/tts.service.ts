import { Injectable } from '@nestjs/common';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface VoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

export interface AudioResult {
  audioUrl: string;
  duration: number;
  transcript: string;
}

export interface Voice {
  id: string;
  name: string;
  languageCode: string;
  gender: string;
  type: 'Standard' | 'WaveNet' | 'Neural2';
}

@Injectable()
export class TTSService {
  private client: TextToSpeechClient;
  private storagePath: string;

  constructor() {
    this.client = new TextToSpeechClient();
    this.storagePath = path.join(process.cwd(), 'uploads', 'audio');
    
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async generateAudio(text: string, voiceConfig: VoiceConfig): Promise<AudioResult> {
    const request = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender as any,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.95,
        pitch: 0,
        sampleRateHertz: 24000,
      },
    };

    const [response] = await this.client.synthesizeSpeech(request);
    
    const filename = `${uuidv4()}.mp3`;
    const filepath = path.join(this.storagePath, filename);
    
    fs.writeFileSync(filepath, response.audioContent as Buffer);
    
    const audioUrl = `/uploads/audio/${filename}`;
    const duration = this.estimateDuration(text);

    return {
      audioUrl,
      duration,
      transcript: text,
    };
  }

  async generatePreview(text: string, voiceId: string): Promise<string> {
    const previewText = text.slice(0, 500);
    const voice = this.getVoiceById(voiceId);
    
    if (!voice) {
      throw new Error('Voice not found');
    }

    const request = {
      input: { text: previewText },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.gender as any,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.95,
        sampleRateHertz: 24000,
      },
    };

    const [response] = await this.client.synthesizeSpeech(request);
    
    const filename = `preview-${uuidv4()}.mp3`;
    const filepath = path.join(this.storagePath, filename);
    
    fs.writeFileSync(filepath, response.audioContent as Buffer);
    
    return `/uploads/audio/${filename}`;
  }

  getAvailableVoices(): Voice[] {
    return [
      {
        id: 'neural2-female-1',
        name: 'en-US-Neural2-F',
        languageCode: 'en-US',
        gender: 'FEMALE',
        type: 'Neural2',
      },
      {
        id: 'neural2-male-1',
        name: 'en-US-Neural2-D',
        languageCode: 'en-US',
        gender: 'MALE',
        type: 'Neural2',
      },
      {
        id: 'neural2-female-2',
        name: 'en-GB-Neural2-F',
        languageCode: 'en-GB',
        gender: 'FEMALE',
        type: 'Neural2',
      },
      {
        id: 'waveNet-female-1',
        name: 'en-US-Wavenet-F',
        languageCode: 'en-US',
        gender: 'FEMALE',
        type: 'WaveNet',
      },
      {
        id: 'waveNet-male-1',
        name: 'en-US-Wavenet-D',
        languageCode: 'en-US',
        gender: 'MALE',
        type: 'WaveNet',
      },
    ];
  }

  getVoiceById(voiceId: string): Voice | undefined {
    return this.getAvailableVoices().find(v => v.id === voiceId);
  }

  private estimateDuration(text: string): number {
    const wordsPerMinute = 150;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }

  async deleteAudio(audioUrl: string): Promise<void> {
    const filename = audioUrl.split('/').pop();
    if (filename) {
      const filepath = path.join(this.storagePath, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }
}
