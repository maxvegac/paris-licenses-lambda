import { Injectable, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { S3Service } from '../s3/s3.service';
import { InvoicesService } from '../invoices/invoices.service';
import { InvoiceRecord } from '../../interfaces/invoice.interface';

export interface FactoReceiptData {
  orderNumber: string;
  customerRut: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  productName: string;
}

export interface FactoResponse {
  status: number;
  folio?: number;
  message?: string;
  links?: {
    xml?: string;
    pdf?: string;
    pdfCedible?: string;
    timbre?: string;
  };
}

@Injectable()
export class FactoService {
  private readonly logger = new Logger(FactoService.name);
  private readonly wsdlUrl = 'https://conexion.facto.cl/documento.php?wsdl';
  private readonly user: string;
  private readonly pass: string;

  constructor(
    private readonly s3Service: S3Service,
    private readonly invoicesService: InvoicesService,
  ) {
    // Verificar si estamos en modo de prueba
    const isTestMode = process.env.FACTO_TEST_MODE === 'true';
    
    if (isTestMode) {
      // Usar credenciales de prueba de Facto
      this.user = '1.111.111-4/pruebasapi';
      this.pass = '90809d7721fe3cdcf1668ccf33fea982';
      this.logger.log('FactoService initialized in TEST MODE with demo credentials');
    } else {
      // Usar credenciales de producción
      this.user = process.env.FACTO_USER || '';
      this.pass = process.env.FACTO_PASS || '';

      if (!this.user || !this.pass) {
        this.logger.error('FACTO_USER and FACTO_PASS environment variables are required');
        throw new Error('Facto credentials not configured');
      }

      this.logger.log('FactoService initialized in PRODUCTION MODE');
    }
  }

  /**
   * Emit electronic receipt
   */
  async emitReceipt(data: FactoReceiptData): Promise<FactoResponse> {
    try {
      this.logger.log(`Emitting electronic invoice for order ${data.orderNumber}`);

      // Create SOAP client
      const client = await soap.createClientAsync(this.wsdlUrl);

      // Calculate amounts
      const totalAmount = data.totalAmount;
      const netAmount = Math.round(totalAmount / 1.19); // 19% VAT
      const taxAmount = totalAmount - netAmount;

      // Document structure according to Facto documentation
      const documento = {
        encabezado: {
          tipo_dte: '39', // Electronic invoice
          fecha_emision: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          receptor_rut: data.customerRut || '12345678-9', // Default RUT if not provided
          receptor_razon: data.customerName || 'Cliente',
          receptor_direccion: '',
          receptor_comuna: '',
          receptor_ciudad: '',
          receptor_telefono: '',
          receptor_giro: '',
          condiciones_pago: '0', // Cash payment
          receptor_email: data.customerEmail,
          identificador_externo_doc: data.orderNumber,
        },
        detalles: [
          {
            cantidad: 1,
            unidad: 'UN',
            glosa: data.productName || 'Software License',
            monto_unitario: netAmount,
            exento_afecto: 1, // Subject to VAT
          },
        ],
        totales: {
          total_exento: 0,
          total_afecto: netAmount,
          total_iva: taxAmount,
          total_final: totalAmount,
        },
      };

      // Configure authentication headers
      const headers = {
        user: this.user,
        pass: this.pass,
      };

      // Call emitirDocumento method
      const result = await client.emitirDocumentoAsync(
        { documento },
        { headers }
      );

      this.logger.log(`Facto response for order ${data.orderNumber}:`, result);

      // Process response
      const response = result[0];
      const status = parseInt(response.resultado.status);

      const factoResponse: FactoResponse = {
        status,
        message: response.resultado.mensaje_error,
      };

      if (status === 0) {
        // Success - document created and sent to SII
        factoResponse.folio = parseInt(response.encabezado.folio);
        factoResponse.links = {
          xml: response.enlaces?.dte_xml,
          pdf: response.enlaces?.dte_pdf,
          pdfCedible: response.enlaces?.dte_pdfcedible,
          timbre: response.enlaces?.dte_timbre,
        };

        this.logger.log(
          `✅ Electronic invoice created successfully for order ${data.orderNumber}, folio: ${factoResponse.folio}`
        );

        // Save invoice files to S3 and record to DynamoDB
        await this.saveInvoiceFiles(data.orderNumber, factoResponse.folio, factoResponse.links);
      } else if (status === 1) {
        // Error in sent data
        this.logger.error(
          `❌ Error creating electronic invoice for order ${data.orderNumber}: ${factoResponse.message}`
        );
      } else if (status === 2) {
        // Document created as draft but not sent to SII
        factoResponse.folio = parseInt(response.encabezado.folio);
        this.logger.warn(
          `⚠️ Electronic invoice created as draft for order ${data.orderNumber}, folio: ${factoResponse.folio}, but not sent to SII: ${factoResponse.message}`
        );

        // Save draft invoice record to DynamoDB (no files to download for drafts)
        await this.saveInvoiceRecord(data.orderNumber, factoResponse.folio, status, factoResponse.message);
      }

      return factoResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error emitting electronic invoice for order ${data.orderNumber}:`,
        errorMessage
      );

      return {
        status: -1,
        message: `Error connecting to Facto: ${errorMessage}`,
      };
    }
  }

  /**
   * Check if an order already has an electronic invoice
   */
  async hasExistingInvoice(orderNumber: string): Promise<boolean> {
    try {
      return await this.invoicesService.hasExistingInvoice(orderNumber);
    } catch (error) {
      this.logger.error(`Error checking existing invoice for order ${orderNumber}:`, error);
      return false;
    }
  }

  /**
   * Save invoice files to S3 and record to DynamoDB
   */
  private async saveInvoiceFiles(
    orderNumber: string,
    folio: number,
    links: { xml?: string; pdf?: string; pdfCedible?: string; timbre?: string }
  ): Promise<void> {
    try {
      const s3Files: any = {};
      const originalLinks: any = {};

      // Download and save each file type
      const fileTypes = [
        { key: 'pdf', url: links.pdf, contentType: 'application/pdf' },
        { key: 'xml', url: links.xml, contentType: 'application/xml' },
        { key: 'pdfcedible', url: links.pdfCedible, contentType: 'application/pdf' },
        { key: 'timbre', url: links.timbre, contentType: 'image/png' },
      ];

      for (const fileType of fileTypes) {
        if (fileType.url) {
          try {
            const s3Key = this.s3Service.generateInvoiceKey(orderNumber, folio, fileType.key as any);
            const s3File = await this.s3Service.downloadAndUploadToS3(
              fileType.url,
              s3Key,
              fileType.contentType
            );
            
            s3Files[fileType.key] = s3File.url;
            originalLinks[fileType.key] = fileType.url;
            
            this.logger.log(`Saved ${fileType.key} file to S3: ${s3Key}`);
          } catch (fileError) {
            this.logger.error(`Failed to save ${fileType.key} file to S3:`, fileError);
            // Continue with other files even if one fails
          }
        }
      }

      // Save invoice record to DynamoDB
      await this.saveInvoiceRecord(orderNumber, folio, 0, undefined, s3Files, originalLinks);
    } catch (error) {
      this.logger.error(`Error saving invoice files for order ${orderNumber}:`, error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Save invoice record to DynamoDB
   */
  private async saveInvoiceRecord(
    orderNumber: string,
    folio: number,
    status: number,
    message?: string,
    s3Files?: any,
    originalLinks?: any
  ): Promise<void> {
    try {
      const invoiceRecord: InvoiceRecord = {
        orderNumber,
        folio,
        status,
        message,
        createdAt: new Date().toISOString(),
        s3Files,
        originalLinks,
      };

      await this.invoicesService.saveInvoiceRecord(invoiceRecord);
      this.logger.log(`Invoice record saved: Order ${orderNumber}, Folio ${folio}, Status ${status}`);
    } catch (error) {
      this.logger.error(`Error saving invoice record:`, error);
      // Don't throw error to avoid breaking the main flow
    }
  }
}
