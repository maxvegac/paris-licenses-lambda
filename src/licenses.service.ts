import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export interface License {
  licenseKey: string;
  assignedAt: string;
  status: 'available' | 'used';
  orderNumber?: string;
  assignedTo?: string; // customer email or name
  productName?: string;
  createdAt?: string;
  expiresAt?: string;
}

@Injectable()
export class LicensesService {
  private readonly logger = new Logger(LicensesService.name);
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    this.tableName = process.env.LICENSES_TABLE_NAME || 'paris-licenses-licenses';
    
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    this.dynamoClient = DynamoDBDocumentClient.from(client);
    
    this.logger.log(`LicensesService initialized with table: ${this.tableName}`);
  }

  /**
   * Add a new license to the pool
   */
  async addLicense(licenseKey: string, productName?: string, expiresAt?: string): Promise<void> {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error adding license ${licenseKey}:`, errorMessage);
      throw new Error(`Failed to add license: ${errorMessage}`);
    }
  }

  /**
   * Add multiple licenses to the pool
   */
  async addLicenses(licenses: Array<{
    licenseKey: string;
    productName?: string;
    expiresAt?: string;
  }>): Promise<void> {
    try {
      const promises = licenses.map(license => 
        this.addLicense(license.licenseKey, license.productName, license.expiresAt)
      );
      
      await Promise.all(promises);
      
      this.logger.log(`Added ${licenses.length} licenses to pool`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error adding multiple licenses:', errorMessage);
      throw new Error(`Failed to add licenses: ${errorMessage}`);
    }
  }

  /**
   * Get an available license and assign it to an order
   */
  async assignLicenseToOrder(orderNumber: string, customerEmail: string, productName?: string): Promise<string | null> {
    try {
      // First, try to find an available license
      const availableLicense = await this.getAvailableLicense(productName);
      
      if (!availableLicense) {
        this.logger.warn(`No available licenses found for order ${orderNumber}`);
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
      
      this.logger.log(`License ${availableLicense.licenseKey} assigned to order ${orderNumber}`);
      return availableLicense.licenseKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error assigning license to order ${orderNumber}:`, errorMessage);
      throw new Error(`Failed to assign license: ${errorMessage}`);
    }
  }

  /**
   * Get an available license from the pool
   */
  private async getAvailableLicense(productName?: string): Promise<License | null> {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
        licenses = licenses.filter(license => license.productName === productName);
      }

      return licenses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting licenses for order ${orderNumber}:`, errorMessage);
      return [];
    }
  }

  /**
   * Get license statistics
   */
  async getLicenseStats(): Promise<{
    totalAvailable: number;
    totalUsed: number;
    totalByProduct: { [productName: string]: { available: number; used: number } };
  }> {
    try {
      const [availableLicenses, usedLicenses] = await Promise.all([
        this.getAvailableLicenses(),
        this.getUsedLicenses(),
      ]);

      const totalByProduct: { [productName: string]: { available: number; used: number } } = {};

      // Count by product
      availableLicenses.forEach(license => {
        const product = license.productName || 'Unknown';
        if (!totalByProduct[product]) {
          totalByProduct[product] = { available: 0, used: 0 };
        }
        totalByProduct[product].available++;
      });

      usedLicenses.forEach(license => {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error releasing license ${licenseKey}:`, errorMessage);
      throw new Error(`Failed to release license: ${errorMessage}`);
    }
  }
}
