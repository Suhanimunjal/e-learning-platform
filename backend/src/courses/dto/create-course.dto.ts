import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CourseMaterialDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsString()
  type: string; // 'pdf', 'ppt', 'doc', 'video', 'link'
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  videoIntro?: string;

  @IsOptional()
  @IsNumber()
  price?: number = 0;

  @IsOptional()
  @IsString()
  status?: string; // PENDING_APPROVAL, APPROVED, REJECTED, BLACKLISTED

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseMaterialDto)
  materials?: CourseMaterialDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  youtubeLinks?: string[];
}
