import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ModuleType, ContentItemType } from '@prisma/client';

export class ContentItemDto {
  @IsEnum(ContentItemType)
  type: ContentItemType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  metadata?: any;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  contentItems?: ContentItemDto[];
}
