import { Controller, Post, Patch, Body, Get, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { UpdateProfileDto, ChangePasswordDto, ChangePasswordOtpDto } from './dto/profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const idProofUploadPath = join(process.cwd(), 'uploads', 'id-proofs');

if (!existsSync(idProofUploadPath)) {
  mkdirSync(idProofUploadPath, { recursive: true });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-teacher')
  @UseInterceptors(
    FileInterceptor('idProof', {
      storage: diskStorage({
        destination: idProofUploadPath,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `id-proof-${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'application/pdf',
        ];

        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Only JPG, PNG, or PDF files are allowed'), false);
          return;
        }

        cb(null, true);
      },
    }),
  )
  async registerTeacher(
    @Body() registerTeacherDto: RegisterTeacherDto,
    @UploadedFile() idProof: any,
  ) {
    if (!idProof) {
      throw new BadRequestException('ID proof upload is required');
    }

    return this.authService.registerTeacher({
      ...registerTeacherDto,
      idProofPath: `/uploads/id-proofs/${idProof.filename}`,
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOtpDto) {
    return this.authService.verifyLoginOTP(body.email, body.otp);
  }

  @Post('resend-otp')
  async resendOTP(@Body() body: ResendOtpDto) {
    return this.authService.resendLoginOTP(body.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Post('change-password-otp')
  @UseGuards(JwtAuthGuard)
  async changePasswordWithOtp(@Request() req, @Body() dto: ChangePasswordOtpDto) {
    return this.authService.changePassword(req.user.id, '', dto.newPassword, dto.otp);
  }

  @Post('send-password-otp')
  @UseGuards(JwtAuthGuard)
  async sendPasswordOtp(@Request() req) {
    return this.authService.sendPasswordOtp(req.user.id);
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminOnly() {
    return { message: 'This is an admin-only route' };
  }
}
