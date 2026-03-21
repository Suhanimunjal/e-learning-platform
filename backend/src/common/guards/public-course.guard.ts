import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PublicCourseGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // If user is logged in, always allow
    if (user) {
      return true;
    }

    // For non-logged-in users, allow GET requests (viewing courses)
    // but they get limited preview access
    request.isPreviewMode = true;
    return true;
  }
}
