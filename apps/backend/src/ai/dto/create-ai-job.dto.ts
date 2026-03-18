import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateAIGenerationJobDto {
  @IsString()
  topic: string;

  @IsEnum(['course', 'quiz', 'lesson'])
  type: 'course' | 'quiz' | 'lesson';
}
