import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post, Like, Comment } from './entities';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReqUser } from '../common/interfaces/req-user.interface';

describe('PostsService', () => {
  let service: PostsService;

  const mockPostsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockLikesRepository = {
    findOne: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockCommentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: ReqUser = { userID: 1, role: 'user', username: 'testuser' };
  const mockAdmin: ReqUser = {
    userID: 99,
    role: 'admin',
    username: 'adminuser',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockPostsRepository },
        { provide: getRepositoryToken(Like), useValue: mockLikesRepository },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentsRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new post', async () => {
      const createPostDto = { title: 'Test Title', content: 'Test Content' };
      const expectedPost = {
        id: 1,
        ...createPostDto,
        user: { id: mockUser.userID },
      };

      mockPostsRepository.create.mockReturnValue(expectedPost);
      mockPostsRepository.save.mockResolvedValue(expectedPost);

      const result = await service.create(createPostDto, mockUser.userID);

      expect(mockPostsRepository.create).toHaveBeenCalledWith({
        ...createPostDto,
        user: { id: mockUser.userID },
      });
      expect(mockPostsRepository.save).toHaveBeenCalledWith(expectedPost);
      expect(result).toEqual(expectedPost);
    });
  });

  describe('findOne', () => {
    it('should return a post if found', async () => {
      const mockPost = { id: 1, title: 'Hello' };
      mockPostsRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockPost = { id: 1, title: 'Old Title', user: { id: 1 } };

    it('should allow OWNER to update the post', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.save.mockResolvedValue({
        ...mockPost,
        title: 'New Title',
      });

      const result = await service.update(1, { title: 'New Title' }, mockUser);
      expect(result.title).toEqual('New Title');
    });

    it('should allow ADMIN to update the post even if not owner', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.save.mockResolvedValue({
        ...mockPost,
        title: 'Admin Title',
      });

      const result = await service.update(
        1,
        { title: 'Admin Title' },
        mockAdmin,
      );
      expect(result.title).toEqual('Admin Title');
    });

    it('should throw ForbiddenException if NOT OWNER and NOT ADMIN', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      const hackerUser: ReqUser = {
        userID: 2,
        role: 'user',
        username: 'hacker',
      };

      await expect(
        service.update(1, { title: 'Hacked' }, hackerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleLike', () => {
    it('should remove like if already liked', async () => {
      mockPostsRepository.findOne.mockResolvedValue({ id: 1 });
      mockLikesRepository.findOne.mockResolvedValue({ id: 100 });

      const result = await service.toggleLike(1, 1);
      expect(mockLikesRepository.remove).toHaveBeenCalled();
      expect(result).toEqual({ message: 'You have unliked this post' });
    });

    it('should return success even if Race Condition throws Error', async () => {
      mockPostsRepository.findOne.mockResolvedValue({ id: 1 });
      mockLikesRepository.findOne.mockResolvedValue(null);

      mockLikesRepository.save.mockRejectedValue(new Error('Duplicate entry'));

      const result = await service.toggleLike(1, 1);
      expect(result).toEqual({ message: 'Like successfully' });
    });
  });

  describe('findAll', () => {
    it('should return paginated posts and info', async () => {
      const mockPosts = [{ id: 1, title: 'NestJS Testing' }];
      const total = 1;

      mockPostsRepository.findAndCount.mockResolvedValue([mockPosts, total]);

      const result = await service.findAll('NestJS', 1, 10);

      expect(mockPostsRepository.findAndCount).toHaveBeenCalled();
      expect(result.data).toEqual(mockPosts);
      expect(result.info.totalItems).toEqual(total);
      expect(result.info.totalPages).toEqual(1);
    });
  });

  describe('remove (Post)', () => {
    const mockPost = { id: 1, title: 'To be deleted', user: { id: 1 } };

    it('should allow OWNER to delete the post', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.remove.mockResolvedValue(mockPost);

      const result = await service.remove(1, mockUser);
      expect(mockPostsRepository.remove).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException if NOT OWNER and NOT ADMIN tries to delete', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      const hackerUser: ReqUser = {
        userID: 2,
        role: 'user',
        username: 'hacker',
      };

      await expect(service.remove(1, hackerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getLikes', () => {
    it('should return total likes and array of users', async () => {
      mockPostsRepository.findOne.mockResolvedValue({ id: 1 });
      const mockLikes = [{ user: { id: 1, username: 'testuser' } }];
      mockLikesRepository.findAndCount.mockResolvedValue([mockLikes, 1]);

      const result = await service.getLikes(1, { skip: 0, limit: 10 });
      expect(result.totalLikes).toEqual(1);
      expect(result.likedBy.length).toEqual(1);
    });
  });

  describe('Comment System', () => {
    const mockComment = { id: 1, content: 'Nice post!', user: { id: 1 } };

    it('should add a comment', async () => {
      mockPostsRepository.findOne.mockResolvedValue({ id: 1 });
      mockCommentsRepository.create.mockReturnValue(mockComment);
      mockCommentsRepository.save.mockResolvedValue(mockComment);

      const result = await service.addComment(1, 1, { content: 'Nice post!' });
      expect(result.message).toEqual('Comment successfully added');
      expect(result.data).toEqual(mockComment);
    });

    it('should get comments for a post', async () => {
      mockPostsRepository.findOne.mockResolvedValue({ id: 1 });
      mockCommentsRepository.find.mockResolvedValue([mockComment]);

      const result = await service.getComments(1);
      expect(result).toEqual([mockComment]);
    });

    it('should allow OWNER to update comment', async () => {
      mockCommentsRepository.findOne.mockResolvedValue(mockComment);
      mockCommentsRepository.save.mockResolvedValue({
        ...mockComment,
        content: 'Edited',
      });

      const result = await service.updateComment(
        1,
        { content: 'Edited' },
        mockUser,
      );
      expect(result.content).toEqual('Edited');
    });

    it('should throw ForbiddenException if hacker tries to delete comment', async () => {
      mockCommentsRepository.findOne.mockResolvedValue(mockComment);
      const hackerUser: ReqUser = {
        userID: 2,
        role: 'user',
        username: 'hacker',
      };

      await expect(service.removeComment(1, hackerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
