import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softRemove: jest.fn(),
};

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('test-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new user with hashed password', async () => {
      const dto = {
        username: 'ThuDao',
        password: 'password123',
        email: 'thu@test.com',
      };
      const expectedUser = { id: 1, ...dto, password: 'hashed-password' };

      mockUserRepository.create.mockReturnValue(expectedUser);
      mockUserRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(dto as any);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'test-salt');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [{ id: 1, username: 'ThuDao' }];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({ skip: 0, limit: 10 });
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, username: 'ThuDao' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserById(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const reqUser = { userID: 1, role: 'user', username: 'ThuDao' };

    it('should update and return user if owner', async () => {
      const mockUser = { id: 1, username: 'ThuDao', role: 'user' };
      const updateDto = { username: 'ThuUpdated' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.update(1, updateDto as any, reqUser as any);
      expect(result.username).toEqual('ThuUpdated');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner or admin', async () => {
      const mockUser = { id: 2, username: 'OtherUser', role: 'user' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.update(2, {}, reqUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, {}, reqUser as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove and return the user if found', async () => {
      const mockUser = { id: 1, username: 'ThuDao' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.softRemove.mockResolvedValue(mockUser);

      const result = await service.remove(1);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
