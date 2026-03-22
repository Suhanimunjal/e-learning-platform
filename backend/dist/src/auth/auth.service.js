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
    toSlug(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    async register(registerDto) {
        const { email, password, name, role } = registerDto;
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
                status: client_1.UserStatus.ACTIVE,
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
    async registerTeacher(input) {
        const { name, email, password, phone, organizationName, expertise, idProofPath } = input;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        let organization = await this.prisma.organization.findFirst({
            where: { name: organizationName },
        });
        if (!organization) {
            const baseSlug = this.toSlug(organizationName) || 'organization';
            let slug = baseSlug;
            let suffix = 1;
            while (await this.prisma.organization.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${suffix}`;
                suffix += 1;
            }
            organization = await this.prisma.organization.create({
                data: {
                    name: organizationName,
                    slug,
                },
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: client_1.Role.TEACHER,
                status: client_1.UserStatus.PENDING_APPROVAL,
                organizationId: organization.id,
            },
        });
        await this.activityLogService.log({
            action: 'TEACHER_CREATED',
            entityType: 'USER',
            entityId: teacher.id,
            targetUserId: teacher.id,
            metadata: {
                email: teacher.email,
                name: teacher.name,
                phone,
                organizationName,
                expertise,
                idProofPath,
            },
        });
        return {
            message: 'Teacher registration submitted. Please wait for admin approval.',
            user: this.excludePassword(teacher),
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
    isOtpEnabled() {
        return process.env.AUTH_ENABLE_OTP === 'true';
    }
    async initiateLogin(loginDto) {
        const { email, password, requestedRole } = loginDto;
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
        const blacklistedUser = await this.prisma.blacklistedUser.findUnique({
            where: { originalUserId: user.id },
        });
        if (blacklistedUser) {
            return {
                requiresOtp: false,
                isBlacklisted: true,
                message: 'Your account has been blacklisted. Please contact administration.',
                blacklistedEmail: blacklistedUser.email,
                blacklistedName: blacklistedUser.name,
            };
        }
        if (requestedRole) {
            const normalizedRequestedRole = requestedRole.toUpperCase();
            if (user.role !== normalizedRequestedRole) {
                throw new common_1.ForbiddenException(`This account is not authorized for ${requestedRole} login.`);
            }
        }
        if (user.role === client_1.Role.TEACHER && user.status === client_1.UserStatus.PENDING_APPROVAL) {
            throw new common_1.ForbiddenException('Your teacher account is pending admin approval.');
        }
        if (user.status === client_1.UserStatus.REJECTED) {
            throw new common_1.ForbiddenException('Your account has been rejected. Please contact administrator.');
        }
        if (user.status === client_1.UserStatus.BLACKLISTED) {
            throw new common_1.ForbiddenException('Your account has been blacklisted. Please contact administrator.');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        }
        catch (error) {
            this.logger.warn(`Password hash validation failed for ${email}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!isPasswordValid) {
            const attempts = this.recordFailedAttempt(email);
            const remaining = MAX_LOGIN_ATTEMPTS - attempts;
            if (remaining > 0) {
                throw new common_1.UnauthorizedException(`Invalid credentials. ${remaining} attempts remaining before OTP verification required.`);
            }
            else {
                if (this.isOtpEnabled()) {
                    throw new common_1.ForbiddenException('Too many failed attempts. OTP verification required for login.');
                }
                throw new common_1.ForbiddenException('Too many failed attempts. Account temporarily locked.');
            }
        }
        if (this.isOtpEnabled() && user.role === client_1.Role.STUDENT && this.requiresOtpDueToFailedAttempts(email)) {
            this.resetLoginAttempts(email);
            const otp = this.otpService.generateOTP(email);
            this.logger.log(`Student ${email} requires OTP due to failed attempts. Sending OTP: ${otp}`);
            const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
            this.logger.log(`Email send result for ${email}: ${emailSent}`);
            if (!emailSent) {
                this.otpService.deleteOTP(email);
                throw new common_1.ServiceUnavailableException('Unable to deliver OTP email. Please contact support or try again later.');
            }
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
            await this.activityLogService.log({
                action: 'USER_LOGIN',
                entityType: 'USER',
                entityId: user.id,
                userId: user.id,
                metadata: { email: user.email, role: user.role, method: 'password' },
            });
            const payload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = this.jwtService.sign(payload);
            return {
                requiresOtp: false,
                message: 'Login successful',
            };
        }
        if (!this.isOtpEnabled()) {
            await this.activityLogService.log({
                action: 'USER_LOGIN',
                entityType: 'USER',
                entityId: user.id,
                userId: user.id,
                metadata: { email: user.email, role: user.role, method: 'password', otpDisabled: true },
            });
            return {
                requiresOtp: false,
                message: 'Login successful',
            };
        }
        const otp = this.otpService.generateOTP(email);
        this.logger.log(`Teacher/Admin ${email} requires OTP. Sending OTP: ${otp}`);
        const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
        this.logger.log(`Email send result for ${email}: ${emailSent}`);
        await this.activityLogService.log({
            action: 'OTP_SENT',
            entityType: 'USER',
            entityId: user.id,
            userId: user.id,
            metadata: { email: user.email, role: user.role, emailSent },
        });
        if (!emailSent) {
            this.otpService.deleteOTP(email);
            throw new common_1.ServiceUnavailableException('Unable to deliver OTP email. Please contact support or try again later.');
        }
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
        await this.activityLogService.log({
            action: 'OTP_VERIFIED',
            entityType: 'USER',
            entityId: user.id,
            userId: user.id,
            metadata: { email: user.email, role: user.role },
        });
        await this.activityLogService.log({
            action: 'USER_LOGIN',
            entityType: 'USER',
            entityId: user.id,
            userId: user.id,
            metadata: { email: user.email, role: user.role, method: 'otp' },
        });
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
        const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
        if (!emailSent) {
            this.otpService.deleteOTP(email);
            throw new common_1.ServiceUnavailableException('Unable to deliver OTP email. Please contact support or try again later.');
        }
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
        if (result.isBlacklisted) {
            return {
                requiresOtp: false,
                isBlacklisted: true,
                message: result.message || 'Your account has been blacklisted.',
                blacklistedEmail: result.blacklistedEmail,
                blacklistedName: result.blacklistedName,
            };
        }
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
    async sendBlacklistAppeal(email, message) {
        const blacklistedUser = await this.prisma.blacklistedUser.findFirst({
            where: { email },
        });
        if (!blacklistedUser) {
            throw new common_1.UnauthorizedException('User is not blacklisted');
        }
        let adminEmail = process.env.SMTP_USER || 'admin@elearning.com';
        let adminName = 'Administrator';
        if (blacklistedUser.blacklistedBy) {
            const admin = await this.prisma.user.findUnique({
                where: { id: blacklistedUser.blacklistedBy },
                select: { email: true, name: true },
            });
            if (admin) {
                adminEmail = admin.email;
                adminName = admin.name;
            }
        }
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'E-Learning Platform <noreply@elearning.com>',
                to: adminEmail,
                subject: `Blacklist Appeal from ${blacklistedUser.name} - E-Learning Platform`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #DC2626, #991B1B); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Blacklist Appeal Request</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="color: #1f2937; font-size: 16px;">
                Hello ${adminName},
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                A blacklisted user has submitted an appeal to have their account restored.
              </p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0;"><strong>User Details:</strong></p>
                <p style="color: #991b1b; font-size: 14px; margin: 5px 0;">Name: ${blacklistedUser.name}</p>
                <p style="color: #991b1b; font-size: 14px; margin: 5px 0;">Email: ${blacklistedUser.email}</p>
                <p style="color: #991b1b; font-size: 14px; margin: 5px 0;">Role: ${blacklistedUser.role}</p>
                <p style="color: #991b1b; font-size: 14px; margin: 5px 0;">Blacklist Reason: ${blacklistedUser.reason}</p>
              </div>
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #0c4a6e; font-size: 14px; margin: 0;"><strong>User's Appeal Message:</strong></p>
                <p style="color: #0c4a6e; font-size: 14px; margin: 10px 0;">${message}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                To restore this user, please visit the admin panel and use the "Revert Blacklist" option in the Blacklisted Users tab.
              </p>
            </div>
          </div>
        `,
            });
            return { success: true, message: 'Your appeal has been sent to the administrator.' };
        }
        catch (error) {
            this.logger.error(`Failed to send blacklist appeal email for ${email}:`, error);
            throw new common_1.ServiceUnavailableException('Unable to send appeal email. Please try again later.');
        }
    }
    get transporter() {
        const nodemailer = require('nodemailer');
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
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
                phone: true,
                rollNo: true,
                year: true,
                branch: true,
                course: true,
                organizationId: true,
            },
        });
    }
    excludePassword(user) {
        const { password, ...result } = user;
        return result;
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.rollNo !== undefined && { rollNo: data.rollNo }),
                ...(data.year !== undefined && { year: data.year }),
                ...(data.branch !== undefined && { branch: data.branch }),
                ...(data.course !== undefined && { course: data.course }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                phone: true,
                rollNo: true,
                year: true,
                branch: true,
                course: true,
                organizationId: true,
            },
        });
        await this.activityLogService.log({
            action: 'PROFILE_UPDATED',
            entityType: 'USER',
            entityId: userId,
            userId,
            metadata: { updatedFields: Object.keys(data) },
        });
        return updated;
    }
    async changePassword(userId, currentPassword, newPassword, otp) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Account has no password set');
        }
        if (otp) {
            const isValidOtp = this.otpService.verifyOTP(user.email, otp);
            if (!isValidOtp) {
                throw new common_1.UnauthorizedException('Invalid or expired OTP');
            }
        }
        else {
            const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        await this.activityLogService.log({
            action: 'PASSWORD_CHANGED',
            entityType: 'USER',
            entityId: userId,
            userId,
        });
        return { success: true, message: 'Password changed successfully' };
    }
    async sendPasswordOtp(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const otp = this.otpService.generateOTP(user.email);
        await this.emailService.sendLoginOTP(user.email, user.name, otp);
        return { success: true, message: 'OTP sent to your email address' };
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