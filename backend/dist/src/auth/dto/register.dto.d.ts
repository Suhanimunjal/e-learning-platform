import { Role } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
    role?: Role;
    phone?: string;
    rollNo?: string;
    year?: string;
    branch?: string;
    course?: string;
}
