import { IsString, IsOptional } from 'class-validator';

export class GenerateVideoDto {
  @IsString()
  moduleId: string;

  @IsOptional()
  @IsString()
  customScript?: string;
}

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  script?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
