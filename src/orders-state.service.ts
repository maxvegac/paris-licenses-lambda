/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

export interface OrderState {
  orderNumber: string;
  processedAt: string;
  status: 'pending' | 'processed' | 'failed';
  orderData?: any;
  errorMessage?: string;
  ttl?: number; // For automatic cleanup
}

@Injectable()
export class OrdersStateService {
  private readonly logger = new Logger(OrdersStateService.name);
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    this.tableName = process.env.ORDERS_TABLE_NAME || 'paris-licenses-orders';

    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.dynamoClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });

    this.logger.log(
      `OrdersStateService initialized with table: ${this.tableName}`,
    );
  }

  /**
   * Mark an order as processed
   */
  async markOrderAsProcessed(
    orderNumber: string,
    orderData: any,
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

      const orderState: OrderState = {
        orderNumber,
        processedAt: now,
        status: 'processed',
        orderData: orderData,
        ttl,
      };

      const command = new PutCommand({
        TableName: this.tableName,
        Item: orderState,
      });

      await this.dynamoClient.send(command);

      this.logger.log(`Order ${orderNumber} marked as processed`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error marking order ${orderNumber} as processed:`,
        errorMessage,
      );
      throw new Error(`Failed to mark order as processed: ${errorMessage}`);
    }
  }

  /**
   * Mark an order as failed
   */
  async markOrderAsFailed(
    orderNumber: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const ttl = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now

      const orderState: OrderState = {
        orderNumber,
        processedAt: now,
        status: 'failed',
        errorMessage,
        ttl,
      };

      const command = new PutCommand({
        TableName: this.tableName,
        Item: orderState,
      });

      await this.dynamoClient.send(command);

      this.logger.log(`Order ${orderNumber} marked as failed: ${errorMessage}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error marking order ${orderNumber} as failed:`,
        errorMsg,
      );
      throw new Error(`Failed to mark order as failed: ${errorMsg}`);
    }
  }

  /**
   * Check if an order has been processed
   */
  async isOrderProcessed(orderNumber: string): Promise<boolean> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          orderNumber,
          processedAt: 'processed', // We'll use a fixed value for the range key when checking
        },
      });

      const result = await this.dynamoClient.send(command);
      return !!result.Item;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error checking if order ${orderNumber} is processed:`,
        errorMessage,
      );
      return false; // Assume not processed if we can't check
    }
  }

  /**
   * Get all processed orders
   */
  async getProcessedOrders(): Promise<OrderState[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'processed',
        },
      });

      const result = await this.dynamoClient.send(command);
      return (result.Items as OrderState[]) || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting processed orders:', errorMessage);
      return [];
    }
  }

  /**
   * Get all failed orders
   */
  async getFailedOrders(): Promise<OrderState[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'failed',
        },
      });

      const result = await this.dynamoClient.send(command);
      return (result.Items as OrderState[]) || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting failed orders:', errorMessage);
      return [];
    }
  }

  /**
   * Get order statistics
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
    try {
      const [processedOrders, failedOrders] = await Promise.all([
        this.getProcessedOrders(),
        this.getFailedOrders(),
      ]);

      const lastProcessed = processedOrders
        .sort(
          (a, b) =>
            new Date(b.processedAt).getTime() -
            new Date(a.processedAt).getTime(),
        )
        .map((order) => order.processedAt)[0];

      // Format failed orders for better error reporting
      const failedOrdersDetails = failedOrders.map((order) => ({
        orderNumber: order.orderNumber,
        errorMessage: order.errorMessage || 'Unknown error',
        processedAt: order.processedAt,
      }));

      return {
        totalProcessed: processedOrders.length,
        totalFailed: failedOrders.length,
        lastProcessed,
        failedOrders: failedOrdersDetails,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting order stats:', errorMessage);
      return {
        totalProcessed: 0,
        totalFailed: 0,
        failedOrders: [],
      };
    }
  }

  /**
   * Filter out already processed orders
   */
  async filterNewOrders(orders: any[]): Promise<any[]> {
    try {
      const newOrders: any[] = [];

      for (const order of orders) {
        const isProcessed = await this.isOrderProcessed(order.orderNumber);
        if (!isProcessed) {
          newOrders.push(order);
        }
      }

      this.logger.log(
        `Filtered ${orders.length} orders, ${newOrders.length} are new`,
      );
      return newOrders;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error filtering new orders:', errorMessage);
      return orders; // Return all orders if filtering fails
    }
  }
}
