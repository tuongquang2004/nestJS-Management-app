import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { ReqUser } from 'src/common/interfaces/req-user.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from './dto/post-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: ReqUser,
  ) {
    const newPost = await this.postsService.create(createPostDto, user.userID);
    return plainToInstance(PostResponseDto, newPost, {
      excludeExtraneousValues: true,
    });
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const result = await this.postsService.findAll(search, +page, +limit);
    return {
      ...result,
      data: result.data
        ? plainToInstance(PostResponseDto, result.data, {
            excludeExtraneousValues: true,
          })
        : [],
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(+id);
    return plainToInstance(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: ReqUser,
  ) {
    const updatedPost = await this.postsService.update(
      +id,
      updatePostDto,
      user,
    );
    return plainToInstance(PostResponseDto, updatedPost, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUser) {
    const deletedPost = await this.postsService.remove(+id, user);
    return plainToInstance(PostResponseDto, deletedPost, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: ReqUser) {
    return this.postsService.toggleLike(+id, user.userID);
  }

  @Get(':id/likes')
  async getLikes(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.postsService.getLikes(+id, paginationDto);
    return {
      ...result,
      likedBy: result.likedBy
        ? plainToInstance(UserResponseDto, result.likedBy, {
            excludeExtraneousValues: true,
          })
        : [],
    };
  }

  @UseGuards(AuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const result = await this.postsService.addComment(
      +id,
      user.userID,
      createCommentDto,
    );
    return {
      ...result,
      data: result.data
        ? plainToInstance(CommentResponseDto, result.data, {
            excludeExtraneousValues: true,
          })
        : null,
    };
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    const comments = await this.postsService.getComments(+id);
    return plainToInstance(CommentResponseDto, comments, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: ReqUser,
  ) {
    const updatedComment = await this.postsService.updateComment(
      +commentId,
      updateCommentDto,
      user,
    );
    return plainToInstance(CommentResponseDto, updatedComment, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('comments/:commentId')
  async removeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: ReqUser,
  ) {
    const deletedComment = await this.postsService.removeComment(
      +commentId,
      user,
    );
    return plainToInstance(CommentResponseDto, deletedComment, {
      excludeExtraneousValues: true,
    });
  }
}
