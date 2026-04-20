import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ReqUser } from '../common/interfaces/req-user.interface';

describe('PostsController', () => {
  let controller: PostsController;

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleLike: jest.fn(),
    getLikes: jest.fn(),
    addComment: jest.fn(),
    getComments: jest.fn(),
    updateComment: jest.fn(),
    removeComment: jest.fn(),
  };

  const mockUser: ReqUser = { userID: 1, role: 'user', username: 'testuser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideInterceptor(CacheInterceptor)
      .useValue({ intercept: jest.fn((ctx, next) => next.handle()) })
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call postsService.create and return the result', async () => {
      const dto = { title: 'Test', content: 'Content' };
      mockPostsService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto, mockUser);

      expect(mockPostsService.create).toHaveBeenCalledWith(
        dto,
        mockUser.userID,
      );
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should call postsService.findAll with parsed queries', async () => {
      const query = { search: 'NestJS', page: 2, limit: 5 };
      mockPostsService.findAll.mockResolvedValue({ data: [], info: {} });

      const result = await controller.findAll(query);

      expect(mockPostsService.findAll).toHaveBeenCalledWith('NestJS', 2, 5);
      expect(result).toEqual({ data: [], info: {} });
    });
  });

  describe('findOne', () => {
    it('should call postsService.findOne', async () => {
      mockPostsService.findOne.mockResolvedValue({ id: 1 });

      const result = await controller.findOne(1);

      expect(mockPostsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should call postsService.update', async () => {
      const dto = { title: 'Updated Title' };
      mockPostsService.update.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.update(1, dto, mockUser);

      expect(mockPostsService.update).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('remove', () => {
    it('should call postsService.remove', async () => {
      mockPostsService.remove.mockResolvedValue({ id: 1 });

      const result = await controller.remove(1, mockUser);

      expect(mockPostsService.remove).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('toggleLike', () => {
    it('should call postsService.toggleLike', async () => {
      mockPostsService.toggleLike.mockResolvedValue({ message: 'Success' });

      const result = await controller.toggleLike(1, mockUser);

      expect(mockPostsService.toggleLike).toHaveBeenCalledWith(
        1,
        mockUser.userID,
      );
      expect(result).toEqual({ message: 'Success' });
    });
  });

  describe('getLikes', () => {
    it('should call postsService.getLikes', async () => {
      const paginationDto = { skip: 0, limit: 10 };
      mockPostsService.getLikes.mockResolvedValue({
        totalLikes: 1,
        likedBy: [],
      });

      const result = await controller.getLikes(1, paginationDto);

      expect(mockPostsService.getLikes).toHaveBeenCalledWith(1, paginationDto);
      expect(result).toEqual({ totalLikes: 1, likedBy: [] });
    });
  });

  describe('addComment', () => {
    it('should call postsService.addComment', async () => {
      const dto = { content: 'Nice!' };
      mockPostsService.addComment.mockResolvedValue({
        message: 'Success',
        data: {},
      });

      const result = await controller.addComment(1, mockUser, dto);

      expect(mockPostsService.addComment).toHaveBeenCalledWith(
        1,
        mockUser.userID,
        dto,
      );
      expect(result).toEqual({ message: 'Success', data: {} });
    });
  });

  describe('getComments', () => {
    it('should call postsService.getComments', async () => {
      mockPostsService.getComments.mockResolvedValue([]);

      const result = await controller.getComments(1);

      expect(mockPostsService.getComments).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe('updateComment', () => {
    it('should call postsService.updateComment', async () => {
      const dto = { content: 'Edited' };
      mockPostsService.updateComment.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.updateComment(1, dto, mockUser);

      expect(mockPostsService.updateComment).toHaveBeenCalledWith(
        1,
        dto,
        mockUser,
      );
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('removeComment', () => {
    it('should call postsService.removeComment', async () => {
      mockPostsService.removeComment.mockResolvedValue({ id: 1 });

      const result = await controller.removeComment(1, mockUser);

      expect(mockPostsService.removeComment).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual({ id: 1 });
    });
  });
});
