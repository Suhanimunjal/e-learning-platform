import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from various sources
    let tenantId: string | null = null;

    // 1. From JWT token (if user is authenticated)
    if ((req as any).user) {
      tenantId = (req as any).user.organizationId;
    }

    // 2. From custom header (for API clients)
    if (!tenantId && req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'] as string;
    }

    // 3. From subdomain (if configured)
    // Note: This requires reverse proxy configuration
    
    // Store tenant ID in request for later use
    (req as any).tenantId = tenantId;
    
    next();
  }
}
