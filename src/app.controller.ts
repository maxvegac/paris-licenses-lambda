import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getDashboard(@Res() res: Response): void {
    // In Lambda, files are in /var/task/, in local development they're in the project root
    const publicPath = process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? join(__dirname, 'public')  // Lambda: /var/task/public
      : 'public';  // Local: project/public
    
    res.sendFile('index.html', { root: publicPath });
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
