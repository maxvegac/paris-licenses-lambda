import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParisService } from './paris.service';
import { OrdersStateService } from './orders-state.service';
import { LicensesService } from './licenses.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ParisService, OrdersStateService, LicensesService],
})
export class AppModule {}
