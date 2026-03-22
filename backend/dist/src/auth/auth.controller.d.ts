import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { UpdateProfileDto, ChangePasswordDto, ChangePasswordOtpDto } from './dto/profile.dto';
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
    verifyOTP(body: VerifyOtpDto): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    resendOTP(body: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string;
        rollNo: string;
        year: string;
        branch: string;
        course: string;
        organizationId: string;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changePasswordWithOtp(req: any, dto: ChangePasswordOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendPasswordOtp(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    adminOnly(): Promise<{
        message: string;
    }>;
}
