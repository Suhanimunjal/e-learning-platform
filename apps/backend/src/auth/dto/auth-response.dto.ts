import { User } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  user: Partial<User>;
}
