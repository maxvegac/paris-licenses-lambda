import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { OrdersStateService } from '../orders/orders-state.service';
import { LicensesService } from '../licenses/licenses.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [StatsController],
  providers: [OrdersStateService, LicensesService],
  exports: [OrdersStateService, LicensesService],
})
export class StatsModule {}
