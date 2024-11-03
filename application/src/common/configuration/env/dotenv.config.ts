import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService) {}

  // Redis
  getRedisUrl(): string {
    return this.configService.get<string>('REDIS_URL');
  }

  getRedisMaxLogin(): number {
    return this.configService.get<number>('MAX_LOGIN_ATTEMPTS');
  }

  getRedisAttemptsBlock(): number {
    return this.configService.get<number>('BLOCK_TIME');
  }

  // Email
  getMailHost(): string {
    return this.configService.get<string>('EMAIL_HOST');
  }

  getMailPort(): number {
    return this.configService.get<number>('EMAIL_PORT');
  }

  getMailSecure(): boolean {
    return this.configService.get<boolean>('EMAIL_SECURE');
  }

  getMailUser(): string {
    return this.configService.get<string>('EMAIL_USER');
  }

  getMailPass(): string {
    return this.configService.get<string>('EMAIL_PASS');
  }

  getMailFrom(): string {
    return this.configService.get<string>('EMAIL_FROM');
  }

  getMailResetUrl(): string {
    return this.configService.get<string>('EMAIL_RESET_URL');
  }
}
