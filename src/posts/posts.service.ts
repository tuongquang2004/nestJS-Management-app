import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository, Like as SearchLike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../users/dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from '../common/constants/constants';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReqUser } from '../common/interfaces/req-user.interface';
import { Post, Like, Comment } from './entities';
import { User } from '../users/entities';
import { PostQueryDto } from './dto/post-query.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Like) private likesRepository: Repository<Like>,
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const newPost = this.postsRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user: { id: userId },
    });
    return await this.postsRepository.save(newPost);
  }

  async findAll(queryDto: PostQueryDto): Promise<{ data: Post[]; info: any }> {
    const { search, authorId, sortBy, sortOrder, page, limit } = queryDto;

    const take = limit || 10;
    const currentPage = page || 1;
    const skipItems = (currentPage - 1) * take;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select(['post', 'user.id', 'user.username', 'user.email'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments');

    if (search) {
      query.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (authorId) {
      query.andWhere('user.id = :authorId', { authorId });
    }

    if (sortBy) {
      const allowedSortColumns = ['title', 'createdAt', 'updatedAt'];
      const sortColumn = allowedSortColumns.includes(sortBy)
        ? `post.${sortBy}`
        : 'post.createdAt';
      query.orderBy(sortColumn, sortOrder || 'DESC');
    } else {
      query.orderBy('post.createdAt', 'DESC');
    }

    query.skip(skipItems).take(take);

    const [posts, total] = await query.getManyAndCount();

    return {
      data: posts,
      info: {
        totalItems: total,
        currentPage: currentPage,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: { user: { id: true, username: true } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    reqUser: ReqUser,
  ): Promise<Post> {
    const post = await this.findOne(id);
    if (post.user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException('You cannot edit this post!');
    }
    Object.assign(post, updatePostDto);
    return await this.postsRepository.save(post);
  }

  async remove(id: number, reqUser: ReqUser): Promise<Post> {
    const post = await this.findOne(id);
    if (post.user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException('You cannot delete this post!');
    }
    return await this.postsRepository.remove(post);
  }

  async toggleLike(
    postId: number,
    userId: number,
  ): Promise<{ message: string }> {
    await this.findOne(postId);
    const existingLike = await this.likesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      await this.likesRepository.remove(existingLike);
      return { message: 'You have unliked this post' };
    }

    try {
      const newLike = this.likesRepository.create({
        post: { id: postId },
        user: { id: userId },
      });
      await this.likesRepository.save(newLike);
      return { message: 'Like successfully' };
    } catch (error) {
      return { message: 'Like successfully' };
    }
  }

  async getLikes(
    postId: number,
    paginationDto: PaginationDto,
  ): Promise<{ totalLikes: number; likedBy: User[] }> {
    await this.findOne(postId);
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

  async addComment(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<{ message: string; data: Comment }> {
    await this.findOne(postId);
    const newComment = this.commentsRepository.create({
      content: createCommentDto.content,
      post: { id: postId },
      user: { id: userId },
    });
    await this.commentsRepository.save(newComment);
    return { message: 'Comment successfully added', data: newComment };
  }

  async getComments(postId: number): Promise<Comment[]> {
    await this.findOne(postId);
    return await this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
      select: { user: { id: true, username: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    reqUser: ReqUser,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException('You cannot edit this comment!');
    }
    Object.assign(comment, updateCommentDto);
    return await this.commentsRepository.save(comment);
  }

  async removeComment(commentId: number, reqUser: ReqUser): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException('You cannot delete this comment!');
    }
    return await this.commentsRepository.remove(comment);
  }
}
