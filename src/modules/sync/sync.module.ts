import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { ParisModule } from '../paris/paris.module';

@Module({
  imports: [ParisModule],
  controllers: [SyncController],
})
export class SyncModule {}
