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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('Posts & Comments')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Post' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post created successfully.',
    type: PostResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not logged in (Missing token).' })
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.create(createPostDto, user.userID);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get list of posts (with search & pagination)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a list of posts with pagination information.',
  })
  findAll(@Query() query: PostQueryDto): Promise<any> {
    return this.postsService.findAll(query.search, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the details of a post.',
    type: PostResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostResponseDto | null> {
    return this.postsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post updated successfully.',
    type: PostResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'You are not the owner of this post or an Admin.',
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.update(id, updatePostDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post deleted successfully.',
    type: PostResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'You are not the owner of this post or an Admin.',
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ReqUser,
  ): Promise<PostResponseDto> {
    return this.postsService.remove(id, user);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like / Unlike a post (Toggle)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like/Unlike successful.',
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ReqUser,
  ): Promise<any> {
    return this.postsService.toggleLike(id, user.userID);
  }

  @Get(':id/likes')
  @ApiOperation({ summary: 'View list of users who liked the post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the total like count and list of users.',
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  getLikes(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<any> {
    return this.postsService.getLikes(id, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment added successfully.',
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ReqUser,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<any> {
    return this.postsService.addComment(id, user.userID, createCommentDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of comments.',
    type: [CommentResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  getComments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto[]> {
    return this.postsService.getComments(id);
  }

  @UseGuards(AuthGuard)
  @Patch('comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment updated successfully.',
    type: CommentResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'You are not the owner of this comment or an Admin.',
  })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: ReqUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.updateComment(commentId, updateCommentDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete('comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment deleted successfully.',
    type: CommentResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'You are not the owner of this comment or an Admin.',
  })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  removeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: ReqUser,
  ): Promise<CommentResponseDto> {
    return this.postsService.removeComment(commentId, user);
  }
}
