import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersStateService } from './orders-state.service';
import { ParisModule } from '../paris/paris.module';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [ParisModule, LicensesModule],
  controllers: [OrdersController],
  providers: [OrdersStateService],
  exports: [OrdersStateService],
})
export class OrdersModule {}
