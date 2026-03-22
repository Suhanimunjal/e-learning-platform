import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccessControlMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip for public routes
    if (req.path === '/api/health' || req.path === '/api/auth/webhook') {
      return next();
    }

    // Check if user is authenticated (populated by JWT strategy)
    const user = (req as any).user;
    if (!user) {
      return next();
    }

    // User is already on req from Passport/JWT strategy
    next();
  }
}
