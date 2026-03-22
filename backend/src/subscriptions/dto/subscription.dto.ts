import { IsString, IsNumber, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  billingCycle: string; // 'monthly', 'quarterly', 'yearly'

  @IsOptional()
  features?: any;

  @IsOptional()
  @IsNumber()
  maxCourses?: number;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsString()
  supportLevel?: string;

  @IsOptional()
  @IsString()
  razorpayPlanId?: string;
}

export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  features?: any;

  @IsOptional()
  @IsNumber()
  maxCourses?: number;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsString()
  supportLevel?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSubscriptionDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  razorpaySubscriptionId?: string;
}
