import { IsString, IsOptional, IsArray, IsPositive, IsNumber, IsIn } from 'class-validator';

export class CreateQuestionDto {
  @IsString({ message: 'type must be a string' })
  @IsIn(['multiple_choice', 'short_answer', 'essay'], {
    message: "type must be one of: 'multiple_choice', 'short_answer', 'essay'",
  })
  type: string;

  @IsString({ message: 'text must be a string' })
  text: string;

  @IsOptional()
  @IsArray({ message: 'options must be an array' })
  options?: string[];

  @IsOptional()
  @IsString({ message: 'correctAnswer must be a string' })
  correctAnswer?: string;

  @IsOptional()
  @IsPositive({ message: 'points must be a positive number' })
  points?: number;

  @IsOptional()
  @IsNumber({}, { message: 'order must be a number' })
  order?: number;
}
