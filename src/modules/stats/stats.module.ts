import { Module, forwardRef } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { OrdersStateService } from '../orders/orders-state.service';
import { LicensesService } from '../licenses/licenses.service';
import { EmailModule } from '../email/email.module';
import { FactoModule } from '../facto/facto.module';
import { ParisModule } from '../paris/paris.module';

@Module({
  imports: [EmailModule, FactoModule, forwardRef(() => ParisModule)],
  controllers: [StatsController],
  providers: [OrdersStateService, LicensesService],
  exports: [OrdersStateService, LicensesService],
})
export class StatsModule {}
