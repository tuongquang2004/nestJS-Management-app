import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthDto, RegisterDto } from './dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

type SignInData = {
  userID: number;
  username: string;
  role: string;
};

export type AuthResult = {
  accessToken: string;
  userID: number;
  username: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {}

  async authenticate(dto: AuthDto): Promise<AuthResult> {
    const user = await this.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async validateUser(dto: AuthDto): Promise<SignInData | null> {
    const user = await this.usersService.findUserByName(dto.username);
    if (user) {
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (isMatch) {
        return { userID: user.id, username: user.username, role: user.role };
      }
    }
    return null;
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password do not match!',
      );
    }

    const existingUser = await this.usersService.findUserByName(dto.username);
    if (existingUser) {
      throw new BadRequestException('Username existed!');
    }

    const { confirmPassword, ...createUserDto } = dto;
    const newUser = await this.usersService.create(createUserDto);

    await this.mailQueue.add('send-verification-email', {
      email: newUser.email,
      username: newUser.username,
      token: 'fake-jwt-token-123',
    });

    return {
      message: 'Registered successfully! Please check your email to verify.',
      userID: newUser.id,
      username: newUser.username,
    };
  }

  async signIn(user: SignInData): Promise<AuthResult> {
    const tokenPayload = {
      username: user.username,
      userID: user.userID,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      expiresIn: '1d',
    });

    return {
      accessToken,
      userID: user.userID,
      username: user.username,
    };
  }
}
