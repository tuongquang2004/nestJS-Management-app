import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Like) private likesRepository: Repository<Like>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const newPost = this.postsRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user: { id: userId },
    });
    return await this.postsRepository.save(newPost);
  }

  async findAll() {
    return await this.postsRepository.find({
      relations: ['user'],
      select: { user: { id: true, username: true, email: true } },
    });
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

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return await this.postsRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
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

  async getLikes(postId: number) {
    const [likes, count] = await this.likesRepository.findAndCount({
      where: { post: { id: postId } },
      relations: ['user'], //Lấy dữ liệu user đã like
      select: { user: { id: true, username: true } }, //Chỉ lấy id và username
    });

    return {
      totalLikes: count,
      likedBy: likes.map((name) => name.user),
    };
  }
}
