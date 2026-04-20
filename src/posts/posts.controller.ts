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
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginationDto } from '../users/dto/pagination.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { ReqUser } from '../common/interfaces/req-user.interface';
import { CurrentUser } from '../common/decorators/user.decorator';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
  PostResponseDto,
  CommentResponseDto,
  PostQueryDto,
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
  findAll(@Query() query: PostQueryDto): Promise<any> {
    return this.postsService.findAll(query.search, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostResponseDto | null> {
    return this.postsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.update(id, updatePostDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.remove(id, user);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ReqUser,
  ): Promise<any> {
    return this.postsService.toggleLike(id, user.userID);
  }

  @Get(':id/likes')
  getLikes(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<any> {
    return this.postsService.getLikes(id, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ReqUser,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<any> {
    return this.postsService.addComment(id, user.userID, createCommentDto);
  }

  @Get(':id/comments')
  getComments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto[]> {
    return this.postsService.getComments(id);
  }

  @UseGuards(AuthGuard)
  @Patch('comments/:commentId')
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: ReqUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.updateComment(commentId, updateCommentDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete('comments/:commentId')
  removeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: ReqUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.removeComment(commentId, user);
  }
}
