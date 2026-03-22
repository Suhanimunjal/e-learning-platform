import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  otp: string;
}

export class ResendOtpDto {
  @IsEmail()
  email: string;
}
