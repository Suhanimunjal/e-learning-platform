import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = { message: 'Internal server error' };
    }

    const errorLog = {
      statusCode: status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userId: (request as any).user?.id,
      error: exception instanceof Error ? exception.stack : String(exception),
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${exception instanceof Error ? exception.message : JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      ...((typeof message === 'object') ? message : { message }),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
