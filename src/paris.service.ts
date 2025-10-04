import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as XLSX from 'xlsx';

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

export interface ParisOrder {
  orderNumber: string;
  returnNumber: string;
  customerName: string;
  documentNumber: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  courierDeliveryDate: string;
  promisedDeliveryDate: string;
  productName: string;
  price: string;
  customerPaymentPrice: string;
  shippingCost: string;
  commune: string;
  shippingAddress: string;
  region: string;
  marketplaceSku: string;
  sellerSku: string;
  status: string;
  document: string;
  businessName: string;
  rut: string;
  businessType: string;
  billingAddress: string;
  fulfillment: string;
  opl: string;
}

@Injectable()
export class ParisService {
  private readonly logger = new Logger(ParisService.name);
  private readonly baseUrl = 'https://eiffel-back.aws.paris.cl';
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
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
}
