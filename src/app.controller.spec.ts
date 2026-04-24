import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should call appService.getHello and return its result', () => {
      const expectedMessage = 'Hello World from Mock!';
      mockAppService.getHello.mockReturnValue(expectedMessage);

      const result = appController.getHello();

      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedMessage);
    });
  });
});
