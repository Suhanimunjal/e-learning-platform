import { IsString, IsOptional } from 'class-validator';

export class UpdateContentBodyDto {
  content: any;
}

export class GenerateVideoBodyDto {
  @IsOptional()
  @IsString()
  voiceId?: string;
}

export class RejectVideoBodyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
