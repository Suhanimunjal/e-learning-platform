import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private otpService;
    private emailService;
    private activityLogService;
    private readonly logger;
    private pendingLogins;
    private loginAttempts;
    constructor(prisma: PrismaService, jwtService: JwtService, otpService: OtpService, emailService: EmailService, activityLogService: ActivityLogService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    private recordFailedAttempt;
    private resetLoginAttempts;
    private isLockedOut;
    private requiresOtpDueToFailedAttempts;
    initiateLogin(loginDto: LoginDto): Promise<{
        requiresOtp: boolean;
        message?: string;
    }>;
    verifyLoginOTP(email: string, otp: string): Promise<AuthResponseDto>;
    resendLoginOTP(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<AuthResponseDto | {
        requiresOtp: boolean;
        message: string;
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        organizationId: string;
    }>;
    private excludePassword;
}
