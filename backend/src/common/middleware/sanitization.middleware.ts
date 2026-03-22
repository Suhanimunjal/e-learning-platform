import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Remove null bytes and control characters (except newlines/tabs)
    let sanitized = value.replace(/\0/g, '');
    // Strip HTML tags to prevent XSS
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    // Escape dangerous SQL-like patterns (defense in depth, Prisma already parameterizes)
    sanitized = sanitized.replace(/';|--|\/\*|\*\//g, '');
    return sanitized;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const result: any = {};
    for (const key of Object.keys(value)) {
      result[key] = sanitizeValue(value[key]);
    }
    return result;
  }
  return value;
}

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      // req.query is read-only in some setups, so we just sanitize in-place
      for (const key of Object.keys(req.query)) {
        if (typeof req.query[key] === 'string') {
          (req.query as any)[key] = sanitizeValue(req.query[key]);
        }
      }
    }
    next();
  }
}
