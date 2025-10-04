import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const logger = new Logger(AppModule.name);
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
