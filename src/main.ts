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
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
