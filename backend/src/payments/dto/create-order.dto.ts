import { IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  courseId: string;

  @IsNumber()
  amount: number;
}
