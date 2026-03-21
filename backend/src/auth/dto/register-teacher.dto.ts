import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterTeacherDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(2)
  organizationName: string;

  @IsString()
  @MinLength(2)
  expertise: string;

  @IsString()
  @MinLength(8)
  password: string;
}
