import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { USER_ENTITY_REPOSITORY } from '@domain/tokens/inject.token';
import { UserService } from '@domain/services/user.service';
import { UserEntityPersistence } from '@infrastructure/database/persistence/user.persistence';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, CommonModule],
  providers: [
    {
      provide: USER_ENTITY_REPOSITORY,
      useClass: UserEntityPersistence,
    },
    UserService,
  ],
  exports: [USER_ENTITY_REPOSITORY, UserService],
})
export class DomainModule {}
