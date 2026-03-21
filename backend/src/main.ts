import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}`);
  console.log(`API available at: http://localhost:${port}/api`);
}
bootstrap();
