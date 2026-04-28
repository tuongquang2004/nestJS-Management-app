import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService, AuthResult } from './auth.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';
import { AuthDto, RegisterDto } from './dto';
import { AuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(
    @Body() dto: RegisterDto,
  ): Promise<{ message: string; userID: number; username: string }> {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto): Promise<AuthResult> {
    return this.authService.authenticate(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUserInfo(@CurrentUser() user: ReqUser): ReqUser {
    return user;
  }

  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    if (!token) {
      return { message: 'Cannot find verification token!' };
    }

    return {
      statusCode: 200,
      message: 'Email verified successfully!',
      token_received: token,
    };
  }
}
