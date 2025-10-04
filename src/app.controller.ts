import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

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

  @Get('css/dashboard.css')
  getDashboardCSS(@Res() res: Response): void {
    const publicPath = process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? join(__dirname, 'public')  // Lambda: /var/task/public
      : 'public';  // Local: project/public
    
    const cssPath = join(publicPath, 'css', 'dashboard.css');
    
    if (fs.existsSync(cssPath)) {
      res.setHeader('Content-Type', 'text/css');
      res.sendFile('dashboard.css', { root: join(publicPath, 'css') });
    } else {
      res.status(404).send('CSS file not found');
    }
  }

  @Get('js/dashboard.js')
  getDashboardJS(@Res() res: Response): void {
    const publicPath = process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? join(__dirname, 'public')  // Lambda: /var/task/public
      : 'public';  // Local: project/public
    
    const jsPath = join(publicPath, 'js', 'dashboard.js');
    
    if (fs.existsSync(jsPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.sendFile('dashboard.js', { root: join(publicPath, 'js') });
    } else {
      res.status(404).send('JS file not found');
    }
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
