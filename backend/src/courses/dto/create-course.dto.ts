import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

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
  @IsBoolean()
  published?: boolean = false;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
