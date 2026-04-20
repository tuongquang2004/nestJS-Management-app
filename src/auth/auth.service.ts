import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthDto, RegisterDto } from './dto';

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

    return {
      message: 'Registered successfully!',
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
