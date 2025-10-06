import { Module, forwardRef } from '@nestjs/common';
import { ParisService } from './paris.service';
import { OrdersStateService } from '../orders/orders-state.service';
import { EmailModule } from '../email/email.module';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [EmailModule, forwardRef(() => LicensesModule)],
  providers: [ParisService, OrdersStateService],
  exports: [ParisService],
})
export class ParisModule {}
