import { IsString, IsUUID, IsOptional, IsPositive, Min, Max, IsBoolean, IsArray, Length } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  @IsUUID('4', { message: 'moduleId must be a valid UUID' })
  moduleId: string;

  @IsString({ message: 'title must be a string' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  @IsOptional()
  @IsPositive({ message: 'timeLimit must be a positive number (in minutes)' })
  timeLimit?: number;

  @IsOptional()
  @IsPositive({ message: 'maxAttempts must be at least 1' })
  maxAttempts?: number;

  @IsOptional()
  @Min(0, { message: 'passingScore must be at least 0' })
  @Max(100, { message: 'passingScore must not exceed 100' })
  passingScore?: number;

  @IsOptional()
  @IsBoolean({ message: 'shuffleQuestions must be true or false' })
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsArray({ message: 'questions must be an array' })
  questions?: CreateQuestionDto[];
}
