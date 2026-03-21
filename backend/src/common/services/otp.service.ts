import { Injectable } from '@nestjs/common';

interface OTP {
  code: string;
  expiresAt: Date;
  userId?: string;
  email: string;
  verified: boolean;
}

@Injectable()
export class OtpService {
  private otps: Map<string, OTP> = new Map();

  generateOTP(email: string, userId?: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.otps.set(email, { code, expiresAt, userId, email, verified: false });
    
    return code;
  }

  verifyOTP(email: string, code: string): boolean {
    const otp = this.otps.get(email);
    
    if (!otp) return false;
    if (otp.verified) return false;
    if (new Date() > otp.expiresAt) {
      this.otps.delete(email);
      return false;
    }
    if (otp.code !== code) return false;

    otp.verified = true;
    return true;
  }

  isVerified(email: string): boolean {
    const otp = this.otps.get(email);
    return otp?.verified || false;
  }

  getOTP(email: string): OTP | undefined {
    return this.otps.get(email);
  }

  deleteOTP(email: string): void {
    this.otps.delete(email);
  }

  cleanExpired(): void {
    const now = new Date();
    for (const [email, otp] of this.otps.entries()) {
      if (now > otp.expiresAt) {
        this.otps.delete(email);
      }
    }
  }
}
