/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */

import { Test, TestingModule } from '@nestjs/testing';
import { ParisService } from './paris.service';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock XLSX
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe('ParisService', () => {
  let service: ParisService;

  // Mock environment variables
  const mockEnv = {
    PARIS_API_EMAIL: 'test@example.com',
    PARIS_API_PASSWORD: 'testpassword',
  };

  beforeEach(async () => {
    // Set environment variables
    process.env.PARIS_API_EMAIL = mockEnv.PARIS_API_EMAIL;
    process.env.PARIS_API_PASSWORD = mockEnv.PARIS_API_PASSWORD;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ParisService],
    }).compile();

    service = module.get<ParisService>(ParisService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.PARIS_API_EMAIL;
    delete process.env.PARIS_API_PASSWORD;
  });

  describe('login', () => {
    it('should successfully login and return access token', async () => {
      // Arrange
      const mockResponse = {
        data: {
          expiresIn: 14400,
          jwtPayload: {
            id: 'user-123',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            seller_id: 'seller-123',
            seller_name: 'Test Seller',
            role: 'seller',
            financial_access: true,
            facility_id: '',
            seller_type: 'pim',
            sellerSapClient: '4200002296',
            sellerSapProvider: '4200002342',
            sellerIsPublished: true,
            is_collector: true,
            api_key: 'test-api-key',
            seller_status: 'active',
            permissions: [],
            policies: [],
            iat: 1759568916,
            exp: 1759583316,
            iss: 'Eiffel',
          },
          accessToken: 'mock-jwt-token',
        },
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.login();

      // Assert
      expect(result).toBe('mock-jwt-token');
      expect(axios.post).toHaveBeenCalledWith(
        'https://eiffel-back.aws.paris.cl/auth/login',
        {
          email: mockEnv.PARIS_API_EMAIL,
          password: mockEnv.PARIS_API_PASSWORD,
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should throw error when credentials are missing', async () => {
      // Arrange
      delete process.env.PARIS_API_EMAIL;

      // Act & Assert
      await expect(service.login()).rejects.toThrow(
        'PARIS_API_EMAIL and PARIS_API_PASSWORD must be configured in environment variables',
      );
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(service.login()).rejects.toThrow(
        'Login error: Network error',
      );
    });
  });

  describe('getOrders', () => {
    beforeEach(() => {
      // Mock successful login
      service['accessToken'] = 'mock-token';
      service['tokenExpiry'] = Date.now() + 3600000; // 1 hour from now
    });

    it('should successfully get orders and convert Excel to JSON', async () => {
      // Arrange
      const mockBase64Data = 'UEsDBBQAAAAIAA=='; // Mock base64 Excel data
      const mockExcelData = [
        ['Nro_orden', 'Nombre_Cliente', 'Email_cliente'],
        ['12345', 'John Doe', 'john@example.com'],
        ['67890', 'Jane Smith', 'jane@example.com'],
      ];

      const mockResponse = {
        data: mockBase64Data,
      };

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {},
        },
      };

      const axios = require('axios');
      const XLSX = require('xlsx');

      axios.post.mockResolvedValueOnce(mockResponse);
      XLSX.read.mockReturnValueOnce(mockWorkbook);
      XLSX.utils.sheet_to_json.mockReturnValueOnce(mockExcelData);

      // Act
      const result = await service.getOrders();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          orderNumber: '12345',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
        }),
      );
    });

    it('should throw error when no data received from API', async () => {
      // Arrange
      const mockResponse = {
        data: null,
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(service.getOrders()).rejects.toThrow(
        'No data received from API',
      );
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('API error');
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(service.getOrders()).rejects.toThrow(
        'Error getting orders: API error',
      );
    });

    it('should handle empty Excel data', async () => {
      // Arrange
      const mockResponse = {
        data: 'UEsDBBQAAAAIAA==',
      };

      const mockExcelData = [['Nro_orden', 'Nombre_Cliente']]; // Only headers, no data

      const axios = require('axios');
      const XLSX = require('xlsx');

      axios.post.mockResolvedValueOnce(mockResponse);
      XLSX.read.mockReturnValueOnce({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      });
      XLSX.utils.sheet_to_json.mockReturnValueOnce(mockExcelData);

      // Act
      const result = await service.getOrders();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('ensureValidToken', () => {
    it('should not call login if token is valid', async () => {
      // Arrange
      service['accessToken'] = 'valid-token';
      service['tokenExpiry'] = Date.now() + 3600000; // 1 hour from now

      const spy = jest.spyOn(service, 'login');

      // Act
      await service['ensureValidToken']();

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should call login if token is expired', async () => {
      // Arrange
      service['accessToken'] = 'expired-token';
      service['tokenExpiry'] = Date.now() - 1000; // Expired

      const mockResponse = {
        data: {
          expiresIn: 14400,
          jwtPayload: {
            id: 'user-123',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            seller_id: 'seller-123',
            seller_name: 'Test Seller',
            role: 'seller',
            financial_access: true,
            facility_id: '',
            seller_type: 'pim',
            sellerSapClient: '4200002296',
            sellerSapProvider: '4200002342',
            sellerIsPublished: true,
            is_collector: true,
            api_key: 'test-api-key',
            seller_status: 'active',
            permissions: [],
            policies: [],
            iat: 1759568916,
            exp: 1759583316,
            iss: 'Eiffel',
          },
          accessToken: 'new-token',
        },
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockResponse);

      // Act
      await service['ensureValidToken']();

      // Assert
      expect(service['accessToken']).toBe('new-token');
    });

    it('should call login if no token exists', async () => {
      // Arrange
      service['accessToken'] = null;
      service['tokenExpiry'] = null;

      const mockResponse = {
        data: {
          expiresIn: 14400,
          jwtPayload: {
            id: 'user-123',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            seller_id: 'seller-123',
            seller_name: 'Test Seller',
            role: 'seller',
            financial_access: true,
            facility_id: '',
            seller_type: 'pim',
            sellerSapClient: '4200002296',
            sellerSapProvider: '4200002342',
            sellerIsPublished: true,
            is_collector: true,
            api_key: 'test-api-key',
            seller_status: 'active',
            permissions: [],
            policies: [],
            iat: 1759568916,
            exp: 1759583316,
            iss: 'Eiffel',
          },
          accessToken: 'new-token',
        },
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockResponse);

      // Act
      await service['ensureValidToken']();

      // Assert
      expect(service['accessToken']).toBe('new-token');
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      // Arrange
      const mockError = 'String error';
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(service.login()).rejects.toThrow(
        'Login error: Unknown error',
      );
    });

    it('should handle null/undefined values in Excel cells', async () => {
      // Arrange
      service['accessToken'] = 'mock-token';
      service['tokenExpiry'] = Date.now() + 3600000;

      const mockResponse = {
        data: 'UEsDBBQAAAAIAA==',
      };

      const mockExcelData = [
        ['Nro_orden', 'Nombre_Cliente'],
        [null, undefined], // Null and undefined values
        ['12345', 'John Doe'],
      ];

      const axios = require('axios');
      const XLSX = require('xlsx');

      axios.post.mockResolvedValueOnce(mockResponse);
      XLSX.read.mockReturnValueOnce({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      });
      XLSX.utils.sheet_to_json.mockReturnValueOnce(mockExcelData);

      // Act
      const result = await service.getOrders();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].orderNumber).toBe('');
      expect(result[0].customerName).toBe('');
      expect(result[1].orderNumber).toBe('12345');
      expect(result[1].customerName).toBe('John Doe');
    });
  });
});
