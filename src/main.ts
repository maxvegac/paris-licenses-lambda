import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const logger = new Logger(AppModule.name);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Serve static files from public directory
  // In Lambda, use LAMBDA_TASK_ROOT, in local development use project root
  const publicPath = process.env.LAMBDA_TASK_ROOT 
    ? join(process.env.LAMBDA_TASK_ROOT, 'public')  // Lambda: LAMBDA_TASK_ROOT/public
    : join(__dirname, '..', 'public');  // Local: project/public
  
  // Serve static assets with proper prefix
  app.useStaticAssets(publicPath, {
    prefix: '/',
  });

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
