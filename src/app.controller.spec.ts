import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Response } from 'express';

// Mock AppService
const mockAppService = {
  getHello: jest.fn().mockReturnValue('Hello World!'),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should serve dashboard HTML file', () => {
      const mockRes = {
        sendFile: jest.fn(),
      } as unknown as Response;

      appController.getDashboard(mockRes);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRes.sendFile).toHaveBeenCalledWith('index.html', {
        root: 'public',
      });
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();

      expect(result).toEqual({
        status: 'OK',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
      });
    });
  });
});
