import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'LMS Backend is running',
      version: '1.0.0',
    };
  }

  @Get('db')
  async checkDb() {
    return {
      status: 'ok',
      database: 'connected',
    };
  }
}
