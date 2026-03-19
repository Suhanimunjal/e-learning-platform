import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface VerificationResult {
  verified: boolean;
  answer: string;
  explanation: string;
  sources: Source[];
  confidenceScore: number;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

@Injectable()
export class QuizVerificationService {
  private readonly duckDuckGoUrl = 'https://api.duckduckgo.com/';

  async verifyAnswer(question: string, answer: string): Promise<VerificationResult> {
    try {
      const searchQuery = `${question} ${answer}`;
      const searchResults = await this.searchInternet(searchQuery);
      
      const isVerified = this.checkVerification(searchResults, answer);
      const explanation = this.generateExplanation(searchResults, answer);
      const confidenceScore = this.calculateConfidence(searchResults, answer);

      return {
        verified: isVerified,
        answer,
        explanation,
        sources: searchResults.slice(0, 3),
        confidenceScore,
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        verified: false,
        answer,
        explanation: 'Unable to verify answer from internet sources',
        sources: [],
        confidenceScore: 0,
      };
    }
  }

  async searchInternet(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(this.duckDuckGoUrl, {
        params: {
          q: query,
          format: 'json',
          no_redirect: 1,
          no_html: 1,
          skip_disambig: 1,
        },
        timeout: 5000,
      });

      const results: SearchResult[] = [];

      if (response.data.AbstractText) {
        results.push({
          title: response.data.Heading || 'Wikipedia/DuckDuckGo',
          url: response.data.AbstractURL || '',
          snippet: response.data.AbstractText,
        });
      }

      if (response.data.RelatedTopics) {
        response.data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.substring(0, 100),
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  private checkVerification(results: SearchResult[], answer: string): boolean {
    if (results.length === 0) return false;

    const answerLower = answer.toLowerCase();
    
    for (const result of results) {
      const snippetLower = result.snippet.toLowerCase();
      if (snippetLower.includes(answerLower)) {
        return true;
      }
      
      const keywords = answerLower.split(' ').filter(word => word.length > 3);
      const matchCount = keywords.filter(word => snippetLower.includes(word)).length;
      if (matchCount >= keywords.length * 0.7) {
        return true;
      }
    }

    return false;
  }

  private generateExplanation(results: SearchResult[], answer: string): string {
    if (results.length === 0) {
      return 'Based on general knowledge, this answer appears to be correct.';
    }

    const relevantResult = results.find(r => 
      r.snippet.toLowerCase().includes(answer.toLowerCase())
    ) || results[0];

    if (relevantResult.snippet.length > 200) {
      return relevantResult.snippet.substring(0, 200) + '...';
    }
    
    return relevantResult.snippet;
  }

  private calculateConfidence(results: SearchResult[], answer: string): number {
    if (results.length === 0) return 0;

    let confidence = 50;
    
    if (results.some(r => r.snippet.toLowerCase().includes(answer.toLowerCase()))) {
      confidence += 30;
    }
    
    confidence += Math.min(results.length * 5, 20);
    
    return Math.min(confidence, 100);
  }

  async verifyMultipleChoice(
    question: string,
    options: string[],
    correctAnswer: string,
  ): Promise<{ verified: boolean; confidenceScore: number; sources: Source[] }> {
    const result = await this.verifyAnswer(question, correctAnswer);
    
    return {
      verified: result.verified,
      confidenceScore: result.confidenceScore,
      sources: result.sources,
    };
  }

  async batchVerifyQuestions(
    questions: Array<{ question: string; answer: string }>,
  ): Promise<VerificationResult[]> {
    const results = await Promise.all(
      questions.map(q => this.verifyAnswer(q.question, q.answer)),
    );
    return results;
  }
}
