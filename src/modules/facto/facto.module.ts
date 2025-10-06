import { Module } from '@nestjs/common';
import { FactoService } from './facto.service';
import { S3Module } from '../s3/s3.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [S3Module, InvoicesModule],
  providers: [FactoService],
  exports: [FactoService],
})
export class FactoModule {}

