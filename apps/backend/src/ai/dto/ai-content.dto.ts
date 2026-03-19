import { IsString, IsOptional, IsIn } from 'class-validator';

export class GenerateAssignmentDto {
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  tone?: string;
}

export class GenerateExamplesDto {
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  tone?: string;
}

export class SummarizeContentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  tone?: string;
}

export class TranslateTextDto {
  @IsString()
  text: string;

  @IsString()
  targetLang: string;

  @IsOptional()
  @IsString()
  sourceLang?: string;
}

export class DetectLanguageDto {
  @IsString()
  text: string;
}

export class ChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;
}

export class TrackProgressDto {
  @IsString()
  studentId: string;

  @IsString()
  topic: string;

  @IsString()
  score: number;
}
