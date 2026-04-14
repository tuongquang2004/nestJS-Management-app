import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findUserById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = {
        username: 'ThuDao',
        password: '123',
        email: 'test@test.com',
      };
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto as any);
      expect(result).toBeDefined();
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { id: 1, username: 'ThuDao' },
      ]);

      const result = await controller.findAll({ skip: 0, limit: 10 });
      expect(result).toBeDefined();
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findUserById.mockResolvedValue({
        id: 1,
        username: 'ThuDao',
      });

      const result = await controller.findOne('1');
      expect(result).toBeDefined();
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { username: 'ThuUpdated' };
      const reqUser = { userID: 1, role: 'user', username: 'ThuDao' };
      mockUsersService.update.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.update('1', dto as any, reqUser as any);
      expect(result).toBeDefined();
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto, reqUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue({ id: 1, username: 'ThuDao' });

      const result = await controller.remove('1');
      expect(result).toBeDefined();
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
