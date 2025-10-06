import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { InvoiceRecord } from '../../interfaces/invoice.interface';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    this.tableName =
      process.env.INVOICES_TABLE_NAME || 'paris-licenses-invoices';

    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.dynamoClient = DynamoDBDocumentClient.from(client);

    this.logger.log(
      `InvoicesService initialized with table: ${this.tableName}`,
    );
  }

  /**
   * Save invoice record to DynamoDB
   */
  async saveInvoiceRecord(invoice: InvoiceRecord): Promise<void> {
    try {
      const ttl = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year TTL

      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          ...invoice,
          ttl,
        },
      });

      await this.dynamoClient.send(command);
      this.logger.log(
        `Invoice record saved: Order ${invoice.orderNumber}, Folio ${invoice.folio}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error saving invoice record for order ${invoice.orderNumber}:`,
        errorMessage,
      );
      throw new Error(`Failed to save invoice record: ${errorMessage}`);
    }
  }

  /**
   * Get invoice record by order number and folio
   */
  async getInvoiceRecord(
    orderNumber: string,
    folio: number,
  ): Promise<InvoiceRecord | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          orderNumber,
          folio,
        },
      });

      const result = await this.dynamoClient.send(command);
      return (result.Item as InvoiceRecord) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error getting invoice record for order ${orderNumber}, folio ${folio}:`,
        errorMessage,
      );
      return null;
    }
  }

  /**
   * Get all invoices for an order
   */
  async getInvoicesForOrder(orderNumber: string): Promise<InvoiceRecord[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'orderNumber = :orderNumber',
        ExpressionAttributeValues: {
          ':orderNumber': orderNumber,
        },
      });

      const result = await this.dynamoClient.send(command);
      return (result.Items as InvoiceRecord[]) || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error getting invoices for order ${orderNumber}:`,
        errorMessage,
      );
      return [];
    }
  }

  /**
   * Check if an order already has an invoice
   */
  async hasExistingInvoice(orderNumber: string): Promise<boolean> {
    try {
      const invoices = await this.getInvoicesForOrder(orderNumber);
      return invoices.length > 0;
    } catch (error) {
      this.logger.error(
        `Error checking existing invoice for order ${orderNumber}:`,
        error,
      );
      return false;
    }
  }
}
