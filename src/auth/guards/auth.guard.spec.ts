import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  let mockRequest: any;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);

    mockRequest = {
      headers: {},
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Cannot access resource without token'),
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockRequest.headers.authorization = 'Bearer fake-token-123';

    mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Token is invalid or expired'),
    );
  });

  it('should return true and inject user payload into request if token is valid', async () => {
    mockRequest.headers.authorization = 'Bearer valid-token-456';

    const mockPayload = { userID: 1, username: 'testuser', role: 'user' };
    mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token-456');
    expect(mockRequest['user']).toEqual(mockPayload);
  });
});
