export declare class UpdateQuestionDto {
    type?: string;
    text?: string;
    options?: any;
    correctAnswer?: string;
    points?: number;
    order?: number;
}
export declare class UpdateQuizDto {
    title?: string;
    description?: string;
    timeLimit?: number;
    maxAttempts?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    questions?: UpdateQuestionDto[];
}
