import { User } from '@prisma/client';
export declare class AuthResponseDto {
    accessToken: string;
    user: Partial<User>;
}
