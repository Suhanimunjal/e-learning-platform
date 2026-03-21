"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizVerificationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let QuizVerificationService = class QuizVerificationService {
    constructor() {
        this.duckDuckGoUrl = 'https://api.duckduckgo.com/';
    }
    async verifyAnswer(question, answer) {
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
        }
        catch (error) {
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
    async searchInternet(query) {
        try {
            const response = await axios_1.default.get(this.duckDuckGoUrl, {
                params: {
                    q: query,
                    format: 'json',
                    no_redirect: 1,
                    no_html: 1,
                    skip_disambig: 1,
                },
                timeout: 5000,
            });
            const results = [];
            if (response.data.AbstractText) {
                results.push({
                    title: response.data.Heading || 'Wikipedia/DuckDuckGo',
                    url: response.data.AbstractURL || '',
                    snippet: response.data.AbstractText,
                });
            }
            if (response.data.RelatedTopics) {
                response.data.RelatedTopics.slice(0, 5).forEach((topic) => {
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
        }
        catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }
    checkVerification(results, answer) {
        if (results.length === 0)
            return false;
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
    generateExplanation(results, answer) {
        if (results.length === 0) {
            return 'Based on general knowledge, this answer appears to be correct.';
        }
        const relevantResult = results.find(r => r.snippet.toLowerCase().includes(answer.toLowerCase())) || results[0];
        if (relevantResult.snippet.length > 200) {
            return relevantResult.snippet.substring(0, 200) + '...';
        }
        return relevantResult.snippet;
    }
    calculateConfidence(results, answer) {
        if (results.length === 0)
            return 0;
        let confidence = 50;
        if (results.some(r => r.snippet.toLowerCase().includes(answer.toLowerCase()))) {
            confidence += 30;
        }
        confidence += Math.min(results.length * 5, 20);
        return Math.min(confidence, 100);
    }
    async verifyMultipleChoice(question, options, correctAnswer) {
        const result = await this.verifyAnswer(question, correctAnswer);
        return {
            verified: result.verified,
            confidenceScore: result.confidenceScore,
            sources: result.sources,
        };
    }
    async batchVerifyQuestions(questions) {
        const results = await Promise.all(questions.map(q => this.verifyAnswer(q.question, q.answer)));
        return results;
    }
};
exports.QuizVerificationService = QuizVerificationService;
exports.QuizVerificationService = QuizVerificationService = __decorate([
    (0, common_1.Injectable)()
], QuizVerificationService);
//# sourceMappingURL=quiz-verification.service.js.map