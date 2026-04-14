import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';
import {
  CreateUserDto,
  CreateUserResponseDto,
  UpdateUserDto,
  PaginationDto,
  UserResponseDto,
} from './dto';
import { AdminGuard, AuthGuard } from '../auth/guards';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: CreateUserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const newUser = await this.usersService.create(dto);
    return plainToInstance(UserResponseDto, newUser, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const users = await this.usersService.findAll(paginationDto);
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findUserById(+id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() reqUser: ReqUser,
  ) {
    const updatedUser = await this.usersService.update(+id, dto, reqUser);
    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedUser = await this.usersService.remove(+id);
    return plainToInstance(UserResponseDto, deletedUser, {
      excludeExtraneousValues: true,
    });
  }
}
