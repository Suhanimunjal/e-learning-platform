import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}
