import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InvoiceS3File } from '../../interfaces/invoice.interface';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.INVOICES_BUCKET || '';

    if (!this.bucketName) {
      this.logger.error('INVOICES_BUCKET environment variable is required');
      throw new Error('S3 bucket not configured');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.logger.log(`S3Service initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Download a file from a URL and upload it to S3
   */
  async downloadAndUploadToS3(
    url: string,
    key: string,
    contentType: string = 'application/octet-stream',
  ): Promise<InvoiceS3File> {
    try {
      this.logger.log(
        `Downloading file from ${url} and uploading to S3 as ${key}`,
      );

      // Download file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to download file: ${response.status} ${response.statusText}`,
        );
      }

      const fileBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          originalUrl: url,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Generate presigned URL for access
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, getCommand, {
        expiresIn: 3600 * 24 * 30, // 30 days
      });

      const s3File: InvoiceS3File = {
        key,
        bucket: this.bucketName,
        url: presignedUrl,
        contentType,
        size: buffer.length,
      };

      this.logger.log(
        `Successfully uploaded file to S3: ${key} (${buffer.length} bytes)`,
      );
      return s3File;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error downloading and uploading file to S3: ${errorMessage}`,
      );
      throw new Error(`S3 upload failed: ${errorMessage}`);
    }
  }

  /**
   * Generate a presigned URL for accessing a file in S3
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error generating presigned URL for ${key}: ${errorMessage}`,
      );
      throw new Error(`Failed to generate presigned URL: ${errorMessage}`);
    }
  }

  /**
   * Generate S3 key for invoice files
   */
  generateInvoiceKey(
    orderNumber: string,
    folio: number,
    fileType: 'pdf' | 'xml' | 'pdfcedible' | 'timbre',
  ): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `invoices/${year}/${month}/${orderNumber}/${folio}.${fileType}`;
  }
}
