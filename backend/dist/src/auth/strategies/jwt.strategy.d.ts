import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: string;
    }>;
}
export {};
