"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const otp_service_1 = require("../common/services/otp.service");
const email_service_1 = require("../common/services/email.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000;
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, otpService, emailService, activityLogService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.activityLogService = activityLogService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.pendingLogins = new Map();
        this.loginAttempts = new Map();
    }
    async register(registerDto) {
        const { email, password, name, role, phone, rollNo, year, branch, course } = registerDto;
        if (role === client_1.Role.TEACHER || role === client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Teachers and admins can only be created by administrators');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: client_1.Role.STUDENT,
                status: client_1.UserStatus.PENDING_APPROVAL,
                phone,
                rollNo,
                year,
                branch,
                course,
            },
        });
        await this.activityLogService.log({
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: user.id,
            targetUserId: user.id,
            metadata: { email: user.email, role: user.role },
        });
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: this.excludePassword(user),
        };
    }
    recordFailedAttempt(email) {
        const attempt = this.loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
        if (attempt.lastAttempt && (Date.now() - attempt.lastAttempt.getTime()) > LOCKOUT_DURATION) {
            attempt.count = 0;
        }
        attempt.count += 1;
        attempt.lastAttempt = new Date();
        if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
            attempt.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        }
        this.loginAttempts.set(email, attempt);
        return attempt.count;
    }
    resetLoginAttempts(email) {
        this.loginAttempts.delete(email);
    }
    isLockedOut(email) {
        const attempt = this.loginAttempts.get(email);
        if (!attempt || !attempt.lockedUntil) {
            return { locked: false };
        }
        if (new Date() > attempt.lockedUntil) {
            this.loginAttempts.delete(email);
            return { locked: false };
        }
        const remainingMs = attempt.lockedUntil.getTime() - Date.now();
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        return { locked: true, remainingMinutes };
    }
    requiresOtpDueToFailedAttempts(email) {
        const attempt = this.loginAttempts.get(email);
        return attempt && attempt.count >= MAX_LOGIN_ATTEMPTS;
    }
    async initiateLogin(loginDto) {
        const { email, password } = loginDto;
        const lockStatus = this.isLockedOut(email);
        if (lockStatus.locked) {
            throw new common_1.ForbiddenException(`Account temporarily locked. Try again in ${lockStatus.remainingMinutes} minutes.`);
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.role === client_1.Role.STUDENT && user.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException(`Your account is ${user.status.toLowerCase().replace('_', ' ')}. Please contact administrator for approval.`);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const attempts = this.recordFailedAttempt(email);
            const remaining = MAX_LOGIN_ATTEMPTS - attempts;
            if (remaining > 0) {
                throw new common_1.UnauthorizedException(`Invalid credentials. ${remaining} attempts remaining before OTP verification required.`);
            }
            else {
                throw new common_1.ForbiddenException('Too many failed attempts. OTP verification required for login.');
            }
        }
        if (user.role === client_1.Role.STUDENT && this.requiresOtpDueToFailedAttempts(email)) {
            this.resetLoginAttempts(email);
            const otp = this.otpService.generateOTP(email);
            this.logger.log(`Student ${email} requires OTP due to failed attempts. Sending OTP: ${otp}`);
            const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
            this.logger.log(`Email send result for ${email}: ${emailSent}`);
            this.pendingLogins.set(email, {
                userId: user.id,
                email: user.email,
                role: user.role,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            });
            return {
                requiresOtp: true,
                message: 'OTP sent to your email (required due to previous failed attempts)',
            };
        }
        this.resetLoginAttempts(email);
        if (user.role === client_1.Role.STUDENT) {
            const payload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = this.jwtService.sign(payload);
            return {
                requiresOtp: false,
                message: 'Login successful',
            };
        }
        const otp = this.otpService.generateOTP(email);
        this.logger.log(`Teacher/Admin ${email} requires OTP. Sending OTP: ${otp}`);
        const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
        this.logger.log(`Email send result for ${email}: ${emailSent}`);
        this.pendingLogins.set(email, {
            userId: user.id,
            email: user.email,
            role: user.role,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        return {
            requiresOtp: true,
            message: 'OTP sent to your email',
        };
    }
    async verifyLoginOTP(email, otp) {
        const pendingLogin = this.pendingLogins.get(email);
        if (!pendingLogin) {
            throw new common_1.UnauthorizedException('No pending login found. Please login first.');
        }
        if (new Date() > pendingLogin.expiresAt) {
            this.pendingLogins.delete(email);
            throw new common_1.UnauthorizedException('Login session expired. Please login again.');
        }
        const isValid = this.otpService.verifyOTP(email, otp);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        this.pendingLogins.delete(email);
        this.otpService.deleteOTP(email);
        this.resetLoginAttempts(email);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: this.excludePassword(user),
        };
    }
    async resendLoginOTP(email) {
        const pendingLogin = this.pendingLogins.get(email);
        if (!pendingLogin) {
            throw new common_1.UnauthorizedException('No pending login found. Please login first.');
        }
        if (new Date() > pendingLogin.expiresAt) {
            this.pendingLogins.delete(email);
            throw new common_1.UnauthorizedException('Login session expired. Please login again.');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const otp = this.otpService.generateOTP(email);
        await this.emailService.sendLoginOTP(email, user.name, otp);
        this.pendingLogins.set(email, {
            ...pendingLogin,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        return {
            success: true,
            message: 'OTP resent to your email',
        };
    }
    async login(loginDto) {
        const result = await this.initiateLogin(loginDto);
        if (!result.requiresOtp) {
            const { email, password } = loginDto;
            const user = await this.prisma.user.findUnique({ where: { email } });
            const payload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = this.jwtService.sign(payload);
            return {
                accessToken,
                user: this.excludePassword(user),
            };
        }
        return { requiresOtp: true, message: result.message || 'OTP required' };
    }
    async validateUser(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                organizationId: true,
            },
        });
    }
    excludePassword(user) {
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        email_service_1.EmailService,
        activity_log_service_1.ActivityLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map