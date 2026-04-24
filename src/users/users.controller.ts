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
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationDto,
  UserResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Users Management')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user (Only for admins)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiForbiddenResponse({
    description: 'Forbidden. Only admins can create new users.',
  })
  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get a list of all users (With pagination)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of user objects.',
    type: [UserResponseDto],
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<UserResponseDto[]> {
    return this.usersService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the user object.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto | null> {
    return this.usersService.findUserById(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update successful.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiForbiddenResponse({
    description:
      'Only Admin or the user themselves can update user information.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() reqUser: ReqUser,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto, reqUser);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiForbiddenResponse({
    description: 'Only Admin can delete users.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.remove(id);
  }
}
