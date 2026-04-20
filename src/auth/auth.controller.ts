import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService, AuthResult } from './auth.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';
import { AuthDto, RegisterDto } from './dto';
import { AuthGuard } from './guards';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({
    status: HttpStatus.CREATED, // 201
    description: 'Registration successful.',
    schema: {
      example: {
        message: 'Registered successfully!',
        userID: 1,
        username: 'rocky_2004',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST, // 400
    description: 'Error: Username already exists or Passwords do not match.',
  })
  register(
    @Body() dto: RegisterDto,
  ): Promise<{ message: string; userID: number; username: string }> {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login to the system' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: HttpStatus.OK, // 200
    description: 'Login successful, returns access token and user info.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFt...',
        userID: 1,
        username: 'rocky_2004',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED, // 401
    description: 'Invalid login credentials.',
  })
  login(@Body() dto: AuthDto): Promise<AuthResult> {
    return this.authService.authenticate(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get information of the currently logged-in user' })
  @ApiResponse({
    status: HttpStatus.OK, // 200
    description: 'Information retrieved successfully.',
    schema: {
      example: {
        userID: 1,
        username: 'rocky_2004',
        role: 'user',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED, // 401
    description: 'Token is missing, invalid, or has expired.',
  })
  getUserInfo(@CurrentUser() user: ReqUser): ReqUser {
    return user;
  }
}
