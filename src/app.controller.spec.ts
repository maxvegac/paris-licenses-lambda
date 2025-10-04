import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParisService } from './paris.service';
import { LicensesService } from './licenses.service';

// Mock ParisService
const mockParisService = {
  getOrders: jest.fn(),
  getNewOrders: jest.fn(),
  getOrderStats: jest.fn(),
};

// Mock LicensesService
const mockLicensesService = {
  addLicense: jest.fn(),
  addLicenses: jest.fn(),
  getAvailableLicenses: jest.fn(),
  getUsedLicenses: jest.fn(),
  getLicenseStats: jest.fn(),
  getLicensesByOrder: jest.fn(),
  releaseLicense: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ParisService,
          useValue: mockParisService,
        },
        {
          provide: LicensesService,
          useValue: mockLicensesService,
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

  describe('sync', () => {
    it('should return new orders and stats', async () => {
      // Arrange
      const mockNewOrders = [
        {
          orderNumber: '67890',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
        },
      ];
      const mockStats = {
        totalProcessed: 5,
        totalFailed: 1,
        lastProcessed: '2025-01-15T10:30:00Z',
      };
      
      mockParisService.getNewOrders.mockResolvedValueOnce(mockNewOrders);
      mockParisService.getOrderStats.mockResolvedValueOnce(mockStats);

      // Act
      const result = await appController.syncOrders();

      // Assert
      expect(result).toEqual({
        newOrders: mockNewOrders,
        stats: mockStats,
      });
      expect(mockParisService.getNewOrders).toHaveBeenCalledTimes(1);
      expect(mockParisService.getOrderStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('stats', () => {
    it('should return order statistics', async () => {
      // Arrange
      const mockStats = {
        totalProcessed: 10,
        totalFailed: 2,
        lastProcessed: '2025-01-15T10:30:00Z',
      };
      
      mockParisService.getOrderStats.mockResolvedValueOnce(mockStats);

      // Act
      const result = await appController.getStats();

      // Assert
      expect(result).toEqual(mockStats);
      expect(mockParisService.getOrderStats).toHaveBeenCalledTimes(1);
    });
  });
});
