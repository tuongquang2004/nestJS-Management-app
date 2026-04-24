import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Đã chỉnh thành đường dẫn tương đối để tránh lỗi Jest
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findUserByName: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const dto = { username: 'testuser', password: 'password123' };
    const mockUserDB = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      role: 'user',
    };

    it('should return user info if password matches', async () => {
      mockUsersService.findUserByName.mockResolvedValue(mockUserDB);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(dto);
      expect(result).toEqual({ userID: 1, username: 'testuser', role: 'user' });
    });

    it('should return null if password does NOT match', async () => {
      mockUsersService.findUserByName.mockResolvedValue(mockUserDB);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(dto);
      expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findUserByName.mockResolvedValue(null);

      const result = await service.validateUser(dto);
      expect(result).toBeNull();
    });
  });

  describe('authenticate', () => {
    const dto = { username: 'testuser', password: 'password123' };
    const validUser = { userID: 1, username: 'testuser', role: 'user' };
    const expectedToken = 'eyJhbGciOiJIUzI1...';

    it('should throw UnauthorizedException if validation fails', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.authenticate(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call signIn and return AuthResult if validation succeeds', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(validUser);
      const signInSpy = jest.spyOn(service, 'signIn').mockResolvedValue({
        accessToken: expectedToken,
        userID: 1,
        username: 'testuser',
      });

      const result = await service.authenticate(dto);
      expect(result.accessToken).toEqual(expectedToken);
      expect(signInSpy).toHaveBeenCalledWith(validUser);
    });
  });

  describe('signIn', () => {
    it('should generate JWT token and return AuthResult', async () => {
      const userParams = { userID: 1, username: 'testuser', role: 'user' };
      const expectedToken = 'mocked-jwt-token';
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.signIn(userParams);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { username: 'testuser', userID: 1, role: 'user' },
        { expiresIn: '1d' },
      );
      expect(result).toEqual({
        accessToken: expectedToken,
        userID: 1,
        username: 'testuser',
      });
    });
  });

  describe('register', () => {
    it('should throw BadRequestException if passwords do not match', async () => {
      const dto = {
        username: 'test',
        password: '123',
        confirmPassword: '456',
      } as any;

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      await expect(service.register(dto)).rejects.toThrow(
        'Password and Confirm Password do not match!',
      );
    });

    it('should throw BadRequestException if username already exists', async () => {
      const dto = {
        username: 'test',
        password: '123',
        confirmPassword: '123',
      } as any;
      mockUsersService.findUserByName.mockResolvedValue({ id: 1 });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      await expect(service.register(dto)).rejects.toThrow('Username existed!');
    });

    it('should create new user and return success message', async () => {
      const dto = {
        username: 'newuser',
        password: '123',
        confirmPassword: '123',
      } as any;
      mockUsersService.findUserByName.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 99,
        username: 'newuser',
      });

      const result = await service.register(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith({
        username: 'newuser',
        password: '123',
      });
      expect(result).toEqual({
        message: 'Registered successfully!',
        userID: 99,
        username: 'newuser',
      });
    });
  });
});
