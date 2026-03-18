import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ModuleType } from '@prisma/client';

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsString()
  sectionId: string;

  @IsEnum(ModuleType)
  type: ModuleType;

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
  order?: number = 0;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean = false;
}
