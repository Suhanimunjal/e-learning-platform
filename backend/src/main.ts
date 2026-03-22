import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads', 'course-materials');
  mkdirSync(uploadsDir, { recursive: true });

  // Global exception filter for error logging
  app.useGlobalFilters(new GlobalExceptionFilter());

  const frontendOriginsRaw = process.env.FRONTEND_ORIGINS;
  if (!frontendOriginsRaw) {
    throw new Error('FRONTEND_ORIGINS is required. No fallback origin is allowed.');
  }

  const allowedOrigins = frontendOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    throw new Error('FRONTEND_ORIGINS must contain at least one valid origin.');
  }
  
  // Enable CORS for frontend
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  // Serve static files (uploads)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}`);
  console.log(`API available at: http://localhost:${port}/api`);
}
bootstrap();
