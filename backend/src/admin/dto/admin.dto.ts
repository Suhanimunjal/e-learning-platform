import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterTeacherBodyDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RejectUserBodyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BlacklistUserBodyDto {
  @IsString()
  @MinLength(1)
  reason: string;
}

export class RejectCourseBodyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BlacklistCourseBodyDto {
  @IsString()
  @MinLength(1)
  reason: string;
}
