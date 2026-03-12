import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    const userId = req['user'].userID;
    return this.postsService.create(createPostDto, userId);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.postsService.findAll(search, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  likePost(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].userID;
    return this.postsService.likePost(+id, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/like')
  unlikePost(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].userID;
    return this.postsService.unlikePost(+id, userId);
  }

  @Get(':id/likes')
  getLikes(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.postsService.getLikes(+id, paginationDto);
  }
}
