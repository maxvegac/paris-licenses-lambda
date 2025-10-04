import { Controller, Post, Get } from '@nestjs/common';
import { ParisService } from '../paris/paris.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly parisService: ParisService) {}

  @Get()
  async getSyncStatus(): Promise<{
    message: string;
    lastSync?: string;
    stats: {
      totalProcessed: number;
      totalFailed: number;
      lastProcessed?: string;
      failedOrders?: Array<{
        orderNumber: string;
        errorMessage: string;
        processedAt: string;
      }>;
    };
  }> {
    // Get current stats without syncing
    const stats = await this.parisService.getOrderStats();

    return {
      message: 'Sync status retrieved successfully',
      stats,
    };
  }

  @Post()
  async syncOrders(): Promise<{
    newOrders: any[];
    stats: {
      totalProcessed: number;
      totalFailed: number;
      lastProcessed?: string;
      failedOrders?: Array<{
        orderNumber: string;
        errorMessage: string;
        processedAt: string;
      }>;
    };
  }> {
    return await this.parisService.syncOrders();
  }
}
