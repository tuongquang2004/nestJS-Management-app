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
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginationDto } from '../users/dto/pagination.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { ReqUser } from '../common/interfaces/req-user.interface';
import { CurrentUser } from '../common/decorators/user.decorator';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
  PostResponseDto,
  CommentResponseDto,
} from './dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.create(createPostDto, user.userID);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<any> {
    return this.postsService.findAll(search, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostResponseDto | null> {
    return this.postsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.update(+id, updatePostDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.remove(+id, user);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  toggleLike(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser,
  ): Promise<any> {
    return this.postsService.toggleLike(+id, user.userID);
  }

  @Get(':id/likes')
  getLikes(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<any> {
    return this.postsService.getLikes(+id, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<any> {
    return this.postsService.addComment(+id, user.userID, createCommentDto);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string): Promise<CommentResponseDto[]> {
    return this.postsService.getComments(+id);
  }

  @UseGuards(AuthGuard)
  @Patch('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: ReqUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.updateComment(+commentId, updateCommentDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete('comments/:commentId')
  removeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.removeComment(+commentId, user);
  }
}
