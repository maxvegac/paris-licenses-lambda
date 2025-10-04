import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
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

  // Serve static files from public directory
  // In Lambda, files are in /var/task/, in local development they're in the project root
  const publicPath = process.env.AWS_LAMBDA_FUNCTION_NAME 
    ? join(__dirname, 'public')  // Lambda: /var/task/public
    : join(__dirname, '..', 'public');  // Local: project/public
  
  app.useStaticAssets(publicPath);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
