import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository, Like as SearchLike } from 'typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';
import { Comment } from './entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Like) private likesRepository: Repository<Like>,
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const newPost = this.postsRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user: { id: userId },
    });
    return await this.postsRepository.save(newPost);
  }

  async findAll(search: string, page: number, limit: number) {
    const take = limit || 10;
    const currentPage = page || 1;
    const skip = (currentPage - 1) * take;

    const whereCondition = search
      ? [
          { title: SearchLike(`%${search}%`) },
          { content: SearchLike(`%${search}%`) },
        ]
      : {};

    const [posts, total] = await this.postsRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      select: { user: { id: true, username: true, email: true } },
      take: take,
      skip: skip,
    });

    return {
      data: posts,
      info: {
        totalItems: total,
        currentPage: currentPage,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: { user: { id: true, username: true } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, reqUser: any) {
    const post = await this.findOne(id);
    if (post.user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException('You cannot edit this post!');
    }
    Object.assign(post, updatePostDto);
    return await this.postsRepository.save(post);
  }

  async remove(id: number, reqUser: any) {
    const post = await this.findOne(id);
    if (post.user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException('You cannot delete this post!');
    }
    return await this.postsRepository.remove(post);
  }

  async likePost(postId: number, userId: number) {
    const existingLike = await this.likesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      return { message: 'You have liked this post' };
    }

    const newLike = this.likesRepository.create({
      post: { id: postId },
      user: { id: userId },
    });
    await this.likesRepository.save(newLike);

    return { message: 'Like successfully' };
  }

  async unlikePost(postId: number, userId: number) {
    const existingLike = await this.likesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      await this.likesRepository.remove(existingLike);
    }
    return { message: 'You have unliked this post' };
  }

  async getLikes(postId: number, paginationDto: PaginationDto) {
    const [likes, count] = await this.likesRepository.findAndCount({
      where: { post: { id: postId } },
      relations: ['user'], //Lấy dữ liệu user đã like
      select: { user: { id: true, username: true } }, //Chỉ lấy id và username
      skip: paginationDto.skip,
      take: paginationDto.limit ?? DEFAULT_PAGE_SIZE,
    });

    return {
      totalLikes: count,
      likedBy: likes.map((name) => name.user),
    };
  }

  async addComment(postId: number, userId: number, content: string) {
    const newComment = this.commentsRepository.create({
      content: content,
      post: { id: postId },
      user: { id: userId },
    });
    await this.commentsRepository.save(newComment);
    return { message: 'Comment successfully added', data: newComment };
  }

  async getComments(postId: number) {
    return await this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
      select: { user: { id: true, username: true } },
      order: { createdAt: 'DESC' },
    });
  }
}
