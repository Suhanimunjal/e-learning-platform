import { IsInt, IsString, Max, Min } from 'class-validator';

export class GenerateAiCourseDto {
  @IsString()
  courseName: string;

  @IsString()
  difficulty: string;

  @IsInt()
  @Min(10)
  @Max(30)
  moduleCount: number;
}
