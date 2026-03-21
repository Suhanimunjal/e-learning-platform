import { UpdateQuestionDto } from './update-question.dto';
export declare class UpdateQuizDto {
    title?: string;
    description?: string;
    timeLimit?: number;
    maxAttempts?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    questions?: UpdateQuestionDto[];
}
