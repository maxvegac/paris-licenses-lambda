import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { EmailService } from '../email/email.service';
import {
  License,
  LicenseReplacement,
} from '../../interfaces/license.interface';

@Injectable()
export class LicensesService {
  private readonly logger = new Logger(LicensesService.name);
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly emailService: EmailService) {
    this.tableName =
      process.env.LICENSES_TABLE_NAME || 'paris-licenses-licenses';

    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.dynamoClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });

    this.logger.log(
      `LicensesService initialized with table: ${this.tableName}`,
    );
  }

  /**
   * Add a new license to the pool
   */
  async addLicense(
    licenseKey: string,
    productName?: string,
    expiresAt?: string,
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      const license: License = {
        licenseKey,
        assignedAt: now, // Use current time as range key for available licenses
        status: 'available',
        productName,
        createdAt: now,
        expiresAt,
      };

      const command = new PutCommand({
        TableName: this.tableName,
        Item: license,
      });

      await this.dynamoClient.send(command);

      this.logger.log(`License ${licenseKey} added to pool`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error adding license ${licenseKey}:`, errorMessage);
      throw new Error(`Failed to add license: ${errorMessage}`);
    }
  }

  /**
   * Add multiple licenses to the pool
   */
  async addLicenses(
    licenses: Array<{
      licenseKey: string;
      productName?: string;
      expiresAt?: string;
    }>,
  ): Promise<void> {
    try {
      const promises = licenses.map((license) =>
        this.addLicense(
          license.licenseKey,
          license.productName,
          license.expiresAt,
        ),
      );

      await Promise.all(promises);

      this.logger.log(`Added ${licenses.length} licenses to pool`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error adding multiple licenses:', errorMessage);
      throw new Error(`Failed to add licenses: ${errorMessage}`);
    }
  }

  /**
   * Get an available license and assign it to an order
   */
  async assignLicenseToOrder(
    orderNumber: string,
    customerEmail: string,
    customerName: string,
    productName?: string,
  ): Promise<string | null> {
    try {
      // First, try to find an available license
      const availableLicense = await this.getAvailableLicense(productName);

      if (!availableLicense) {
        this.logger.warn(
          `No available licenses found for order ${orderNumber}`,
        );
        return null;
      }

      // Mark the license as used and assign it to the order
      const now = new Date().toISOString();

      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          licenseKey: availableLicense.licenseKey,
          assignedAt: now, // New range key for the assignment
          status: 'used',
          orderNumber,
          assignedTo: customerEmail,
          productName: productName || availableLicense.productName,
          createdAt: availableLicense.createdAt,
          expiresAt: availableLicense.expiresAt,
        },
      });

      await this.dynamoClient.send(command);

      this.logger.log(
        `License ${availableLicense.licenseKey} assigned to order ${orderNumber}`,
      );

      // Send email to customer with the license
      const emailSent = await this.emailService.sendLicenseEmail({
        orderNumber,
        customerName,
        customerEmail,
        productName: productName || availableLicense.productName || 'Licencia',
        licenseKey: availableLicense.licenseKey,
      });

      if (!emailSent) {
        this.logger.error(
          `Failed to send email for order ${orderNumber}, but license was assigned`,
        );
        throw new Error('Failed to send license email to customer');
      }

      this.logger.log(
        `Email sent successfully to ${customerEmail} for order ${orderNumber}`,
      );

      return availableLicense.licenseKey;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error assigning license to order ${orderNumber}:`,
        errorMessage,
      );
      throw new Error(`Failed to assign license: ${errorMessage}`);
    }
  }

  /**
   * Get an available license from the pool
   */
  private async getAvailableLicense(
    productName?: string,
  ): Promise<License | null> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'available',
        },
        Limit: 1,
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      const license = result.Items[0] as License;

      // If productName is specified, filter by it
      if (productName && license.productName !== productName) {
        return null;
      }

      return license;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting available license:', errorMessage);
      return null;
    }
  }

  /**
   * Get all available licenses
   */
  async getAvailableLicenses(productName?: string): Promise<License[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'available',
        },
      });

      const result = await this.dynamoClient.send(command);
      let licenses = (result.Items as License[]) || [];

      // Filter by product name if specified
      if (productName) {
        licenses = licenses.filter(
          (license) => license.productName === productName,
        );
      }

      return licenses;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting available licenses:', errorMessage);
      return [];
    }
  }

  /**
   * Get all used licenses
   */
  async getUsedLicenses(): Promise<License[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'used',
        },
      });

      const result = await this.dynamoClient.send(command);
      return (result.Items as License[]) || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting used licenses:', errorMessage);
      return [];
    }
  }

  /**
   * Get licenses assigned to a specific order
   */
  async getLicensesByOrder(orderNumber: string): Promise<License[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'OrderIndex',
        KeyConditionExpression: 'orderNumber = :orderNumber',
        ExpressionAttributeValues: {
          ':orderNumber': orderNumber,
        },
      });

      const result = await this.dynamoClient.send(command);
      return (result.Items as License[]) || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error getting licenses for order ${orderNumber}:`,
        errorMessage,
      );
      return [];
    }
  }

  /**
   * Get license statistics
   */
  async getLicenseStats(): Promise<{
    totalAvailable: number;
    totalUsed: number;
    totalByProduct: {
      [productName: string]: { available: number; used: number };
    };
  }> {
    try {
      const [availableLicenses, usedLicenses] = await Promise.all([
        this.getAvailableLicenses(),
        this.getUsedLicenses(),
      ]);

      const totalByProduct: {
        [productName: string]: { available: number; used: number };
      } = {};

      // Count by product
      availableLicenses.forEach((license) => {
        const product = license.productName || 'Unknown';
        if (!totalByProduct[product]) {
          totalByProduct[product] = { available: 0, used: 0 };
        }
        totalByProduct[product].available++;
      });

      usedLicenses.forEach((license) => {
        const product = license.productName || 'Unknown';
        if (!totalByProduct[product]) {
          totalByProduct[product] = { available: 0, used: 0 };
        }
        totalByProduct[product].used++;
      });

      return {
        totalAvailable: availableLicenses.length,
        totalUsed: usedLicenses.length,
        totalByProduct,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting license stats:', errorMessage);
      return {
        totalAvailable: 0,
        totalUsed: 0,
        totalByProduct: {},
      };
    }
  }

  /**
   * Release a license (make it available again)
   */
  async releaseLicense(licenseKey: string): Promise<void> {
    try {
      // Get the current license record
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          licenseKey,
          assignedAt: 'used', // This might need adjustment based on your data structure
        },
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Item) {
        throw new Error(`License ${licenseKey} not found`);
      }

      const license = result.Item as License;

      // Create a new record with available status
      const now = new Date().toISOString();
      const releaseCommand = new PutCommand({
        TableName: this.tableName,
        Item: {
          licenseKey,
          assignedAt: now,
          status: 'available',
          productName: license.productName,
          createdAt: license.createdAt,
          expiresAt: license.expiresAt,
        },
      });

      await this.dynamoClient.send(releaseCommand);

      this.logger.log(`License ${licenseKey} released and made available`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error releasing license ${licenseKey}:`, errorMessage);
      throw new Error(`Failed to release license: ${errorMessage}`);
    }
  }

  /**
   * Replace a license for an order with a new one
   */
  async replaceLicenseForOrder(
    orderNumber: string,
    newLicenseKey: string,
    reason: string,
    replacedBy: string = 'admin',
  ): Promise<{ message: string; success: boolean }> {
    try {
      // First, get the current license for this order
      const currentLicense = await this.getLicenseByOrder(orderNumber);

      if (!currentLicense) {
        return {
          message: 'No license found for this order',
          success: false,
        };
      }

      // Check if the new license is available
      const newLicense = await this.getAvailableLicense(
        currentLicense.productName,
      );
      if (!newLicense || newLicense.licenseKey !== newLicenseKey) {
        return {
          message: 'New license is not available or does not match the product',
          success: false,
        };
      }

      const now = new Date().toISOString();

      // Create replacement history entry
      const replacementEntry: LicenseReplacement = {
        replacedAt: now,
        previousLicenseKey: currentLicense.licenseKey,
        reason: reason,
        replacedBy: replacedBy,
        orderNumber: orderNumber,
      };

      // Update the new license to be used for this order
      const newLicenseUpdate = new PutCommand({
        TableName: this.tableName,
        Item: {
          licenseKey: newLicenseKey,
          assignedAt: now,
          status: 'used',
          orderNumber: orderNumber,
          assignedTo: currentLicense.assignedTo,
          productName: currentLicense.productName,
          createdAt: newLicense.createdAt,
          expiresAt: newLicense.expiresAt,
          replacementHistory: [replacementEntry], // Start with this replacement
        },
      });

      // Mark the old license as available again
      const oldLicenseUpdate = new PutCommand({
        TableName: this.tableName,
        Item: {
          licenseKey: currentLicense.licenseKey,
          assignedAt: currentLicense.createdAt || now, // Reset to original creation
          status: 'available',
          productName: currentLicense.productName,
          createdAt: currentLicense.createdAt,
          expiresAt: currentLicense.expiresAt,
          // Keep replacement history if it exists
          replacementHistory: currentLicense.replacementHistory || [],
        },
      });

      // Execute both updates
      await Promise.all([
        this.dynamoClient.send(newLicenseUpdate),
        this.dynamoClient.send(oldLicenseUpdate),
      ]);

      // Send email to customer with the new license
      const emailSent = await this.emailService.sendLicenseEmail({
        orderNumber: orderNumber,
        customerName: currentLicense.assignedTo || 'Cliente',
        customerEmail: currentLicense.assignedTo || '',
        productName: currentLicense.productName || 'Licencia',
        licenseKey: newLicenseKey,
      });

      if (!emailSent) {
        this.logger.warn(
          `Failed to send replacement email for order ${orderNumber}`,
        );
      }

      this.logger.log(
        `License replaced for order ${orderNumber}: ${currentLicense.licenseKey} -> ${newLicenseKey} (Reason: ${reason})`,
      );

      return {
        message: `License replaced successfully. New license: ${newLicenseKey}`,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error replacing license for order ${orderNumber}:`,
        errorMessage,
      );
      return {
        message: `Failed to replace license: ${errorMessage}`,
        success: false,
      };
    }
  }

  /**
   * Get license by order number
   */
  async getLicenseByOrder(orderNumber: string): Promise<License | null> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'OrderNumberIndex',
        KeyConditionExpression: 'orderNumber = :orderNumber',
        ExpressionAttributeValues: {
          ':orderNumber': orderNumber,
        },
      });

      const result = await this.dynamoClient.send(command);
      const license = result.Items?.[0] as License;
      return license || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error getting license for order ${orderNumber}:`,
        errorMessage,
      );
      return null;
    }
  }
}
