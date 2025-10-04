import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ParisService, ParisOrder } from './paris.service';
import { LicensesService } from './licenses.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly parisService: ParisService,
    private readonly licensesService: LicensesService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('orders')
  async getOrders(): Promise<ParisOrder[]> {
    return await this.parisService.getOrders();
  }

  @Get('sync')
  async syncOrders(): Promise<{
    newOrders: ParisOrder[];
    stats: {
      totalProcessed: number;
      totalFailed: number;
      lastProcessed?: string;
    };
  }> {
    const newOrders = await this.parisService.getNewOrders();
    const stats = await this.parisService.getOrderStats();

    return {
      newOrders,
      stats,
    };
  }

  @Get('stats')
  async getStats(): Promise<{
    totalProcessed: number;
    totalFailed: number;
    lastProcessed?: string;
  }> {
    return await this.parisService.getOrderStats();
  }

  // License Management Endpoints

  @Post('licenses')
  async addLicense(
    @Body()
    body: {
      licenseKey: string;
      productName?: string;
      expiresAt?: string;
    },
  ): Promise<{ message: string }> {
    await this.licensesService.addLicense(
      body.licenseKey,
      body.productName,
      body.expiresAt,
    );
    return { message: 'License added successfully' };
  }

  @Post('licenses/bulk')
  async addLicenses(
    @Body()
    body: {
      licenses: Array<{
        licenseKey: string;
        productName?: string;
        expiresAt?: string;
      }>;
    },
  ): Promise<{ message: string; count: number }> {
    await this.licensesService.addLicenses(body.licenses);
    return {
      message: 'Licenses added successfully',
      count: body.licenses.length,
    };
  }

  @Get('licenses/available')
  async getAvailableLicenses(
    @Body() body?: { productName?: string },
  ): Promise<any[]> {
    return await this.licensesService.getAvailableLicenses(body?.productName);
  }

  @Get('licenses/used')
  async getUsedLicenses(): Promise<any[]> {
    return await this.licensesService.getUsedLicenses();
  }

  @Get('licenses/stats')
  async getLicenseStats(): Promise<{
    totalAvailable: number;
    totalUsed: number;
    totalByProduct: {
      [productName: string]: { available: number; used: number };
    };
  }> {
    return await this.licensesService.getLicenseStats();
  }

  @Get('licenses/order/:orderNumber')
  async getLicensesByOrder(orderNumber: string): Promise<any[]> {
    return await this.licensesService.getLicensesByOrder(orderNumber);
  }

  @Post('licenses/release')
  async releaseLicense(
    @Body() body: { licenseKey: string },
  ): Promise<{ message: string }> {
    await this.licensesService.releaseLicense(body.licenseKey);
    return { message: 'License released successfully' };
  }
}
