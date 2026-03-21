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
export declare class TTSService {
    private client;
    private storagePath;
    constructor();
    generateAudio(text: string, voiceConfig: VoiceConfig): Promise<AudioResult>;
    generatePreview(text: string, voiceId: string): Promise<string>;
    getAvailableVoices(): Voice[];
    getVoiceById(voiceId: string): Voice | undefined;
    private estimateDuration;
    deleteAudio(audioUrl: string): Promise<void>;
}
