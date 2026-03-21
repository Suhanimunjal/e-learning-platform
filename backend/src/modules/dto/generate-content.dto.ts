import { IsString, MinLength, MaxLength } from 'class-validator';

export class GenerateContentDto {
  @IsString({ message: 'Topic must be a string' })
  @MinLength(3, { message: 'Topic must be at least 3 characters long' })
  @MaxLength(500, { message: 'Topic must not exceed 500 characters' })
  topic: string;
}
