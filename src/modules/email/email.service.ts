import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { EmailData } from '../../interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // App password for Gmail
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Email transporter initialized');
  }

  async sendLicenseEmail(emailData: EmailData): Promise<boolean> {
    try {
      const htmlContent = this.generateEmailHTML(emailData);

      // Check if should redirect emails
      const devEmailRedirect =
        process.env.DEV_EMAIL_REDIRECT?.toLowerCase() === 'true';
      const devEmail =
        process.env.DEV_EMAIL || process.env.dev_email || process.env.SMTP_USER;

      let recipientEmail = emailData.customerEmail;
      let subject = `Orden ${emailData.orderNumber} - Entrega de licencia ${emailData.productName}`;

      if (devEmailRedirect && devEmail) {
        // In development, redirect to dev email and add original recipient info
        recipientEmail = devEmail;
        subject = `[DEV] ${subject} (Original: ${emailData.customerEmail})`;

        this.logger.log(
          `[DEV MODE] Redirecting email from ${emailData.customerEmail} to ${devEmail} for order ${emailData.orderNumber}`,
        );
      }

      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
      const fromName = process.env.SMTP_FROM_NAME || 'Equipo IVI';

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${recipientEmail} for order ${emailData.orderNumber}`,
      );
      this.logger.debug(`Email result: ${JSON.stringify(result)}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${emailData.customerEmail} for order ${emailData.orderNumber}:`,
        error,
      );
      return false;
    }
  }

  private generateEmailHTML(emailData: EmailData): string {
    try {
      // Read the template file
      // In Lambda, use LAMBDA_TASK_ROOT, in local development use project root
      const templatePath = process.env.LAMBDA_TASK_ROOT
        ? path.join(
            process.env.LAMBDA_TASK_ROOT,
            'templates',
            'email',
            'license-delivery.html',
          ) // Lambda: LAMBDA_TASK_ROOT/templates/email/license-delivery.html
        : path.join(
            process.cwd(),
            'templates',
            'email',
            'license-delivery.html',
          ); // Local: project/templates/email/license-delivery.html

      const templateSource = fs.readFileSync(templatePath, 'utf8');

      // Compile the template
      const template = handlebars.compile(templateSource);

      // Render the template with data
      const html = template(emailData);

      return html;
    } catch (error) {
      this.logger.error('Error generating email HTML from template:', error);
      throw new Error('Failed to generate email template');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection failed:', error);
      return false;
    }
  }
}
