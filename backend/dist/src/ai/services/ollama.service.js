"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OllamaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const common_1 = require("@nestjs/common");
let OllamaService = OllamaService_1 = class OllamaService {
    constructor() {
        this.logger = new common_1.Logger(OllamaService_1.name);
        this.baseURL = process.env.OLLAMA_API_URL || 'https://api.ollama.com/v1';
        this.model = process.env.OLLAMA_MODEL || 'minimax-m2.7:cloud';
        this.apiKey = process.env.OLLAMA_API_KEY || '';
        this.isConfigured = !!(this.apiKey && this.baseURL);
        this.logger.log(`Ollama Service initialized`);
        this.logger.log(`Model: ${this.model}`);
        this.logger.log(`API URL: ${this.baseURL}`);
        this.logger.log(`API Key configured: ${!!this.apiKey}`);
    }
    ensureConfigured() {
        if (!this.isConfigured) {
            throw new Error('Ollama API is not configured. Please set OLLAMA_API_KEY in your .env file.');
        }
    }
    async generateResponse(prompt) {
        this.ensureConfigured();
        try {
            this.logger.log(`Generating response with model ${this.model}...`);
            const response = await fetch(`${this.baseURL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                    },
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Ollama API error: ${response.status} - ${errorText}`);
                throw new Error(`Ollama API error: ${response.status}`);
            }
            const data = await response.json();
            this.logger.log('Response generated successfully');
            return data;
        }
        catch (error) {
            this.logger.error('Error calling Ollama:', error);
            throw error;
        }
    }
    async generateStructuredResponse(prompt) {
        this.ensureConfigured();
        try {
            this.logger.log(`Generating structured response with model ${this.model}...`);
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    stream: false,
                    options: {
                        temperature: 0.3,
                        top_p: 0.9,
                    },
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Ollama API error: ${response.status} - ${errorText}`);
                throw new Error(`Ollama API error: ${response.status}`);
            }
            const data = await response.json();
            this.logger.log('Response generated successfully');
            const text = data.message?.content || data.response || JSON.stringify(data);
            return this.parseJSONResponse(text);
        }
        catch (error) {
            this.logger.error('Error generating structured response:', error);
            throw error;
        }
    }
    parseJSONResponse(text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            }
            catch (e) {
                return { rawText: text };
            }
        }
        return { rawText: text };
    }
};
exports.OllamaService = OllamaService;
exports.OllamaService = OllamaService = OllamaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OllamaService);
//# sourceMappingURL=ollama.service.js.map