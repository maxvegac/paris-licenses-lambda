import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './modules/orders/orders.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { StatsModule } from './modules/stats/stats.module';
import { SyncModule } from './modules/sync/sync.module';
import { EmailModule } from './modules/email/email.module';
import { ParisModule } from './modules/paris/paris.module';
import { FactoModule } from './modules/facto/facto.module';
import { S3Module } from './modules/s3/s3.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [
    EmailModule,
    ParisModule,
    OrdersModule,
    LicensesModule,
    StatsModule,
    SyncModule,
    FactoModule,
    S3Module,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}