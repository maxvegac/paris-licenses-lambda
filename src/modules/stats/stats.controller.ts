import { Controller, Get } from '@nestjs/common';
import { OrdersStateService } from '../orders/orders-state.service';
import { LicensesService } from '../licenses/licenses.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly ordersStateService: OrdersStateService,
    private readonly licensesService: LicensesService,
  ) {}

  @Get()
  async getStats(): Promise<{
    totalProcessed: number;
    totalFailed: number;
    lastProcessed?: string;
    failedOrders?: Array<{
      orderNumber: string;
      errorMessage: string;
      processedAt: string;
    }>;
  }> {
    return await this.ordersStateService.getOrderStats();
  }

  @Get('licenses')
  async getLicenseStats(): Promise<{
    totalAvailable: number;
    totalUsed: number;
    totalByProduct: {
      [productName: string]: { available: number; used: number };
    };
  }> {
    return await this.licensesService.getLicenseStats();
  }
}
