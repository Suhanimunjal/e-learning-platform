import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  moduleId: string;
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  questions?: CreateQuestionDto[];
}
