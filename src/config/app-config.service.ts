import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  get dbName(): string {
    return this.configService.get('DB_NAME', { infer: true });
  }

  get dbUsername(): string {
    return this.configService.get('DB_USERNAME', { infer: true });
  }

  get dbPassword(): string {
    return this.configService.get('DB_PASSWORD', { infer: true }) || '';
  }

  get dbPort(): number {
    return this.configService.get('DB_PORT', { infer: true });
  }

  get dbHost(): string {
    return this.configService.get('DB_HOST', { infer: true });
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true });
  }
}
