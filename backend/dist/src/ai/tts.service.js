"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const common_1 = require("@nestjs/common");
const text_to_speech_1 = require("@google-cloud/text-to-speech");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let TTSService = class TTSService {
    constructor() {
        this.client = new text_to_speech_1.TextToSpeechClient();
        this.storagePath = path.join(process.cwd(), 'uploads', 'audio');
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
        }
    }
    async generateAudio(text, voiceConfig) {
        const request = {
            input: { text },
            voice: {
                languageCode: voiceConfig.languageCode,
                name: voiceConfig.name,
                ssmlGender: voiceConfig.ssmlGender,
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.95,
                pitch: 0,
                sampleRateHertz: 24000,
            },
        };
        const [response] = await this.client.synthesizeSpeech(request);
        const filename = `${(0, uuid_1.v4)()}.mp3`;
        const filepath = path.join(this.storagePath, filename);
        fs.writeFileSync(filepath, response.audioContent);
        const audioUrl = `/uploads/audio/${filename}`;
        const duration = this.estimateDuration(text);
        return {
            audioUrl,
            duration,
            transcript: text,
        };
    }
    async generatePreview(text, voiceId) {
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
                ssmlGender: voice.gender,
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.95,
                sampleRateHertz: 24000,
            },
        };
        const [response] = await this.client.synthesizeSpeech(request);
        const filename = `preview-${(0, uuid_1.v4)()}.mp3`;
        const filepath = path.join(this.storagePath, filename);
        fs.writeFileSync(filepath, response.audioContent);
        return `/uploads/audio/${filename}`;
    }
    getAvailableVoices() {
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
    getVoiceById(voiceId) {
        return this.getAvailableVoices().find(v => v.id === voiceId);
    }
    estimateDuration(text) {
        const wordsPerMinute = 150;
        const wordCount = text.split(/\s+/).length;
        return Math.ceil((wordCount / wordsPerMinute) * 60);
    }
    async deleteAudio(audioUrl) {
        const filename = audioUrl.split('/').pop();
        if (filename) {
            const filepath = path.join(this.storagePath, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }
    }
};
exports.TTSService = TTSService;
exports.TTSService = TTSService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TTSService);
//# sourceMappingURL=tts.service.js.map