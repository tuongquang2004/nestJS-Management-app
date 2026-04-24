import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service';
import { ConfigService } from '@nestjs/config';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Getters', () => {
    it('should return dbName', () => {
      mockConfigService.get.mockReturnValue('my_database');

      const result = service.dbName;

      expect(mockConfigService.get).toHaveBeenCalledWith('DB_NAME', {
        infer: true,
      });
      expect(result).toEqual('my_database');
    });

    it('should return dbUsername', () => {
      mockConfigService.get.mockReturnValue('admin_user');

      const result = service.dbUsername;

      expect(mockConfigService.get).toHaveBeenCalledWith('DB_USERNAME', {
        infer: true,
      });
      expect(result).toEqual('admin_user');
    });

    it('should return dbPassword if it exists', () => {
      mockConfigService.get.mockReturnValue('secret123');

      const result = service.dbPassword;

      expect(mockConfigService.get).toHaveBeenCalledWith('DB_PASSWORD', {
        infer: true,
      });
      expect(result).toEqual('secret123');
    });

    it('should return empty string if dbPassword is undefined', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.dbPassword;

      expect(mockConfigService.get).toHaveBeenCalledWith('DB_PASSWORD', {
        infer: true,
      });
      expect(result).toEqual('');
    });

    it('should return dbPort', () => {
      mockConfigService.get.mockReturnValue(5432);

      const result = service.dbPort;

      expect(mockConfigService.get).toHaveBeenCalledWith('DB_PORT', {
        infer: true,
      });
      expect(result).toEqual(5432);
    });

    it('should return dbHost', () => {
      mockConfigService.get.mockReturnValue('localhost');

      const result = service.dbHost;

      expect(mockConfigService.get).toHaveBeenCalledWith('DB_HOST', {
        infer: true,
      });
      expect(result).toEqual('localhost');
    });

    it('should return jwtSecret', () => {
      mockConfigService.get.mockReturnValue('super-jwt-secret');

      const result = service.jwtSecret;

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET', {
        infer: true,
      });
      expect(result).toEqual('super-jwt-secret');
    });
  });
});
