import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
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
  private pendingLogins: Map<string, PendingLogin> = new Map();
  private loginAttempts: Map<string, LoginAttempt> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private activityLogService: ActivityLogService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role, organization } = registerDto;

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

    // All new students start with PENDING_APPROVAL status
    // They need admin approval to become active
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: Role.STUDENT,
        status: UserStatus.PENDING_APPROVAL,
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

    // Check if user is approved
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(`Your account is ${user.status.toLowerCase().replace('_', ' ')}. Please contact administrator for approval.`);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const attempts = this.recordFailedAttempt(email);
      const remaining = MAX_LOGIN_ATTEMPTS - attempts;
      
      if (remaining > 0) {
        throw new UnauthorizedException(`Invalid credentials. ${remaining} attempts remaining before OTP verification required.`);
      } else {
        throw new ForbiddenException('Too many failed attempts. OTP verification required for login.');
      }
    }

    // Password is valid - check if we need OTP due to failed attempts
    if (user.role === Role.STUDENT && this.requiresOtpDueToFailedAttempts(email)) {
      // Reset attempts on successful password entry
      this.resetLoginAttempts(email);
      
      // Send OTP
      const otp = this.otpService.generateOTP(email);
      await this.emailService.sendLoginOTP(email, user.name, otp);

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
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      
      return {
        requiresOtp: false,
        message: 'Login successful',
      };
    }

    // For TEACHERs and ADMINs - require OTP verification
    const otp = this.otpService.generateOTP(email);
    await this.emailService.sendLoginOTP(email, user.name, otp);

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

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.excludePassword(user),
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
