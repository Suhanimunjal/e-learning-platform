import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    registerTeacher(registerTeacherDto: RegisterTeacherDto, idProof: any): Promise<{
        message: string;
        user: any;
    }>;
    login(loginDto: LoginDto): Promise<import("./dto/auth-response.dto").AuthResponseDto | {
        requiresOtp: boolean;
        message: string;
    }>;
    verifyOTP(body: {
        email: string;
        otp: string;
    }): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    resendOTP(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    adminOnly(): Promise<{
        message: string;
    }>;
}
