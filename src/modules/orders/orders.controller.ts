import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ParisService } from '../paris/paris.service';
import { LicensesService } from '../licenses/licenses.service';
import { AssignLicenseDto } from './dto/assign-license.dto';
import { ReplaceLicenseDto } from './dto/replace-license.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly parisService: ParisService,
    private readonly licensesService: LicensesService,
  ) {}

  @Get()
  async getOrders(): Promise<any[]> {
    return await this.parisService.getOrders();
  }

  @Get('failed')
  async getFailedOrders(): Promise<
    Array<{
      orderNumber: string;
      errorMessage: string;
      processedAt: string;
    }>
  > {
    return await this.parisService.getFailedOrders();
  }

  @Get('processed')
  async getProcessedOrders(): Promise<
    Array<{
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      productName: string;
      licenseKey: string;
      purchaseDate: string;
      processedAt: string;
    }>
  > {
    return await this.parisService.getProcessedOrders();
  }

  @Post(':orderNumber/assign-license')
  async assignLicenseToOrder(
    @Param('orderNumber') orderNumber: string,
    @Body() body: AssignLicenseDto,
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Get the order details first
      const orders = await this.parisService.getOrders();
      const order = orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        throw new Error('Order not found');
      }

      // Assign the license manually (we already have the license key)
      await this.licensesService.assignLicenseToOrder(
        orderNumber,
        order.customerEmail,
        order.customerName,
        order.productName,
      );

      // Mark order as processed
      const orderWithLicense = {
        ...order,
        assignedLicense: body.licenseKey,
        // Ensure essential fields are always present
        customerName: order.customerName || 'Unknown',
        customerEmail: order.customerEmail || 'Unknown',
        productName: order.productName || 'Unknown',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const ordersStateService = (this.parisService as any).ordersStateService;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await ordersStateService.markOrderAsProcessed(
        orderNumber,
        orderWithLicense,
        body.licenseKey,
      );

      return {
        message: `License ${body.licenseKey} assigned to order ${orderNumber}`,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        message: `Failed to assign license: ${errorMessage}`,
        success: false,
      };
    }
  }

  @Post(':orderNumber/resend-email')
  async resendOrderEmail(
    @Param('orderNumber') orderNumber: string,
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Get the processed order details
      const processedOrders = await this.parisService.getProcessedOrders();
      const order = processedOrders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        throw new Error('Order not found or not processed');
      }

      // Get the EmailService from the LicensesService
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const emailService = (this.licensesService as any).emailService;

      if (!emailService) {
        throw new Error('Email service not available');
      }

      // Send the email
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const emailSent = await emailService.sendLicenseEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        productName: order.productName,
        licenseKey: order.licenseKey,
      });

      if (emailSent) {
        return {
          message: `Email resent successfully to ${order.customerEmail}`,
          success: true,
        };
      } else {
        return {
          message: 'Failed to resend email',
          success: false,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        message: `Failed to resend email: ${errorMessage}`,
        success: false,
      };
    }
  }

  @Post(':orderNumber/replace-license')
  async replaceOrderLicense(
    @Param('orderNumber') orderNumber: string,
    @Body() body: ReplaceLicenseDto,
  ): Promise<{ message: string; success: boolean }> {
    try {
      const result = await this.licensesService.replaceLicenseForOrder(
        orderNumber,
        body.newLicenseKey,
        body.reason,
        body.replacedBy || 'admin',
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        message: `Failed to replace license: ${errorMessage}`,
        success: false,
      };
    }
  }
}
