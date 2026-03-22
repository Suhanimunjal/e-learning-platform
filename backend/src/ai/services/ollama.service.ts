import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private baseURL: string;
  private model: string;
  private apiKey: string;
  private isConfigured: boolean;

  constructor() {
    this.baseURL = process.env.OLLAMA_API_URL || 'https://api.ollama.com/v1';
    this.model = process.env.OLLAMA_MODEL || 'minimax-m2.7:cloud';
    this.apiKey = process.env.OLLAMA_API_KEY || '';
    this.isConfigured = !!(this.apiKey && this.baseURL);

    this.logger.log(`Ollama Service initialized`);
    this.logger.log(`Model: ${this.model}`);
    this.logger.log(`API URL: ${this.baseURL}`);
    this.logger.log(`API Key configured: ${!!this.apiKey}`);
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error('Ollama API is not configured. Please set OLLAMA_API_KEY in your .env file.');
    }
  }

  async generateResponse(prompt: string): Promise<any> {
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
    } catch (error) {
      this.logger.error('Error calling Ollama:', error);
      throw error;
    }
  }

  async generateStructuredResponse(prompt: string): Promise<any> {
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
    } catch (error) {
      this.logger.error('Error generating structured response:', error);
      throw error;
    }
  }

  private parseJSONResponse(text: string): any {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return { rawText: text };
      }
    }
    return { rawText: text };
  }
}