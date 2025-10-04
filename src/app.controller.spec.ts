import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParisService } from './paris.service';

// Mock ParisService
const mockParisService = {
  getOrders: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ParisService,
          useValue: mockParisService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('orders', () => {
    it('should return orders from ParisService', async () => {
      // Arrange
      const mockOrders = [
        {
          orderNumber: '12345',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
        },
      ];
      mockParisService.getOrders.mockResolvedValueOnce(mockOrders);

      // Act
      const result = await appController.getOrders();

      // Assert
      expect(result).toEqual(mockOrders);
      expect(mockParisService.getOrders).toHaveBeenCalledTimes(1);
    });
  });
});
