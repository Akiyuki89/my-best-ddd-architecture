import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CommonModule } from '@common/common.module';
import { EnvService } from '@common/configuration/env/dotenv.config';
import { RedisService } from '@infrastructure/redis/services/redis.service';

@Module({
  imports: [
    CommonModule,
    RedisModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'single',
        url: envService.getRedisUrl() || 'redis://localhost:6379',
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisModule, RedisService],
})
export class RedisConfigModule {}
