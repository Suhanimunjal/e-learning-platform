import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @IsString()
  questionId: string;

  answer: string | string[];
}

export class SubmitQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];

  @IsNumber()
  timeSpent: number;
}

export class GradeItemDto {
  @IsNumber()
  points: number;

  @IsString()
  feedback: string;
}

export class GradeQuizAttemptDto {
  grades: Record<string, GradeItemDto>;
}
