import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import type { ReqUser } from 'src/common/interfaces/req-user.interface';
import { AuthDto, RegisterDto } from './dto';
import { AuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.authenticate(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUserInfo(@CurrentUser() user: ReqUser) {
    return user;
  }
}
