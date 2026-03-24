import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

type AuthInput = {
  username: string;
  password: string;
};

type SignInData = {
  userID: number;
  username: string;
  role: string;
};

type AuthResult = {
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

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async validateUser(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findUserByName(input.username);
    if (user) {
      const isMatch = await bcrypt.compare(input.password, user.password);
      if (isMatch) {
        return { userID: user.id, username: user.username, role: user.role };
      }
    }
    return null;
  }

  async register(input: any) {
    const existingUser = await this.usersService.findUserByName(input.username);
    if (existingUser) {
      throw new BadRequestException('Username existed!');
    }

    const newUser = await this.usersService.create({
      username: input.username,
      password: input.password,
      email: input.email,
    });

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
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      accessToken,
      userID: user.userID,
      username: user.username,
    };
  }
}
