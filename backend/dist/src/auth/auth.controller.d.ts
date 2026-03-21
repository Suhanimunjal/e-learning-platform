import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    login(loginDto: LoginDto): Promise<import("./dto/auth-response.dto").AuthResponseDto | {
        requiresOtp: boolean;
        message: string;
    }>;
    verifyOTP(body: {
        email: string;
        otp: string;
    }): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    getProfile(req: any): Promise<any>;
    adminOnly(): Promise<{
        message: string;
    }>;
}
