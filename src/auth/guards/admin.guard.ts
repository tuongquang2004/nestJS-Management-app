import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/configs/jwt-secret';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return false;
    }

    const payload = await this.jwtService
      .verifyAsync(token, {
        secret: JWT_SECRET,
      })
      .catch(() => null);

    if (!payload || payload.role !== 'admin') {
      return false;
    }

    request['user'] = payload;
    return true;
  }
}
