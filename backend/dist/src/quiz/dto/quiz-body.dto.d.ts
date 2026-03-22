export declare class QuizAnswerDto {
    questionId: string;
    answer: string | string[];
}
export declare class SubmitQuizDto {
    answers: QuizAnswerDto[];
    timeSpent: number;
}
export declare class GradeItemDto {
    points: number;
    feedback: string;
}
export declare class GradeQuizAttemptDto {
    grades: Record<string, GradeItemDto>;
}
