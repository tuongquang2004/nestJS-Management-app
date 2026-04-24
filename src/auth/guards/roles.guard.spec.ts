import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  let mockRequest: any;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    mockRequest = {};

    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
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

  it('should return true if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not found in request', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      new ForbiddenException('User not found in request'),
    );
  });

  it('should throw ForbiddenException if user does not have the required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    mockRequest.user = { role: 'user' };

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      new ForbiddenException(
        'You do not have permission to access this resource',
      ),
    );
  });

  it('should return true if user has the required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin', 'superadmin']);
    mockRequest.user = { role: 'admin' };

    const result = guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });
});
