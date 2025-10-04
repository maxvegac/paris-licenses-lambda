import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ParisService, ParisOrder } from './paris.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly parisService: ParisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('orders')
  async getOrders(): Promise<ParisOrder[]> {
    return await this.parisService.getOrders();
  }
}
