import { Controller, Get, Post, Body } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { AddLicenseDto } from './dto/add-license.dto';
import { BulkLicensesDto } from './dto/bulk-licenses.dto';
import { ReleaseLicenseDto } from './dto/release-license.dto';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get('available')
  async getAvailableLicenses(): Promise<any[]> {
    return await this.licensesService.getAvailableLicenses();
  }

  @Get('used')
  async getUsedLicenses(): Promise<any[]> {
    return await this.licensesService.getUsedLicenses();
  }

  @Get('stats')
  async getLicenseStats(): Promise<{
    totalAvailable: number;
    totalUsed: number;
    totalByProduct: {
      [productName: string]: { available: number; used: number };
    };
  }> {
    return await this.licensesService.getLicenseStats();
  }

  @Post()
  async addLicense(@Body() body: AddLicenseDto): Promise<{ message: string }> {
    try {
      await this.licensesService.addLicenses([
        {
          licenseKey: body.licenseKey,
          productName: body.productName,
        },
      ]);

      return { message: 'License added successfully' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { message: `Failed to add license: ${errorMessage}` };
    }
  }

  @Post('bulk')
  async addBulkLicenses(
    @Body() body: BulkLicensesDto,
  ): Promise<{ message: string; count: number }> {
    try {
      await this.licensesService.addLicenses(body.licenses);

      return {
        message: 'Licenses added successfully',
        count: body.licenses.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { message: `Failed to add licenses: ${errorMessage}`, count: 0 };
    }
  }

  @Post('release')
  async releaseLicense(
    @Body() body: ReleaseLicenseDto,
  ): Promise<{ message: string }> {
    try {
      await this.licensesService.releaseLicense(body.licenseKey);
      return { message: 'License released successfully' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { message: `Failed to release license: ${errorMessage}` };
    }
  }
}
