import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthDto } from './dto/auth.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import type { ReqUser } from 'src/common/interfaces/req-user.interface';

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
