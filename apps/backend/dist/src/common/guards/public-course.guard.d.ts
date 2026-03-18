import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class PublicCourseGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
