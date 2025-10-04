import { Module } from '@nestjs/common';
import { ParisService } from './paris.service';
import { OrdersStateService } from '../orders/orders-state.service';
import { LicensesService } from '../licenses/licenses.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [ParisService, OrdersStateService, LicensesService],
  exports: [ParisService],
})
export class ParisModule {}
