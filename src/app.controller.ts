import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getDashboard(@Res() res: Response): void {
    // In Lambda, use LAMBDA_TASK_ROOT, in local development use project root
    const publicPath = process.env.LAMBDA_TASK_ROOT
      ? process.env.LAMBDA_TASK_ROOT + '/public' // Lambda: LAMBDA_TASK_ROOT/public
      : 'public'; // Local: project/public

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
