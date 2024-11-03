import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '@common/common.module';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailModule } from '@infrastructure/email/email.module';
import { HealthModule } from '@infrastructure/health/health.module';
import { RedisConfigModule } from '@infrastructure/redis/redis.module';
import { UserEntityPersistence } from '@infrastructure/database/persistence/user.persistence';

@Module({
  imports: [HttpModule, HealthModule, RedisConfigModule, EmailModule, CommonModule],
  providers: [PrismaService, UserEntityPersistence],
  exports: [HealthModule, RedisConfigModule, EmailModule, PrismaService, UserEntityPersistence],
})
export class InfrastructureModule {}
