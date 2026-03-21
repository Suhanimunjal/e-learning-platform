import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../ai.config';

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private anthropic: Anthropic;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.isConfigured = apiKey && apiKey !== 'your-anthropic-api-key' && apiKey.length > 20;
    
    if (this.isConfigured) {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
    } else {
      this.logger.warn('Anthropic API key not configured. AI features will be disabled.');
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required. Please set it in your .env file.');
    }
  }

  async generateStructuredResponse(prompt: string): Promise<any> {
    this.ensureConfigured();
    
    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSONResponse(content.text);
      }
      throw new Error('Invalid response type from Anthropic API');
    } catch (error) {
      this.logger.error('Error generating structured response:', error);
      throw error;
    }
  }

  async generateCourseOutline(topic: string): Promise<any> {
    this.ensureConfigured();
    
    try {
      const prompt = AI_CONFIG.prompts.courseOutline(topic);
      
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSONResponse(content.text);
      }
    } catch (error) {
      this.logger.error('Error generating course outline:', error);
      throw error;
    }
  }

  async generateLessonContent(
    moduleTitle: string,
    lessonTitle: string,
    description: string,
  ): Promise<any> {
    this.ensureConfigured();
    
    try {
      const prompt = AI_CONFIG.prompts.lessonContent(
        moduleTitle,
        lessonTitle,
        description,
      );

      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSONResponse(content.text);
      }
    } catch (error) {
      this.logger.error('Error generating lesson content:', error);
      throw error;
    }
  }

  async generateQuiz(lessonContent: string, lessonTitle: string): Promise<any> {
    this.ensureConfigured();
    
    try {
      const prompt = AI_CONFIG.prompts.quiz(lessonContent, lessonTitle);

      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSONResponse(content.text);
      }
    } catch (error) {
      this.logger.error('Error generating quiz:', error);
      throw error;
    }
  }

  async generateFlashcards(lessonContent: string, lessonTitle: string): Promise<any> {
    this.ensureConfigured();
    
    try {
      const prompt = AI_CONFIG.prompts.flashcards(lessonContent, lessonTitle);

      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSONResponse(content.text);
      }
    } catch (error) {
      this.logger.error('Error generating flashcards:', error);
      throw error;
    }
  }

  private parseJSONResponse(text: string): any {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // If parsing fails, return the raw text
        return { rawText: text };
      }
    }
    return { rawText: text };
  }
}
