import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService) {}

  getRedisUrl(): string {
    return this.configService.get<string>('REDIS_URL');
  }

  getRedisMaxLogin(): number {
    return this.configService.get<number>('MAX_LOGIN_ATTEMPTS');
  }

  getRedisAttemptsBlock(): number {
    return this.configService.get<number>('BLOCK_TIME');
  }
}
