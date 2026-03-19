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
export declare class QuizVerificationService {
    private readonly duckDuckGoUrl;
    verifyAnswer(question: string, answer: string): Promise<VerificationResult>;
    searchInternet(query: string): Promise<SearchResult[]>;
    private checkVerification;
    private generateExplanation;
    private calculateConfidence;
    verifyMultipleChoice(question: string, options: string[], correctAnswer: string): Promise<{
        verified: boolean;
        confidenceScore: number;
        sources: Source[];
    }>;
    batchVerifyQuestions(questions: Array<{
        question: string;
        answer: string;
    }>): Promise<VerificationResult[]>;
}
