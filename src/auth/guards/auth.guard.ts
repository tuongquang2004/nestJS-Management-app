import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization; //Bearer <token>
    const token = authorization?.split(' ')[1];

    if (!token) return false;

    const tokenPayload = await this.jwtService
      .verifyAsync(token)
      .catch(() => null);

    if (!tokenPayload) return false;

    request['user'] = tokenPayload;
    return true;
  }
}
