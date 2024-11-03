import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { EnvService } from '@common/configuration/env/dotenv.config';

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly envService: EnvService,
  ) {}

  // Define um valor no Redis com um tempo de expiração opcional
  async set(key: string, value: string, expiresInSeconds?: number): Promise<void> {
    if (expiresInSeconds) {
      await this.redis.set(key, value, 'EX', expiresInSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  // Obtém um valor do Redis
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  // Exclui um valor do Redis
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Função específica para armazenar o código de verificação de email com expiração
  async setEmailVerificationCode(userId: string, code: string, expiresInSeconds: number): Promise<void> {
    const key = `email_verification:${userId}`;
    await this.set(key, code, expiresInSeconds);
  }

  // Obtém o código de verificação de email do Redis
  async getEmailVerificationCode(userId: string): Promise<string | null> {
    const key = `email_verification:${userId}`;
    return await this.get(key);
  }

  // Exclui o código de verificação de email
  async deleteEmailVerificationCode(userId: string): Promise<void> {
    const key = `email_verification:${userId}`;
    await this.delete(key);
  }

  // Função específica para armazenar o token de redefinição de senha com expiração
  async setResetPasswordToken(userId: string, token: string, expiresInSeconds: number): Promise<void> {
    const key = `reset_password:${userId}`;
    await this.set(key, token, expiresInSeconds);
  }

  // Obtém o token de redefinição de senha do Redis
  async getResetPasswordToken(userId: string): Promise<string | null> {
    const key = `reset_password:${userId}`;
    return await this.get(key);
  }

  // Exclui o token de redefinição de senha
  async deleteResetPasswordToken(userId: string): Promise<void> {
    const key = `reset_password:${userId}`;
    await this.delete(key);
  }

  // Métodos para controle de tentativas de login e bloqueio
  async incrementLoginAttempts(userId: string): Promise<number> {
    const key = `login_attempts:${userId}`;

    const attempts = await this.redis.incr(key); // Incrementa a contagem de tentativas
    if (attempts === 1) {
      await this.redis.expire(key, this.envService.getRedisAttemptsBlock()); // Define um tempo de expiração para o contador
    }
    return attempts;
  }

  async blockUser(userId: string): Promise<void> {
    const key = `blocked_user:${userId}`;
    await this.set(key, 'blocked', this.envService.getRedisAttemptsBlock()); // Marca o usuário como bloqueado por BLOCK_TIME segundos
  }

  async isUserBlocked(userId: string): Promise<boolean> {
    const key = `blocked_user:${userId}`;
    const isBlocked = await this.get(key);
    return isBlocked === 'blocked';
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    const key = `login_attempts:${userId}`;
    await this.delete(key);
  }
}
