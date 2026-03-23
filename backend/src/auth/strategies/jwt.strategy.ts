import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
        }
        return secret;
      })(),
      passReqToCallback: true,
    });
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || '0.0.0.0';
  }

  private hashIp(ip: string): string {
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    return crypto.createHmac('sha256', jwtSecret).update(ip).digest('hex').substring(0, 16);
  }

  async validate(req: Request, payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      // Discard token from DB if user not found
      if (payload.jti) {
        await this.authService.invalidateSessionByJti(payload.jti);
      }
      throw new UnauthorizedException('Session invalid. Please login again.');
    }

    // Validate session token (jti) - ensures one-token-per-user
    if (payload.jti) {
      const isValidSession = await this.authService.validateSessionToken(payload.sub, payload.jti);
      if (!isValidSession) {
        throw new UnauthorizedException('Session expired or invalidated. Please login again.');
      }
    }

    // Verify IP hash matches current request IP
    if (payload.ip) {
      const currentIp = this.getClientIp(req);
      const currentIpHash = this.hashIp(currentIp);
      if (payload.ip !== currentIpHash) {
        // IP mismatch - discard token for security
        if (payload.jti) {
          await this.authService.invalidateSessionByJti(payload.jti);
        }
        throw new UnauthorizedException('Session security mismatch. Please login again.');
      }
    }

    return user;
  }
}
