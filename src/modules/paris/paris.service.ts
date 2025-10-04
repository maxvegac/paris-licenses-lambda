/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as XLSX from 'xlsx';
import { OrdersStateService } from '../orders/orders-state.service';
import { LicensesService } from '../licenses/licenses.service';
import { ParisOrder } from '../../interfaces/order.interface';

export interface ParisLoginResponse {
  expiresIn: number;
  jwtPayload: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    seller_id: string;
    seller_name: string;
    role: string;
    financial_access: boolean;
    facility_id: string;
    seller_type: string;
    sellerSapClient: string;
    sellerSapProvider: string;
    sellerIsPublished: boolean;
    is_collector: boolean;
    api_key: string;
    seller_status: string;
    permissions: Array<{
      c: string;
      a: string;
    }>;
    policies: Array<{
      id: string;
      name: string;
      action: string;
      effect: string;
      target: string;
      resource: string;
      abilities: Array<{
        id: string;
        name: string;
        action: string;
        subject: string;
        condition: {
          id: string;
        };
      }>;
    }>;
    iat: number;
    exp: number;
    iss: string;
  };
  accessToken: string;
}

@Injectable()
export class ParisService {
  private readonly logger = new Logger(ParisService.name);
  private readonly baseUrl = 'https://eiffel-back.aws.paris.cl';
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private readonly ordersStateService: OrdersStateService,
    private readonly licensesService: LicensesService,
  ) {
    this.logger.log('ParisService initialized');
  }

  /**
   * Performs login to Paris API and obtains JWT token
   */
  async login(): Promise<string> {
    try {
      const email = process.env.PARIS_API_EMAIL;
      const password = process.env.PARIS_API_PASSWORD;

      if (!email || !password) {
        throw new Error(
          'PARIS_API_EMAIL and PARIS_API_PASSWORD must be configured in environment variables',
        );
      }

      this.logger.log('Starting login to Paris API...');

      const response: AxiosResponse<ParisLoginResponse> = await axios.post(
        `${this.baseUrl}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
            Accept: 'application/json, text/plain, */*',
            Origin: 'https://marketplace.paris.cl',
            Referer: 'https://marketplace.paris.cl/',
          },
        },
      );

      this.accessToken = response.data.accessToken;

      // Use expiration from jwtPayload instead of decoding JWT
      this.tokenExpiry = response.data.jwtPayload.exp * 1000; // Convert to milliseconds

      this.logger.log('Successful login to Paris API');
      return this.accessToken;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error in Paris API login:', errorMessage);
      throw new Error(`Login error: ${errorMessage}`);
    }
  }

  /**
   * Checks if token is expired and renews it if necessary
   */
  private async ensureValidToken(): Promise<string> {
    const now = Date.now();

    if (
      !this.accessToken ||
      !this.tokenExpiry ||
      now >= this.tokenExpiry - 60000
    ) {
      // 1 minute margin
      this.logger.log('Token expired or does not exist, renewing...');
      await this.login();
    }

    return this.accessToken!;
  }

  /**
   * Gets orders from Paris API and converts them to JSON
   */
  async getOrders(): Promise<ParisOrder[]> {
    try {
      const token = await this.ensureValidToken();

      this.logger.log('Getting orders from Paris API...');

      // Query parameters (you can modify these as needed)
      const params = new URLSearchParams({
        limit: '25',
        gteCreatedAt: '2025-07-06',
        orderByDispatchDate: 'DESC',
        selectedDate: '5',
        subOrderWithoutItemsIn: '2,15,16,31,9,42',
        status: '4',
      });

      const response = await axios.post(
        `${this.baseUrl}/v1/orders/export?${params.toString()}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
            Accept: 'application/json, text/plain, */*',
            Origin: 'https://marketplace.paris.cl',
            Referer: 'https://marketplace.paris.cl/',
          },
        },
      );

      // Response contains Excel in base64
      const base64Data: string = response.data as string;

      if (!base64Data) {
        throw new Error('No data received from API');
      }

      this.logger.log('Converting Excel to JSON...');

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Read Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      // Get headers (first row)
      const headers = jsonData[0] as string[];

      // Column mapping from Spanish to English
      const columnMapping: { [key: string]: string } = {
        Nro_orden: 'orderNumber',
        Nro_Devolucion: 'returnNumber',
        Nombre_Cliente: 'customerName',
        'Número de documento': 'documentNumber',
        Email_cliente: 'customerEmail',
        Telefono_cliente: 'customerPhone',
        Fecha_de_compra: 'purchaseDate',
        'Fecha de entrega al courier': 'courierDeliveryDate',
        'Fecha de entrega prometida al cliente': 'promisedDeliveryDate',
        Nombre_Producto: 'productName',
        Precio: 'price',
        'Precio pago cliente': 'customerPaymentPrice',
        Costo_despacho: 'shippingCost',
        Comuna: 'commune',
        'Dirección de envío': 'shippingAddress',
        Region: 'region',
        Sku_marketplace: 'marketplaceSku',
        Sku_seller: 'sellerSku',
        Estado: 'status',
        Documento: 'document',
        'Razón social': 'businessName',
        Rut: 'rut',
        Giro: 'businessType',
        'Dirección facturación': 'billingAddress',
        Fulfillment: 'fulfillment',
        OPL: 'opl',
      };

      // Convert data rows to objects with English property names
      const orders: ParisOrder[] = jsonData.slice(1).map((row: unknown[]) => {
        const order: Record<string, string> = {};
        headers.forEach((header, index) => {
          const englishProperty = columnMapping[header] || header;
          const cellValue = row[index];
          if (cellValue === null || cellValue === undefined) {
            order[englishProperty] = '';
          } else if (
            typeof cellValue === 'string' ||
            typeof cellValue === 'number'
          ) {
            order[englishProperty] = String(cellValue);
          } else {
            order[englishProperty] = JSON.stringify(cellValue);
          }
        });
        return order as unknown as ParisOrder;
      });

      this.logger.log(`Retrieved ${orders.length} orders`);
      return orders;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting orders:', errorMessage);
      throw new Error(`Error getting orders: ${errorMessage}`);
    }
  }

  /**
   * Gets new orders (not previously processed) and marks them as processed
   */
  async syncOrders(): Promise<{
    newOrders: ParisOrder[];
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
    try {
      this.logger.log('Syncing orders from Paris API...');

      // Get all orders from Paris API
      const allOrders = await this.getOrders();

      // Filter out already processed orders
      const newOrders =
        await this.ordersStateService.filterNewOrders(allOrders);

      // Process each new order: assign license and mark as processed
      const processedOrders: ParisOrder[] = [];

      for (const order of newOrders) {
        try {
          // Try to assign a license to the order
          let assignedLicense: string | null = null;
          let licenseError: string | null = null;

          try {
            assignedLicense = await this.licensesService.assignLicenseToOrder(
              order.orderNumber,
              order.customerEmail,
              order.customerName,
              order.productName,
            );
          } catch (error) {
            licenseError =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
              `Failed to assign license to order ${order.orderNumber}:`,
              licenseError,
            );
          }

          if (assignedLicense) {
            const orderWithLicense: ParisOrder = {
              ...order,
              assignedLicense: assignedLicense,
            } as ParisOrder;

            // Clean undefined values from the order data, but keep essential fields
            const cleanedOrderData = Object.fromEntries(
              Object.entries(orderWithLicense).filter(
                ([, value]) =>
                  value !== undefined && value !== null && value !== '',
              ),
            );

            // Ensure essential fields are always present
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (cleanedOrderData as any).customerName =
              order.customerName || 'Unknown';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (cleanedOrderData as any).customerEmail =
              order.customerEmail || 'Unknown';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (cleanedOrderData as any).productName =
              order.productName || 'Unknown';

            // Mark order as processed
            await this.ordersStateService.markOrderAsProcessed(
              order.orderNumber,
              cleanedOrderData,
              assignedLicense, // Pass assignedLicense
            );

            processedOrders.push(orderWithLicense);
          } else {
            // Mark order as failed if no license was assigned
            await this.ordersStateService.markOrderAsFailed(
              order.orderNumber,
              licenseError || 'No license available',
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Error processing order ${order.orderNumber}:`,
            errorMessage,
          );

          // Mark order as failed
          await this.ordersStateService.markOrderAsFailed(
            order.orderNumber,
            errorMessage,
          );
        }
      }

      // Get updated stats
      const stats = await this.ordersStateService.getOrderStats();

      this.logger.log(
        `Sync completed: ${processedOrders.length} orders processed, ${stats.totalFailed} total failed`,
      );

      return {
        newOrders: processedOrders,
        stats,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error syncing orders:', errorMessage);
      throw new Error(`Failed to sync orders: ${errorMessage}`);
    }
  }

  async getNewOrders(): Promise<ParisOrder[]> {
    try {
      this.logger.log('Getting new orders from Paris API...');

      // Get all orders from Paris API
      const allOrders = await this.getOrders();

      // Filter out already processed orders
      const newOrders =
        await this.ordersStateService.filterNewOrders(allOrders);

      // Process each new order: assign license and mark as processed
      const processedOrders: ParisOrder[] = [];

      for (const order of newOrders) {
        try {
          // Try to assign a license to the order
          let assignedLicense: string | null = null;
          let licenseError: string | null = null;

          try {
            assignedLicense = await this.licensesService.assignLicenseToOrder(
              order.orderNumber,
              order.customerEmail,
              order.customerName,
              order.productName,
            );

            if (assignedLicense) {
              this.logger.log(
                `License ${assignedLicense} assigned to order ${order.orderNumber}`,
              );
            } else {
              licenseError = `No available license for order ${order.orderNumber}`;
              this.logger.warn(licenseError);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            licenseError = `Failed to assign license: ${errorMessage}`;
            this.logger.error(
              `Failed to assign license to order ${order.orderNumber}:`,
              errorMessage,
            );
          }

          // Only mark as processed if license was successfully assigned
          if (assignedLicense) {
            // Add assigned license to order data and clean undefined values
            const orderWithLicense: ParisOrder = {
              ...order,
              assignedLicense: assignedLicense,
            } as ParisOrder;

            // Clean undefined values from the order data, but keep essential fields
            const cleanedOrderData = Object.fromEntries(
              Object.entries(orderWithLicense).filter(
                ([, value]) =>
                  value !== undefined && value !== null && value !== '',
              ),
            );

            // Ensure essential fields are always present
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (cleanedOrderData as any).customerName =
              order.customerName || 'Unknown';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (cleanedOrderData as any).customerEmail =
              order.customerEmail || 'Unknown';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (cleanedOrderData as any).productName =
              order.productName || 'Unknown';

            // Mark order as processed
            await this.ordersStateService.markOrderAsProcessed(
              order.orderNumber,
              cleanedOrderData,
              assignedLicense,
            );

            processedOrders.push(orderWithLicense);
          } else {
            // Mark order as failed if no license was assigned
            await this.ordersStateService.markOrderAsFailed(
              order.orderNumber,
              licenseError || 'No license available',
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to process order ${order.orderNumber}:`,
            errorMessage,
          );

          // Mark order as failed
          try {
            await this.ordersStateService.markOrderAsFailed(
              order.orderNumber,
              errorMessage,
            );
          } catch (markError) {
            this.logger.error(
              `Failed to mark order ${order.orderNumber} as failed:`,
              markError,
            );
          }

          // Continue processing other orders even if one fails
        }
      }

      this.logger.log(
        `Retrieved ${processedOrders.length} new orders out of ${allOrders.length} total`,
      );
      return processedOrders;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting new orders:', errorMessage);
      throw new Error(`Error getting new orders: ${errorMessage}`);
    }
  }

  /**
   * Gets order processing statistics
   */
  async getOrderStats(): Promise<{
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

  /**
   * Gets failed orders with error details
   */
  async getFailedOrders(): Promise<
    Array<{
      orderNumber: string;
      errorMessage: string;
      processedAt: string;
    }>
  > {
    const failedOrders = await this.ordersStateService.getFailedOrders();
    return failedOrders.map((order) => ({
      orderNumber: order.orderNumber,
      errorMessage: order.errorMessage || 'Unknown error',
      processedAt: order.processedAt,
    }));
  }

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
    const processedOrders = await this.ordersStateService.getProcessedOrders();

    return processedOrders.map((order) => {
      // Use the orderData that was saved when the order was processed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const orderData = order.orderData || {};

      return {
        orderNumber: order.orderNumber,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        customerName: orderData.customerName || 'Unknown',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        customerEmail: orderData.customerEmail || 'Unknown',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        productName: orderData.productName || 'Unknown',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        licenseKey: order.licenseKey || orderData.assignedLicense || 'Unknown',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        purchaseDate: orderData.purchaseDate || 'Unknown',
        processedAt: order.processedAt,
      };
    });
  }
}
