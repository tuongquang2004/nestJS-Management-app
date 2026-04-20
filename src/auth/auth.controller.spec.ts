import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards';
import { ReqUser } from '../common/interfaces/req-user.interface';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    authenticate: jest.fn(),
  };

  const mockUser: ReqUser = { userID: 1, role: 'user', username: 'testuser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const dto = {
        username: 'testuser',
        password: '123',
        confirmPassword: '123',
      };
      const expectedResult = {
        message: 'Registered successfully!',
        userID: 1,
        username: 'testuser',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.authenticate and return AuthResult', async () => {
      const dto = { username: 'testuser', password: '123' };
      const expectedResult = {
        accessToken: 'mocked-jwt-token',
        userID: 1,
        username: 'testuser',
      };

      mockAuthService.authenticate.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(mockAuthService.authenticate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserInfo', () => {
    it('should return the current user injected by decorator', () => {
      const result = controller.getUserInfo(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
