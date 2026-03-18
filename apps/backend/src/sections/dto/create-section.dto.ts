import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  title: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsNumber()
  order?: number = 0;
}
