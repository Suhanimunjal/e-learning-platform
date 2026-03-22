import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';

interface PendingLogin {
  userId: string;
  email: string;
  role: Role;
  expiresAt: Date;
}

interface LoginAttempt {
  count: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private pendingLogins: Map<string, PendingLogin> = new Map();
  private loginAttempts: Map<string, LoginAttempt> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private activityLogService: ActivityLogService,
  ) {}

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role } = registerDto;

    // Only allow STUDENT registration via public registration
    if (role === Role.TEACHER || role === Role.ADMIN) {
      throw new ForbiddenException('Teachers and admins can only be created by administrators');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // New students are active immediately.
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,

      },
    });

    // Log activity
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

  async registerTeacher(input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    organizationName: string;
    expertise: string;
    idProofPath: string;
  }) {
    const { name, email, password, phone, organizationName, expertise, idProofPath } = input;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let organization = await this.prisma.organization.findFirst({
      where: { name: organizationName },
    });

    if (!organization) {
      const baseSlug = this.toSlug(organizationName) || 'organization';
      let slug = baseSlug;
      let suffix = 1;

      // Ensure slug uniqueness without relying on fallback behavior.
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
        role: Role.TEACHER,
        status: UserStatus.PENDING_APPROVAL,
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

  private recordFailedAttempt(email: string): number {
    const attempt = this.loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    
    // Reset if last attempt was more than 15 minutes ago
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

  private resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  private isLockedOut(email: string): { locked: boolean; remainingMinutes?: number } {
    const attempt = this.loginAttempts.get(email);
    if (!attempt || !attempt.lockedUntil) {
      return { locked: false };
    }
    
    if (new Date() > attempt.lockedUntil) {
      // Lockout expired, reset
      this.loginAttempts.delete(email);
      return { locked: false };
    }
    
    const remainingMs = attempt.lockedUntil.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { locked: true, remainingMinutes };
  }

  private requiresOtpDueToFailedAttempts(email: string): boolean {
    const attempt = this.loginAttempts.get(email);
    return attempt && attempt.count >= MAX_LOGIN_ATTEMPTS;
  }

  private isOtpEnabled(): boolean {
    return process.env.AUTH_ENABLE_OTP === 'true';
  }

  async initiateLogin(loginDto: LoginDto): Promise<{ requiresOtp: boolean; message?: string }> {
    const { email, password } = loginDto;

    // Check if account is locked out
    const lockStatus = this.isLockedOut(email);
    if (lockStatus.locked) {
      throw new ForbiddenException(`Account temporarily locked. Try again in ${lockStatus.remainingMinutes} minutes.`);
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === Role.TEACHER && user.status === UserStatus.PENDING_APPROVAL) {
      throw new ForbiddenException('Your teacher account is pending admin approval.');
    }

    // Block explicitly rejected accounts.
    if (user.status === UserStatus.REJECTED) {
      throw new ForbiddenException('Your account has been rejected. Please contact administrator.');
    }

    // Guard against accounts without a password hash and malformed stored hashes.
    // In both cases we should return an auth error, not a 500.
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      this.logger.warn(`Password hash validation failed for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!isPasswordValid) {
      const attempts = this.recordFailedAttempt(email);
      const remaining = MAX_LOGIN_ATTEMPTS - attempts;
      
      if (remaining > 0) {
        throw new UnauthorizedException(`Invalid credentials. ${remaining} attempts remaining before OTP verification required.`);
      } else {
        if (this.isOtpEnabled()) {
          throw new ForbiddenException('Too many failed attempts. OTP verification required for login.');
        }
        throw new ForbiddenException('Too many failed attempts. Account temporarily locked.');
      }
    }

    // Password is valid - check if we need OTP due to failed attempts
    if (this.isOtpEnabled() && user.role === Role.STUDENT && this.requiresOtpDueToFailedAttempts(email)) {
      // Reset attempts on successful password entry
      this.resetLoginAttempts(email);
      
      // Send OTP
      const otp = this.otpService.generateOTP(email);
      this.logger.log(`Student ${email} requires OTP due to failed attempts. Sending OTP: ${otp}`);
      const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
      this.logger.log(`Email send result for ${email}: ${emailSent}`);

      if (!emailSent) {
        this.otpService.deleteOTP(email);
        throw new ServiceUnavailableException('Unable to deliver OTP email. Please contact support or try again later.');
      }

      // Store pending login
      this.pendingLogins.set(email, {
        userId: user.id,
        email: user.email,
        role: user.role,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });

      return {
        requiresOtp: true,
        message: 'OTP sent to your email (required due to previous failed attempts)',
      };
    }

    // Reset login attempts on successful password verification
    this.resetLoginAttempts(email);

    // For STUDENTs - login directly without OTP (if no failed attempts)
    if (user.role === Role.STUDENT) {
      // Log successful login
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
      // Log successful login (OTP disabled)
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

    // For TEACHERs and ADMINs - require OTP verification
    const otp = this.otpService.generateOTP(email);
    this.logger.log(`Teacher/Admin ${email} requires OTP. Sending OTP: ${otp}`);
    const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);
    this.logger.log(`Email send result for ${email}: ${emailSent}`);

    // Log OTP sent
    await this.activityLogService.log({
      action: 'OTP_SENT',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      metadata: { email: user.email, role: user.role, emailSent },
    });

    if (!emailSent) {
      this.otpService.deleteOTP(email);
      throw new ServiceUnavailableException('Unable to deliver OTP email. Please contact support or try again later.');
    }

    // Store pending login
    this.pendingLogins.set(email, {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    return {
      requiresOtp: true,
      message: 'OTP sent to your email',
    };
  }

  async verifyLoginOTP(email: string, otp: string): Promise<AuthResponseDto> {
    const pendingLogin = this.pendingLogins.get(email);
    
    if (!pendingLogin) {
      throw new UnauthorizedException('No pending login found. Please login first.');
    }

    if (new Date() > pendingLogin.expiresAt) {
      this.pendingLogins.delete(email);
      throw new UnauthorizedException('Login session expired. Please login again.');
    }

    const isValid = this.otpService.verifyOTP(email, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Clean up
    this.pendingLogins.delete(email);
    this.otpService.deleteOTP(email);
    
    // Reset login attempts on successful OTP verification
    this.resetLoginAttempts(email);

    // Log successful OTP verification
    await this.activityLogService.log({
      action: 'OTP_VERIFIED',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    // Log successful login
    await this.activityLogService.log({
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      metadata: { email: user.email, role: user.role, method: 'otp' },
    });

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.excludePassword(user),
    };
  }

  async resendLoginOTP(email: string): Promise<{ success: boolean; message: string }> {
    const pendingLogin = this.pendingLogins.get(email);

    if (!pendingLogin) {
      throw new UnauthorizedException('No pending login found. Please login first.');
    }

    if (new Date() > pendingLogin.expiresAt) {
      this.pendingLogins.delete(email);
      throw new UnauthorizedException('Login session expired. Please login again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new OTP
    const otp = this.otpService.generateOTP(email);
    const emailSent = await this.emailService.sendLoginOTP(email, user.name, otp);

    if (!emailSent) {
      this.otpService.deleteOTP(email);
      throw new ServiceUnavailableException('Unable to deliver OTP email. Please contact support or try again later.');
    }

    // Update pending login expiry
    this.pendingLogins.set(email, {
      ...pendingLogin,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return {
      success: true,
      message: 'OTP resent to your email',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto | { requiresOtp: boolean; message: string }> {
    const result = await this.initiateLogin(loginDto);
    
    if (!result.requiresOtp) {
      // For students, return full auth response
      const { email, password } = loginDto;
      const user = await this.prisma.user.findUnique({ where: { email } });
      const payload = { sub: user!.id, email: user!.email, role: user!.role };
      const accessToken = this.jwtService.sign(payload);
      return {
        accessToken,
        user: this.excludePassword(user!),
      };
    }

    // For teachers/admins, return requiring OTP
    return { requiresOtp: true, message: result.message || 'OTP required' };
  }

  async validateUser(userId: string) {
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

  private excludePassword(user: any) {
    const { password, ...result } = user;
    return result;
  }
}
